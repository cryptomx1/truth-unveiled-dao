/**
 * RedemptionEligibility.ts
 * Phase X-FINANCE Step 4 - Redemption Eligibility Checker
 * Authority: Commander Mark via JASMY Relay System
 */

import { TPRedemptionLedger, type RedemptionType } from './TPRedemptionLedger';

export interface EligibilityCheck {
  eligible: boolean;
  reason?: string;
  availableTP: number;
  weeklyLimit: number;
  weeklyUsed: number;
  weeklyRemaining: number;
  tierRequirements: {
    current: string;
    required: string;
    meets: boolean;
  };
  stakingRequirements?: {
    minimumStakeDuration: number;
    currentStakeDuration: number;
    meets: boolean;
  };
  pledgeCap?: {
    maxPerWeek: number;
    currentWeek: number;
    remaining: number;
  };
}

export interface RedemptionValidation {
  eligible: boolean;
  reason?: string;
  costBreakdown?: {
    baseCost: number;
    tierDiscount: number;
    finalCost: number;
  };
}

export class RedemptionEligibility {
  private static instance: RedemptionEligibility | null = null;
  private redemptionLedger: TPRedemptionLedger;

  // Tier hierarchy for eligibility checks
  private readonly tierHierarchy = {
    'Visitor': 0,
    'Citizen': 1,
    'Contributor': 2,
    'Moderator': 3,
    'Governor': 4,
    'Commander': 5
  };

  // Weekly redemption limits by tier
  private readonly weeklyLimits = {
    'Visitor': 0,
    'Citizen': 1000,     // 1,000 TP per week
    'Contributor': 2500,  // 2,500 TP per week
    'Moderator': 5000,    // 5,000 TP per week
    'Governor': 10000,    // 10,000 TP per week
    'Commander': 25000    // 25,000 TP per week
  };

  // Minimum tier requirements for each redemption type
  private readonly tierRequirements: { [key in RedemptionType]: string } = {
    'civic_voucher': 'Citizen',
    'governance_credit': 'Contributor',
    'fusion_token': 'Moderator'
  };

  // Tier-based discounts (percentage off)
  private readonly tierDiscounts = {
    'Citizen': 0,      // No discount
    'Contributor': 5,  // 5% off
    'Moderator': 10,   // 10% off
    'Governor': 15,    // 15% off
    'Commander': 20    // 20% off
  };

  private constructor() {
    this.redemptionLedger = TPRedemptionLedger.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RedemptionEligibility {
    if (!RedemptionEligibility.instance) {
      RedemptionEligibility.instance = new RedemptionEligibility();
    }
    return RedemptionEligibility.instance;
  }

  /**
   * Check overall eligibility for redemptions
   */
  public async checkEligibility(
    walletCID: string, 
    userTier: string,
    stakingDuration?: number
  ): Promise<EligibilityCheck> {
    
    // Mock TP balance - in production, this would fetch from wallet/treasury
    const availableTP = this.getMockTPBalance(walletCID, userTier);
    
    // Get weekly usage
    const weeklyUsed = this.redemptionLedger.getWeeklyRedemptionTotal(walletCID);
    const weeklyLimit = this.weeklyLimits[userTier as keyof typeof this.weeklyLimits] || 0;
    const weeklyRemaining = Math.max(0, weeklyLimit - weeklyUsed);

    // Check tier requirements
    const tierLevel = this.tierHierarchy[userTier as keyof typeof this.tierHierarchy] || 0;
    const minTierLevel = this.tierHierarchy['Citizen'];
    const tierRequirements = {
      current: userTier,
      required: 'Citizen',
      meets: tierLevel >= minTierLevel
    };

    // Basic eligibility check
    const eligible = tierRequirements.meets && weeklyRemaining > 0 && availableTP > 0;

    const result: EligibilityCheck = {
      eligible,
      availableTP,
      weeklyLimit,
      weeklyUsed,
      weeklyRemaining,
      tierRequirements
    };

    if (!eligible) {
      if (!tierRequirements.meets) {
        result.reason = `Minimum tier required: ${tierRequirements.required}`;
      } else if (weeklyRemaining <= 0) {
        result.reason = 'Weekly redemption limit reached';
      } else if (availableTP <= 0) {
        result.reason = 'Insufficient TruthPoints';
      }
    }

    // Add staking requirements if provided
    if (stakingDuration !== undefined) {
      const minStakingDuration = 7; // 7 days minimum
      result.stakingRequirements = {
        minimumStakeDuration: minStakingDuration,
        currentStakeDuration: stakingDuration,
        meets: stakingDuration >= minStakingDuration
      };
      
      if (!result.stakingRequirements.meets) {
        result.eligible = false;
        result.reason = `Minimum staking duration: ${minStakingDuration} days`;
      }
    }

    console.log(`🔍 Eligibility check for ${userTier}: ${eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
    console.log(`💰 Available: ${availableTP} TP, Weekly: ${weeklyUsed}/${weeklyLimit}`);

    return result;
  }

  /**
   * Validate specific redemption
   */
  public async validateRedemption(
    walletCID: string,
    type: RedemptionType,
    tpCost: number,
    userTier: string
  ): Promise<RedemptionValidation> {
    
    // Check general eligibility first
    const eligibility = await this.checkEligibility(walletCID, userTier);
    
    if (!eligibility.eligible) {
      return {
        eligible: false,
        reason: eligibility.reason
      };
    }

    // Check tier requirements for this specific redemption type
    const requiredTier = this.tierRequirements[type];
    const requiredTierLevel = this.tierHierarchy[requiredTier as keyof typeof this.tierHierarchy];
    const currentTierLevel = this.tierHierarchy[userTier as keyof typeof this.tierHierarchy] || 0;

    if (currentTierLevel < requiredTierLevel) {
      return {
        eligible: false,
        reason: `${type} requires minimum tier: ${requiredTier}`
      };
    }

    // Calculate tier-adjusted cost
    const discount = this.tierDiscounts[userTier as keyof typeof this.tierDiscounts] || 0;
    const tierDiscount = Math.floor(tpCost * (discount / 100));
    const finalCost = tpCost - tierDiscount;

    // Check if user can afford final cost
    if (finalCost > eligibility.availableTP) {
      return {
        eligible: false,
        reason: `Insufficient TruthPoints. Required: ${finalCost}, Available: ${eligibility.availableTP}`
      };
    }

    // Check weekly limit with this redemption
    if (eligibility.weeklyUsed + finalCost > eligibility.weeklyLimit) {
      return {
        eligible: false,
        reason: 'Redemption would exceed weekly limit'
      };
    }

    // Check redemption-specific limits
    const specificCheck = this.checkRedemptionSpecificLimits(walletCID, type, finalCost);
    if (!specificCheck.eligible) {
      return specificCheck;
    }

    return {
      eligible: true,
      costBreakdown: {
        baseCost: tpCost,
        tierDiscount,
        finalCost
      }
    };
  }

  /**
   * Check redemption-specific limits
   */
  private checkRedemptionSpecificLimits(
    walletCID: string,
    type: RedemptionType,
    cost: number
  ): RedemptionValidation {
    
    const activeItems = this.redemptionLedger.getActiveItems(walletCID, type);
    
    // Type-specific limits
    switch (type) {
      case 'civic_voucher':
        // Max 20 active civic vouchers
        if (activeItems.length >= 20) {
          return {
            eligible: false,
            reason: 'Maximum active civic vouchers reached (20)'
          };
        }
        break;
        
      case 'governance_credit':
        // Max 50 active governance credits
        if (activeItems.length >= 50) {
          return {
            eligible: false,
            reason: 'Maximum active governance credits reached (50)'
          };
        }
        break;
        
      case 'fusion_token':
        // Max 8 fusion tokens (one per pillar)
        if (activeItems.length >= 8) {
          return {
            eligible: false,
            reason: 'Maximum fusion tokens reached (8 pillars)'
          };
        }
        break;
    }

    return { eligible: true };
  }

  /**
   * Get tier-adjusted pricing
   */
  public getTierAdjustedPrice(baseCost: number, userTier: string): {
    baseCost: number;
    discount: number;
    discountAmount: number;
    finalCost: number;
  } {
    const discount = this.tierDiscounts[userTier as keyof typeof this.tierDiscounts] || 0;
    const discountAmount = Math.floor(baseCost * (discount / 100));
    const finalCost = baseCost - discountAmount;

    return {
      baseCost,
      discount,
      discountAmount,
      finalCost
    };
  }

  /**
   * Get redemption limits for tier
   */
  public getRedemptionLimits(userTier: string): {
    weeklyLimit: number;
    tierDiscount: number;
    availableTypes: RedemptionType[];
    minimumTierForTypes: { [key in RedemptionType]: string };
  } {
    const weeklyLimit = this.weeklyLimits[userTier as keyof typeof this.weeklyLimits] || 0;
    const tierDiscount = this.tierDiscounts[userTier as keyof typeof this.tierDiscounts] || 0;
    const currentTierLevel = this.tierHierarchy[userTier as keyof typeof this.tierHierarchy] || 0;
    
    const availableTypes = (Object.keys(this.tierRequirements) as RedemptionType[])
      .filter(type => {
        const requiredTier = this.tierRequirements[type];
        const requiredLevel = this.tierHierarchy[requiredTier as keyof typeof this.tierHierarchy];
        return currentTierLevel >= requiredLevel;
      });

    return {
      weeklyLimit,
      tierDiscount,
      availableTypes,
      minimumTierForTypes: this.tierRequirements
    };
  }

  /**
   * Mock TP balance - replace with real wallet integration
   */
  private getMockTPBalance(walletCID: string, userTier: string): number {
    // Simulate different balance ranges based on tier
    const baseBalances = {
      'Visitor': 0,
      'Citizen': 500 + Math.floor(Math.random() * 1000),
      'Contributor': 1500 + Math.floor(Math.random() * 2500),
      'Moderator': 3000 + Math.floor(Math.random() * 5000),
      'Governor': 7500 + Math.floor(Math.random() * 10000),
      'Commander': 15000 + Math.floor(Math.random() * 20000)
    };

    return baseBalances[userTier as keyof typeof baseBalances] || 0;
  }

  /**
   * Export eligibility data for audit
   */
  public exportEligibilityData(walletCID: string, userTier: string): {
    timestamp: Date;
    walletCID: string;
    tier: string;
    eligibility: any;
    limits: any;
    weeklyUsage: number;
    activeRedemptions: any[];
  } {
    return {
      timestamp: new Date(),
      walletCID,
      tier: userTier,
      eligibility: this.checkEligibility(walletCID, userTier),
      limits: this.getRedemptionLimits(userTier),
      weeklyUsage: this.redemptionLedger.getWeeklyRedemptionTotal(walletCID),
      activeRedemptions: this.redemptionLedger.getActiveItems(walletCID)
    };
  }
}