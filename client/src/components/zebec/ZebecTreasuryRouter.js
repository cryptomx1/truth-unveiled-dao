/**
 * ZebecTreasuryRouter.ts - Phase X-ZEBEC Step 3
 *
 * Automated stream allocation based on deck/task origin with tier-weighted distribution,
 * referral multipliers, and CID logging for reward ledger integrity
 * Authority: Commander Mark via JASMY Relay System
 */
export class ZebecTreasuryRouter {
    static instance = null;
    allocations = new Map();
    distributions = new Map();
    tierConfigs = [];
    deckMappings = [];
    constructor() {
        this.initializeTierConfigs();
        this.initializeDeckMappings();
        console.log('💰 ZebecTreasuryRouter initialized with automated allocation system');
    }
    static getInstance() {
        if (!ZebecTreasuryRouter.instance) {
            ZebecTreasuryRouter.instance = new ZebecTreasuryRouter();
        }
        return ZebecTreasuryRouter.instance;
    }
    /**
     * Initialize tier weight configurations
     */
    initializeTierConfigs() {
        this.tierConfigs = [
            {
                tier: 'Citizen',
                multiplier: 1.0,
                maxDailyAllocation: 1000, // TP
                streamDurationBonus: 0
            },
            {
                tier: 'Advocate',
                multiplier: 1.2,
                maxDailyAllocation: 2500,
                streamDurationBonus: 5 // +5 minutes
            },
            {
                tier: 'Guardian',
                multiplier: 1.5,
                maxDailyAllocation: 5000,
                streamDurationBonus: 10
            },
            {
                tier: 'Representative',
                multiplier: 2.0,
                maxDailyAllocation: 10000,
                streamDurationBonus: 15
            },
            {
                tier: 'Commander',
                multiplier: 3.0,
                maxDailyAllocation: 25000,
                streamDurationBonus: 30
            }
        ];
        console.log(`⚖️ Initialized ${this.tierConfigs.length} tier configurations`);
    }
    /**
     * Initialize deck-to-reward mappings
     */
    initializeDeckMappings() {
        this.deckMappings = [
            {
                deckId: 'municipal',
                deckName: 'Municipal Engagement',
                taskTypes: {
                    pilot_participation: {
                        baseReward: 500,
                        currency: 'TP',
                        eligibleTiers: ['Citizen', 'Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    },
                    did_verification: {
                        baseReward: 200,
                        currency: 'TP',
                        eligibleTiers: ['Citizen', 'Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: false
                    },
                    playbook_completion: {
                        baseReward: 300,
                        currency: 'TP',
                        eligibleTiers: ['Citizen', 'Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    }
                }
            },
            {
                deckId: 'governance',
                deckName: 'Governance Participation',
                taskTypes: {
                    proposal_submission: {
                        baseReward: 750,
                        currency: 'TP',
                        eligibleTiers: ['Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    },
                    voting_participation: {
                        baseReward: 150,
                        currency: 'TP',
                        eligibleTiers: ['Citizen', 'Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: false
                    },
                    debate_contribution: {
                        baseReward: 400,
                        currency: 'TP',
                        eligibleTiers: ['Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    }
                }
            },
            {
                deckId: 'fusion',
                deckName: 'Civic Fusion',
                taskTypes: {
                    genesis_badge_creation: {
                        baseReward: 1000,
                        currency: 'TP',
                        eligibleTiers: ['Guardian', 'Representative', 'Commander'],
                        referralEligible: false
                    },
                    pillar_mastery: {
                        baseReward: 250,
                        currency: 'TP',
                        eligibleTiers: ['Citizen', 'Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    },
                    zkp_verification: {
                        baseReward: 350,
                        currency: 'TP',
                        eligibleTiers: ['Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: false
                    }
                }
            },
            {
                deckId: 'press',
                deckName: 'Press & Amplification',
                taskTypes: {
                    campaign_creation: {
                        baseReward: 600,
                        currency: 'TP',
                        eligibleTiers: ['Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    },
                    social_amplification: {
                        baseReward: 100,
                        currency: 'TP',
                        eligibleTiers: ['Citizen', 'Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    },
                    content_creation: {
                        baseReward: 450,
                        currency: 'TP',
                        eligibleTiers: ['Advocate', 'Guardian', 'Representative', 'Commander'],
                        referralEligible: true
                    }
                }
            }
        ];
        console.log(`🎯 Initialized ${this.deckMappings.length} deck reward mappings`);
    }
    /**
     * Calculate referral bonus based on user activity
     */
    calculateReferralBonus(baseAmount, referralCount = 0, referralEligible = true) {
        if (!referralEligible || referralCount === 0)
            return 0;
        // 10% bonus per referral, capped at 50%
        const bonusPercentage = Math.min(referralCount * 0.10, 0.50);
        return baseAmount * bonusPercentage;
    }
    /**
     * Get tier configuration
     */
    getTierConfig(tier) {
        return this.tierConfigs.find(config => config.tier === tier) || this.tierConfigs[0];
    }
    /**
     * Generate CID hash for allocation tracking
     */
    generateCIDHash(deckOrigin, taskType, recipientWallet, timestamp) {
        const data = `${deckOrigin}-${taskType}-${recipientWallet}-${timestamp.getTime()}`;
        // Simple hash simulation - in production would use proper cryptographic hashing
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `bafybei${Math.abs(hash).toString(16).padStart(46, '0').substring(0, 46)}`;
    }
    /**
     * Create treasury allocation for deck-based task
     */
    async createAllocation(params) {
        try {
            const { deckOrigin, taskType, recipientWallet, userTier, referralCount = 0, customOriginCID } = params;
            // Find deck mapping
            const deckMapping = this.deckMappings.find(deck => deck.deckId === deckOrigin);
            if (!deckMapping) {
                return { success: false, error: `Unknown deck origin: ${deckOrigin}` };
            }
            // Find task configuration
            const taskConfig = deckMapping.taskTypes[taskType];
            if (!taskConfig) {
                return { success: false, error: `Unknown task type: ${taskType} in deck ${deckOrigin}` };
            }
            // Check tier eligibility
            if (!taskConfig.eligibleTiers.includes(userTier)) {
                return { success: false, error: `Tier ${userTier} not eligible for task ${taskType}` };
            }
            // Get tier configuration
            const tierConfig = this.getTierConfig(userTier);
            // Calculate amounts
            const baseAmount = taskConfig.baseReward;
            const tierMultiplier = tierConfig.multiplier;
            const referralBonus = this.calculateReferralBonus(baseAmount, referralCount, taskConfig.referralEligible);
            const finalAmount = Math.round((baseAmount * tierMultiplier) + referralBonus);
            // Generate allocation
            const timestamp = new Date();
            const originCID = customOriginCID || this.generateCIDHash(deckOrigin, taskType, recipientWallet, timestamp);
            const allocationId = `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            const allocation = {
                deckOrigin,
                taskType,
                baseAmount,
                tierMultiplier,
                referralBonus,
                finalAmount,
                originCID,
                timestamp
            };
            this.allocations.set(allocationId, allocation);
            console.log('💰 Treasury allocation created:');
            console.log(`📋 ID: ${allocationId}`);
            console.log(`🎯 Deck: ${deckMapping.deckName} (${deckOrigin})`);
            console.log(`🔧 Task: ${taskType}`);
            console.log(`💎 Amount: ${finalAmount} ${taskConfig.currency} (base: ${baseAmount}, tier: ${tierMultiplier}x, referral: +${referralBonus})`);
            console.log(`🏆 Tier: ${userTier}`);
            console.log(`🔗 CID: ${originCID}`);
            return { success: true, allocationId };
        }
        catch (error) {
            console.error('❌ Treasury allocation failed:', error);
            return { success: false, error: String(error) };
        }
    }
    /**
     * Create stream distribution from allocation
     */
    async createStreamDistribution(allocationId, streamDurationMinutes) {
        try {
            const allocation = this.allocations.get(allocationId);
            if (!allocation) {
                return { success: false, error: 'Allocation not found' };
            }
            const deckMapping = this.deckMappings.find(deck => deck.deckId === allocation.deckOrigin);
            const taskConfig = deckMapping?.taskTypes[allocation.taskType];
            if (!deckMapping || !taskConfig) {
                return { success: false, error: 'Invalid allocation configuration' };
            }
            // Mock recipient wallet - in production would come from user profile
            const recipientWallet = `ZBC${Math.random().toString(36).substr(2, 8)}...`;
            // Calculate stream duration with tier bonus
            const tierConfig = this.getTierConfig('Citizen'); // Would get from user context
            const baseDuration = streamDurationMinutes || 30;
            const adjustedDuration = baseDuration + tierConfig.streamDurationBonus;
            const streamId = `zbc_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            const distribution = {
                allocationId,
                streamId,
                recipientWallet,
                amount: allocation.finalAmount,
                currency: taskConfig.currency,
                streamDuration: adjustedDuration,
                status: 'pending',
                metadata: {
                    deckOrigin: allocation.deckOrigin,
                    taskType: allocation.taskType,
                    tierMultiplier: allocation.tierMultiplier,
                    referralBonus: allocation.referralBonus,
                    cidHash: allocation.originCID
                }
            };
            this.distributions.set(streamId, distribution);
            console.log('🚀 Stream distribution created:');
            console.log(`🆔 Stream ID: ${streamId}`);
            console.log(`💰 Amount: ${distribution.amount} ${distribution.currency}`);
            console.log(`⏱️ Duration: ${adjustedDuration} minutes`);
            console.log(`🎯 Origin: ${allocation.deckOrigin}/${allocation.taskType}`);
            console.log(`🔗 CID: ${allocation.originCID}`);
            // Mock Zebec API integration
            setTimeout(() => {
                this.distributions.set(streamId, { ...distribution, status: 'active' });
                console.log(`✅ Stream ${streamId} activated on Zebec network`);
            }, 2000);
            return { success: true, streamId };
        }
        catch (error) {
            console.error('❌ Stream distribution failed:', error);
            return { success: false, error: String(error) };
        }
    }
    /**
     * Get allocation by ID
     */
    getAllocation(allocationId) {
        return this.allocations.get(allocationId) || null;
    }
    /**
     * Get stream distribution by ID
     */
    getStreamDistribution(streamId) {
        return this.distributions.get(streamId) || null;
    }
    /**
     * List allocations by deck
     */
    getAllocationsByDeck(deckOrigin) {
        return Array.from(this.allocations.values()).filter(alloc => alloc.deckOrigin === deckOrigin);
    }
    /**
     * Get active stream distributions
     */
    getActiveStreams() {
        return Array.from(this.distributions.values()).filter(dist => dist.status === 'active');
    }
    /**
     * Calculate daily allocation summary
     */
    getDailyAllocationSummary(date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const todayAllocations = Array.from(this.allocations.values()).filter(alloc => alloc.timestamp >= startOfDay && alloc.timestamp <= endOfDay);
        const todayStreams = Array.from(this.distributions.values()).filter(dist => {
            const allocation = this.allocations.get(dist.allocationId);
            return allocation && allocation.timestamp >= startOfDay && allocation.timestamp <= endOfDay;
        });
        const summary = {
            totalAllocated: todayAllocations.reduce((sum, alloc) => sum + alloc.finalAmount, 0),
            totalStreams: todayStreams.length,
            byDeck: {},
            byCurrency: {}
        };
        // Group by deck
        todayAllocations.forEach(alloc => {
            summary.byDeck[alloc.deckOrigin] = (summary.byDeck[alloc.deckOrigin] || 0) + alloc.finalAmount;
        });
        // Group by currency
        todayStreams.forEach(stream => {
            summary.byCurrency[stream.currency] = (summary.byCurrency[stream.currency] || 0) + stream.amount;
        });
        return summary;
    }
    /**
     * Export allocation and distribution logs for audit
     */
    exportAuditLog() {
        const summary = this.getDailyAllocationSummary();
        return {
            timestamp: new Date().toISOString(),
            totalAllocations: this.allocations.size,
            totalDistributions: this.distributions.size,
            allocations: Array.from(this.allocations.values()),
            distributions: Array.from(this.distributions.values()),
            summary
        };
    }
    /**
     * Update stream status (for testing)
     */
    updateStreamStatus(streamId, status) {
        const distribution = this.distributions.get(streamId);
        if (!distribution)
            return false;
        distribution.status = status;
        this.distributions.set(streamId, distribution);
        console.log(`🔄 Stream ${streamId} status updated to: ${status}`);
        return true;
    }
    /**
     * Mock blockchain transaction integration
     */
    async linkBlockchainTransaction(streamId, txSignature) {
        const distribution = this.distributions.get(streamId);
        if (!distribution)
            return false;
        distribution.metadata.blockchainTx = txSignature;
        this.distributions.set(streamId, distribution);
        console.log(`⛓️ Stream ${streamId} linked to blockchain tx: ${txSignature}`);
        return true;
    }
}
export default ZebecTreasuryRouter;
