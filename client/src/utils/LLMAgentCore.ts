/**
 * LLMAgentCore.ts
 * LLM Agent Integration Core - Privacy-First OpenAI Integration
 * Authority: Commander Mark via JASMY Relay
 */

interface LLMRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

interface LLMResponse {
  success: boolean;
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  ai_verified: boolean;
  timestamp: string;
  error?: string;
}

export class LLMAgentCore {
  private static apiKey: string | null = null;
  private static enabled: boolean = false;
  private static initialized: boolean = false;

  /**
   * Initialize LLM Agent Core with environment variables
   */
  static initialize(): boolean {
    if (this.initialized) return this.enabled;

    try {
      // Check for environment variables
      this.enabled = import.meta.env.VITE_ENABLE_LLM_AGENTS === 'true';
      this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;

      if (this.enabled && !this.apiKey) {
        console.warn('🤖 LLM Agents enabled but OPENAI_API_KEY not found - falling back to local mode');
        this.enabled = false;
      }

      this.initialized = true;
      
      if (this.enabled) {
        console.log('🧠 LLM Agent Core initialized - GPT-4-mini integration active');
      } else {
        console.log('🤖 LLM Agent Core initialized - local rule-based mode only');
      }

      return this.enabled;
    } catch (error) {
      console.error('❌ LLM Agent Core initialization failed:', error);
      this.enabled = false;
      this.initialized = true;
      return false;
    }
  }

  /**
   * Check if LLM mode is enabled
   */
  static isEnabled(): boolean {
    if (!this.initialized) this.initialize();
    return this.enabled;
  }

  /**
   * Redact sensitive information from content before LLM transmission
   */
  private static redactContent(content: string): string {
    // Remove CID references
    content = content.replace(/bafybei[a-z0-9]{20,}/gi, '[CID_REDACTED]');
    
    // Remove DID references
    content = content.replace(/did:civic:[a-z0-9_-]+/gi, '[DID_REDACTED]');
    
    // Remove ZKP hashes
    content = content.replace(/0x[a-f0-9]{40,}/gi, '[ZKP_HASH_REDACTED]');
    
    // Remove potential user identifiers
    content = content.replace(/user_[a-z0-9]+/gi, '[USER_ID_REDACTED]');
    content = content.replace(/sess_[a-z0-9]+/gi, '[SESSION_ID_REDACTED]');
    
    // Remove IP addresses
    content = content.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');
    
    return content;
  }

  /**
   * Make LLM request with fallback to local processing
   */
  static async makeLLMRequest(request: LLMRequest): Promise<LLMResponse> {
    const timestamp = new Date().toISOString();

    // If LLM not enabled, return local fallback
    if (!this.isEnabled()) {
      return {
        success: false,
        content: 'LLM mode disabled - using local rule-based processing',
        ai_verified: false,
        timestamp,
        error: 'LLM_DISABLED'
      };
    }

    try {
      // Redact sensitive content
      const redactedPrompt = this.redactContent(request.prompt);
      const redactedContext = request.context ? this.redactContent(request.context) : undefined;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a civic platform audit assistant. Analyze the provided content for accuracy, consistency, and potential issues. Be concise and specific.'
            },
            {
              role: 'user',
              content: redactedContext ? `Context: ${redactedContext}\n\nPrompt: ${redactedPrompt}` : redactedPrompt
            }
          ],
          max_tokens: request.maxTokens || 500,
          temperature: request.temperature || 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        content: data.choices[0]?.message?.content || 'No response generated',
        usage: data.usage,
        ai_verified: true,
        timestamp
      };

    } catch (error) {
      console.warn('⚠️ LLM request failed, using local fallback:', error);
      
      return {
        success: false,
        content: 'LLM request failed - using local rule-based processing',
        ai_verified: false,
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze text for hallucinations and inconsistencies
   */
  static async analyzeForHallucinations(content: string, moduleSpecs?: string): Promise<LLMResponse> {
    const prompt = `Analyze the following civic platform output for potential hallucinations, inconsistencies, or inaccuracies:

Content to analyze: ${content}

${moduleSpecs ? `Expected module specifications: ${moduleSpecs}` : ''}

Please identify:
1. Any factual inaccuracies or contradictions
2. Claims that seem unrealistic or unverifiable
3. Inconsistencies with provided specifications
4. Technical details that may be incorrect

Respond with: CLEAN if no issues found, or ISSUES_DETECTED with specific concerns.`;

    return this.makeLLMRequest({ prompt, maxTokens: 300, temperature: 0.2 });
  }

  /**
   * Generate audit summary from fusion data
   */
  static async generateAuditSummary(auditData: string): Promise<LLMResponse> {
    const prompt = `Generate a concise audit summary for this civic fusion data:

${auditData}

Provide:
1. Overall system health status
2. Key patterns or anomalies detected
3. Recommended actions (if any)
4. Confidence level (High/Medium/Low)

Keep response under 200 words and focus on actionable insights.`;

    return this.makeLLMRequest({ prompt, maxTokens: 250, temperature: 0.4 });
  }

  /**
   * Classify API errors semantically
   */
  static async classifyAPIError(errorLog: string, endpoint: string): Promise<LLMResponse> {
    const prompt = `Classify this API error for endpoint ${endpoint}:

Error log: ${errorLog}

Classify as one of:
- CORS_ISSUE: Cross-origin request blocked
- TIMEOUT: Request timeout or slow response
- AUTH_FAILURE: Authentication or authorization error
- SCHEMA_MISMATCH: Response format doesn't match expected schema
- RATE_LIMITED: Too many requests
- SERVICE_UNAVAILABLE: Service temporarily down
- NETWORK_ERROR: General network connectivity issue
- UNKNOWN: Cannot determine specific cause

Provide classification and brief explanation (1-2 sentences).`;

    return this.makeLLMRequest({ prompt, maxTokens: 150, temperature: 0.1 });
  }

  /**
   * Get LLM agent statistics
   */
  static getStats(): {
    enabled: boolean;
    initialized: boolean;
    hasApiKey: boolean;
  } {
    return {
      enabled: this.enabled,
      initialized: this.initialized,
      hasApiKey: !!this.apiKey
    };
  }
}

// Initialize on load
LLMAgentCore.initialize();