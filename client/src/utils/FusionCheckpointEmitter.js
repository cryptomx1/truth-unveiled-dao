/**
 * FusionCheckpointEmitter.ts
 * Phase Civic Fusion Step 3 - Optional Utility for Fusion Checkpoint Events
 * Authority: Commander Mark via JASMY Relay
 */
export class FusionCheckpointEmitter {
    static listeners = [];
    static checkpointLog = [];
    /**
     * Emit FusionCheckpointReached event
     */
    static emit(payload) {
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
            }
            catch (error) {
                console.error('❌ Checkpoint listener error:', error);
            }
        });
        // Store checkpoint in localStorage for audit
        this.persistCheckpoint(payload);
    }
    /**
     * Subscribe to fusion checkpoint events
     */
    static subscribe(listener) {
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
    static emitPillarCompleted(did, pillarCount, zkpHash) {
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
    static emitFusionInitiated(did, civicTier) {
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
    static emitBadgeGenerated(did, badgeId, zkpHash) {
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
    static emitExportComplete(did, badgeId, exportPath) {
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
    static getCheckpointHistory(did) {
        return this.checkpointLog.filter(checkpoint => checkpoint.did === did);
    }
    /**
     * Get all checkpoints
     */
    static getAllCheckpoints() {
        return [...this.checkpointLog];
    }
    /**
     * Clear checkpoint log (for testing)
     */
    static clearCheckpoints() {
        this.checkpointLog = [];
        localStorage.removeItem('fusion_checkpoints');
        console.log('🧹 Fusion checkpoint log cleared');
    }
    /**
     * Persist checkpoint to localStorage for audit
     */
    static persistCheckpoint(payload) {
        try {
            const existingCheckpoints = JSON.parse(localStorage.getItem('fusion_checkpoints') || '[]');
            existingCheckpoints.push(payload);
            // Keep only last 200 checkpoints
            const trimmedCheckpoints = existingCheckpoints.slice(-200);
            localStorage.setItem('fusion_checkpoints', JSON.stringify(trimmedCheckpoints));
            console.log('💾 Checkpoint persisted to audit log');
        }
        catch (error) {
            console.error('❌ Failed to persist checkpoint:', error);
        }
    }
    /**
     * Load checkpoints from localStorage on init
     */
    static loadPersistedCheckpoints() {
        try {
            const persistedCheckpoints = JSON.parse(localStorage.getItem('fusion_checkpoints') || '[]');
            this.checkpointLog = persistedCheckpoints;
            console.log(`📂 Loaded ${persistedCheckpoints.length} persisted checkpoints`);
        }
        catch (error) {
            console.warn('⚠️ Failed to load persisted checkpoints:', error);
            this.checkpointLog = [];
        }
    }
    /**
     * Get checkpoint statistics
     */
    static getCheckpointStats() {
        const stats = this.checkpointLog.reduce((acc, checkpoint) => {
            acc[checkpoint.checkpointType] = (acc[checkpoint.checkpointType] || 0) + 1;
            return acc;
        }, {});
        console.log('📊 Checkpoint Statistics:', stats);
        return stats;
    }
}
// Initialize on load
FusionCheckpointEmitter.loadPersistedCheckpoints();
