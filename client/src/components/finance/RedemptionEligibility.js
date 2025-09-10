/**
 * RedemptionEligibility.ts
 * Phase X-FINANCE Step 4 - Redemption Eligibility Checker
 * Authority: Commander Mark via JASMY Relay System
 */
import { TPRedemptionLedger } from './TPRedemptionLedger';
export class RedemptionEligibility {
    static instance = null;
    redemptionLedger;
    // Tier hierarchy for eligibility checks
    tierHierarchy = {
        'Visitor': 0,
        'Citizen': 1,
        'Contributor': 2,
        'Moderator': 3,
        'Governor': 4,
        'Commander': 5
    };
    // Weekly redemption limits by tier
    weeklyLimits = {
        'Visitor': 0,
        'Citizen': 1000, // 1,000 TP per week
        'Contributor': 2500, // 2,500 TP per week
        'Moderator': 5000, // 5,000 TP per week
        'Governor': 10000, // 10,000 TP per week
        'Commander': 25000 // 25,000 TP per week
    };
    // Minimum tier requirements for each redemption type
    tierRequirements = {
        'civic_voucher': 'Citizen',
        'governance_credit': 'Contributor',
        'fusion_token': 'Moderator'
    };
    // Tier-based discounts (percentage off)
    tierDiscounts = {
        'Citizen': 0, // No discount
        'Contributor': 5, // 5% off
        'Moderator': 10, // 10% off
        'Governor': 15, // 15% off
        'Commander': 20 // 20% off
    };
    constructor() {
        this.redemptionLedger = TPRedemptionLedger.getInstance();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!RedemptionEligibility.instance) {
            RedemptionEligibility.instance = new RedemptionEligibility();
        }
        return RedemptionEligibility.instance;
    }
    /**
     * Check overall eligibility for redemptions
     */
    async checkEligibility(walletCID, userTier, stakingDuration) {
        // Mock TP balance - in production, this would fetch from wallet/treasury
        const availableTP = this.getMockTPBalance(walletCID, userTier);
        // Get weekly usage
        const weeklyUsed = this.redemptionLedger.getWeeklyRedemptionTotal(walletCID);
        const weeklyLimit = this.weeklyLimits[userTier] || 0;
        const weeklyRemaining = Math.max(0, weeklyLimit - weeklyUsed);
        // Check tier requirements
        const tierLevel = this.tierHierarchy[userTier] || 0;
        const minTierLevel = this.tierHierarchy['Citizen'];
        const tierRequirements = {
            current: userTier,
            required: 'Citizen',
            meets: tierLevel >= minTierLevel
        };
        // Basic eligibility check
        const eligible = tierRequirements.meets && weeklyRemaining > 0 && availableTP > 0;
        const result = {
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
            }
            else if (weeklyRemaining <= 0) {
                result.reason = 'Weekly redemption limit reached';
            }
            else if (availableTP <= 0) {
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
    async validateRedemption(walletCID, type, tpCost, userTier) {
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
        const requiredTierLevel = this.tierHierarchy[requiredTier];
        const currentTierLevel = this.tierHierarchy[userTier] || 0;
        if (currentTierLevel < requiredTierLevel) {
            return {
                eligible: false,
                reason: `${type} requires minimum tier: ${requiredTier}`
            };
        }
        // Calculate tier-adjusted cost
        const discount = this.tierDiscounts[userTier] || 0;
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
    checkRedemptionSpecificLimits(walletCID, type, cost) {
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
    getTierAdjustedPrice(baseCost, userTier) {
        const discount = this.tierDiscounts[userTier] || 0;
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
    getRedemptionLimits(userTier) {
        const weeklyLimit = this.weeklyLimits[userTier] || 0;
        const tierDiscount = this.tierDiscounts[userTier] || 0;
        const currentTierLevel = this.tierHierarchy[userTier] || 0;
        const availableTypes = Object.keys(this.tierRequirements)
            .filter(type => {
            const requiredTier = this.tierRequirements[type];
            const requiredLevel = this.tierHierarchy[requiredTier];
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
    getMockTPBalance(walletCID, userTier) {
        // Simulate different balance ranges based on tier
        const baseBalances = {
            'Visitor': 0,
            'Citizen': 500 + Math.floor(Math.random() * 1000),
            'Contributor': 1500 + Math.floor(Math.random() * 2500),
            'Moderator': 3000 + Math.floor(Math.random() * 5000),
            'Governor': 7500 + Math.floor(Math.random() * 10000),
            'Commander': 15000 + Math.floor(Math.random() * 20000)
        };
        return baseBalances[userTier] || 0;
    }
    /**
     * Export eligibility data for audit
     */
    exportEligibilityData(walletCID, userTier) {
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
