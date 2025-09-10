/**
 * TruthPointStakingEngine.ts
 * Phase X-FINANCE Step 4 - TruthPoint Staking Infrastructure
 * Authority: Commander Mark via JASMY Relay System
 */
export class TruthPointStakingEngine {
    static instance = null;
    stakingTiers = new Map();
    activePositions = new Map();
    stakingRewards = [];
    initialized = false;
    constructor() {
        this.initialize();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!TruthPointStakingEngine.instance) {
            TruthPointStakingEngine.instance = new TruthPointStakingEngine();
        }
        return TruthPointStakingEngine.instance;
    }
    /**
     * Initialize staking engine with tier definitions
     */
    initialize() {
        if (this.initialized)
            return;
        // Define staking tiers with tier-based yield logic
        const tiers = [
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
    getStakingTiers() {
        this.initialize();
        return Array.from(this.stakingTiers.values());
    }
    /**
     * Get eligible staking tier based on amount
     */
    getEligibleTier(amount) {
        this.initialize();
        const sortedTiers = this.getStakingTiers()
            .filter(tier => amount >= tier.minStake)
            .sort((a, b) => b.minStake - a.minStake);
        return sortedTiers[0] || null;
    }
    /**
     * Calculate staking preview
     */
    calculateStakingPreview(amount, lockPeriod, customTier) {
        const tier = customTier
            ? this.stakingTiers.get(customTier)
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
    async createStakingPosition(walletCID, did, amount, lockPeriod, zkpHash) {
        const preview = this.calculateStakingPreview(amount, lockPeriod);
        const positionId = `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + lockPeriod);
        const position = {
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
    getStakingPositions(walletCID) {
        this.initialize();
        return Array.from(this.activePositions.values())
            .filter(position => position.walletCID === walletCID);
    }
    /**
     * Get all active positions
     */
    getAllActivePositions() {
        this.initialize();
        return Array.from(this.activePositions.values())
            .filter(position => position.status === 'active');
    }
    /**
     * Calculate current rewards for position
     */
    calculateCurrentRewards(positionId) {
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
    async withdrawStaking(positionId, forceEarlyWithdraw = false) {
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
        }
        else if (!rewardInfo.canWithdraw && !forceEarlyWithdraw) {
            throw new Error('Position is still locked. Use forceEarlyWithdraw to accept penalty.');
        }
        const total = principal + rewards;
        // Update position status
        position.status = forceEarlyWithdraw ? 'penalized' : 'withdrawn';
        this.saveStakingPositions();
        // Record reward
        const reward = {
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
    getStakingStatistics() {
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
        }, {});
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
    emitStakingEvent(eventType, position) {
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
    loadStakingPositions() {
        try {
            const stored = localStorage.getItem('TruthPointStakingPositions');
            if (stored) {
                const positions = JSON.parse(stored);
                positions.forEach((pos) => {
                    // Convert date strings back to Date objects
                    pos.startDate = new Date(pos.startDate);
                    pos.endDate = new Date(pos.endDate);
                    pos.lastYieldPayout = new Date(pos.lastYieldPayout);
                    this.activePositions.set(pos.id, pos);
                });
                console.log(`📋 Loaded ${this.activePositions.size} staking positions`);
            }
        }
        catch (error) {
            console.warn('⚠️ Failed to load staking positions:', error);
        }
    }
    /**
     * Save staking positions to localStorage
     */
    saveStakingPositions() {
        try {
            const positions = Array.from(this.activePositions.values());
            localStorage.setItem('TruthPointStakingPositions', JSON.stringify(positions));
        }
        catch (error) {
            console.warn('⚠️ Failed to save staking positions:', error);
        }
    }
    /**
     * Export staking data for audit
     */
    exportStakingData() {
        return {
            timestamp: new Date(),
            positions: Array.from(this.activePositions.values()),
            rewards: [...this.stakingRewards],
            statistics: this.getStakingStatistics(),
            tiers: this.getStakingTiers()
        };
    }
}
