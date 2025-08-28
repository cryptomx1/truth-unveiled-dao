// TPRewardEngine.ts - Truth Points reward calculation and distribution engine
// Stub for test reward injection as requested in Phase 0-X Step 2

export interface TPReward {
  userId: string;
  amount: number;
  source: 'referral_bonus' | 'civic_action' | 'tier_advancement' | 'streak_bonus' | 'test_injection';
  multiplier: number;
  baseAmount: number;
  description: string;
  timestamp: string;
  processed: boolean;
}

export interface RewardMultiplier {
  type: 'referral' | 'tier' | 'streak' | 'engagement';
  value: number;
  description: string;
  validUntil?: string;
}

export class TPRewardEngine {
  private static readonly REWARDS_STORAGE_KEY = 'tp_rewards_queue';
  private static readonly MULTIPLIERS_STORAGE_KEY = 'tp_active_multipliers';

  // Base reward amounts
  private static readonly BASE_REWARDS = {
    referral_signup: 50,
    civic_vote: 10,
    proposal_creation: 25,
    deck_completion: 15,
    tier_advancement: 100,
    daily_streak: 5
  };

  // Test reward injection for development
  static injectTestReward(userId: string, amount: number, description: string = 'Test TP injection'): TPReward {
    const reward: TPReward = {
      userId,
      amount,
      source: 'test_injection',
      multiplier: 1.0,
      baseAmount: amount,
      description,
      timestamp: new Date().toISOString(),
      processed: false
    };

    this.queueReward(reward);
    console.log('💉 TPRewardEngine: Test reward injected', reward);
    
    return reward;
  }

  // Queue reward for processing
  static queueReward(reward: TPReward): void {
    const queue = this.getRewardQueue();
    queue.push(reward);
    localStorage.setItem(this.REWARDS_STORAGE_KEY, JSON.stringify(queue));
  }

  // Calculate reward with multipliers
  static calculateReward(
    userId: string, 
    baseAmount: number, 
    source: TPReward['source'],
    description: string
  ): TPReward {
    const multipliers = this.getActiveMultipliers(userId);
    const totalMultiplier = multipliers.reduce((total, m) => total * m.value, 1.0);
    const finalAmount = Math.floor(baseAmount * totalMultiplier);

    const reward: TPReward = {
      userId,
      amount: finalAmount,
      source,
      multiplier: totalMultiplier,
      baseAmount,
      description,
      timestamp: new Date().toISOString(),
      processed: false
    };

    this.queueReward(reward);
    console.log('💰 TPRewardEngine: Reward calculated', reward);
    
    return reward;
  }

  // Process referral bonus
  static processReferralBonus(userId: string, referrerCid: string): TPReward {
    return this.calculateReward(
      userId,
      this.BASE_REWARDS.referral_signup,
      'referral_bonus',
      `Referral bonus from ${referrerCid}`
    );
  }

  // Process civic action reward
  static processCivicActionReward(userId: string, actionType: string): TPReward {
    const baseAmount = this.BASE_REWARDS.civic_vote; // Default to vote reward
    return this.calculateReward(
      userId,
      baseAmount,
      'civic_action',
      `Civic action: ${actionType}`
    );
  }

  // Get active multipliers for user
  static getActiveMultipliers(userId: string): RewardMultiplier[] {
    try {
      const stored = localStorage.getItem(this.MULTIPLIERS_STORAGE_KEY);
      const allMultipliers: Record<string, RewardMultiplier[]> = stored ? JSON.parse(stored) : {};
      const userMultipliers = allMultipliers[userId] || [];
      
      // Filter out expired multipliers
      const now = new Date();
      return userMultipliers.filter(m => !m.validUntil || new Date(m.validUntil) > now);
    } catch (error) {
      console.error('❌ Failed to get active multipliers:', error);
      return [];
    }
  }

  // Add multiplier for user
  static addMultiplier(userId: string, multiplier: RewardMultiplier): void {
    try {
      const stored = localStorage.getItem(this.MULTIPLIERS_STORAGE_KEY);
      const allMultipliers: Record<string, RewardMultiplier[]> = stored ? JSON.parse(stored) : {};
      
      if (!allMultipliers[userId]) {
        allMultipliers[userId] = [];
      }
      
      allMultipliers[userId].push(multiplier);
      localStorage.setItem(this.MULTIPLIERS_STORAGE_KEY, JSON.stringify(allMultipliers));
      
      console.log('📈 TPRewardEngine: Multiplier added', { userId, multiplier });
    } catch (error) {
      console.error('❌ Failed to add multiplier:', error);
    }
  }

  // Get reward queue
  static getRewardQueue(): TPReward[] {
    try {
      const stored = localStorage.getItem(this.REWARDS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get reward queue:', error);
      return [];
    }
  }

  // Get rewards for user
  static getUserRewards(userId: string): TPReward[] {
    return this.getRewardQueue().filter(r => r.userId === userId);
  }

  // Mark rewards as processed
  static markRewardsProcessed(rewardIds: string[]): void {
    const queue = this.getRewardQueue();
    queue.forEach(reward => {
      if (rewardIds.includes(reward.timestamp)) {
        reward.processed = true;
      }
    });
    localStorage.setItem(this.REWARDS_STORAGE_KEY, JSON.stringify(queue));
  }

  // Calculate total pending TP for user
  static getPendingTPTotal(userId: string): number {
    const userRewards = this.getUserRewards(userId).filter(r => !r.processed);
    return userRewards.reduce((total, r) => total + r.amount, 0);
  }

  // Process all pending rewards for user
  static processAllPendingRewards(userId: string): { totalTP: number, rewardsCount: number } {
    const userRewards = this.getUserRewards(userId).filter(r => !r.processed);
    const totalTP = userRewards.reduce((total, r) => total + r.amount, 0);
    
    // Mark as processed
    const rewardIds = userRewards.map(r => r.timestamp);
    this.markRewardsProcessed(rewardIds);
    
    console.log('⚡ TPRewardEngine: Processed pending rewards', { userId, totalTP, rewardsCount: userRewards.length });
    
    return { totalTP, rewardsCount: userRewards.length };
  }

  // Export reward data
  static exportRewardData(): {
    rewards: TPReward[],
    multipliers: Record<string, RewardMultiplier[]>,
    summary: {
      totalRewards: number,
      totalTPDistributed: number,
      pendingRewards: number
    },
    exportedAt: string
  } {
    const rewards = this.getRewardQueue();
    const stored = localStorage.getItem(this.MULTIPLIERS_STORAGE_KEY);
    const multipliers = stored ? JSON.parse(stored) : {};
    
    const processedRewards = rewards.filter(r => r.processed);
    const pendingRewards = rewards.filter(r => !r.processed);
    
    return {
      rewards,
      multipliers,
      summary: {
        totalRewards: rewards.length,
        totalTPDistributed: processedRewards.reduce((sum, r) => sum + r.amount, 0),
        pendingRewards: pendingRewards.length
      },
      exportedAt: new Date().toISOString()
    };
  }

  // Clear all reward data
  static clearRewardData(): void {
    localStorage.removeItem(this.REWARDS_STORAGE_KEY);
    localStorage.removeItem(this.MULTIPLIERS_STORAGE_KEY);
    console.log('🗑️ TPRewardEngine: All reward data cleared');
  }
}