/**
 * DAOVoteEngine.ts - Phase XXII
 * DAO Vote Engine + zk-Vote Contract Simulation System
 * Authority: Commander Mark via JASMY Relay
 */

import { ChainProofPackage } from '../services/ZKPChainExporter';

// Types for DAO voting system
export interface DAOVote {
  voteId: string;
  blockSimulatedAt: string;
  voterTier: VoterTier;
  weight: number;
  voteValue: VoteValue;
  billId: string;
  district: string;
  nullifiers: {
    sessionNullifier: string;
    didNullifier: string;
    billNullifier: string;
    combinedNullifier: string;
  };
  metadata: {
    submittedAt: string;
    chainHash: string;
    verificationHash: string;
    gasUsed: number;
  };
}

export interface VoteRegistrationResult {
  status: 'success' | 'failed' | 'duplicate' | 'invalid';
  voteId?: string;
  blockSimulatedAt?: string;
  weight?: number;
  error?: string;
  metadata: {
    nullifierExists: boolean;
    tierVerified: boolean;
    proofValid: boolean;
    gasEstimate: number;
  };
}

export interface VoteTally {
  billId: string;
  district: string;
  totalVotes: number;
  weightedVotes: number;
  breakdown: {
    support: { count: number; weight: number };
    oppose: { count: number; weight: number };
    abstain: { count: number; weight: number };
  };
  tierDistribution: {
    citizen: { count: number; weight: number };
    moderator: { count: number; weight: number };
    governor: { count: number; weight: number };
  };
  lastUpdated: string;
}

export type VoterTier = 'citizen' | 'moderator' | 'governor';
export type VoteValue = 'support' | 'oppose' | 'abstain';

// Mock DAO contract simulation utilities
class MockDAOContract {
  private static votes: Map<string, DAOVote> = new Map();
  private static nullifierRegistry: Set<string> = new Set();
  
  static getTierWeight(tier: VoterTier): number {
    switch (tier) {
      case 'citizen': return 1;
      case 'moderator': return 2;
      case 'governor': return 3;
      default: return 1;
    }
  }
  
  static determineTierFromDID(did: string): VoterTier {
    // Mock tier determination based on DID patterns
    if (did.includes('governor') || did.includes('commander')) return 'governor';
    if (did.includes('moderator') || did.includes('verifier')) return 'moderator';
    return 'citizen';
  }
  
  static convertVoteValue(value: number): VoteValue {
    if (value === 1) return 'support';
    if (value === 0) return 'oppose';
    if (value === -1) return 'abstain';
    return 'abstain'; // Default fallback
  }
  
  static isNullifierUnique(nullifier: string): boolean {
    return !MockDAOContract.nullifierRegistry.has(nullifier);
  }
  
  static registerNullifier(nullifier: string): void {
    MockDAOContract.nullifierRegistry.add(nullifier);
  }
  
  static generateVoteId(billId: string, nullifier: string): string {
    // Generate unique vote ID
    const chars = 'abcdef0123456789';
    let suffix = '';
    for (let i = 0; i < 8; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `zk${billId}-${suffix}`;
  }
  
  static simulateBlockTimestamp(): string {
    // Simulate blockchain timestamp
    const now = new Date();
    const blockTime = new Date(now.getTime() + Math.floor(Math.random() * 30000)); // 0-30s delay
    return blockTime.toISOString();
  }
  
  static estimateGasUsage(proofPackage: ChainProofPackage): number {
    // Simulate gas usage based on proof complexity
    const baseGas = 180000; // Base verification cost
    const signalGas = proofPackage.publicSignals.length * 8000;
    const nullifierGas = 15000; // Nullifier registration
    
    return baseGas + signalGas + nullifierGas;
  }
  
  static getVotesByBill(billId: string): DAOVote[] {
    return Array.from(MockDAOContract.votes.values())
      .filter(vote => vote.billId === billId);
  }
  
  static calculateTally(billId: string, district?: string): VoteTally {
    const votes = district 
      ? MockDAOContract.getVotesByBill(billId).filter(vote => vote.district === district)
      : MockDAOContract.getVotesByBill(billId);
    
    const tally: VoteTally = {
      billId,
      district: district || 'all',
      totalVotes: votes.length,
      weightedVotes: votes.reduce((sum, vote) => sum + vote.weight, 0),
      breakdown: {
        support: { count: 0, weight: 0 },
        oppose: { count: 0, weight: 0 },
        abstain: { count: 0, weight: 0 }
      },
      tierDistribution: {
        citizen: { count: 0, weight: 0 },
        moderator: { count: 0, weight: 0 },
        governor: { count: 0, weight: 0 }
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Calculate breakdowns
    votes.forEach(vote => {
      // Vote value breakdown
      tally.breakdown[vote.voteValue].count++;
      tally.breakdown[vote.voteValue].weight += vote.weight;
      
      // Tier distribution
      tally.tierDistribution[vote.voterTier].count++;
      tally.tierDistribution[vote.voterTier].weight += vote.weight;
    });
    
    return tally;
  }
}

// Main DAO Vote Engine class
export class DAOVoteEngine {
  private static instance: DAOVoteEngine;
  
  private constructor() {
    console.log('🗳️ DAOVoteEngine initialized for zk-vote contract simulation');
  }
  
  static getInstance(): DAOVoteEngine {
    if (!DAOVoteEngine.instance) {
      DAOVoteEngine.instance = new DAOVoteEngine();
    }
    return DAOVoteEngine.instance;
  }
  
  // Main vote registration function
  async registerVote(proofPackage: ChainProofPackage): Promise<VoteRegistrationResult> {
    const startTime = performance.now();
    
    try {
      console.log('🗳️ Processing DAO vote registration...');
      
      // Extract vote data from proof package
      const voteValue = parseInt(proofPackage.publicSignals[1]); // Vote value signal
      const billId = proofPackage.externalNullifier.split('-')[0]; // Extract bill ID
      const district = proofPackage.publicSignals[2]; // District signal
      
      // Determine voter tier from issuer DID
      const voterTier = MockDAOContract.determineTierFromDID(proofPackage.issuer.did);
      const weight = MockDAOContract.getTierWeight(voterTier);
      
      // Check nullifier uniqueness
      const combinedNullifier = `${proofPackage.externalNullifier}-${proofPackage.integrity.chainHash}`;
      const nullifierExists = !MockDAOContract.isNullifierUnique(combinedNullifier);
      
      if (nullifierExists) {
        console.log(`⚠️ DAO Vote Rejected — Nullifier already exists | Tier: ${voterTier}`);
        return {
          status: 'duplicate',
          error: 'Vote already submitted with this nullifier',
          metadata: {
            nullifierExists: true,
            tierVerified: true,
            proofValid: true,
            gasEstimate: 0
          }
        };
      }
      
      // Validate proof structure
      const proofValid = this.validateProofStructure(proofPackage);
      if (!proofValid) {
        console.log(`❌ DAO Vote Rejected — Invalid proof structure | Tier: ${voterTier}`);
        return {
          status: 'invalid',
          error: 'Invalid proof structure',
          metadata: {
            nullifierExists: false,
            tierVerified: true,
            proofValid: false,
            gasEstimate: 0
          }
        };
      }
      
      // Register vote
      const voteId = MockDAOContract.generateVoteId(billId, combinedNullifier);
      const blockSimulatedAt = MockDAOContract.simulateBlockTimestamp();
      const gasUsed = MockDAOContract.estimateGasUsage(proofPackage);
      
      const vote: DAOVote = {
        voteId,
        blockSimulatedAt,
        voterTier,
        weight,
        voteValue: MockDAOContract.convertVoteValue(voteValue),
        billId,
        district,
        nullifiers: {
          sessionNullifier: proofPackage.publicSignals[0],
          didNullifier: proofPackage.issuer.did,
          billNullifier: billId,
          combinedNullifier
        },
        metadata: {
          submittedAt: new Date().toISOString(),
          chainHash: proofPackage.integrity.chainHash,
          verificationHash: proofPackage.integrity.verificationHash,
          gasUsed
        }
      };
      
      // Store vote and register nullifier
      MockDAOContract.votes.set(voteId, vote);
      MockDAOContract.registerNullifier(combinedNullifier);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`🗳️ DAO Vote Registered — Tier: ${voterTier} | Weight: ${weight}x | Vote ID: ${voteId} | Duration: ${duration}ms`);
      
      return {
        status: 'success',
        voteId,
        blockSimulatedAt,
        weight,
        metadata: {
          nullifierExists: false,
          tierVerified: true,
          proofValid: true,
          gasEstimate: gasUsed
        }
      };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.error(`❌ DAO vote registration failed: ${error} | Duration: ${duration}ms`);
      
      return {
        status: 'failed',
        error: `Registration failed: ${error}`,
        metadata: {
          nullifierExists: false,
          tierVerified: false,
          proofValid: false,
          gasEstimate: 0
        }
      };
    }
  }
  
  // Validate proof package structure
  private validateProofStructure(proofPackage: ChainProofPackage): boolean {
    try {
      // Check required fields
      if (!proofPackage.proof || !proofPackage.publicSignals || !proofPackage.externalNullifier) {
        return false;
      }
      
      // Validate proof coordinates
      const { pi_a, pi_b, pi_c } = proofPackage.proof;
      if (!pi_a || pi_a.length !== 3) return false;
      if (!pi_b || pi_b.length !== 3) return false;
      if (!pi_c || pi_c.length !== 3) return false;
      
      // Validate public signals
      if (!Array.isArray(proofPackage.publicSignals) || proofPackage.publicSignals.length < 5) {
        return false;
      }
      
      // Validate vote value range
      const voteValue = parseInt(proofPackage.publicSignals[1]);
      if (voteValue < -1 || voteValue > 1) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Proof validation error:', error);
      return false;
    }
  }
  
  // Get vote tally for a bill
  async getVoteTally(billId: string, district?: string): Promise<VoteTally> {
    try {
      const tally = MockDAOContract.calculateTally(billId, district);
      
      console.log(`🧮 Current Vote Count — Support: ${tally.breakdown.support.count} | Oppose: ${tally.breakdown.oppose.count} | Abstain: ${tally.breakdown.abstain.count}`);
      
      return tally;
      
    } catch (error) {
      console.error('❌ Tally calculation failed:', error);
      throw error;
    }
  }
  
  // Get recent votes
  async getRecentVotes(limit: number = 10): Promise<DAOVote[]> {
    try {
      const allVotes = Array.from(MockDAOContract.votes.values());
      return allVotes
        .sort((a, b) => new Date(b.metadata.submittedAt).getTime() - new Date(a.metadata.submittedAt).getTime())
        .slice(0, limit);
        
    } catch (error) {
      console.error('❌ Recent votes retrieval failed:', error);
      return [];
    }
  }
  
  // Get vote by ID
  async getVoteById(voteId: string): Promise<DAOVote | null> {
    try {
      return MockDAOContract.votes.get(voteId) || null;
    } catch (error) {
      console.error('❌ Vote retrieval failed:', error);
      return null;
    }
  }
  
  // Check if nullifier exists
  isNullifierUsed(nullifier: string): boolean {
    return !MockDAOContract.isNullifierUnique(nullifier);
  }
  
  // Get total vote statistics
  async getVoteStatistics(): Promise<{
    totalVotes: number;
    totalWeight: number;
    tierBreakdown: { citizen: number; moderator: number; governor: number };
    recentActivity: number;
  }> {
    try {
      const allVotes = Array.from(MockDAOContract.votes.values());
      const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const stats = {
        totalVotes: allVotes.length,
        totalWeight: allVotes.reduce((sum, vote) => sum + vote.weight, 0),
        tierBreakdown: {
          citizen: allVotes.filter(vote => vote.voterTier === 'citizen').length,
          moderator: allVotes.filter(vote => vote.voterTier === 'moderator').length,
          governor: allVotes.filter(vote => vote.voterTier === 'governor').length
        },
        recentActivity: allVotes.filter(vote => 
          new Date(vote.metadata.submittedAt) > recentCutoff
        ).length
      };
      
      return stats;
      
    } catch (error) {
      console.error('❌ Statistics calculation failed:', error);
      return {
        totalVotes: 0,
        totalWeight: 0,
        tierBreakdown: { citizen: 0, moderator: 0, governor: 0 },
        recentActivity: 0
      };
    }
  }
}

// Export utility functions
export const registerVote = async (proofPackage: ChainProofPackage): Promise<VoteRegistrationResult> => {
  const engine = DAOVoteEngine.getInstance();
  return await engine.registerVote(proofPackage);
};

export const getVoteTally = async (billId: string, district?: string): Promise<VoteTally> => {
  const engine = DAOVoteEngine.getInstance();
  return await engine.getVoteTally(billId, district);
};

export const getRecentVotes = async (limit?: number): Promise<DAOVote[]> => {
  const engine = DAOVoteEngine.getInstance();
  return await engine.getRecentVotes(limit);
};

export const getVoteById = async (voteId: string): Promise<DAOVote | null> => {
  const engine = DAOVoteEngine.getInstance();
  return await engine.getVoteById(voteId);
};

export default DAOVoteEngine;