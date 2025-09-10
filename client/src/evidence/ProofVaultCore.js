/**
 * ProofVaultCore.ts - Phase XXVI
 * Secure Storage Layer for Cryptographic Evidence Capsules
 * Authority: Commander Mark via JASMY Relay
 */
import { EvidenceCaptureEngine } from './EvidenceCaptureEngine';
// Main Proof Vault Core class
export class ProofVaultCore {
    static instance;
    vaultStorage = new Map();
    lastIntegrityScan = '';
    maxVaultSize = 50000; // Maximum vault entries
    scanInterval = 2592000000; // 30 days in milliseconds
    constructor() {
        console.log('🗄️ ProofVaultCore initialized for secure evidence capsule storage');
        this.initializeVaultWithMockData();
        this.scheduleIntegrityScan();
    }
    static getInstance() {
        if (!ProofVaultCore.instance) {
            ProofVaultCore.instance = new ProofVaultCore();
        }
        return ProofVaultCore.instance;
    }
    // Store proof capsule in vault
    storeProofCapsule(capsule, requestedBy = 'system') {
        const entryId = this.generateEntryId();
        const storedAt = new Date().toISOString();
        const vaultEntry = {
            entryId,
            capsule,
            storedAt,
            accessCount: 0,
            lastAccessed: storedAt,
            integrityStatus: 'valid',
            backupHash: this.generateBackupHash(capsule),
            exportHistory: []
        };
        this.vaultStorage.set(entryId, vaultEntry);
        // Maintain vault size
        if (this.vaultStorage.size > this.maxVaultSize) {
            this.cleanupOldestEntries(1000); // Remove oldest 1000 entries
        }
        console.log(`🗄️ Proof capsule stored — Entry: ${entryId} | Mission: ${capsule.missionId} | Hash: ${capsule.evidenceDigest.substring(0, 16)}...`);
        return vaultEntry;
    }
    // Batch store multiple capsules
    batchStoreProofCapsules(capsules, requestedBy = 'system') {
        const startTime = performance.now();
        const entries = [];
        capsules.forEach(capsule => {
            const entry = this.storeProofCapsule(capsule, requestedBy);
            entries.push(entry);
        });
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        console.log(`🗄️ Batch storage completed — ${capsules.length} capsules stored | Duration: ${duration}ms`);
        return entries;
    }
    // Retrieve vault entry by ID
    getVaultEntry(entryId) {
        const entry = this.vaultStorage.get(entryId);
        if (entry) {
            // Update access tracking
            entry.accessCount++;
            entry.lastAccessed = new Date().toISOString();
            this.vaultStorage.set(entryId, entry);
        }
        return entry || null;
    }
    // Search vault entries
    searchVaultEntries(params) {
        let entries = Array.from(this.vaultStorage.values());
        // Apply filters
        if (params.eventType) {
            entries = entries.filter(entry => entry.capsule.metadata.eventType === params.eventType);
        }
        if (params.missionId) {
            entries = entries.filter(entry => entry.capsule.missionId === params.missionId);
        }
        if (params.deckId) {
            entries = entries.filter(entry => entry.capsule.deckId === params.deckId);
        }
        if (params.userHash) {
            entries = entries.filter(entry => entry.capsule.userHash === params.userHash);
        }
        if (params.dateFrom) {
            const fromDate = new Date(params.dateFrom).getTime();
            entries = entries.filter(entry => new Date(entry.capsule.timestamp).getTime() >= fromDate);
        }
        if (params.dateTo) {
            const toDate = new Date(params.dateTo).getTime();
            entries = entries.filter(entry => new Date(entry.capsule.timestamp).getTime() <= toDate);
        }
        if (params.validationLevel) {
            entries = entries.filter(entry => entry.capsule.metadata.validationLevel === params.validationLevel);
        }
        if (params.completionStatus) {
            entries = entries.filter(entry => entry.capsule.metadata.completionStatus === params.completionStatus);
        }
        if (params.integrityStatus) {
            entries = entries.filter(entry => entry.integrityStatus === params.integrityStatus);
        }
        // Sort by timestamp (newest first)
        entries.sort((a, b) => new Date(b.capsule.timestamp).getTime() - new Date(a.capsule.timestamp).getTime());
        // Apply limit
        if (params.limit && params.limit > 0) {
            entries = entries.slice(0, params.limit);
        }
        console.log(`🔍 Vault search completed — ${entries.length} entries found | Filters applied: ${Object.keys(params).length}`);
        return entries;
    }
    // Export single capsule as .zkp-evidence.json
    exportSingleCapsule(entryId, requestedBy) {
        const entry = this.getVaultEntry(entryId);
        if (!entry) {
            return {
                success: false,
                filename: '',
                error: `Vault entry not found: ${entryId}`
            };
        }
        const filename = `${entry.capsule.missionId}-evidence-${Date.now()}.zkp-evidence.json`;
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportType: 'single_capsule',
            filename,
            vaultEntry: entry,
            proofCapsule: entry.capsule,
            integrityVerification: {
                backupHash: entry.backupHash,
                verifiedAt: new Date().toISOString(),
                integrityStatus: entry.integrityStatus
            }
        };
        // Record export
        const exportRecord = {
            exportId: this.generateExportId(),
            exportedAt: new Date().toISOString(),
            exportType: 'single',
            filename,
            requestedBy,
            downloadCount: 0
        };
        entry.exportHistory.push(exportRecord);
        this.vaultStorage.set(entryId, entry);
        console.log(`📥 Single capsule export — ${filename} | Entry: ${entryId} | Requested by: ${requestedBy}`);
        return {
            success: true,
            filename,
            data: JSON.stringify(exportData, null, 2)
        };
    }
    // Export search results as batch
    exportSearchResults(searchParams, requestedBy) {
        const entries = this.searchVaultEntries(searchParams);
        if (entries.length === 0) {
            return {
                success: false,
                filename: '',
                entryCount: 0,
                error: 'No entries found matching search criteria'
            };
        }
        const filename = `vault-export-${Date.now()}.zkp-evidence.json`;
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportType: 'batch_search',
            filename,
            searchParams,
            entryCount: entries.length,
            vaultEntries: entries,
            integrityVerification: {
                totalEntries: entries.length,
                validEntries: entries.filter(e => e.integrityStatus === 'valid').length,
                corruptedEntries: entries.filter(e => e.integrityStatus === 'corrupted').length,
                verifiedAt: new Date().toISOString()
            }
        };
        // Record export for all entries
        const exportRecord = {
            exportId: this.generateExportId(),
            exportedAt: new Date().toISOString(),
            exportType: 'batch',
            filename,
            requestedBy,
            downloadCount: 0
        };
        entries.forEach(entry => {
            entry.exportHistory.push(exportRecord);
            this.vaultStorage.set(entry.entryId, entry);
        });
        console.log(`📥 Batch export completed — ${filename} | Entries: ${entries.length} | Requested by: ${requestedBy}`);
        return {
            success: true,
            filename,
            data: JSON.stringify(exportData, null, 2),
            entryCount: entries.length
        };
    }
    // Export user bundle
    exportUserBundle(userHash, requestedBy) {
        const userEntries = this.searchVaultEntries({ userHash });
        if (userEntries.length === 0) {
            return {
                success: false,
                filename: '',
                entryCount: 0,
                error: `No entries found for user: ${userHash}`
            };
        }
        const filename = `${userHash}-civic-bundle-${Date.now()}.zkp-evidence.json`;
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportType: 'user_bundle',
            filename,
            userHash,
            entryCount: userEntries.length,
            civicProfile: this.generateCivicProfile(userEntries),
            vaultEntries: userEntries,
            summary: {
                missionCompletions: userEntries.filter(e => e.capsule.metadata.eventType === 'mission_completion').length,
                votesCast: userEntries.filter(e => e.capsule.metadata.eventType === 'vote_cast').length,
                feedbackSubmissions: userEntries.filter(e => e.capsule.metadata.eventType === 'feedback_submitted').length,
                identityVerifications: userEntries.filter(e => e.capsule.metadata.eventType === 'identity_verified').length,
                totalWitnesses: userEntries.reduce((sum, e) => sum + e.capsule.metadata.witnessCount, 0),
                averageTrustScore: userEntries.reduce((sum, e) => sum + e.capsule.metadata.trustScore, 0) / userEntries.length
            }
        };
        console.log(`📥 User bundle export — ${filename} | User: ${userHash} | Entries: ${userEntries.length}`);
        return {
            success: true,
            filename,
            data: JSON.stringify(exportData, null, 2),
            entryCount: userEntries.length
        };
    }
    // Run integrity scan
    runIntegrityScan() {
        const scanId = `scan-${Date.now()}`;
        const scannedAt = new Date().toISOString();
        const entries = Array.from(this.vaultStorage.values());
        let validEntries = 0;
        let corruptedEntries = 0;
        let expiredEntries = 0;
        let needsSyncEntries = 0;
        const corruptedIds = [];
        const recommendations = [];
        const captureEngine = EvidenceCaptureEngine.getInstance();
        entries.forEach(entry => {
            // Verify capsule integrity
            const verification = captureEngine.verifyProofCapsule(entry.capsule);
            if (!verification.isValid) {
                entry.integrityStatus = 'corrupted';
                corruptedEntries++;
                corruptedIds.push(entry.entryId);
            }
            else {
                // Check if entry is expired (1 year old)
                const entryAge = Date.now() - new Date(entry.capsule.timestamp).getTime();
                const oneYear = 365 * 24 * 60 * 60 * 1000;
                if (entryAge > oneYear) {
                    entry.integrityStatus = 'expired';
                    expiredEntries++;
                }
                else if (entry.integrityStatus === 'needs_sync') {
                    needsSyncEntries++;
                }
                else {
                    entry.integrityStatus = 'valid';
                    validEntries++;
                }
            }
            this.vaultStorage.set(entry.entryId, entry);
        });
        // Generate recommendations
        if (corruptedEntries > 0) {
            recommendations.push(`${corruptedEntries} corrupted entries detected - consider backup restoration`);
        }
        if (expiredEntries > 0) {
            recommendations.push(`${expiredEntries} entries expired - archive or extend retention`);
        }
        if (needsSyncEntries > 0) {
            recommendations.push(`${needsSyncEntries} entries need synchronization - run sync process`);
        }
        if (entries.length > this.maxVaultSize * 0.9) {
            recommendations.push('Vault approaching capacity - consider archiving old entries');
        }
        this.lastIntegrityScan = scannedAt;
        const result = {
            scanId,
            scannedAt,
            totalEntries: entries.length,
            validEntries,
            corruptedEntries,
            expiredEntries,
            needsSyncEntries,
            corruptedIds,
            recommendations,
            nextScanDue: new Date(Date.now() + this.scanInterval).toISOString()
        };
        console.log(`🔍 Integrity scan completed — ${scanId} | Valid: ${validEntries}/${entries.length} | Corrupted: ${corruptedEntries} | Expired: ${expiredEntries}`);
        return result;
    }
    // Get vault statistics
    getVaultStatistics() {
        const entries = Array.from(this.vaultStorage.values());
        const integrityBreakdown = {
            valid: 0,
            needs_sync: 0,
            corrupted: 0,
            expired: 0
        };
        const eventTypeBreakdown = {
            mission_completion: 0,
            deck_unlock: 0,
            civic_interaction: 0,
            vote_cast: 0,
            feedback_submitted: 0,
            identity_verified: 0,
            tier_advancement: 0,
            dispute_resolution: 0,
            dao_participation: 0,
            cross_validation: 0
        };
        const validationLevelBreakdown = {};
        let totalAccessCount = 0;
        entries.forEach(entry => {
            integrityBreakdown[entry.integrityStatus]++;
            eventTypeBreakdown[entry.capsule.metadata.eventType]++;
            validationLevelBreakdown[entry.capsule.metadata.validationLevel] =
                (validationLevelBreakdown[entry.capsule.metadata.validationLevel] || 0) + 1;
            totalAccessCount += entry.accessCount;
        });
        // Calculate storage size (approximate)
        const storageSize = entries.reduce((size, entry) => {
            return size + JSON.stringify(entry).length;
        }, 0);
        // Recent activity (last 24 hours)
        const oneDayAgo = Date.now() - 86400000;
        const recentActivity = entries.filter(entry => new Date(entry.storedAt).getTime() > oneDayAgo).length;
        // Find oldest and newest entries
        const timestamps = entries.map(entry => entry.capsule.timestamp).sort();
        const oldestEntry = timestamps[0] || '';
        const newestEntry = timestamps[timestamps.length - 1] || '';
        return {
            totalEntries: entries.length,
            storageSize,
            integrityBreakdown,
            eventTypeBreakdown,
            validationLevelBreakdown,
            recentActivity,
            oldestEntry,
            newestEntry,
            averageAccessCount: entries.length > 0 ? totalAccessCount / entries.length : 0
        };
    }
    // Initialize vault with mock data
    initializeVaultWithMockData() {
        const captureEngine = EvidenceCaptureEngine.getInstance();
        const mockCapsules = captureEngine.exportAllCapsules().capsules;
        mockCapsules.forEach(capsule => {
            this.storeProofCapsule(capsule, 'system');
        });
        console.log(`🗄️ Vault initialized with mock data — ${mockCapsules.length} capsules loaded`);
    }
    // Schedule periodic integrity scan
    scheduleIntegrityScan() {
        // Run initial scan
        setTimeout(() => {
            this.runIntegrityScan();
        }, 5000); // 5 seconds after initialization
        // Schedule regular scans
        setInterval(() => {
            console.log('🔍 Running scheduled integrity scan...');
            this.runIntegrityScan();
        }, this.scanInterval);
        console.log(`🗄️ Integrity scan scheduled — Every ${this.scanInterval / (24 * 60 * 60 * 1000)} days`);
    }
    // Generate entry ID
    generateEntryId() {
        return `vault-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }
    // Generate export ID
    generateExportId() {
        return `export-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
    // Generate backup hash
    generateBackupHash(capsule) {
        const backupInput = `${capsule.eventId}:${capsule.evidenceDigest}:${capsule.timestamp}`;
        return `backup-${this.simpleHash(backupInput)}`;
    }
    // Simple hash function
    simpleHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
    // Generate civic profile
    generateCivicProfile(entries) {
        const completedMissions = entries
            .filter(e => e.capsule.metadata.eventType === 'mission_completion')
            .map(e => e.capsule.missionId);
        const averageTrustScore = entries.reduce((sum, e) => sum + e.capsule.metadata.trustScore, 0) / entries.length;
        const highestTier = entries.reduce((highest, entry) => {
            const tierOrder = ['Citizen', 'Verifier', 'Moderator', 'Governor', 'Administrator'];
            const currentIndex = tierOrder.indexOf(entry.capsule.metadata.userTier);
            const highestIndex = tierOrder.indexOf(highest);
            return currentIndex > highestIndex ? entry.capsule.metadata.userTier : highest;
        }, 'Citizen');
        const validationLevels = entries.map(e => e.capsule.metadata.validationLevel);
        const hasDAOVerified = validationLevels.includes('dao_verified');
        const hasCivicGrade = validationLevels.includes('civic_grade');
        let validationLevel = 'basic';
        if (hasDAOVerified)
            validationLevel = 'dao_verified';
        else if (hasCivicGrade)
            validationLevel = 'civic_grade';
        else if (validationLevels.includes('enhanced'))
            validationLevel = 'enhanced';
        const reputationScore = Math.round((completedMissions.length * 10) +
            (averageTrustScore * 0.5) +
            (entries.filter(e => e.capsule.metadata.eventType === 'vote_cast').length * 5) +
            (entries.reduce((sum, e) => sum + e.capsule.metadata.witnessCount, 0) * 2));
        return {
            totalMissions: completedMissions.length,
            completedMissions,
            civicTier: highestTier,
            averageTrustScore: Math.round(averageTrustScore * 10) / 10,
            validationLevel,
            reputationScore
        };
    }
    // Cleanup oldest entries
    cleanupOldestEntries(count) {
        const entries = Array.from(this.vaultStorage.entries());
        entries.sort(([, a], [, b]) => new Date(a.storedAt).getTime() - new Date(b.storedAt).getTime());
        for (let i = 0; i < Math.min(count, entries.length); i++) {
            this.vaultStorage.delete(entries[i][0]);
        }
        console.log(`🧹 Vault cleanup — ${Math.min(count, entries.length)} oldest entries removed`);
    }
    // Clear vault (admin function)
    clearVault() {
        this.vaultStorage.clear();
        console.log('🧹 Proof vault cleared');
    }
    // Export vault data
    exportVaultData() {
        return {
            exportedAt: new Date().toISOString(),
            totalEntries: this.vaultStorage.size,
            entries: Array.from(this.vaultStorage.values()),
            statistics: this.getVaultStatistics(),
            lastIntegrityScan: this.lastIntegrityScan
        };
    }
}
export default ProofVaultCore;
