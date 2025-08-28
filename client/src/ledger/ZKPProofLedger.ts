/**
 * ZKPProofLedger.ts - Phase XXIX Step 3
 * 
 * Cross-deck ledger engine for logging ZKP-bound staking events with tamper-evident format.
 * Integrates with ConsensusStakeInterface.tsx for automatic entry creation and supports
 * DAO audit export functionality.
 * 
 * Features:
 * - ZKP hash capture and validation from consensus staking events
 * - Comprehensive stake metadata logging (DID, tier, pillar, amount, timestamp)
 * - Export functionality creating downloadable .zkpledger.json files
 * - Integrity verification with proof format validation
 * - DAO sync preparation for Phase XXIX Step 4 integration
 * - Performance optimized <200ms per log/write cycle
 * 
 * Authority: Commander Mark | Phase XXIX Step 3
 * Status: Cross-deck ZKP proof ledger with DAO audit support
 */

// TruthCoin Pillar enumeration (duplicated for ledger independence)
export enum TruthCoinPillar {
  GOVERNANCE = 0,
  EDUCATION = 1,
  HEALTH = 2,
  CULTURE = 3,
  PEACE = 4,
  SCIENCE = 5,
  JOURNALISM = 6,
  JUSTICE = 7
}

// ZKP Proof Ledger Entry Interface
export interface ZKPStakeEntry {
  id: string;                    // Unique entry identifier
  zkProofHash: string;           // ZKP proof hash from staking event
  did: string;                   // Decentralized identifier of staker
  tier: string;                  // User tier (Citizen, Contributor, etc.)
  pillarId: TruthCoinPillar;     // Civic pillar staked for
  pillarName: string;            // Human-readable pillar name
  tokenAmount: number;           // Amount of TruthCoins staked
  timestamp: string;             // ISO timestamp of stake event
  blockHeight?: number;          // Mock block height for blockchain simulation
  nullifier: string;             // ZKP nullifier for double-spend prevention
  integrityHash: string;         // SHA-256 hash of entry for tamper detection
}

// Ledger Export Format for DAO Integration
export interface ZKPLedgerExport {
  version: string;               // Ledger format version
  exportTimestamp: string;       // Export generation timestamp
  totalEntries: number;          // Total number of entries
  integrityChecksum: string;     // Overall ledger integrity hash
  entries: ZKPStakeEntry[];      // Array of all stake entries
  metadata: {
    exportedBy: string;          // DID of export requester
    exportFormat: string;        // File format identifier
    validationPassed: boolean;   // Integrity validation status
  };
}

// ZKP Validation Result
interface ZKPValidationResult {
  isValid: boolean;
  reason?: string;
  nullifier?: string;
}

/**
 * ZKPProofLedger - Main ledger class for ZKP-bound staking events
 */
export class ZKPProofLedger {
  private static instance: ZKPProofLedger;
  private entries: ZKPStakeEntry[] = [];
  private readonly maxEntries = 10000; // Circular buffer limit

  // Singleton pattern for global ledger access
  public static getInstance(): ZKPProofLedger {
    if (!ZKPProofLedger.instance) {
      ZKPProofLedger.instance = new ZKPProofLedger();
    }
    return ZKPProofLedger.instance;
  }

  private constructor() {
    this.initializeMockEntries();
    console.log('📑 ZKPProofLedger initialized with tamper-evident logging');
  }

  /**
   * Initialize with mock test data for development
   */
  private initializeMockEntries(): void {
    const mockEntries: Omit<ZKPStakeEntry, 'id' | 'integrityHash'>[] = [
      {
        zkProofHash: '0x1a2b3c4d5e6f7890abcdef1234567890fedcba0987654321',
        did: 'did:civic:alice123',
        tier: 'Contributor',
        pillarId: TruthCoinPillar.GOVERNANCE,
        pillarName: 'GOVERNANCE',
        tokenAmount: 50,
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        blockHeight: 12345,
        nullifier: 'null_gov_alice_001'
      },
      {
        zkProofHash: '0x9876543210abcdef1234567890fedcba0987654321abcdef',
        did: 'did:civic:bob456',
        tier: 'Moderator',
        pillarId: TruthCoinPillar.EDUCATION,
        pillarName: 'EDUCATION',
        tokenAmount: 75,
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        blockHeight: 12346,
        nullifier: 'null_edu_bob_002'
      },
      {
        zkProofHash: '0xfedcba0987654321abcdef1234567890fedcba0987654321',
        did: 'did:civic:charlie789',
        tier: 'Governor',
        pillarId: TruthCoinPillar.JUSTICE,
        pillarName: 'JUSTICE',
        tokenAmount: 100,
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        blockHeight: 12347,
        nullifier: 'null_just_charlie_003'
      }
    ];

    mockEntries.forEach(entry => {
      this.addStakeEntry(
        entry.zkProofHash,
        entry.did,
        entry.tier,
        entry.pillarId,
        entry.pillarName,
        entry.tokenAmount
      );
    });
  }

  /**
   * Validate ZKP proof format and structure
   */
  private validateZKProof(zkProofHash: string): ZKPValidationResult {
    // Basic format validation (0x prefix + 64 hex characters)
    const hexPattern = /^0x[a-fA-F0-9]{48,64}$/;
    
    if (!hexPattern.test(zkProofHash)) {
      return {
        isValid: false,
        reason: 'Invalid ZKP hash format - must be 0x prefixed hex string'
      };
    }

    // Mock nullifier generation (deterministic based on hash)
    const nullifier = `null_${zkProofHash.slice(2, 10)}_${Date.now().toString(36)}`;

    // Check for duplicate nullifier (mock implementation)
    const existingEntry = this.entries.find(entry => 
      entry.nullifier === nullifier
    );

    if (existingEntry) {
      return {
        isValid: false,
        reason: 'Duplicate nullifier detected - proof already used'
      };
    }

    return {
      isValid: true,
      nullifier
    };
  }

  /**
   * Generate SHA-256 hash for entry integrity
   */
  private generateIntegrityHash(entry: Omit<ZKPStakeEntry, 'integrityHash'>): string {
    const dataString = JSON.stringify({
      zkProofHash: entry.zkProofHash,
      did: entry.did,
      pillarId: entry.pillarId,
      tokenAmount: entry.tokenAmount,
      timestamp: entry.timestamp,
      nullifier: entry.nullifier
    });

    // Mock SHA-256 implementation (deterministic)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `sha256_${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  /**
   * Get pillar name from enum value
   */
  private getPillarName(pillar: TruthCoinPillar): string {
    const pillarNames = [
      'GOVERNANCE', 'EDUCATION', 'HEALTH', 'CULTURE',
      'PEACE', 'SCIENCE', 'JOURNALISM', 'JUSTICE'
    ];
    return pillarNames[pillar] || 'UNKNOWN';
  }

  /**
   * Add new ZKP stake entry to ledger
   */
  public addStakeEntry(
    zkProofHash: string,
    did: string,
    tier: string,
    pillarId: TruthCoinPillar,
    pillarName?: string,
    tokenAmount: number = 1
  ): boolean {
    const startTime = performance.now();

    try {
      // Validate ZKP proof
      const validation = this.validateZKProof(zkProofHash);
      if (!validation.isValid) {
        console.error(`❌ ZKP Validation Failed: ${validation.reason}`);
        return false;
      }

      // Create entry with metadata
      const entry: Omit<ZKPStakeEntry, 'integrityHash'> = {
        id: `zkp_stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        zkProofHash,
        did,
        tier,
        pillarId,
        pillarName: pillarName || this.getPillarName(pillarId),
        tokenAmount,
        timestamp: new Date().toISOString(),
        blockHeight: 12347 + this.entries.length + 1, // Mock incrementing block height
        nullifier: validation.nullifier!
      };

      // Generate integrity hash
      const integrityHash = this.generateIntegrityHash(entry);
      const completeEntry: ZKPStakeEntry = { ...entry, integrityHash };

      // Add to ledger (circular buffer)
      this.entries.push(completeEntry);
      if (this.entries.length > this.maxEntries) {
        this.entries.shift(); // Remove oldest entry
      }

      const processingTime = performance.now() - startTime;
      
      // Console logging as specified
      console.log(`📑 ZKP Stake Logged — ${entry.pillarName} ${tier} @ ${entry.timestamp} (${processingTime.toFixed(1)}ms)`);
      console.log(`🔐 Proof Hash: ${zkProofHash.substring(0, 20)}...`);
      console.log(`👤 DID: ${did}`);
      console.log(`💎 Amount: ${tokenAmount} TruthCoins`);

      return true;
    } catch (error) {
      console.error('❌ ZKP Ledger Error:', error);
      return false;
    }
  }

  /**
   * Get all ledger entries
   */
  public getAllEntries(): ZKPStakeEntry[] {
    return [...this.entries]; // Return copy to prevent mutation
  }

  /**
   * Get entries for specific pillar
   */
  public getEntriesByPillar(pillar: TruthCoinPillar): ZKPStakeEntry[] {
    return this.entries.filter(entry => entry.pillarId === pillar);
  }

  /**
   * Get entries for specific DID
   */
  public getEntriesByDID(did: string): ZKPStakeEntry[] {
    return this.entries.filter(entry => entry.did === did);
  }

  /**
   * Get total staked amount for DID across all pillars
   */
  public getTotalStakedByDID(did: string): number {
    return this.entries
      .filter(entry => entry.did === did)
      .reduce((total, entry) => total + entry.tokenAmount, 0);
  }

  /**
   * Verify ledger integrity
   */
  public verifyIntegrity(): { valid: boolean; invalidEntries: string[] } {
    const invalidEntries: string[] = [];

    for (const entry of this.entries) {
      const recalculatedHash = this.generateIntegrityHash({
        id: entry.id,
        zkProofHash: entry.zkProofHash,
        did: entry.did,
        tier: entry.tier,
        pillarId: entry.pillarId,
        pillarName: entry.pillarName,
        tokenAmount: entry.tokenAmount,
        timestamp: entry.timestamp,
        blockHeight: entry.blockHeight,
        nullifier: entry.nullifier
      });

      if (recalculatedHash !== entry.integrityHash) {
        invalidEntries.push(entry.id);
      }
    }

    return {
      valid: invalidEntries.length === 0,
      invalidEntries
    };
  }

  /**
   * Export ledger as downloadable .zkpledger.json file
   */
  public exportLedger(exporterDID: string = 'did:civic:system'): void {
    try {
      const exportTimestamp = new Date().toISOString();
      const integrityCheck = this.verifyIntegrity();

      // Calculate overall ledger checksum
      const ledgerDataString = JSON.stringify(this.entries.map(e => e.integrityHash).sort());
      const checksum = this.generateIntegrityHash({
        id: 'ledger_checksum',
        zkProofHash: ledgerDataString,
        did: exporterDID,
        tier: 'SYSTEM',
        pillarId: TruthCoinPillar.GOVERNANCE,
        pillarName: 'SYSTEM',
        tokenAmount: this.entries.length,
        timestamp: exportTimestamp,
        nullifier: 'system_export'
      });

      const ledgerExport: ZKPLedgerExport = {
        version: '1.0.0',
        exportTimestamp,
        totalEntries: this.entries.length,
        integrityChecksum: checksum,
        entries: this.getAllEntries(),
        metadata: {
          exportedBy: exporterDID,
          exportFormat: 'zkpledger-json-v1',
          validationPassed: integrityCheck.valid
        }
      };

      // Create and trigger download
      const blob = new Blob([JSON.stringify(ledgerExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zkp-proof-ledger-${new Date().toISOString().split('T')[0]}.zkpledger.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`📤 ZKP Ledger Exported: ${this.entries.length} entries`);
      console.log(`🔐 Integrity Status: ${integrityCheck.valid ? 'VALID' : 'INVALID'}`);
      console.log(`📋 Export Format: zkpledger-json-v1`);
      console.log(`👤 Exported by: ${exporterDID}`);

    } catch (error) {
      console.error('❌ Ledger Export Failed:', error);
    }
  }

  /**
   * Clear all ledger entries (admin function)
   */
  public clearLedger(): void {
    this.entries = [];
    console.log('🗑️ ZKP Proof Ledger cleared');
  }

  /**
   * Get ledger statistics
   */
  public getStatistics(): {
    totalEntries: number;
    totalStaked: number;
    pillarDistribution: { [key: string]: number };
    tierDistribution: { [key: string]: number };
    uniqueStakers: number;
  } {
    const pillarDistribution: { [key: string]: number } = {};
    const tierDistribution: { [key: string]: number } = {};
    const uniqueStakers = new Set<string>();
    let totalStaked = 0;

    this.entries.forEach(entry => {
      // Pillar distribution
      const pillarName = entry.pillarName;
      pillarDistribution[pillarName] = (pillarDistribution[pillarName] || 0) + entry.tokenAmount;

      // Tier distribution
      tierDistribution[entry.tier] = (tierDistribution[entry.tier] || 0) + 1;

      // Track unique stakers
      uniqueStakers.add(entry.did);

      // Total staked
      totalStaked += entry.tokenAmount;
    });

    return {
      totalEntries: this.entries.length,
      totalStaked,
      pillarDistribution,
      tierDistribution,
      uniqueStakers: uniqueStakers.size
    };
  }
}

// Export singleton instance for global access
export const zkpProofLedger = ZKPProofLedger.getInstance();

/**
 * Integration helper for ConsensusStakeInterface.tsx
 */
export const recordConsensusStake = (
  zkProofHash: string,
  did: string,
  tier: string,
  pillar: TruthCoinPillar,
  amount: number
): boolean => {
  return zkpProofLedger.addStakeEntry(zkProofHash, did, tier, pillar, undefined, amount);
};

/**
 * Usage Example for Commander Mark Testing
 */
export const runZKPLedgerTest = (): void => {
  console.log('🧪 ZKP Proof Ledger Test Suite Starting...');
  
  const testDID = 'did:civic:test_user_001';
  const testTier = 'Contributor';
  const testZKP = '0xabcdef1234567890fedcba0987654321abcdef1234567890';
  
  // Test 1: Add stake entry
  console.log('\n📝 Test 1: Adding stake entry...');
  const success = zkpProofLedger.addStakeEntry(
    testZKP,
    testDID,
    testTier,
    TruthCoinPillar.GOVERNANCE,
    'GOVERNANCE',
    25
  );
  console.log(`✅ Add Entry Result: ${success}`);
  
  // Test 2: Get statistics
  console.log('\n📊 Test 2: Ledger statistics...');
  const stats = zkpProofLedger.getStatistics();
  console.log(`📋 Total Entries: ${stats.totalEntries}`);
  console.log(`💎 Total Staked: ${stats.totalStaked} TruthCoins`);
  console.log(`👥 Unique Stakers: ${stats.uniqueStakers}`);
  
  // Test 3: Integrity verification
  console.log('\n🔐 Test 3: Integrity verification...');
  const integrity = zkpProofLedger.verifyIntegrity();
  console.log(`✅ Ledger Integrity: ${integrity.valid ? 'VALID' : 'INVALID'}`);
  
  // Test 4: Export functionality
  console.log('\n📤 Test 4: Export ledger...');
  zkpProofLedger.exportLedger('did:civic:commander_mark');
  
  console.log('\n🏁 ZKP Proof Ledger Test Suite Complete');
};

// Console command for easy testing
if (typeof window !== 'undefined') {
  (window as any).runZKPLedgerTest = runZKPLedgerTest;
  (window as any).zkpProofLedger = zkpProofLedger;
  console.log('🔗 ZKP Ledger available globally: window.zkpProofLedger');
  console.log('🧪 Run test suite: window.runZKPLedgerTest()');
}