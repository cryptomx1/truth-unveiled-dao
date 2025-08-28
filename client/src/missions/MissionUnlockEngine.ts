/**
 * MissionUnlockEngine.ts - Phase XXV
 * Dynamic Mission Access & Eligibility Engine
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  CivicMissionLedger,
  type MissionDefinition,
  type MissionLedgerEntry,
  type MissionStatus,
  type UserTier,
  type UnlockMethod
} from './CivicMissionLedger';

// Types for unlock engine
export interface UnlockEligibility {
  missionId: string;
  isUnlocked: boolean;
  status: MissionStatus;
  blockers: UnlockBlocker[];
  unlockedVia?: UnlockMethod;
  requirements: {
    tierRequired: UserTier;
    tierCurrent: UserTier;
    tierSufficient: boolean;
    trustRequired: number;
    trustCurrent: number;
    trustSufficient: boolean;
    replayRequired: boolean;
    replayValidated: boolean;
    feedbackRequired: boolean;
    feedbackProvided: boolean;
    voteRequired: boolean;
    voteVerified: boolean;
  };
  unlockHints: string[];
  nextSteps: string[];
}

export interface UnlockBlocker {
  type: 'tier' | 'trust' | 'replay' | 'feedback' | 'vote';
  message: string;
  actionRequired: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserContext {
  userId: string;
  userTier: UserTier;
  trustScore: number;
  replayHistory: ReplayRecord[];
  feedbackBadges: string[];
  verifiedVotes: number;
  lastActivityAt: string;
}

export interface ReplayRecord {
  missionId: string;
  traceHash: string;
  validatedAt: string;
  isValid: boolean;
}

export interface UnlockAttempt {
  attemptId: string;
  missionId: string;
  userId: string;
  timestamp: string;
  result: 'success' | 'blocked' | 'error';
  blockers: UnlockBlocker[];
  method?: UnlockMethod;
  metadata: {
    userContext: UserContext;
    eligibility: UnlockEligibility;
  };
}

// Main Mission Unlock Engine class
export class MissionUnlockEngine {
  private static instance: MissionUnlockEngine;
  private ledger: CivicMissionLedger;
  private unlockAttempts: Map<string, UnlockAttempt[]> = new Map();
  
  private constructor() {
    this.ledger = CivicMissionLedger.getInstance();
    console.log('🔐 MissionUnlockEngine initialized for dynamic mission access control');
  }
  
  static getInstance(): MissionUnlockEngine {
    if (!MissionUnlockEngine.instance) {
      MissionUnlockEngine.instance = new MissionUnlockEngine();
    }
    return MissionUnlockEngine.instance;
  }
  
  // Check unlock eligibility for a mission
  checkUnlockEligibility(missionId: string, userContext: UserContext): UnlockEligibility {
    const mission = this.ledger.getMissionDefinition(missionId);
    const existingEntry = this.ledger.getMissionEntry(missionId, userContext.userId);
    
    if (!mission) {
      throw new Error(`Mission not found: ${missionId}`);
    }
    
    // Check tier requirement
    const tierSufficient = this.compareTiers(userContext.userTier, mission.requirements.minTier) >= 0;
    
    // Check trust requirement
    const trustSufficient = userContext.trustScore >= mission.requirements.minTrustScore;
    
    // Check replay requirement
    const replayValidated = !mission.requirements.requireReplay || 
      this.isReplayValidated(userContext, mission.requirements.replayMissionId);
    
    // Check feedback requirement
    const feedbackProvided = !mission.requirements.requireFeedback || 
      userContext.feedbackBadges.length > 0;
    
    // Check vote requirement
    const voteVerified = !mission.requirements.requireVote || 
      userContext.verifiedVotes > 0;
    
    // Determine status and blockers
    const blockers: UnlockBlocker[] = [];
    let status: MissionStatus = 'locked';
    
    if (!tierSufficient) {
      status = 'tier_insufficient';
      blockers.push({
        type: 'tier',
        message: `Requires ${mission.requirements.minTier} tier or higher`,
        actionRequired: `Advance to ${mission.requirements.minTier} tier through civic engagement`,
        priority: 'high'
      });
    }
    
    if (!trustSufficient) {
      status = 'trust_insufficient';
      blockers.push({
        type: 'trust',
        message: `Requires trust score of ${mission.requirements.minTrustScore}`,
        actionRequired: `Increase trust score by ${mission.requirements.minTrustScore - userContext.trustScore} points`,
        priority: 'high'
      });
    }
    
    if (!replayValidated) {
      status = 'replay_required';
      blockers.push({
        type: 'replay',
        message: `Requires completion of prerequisite mission`,
        actionRequired: `Complete and validate ${mission.requirements.replayMissionId || 'prerequisite'} mission`,
        priority: 'medium'
      });
    }
    
    if (!feedbackProvided) {
      status = 'feedback_required';
      blockers.push({
        type: 'feedback',
        message: 'Requires verified feedback submission',
        actionRequired: 'Submit feedback in governance or consensus systems',
        priority: 'medium'
      });
    }
    
    if (!voteVerified) {
      status = 'feedback_required'; // Using same status for feedback-related blocks
      blockers.push({
        type: 'vote',
        message: 'Requires verified vote participation',
        actionRequired: 'Cast votes in civic governance processes',
        priority: 'medium'
      });
    }
    
    // If all requirements met
    const isUnlocked = tierSufficient && trustSufficient && replayValidated && feedbackProvided && voteVerified;
    if (isUnlocked) {
      status = 'unlocked';
    }
    
    // Determine unlock method if unlocked
    let unlockedVia: UnlockMethod | undefined;
    if (isUnlocked) {
      if (userContext.verifiedVotes > 0) unlockedVia = 'verified_vote';
      else if (userContext.feedbackBadges.length > 0) unlockedVia = 'feedback_badge';
      else if (replayValidated) unlockedVia = 'memory_replay';
      else if (userContext.userTier !== 'Citizen') unlockedVia = 'identity_tier';
      else if (trustSufficient) unlockedVia = 'trust_threshold';
    }
    
    return {
      missionId,
      isUnlocked,
      status,
      blockers,
      unlockedVia,
      requirements: {
        tierRequired: mission.requirements.minTier,
        tierCurrent: userContext.userTier,
        tierSufficient,
        trustRequired: mission.requirements.minTrustScore,
        trustCurrent: userContext.trustScore,
        trustSufficient,
        replayRequired: mission.requirements.requireReplay,
        replayValidated,
        feedbackRequired: mission.requirements.requireFeedback,
        feedbackProvided,
        voteRequired: mission.requirements.requireVote,
        voteVerified
      },
      unlockHints: mission.unlockHints,
      nextSteps: this.generateNextSteps(blockers, mission)
    };
  }
  
  // Attempt to unlock a mission
  attemptUnlock(missionId: string, userContext: UserContext): UnlockAttempt {
    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const eligibility = this.checkUnlockEligibility(missionId, userContext);
    
    let result: 'success' | 'blocked' | 'error';
    
    try {
      if (eligibility.isUnlocked) {
        // Add successful unlock to ledger
        this.ledger.addMissionEvent(
          missionId,
          'unlocked',
          userContext.userId,
          userContext.userTier,
          userContext.trustScore,
          `trace:unlock:${attemptId}`,
          eligibility.unlockedVia || 'trust_threshold',
          {
            replayValidated: eligibility.requirements.replayValidated,
            feedbackBadge: userContext.feedbackBadges[0],
            voteVerified: eligibility.requirements.voteVerified,
            unlockAttempts: this.getUnlockAttemptCount(missionId, userContext.userId) + 1,
            lastAttemptAt: new Date().toISOString()
          }
        );
        
        result = 'success';
        console.log(`🔓 Mission unlocked — ${missionId} | User: ${userContext.userId} | Method: ${eligibility.unlockedVia}`);
        
      } else {
        // Add blocked attempt to ledger
        this.ledger.addMissionEvent(
          missionId,
          eligibility.status,
          userContext.userId,
          userContext.userTier,
          userContext.trustScore,
          `trace:blocked:${attemptId}`,
          'none',
          {
            replayValidated: eligibility.requirements.replayValidated,
            unlockAttempts: this.getUnlockAttemptCount(missionId, userContext.userId) + 1,
            lastAttemptAt: new Date().toISOString()
          }
        );
        
        result = 'blocked';
        console.log(`🔒 Mission unlock blocked — ${missionId} | User: ${userContext.userId} | Status: ${eligibility.status} | Blockers: ${eligibility.blockers.length}`);
      }
      
    } catch (error) {
      result = 'error';
      console.error(`❌ Mission unlock error — ${missionId} | User: ${userContext.userId} | Error: ${error}`);
    }
    
    const attempt: UnlockAttempt = {
      attemptId,
      missionId,
      userId: userContext.userId,
      timestamp: new Date().toISOString(),
      result,
      blockers: eligibility.blockers,
      method: eligibility.unlockedVia,
      metadata: {
        userContext,
        eligibility
      }
    };
    
    // Store attempt history
    const userAttempts = this.unlockAttempts.get(userContext.userId) || [];
    userAttempts.push(attempt);
    this.unlockAttempts.set(userContext.userId, userAttempts.slice(-100)); // Keep last 100 attempts
    
    return attempt;
  }
  
  // Validate replay completion
  validateReplayCompletion(
    missionId: string,
    userId: string,
    replayMissionId: string,
    traceHash: string
  ): boolean {
    
    // Check if the prerequisite mission is unlocked/completed
    const prerequisiteEntry = this.ledger.getMissionEntry(replayMissionId, userId);
    
    if (!prerequisiteEntry || prerequisiteEntry.status !== 'unlocked') {
      console.log(`🧠 Replay validation failed — ${missionId} | Prerequisite ${replayMissionId} not unlocked`);
      return false;
    }
    
    // Update mission with replay validation
    const updated = this.ledger.updateMissionViaReplay(missionId, userId, traceHash, true);
    
    if (updated) {
      console.log(`🧠 Replay validation successful — ${missionId} | User: ${userId} | Prerequisite: ${replayMissionId}`);
      return true;
    }
    
    return false;
  }
  
  // Update mission via feedback submission
  updateMissionViaFeedback(
    missionId: string,
    userId: string,
    feedbackBadge?: string,
    voteVerified?: boolean
  ): boolean {
    
    const updated = this.ledger.updateMissionViaFeedback(missionId, userId, feedbackBadge, voteVerified);
    
    if (updated) {
      console.log(`🔄 Feedback update successful — ${missionId} | User: ${userId} | Badge: ${feedbackBadge} | Vote: ${voteVerified}`);
      return true;
    }
    
    return false;
  }
  
  // Get user missions overview
  getUserMissionsOverview(userContext: UserContext): {
    totalMissions: number;
    unlockedMissions: number;
    blockedMissions: number;
    missionStates: Array<{
      mission: MissionDefinition;
      eligibility: UnlockEligibility;
      ledgerEntry?: MissionLedgerEntry;
    }>;
  } {
    
    const allMissions = this.ledger.getAllMissionDefinitions();
    const missionStates = allMissions.map(mission => {
      const eligibility = this.checkUnlockEligibility(mission.missionId, userContext);
      const ledgerEntry = this.ledger.getMissionEntry(mission.missionId, userContext.userId);
      
      return {
        mission,
        eligibility,
        ledgerEntry: ledgerEntry || undefined
      };
    });
    
    const unlockedCount = missionStates.filter(state => state.eligibility.isUnlocked).length;
    
    return {
      totalMissions: allMissions.length,
      unlockedMissions: unlockedCount,
      blockedMissions: allMissions.length - unlockedCount,
      missionStates
    };
  }
  
  // Get unlock attempt history for user
  getUnlockAttemptHistory(userId: string, limit?: number): UnlockAttempt[] {
    const userAttempts = this.unlockAttempts.get(userId) || [];
    const sorted = userAttempts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  // Get unlock attempt count for specific mission
  private getUnlockAttemptCount(missionId: string, userId: string): number {
    const userAttempts = this.unlockAttempts.get(userId) || [];
    return userAttempts.filter(attempt => attempt.missionId === missionId).length;
  }
  
  // Check if replay is validated for user
  private isReplayValidated(userContext: UserContext, replayMissionId?: string): boolean {
    if (!replayMissionId) return true;
    
    return userContext.replayHistory.some(record => 
      record.missionId === replayMissionId && record.isValid
    );
  }
  
  // Compare user tiers
  private compareTiers(userTier: UserTier, requiredTier: UserTier): number {
    const tierOrder: UserTier[] = ['Citizen', 'Verifier', 'Moderator', 'Governor', 'Administrator'];
    return tierOrder.indexOf(userTier) - tierOrder.indexOf(requiredTier);
  }
  
  // Generate next steps based on blockers
  private generateNextSteps(blockers: UnlockBlocker[], mission: MissionDefinition): string[] {
    const nextSteps: string[] = [];
    
    // Sort blockers by priority
    const sortedBlockers = blockers.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    sortedBlockers.forEach((blocker, index) => {
      if (index < 3) { // Limit to top 3 steps
        nextSteps.push(`${index + 1}. ${blocker.actionRequired}`);
      }
    });
    
    if (nextSteps.length === 0) {
      nextSteps.push('Navigate to mission to begin civic engagement');
    }
    
    return nextSteps;
  }
  
  // Get mission access statistics
  getMissionAccessStatistics(): {
    totalAttempts: number;
    successfulUnlocks: number;
    blockedAttempts: number;
    errorAttempts: number;
    topBlockers: Array<{ type: string; count: number; }>;
    tierDistribution: Record<UserTier, number>;
    recentActivity: number;
  } {
    
    const allAttempts = Array.from(this.unlockAttempts.values()).flat();
    
    const totalAttempts = allAttempts.length;
    const successfulUnlocks = allAttempts.filter(a => a.result === 'success').length;
    const blockedAttempts = allAttempts.filter(a => a.result === 'blocked').length;
    const errorAttempts = allAttempts.filter(a => a.result === 'error').length;
    
    // Count blocker types
    const blockerCounts: Record<string, number> = {};
    allAttempts.forEach(attempt => {
      attempt.blockers.forEach(blocker => {
        blockerCounts[blocker.type] = (blockerCounts[blocker.type] || 0) + 1;
      });
    });
    
    const topBlockers = Object.entries(blockerCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Tier distribution
    const tierDistribution: Record<UserTier, number> = {
      Citizen: 0,
      Verifier: 0,
      Moderator: 0,
      Governor: 0,
      Administrator: 0
    };
    
    allAttempts.forEach(attempt => {
      tierDistribution[attempt.metadata.userContext.userTier]++;
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    const recentActivity = allAttempts.filter(attempt => 
      new Date(attempt.timestamp).getTime() > oneDayAgo
    ).length;
    
    return {
      totalAttempts,
      successfulUnlocks,
      blockedAttempts,
      errorAttempts,
      topBlockers,
      tierDistribution,
      recentActivity
    };
  }
  
  // Clear attempt history (admin function)
  clearAttemptHistory(userId?: string): void {
    if (userId) {
      this.unlockAttempts.delete(userId);
      console.log(`🧹 Unlock attempt history cleared for user: ${userId}`);
    } else {
      this.unlockAttempts.clear();
      console.log('🧹 All unlock attempt history cleared');
    }
  }
  
  // Export unlock data
  exportUnlockData(): {
    exportedAt: string;
    attempts: UnlockAttempt[];
    statistics: ReturnType<MissionUnlockEngine['getMissionAccessStatistics']>;
  } {
    return {
      exportedAt: new Date().toISOString(),
      attempts: Array.from(this.unlockAttempts.values()).flat(),
      statistics: this.getMissionAccessStatistics()
    };
  }
}

// Utility functions for creating user contexts
export const createUserContext = (
  userId: string,
  userTier: UserTier = 'Citizen',
  trustScore: number = 25,
  additionalData: Partial<UserContext> = {}
): UserContext => {
  return {
    userId,
    userTier,
    trustScore,
    replayHistory: [],
    feedbackBadges: [],
    verifiedVotes: 0,
    lastActivityAt: new Date().toISOString(),
    ...additionalData
  };
};

export const checkMissionAccess = (missionId: string, userContext: UserContext): UnlockEligibility => {
  const engine = MissionUnlockEngine.getInstance();
  return engine.checkUnlockEligibility(missionId, userContext);
};

export const attemptMissionUnlock = (missionId: string, userContext: UserContext): UnlockAttempt => {
  const engine = MissionUnlockEngine.getInstance();
  return engine.attemptUnlock(missionId, userContext);
};

export default MissionUnlockEngine;