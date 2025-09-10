/**
 * RewardTriggerMatrix.ts
 * Phase X-FINANCE Step 3 - Automated Civic Recognition System
 * Authority: Commander Mark via JASMY Relay System
 */
export class RewardTriggerMatrix {
    static triggers = new Map();
    static initialized = false;
    /**
     * Initialize the reward trigger matrix with civic triggers
     */
    static initialize() {
        if (this.initialized)
            return;
        // Seed 5 sample triggers as specified
        const seedTriggers = [
            {
                triggerId: 'MUNICIPAL_PARTICIPATION',
                actionType: 'pilot',
                TPReward: 250,
                conditions: {
                    zkpRequired: false,
                    didRequired: true,
                    minTier: 'Citizen',
                    additionalCriteria: 'Complete municipal onboarding flow'
                },
                description: 'Participate in municipal pilot program',
                category: 'municipal',
                isActive: true,
                totalTriggers: 0
            },
            {
                triggerId: 'REFERRAL_NEW_USER',
                actionType: 'referral',
                TPReward: 150,
                conditions: {
                    zkpRequired: false,
                    didRequired: true,
                    minTier: 'Citizen',
                    additionalCriteria: 'Referred user completes civic verification'
                },
                description: 'Successfully refer a new citizen to the platform',
                category: 'social',
                isActive: true,
                totalTriggers: 0
            },
            {
                triggerId: 'DECK10_FEEDBACK',
                actionType: 'feedback',
                TPReward: 75,
                conditions: {
                    zkpRequired: true,
                    didRequired: true,
                    minTier: 'Citizen',
                    additionalCriteria: 'Submit verified feedback on governance proposals'
                },
                description: 'Provide substantive feedback on Deck #10 governance proposals',
                category: 'governance',
                isActive: true,
                totalTriggers: 0
            },
            {
                triggerId: 'COMMAND_STREAK',
                actionType: 'streak',
                TPReward: 100,
                conditions: {
                    zkpRequired: false,
                    didRequired: true,
                    minTier: 'Contributor',
                    additionalCriteria: '7+ consecutive days of civic engagement'
                },
                description: 'Maintain 7-day civic engagement streak',
                category: 'engagement',
                isActive: true,
                totalTriggers: 0
            },
            {
                triggerId: 'TRUTH_MEDIA_UPLOAD',
                actionType: 'media',
                TPReward: 200,
                conditions: {
                    zkpRequired: true,
                    didRequired: true,
                    minTier: 'Contributor',
                    additionalCriteria: 'Upload verified civic content with community approval'
                },
                description: 'Upload and verify truth-based civic media content',
                category: 'content',
                isActive: true,
                totalTriggers: 0
            }
        ];
        seedTriggers.forEach(trigger => {
            this.triggers.set(trigger.triggerId, trigger);
        });
        this.initialized = true;
        console.log('💎 RewardTriggerMatrix initialized with 5 civic triggers');
        console.log(`📊 Available rewards: ${this.getAvailableRewards().reduce((sum, t) => sum + t.TPReward, 0)} TP total`);
    }
    /**
     * Get all available triggers
     */
    static getAllTriggers() {
        this.initialize();
        return Array.from(this.triggers.values());
    }
    /**
     * Get active triggers only
     */
    static getActiveTriggers() {
        this.initialize();
        return Array.from(this.triggers.values()).filter(trigger => trigger.isActive);
    }
    /**
     * Get trigger by ID
     */
    static getTrigger(triggerId) {
        this.initialize();
        return this.triggers.get(triggerId);
    }
    /**
     * Get triggers by category
     */
    static getTriggersByCategory(category) {
        this.initialize();
        return Array.from(this.triggers.values()).filter(trigger => trigger.category === category);
    }
    /**
     * Get triggers by action type
     */
    static getTriggersByAction(actionType) {
        this.initialize();
        return Array.from(this.triggers.values()).filter(trigger => trigger.actionType === actionType);
    }
    /**
     * Get available rewards for user based on tier
     */
    static getAvailableRewards(userTier = 'Citizen') {
        this.initialize();
        const tierOrder = ['Citizen', 'Contributor', 'Moderator', 'Governor', 'Commander'];
        const userTierIndex = tierOrder.indexOf(userTier);
        return Array.from(this.triggers.values()).filter(trigger => {
            const triggerTierIndex = tierOrder.indexOf(trigger.conditions.minTier);
            return trigger.isActive && userTierIndex >= triggerTierIndex;
        });
    }
    /**
     * Validate trigger conditions
     */
    static validateTriggerConditions(triggerId, context) {
        const trigger = this.getTrigger(triggerId);
        if (!trigger) {
            return { valid: false, reason: 'Trigger not found' };
        }
        if (!trigger.isActive) {
            return { valid: false, reason: 'Trigger is not active' };
        }
        // Check DID requirement
        if (trigger.conditions.didRequired && !context.did) {
            return { valid: false, reason: 'DID required but not provided' };
        }
        // Check ZKP requirement
        if (trigger.conditions.zkpRequired && !context.zkpHash) {
            return { valid: false, reason: 'ZKP verification required but not provided' };
        }
        // Check tier requirement
        const tierOrder = ['Citizen', 'Contributor', 'Moderator', 'Governor', 'Commander'];
        const userTierIndex = tierOrder.indexOf(context.tier);
        const requiredTierIndex = tierOrder.indexOf(trigger.conditions.minTier);
        if (userTierIndex < requiredTierIndex) {
            return { valid: false, reason: `Minimum tier ${trigger.conditions.minTier} required` };
        }
        return { valid: true };
    }
    /**
     * Update trigger statistics
     */
    static updateTriggerStats(triggerId) {
        const trigger = this.triggers.get(triggerId);
        if (trigger) {
            trigger.totalTriggers++;
            trigger.lastTriggered = new Date();
            console.log(`📊 Trigger ${triggerId} updated: ${trigger.totalTriggers} total activations`);
        }
    }
    /**
     * Disable trigger
     */
    static disableTrigger(triggerId) {
        const trigger = this.triggers.get(triggerId);
        if (trigger) {
            trigger.isActive = false;
            console.log(`🚫 Trigger ${triggerId} disabled`);
        }
    }
    /**
     * Enable trigger
     */
    static enableTrigger(triggerId) {
        const trigger = this.triggers.get(triggerId);
        if (trigger) {
            trigger.isActive = true;
            console.log(`✅ Trigger ${triggerId} enabled`);
        }
    }
    /**
     * Get trigger statistics
     */
    static getStatistics() {
        this.initialize();
        const triggers = Array.from(this.triggers.values());
        const mostPopular = triggers.reduce((max, trigger) => trigger.totalTriggers > max.totalTriggers ? trigger : max, triggers[0]);
        const categoryBreakdown = triggers.reduce((acc, trigger) => {
            acc[trigger.category] = (acc[trigger.category] || 0) + 1;
            return acc;
        }, {});
        return {
            totalTriggers: triggers.length,
            activeTriggers: triggers.filter(t => t.isActive).length,
            totalRewardPool: triggers.reduce((sum, t) => sum + t.TPReward, 0),
            mostPopularTrigger: mostPopular?.triggerId || 'None',
            categoryBreakdown
        };
    }
    /**
     * Export trigger matrix for analysis
     */
    static exportMatrix() {
        return {
            timestamp: new Date(),
            triggers: this.getAllTriggers(),
            statistics: this.getStatistics()
        };
    }
}
