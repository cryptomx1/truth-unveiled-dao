/**
 * RewardTriggerAgent.ts
 * Phase X-FINANCE Step 3 - Autonomous Civic Reward Observer
 * Authority: Commander Mark via JASMY Relay System
 */

import { RewardTriggerMatrix, type RewardTrigger } from './RewardTriggerMatrix';

export interface RewardTriggeredEvent {
  triggerId: string;
  walletCID: string;
  did: string;
  TPReward: number;
  timestamp: Date;
  zkpHash?: string;
  validated: boolean;
  eventSource: string;
  additionalMetadata?: any;
}

export interface TPTransactionEntry {
  id: string;
  timestamp: string;
  type: 'reward_trigger' | 'withdrawal' | 'transfer' | 'mint';
  triggerId?: string;
  walletCID: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  metadata: any;
}

export class RewardTriggerAgent {
  private static instance: RewardTriggerAgent | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private transactionLog: TPTransactionEntry[] = [];
  private rewardEvents: RewardTriggeredEvent[] = [];
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RewardTriggerAgent {
    if (!RewardTriggerAgent.instance) {
      RewardTriggerAgent.instance = new RewardTriggerAgent();
    }
    return RewardTriggerAgent.instance;
  }

  /**
   * Initialize the reward trigger agent
   */
  private initialize(): void {
    if (this.initialized) return;

    // Initialize RewardTriggerMatrix
    RewardTriggerMatrix.initialize();

    // Set up event listeners for civic trigger routes
    this.setupRouteListeners();

    // Load existing transaction log
    this.loadTransactionLog();

    this.initialized = true;
    console.log('🤖 RewardTriggerAgent initialized — autonomous civic reward observer');
    console.log('👂 Listening for trigger events from civic routes');
  }

  /**
   * Set up route listeners for civic trigger events
   */
  private setupRouteListeners(): void {
    // Listen for municipal pilot events
    this.addRouteListener('/municipal/pilot', (eventData: any) => {
      this.processTrigger('MUNICIPAL_PARTICIPATION', eventData);
    });

    // Listen for referral events
    this.addRouteListener('/referral', (eventData: any) => {
      this.processTrigger('REFERRAL_NEW_USER', eventData);
    });

    // Listen for Deck #10 feedback events
    this.addRouteListener('/deck/10', (eventData: any) => {
      this.processTrigger('DECK10_FEEDBACK', eventData);
    });

    // Listen for streak events
    this.addRouteListener('/streak', (eventData: any) => {
      this.processTrigger('COMMAND_STREAK', eventData);
    });

    // Listen for media upload events
    this.addRouteListener('/press/replay', (eventData: any) => {
      this.processTrigger('TRUTH_MEDIA_UPLOAD', eventData);
    });

    console.log('🔗 Route listeners configured for 5 civic trigger patterns');
  }

  /**
   * Add route listener for trigger events
   */
  private addRouteListener(route: string, callback: Function): void {
    if (!this.listeners.has(route)) {
      this.listeners.set(route, []);
    }
    this.listeners.get(route)!.push(callback);
  }

  /**
   * Emit trigger event (called by civic routes)
   */
  public emitTriggerEvent(route: string, eventData: any): void {
    const listeners = this.listeners.get(route);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error(`❌ Error processing trigger event for ${route}:`, error);
        }
      });
    }
  }

  /**
   * Process trigger validation and reward
   */
  private async processTrigger(triggerId: string, eventData: any): Promise<void> {
    try {
      console.log(`🔍 Processing trigger: ${triggerId}`);
      
      const trigger = RewardTriggerMatrix.getTrigger(triggerId);
      if (!trigger) {
        console.warn(`⚠️ Unknown trigger: ${triggerId}`);
        return;
      }

      // Extract context from event data
      const context = {
        did: eventData.did || eventData.userDID || `did:civic:${eventData.userId || 'unknown'}`,
        tier: eventData.tier || eventData.userTier || 'Citizen',
        zkpHash: eventData.zkpHash || eventData.proofHash,
        additionalData: eventData
      };

      // Validate trigger conditions
      const validation = RewardTriggerMatrix.validateTriggerConditions(triggerId, context);
      
      if (!validation.valid) {
        console.log(`❌ Trigger validation failed: ${validation.reason}`);
        return;
      }

      // Create reward event
      const rewardEvent: RewardTriggeredEvent = {
        triggerId,
        walletCID: eventData.walletCID || `cid:wallet:${context.did.split(':')[2]}`,
        did: context.did,
        TPReward: trigger.TPReward,
        timestamp: new Date(),
        zkpHash: context.zkpHash,
        validated: true,
        eventSource: eventData.source || 'civic_route',
        additionalMetadata: context.additionalData
      };

      // Process reward
      await this.processReward(rewardEvent);

      // Update trigger statistics
      RewardTriggerMatrix.updateTriggerStats(triggerId);

      console.log(`✅ Reward triggered: ${trigger.TPReward} TP for ${triggerId}`);
      console.log(`👤 Recipient: ${context.did}`);

    } catch (error) {
      console.error(`❌ Error processing trigger ${triggerId}:`, error);
    }
  }

  /**
   * Process reward disbursement
   */
  private async processReward(rewardEvent: RewardTriggeredEvent): Promise<void> {
    // Create transaction entry
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transactionEntry: TPTransactionEntry = {
      id: transactionId,
      timestamp: new Date().toISOString(),
      type: 'reward_trigger',
      triggerId: rewardEvent.triggerId,
      walletCID: rewardEvent.walletCID,
      amount: rewardEvent.TPReward,
      status: 'pending',
      metadata: {
        did: rewardEvent.did,
        zkpHash: rewardEvent.zkpHash,
        eventSource: rewardEvent.eventSource,
        additionalMetadata: rewardEvent.additionalMetadata
      }
    };

    // Simulate reward processing (in production would interface with actual treasury)
    await this.simulateRewardDisbursement(transactionEntry);

    // Add to transaction log
    this.transactionLog.push(transactionEntry);
    this.rewardEvents.push(rewardEvent);

    // Persist to storage
    this.saveTransactionLog();

    // Emit RewardTriggered event
    this.emitRewardTriggeredEvent(rewardEvent);

    console.log(`💰 Reward disbursed: ${rewardEvent.TPReward} TP → ${rewardEvent.walletCID}`);
  }

  /**
   * Simulate reward disbursement (replace with actual treasury integration)
   */
  private async simulateRewardDisbursement(transaction: TPTransactionEntry): Promise<void> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      transaction.status = 'completed';
      console.log(`✅ Reward disbursement completed: ${transaction.id}`);
    } else {
      transaction.status = 'failed';
      console.log(`❌ Reward disbursement failed: ${transaction.id}`);
    }
  }

  /**
   * Emit RewardTriggered event for external listeners
   */
  private emitRewardTriggeredEvent(rewardEvent: RewardTriggeredEvent): void {
    const customEvent = new CustomEvent('RewardTriggered', {
      detail: rewardEvent
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(customEvent);
    }
    
    console.log(`📡 RewardTriggered event emitted for ${rewardEvent.triggerId}`);
  }

  /**
   * Get recent reward events
   */
  public getRecentRewards(limit: number = 10): RewardTriggeredEvent[] {
    return this.rewardEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get pending rewards
   */
  public getPendingRewards(): TPTransactionEntry[] {
    return this.transactionLog.filter(tx => tx.status === 'pending');
  }

  /**
   * Get transaction history
   */
  public getTransactionHistory(): TPTransactionEntry[] {
    return [...this.transactionLog].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Load transaction log from localStorage
   */
  private loadTransactionLog(): void {
    try {
      const stored = localStorage.getItem('TPTransactionLog');
      if (stored) {
        this.transactionLog = JSON.parse(stored);
        console.log(`📋 Loaded ${this.transactionLog.length} transaction entries`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load transaction log:', error);
    }
  }

  /**
   * Save transaction log to localStorage
   */
  private saveTransactionLog(): void {
    try {
      localStorage.setItem('TPTransactionLog', JSON.stringify(this.transactionLog));
    } catch (error) {
      console.warn('⚠️ Failed to save transaction log:', error);
    }
  }

  /**
   * Export reward statistics
   */
  public getRewardStatistics(): {
    totalRewards: number;
    totalTPDisbursed: number;
    successRate: number;
    triggerBreakdown: { [triggerId: string]: number };
    recentActivity: RewardTriggeredEvent[];
  } {
    const completedTransactions = this.transactionLog.filter(tx => tx.status === 'completed');
    const triggerBreakdown = this.rewardEvents.reduce((acc, event) => {
      acc[event.triggerId] = (acc[event.triggerId] || 0) + 1;
      return acc;
    }, {} as { [triggerId: string]: number });

    return {
      totalRewards: this.rewardEvents.length,
      totalTPDisbursed: completedTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      successRate: this.transactionLog.length > 0 ? 
        completedTransactions.length / this.transactionLog.length : 0,
      triggerBreakdown,
      recentActivity: this.getRecentRewards(5)
    };
  }

  /**
   * Export transaction log as JSON
   */
  public exportTransactionLog(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      version: '1.0',
      entries: this.transactionLog,
      statistics: this.getRewardStatistics()
    }, null, 2);
  }

  /**
   * Manual trigger for testing
   */
  public manualTrigger(triggerId: string, eventData: any): void {
    console.log(`🧪 Manual trigger activated: ${triggerId}`);
    this.processTrigger(triggerId, eventData);
  }
}