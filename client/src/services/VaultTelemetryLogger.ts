/**
 * VaultTelemetryLogger.ts - Phase XXIV
 * Console Logging for Identity Vault Operations
 * Authority: Commander Mark via JASMY Relay
 */

// Types for telemetry logging
export interface VaultLogEntry {
  timestamp: string;
  operation: VaultOperation;
  cid?: string;
  entryId?: string;
  did?: string;
  details: Record<string, any>;
  duration?: number;
  success: boolean;
}

export type VaultOperation = 
  | 'vault_entry_created'
  | 'vault_entry_unlocked'
  | 'vault_entry_locked'
  | 'biometric_verification'
  | 'identity_refresh'
  | 'vault_access'
  | 'expiry_sweep'
  | 'bundle_export'
  | 'error_occurred';

export interface TelemetryMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  operationCounts: Record<VaultOperation, number>;
  recentErrors: Array<{
    operation: VaultOperation;
    error: string;
    timestamp: string;
  }>;
}

// Main Vault Telemetry Logger class
export class VaultTelemetryLogger {
  private static instance: VaultTelemetryLogger;
  private logHistory: VaultLogEntry[] = [];
  private readonly maxLogHistory = 1000;
  
  private constructor() {
    console.log('📊 VaultTelemetryLogger initialized for vault operation tracking');
  }
  
  static getInstance(): VaultTelemetryLogger {
    if (!VaultTelemetryLogger.instance) {
      VaultTelemetryLogger.instance = new VaultTelemetryLogger();
    }
    return VaultTelemetryLogger.instance;
  }
  
  // Log vault entry creation
  logVaultEntryCreated(cid: string, entryId: string, did: string, duration: number): void {
    const entry: VaultLogEntry = {
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
  logVaultEntryUnlocked(
    cid: string, 
    entryId: string, 
    unlockMethod: 'biometric' | 'passphrase', 
    accessCount: number,
    duration: number
  ): void {
    const entry: VaultLogEntry = {
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
  logVaultEntryLocked(
    cid: string, 
    entryId: string, 
    reason: string, 
    attemptsRemaining: number,
    duration: number
  ): void {
    const entry: VaultLogEntry = {
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
  logBiometricVerification(
    did: string,
    sessionId: string,
    success: boolean,
    qualityScore: number,
    biometricType: string,
    duration: number
  ): void {
    const entry: VaultLogEntry = {
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
    } else {
      console.log(`❌ Biometric verification failed — DID: ${did} | Quality: ${qualityScore}% | Type: ${biometricType} | Duration: ${duration}ms`);
    }
  }
  
  // Log identity refresh
  logIdentityRefresh(
    cid: string,
    entryId: string,
    oldEpoch: string,
    newEpoch: string,
    trustIndexChange: number,
    reason: string,
    duration: number
  ): void {
    const entry: VaultLogEntry = {
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
  logVaultAccess(operation: string, entryCount: number, duration: number): void {
    const entry: VaultLogEntry = {
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
  logExpirySweep(expiredCount: number, totalScanned: number, duration: number): void {
    const entry: VaultLogEntry = {
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
  logBundleExport(
    cid: string,
    filename: string,
    bundleSize: number,
    exportType: 'original' | 'refreshed',
    duration: number
  ): void {
    const entry: VaultLogEntry = {
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
  logError(
    operation: VaultOperation,
    error: string,
    cid?: string,
    entryId?: string,
    duration?: number
  ): void {
    const entry: VaultLogEntry = {
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
  private addLogEntry(entry: VaultLogEntry): void {
    this.logHistory.push(entry);
    
    // Maintain maximum log history
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory = this.logHistory.slice(-this.maxLogHistory);
    }
  }
  
  // Get telemetry metrics
  getTelemetryMetrics(): TelemetryMetrics {
    const totalOperations = this.logHistory.length;
    const successfulOperations = this.logHistory.filter(entry => entry.success).length;
    const failedOperations = totalOperations - successfulOperations;
    
    // Calculate average duration (exclude zero durations)
    const entriesWithDuration = this.logHistory.filter(entry => entry.duration && entry.duration > 0);
    const averageDuration = entriesWithDuration.length > 0 
      ? entriesWithDuration.reduce((acc, entry) => acc + (entry.duration || 0), 0) / entriesWithDuration.length
      : 0;
    
    // Count operations by type
    const operationCounts: Record<VaultOperation, number> = {
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
  getLogHistory(limit?: number): VaultLogEntry[] {
    if (limit) {
      return this.logHistory.slice(-limit);
    }
    return [...this.logHistory];
  }
  
  // Get logs by operation type
  getLogsByOperation(operation: VaultOperation, limit?: number): VaultLogEntry[] {
    const filtered = this.logHistory.filter(entry => entry.operation === operation);
    if (limit) {
      return filtered.slice(-limit);
    }
    return filtered;
  }
  
  // Get logs by CID
  getLogsByCID(cid: string, limit?: number): VaultLogEntry[] {
    const filtered = this.logHistory.filter(entry => entry.cid === cid);
    if (limit) {
      return filtered.slice(-limit);
    }
    return filtered;
  }
  
  // Clear log history
  clearLogHistory(): void {
    this.logHistory = [];
    console.log('🧹 Vault telemetry log history cleared');
  }
  
  // Export telemetry data
  exportTelemetryData(): {
    exportedAt: string;
    totalEntries: number;
    metrics: TelemetryMetrics;
    logHistory: VaultLogEntry[];
  } {
    return {
      exportedAt: new Date().toISOString(),
      totalEntries: this.logHistory.length,
      metrics: this.getTelemetryMetrics(),
      logHistory: this.getLogHistory()
    };
  }
}

// Export utility functions
export const logVaultEntryCreated = (
  cid: string, 
  entryId: string, 
  did: string, 
  duration: number
): void => {
  const logger = VaultTelemetryLogger.getInstance();
  logger.logVaultEntryCreated(cid, entryId, did, duration);
};

export const logVaultEntryUnlocked = (
  cid: string, 
  entryId: string, 
  unlockMethod: 'biometric' | 'passphrase', 
  accessCount: number,
  duration: number
): void => {
  const logger = VaultTelemetryLogger.getInstance();
  logger.logVaultEntryUnlocked(cid, entryId, unlockMethod, accessCount, duration);
};

export const logBiometricVerification = (
  did: string,
  sessionId: string,
  success: boolean,
  qualityScore: number,
  biometricType: string,
  duration: number
): void => {
  const logger = VaultTelemetryLogger.getInstance();
  logger.logBiometricVerification(did, sessionId, success, qualityScore, biometricType, duration);
};

export const logIdentityRefresh = (
  cid: string,
  entryId: string,
  oldEpoch: string,
  newEpoch: string,
  trustIndexChange: number,
  reason: string,
  duration: number
): void => {
  const logger = VaultTelemetryLogger.getInstance();
  logger.logIdentityRefresh(cid, entryId, oldEpoch, newEpoch, trustIndexChange, reason, duration);
};

export const logVaultAccess = (
  operation: string, 
  entryCount: number, 
  duration: number
): void => {
  const logger = VaultTelemetryLogger.getInstance();
  logger.logVaultAccess(operation, entryCount, duration);
};

export const logVaultError = (
  operation: VaultOperation,
  error: string,
  cid?: string,
  entryId?: string,
  duration?: number
): void => {
  const logger = VaultTelemetryLogger.getInstance();
  logger.logError(operation, error, cid, entryId, duration);
};

export default VaultTelemetryLogger;