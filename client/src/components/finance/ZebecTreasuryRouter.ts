// ZebecTreasuryRouter.ts - Phase X-ZEBEC Step 3: Treasury Distribution System
// Automated treasury routing system for Zebec streams and civic task incentives

import TTSEngineAgent from '../../agents/TTSEngineAgent';

export interface TreasuryDistribution {
  streamId: string;
  cid: string;
  recipientAddress: string;
  amount: number;
  taskType: 'deck_participation' | 'dao_vote' | 'guardian_unlock' | 'fusion_completion' | 'municipal_engagement';
  tier: 'Citizen' | 'Governor' | 'Commander';
  multiplier: number;
  timestamp: Date;
  status: 'pending' | 'streaming' | 'completed' | 'failed';
  transactionHash?: string;
  originDeck?: string;
}

export interface TreasuryRouterConfig {
  maxStreamInitTime: number; // 300ms target
  loggerInterval: number; // 2s tolerance
  tierMultipliers: Record<string, number>;
  enableTTS: boolean;
  fallbackRetries: number;
}

class ZebecTreasuryRouter {
  private static instance: ZebecTreasuryRouter;
  private distributions: TreasuryDistribution[] = [];
  private config: TreasuryRouterConfig;
  private isInitialized = false;
  private ttsAgent: TTSEngineAgent;

  private constructor() {
    this.config = {
      maxStreamInitTime: 300, // <300ms requirement
      loggerInterval: 2000, // 2s logging interval
      tierMultipliers: {
        'Citizen': 1.0,
        'Governor': 2.0,
        'Commander': 3.0
      },
      enableTTS: true,
      fallbackRetries: 3
    };
    this.ttsAgent = TTSEngineAgent.getInstance();
    this.initializeRouter();
  }

  public static getInstance(): ZebecTreasuryRouter {
    if (!ZebecTreasuryRouter.instance) {
      ZebecTreasuryRouter.instance = new ZebecTreasuryRouter();
    }
    return ZebecTreasuryRouter.instance;
  }

  private async initializeRouter(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🏦 ZebecTreasuryRouter initializing — Automated treasury distribution system');

    try {
      // Load existing distribution log from localStorage
      const existingLog = localStorage.getItem('treasury_distribution_log');
      if (existingLog) {
        this.distributions = JSON.parse(existingLog).map((dist: any) => ({
          ...dist,
          timestamp: new Date(dist.timestamp)
        }));
        console.log(`📋 Loaded ${this.distributions.length} existing treasury distributions`);
      }

      // Initialize ZebecAdapter mock connection
      await this.initializeZebecConnection();
      
      this.isInitialized = true;
      console.log('✅ ZebecTreasuryRouter operational — Treasury stream automation ready');

    } catch (error) {
      console.error('❌ ZebecTreasuryRouter initialization failed:', error);
      this.isInitialized = false;
    }
  }

  private async initializeZebecConnection(): Promise<void> {
    // Mock Zebec SDK initialization
    await new Promise(resolve => setTimeout(resolve, 150));
    
    console.log('🔗 ZebecAdapter connection established (mock mode)');
    console.log('💰 Treasury account balance: 50,000 USDC, 500 SOL, 1,000,000 TP');
  }

  /**
   * Create automated treasury stream for civic task completion
   */
  public async createTreasuryStream(
    recipientAddress: string,
    baseAmount: number,
    taskType: TreasuryDistribution['taskType'],
    userTier: TreasuryDistribution['tier'] = 'Citizen',
    originDeck?: string
  ): Promise<TreasuryDistribution> {
    const startTime = Date.now();

    try {
      // Calculate tier-weighted amount
      const multiplier = this.config.tierMultipliers[userTier];
      const finalAmount = baseAmount * multiplier;

      // Generate stream metadata
      const streamId = `treasury_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      const cid = `bafybei${Math.random().toString(36).substr(2, 46)}`;

      const distribution: TreasuryDistribution = {
        streamId,
        cid,
        recipientAddress,
        amount: finalAmount,
        taskType,
        tier: userTier,
        multiplier,
        timestamp: new Date(),
        status: 'pending',
        originDeck
      };

      console.log('🚀 Creating treasury stream:', streamId);
      console.log(`💰 Amount: ${finalAmount} (${baseAmount} × ${multiplier}x ${userTier})`);
      console.log(`📋 Task: ${taskType} | Recipient: ${recipientAddress}`);

      // Mock Zebec stream creation with fallback logic
      const streamResult = await this.executeZebecStreamCreation(distribution);
      
      if (streamResult.success) {
        distribution.status = 'streaming';
        distribution.transactionHash = streamResult.transactionHash;
        
        const executionTime = Date.now() - startTime;
        console.log(`✅ Treasury stream created successfully in ${executionTime}ms`);
        
        if (executionTime > this.config.maxStreamInitTime) {
          console.warn(`⚠️ Stream creation exceeded target time: ${executionTime}ms > ${this.config.maxStreamInitTime}ms`);
        }

        // TTS narration for successful stream creation
        if (this.config.enableTTS) {
          this.ttsAgent.queueNarration(
            `Treasury stream created to ${recipientAddress.slice(0, 8)} for ${taskType.replace('_', ' ')}`,
            'treasury-router',
            'informative'
          );
        }
      } else {
        distribution.status = 'failed';
        console.error('❌ Treasury stream creation failed:', streamResult.error);
      }

      // Add to distributions and save to log
      this.distributions.push(distribution);
      this.saveTreasuryLog();

      return distribution;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Treasury stream creation error after ${executionTime}ms:`, error);
      
      // Create failed distribution record
      const failedDistribution: TreasuryDistribution = {
        streamId: `failed_${Date.now()}`,
        cid: 'error',
        recipientAddress,
        amount: baseAmount,
        taskType,
        tier: userTier,
        multiplier: this.config.tierMultipliers[userTier],
        timestamp: new Date(),
        status: 'failed',
        originDeck
      };

      this.distributions.push(failedDistribution);
      this.saveTreasuryLog();

      throw error;
    }
  }

  /**
   * Execute Zebec stream creation with fallback logic
   */
  private async executeZebecStreamCreation(distribution: TreasuryDistribution): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    let retries = 0;
    
    while (retries < this.config.fallbackRetries) {
      try {
        // Mock Zebec SDK stream creation
        await new Promise(resolve => setTimeout(resolve, 200 + (retries * 50)));
        
        // Simulate 95% success rate on first try, 100% on retries
        const successRate = retries === 0 ? 0.95 : 1.0;
        const isSuccess = Math.random() < successRate;
        
        if (isSuccess) {
          const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          console.log(`🔗 Zebec stream created: ${transactionHash}`);
          
          return {
            success: true,
            transactionHash
          };
        } else if (retries < this.config.fallbackRetries - 1) {
          console.warn(`⚠️ Stream creation attempt ${retries + 1} failed, retrying...`);
          retries++;
          continue;
        } else {
          return {
            success: false,
            error: 'Maximum retries exceeded'
          };
        }
      } catch (error) {
        retries++;
        if (retries >= this.config.fallbackRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        console.warn(`⚠️ Stream creation retry ${retries}/${this.config.fallbackRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    return {
      success: false,
      error: 'Unexpected fallback error'
    };
  }

  /**
   * Route mapping for task-based stream creation
   */
  public async routeTaskReward(
    taskType: TreasuryDistribution['taskType'],
    recipientAddress: string,
    userTier: TreasuryDistribution['tier'] = 'Citizen',
    originDeck?: string
  ): Promise<TreasuryDistribution> {
    // Task-specific base amounts (in TP)
    const taskRewards: Record<TreasuryDistribution['taskType'], number> = {
      'deck_participation': 50,
      'dao_vote': 75,
      'guardian_unlock': 200,
      'fusion_completion': 500,
      'municipal_engagement': 100
    };

    const baseAmount = taskRewards[taskType];
    console.log(`🎯 Routing ${taskType} reward: ${baseAmount} TP base amount`);

    return await this.createTreasuryStream(
      recipientAddress,
      baseAmount,
      taskType,
      userTier,
      originDeck
    );
  }

  /**
   * Get distribution statistics
   */
  public getDistributionStats(): {
    totalStreams: number;
    activeStreams: number;
    totalValue: number;
    successRate: number;
    averageProcessingTime: number;
  } {
    const totalStreams = this.distributions.length;
    const activeStreams = this.distributions.filter(d => d.status === 'streaming').length;
    const totalValue = this.distributions.reduce((sum, d) => sum + d.amount, 0);
    const successfulStreams = this.distributions.filter(d => d.status === 'streaming' || d.status === 'completed').length;
    const successRate = totalStreams > 0 ? (successfulStreams / totalStreams) * 100 : 0;

    return {
      totalStreams,
      activeStreams,
      totalValue,
      successRate: Math.round(successRate * 100) / 100,
      averageProcessingTime: 285 // Mock average <300ms target
    };
  }

  /**
   * Get recent distributions for dashboard display
   */
  public getRecentDistributions(limit: number = 10): TreasuryDistribution[] {
    return this.distributions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Export distributions for StreamDashboard integration
   */
  public getDistributionsForDashboard(): TreasuryDistribution[] {
    return this.distributions.filter(d => d.status === 'streaming' || d.status === 'pending');
  }

  /**
   * Save treasury distribution log to localStorage and export JSON
   */
  private saveTreasuryLog(): void {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('treasury_distribution_log', JSON.stringify(this.distributions));

      // Create downloadable log file data
      const logData = {
        generated: new Date().toISOString(),
        totalDistributions: this.distributions.length,
        stats: this.getDistributionStats(),
        distributions: this.distributions.map(dist => ({
          ...dist,
          timestamp: dist.timestamp.toISOString()
        }))
      };

      // Store in global window for debugging access
      (window as any).treasuryDistributionLog = logData;

      console.log(`📋 Treasury distribution log updated: ${this.distributions.length} entries`);

    } catch (error) {
      console.error('❌ Failed to save treasury distribution log:', error);
    }
  }

  /**
   * Manual stream status update (for external integration)
   */
  public updateStreamStatus(streamId: string, status: TreasuryDistribution['status']): boolean {
    const distribution = this.distributions.find(d => d.streamId === streamId);
    if (distribution) {
      distribution.status = status;
      this.saveTreasuryLog();
      
      console.log(`🔄 Stream ${streamId} status updated to: ${status}`);
      
      if (this.config.enableTTS && (status === 'completed' || status === 'failed')) {
        this.ttsAgent.queueNarration(
          `Treasury stream ${streamId.slice(-8)} ${status}`,
          'treasury-router',
          'informative'
        );
      }
      
      return true;
    }
    return false;
  }

  /**
   * Get configuration for external access
   */
  public getConfig(): TreasuryRouterConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<TreasuryRouterConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('⚙️ ZebecTreasuryRouter configuration updated:', updates);
  }
}

export default ZebecTreasuryRouter;