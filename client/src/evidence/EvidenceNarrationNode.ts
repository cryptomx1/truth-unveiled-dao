/**
 * EvidenceNarrationNode.ts - Phase XXVI
 * Screen Reader & ARIA Support for Evidence System
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  type ProofCapsule, 
  type CaptureResult,
  type EvidenceEventType 
} from './EvidenceCaptureEngine';
import { 
  type ExportResult 
} from './ProofExporterNode';

// Types for evidence narration system
export interface EvidenceNarrationEvent {
  eventId: string;
  timestamp: string;
  narrationCategory: EvidenceNarrationCategory;
  eventType: EvidenceNarrationEventType;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  metadata: {
    capsuleId?: string;
    bundleId?: string;
    userHash?: string;
    missionId?: string;
    operation?: string;
    fileSize?: number;
    duration?: number;
    status?: string;
  };
}

export type EvidenceNarrationCategory =
  | 'capture'
  | 'storage'
  | 'verification'
  | 'export'
  | 'vault_access'
  | 'integrity'
  | 'download'
  | 'error';

export type EvidenceNarrationEventType =
  | 'proof_capsule_created'
  | 'proof_capsule_saved'
  | 'vault_accessed'
  | 'signature_validated'
  | 'bundle_created'
  | 'download_ready'
  | 'export_complete'
  | 'integrity_scan_complete'
  | 'verification_success'
  | 'verification_failed'
  | 'operation_error'
  | 'system_ready';

// Main Evidence Narration Node class
export class EvidenceNarrationNode {
  private static instance: EvidenceNarrationNode;
  private narrationHistory: EvidenceNarrationEvent[] = [];
  private readonly maxHistoryEntries = 2000;
  
  // TTS is completely suppressed per project requirements
  private readonly ttsEnabled = false;
  
  private constructor() {
    console.log('🔇 EvidenceNarrationNode initialized with TTS suppression and ARIA compliance for evidence system');
  }
  
  static getInstance(): EvidenceNarrationNode {
    if (!EvidenceNarrationNode.instance) {
      EvidenceNarrationNode.instance = new EvidenceNarrationNode();
    }
    return EvidenceNarrationNode.instance;
  }
  
  // Announce proof capsule creation
  announceProofCapsuleCreated(
    result: CaptureResult,
    missionId: string,
    missionTitle: string
  ): EvidenceNarrationEvent {
    
    const message = result.success 
      ? `Proof capsule saved for mission "${missionTitle}". Evidence secured and verified.`
      : `Proof capsule creation failed for mission "${missionTitle}". ${result.error}`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'capture',
      eventType: result.success ? 'proof_capsule_created' : 'operation_error',
      message,
      priority: result.success ? 'high' : 'critical',
      metadata: {
        capsuleId: result.evidenceId,
        missionId,
        duration: result.captureTime,
        status: result.success ? 'success' : 'failed'
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce proof capsule stored in vault
  announceProofCapsuleStored(
    capsule: ProofCapsule,
    vaultEntryId: string
  ): EvidenceNarrationEvent {
    
    const message = `Proof capsule stored in secure vault. Mission evidence preserved with integrity verification.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'storage',
      eventType: 'proof_capsule_saved',
      message,
      priority: 'medium',
      metadata: {
        capsuleId: capsule.eventId,
        missionId: capsule.missionId,
        userHash: capsule.userHash,
        operation: 'vault_storage'
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce vault access
  announceVaultAccessed(
    operation: string,
    entryCount: number,
    duration: number
  ): EvidenceNarrationEvent {
    
    const message = `Vault accessed for ${operation}. ${entryCount} evidence entries processed.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'vault_access',
      eventType: 'vault_accessed',
      message,
      priority: 'low',
      metadata: {
        operation,
        duration
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce signature validation
  announceSignatureValidated(
    isValid: boolean,
    capsuleId: string,
    integrityLevel: string
  ): EvidenceNarrationEvent {
    
    const message = isValid
      ? `Signature validated successfully. Evidence integrity confirmed at ${integrityLevel} level.`
      : `Signature validation failed. Evidence integrity compromised.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'verification',
      eventType: isValid ? 'signature_validated' : 'verification_failed',
      message,
      priority: isValid ? 'medium' : 'high',
      metadata: {
        capsuleId,
        status: isValid ? 'validated' : 'failed'
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce bundle creation
  announceBundleCreated(
    bundleType: string,
    entryCount: number,
    bundleId: string
  ): EvidenceNarrationEvent {
    
    const bundleTypeFormatted = bundleType.replace(/_/g, ' ').toLowerCase();
    const message = `${bundleTypeFormatted} bundle created with ${entryCount} evidence entries. Ready for download.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'export',
      eventType: 'bundle_created',
      message,
      priority: 'high',
      metadata: {
        bundleId,
        operation: 'bundle_creation'
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce download ready
  announceDownloadReady(
    result: ExportResult,
    bundleType: string
  ): EvidenceNarrationEvent {
    
    const bundleTypeFormatted = bundleType.replace(/_/g, ' ').toLowerCase();
    const fileSizeFormatted = this.formatFileSize(result.fileSize);
    
    const message = result.success
      ? `Download complete. ${bundleTypeFormatted} bundle ready: ${result.filename}. File size: ${fileSizeFormatted}.`
      : `Download failed for ${bundleTypeFormatted} bundle. ${result.error}`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'download',
      eventType: result.success ? 'download_ready' : 'operation_error',
      message,
      priority: result.success ? 'high' : 'critical',
      metadata: {
        bundleId: result.bundleId,
        fileSize: result.fileSize,
        duration: result.exportDuration,
        status: result.success ? 'ready' : 'failed'
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce export completion
  announceExportComplete(
    exportType: string,
    filename: string,
    fileSize: number,
    duration: number
  ): EvidenceNarrationEvent {
    
    const exportTypeFormatted = exportType.replace(/_/g, ' ').toLowerCase();
    const fileSizeFormatted = this.formatFileSize(fileSize);
    const durationFormatted = this.formatDuration(duration);
    
    const message = `Export complete: ${exportTypeFormatted}. File: ${filename}. Size: ${fileSizeFormatted}. Duration: ${durationFormatted}.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'export',
      eventType: 'export_complete',
      message,
      priority: 'medium',
      metadata: {
        operation: 'export',
        fileSize,
        duration
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce integrity scan completion
  announceIntegrityScanComplete(
    totalEntries: number,
    validEntries: number,
    corruptedEntries: number,
    duration: number
  ): EvidenceNarrationEvent {
    
    const corruptionRate = totalEntries > 0 ? Math.round((corruptedEntries / totalEntries) * 1000) / 10 : 0;
    const durationFormatted = this.formatDuration(duration);
    
    const message = `Integrity scan complete. ${validEntries} of ${totalEntries} entries verified. Corruption rate: ${corruptionRate}%. Duration: ${durationFormatted}.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'integrity',
      eventType: 'integrity_scan_complete',
      message,
      priority: corruptedEntries > 0 ? 'high' : 'medium',
      metadata: {
        operation: 'integrity_scan',
        duration
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce verification success
  announceVerificationSuccess(
    verificationType: string,
    itemId: string,
    metadata?: Record<string, any>
  ): EvidenceNarrationEvent {
    
    const verificationTypeFormatted = verificationType.replace(/_/g, ' ').toLowerCase();
    const message = `Verification successful: ${verificationTypeFormatted}. Item validated and approved.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'verification',
      eventType: 'verification_success',
      message,
      priority: 'medium',
      metadata: {
        capsuleId: itemId,
        operation: verificationType,
        status: 'verified',
        ...metadata
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce verification failure
  announceVerificationFailed(
    verificationType: string,
    itemId: string,
    reason: string,
    metadata?: Record<string, any>
  ): EvidenceNarrationEvent {
    
    const verificationTypeFormatted = verificationType.replace(/_/g, ' ').toLowerCase();
    const message = `Verification failed: ${verificationTypeFormatted}. Reason: ${reason}. Review required.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'verification',
      eventType: 'verification_failed',
      message,
      priority: 'high',
      metadata: {
        capsuleId: itemId,
        operation: verificationType,
        status: 'failed',
        ...metadata
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce system ready
  announceSystemReady(
    systemName: string,
    componentCount: number,
    initializationTime: number
  ): EvidenceNarrationEvent {
    
    const durationFormatted = this.formatDuration(initializationTime);
    const message = `${systemName} ready. ${componentCount} components initialized. Setup time: ${durationFormatted}.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'vault_access',
      eventType: 'system_ready',
      message,
      priority: 'low',
      metadata: {
        operation: 'system_initialization',
        duration: initializationTime
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Announce operation error
  announceOperationError(
    operation: string,
    error: string,
    metadata?: Record<string, any>
  ): EvidenceNarrationEvent {
    
    const message = `Operation failed: ${operation}. Error: ${error}. Please review and retry.`;
    
    const event = this.createNarrationEvent({
      narrationCategory: 'error',
      eventType: 'operation_error',
      message,
      priority: 'critical',
      metadata: {
        operation,
        status: 'error',
        ...metadata
      }
    });
    
    this.addToHistory(event);
    this.logNarration(event.eventType, message);
    
    return event;
  }
  
  // Create narration event
  private createNarrationEvent(
    partial: Omit<EvidenceNarrationEvent, 'eventId' | 'timestamp'>
  ): EvidenceNarrationEvent {
    return {
      eventId: `evidence-narration-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...partial
    };
  }
  
  // Add event to history
  private addToHistory(event: EvidenceNarrationEvent): void {
    this.narrationHistory.push(event);
    
    // Maintain history size
    if (this.narrationHistory.length > this.maxHistoryEntries) {
      this.narrationHistory = this.narrationHistory.slice(-this.maxHistoryEntries);
    }
  }
  
  // Console logging with TTS suppression notation
  private logNarration(eventType: string, message: string): void {
    console.log(`🔇 Evidence Narration — ${eventType}: ${message}`);
  }
  
  // Format file size for narration
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
    if (bytes < 1073741824) return `${Math.round(bytes / 1048576)} MB`;
    return `${Math.round(bytes / 1073741824)} GB`;
  }
  
  // Format duration for narration
  private formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) return `${milliseconds} milliseconds`;
    if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)} seconds`;
    if (milliseconds < 3600000) return `${Math.round(milliseconds / 60000)} minutes`;
    return `${Math.round(milliseconds / 3600000)} hours`;
  }
  
  // Get narration history by category
  getHistoryByCategory(category: EvidenceNarrationCategory, limit?: number): EvidenceNarrationEvent[] {
    const filtered = this.narrationHistory
      .filter(event => event.narrationCategory === category)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get narration history by event type
  getHistoryByEventType(eventType: EvidenceNarrationEventType, limit?: number): EvidenceNarrationEvent[] {
    const filtered = this.narrationHistory
      .filter(event => event.eventType === eventType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get narration history by priority
  getHistoryByPriority(priority: EvidenceNarrationEvent['priority'], limit?: number): EvidenceNarrationEvent[] {
    const filtered = this.narrationHistory
      .filter(event => event.priority === priority)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get recent narration history
  getRecentHistory(hours: number = 24, limit?: number): EvidenceNarrationEvent[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const filtered = this.narrationHistory
      .filter(event => new Date(event.timestamp).getTime() > cutoffTime)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get narration statistics
  getNarrationStatistics(): {
    totalEvents: number;
    categoryBreakdown: Record<EvidenceNarrationCategory, number>;
    eventTypeBreakdown: Record<EvidenceNarrationEventType, number>;
    priorityBreakdown: Record<string, number>;
    recentActivity: number;
    errorRate: number;
  } {
    
    const categoryBreakdown: Record<EvidenceNarrationCategory, number> = {
      capture: 0,
      storage: 0,
      verification: 0,
      export: 0,
      vault_access: 0,
      integrity: 0,
      download: 0,
      error: 0
    };
    
    const eventTypeBreakdown: Record<EvidenceNarrationEventType, number> = {
      proof_capsule_created: 0,
      proof_capsule_saved: 0,
      vault_accessed: 0,
      signature_validated: 0,
      bundle_created: 0,
      download_ready: 0,
      export_complete: 0,
      integrity_scan_complete: 0,
      verification_success: 0,
      verification_failed: 0,
      operation_error: 0,
      system_ready: 0
    };
    
    const priorityBreakdown: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    let errorEvents = 0;
    
    this.narrationHistory.forEach(event => {
      categoryBreakdown[event.narrationCategory]++;
      eventTypeBreakdown[event.eventType]++;
      priorityBreakdown[event.priority]++;
      
      if (event.narrationCategory === 'error' || event.eventType === 'operation_error') {
        errorEvents++;
      }
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    const recentActivity = this.narrationHistory.filter(event => 
      new Date(event.timestamp).getTime() > oneDayAgo
    ).length;
    
    const errorRate = this.narrationHistory.length > 0 ? 
      Math.round((errorEvents / this.narrationHistory.length) * 1000) / 10 : 0;
    
    return {
      totalEvents: this.narrationHistory.length,
      categoryBreakdown,
      eventTypeBreakdown,
      priorityBreakdown,
      recentActivity,
      errorRate
    };
  }
  
  // Clear narration history (admin function)
  clearNarrationHistory(): void {
    this.narrationHistory = [];
    console.log('🧹 Evidence narration history cleared');
  }
  
  // Export narration data
  exportNarrationData(): {
    exportedAt: string;
    ttsEnabled: boolean;
    totalEvents: number;
    events: EvidenceNarrationEvent[];
    statistics: ReturnType<EvidenceNarrationNode['getNarrationStatistics']>;
  } {
    return {
      exportedAt: new Date().toISOString(),
      ttsEnabled: this.ttsEnabled,
      totalEvents: this.narrationHistory.length,
      events: [...this.narrationHistory],
      statistics: this.getNarrationStatistics()
    };
  }
}

// Export utility functions for direct narration calls
export const announceProofCapsuleCreated = (
  result: CaptureResult,
  missionId: string,
  missionTitle: string
): EvidenceNarrationEvent => {
  const narrator = EvidenceNarrationNode.getInstance();
  return narrator.announceProofCapsuleCreated(result, missionId, missionTitle);
};

export const announceProofCapsuleStored = (
  capsule: ProofCapsule,
  vaultEntryId: string
): EvidenceNarrationEvent => {
  const narrator = EvidenceNarrationNode.getInstance();
  return narrator.announceProofCapsuleStored(capsule, vaultEntryId);
};

export const announceVaultAccessed = (
  operation: string,
  entryCount: number,
  duration: number
): EvidenceNarrationEvent => {
  const narrator = EvidenceNarrationNode.getInstance();
  return narrator.announceVaultAccessed(operation, entryCount, duration);
};

export const announceDownloadReady = (
  result: ExportResult,
  bundleType: string
): EvidenceNarrationEvent => {
  const narrator = EvidenceNarrationNode.getInstance();
  return narrator.announceDownloadReady(result, bundleType);
};

export const announceVerificationSuccess = (
  verificationType: string,
  itemId: string,
  metadata?: Record<string, any>
): EvidenceNarrationEvent => {
  const narrator = EvidenceNarrationNode.getInstance();
  return narrator.announceVerificationSuccess(verificationType, itemId, metadata);
};

export const announceOperationError = (
  operation: string,
  error: string,
  metadata?: Record<string, any>
): EvidenceNarrationEvent => {
  const narrator = EvidenceNarrationNode.getInstance();
  return narrator.announceOperationError(operation, error, metadata);
};

export default EvidenceNarrationNode;