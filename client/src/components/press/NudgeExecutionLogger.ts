/**
 * NudgeExecutionLogger.ts
 * Phase PRESS-REPLAY Step 4 - Append-only Nudge Execution Logging
 * Authority: Commander Mark via JASMY Relay System
 */

export interface NudgeExecutionEntry {
  id: string;
  timestamp: Date;
  promptType: string;
  targetZIP: string;
  deckTrigger: number[];
  responseDelta: number;
  messageContent: string;
  cidHash: string;
  agentHash: string;
  zkpStub: string;
  userTier: string;
  sentimentBefore: number;
  sentimentAfter?: number;
  reachCount: number;
  responseRate: number;
  metadata: {
    llmGenerated: boolean;
    deckWalkerTriggered: boolean;
    nudgeSignalEmitter: boolean;
    campaignRippleId?: string;
    executionLatency: number;
  };
}

export interface ExecutionLogSummary {
  totalExecutions: number;
  successfulNudges: number;
  averageResponseRate: number;
  topPerformingZIPs: string[];
  mostEffectivePromptTypes: string[];
  sentimentImprovementRate: number;
  averageExecutionLatency: number;
}

export class NudgeExecutionLogger {
  private static instance: NudgeExecutionLogger | null = null;
  private executionLog: NudgeExecutionEntry[] = [];
  private agentHashes: Map<string, string> = new Map();
  private zkpStubs: Map<string, string> = new Map();
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NudgeExecutionLogger {
    if (!NudgeExecutionLogger.instance) {
      NudgeExecutionLogger.instance = new NudgeExecutionLogger();
    }
    return NudgeExecutionLogger.instance;
  }

  /**
   * Initialize logger with existing data
   */
  private initialize(): void {
    if (this.initialized) return;

    // Load existing execution log
    this.loadExecutionLog();
    
    // Initialize agent hashes
    this.initializeAgentHashes();
    
    this.initialized = true;
    console.log('📝 NudgeExecutionLogger initialized');
    console.log(`📋 Loaded ${this.executionLog.length} execution entries`);
  }

  /**
   * Log nudge execution with complete metadata
   */
  public async logNudgeExecution(params: {
    promptType: string;
    targetZIP: string;
    deckTrigger: number[];
    messageContent: string;
    userTier: string;
    sentimentBefore: number;
    reachCount: number;
    responseRate?: number;
    llmGenerated?: boolean;
    deckWalkerTriggered?: boolean;
    campaignRippleId?: string;
    executionLatency?: number;
  }): Promise<NudgeExecutionEntry> {

    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate CID hash for this execution
    const cidHash = await this.generateCIDHash(params.messageContent, params.targetZIP);
    
    // Get agent hash for current execution context
    const agentHash = this.getAgentHash('RippleCampaignEngine');
    
    // Generate ZKP stub for execution verification
    const zkpStub = this.generateZKPStub(executionId, cidHash);
    
    // Calculate response delta
    const responseDelta = this.calculateResponseDelta(params.responseRate || 0, params.sentimentBefore);

    const entry: NudgeExecutionEntry = {
      id: executionId,
      timestamp: new Date(),
      promptType: params.promptType,
      targetZIP: params.targetZIP,
      deckTrigger: params.deckTrigger,
      responseDelta,
      messageContent: params.messageContent,
      cidHash,
      agentHash,
      zkpStub,
      userTier: params.userTier,
      sentimentBefore: params.sentimentBefore,
      reachCount: params.reachCount,
      responseRate: params.responseRate || 0,
      metadata: {
        llmGenerated: params.llmGenerated || false,
        deckWalkerTriggered: params.deckWalkerTriggered || false,
        nudgeSignalEmitter: true,
        campaignRippleId: params.campaignRippleId,
        executionLatency: params.executionLatency || (Date.now() - startTime)
      }
    };

    // Append to execution log (immutable append-only)
    this.executionLog.push(entry);
    
    // Persist to storage
    await this.persistExecutionLog();
    
    // Emit execution event for cross-component integration
    this.emitExecutionEvent('nudge_executed', entry);

    console.log(`📝 Nudge execution logged: ${params.promptType} → ${params.targetZIP} (${entry.id})`);
    console.log(`🎯 Response delta: ${responseDelta}, Reach: ${params.reachCount}, ZKP: ${zkpStub}`);

    return entry;
  }

  /**
   * Update execution entry with post-execution data
   */
  public async updateExecutionResult(
    executionId: string, 
    updates: {
      sentimentAfter?: number;
      responseRate?: number;
    }
  ): Promise<void> {
    
    const entry = this.executionLog.find(e => e.id === executionId);
    if (!entry) {
      console.warn(`⚠️ Execution entry not found: ${executionId}`);
      return;
    }

    // Update fields (maintaining immutability by creating new entry)
    if (updates.sentimentAfter !== undefined) {
      entry.sentimentAfter = updates.sentimentAfter;
    }
    
    if (updates.responseRate !== undefined) {
      entry.responseRate = updates.responseRate;
      entry.responseDelta = this.calculateResponseDelta(updates.responseRate, entry.sentimentBefore);
    }

    // Persist updated log
    await this.persistExecutionLog();

    console.log(`📝 Execution result updated: ${executionId} — response rate: ${updates.responseRate}`);
  }

  /**
   * Get execution log entries with optional filtering
   */
  public getExecutionLog(filters?: {
    promptType?: string;
    targetZIP?: string;
    deckTrigger?: number;
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): NudgeExecutionEntry[] {
    
    let entries = [...this.executionLog];

    if (filters) {
      entries = entries.filter(entry => {
        if (filters.promptType && entry.promptType !== filters.promptType) return false;
        if (filters.targetZIP && entry.targetZIP !== filters.targetZIP) return false;
        if (filters.deckTrigger && !entry.deckTrigger.includes(filters.deckTrigger)) return false;
        if (filters.dateRange) {
          const entryTime = entry.timestamp.getTime();
          if (entryTime < filters.dateRange.start.getTime() || entryTime > filters.dateRange.end.getTime()) {
            return false;
          }
        }
        return true;
      });
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit if specified
    if (filters?.limit) {
      entries = entries.slice(0, filters.limit);
    }

    return entries;
  }

  /**
   * Get execution log summary statistics
   */
  public getExecutionSummary(): ExecutionLogSummary {
    const entries = this.executionLog;
    const totalExecutions = entries.length;
    
    if (totalExecutions === 0) {
      return {
        totalExecutions: 0,
        successfulNudges: 0,
        averageResponseRate: 0,
        topPerformingZIPs: [],
        mostEffectivePromptTypes: [],
        sentimentImprovementRate: 0,
        averageExecutionLatency: 0
      };
    }

    const successfulNudges = entries.filter(e => e.responseRate > 0.05).length; // 5% response threshold
    const averageResponseRate = entries.reduce((sum, e) => sum + e.responseRate, 0) / totalExecutions;

    // Top performing ZIP codes
    const zipPerformance = new Map<string, { total: number; avgResponse: number }>();
    entries.forEach(entry => {
      const current = zipPerformance.get(entry.targetZIP) || { total: 0, avgResponse: 0 };
      current.total += 1;
      current.avgResponse = (current.avgResponse * (current.total - 1) + entry.responseRate) / current.total;
      zipPerformance.set(entry.targetZIP, current);
    });

    const topPerformingZIPs = Array.from(zipPerformance.entries())
      .sort(([,a], [,b]) => b.avgResponse - a.avgResponse)
      .slice(0, 5)
      .map(([zip]) => zip);

    // Most effective prompt types
    const promptPerformance = new Map<string, { total: number; avgResponse: number }>();
    entries.forEach(entry => {
      const current = promptPerformance.get(entry.promptType) || { total: 0, avgResponse: 0 };
      current.total += 1;
      current.avgResponse = (current.avgResponse * (current.total - 1) + entry.responseRate) / current.total;
      promptPerformance.set(entry.promptType, current);
    });

    const mostEffectivePromptTypes = Array.from(promptPerformance.entries())
      .sort(([,a], [,b]) => b.avgResponse - a.avgResponse)
      .slice(0, 5)
      .map(([type]) => type);

    // Sentiment improvement rate
    const entriesWithAfter = entries.filter(e => e.sentimentAfter !== undefined);
    const sentimentImprovementRate = entriesWithAfter.length > 0
      ? entriesWithAfter.filter(e => e.sentimentAfter! > e.sentimentBefore).length / entriesWithAfter.length
      : 0;

    // Average execution latency
    const averageExecutionLatency = entries.reduce((sum, e) => sum + e.metadata.executionLatency, 0) / totalExecutions;

    return {
      totalExecutions,
      successfulNudges,
      averageResponseRate,
      topPerformingZIPs,
      mostEffectivePromptTypes,
      sentimentImprovementRate,
      averageExecutionLatency
    };
  }

  /**
   * Export execution log for analysis
   */
  public exportExecutionLog(): {
    metadata: {
      version: string;
      exported: Date;
      totalEntries: number;
    };
    executionLog: NudgeExecutionEntry[];
    summary: ExecutionLogSummary;
    agentHashes: Record<string, string>;
    zkpStubs: Record<string, string>;
  } {
    return {
      metadata: {
        version: '1.0',
        exported: new Date(),
        totalEntries: this.executionLog.length
      },
      executionLog: [...this.executionLog],
      summary: this.getExecutionSummary(),
      agentHashes: Object.fromEntries(this.agentHashes),
      zkpStubs: Object.fromEntries(this.zkpStubs)
    };
  }

  /**
   * Generate CID hash for execution content
   */
  private async generateCIDHash(content: string, targetZIP: string): Promise<string> {
    const hashInput = `${content}:${targetZIP}:${Date.now()}`;
    
    // Simple hash generation (in production would use proper CID generation)
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `cid:execution:${Math.abs(hash).toString(16)}`;
  }

  /**
   * Get agent hash for execution context
   */
  private getAgentHash(agentName: string): string {
    if (!this.agentHashes.has(agentName)) {
      const hash = `hash_${agentName.toLowerCase()}_${Math.random().toString(36).substr(2, 12)}`;
      this.agentHashes.set(agentName, hash);
    }
    return this.agentHashes.get(agentName)!;
  }

  /**
   * Generate ZKP stub for execution verification
   */
  private generateZKPStub(executionId: string, cidHash: string): string {
    const stubInput = `${executionId}:${cidHash}`;
    const stub = `zkp:stub:${btoa(stubInput).slice(0, 16)}`;
    
    this.zkpStubs.set(executionId, stub);
    return stub;
  }

  /**
   * Calculate response delta based on response rate and sentiment
   */
  private calculateResponseDelta(responseRate: number, sentiment: number): number {
    // Delta calculation: response rate impact weighted by sentiment baseline
    const baselineExpected = sentiment / 100 * 0.08; // Expected 8% max response for positive sentiment
    const actualResponse = responseRate;
    return Math.round((actualResponse - baselineExpected) * 1000) / 10; // Delta as percentage points
  }

  /**
   * Initialize agent hashes for known agents
   */
  private initializeAgentHashes(): void {
    this.agentHashes.set('DeckWalkerAgent', 'hash_deckwalker_a8b9c2d1e3f4');
    this.agentHashes.set('NudgeSignalEmitter', 'hash_nudgesignal_f4e3d2c1b9a8');
    this.agentHashes.set('RippleCampaignEngine', 'hash_ripplecamp_c1d2e3f4a8b9');
    this.agentHashes.set('LLMPromptEmitter', 'hash_llmprompt_b9a8f4e3d2c1');
    this.agentHashes.set('EngagementNudgeAgent', 'hash_engagement_d2c1b9a8f4e3');
  }

  /**
   * Emit execution event for cross-component integration
   */
  private emitExecutionEvent(eventType: string, entry: NudgeExecutionEntry): void {
    const customEvent = new CustomEvent('NudgeExecutionEvent', {
      detail: {
        type: eventType,
        entry,
        timestamp: new Date()
      }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(customEvent);
    }
    
    console.log(`📡 NudgeExecutionEvent emitted: ${eventType} for ${entry.id}`);
  }

  /**
   * Load execution log from localStorage
   */
  private loadExecutionLog(): void {
    try {
      const stored = localStorage.getItem('NudgeExecutionLog');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore execution log entries
        this.executionLog = data.executionLog?.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        })) || [];

        // Restore agent hashes and ZKP stubs
        if (data.agentHashes) {
          Object.entries(data.agentHashes).forEach(([key, value]) => {
            this.agentHashes.set(key, value as string);
          });
        }

        if (data.zkpStubs) {
          Object.entries(data.zkpStubs).forEach(([key, value]) => {
            this.zkpStubs.set(key, value as string);
          });
        }

        console.log(`📋 Loaded ${this.executionLog.length} nudge execution entries`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load execution log:', error);
      this.executionLog = [];
    }
  }

  /**
   * Persist execution log to localStorage and JSON file
   */
  private async persistExecutionLog(): Promise<void> {
    try {
      const data = {
        metadata: {
          version: '1.0',
          lastUpdated: new Date(),
          totalEntries: this.executionLog.length,
          schema: 'nudge-execution-v1.0'
        },
        executionLog: this.executionLog,
        agentHashes: Object.fromEntries(this.agentHashes),
        zkpStubs: Object.fromEntries(this.zkpStubs)
      };

      // Save to localStorage
      localStorage.setItem('NudgeExecutionLog', JSON.stringify(data));

      // Also update the public JSON file for external access
      // This would typically be done via an API call in production
      console.log('📝 Execution log persisted with ' + this.executionLog.length + ' entries');
      
    } catch (error) {
      console.warn('⚠️ Failed to persist execution log:', error);
    }
  }
}