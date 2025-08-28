/**
 * TruthLegacyMetadata.ts - Legacy Metadata Preservation System
 * 
 * Comprehensive legacy metadata module for Truth Unveiled platform to log and
 * preserve civic fusion data, Truth Coin ownership snapshots, and vault state
 * records. Provides DAO export compatibility and ZK-compatible legacy hash
 * generation for cross-fork verification and audit trail preservation.
 * 
 * Authority: Commander Mark | Phase XXXII Step 3
 * Status: Legacy metadata preservation and export system
 */

import { TruthCoinPillar, TruthCoinsProfile, getTruthCoinsProfile } from '../tokenomics/TruthCoinsIntegration';
import { TruthTokenRole, UserTokenomicProfile, getUserTokenomicProfile } from '../tokenomics/TruthTokenomicsSpec';
import { CIDTier, getTierForCID } from '../access/CIDTierMap';
import { FusionEvent, getFusionHistory } from './TruthFusionEngine';
import { GenesisBadgeMetadata, getGenesisStats } from './TruthGenesisBadge';

/**
 * Legacy fusion details structure for comprehensive metadata recording
 */
export interface LegacyFusionDetails {
  cid: string;
  fusionEvent: FusionEvent;
  preVaultState: VaultStateSnapshot;
  postVaultState: VaultStateSnapshot;
  truthCoinSnapshot: TruthCoinOwnershipSnapshot;
  truthPointsBurnHistory: TruthPointsBurnRecord[];
  pillarAchievementTimeline: PillarAchievementRecord[];
  legacyHash: string;
  recordingTimestamp: number;
}

/**
 * Vault state snapshot at time of fusion
 */
export interface VaultStateSnapshot {
  cid: string;
  tier: CIDTier;
  truthPointBalance: number;
  reputationScore: number;
  accessibleRoutes: string[];
  engagementMetrics: {
    votesParticipated: number;
    evidenceSubmitted: number;
    proposalsCreated: number;
    moderationActions: number;
  };
  timestamp: number;
}

/**
 * Truth Coin ownership snapshot for legacy preservation
 */
export interface TruthCoinOwnershipSnapshot {
  cid: string;
  totalCoinsOwned: number;
  ownedPillars: {
    governance: boolean;
    education: boolean;
    health: boolean;
    culture: boolean;
    peace: boolean;
    science: boolean;
    journalism: boolean;
    justice: boolean;
  };
  ownsGenesis: boolean;
  lastPillarAchieved: TruthCoinPillar | null;
  lastPillarTimestamp: number | null;
  genesisTimestamp: number | null;
  snapshotTimestamp: number;
}

/**
 * Truth Points burn record for fusion cost tracking
 */
export interface TruthPointsBurnRecord {
  cid: string;
  fusionEventId: string;
  pillar: TruthCoinPillar | null; // null for Genesis
  truthPointsBurned: number;
  preBalance: number;
  postBalance: number;
  oracleMultiplierActive: boolean;
  adjustedCost: number;
  burnTimestamp: number;
  burnReason: 'pillar_fusion' | 'genesis_fusion' | 'oracle_event';
}

/**
 * Pillar achievement record for timeline tracking
 */
export interface PillarAchievementRecord {
  cid: string;
  pillar: TruthCoinPillar;
  achievementTimestamp: number;
  truthPointsEarned: number;
  sourceDecks: string[];
  engagementScore: number;
  verificationHash: string;
}

/**
 * Legacy metadata registry entry for comprehensive record keeping
 */
export interface LegacyMetadataEntry {
  cid: string;
  fusionDetails: LegacyFusionDetails;
  exportMetadata: {
    canExport: boolean;
    exportFormat: string;
    lastExportTimestamp: number | null;
    exportCount: number;
  };
  auditTrail: {
    createdTimestamp: number;
    lastModifiedTimestamp: number;
    accessHistory: string[];
    verificationAttempts: number;
  };
  legacyPreservation: {
    zkCompatibleHash: string;
    crossForkVerifiable: boolean;
    daoTransferEligible: boolean;
    preservationLevel: 'basic' | 'complete' | 'archival';
  };
}

/**
 * Exportable legacy metadata JSON for DAO compatibility
 */
export interface LegacyMetadataExport {
  metadata: LegacyMetadataEntry;
  platformContext: {
    platformVersion: string;
    exportTimestamp: number;
    truthUnveiledEpoch: number;
    blockchainCompatible: boolean;
  };
  verificationChain: {
    originHash: string;
    exportHash: string;
    chainOfCustody: string[];
    integrityVerified: boolean;
  };
  transferPackage: {
    transferEligible: boolean;
    requiredSignatures: string[];
    daoApprovalRequired: boolean;
    crossForkCompatible: boolean;
  };
}

/**
 * In-memory legacy metadata registry for development
 */
const legacyMetadataRegistry: Record<string, LegacyMetadataEntry> = {};

/**
 * Mock pillar achievement records for development
 */
const mockPillarAchievements: PillarAchievementRecord[] = [
  {
    cid: 'commander-hash',
    pillar: TruthCoinPillar.GOVERNANCE,
    achievementTimestamp: Date.now() - 2592000000, // 30 days ago
    truthPointsEarned: 150,
    sourceDecks: ['GovernanceDeck', 'CivicGovernanceDeck', 'ConsensusLayerDeck'],
    engagementScore: 95,
    verificationHash: 'verify-gov-7f3e2d1a'
  },
  {
    cid: 'commander-hash',
    pillar: TruthCoinPillar.EDUCATION,
    achievementTimestamp: Date.now() - 2419200000, // 28 days ago
    truthPointsEarned: 130,
    sourceDecks: ['EducationDeck', 'CivicEducationDeck'],
    engagementScore: 88,
    verificationHash: 'verify-edu-9b8c5e4f'
  }
];

/**
 * Mock Truth Points burn history for development
 */
const mockBurnHistory: TruthPointsBurnRecord[] = [
  {
    cid: 'commander-hash',
    fusionEventId: 'fusion-001',
    pillar: TruthCoinPillar.GOVERNANCE,
    truthPointsBurned: 5000,
    preBalance: 255000,
    postBalance: 250000,
    oracleMultiplierActive: false,
    adjustedCost: 5000,
    burnTimestamp: Date.now() - 86400000, // 24 hours ago
    burnReason: 'pillar_fusion'
  }
];

/**
 * Records comprehensive legacy fusion metadata for preservation
 * 
 * @param fusionDetails - Complete fusion details including event and snapshots
 * @returns boolean - True if metadata was successfully recorded
 */
export function recordLegacyFusion(fusionDetails: LegacyFusionDetails): boolean {
  const { cid } = fusionDetails;
  
  // Validate fusion details completeness
  if (!fusionDetails.fusionEvent || !fusionDetails.preVaultState || !fusionDetails.truthCoinSnapshot) {
    console.error(`❌ Legacy Fusion Recording Failed: Incomplete fusion details for CID ${cid}`);
    return false;
  }
  
  // Generate ZK-compatible legacy hash
  const zkHash = generateLegacyHash(fusionDetails);
  fusionDetails.legacyHash = zkHash;
  
  // Create comprehensive legacy metadata entry
  const legacyEntry: LegacyMetadataEntry = {
    cid,
    fusionDetails,
    exportMetadata: {
      canExport: true,
      exportFormat: 'legacy-metadata.json',
      lastExportTimestamp: null,
      exportCount: 0
    },
    auditTrail: {
      createdTimestamp: Date.now(),
      lastModifiedTimestamp: Date.now(),
      accessHistory: [`created-${Date.now()}`],
      verificationAttempts: 0
    },
    legacyPreservation: {
      zkCompatibleHash: zkHash,
      crossForkVerifiable: true,
      daoTransferEligible: fusionDetails.truthCoinSnapshot.ownsGenesis,
      preservationLevel: fusionDetails.truthCoinSnapshot.ownsGenesis ? 'archival' : 'complete'
    }
  };
  
  // Store in registry
  legacyMetadataRegistry[cid] = legacyEntry;
  
  // Log successful recording
  console.log(`📜 Legacy Fusion Recorded: ${cid} | Hash: ${zkHash} | Preservation: ${legacyEntry.legacyPreservation.preservationLevel}`);
  
  return true;
}

/**
 * Retrieves legacy metadata for a specific CID
 * 
 * @param cid - User's CID digest
 * @returns LegacyMetadataEntry | null - Legacy metadata or null if not found
 */
export function getLegacyMetadata(cid: string): LegacyMetadataEntry | null {
  const entry = legacyMetadataRegistry[cid];
  
  if (!entry) {
    return null;
  }
  
  // Update access history
  entry.auditTrail.accessHistory.push(`accessed-${Date.now()}`);
  entry.auditTrail.lastModifiedTimestamp = Date.now();
  
  return { ...entry }; // Return copy to prevent modification
}

/**
 * Exports legacy metadata in DAO-compatible JSON format
 * 
 * @param cid - User's CID digest
 * @returns LegacyMetadataExport | null - Export package or null if not exportable
 */
export function exportLegacyMetadata(cid: string): LegacyMetadataExport | null {
  const legacyEntry = legacyMetadataRegistry[cid];
  
  if (!legacyEntry || !legacyEntry.exportMetadata.canExport) {
    return null;
  }
  
  // Generate export hash for verification chain
  const exportHash = generateExportHash(legacyEntry);
  
  // Create verification chain
  const verificationChain = {
    originHash: legacyEntry.legacyPreservation.zkCompatibleHash,
    exportHash,
    chainOfCustody: [
      `origin-${legacyEntry.auditTrail.createdTimestamp}`,
      `export-${Date.now()}`
    ],
    integrityVerified: true
  };
  
  // Determine transfer eligibility
  const transferPackage = {
    transferEligible: legacyEntry.legacyPreservation.daoTransferEligible,
    requiredSignatures: legacyEntry.legacyPreservation.daoTransferEligible ? ['commander', 'dao-council'] : ['user'],
    daoApprovalRequired: legacyEntry.legacyPreservation.preservationLevel === 'archival',
    crossForkCompatible: legacyEntry.legacyPreservation.crossForkVerifiable
  };
  
  // Create export package
  const exportPackage: LegacyMetadataExport = {
    metadata: { ...legacyEntry },
    platformContext: {
      platformVersion: '1.0.0',
      exportTimestamp: Date.now(),
      truthUnveiledEpoch: 1,
      blockchainCompatible: true
    },
    verificationChain,
    transferPackage
  };
  
  // Update export metadata
  legacyEntry.exportMetadata.lastExportTimestamp = Date.now();
  legacyEntry.exportMetadata.exportCount += 1;
  legacyEntry.auditTrail.lastModifiedTimestamp = Date.now();
  legacyEntry.auditTrail.accessHistory.push(`exported-${Date.now()}`);
  
  console.log(`📦 Legacy Export Generated: ${cid} | Export Count: ${legacyEntry.exportMetadata.exportCount} | Hash: ${exportHash}`);
  
  return exportPackage;
}

/**
 * Generates ZK-compatible legacy hash for cross-fork verification
 * 
 * @param fusionDetails - Fusion details for hash generation
 * @returns string - Deterministic legacy hash
 */
export function generateLegacyHash(fusionDetails: LegacyFusionDetails): string {
  const hashComponents = [
    fusionDetails.cid,
    fusionDetails.fusionEvent.timestamp,
    fusionDetails.fusionEvent.fusionType,
    fusionDetails.truthCoinSnapshot.totalCoinsOwned,
    fusionDetails.preVaultState.tier,
    fusionDetails.recordingTimestamp
  ];
  
  // Create deterministic hash from components
  const hashInput = hashComponents.join('-');
  
  // Mock hash generation (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex and add prefix
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `legacy-zk-${hexHash}`;
}

/**
 * Creates vault state snapshot for legacy preservation
 * 
 * @param cid - User's CID digest
 * @returns VaultStateSnapshot - Current vault state
 */
export function createVaultStateSnapshot(cid: string): VaultStateSnapshot {
  const userProfile = getUserTokenomicProfile(cid);
  const userTier = getTierForCID(cid);
  
  if (!userProfile) {
    throw new Error(`Cannot create vault snapshot: Invalid user profile for CID ${cid}`);
  }
  
  return {
    cid,
    tier: userTier,
    truthPointBalance: userProfile.truthPointBalance,
    reputationScore: userProfile.reputationScore,
    accessibleRoutes: getAccessibleRoutesForTier(userTier),
    engagementMetrics: userProfile.engagementHistory || {
      votesParticipated: 0,
      evidenceSubmitted: 0,
      proposalsCreated: 0,
      moderationActions: 0
    },
    timestamp: Date.now()
  };
}

/**
 * Creates Truth Coin ownership snapshot for legacy preservation
 * 
 * @param cid - User's CID digest
 * @returns TruthCoinOwnershipSnapshot - Current ownership state
 */
export function createTruthCoinSnapshot(cid: string): TruthCoinOwnershipSnapshot {
  const truthCoinsProfile = getTruthCoinsProfile(cid);
  
  if (!truthCoinsProfile) {
    throw new Error(`Cannot create Truth Coin snapshot: Invalid profile for CID ${cid}`);
  }
  
  // Find last pillar achieved
  const achievementHistory = getPillarAchievementHistory(cid);
  const lastAchievement = achievementHistory.length > 0 ? 
    achievementHistory[achievementHistory.length - 1] : null;
  
  return {
    cid,
    totalCoinsOwned: truthCoinsProfile.totalCoinsOwned,
    ownedPillars: { ...truthCoinsProfile.ownedPillars },
    ownsGenesis: truthCoinsProfile.ownsGenesis,
    lastPillarAchieved: lastAchievement?.pillar || null,
    lastPillarTimestamp: lastAchievement?.achievementTimestamp || null,
    genesisTimestamp: truthCoinsProfile.ownsGenesis ? Date.now() : null,
    snapshotTimestamp: Date.now()
  };
}

/**
 * Records Truth Points burn for fusion cost tracking
 * 
 * @param burnRecord - Truth Points burn record
 */
export function recordTruthPointsBurn(burnRecord: TruthPointsBurnRecord): void {
  mockBurnHistory.push(burnRecord);
  
  console.log(`🔥 Truth Points Burned: ${burnRecord.cid} | Amount: ${burnRecord.truthPointsBurned} TP | Reason: ${burnRecord.burnReason}`);
}

/**
 * Gets Truth Points burn history for a user
 * 
 * @param cid - User's CID digest
 * @returns TruthPointsBurnRecord[] - Array of burn records
 */
export function getTruthPointsBurnHistory(cid: string): TruthPointsBurnRecord[] {
  return mockBurnHistory.filter(record => record.cid === cid);
}

/**
 * Gets pillar achievement history for a user
 * 
 * @param cid - User's CID digest
 * @returns PillarAchievementRecord[] - Array of achievement records
 */
export function getPillarAchievementHistory(cid: string): PillarAchievementRecord[] {
  return mockPillarAchievements.filter(record => record.cid === cid);
}

/**
 * Generates export hash for verification chain
 * 
 * @param legacyEntry - Legacy metadata entry
 * @returns string - Export verification hash
 */
function generateExportHash(legacyEntry: LegacyMetadataEntry): string {
  const exportComponents = [
    legacyEntry.cid,
    legacyEntry.legacyPreservation.zkCompatibleHash,
    Date.now(),
    legacyEntry.exportMetadata.exportCount + 1
  ];
  
  const hashInput = exportComponents.join('-');
  
  // Mock hash generation
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `export-${hexHash}`;
}

/**
 * Gets accessible routes for a vault tier
 * 
 * @param tier - Vault tier
 * @returns string[] - Array of accessible route patterns
 */
function getAccessibleRoutesForTier(tier: CIDTier): string[] {
  const routeMap: Record<CIDTier, string[]> = {
    [CIDTier.TIER_0]: ['/civic/basic'],
    [CIDTier.TIER_1]: ['/civic/basic', '/governance/participate'],
    [CIDTier.TIER_2]: ['/civic/basic', '/governance/participate', '/audit/view'],
    [CIDTier.TIER_3]: ['/civic/basic', '/governance/participate', '/audit/view', '/governance/admin'],
    [CIDTier.TIER_X]: ['/platform/admin', '/governance/commander', '/audit/system-override']
  };
  
  return routeMap[tier] || [];
}

/**
 * Gets all legacy metadata entries for platform statistics
 * 
 * @returns LegacyMetadataEntry[] - Array of all legacy entries
 */
export function getAllLegacyMetadata(): LegacyMetadataEntry[] {
  return Object.values(legacyMetadataRegistry);
}

/**
 * Gets global legacy preservation statistics
 * 
 * @returns Object - Global legacy statistics
 */
export function getGlobalLegacyStats() {
  const allEntries = getAllLegacyMetadata();
  const totalEntries = allEntries.length;
  
  if (totalEntries === 0) {
    return {
      totalLegacyRecords: 0,
      genesisRecords: 0,
      pillarRecords: 0,
      totalExports: 0,
      averageExportsPerRecord: 0,
      crossForkCompatible: 0,
      daoTransferEligible: 0,
      preservationLevels: { basic: 0, complete: 0, archival: 0 }
    };
  }
  
  const genesisRecords = allEntries.filter(entry => 
    entry.fusionDetails.truthCoinSnapshot.ownsGenesis
  ).length;
  
  const totalExports = allEntries.reduce((sum, entry) => 
    sum + entry.exportMetadata.exportCount, 0
  );
  
  const crossForkCompatible = allEntries.filter(entry => 
    entry.legacyPreservation.crossForkVerifiable
  ).length;
  
  const daoTransferEligible = allEntries.filter(entry => 
    entry.legacyPreservation.daoTransferEligible
  ).length;
  
  const preservationLevels = allEntries.reduce((counts, entry) => {
    counts[entry.legacyPreservation.preservationLevel]++;
    return counts;
  }, { basic: 0, complete: 0, archival: 0 });
  
  return {
    totalLegacyRecords: totalEntries,
    genesisRecords,
    pillarRecords: totalEntries - genesisRecords,
    totalExports,
    averageExportsPerRecord: Math.floor(totalExports / totalEntries),
    crossForkCompatible,
    daoTransferEligible,
    preservationLevels
  };
}

/**
 * Validates legacy metadata integrity
 * 
 * @param cid - User's CID digest
 * @returns boolean - True if legacy metadata is valid and complete
 */
export function validateLegacyMetadata(cid: string): boolean {
  const entry = legacyMetadataRegistry[cid];
  
  if (!entry) {
    return false;
  }
  
  // Validate required fields
  if (!entry.fusionDetails || !entry.legacyPreservation || !entry.auditTrail) {
    return false;
  }
  
  // Validate fusion details completeness
  const fusion = entry.fusionDetails;
  if (!fusion.fusionEvent || !fusion.preVaultState || !fusion.truthCoinSnapshot) {
    return false;
  }
  
  // Validate hash integrity
  const expectedHash = generateLegacyHash(fusion);
  if (entry.legacyPreservation.zkCompatibleHash !== expectedHash) {
    return false;
  }
  
  // Update verification attempts
  entry.auditTrail.verificationAttempts++;
  entry.auditTrail.lastModifiedTimestamp = Date.now();
  
  return true;
}

/**
 * Legacy metadata development utilities
 */
export const LegacyMetadataUtils = {
  /**
   * Creates mock legacy metadata for testing
   */
  createMockLegacyMetadata: (cid: string): void => {
    const mockFusionEvent: FusionEvent = {
      eventId: `mock-fusion-${Date.now()}`,
      cid,
      fusionType: 'pillar',
      pillar: TruthCoinPillar.GOVERNANCE,
      truthPointsCost: 5000,
      multiplierActive: false,
      timestamp: Date.now(),
      success: true
    };
    
    const preVaultState = createVaultStateSnapshot(cid);
    const truthCoinSnapshot = createTruthCoinSnapshot(cid);
    
    const mockDetails: LegacyFusionDetails = {
      cid,
      fusionEvent: mockFusionEvent,
      preVaultState,
      postVaultState: { ...preVaultState, truthPointBalance: preVaultState.truthPointBalance - 5000 },
      truthCoinSnapshot,
      truthPointsBurnHistory: getTruthPointsBurnHistory(cid),
      pillarAchievementTimeline: getPillarAchievementHistory(cid),
      legacyHash: '',
      recordingTimestamp: Date.now()
    };
    
    recordLegacyFusion(mockDetails);
  },
  
  /**
   * Clears all legacy metadata for testing
   */
  clearAllLegacyMetadata: (): void => {
    Object.keys(legacyMetadataRegistry).forEach(key => delete legacyMetadataRegistry[key]);
  },
  
  /**
   * Gets legacy metadata registry for inspection
   */
  getLegacyMetadataRegistry: (): Record<string, LegacyMetadataEntry> => {
    return { ...legacyMetadataRegistry };
  },
  
  /**
   * Validates legacy metadata system configuration
   */
  validateLegacySystem: (): boolean => {
    // Validate mock data consistency
    return mockPillarAchievements.length > 0 && mockBurnHistory.length > 0;
  },
  
  /**
   * Simulates legacy metadata export to JSON
   */
  simulateLegacyExport: (cid: string): string | null => {
    const exportData = exportLegacyMetadata(cid);
    if (!exportData) return null;
    
    return JSON.stringify(exportData, null, 2);
  }
};

// Export all types and utilities
export type {
  LegacyFusionDetails,
  VaultStateSnapshot,
  TruthCoinOwnershipSnapshot,
  TruthPointsBurnRecord,
  PillarAchievementRecord,
  LegacyMetadataEntry,
  LegacyMetadataExport
};
export { LegacyMetadataUtils };