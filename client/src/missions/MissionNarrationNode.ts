/**
 * MissionNarrationNode.ts - Phase XXV
 * ARIA + Screen Reader Support for Mission Unlock System
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  type UnlockEligibility,
  type UnlockBlocker
} from './MissionUnlockEngine';

// Types for mission narration system
export interface NarrationEvent {
  eventId: string;
  type: NarrationEventType;
  timestamp: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: NarrationCategory;
  metadata: {
    missionId?: string;
    userId?: string;
    blockerType?: string;
    requirement?: string;
    actionNeeded?: string;
  };
}

export type NarrationEventType =
  | 'unlock_success'
  | 'unlock_blocked'
  | 'replay_required'
  | 'tier_insufficient'
  | 'trust_insufficient'
  | 'feedback_required'
  | 'eligibility_explanation'
  | 'next_steps_guide'
  | 'requirement_clarification';

export type NarrationCategory =
  | 'unlock_status'
  | 'requirements'
  | 'guidance'
  | 'celebration'
  | 'warning'
  | 'error';

// Main Mission Narration Node class
export class MissionNarrationNode {
  private static instance: MissionNarrationNode;
  private narrationHistory: NarrationEvent[] = [];
  private readonly maxHistoryEntries = 1000;
  
  // TTS is completely suppressed per project requirements
  private readonly ttsEnabled = false;
  
  private constructor() {
    console.log('🔇 MissionNarrationNode initialized with TTS suppression and ARIA support');
  }
  
  static getInstance(): MissionNarrationNode {
    if (!MissionNarrationNode.instance) {
      MissionNarrationNode.instance = new MissionNarrationNode();
    }
    return MissionNarrationNode.instance;
  }
  
  // Announce successful unlock
  announceUnlockSuccess(
    missionId: string,
    missionTitle: string,
    unlockMethod: string,
    userId?: string
  ): NarrationEvent {
    
    const message = `Mission "${missionTitle}" unlocked successfully via ${this.formatUnlockMethod(unlockMethod)}. Access granted.`;
    
    const event = this.createNarrationEvent({
      type: 'unlock_success',
      message,
      priority: 'high',
      category: 'celebration',
      metadata: {
        missionId,
        userId,
        actionNeeded: 'Navigate to mission to begin engagement'
      }
    });
    
    this.addToHistory(event);
    this.logNarration('unlock_success', message);
    
    return event;
  }
  
  // Announce blocked unlock with explanation
  announceUnlockBlocked(
    missionId: string,
    missionTitle: string,
    blockers: UnlockBlocker[],
    userId?: string
  ): NarrationEvent {
    
    const primaryBlocker = blockers[0];
    const blockerCount = blockers.length;
    
    let message = `Mission "${missionTitle}" access blocked. `;
    
    if (primaryBlocker) {
      message += `Primary requirement: ${primaryBlocker.message}. `;
      if (blockerCount > 1) {
        message += `${blockerCount - 1} additional requirements needed. `;
      }
    }
    
    message += 'Review requirements below for unlock guidance.';
    
    const event = this.createNarrationEvent({
      type: 'unlock_blocked',
      message,
      priority: 'high',
      category: 'warning',
      metadata: {
        missionId,
        userId,
        blockerType: primaryBlocker?.type,
        requirement: primaryBlocker?.message,
        actionNeeded: primaryBlocker?.actionRequired
      }
    });
    
    this.addToHistory(event);
    this.logNarration('unlock_blocked', message);
    
    return event;
  }
  
  // Announce replay requirement
  announceReplayRequired(
    missionId: string,
    missionTitle: string,
    prerequisiteMission: string,
    userId?: string
  ): NarrationEvent {
    
    const message = `Mission "${missionTitle}" requires completion of prerequisite mission "${prerequisiteMission}". Complete and validate the prerequisite to unlock access.`;
    
    const event = this.createNarrationEvent({
      type: 'replay_required',
      message,
      priority: 'medium',
      category: 'guidance',
      metadata: {
        missionId,
        userId,
        requirement: `Complete ${prerequisiteMission}`,
        actionNeeded: `Navigate to ${prerequisiteMission} and complete all requirements`
      }
    });
    
    this.addToHistory(event);
    this.logNarration('replay_required', message);
    
    return event;
  }
  
  // Announce tier insufficiency
  announceTierInsufficient(
    missionId: string,
    missionTitle: string,
    requiredTier: string,
    currentTier: string,
    userId?: string
  ): NarrationEvent {
    
    const message = `Mission "${missionTitle}" requires ${requiredTier} tier access. Current tier: ${currentTier}. Advance through civic engagement to unlock higher tier access.`;
    
    const event = this.createNarrationEvent({
      type: 'tier_insufficient',
      message,
      priority: 'high',
      category: 'requirements',
      metadata: {
        missionId,
        userId,
        requirement: `Achieve ${requiredTier} tier status`,
        actionNeeded: `Complete civic activities to advance from ${currentTier} to ${requiredTier}`
      }
    });
    
    this.addToHistory(event);
    this.logNarration('tier_insufficient', message);
    
    return event;
  }
  
  // Announce trust score insufficiency
  announceTrustInsufficient(
    missionId: string,
    missionTitle: string,
    requiredScore: number,
    currentScore: number,
    userId?: string
  ): NarrationEvent {
    
    const pointsNeeded = requiredScore - currentScore;
    const message = `Mission "${missionTitle}" requires trust score of ${requiredScore}. Current score: ${currentScore}. Increase trust by ${pointsNeeded} points through verified civic participation.`;
    
    const event = this.createNarrationEvent({
      type: 'trust_insufficient',
      message,
      priority: 'medium',
      category: 'requirements',
      metadata: {
        missionId,
        userId,
        requirement: `Achieve trust score of ${requiredScore}`,
        actionNeeded: `Participate in civic activities to increase trust by ${pointsNeeded} points`
      }
    });
    
    this.addToHistory(event);
    this.logNarration('trust_insufficient', message);
    
    return event;
  }
  
  // Announce feedback requirement
  announceFeedbackRequired(
    missionId: string,
    missionTitle: string,
    requiresFeedback: boolean,
    requiresVote: boolean,
    userId?: string
  ): NarrationEvent {
    
    let message = `Mission "${missionTitle}" requires `;
    const requirements: string[] = [];
    
    if (requiresFeedback) {
      requirements.push('verified feedback submission');
    }
    
    if (requiresVote) {
      requirements.push('verified vote participation');
    }
    
    message += requirements.join(' and ');
    message += '. Participate in governance systems to fulfill requirements.';
    
    const event = this.createNarrationEvent({
      type: 'feedback_required',
      message,
      priority: 'medium',
      category: 'requirements',
      metadata: {
        missionId,
        userId,
        requirement: requirements.join(' and '),
        actionNeeded: 'Submit feedback or cast votes in governance systems'
      }
    });
    
    this.addToHistory(event);
    this.logNarration('feedback_required', message);
    
    return event;
  }
  
  // Provide eligibility explanation
  explainEligibility(
    eligibility: UnlockEligibility,
    missionTitle: string,
    userId?: string
  ): NarrationEvent {
    
    let message = `Mission "${missionTitle}" eligibility summary: `;
    
    if (eligibility.isUnlocked) {
      message += 'All requirements met. Access granted.';
    } else {
      const failedRequirements: string[] = [];
      
      if (!eligibility.requirements.tierSufficient) {
        failedRequirements.push(`tier (requires ${eligibility.requirements.tierRequired})`);
      }
      
      if (!eligibility.requirements.trustSufficient) {
        failedRequirements.push(`trust score (requires ${eligibility.requirements.trustRequired})`);
      }
      
      if (!eligibility.requirements.replayValidated && eligibility.requirements.replayRequired) {
        failedRequirements.push('prerequisite completion');
      }
      
      if (!eligibility.requirements.feedbackProvided && eligibility.requirements.feedbackRequired) {
        failedRequirements.push('feedback submission');
      }
      
      if (!eligibility.requirements.voteVerified && eligibility.requirements.voteRequired) {
        failedRequirements.push('vote verification');
      }
      
      message += `Missing requirements: ${failedRequirements.join(', ')}. `;
      message += `${eligibility.blockers.length} requirements must be fulfilled.`;
    }
    
    const event = this.createNarrationEvent({
      type: 'eligibility_explanation',
      message,
      priority: 'medium',
      category: 'guidance',
      metadata: {
        missionId: eligibility.missionId,
        userId,
        requirement: eligibility.isUnlocked ? 'All requirements met' : 'Multiple requirements pending',
        actionNeeded: eligibility.nextSteps[0] || 'Review mission requirements'
      }
    });
    
    this.addToHistory(event);
    this.logNarration('eligibility_explanation', message);
    
    return event;
  }
  
  // Provide next steps guidance
  provideNextStepsGuidance(
    missionId: string,
    missionTitle: string,
    nextSteps: string[],
    userId?: string
  ): NarrationEvent {
    
    let message = `Next steps to unlock "${missionTitle}": `;
    
    if (nextSteps.length > 0) {
      message += nextSteps.slice(0, 3).join('. ') + '.';
    } else {
      message += 'Navigate to mission requirements for detailed guidance.';
    }
    
    const event = this.createNarrationEvent({
      type: 'next_steps_guide',
      message,
      priority: 'low',
      category: 'guidance',
      metadata: {
        missionId,
        userId,
        actionNeeded: nextSteps[0] || 'Review mission requirements'
      }
    });
    
    this.addToHistory(event);
    this.logNarration('next_steps_guide', message);
    
    return event;
  }
  
  // Clarify specific requirement
  clarifyRequirement(
    missionId: string,
    missionTitle: string,
    requirementType: string,
    explanation: string,
    userId?: string
  ): NarrationEvent {
    
    const message = `"${missionTitle}" requirement clarification: ${requirementType}. ${explanation}`;
    
    const event = this.createNarrationEvent({
      type: 'requirement_clarification',
      message,
      priority: 'low',
      category: 'guidance',
      metadata: {
        missionId,
        userId,
        requirement: requirementType,
        actionNeeded: 'Follow requirement guidelines'
      }
    });
    
    this.addToHistory(event);
    this.logNarration('requirement_clarification', message);
    
    return event;
  }
  
  // Create narration event
  private createNarrationEvent(
    partial: Omit<NarrationEvent, 'eventId' | 'timestamp'>
  ): NarrationEvent {
    return {
      eventId: `narration-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...partial
    };
  }
  
  // Add event to history
  private addToHistory(event: NarrationEvent): void {
    this.narrationHistory.push(event);
    
    // Maintain history size
    if (this.narrationHistory.length > this.maxHistoryEntries) {
      this.narrationHistory = this.narrationHistory.slice(-this.maxHistoryEntries);
    }
  }
  
  // Format unlock method for user display
  private formatUnlockMethod(unlockMethod: string): string {
    switch (unlockMethod) {
      case 'memory_replay': return 'prerequisite completion';
      case 'identity_tier': return 'tier advancement';
      case 'trust_threshold': return 'trust score achievement';
      case 'feedback_badge': return 'feedback contribution';
      case 'verified_vote': return 'vote verification';
      case 'admin_override': return 'administrative approval';
      default: return 'system verification';
    }
  }
  
  // Console logging with TTS suppression notation
  private logNarration(eventType: string, message: string): void {
    console.log(`🔇 Mission Narration — ${eventType}: ${message}`);
  }
  
  // Get narration history for user
  getNarrationHistory(userId?: string, limit?: number): NarrationEvent[] {
    let filtered = this.narrationHistory;
    
    if (userId) {
      filtered = filtered.filter(event => event.metadata.userId === userId);
    }
    
    const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  // Get narration events by type
  getEventsByType(eventType: NarrationEventType, limit?: number): NarrationEvent[] {
    const filtered = this.narrationHistory
      .filter(event => event.type === eventType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get narration events by category
  getEventsByCategory(category: NarrationCategory, limit?: number): NarrationEvent[] {
    const filtered = this.narrationHistory
      .filter(event => event.category === category)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get narration statistics
  getNarrationStatistics(): {
    totalEvents: number;
    eventTypeCounts: Record<NarrationEventType, number>;
    categoryCounts: Record<NarrationCategory, number>;
    priorityCounts: Record<string, number>;
    recentActivity: number;
  } {
    
    const eventTypeCounts: Record<NarrationEventType, number> = {
      unlock_success: 0,
      unlock_blocked: 0,
      replay_required: 0,
      tier_insufficient: 0,
      trust_insufficient: 0,
      feedback_required: 0,
      eligibility_explanation: 0,
      next_steps_guide: 0,
      requirement_clarification: 0
    };
    
    const categoryCounts: Record<NarrationCategory, number> = {
      unlock_status: 0,
      requirements: 0,
      guidance: 0,
      celebration: 0,
      warning: 0,
      error: 0
    };
    
    const priorityCounts: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    this.narrationHistory.forEach(event => {
      eventTypeCounts[event.type]++;
      categoryCounts[event.category]++;
      priorityCounts[event.priority]++;
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    const recentActivity = this.narrationHistory.filter(event => 
      new Date(event.timestamp).getTime() > oneDayAgo
    ).length;
    
    return {
      totalEvents: this.narrationHistory.length,
      eventTypeCounts,
      categoryCounts,
      priorityCounts,
      recentActivity
    };
  }
  
  // Clear narration history (admin function)
  clearNarrationHistory(): void {
    this.narrationHistory = [];
    console.log('🧹 Mission narration history cleared');
  }
  
  // Export narration data
  exportNarrationData(): {
    exportedAt: string;
    ttsEnabled: boolean;
    totalEvents: number;
    events: NarrationEvent[];
    statistics: ReturnType<MissionNarrationNode['getNarrationStatistics']>;
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
export const announceUnlockSuccess = (
  missionId: string,
  missionTitle: string,
  unlockMethod: string,
  userId?: string
): NarrationEvent => {
  const narrator = MissionNarrationNode.getInstance();
  return narrator.announceUnlockSuccess(missionId, missionTitle, unlockMethod, userId);
};

export const announceUnlockBlocked = (
  missionId: string,
  missionTitle: string,
  blockers: UnlockBlocker[],
  userId?: string
): NarrationEvent => {
  const narrator = MissionNarrationNode.getInstance();
  return narrator.announceUnlockBlocked(missionId, missionTitle, blockers, userId);
};

export const announceReplayRequired = (
  missionId: string,
  missionTitle: string,
  prerequisiteMission: string,
  userId?: string
): NarrationEvent => {
  const narrator = MissionNarrationNode.getInstance();
  return narrator.announceReplayRequired(missionId, missionTitle, prerequisiteMission, userId);
};

export const announceTierInsufficient = (
  missionId: string,
  missionTitle: string,
  requiredTier: string,
  currentTier: string,
  userId?: string
): NarrationEvent => {
  const narrator = MissionNarrationNode.getInstance();
  return narrator.announceTierInsufficient(missionId, missionTitle, requiredTier, currentTier, userId);
};

export const announceTrustInsufficient = (
  missionId: string,
  missionTitle: string,
  requiredScore: number,
  currentScore: number,
  userId?: string
): NarrationEvent => {
  const narrator = MissionNarrationNode.getInstance();
  return narrator.announceTrustInsufficient(missionId, missionTitle, requiredScore, currentScore, userId);
};

export const announceFeedbackRequired = (
  missionId: string,
  missionTitle: string,
  requiresFeedback: boolean,
  requiresVote: boolean,
  userId?: string
): NarrationEvent => {
  const narrator = MissionNarrationNode.getInstance();
  return narrator.announceFeedbackRequired(missionId, missionTitle, requiresFeedback, requiresVote, userId);
};

export const explainEligibility = (
  eligibility: UnlockEligibility,
  missionTitle: string,
  userId?: string
): NarrationEvent => {
  const narrator = MissionNarrationNode.getInstance();
  return narrator.explainEligibility(eligibility, missionTitle, userId);
};

export default MissionNarrationNode;