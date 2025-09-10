/**
 * ZKPProofLedger.ts - Phase XXVIII Step 3
 *
 * Secure, auditable, and indexed ledger of all submitted ZKP mint requests
 * processed via ZKPUserMintExtension.ts. Maintains comprehensive audit trail
 * for DAO verification and Commander review.
 *
 * Features:
 * - Immutable proof record storage with timestamp tracking
 * - Status tracking (approved, rejected, pending) with reason codes
 * - Duplicate hash prevention per user/pillar combination
 * - ARIA narration integration via ZKPEventNarrator
 * - Performance optimized (<100ms write, <200ms read)
 * - Circular buffer management for large datasets (>1000 entries)
 *
 * Authority: Commander Mark | Phase XXVIII Step 3
 * Status: Secure ledger implementation with audit trail
 */
import { TruthCoinPillar } from '../tokenomics/TruthCoinsIntegration';
// ARIA Event Narrator for screen reader accessibility
export class ZKPEventNarrator {
    static instance;
    static getInstance() {
        if (!ZKPEventNarrator.instance) {
            ZKPEventNarrator.instance = new ZKPEventNarrator();
        }
        return ZKPEventNarrator.instance;
    }
    /**
     * Narrate ZKP proof ledger events for accessibility
     */
    narrateProofEvent(entry, eventType) {
        const pillarName = TruthCoinPillar[entry.pillar];
        const statusMessages = {
            'approved': `✅ ZKP proof approved for ${pillarName} pillar`,
            'rejected': `❌ ZKP proof rejected for ${pillarName} pillar`,
            'pending': `⏳ ZKP proof pending validation for ${pillarName} pillar`
        };
        const ariaMessage = `${statusMessages[entry.status]}. Entry ${eventType} in ledger.`;
        // Console logging for development
        console.log(`[ZKP_LEDGER] ${ariaMessage}`);
        // TTS integration (commented out to prevent audio spam)
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(ariaMessage);
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            // speechSynthesis.speak(utterance); // Uncomment for production TTS
        }
    }
    /**
     * Narrate ledger statistics for audit reports
     */
    narrateLedgerStats(stats) {
        const message = `📊 ZKP Ledger Summary: ${stats.total} total entries, ${stats.approved} approved, ${stats.rejected} rejected, ${stats.pending} pending`;
        console.log(`[ZKP_LEDGER_STATS] ${message}`);
    }
}
/**
 * ZKPProofLedger - Main ledger management class
 * Singleton pattern for application-wide proof tracking
 */
export class ZKPProofLedger {
    static instance;
    entries = [];
    maxEntries = 1000; // Circular buffer limit
    narrator;
    constructor() {
        this.narrator = ZKPEventNarrator.getInstance();
        this.initializeMockData();
    }
    static getInstance() {
        if (!ZKPProofLedger.instance) {
            ZKPProofLedger.instance = new ZKPProofLedger();
        }
        return ZKPProofLedger.instance;
    }
    /**
     * Initialize mock test data as specified in requirements
     * 6 entries: 4 valid (2 approved, 2 pending), 2 invalid (rejected)
     */
    initializeMockData() {
        const mockEntries = [
            // 2 Approved entries
            {
                requester: '0x1234567890123456789012345678901234567890',
                pillar: TruthCoinPillar.GOVERNANCE,
                zkpHash: 'zkp_governance_civic_participation_proof_a1b2c3',
                status: 'approved',
                processingTime: 850,
                commanderOverride: false
            },
            {
                requester: '0x2345678901234567890123456789012345678901',
                pillar: TruthCoinPillar.EDUCATION,
                zkpHash: 'zkp_education_knowledge_sharing_proof_d4e5f6',
                status: 'approved',
                processingTime: 720,
                commanderOverride: false
            },
            // 2 Pending entries
            {
                requester: '0x3456789012345678901234567890123456789012',
                pillar: TruthCoinPillar.HEALTH,
                zkpHash: 'zkp_health_community_wellness_proof_g7h8i9',
                status: 'pending',
                processingTime: 0
            },
            {
                requester: '0x4567890123456789012345678901234567890123',
                pillar: TruthCoinPillar.CULTURE,
                zkpHash: 'zkp_culture_artistic_contribution_proof_j1k2l3',
                status: 'pending',
                processingTime: 0
            },
            // 2 Rejected entries
            {
                requester: '0x5678901234567890123456789012345678901234',
                pillar: TruthCoinPillar.JUSTICE,
                zkpHash: 'invalid_zkp_hash_format_missing_pillar',
                status: 'rejected',
                reason: 'Invalid ZKP proof format - missing pillar identification',
                processingTime: 150
            },
            {
                requester: '0x6789012345678901234567890123456789012345',
                pillar: TruthCoinPillar.SCIENCE,
                zkpHash: 'zkp_science_duplicate_submission_xyz789',
                status: 'rejected',
                reason: 'Duplicate hash submission from same user/pillar combination',
                processingTime: 95
            }
        ];
        // Add mock entries with proper timestamps
        mockEntries.forEach((entry, index) => {
            const timestamp = new Date(Date.now() - (6 - index) * 60 * 60 * 1000); // 6 hours ago to 1 hour ago
            this.addEntryInternal({
                ...entry,
                id: this.generateId(),
                timestamp: timestamp.toISOString()
            });
        });
        console.log(`🔄 ZKPProofLedger initialized with ${this.entries.length} mock entries`);
    }
    /**
     * Generate unique entry ID
     */
    generateId() {
        return `zkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Internal method to add entry without duplicate checking (for initialization)
     */
    addEntryInternal(entry) {
        // Circular buffer management
        if (this.entries.length >= this.maxEntries) {
            this.entries.shift(); // Remove oldest entry
            console.log(`🔄 Circular buffer: Removed oldest entry to maintain ${this.maxEntries} limit`);
        }
        this.entries.push(entry);
    }
    /**
     * Record new ZKP proof with duplicate prevention
     * Performance target: <100ms write time
     */
    recordProof(requester, pillar, zkpHash, status, reason, processingTime, commanderOverride = false) {
        const startTime = Date.now();
        try {
            // Check for duplicate hash from same user/pillar combination
            const existingEntry = this.entries.find(entry => entry.requester === requester &&
                entry.pillar === pillar &&
                entry.zkpHash === zkpHash);
            if (existingEntry) {
                console.warn(`⚠️ Duplicate ZKP hash rejected: ${zkpHash.substring(0, 16)}... from ${requester.substring(0, 8)}...`);
                return false;
            }
            // Create new entry
            const entry = {
                id: this.generateId(),
                requester,
                pillar,
                zkpHash,
                timestamp: new Date().toISOString(),
                status,
                reason,
                processingTime,
                commanderOverride
            };
            // Add to ledger
            this.addEntryInternal(entry);
            // Narrate event for accessibility
            this.narrator.narrateProofEvent(entry, 'recorded');
            const writeTime = Date.now() - startTime;
            console.log(`✅ ZKP proof recorded in ${writeTime}ms: ${TruthCoinPillar[pillar]} - ${status}`);
            return true;
        }
        catch (error) {
            const writeTime = Date.now() - startTime;
            console.error(`❌ Failed to record ZKP proof in ${writeTime}ms:`, error);
            return false;
        }
    }
    /**
     * Get all proofs by user address
     * Performance target: <200ms read time
     */
    getProofsByUser(userAddress) {
        const startTime = Date.now();
        try {
            const userProofs = this.entries.filter(entry => entry.requester === userAddress);
            const readTime = Date.now() - startTime;
            console.log(`📊 Retrieved ${userProofs.length} proofs for user ${userAddress.substring(0, 8)}... in ${readTime}ms`);
            return userProofs;
        }
        catch (error) {
            const readTime = Date.now() - startTime;
            console.error(`❌ Failed to retrieve user proofs in ${readTime}ms:`, error);
            return [];
        }
    }
    /**
     * Get all proofs in the ledger
     * Performance target: <200ms read time
     */
    getAllProofs() {
        const startTime = Date.now();
        try {
            const allProofs = [...this.entries]; // Return copy to prevent external modification
            const readTime = Date.now() - startTime;
            console.log(`📊 Retrieved all ${allProofs.length} proofs in ${readTime}ms`);
            return allProofs;
        }
        catch (error) {
            const readTime = Date.now() - startTime;
            console.error(`❌ Failed to retrieve all proofs in ${readTime}ms:`, error);
            return [];
        }
    }
    /**
     * Get proofs by status
     */
    getProofsByStatus(status) {
        return this.entries.filter(entry => entry.status === status);
    }
    /**
     * Get proofs by pillar
     */
    getProofsByPillar(pillar) {
        return this.entries.filter(entry => entry.pillar === pillar);
    }
    /**
     * Update existing proof status (for Commander override)
     */
    updateProofStatus(entryId, newStatus, reason, commanderOverride = false) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) {
            console.warn(`⚠️ Entry not found for update: ${entryId}`);
            return false;
        }
        entry.status = newStatus;
        if (reason)
            entry.reason = reason;
        entry.commanderOverride = commanderOverride;
        this.narrator.narrateProofEvent(entry, 'updated');
        console.log(`🔄 Entry ${entryId} updated to ${newStatus}`);
        return true;
    }
    /**
     * Get ledger statistics for audit reports
     */
    getLedgerStats() {
        const stats = {
            total: this.entries.length,
            approved: this.getProofsByStatus('approved').length,
            rejected: this.getProofsByStatus('rejected').length,
            pending: this.getProofsByStatus('pending').length,
            averageProcessingTime: 0,
            commanderOverrides: this.entries.filter(e => e.commanderOverride).length
        };
        // Calculate average processing time (excluding pending)
        const processedEntries = this.entries.filter(e => e.processingTime && e.processingTime > 0);
        if (processedEntries.length > 0) {
            stats.averageProcessingTime = Math.round(processedEntries.reduce((sum, e) => sum + (e.processingTime || 0), 0) / processedEntries.length);
        }
        this.narrator.narrateLedgerStats(stats);
        return stats;
    }
    /**
     * Clear all entries (for testing purposes only)
     */
    clearLedger() {
        this.entries = [];
        console.log('🧹 ZKP Proof Ledger cleared');
    }
    /**
     * Export ledger to JSON (future IPFS integration point)
     */
    exportToJSON() {
        return JSON.stringify({
            metadata: {
                exportTimestamp: new Date().toISOString(),
                totalEntries: this.entries.length,
                version: 'Phase_XXVIII_Step_3'
            },
            entries: this.entries
        }, null, 2);
    }
}
// Export singleton instance
export const zkpProofLedger = ZKPProofLedger.getInstance();
// Export types for integration
export { TruthCoinPillar };
/**
 * Integration function for ZKPUserMintExtension.ts
 * Call this from mint processing cycles
 */
export function recordZKPMintAttempt(requester, pillar, zkpHash, approved, processingTime, failureReason) {
    const status = approved ? 'approved' : 'rejected';
    const reason = approved ? undefined : failureReason;
    return zkpProofLedger.recordProof(requester, pillar, zkpHash, status, reason, processingTime, false // Not a commander override
    );
}
