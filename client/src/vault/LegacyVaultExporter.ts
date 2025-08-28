/**
 * LegacyVaultExporter.ts
 * Phase 0-X: Genesis Fusion Loop - Archive and snapshot early civic records
 * Authority: Commander Mark via JASMY Relay System
 */

export interface CivicRecord {
  recordId: string;
  holderDID: string;
  recordType: 'vote' | 'proposal' | 'credential' | 'engagement' | 'referral';
  content: any;
  timestamp: string;
  proofHash: string;
  deckSource: string;
}

export interface VaultSnapshot {
  snapshotId: string;
  holderDID: string;
  snapshotTimestamp: string;
  totalRecords: number;
  recordTypes: Record<string, number>;
  merkleRoot: string;
  permanentCID: string;
  records: CivicRecord[];
}

export interface LegacyArchive {
  archiveId: string;
  holderDID: string;
  archiveTimestamp: string;
  totalSnapshots: number;
  totalRecords: number;
  archivePeriod: {
    startDate: string;
    endDate: string;
  };
  snapshots: VaultSnapshot[];
  archiveHash: string;
  permanentCID: string;
}

export class LegacyVaultExporter {
  private civicRecords: Map<string, CivicRecord[]> = new Map();

  constructor() {
    this.initializeMockRecords();
    console.log('📦 LegacyVaultExporter initialized - Civic record archival system ready');
  }

  /**
   * Initialize mock civic records for demonstration
   */
  private initializeMockRecords(): void {
    const mockRecords: Record<string, CivicRecord[]> = {
      'did:civic:alice123': [
        {
          recordId: 'vote_001',
          holderDID: 'did:civic:alice123',
          recordType: 'vote',
          content: { proposalId: 'prop_civic_001', vote: 'YES', weight: 1.0 },
          timestamp: '2025-07-01T10:30:00Z',
          proofHash: '0x1a2b3c4d5e6f7890',
          deckSource: 'GovernanceDeck'
        },
        {
          recordId: 'cred_001',
          holderDID: 'did:civic:alice123',
          recordType: 'credential',
          content: { credentialType: 'CivicID', issuedBy: 'TruthUnveiled', verified: true },
          timestamp: '2025-07-05T14:22:00Z',
          proofHash: '0x9876543210abcdef',
          deckSource: 'CivicIdentityDeck'
        },
        {
          recordId: 'eng_001',
          holderDID: 'did:civic:alice123',
          recordType: 'engagement',
          content: { actionType: 'streak_milestone', streakDays: 7, rewardTP: 50 },
          timestamp: '2025-07-10T09:15:00Z',
          proofHash: '0xabcdef1234567890',
          deckSource: 'CivicEngagementDeck'
        }
      ],
      'did:civic:bob456': [
        {
          recordId: 'prop_001',
          holderDID: 'did:civic:bob456',
          recordType: 'proposal',
          content: { title: 'Civic Education Initiative', category: 'EDUCATION', status: 'approved' },
          timestamp: '2025-07-03T16:45:00Z',
          proofHash: '0xfedcba0987654321',
          deckSource: 'CivicAmendmentsDeck'
        },
        {
          recordId: 'ref_001',
          holderDID: 'did:civic:bob456',
          recordType: 'referral',
          content: { referredDID: 'did:civic:charlie789', rewardTP: 25, verified: true },
          timestamp: '2025-07-08T11:30:00Z',
          proofHash: '0x1111222233334444',
          deckSource: 'WalletOverviewDeck'
        }
      ]
    };

    for (const [did, records] of Object.entries(mockRecords)) {
      this.civicRecords.set(did, records);
    }
  }

  /**
   * Get all civic records for a DID
   */
  getCivicRecords(did: string): CivicRecord[] {
    const records = this.civicRecords.get(did) || [];
    console.log(`🔍 Retrieved ${records.length} civic records for ${did}`);
    return records;
  }

  /**
   * Create a vault snapshot for a specific time period
   */
  createVaultSnapshot(did: string, startDate?: string, endDate?: string): VaultSnapshot {
    const allRecords = this.getCivicRecords(did);
    
    // Filter records by date range if provided
    let filteredRecords = allRecords;
    if (startDate || endDate) {
      filteredRecords = allRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return recordDate >= start && recordDate <= end;
      });
    }

    // Calculate record type distribution
    const recordTypes: Record<string, number> = {};
    filteredRecords.forEach(record => {
      recordTypes[record.recordType] = (recordTypes[record.recordType] || 0) + 1;
    });

    // Generate merkle root (simplified for demo)
    const merkleRoot = this.calculateMerkleRoot(filteredRecords);
    const permanentCID = `Qm${Math.random().toString(36).substr(2, 44)}`;

    const snapshot: VaultSnapshot = {
      snapshotId: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      holderDID: did,
      snapshotTimestamp: new Date().toISOString(),
      totalRecords: filteredRecords.length,
      recordTypes,
      merkleRoot,
      permanentCID,
      records: filteredRecords
    };

    console.log(`📸 Vault snapshot created: ${snapshot.snapshotId} - ${snapshot.totalRecords} records`);
    console.log(`🌳 Merkle root: ${merkleRoot}`);
    console.log(`📦 Permanent CID: ${permanentCID}`);

    return snapshot;
  }

  /**
   * Create a comprehensive legacy archive
   */
  createLegacyArchive(did: string, periodDays: number = 90): LegacyArchive {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    // Create weekly snapshots for the period
    const snapshots: VaultSnapshot[] = [];
    const weeklyIntervals = Math.ceil(periodDays / 7);

    for (let i = 0; i < weeklyIntervals; i++) {
      const weekStart = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(Math.min(
        weekStart.getTime() + (7 * 24 * 60 * 60 * 1000),
        endDate.getTime()
      ));

      const snapshot = this.createVaultSnapshot(
        did,
        weekStart.toISOString(),
        weekEnd.toISOString()
      );
      
      if (snapshot.totalRecords > 0) {
        snapshots.push(snapshot);
      }
    }

    const totalRecords = snapshots.reduce((sum, snap) => sum + snap.totalRecords, 0);
    const archiveHash = this.calculateArchiveHash(snapshots);
    const permanentCID = `Qm${Math.random().toString(36).substr(2, 44)}`;

    const archive: LegacyArchive = {
      archiveId: `arch_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      holderDID: did,
      archiveTimestamp: new Date().toISOString(),
      totalSnapshots: snapshots.length,
      totalRecords,
      archivePeriod: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      snapshots,
      archiveHash,
      permanentCID
    };

    console.log(`🗄️ Legacy archive created: ${archive.archiveId}`);
    console.log(`📊 Archive stats: ${archive.totalSnapshots} snapshots, ${archive.totalRecords} total records`);
    console.log(`🔐 Archive hash: ${archiveHash}`);
    console.log(`📦 Archive CID: ${permanentCID}`);

    return archive;
  }

  /**
   * Export vault snapshot as JSON
   */
  exportVaultSnapshot(snapshot: VaultSnapshot): string {
    const exportData = {
      ...snapshot,
      exportTimestamp: new Date().toISOString(),
      exporter: 'LegacyVaultExporter_v1.0',
      schemaVersion: '1.0.0',
      metadata: {
        exportType: 'vault_snapshot',
        compressionUsed: false,
        encryptionUsed: false
      }
    };

    console.log(`📤 Vault snapshot exported: ${snapshot.snapshotId}`);
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export legacy archive as JSON
   */
  exportLegacyArchive(archive: LegacyArchive): string {
    const exportData = {
      ...archive,
      exportTimestamp: new Date().toISOString(),
      exporter: 'LegacyVaultExporter_v1.0',
      schemaVersion: '1.0.0',
      metadata: {
        exportType: 'legacy_archive',
        compressionUsed: false,
        encryptionUsed: false,
        totalDataSize: JSON.stringify(archive.snapshots).length
      }
    };

    console.log(`📤 Legacy archive exported: ${archive.archiveId}`);
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate CID hash snapshot for IPFS permanence
   */
  generateCIDHashSnapshot(did: string): {
    holderDID: string;
    snapshotHash: string;
    recordHashes: string[];
    merkleRoot: string;
    timestamp: string;
    permanentCID: string;
  } {
    const records = this.getCivicRecords(did);
    const recordHashes = records.map(record => record.proofHash);
    const merkleRoot = this.calculateMerkleRoot(records);
    const snapshotHash = this.calculateSnapshotHash(did, recordHashes, merkleRoot);
    const permanentCID = `Qm${Math.random().toString(36).substr(2, 44)}`;

    const cidSnapshot = {
      holderDID: did,
      snapshotHash,
      recordHashes,
      merkleRoot,
      timestamp: new Date().toISOString(),
      permanentCID
    };

    console.log(`🔗 CID hash snapshot generated for ${did}`);
    console.log(`📝 Snapshot hash: ${snapshotHash}`);
    console.log(`🌳 Merkle root: ${merkleRoot}`);
    console.log(`📦 CID: ${permanentCID}`);

    return cidSnapshot;
  }

  /**
   * Validate archive integrity
   */
  validateArchiveIntegrity(archive: LegacyArchive): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate archive hash
    const expectedHash = this.calculateArchiveHash(archive.snapshots);
    if (expectedHash !== archive.archiveHash) {
      errors.push(`Archive hash mismatch: expected ${expectedHash}, got ${archive.archiveHash}`);
    }

    // Validate snapshot count
    if (archive.totalSnapshots !== archive.snapshots.length) {
      errors.push(`Snapshot count mismatch: declared ${archive.totalSnapshots}, found ${archive.snapshots.length}`);
    }

    // Validate record count
    const actualRecordCount = archive.snapshots.reduce((sum, snap) => sum + snap.totalRecords, 0);
    if (archive.totalRecords !== actualRecordCount) {
      errors.push(`Record count mismatch: declared ${archive.totalRecords}, found ${actualRecordCount}`);
    }

    // Check for temporal gaps
    const sortedSnapshots = [...archive.snapshots].sort((a, b) => 
      new Date(a.snapshotTimestamp).getTime() - new Date(b.snapshotTimestamp).getTime()
    );

    for (let i = 1; i < sortedSnapshots.length; i++) {
      const prevTime = new Date(sortedSnapshots[i - 1].snapshotTimestamp);
      const currTime = new Date(sortedSnapshots[i].snapshotTimestamp);
      const daysDiff = (currTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 14) {
        warnings.push(`Large temporal gap detected: ${daysDiff.toFixed(1)} days between snapshots`);
      }
    }

    const isValid = errors.length === 0;
    console.log(`🔍 Archive integrity validation: ${isValid ? 'PASSED' : 'FAILED'}`);
    
    if (errors.length > 0) {
      console.log(`❌ Errors found: ${errors.length}`);
    }
    if (warnings.length > 0) {
      console.log(`⚠️ Warnings found: ${warnings.length}`);
    }

    return { isValid, errors, warnings };
  }

  /**
   * Private helper methods
   */
  private calculateMerkleRoot(records: CivicRecord[]): string {
    if (records.length === 0) return '0x0000000000000000';
    
    const hashes = records.map(record => record.proofHash);
    let currentLevel = hashes;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        const combined = `${left}${right}`;
        nextLevel.push(`0x${this.simpleHash(combined)}`);
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }

  private calculateArchiveHash(snapshots: VaultSnapshot[]): string {
    const snapshotHashes = snapshots.map(snap => snap.merkleRoot).join('');
    return `0x${this.simpleHash(snapshotHashes)}`;
  }

  private calculateSnapshotHash(did: string, recordHashes: string[], merkleRoot: string): string {
    const input = `${did}:${recordHashes.join(':')}:${merkleRoot}`;
    return `0x${this.simpleHash(input)}`;
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * Get archive statistics
   */
  getArchiveStatistics(archive: LegacyArchive): {
    recordsByType: Record<string, number>;
    recordsByDeck: Record<string, number>;
    temporalDistribution: { date: string; count: number }[];
    averageRecordsPerSnapshot: number;
  } {
    const recordsByType: Record<string, number> = {};
    const recordsByDeck: Record<string, number> = {};
    const temporalDistribution: { date: string; count: number }[] = [];

    archive.snapshots.forEach(snapshot => {
      // Count by type
      Object.entries(snapshot.recordTypes).forEach(([type, count]) => {
        recordsByType[type] = (recordsByType[type] || 0) + count;
      });

      // Count by deck source
      snapshot.records.forEach(record => {
        recordsByDeck[record.deckSource] = (recordsByDeck[record.deckSource] || 0) + 1;
      });

      // Temporal distribution
      const date = snapshot.snapshotTimestamp.split('T')[0];
      const existing = temporalDistribution.find(item => item.date === date);
      if (existing) {
        existing.count += snapshot.totalRecords;
      } else {
        temporalDistribution.push({ date, count: snapshot.totalRecords });
      }
    });

    const averageRecordsPerSnapshot = archive.totalRecords / archive.totalSnapshots;

    return {
      recordsByType,
      recordsByDeck,
      temporalDistribution,
      averageRecordsPerSnapshot
    };
  }
}

// Global instance for use across components
export const legacyVaultExporter = new LegacyVaultExporter();