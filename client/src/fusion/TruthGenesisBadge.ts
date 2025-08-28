/**
 * TruthGenesisBadge.ts - Genesis Civic Badge System
 * 
 * Commemorative identity and privilege badge system for Truth Unveiled platform
 * Genesis Coin recipients. Provides symbolic recognition and access control
 * integration following successful fusion of all 8 civic pillar TruthCoins.
 * 
 * Authority: Commander Mark | Phase XXXII Step 2
 * Status: Civic badge module for Genesis achievement memorialization
 */

import { TruthTokenRole, getUserTokenomicProfile } from '../tokenomics/TruthTokenomicsSpec';
import { getTruthCoinsProfile, TruthCoinsProfile } from '../tokenomics/TruthCoinsIntegration';
import { CIDTier, getTierForCID } from '../access/CIDTierMap';
import { getFusionHistory, FusionEvent } from './TruthFusionEngine';

/**
 * Genesis Badge metadata structure for commemorative achievement tracking
 */
export interface GenesisBadgeMetadata {
  cid: string;
  genesisFusionTimestamp: number;
  fusionEventId: string;
  originatingVaultTier: CIDTier;
  preGenesisTruthPoints: number;
  postGenesisTruthPoints: number;
  reputationBoost: number;
  legacyHash: string;
  badgeVersion: string;
  commemorativeMessage: string;
  ariaDescription: string;
}

/**
 * Genesis Badge privilege structure for access control integration
 */
export interface GenesisPrivileges {
  commanderAccess: boolean;
  vaultTierOverride: CIDTier;
  reputationBoost: number;
  truthPointsEarned: number;
  specialAccessRoutes: string[];
  legacyTransferEligible: boolean;
  civicLeadershipRights: boolean;
  platformGovernanceRights: boolean;
}

/**
 * Genesis Badge statistics for UI display and verification
 */
export interface GenesisStats {
  fusionTimestamp: number;
  originatingCID: string;
  reputationLevel: number;
  truthPointsEarned: number;
  totalCivicAchievements: number;
  daysActive: number;
  platformContributions: {
    votesParticipated: number;
    evidenceSubmitted: number;
    proposalsCreated: number;
    moderationActions: number;
  };
  legacyImpactScore: number;
}

/**
 * Exportable Genesis Badge JSON for DAO legacy transfer
 */
export interface GenesisBadgeExport {
  metadata: GenesisBadgeMetadata;
  privileges: GenesisPrivileges;
  statistics: GenesisStats;
  verificationHash: string;
  exportTimestamp: number;
  transferEligible: boolean;
}

/**
 * Mock Genesis Badge registry for development
 */
const genesisRgistry: Record<string, GenesisBadgeMetadata> = {
  'commander-hash': {
    cid: 'commander-hash',
    genesisFusionTimestamp: 1752900000000, // July 19, 2025
    fusionEventId: 'genesis-commander-001',
    originatingVaultTier: CIDTier.TIER_3,
    preGenesisTruthPoints: 250,
    postGenesisTruthPoints: 750,
    reputationBoost: 50,
    legacyHash: 'legacy-genesis-7f3e2d1a9b8c5e4f',
    badgeVersion: '1.0.0',
    commemorativeMessage: 'Pioneer Genesis Achievement - Civic Leadership Sealed',
    ariaDescription: '🏛️ Genesis Fusion Complete — Civic Legacy Sealed'
  }
};

/**
 * Genesis Badge privilege definitions
 */
const genesisPrivilegeTemplate: GenesisPrivileges = {
  commanderAccess: true,
  vaultTierOverride: CIDTier.TIER_X,
  reputationBoost: 50,
  truthPointsEarned: 500,
  specialAccessRoutes: [
    '/platform/admin',
    '/governance/commander',
    '/audit/system-override',
    '/fusion/genesis-management',
    '/legacy/memorialization',
    '/dao/emergency-protocols'
  ],
  legacyTransferEligible: true,
  civicLeadershipRights: true,
  platformGovernanceRights: true
};

/**
 * Grants Genesis privileges following successful mintGenesis() completion
 * 
 * @param cid - User's CID digest
 * @param fusionEvent - Genesis fusion event from TruthFusionEngine
 * @returns boolean - True if privileges were successfully granted
 */
export function grantGenesisPrivileges(cid: string, fusionEvent: FusionEvent): boolean {
  // Validate Genesis fusion event
  if (fusionEvent.fusionType !== 'genesis' || !fusionEvent.success) {
    return false;
  }
  
  // Get user profiles for privilege calculation
  const userProfile = getUserTokenomicProfile(cid);
  const truthCoinsProfile = getTruthCoinsProfile(cid);
  
  if (!userProfile || !truthCoinsProfile || !truthCoinsProfile.ownsGenesis) {
    return false;
  }
  
  // Generate legacy hash for memorialization
  const legacyHash = generateLegacyHash(cid, fusionEvent.timestamp);
  
  // Create Genesis badge metadata
  const genesisBadge: GenesisBadgeMetadata = {
    cid,
    genesisFusionTimestamp: fusionEvent.timestamp,
    fusionEventId: fusionEvent.eventId,
    originatingVaultTier: getTierForCID(cid),
    preGenesisTruthPoints: userProfile.truthPointBalance - 500, // Before Genesis bonus
    postGenesisTruthPoints: userProfile.truthPointBalance,
    reputationBoost: 50,
    legacyHash,
    badgeVersion: '1.0.0',
    commemorativeMessage: `Genesis Achievement Unlocked - Civic Mastery Recognized`,
    ariaDescription: '🏛️ Genesis Fusion Complete — Civic Legacy Sealed'
  };
  
  // Register Genesis badge
  genesisRgistry[cid] = genesisBadge;
  
  // Log privilege grant for audit trail
  console.log(`🌟 Genesis Privileges Granted: ${cid} | Legacy Hash: ${legacyHash} | Timestamp: ${new Date(fusionEvent.timestamp).toISOString()}`);
  
  return true;
}

/**
 * Renders UI/ARIA-compatible badge preview for frontend display
 * 
 * @param cid - User's CID digest
 * @returns string | null - HTML badge markup or null if not Genesis owner
 */
export function renderGenesisBadge(cid: string): string | null {
  const genesisBadge = genesisRgistry[cid];
  
  if (!genesisBadge) {
    return null;
  }
  
  const fusionDate = new Date(genesisBadge.genesisFusionTimestamp).toLocaleDateString();
  
  return `
    <div class="genesis-badge" 
         role="img" 
         aria-label="${genesisBadge.ariaDescription}"
         tabindex="0">
      <div class="genesis-badge-header">
        <span class="genesis-icon">🏛️</span>
        <h3 class="genesis-title">Genesis Achievement</h3>
      </div>
      <div class="genesis-badge-content">
        <p class="genesis-message">${genesisBadge.commemorativeMessage}</p>
        <div class="genesis-details">
          <span class="genesis-date">Achieved: ${fusionDate}</span>
          <span class="genesis-version">Badge v${genesisBadge.badgeVersion}</span>
        </div>
        <div class="genesis-stats">
          <span class="truth-points">TP Earned: +${genesisBadge.postGenesisTruthPoints - genesisBadge.preGenesisTruthPoints}</span>
          <span class="reputation-boost">Rep Boost: +${genesisBadge.reputationBoost}</span>
        </div>
      </div>
      <div class="genesis-badge-footer">
        <span class="legacy-hash" title="Legacy Verification Hash">${genesisBadge.legacyHash.substring(0, 16)}...</span>
      </div>
    </div>
  `;
}

/**
 * Returns Genesis fusion statistics for UI display and verification
 * 
 * @param cid - User's CID digest
 * @returns GenesisStats | null - Statistics object or null if not Genesis owner
 */
export function getGenesisStats(cid: string): GenesisStats | null {
  const genesisBadge = genesisRgistry[cid];
  const userProfile = getUserTokenomicProfile(cid);
  const truthCoinsProfile = getTruthCoinsProfile(cid);
  
  if (!genesisBadge || !userProfile || !truthCoinsProfile) {
    return null;
  }
  
  // Calculate days active since Genesis fusion
  const daysSinceFusion = Math.floor((Date.now() - genesisBadge.genesisFusionTimestamp) / (1000 * 60 * 60 * 24));
  
  // Calculate legacy impact score based on civic contributions
  const engagementHistory = userProfile.engagementHistory || {
    votesParticipated: 0,
    evidenceSubmitted: 0,
    proposalsCreated: 0,
    moderationActions: 0
  };
  
  const legacyImpactScore = calculateLegacyImpactScore(engagementHistory);
  
  return {
    fusionTimestamp: genesisBadge.genesisFusionTimestamp,
    originatingCID: cid,
    reputationLevel: userProfile.reputationScore,
    truthPointsEarned: genesisBadge.postGenesisTruthPoints - genesisBadge.preGenesisTruthPoints,
    totalCivicAchievements: truthCoinsProfile.totalCoinsOwned,
    daysActive: daysSinceFusion,
    platformContributions: engagementHistory,
    legacyImpactScore
  };
}

/**
 * Confirms whether a CID has successfully minted the Genesis Coin
 * 
 * @param cid - User's CID digest
 * @returns boolean - True if CID owns Genesis badge
 */
export function verifyGenesisOwner(cid: string): boolean {
  // Check both Genesis badge registry and TruthCoins profile
  const genesisBadge = genesisRgistry[cid];
  const truthCoinsProfile = getTruthCoinsProfile(cid);
  
  return !!(genesisBadge && truthCoinsProfile?.ownsGenesis);
}

/**
 * Creates a ZK-compatible proof hash for memorialization across forks
 * 
 * @param cid - User's CID digest
 * @param timestamp - Genesis fusion timestamp
 * @returns string - Legacy verification hash
 */
export function generateLegacyHash(cid: string, timestamp: number): string {
  // Create deterministic hash from CID and timestamp
  // In production, this would use proper cryptographic hashing
  const hashInput = `${cid}-${timestamp}-genesis-seal`;
  
  // Mock hash generation (in production, use crypto.subtle.digest or similar)
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex and add prefix
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `legacy-genesis-${hexHash}`;
}

/**
 * Gets Genesis privileges for a user
 * 
 * @param cid - User's CID digest
 * @returns GenesisPrivileges | null - Privileges object or null if not Genesis owner
 */
export function getGenesisPrivileges(cid: string): GenesisPrivileges | null {
  if (!verifyGenesisOwner(cid)) {
    return null;
  }
  
  return { ...genesisPrivilegeTemplate };
}

/**
 * Exports Genesis Badge data for DAO legacy transfer
 * 
 * @param cid - User's CID digest
 * @returns GenesisBadgeExport | null - Export package or null if not Genesis owner
 */
export function exportGenesisBadge(cid: string): GenesisBadgeExport | null {
  const metadata = genesisRgistry[cid];
  const privileges = getGenesisPrivileges(cid);
  const statistics = getGenesisStats(cid);
  
  if (!metadata || !privileges || !statistics) {
    return null;
  }
  
  // Generate verification hash for export integrity
  const verificationHash = generateLegacyHash(cid, Date.now());
  
  return {
    metadata,
    privileges,
    statistics,
    verificationHash,
    exportTimestamp: Date.now(),
    transferEligible: privileges.legacyTransferEligible
  };
}

/**
 * Validates Genesis Badge export integrity
 * 
 * @param exportData - Genesis badge export data
 * @returns boolean - True if export is valid and transferable
 */
export function validateGenesisBadgeExport(exportData: GenesisBadgeExport): boolean {
  // Validate required fields
  if (!exportData.metadata || !exportData.privileges || !exportData.statistics) {
    return false;
  }
  
  // Validate CID consistency
  if (exportData.metadata.cid !== exportData.statistics.originatingCID) {
    return false;
  }
  
  // Validate transfer eligibility
  if (!exportData.transferEligible || !exportData.privileges.legacyTransferEligible) {
    return false;
  }
  
  // Validate badge version
  if (!exportData.metadata.badgeVersion || exportData.metadata.badgeVersion !== '1.0.0') {
    return false;
  }
  
  return true;
}

/**
 * Calculates legacy impact score based on civic engagement
 * 
 * @param engagementHistory - User's civic engagement history
 * @returns number - Legacy impact score (0-100)
 */
function calculateLegacyImpactScore(engagementHistory: {
  votesParticipated: number;
  evidenceSubmitted: number;
  proposalsCreated: number;
  moderationActions: number;
}): number {
  const weights = {
    votes: 1,
    evidence: 2,
    proposals: 5,
    moderation: 3
  };
  
  const totalScore = 
    (engagementHistory.votesParticipated * weights.votes) +
    (engagementHistory.evidenceSubmitted * weights.evidence) +
    (engagementHistory.proposalsCreated * weights.proposals) +
    (engagementHistory.moderationActions * weights.moderation);
  
  // Normalize to 0-100 scale (assuming max ~1000 total weighted points)
  return Math.min(100, Math.floor(totalScore / 10));
}

/**
 * Gets all Genesis badge holders for platform statistics
 * 
 * @returns string[] - Array of CIDs with Genesis badges
 */
export function getAllGenesisBadgeHolders(): string[] {
  return Object.keys(genesisRgistry);
}

/**
 * Gets platform-wide Genesis statistics
 * 
 * @returns Object - Global Genesis achievement statistics
 */
export function getGlobalGenesisStats() {
  const allHolders = getAllGenesisBadgeHolders();
  const totalHolders = allHolders.length;
  
  if (totalHolders === 0) {
    return {
      totalGenesisHolders: 0,
      averageLegacyScore: 0,
      totalTruthPointsAwarded: 0,
      averageDaysActive: 0,
      earliestGenesis: null,
      latestGenesis: null
    };
  }
  
  const allStats = allHolders.map(cid => getGenesisStats(cid)).filter(Boolean) as GenesisStats[];
  
  const totalTruthPoints = allStats.reduce((sum, stats) => sum + stats.truthPointsEarned, 0);
  const totalLegacyScore = allStats.reduce((sum, stats) => sum + stats.legacyImpactScore, 0);
  const totalDaysActive = allStats.reduce((sum, stats) => sum + stats.daysActive, 0);
  
  const fusionTimestamps = allStats.map(stats => stats.fusionTimestamp);
  const earliestGenesis = Math.min(...fusionTimestamps);
  const latestGenesis = Math.max(...fusionTimestamps);
  
  return {
    totalGenesisHolders: totalHolders,
    averageLegacyScore: Math.floor(totalLegacyScore / totalHolders),
    totalTruthPointsAwarded: totalTruthPoints,
    averageDaysActive: Math.floor(totalDaysActive / totalHolders),
    earliestGenesis: new Date(earliestGenesis).toISOString(),
    latestGenesis: new Date(latestGenesis).toISOString()
  };
}

/**
 * Genesis Badge development utilities
 */
export const GenesisBadgeUtils = {
  /**
   * Adds mock Genesis badge for testing
   */
  addMockGenesisBadge: (cid: string, fusionTimestamp?: number): void => {
    const timestamp = fusionTimestamp || Date.now();
    const legacyHash = generateLegacyHash(cid, timestamp);
    
    genesisRgistry[cid] = {
      cid,
      genesisFusionTimestamp: timestamp,
      fusionEventId: `genesis-mock-${timestamp}`,
      originatingVaultTier: CIDTier.TIER_3,
      preGenesisTruthPoints: 200,
      postGenesisTruthPoints: 700,
      reputationBoost: 50,
      legacyHash,
      badgeVersion: '1.0.0',
      commemorativeMessage: 'Mock Genesis Achievement - Testing Complete',
      ariaDescription: '🏛️ Genesis Fusion Complete — Civic Legacy Sealed'
    };
  },
  
  /**
   * Clears all Genesis badges for testing
   */
  clearAllGenesisBadges: (): void => {
    Object.keys(genesisRgistry).forEach(key => delete genesisRgistry[key]);
  },
  
  /**
   * Gets Genesis badge registry for inspection
   */
  getGenesisBadgeRegistry: (): Record<string, GenesisBadgeMetadata> => {
    return { ...genesisRgistry };
  },
  
  /**
   * Validates Genesis badge system configuration
   */
  validateGenesisBadgeSystem: (): boolean => {
    // Validate privilege template
    const privTemplate = genesisPrivilegeTemplate;
    return privTemplate.commanderAccess && 
           privTemplate.vaultTierOverride === CIDTier.TIER_X &&
           privTemplate.specialAccessRoutes.length > 0;
  },
  
  /**
   * Simulates Genesis badge export to JSON
   */
  simulateGenesisBadgeExport: (cid: string): string | null => {
    const exportData = exportGenesisBadge(cid);
    if (!exportData) return null;
    
    return JSON.stringify(exportData, null, 2);
  }
};

// Export all types
export type { 
  GenesisBadgeMetadata, 
  GenesisPrivileges, 
  GenesisStats, 
  GenesisBadgeExport 
};