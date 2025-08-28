/**
 * CivicMissionLedger.ts - Phase XXV
 * Immutable Civic Mission Event Ledger System
 * Authority: Commander Mark via JASMY Relay
 */

// Types for mission ledger system
export interface MissionLedgerEntry {
  entryId: string;
  missionId: string;
  status: MissionStatus;
  timestamp: string;
  sourceTraceHash: string;
  tierRequired: UserTier;
  unlockedVia: UnlockMethod;
  metadata: {
    userId: string;
    userTier: UserTier;
    trustScore: number;
    replayValidated: boolean;
    feedbackBadge?: string;
    voteVerified?: boolean;
    unlockAttempts: number;
    lastAttemptAt: string;
  };
}

export type MissionStatus = 
  | 'locked'
  | 'unlocked'
  | 'replay_required'
  | 'tier_insufficient'
  | 'trust_insufficient'
  | 'feedback_required'
  | 'completed';

export type UserTier = 
  | 'Citizen'
  | 'Verifier' 
  | 'Moderator'
  | 'Governor'
  | 'Administrator';

export type UnlockMethod = 
  | 'memory_replay'
  | 'identity_tier'
  | 'trust_threshold'
  | 'feedback_badge'
  | 'verified_vote'
  | 'admin_override'
  | 'none';

export interface MissionDefinition {
  missionId: string;
  title: string;
  description: string;
  category: 'wallet' | 'identity' | 'consensus' | 'feedback' | 'governance' | 'education';
  requirements: {
    minTier: UserTier;
    minTrustScore: number;
    requireReplay: boolean;
    replayMissionId?: string;
    requireFeedback: boolean;
    requireVote: boolean;
  };
  unlockHints: string[];
  route: string;
}

// Main Civic Mission Ledger class
export class CivicMissionLedger {
  private static instance: CivicMissionLedger;
  private ledger: Map<string, MissionLedgerEntry> = new Map();
  private missionDefinitions: Map<string, MissionDefinition> = new Map();
  private readonly maxLedgerEntries = 10000;
  
  private constructor() {
    console.log('📋 CivicMissionLedger initialized for mission access tracking');
    this.initializeMissionDefinitions();
    this.initializeMockLedgerEntries();
  }
  
  static getInstance(): CivicMissionLedger {
    if (!CivicMissionLedger.instance) {
      CivicMissionLedger.instance = new CivicMissionLedger();
    }
    return CivicMissionLedger.instance;
  }
  
  // Initialize mission definitions
  private initializeMissionDefinitions(): void {
    const missions: MissionDefinition[] = [
      {
        missionId: 'wallet-overview-deck1',
        title: 'Wallet Identity Overview',
        description: 'Access comprehensive wallet overview with identity summary, balance tracking, and participation streaks',
        category: 'wallet',
        requirements: {
          minTier: 'Citizen',
          minTrustScore: 25,
          requireReplay: false,
          requireFeedback: false,
          requireVote: false
        },
        unlockHints: [
          'Complete civic identity minting process',
          'Maintain minimum trust score of 25'
        ],
        route: '/civic-shell?deck=1'
      },
      {
        missionId: 'identity-verification-deck12',
        title: 'Civic Identity Management',
        description: 'Advanced identity verification with DID claims, biometric proofing, and credential issuance',
        category: 'identity',
        requirements: {
          minTier: 'Verifier',
          minTrustScore: 50,
          requireReplay: true,
          replayMissionId: 'wallet-overview-deck1',
          requireFeedback: false,
          requireVote: false
        },
        unlockHints: [
          'Complete wallet overview mission first',
          'Achieve Verifier tier status',
          'Maintain trust score above 50'
        ],
        route: '/civic-shell?deck=12'
      },
      {
        missionId: 'consensus-governance-deck9',
        title: 'Consensus Layer Governance',
        description: 'Vote consensus monitoring, deliberation panels, and ZK proposal management',
        category: 'consensus',
        requirements: {
          minTier: 'Moderator',
          minTrustScore: 70,
          requireReplay: true,
          replayMissionId: 'identity-verification-deck12',
          requireFeedback: true,
          requireVote: true
        },
        unlockHints: [
          'Complete identity verification mission',
          'Achieve Moderator tier or higher',
          'Maintain trust score above 70',
          'Submit verified feedback',
          'Cast at least one verified vote'
        ],
        route: '/civic-shell?deck=9'
      },
      {
        missionId: 'gov-feedback-deck10',
        title: 'Governance Feedback System',
        description: 'ZKP feedback nodes, sentiment aggregation, and impact analysis for civic governance',
        category: 'feedback',
        requirements: {
          minTier: 'Governor',
          minTrustScore: 85,
          requireReplay: true,
          replayMissionId: 'consensus-governance-deck9',
          requireFeedback: true,
          requireVote: true
        },
        unlockHints: [
          'Complete consensus governance mission',
          'Achieve Governor tier status',
          'Maintain trust score above 85',
          'Demonstrate consistent feedback submission',
          'Verify voting participation record'
        ],
        route: '/civic-shell?deck=10'
      },
      {
        missionId: 'civic-education-deck16',
        title: 'Civic Education Platform',
        description: 'ZKP learning modules, curriculum assessment, and knowledge contribution system',
        category: 'education',
        requirements: {
          minTier: 'Citizen',
          minTrustScore: 40,
          requireReplay: false,
          requireFeedback: false,
          requireVote: false
        },
        unlockHints: [
          'Maintain basic civic engagement',
          'Complete identity verification'
        ],
        route: '/civic-shell?deck=16'
      },
      {
        missionId: 'admin-command-center',
        title: 'Civic Command Center',
        description: 'Administrative interface for platform management and governance oversight',
        category: 'governance',
        requirements: {
          minTier: 'Administrator',
          minTrustScore: 95,
          requireReplay: true,
          replayMissionId: 'gov-feedback-deck10',
          requireFeedback: true,
          requireVote: true
        },
        unlockHints: [
          'Complete all governance missions',
          'Achieve Administrator tier',
          'Maintain maximum trust score',
          'Demonstrate platform leadership'
        ],
        route: '/command'
      }
    ];
    
    missions.forEach(mission => {
      this.missionDefinitions.set(mission.missionId, mission);
    });
    
    console.log(`📋 Mission definitions loaded — ${missions.length} missions available`);
  }
  
  // Initialize mock ledger entries
  private initializeMockLedgerEntries(): void {
    const mockEntries: Partial<MissionLedgerEntry>[] = [
      {
        missionId: 'wallet-overview-deck1',
        status: 'unlocked',
        sourceTraceHash: 'trace:wallet:abc123',
        tierRequired: 'Citizen',
        unlockedVia: 'identity_tier',
        metadata: {
          userId: 'did:civic:commander-mark',
          userTier: 'Administrator',
          trustScore: 98,
          replayValidated: true,
          unlockAttempts: 1,
          lastAttemptAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      },
      {
        missionId: 'identity-verification-deck12',
        status: 'unlocked',
        sourceTraceHash: 'trace:identity:def456',
        tierRequired: 'Verifier',
        unlockedVia: 'memory_replay',
        metadata: {
          userId: 'did:civic:commander-mark',
          userTier: 'Administrator',
          trustScore: 98,
          replayValidated: true,
          unlockAttempts: 1,
          lastAttemptAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
        }
      },
      {
        missionId: 'consensus-governance-deck9',
        status: 'unlocked',
        sourceTraceHash: 'trace:consensus:ghi789',
        tierRequired: 'Moderator',
        unlockedVia: 'verified_vote',
        metadata: {
          userId: 'did:civic:commander-mark',
          userTier: 'Administrator',
          trustScore: 98,
          replayValidated: true,
          feedbackBadge: 'verified_contributor',
          voteVerified: true,
          unlockAttempts: 1,
          lastAttemptAt: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
        }
      },
      {
        missionId: 'gov-feedback-deck10',
        status: 'tier_insufficient',
        sourceTraceHash: 'trace:feedback:jkl012',
        tierRequired: 'Governor',
        unlockedVia: 'none',
        metadata: {
          userId: 'did:civic:verifier-alice',
          userTier: 'Verifier',
          trustScore: 75,
          replayValidated: true,
          unlockAttempts: 3,
          lastAttemptAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }
      },
      {
        missionId: 'civic-education-deck16',
        status: 'unlocked',
        sourceTraceHash: 'trace:education:mno345',
        tierRequired: 'Citizen',
        unlockedVia: 'trust_threshold',
        metadata: {
          userId: 'did:civic:citizen-bob',
          userTier: 'Citizen',
          trustScore: 45,
          replayValidated: false,
          unlockAttempts: 1,
          lastAttemptAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        }
      }
    ];
    
    mockEntries.forEach(entry => {
      const fullEntry = this.createLedgerEntry({
        ...entry,
        timestamp: entry.metadata?.lastAttemptAt || new Date().toISOString()
      } as Partial<MissionLedgerEntry>);
      
      this.ledger.set(fullEntry.entryId, fullEntry);
    });
    
    console.log(`📋 Mock ledger entries created — ${mockEntries.length} entries initialized`);
  }
  
  // Add mission event to ledger
  addMissionEvent(
    missionId: string,
    status: MissionStatus,
    userId: string,
    userTier: UserTier,
    trustScore: number,
    sourceTraceHash: string,
    unlockedVia: UnlockMethod = 'none',
    additionalMetadata: Partial<MissionLedgerEntry['metadata']> = {}
  ): MissionLedgerEntry {
    
    const entry = this.createLedgerEntry({
      missionId,
      status,
      sourceTraceHash,
      tierRequired: this.getMissionDefinition(missionId)?.requirements.minTier || 'Citizen',
      unlockedVia,
      metadata: {
        userId,
        userTier,
        trustScore,
        replayValidated: false,
        unlockAttempts: 1,
        lastAttemptAt: new Date().toISOString(),
        ...additionalMetadata
      }
    });
    
    this.ledger.set(entry.entryId, entry);
    
    // Maintain ledger size
    if (this.ledger.size > this.maxLedgerEntries) {
      const oldestEntry = Array.from(this.ledger.values())
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
      this.ledger.delete(oldestEntry.entryId);
    }
    
    console.log(`📋 Mission event logged — ${missionId} | Status: ${status} | User: ${userId} | Method: ${unlockedVia}`);
    
    return entry;
  }
  
  // Create ledger entry with full structure
  private createLedgerEntry(partial: Partial<MissionLedgerEntry>): MissionLedgerEntry {
    const timestamp = partial.timestamp || new Date().toISOString();
    const entryId = partial.entryId || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    return {
      entryId,
      missionId: partial.missionId || 'unknown',
      status: partial.status || 'locked',
      timestamp,
      sourceTraceHash: partial.sourceTraceHash || `trace:${entryId}`,
      tierRequired: partial.tierRequired || 'Citizen',
      unlockedVia: partial.unlockedVia || 'none',
      metadata: {
        userId: 'unknown',
        userTier: 'Citizen',
        trustScore: 0,
        replayValidated: false,
        unlockAttempts: 1,
        lastAttemptAt: timestamp,
        ...partial.metadata
      }
    };
  }
  
  // Update mission status via replay validation
  updateMissionViaReplay(
    missionId: string,
    userId: string,
    replayTraceHash: string,
    replayValid: boolean
  ): MissionLedgerEntry | null {
    
    const existingEntry = this.getMissionEntry(missionId, userId);
    
    if (existingEntry && replayValid) {
      const updatedEntry: MissionLedgerEntry = {
        ...existingEntry,
        status: existingEntry.status === 'replay_required' ? 'unlocked' : existingEntry.status,
        sourceTraceHash: replayTraceHash,
        unlockedVia: existingEntry.unlockedVia === 'none' ? 'memory_replay' : existingEntry.unlockedVia,
        timestamp: new Date().toISOString(),
        metadata: {
          ...existingEntry.metadata,
          replayValidated: true,
          lastAttemptAt: new Date().toISOString()
        }
      };
      
      this.ledger.set(existingEntry.entryId, updatedEntry);
      
      console.log(`🧠 Replay validation completed — ${missionId} | User: ${userId} | Valid: ${replayValid} | Status: ${updatedEntry.status}`);
      
      return updatedEntry;
    }
    
    return null;
  }
  
  // Update mission status via feedback/vote
  updateMissionViaFeedback(
    missionId: string,
    userId: string,
    feedbackBadge?: string,
    voteVerified?: boolean
  ): MissionLedgerEntry | null {
    
    const existingEntry = this.getMissionEntry(missionId, userId);
    
    if (existingEntry) {
      const updatedEntry: MissionLedgerEntry = {
        ...existingEntry,
        status: this.calculateStatusAfterFeedback(existingEntry, feedbackBadge, voteVerified),
        unlockedVia: this.determineUnlockMethod(existingEntry, feedbackBadge, voteVerified),
        timestamp: new Date().toISOString(),
        metadata: {
          ...existingEntry.metadata,
          feedbackBadge: feedbackBadge || existingEntry.metadata.feedbackBadge,
          voteVerified: voteVerified !== undefined ? voteVerified : existingEntry.metadata.voteVerified,
          lastAttemptAt: new Date().toISOString()
        }
      };
      
      this.ledger.set(existingEntry.entryId, updatedEntry);
      
      console.log(`🔄 Feedback update completed — ${missionId} | User: ${userId} | Badge: ${feedbackBadge} | Vote: ${voteVerified} | Status: ${updatedEntry.status}`);
      
      return updatedEntry;
    }
    
    return null;
  }
  
  // Calculate status after feedback update
  private calculateStatusAfterFeedback(
    entry: MissionLedgerEntry,
    feedbackBadge?: string,
    voteVerified?: boolean
  ): MissionStatus {
    const mission = this.getMissionDefinition(entry.missionId);
    if (!mission) return entry.status;
    
    const hasFeedback = feedbackBadge || entry.metadata.feedbackBadge;
    const hasVote = voteVerified || entry.metadata.voteVerified;
    
    // Check all requirements
    const tierSufficient = this.compareTiers(entry.metadata.userTier, mission.requirements.minTier) >= 0;
    const trustSufficient = entry.metadata.trustScore >= mission.requirements.minTrustScore;
    const replaySatisfied = !mission.requirements.requireReplay || entry.metadata.replayValidated;
    const feedbackSatisfied = !mission.requirements.requireFeedback || hasFeedback;
    const voteSatisfied = !mission.requirements.requireVote || hasVote;
    
    if (tierSufficient && trustSufficient && replaySatisfied && feedbackSatisfied && voteSatisfied) {
      return 'unlocked';
    }
    
    // Return most specific blocking reason
    if (!tierSufficient) return 'tier_insufficient';
    if (!trustSufficient) return 'trust_insufficient';
    if (!replaySatisfied) return 'replay_required';
    if (!feedbackSatisfied || !voteSatisfied) return 'feedback_required';
    
    return 'locked';
  }
  
  // Determine unlock method
  private determineUnlockMethod(
    entry: MissionLedgerEntry,
    feedbackBadge?: string,
    voteVerified?: boolean
  ): UnlockMethod {
    if (voteVerified) return 'verified_vote';
    if (feedbackBadge) return 'feedback_badge';
    if (entry.metadata.replayValidated) return 'memory_replay';
    if (entry.metadata.userTier !== 'Citizen') return 'identity_tier';
    if (entry.metadata.trustScore >= 50) return 'trust_threshold';
    
    return entry.unlockedVia;
  }
  
  // Compare user tiers
  private compareTiers(userTier: UserTier, requiredTier: UserTier): number {
    const tierOrder: UserTier[] = ['Citizen', 'Verifier', 'Moderator', 'Governor', 'Administrator'];
    return tierOrder.indexOf(userTier) - tierOrder.indexOf(requiredTier);
  }
  
  // Get mission entry for user
  getMissionEntry(missionId: string, userId: string): MissionLedgerEntry | null {
    return Array.from(this.ledger.values())
      .filter(entry => entry.missionId === missionId && entry.metadata.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
  }
  
  // Get mission definition
  getMissionDefinition(missionId: string): MissionDefinition | null {
    return this.missionDefinitions.get(missionId) || null;
  }
  
  // Get all mission definitions
  getAllMissionDefinitions(): MissionDefinition[] {
    return Array.from(this.missionDefinitions.values());
  }
  
  // Get ledger entries for user
  getUserMissionEntries(userId: string, limit?: number): MissionLedgerEntry[] {
    const userEntries = Array.from(this.ledger.values())
      .filter(entry => entry.metadata.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? userEntries.slice(0, limit) : userEntries;
  }
  
  // Get ledger entries by status
  getEntriesByStatus(status: MissionStatus, limit?: number): MissionLedgerEntry[] {
    const statusEntries = Array.from(this.ledger.values())
      .filter(entry => entry.status === status)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? statusEntries.slice(0, limit) : statusEntries;
  }
  
  // Get ledger statistics
  getLedgerStatistics(): {
    totalEntries: number;
    statusCounts: Record<MissionStatus, number>;
    tierCounts: Record<UserTier, number>;
    unlockMethodCounts: Record<UnlockMethod, number>;
    averageTrustScore: number;
    recentActivity: number;
  } {
    const entries = Array.from(this.ledger.values());
    
    const statusCounts: Record<MissionStatus, number> = {
      locked: 0,
      unlocked: 0,
      replay_required: 0,
      tier_insufficient: 0,
      trust_insufficient: 0,
      feedback_required: 0,
      completed: 0
    };
    
    const tierCounts: Record<UserTier, number> = {
      Citizen: 0,
      Verifier: 0,
      Moderator: 0,
      Governor: 0,
      Administrator: 0
    };
    
    const unlockMethodCounts: Record<UnlockMethod, number> = {
      memory_replay: 0,
      identity_tier: 0,
      trust_threshold: 0,
      feedback_badge: 0,
      verified_vote: 0,
      admin_override: 0,
      none: 0
    };
    
    let totalTrustScore = 0;
    const oneDayAgo = Date.now() - 86400000;
    let recentActivity = 0;
    
    entries.forEach(entry => {
      statusCounts[entry.status]++;
      tierCounts[entry.metadata.userTier]++;
      unlockMethodCounts[entry.unlockedVia]++;
      totalTrustScore += entry.metadata.trustScore;
      
      if (new Date(entry.timestamp).getTime() > oneDayAgo) {
        recentActivity++;
      }
    });
    
    return {
      totalEntries: entries.length,
      statusCounts,
      tierCounts,
      unlockMethodCounts,
      averageTrustScore: entries.length > 0 ? totalTrustScore / entries.length : 0,
      recentActivity
    };
  }
  
  // Clear ledger (admin function)
  clearLedger(): void {
    this.ledger.clear();
    console.log('🧹 Mission ledger cleared');
  }
  
  // Export ledger data
  exportLedgerData(): {
    exportedAt: string;
    totalEntries: number;
    entries: MissionLedgerEntry[];
    definitions: MissionDefinition[];
    statistics: ReturnType<CivicMissionLedger['getLedgerStatistics']>;
  } {
    return {
      exportedAt: new Date().toISOString(),
      totalEntries: this.ledger.size,
      entries: Array.from(this.ledger.values()),
      definitions: this.getAllMissionDefinitions(),
      statistics: this.getLedgerStatistics()
    };
  }
}

export default CivicMissionLedger;