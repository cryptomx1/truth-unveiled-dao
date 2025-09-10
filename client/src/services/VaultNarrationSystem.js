/**
 * VaultNarrationSystem.ts - Phase XXIV
 * ARIA-Compatible Voice Prompts for Identity Vault Operations
 * Authority: Commander Mark via JASMY Relay
 */
// Main Vault Narration System class
export class VaultNarrationSystem {
    static instance;
    narrationQueue = [];
    isNarrating = false;
    config;
    constructor() {
        this.config = {
            enabled: false, // Disabled by default per TTS suppression requirements
            voice: {
                rate: 1.0,
                pitch: 1.0,
                volume: 0.8,
                lang: 'en-US'
            },
            priorities: {
                announceLevel: 'medium',
                repeatCritical: false,
                delayBetweenMessages: 1000
            }
        };
        console.log('🔇 VaultNarrationSystem initialized (TTS suppressed per project requirements)');
    }
    static getInstance() {
        if (!VaultNarrationSystem.instance) {
            VaultNarrationSystem.instance = new VaultNarrationSystem();
        }
        return VaultNarrationSystem.instance;
    }
    // Announce identity expiry warning
    announceExpiryWarning(cid, daysUntilExpiry) {
        const message = daysUntilExpiry <= 0
            ? `Identity ${cid} has expired and requires immediate refresh`
            : `Identity ${cid} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`;
        const event = {
            eventType: 'identity_expiry_warning',
            message,
            priority: daysUntilExpiry <= 0 ? 'critical' : daysUntilExpiry <= 7 ? 'high' : 'medium',
            timestamp: new Date().toISOString(),
            metadata: { cid, daysUntilExpiry }
        };
        this.queueNarration(event);
    }
    // Announce biometric match success
    announceBiometricSuccess(qualityScore, biometricType) {
        const message = `Biometric verification successful. ${biometricType} matched with ${qualityScore} percent quality`;
        const event = {
            eventType: 'biometric_match_success',
            message,
            priority: 'medium',
            timestamp: new Date().toISOString(),
            metadata: { qualityScore, biometricType }
        };
        this.queueNarration(event);
    }
    // Announce biometric match failure
    announceBiometricFailure(reason, attemptsRemaining) {
        const message = `Biometric verification failed: ${reason}. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining`;
        const event = {
            eventType: 'biometric_match_failed',
            message,
            priority: attemptsRemaining <= 1 ? 'high' : 'medium',
            timestamp: new Date().toISOString(),
            metadata: { reason, attemptsRemaining }
        };
        this.queueNarration(event);
    }
    // Announce vault refresh confirmation
    announceRefreshConfirmation(cid, newEpoch, trustChange) {
        const trustDirection = trustChange > 0 ? 'increased' : trustChange < 0 ? 'decreased' : 'unchanged';
        const message = `Identity ${cid} successfully refreshed to epoch ${newEpoch}. Trust index ${trustDirection} by ${Math.abs(trustChange)} points`;
        const event = {
            eventType: 'vault_refresh_confirmation',
            message,
            priority: 'medium',
            timestamp: new Date().toISOString(),
            metadata: { cid, newEpoch, trustChange }
        };
        this.queueNarration(event);
    }
    // Announce vault unlock success
    announceUnlockSuccess(cid, unlockMethod, accessCount) {
        const message = `Vault entry for ${cid} unlocked using ${unlockMethod}. Access count: ${accessCount}`;
        const event = {
            eventType: 'vault_unlock_success',
            message,
            priority: 'low',
            timestamp: new Date().toISOString(),
            metadata: { cid, unlockMethod, accessCount }
        };
        this.queueNarration(event);
    }
    // Announce vault unlock failure
    announceUnlockFailure(cid, reason, attemptsRemaining) {
        const message = `Vault unlock failed for ${cid}: ${reason}. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining`;
        const event = {
            eventType: 'vault_unlock_failed',
            message,
            priority: attemptsRemaining <= 1 ? 'high' : 'medium',
            timestamp: new Date().toISOString(),
            metadata: { cid, reason, attemptsRemaining }
        };
        this.queueNarration(event);
    }
    // Announce security alert
    announceSecurityAlert(alertType, details) {
        const message = `Security alert: ${alertType}. ${details}`;
        const event = {
            eventType: 'security_alert',
            message,
            priority: 'critical',
            timestamp: new Date().toISOString(),
            metadata: { alertType, details }
        };
        this.queueNarration(event);
    }
    // Announce system status
    announceSystemStatus(status, details) {
        const message = `Vault system status: ${status}. ${details}`;
        const event = {
            eventType: 'system_status',
            message,
            priority: 'low',
            timestamp: new Date().toISOString(),
            metadata: { status, details }
        };
        this.queueNarration(event);
    }
    // Announce operation completion
    announceOperationComplete(operation, success, details) {
        const status = success ? 'completed successfully' : 'failed';
        const message = `${operation} ${status}${details ? `. ${details}` : ''}`;
        const event = {
            eventType: 'operation_complete',
            message,
            priority: success ? 'low' : 'medium',
            timestamp: new Date().toISOString(),
            metadata: { operation, success, details }
        };
        this.queueNarration(event);
    }
    // Queue narration event
    queueNarration(event) {
        // Always log to console regardless of TTS status
        this.logNarrationEvent(event);
        // TTS is suppressed per project requirements, but we maintain ARIA compliance
        this.updateAriaLiveRegion(event.message);
        // Add to queue for potential future TTS use
        this.narrationQueue.push(event);
        // Maintain queue size
        if (this.narrationQueue.length > 50) {
            this.narrationQueue = this.narrationQueue.slice(-50);
        }
    }
    // Update ARIA live region for screen readers
    updateAriaLiveRegion(message) {
        // Find or create ARIA live region
        let ariaRegion = document.getElementById('vault-narration-live-region');
        if (!ariaRegion) {
            ariaRegion = document.createElement('div');
            ariaRegion.id = 'vault-narration-live-region';
            ariaRegion.setAttribute('aria-live', 'polite');
            ariaRegion.setAttribute('aria-atomic', 'true');
            ariaRegion.className = 'sr-only';
            ariaRegion.style.position = 'absolute';
            ariaRegion.style.left = '-10000px';
            ariaRegion.style.width = '1px';
            ariaRegion.style.height = '1px';
            ariaRegion.style.overflow = 'hidden';
            document.body.appendChild(ariaRegion);
        }
        // Update content for screen readers
        ariaRegion.textContent = message;
    }
    // Log narration event to console
    logNarrationEvent(event) {
        const priorityEmoji = {
            low: '🔊',
            medium: '📢',
            high: '⚠️',
            critical: '🚨'
        };
        const emoji = priorityEmoji[event.priority];
        console.log(`${emoji} Vault Narration — ${event.eventType}: ${event.message}`);
    }
    // Process narration queue (for future TTS implementation)
    async processNarrationQueue() {
        if (this.isNarrating || this.narrationQueue.length === 0 || !this.config.enabled) {
            return;
        }
        this.isNarrating = true;
        try {
            while (this.narrationQueue.length > 0) {
                const event = this.narrationQueue.shift();
                if (!event)
                    continue;
                // Check if event priority meets announcement threshold
                const priorityOrder = ['low', 'medium', 'high', 'critical'];
                const eventPriorityIndex = priorityOrder.indexOf(event.priority);
                const configPriorityIndex = priorityOrder.indexOf(this.config.priorities.announceLevel);
                if (eventPriorityIndex >= configPriorityIndex) {
                    // TTS would be processed here if enabled
                    console.log(`🔇 TTS Suppressed — Would announce: ${event.message}`);
                }
                // Delay between messages
                if (this.narrationQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, this.config.priorities.delayBetweenMessages));
                }
            }
        }
        catch (error) {
            console.error('❌ Narration processing error:', error);
        }
        finally {
            this.isNarrating = false;
        }
    }
    // Enable/disable narration
    setNarrationEnabled(enabled) {
        this.config.enabled = enabled;
        console.log(`🔇 Vault narration ${enabled ? 'enabled' : 'disabled'} (TTS remains suppressed per project requirements)`);
    }
    // Update narration configuration
    updateNarrationConfig(updates) {
        this.config = { ...this.config, ...updates };
        console.log('⚙️ Vault narration configuration updated');
    }
    // Get narration history
    getNarrationHistory(limit) {
        if (limit) {
            return this.narrationQueue.slice(-limit);
        }
        return [...this.narrationQueue];
    }
    // Get narration statistics
    getNarrationStatistics() {
        const eventsByType = {
            identity_expiry_warning: 0,
            biometric_match_success: 0,
            biometric_match_failed: 0,
            vault_refresh_confirmation: 0,
            vault_unlock_success: 0,
            vault_unlock_failed: 0,
            security_alert: 0,
            system_status: 0,
            operation_complete: 0
        };
        const eventsByPriority = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };
        this.narrationQueue.forEach(event => {
            eventsByType[event.eventType]++;
            eventsByPriority[event.priority]++;
        });
        return {
            totalEvents: this.narrationQueue.length,
            eventsByType,
            eventsByPriority,
            recentEvents: this.narrationQueue.slice(-10)
        };
    }
    // Clear narration history
    clearNarrationHistory() {
        this.narrationQueue = [];
        console.log('🧹 Vault narration history cleared');
    }
    // Manual trigger for testing ARIA
    testAriaAnnouncement(message) {
        this.updateAriaLiveRegion(`Test announcement: ${message}`);
        console.log(`🔇 ARIA Test — ${message}`);
    }
}
// Export utility functions
export const announceExpiryWarning = (cid, daysUntilExpiry) => {
    const narration = VaultNarrationSystem.getInstance();
    narration.announceExpiryWarning(cid, daysUntilExpiry);
};
export const announceBiometricSuccess = (qualityScore, biometricType) => {
    const narration = VaultNarrationSystem.getInstance();
    narration.announceBiometricSuccess(qualityScore, biometricType);
};
export const announceBiometricFailure = (reason, attemptsRemaining) => {
    const narration = VaultNarrationSystem.getInstance();
    narration.announceBiometricFailure(reason, attemptsRemaining);
};
export const announceRefreshConfirmation = (cid, newEpoch, trustChange) => {
    const narration = VaultNarrationSystem.getInstance();
    narration.announceRefreshConfirmation(cid, newEpoch, trustChange);
};
export const announceUnlockSuccess = (cid, unlockMethod, accessCount) => {
    const narration = VaultNarrationSystem.getInstance();
    narration.announceUnlockSuccess(cid, unlockMethod, accessCount);
};
export const announceUnlockFailure = (cid, reason, attemptsRemaining) => {
    const narration = VaultNarrationSystem.getInstance();
    narration.announceUnlockFailure(cid, reason, attemptsRemaining);
};
export const announceSecurityAlert = (alertType, details) => {
    const narration = VaultNarrationSystem.getInstance();
    narration.announceSecurityAlert(alertType, details);
};
export default VaultNarrationSystem;
