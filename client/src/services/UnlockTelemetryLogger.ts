/**
 * UnlockTelemetryLogger.ts - Phase XXV
 * Mission Unlock Attempt & Success Telemetry System
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  type UnlockAttempt,
  type UnlockEligibility,
  type UnlockBlocker
} from '../missions/MissionUnlockEngine';

// Types for unlock telemetry system
export interface UnlockTelemetryEntry {
  entryId: string;
  operation: UnlockOperation;
  timestamp: string;
  missionId: string;
  userId: string;
  result: 'success' | 'blocked' | 'error';
  duration: number;
  metadata: {
    userTier?: string;
    trustScore?: number;
    unlockMethod?: string;
    blockerCount?: number;
    primaryBlocker?: string;
    attemptNumber?: number;
    error?: string;
  };
}

export type UnlockOperation = 
  | 'unlock_attempt'
  | 'unlock_success'
  | 'unlock_blocked'
  | 'replay_validation'
  | 'feedback_update'
  | 'eligibility_check'
  | 'admin_override';

export interface UnlockTelemetryMetrics {
  totalAttempts: number;
  successfulUnlocks: number;
  blockedAttempts: number;
  errorAttempts: number;
  averageDuration: number;
  successRate: number;
  operationCounts: Record<UnlockOperation, number>;
  recentActivity: number;
}

// Main Unlock Telemetry Logger class
export class UnlockTelemetryLogger {
  private static instance: UnlockTelemetryLogger;
  private telemetryLog: UnlockTelemetryEntry[] = [];
  private readonly maxLogEntries = 5000;
  
  private constructor() {
    console.log('🔍 UnlockTelemetryLogger initialized for mission unlock tracking');
  }
  
  static getInstance(): UnlockTelemetryLogger {
    if (!UnlockTelemetryLogger.instance) {
      UnlockTelemetryLogger.instance = new UnlockTelemetryLogger();
    }
    return UnlockTelemetryLogger.instance;
  }
  
  // Log unlock attempt
  logUnlockAttempt(
    missionId: string,
    userId: string,
    userTier: string,
    trustScore: number,
    duration: number
  ): void {
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation: 'unlock_attempt',
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: 'blocked', // Will be updated if successful
      duration,
      metadata: {
        userTier,
        trustScore,
        attemptNumber: this.getAttemptNumber(missionId, userId)
      }
    };
    
    this.addTelemetryEntry(entry);
    
    console.log(`🔐 Unlock attempt — Mission: ${missionId} | User: ${userId} | Tier: ${userTier} | Trust: ${trustScore} | Duration: ${duration}ms`);
  }
  
  // Log successful unlock
  logUnlockSuccess(
    missionId: string,
    userId: string,
    unlockMethod: string,
    userTier: string,
    trustScore: number,
    duration: number
  ): void {
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation: 'unlock_success',
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: 'success',
      duration,
      metadata: {
        userTier,
        trustScore,
        unlockMethod,
        attemptNumber: this.getAttemptNumber(missionId, userId)
      }
    };
    
    this.addTelemetryEntry(entry);
    
    console.log(`🔓 Mission unlocked — ${missionId} | User: ${userId} | Method: ${unlockMethod} | Duration: ${duration}ms`);
  }
  
  // Log blocked unlock attempt
  logUnlockBlocked(
    missionId: string,
    userId: string,
    blockers: UnlockBlocker[],
    userTier: string,
    trustScore: number,
    duration: number
  ): void {
    
    const primaryBlocker = blockers.length > 0 ? blockers[0].type : 'unknown';
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation: 'unlock_blocked',
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: 'blocked',
      duration,
      metadata: {
        userTier,
        trustScore,
        blockerCount: blockers.length,
        primaryBlocker,
        attemptNumber: this.getAttemptNumber(missionId, userId)
      }
    };
    
    this.addTelemetryEntry(entry);
    
    // Specific console message based on blocker type
    let blockerMessage = '';
    switch (primaryBlocker) {
      case 'tier':
        blockerMessage = `Tier: ${userTier} insufficient`;
        break;
      case 'trust':
        blockerMessage = `Trust: ${trustScore} insufficient`;
        break;
      case 'replay':
        blockerMessage = 'Replay required';
        break;
      case 'feedback':
        blockerMessage = 'Feedback required';
        break;
      case 'vote':
        blockerMessage = 'Vote required';
        break;
      default:
        blockerMessage = 'Requirements not met';
    }
    
    console.log(`🔒 Unlock blocked — ${missionId} | User: ${userId} | ${blockerMessage} | Blockers: ${blockers.length} | Duration: ${duration}ms`);
  }
  
  // Log replay validation
  logReplayValidation(
    missionId: string,
    userId: string,
    replayMissionId: string,
    isValid: boolean,
    duration: number
  ): void {
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation: 'replay_validation',
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: isValid ? 'success' : 'blocked',
      duration,
      metadata: {
        unlockMethod: isValid ? 'memory_replay' : undefined,
        error: isValid ? undefined : `Prerequisite ${replayMissionId} not completed`
      }
    };
    
    this.addTelemetryEntry(entry);
    
    if (isValid) {
      console.log(`🧠 Replay validated — ${missionId} | User: ${userId} | Prerequisite: ${replayMissionId} | Duration: ${duration}ms`);
    } else {
      console.log(`🧠 Replay validation failed — ${missionId} | User: ${userId} | Missing prerequisite: ${replayMissionId} | Duration: ${duration}ms`);
    }
  }
  
  // Log feedback update
  logFeedbackUpdate(
    missionId: string,
    userId: string,
    feedbackBadge?: string,
    voteVerified?: boolean,
    duration: number = 50
  ): void {
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation: 'feedback_update',
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: 'success',
      duration,
      metadata: {
        unlockMethod: voteVerified ? 'verified_vote' : feedbackBadge ? 'feedback_badge' : 'trust_threshold'
      }
    };
    
    this.addTelemetryEntry(entry);
    
    const updateType = voteVerified ? 'vote verified' : feedbackBadge ? `feedback badge: ${feedbackBadge}` : 'feedback updated';
    console.log(`🔄 Feedback update — ${missionId} | User: ${userId} | Update: ${updateType} | Duration: ${duration}ms`);
  }
  
  // Log eligibility check
  logEligibilityCheck(
    missionId: string,
    userId: string,
    eligibility: UnlockEligibility,
    duration: number
  ): void {
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation: 'eligibility_check',
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: eligibility.isUnlocked ? 'success' : 'blocked',
      duration,
      metadata: {
        userTier: eligibility.requirements.tierCurrent,
        trustScore: eligibility.requirements.trustCurrent,
        blockerCount: eligibility.blockers.length,
        primaryBlocker: eligibility.blockers[0]?.type
      }
    };
    
    this.addTelemetryEntry(entry);
    
    console.log(`🔍 Eligibility checked — ${missionId} | User: ${userId} | Eligible: ${eligibility.isUnlocked} | Blockers: ${eligibility.blockers.length} | Duration: ${duration}ms`);
  }
  
  // Log unlock error
  logUnlockError(
    operation: UnlockOperation,
    missionId: string,
    userId: string,
    error: string,
    duration: number
  ): void {
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation,
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: 'error',
      duration,
      metadata: {
        error
      }
    };
    
    this.addTelemetryEntry(entry);
    
    console.log(`❌ Unlock error — ${operation} | Mission: ${missionId} | User: ${userId} | Error: ${error} | Duration: ${duration}ms`);
  }
  
  // Log admin override
  logAdminOverride(
    missionId: string,
    userId: string,
    adminUserId: string,
    reason: string,
    duration: number = 25
  ): void {
    
    const entry: UnlockTelemetryEntry = {
      entryId: this.generateEntryId(),
      operation: 'admin_override',
      timestamp: new Date().toISOString(),
      missionId,
      userId,
      result: 'success',
      duration,
      metadata: {
        unlockMethod: 'admin_override',
        error: `Admin override by ${adminUserId}: ${reason}`
      }
    };
    
    this.addTelemetryEntry(entry);
    
    console.log(`🛡️ Admin override — ${missionId} | User: ${userId} | Admin: ${adminUserId} | Reason: ${reason} | Duration: ${duration}ms`);
  }
  
  // Add telemetry entry with size management
  private addTelemetryEntry(entry: UnlockTelemetryEntry): void {
    this.telemetryLog.push(entry);
    
    // Maintain log size
    if (this.telemetryLog.length > this.maxLogEntries) {
      this.telemetryLog = this.telemetryLog.slice(-this.maxLogEntries);
    }
  }
  
  // Generate unique entry ID
  private generateEntryId(): string {
    return `unlock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
  
  // Get attempt number for mission/user combination
  private getAttemptNumber(missionId: string, userId: string): number {
    return this.telemetryLog.filter(entry => 
      entry.missionId === missionId && 
      entry.userId === userId && 
      entry.operation === 'unlock_attempt'
    ).length + 1;
  }
  
  // Get telemetry entries by operation
  getEntriesByOperation(operation: UnlockOperation, limit?: number): UnlockTelemetryEntry[] {
    const filtered = this.telemetryLog
      .filter(entry => entry.operation === operation)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get telemetry entries for mission
  getEntriesForMission(missionId: string, limit?: number): UnlockTelemetryEntry[] {
    const filtered = this.telemetryLog
      .filter(entry => entry.missionId === missionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get telemetry entries for user
  getEntriesForUser(userId: string, limit?: number): UnlockTelemetryEntry[] {
    const filtered = this.telemetryLog
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get telemetry metrics
  getTelemetryMetrics(): UnlockTelemetryMetrics {
    const totalAttempts = this.telemetryLog.length;
    
    const successfulUnlocks = this.telemetryLog.filter(entry => entry.result === 'success').length;
    const blockedAttempts = this.telemetryLog.filter(entry => entry.result === 'blocked').length;
    const errorAttempts = this.telemetryLog.filter(entry => entry.result === 'error').length;
    
    const totalDuration = this.telemetryLog.reduce((sum, entry) => sum + entry.duration, 0);
    const averageDuration = totalAttempts > 0 ? totalDuration / totalAttempts : 0;
    
    const successRate = totalAttempts > 0 ? (successfulUnlocks / totalAttempts) * 100 : 0;
    
    const operationCounts: Record<UnlockOperation, number> = {
      unlock_attempt: 0,
      unlock_success: 0,
      unlock_blocked: 0,
      replay_validation: 0,
      feedback_update: 0,
      eligibility_check: 0,
      admin_override: 0
    };
    
    this.telemetryLog.forEach(entry => {
      operationCounts[entry.operation]++;
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    const recentActivity = this.telemetryLog.filter(entry => 
      new Date(entry.timestamp).getTime() > oneDayAgo
    ).length;
    
    return {
      totalAttempts,
      successfulUnlocks,
      blockedAttempts,
      errorAttempts,
      averageDuration: Math.round(averageDuration),
      successRate: Math.round(successRate * 10) / 10,
      operationCounts,
      recentActivity
    };
  }
  
  // Get success rate for specific mission
  getMissionSuccessRate(missionId: string): number {
    const missionEntries = this.telemetryLog.filter(entry => entry.missionId === missionId);
    if (missionEntries.length === 0) return 0;
    
    const successes = missionEntries.filter(entry => entry.result === 'success').length;
    return Math.round((successes / missionEntries.length) * 1000) / 10;
  }
  
  // Get user success rate
  getUserSuccessRate(userId: string): number {
    const userEntries = this.telemetryLog.filter(entry => entry.userId === userId);
    if (userEntries.length === 0) return 0;
    
    const successes = userEntries.filter(entry => entry.result === 'success').length;
    return Math.round((successes / userEntries.length) * 1000) / 10;
  }
  
  // Get top blockers analysis
  getTopBlockersAnalysis(): Array<{ blocker: string; count: number; percentage: number; }> {
    const blockerCounts: Record<string, number> = {};
    let totalBlocks = 0;
    
    this.telemetryLog.forEach(entry => {
      if (entry.result === 'blocked' && entry.metadata.primaryBlocker) {
        const blocker = entry.metadata.primaryBlocker;
        blockerCounts[blocker] = (blockerCounts[blocker] || 0) + 1;
        totalBlocks++;
      }
    });
    
    return Object.entries(blockerCounts)
      .map(([blocker, count]) => ({
        blocker,
        count,
        percentage: totalBlocks > 0 ? Math.round((count / totalBlocks) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }
  
  // Clear telemetry log (admin function)
  clearTelemetryLog(): void {
    this.telemetryLog = [];
    console.log('🧹 Unlock telemetry log cleared');
  }
  
  // Export telemetry data
  exportTelemetryData(): {
    exportedAt: string;
    totalEntries: number;
    entries: UnlockTelemetryEntry[];
    metrics: UnlockTelemetryMetrics;
    topBlockers: Array<{ blocker: string; count: number; percentage: number; }>;
  } {
    return {
      exportedAt: new Date().toISOString(),
      totalEntries: this.telemetryLog.length,
      entries: [...this.telemetryLog],
      metrics: this.getTelemetryMetrics(),
      topBlockers: this.getTopBlockersAnalysis()
    };
  }
}

// Export utility functions
export const logUnlockAttempt = (
  missionId: string,
  userId: string,
  userTier: string,
  trustScore: number,
  duration: number
): void => {
  const logger = UnlockTelemetryLogger.getInstance();
  logger.logUnlockAttempt(missionId, userId, userTier, trustScore, duration);
};

export const logUnlockSuccess = (
  missionId: string,
  userId: string,
  unlockMethod: string,
  userTier: string,
  trustScore: number,
  duration: number
): void => {
  const logger = UnlockTelemetryLogger.getInstance();
  logger.logUnlockSuccess(missionId, userId, unlockMethod, userTier, trustScore, duration);
};

export const logUnlockBlocked = (
  missionId: string,
  userId: string,
  blockers: UnlockBlocker[],
  userTier: string,
  trustScore: number,
  duration: number
): void => {
  const logger = UnlockTelemetryLogger.getInstance();
  logger.logUnlockBlocked(missionId, userId, blockers, userTier, trustScore, duration);
};

export const logReplayValidation = (
  missionId: string,
  userId: string,
  replayMissionId: string,
  isValid: boolean,
  duration: number
): void => {
  const logger = UnlockTelemetryLogger.getInstance();
  logger.logReplayValidation(missionId, userId, replayMissionId, isValid, duration);
};

export const logFeedbackUpdate = (
  missionId: string,
  userId: string,
  feedbackBadge?: string,
  voteVerified?: boolean,
  duration?: number
): void => {
  const logger = UnlockTelemetryLogger.getInstance();
  logger.logFeedbackUpdate(missionId, userId, feedbackBadge, voteVerified, duration);
};

export default UnlockTelemetryLogger;