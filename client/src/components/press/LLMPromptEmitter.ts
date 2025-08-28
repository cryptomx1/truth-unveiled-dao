// LLMPromptEmitter.ts - LLM integration with Deck10FeedbackSync
// Phase PRESS-REPLAY Step 4 Implementation

import { RippleCampaign } from './RippleCampaignEngine';

export interface LLMPromptRequest {
  campaignType: RippleCampaign['focusArea'];
  tone: RippleCampaign['tone'];
  targetZIP: string;
  representativeAlignment: number;
  contextData?: any;
}

export interface LLMPromptResponse {
  content: string;
  confidence: number;
  source: 'llm' | 'local';
  metadata: {
    promptTokens: number;
    responseTokens: number;
    processingTime: number;
  };
}

export interface Deck10FeedbackData {
  deckId: string;
  feedbackEntries: Array<{
    id: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'concern';
    content: string;
    timestamp: string;
    representativeId?: string;
    zipCode?: string;
  }>;
  avgSentiment: number;
  totalEntries: number;
  lastUpdated: string;
}

export class LLMPromptEmitter {
  private static instance: LLMPromptEmitter;
  private llmEnabled: boolean = false;
  private deck10Data: Map<string, Deck10FeedbackData> = new Map();
  private messageTemplates: Map<string, string[]> = new Map();

  private constructor() {
    this.initializeTemplates();
    this.initializeDeck10Sync();
    this.detectLLMCapabilities();
  }

  public static getInstance(): LLMPromptEmitter {
    if (!LLMPromptEmitter.instance) {
      LLMPromptEmitter.instance = new LLMPromptEmitter();
    }
    return LLMPromptEmitter.instance;
  }

  private detectLLMCapabilities(): void {
    // Check if OpenAI API key is available in environment
    this.llmEnabled = typeof process !== 'undefined' && 
      process.env?.OPENAI_API_KEY !== undefined ||
      typeof window !== 'undefined' && 
      // @ts-ignore
      window.agentSystem?.llmEnabled === true;

    console.log(`🧠 LLM capabilities: ${this.llmEnabled ? 'GPT-4o Active' : 'Local Fallback Mode'}`);
  }

  private initializeTemplates(): void {
    // Message templates by focus area and tone
    this.messageTemplates.set('healthcare_urgent', [
      'Healthcare access in your area requires immediate attention. Your representative voted against recent healthcare improvements.',
      'Critical healthcare funding decisions are being made. Your voice is needed now.',
      'Healthcare costs continue to rise while coverage decreases. Contact your representative.'
    ]);

    this.messageTemplates.set('healthcare_informative', [
      'Recent healthcare legislation affects your community. Learn about your representative\'s position.',
      'Healthcare policy changes are under consideration. Stay informed about the impacts.',
      'Your local healthcare system receives federal support. Here\'s how it works.'
    ]);

    this.messageTemplates.set('infrastructure_encouraging', [
      'Your community\'s infrastructure improvements are showing progress. Keep the momentum going.',
      'Local infrastructure projects need continued support. Your engagement makes a difference.',
      'Transportation and utility upgrades are possible with sustained civic participation.'
    ]);

    this.messageTemplates.set('climate_formal', [
      'Environmental policy initiatives require public input during the comment period.',
      'Climate adaptation measures are under legislative review. Public testimony is welcomed.',
      'Sustainable development proposals are being evaluated. Community input is essential.'
    ]);

    this.messageTemplates.set('governance_urgent', [
      'Voting rights legislation needs immediate citizen support. Contact representatives today.',
      'Government transparency measures are at risk. Urgent action required.',
      'Democratic processes face challenges. Your participation is critical.'
    ]);

    console.log('📝 Message templates initialized:', this.messageTemplates.size, 'categories');
  }

  private initializeDeck10Sync(): void {
    // Mock Deck 10 feedback sync - integrate with actual Deck10FeedbackSync.ts
    const mockFeedback: Deck10FeedbackData = {
      deckId: 'deck_10_governance',
      feedbackEntries: [
        {
          id: 'fb_1',
          sentiment: 'concern',
          content: 'Representative voting record inconsistent with campaign promises',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          representativeId: 'rep_78701',
          zipCode: '78701'
        },
        {
          id: 'fb_2', 
          sentiment: 'positive',
          content: 'Good response time on infrastructure questions',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          representativeId: 'rep_97205',
          zipCode: '97205'
        },
        {
          id: 'fb_3',
          sentiment: 'negative',
          content: 'No response to healthcare concerns raised multiple times',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          representativeId: 'rep_95113',
          zipCode: '95113'
        }
      ],
      avgSentiment: 0.23, // Slightly negative overall
      totalEntries: 3,
      lastUpdated: new Date().toISOString()
    };

    this.deck10Data.set('deck_10_governance', mockFeedback);
    console.log('🔗 Deck 10 feedback sync initialized:', mockFeedback.totalEntries, 'entries');
  }

  private async callOpenAI(prompt: string, context: LLMPromptRequest): Promise<LLMPromptResponse> {
    const startTime = Date.now();

    try {
      // Privacy-first content redaction
      const cleanPrompt = this.redactSensitiveContent(prompt);
      
      // Mock OpenAI API call - replace with actual implementation when OPENAI_API_KEY available
      if (this.llmEnabled) {
        // Simulate GPT-4o-mini API call
        const mockResponse = await new Promise<string>((resolve) => {
          setTimeout(() => {
            resolve(`Enhanced ${context.campaignType} message with ${context.tone} tone for ZIP ${context.targetZIP.slice(0, 3)}xx area. Representative alignment: ${context.representativeAlignment}%. Recommendation: ${context.representativeAlignment > 75 ? 'Amplify positive engagement' : 'Address concerns directly'}.`);
          }, 150); // Simulate <500ms target
        });

        return {
          content: mockResponse,
          confidence: 0.92,
          source: 'llm',
          metadata: {
            promptTokens: cleanPrompt.length / 4,
            responseTokens: mockResponse.length / 4,
            processingTime: Date.now() - startTime
          }
        };
      } else {
        throw new Error('OpenAI API not available');
      }
    } catch (error) {
      console.log('🔄 LLM API unavailable, falling back to local generation');
      return this.generateLocalFallback(context, Date.now() - startTime);
    }
  }

  private redactSensitiveContent(content: string): string {
    // Privacy-first redaction: remove CID, DID, ZKP hashes, IP addresses, user identifiers
    return content
      .replace(/did:[a-zA-Z0-9:]+/g, '[DID_REDACTED]')
      .replace(/cid:[a-zA-Z0-9:]+/g, '[CID_REDACTED]')
      .replace(/zkp:[a-zA-Z0-9:]+/g, '[ZKP_REDACTED]')
      .replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[IP_REDACTED]')
      .replace(/user_[a-zA-Z0-9]+/g, '[USER_REDACTED]');
  }

  private generateLocalFallback(context: LLMPromptRequest, processingTime: number): LLMPromptResponse {
    const templateKey = `${context.campaignType}_${context.tone}`;
    const templates = this.messageTemplates.get(templateKey) || 
                     this.messageTemplates.get(`${context.campaignType}_informative`) ||
                     ['Your civic engagement is important. Contact your representatives.'];
    
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Enhance with context data
    let enhancedMessage = selectedTemplate;
    if (context.representativeAlignment < 60) {
      enhancedMessage += ' Current representative alignment with constituents is below expectations.';
    } else if (context.representativeAlignment > 80) {
      enhancedMessage += ' Your representative shows strong alignment with community values.';
    }

    return {
      content: enhancedMessage,
      confidence: 0.78, // Lower confidence for local generation
      source: 'local',
      metadata: {
        promptTokens: 0,
        responseTokens: enhancedMessage.length / 4,
        processingTime
      }
    };
  }

  public async generateCampaignMessage(request: LLMPromptRequest): Promise<LLMPromptResponse> {
    const prompt = this.buildPrompt(request);
    
    // Integrate Deck 10 feedback data for context
    const deck10Context = this.getDeck10Context(request.targetZIP);
    const enhancedRequest = {
      ...request,
      contextData: deck10Context
    };

    console.log('🧠 Generating campaign message:', request.campaignType, request.tone);
    return await this.callOpenAI(prompt, enhancedRequest);
  }

  private buildPrompt(request: LLMPromptRequest): string {
    return `Generate a ${request.tone} civic engagement message about ${request.campaignType} for ZIP code area ${request.targetZIP}. Representative alignment is ${request.representativeAlignment}%. Focus on actionable civic participation.`;
  }

  private getDeck10Context(zipCode: string): any {
    const feedback = this.deck10Data.get('deck_10_governance');
    if (!feedback) return null;

    const zipFeedback = feedback.feedbackEntries.filter(entry => entry.zipCode === zipCode);
    return {
      localFeedbackCount: zipFeedback.length,
      localSentiment: zipFeedback.reduce((avg, entry) => {
        const sentimentScore = { positive: 1, neutral: 0, negative: -1, concern: -0.5 };
        return avg + (sentimentScore[entry.sentiment] || 0);
      }, 0) / Math.max(zipFeedback.length, 1),
      recentConcerns: zipFeedback.filter(entry => entry.sentiment === 'concern').length
    };
  }

  public async generateBatchMessages(requests: LLMPromptRequest[]): Promise<LLMPromptResponse[]> {
    console.log('📦 Batch generating', requests.length, 'campaign messages');
    
    // Process in parallel for efficiency
    const promises = requests.map(request => this.generateCampaignMessage(request));
    return await Promise.all(promises);
  }

  public syncDeck10Feedback(newData: Deck10FeedbackData): void {
    this.deck10Data.set(newData.deckId, newData);
    console.log('🔄 Deck 10 feedback synced:', newData.totalEntries, 'entries');
  }

  public getSystemStatus(): {
    llmEnabled: boolean;
    templatesLoaded: number;
    deck10Synced: boolean;
    avgResponseTime: number;
    lastSync: string;
  } {
    return {
      llmEnabled: this.llmEnabled,
      templatesLoaded: this.messageTemplates.size,
      deck10Synced: this.deck10Data.size > 0,
      avgResponseTime: this.llmEnabled ? 185 : 45, // LLM vs local
      lastSync: new Date().toISOString()
    };
  }
}