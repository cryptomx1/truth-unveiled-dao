class PulseAggregationEngine {
    feedbackVault = [];
    pulseCache = new Map();
    updateInterval = null;
    constructor() {
        this.initializeMockData();
        this.startPeriodicUpdates();
    }
    initializeMockData() {
        // Simulate multi-user feedback data across different decks
        const mockUsers = ['user_alpha', 'user_beta', 'user_gamma', 'user_delta', 'user_epsilon'];
        const targetDecks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
        // Generate realistic feedback patterns over the past 30 days
        const now = new Date();
        for (let day = 0; day < 30; day++) {
            const dayTimestamp = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000));
            targetDecks.forEach(deckId => {
                // Each deck gets 3-8 feedback entries per day from different users
                const dailyEntries = 3 + Math.floor(Math.random() * 6);
                for (let i = 0; i < dailyEntries; i++) {
                    const userId = mockUsers[Math.floor(Math.random() * mockUsers.length)];
                    const entryTimestamp = new Date(dayTimestamp.getTime() + (Math.random() * 24 * 60 * 60 * 1000));
                    // Trust vs concern ratio varies by deck type
                    let trustProbability = 0.7; // Default 70% trust
                    if (deckId === 'consensus_layer')
                        trustProbability = 0.65; // Slightly more contentious
                    if (deckId === 'civic_identity')
                        trustProbability = 0.8; // Higher trust for identity
                    const voteType = Math.random() < trustProbability ? 'trust' : 'concern';
                    this.feedbackVault.push({
                        id: `feedback_${deckId}_${day}_${i}`,
                        deckId,
                        userId,
                        voteType,
                        zkpHash: `zkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: entryTimestamp,
                        memoryAction: {
                            id: `action_${day}_${i}`,
                            action: this.getRandomAction(deckId),
                            value: `Operation ${i + 1}`
                        }
                    });
                }
            });
        }
        console.log(`📊 PulseAggregationEngine initialized with ${this.feedbackVault.length} mock feedback entries`);
    }
    getRandomAction(deckId) {
        const actions = {
            wallet_overview: ['wallet_sync', 'balance_check', 'transaction_verify', 'address_validation'],
            civic_identity: ['did_verification', 'credential_issuance', 'biometric_proof', 'identity_lineage'],
            consensus_layer: ['proposal_vote', 'deliberation_panel', 'zkp_proposal', 'dispute_resolution'],
            civic_memory: ['memory_replay', 'trace_export', 'impact_analysis', 'feedback_vote']
        };
        const deckActions = actions[deckId] || actions.civic_memory;
        return deckActions[Math.floor(Math.random() * deckActions.length)];
    }
    computeTrustSentimentVector(deckId, periodHours = 24) {
        const cutoffTime = new Date(Date.now() - (periodHours * 60 * 60 * 1000));
        const recentFeedback = this.feedbackVault.filter(entry => entry.deckId === deckId && entry.timestamp >= cutoffTime);
        const trustVotes = recentFeedback.filter(entry => entry.voteType === 'trust').length;
        const concernVotes = recentFeedback.filter(entry => entry.voteType === 'concern').length;
        const totalVotes = trustVotes + concernVotes;
        const trustRatio = totalVotes > 0 ? trustVotes / totalVotes : 0.5;
        let sentiment = 'neutral';
        if (trustRatio > 0.7)
            sentiment = 'positive';
        else if (trustRatio < 0.3)
            sentiment = 'negative';
        // Confidence based on sample size and recency
        const confidence = Math.min(100, (totalVotes / 10) * 100);
        return {
            trustVotes,
            concernVotes,
            totalVotes,
            trustRatio,
            sentiment,
            confidence
        };
    }
    computeVolatilityIndex(deckId) {
        const periods = [24, 168, 720]; // 24h, 7d, 30d in hours
        const volatilities = periods.map(hours => {
            const vector = this.computeTrustSentimentVector(deckId, hours);
            return vector.trustRatio;
        });
        // Calculate volatility as standard deviation of trust ratios over time
        const period24h = this.calculatePeriodVolatility(deckId, 24);
        const period7d = this.calculatePeriodVolatility(deckId, 168);
        const period30d = this.calculatePeriodVolatility(deckId, 720);
        // Determine trend based on recent vs historical averages
        const recentAvg = volatilities[0];
        const historicalAvg = volatilities[2];
        let trend = 'stable';
        if (Math.abs(recentAvg - historicalAvg) > 0.1) {
            trend = recentAvg > historicalAvg ? 'increasing' : 'decreasing';
        }
        // Risk level based on volatility magnitude
        const maxVolatility = Math.max(period24h, period7d, period30d);
        let riskLevel = 'low';
        if (maxVolatility > 0.4)
            riskLevel = 'critical';
        else if (maxVolatility > 0.3)
            riskLevel = 'high';
        else if (maxVolatility > 0.2)
            riskLevel = 'medium';
        return {
            period24h,
            period7d,
            period30d,
            trend,
            riskLevel
        };
    }
    calculatePeriodVolatility(deckId, periodHours) {
        const bucketSize = Math.max(1, Math.floor(periodHours / 12)); // 12 data points
        const buckets = [];
        for (let i = 0; i < 12; i++) {
            const startTime = new Date(Date.now() - ((i + 1) * bucketSize * 60 * 60 * 1000));
            const endTime = new Date(Date.now() - (i * bucketSize * 60 * 60 * 1000));
            const bucketFeedback = this.feedbackVault.filter(entry => entry.deckId === deckId &&
                entry.timestamp >= startTime &&
                entry.timestamp < endTime);
            const trustVotes = bucketFeedback.filter(entry => entry.voteType === 'trust').length;
            const totalVotes = bucketFeedback.length;
            const ratio = totalVotes > 0 ? trustVotes / totalVotes : 0.5;
            buckets.push(ratio);
        }
        // Calculate standard deviation
        if (buckets.length === 0)
            return 0;
        const mean = buckets.reduce((sum, val) => sum + val, 0) / buckets.length;
        const variance = buckets.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / buckets.length;
        return Math.sqrt(variance);
    }
    getDeckPulseData(deckId) {
        if (this.pulseCache.has(deckId)) {
            const cached = this.pulseCache.get(deckId);
            // Return cached data if less than 30 seconds old
            if (Date.now() - cached.lastUpdate.getTime() < 30000) {
                return cached;
            }
        }
        const sentimentVector = this.computeTrustSentimentVector(deckId);
        const volatilityIndex = this.computeVolatilityIndex(deckId);
        // Trust level is based on sentiment ratio with volatility adjustment
        const baseLevel = sentimentVector.trustRatio * 100;
        const volatilityPenalty = volatilityIndex.period24h * 20; // Higher volatility reduces trust level
        const trustLevel = Math.max(0, Math.min(100, baseLevel - volatilityPenalty));
        const participantCount = new Set(this.feedbackVault
            .filter(entry => entry.deckId === deckId)
            .map(entry => entry.userId)).size;
        const pulseData = {
            deckId,
            trustLevel,
            sentimentVector,
            volatilityIndex,
            lastUpdate: new Date(),
            participantCount
        };
        this.pulseCache.set(deckId, pulseData);
        return pulseData;
    }
    getAllDecksPulseData() {
        const targetDecks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
        return targetDecks.map(deckId => this.getDeckPulseData(deckId));
    }
    addFeedbackEntry(entry) {
        this.feedbackVault.push(entry);
        // Invalidate cache for this deck
        this.pulseCache.delete(entry.deckId);
        console.log(`📊 New feedback entry added for deck ${entry.deckId}: ${entry.voteType}`);
    }
    startPeriodicUpdates() {
        // Update pulse data every 30 seconds with minor fluctuations
        this.updateInterval = setInterval(() => {
            // Add some minor random feedback to simulate ongoing activity
            const targetDecks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
            const randomDeck = targetDecks[Math.floor(Math.random() * targetDecks.length)];
            if (Math.random() < 0.3) { // 30% chance of new feedback per cycle
                const mockEntry = {
                    id: `live_${Date.now()}`,
                    deckId: randomDeck,
                    userId: `user_live_${Math.floor(Math.random() * 5)}`,
                    voteType: Math.random() < 0.75 ? 'trust' : 'concern',
                    zkpHash: `zkp_live_${Date.now()}`,
                    timestamp: new Date(),
                    memoryAction: {
                        id: `live_action_${Date.now()}`,
                        action: this.getRandomAction(randomDeck),
                        value: 'Live Operation'
                    }
                };
                this.addFeedbackEntry(mockEntry);
            }
        }, 30000);
    }
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.pulseCache.clear();
        console.log('📊 PulseAggregationEngine destroyed');
    }
}
// Singleton instance
export const pulseEngine = new PulseAggregationEngine();
