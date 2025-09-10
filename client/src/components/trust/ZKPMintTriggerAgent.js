/**
 * ZKPMintTriggerAgent.ts
 * Phase X-D Step 4: ZKP mint signal emission agent for tiered delta thresholds
 * Commander Mark authorization via JASMY Relay
 */
import TrustSentimentAggregator from './TrustSentimentAggregator';
export class ZKPMintTriggerAgent {
    static instance;
    config;
    mintSignals = [];
    userCooldowns = new Map();
    hourlyMintCount = 0;
    lastHourReset = Date.now();
    metrics;
    static getInstance() {
        if (!ZKPMintTriggerAgent.instance) {
            ZKPMintTriggerAgent.instance = new ZKPMintTriggerAgent();
        }
        return ZKPMintTriggerAgent.instance;
    }
    constructor() {
        this.config = {
            enabled: true,
            thresholds: {
                citizen: 50, // 50% trust delta triggers citizen mint
                governor: 40, // 40% trust delta triggers governor mint
                commander: 30 // 30% trust delta triggers commander mint
            },
            cooldownPeriod: 2 * 60 * 60 * 1000, // 2 hours
            maxMintsPerHour: 100,
            mintRewardAmounts: {
                citizen: 25,
                governor: 50,
                commander: 100
            }
        };
        this.metrics = {
            totalSignalsEmitted: 0,
            signalsByTier: { citizen: 0, governor: 0, commander: 0 },
            averageTrustDelta: 0,
            totalMintValue: 0,
            lastTriggerTimestamp: null,
            activeSignals: 0,
            processedSignals: 0
        };
        this.loadPersistedData();
        this.startMonitoring();
        console.log('🎯 ZKPMintTriggerAgent initialized - Tiered delta threshold monitoring active');
    }
    async checkForMintTriggers() {
        if (!this.config.enabled)
            return [];
        try {
            // Reset hourly count if needed
            this.resetHourlyCountIfNeeded();
            // Check if we've hit hourly limit
            if (this.hourlyMintCount >= this.config.maxMintsPerHour) {
                return [];
            }
            const aggregator = TrustSentimentAggregator.getInstance();
            const deckMetrics = aggregator.getAllDeckMetrics();
            const newSignals = [];
            for (const deck of deckMetrics) {
                const signals = await this.checkDeckForMintTriggers(deck);
                newSignals.push(...signals);
            }
            // Process and store new signals
            for (const signal of newSignals) {
                await this.emitMintSignal(signal);
            }
            return newSignals;
        }
        catch (error) {
            console.error('❌ ZKP mint trigger check failed:', error);
            return [];
        }
    }
    async emitMintSignal(signal) {
        try {
            // Validate signal
            if (!this.validateMintSignal(signal)) {
                return false;
            }
            // Check cooldown
            if (this.isUserOnCooldown(signal.userId)) {
                return false;
            }
            // Check hourly limit
            if (this.hourlyMintCount >= this.config.maxMintsPerHour) {
                return false;
            }
            // Add to signals array
            this.mintSignals.push(signal);
            // Update cooldown
            this.userCooldowns.set(signal.userId, Date.now());
            // Update hourly count
            this.hourlyMintCount++;
            // Update metrics
            this.updateMetrics(signal);
            // Log signal to file system
            await this.logMintSignal(signal);
            console.log(`🎯 ZKP mint signal emitted: ${signal.mintAmount} tokens for ${signal.userTier} user (${signal.trustDelta.toFixed(1)}% delta)`);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to emit mint signal:', error);
            return false;
        }
    }
    getMintSignals(processed) {
        if (processed === undefined) {
            return [...this.mintSignals];
        }
        return this.mintSignals.filter(signal => signal.processed === processed);
    }
    getMintTriggerMetrics() {
        // Update active/processed counts
        this.metrics.activeSignals = this.mintSignals.filter(s => !s.processed).length;
        this.metrics.processedSignals = this.mintSignals.filter(s => s.processed).length;
        return { ...this.metrics };
    }
    async processMintSignal(signalId) {
        const signal = this.mintSignals.find(s => s.signalId === signalId);
        if (!signal || signal.processed) {
            return false;
        }
        try {
            // Simulate ZKP mint processing
            signal.processed = true;
            console.log(`🎯 ZKP mint signal processed: ${signalId} - ${signal.mintAmount} tokens`);
            this.persistData();
            return true;
        }
        catch (error) {
            console.error('❌ Failed to process mint signal:', error);
            return false;
        }
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.persistData();
        console.log('🎯 ZKP mint trigger configuration updated');
    }
    exportMintLog() {
        return {
            schema: {
                version: 'phase_xd_step_4',
                description: 'ZKP mint trigger log with tiered delta thresholds and civic mint stubs'
            },
            config: this.config,
            signals: this.mintSignals,
            metrics: this.getMintTriggerMetrics(),
            cooldowns: Object.fromEntries(this.userCooldowns),
            exportedAt: new Date().toISOString()
        };
    }
    async checkDeckForMintTriggers(deck) {
        const signals = [];
        // Generate mock user interactions for this deck
        const userCount = Math.min(5, Math.floor(deck.totalSubmissions * 0.1));
        for (let i = 0; i < userCount; i++) {
            const tier = this.getRandomTier();
            const trustDelta = Math.abs(deck.netSentiment);
            const threshold = this.config.thresholds[tier];
            // Check if trust delta exceeds threshold for this tier
            if (trustDelta >= threshold) {
                const userId = `user_${deck.deckId}_${i}`;
                // Skip if user is on cooldown
                if (this.isUserOnCooldown(userId)) {
                    continue;
                }
                const signal = {
                    signalId: `mint_${Date.now()}_${userId}`,
                    userId,
                    userTier: tier,
                    deckId: deck.deckId,
                    triggerReason: `${tier}_threshold_exceeded`,
                    trustDelta,
                    mintAmount: this.config.mintRewardAmounts[tier],
                    timestamp: new Date().toISOString(),
                    zkpHash: this.generateZKPHash(userId, deck.deckId, trustDelta),
                    processed: false
                };
                signals.push(signal);
            }
        }
        return signals;
    }
    validateMintSignal(signal) {
        // Basic validation
        if (!signal.signalId || !signal.userId || !signal.deckId) {
            return false;
        }
        // Check tier validity
        if (!['citizen', 'governor', 'commander'].includes(signal.userTier)) {
            return false;
        }
        // Check trust delta meets threshold
        const threshold = this.config.thresholds[signal.userTier];
        if (signal.trustDelta < threshold) {
            return false;
        }
        return true;
    }
    isUserOnCooldown(userId) {
        const lastMint = this.userCooldowns.get(userId);
        if (!lastMint)
            return false;
        return Date.now() - lastMint < this.config.cooldownPeriod;
    }
    resetHourlyCountIfNeeded() {
        const now = Date.now();
        const hoursSinceReset = (now - this.lastHourReset) / (1000 * 60 * 60);
        if (hoursSinceReset >= 1) {
            this.hourlyMintCount = 0;
            this.lastHourReset = now;
        }
    }
    updateMetrics(signal) {
        this.metrics.totalSignalsEmitted++;
        this.metrics.signalsByTier[signal.userTier]++;
        this.metrics.totalMintValue += signal.mintAmount;
        this.metrics.lastTriggerTimestamp = signal.timestamp;
        // Update rolling average trust delta
        const totalDelta = this.metrics.averageTrustDelta * (this.metrics.totalSignalsEmitted - 1) + signal.trustDelta;
        this.metrics.averageTrustDelta = totalDelta / this.metrics.totalSignalsEmitted;
    }
    generateZKPHash(userId, deckId, trustDelta) {
        const content = `${userId}:${deckId}:${trustDelta}:${Date.now()}`;
        return `zkp_mint_${btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
    }
    getRandomTier() {
        const rand = Math.random();
        if (rand < 0.1)
            return 'commander';
        if (rand < 0.3)
            return 'governor';
        return 'citizen';
    }
    async logMintSignal(signal) {
        try {
            // Create log entry for /logs/mint-signal.json
            const logEntry = {
                timestamp: signal.timestamp,
                signalId: signal.signalId,
                mintStub: {
                    userId: signal.userId,
                    tier: signal.userTier,
                    amount: signal.mintAmount,
                    zkpHash: signal.zkpHash
                },
                triggerData: {
                    deckId: signal.deckId,
                    trustDelta: signal.trustDelta,
                    reason: signal.triggerReason
                }
            };
            // In a real implementation, this would write to the file system
            console.log('📝 Mint signal logged:', JSON.stringify(logEntry, null, 2));
        }
        catch (error) {
            console.error('❌ Failed to log mint signal:', error);
        }
    }
    startMonitoring() {
        // Check for mint triggers every 30 seconds
        setInterval(async () => {
            try {
                await this.checkForMintTriggers();
            }
            catch (error) {
                console.error('❌ Mint trigger monitoring failed:', error);
            }
        }, 30000);
    }
    loadPersistedData() {
        try {
            const savedSignals = localStorage.getItem('zkp_mint_signals');
            if (savedSignals) {
                this.mintSignals = JSON.parse(savedSignals);
            }
            const savedMetrics = localStorage.getItem('zkp_mint_metrics');
            if (savedMetrics) {
                const loaded = JSON.parse(savedMetrics);
                this.metrics = { ...this.metrics, ...loaded };
            }
            const savedCooldowns = localStorage.getItem('zkp_mint_cooldowns');
            if (savedCooldowns) {
                const cooldowns = JSON.parse(savedCooldowns);
                this.userCooldowns = new Map(Object.entries(cooldowns));
            }
        }
        catch (error) {
            console.warn('⚠️ Failed to load ZKP mint data:', error);
        }
    }
    persistData() {
        try {
            localStorage.setItem('zkp_mint_signals', JSON.stringify(this.mintSignals));
            localStorage.setItem('zkp_mint_metrics', JSON.stringify(this.metrics));
            const cooldownsObj = Object.fromEntries(this.userCooldowns);
            localStorage.setItem('zkp_mint_cooldowns', JSON.stringify(cooldownsObj));
        }
        catch (error) {
            console.warn('⚠️ Failed to persist ZKP mint data:', error);
        }
    }
}
export default ZKPMintTriggerAgent;
