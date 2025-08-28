/**
 * ZKVoteTokenIssuer.ts - Phase XXVII Step 3
 * Zero-Knowledge Vote Token Issuance System
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  type BallotEligibilityResult 
} from './BallotEligibilityVerifier';

// Vote submission input interface
export interface VoteSubmissionInput {
  ballotId: string;
  cidDigest: string;
  vote: string;
  multiplier: number;
  encryptedPayload: string;
  eligibilityResult: BallotEligibilityResult;
}

// ZK Vote Token interface
export interface ZKVoteToken {
  ballotId: string;
  cidHash: string;
  encryptedVote: string;
  voteWeight: number;
  timestamp: string;
  proofSignature: string;
  tokenId: string;
  expiresAt: string;
  metadata: {
    tier: string;
    trustScore: number;
    validationLevel: string;
    submissionTimestamp: string;
    integrityHash: string;
  };
}

// Token issuance result interface
export interface TokenIssuanceResult {
  success: boolean;
  token?: ZKVoteToken;
  error?: string;
  reason?: 'duplicate_vote' | 'invalid_payload' | 'expired_ballot' | 'processing_error' | 'integrity_failure';
  duplicateTokenId?: string;
}

// Ballot constraint tracking
interface BallotConstraint {
  ballotId: string;
  cidHash: string;
  tokenId: string;
  timestamp: string;
  voteWeight: number;
}

// In-memory ballot ledger entry
interface BallotLedgerEntry {
  token: ZKVoteToken;
  submissionTimestamp: string;
  isActive: boolean;
  expiryTimestamp: string;
}

// Main ZK Vote Token Issuer class
export class ZKVoteTokenIssuer {
  private static instance: ZKVoteTokenIssuer;
  private tokenCache: Map<string, ZKVoteToken> = new Map();
  private ballotLedger: Map<string, BallotLedgerEntry> = new Map();
  private constraintTracker: Map<string, BallotConstraint> = new Map();
  private issuanceHistory: TokenIssuanceResult[] = [];
  
  // TTL constants
  private static readonly TOKEN_TTL_MINUTES = 2;
  private static readonly PROCESSING_DELAY_MS = 2000;
  
  private constructor() {
    console.log('🗳️ ZKVoteTokenIssuer initialized for ballot finalization and proof signature generation');
    this.startCleanupTimer();
  }
  
  static getInstance(): ZKVoteTokenIssuer {
    if (!ZKVoteTokenIssuer.instance) {
      ZKVoteTokenIssuer.instance = new ZKVoteTokenIssuer();
    }
    return ZKVoteTokenIssuer.instance;
  }
  
  // Issue ZK vote token from ballot submission
  async issueVoteToken(input: VoteSubmissionInput): Promise<TokenIssuanceResult> {
    
    const submissionTimestamp = new Date().toISOString();
    
    try {
      console.log(`🔄 Processing vote token issuance for ballot: ${input.ballotId}`);
      
      // Step 1: Validate input structure
      const validationResult = this.validateSubmissionInput(input);
      if (!validationResult.valid) {
        const result: TokenIssuanceResult = {
          success: false,
          error: validationResult.error,
          reason: 'invalid_payload'
        };
        this.issuanceHistory.push(result);
        return result;
      }
      
      // Step 2: Check for duplicate votes (one-vote-per-CID-per-ballot)
      const duplicateCheck = this.checkDuplicateVote(input.ballotId, input.cidDigest);
      if (duplicateCheck.isDuplicate) {
        const result: TokenIssuanceResult = {
          success: false,
          error: `Duplicate vote detected for ballot ${input.ballotId}`,
          reason: 'duplicate_vote',
          duplicateTokenId: duplicateCheck.existingTokenId
        };
        this.issuanceHistory.push(result);
        
        console.log(`🚫 Duplicate vote rejected — Ballot: ${input.ballotId} | CID: ${this.truncateHash(input.cidDigest)} | Existing Token: ${duplicateCheck.existingTokenId}`);
        return result;
      }
      
      // Step 3: Generate CID hash for anonymization
      const cidHash = this.generateCidHash(input.cidDigest, input.ballotId);
      
      // Step 4: Simulate 2-second processing delay
      console.log(`⏳ Processing ZK vote token — Ballot: ${input.ballotId} | CID: ${this.truncateHash(input.cidDigest)}`);
      await new Promise(resolve => setTimeout(resolve, ZKVoteTokenIssuer.PROCESSING_DELAY_MS));
      
      // Step 5: Generate proof signature
      const proofSignature = this.generateProofSignature(
        input.ballotId,
        cidHash,
        input.encryptedPayload,
        input.multiplier
      );
      
      // Step 6: Create ZK vote token
      const tokenId = this.generateTokenId(input.ballotId, cidHash);
      const expiresAt = new Date(Date.now() + (ZKVoteTokenIssuer.TOKEN_TTL_MINUTES * 60 * 1000)).toISOString();
      
      const zkToken: ZKVoteToken = {
        ballotId: input.ballotId,
        cidHash,
        encryptedVote: input.encryptedPayload,
        voteWeight: input.multiplier,
        timestamp: submissionTimestamp,
        proofSignature,
        tokenId,
        expiresAt,
        metadata: {
          tier: input.eligibilityResult.tier,
          trustScore: input.eligibilityResult.trustScore,
          validationLevel: input.eligibilityResult.metadata?.validationLevel || 'basic',
          submissionTimestamp,
          integrityHash: this.generateIntegrityHash(input)
        }
      };
      
      // Step 7: Store in caches and trackers
      this.tokenCache.set(tokenId, zkToken);
      
      const ledgerEntry: BallotLedgerEntry = {
        token: zkToken,
        submissionTimestamp,
        isActive: true,
        expiryTimestamp: expiresAt
      };
      this.ballotLedger.set(tokenId, ledgerEntry);
      
      const constraint: BallotConstraint = {
        ballotId: input.ballotId,
        cidHash,
        tokenId,
        timestamp: submissionTimestamp,
        voteWeight: input.multiplier
      };
      const constraintKey = `${input.ballotId}:${cidHash}`;
      this.constraintTracker.set(constraintKey, constraint);
      
      // Step 8: Console logging as required
      console.log(`🧾 ZKVoteToken Issued — Ballot: ${input.ballotId} | CID: ${this.truncateHash(cidHash)} | Weight: ${input.multiplier}x | Hash: ${proofSignature.substring(0, 16)}...`);
      
      const result: TokenIssuanceResult = {
        success: true,
        token: zkToken
      };
      
      this.issuanceHistory.push(result);
      return result;
      
    } catch (error) {
      console.error(`❌ Token issuance failed for ballot ${input.ballotId}:`, error);
      
      const result: TokenIssuanceResult = {
        success: false,
        error: `Processing error: ${String(error)}`,
        reason: 'processing_error'
      };
      
      this.issuanceHistory.push(result);
      return result;
    }
  }
  
  // Validate submission input structure
  private validateSubmissionInput(input: VoteSubmissionInput): {
    valid: boolean;
    error?: string;
  } {
    
    const required = ['ballotId', 'cidDigest', 'vote', 'multiplier', 'encryptedPayload', 'eligibilityResult'];
    
    for (const field of required) {
      if (!(field in input) || input[field as keyof VoteSubmissionInput] === null || input[field as keyof VoteSubmissionInput] === undefined) {
        return {
          valid: false,
          error: `Missing required field: ${field}`
        };
      }
    }
    
    // Validate multiplier range
    if (input.multiplier <= 0 || input.multiplier > 5) {
      return {
        valid: false,
        error: `Invalid multiplier: ${input.multiplier} (must be 0-5)`
      };
    }
    
    // Validate encrypted payload format
    if (!input.encryptedPayload.startsWith('encrypted-ballot-')) {
      return {
        valid: false,
        error: 'Invalid encrypted payload format'
      };
    }
    
    // Validate eligibility result
    if (!input.eligibilityResult.valid) {
      return {
        valid: false,
        error: `Eligibility invalid: ${input.eligibilityResult.reason}`
      };
    }
    
    return { valid: true };
  }
  
  // Check for duplicate vote
  private checkDuplicateVote(ballotId: string, cidDigest: string): {
    isDuplicate: boolean;
    existingTokenId?: string;
  } {
    
    const cidHash = this.generateCidHash(cidDigest, ballotId);
    const constraintKey = `${ballotId}:${cidHash}`;
    
    const existingConstraint = this.constraintTracker.get(constraintKey);
    if (existingConstraint) {
      // Check if existing token is still valid (not expired)
      const ledgerEntry = this.ballotLedger.get(existingConstraint.tokenId);
      if (ledgerEntry && ledgerEntry.isActive && new Date(ledgerEntry.expiryTimestamp).getTime() > Date.now()) {
        return {
          isDuplicate: true,
          existingTokenId: existingConstraint.tokenId
        };
      }
    }
    
    return { isDuplicate: false };
  }
  
  // Generate anonymized CID hash
  private generateCidHash(cidDigest: string, ballotId: string): string {
    const input = `${cidDigest}:${ballotId}:${Date.now()}`;
    return `cid-${this.simpleHash(input)}`;
  }
  
  // Generate proof signature
  private generateProofSignature(
    ballotId: string,
    cidHash: string,
    encryptedPayload: string,
    multiplier: number
  ): string {
    
    const proofInput = `${ballotId}:${cidHash}:${encryptedPayload}:${multiplier}:${Date.now()}`;
    const hash = this.simpleHash(proofInput);
    return `zkproof-${hash}`;
  }
  
  // Generate token ID
  private generateTokenId(ballotId: string, cidHash: string): string {
    const input = `token-${ballotId}-${cidHash}-${Date.now()}-${Math.random()}`;
    return `zkvt-${this.simpleHash(input)}`;
  }
  
  // Generate integrity hash
  private generateIntegrityHash(input: VoteSubmissionInput): string {
    const integrityInput = `${input.ballotId}:${input.cidDigest}:${input.vote}:${input.multiplier}:${input.encryptedPayload}`;
    return `integrity-${this.simpleHash(integrityInput)}`;
  }
  
  // Simple hash function for mock cryptography
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(12, '0');
  }
  
  // Truncate hash for logging
  private truncateHash(hash: string, length: number = 12): string {
    return hash.length > length ? hash.substring(0, length) + '...' : hash;
  }
  
  // Get token by ID
  getTokenById(tokenId: string): ZKVoteToken | null {
    return this.tokenCache.get(tokenId) || null;
  }
  
  // Get active tokens for ballot
  getActiveTokensForBallot(ballotId: string): ZKVoteToken[] {
    const activeTokens: ZKVoteToken[] = [];
    
    for (const [tokenId, ledgerEntry] of this.ballotLedger.entries()) {
      if (ledgerEntry.token.ballotId === ballotId && 
          ledgerEntry.isActive && 
          new Date(ledgerEntry.expiryTimestamp).getTime() > Date.now()) {
        activeTokens.push(ledgerEntry.token);
      }
    }
    
    return activeTokens.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Get ballot ledger entries
  getBallotLedgerEntries(limit?: number): BallotLedgerEntry[] {
    const entries = Array.from(this.ballotLedger.values())
      .sort((a, b) => new Date(b.submissionTimestamp).getTime() - new Date(a.submissionTimestamp).getTime());
    
    return limit ? entries.slice(0, limit) : entries;
  }
  
  // Get issuance history
  getIssuanceHistory(limit?: number): TokenIssuanceResult[] {
    const history = [...this.issuanceHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }
  
  // Get constraint tracking statistics
  getConstraintStatistics(): {
    totalConstraints: number;
    activeBallots: number;
    uniqueCIDs: number;
    averageWeight: number;
    ballotBreakdown: Record<string, number>;
    recentActivity: number;
  } {
    
    const constraints = Array.from(this.constraintTracker.values());
    const activeBallots = new Set(constraints.map(c => c.ballotId)).size;
    const uniqueCIDs = new Set(constraints.map(c => c.cidHash)).size;
    
    const totalWeight = constraints.reduce((sum, c) => sum + c.voteWeight, 0);
    const averageWeight = constraints.length > 0 ? totalWeight / constraints.length : 0;
    
    const ballotBreakdown: Record<string, number> = {};
    constraints.forEach(constraint => {
      ballotBreakdown[constraint.ballotId] = (ballotBreakdown[constraint.ballotId] || 0) + 1;
    });
    
    // Recent activity (last hour)
    const oneHourAgo = Date.now() - 3600000;
    const recentActivity = constraints.filter(c => 
      new Date(c.timestamp).getTime() > oneHourAgo
    ).length;
    
    return {
      totalConstraints: constraints.length,
      activeBallots,
      uniqueCIDs,
      averageWeight: Math.round(averageWeight * 100) / 100,
      ballotBreakdown,
      recentActivity
    };
  }
  
  // Get token statistics
  getTokenStatistics(): {
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    averageWeight: number;
    successRate: number;
    duplicateRate: number;
    tierBreakdown: Record<string, number>;
    recentIssuances: number;
  } {
    
    const now = Date.now();
    const ledgerEntries = Array.from(this.ballotLedger.values());
    
    const activeTokens = ledgerEntries.filter(entry => 
      entry.isActive && new Date(entry.expiryTimestamp).getTime() > now
    ).length;
    
    const expiredTokens = ledgerEntries.filter(entry => 
      new Date(entry.expiryTimestamp).getTime() <= now
    ).length;
    
    const weights = ledgerEntries.map(entry => entry.token.voteWeight);
    const averageWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;
    
    const successfulIssuances = this.issuanceHistory.filter(h => h.success).length;
    const successRate = this.issuanceHistory.length > 0 ? successfulIssuances / this.issuanceHistory.length : 0;
    
    const duplicateAttempts = this.issuanceHistory.filter(h => h.reason === 'duplicate_vote').length;
    const duplicateRate = this.issuanceHistory.length > 0 ? duplicateAttempts / this.issuanceHistory.length : 0;
    
    const tierBreakdown: Record<string, number> = {};
    ledgerEntries.forEach(entry => {
      const tier = entry.token.metadata.tier;
      tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
    });
    
    // Recent issuances (last hour)
    const oneHourAgo = Date.now() - 3600000;
    const recentIssuances = this.issuanceHistory.filter(h => 
      h.token && new Date(h.token.timestamp).getTime() > oneHourAgo
    ).length;
    
    return {
      totalTokens: ledgerEntries.length,
      activeTokens,
      expiredTokens,
      averageWeight: Math.round(averageWeight * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      duplicateRate: Math.round(duplicateRate * 100) / 100,
      tierBreakdown,
      recentIssuances
    };
  }
  
  // Expire token manually (admin function)
  expireToken(tokenId: string): boolean {
    const ledgerEntry = this.ballotLedger.get(tokenId);
    if (ledgerEntry) {
      ledgerEntry.isActive = false;
      ledgerEntry.expiryTimestamp = new Date().toISOString();
      console.log(`⏰ Token manually expired: ${tokenId}`);
      return true;
    }
    return false;
  }
  
  // Clear expired tokens
  clearExpiredTokens(): number {
    const now = Date.now();
    let clearedCount = 0;
    
    for (const [tokenId, ledgerEntry] of this.ballotLedger.entries()) {
      if (new Date(ledgerEntry.expiryTimestamp).getTime() <= now) {
        ledgerEntry.isActive = false;
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired tokens`);
    }
    
    return clearedCount;
  }
  
  // Start cleanup timer for expired tokens
  private startCleanupTimer(): void {
    setInterval(() => {
      this.clearExpiredTokens();
    }, 60000); // Clean up every minute
  }
  
  // Clear all data (admin function)
  clearAllData(): void {
    this.tokenCache.clear();
    this.ballotLedger.clear();
    this.constraintTracker.clear();
    this.issuanceHistory.length = 0;
    console.log('🧹 All ZKVoteTokenIssuer data cleared');
  }
  
  // Create mock vote submission input for testing
  createMockVoteSubmission(
    ballotId: string,
    vote: string,
    tier: 'Citizen' | 'Verifier' | 'Moderator' | 'Governor' | 'Administrator' = 'Citizen',
    trustScore: number = 75
  ): VoteSubmissionInput {
    
    const cidDigest = `cid-mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const multiplier = tier === 'Administrator' ? 3.0 : tier === 'Governor' ? 2.0 : tier === 'Moderator' ? 1.5 : tier === 'Verifier' ? 1.2 : 1.0;
    const encryptedPayload = `encrypted-ballot-${this.simpleHash(`${ballotId}:${vote}:${cidDigest}:${multiplier}`)}`;
    
    const eligibilityResult: BallotEligibilityResult = {
      cidDigest,
      tier,
      trustScore,
      multiplier,
      valid: true,
      validationTimestamp: new Date().toISOString(),
      epochStatus: 'valid',
      integrityStatus: 'verified',
      metadata: {
        totalMissions: 5,
        totalVotes: 3,
        reputationScore: 85,
        validationLevel: tier === 'Administrator' ? 'dao_verified' : tier === 'Governor' ? 'civic_grade' : 'enhanced',
        witnessCount: 2
      }
    };
    
    return {
      ballotId,
      cidDigest,
      vote,
      multiplier,
      encryptedPayload,
      eligibilityResult
    };
  }
}

// Export utility functions
export const issueZKVoteToken = async (input: VoteSubmissionInput): Promise<TokenIssuanceResult> => {
  const issuer = ZKVoteTokenIssuer.getInstance();
  return await issuer.issueVoteToken(input);
};

export const getZKVoteToken = (tokenId: string): ZKVoteToken | null => {
  const issuer = ZKVoteTokenIssuer.getInstance();
  return issuer.getTokenById(tokenId);
};

export const getActiveVoteTokens = (ballotId: string): ZKVoteToken[] => {
  const issuer = ZKVoteTokenIssuer.getInstance();
  return issuer.getActiveTokensForBallot(ballotId);
};

export const createMockVoteSubmission = (
  ballotId: string,
  vote: string,
  tier?: 'Citizen' | 'Verifier' | 'Moderator' | 'Governor' | 'Administrator',
  trustScore?: number
): VoteSubmissionInput => {
  const issuer = ZKVoteTokenIssuer.getInstance();
  return issuer.createMockVoteSubmission(ballotId, vote, tier, trustScore);
};

export default ZKVoteTokenIssuer;