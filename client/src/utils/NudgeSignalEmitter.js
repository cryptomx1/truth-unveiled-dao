/**
 * NudgeSignalEmitter.ts
 * Phase PRESS-REPLAY Step 3 - Nudge Generation with TrustCoin Rewards
 * Authority: Commander Mark via JASMY Relay System
 */
class NudgeSignalEmitter {
    nudgeQueue = [];
    engagementLog = [];
    MAX_QUEUE_SIZE = 50;
    constructor() {
        this.initializeNudgeSystem();
    }
    /**
     * Initialize the nudge system with console telemetry
     */
    initializeNudgeSystem() {
        console.log('📣 NudgeSignalEmitter: System initialized');
        console.log('💰 TrustCoin reward hooks activated for citizen engagement');
        // Load existing nudges from storage
        const stored = localStorage.getItem('nudgeSignalQueue');
        if (stored) {
            this.nudgeQueue = JSON.parse(stored).map((nudge) => ({
                ...nudge,
                timestamp: new Date(nudge.timestamp)
            }));
        }
        // Load engagement log
        const engagementStored = localStorage.getItem('citizenEngagementLog');
        if (engagementStored) {
            this.engagementLog = JSON.parse(engagementStored).map((log) => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }));
        }
    }
    /**
     * Generate nudge based on dissonance score
     */
    generateNudge(representativeId, representativeName, dissonanceLevel, dissonanceScore, issueContext) {
        const nudgeId = `nudge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Generate contextual nudge message based on dissonance level
        const nudgeMessage = this.generateNudgeMessage(representativeName, dissonanceLevel, dissonanceScore, issueContext);
        // Calculate TrustCoin reward based on dissonance severity
        const trustCoinReward = this.calculateTrustCoinReward(dissonanceLevel, dissonanceScore);
        const nudgeSignal = {
            id: nudgeId,
            representativeId,
            representativeName,
            dissonanceLevel,
            dissonanceScore,
            nudgeMessage,
            trustCoinReward,
            actionUrl: `/command?action=engage&rep=${representativeId}&nudge=${nudgeId}`,
            timestamp: new Date(),
            status: 'pending',
            engagementCount: 0
        };
        // Add to queue
        this.nudgeQueue.unshift(nudgeSignal);
        // Maintain queue size
        if (this.nudgeQueue.length > this.MAX_QUEUE_SIZE) {
            this.nudgeQueue = this.nudgeQueue.slice(0, this.MAX_QUEUE_SIZE);
        }
        // Persist to storage
        this.persistNudgeQueue();
        console.log(`📣 Nudge generated for ${representativeName}:`, {
            dissonanceLevel,
            dissonanceScore,
            trustCoinReward,
            message: nudgeMessage
        });
        return nudgeSignal;
    }
    /**
     * Generate contextual nudge message
     */
    generateNudgeMessage(repName, level, score, context) {
        const messages = {
            red: [
                `📣 Time to listen, ${repName}! Your constituents need to hear from you on ${context || 'key issues'}.`,
                `🚨 Major disconnect detected: ${repName}, your district is calling for action!`,
                `📢 ${repName}: Bridge the gap — your constituents are 68% misaligned with your recent votes.`,
                `⚡ Urgent: ${repName}, engage with your district on ${context || 'critical policy matters'}.`
            ],
            yellow: [
                `⚠️ ${repName}, there's room to better align with constituent priorities on ${context || 'recent issues'}.`,
                `📊 Heads up, ${repName}: Consider addressing the ${score}% alignment gap with your district.`,
                `💭 ${repName}: Your constituents have questions about ${context || 'your recent positions'}.`,
                `🔄 Time for a check-in, ${repName} — reconnect with your district's priorities.`
            ],
            green: [
                `✅ Great alignment, ${repName}! Keep up the strong constituent connection.`,
                `🎯 ${repName}: Your district appreciates your consistent representation.`,
                `💚 Well done, ${repName} — you're effectively representing constituent interests.`
            ]
        };
        const levelMessages = messages[level];
        return levelMessages[Math.floor(Math.random() * levelMessages.length)];
    }
    /**
     * Calculate TrustCoin reward based on engagement difficulty
     */
    calculateTrustCoinReward(level, score) {
        const baseRewards = {
            green: 25,
            yellow: 75,
            red: 150
        };
        const baseReward = baseRewards[level];
        const scoreMultiplier = level === 'red' ? Math.min(2.0, score / 50) : 1.0;
        return Math.round(baseReward * scoreMultiplier);
    }
    /**
     * Record citizen engagement with nudge
     */
    recordEngagement(citizenId, nudgeId, engagementType) {
        const nudge = this.nudgeQueue.find(n => n.id === nudgeId);
        if (!nudge) {
            throw new Error(`Nudge ${nudgeId} not found`);
        }
        // Calculate TrustCoins earned based on engagement type
        const engagementRewards = {
            view: Math.round(nudge.trustCoinReward * 0.1),
            comment: Math.round(nudge.trustCoinReward * 0.3),
            share: Math.round(nudge.trustCoinReward * 0.5),
            action: nudge.trustCoinReward // Full reward for direct action
        };
        const engagement = {
            citizenId,
            nudgeId,
            engagementType,
            trustCoinsEarned: engagementRewards[engagementType],
            timestamp: new Date()
        };
        // Update nudge status
        nudge.engagementCount += 1;
        nudge.status = 'engaged';
        // Log engagement
        this.engagementLog.unshift(engagement);
        // Persist changes
        this.persistNudgeQueue();
        this.persistEngagementLog();
        console.log(`💰 TrustCoin reward earned: ${engagement.trustCoinsEarned} TC for ${engagementType} engagement`);
        console.log(`📈 Nudge ${nudgeId} engagement count: ${nudge.engagementCount}`);
        return engagement;
    }
    /**
     * Get active nudges
     */
    getActiveNudges() {
        return this.nudgeQueue.filter(nudge => nudge.status !== 'expired');
    }
    /**
     * Get nudges by representative
     */
    getNudgesForRepresentative(representativeId) {
        return this.nudgeQueue.filter(nudge => nudge.representativeId === representativeId);
    }
    /**
     * Get citizen engagement history
     */
    getCitizenEngagementHistory(citizenId) {
        return this.engagementLog.filter(log => log.citizenId === citizenId);
    }
    /**
     * Calculate total TrustCoins earned by citizen
     */
    calculateTotalTrustCoinsEarned(citizenId) {
        return this.engagementLog
            .filter(log => log.citizenId === citizenId)
            .reduce((total, log) => total + log.trustCoinsEarned, 0);
    }
    /**
     * Expire old nudges (24 hours)
     */
    expireOldNudges() {
        const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
        const now = new Date();
        let expiredCount = 0;
        this.nudgeQueue.forEach(nudge => {
            if (now.getTime() - nudge.timestamp.getTime() > expirationTime) {
                nudge.status = 'expired';
                expiredCount++;
            }
        });
        if (expiredCount > 0) {
            console.log(`⏰ Expired ${expiredCount} old nudges`);
            this.persistNudgeQueue();
        }
    }
    /**
     * Get nudge statistics
     */
    getNudgeStatistics() {
        const stats = {
            total: this.nudgeQueue.length,
            pending: this.nudgeQueue.filter(n => n.status === 'pending').length,
            sent: this.nudgeQueue.filter(n => n.status === 'sent').length,
            engaged: this.nudgeQueue.filter(n => n.status === 'engaged').length,
            expired: this.nudgeQueue.filter(n => n.status === 'expired').length,
            totalEngagements: this.engagementLog.length,
            totalTrustCoinsDistributed: this.engagementLog.reduce((sum, log) => sum + log.trustCoinsEarned, 0)
        };
        return stats;
    }
    /**
     * Persist nudge queue to storage
     */
    persistNudgeQueue() {
        localStorage.setItem('nudgeSignalQueue', JSON.stringify(this.nudgeQueue));
    }
    /**
     * Persist engagement log to storage
     */
    persistEngagementLog() {
        localStorage.setItem('citizenEngagementLog', JSON.stringify(this.engagementLog));
    }
}
// Export singleton instance
export const nudgeSignalEmitter = new NudgeSignalEmitter();
