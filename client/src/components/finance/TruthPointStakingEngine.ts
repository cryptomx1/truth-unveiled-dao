/**
 * TruthPointStakingEngine.ts
 * Phase X-FINANCE Step 4 - TruthPoint Staking Infrastructure
 * Authority: Commander Mark via JASMY Relay System
 */

export interface StakingTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  minStake: number;
  baseYield: number; // Annual percentage yield
  lockPeriod: number; // Days
  redemptionBonus: number; // Multiplier for redemptions
  govWeight: number; // Governance voting weight multiplier
}

export interface StakingPosition {
  id: string;
  walletCID: string;
  did: string;
  amount: number;
  tier: StakingTier['name'];
  lockPeriod: number;
  startDate: Date;
  endDate: Date;
  currentYield: number;
  projectedReward: number;
  status: 'active' | 'unlocked' | 'withdrawn' | 'penalized';
  zkpHash?: string;
  lastYieldPayout: Date;
}

export interface StakingReward {
  positionId: string;
  amount: number;
  type: 'yield' | 'bonus' | 'governance' | 'early_unlock_penalty';
  timestamp: Date;
  blockHash?: string;
}

export class TruthPointStakingEngine {
  private static instance: TruthPointStakingEngine | null = null;
  private stakingTiers: Map<string, StakingTier> = new Map();
  private activePositions: Map<string, StakingPosition> = new Map();
  private stakingRewards: StakingReward[] = [];
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TruthPointStakingEngine {
    if (!TruthPointStakingEngine.instance) {
      TruthPointStakingEngine.instance = new TruthPointStakingEngine();
    }
    return TruthPointStakingEngine.instance;
  }

  /**
   * Initialize staking engine with tier definitions
   */
  private initialize(): void {
    if (this.initialized) return;

    // Define staking tiers with tier-based yield logic
    const tiers: StakingTier[] = [
      {
        name: 'Bronze',
        minStake: 100,
        baseYield: 5.0, // 5% APY
        lockPeriod: 30,
        redemptionBonus: 1.0,
        govWeight: 1.0
      },
      {
        name: 'Silver',
        minStake: 500,
        baseYield: 7.5, // 7.5% APY
        lockPeriod: 60,
        redemptionBonus: 1.25,
        govWeight: 1.5
      },
      {
        name: 'Gold',
        minStake: 1500,
        baseYield: 10.0, // 10% APY
        lockPeriod: 90,
        redemptionBonus: 1.5,
        govWeight: 2.0
      },
      {
        name: 'Platinum',
        minStake: 5000,
        baseYield: 12.5, // 12.5% APY
        lockPeriod: 180,
        redemptionBonus: 2.0,
        govWeight: 3.0
      },
      {
        name: 'Diamond',
        minStake: 15000,
        baseYield: 15.0, // 15% APY
        lockPeriod: 365,
        redemptionBonus: 2.5,
        govWeight: 4.0
      }
    ];

    tiers.forEach(tier => {
      this.stakingTiers.set(tier.name, tier);
    });

    // Load existing positions from localStorage
    this.loadStakingPositions();

    this.initialized = true;
    console.log('🏦 TruthPointStakingEngine initialized with 5 staking tiers');
    console.log(`📊 Total staking tiers: ${this.stakingTiers.size}, Active positions: ${this.activePositions.size}`);
  }

  /**
   * Get all staking tiers
   */
  public getStakingTiers(): StakingTier[] {
    this.initialize();
    return Array.from(this.stakingTiers.values());
  }

  /**
   * Get eligible staking tier based on amount
   */
  public getEligibleTier(amount: number): StakingTier | null {
    this.initialize();
    const sortedTiers = this.getStakingTiers()
      .filter(tier => amount >= tier.minStake)
      .sort((a, b) => b.minStake - a.minStake);
    
    return sortedTiers[0] || null;
  }

  /**
   * Calculate staking preview
   */
  public calculateStakingPreview(
    amount: number,
    lockPeriod: number,
    customTier?: StakingTier['name']
  ): {
    tier: StakingTier;
    projectedYield: number;
    dailyReward: number;
    totalReward: number;
    governanceWeight: number;
    redemptionBonus: number;
  } {
    const tier = customTier 
      ? this.stakingTiers.get(customTier)!
      : this.getEligibleTier(amount);

    if (!tier) {
      throw new Error(`Insufficient amount for staking. Minimum: ${this.getStakingTiers()[0].minStake} TP`);
    }

    // Calculate time-adjusted yield
    const daysInYear = 365;
    const timeMultiplier = Math.min(lockPeriod / tier.lockPeriod, 2.0); // Cap at 2x for extended locks
    const adjustedYield = tier.baseYield * timeMultiplier;
    
    const projectedYield = (amount * adjustedYield) / 100;
    const dailyReward = projectedYield / daysInYear;
    const totalReward = (dailyReward * lockPeriod);

    return {
      tier,
      projectedYield: adjustedYield,
      dailyReward,
      totalReward,
      governanceWeight: tier.govWeight,
      redemptionBonus: tier.redemptionBonus
    };
  }

  /**
   * Create new staking position
   */
  public async createStakingPosition(
    walletCID: string,
    did: string,
    amount: number,
    lockPeriod: number,
    zkpHash?: string
  ): Promise<StakingPosition> {
    const preview = this.calculateStakingPreview(amount, lockPeriod);
    const positionId = `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + lockPeriod);

    const position: StakingPosition = {
      id: positionId,
      walletCID,
      did,
      amount,
      tier: preview.tier.name,
      lockPeriod,
      startDate,
      endDate,
      currentYield: preview.projectedYield,
      projectedReward: preview.totalReward,
      status: 'active',
      zkpHash,
      lastYieldPayout: startDate
    };

    this.activePositions.set(positionId, position);
    this.saveStakingPositions();

    // Emit staking event
    this.emitStakingEvent('position_created', position);

    console.log(`🏦 Staking position created: ${amount} TP for ${lockPeriod} days`);
    console.log(`📈 Tier: ${preview.tier.name}, Projected yield: ${preview.projectedYield.toFixed(2)}%`);

    return position;
  }

  /**
   * Get staking positions for wallet
   */
  public getStakingPositions(walletCID: string): StakingPosition[] {
    this.initialize();
    return Array.from(this.activePositions.values())
      .filter(position => position.walletCID === walletCID);
  }

  /**
   * Get all active positions
   */
  public getAllActivePositions(): StakingPosition[] {
    this.initialize();
    return Array.from(this.activePositions.values())
      .filter(position => position.status === 'active');
  }

  /**
   * Calculate current rewards for position
   */
  public calculateCurrentRewards(positionId: string): {
    earned: number;
    pending: number;
    canWithdraw: boolean;
    timeRemaining: number;
    penaltyAmount?: number;
  } {
    const position = this.activePositions.get(positionId);
    if (!position) {
      throw new Error('Staking position not found');
    }

    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - position.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, position.lockPeriod - daysSinceStart);
    
    const dailyReward = position.projectedReward / position.lockPeriod;
    const earned = Math.min(dailyReward * daysSinceStart, position.projectedReward);
    const pending = Math.max(0, position.projectedReward - earned);
    
    const canWithdraw = daysRemaining === 0;
    const penaltyAmount = canWithdraw ? undefined : earned * 0.25; // 25% early withdrawal penalty

    return {
      earned,
      pending,
      canWithdraw,
      timeRemaining: daysRemaining,
      penaltyAmount
    };
  }

  /**
   * Withdraw from staking position
   */
  public async withdrawStaking(
    positionId: string,
    forceEarlyWithdraw: boolean = false
  ): Promise<{
    principal: number;
    rewards: number;
    penalty: number;
    total: number;
  }> {
    const position = this.activePositions.get(positionId);
    if (!position) {
      throw new Error('Staking position not found');
    }

    const rewardInfo = this.calculateCurrentRewards(positionId);
    
    let principal = position.amount;
    let rewards = rewardInfo.earned;
    let penalty = 0;

    // Apply early withdrawal penalty if needed
    if (!rewardInfo.canWithdraw && forceEarlyWithdraw) {
      penalty = rewardInfo.penaltyAmount || 0;
      rewards -= penalty;
    } else if (!rewardInfo.canWithdraw && !forceEarlyWithdraw) {
      throw new Error('Position is still locked. Use forceEarlyWithdraw to accept penalty.');
    }

    const total = principal + rewards;

    // Update position status
    position.status = forceEarlyWithdraw ? 'penalized' : 'withdrawn';
    this.saveStakingPositions();

    // Record reward
    const reward: StakingReward = {
      positionId,
      amount: rewards,
      type: forceEarlyWithdraw ? 'early_unlock_penalty' : 'yield',
      timestamp: new Date(),
      blockHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };
    this.stakingRewards.push(reward);

    // Emit withdrawal event
    this.emitStakingEvent('position_withdrawn', position);

    console.log(`🏦 Staking withdrawal: ${total} TP (${principal} principal + ${rewards} rewards - ${penalty} penalty)`);

    return { principal, rewards, penalty, total };
  }

  /**
   * Get staking statistics
   */
  public getStakingStatistics(): {
    totalStaked: number;
    totalPositions: number;
    averageYield: number;
    totalRewardsDistributed: number;
    activeStakers: number;
    tierDistribution: { [tier: string]: number };
  } {
    this.initialize();
    const activePositions = this.getAllActivePositions();
    
    const totalStaked = activePositions.reduce((sum, pos) => sum + pos.amount, 0);
    const totalPositions = activePositions.length;
    const averageYield = activePositions.length > 0 
      ? activePositions.reduce((sum, pos) => sum + pos.currentYield, 0) / totalPositions
      : 0;
    
    const totalRewardsDistributed = this.stakingRewards
      .filter(r => r.type === 'yield' || r.type === 'bonus')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const activeStakers = new Set(activePositions.map(pos => pos.walletCID)).size;
    
    const tierDistribution = activePositions.reduce((acc, pos) => {
      acc[pos.tier] = (acc[pos.tier] || 0) + 1;
      return acc;
    }, {} as { [tier: string]: number });

    return {
      totalStaked,
      totalPositions,
      averageYield,
      totalRewardsDistributed,
      activeStakers,
      tierDistribution
    };
  }

  /**
   * Emit staking event
   */
  private emitStakingEvent(eventType: string, position: StakingPosition): void {
    const customEvent = new CustomEvent('StakingEvent', {
      detail: {
        type: eventType,
        position,
        timestamp: new Date()
      }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(customEvent);
    }
    
    console.log(`📡 StakingEvent emitted: ${eventType} for position ${position.id}`);
  }

  /**
   * Load staking positions from localStorage
   */
  private loadStakingPositions(): void {
    try {
      const stored = localStorage.getItem('TruthPointStakingPositions');
      if (stored) {
        const positions = JSON.parse(stored);
        positions.forEach((pos: any) => {
          // Convert date strings back to Date objects
          pos.startDate = new Date(pos.startDate);
          pos.endDate = new Date(pos.endDate);
          pos.lastYieldPayout = new Date(pos.lastYieldPayout);
          this.activePositions.set(pos.id, pos);
        });
        console.log(`📋 Loaded ${this.activePositions.size} staking positions`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load staking positions:', error);
    }
  }

  /**
   * Save staking positions to localStorage
   */
  private saveStakingPositions(): void {
    try {
      const positions = Array.from(this.activePositions.values());
      localStorage.setItem('TruthPointStakingPositions', JSON.stringify(positions));
    } catch (error) {
      console.warn('⚠️ Failed to save staking positions:', error);
    }
  }

  /**
   * Export staking data for audit
   */
  public exportStakingData(): {
    timestamp: Date;
    positions: StakingPosition[];
    rewards: StakingReward[];
    statistics: ReturnType<typeof TruthPointStakingEngine.prototype.getStakingStatistics>;
    tiers: StakingTier[];
  } {
    return {
      timestamp: new Date(),
      positions: Array.from(this.activePositions.values()),
      rewards: [...this.stakingRewards],
      statistics: this.getStakingStatistics(),
      tiers: this.getStakingTiers()
    };
  }
}