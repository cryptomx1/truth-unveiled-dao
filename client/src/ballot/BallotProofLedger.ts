/**
 * BallotProofLedger.ts - Phase XXVII Step 4
 * Final Persistent Ledger for Anonymous Vote Tokens
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  type ZKVoteToken,
  ZKVoteTokenIssuer 
} from './ZKVoteTokenIssuer';

// Ballot aggregation result interface
export interface BallotAggregationResult {
  ballotId: string;
  totalVotes: number;
  weightedTotals: { [choice: string]: number };
  medianWeight: number;
  averageWeight: number;
  totalWeight: number;
  voteBreakdown: { [choice: string]: number };
  participationRate: number;
  lastUpdated: string;
  metadata: {
    firstVote: string;
    lastVote: string;
    uniqueWeights: number[];
    weightDistribution: { [weight: string]: number };
    encryptedVoteCount: number;
    integrityHash: string;
  };
}

// Ledger entry interface
export interface BallotLedgerEntry {
  tokenId: string;
  ballotId: string;
  encryptedVote: string;
  voteWeight: number;
  timestamp: string;
  proofSignature: string;
  voteDigest: string;
  ledgerPosition: number;
  isActive: boolean;
  metadata: {
    tier: string;
    trustScore: number;
    validationLevel: string;
    submissionTimestamp: string;
    integrityHash: string;
  };
}

// Query filter interface
export interface BallotQuery {
  ballotId?: string;
  timestampRange?: {
    start: string;
    end: string;
  };
  voteWeightBucket?: {
    min: number;
    max: number;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'weight' | 'position';
  sortOrder?: 'asc' | 'desc';
}

// Tally export interface
export interface OutcomeLedgerBundle {
  ballotId: string;
  exportTimestamp: string;
  aggregationResult: BallotAggregationResult;
  verificationData: {
    totalEntries: number;
    integrityHash: string;
    weightSum: number;
    voteCount: number;
    encryptedDigests: string[];
  };
  auditTrail: {
    firstEntry: string;
    lastEntry: string;
    ledgerPositions: number[];
    duplicateRejects: number;
    expiredRejects: number;
  };
}

// Ledger validation result
interface ValidationResult {
  valid: boolean;
  reason?: string;
  duplicateTokenId?: string;
  expiredAt?: string;
}

// Main Ballot Proof Ledger class
export class BallotProofLedger {
  private static instance: BallotProofLedger;
  private ledgerEntries: Map<string, BallotLedgerEntry> = new Map();
  private ballotIndex: Map<string, Set<string>> = new Map(); // ballotId -> tokenIds
  private timestampIndex: Map<string, string[]> = new Map(); // date -> tokenIds
  private weightIndex: Map<number, string[]> = new Map(); // weight -> tokenIds
  private ledgerPosition: number = 0;
  private rejectHistory: Array<{
    tokenId: string;
    reason: string;
    timestamp: string;
    ballotId: string;
  }> = [];
  
  private constructor() {
    console.log('📦 BallotProofLedger initialized for persistent vote token archival and encrypted outcome aggregation');
    this.startTokenSyncProcess();
  }
  
  static getInstance(): BallotProofLedger {
    if (!BallotProofLedger.instance) {
      BallotProofLedger.instance = new BallotProofLedger();
    }
    return BallotProofLedger.instance;
  }
  
  // Record ZK vote token in ledger
  async recordVoteToken(zkToken: ZKVoteToken): Promise<{
    success: boolean;
    ledgerPosition?: number;
    error?: string;
    reason?: 'duplicate' | 'expired' | 'invalid_signature' | 'processing_error';
  }> {
    
    try {
      console.log(`🔄 Recording vote token in ledger — Ballot: ${zkToken.ballotId} | Token: ${zkToken.tokenId}`);
      
      // Step 1: Validate token
      const validation = this.validateToken(zkToken);
      if (!validation.valid) {
        
        const rejectEntry = {
          tokenId: zkToken.tokenId,
          reason: validation.reason || 'unknown',
          timestamp: new Date().toISOString(),
          ballotId: zkToken.ballotId
        };
        this.rejectHistory.push(rejectEntry);
        
        console.log(`🚫 Vote rejected — Reason: ${validation.reason} | Token: ${zkToken.tokenId}`);
        
        return {
          success: false,
          error: validation.reason,
          reason: validation.reason === 'Token already exists in ledger' ? 'duplicate' : 
                  validation.reason === 'Token has expired' ? 'expired' : 
                  validation.reason === 'Invalid proof signature' ? 'invalid_signature' : 'processing_error'
        };
      }
      
      // Step 2: Generate vote digest
      const voteDigest = this.generateVoteDigest(zkToken.encryptedVote, zkToken.proofSignature);
      
      // Step 3: Create ledger entry
      const ledgerEntry: BallotLedgerEntry = {
        tokenId: zkToken.tokenId,
        ballotId: zkToken.ballotId,
        encryptedVote: zkToken.encryptedVote,
        voteWeight: zkToken.voteWeight,
        timestamp: zkToken.timestamp,
        proofSignature: zkToken.proofSignature,
        voteDigest,
        ledgerPosition: this.ledgerPosition++,
        isActive: true,
        metadata: {
          tier: zkToken.metadata.tier,
          trustScore: zkToken.metadata.trustScore,
          validationLevel: zkToken.metadata.validationLevel,
          submissionTimestamp: zkToken.metadata.submissionTimestamp,
          integrityHash: zkToken.metadata.integrityHash
        }
      };
      
      // Step 4: Store in ledger and indexes
      this.ledgerEntries.set(zkToken.tokenId, ledgerEntry);
      
      // Update ballot index
      if (!this.ballotIndex.has(zkToken.ballotId)) {
        this.ballotIndex.set(zkToken.ballotId, new Set());
      }
      this.ballotIndex.get(zkToken.ballotId)!.add(zkToken.tokenId);
      
      // Update timestamp index
      const dateKey = zkToken.timestamp.substring(0, 10); // YYYY-MM-DD
      if (!this.timestampIndex.has(dateKey)) {
        this.timestampIndex.set(dateKey, []);
      }
      this.timestampIndex.get(dateKey)!.push(zkToken.tokenId);
      
      // Update weight index
      if (!this.weightIndex.has(zkToken.voteWeight)) {
        this.weightIndex.set(zkToken.voteWeight, []);
      }
      this.weightIndex.get(zkToken.voteWeight)!.push(zkToken.tokenId);
      
      // Step 5: Console logging as required
      console.log(`📦 Ballot Recorded — Ballot: ${zkToken.ballotId} | Weight: ${zkToken.voteWeight}x | Digest: ${voteDigest.substring(0, 16)}...`);
      
      return {
        success: true,
        ledgerPosition: ledgerEntry.ledgerPosition
      };
      
    } catch (error) {
      console.error(`❌ Ledger recording failed for token ${zkToken.tokenId}:`, error);
      
      const rejectEntry = {
        tokenId: zkToken.tokenId,
        reason: `processing_error: ${String(error)}`,
        timestamp: new Date().toISOString(),
        ballotId: zkToken.ballotId
      };
      this.rejectHistory.push(rejectEntry);
      
      return {
        success: false,
        error: `Processing error: ${String(error)}`,
        reason: 'processing_error'
      };
    }
  }
  
  // Validate ZK vote token
  private validateToken(zkToken: ZKVoteToken): ValidationResult {
    
    // Check if token already exists
    if (this.ledgerEntries.has(zkToken.tokenId)) {
      return {
        valid: false,
        reason: 'Token already exists in ledger',
        duplicateTokenId: zkToken.tokenId
      };
    }
    
    // Check if token has expired
    const expiresAt = new Date(zkToken.expiresAt).getTime();
    if (expiresAt < Date.now()) {
      return {
        valid: false,
        reason: 'Token has expired',
        expiredAt: zkToken.expiresAt
      };
    }
    
    // Validate proof signature format
    if (!zkToken.proofSignature || !zkToken.proofSignature.startsWith('zkproof-')) {
      return {
        valid: false,
        reason: 'Invalid proof signature'
      };
    }
    
    // Validate encrypted vote format
    if (!zkToken.encryptedVote || !zkToken.encryptedVote.startsWith('encrypted-ballot-')) {
      return {
        valid: false,
        reason: 'Invalid encrypted vote format'
      };
    }
    
    // Validate vote weight range
    if (zkToken.voteWeight <= 0 || zkToken.voteWeight > 5) {
      return {
        valid: false,
        reason: 'Invalid vote weight range'
      };
    }
    
    return { valid: true };
  }
  
  // Generate vote digest for anonymized storage
  private generateVoteDigest(encryptedVote: string, proofSignature: string): string {
    const input = `${encryptedVote}:${proofSignature}:${Date.now()}`;
    const hash = this.simpleHash(input);
    return `digest-${hash}`;
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
  
  // Query ledger entries
  queryLedger(query: BallotQuery): BallotLedgerEntry[] {
    let results: BallotLedgerEntry[] = [];
    
    // Start with all entries if no specific filters
    let candidates: BallotLedgerEntry[] = Array.from(this.ledgerEntries.values());
    
    // Filter by ballot ID
    if (query.ballotId) {
      const tokenIds = this.ballotIndex.get(query.ballotId);
      if (tokenIds) {
        candidates = candidates.filter(entry => tokenIds.has(entry.tokenId));
      } else {
        return []; // No entries for this ballot
      }
    }
    
    // Filter by timestamp range
    if (query.timestampRange) {
      const startTime = new Date(query.timestampRange.start).getTime();
      const endTime = new Date(query.timestampRange.end).getTime();
      candidates = candidates.filter(entry => {
        const entryTime = new Date(entry.timestamp).getTime();
        return entryTime >= startTime && entryTime <= endTime;
      });
    }
    
    // Filter by vote weight bucket
    if (query.voteWeightBucket) {
      candidates = candidates.filter(entry => 
        entry.voteWeight >= query.voteWeightBucket!.min && 
        entry.voteWeight <= query.voteWeightBucket!.max
      );
    }
    
    // Sort results
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    
    candidates.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'weight':
          comparison = a.voteWeight - b.voteWeight;
          break;
        case 'position':
          comparison = a.ledgerPosition - b.ledgerPosition;
          break;
        default:
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Apply offset and limit
    const offset = query.offset || 0;
    const limit = query.limit || candidates.length;
    
    results = candidates.slice(offset, offset + limit);
    
    return results;
  }
  
  // Get tally for specific ballot
  getTally(ballotId: string): BallotAggregationResult | null {
    
    const entries = this.queryLedger({ ballotId });
    
    if (entries.length === 0) {
      return null;
    }
    
    // Extract vote choices from encrypted payloads (mock decryption)
    const voteChoices: { [choice: string]: number } = {};
    const weightedTotals: { [choice: string]: number } = {};
    const weights: number[] = [];
    const uniqueWeights: Set<number> = new Set();
    const weightDistribution: { [weight: string]: number } = {};
    
    let totalWeight = 0;
    let firstVote = entries[entries.length - 1].timestamp; // oldest first
    let lastVote = entries[0].timestamp; // newest first
    
    entries.forEach(entry => {
      // Mock vote choice extraction from encrypted vote
      const mockChoice = this.extractMockVoteChoice(entry.encryptedVote);
      
      // Update vote breakdown
      voteChoices[mockChoice] = (voteChoices[mockChoice] || 0) + 1;
      weightedTotals[mockChoice] = (weightedTotals[mockChoice] || 0) + entry.voteWeight;
      
      // Update weight tracking
      weights.push(entry.voteWeight);
      uniqueWeights.add(entry.voteWeight);
      totalWeight += entry.voteWeight;
      
      const weightKey = entry.voteWeight.toString();
      weightDistribution[weightKey] = (weightDistribution[weightKey] || 0) + 1;
      
      // Update timestamp range
      if (entry.timestamp < firstVote) firstVote = entry.timestamp;
      if (entry.timestamp > lastVote) lastVote = entry.timestamp;
    });
    
    // Calculate median weight
    const sortedWeights = [...weights].sort((a, b) => a - b);
    const medianWeight = sortedWeights.length % 2 === 0 ?
      (sortedWeights[sortedWeights.length / 2 - 1] + sortedWeights[sortedWeights.length / 2]) / 2 :
      sortedWeights[Math.floor(sortedWeights.length / 2)];
    
    // Calculate average weight
    const averageWeight = totalWeight / entries.length;
    
    // Generate integrity hash
    const integrityInput = `${ballotId}:${entries.length}:${totalWeight}:${JSON.stringify(weightedTotals)}`;
    const integrityHash = `integrity-${this.simpleHash(integrityInput)}`;
    
    return {
      ballotId,
      totalVotes: entries.length,
      weightedTotals,
      medianWeight: Math.round(medianWeight * 100) / 100,
      averageWeight: Math.round(averageWeight * 100) / 100,
      totalWeight,
      voteBreakdown: voteChoices,
      participationRate: 100, // Mock participation rate
      lastUpdated: new Date().toISOString(),
      metadata: {
        firstVote,
        lastVote,
        uniqueWeights: Array.from(uniqueWeights).sort(),
        weightDistribution,
        encryptedVoteCount: entries.length,
        integrityHash
      }
    };
  }
  
  // Mock vote choice extraction from encrypted vote
  private extractMockVoteChoice(encryptedVote: string): string {
    
    // Mock decryption by using hash patterns
    const hash = this.simpleHash(encryptedVote);
    const hashInt = parseInt(hash.substring(0, 8), 16);
    
    const choices = ['Support', 'Oppose', 'Abstain'];
    return choices[hashInt % choices.length];
  }
  
  // Export outcome ledger bundle for DAO
  exportOutcomeLedgerBundle(ballotId: string): OutcomeLedgerBundle | null {
    
    const aggregationResult = this.getTally(ballotId);
    if (!aggregationResult) {
      return null;
    }
    
    const entries = this.queryLedger({ ballotId });
    
    // Generate verification data
    const encryptedDigests = entries.map(entry => entry.voteDigest);
    const verificationHash = `verification-${this.simpleHash(JSON.stringify(encryptedDigests))}`;
    
    // Generate audit trail
    const ledgerPositions = entries.map(entry => entry.ledgerPosition).sort((a, b) => a - b);
    const duplicateRejects = this.rejectHistory.filter(r => r.ballotId === ballotId && r.reason.includes('duplicate')).length;
    const expiredRejects = this.rejectHistory.filter(r => r.ballotId === ballotId && r.reason.includes('expired')).length;
    
    return {
      ballotId,
      exportTimestamp: new Date().toISOString(),
      aggregationResult,
      verificationData: {
        totalEntries: entries.length,
        integrityHash: verificationHash,
        weightSum: aggregationResult.totalWeight,
        voteCount: aggregationResult.totalVotes,
        encryptedDigests
      },
      auditTrail: {
        firstEntry: entries.length > 0 ? entries[entries.length - 1].timestamp : '',
        lastEntry: entries.length > 0 ? entries[0].timestamp : '',
        ledgerPositions,
        duplicateRejects,
        expiredRejects
      }
    };
  }
  
  // Get ledger statistics
  getLedgerStatistics(): {
    totalEntries: number;
    activeBallots: number;
    totalWeight: number;
    averageWeight: number;
    recentEntries: number;
    rejectedTokens: number;
    weightDistribution: { [weight: string]: number };
    dailyActivity: { [date: string]: number };
    tierDistribution: { [tier: string]: number };
    integrityStatus: string;
  } {
    
    const entries = Array.from(this.ledgerEntries.values());
    const totalWeight = entries.reduce((sum, entry) => sum + entry.voteWeight, 0);
    const averageWeight = entries.length > 0 ? totalWeight / entries.length : 0;
    
    // Recent entries (last hour)
    const oneHourAgo = Date.now() - 3600000;
    const recentEntries = entries.filter(entry => 
      new Date(entry.timestamp).getTime() > oneHourAgo
    ).length;
    
    // Weight distribution
    const weightDistribution: { [weight: string]: number } = {};
    entries.forEach(entry => {
      const key = entry.voteWeight.toString();
      weightDistribution[key] = (weightDistribution[key] || 0) + 1;
    });
    
    // Daily activity
    const dailyActivity: { [date: string]: number } = {};
    entries.forEach(entry => {
      const date = entry.timestamp.substring(0, 10);
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
    
    // Tier distribution
    const tierDistribution: { [tier: string]: number } = {};
    entries.forEach(entry => {
      const tier = entry.metadata.tier;
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    });
    
    return {
      totalEntries: entries.length,
      activeBallots: this.ballotIndex.size,
      totalWeight,
      averageWeight: Math.round(averageWeight * 100) / 100,
      recentEntries,
      rejectedTokens: this.rejectHistory.length,
      weightDistribution,
      dailyActivity,
      tierDistribution,
      integrityStatus: entries.length > 0 ? 'verified' : 'empty'
    };
  }
  
  // Get ballot list
  getBallotList(): Array<{
    ballotId: string;
    entryCount: number;
    totalWeight: number;
    lastActivity: string;
    participationSummary: string;
  }> {
    
    const ballotList: Array<{
      ballotId: string;
      entryCount: number;
      totalWeight: number;
      lastActivity: string;
      participationSummary: string;
    }> = [];
    
    for (const [ballotId, tokenIds] of this.ballotIndex.entries()) {
      const entries = Array.from(tokenIds).map(tokenId => this.ledgerEntries.get(tokenId)!);
      const totalWeight = entries.reduce((sum, entry) => sum + entry.voteWeight, 0);
      const lastActivity = entries.reduce((latest, entry) => 
        entry.timestamp > latest ? entry.timestamp : latest, entries[0].timestamp
      );
      
      const uniqueWeights = new Set(entries.map(entry => entry.voteWeight)).size;
      const participationSummary = `${entries.length} votes, ${uniqueWeights} weight tiers`;
      
      ballotList.push({
        ballotId,
        entryCount: entries.length,
        totalWeight,
        lastActivity,
        participationSummary
      });
    }
    
    return ballotList.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }
  
  // Get reject history
  getRejectHistory(limit?: number): Array<{
    tokenId: string;
    reason: string;
    timestamp: string;
    ballotId: string;
  }> {
    const history = [...this.rejectHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }
  
  // Start automatic token sync with ZKVoteTokenIssuer
  private startTokenSyncProcess(): void {
    
    // Sync every 30 seconds
    setInterval(() => {
      this.syncWithTokenIssuer();
    }, 30000);
    
    // Initial sync
    setTimeout(() => {
      this.syncWithTokenIssuer();
    }, 1000);
  }
  
  // Sync with ZK vote token issuer
  private async syncWithTokenIssuer(): Promise<void> {
    try {
      const tokenIssuer = ZKVoteTokenIssuer.getInstance();
      const ledgerEntries = tokenIssuer.getBallotLedgerEntries();
      
      let syncedCount = 0;
      
      for (const ledgerEntry of ledgerEntries) {
        if (ledgerEntry.isActive && !this.ledgerEntries.has(ledgerEntry.token.tokenId)) {
          const recordResult = await this.recordVoteToken(ledgerEntry.token);
          if (recordResult.success) {
            syncedCount++;
          }
        }
      }
      
      if (syncedCount > 0) {
        console.log(`🔄 Synced ${syncedCount} new vote tokens from issuer to ledger`);
      }
      
    } catch (error) {
      console.error('❌ Token sync failed:', error);
    }
  }
  
  // Clear all ledger data (admin function)
  clearAllData(): void {
    this.ledgerEntries.clear();
    this.ballotIndex.clear();
    this.timestampIndex.clear();
    this.weightIndex.clear();
    this.rejectHistory.length = 0;
    this.ledgerPosition = 0;
    console.log('🧹 All BallotProofLedger data cleared');
  }
  
  // Create mock ballot aggregation for testing
  createMockBallotAggregation(ballotId: string, voteCount: number = 10): BallotAggregationResult {
    const choices = ['Support', 'Oppose', 'Abstain'];
    const voteBreakdown: { [choice: string]: number } = {};
    const weightedTotals: { [choice: string]: number } = {};
    const weights: number[] = [];
    
    let totalWeight = 0;
    
    // Generate mock votes
    for (let i = 0; i < voteCount; i++) {
      const choice = choices[Math.floor(Math.random() * choices.length)];
      const weight = [1.0, 1.2, 1.5, 2.0, 3.0][Math.floor(Math.random() * 5)];
      
      voteBreakdown[choice] = (voteBreakdown[choice] || 0) + 1;
      weightedTotals[choice] = (weightedTotals[choice] || 0) + weight;
      weights.push(weight);
      totalWeight += weight;
    }
    
    const sortedWeights = weights.sort((a, b) => a - b);
    const medianWeight = sortedWeights.length % 2 === 0 ?
      (sortedWeights[sortedWeights.length / 2 - 1] + sortedWeights[sortedWeights.length / 2]) / 2 :
      sortedWeights[Math.floor(sortedWeights.length / 2)];
    
    const averageWeight = totalWeight / voteCount;
    const integrityHash = `integrity-${this.simpleHash(`${ballotId}:${voteCount}:${totalWeight}`)}`;
    
    return {
      ballotId,
      totalVotes: voteCount,
      weightedTotals,
      medianWeight: Math.round(medianWeight * 100) / 100,
      averageWeight: Math.round(averageWeight * 100) / 100,
      totalWeight,
      voteBreakdown,
      participationRate: 100,
      lastUpdated: new Date().toISOString(),
      metadata: {
        firstVote: new Date(Date.now() - 3600000).toISOString(),
        lastVote: new Date().toISOString(),
        uniqueWeights: Array.from(new Set(weights)).sort(),
        weightDistribution: weights.reduce((acc, weight) => {
          const key = weight.toString();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as { [weight: string]: number }),
        encryptedVoteCount: voteCount,
        integrityHash
      }
    };
  }
}

// Export utility functions
export const recordVoteToken = async (zkToken: ZKVoteToken) => {
  const ledger = BallotProofLedger.getInstance();
  return await ledger.recordVoteToken(zkToken);
};

export const getBallotTally = (ballotId: string): BallotAggregationResult | null => {
  const ledger = BallotProofLedger.getInstance();
  return ledger.getTally(ballotId);
};

export const queryBallotLedger = (query: BallotQuery): BallotLedgerEntry[] => {
  const ledger = BallotProofLedger.getInstance();
  return ledger.queryLedger(query);
};

export const exportBallotBundle = (ballotId: string): OutcomeLedgerBundle | null => {
  const ledger = BallotProofLedger.getInstance();
  return ledger.exportOutcomeLedgerBundle(ballotId);
};

export const createMockBallotAggregation = (ballotId: string, voteCount?: number): BallotAggregationResult => {
  const ledger = BallotProofLedger.getInstance();
  return ledger.createMockBallotAggregation(ballotId, voteCount);
};

export default BallotProofLedger;