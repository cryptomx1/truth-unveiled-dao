/**
 * BallotEligibilityVerifier.ts - Phase XXVII Step 1
 * Zero-Knowledge Proof Ballot Eligibility Verification System
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  ProofVaultCore,
  type VaultEntry 
} from '../evidence/ProofVaultCore';
import { 
  type ProofCapsule 
} from '../evidence/EvidenceCaptureEngine';

// Types for ballot eligibility system
export interface ZKPReputationBundle {
  bundleId: string;
  epoch: string;
  cidDigest: string;
  tier: CivicTier;
  trustScore: number;
  integrityHash: string;
  proofCapsules: ProofCapsule[];
  vaultMetadata: {
    totalMissions: number;
    totalVotes: number;
    totalFeedback: number;
    averageTrustScore: number;
    validationLevel: string;
    witnessCount: number;
    reputationScore: number;
  };
  expiresAt: string;
  signatureChain: {
    algorithm: 'zkp-civic-v2' | 'dao-multisig-v1' | 'identity-proof-v1';
    signatureHash: string;
    witnesses: string[];
    verificationKey: string;
  };
}

export type CivicTier = 'Citizen' | 'Verifier' | 'Moderator' | 'Governor' | 'Administrator';

export interface BallotEligibilityResult {
  cidDigest: string;
  tier: CivicTier;
  trustScore: number;
  multiplier: number;
  valid: boolean;
  reason?: string;
  validationTimestamp: string;
  epochStatus: 'valid' | 'expired' | 'future';
  integrityStatus: 'verified' | 'tampered' | 'unknown';
  metadata?: {
    bundleId?: string;
    totalMissions?: number;
    totalVotes?: number;
    reputationScore?: number;
    validationLevel?: string;
    witnessCount?: number;
  };
}

export interface EligibilityValidationContext {
  ballotId: string;
  minimumTier: CivicTier;
  minimumTrustScore: number;
  epochToleranceDays: number;
  requireIntegrityVerification: boolean;
  allowVaultDerivation: boolean;
}

// Tier hierarchy for validation
const TIER_HIERARCHY: Record<CivicTier, number> = {
  'Citizen': 1,
  'Verifier': 2,
  'Moderator': 3,
  'Governor': 4,
  'Administrator': 5
};

// Vote multipliers by tier
const VOTE_MULTIPLIERS: Record<CivicTier, number> = {
  'Citizen': 1.0,
  'Verifier': 1.2,
  'Moderator': 1.5,
  'Governor': 2.0,
  'Administrator': 3.0
};

// Main Ballot Eligibility Verifier class
export class BallotEligibilityVerifier {
  private static instance: BallotEligibilityVerifier;
  private vaultCore: ProofVaultCore;
  private verificationHistory: Map<string, BallotEligibilityResult> = new Map();
  
  private constructor() {
    this.vaultCore = ProofVaultCore.getInstance();
    console.log('🗳️ BallotEligibilityVerifier initialized for ZKP-protected voting infrastructure');
  }
  
  static getInstance(): BallotEligibilityVerifier {
    if (!BallotEligibilityVerifier.instance) {
      BallotEligibilityVerifier.instance = new BallotEligibilityVerifier();
    }
    return BallotEligibilityVerifier.instance;
  }
  
  // Verify eligibility from ZKP reputation bundle
  verifyEligibilityFromBundle(
    bundle: ZKPReputationBundle,
    context: EligibilityValidationContext
  ): BallotEligibilityResult {
    
    const validationTimestamp = new Date().toISOString();
    
    try {
      // Step 1: Validate bundle structure
      const structureValidation = this.validateBundleStructure(bundle);
      if (!structureValidation.valid) {
        const result: BallotEligibilityResult = {
          cidDigest: bundle.cidDigest || 'unknown',
          tier: 'Citizen',
          trustScore: 0,
          multiplier: 0,
          valid: false,
          reason: structureValidation.reason,
          validationTimestamp,
          epochStatus: 'expired',
          integrityStatus: 'unknown'
        };
        
        this.logEligibilityResult(result, context.ballotId);
        return result;
      }
      
      // Step 2: Validate epoch freshness
      const epochStatus = this.validateEpoch(bundle.epoch, context.epochToleranceDays);
      
      // Step 3: Verify integrity hash
      const integrityStatus = context.requireIntegrityVerification 
        ? this.verifyIntegrityHash(bundle)
        : 'verified';
      
      // Step 4: Check tier requirements
      const tierValid = this.validateTierRequirement(bundle.tier, context.minimumTier);
      
      // Step 5: Check trust score requirements
      const trustValid = bundle.trustScore >= context.minimumTrustScore;
      
      // Step 6: Determine overall validity
      const overallValid = epochStatus === 'valid' && 
                          integrityStatus === 'verified' && 
                          tierValid && 
                          trustValid;
      
      // Generate failure reason if not valid
      let reason: string | undefined;
      if (!overallValid) {
        const reasons: string[] = [];
        if (epochStatus !== 'valid') reasons.push(`epoch ${epochStatus}`);
        if (integrityStatus !== 'verified') reasons.push(`integrity ${integrityStatus}`);
        if (!tierValid) reasons.push(`tier insufficient (${bundle.tier} < ${context.minimumTier})`);
        if (!trustValid) reasons.push(`trust insufficient (${bundle.trustScore} < ${context.minimumTrustScore})`);
        reason = reasons.join(', ');
      }
      
      const result: BallotEligibilityResult = {
        cidDigest: bundle.cidDigest,
        tier: bundle.tier,
        trustScore: bundle.trustScore,
        multiplier: overallValid ? VOTE_MULTIPLIERS[bundle.tier] : 0,
        valid: overallValid,
        reason,
        validationTimestamp,
        epochStatus,
        integrityStatus,
        metadata: {
          bundleId: bundle.bundleId,
          totalMissions: bundle.vaultMetadata.totalMissions,
          totalVotes: bundle.vaultMetadata.totalVotes,
          reputationScore: bundle.vaultMetadata.reputationScore,
          validationLevel: bundle.vaultMetadata.validationLevel,
          witnessCount: bundle.vaultMetadata.witnessCount
        }
      };
      
      this.verificationHistory.set(bundle.cidDigest, result);
      this.logEligibilityResult(result, context.ballotId);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Bundle verification failed for ${context.ballotId}:`, error);
      
      const result: BallotEligibilityResult = {
        cidDigest: bundle.cidDigest || 'error',
        tier: 'Citizen',
        trustScore: 0,
        multiplier: 0,
        valid: false,
        reason: `Verification error: ${String(error)}`,
        validationTimestamp,
        epochStatus: 'expired',
        integrityStatus: 'unknown'
      };
      
      this.logEligibilityResult(result, context.ballotId);
      return result;
    }
  }
  
  // Verify eligibility from vault-derived identity
  verifyEligibilityFromVault(
    userHash: string,
    context: EligibilityValidationContext
  ): BallotEligibilityResult {
    
    const validationTimestamp = new Date().toISOString();
    
    try {
      if (!context.allowVaultDerivation) {
        const result: BallotEligibilityResult = {
          cidDigest: userHash,
          tier: 'Citizen',
          trustScore: 0,
          multiplier: 0,
          valid: false,
          reason: 'Vault derivation not allowed for this ballot',
          validationTimestamp,
          epochStatus: 'valid',
          integrityStatus: 'verified'
        };
        
        this.logEligibilityResult(result, context.ballotId);
        return result;
      }
      
      // Get user entries from vault
      const userEntries = this.vaultCore.searchVaultEntries({ 
        userHash, 
        limit: 1000 
      });
      
      if (userEntries.length === 0) {
        const result: BallotEligibilityResult = {
          cidDigest: userHash,
          tier: 'Citizen',
          trustScore: 0,
          multiplier: 0,
          valid: false,
          reason: 'No evidence found in vault',
          validationTimestamp,
          epochStatus: 'valid',
          integrityStatus: 'verified'
        };
        
        this.logEligibilityResult(result, context.ballotId);
        return result;
      }
      
      // Derive civic profile from vault entries
      const civicProfile = this.deriveCivicProfileFromVault(userEntries);
      
      // Check tier requirements
      const tierValid = this.validateTierRequirement(civicProfile.tier, context.minimumTier);
      
      // Check trust score requirements
      const trustValid = civicProfile.trustScore >= context.minimumTrustScore;
      
      // Vault-derived entries are always considered fresh and verified
      const overallValid = tierValid && trustValid;
      
      // Generate failure reason if not valid
      let reason: string | undefined;
      if (!overallValid) {
        const reasons: string[] = [];
        if (!tierValid) reasons.push(`tier insufficient (${civicProfile.tier} < ${context.minimumTier})`);
        if (!trustValid) reasons.push(`trust insufficient (${civicProfile.trustScore} < ${context.minimumTrustScore})`);
        reason = reasons.join(', ');
      }
      
      const result: BallotEligibilityResult = {
        cidDigest: userHash,
        tier: civicProfile.tier,
        trustScore: civicProfile.trustScore,
        multiplier: overallValid ? VOTE_MULTIPLIERS[civicProfile.tier] : 0,
        valid: overallValid,
        reason,
        validationTimestamp,
        epochStatus: 'valid',
        integrityStatus: 'verified',
        metadata: {
          totalMissions: civicProfile.totalMissions,
          totalVotes: civicProfile.totalVotes,
          reputationScore: civicProfile.reputationScore,
          validationLevel: civicProfile.validationLevel,
          witnessCount: civicProfile.witnessCount
        }
      };
      
      this.verificationHistory.set(userHash, result);
      this.logEligibilityResult(result, context.ballotId);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Vault verification failed for ${context.ballotId}:`, error);
      
      const result: BallotEligibilityResult = {
        cidDigest: userHash,
        tier: 'Citizen',
        trustScore: 0,
        multiplier: 0,
        valid: false,
        reason: `Vault verification error: ${String(error)}`,
        validationTimestamp,
        epochStatus: 'valid',
        integrityStatus: 'unknown'
      };
      
      this.logEligibilityResult(result, context.ballotId);
      return result;
    }
  }
  
  // Verify eligibility from uploaded file data
  verifyEligibilityFromUpload(
    uploadData: string,
    context: EligibilityValidationContext
  ): BallotEligibilityResult {
    
    try {
      // Parse uploaded .zkp-rep.json bundle
      const bundle: ZKPReputationBundle = JSON.parse(uploadData);
      
      // Verify using standard bundle verification
      return this.verifyEligibilityFromBundle(bundle, context);
      
    } catch (error) {
      console.error(`❌ Upload verification failed for ${context.ballotId}:`, error);
      
      const result: BallotEligibilityResult = {
        cidDigest: 'upload-error',
        tier: 'Citizen',
        trustScore: 0,
        multiplier: 0,
        valid: false,
        reason: `Upload parsing error: ${String(error)}`,
        validationTimestamp: new Date().toISOString(),
        epochStatus: 'expired',
        integrityStatus: 'unknown'
      };
      
      this.logEligibilityResult(result, context.ballotId);
      return result;
    }
  }
  
  // Validate bundle structure
  private validateBundleStructure(bundle: ZKPReputationBundle): {
    valid: boolean;
    reason?: string;
  } {
    
    const required = [
      'bundleId', 'epoch', 'cidDigest', 'tier', 'trustScore', 
      'integrityHash', 'proofCapsules', 'vaultMetadata', 
      'expiresAt', 'signatureChain'
    ];
    
    for (const field of required) {
      if (!(field in bundle)) {
        return {
          valid: false,
          reason: `Missing required field: ${field}`
        };
      }
    }
    
    // Validate tier value
    if (!Object.keys(TIER_HIERARCHY).includes(bundle.tier)) {
      return {
        valid: false,
        reason: `Invalid tier: ${bundle.tier}`
      };
    }
    
    // Validate trust score range
    if (bundle.trustScore < 0 || bundle.trustScore > 100) {
      return {
        valid: false,
        reason: `Trust score out of range: ${bundle.trustScore}`
      };
    }
    
    // Validate proof capsules array
    if (!Array.isArray(bundle.proofCapsules)) {
      return {
        valid: false,
        reason: 'Proof capsules must be an array'
      };
    }
    
    return { valid: true };
  }
  
  // Validate epoch freshness
  private validateEpoch(epoch: string, toleranceDays: number): 'valid' | 'expired' | 'future' {
    try {
      const epochTime = new Date(epoch).getTime();
      const now = Date.now();
      const toleranceMs = toleranceDays * 24 * 60 * 60 * 1000;
      
      if (epochTime > now + toleranceMs) {
        return 'future';
      }
      
      if (epochTime < now - toleranceMs) {
        return 'expired';
      }
      
      return 'valid';
      
    } catch (error) {
      return 'expired';
    }
  }
  
  // Verify integrity hash
  private verifyIntegrityHash(bundle: ZKPReputationBundle): 'verified' | 'tampered' | 'unknown' {
    try {
      // Generate expected integrity hash
      const integrityInput = `${bundle.bundleId}:${bundle.cidDigest}:${bundle.tier}:${bundle.trustScore}:${bundle.epoch}`;
      const expectedHash = `integrity-${this.simpleHash(integrityInput)}`;
      
      return bundle.integrityHash === expectedHash ? 'verified' : 'tampered';
      
    } catch (error) {
      return 'unknown';
    }
  }
  
  // Validate tier requirement
  private validateTierRequirement(userTier: CivicTier, minimumTier: CivicTier): boolean {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[minimumTier];
  }
  
  // Derive civic profile from vault entries
  private deriveCivicProfileFromVault(entries: VaultEntry[]): {
    tier: CivicTier;
    trustScore: number;
    totalMissions: number;
    totalVotes: number;
    reputationScore: number;
    validationLevel: string;
    witnessCount: number;
  } {
    
    const capsules = entries.map(entry => entry.capsule);
    
    // Find highest tier
    const tiers = capsules.map(c => c.metadata.userTier as CivicTier);
    const highestTier = tiers.reduce((highest, current) => {
      return TIER_HIERARCHY[current] > TIER_HIERARCHY[highest] ? current : highest;
    }, 'Citizen' as CivicTier);
    
    // Calculate average trust score
    const averageTrustScore = capsules.length > 0 
      ? capsules.reduce((sum, c) => sum + c.metadata.trustScore, 0) / capsules.length
      : 0;
    
    // Count mission completions and votes
    const missionCompletions = capsules.filter(c => c.metadata.eventType === 'mission_completion').length;
    const votesCast = capsules.filter(c => c.metadata.eventType === 'vote_cast').length;
    
    // Find highest validation level
    const validationLevels = capsules.map(c => c.metadata.validationLevel);
    const hasDAOVerified = validationLevels.includes('dao_verified');
    const hasCivicGrade = validationLevels.includes('civic_grade');
    
    let validationLevel = 'basic';
    if (hasDAOVerified) validationLevel = 'dao_verified';
    else if (hasCivicGrade) validationLevel = 'civic_grade';
    else if (validationLevels.includes('enhanced')) validationLevel = 'enhanced';
    
    // Sum witness count
    const witnessCount = capsules.reduce((sum, c) => sum + c.metadata.witnessCount, 0);
    
    // Calculate reputation score
    const reputationScore = Math.round(
      (missionCompletions * 10) +
      (averageTrustScore * 0.5) +
      (votesCast * 5) +
      (witnessCount * 2)
    );
    
    return {
      tier: highestTier,
      trustScore: Math.round(averageTrustScore * 10) / 10,
      totalMissions: missionCompletions,
      totalVotes: votesCast,
      reputationScore,
      validationLevel,
      witnessCount
    };
  }
  
  // Simple hash function for mock purposes
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  // Log eligibility result
  private logEligibilityResult(result: BallotEligibilityResult, ballotId: string): void {
    const status = result.valid ? 'ELIGIBLE' : 'REJECTED';
    const cidShort = result.cidDigest.length > 12 ? result.cidDigest.substring(0, 12) + '...' : result.cidDigest;
    
    console.log(`🔐 Ballot Eligibility: ${status} — CID: ${cidShort} | Tier: ${result.tier} | Trust: ${result.trustScore} | Multiplier: ${result.multiplier}x | Ballot: ${ballotId}`);
    
    if (!result.valid && result.reason) {
      console.log(`🚫 Rejection Reason: ${result.reason}`);
    }
  }
  
  // Create mock ZKP reputation bundle
  createMockZKPBundle(
    userHash: string,
    tier: CivicTier,
    trustScore: number,
    daysAgo: number = 0
  ): ZKPReputationBundle {
    
    const epochDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
    const expiresDate = new Date(epochDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year validity
    
    const bundleId = `zkp-bundle-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const cidDigest = `cid-${this.simpleHash(userHash + tier + trustScore)}`;
    
    // Mock proof capsules based on tier
    const proofCapsules: ProofCapsule[] = [];
    const capsuleCount = TIER_HIERARCHY[tier] * 2; // More capsules for higher tiers
    
    for (let i = 0; i < capsuleCount; i++) {
      const mockCapsule: ProofCapsule = {
        eventId: `event-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        userHash,
        deckId: `deck-${Math.floor(Math.random() * 20) + 1}`,
        missionId: `mission-${Math.floor(Math.random() * 6) + 1}`,
        traceHash: `trace-${this.simpleHash(`${userHash}-${i}`)}`,
        evidenceDigest: `evidence-${this.simpleHash(`${userHash}-${tier}-${i}`)}`,
        metadata: {
          eventType: ['mission_completion', 'vote_cast', 'feedback_submitted', 'identity_verified'][Math.floor(Math.random() * 4)] as any,
          userTier: tier,
          trustScore,
          missionTitle: `Mock Mission ${i + 1}`,
          deckCategory: ['wallet', 'identity', 'governance', 'consensus'][Math.floor(Math.random() * 4)],
          completionStatus: 'completed' as any,
          witnessCount: Math.floor(Math.random() * 5) + 1,
          validationLevel: tier === 'Administrator' ? 'dao_verified' : tier === 'Governor' ? 'civic_grade' : 'enhanced',
          integrityHash: `integrity-${this.simpleHash(`${userHash}-${i}-${tier}`)}`,
          sourceIpfsHash: `Qm${this.simpleHash(`ipfs-${userHash}-${i}`)}`,
          crossValidation: [`cv-${this.simpleHash(`cross-${userHash}-${i}`)}`]
        }
      };
      proofCapsules.push(mockCapsule);
    }
    
    // Calculate vault metadata
    const vaultMetadata = {
      totalMissions: proofCapsules.filter(c => c.metadata.eventType === 'mission_completion').length,
      totalVotes: proofCapsules.filter(c => c.metadata.eventType === 'vote_cast').length,
      totalFeedback: proofCapsules.filter(c => c.metadata.eventType === 'feedback_submitted').length,
      averageTrustScore: trustScore,
      validationLevel: proofCapsules[0]?.metadata.validationLevel || 'basic',
      witnessCount: proofCapsules.reduce((sum, c) => sum + c.metadata.witnessCount, 0),
      reputationScore: Math.round(
        (proofCapsules.filter(c => c.metadata.eventType === 'mission_completion').length * 10) +
        (trustScore * 0.5) +
        (proofCapsules.filter(c => c.metadata.eventType === 'vote_cast').length * 5)
      )
    };
    
    const integrityInput = `${bundleId}:${cidDigest}:${tier}:${trustScore}:${epochDate.toISOString()}`;
    const integrityHash = `integrity-${this.simpleHash(integrityInput)}`;
    
    return {
      bundleId,
      epoch: epochDate.toISOString(),
      cidDigest,
      tier,
      trustScore,
      integrityHash,
      proofCapsules,
      vaultMetadata,
      expiresAt: expiresDate.toISOString(),
      signatureChain: {
        algorithm: tier === 'Administrator' ? 'dao-multisig-v1' : tier === 'Governor' ? 'zkp-civic-v2' : 'identity-proof-v1',
        signatureHash: `sig-${this.simpleHash(`${bundleId}-${cidDigest}-${tier}`)}`,
        witnesses: [`witness-${this.simpleHash(`${userHash}-witness`)}`],
        verificationKey: `key-${this.simpleHash(`${bundleId}-verification`)}`
      }
    };
  }
  
  // Get verification history
  getVerificationHistory(limit?: number): BallotEligibilityResult[] {
    const history = Array.from(this.verificationHistory.values())
      .sort((a, b) => new Date(b.validationTimestamp).getTime() - new Date(a.validationTimestamp).getTime());
    
    return limit ? history.slice(0, limit) : history;
  }
  
  // Get verification by CID
  getVerificationByCID(cidDigest: string): BallotEligibilityResult | null {
    return this.verificationHistory.get(cidDigest) || null;
  }
  
  // Clear verification history (admin function)
  clearVerificationHistory(): void {
    this.verificationHistory.clear();
    console.log('🧹 Ballot eligibility verification history cleared');
  }
  
  // Get verification statistics
  getVerificationStatistics(): {
    totalVerifications: number;
    eligibleCount: number;
    rejectedCount: number;
    tierBreakdown: Record<CivicTier, number>;
    reasonBreakdown: Record<string, number>;
    averageMultiplier: number;
    recentActivity: number;
  } {
    
    const verifications = Array.from(this.verificationHistory.values());
    const eligible = verifications.filter(v => v.valid);
    const rejected = verifications.filter(v => !v.valid);
    
    const tierBreakdown: Record<CivicTier, number> = {
      'Citizen': 0,
      'Verifier': 0,
      'Moderator': 0,
      'Governor': 0,
      'Administrator': 0
    };
    
    const reasonBreakdown: Record<string, number> = {};
    let totalMultiplier = 0;
    
    verifications.forEach(verification => {
      tierBreakdown[verification.tier]++;
      totalMultiplier += verification.multiplier;
      
      if (!verification.valid && verification.reason) {
        reasonBreakdown[verification.reason] = (reasonBreakdown[verification.reason] || 0) + 1;
      }
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    const recentActivity = verifications.filter(v => 
      new Date(v.validationTimestamp).getTime() > oneDayAgo
    ).length;
    
    return {
      totalVerifications: verifications.length,
      eligibleCount: eligible.length,
      rejectedCount: rejected.length,
      tierBreakdown,
      reasonBreakdown,
      averageMultiplier: verifications.length > 0 ? totalMultiplier / verifications.length : 0,
      recentActivity
    };
  }
}

// Export utility functions
export const verifyBallotEligibility = (
  bundle: ZKPReputationBundle,
  context: EligibilityValidationContext
): BallotEligibilityResult => {
  const verifier = BallotEligibilityVerifier.getInstance();
  return verifier.verifyEligibilityFromBundle(bundle, context);
};

export const verifyBallotEligibilityFromVault = (
  userHash: string,
  context: EligibilityValidationContext
): BallotEligibilityResult => {
  const verifier = BallotEligibilityVerifier.getInstance();
  return verifier.verifyEligibilityFromVault(userHash, context);
};

export const verifyBallotEligibilityFromUpload = (
  uploadData: string,
  context: EligibilityValidationContext
): BallotEligibilityResult => {
  const verifier = BallotEligibilityVerifier.getInstance();
  return verifier.verifyEligibilityFromUpload(uploadData, context);
};

export const createMockZKPBundle = (
  userHash: string,
  tier: CivicTier,
  trustScore: number,
  daysAgo?: number
): ZKPReputationBundle => {
  const verifier = BallotEligibilityVerifier.getInstance();
  return verifier.createMockZKPBundle(userHash, tier, trustScore, daysAgo);
};

export default BallotEligibilityVerifier;