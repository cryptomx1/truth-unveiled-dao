import { pulseEngine } from './PulseAggregationEngine';
import { SentimentLedgerEngine } from '@/components/ledger/SentimentLedgerEngine';
class PulseNarrationNode {
    previousStates = new Map();
    narrationInterval = null;
    statusCheckInterval = null;
    isActive = false;
    ariaLiveRegion = null;
    dailyDigestInterval = null;
    lastDigestDate = '';
    // Deck name mappings for better narration
    deckNames = {
        wallet_overview: 'Wallet Overview',
        civic_identity: 'Civic Identity',
        consensus_layer: 'Consensus Layer',
        civic_memory: 'Civic Memory'
    };
    constructor() {
        this.createAriaLiveRegion();
        console.log('🔊 PulseNarrationNode initialized with ARIA live region support');
    }
    createAriaLiveRegion() {
        // Create ARIA live region for accessibility announcements
        this.ariaLiveRegion = document.createElement('div');
        this.ariaLiveRegion.setAttribute('aria-live', 'polite');
        this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
        this.ariaLiveRegion.setAttribute('id', 'pulse-narration-live-region');
        this.ariaLiveRegion.style.position = 'absolute';
        this.ariaLiveRegion.style.left = '-10000px';
        this.ariaLiveRegion.style.width = '1px';
        this.ariaLiveRegion.style.height = '1px';
        this.ariaLiveRegion.style.overflow = 'hidden';
        document.body.appendChild(this.ariaLiveRegion);
    }
    start() {
        if (this.isActive)
            return;
        this.isActive = true;
        console.log('🔊 PulseNarrationNode started - monitoring trust pulse changes');
        // Initialize current states
        const targetDecks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
        targetDecks.forEach(deckId => {
            const pulseData = pulseEngine.getDeckPulseData(deckId);
            this.previousStates.set(deckId, pulseData);
        });
        // Check for status changes every 30 seconds
        this.statusCheckInterval = setInterval(() => {
            this.checkStatusChanges();
        }, 30000);
        // Periodic narration every 60 seconds
        this.narrationInterval = setInterval(() => {
            this.performPeriodicNarration();
        }, 60000);
        // Daily digest announcements every 24 hours
        this.dailyDigestInterval = setInterval(() => {
            this.announceDailyDigest();
        }, 24 * 60 * 60 * 1000);
        // Check for daily digest on start
        this.checkAndAnnounceDailyDigest();
    }
    stop() {
        this.isActive = false;
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
        if (this.narrationInterval) {
            clearInterval(this.narrationInterval);
            this.narrationInterval = null;
        }
        if (this.dailyDigestInterval) {
            clearInterval(this.dailyDigestInterval);
            this.dailyDigestInterval = null;
        }
        console.log('🔊 PulseNarrationNode stopped');
    }
    checkStatusChanges() {
        if (!this.isActive)
            return;
        const targetDecks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
        const statusChanges = [];
        targetDecks.forEach(deckId => {
            const currentData = pulseEngine.getDeckPulseData(deckId);
            const previousData = this.previousStates.get(deckId);
            if (previousData) {
                const currentStatus = this.getTrustStatus(currentData.trustLevel);
                const previousStatus = this.getTrustStatus(previousData.trustLevel);
                const trustChange = Math.abs(currentData.trustLevel - previousData.trustLevel);
                // Announce if status changed or trust level changed by more than 10%
                if (currentStatus !== previousStatus || trustChange >= 10) {
                    statusChanges.push({
                        deckId,
                        deckName: this.deckNames[deckId] || deckId,
                        previousStatus,
                        currentStatus,
                        trustLevel: currentData.trustLevel,
                        changeThreshold: trustChange,
                        timestamp: new Date()
                    });
                }
            }
            // Update previous state
            this.previousStates.set(deckId, currentData);
        });
        // Announce significant changes
        if (statusChanges.length > 0) {
            this.announceStatusChanges(statusChanges);
        }
    }
    getTrustStatus(trustLevel) {
        if (trustLevel > 70)
            return 'stable';
        if (trustLevel >= 50)
            return 'moderate';
        if (trustLevel >= 30)
            return 'concerning';
        return 'unstable';
    }
    announceStatusChanges(changes) {
        changes.forEach(change => {
            const message = this.generateStatusChangeMessage(change);
            this.announceToAriaRegion(message);
            console.log(`🔊 Pulse Status Change: ${message}`);
        });
    }
    generateStatusChangeMessage(change) {
        const { deckName, currentStatus, trustLevel, changeThreshold } = change;
        let message = `Trust Pulse on ${deckName} now ${currentStatus}`;
        // Add specific trust level for significant changes
        if (changeThreshold >= 15) {
            message += ` at ${trustLevel.toFixed(0)} percent`;
        }
        // Add trend information for large changes
        if (changeThreshold >= 20) {
            message += ` - significant change detected`;
        }
        return message;
    }
    performPeriodicNarration() {
        if (!this.isActive)
            return;
        const allDecks = pulseEngine.getAllDecksPulseData();
        const systemSummary = this.generateSystemSummary(allDecks);
        this.announceToAriaRegion(systemSummary);
        console.log(`🔊 Periodic Pulse Summary: ${systemSummary}`);
    }
    generateSystemSummary(allDecks) {
        const overallTrust = allDecks.reduce((sum, deck) => sum + deck.trustLevel, 0) / allDecks.length;
        const unstableDecks = allDecks.filter(deck => deck.trustLevel < 50);
        const stableDecks = allDecks.filter(deck => deck.trustLevel > 70);
        let summary = `System trust pulse: ${overallTrust.toFixed(0)} percent overall`;
        if (unstableDecks.length > 0) {
            summary += `. ${unstableDecks.length} deck${unstableDecks.length > 1 ? 's' : ''} requiring attention`;
        }
        else if (stableDecks.length === allDecks.length) {
            summary += `. All decks stable`;
        }
        else {
            summary += `. ${stableDecks.length} of ${allDecks.length} decks stable`;
        }
        return summary;
    }
    // Phase XV: Daily Digest Announcements
    checkAndAnnounceDailyDigest() {
        const today = new Date().toISOString().split('T')[0];
        if (this.lastDigestDate !== today) {
            this.lastDigestDate = today;
            this.announceDailyDigest();
        }
    }
    announceDailyDigest() {
        const today = new Date().toISOString().split('T')[0];
        const dailyDigest = SentimentLedgerEngine.getDailyDigest(today);
        if (dailyDigest) {
            const message = `📊 Daily Civic Digest for ${this.formatDigestDate(today)}: ${dailyDigest.totalEntries} trust entries recorded. Average trust level: ${dailyDigest.averageTrust.toFixed(1)} percent. Maximum volatility: ${dailyDigest.maxVolatility.toFixed(1)} percent. Civic sentiment ledger verification complete.`;
            this.announceToAriaRegion(message);
            console.log(`🔊 Daily Digest: ${message}`);
        }
        else {
            // Check yesterday's digest if today has no entries yet
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const yesterdayDigest = SentimentLedgerEngine.getDailyDigest(yesterdayStr);
            if (yesterdayDigest) {
                const message = `📊 Latest Civic Digest for ${this.formatDigestDate(yesterdayStr)}: ${yesterdayDigest.totalEntries} trust entries. Average: ${yesterdayDigest.averageTrust.toFixed(1)} percent trust, ${yesterdayDigest.maxVolatility.toFixed(1)} percent volatility. Ledger synchronized.`;
                this.announceToAriaRegion(message);
                console.log(`🔊 Yesterday's Digest: ${message}`);
            }
        }
    }
    formatDigestDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }
    announceToAriaRegion(message) {
        if (this.ariaLiveRegion) {
            // Clear and then set the message to ensure screen readers announce it
            this.ariaLiveRegion.textContent = '';
            setTimeout(() => {
                if (this.ariaLiveRegion) {
                    this.ariaLiveRegion.textContent = message;
                }
            }, 100);
        }
    }
    announceCustomMessage(deckId, message) {
        const deckName = this.deckNames[deckId] || deckId;
        const fullMessage = `${deckName}: ${message}`;
        this.announceToAriaRegion(fullMessage);
        console.log(`🔊 Custom Pulse Announcement: ${fullMessage}`);
    }
    announceImmediateChange(deckId, trustLevel, previousLevel) {
        const deckName = this.deckNames[deckId] || deckId;
        const change = trustLevel - previousLevel;
        const direction = change > 0 ? 'increased' : 'decreased';
        const magnitude = Math.abs(change);
        if (magnitude >= 10) {
            const message = `${deckName} trust ${direction} by ${magnitude.toFixed(1)} percent to ${trustLevel.toFixed(1)} percent`;
            this.announceToAriaRegion(message);
            console.log(`🔊 Immediate Trust Change: ${message}`);
        }
    }
    destroy() {
        this.stop();
        if (this.ariaLiveRegion && this.ariaLiveRegion.parentNode) {
            this.ariaLiveRegion.parentNode.removeChild(this.ariaLiveRegion);
            this.ariaLiveRegion = null;
        }
        this.previousStates.clear();
        console.log('🔊 PulseNarrationNode destroyed');
    }
    // Utility methods for integration with other components
    getCurrentStatus(deckId) {
        const pulseData = pulseEngine.getDeckPulseData(deckId);
        return this.getTrustStatus(pulseData.trustLevel);
    }
    getSystemHealth() {
        const allDecks = pulseEngine.getAllDecksPulseData();
        const stableCount = allDecks.filter(deck => deck.trustLevel > 70).length;
        let overallStatus = 'stable';
        if (stableCount < allDecks.length / 2)
            overallStatus = 'concerning';
        if (stableCount === 0)
            overallStatus = 'critical';
        return {
            overallStatus,
            stabilityCount: stableCount,
            totalDecks: allDecks.length
        };
    }
}
// Singleton instance
export const pulseNarrationNode = new PulseNarrationNode();
// Auto-start narration node
pulseNarrationNode.start();
