/**
 * TPRedemptionLedger.ts
 * Phase X-FINANCE Step 4 - TruthPoint Redemption Ledger
 * Authority: Commander Mark via JASMY Relay System
 */

export type RedemptionType = 'civic_voucher' | 'governance_credit' | 'fusion_token';

export interface RedemptionEntry {
  id: string;
  walletCID: string;
  did: string;
  type: RedemptionType;
  amount: number; // Number of items redeemed
  tpCost: number; // Total TP cost
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  confirmationHash?: string;
  metadata: {
    tier: string;
    benefits: string[];
    category: 'civic' | 'governance' | 'fusion';
    expirationDate?: Date;
    usageCount?: number;
    maxUsages?: number;
    additionalData?: any;
  };
}

export interface RedemptionStatistics {
  totalRedemptions: number;
  totalTPSpent: number;
  redemptionsByType: { [key in RedemptionType]: number };
  redemptionsByTier: { [tier: string]: number };
  averageRedemptionValue: number;
  successRate: number;
  activeVouchers: number;
  expiredItems: number;
}

export class TPRedemptionLedger {
  private static instance: TPRedemptionLedger | null = null;
  private redemptionEntries: Map<string, RedemptionEntry> = new Map();
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TPRedemptionLedger {
    if (!TPRedemptionLedger.instance) {
      TPRedemptionLedger.instance = new TPRedemptionLedger();
    }
    return TPRedemptionLedger.instance;
  }

  /**
   * Initialize ledger
   */
  private initialize(): void {
    if (this.initialized) return;

    // Load existing redemptions from localStorage
    this.loadRedemptions();

    // Set up periodic expiration check
    this.startExpirationCheck();

    this.initialized = true;
    console.log('💰 TPRedemptionLedger initialized');
    console.log(`📊 Loaded ${this.redemptionEntries.size} redemption entries`);
  }

  /**
   * Process new redemption
   */
  public async processRedemption(params: {
    walletCID: string;
    did: string;
    type: RedemptionType;
    amount: number;
    tpCost: number;
    metadata: {
      tier: string;
      benefits: string[];
      category: 'civic' | 'governance' | 'fusion';
      additionalData?: any;
    };
  }): Promise<RedemptionEntry> {
    const redemptionId = `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate expiration date based on type
    const expirationDate = this.calculateExpirationDate(params.type);
    const maxUsages = this.getMaxUsages(params.type, params.amount);

    const entry: RedemptionEntry = {
      id: redemptionId,
      walletCID: params.walletCID,
      did: params.did,
      type: params.type,
      amount: params.amount,
      tpCost: params.tpCost,
      timestamp: new Date(),
      status: 'pending',
      confirmationHash: this.generateConfirmationHash(redemptionId, params.walletCID, params.tpCost),
      metadata: {
        ...params.metadata,
        expirationDate,
        usageCount: 0,
        maxUsages
      }
    };

    // Simulate processing delay
    setTimeout(() => {
      // 95% success rate simulation
      const success = Math.random() > 0.05;
      entry.status = success ? 'completed' : 'failed';
      this.saveRedemptions();
      
      // Emit redemption event
      this.emitRedemptionEvent('redemption_processed', entry);
    }, 1000 + Math.random() * 1000);

    this.redemptionEntries.set(redemptionId, entry);
    this.saveRedemptions();

    // Emit creation event
    this.emitRedemptionEvent('redemption_created', entry);

    console.log(`💰 Redemption processed: ${params.amount}x ${params.type} for ${params.tpCost} TP`);
    console.log(`🔗 Redemption ID: ${redemptionId}, Hash: ${entry.confirmationHash}`);

    return entry;
  }

  /**
   * Get redemption history for wallet
   */
  public getRedemptionHistory(walletCID: string, limit: number = 10): RedemptionEntry[] {
    this.initialize();
    return Array.from(this.redemptionEntries.values())
      .filter(entry => entry.walletCID === walletCID)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get redemption by ID
   */
  public getRedemption(redemptionId: string): RedemptionEntry | undefined {
    this.initialize();
    return this.redemptionEntries.get(redemptionId);
  }

  /**
   * Get active vouchers/credits for wallet
   */
  public getActiveItems(walletCID: string, type?: RedemptionType): RedemptionEntry[] {
    this.initialize();
    const now = new Date();
    
    return Array.from(this.redemptionEntries.values())
      .filter(entry => {
        if (entry.walletCID !== walletCID) return false;
        if (entry.status !== 'completed') return false;
        if (type && entry.type !== type) return false;
        
        // Check if expired
        if (entry.metadata.expirationDate && entry.metadata.expirationDate < now) {
          return false;
        }
        
        // Check if fully used
        if (entry.metadata.usageCount && entry.metadata.maxUsages) {
          return entry.metadata.usageCount < entry.metadata.maxUsages;
        }
        
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Use/consume an active item
   */
  public useRedemption(redemptionId: string): {
    success: boolean;
    remainingUses?: number;
    message: string;
  } {
    const entry = this.redemptionEntries.get(redemptionId);
    if (!entry) {
      return { success: false, message: 'Redemption not found' };
    }

    if (entry.status !== 'completed') {
      return { success: false, message: 'Redemption not completed' };
    }

    // Check expiration
    const now = new Date();
    if (entry.metadata.expirationDate && entry.metadata.expirationDate < now) {
      entry.status = 'expired';
      this.saveRedemptions();
      return { success: false, message: 'Redemption has expired' };
    }

    // Check usage limits
    const currentUsage = entry.metadata.usageCount || 0;
    const maxUsages = entry.metadata.maxUsages || 1;
    
    if (currentUsage >= maxUsages) {
      return { success: false, message: 'Redemption fully used' };
    }

    // Increment usage count
    entry.metadata.usageCount = currentUsage + 1;
    const remainingUses = maxUsages - entry.metadata.usageCount;
    
    this.saveRedemptions();
    this.emitRedemptionEvent('redemption_used', entry);

    console.log(`💰 Redemption used: ${redemptionId}, Remaining uses: ${remainingUses}`);

    return {
      success: true,
      remainingUses,
      message: `Redemption used successfully. ${remainingUses} uses remaining.`
    };
  }

  /**
   * Get redemption statistics
   */
  public getRedemptionStatistics(): RedemptionStatistics {
    this.initialize();
    const entries = Array.from(this.redemptionEntries.values());
    
    const totalRedemptions = entries.length;
    const totalTPSpent = entries
      .filter(e => e.status === 'completed')
      .reduce((sum, e) => sum + e.tpCost, 0);
    
    const redemptionsByType = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as { [key in RedemptionType]: number });
    
    const redemptionsByTier = entries.reduce((acc, entry) => {
      const tier = entry.metadata.tier;
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as { [tier: string]: number });
    
    const averageRedemptionValue = totalRedemptions > 0 
      ? totalTPSpent / entries.filter(e => e.status === 'completed').length
      : 0;
    
    const successRate = totalRedemptions > 0 
      ? entries.filter(e => e.status === 'completed').length / totalRedemptions
      : 0;
    
    const now = new Date();
    const activeVouchers = entries.filter(e => 
      e.status === 'completed' &&
      (!e.metadata.expirationDate || e.metadata.expirationDate > now) &&
      (!e.metadata.maxUsages || (e.metadata.usageCount || 0) < e.metadata.maxUsages)
    ).length;
    
    const expiredItems = entries.filter(e => 
      e.metadata.expirationDate && e.metadata.expirationDate <= now
    ).length;

    return {
      totalRedemptions,
      totalTPSpent,
      redemptionsByType,
      redemptionsByTier,
      averageRedemptionValue,
      successRate,
      activeVouchers,
      expiredItems
    };
  }

  /**
   * Calculate weekly redemption totals for wallet
   */
  public getWeeklyRedemptionTotal(walletCID: string): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return Array.from(this.redemptionEntries.values())
      .filter(entry => 
        entry.walletCID === walletCID &&
        entry.timestamp > oneWeekAgo &&
        entry.status === 'completed'
      )
      .reduce((sum, entry) => sum + entry.tpCost, 0);
  }

  /**
   * Export redemption data for audit
   */
  public exportLedger(): {
    timestamp: Date;
    entries: RedemptionEntry[];
    statistics: RedemptionStatistics;
    integrity: {
      totalEntries: number;
      hashCheck: string;
      version: string;
    };
  } {
    const entries = Array.from(this.redemptionEntries.values());
    const statistics = this.getRedemptionStatistics();
    
    // Generate integrity hash
    const hashInput = entries
      .map(e => `${e.id}:${e.confirmationHash}:${e.tpCost}`)
      .join('|');
    const hashCheck = this.generateHash(hashInput);

    return {
      timestamp: new Date(),
      entries,
      statistics,
      integrity: {
        totalEntries: entries.length,
        hashCheck,
        version: '1.0'
      }
    };
  }

  /**
   * Calculate expiration date based on redemption type
   */
  private calculateExpirationDate(type: RedemptionType): Date {
    const now = new Date();
    const expiration = new Date(now);
    
    switch (type) {
      case 'civic_voucher':
        expiration.setDate(expiration.getDate() + 90); // 90 days
        break;
      case 'governance_credit':
        expiration.setDate(expiration.getDate() + 180); // 180 days
        break;
      case 'fusion_token':
        expiration.setDate(expiration.getDate() + 365); // 365 days
        break;
    }
    
    return expiration;
  }

  /**
   * Get maximum usages for redemption type
   */
  private getMaxUsages(type: RedemptionType, amount: number): number {
    switch (type) {
      case 'civic_voucher':
        return amount * 3; // Each voucher can be used 3 times
      case 'governance_credit':
        return amount * 5; // Each credit can be used 5 times
      case 'fusion_token':
        return amount; // Each token is single-use
    }
  }

  /**
   * Generate confirmation hash
   */
  private generateConfirmationHash(id: string, walletCID: string, tpCost: number): string {
    const input = `${id}:${walletCID}:${tpCost}:${Date.now()}`;
    return this.generateHash(input);
  }

  /**
   * Simple hash generation
   */
  private generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  /**
   * Start periodic expiration check
   */
  private startExpirationCheck(): void {
    // Check for expired items every 5 minutes
    setInterval(() => {
      this.checkAndExpireItems();
    }, 5 * 60 * 1000);
  }

  /**
   * Check and mark expired items
   */
  private checkAndExpireItems(): void {
    const now = new Date();
    let expiredCount = 0;
    
    this.redemptionEntries.forEach((entry) => {
      if (
        entry.status === 'completed' &&
        entry.metadata.expirationDate &&
        entry.metadata.expirationDate <= now
      ) {
        entry.status = 'expired';
        expiredCount++;
      }
    });
    
    if (expiredCount > 0) {
      this.saveRedemptions();
      console.log(`📅 Expired ${expiredCount} redemption items`);
    }
  }

  /**
   * Emit redemption event
   */
  private emitRedemptionEvent(eventType: string, entry: RedemptionEntry): void {
    const customEvent = new CustomEvent('RedemptionEvent', {
      detail: {
        type: eventType,
        entry,
        timestamp: new Date()
      }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(customEvent);
    }
    
    console.log(`📡 RedemptionEvent emitted: ${eventType} for ${entry.id}`);
  }

  /**
   * Load redemptions from localStorage
   */
  private loadRedemptions(): void {
    try {
      const stored = localStorage.getItem('TPRedemptionLedger');
      if (stored) {
        const redemptions = JSON.parse(stored);
        redemptions.forEach((entry: any) => {
          // Convert date strings back to Date objects
          entry.timestamp = new Date(entry.timestamp);
          if (entry.metadata.expirationDate) {
            entry.metadata.expirationDate = new Date(entry.metadata.expirationDate);
          }
          this.redemptionEntries.set(entry.id, entry);
        });
        console.log(`📋 Loaded ${this.redemptionEntries.size} redemption entries`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load redemption entries:', error);
    }
  }

  /**
   * Save redemptions to localStorage
   */
  private saveRedemptions(): void {
    try {
      const entries = Array.from(this.redemptionEntries.values());
      localStorage.setItem('TPRedemptionLedger', JSON.stringify(entries));
    } catch (error) {
      console.warn('⚠️ Failed to save redemption entries:', error);
    }
  }
}