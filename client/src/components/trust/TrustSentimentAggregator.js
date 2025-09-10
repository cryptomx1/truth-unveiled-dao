/**
 * TrustSentimentAggregator.ts
 * Phase X-D Step 2: Trust delta aggregation and sentiment analysis
 * Commander Mark authorization via JASMY Relay
 */
import TrustFeedbackEngine from './TrustFeedbackEngine';
export class TrustSentimentAggregator {
    static instance;
    deckMetrics = new Map();
    volatilityHistory = [];
    aggregationInterval = 3 * 60 * 1000; // 3 minutes
    volatilityThreshold = 0.15; // 15%
    historicalSentiment = new Map();
    static getInstance() {
        if (!TrustSentimentAggregator.instance) {
            TrustSentimentAggregator.instance = new TrustSentimentAggregator();
        }
        return TrustSentimentAggregator.instance;
    }
    constructor() {
        this.loadPersistedData();
        this.startPeriodicAggregation();
        console.log('📊 TrustSentimentAggregator initialized - Periodic sentiment analysis ready');
    }
    async aggregateAllTrustDeltas() {
        const startTime = performance.now();
        const trustEngine = TrustFeedbackEngine.getInstance();
        const allDeltas = trustEngine.getAllTrustDeltas();
        const feedbackLog = trustEngine.getFeedbackLog();
        // Group by deck
        const deckGroups = this.groupFeedbackByDeck(feedbackLog);
        let totalSentiment = 0;
        let activeDecks = 0;
        const highVolatilityDecks = [];
        for (const [deckId, entries] of deckGroups) {
            const metrics = await this.calculateDeckMetrics(deckId, entries);
            // Check for volatility spikes
            const previousSentiment = this.getPreviousSentiment(deckId);
            if (previousSentiment !== null) {
                const changePercent = Math.abs(metrics.netSentiment - previousSentiment) / Math.abs(previousSentiment || 1);
                if (changePercent >= this.volatilityThreshold) {
                    metrics.volatilityFlag = true;
                    highVolatilityDecks.push(deckId);
                    const spike = {
                        deckId,
                        timestamp: new Date().toISOString(),
                        previousSentiment,
                        currentSentiment: metrics.netSentiment,
                        changePercent,
                        triggerThreshold: this.volatilityThreshold,
                        cid: this.generateCID(deckId, metrics)
                    };
                    this.volatilityHistory.push(spike);
                }
            }
            // Update historical sentiment tracking
            this.updateHistoricalSentiment(deckId, metrics.netSentiment);
            this.deckMetrics.set(deckId, metrics);
            if (metrics.totalSubmissions > 0) {
                totalSentiment += metrics.netSentiment;
                activeDecks++;
            }
        }
        const overallSentiment = activeDecks > 0 ? totalSentiment / activeDecks : 0;
        const systemHealth = this.calculateSystemHealth(overallSentiment, highVolatilityDecks.length);
        const aggregatedMetrics = {
            overallSentiment,
            totalDecks: deckGroups.size,
            activeDecks,
            highVolatilityDecks,
            lastAggregation: new Date().toISOString(),
            systemHealth
        };
        this.persistData();
        const processTime = performance.now() - startTime;
        console.log(`📊 Trust sentiment aggregation complete: ${activeDecks} active decks, ${processTime.toFixed(1)}ms`);
        return aggregatedMetrics;
    }
    getDeckMetrics(deckId) {
        return this.deckMetrics.get(deckId) || null;
    }
    getAllDeckMetrics() {
        return Array.from(this.deckMetrics.values());
    }
    getVolatilityHistory(deckId) {
        if (deckId) {
            return this.volatilityHistory.filter(spike => spike.deckId === deckId);
        }
        return [...this.volatilityHistory];
    }
    exportSentimentVolatilityLog() {
        return {
            schema: {
                version: 'phase_xd_step_2',
                description: 'Time-series sentiment volatility tracking with CID context'
            },
            metrics: Object.fromEntries(this.deckMetrics),
            volatilitySpikes: this.volatilityHistory,
            historicalTrends: Object.fromEntries(this.historicalSentiment),
            exportedAt: new Date().toISOString(),
            systemStatus: {
                totalDecks: this.deckMetrics.size,
                volatileDecks: this.volatilityHistory.filter(spike => Date.now() - new Date(spike.timestamp).getTime() < 24 * 60 * 60 * 1000).length,
                aggregationInterval: this.aggregationInterval
            }
        };
    }
    async calculateDeckMetrics(deckId, entries) {
        const tierBreakdown = {
            citizen: { support: 0, dissent: 0, count: 0 },
            governor: { support: 0, dissent: 0, count: 0 },
            commander: { support: 0, dissent: 0, count: 0 }
        };
        let totalWeightedSupport = 0;
        let totalWeightedDissent = 0;
        let totalIntensity = 0;
        for (const entry of entries) {
            const tier = entry.payload.submitter.tier.toLowerCase();
            const intensity = entry.payload.feedback.intensity;
            const weight = entry.tierWeight;
            tierBreakdown[tier].count++;
            if (entry.payload.feedback.type === 'support') {
                tierBreakdown[tier].support++;
                totalWeightedSupport += intensity * weight;
            }
            else {
                tierBreakdown[tier].dissent++;
                totalWeightedDissent += intensity * weight;
            }
            totalIntensity += intensity;
        }
        const netSentiment = totalWeightedSupport - totalWeightedDissent;
        const averageIntensity = entries.length > 0 ? totalIntensity / entries.length : 0;
        const sentimentTrend = this.calculateSentimentTrend(deckId, netSentiment);
        return {
            deckId,
            netSentiment,
            totalSubmissions: entries.length,
            averageIntensity,
            tierBreakdown,
            lastUpdated: new Date().toISOString(),
            volatilityFlag: false, // Will be set during volatility check
            sentimentTrend
        };
    }
    groupFeedbackByDeck(feedbackLog) {
        const deckGroups = new Map();
        for (const entry of feedbackLog) {
            const deckId = entry.payload.target.deckId;
            if (!deckGroups.has(deckId)) {
                deckGroups.set(deckId, []);
            }
            deckGroups.get(deckId).push(entry);
        }
        return deckGroups;
    }
    getPreviousSentiment(deckId) {
        const history = this.historicalSentiment.get(deckId);
        return history && history.length > 1 ? history[history.length - 2] : null;
    }
    updateHistoricalSentiment(deckId, sentiment) {
        if (!this.historicalSentiment.has(deckId)) {
            this.historicalSentiment.set(deckId, []);
        }
        const history = this.historicalSentiment.get(deckId);
        history.push(sentiment);
        // Keep last 100 readings for trend analysis
        if (history.length > 100) {
            history.shift();
        }
    }
    calculateSentimentTrend(deckId, currentSentiment) {
        const history = this.historicalSentiment.get(deckId);
        if (!history || history.length < 3)
            return 'stable';
        const recent = history.slice(-3);
        const trend = recent[2] - recent[0];
        if (Math.abs(trend) < 0.1)
            return 'stable';
        return trend > 0 ? 'rising' : 'falling';
    }
    calculateSystemHealth(overallSentiment, volatileDecks) {
        if (volatileDecks > 3)
            return 'critical';
        if (volatileDecks > 1 || Math.abs(overallSentiment) > 50)
            return 'concerning';
        if (Math.abs(overallSentiment) > 20)
            return 'good';
        return 'excellent';
    }
    generateCID(deckId, metrics) {
        const content = JSON.stringify({
            deckId,
            sentiment: metrics.netSentiment,
            timestamp: metrics.lastUpdated,
            submissions: metrics.totalSubmissions
        });
        return `Qm${btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 44)}`;
    }
    startPeriodicAggregation() {
        setInterval(async () => {
            try {
                await this.aggregateAllTrustDeltas();
            }
            catch (error) {
                console.error('❌ Trust sentiment aggregation failed:', error);
            }
        }, this.aggregationInterval);
    }
    loadPersistedData() {
        try {
            const savedMetrics = localStorage.getItem('trust_sentiment_metrics');
            if (savedMetrics) {
                const parsed = JSON.parse(savedMetrics);
                this.deckMetrics = new Map(Object.entries(parsed));
            }
            const savedVolatility = localStorage.getItem('trust_volatility_history');
            if (savedVolatility) {
                this.volatilityHistory = JSON.parse(savedVolatility);
            }
            const savedHistory = localStorage.getItem('trust_historical_sentiment');
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                this.historicalSentiment = new Map(Object.entries(parsed));
            }
        }
        catch (error) {
            console.warn('⚠️ Failed to load persisted sentiment data:', error);
        }
    }
    persistData() {
        try {
            const metricsObj = Object.fromEntries(this.deckMetrics);
            localStorage.setItem('trust_sentiment_metrics', JSON.stringify(metricsObj));
            localStorage.setItem('trust_volatility_history', JSON.stringify(this.volatilityHistory));
            const historyObj = Object.fromEntries(this.historicalSentiment);
            localStorage.setItem('trust_historical_sentiment', JSON.stringify(historyObj));
        }
        catch (error) {
            console.warn('⚠️ Failed to persist sentiment data:', error);
        }
    }
}
export default TrustSentimentAggregator;
