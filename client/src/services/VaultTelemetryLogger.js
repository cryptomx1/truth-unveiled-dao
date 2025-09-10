/**
 * VaultTelemetryLogger.ts - Phase XXIV
 * Console Logging for Identity Vault Operations
 * Authority: Commander Mark via JASMY Relay
 */
// Main Vault Telemetry Logger class
export class VaultTelemetryLogger {
    static instance;
    logHistory = [];
    maxLogHistory = 1000;
    constructor() {
        console.log('📊 VaultTelemetryLogger initialized for vault operation tracking');
    }
    static getInstance() {
        if (!VaultTelemetryLogger.instance) {
            VaultTelemetryLogger.instance = new VaultTelemetryLogger();
        }
        return VaultTelemetryLogger.instance;
    }
    // Log vault entry creation
    logVaultEntryCreated(cid, entryId, did, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'vault_entry_created',
            cid,
            entryId,
            did,
            details: {
                expirationDays: 365,
                hasPassphrase: true,
                hasBiometric: true
            },
            duration,
            success: true
        };
        this.addLogEntry(entry);
        console.log(`🔐 Vault entry created — CID: ${cid} | Entry ID: ${entryId} | Duration: ${duration}ms`);
    }
    // Log vault entry unlock
    logVaultEntryUnlocked(cid, entryId, unlockMethod, accessCount, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'vault_entry_unlocked',
            cid,
            entryId,
            details: {
                unlockMethod,
                accessCount,
                sessionActive: true
            },
            duration,
            success: true
        };
        this.addLogEntry(entry);
        console.log(`🔓 Vault entry unlocked — CID: ${cid} | Method: ${unlockMethod} | Access count: ${accessCount} | Duration: ${duration}ms`);
    }
    // Log vault entry lock (failed unlock)
    logVaultEntryLocked(cid, entryId, reason, attemptsRemaining, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'vault_entry_locked',
            cid,
            entryId,
            details: {
                lockReason: reason,
                attemptsRemaining,
                securityTriggered: attemptsRemaining === 0
            },
            duration,
            success: false
        };
        this.addLogEntry(entry);
        console.log(`🔒 Vault entry locked — CID: ${cid} | Reason: ${reason} | Attempts remaining: ${attemptsRemaining} | Duration: ${duration}ms`);
    }
    // Log biometric verification
    logBiometricVerification(did, sessionId, success, qualityScore, biometricType, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'biometric_verification',
            did,
            details: {
                sessionId,
                biometricType,
                qualityScore,
                verificationMethod: 'mock_scanner',
                securityLevel: qualityScore >= 85 ? 'high' : qualityScore >= 70 ? 'medium' : 'low'
            },
            duration,
            success
        };
        this.addLogEntry(entry);
        if (success) {
            console.log(`👆 Biometric verified — DID: ${did} | Quality: ${qualityScore}% | Type: ${biometricType} | Duration: ${duration}ms`);
        }
        else {
            console.log(`❌ Biometric verification failed — DID: ${did} | Quality: ${qualityScore}% | Type: ${biometricType} | Duration: ${duration}ms`);
        }
    }
    // Log identity refresh
    logIdentityRefresh(cid, entryId, oldEpoch, newEpoch, trustIndexChange, reason, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'identity_refresh',
            cid,
            entryId,
            details: {
                oldEpoch,
                newEpoch,
                trustIndexChange,
                refreshReason: reason,
                biometricUsed: true,
                newExpiryExtended: true
            },
            duration,
            success: true
        };
        this.addLogEntry(entry);
        console.log(`🔄 Identity refreshed — CID: ${cid} | Epoch: ${oldEpoch} → ${newEpoch} | Trust change: ${trustIndexChange > 0 ? '+' : ''}${trustIndexChange} | Duration: ${duration}ms`);
    }
    // Log vault access
    logVaultAccess(operation, entryCount, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'vault_access',
            details: {
                accessOperation: operation,
                entryCount,
                accessType: 'read_only'
            },
            duration,
            success: true
        };
        this.addLogEntry(entry);
        console.log(`📋 Vault accessed — Operation: ${operation} | Entries: ${entryCount} | Duration: ${duration}ms`);
    }
    // Log expiry sweep
    logExpirySweep(expiredCount, totalScanned, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'expiry_sweep',
            details: {
                expiredCount,
                totalScanned,
                sweepEfficiency: totalScanned > 0 ? ((totalScanned - expiredCount) / totalScanned * 100).toFixed(1) : '100.0'
            },
            duration,
            success: true
        };
        this.addLogEntry(entry);
        if (expiredCount > 0) {
            console.log(`🧹 Expiry sweep completed — ${expiredCount} expired entries found in ${totalScanned} total | Duration: ${duration}ms`);
        }
    }
    // Log bundle export
    logBundleExport(cid, filename, bundleSize, exportType, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'bundle_export',
            cid,
            details: {
                filename,
                bundleSize,
                exportType,
                compressionRatio: '1.0',
                downloadTriggered: true
            },
            duration,
            success: true
        };
        this.addLogEntry(entry);
        console.log(`📦 Bundle exported — CID: ${cid} | File: ${filename} | Size: ${(bundleSize / 1024).toFixed(1)}KB | Type: ${exportType} | Duration: ${duration}ms`);
    }
    // Log error
    logError(operation, error, cid, entryId, duration) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation: 'error_occurred',
            cid,
            entryId,
            details: {
                originalOperation: operation,
                errorMessage: error,
                errorType: 'operational',
                retryable: !error.includes('expired') && !error.includes('locked')
            },
            duration: duration || 0,
            success: false
        };
        this.addLogEntry(entry);
        console.error(`❌ Vault operation failed — Operation: ${operation} | Error: ${error}${cid ? ` | CID: ${cid}` : ''}${duration ? ` | Duration: ${duration}ms` : ''}`);
    }
    // Add log entry to history
    addLogEntry(entry) {
        this.logHistory.push(entry);
        // Maintain maximum log history
        if (this.logHistory.length > this.maxLogHistory) {
            this.logHistory = this.logHistory.slice(-this.maxLogHistory);
        }
    }
    // Get telemetry metrics
    getTelemetryMetrics() {
        const totalOperations = this.logHistory.length;
        const successfulOperations = this.logHistory.filter(entry => entry.success).length;
        const failedOperations = totalOperations - successfulOperations;
        // Calculate average duration (exclude zero durations)
        const entriesWithDuration = this.logHistory.filter(entry => entry.duration && entry.duration > 0);
        const averageDuration = entriesWithDuration.length > 0
            ? entriesWithDuration.reduce((acc, entry) => acc + (entry.duration || 0), 0) / entriesWithDuration.length
            : 0;
        // Count operations by type
        const operationCounts = {
            vault_entry_created: 0,
            vault_entry_unlocked: 0,
            vault_entry_locked: 0,
            biometric_verification: 0,
            identity_refresh: 0,
            vault_access: 0,
            expiry_sweep: 0,
            bundle_export: 0,
            error_occurred: 0
        };
        this.logHistory.forEach(entry => {
            operationCounts[entry.operation]++;
        });
        // Get recent errors (last 10)
        const recentErrors = this.logHistory
            .filter(entry => !entry.success)
            .slice(-10)
            .map(entry => ({
            operation: entry.operation,
            error: entry.details.errorMessage || 'Unknown error',
            timestamp: entry.timestamp
        }));
        return {
            totalOperations,
            successfulOperations,
            failedOperations,
            averageDuration: Math.round(averageDuration),
            operationCounts,
            recentErrors
        };
    }
    // Get log history
    getLogHistory(limit) {
        if (limit) {
            return this.logHistory.slice(-limit);
        }
        return [...this.logHistory];
    }
    // Get logs by operation type
    getLogsByOperation(operation, limit) {
        const filtered = this.logHistory.filter(entry => entry.operation === operation);
        if (limit) {
            return filtered.slice(-limit);
        }
        return filtered;
    }
    // Get logs by CID
    getLogsByCID(cid, limit) {
        const filtered = this.logHistory.filter(entry => entry.cid === cid);
        if (limit) {
            return filtered.slice(-limit);
        }
        return filtered;
    }
    // Clear log history
    clearLogHistory() {
        this.logHistory = [];
        console.log('🧹 Vault telemetry log history cleared');
    }
    // Export telemetry data
    exportTelemetryData() {
        return {
            exportedAt: new Date().toISOString(),
            totalEntries: this.logHistory.length,
            metrics: this.getTelemetryMetrics(),
            logHistory: this.getLogHistory()
        };
    }
}
// Export utility functions
export const logVaultEntryCreated = (cid, entryId, did, duration) => {
    const logger = VaultTelemetryLogger.getInstance();
    logger.logVaultEntryCreated(cid, entryId, did, duration);
};
export const logVaultEntryUnlocked = (cid, entryId, unlockMethod, accessCount, duration) => {
    const logger = VaultTelemetryLogger.getInstance();
    logger.logVaultEntryUnlocked(cid, entryId, unlockMethod, accessCount, duration);
};
export const logBiometricVerification = (did, sessionId, success, qualityScore, biometricType, duration) => {
    const logger = VaultTelemetryLogger.getInstance();
    logger.logBiometricVerification(did, sessionId, success, qualityScore, biometricType, duration);
};
export const logIdentityRefresh = (cid, entryId, oldEpoch, newEpoch, trustIndexChange, reason, duration) => {
    const logger = VaultTelemetryLogger.getInstance();
    logger.logIdentityRefresh(cid, entryId, oldEpoch, newEpoch, trustIndexChange, reason, duration);
};
export const logVaultAccess = (operation, entryCount, duration) => {
    const logger = VaultTelemetryLogger.getInstance();
    logger.logVaultAccess(operation, entryCount, duration);
};
export const logVaultError = (operation, error, cid, entryId, duration) => {
    const logger = VaultTelemetryLogger.getInstance();
    logger.logError(operation, error, cid, entryId, duration);
};
export default VaultTelemetryLogger;
