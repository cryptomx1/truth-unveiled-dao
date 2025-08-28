/**
 * EvidenceCaptureEngine.ts - Phase XXVI
 * Cryptographic Proof-of-Engagement Evidence Capture System
 * Authority: Commander Mark via JASMY Relay
 */

// Types for evidence capture system
export interface ProofCapsule {
  eventId: string;
  timestamp: string;
  userHash: string;
  deckId: string;
  missionId: string;
  traceHash: string;
  evidenceDigest: string;
  metadata: {
    eventType: EvidenceEventType;
    userTier: string;
    trustScore: number;
    missionTitle: string;
    deckCategory: string;
    completionStatus: 'completed' | 'verified' | 'partial' | 'disputed';
    witnessCount: number;
    validationLevel: 'basic' | 'enhanced' | 'civic_grade' | 'dao_verified';
    integrityHash: string;
    sourceIpfsHash?: string;
    crossValidation?: string[];
  };
}

export type EvidenceEventType =
  | 'mission_completion'
  | 'deck_unlock'
  | 'civic_interaction'
  | 'vote_cast'
  | 'feedback_submitted'
  | 'identity_verified'
  | 'tier_advancement'
  | 'dispute_resolution'
  | 'dao_participation'
  | 'cross_validation';

export interface EvidenceGenerationContext {
  userId: string;
  userTier: string;
  trustScore: number;
  missionId: string;
  missionTitle: string;
  deckId: string;
  deckCategory: string;
  eventType: EvidenceEventType;
  sourceTraceHash: string;
  additionalContext?: {
    witnessUsers?: string[];
    linkedMissions?: string[];
    validationRequests?: string[];
    crossReferences?: string[];
  };
}

export interface CaptureResult {
  success: boolean;
  capsule?: ProofCapsule;
  evidenceId: string;
  integrityDigest: string;
  captureTime: number;
  error?: string;
}

// Main Evidence Capture Engine class
export class EvidenceCaptureEngine {
  private static instance: EvidenceCaptureEngine;
  private captureHistory: Map<string, ProofCapsule> = new Map();
  private readonly maxHistoryEntries = 10000;
  
  private constructor() {
    console.log('🧾 EvidenceCaptureEngine initialized for cryptographic proof-of-engagement trails');
    this.initializeMockCapsules();
  }
  
  static getInstance(): EvidenceCaptureEngine {
    if (!EvidenceCaptureEngine.instance) {
      EvidenceCaptureEngine.instance = new EvidenceCaptureEngine();
    }
    return EvidenceCaptureEngine.instance;
  }
  
  // Generate cryptographic proof capsule
  generateProofCapsule(context: EvidenceGenerationContext): CaptureResult {
    const startTime = performance.now();
    
    try {
      const eventId = this.generateEventId();
      const timestamp = new Date().toISOString();
      const userHash = this.generateUserHash(context.userId, context.userTier);
      const evidenceDigest = this.generateEvidenceDigest(context, eventId, timestamp);
      const integrityHash = this.generateIntegrityHash(evidenceDigest, userHash, timestamp);
      
      const capsule: ProofCapsule = {
        eventId,
        timestamp,
        userHash,
        deckId: context.deckId,
        missionId: context.missionId,
        traceHash: context.sourceTraceHash,
        evidenceDigest,
        metadata: {
          eventType: context.eventType,
          userTier: context.userTier,
          trustScore: context.trustScore,
          missionTitle: context.missionTitle,
          deckCategory: context.deckCategory,
          completionStatus: this.determineCompletionStatus(context),
          witnessCount: context.additionalContext?.witnessUsers?.length || 0,
          validationLevel: this.determineValidationLevel(context),
          integrityHash,
          sourceIpfsHash: this.generateMockIpfsHash(eventId),
          crossValidation: context.additionalContext?.crossReferences || []
        }
      };
      
      // Store capsule in history
      this.captureHistory.set(eventId, capsule);
      
      // Maintain history size
      if (this.captureHistory.size > this.maxHistoryEntries) {
        const oldestKey = Array.from(this.captureHistory.keys())[0];
        this.captureHistory.delete(oldestKey);
      }
      
      const endTime = performance.now();
      const captureTime = Math.round(endTime - startTime);
      
      console.log(`🧾 Evidence capsule created — mission: ${context.missionId} | CID: ${capsule.metadata.sourceIpfsHash} | hash: ${evidenceDigest.substring(0, 16)}...`);
      
      return {
        success: true,
        capsule,
        evidenceId: eventId,
        integrityDigest: integrityHash,
        captureTime,
      };
      
    } catch (error) {
      const endTime = performance.now();
      const captureTime = Math.round(endTime - startTime);
      
      console.error(`❌ Evidence capture failed — mission: ${context.missionId} | Error: ${error}`);
      
      return {
        success: false,
        evidenceId: 'failed-' + Date.now(),
        integrityDigest: '',
        captureTime,
        error: String(error)
      };
    }
  }
  
  // Batch capture for multiple events
  batchCaptureEvidence(contexts: EvidenceGenerationContext[]): CaptureResult[] {
    const startTime = performance.now();
    const results: CaptureResult[] = [];
    
    console.log(`🧾 Batch evidence capture initiated — ${contexts.length} events`);
    
    contexts.forEach(context => {
      const result = this.generateProofCapsule(context);
      results.push(result);
    });
    
    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`🧾 Batch capture completed — ${successCount}/${contexts.length} successful | Duration: ${totalTime}ms`);
    
    return results;
  }
  
  // Capture mission completion evidence
  captureMissionCompletion(
    userId: string,
    userTier: string,
    trustScore: number,
    missionId: string,
    missionTitle: string,
    deckId: string,
    deckCategory: string,
    sourceTraceHash: string
  ): CaptureResult {
    
    const context: EvidenceGenerationContext = {
      userId,
      userTier,
      trustScore,
      missionId,
      missionTitle,
      deckId,
      deckCategory,
      eventType: 'mission_completion',
      sourceTraceHash,
      additionalContext: {
        witnessUsers: this.generateMockWitnesses(userTier),
        linkedMissions: this.getLinkedMissions(missionId),
        validationRequests: [],
        crossReferences: [sourceTraceHash]
      }
    };
    
    return this.generateProofCapsule(context);
  }
  
  // Capture civic interaction evidence
  captureCivicInteraction(
    userId: string,
    userTier: string,
    trustScore: number,
    interactionType: EvidenceEventType,
    deckId: string,
    sourceTraceHash: string,
    additionalData: Record<string, any> = {}
  ): CaptureResult {
    
    const context: EvidenceGenerationContext = {
      userId,
      userTier,
      trustScore,
      missionId: `interaction-${Date.now()}`,
      missionTitle: this.formatInteractionTitle(interactionType),
      deckId,
      deckCategory: this.inferDeckCategory(deckId),
      eventType: interactionType,
      sourceTraceHash,
      additionalContext: {
        witnessUsers: additionalData.witnesses || [],
        crossReferences: [sourceTraceHash],
        ...additionalData
      }
    };
    
    return this.generateProofCapsule(context);
  }
  
  // Verify proof capsule integrity
  verifyProofCapsule(capsule: ProofCapsule): {
    isValid: boolean;
    integrityCheck: boolean;
    digestMatch: boolean;
    timestampValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check integrity hash
    const expectedIntegrityHash = this.generateIntegrityHash(
      capsule.evidenceDigest,
      capsule.userHash,
      capsule.timestamp
    );
    const integrityCheck = expectedIntegrityHash === capsule.metadata.integrityHash;
    
    if (!integrityCheck) {
      errors.push('Integrity hash mismatch');
    }
    
    // Check evidence digest format
    const digestMatch = this.validateEvidenceDigest(capsule.evidenceDigest);
    
    if (!digestMatch) {
      errors.push('Evidence digest format invalid');
    }
    
    // Check timestamp validity
    const capsuleTime = new Date(capsule.timestamp).getTime();
    const now = Date.now();
    const timestampValid = capsuleTime <= now && capsuleTime > (now - 31536000000); // Within 1 year
    
    if (!timestampValid) {
      errors.push('Timestamp outside valid range');
    }
    
    const isValid = integrityCheck && digestMatch && timestampValid;
    
    console.log(`🔍 Proof capsule verification — ${capsule.eventId} | Valid: ${isValid} | Errors: ${errors.length}`);
    
    return {
      isValid,
      integrityCheck,
      digestMatch,
      timestampValid,
      errors
    };
  }
  
  // Initialize mock capsules for testing
  private initializeMockCapsules(): void {
    const mockContexts: EvidenceGenerationContext[] = [
      {
        userId: 'did:civic:commander-mark',
        userTier: 'Administrator',
        trustScore: 98,
        missionId: 'wallet-overview-deck1',
        missionTitle: 'Wallet Identity Overview',
        deckId: 'deck-1',
        deckCategory: 'wallet',
        eventType: 'mission_completion',
        sourceTraceHash: 'trace:wallet:abc123',
        additionalContext: {
          witnessUsers: ['did:civic:verifier-alice', 'did:civic:moderator-bob'],
          linkedMissions: [],
          crossReferences: ['trace:wallet:abc123']
        }
      },
      {
        userId: 'did:civic:commander-mark',
        userTier: 'Administrator',
        trustScore: 98,
        missionId: 'identity-verification-deck12',
        missionTitle: 'Civic Identity Management',
        deckId: 'deck-12',
        deckCategory: 'identity',
        eventType: 'mission_completion',
        sourceTraceHash: 'trace:identity:def456',
        additionalContext: {
          witnessUsers: ['did:civic:governor-charlie'],
          linkedMissions: ['wallet-overview-deck1'],
          crossReferences: ['trace:identity:def456', 'trace:wallet:abc123']
        }
      },
      {
        userId: 'did:civic:verifier-alice',
        userTier: 'Verifier',
        trustScore: 75,
        missionId: 'consensus-governance-deck9',
        missionTitle: 'Vote Consensus Monitoring',
        deckId: 'deck-9',
        deckCategory: 'consensus',
        eventType: 'vote_cast',
        sourceTraceHash: 'trace:vote:ghi789',
        additionalContext: {
          witnessUsers: ['did:civic:commander-mark'],
          linkedMissions: ['identity-verification-deck12'],
          crossReferences: ['trace:vote:ghi789']
        }
      }
    ];
    
    mockContexts.forEach(context => {
      // Create capsule with older timestamp for testing
      const result = this.generateProofCapsule(context);
      if (result.success && result.capsule) {
        // Adjust timestamp to simulate historical data
        result.capsule.timestamp = new Date(Date.now() - Math.random() * 604800000).toISOString(); // Within last week
        this.captureHistory.set(result.capsule.eventId, result.capsule);
      }
    });
    
    console.log(`🧾 Mock evidence capsules initialized — ${mockContexts.length} capsules created`);
  }
  
  // Generate unique event ID
  private generateEventId(): string {
    return `evidence-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
  
  // Generate user hash
  private generateUserHash(userId: string, userTier: string): string {
    const hashInput = `${userId}:${userTier}:${Date.now()}`;
    return `user-${this.simpleHash(hashInput)}`;
  }
  
  // Generate evidence digest
  private generateEvidenceDigest(
    context: EvidenceGenerationContext,
    eventId: string,
    timestamp: string
  ): string {
    const digestInput = `${eventId}:${context.userId}:${context.missionId}:${context.eventType}:${timestamp}`;
    return `evidence-${this.simpleHash(digestInput)}`;
  }
  
  // Generate integrity hash
  private generateIntegrityHash(evidenceDigest: string, userHash: string, timestamp: string): string {
    const integrityInput = `${evidenceDigest}:${userHash}:${timestamp}`;
    return `integrity-${this.simpleHash(integrityInput)}`;
  }
  
  // Simple hash function for mock purposes
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  // Generate mock IPFS hash
  private generateMockIpfsHash(eventId: string): string {
    const hash = this.simpleHash(eventId);
    return `Qm${hash}${Math.random().toString(36).substring(2, 10)}`;
  }
  
  // Determine completion status
  private determineCompletionStatus(context: EvidenceGenerationContext): 'completed' | 'verified' | 'partial' | 'disputed' {
    if (context.userTier === 'Administrator') return 'verified';
    if (context.trustScore >= 80) return 'completed';
    if (context.trustScore >= 50) return 'partial';
    return 'disputed';
  }
  
  // Determine validation level
  private determineValidationLevel(context: EvidenceGenerationContext): 'basic' | 'enhanced' | 'civic_grade' | 'dao_verified' {
    if (context.userTier === 'Administrator') return 'dao_verified';
    if (context.userTier === 'Governor') return 'civic_grade';
    if (context.userTier === 'Moderator') return 'enhanced';
    return 'basic';
  }
  
  // Generate mock witnesses
  private generateMockWitnesses(userTier: string): string[] {
    const witnesses: string[] = [];
    const witnessCount = userTier === 'Administrator' ? 3 : userTier === 'Governor' ? 2 : 1;
    
    for (let i = 0; i < witnessCount; i++) {
      witnesses.push(`did:civic:witness-${Math.random().toString(36).substring(2, 6)}`);
    }
    
    return witnesses;
  }
  
  // Get linked missions
  private getLinkedMissions(missionId: string): string[] {
    const linkMap: Record<string, string[]> = {
      'identity-verification-deck12': ['wallet-overview-deck1'],
      'consensus-governance-deck9': ['identity-verification-deck12', 'wallet-overview-deck1'],
      'gov-feedback-deck10': ['consensus-governance-deck9', 'identity-verification-deck12']
    };
    
    return linkMap[missionId] || [];
  }
  
  // Format interaction title
  private formatInteractionTitle(interactionType: EvidenceEventType): string {
    const titleMap: Record<EvidenceEventType, string> = {
      mission_completion: 'Mission Completion',
      deck_unlock: 'Deck Access Unlock',
      civic_interaction: 'Civic Platform Interaction',
      vote_cast: 'Governance Vote Cast',
      feedback_submitted: 'Civic Feedback Submission',
      identity_verified: 'Identity Verification',
      tier_advancement: 'Civic Tier Advancement',
      dispute_resolution: 'Dispute Resolution Participation',
      dao_participation: 'DAO Governance Participation',
      cross_validation: 'Cross-User Validation'
    };
    
    return titleMap[interactionType] || 'Civic Event';
  }
  
  // Infer deck category
  private inferDeckCategory(deckId: string): string {
    if (deckId.includes('wallet')) return 'wallet';
    if (deckId.includes('identity')) return 'identity';
    if (deckId.includes('governance')) return 'governance';
    if (deckId.includes('consensus')) return 'consensus';
    if (deckId.includes('feedback')) return 'feedback';
    if (deckId.includes('education')) return 'education';
    return 'general';
  }
  
  // Validate evidence digest format
  private validateEvidenceDigest(digest: string): boolean {
    return digest.startsWith('evidence-') && digest.length >= 17;
  }
  
  // Get proof capsule by ID
  getProofCapsule(eventId: string): ProofCapsule | null {
    return this.captureHistory.get(eventId) || null;
  }
  
  // Get all proof capsules for user
  getUserProofCapsules(userHash: string, limit?: number): ProofCapsule[] {
    const userCapsules = Array.from(this.captureHistory.values())
      .filter(capsule => capsule.userHash === userHash)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? userCapsules.slice(0, limit) : userCapsules;
  }
  
  // Get proof capsules by event type
  getCapsulesByEventType(eventType: EvidenceEventType, limit?: number): ProofCapsule[] {
    const filtered = Array.from(this.captureHistory.values())
      .filter(capsule => capsule.metadata.eventType === eventType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get proof capsules by mission
  getCapsulesByMission(missionId: string, limit?: number): ProofCapsule[] {
    const filtered = Array.from(this.captureHistory.values())
      .filter(capsule => capsule.missionId === missionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? filtered.slice(0, limit) : filtered;
  }
  
  // Get capture statistics
  getCaptureStatistics(): {
    totalCapsules: number;
    eventTypeCounts: Record<EvidenceEventType, number>;
    validationLevelCounts: Record<string, number>;
    completionStatusCounts: Record<string, number>;
    averageWitnesses: number;
    recentActivity: number;
  } {
    
    const capsules = Array.from(this.captureHistory.values());
    
    const eventTypeCounts: Record<EvidenceEventType, number> = {
      mission_completion: 0,
      deck_unlock: 0,
      civic_interaction: 0,
      vote_cast: 0,
      feedback_submitted: 0,
      identity_verified: 0,
      tier_advancement: 0,
      dispute_resolution: 0,
      dao_participation: 0,
      cross_validation: 0
    };
    
    const validationLevelCounts: Record<string, number> = {};
    const completionStatusCounts: Record<string, number> = {};
    let totalWitnesses = 0;
    
    capsules.forEach(capsule => {
      eventTypeCounts[capsule.metadata.eventType]++;
      
      validationLevelCounts[capsule.metadata.validationLevel] = 
        (validationLevelCounts[capsule.metadata.validationLevel] || 0) + 1;
      
      completionStatusCounts[capsule.metadata.completionStatus] = 
        (completionStatusCounts[capsule.metadata.completionStatus] || 0) + 1;
      
      totalWitnesses += capsule.metadata.witnessCount;
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    const recentActivity = capsules.filter(capsule => 
      new Date(capsule.timestamp).getTime() > oneDayAgo
    ).length;
    
    return {
      totalCapsules: capsules.length,
      eventTypeCounts,
      validationLevelCounts,
      completionStatusCounts,
      averageWitnesses: capsules.length > 0 ? totalWitnesses / capsules.length : 0,
      recentActivity
    };
  }
  
  // Clear capture history (admin function)
  clearCaptureHistory(): void {
    this.captureHistory.clear();
    console.log('🧹 Evidence capture history cleared');
  }
  
  // Export all proof capsules
  exportAllCapsules(): {
    exportedAt: string;
    totalCapsules: number;
    capsules: ProofCapsule[];
    statistics: ReturnType<EvidenceCaptureEngine['getCaptureStatistics']>;
  } {
    return {
      exportedAt: new Date().toISOString(),
      totalCapsules: this.captureHistory.size,
      capsules: Array.from(this.captureHistory.values()),
      statistics: this.getCaptureStatistics()
    };
  }
}

export default EvidenceCaptureEngine;