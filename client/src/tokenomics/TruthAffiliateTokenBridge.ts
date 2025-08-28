// TruthAffiliateTokenBridge.ts - Token bridge for referral rewards and affiliate tracking
// Integrates with MissionReferrerOverlay.tsx and CivicMissionLedger.ts

export interface AffiliateReward {
  referrerCid: string;
  referredCid: string;
  rewardType: 'signup_bonus' | 'action_commission' | 'tier_advancement' | 'truth_coin_share';
  amount: number;
  currency: 'TP' | 'CC' | 'TruthCoin';
  triggeredBy: string;
  timestamp: string;
  status: 'pending' | 'processed' | 'failed';
  transactionHash?: string;
}

export interface AffiliateTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  minReferrals: number;
  bonusMultiplier: number;
  unlockRewards: number;
  requirements: string[];
}

export interface AffiliateProfile {
  cid: string;
  alias: string;
  tier: AffiliateTier['tier'];
  totalReferrals: number;
  successfulReferrals: number;
  totalRewardsEarned: number;
  truthCoinsFromReferrals: number;
  joinedAt: string;
  lastActivity: string;
}

export class TruthAffiliateTokenBridge {
  private static readonly AFFILIATE_STORAGE_KEY = 'truth_affiliate_data';
  private static readonly REWARDS_STORAGE_KEY = 'truth_affiliate_rewards';
  private static readonly SYNC_STORAGE_KEY = 'truth_affiliate_sync';

  // Affiliate tier definitions
  private static readonly AFFILIATE_TIERS: Record<AffiliateTier['tier'], AffiliateTier> = {
    bronze: {
      tier: 'bronze',
      minReferrals: 1,
      bonusMultiplier: 1.1,
      unlockRewards: 25,
      requirements: ['Complete 1 successful referral']
    },
    silver: {
      tier: 'silver',
      minReferrals: 5,
      bonusMultiplier: 1.25,
      unlockRewards: 75,
      requirements: ['Complete 5 successful referrals', 'Maintain 60% conversion rate']
    },
    gold: {
      tier: 'gold',
      minReferrals: 15,
      bonusMultiplier: 1.5,
      unlockRewards: 200,
      requirements: ['Complete 15 successful referrals', 'Maintain 70% conversion rate', 'Generate 500+ TP through referrals']
    },
    platinum: {
      tier: 'platinum',
      minReferrals: 50,
      bonusMultiplier: 2.0,
      unlockRewards: 500,
      requirements: ['Complete 50 successful referrals', 'Maintain 80% conversion rate', 'Generate 2000+ TP through referrals', 'Achieve Consensus Architect tier']
    }
  };

  // Initialize affiliate profile for new referrer
  static initializeAffiliate(cid: string, alias: string): AffiliateProfile {
    const profile: AffiliateProfile = {
      cid,
      alias,
      tier: 'bronze',
      totalReferrals: 0,
      successfulReferrals: 0,
      totalRewardsEarned: 0,
      truthCoinsFromReferrals: 0,
      joinedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    this.saveAffiliateProfile(profile);
    console.log('🔗 TruthAffiliateTokenBridge: Affiliate initialized', profile);
    
    return profile;
  }

  // Process referral signup bonus
  static processSignupBonus(referrerCid: string, referredCid: string): AffiliateReward {
    const reward: AffiliateReward = {
      referrerCid,
      referredCid,
      rewardType: 'signup_bonus',
      amount: 50, // 50 TP signup bonus
      currency: 'TP',
      triggeredBy: 'mission_onboarding_complete',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.saveReward(reward);
    this.updateAffiliateStats(referrerCid, 'signup');
    
    console.log('💰 TruthAffiliateTokenBridge: Signup bonus processed', reward);
    
    return reward;
  }

  // Process action commission (when referred user takes civic actions)
  static processActionCommission(referrerCid: string, referredCid: string, actionValue: number): AffiliateReward {
    const commissionRate = 0.15; // 15% commission
    const commissionAmount = Math.floor(actionValue * commissionRate);
    
    const reward: AffiliateReward = {
      referrerCid,
      referredCid,
      rewardType: 'action_commission',
      amount: commissionAmount,
      currency: 'TP',
      triggeredBy: 'referred_user_civic_action',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.saveReward(reward);
    this.updateAffiliateStats(referrerCid, 'commission', commissionAmount);
    
    console.log('💼 TruthAffiliateTokenBridge: Action commission processed', reward);
    
    return reward;
  }

  // Process tier advancement rewards
  static processTierAdvancement(referrerCid: string, newTier: AffiliateTier['tier']): AffiliateReward | null {
    const tierConfig = this.AFFILIATE_TIERS[newTier];
    
    if (!tierConfig) {
      console.error('❌ Invalid affiliate tier:', newTier);
      return null;
    }

    const reward: AffiliateReward = {
      referrerCid,
      referredCid: 'system',
      rewardType: 'tier_advancement',
      amount: tierConfig.unlockRewards,
      currency: 'TP',
      triggeredBy: `tier_advancement_${newTier}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.saveReward(reward);
    
    // Update affiliate profile tier
    const profile = this.getAffiliateProfile(referrerCid);
    if (profile) {
      profile.tier = newTier;
      profile.lastActivity = new Date().toISOString();
      this.saveAffiliateProfile(profile);
    }
    
    console.log('🎖️ TruthAffiliateTokenBridge: Tier advancement processed', reward);
    
    return reward;
  }

  // Get affiliate profile
  static getAffiliateProfile(cid: string): AffiliateProfile | null {
    try {
      const profiles = this.getAllAffiliateProfiles();
      return profiles.find(p => p.cid === cid) || null;
    } catch (error) {
      console.error('❌ Failed to get affiliate profile:', error);
      return null;
    }
  }

  // Get all affiliate profiles
  static getAllAffiliateProfiles(): AffiliateProfile[] {
    try {
      const stored = localStorage.getItem(this.AFFILIATE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to parse affiliate profiles:', error);
      return [];
    }
  }

  // Save affiliate profile
  private static saveAffiliateProfile(profile: AffiliateProfile): void {
    const profiles = this.getAllAffiliateProfiles();
    const existingIndex = profiles.findIndex(p => p.cid === profile.cid);
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(this.AFFILIATE_STORAGE_KEY, JSON.stringify(profiles));
  }

  // Get all rewards for a referrer
  static getRewardsForReferrer(referrerCid: string): AffiliateReward[] {
    const allRewards = this.getAllRewards();
    return allRewards.filter(r => r.referrerCid === referrerCid);
  }

  // Get all affiliate rewards
  static getAllRewards(): AffiliateReward[] {
    try {
      const stored = localStorage.getItem(this.REWARDS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to parse affiliate rewards:', error);
      return [];
    }
  }

  // Save reward
  private static saveReward(reward: AffiliateReward): void {
    const rewards = this.getAllRewards();
    rewards.push(reward);
    localStorage.setItem(this.REWARDS_STORAGE_KEY, JSON.stringify(rewards));
  }

  // Update affiliate statistics
  private static updateAffiliateStats(referrerCid: string, actionType: 'signup' | 'commission', amount: number = 0): void {
    const profile = this.getAffiliateProfile(referrerCid);
    
    if (!profile) {
      console.error('❌ Affiliate profile not found for CID:', referrerCid);
      return;
    }

    if (actionType === 'signup') {
      profile.totalReferrals += 1;
      profile.successfulReferrals += 1;
    }
    
    profile.totalRewardsEarned += amount;
    profile.lastActivity = new Date().toISOString();
    
    // Check for tier advancement
    const newTier = this.calculateTierAdvancement(profile);
    if (newTier !== profile.tier) {
      this.processTierAdvancement(referrerCid, newTier);
    }
    
    this.saveAffiliateProfile(profile);
  }

  // Calculate tier advancement
  private static calculateTierAdvancement(profile: AffiliateProfile): AffiliateTier['tier'] {
    const conversionRate = profile.totalReferrals > 0 ? profile.successfulReferrals / profile.totalReferrals : 0;
    
    // Check platinum tier
    if (profile.successfulReferrals >= 50 && conversionRate >= 0.8 && profile.totalRewardsEarned >= 2000) {
      return 'platinum';
    }
    
    // Check gold tier
    if (profile.successfulReferrals >= 15 && conversionRate >= 0.7 && profile.totalRewardsEarned >= 500) {
      return 'gold';
    }
    
    // Check silver tier
    if (profile.successfulReferrals >= 5 && conversionRate >= 0.6) {
      return 'silver';
    }
    
    // Default to bronze
    return 'bronze';
  }

  // Sync pending affiliate data (called from CivicMissionLedger)
  static syncPendingAffiliateData(): void {
    try {
      const pendingSync = localStorage.getItem('pending_affiliate_sync');
      
      if (pendingSync) {
        const syncData = JSON.parse(pendingSync);
        
        // Process pending referral
        if (syncData.referrerCid && syncData.status === 'pending_onboard') {
          const existingProfile = this.getAffiliateProfile(syncData.referrerCid);
          
          if (!existingProfile) {
            // Initialize new affiliate if not exists
            this.initializeAffiliate(syncData.referrerCid, `Affiliate_${syncData.referrerCid.slice(-6)}`);
          }
          
          // Mark sync as processed
          localStorage.setItem('pending_affiliate_sync', JSON.stringify({
            ...syncData,
            status: 'synced',
            syncedAt: new Date().toISOString()
          }));
          
          console.log('🔄 TruthAffiliateTokenBridge: Pending affiliate data synced', syncData);
        }
      }
    } catch (error) {
      console.error('❌ Failed to sync pending affiliate data:', error);
    }
  }

  // Export affiliate data for analysis
  static exportAffiliateData(): {
    profiles: AffiliateProfile[],
    rewards: AffiliateReward[],
    summary: {
      totalAffiliates: number,
      totalRewards: number,
      totalReferrals: number,
      averageConversionRate: number
    },
    exportedAt: string
  } {
    const profiles = this.getAllAffiliateProfiles();
    const rewards = this.getAllRewards();
    
    const totalReferrals = profiles.reduce((sum, p) => sum + p.totalReferrals, 0);
    const totalSuccessful = profiles.reduce((sum, p) => sum + p.successfulReferrals, 0);
    
    return {
      profiles,
      rewards,
      summary: {
        totalAffiliates: profiles.length,
        totalRewards: rewards.reduce((sum, r) => sum + r.amount, 0),
        totalReferrals,
        averageConversionRate: totalReferrals > 0 ? totalSuccessful / totalReferrals : 0
      },
      exportedAt: new Date().toISOString()
    };
  }

  // Clear all affiliate data (use with caution)
  static clearAffiliateData(): void {
    localStorage.removeItem(this.AFFILIATE_STORAGE_KEY);
    localStorage.removeItem(this.REWARDS_STORAGE_KEY);
    localStorage.removeItem(this.SYNC_STORAGE_KEY);
    localStorage.removeItem('pending_affiliate_sync');
    console.log('🗑️ TruthAffiliateTokenBridge: All affiliate data cleared');
  }
}