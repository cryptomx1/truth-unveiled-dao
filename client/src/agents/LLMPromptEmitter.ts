/**
 * LLMPromptEmitter.ts
 * Phase PRESS-REPLAY Step 4: GPT-4o civic messaging with privacy-first redaction
 * Commander Mark directive via JASMY Relay
 */

export interface CivicMessageRequest {
  topic: 'healthcare' | 'taxation' | 'infrastructure' | 'climate' | 'governance';
  tone: 'urgent' | 'informative' | 'encouraging' | 'formal';
  targetZip: string;
  contextData?: any;
  maxLength?: number;
}

export interface CivicMessage {
  id: string;
  content: string;
  topic: string;
  tone: string;
  targetZip: string;
  confidence: number;
  aiGenerated: boolean;
  timestamp: Date;
  characterCount: number;
}

export interface PromptTemplate {
  topic: string;
  tone: string;
  template: string;
  placeholders: string[];
}

export class LLMPromptEmitter {
  private static instance: LLMPromptEmitter;
  private apiKey: string | null = null;
  private fallbackTemplates: PromptTemplate[] = [];
  private generatedMessages: CivicMessage[] = [];

  private constructor() {
    this.initializeFallbackTemplates();
    this.checkAPIAvailability();
  }

  public static getInstance(): LLMPromptEmitter {
    if (!LLMPromptEmitter.instance) {
      LLMPromptEmitter.instance = new LLMPromptEmitter();
    }
    return LLMPromptEmitter.instance;
  }

  private initializeFallbackTemplates(): void {
    this.fallbackTemplates = [
      {
        topic: 'healthcare',
        tone: 'urgent',
        template: 'Urgent: Healthcare access improvements needed in {city}. Current services face capacity issues affecting {population} residents. Your input on local healthcare priorities is essential.',
        placeholders: ['city', 'population']
      },
      {
        topic: 'healthcare',
        tone: 'informative',
        template: 'Healthcare policy updates for {city} residents: New initiatives propose expanding access to primary care services. Community feedback requested on implementation priorities.',
        placeholders: ['city']
      },
      {
        topic: 'infrastructure',
        tone: 'encouraging',
        template: 'Infrastructure modernization opportunities in {city}: Your community has been selected for pilot programs addressing transportation and utilities. Share your priorities.',
        placeholders: ['city']
      },
      {
        topic: 'infrastructure',
        tone: 'formal',
        template: 'Infrastructure Development Notice: The {city} Municipal Planning Committee requests public input on proposed improvements to local transportation and utility systems.',
        placeholders: ['city']
      },
      {
        topic: 'taxation',
        tone: 'informative',
        template: 'Tax policy review for {city}: Proposed changes to local tax structure aim to improve public services while maintaining fiscal responsibility. Public comment period now open.',
        placeholders: ['city']
      },
      {
        topic: 'climate',
        tone: 'encouraging',
        template: 'Climate resilience initiative in {city}: Your community can lead regional efforts in sustainability and environmental protection. Join the conversation on local climate action.',
        placeholders: ['city']
      },
      {
        topic: 'governance',
        tone: 'formal',
        template: 'Civic Engagement Notice: {city} residents are invited to participate in upcoming governance discussions on local policy priorities and community representation.',
        placeholders: ['city']
      }
    ];
  }

  private checkAPIAvailability(): void {
    // Check for OpenAI API key in environment
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    if (!this.apiKey) {
      console.log('🤖 LLMPromptEmitter: Using local fallback templates (no OpenAI API key)');
    } else {
      console.log('🧠 LLMPromptEmitter: GPT-4o integration available');
    }
  }

  private redactSensitiveContent(content: string): string {
    // Privacy-first redaction: Remove CID, DID, ZKP hashes, and sensitive identifiers
    return content
      .replace(/cid:[a-zA-Z0-9]+/gi, '[REDACTED_CID]')
      .replace(/did:[a-zA-Z0-9:]+/gi, '[REDACTED_DID]')
      .replace(/0x[a-fA-F0-9]{40,}/gi, '[REDACTED_HASH]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/gi, '[REDACTED_IP]')
      .replace(/user_[a-zA-Z0-9]+/gi, '[REDACTED_USER]')
      .replace(/wallet_[a-zA-Z0-9]+/gi, '[REDACTED_WALLET]');
  }

  public async generateCivicMessage(request: CivicMessageRequest): Promise<CivicMessage> {
    const messageId = `msg_${request.topic}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    let content: string;
    let confidence: number;
    let aiGenerated = false;

    try {
      if (this.apiKey) {
        // Attempt GPT-4o generation with privacy redaction
        const gptResult = await this.generateWithGPT4o(request);
        content = gptResult.content;
        confidence = gptResult.confidence;
        aiGenerated = true;
      } else {
        throw new Error('No API key available');
      }
    } catch (error) {
      console.log(`🔄 LLMPromptEmitter: Falling back to local templates for ${request.topic}`);
      // Graceful fallback to local rule-based generation
      const fallbackResult = this.generateWithFallback(request);
      content = fallbackResult.content;
      confidence = fallbackResult.confidence;
      aiGenerated = false;
    }

    const message: CivicMessage = {
      id: messageId,
      content,
      topic: request.topic,
      tone: request.tone,
      targetZip: request.targetZip,
      confidence,
      aiGenerated,
      timestamp: new Date(),
      characterCount: content.length
    };

    this.generatedMessages.push(message);
    console.log(`📝 Generated civic message: ${request.topic} (${request.tone}) - ${content.length} chars`);
    
    return message;
  }

  private async generateWithGPT4o(request: CivicMessageRequest): Promise<{content: string, confidence: number}> {
    // Redact any sensitive content from context
    const sanitizedContext = request.contextData ? 
      this.redactSensitiveContent(JSON.stringify(request.contextData)) : 
      'No additional context';

    const prompt = `Generate a civic engagement message for ${request.topic} with a ${request.tone} tone targeting ZIP code ${request.targetZip}. 

Context: ${sanitizedContext}

Requirements:
- Maximum ${request.maxLength || 280} characters
- Clear call to action for civic participation
- Appropriate tone: ${request.tone}
- Focus on ${request.topic} policy implications
- Avoid partisan language
- Include community-focused language

Respond with JSON in this format: {"message": "generated message", "confidence": 0.85}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cost-optimized model per spec
          messages: [
            {
              role: 'system',
              content: 'You are a civic engagement specialist generating non-partisan community messages. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        content: result.message,
        confidence: Math.min(0.95, Math.max(0.75, result.confidence || 0.85))
      };
    } catch (error) {
      console.error('GPT-4o generation failed:', error);
      throw error;
    }
  }

  private generateWithFallback(request: CivicMessageRequest): {content: string, confidence: number} {
    const templates = this.fallbackTemplates.filter(t => 
      t.topic === request.topic && t.tone === request.tone
    );

    if (templates.length === 0) {
      // Use any template for the topic
      const topicTemplates = this.fallbackTemplates.filter(t => t.topic === request.topic);
      if (topicTemplates.length > 0) {
        templates.push(topicTemplates[0]);
      }
    }

    if (templates.length === 0) {
      // Last resort: generic template
      return {
        content: `Important ${request.topic} update for your community. Your input on local policy priorities is needed. Join the civic conversation.`,
        confidence: 0.6
      };
    }

    const template = templates[Math.floor(Math.random() * templates.length)];
    let content = template.template;

    // Replace placeholders with contextual data
    if (template.placeholders.includes('city')) {
      const cityName = this.getCityFromZip(request.targetZip);
      content = content.replace('{city}', cityName);
    }

    if (template.placeholders.includes('population')) {
      const population = this.getPopulationFromZip(request.targetZip);
      content = content.replace('{population}', population.toLocaleString());
    }

    return {
      content,
      confidence: 0.8 // High confidence for curated templates
    };
  }

  private getCityFromZip(zipCode: string): string {
    const zipMap: {[key: string]: string} = {
      '78701': 'Austin',
      '97201': 'Portland',
      '05401': 'Burlington',
      '95110': 'San Jose',
      '48104': 'Ann Arbor'
    };
    return zipMap[zipCode] || 'your city';
  }

  private getPopulationFromZip(zipCode: string): number {
    const popMap: {[key: string]: number} = {
      '78701': 315000,
      '97201': 295000,
      '05401': 42000,
      '95110': 345000,
      '48104': 52000
    };
    return popMap[zipCode] || 50000;
  }

  public getRecentMessages(limit: number = 10): CivicMessage[] {
    return this.generatedMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getMessagesByTopic(topic: string): CivicMessage[] {
    return this.generatedMessages.filter(m => m.topic === topic);
  }

  public getAverageConfidence(): number {
    if (this.generatedMessages.length === 0) return 0;
    const total = this.generatedMessages.reduce((sum, m) => sum + m.confidence, 0);
    return total / this.generatedMessages.length;
  }

  public isGPTAvailable(): boolean {
    return this.apiKey !== null;
  }

  public getStats(): {total: number, aiGenerated: number, avgConfidence: number} {
    return {
      total: this.generatedMessages.length,
      aiGenerated: this.generatedMessages.filter(m => m.aiGenerated).length,
      avgConfidence: this.getAverageConfidence()
    };
  }

  // Manual testing method
  public async testGeneration(topic: string, tone: string): Promise<CivicMessage> {
    return this.generateCivicMessage({
      topic: topic as any,
      tone: tone as any,
      targetZip: '78701',
      maxLength: 280
    });
  }
}

// Global access for debugging
declare global {
  interface Window {
    llmPromptEmitter: LLMPromptEmitter;
  }
}

if (typeof window !== 'undefined') {
  window.llmPromptEmitter = LLMPromptEmitter.getInstance();
}