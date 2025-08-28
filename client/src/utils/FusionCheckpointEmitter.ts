/**
 * FusionCheckpointEmitter.ts
 * Phase Civic Fusion Step 3 - Optional Utility for Fusion Checkpoint Events
 * Authority: Commander Mark via JASMY Relay
 */

export interface FusionCheckpointPayload {
  did: string;
  badgeId: string;
  timestamp: string;
  checkpointType: 'pillar_completed' | 'fusion_initiated' | 'badge_generated' | 'export_complete';
  metadata: {
    pillarCount?: number;
    zkpHash?: string;
    civicTier?: string;
    exportPath?: string;
  };
}

export class FusionCheckpointEmitter {
  private static listeners: Array<(payload: FusionCheckpointPayload) => void> = [];
  private static checkpointLog: FusionCheckpointPayload[] = [];

  /**
   * Emit FusionCheckpointReached event
   */
  static emit(payload: FusionCheckpointPayload): void {
    console.log('📍 Fusion Checkpoint Reached:', payload.checkpointType);
    console.log(`📊 Checkpoint Payload:`, JSON.stringify({
      did: payload.did,
      badgeId: payload.badgeId,
      timestamp: payload.timestamp,
      type: payload.checkpointType
    }));

    // Add to checkpoint log
    this.checkpointLog.push(payload);
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error('❌ Checkpoint listener error:', error);
      }
    });

    // Store checkpoint in localStorage for audit
    this.persistCheckpoint(payload);
  }

  /**
   * Subscribe to fusion checkpoint events
   */
  static subscribe(listener: (payload: FusionCheckpointPayload) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit pillar completion checkpoint
   */
  static emitPillarCompleted(did: string, pillarCount: number, zkpHash: string): void {
    this.emit({
      did,
      badgeId: `pending_${Date.now()}`,
      timestamp: new Date().toISOString(),
      checkpointType: 'pillar_completed',
      metadata: {
        pillarCount,
        zkpHash
      }
    });
  }

  /**
   * Emit fusion initiation checkpoint
   */
  static emitFusionInitiated(did: string, civicTier: string): void {
    this.emit({
      did,
      badgeId: `fusion_${Date.now()}`,
      timestamp: new Date().toISOString(),
      checkpointType: 'fusion_initiated',
      metadata: {
        civicTier
      }
    });
  }

  /**
   * Emit badge generation checkpoint
   */
  static emitBadgeGenerated(did: string, badgeId: string, zkpHash: string): void {
    this.emit({
      did,
      badgeId,
      timestamp: new Date().toISOString(),
      checkpointType: 'badge_generated',
      metadata: {
        zkpHash
      }
    });
  }

  /**
   * Emit export completion checkpoint
   */
  static emitExportComplete(did: string, badgeId: string, exportPath: string): void {
    this.emit({
      did,
      badgeId,
      timestamp: new Date().toISOString(),
      checkpointType: 'export_complete',
      metadata: {
        exportPath
      }
    });
  }

  /**
   * Get checkpoint history for a specific DID
   */
  static getCheckpointHistory(did: string): FusionCheckpointPayload[] {
    return this.checkpointLog.filter(checkpoint => checkpoint.did === did);
  }

  /**
   * Get all checkpoints
   */
  static getAllCheckpoints(): FusionCheckpointPayload[] {
    return [...this.checkpointLog];
  }

  /**
   * Clear checkpoint log (for testing)
   */
  static clearCheckpoints(): void {
    this.checkpointLog = [];
    localStorage.removeItem('fusion_checkpoints');
    console.log('🧹 Fusion checkpoint log cleared');
  }

  /**
   * Persist checkpoint to localStorage for audit
   */
  private static persistCheckpoint(payload: FusionCheckpointPayload): void {
    try {
      const existingCheckpoints = JSON.parse(localStorage.getItem('fusion_checkpoints') || '[]');
      existingCheckpoints.push(payload);
      
      // Keep only last 200 checkpoints
      const trimmedCheckpoints = existingCheckpoints.slice(-200);
      localStorage.setItem('fusion_checkpoints', JSON.stringify(trimmedCheckpoints));
      
      console.log('💾 Checkpoint persisted to audit log');
    } catch (error) {
      console.error('❌ Failed to persist checkpoint:', error);
    }
  }

  /**
   * Load checkpoints from localStorage on init
   */
  static loadPersistedCheckpoints(): void {
    try {
      const persistedCheckpoints = JSON.parse(localStorage.getItem('fusion_checkpoints') || '[]');
      this.checkpointLog = persistedCheckpoints;
      console.log(`📂 Loaded ${persistedCheckpoints.length} persisted checkpoints`);
    } catch (error) {
      console.warn('⚠️ Failed to load persisted checkpoints:', error);
      this.checkpointLog = [];
    }
  }

  /**
   * Get checkpoint statistics
   */
  static getCheckpointStats(): { [key: string]: number } {
    const stats = this.checkpointLog.reduce((acc, checkpoint) => {
      acc[checkpoint.checkpointType] = (acc[checkpoint.checkpointType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    console.log('📊 Checkpoint Statistics:', stats);
    return stats;
  }
}

// Initialize on load
FusionCheckpointEmitter.loadPersistedCheckpoints();