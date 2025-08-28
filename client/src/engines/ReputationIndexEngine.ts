/**
 * ReputationIndexEngine.ts - Civic Reputation Scoring & Tier Assignment Engine
 * 
 * Comprehensive reputation calculation system that fetches full credential history,
 * applies time-decay algorithms, and assigns civic tiers based on TruthPoints
 * scoring for the Truth Unveiled platform.
 * 
 * Features:
 * - Full credential history aggregation from multiple sources
 * - Time-decay algorithm for reputation scoring (exponential decay over time)
 * - Tier assignment based on TruthPoints thresholds
 * - Performance optimized ≤250ms per CID calculation
 * - Detailed logging and audit trail for reputation changes
 * 
 * Tier Thresholds:
 * - Citizen: >50 TP
 * - Contributor: >100 TP  
 * - Moderator: >200 TP
 * - Governor: >500 TP
 * - Commander: >1000 TP
 * 
 * Authority: Commander Mark | Phase X-K Step 1
 * Status: Implementation phase - reputation intelligence infrastructure
 */

import { TruthTokenRole } from '../tokenomics/TruthTokenomicsSpec';

// Core reputation interfaces
export interface CredentialEntry {
  id: string;
  type: 'badge' | 'certificate' | 'achievement' | 'credential' | 'vote' | 'proposal' | 'referral';
  title: string;
  category: string;
  truthPoints: number;
  basePoints: number; // Points before any multipliers
  issuedAt: string;
  expiresAt?: string;
  source: string; // Origin system/platform
  metadata: {
    difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    multiplier: number;
    tags: string[];
  };
  verificationStatus: 'verified' | 'pending' | 'failed' | 'expired';
  decayApplied?: number; // Percentage of original points after decay
}

export interface ReputationScore {
  cid: string;
  totalScore: number;
  baseScore: number; // Score before decay
  decayPercentage: number;
  tier: TruthTokenRole;
  previousTier?: TruthTokenRole;
  tierProgress: number; // Percentage to next tier (0-100)
  calculatedAt: string;
  lastUpdated: string;
  credentialCount: number;
  categoryCounts: { [category: string]: number };
  sourceCounts: { [source: string]: number };
  decayDetails: {
    totalDecay: number;
    averageAge: number; // Days
    oldestCredential: string;
    newestCredential: string;
  };
}

export interface ReputationHistory {
  cid: string;
  ownerDid: string;
  scores: ReputationScore[];
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    tierChanges: Array<{
      from: TruthTokenRole;
      to: TruthTokenRole;
      timestamp: string;
      reason: string;
    }>;
  };
}

// Tier configuration
const TIER_THRESHOLDS: Record<TruthTokenRole, number> = {
  [TruthTokenRole.CITIZEN]: 50,
  [TruthTokenRole.CONTRIBUTOR]: 100,
  [TruthTokenRole.MODERATOR]: 200,
  [TruthTokenRole.GOVERNOR]: 500,
  [TruthTokenRole.COMMANDER]: 1000
};

// Time decay configuration
const DECAY_CONFIG = {
  halfLifeDays: 90, // Points halve every 90 days
  minimumDecay: 0.1, // Minimum 10% of original value retained
  decayStartDays: 7, // No decay for first 7 days
  categoryDecayRates: {
    'Civic Leadership': 0.85, // Slower decay for leadership
    'Education': 0.9, // Educational achievements decay slowly
    'Verification': 0.75, // Verification skills decay faster
    'Technical': 0.8, // Technical skills moderate decay
    'Community': 0.88, // Community engagement slow decay
    'Governance': 0.82 // Governance experience moderate decay
  }
};

export class ReputationIndexEngine {
  private credentialSources: string[];
  private maxCalculationTime: number;

  constructor(sources: string[] = ['vault', 'proposals', 'votes', 'referrals'], maxTime: number = 250) {
    this.credentialSources = sources;
    this.maxCalculationTime = maxTime;
  }

  /**
   * Calculate comprehensive reputation score for a given CID
   * Fetches full credential history and applies time-decay algorithm
   */
  async calculateReputationScore(cid: string): Promise<ReputationScore> {
    const startTime = Date.now();

    try {
      console.log(`🧮 Starting reputation calculation — CID: ${cid}`);

      // Fetch credential history from all sources
      const credentials = await this.fetchCredentialHistory(cid);
      
      if (credentials.length === 0) {
        console.log(`⚠️ No credentials found for CID: ${cid}`);
        return this.createDefaultScore(cid);
      }

      // Apply time decay to all credentials
      const decayedCredentials = this.applyTimeDecay(credentials);

      // Calculate base and decayed scores
      const baseScore = credentials.reduce((sum, cred) => sum + cred.truthPoints, 0);
      const totalScore = decayedCredentials.reduce((sum, cred) => sum + cred.truthPoints, 0);
      const decayPercentage = baseScore > 0 ? ((baseScore - totalScore) / baseScore) * 100 : 0;

      // Determine tier and progress
      const tier = this.determineTier(totalScore);
      const tierProgress = this.calculateTierProgress(totalScore, tier);

      // Calculate category and source distributions
      const categoryCounts = this.aggregateByField(decayedCredentials, 'category');
      const sourceCounts = this.aggregateByField(decayedCredentials, 'source');

      // Calculate decay details
      const credentialAges = credentials.map(cred => 
        (Date.now() - new Date(cred.issuedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const averageAge = credentialAges.reduce((sum, age) => sum + age, 0) / credentialAges.length;
      const oldestCredential = credentials.reduce((oldest, cred) => 
        new Date(cred.issuedAt) < new Date(oldest.issuedAt) ? cred : oldest
      );
      const newestCredential = credentials.reduce((newest, cred) => 
        new Date(cred.issuedAt) > new Date(newest.issuedAt) ? cred : newest
      );

      const reputationScore: ReputationScore = {
        cid,
        totalScore: Math.round(totalScore),
        baseScore: Math.round(baseScore),
        decayPercentage: Math.round(decayPercentage * 100) / 100,
        tier,
        tierProgress: Math.round(tierProgress * 100) / 100,
        calculatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        credentialCount: credentials.length,
        categoryCounts,
        sourceCounts,
        decayDetails: {
          totalDecay: Math.round((baseScore - totalScore) * 100) / 100,
          averageAge: Math.round(averageAge * 100) / 100,
          oldestCredential: oldestCredential.id,
          newestCredential: newestCredential.id
        }
      };

      const calculationTime = Date.now() - startTime;
      
      console.log(`🧮 Reputation Score Calculated — Tier: ${tier} | Score: ${reputationScore.totalScore} | Decay: ${reputationScore.decayPercentage}% | Time: ${calculationTime}ms`);

      if (calculationTime > this.maxCalculationTime) {
        console.warn(`⚠️ Calculation exceeded target time — Target: ${this.maxCalculationTime}ms | Actual: ${calculationTime}ms`);
      }

      return reputationScore;

    } catch (error) {
      console.error(`❌ Reputation calculation failed for CID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Fetch credential history from all configured sources
   * Simulates aggregation from vault, proposals, votes, and referrals
   */
  private async fetchCredentialHistory(cid: string): Promise<CredentialEntry[]> {
    const credentials: CredentialEntry[] = [];

    // Simulate fetching from multiple sources
    for (const source of this.credentialSources) {
      try {
        const sourceCredentials = await this.fetchFromSource(source, cid);
        credentials.push(...sourceCredentials);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch from source ${source} for CID ${cid}:`, error);
      }
    }

    // Remove duplicates and sort by date
    const uniqueCredentials = this.deduplicateCredentials(credentials);
    return uniqueCredentials.sort((a, b) => 
      new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  }

  /**
   * Fetch credentials from a specific source
   * Mock implementation for demonstration
   */
  private async fetchFromSource(source: string, cid: string): Promise<CredentialEntry[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));

    const mockCredentials: CredentialEntry[] = [];

    switch (source) {
      case 'vault':
        mockCredentials.push(
          {
            id: `vault_${cid}_1`,
            type: 'badge',
            title: 'Civic Engagement Champion',
            category: 'Civic Leadership',
            truthPoints: 250,
            basePoints: 250,
            issuedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'TruthUnveiled Vault',
            metadata: {
              difficulty: 'advanced',
              rarity: 'rare',
              multiplier: 1.5,
              tags: ['leadership', 'community', 'engagement']
            },
            verificationStatus: 'verified'
          },
          {
            id: `vault_${cid}_2`,
            type: 'certificate',
            title: 'Digital Democracy Certificate',
            category: 'Education',
            truthPoints: 150,
            basePoints: 150,
            issuedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'Civic Education Institute',
            metadata: {
              difficulty: 'intermediate',
              rarity: 'uncommon',
              multiplier: 1.2,
              tags: ['education', 'democracy', 'governance']
            },
            verificationStatus: 'verified'
          }
        );
        break;

      case 'proposals':
        mockCredentials.push(
          {
            id: `proposal_${cid}_1`,
            type: 'proposal',
            title: 'Community Infrastructure Proposal',
            category: 'Governance',
            truthPoints: 120,
            basePoints: 100,
            issuedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'DAO Governance System',
            metadata: {
              difficulty: 'intermediate',
              rarity: 'common',
              multiplier: 1.2,
              tags: ['proposal', 'infrastructure', 'governance']
            },
            verificationStatus: 'verified'
          }
        );
        break;

      case 'votes':
        mockCredentials.push(
          {
            id: `vote_${cid}_1`,
            type: 'vote',
            title: 'Consistent Voter Badge',
            category: 'Civic Leadership',
            truthPoints: 80,
            basePoints: 80,
            issuedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'Voting System',
            metadata: {
              difficulty: 'basic',
              rarity: 'common',
              multiplier: 1.0,
              tags: ['voting', 'participation', 'civic']
            },
            verificationStatus: 'verified'
          },
          {
            id: `vote_${cid}_2`,
            type: 'vote',
            title: 'Truth Validator',
            category: 'Verification',
            truthPoints: 90,
            basePoints: 75,
            issuedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'Truth Verification Network',
            metadata: {
              difficulty: 'intermediate',
              rarity: 'uncommon',
              multiplier: 1.2,
              tags: ['verification', 'truth', 'accuracy']
            },
            verificationStatus: 'verified'
          }
        );
        break;

      case 'referrals':
        mockCredentials.push(
          {
            id: `referral_${cid}_1`,
            type: 'referral',
            title: 'Community Builder',
            category: 'Community',
            truthPoints: 60,
            basePoints: 50,
            issuedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'Referral System',
            metadata: {
              difficulty: 'basic',
              rarity: 'common',
              multiplier: 1.2,
              tags: ['referral', 'community', 'growth']
            },
            verificationStatus: 'verified'
          }
        );
        break;
    }

    return mockCredentials;
  }

  /**
   * Apply time-based decay to credentials
   * Uses exponential decay with category-specific rates
   */
  private applyTimeDecay(credentials: CredentialEntry[]): CredentialEntry[] {
    return credentials.map(credential => {
      const ageInDays = (Date.now() - new Date(credential.issuedAt).getTime()) / (1000 * 60 * 60 * 24);
      
      // No decay for recent credentials
      if (ageInDays <= DECAY_CONFIG.decayStartDays) {
        credential.decayApplied = 0;
        return credential;
      }

      // Calculate decay factor
      const categoryRate = DECAY_CONFIG.categoryDecayRates[credential.category] || 0.8;
      const effectiveAge = ageInDays - DECAY_CONFIG.decayStartDays;
      const halfLifeDecay = Math.pow(0.5, effectiveAge / DECAY_CONFIG.halfLifeDays);
      const categoryDecay = Math.pow(categoryRate, effectiveAge / 30); // Monthly category decay
      
      const combinedDecay = Math.max(halfLifeDecay * categoryDecay, DECAY_CONFIG.minimumDecay);
      
      // Apply decay to truth points
      const originalPoints = credential.truthPoints;
      credential.truthPoints = Math.round(originalPoints * combinedDecay);
      credential.decayApplied = Math.round((1 - combinedDecay) * 100);

      return credential;
    });
  }

  /**
   * Determine tier based on total score
   */
  private determineTier(score: number): TruthTokenRole {
    if (score >= TIER_THRESHOLDS[TruthTokenRole.COMMANDER]) return TruthTokenRole.COMMANDER;
    if (score >= TIER_THRESHOLDS[TruthTokenRole.GOVERNOR]) return TruthTokenRole.GOVERNOR;
    if (score >= TIER_THRESHOLDS[TruthTokenRole.MODERATOR]) return TruthTokenRole.MODERATOR;
    if (score >= TIER_THRESHOLDS[TruthTokenRole.CONTRIBUTOR]) return TruthTokenRole.CONTRIBUTOR;
    return TruthTokenRole.CITIZEN;
  }

  /**
   * Calculate progress to next tier (0-100%)
   */
  private calculateTierProgress(score: number, currentTier: TruthTokenRole): number {
    const tierValues = Object.values(TruthTokenRole);
    const currentIndex = tierValues.indexOf(currentTier);
    
    // Already at highest tier
    if (currentIndex === tierValues.length - 1) {
      return 100;
    }

    const nextTier = tierValues[currentIndex + 1] as TruthTokenRole;
    const currentThreshold = TIER_THRESHOLDS[currentTier];
    const nextThreshold = TIER_THRESHOLDS[nextTier];
    
    const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  /**
   * Aggregate credentials by a specific field
   */
  private aggregateByField(credentials: CredentialEntry[], field: keyof CredentialEntry): { [key: string]: number } {
    return credentials.reduce((acc, cred) => {
      const value = cred[field] as string;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Remove duplicate credentials based on ID
   */
  private deduplicateCredentials(credentials: CredentialEntry[]): CredentialEntry[] {
    const seen = new Set<string>();
    return credentials.filter(cred => {
      if (seen.has(cred.id)) {
        return false;
      }
      seen.add(cred.id);
      return true;
    });
  }

  /**
   * Create default score for CIDs with no credentials
   */
  private createDefaultScore(cid: string): ReputationScore {
    return {
      cid,
      totalScore: 0,
      baseScore: 0,
      decayPercentage: 0,
      tier: TruthTokenRole.CITIZEN,
      tierProgress: 0,
      calculatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      credentialCount: 0,
      categoryCounts: {},
      sourceCounts: {},
      decayDetails: {
        totalDecay: 0,
        averageAge: 0,
        oldestCredential: '',
        newestCredential: ''
      }
    };
  }

  /**
   * Batch calculate reputation scores for multiple CIDs
   */
  async batchCalculateScores(cids: string[]): Promise<ReputationScore[]> {
    const results: ReputationScore[] = [];
    
    console.log(`🧮 Starting batch reputation calculation — CIDs: ${cids.length}`);
    
    for (const cid of cids) {
      try {
        const score = await this.calculateReputationScore(cid);
        results.push(score);
      } catch (error) {
        console.error(`❌ Batch calculation failed for CID ${cid}:`, error);
        results.push(this.createDefaultScore(cid));
      }
    }
    
    console.log(`🧮 Batch calculation complete — Processed: ${results.length}/${cids.length}`);
    return results;
  }

  /**
   * Get tier statistics across all calculated scores
   */
  static getTierStatistics(scores: ReputationScore[]): { [tier: string]: number } {
    return scores.reduce((stats, score) => {
      stats[score.tier] = (stats[score.tier] || 0) + 1;
      return stats;
    }, {} as { [tier: string]: number });
  }

  /**
   * Validate reputation score integrity
   */
  static validateScore(score: ReputationScore): boolean {
    // Basic validation checks
    if (score.totalScore < 0 || score.baseScore < 0) return false;
    if (score.decayPercentage < 0 || score.decayPercentage > 100) return false;
    if (score.tierProgress < 0 || score.tierProgress > 100) return false;
    if (!Object.values(TruthTokenRole).includes(score.tier)) return false;
    
    return true;
  }
}

// Utility functions for external usage

/**
 * Quick reputation lookup for a single CID
 */
export async function calculateQuickReputation(cid: string): Promise<ReputationScore> {
  const engine = new ReputationIndexEngine();
  return engine.calculateReputationScore(cid);
}

/**
 * Get tier requirements for display purposes
 */
export function getTierRequirements(): Record<TruthTokenRole, number> {
  return { ...TIER_THRESHOLDS };
}

/**
 * Check if a score qualifies for a specific tier
 */
export function qualifiesForTier(score: number, tier: TruthTokenRole): boolean {
  return score >= TIER_THRESHOLDS[tier];
}

/**
 * Calculate points needed for next tier
 */
export function pointsToNextTier(currentScore: number, currentTier: TruthTokenRole): number {
  const tierValues = Object.values(TruthTokenRole);
  const currentIndex = tierValues.indexOf(currentTier);
  
  if (currentIndex === tierValues.length - 1) {
    return 0; // Already at highest tier
  }
  
  const nextTier = tierValues[currentIndex + 1] as TruthTokenRole;
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  
  return Math.max(0, nextThreshold - currentScore);
}

export default ReputationIndexEngine;