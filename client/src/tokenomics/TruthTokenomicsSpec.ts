/**
 * TruthTokenomicsSpec.ts - Truth Unveiled Civic Economics System
 * 
 * Defines the initial structure of Truth Unveiled's civic economics system,
 * linking token economics to CID-based access control and civic engagement.
 * 
 * This scaffold provides the foundation for integrating civic participation
 * rewards, reputation scoring, and tokenized governance with the platform's
 * access control hierarchy defined in CIDTierMap.ts.
 * 
 * Authority: Commander Mark | Phase XXXI Step 3
 * Status: Economic access scaffold - no blockchain implementation yet
 */

import { CIDTier } from '../access/CIDTierMap';

/**
 * TruthTokenRole enum defines the civic economic roles within the Truth Unveiled platform
 * Each role corresponds to different levels of civic engagement and platform privileges
 */
export enum TruthTokenRole {
  /** Base civic participant with minimal token requirements */
  CITIZEN = 'CITIZEN',
  
  /** Active civic contributor with evidence submission and engagement privileges */
  CONTRIBUTOR = 'CONTRIBUTOR',
  
  /** Civic moderator with content oversight and community management privileges */
  MODERATOR = 'MODERATOR',
  
  /** Governance participant with DAO voting and proposal creation privileges */
  GOVERNOR = 'GOVERNOR',
  
  /** Platform administrator with full system access and oversight privileges */
  COMMANDER = 'COMMANDER'
}

/**
 * TokenomicTierSpec interface defines the economic requirements and access privileges
 * for each civic engagement tier within the Truth Unveiled ecosystem
 */
export interface TokenomicTierSpec {
  /** The civic role tier */
  tier: TruthTokenRole;
  
  /** Required Truth Points (TP) balance to maintain this tier */
  requiredTruthPoints: number;
  
  /** Optional minimum staking requirement for enhanced privileges */
  stakingMinimum?: number;
  
  /** Optional reputation score requirement for tier access */
  reputationRequired?: number;
  
  /** CID tiers that become accessible with this tokenomic tier */
  unlockableCIDTiers: CIDTier[];
  
  /** Optional multiplier for civic engagement rewards */
  rewardMultiplier?: number;
  
  /** Optional description of tier privileges */
  description?: string;
}

/**
 * Truth Unveiled Tokenomics Tier Specifications
 * Maps civic economic roles to access privileges and token requirements
 */
export const TruthTokenomicsTiers: TokenomicTierSpec[] = [
  {
    tier: TruthTokenRole.CITIZEN,
    requiredTruthPoints: 0,
    unlockableCIDTiers: [CIDTier.TIER_0, CIDTier.TIER_1],
    rewardMultiplier: 1.0,
    description: 'Base civic participant with identity verification and basic platform access'
  },
  
  {
    tier: TruthTokenRole.CONTRIBUTOR,
    requiredTruthPoints: 50,
    reputationRequired: 10,
    unlockableCIDTiers: [CIDTier.TIER_0, CIDTier.TIER_1, CIDTier.TIER_2],
    rewardMultiplier: 1.25,
    description: 'Active civic contributor with voting eligibility and evidence submission privileges'
  },
  
  {
    tier: TruthTokenRole.MODERATOR,
    requiredTruthPoints: 100,
    stakingMinimum: 25,
    reputationRequired: 20,
    unlockableCIDTiers: [CIDTier.TIER_0, CIDTier.TIER_1, CIDTier.TIER_2],
    rewardMultiplier: 1.5,
    description: 'Civic moderator with content oversight and community management responsibilities'
  },
  
  {
    tier: TruthTokenRole.GOVERNOR,
    requiredTruthPoints: 200,
    stakingMinimum: 50,
    reputationRequired: 50,
    unlockableCIDTiers: [CIDTier.TIER_0, CIDTier.TIER_1, CIDTier.TIER_2, CIDTier.TIER_3],
    rewardMultiplier: 2.0,
    description: 'Governance participant with DAO voting rights and proposal creation privileges'
  },
  
  {
    tier: TruthTokenRole.COMMANDER,
    requiredTruthPoints: 500,
    stakingMinimum: 100,
    reputationRequired: 90,
    unlockableCIDTiers: [CIDTier.TIER_0, CIDTier.TIER_1, CIDTier.TIER_2, CIDTier.TIER_3, CIDTier.TIER_X],
    rewardMultiplier: 3.0,
    description: 'Platform administrator with full system access and oversight authority'
  }
];

/**
 * Placeholder user profile for tokenomics calculations
 * In production, this would be replaced by blockchain-based user state
 */
export interface UserTokenomicProfile {
  cid: string;
  truthPointBalance: number;
  stakedAmount?: number;
  reputationScore: number;
  currentTier: TruthTokenRole;
  lastTierEvaluation: Date;
  engagementHistory?: {
    votesParticipated: number;
    evidenceSubmitted: number;
    proposalsCreated: number;
    moderationActions: number;
  };
}

/**
 * Mock user profiles for development and testing
 * In production, this would be replaced by blockchain user state queries
 */
const mockUserProfiles: Record<string, UserTokenomicProfile> = {
  'commander-hash': {
    cid: 'commander-hash',
    truthPointBalance: 750,
    stakedAmount: 150,
    reputationScore: 95,
    currentTier: TruthTokenRole.COMMANDER,
    lastTierEvaluation: new Date('2025-07-19T12:00:00Z'),
    engagementHistory: {
      votesParticipated: 150,
      evidenceSubmitted: 45,
      proposalsCreated: 25,
      moderationActions: 30
    }
  },
  
  'governance-delegate-001': {
    cid: 'governance-delegate-001',
    truthPointBalance: 275,
    stakedAmount: 75,
    reputationScore: 65,
    currentTier: TruthTokenRole.GOVERNOR,
    lastTierEvaluation: new Date('2025-07-19T11:30:00Z'),
    engagementHistory: {
      votesParticipated: 80,
      evidenceSubmitted: 20,
      proposalsCreated: 12,
      moderationActions: 5
    }
  },
  
  'verified-voter-123': {
    cid: 'verified-voter-123',
    truthPointBalance: 85,
    stakedAmount: 15,
    reputationScore: 25,
    currentTier: TruthTokenRole.CONTRIBUTOR,
    lastTierEvaluation: new Date('2025-07-19T10:00:00Z'),
    engagementHistory: {
      votesParticipated: 25,
      evidenceSubmitted: 8,
      proposalsCreated: 2,
      moderationActions: 0
    }
  },
  
  'identity-verified-001': {
    cid: 'identity-verified-001',
    truthPointBalance: 15,
    reputationScore: 5,
    currentTier: TruthTokenRole.CITIZEN,
    lastTierEvaluation: new Date('2025-07-19T09:00:00Z'),
    engagementHistory: {
      votesParticipated: 3,
      evidenceSubmitted: 1,
      proposalsCreated: 0,
      moderationActions: 0
    }
  }
};

/**
 * Determines if a user can access a specific tokenomic tier based on their economic profile
 * 
 * @param cid - The user's CID digest
 * @param tokenBalance - Current Truth Points balance
 * @param repScore - Current reputation score
 * @param stakedAmount - Optional staked token amount
 * @returns boolean - True if user meets tier requirements, false otherwise
 */
export function canAccessTier(
  cid: string, 
  tokenBalance: number, 
  repScore: number, 
  stakedAmount: number = 0
): boolean {
  // Get user's current tier from mock profile or determine from CID pattern
  const userProfile = mockUserProfiles[cid];
  
  if (!userProfile) {
    // For unknown CIDs, default to CITIZEN tier validation
    const citizenTier = TruthTokenomicsTiers.find(tier => tier.tier === TruthTokenRole.CITIZEN);
    if (!citizenTier) return false;
    
    return tokenBalance >= citizenTier.requiredTruthPoints &&
           repScore >= (citizenTier.reputationRequired || 0) &&
           stakedAmount >= (citizenTier.stakingMinimum || 0);
  }
  
  // Find the tier specification for user's current tier
  const tierSpec = TruthTokenomicsTiers.find(tier => tier.tier === userProfile.currentTier);
  if (!tierSpec) return false;
  
  // Validate user meets current tier requirements
  const meetsTPRequirement = tokenBalance >= tierSpec.requiredTruthPoints;
  const meetsRepRequirement = repScore >= (tierSpec.reputationRequired || 0);
  const meetsStakingRequirement = stakedAmount >= (tierSpec.stakingMinimum || 0);
  
  return meetsTPRequirement && meetsRepRequirement && meetsStakingRequirement;
}

/**
 * Calculates the highest accessible tokenomic tier for a user
 * 
 * @param cid - The user's CID digest
 * @param tokenBalance - Current Truth Points balance
 * @param repScore - Current reputation score
 * @param stakedAmount - Optional staked token amount
 * @returns TruthTokenRole - The highest accessible tier
 */
export function calculateAccessibleTier(
  cid: string,
  tokenBalance: number,
  repScore: number,
  stakedAmount: number = 0
): TruthTokenRole {
  // Sort tiers by Truth Points requirement (highest to lowest)
  const sortedTiers = [...TruthTokenomicsTiers].sort((a, b) => b.requiredTruthPoints - a.requiredTruthPoints);
  
  // Find the highest tier the user qualifies for
  for (const tierSpec of sortedTiers) {
    const meetsTPRequirement = tokenBalance >= tierSpec.requiredTruthPoints;
    const meetsRepRequirement = repScore >= (tierSpec.reputationRequired || 0);
    const meetsStakingRequirement = stakedAmount >= (tierSpec.stakingMinimum || 0);
    
    if (meetsTPRequirement && meetsRepRequirement && meetsStakingRequirement) {
      return tierSpec.tier;
    }
  }
  
  // Default to CITIZEN if no other tier is accessible
  return TruthTokenRole.CITIZEN;
}

/**
 * Gets the CID tiers unlockable by a tokenomic tier
 * 
 * @param tokenRole - The tokenomic tier role
 * @returns CIDTier[] - Array of accessible CID tiers
 */
export function getUnlockableCIDTiers(tokenRole: TruthTokenRole): CIDTier[] {
  const tierSpec = TruthTokenomicsTiers.find(tier => tier.tier === tokenRole);
  return tierSpec?.unlockableCIDTiers || [CIDTier.TIER_0];
}

/**
 * Calculates the reward multiplier for a user's current tier
 * 
 * @param tokenRole - The user's current tokenomic tier
 * @returns number - Reward multiplier (1.0 = base rate)
 */
export function getRewardMultiplier(tokenRole: TruthTokenRole): number {
  const tierSpec = TruthTokenomicsTiers.find(tier => tier.tier === tokenRole);
  return tierSpec?.rewardMultiplier || 1.0;
}

/**
 * Gets a user's tokenomic profile
 * 
 * @param cid - The user's CID digest
 * @returns UserTokenomicProfile | null - User profile or null if not found
 */
export function getUserTokenomicProfile(cid: string): UserTokenomicProfile | null {
  return mockUserProfiles[cid] || null;
}

/**
 * Calculates Truth Points required to reach the next tier
 * 
 * @param currentTier - User's current tokenomic tier
 * @returns number - Truth Points needed for next tier (0 if already at highest tier)
 */
export function getTruthPointsToNextTier(currentTier: TruthTokenRole): number {
  const currentTierIndex = TruthTokenomicsTiers.findIndex(tier => tier.tier === currentTier);
  
  if (currentTierIndex === -1 || currentTierIndex === TruthTokenomicsTiers.length - 1) {
    return 0; // Already at highest tier or tier not found
  }
  
  const nextTier = TruthTokenomicsTiers[currentTierIndex + 1];
  const currentTierSpec = TruthTokenomicsTiers[currentTierIndex];
  
  return nextTier.requiredTruthPoints - currentTierSpec.requiredTruthPoints;
}

/**
 * Development utilities for testing and integration
 */
export const TruthTokenomicsUtils = {
  /**
   * Gets all defined tokenomic tiers
   */
  getAllTiers: (): TruthTokenRole[] => Object.values(TruthTokenRole),
  
  /**
   * Gets all tier specifications
   */
  getAllTierSpecs: (): TokenomicTierSpec[] => [...TruthTokenomicsTiers],
  
  /**
   * Gets mock user profiles for testing
   */
  getMockProfiles: (): Record<string, UserTokenomicProfile> => ({ ...mockUserProfiles }),
  
  /**
   * Adds a mock user profile for testing
   */
  addMockProfile: (cid: string, profile: UserTokenomicProfile): void => {
    mockUserProfiles[cid] = profile;
  },
  
  /**
   * Validates tier specification integrity
   */
  validateTierSpecs: (): boolean => {
    // Check that Truth Points requirements are in ascending order
    for (let i = 1; i < TruthTokenomicsTiers.length; i++) {
      if (TruthTokenomicsTiers[i].requiredTruthPoints <= TruthTokenomicsTiers[i - 1].requiredTruthPoints) {
        return false;
      }
    }
    return true;
  },
  
  /**
   * Simulates tier progression for a user
   */
  simulateTierProgression: (
    cid: string,
    truthPointsGained: number,
    reputationGained: number
  ): {
    oldTier: TruthTokenRole;
    newTier: TruthTokenRole;
    tierChanged: boolean;
  } => {
    const profile = mockUserProfiles[cid];
    if (!profile) {
      return {
        oldTier: TruthTokenRole.CITIZEN,
        newTier: TruthTokenRole.CITIZEN,
        tierChanged: false
      };
    }
    
    const oldTier = profile.currentTier;
    const newBalance = profile.truthPointBalance + truthPointsGained;
    const newReputation = profile.reputationScore + reputationGained;
    
    const newTier = calculateAccessibleTier(
      cid,
      newBalance,
      newReputation,
      profile.stakedAmount || 0
    );
    
    return {
      oldTier,
      newTier,
      tierChanged: oldTier !== newTier
    };
  }
};

/**
 * Integration interfaces for external systems
 */
export interface TokenomicsCIDIntegration {
  cid: string;
  tokenomicTier: TruthTokenRole;
  accessibleCIDTiers: CIDTier[];
  rewardMultiplier: number;
  nextTierRequirements?: {
    truthPointsNeeded: number;
    reputationNeeded: number;
    stakingNeeded: number;
  };
}

/**
 * Creates a complete tokenomics-CID integration object
 * 
 * @param cid - The user's CID digest
 * @returns TokenomicsCIDIntegration - Complete integration configuration
 */
export function createTokenomicsCIDIntegration(cid: string): TokenomicsCIDIntegration {
  const profile = getUserTokenomicProfile(cid);
  
  if (!profile) {
    // Default configuration for unknown CIDs
    return {
      cid,
      tokenomicTier: TruthTokenRole.CITIZEN,
      accessibleCIDTiers: [CIDTier.TIER_0],
      rewardMultiplier: 1.0,
      nextTierRequirements: {
        truthPointsNeeded: 50,
        reputationNeeded: 10,
        stakingNeeded: 0
      }
    };
  }
  
  const accessibleCIDTiers = getUnlockableCIDTiers(profile.currentTier);
  const rewardMultiplier = getRewardMultiplier(profile.currentTier);
  const truthPointsToNext = getTruthPointsToNextTier(profile.currentTier);
  
  // Calculate next tier requirements
  const currentTierIndex = TruthTokenomicsTiers.findIndex(tier => tier.tier === profile.currentTier);
  const nextTier = currentTierIndex < TruthTokenomicsTiers.length - 1 
    ? TruthTokenomicsTiers[currentTierIndex + 1] 
    : null;
  
  return {
    cid,
    tokenomicTier: profile.currentTier,
    accessibleCIDTiers,
    rewardMultiplier,
    nextTierRequirements: nextTier ? {
      truthPointsNeeded: Math.max(0, nextTier.requiredTruthPoints - profile.truthPointBalance),
      reputationNeeded: Math.max(0, (nextTier.reputationRequired || 0) - profile.reputationScore),
      stakingNeeded: Math.max(0, (nextTier.stakingMinimum || 0) - (profile.stakedAmount || 0))
    } : undefined
  };
}

// Export all types for external integration
export type { TokenomicTierSpec, UserTokenomicProfile, TokenomicsCIDIntegration };