/**
 * FusionLedgerCommit.ts
 * Phase 0-X Step 3 - Fusion Ledger Commit System
 * Authority: Commander Mark via JASMY Relay System
 */

interface FusionLedgerEntry {
  id: string;
  badgeId: string;
  did: string;
  cid: string;
  zkpHash: string;
  timestamp: string;
  pillarCount: number;
  tierLevel: string;
  guardians: string[];
  auditHash: string;
  broadcastConfirmed: boolean;
}

interface FusionLedgerMetadata {
  version: string;
  created: string;
  lastCommit: string;
  totalEntries: number;
  integrityHash: string;
}

class FusionLedgerCommit {
  private readonly STORAGE_KEY = 'truth_unveiled_fusion_ledger';
  private readonly METADATA_KEY = 'truth_unveiled_fusion_metadata';

  constructor() {
    this.initializeLedger();
    console.log('📒 FusionLedgerCommit initialized — append-only Genesis fusion ledger ready');
  }

  private initializeLedger(): void {
    const existingLedger = this.getLedger();
    if (existingLedger.length === 0) {
      // Initialize with metadata
      const metadata: FusionLedgerMetadata = {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastCommit: new Date().toISOString(),
        totalEntries: 0,
        integrityHash: this.generateIntegrityHash([])
      };
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    }
  }

  async commitFusion(fusionData: {
    badgeId: string;
    did: string;
    cid: string;
    zkpHash: string;
    pillarCount: number;
    tierLevel: string;
    guardians: string[];
  }): Promise<FusionLedgerEntry> {
    const timestamp = new Date().toISOString();
    
    // Generate unique entry ID
    const entryId = `fusion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create ledger entry
    const entry: FusionLedgerEntry = {
      id: entryId,
      badgeId: fusionData.badgeId,
      did: fusionData.did,
      cid: fusionData.cid,
      zkpHash: fusionData.zkpHash,
      timestamp,
      pillarCount: fusionData.pillarCount,
      tierLevel: fusionData.tierLevel,
      guardians: fusionData.guardians,
      auditHash: this.generateAuditHash(fusionData),
      broadcastConfirmed: false
    };

    // Append to ledger (immutable)
    const currentLedger = this.getLedger();
    const updatedLedger = [...currentLedger, entry];
    
    // Update metadata
    const metadata = this.getMetadata();
    metadata.lastCommit = timestamp;
    metadata.totalEntries = updatedLedger.length;
    metadata.integrityHash = this.generateIntegrityHash(updatedLedger);

    // Atomic commit
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLedger));
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
      
      console.log(`📝 Fusion committed to ledger — Entry ID: ${entryId}`);
      console.log(`🔐 Audit Hash: ${entry.auditHash}`);
      console.log(`👤 DID: ${entry.did}`);
      console.log(`🏷️ CID: ${entry.cid}`);
      console.log(`⚖️ Pillars: ${entry.pillarCount}/8 with ${entry.guardians.length} guardians`);

      return entry;
    } catch (error) {
      console.error('❌ Fusion ledger commit failed:', error);
      throw new Error(`Failed to commit fusion to ledger: ${error}`);
    }
  }

  confirmBroadcast(entryId: string): boolean {
    const ledger = this.getLedger();
    const entryIndex = ledger.findIndex(entry => entry.id === entryId);
    
    if (entryIndex === -1) {
      console.warn(`⚠️ Broadcast confirmation failed: Entry ${entryId} not found`);
      return false;
    }

    // Update entry to confirm broadcast
    ledger[entryIndex].broadcastConfirmed = true;
    
    // Update metadata
    const metadata = this.getMetadata();
    metadata.lastCommit = new Date().toISOString();
    metadata.integrityHash = this.generateIntegrityHash(ledger);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ledger));
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
      
      console.log(`📡 Broadcast confirmed for entry: ${entryId}`);
      return true;
    } catch (error) {
      console.error('❌ Broadcast confirmation failed:', error);
      return false;
    }
  }

  getLedger(): FusionLedgerEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('⚠️ Ledger read failed, returning empty array:', error);
      return [];
    }
  }

  getMetadata(): FusionLedgerMetadata {
    try {
      const stored = localStorage.getItem(this.METADATA_KEY);
      return stored ? JSON.parse(stored) : {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastCommit: new Date().toISOString(),
        totalEntries: 0,
        integrityHash: ''
      };
    } catch (error) {
      console.warn('⚠️ Metadata read failed:', error);
      return {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastCommit: new Date().toISOString(),
        totalEntries: 0,
        integrityHash: ''
      };
    }
  }

  exportLedgerAsJSON(): string {
    const ledger = this.getLedger();
    const metadata = this.getMetadata();
    
    const exportData = {
      metadata,
      entries: ledger,
      exported: new Date().toISOString(),
      signature: this.generateIntegrityHash(ledger)
    };
    
    console.log(`📤 Ledger exported: ${ledger.length} entries`);
    return JSON.stringify(exportData, null, 2);
  }

  verifyLedgerIntegrity(): boolean {
    const ledger = this.getLedger();
    const metadata = this.getMetadata();
    
    const currentHash = this.generateIntegrityHash(ledger);
    const isValid = currentHash === metadata.integrityHash;
    
    console.log(`🔍 Ledger integrity check: ${isValid ? 'VALID' : 'CORRUPTED'}`);
    return isValid;
  }

  private generateAuditHash(fusionData: any): string {
    // Simple content-based hash for audit purposes
    const content = `${fusionData.badgeId}-${fusionData.did}-${fusionData.cid}-${fusionData.zkpHash}`;
    return `audit_${btoa(content).substr(0, 16)}`;
  }

  private generateIntegrityHash(ledger: FusionLedgerEntry[]): string {
    // Simple integrity hash for ledger validation
    const combined = ledger.map(entry => `${entry.id}-${entry.auditHash}`).join('|');
    return `integrity_${btoa(combined).substr(0, 20)}`;
  }

  getEntryById(entryId: string): FusionLedgerEntry | null {
    const ledger = this.getLedger();
    return ledger.find(entry => entry.id === entryId) || null;
  }

  getEntriesByDID(did: string): FusionLedgerEntry[] {
    const ledger = this.getLedger();
    return ledger.filter(entry => entry.did === did);
  }

  getRecentEntries(limit: number = 10): FusionLedgerEntry[] {
    const ledger = this.getLedger();
    return ledger
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export default FusionLedgerCommit;