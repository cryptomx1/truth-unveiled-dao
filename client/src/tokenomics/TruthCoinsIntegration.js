/**
 * TruthCoinsIntegration.ts - Blockchain Integration for Truth Coins
 *
 * Integrates the TruthCoins Solidity smart contract with the Truth Unveiled
 * tokenomics system, providing blockchain-based civic engagement rewards
 * and pillar-based achievement tracking.
 *
 * Authority: Integration with TruthTokenomicsSpec.ts and CIDTierMap.ts
 * Status: Smart contract interface preparation
 */
import { TruthTokenRole } from './TruthTokenomicsSpec';
/**
 * TruthCoin Pillar enum matching the Solidity contract
 * Represents the 8 civic engagement pillars for the Truth Unveiled platform
 */
export var TruthCoinPillar;
(function (TruthCoinPillar) {
    TruthCoinPillar[TruthCoinPillar["GOVERNANCE"] = 0] = "GOVERNANCE";
    TruthCoinPillar[TruthCoinPillar["EDUCATION"] = 1] = "EDUCATION";
    TruthCoinPillar[TruthCoinPillar["HEALTH"] = 2] = "HEALTH";
    TruthCoinPillar[TruthCoinPillar["CULTURE"] = 3] = "CULTURE";
    TruthCoinPillar[TruthCoinPillar["PEACE"] = 4] = "PEACE";
    TruthCoinPillar[TruthCoinPillar["SCIENCE"] = 5] = "SCIENCE";
    TruthCoinPillar[TruthCoinPillar["JOURNALISM"] = 6] = "JOURNALISM";
    TruthCoinPillar[TruthCoinPillar["JUSTICE"] = 7] = "JUSTICE";
})(TruthCoinPillar || (TruthCoinPillar = {}));
/**
 * Maps TruthCoin pillars to corresponding civic engagement decks
 */
export const PillarToDeckMapping = {
    [TruthCoinPillar.GOVERNANCE]: ['GovernanceDeck', 'CivicGovernanceDeck', 'ConsensusLayerDeck'],
    [TruthCoinPillar.EDUCATION]: ['EducationDeck', 'CivicEducationDeck'],
    [TruthCoinPillar.HEALTH]: ['CivicWellbeingDeck'],
    [TruthCoinPillar.CULTURE]: ['CivicLegacyDeck', 'CivicMemoryDeck'],
    [TruthCoinPillar.PEACE]: ['CivicDiplomacyDeck', 'CivicAmendmentsDeck'],
    [TruthCoinPillar.SCIENCE]: ['PrivacyDeck', 'SecureAssetsDeck'],
    [TruthCoinPillar.JOURNALISM]: ['CivicAuditDeck', 'TransparencyDeck'],
    [TruthCoinPillar.JUSTICE]: ['CivicJusticeDeck', 'PolicyEnforcementDeck']
};
/**
 * Pillar achievement requirements based on civic engagement
 */
export const PillarRequirements = {
    [TruthCoinPillar.GOVERNANCE]: {
        minimumTier: TruthTokenRole.CONTRIBUTOR,
        requiredActions: ['vote_participation', 'proposal_creation'],
        minimumEngagement: 25,
        deckCompletionRequired: 2
    },
    [TruthCoinPillar.EDUCATION]: {
        minimumTier: TruthTokenRole.CITIZEN,
        requiredActions: ['curriculum_completion', 'knowledge_contribution'],
        minimumEngagement: 15,
        deckCompletionRequired: 1
    },
    [TruthCoinPillar.HEALTH]: {
        minimumTier: TruthTokenRole.CONTRIBUTOR,
        requiredActions: ['community_support', 'wellbeing_engagement'],
        minimumEngagement: 20,
        deckCompletionRequired: 1
    },
    [TruthCoinPillar.CULTURE]: {
        minimumTier: TruthTokenRole.CONTRIBUTOR,
        requiredActions: ['legacy_contribution', 'testimony_submission'],
        minimumEngagement: 15,
        deckCompletionRequired: 1
    },
    [TruthCoinPillar.PEACE]: {
        minimumTier: TruthTokenRole.MODERATOR,
        requiredActions: ['treaty_participation', 'amendment_support'],
        minimumEngagement: 30,
        deckCompletionRequired: 2
    },
    [TruthCoinPillar.SCIENCE]: {
        minimumTier: TruthTokenRole.CONTRIBUTOR,
        requiredActions: ['zkp_verification', 'privacy_management'],
        minimumEngagement: 25,
        deckCompletionRequired: 2
    },
    [TruthCoinPillar.JOURNALISM]: {
        minimumTier: TruthTokenRole.MODERATOR,
        requiredActions: ['audit_participation', 'transparency_reporting'],
        minimumEngagement: 35,
        deckCompletionRequired: 2
    },
    [TruthCoinPillar.JUSTICE]: {
        minimumTier: TruthTokenRole.GOVERNOR,
        requiredActions: ['evidence_submission', 'arbitration_participation'],
        minimumEngagement: 40,
        deckCompletionRequired: 1
    }
};
/**
 * Mock Truth Coins profiles for development
 */
const mockTruthCoinsProfiles = {
    'commander-hash': {
        cid: 'commander-hash',
        truthPointBalance: 750,
        stakedAmount: 150,
        reputationScore: 95,
        currentTier: TruthTokenRole.COMMANDER,
        lastTierEvaluation: new Date('2025-07-19T12:00:00Z'),
        walletAddress: '0x1234567890123456789012345678901234567890',
        ownedPillars: {
            governance: true,
            education: true,
            health: true,
            culture: true,
            peace: true,
            science: true,
            journalism: true,
            justice: true
        },
        ownsGenesis: true,
        totalCoinsOwned: 9,
        pillarCompletionRate: 100,
        genesisFusionEligible: false, // Already fused
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
        walletAddress: '0x2345678901234567890123456789012345678901',
        ownedPillars: {
            governance: true,
            education: true,
            health: false,
            culture: true,
            peace: true,
            science: false,
            journalism: true,
            justice: true
        },
        ownsGenesis: false,
        totalCoinsOwned: 6,
        pillarCompletionRate: 75,
        genesisFusionEligible: false,
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
        walletAddress: '0x3456789012345678901234567890123456789012',
        ownedPillars: {
            governance: true,
            education: true,
            health: true,
            culture: false,
            peace: false,
            science: false,
            journalism: false,
            justice: false
        },
        ownsGenesis: false,
        totalCoinsOwned: 3,
        pillarCompletionRate: 37.5,
        genesisFusionEligible: false,
        engagementHistory: {
            votesParticipated: 25,
            evidenceSubmitted: 8,
            proposalsCreated: 2,
            moderationActions: 0
        }
    }
};
/**
 * Checks if a user is eligible for a specific pillar coin based on their civic engagement
 *
 * @param cid - User's CID digest
 * @param pillar - The pillar to check eligibility for
 * @returns boolean - True if eligible for pillar coin minting
 */
export function isPillarEligible(cid, pillar) {
    const profile = mockTruthCoinsProfiles[cid];
    if (!profile)
        return false;
    const requirements = PillarRequirements[pillar];
    if (!requirements)
        return false;
    // Check if user already owns this pillar
    const pillarName = TruthCoinPillar[pillar].toLowerCase();
    if (profile.ownedPillars[pillarName])
        return false;
    // Check minimum tier requirement
    const tierOrder = [
        TruthTokenRole.CITIZEN,
        TruthTokenRole.CONTRIBUTOR,
        TruthTokenRole.MODERATOR,
        TruthTokenRole.GOVERNOR,
        TruthTokenRole.COMMANDER
    ];
    const userTierIndex = tierOrder.indexOf(profile.currentTier);
    const requiredTierIndex = tierOrder.indexOf(requirements.minimumTier);
    if (userTierIndex < requiredTierIndex)
        return false;
    // Check engagement history requirements
    const engagementScore = calculateEngagementScore(profile, pillar);
    return engagementScore >= requirements.minimumEngagement;
}
/**
 * Calculates civic engagement score for a specific pillar
 *
 * @param profile - User's Truth Coins profile
 * @param pillar - The pillar to calculate score for
 * @returns number - Engagement score (0-100)
 */
export function calculateEngagementScore(profile, pillar) {
    if (!profile.engagementHistory)
        return 0;
    const history = profile.engagementHistory;
    switch (pillar) {
        case TruthCoinPillar.GOVERNANCE:
            return (history.votesParticipated * 2) + (history.proposalsCreated * 5);
        case TruthCoinPillar.EDUCATION:
            return history.evidenceSubmitted * 3; // Knowledge contributions
        case TruthCoinPillar.HEALTH:
            return history.moderationActions * 4; // Community support actions
        case TruthCoinPillar.CULTURE:
            return history.evidenceSubmitted * 2; // Legacy contributions
        case TruthCoinPillar.PEACE:
            return (history.proposalsCreated * 3) + (history.moderationActions * 2);
        case TruthCoinPillar.SCIENCE:
            return history.evidenceSubmitted * 4; // Technical contributions
        case TruthCoinPillar.JOURNALISM:
            return (history.evidenceSubmitted * 3) + (history.moderationActions * 3);
        case TruthCoinPillar.JUSTICE:
            return (history.evidenceSubmitted * 4) + (history.moderationActions * 4);
        default:
            return 0;
    }
}
/**
 * Checks if a user is eligible for Genesis coin fusion
 *
 * @param cid - User's CID digest
 * @returns boolean - True if eligible for Genesis fusion
 */
export function isGenesisFusionEligible(cid) {
    const profile = mockTruthCoinsProfiles[cid];
    if (!profile || profile.ownsGenesis)
        return false;
    // Must own all 8 pillar coins
    const pillars = Object.values(profile.ownedPillars);
    return pillars.every(owned => owned === true);
}
/**
 * Gets the next achievable pillar for a user
 *
 * @param cid - User's CID digest
 * @returns TruthCoinPillar | null - Next pillar or null if none available
 */
export function getNextAchievablePillar(cid) {
    const profile = mockTruthCoinsProfiles[cid];
    if (!profile)
        return null;
    for (let pillar = 0; pillar < 8; pillar++) {
        if (isPillarEligible(cid, pillar)) {
            return pillar;
        }
    }
    return null;
}
/**
 * Calculates Truth Points bonus for pillar achievements
 *
 * @param pillar - The achieved pillar
 * @returns number - Truth Points bonus amount
 */
export function getPillarTruthPointsBonus(pillar) {
    const bonusMap = {
        [TruthCoinPillar.GOVERNANCE]: 100,
        [TruthCoinPillar.EDUCATION]: 75,
        [TruthCoinPillar.HEALTH]: 85,
        [TruthCoinPillar.CULTURE]: 70,
        [TruthCoinPillar.PEACE]: 120,
        [TruthCoinPillar.SCIENCE]: 110,
        [TruthCoinPillar.JOURNALISM]: 130,
        [TruthCoinPillar.JUSTICE]: 150
    };
    return bonusMap[pillar] || 0;
}
/**
 * Simulates pillar coin minting for development
 *
 * @param cid - User's CID digest
 * @param pillar - The pillar to mint
 * @returns boolean - True if minting was successful
 */
export function simulatePillarMinting(cid, pillar) {
    const profile = mockTruthCoinsProfiles[cid];
    if (!profile || !isPillarEligible(cid, pillar))
        return false;
    const pillarName = TruthCoinPillar[pillar].toLowerCase();
    profile.ownedPillars[pillarName] = true;
    profile.totalCoinsOwned++;
    profile.pillarCompletionRate = (profile.totalCoinsOwned / 8) * 100;
    profile.genesisFusionEligible = isGenesisFusionEligible(cid);
    // Add Truth Points bonus
    const bonus = getPillarTruthPointsBonus(pillar);
    profile.truthPointBalance += bonus;
    return true;
}
/**
 * Simulates Genesis coin fusion for development
 *
 * @param cid - User's CID digest
 * @returns boolean - True if fusion was successful
 */
export function simulateGenesisFusion(cid) {
    const profile = mockTruthCoinsProfiles[cid];
    if (!profile || !isGenesisFusionEligible(cid))
        return false;
    profile.ownsGenesis = true;
    profile.totalCoinsOwned = 9; // All 8 pillars + Genesis
    profile.genesisFusionEligible = false;
    // Genesis fusion grants massive Truth Points bonus and tier advancement
    profile.truthPointBalance += 500;
    profile.reputationScore += 50;
    // Auto-advance to Commander tier if not already
    if (profile.currentTier !== TruthTokenRole.COMMANDER) {
        profile.currentTier = TruthTokenRole.COMMANDER;
    }
    return true;
}
/**
 * Gets Truth Coins profile for a user
 *
 * @param cid - User's CID digest
 * @returns TruthCoinsProfile | null - Profile or null if not found
 */
export function getTruthCoinsProfile(cid) {
    return mockTruthCoinsProfiles[cid] || null;
}
/**
 * Gets pillar achievement progress for a user
 *
 * @param cid - User's CID digest
 * @returns Object - Pillar progress information
 */
export function getPillarProgress(cid) {
    const profile = mockTruthCoinsProfiles[cid];
    if (!profile) {
        return {
            totalPillars: 0,
            completedPillars: 0,
            completionRate: 0,
            nextPillar: null,
            genesisFusionEligible: false
        };
    }
    const completedPillars = Object.values(profile.ownedPillars).filter(owned => owned).length;
    const nextPillar = getNextAchievablePillar(cid);
    return {
        totalPillars: 8,
        completedPillars,
        completionRate: profile.pillarCompletionRate,
        nextPillar,
        genesisFusionEligible: profile.genesisFusionEligible
    };
}
/**
 * Truth Coins development utilities
 */
export const TruthCoinsUtils = {
    /**
     * Gets all pillar names
     */
    getAllPillars: () => Object.keys(TruthCoinPillar).filter(key => isNaN(Number(key))),
    /**
     * Gets pillar requirements
     */
    getPillarRequirements: (pillar) => PillarRequirements[pillar],
    /**
     * Gets deck mapping for pillar
     */
    getPillarDecks: (pillar) => PillarToDeckMapping[pillar],
    /**
     * Adds mock Truth Coins profile
     */
    addMockTruthCoinsProfile: (cid, profile) => {
        mockTruthCoinsProfiles[cid] = profile;
    },
    /**
     * Gets all mock profiles
     */
    getMockTruthCoinsProfiles: () => ({ ...mockTruthCoinsProfiles }),
    /**
     * Validates pillar completion logic
     */
    validatePillarLogic: () => {
        // Check that all pillars have valid requirements
        for (let pillar = 0; pillar < 8; pillar++) {
            const requirements = PillarRequirements[pillar];
            if (!requirements || !requirements.minimumTier)
                return false;
        }
        return true;
    }
};
