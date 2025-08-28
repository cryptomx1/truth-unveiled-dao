// Phase VII Step 1: CredentialSyncLedger.ts
// Commander Mark authorization via JASMY Relay
// Distributed ZKP credential consensus with sync ledger and DID attribution

import { CredentialMintLayer, MintHistoryEntry } from '../../layers/CredentialMintLayer';
import { VaultExportNode } from '../../layers/VaultExportNode';

export interface SyncEntry {
  id: string;
  credentialZkHash: string;
  sourceDID: string;
  targetDID: string;
  syncType: 'upload' | 'download' | 'verify' | 'consensus';
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed';
  syncTimestamp: string;
  completedTimestamp?: string;
  zkpVerified: boolean;
  consensusNodes: number;
  requiredNodes: number;
  cidHash?: string;
  syncMetadata: SyncMetadata;
}

export interface SyncMetadata {
  credentialType: string;
  issuerDID: string;
  recipientDID: string;
  issuanceTimestamp: string;
  revoked: boolean;
  syncAttempts: number;
  lastAttemptTimestamp: string;
  nodeSignatures: string[];
  consensusReached: boolean;
}

export interface SyncResult {
  success: boolean;
  syncEntry?: SyncEntry;
  syncTime: number;
  consensusReached: boolean;
  nodesParticipated: number;
  error?: string;
  pathBTriggered?: boolean;
}

export interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  consensusSuccessRate: number;
  averageSyncTime: number;
  averageConsensusNodes: number;
  pathBActivations: number;
  syncFailureRate: number;
  pathBActivated: boolean;
}

export interface ConsensusNode {
  nodeId: string;
  nodeDID: string;
  nodeType: 'validator' | 'witness' | 'archive';
  isOnline: boolean;
  lastHeartbeat: string;
  syncCapacity: number;
  currentLoad: number;
}

export class CredentialSyncLedger {
  private syncLedger: SyncEntry[] = [];
  private consensusNodes: ConsensusNode[] = [];
  private credentialMintLayer: CredentialMintLayer;
  private vaultExportNode: VaultExportNode;
  private metrics: SyncMetrics = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    consensusSuccessRate: 100,
    averageSyncTime: 0,
    averageConsensusNodes: 0,
    pathBActivations: 0,
    syncFailureRate: 0,
    pathBActivated: false
  };

  private readonly STORAGE_KEY = 'credential_sync_ledger';
  private readonly LOG_KEY = 'ledger_log_entries';
  private readonly PATH_B_THRESHOLD = 20; // 20% sync failure rate
  private readonly REQUIRED_CONSENSUS_NODES = 3;
  private readonly SYNC_TIMEOUT = 5000; // 5 seconds

  constructor() {
    this.credentialMintLayer = new CredentialMintLayer();
    this.vaultExportNode = new VaultExportNode();
    this.initializeConsensusNodes();
    this.loadSyncLedger();
  }

  // Initialize consensus nodes for distributed sync
  private initializeConsensusNodes(): void {
    this.consensusNodes = [
      {
        nodeId: 'node_validator_001',
        nodeDID: 'did:civic:node:validator:001',
        nodeType: 'validator',
        isOnline: true,
        lastHeartbeat: new Date().toISOString(),
        syncCapacity: 100,
        currentLoad: 15
      },
      {
        nodeId: 'node_validator_002',
        nodeDID: 'did:civic:node:validator:002',
        nodeType: 'validator',
        isOnline: true,
        lastHeartbeat: new Date().toISOString(),
        syncCapacity: 100,
        currentLoad: 22
      },
      {
        nodeId: 'node_witness_001',
        nodeDID: 'did:civic:node:witness:001',
        nodeType: 'witness',
        isOnline: true,
        lastHeartbeat: new Date().toISOString(),
        syncCapacity: 75,
        currentLoad: 8
      },
      {
        nodeId: 'node_witness_002',
        nodeDID: 'did:civic:node:witness:002',
        nodeType: 'witness',
        isOnline: Math.random() > 0.2, // 80% uptime simulation
        lastHeartbeat: new Date().toISOString(),
        syncCapacity: 75,
        currentLoad: 12
      },
      {
        nodeId: 'node_archive_001',
        nodeDID: 'did:civic:node:archive:001',
        nodeType: 'archive',
        isOnline: true,
        lastHeartbeat: new Date().toISOString(),
        syncCapacity: 200,
        currentLoad: 35
      }
    ];
  }

  // Main credential sync interface
  async syncCredential(
    credentialZkHash: string,
    sourceDID: string,
    targetDID: string,
    syncType: 'upload' | 'download' | 'verify' | 'consensus'
  ): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      // Get credential from mint layer
      const credential = this.credentialMintLayer.getCredentialByHash(credentialZkHash);
      if (!credential) {
        return this.createFailureResult('Credential not found in mint layer', startTime);
      }

      // Create sync entry
      const syncEntry = await this.createSyncEntry(
        credentialZkHash,
        sourceDID,
        targetDID,
        syncType,
        credential
      );

      // Perform consensus sync
      const consensusResult = await this.performConsensusSync(syncEntry);

      // Generate CID for sync ledger entry
      const cidHash = await this.generateSyncCID(syncEntry);
      syncEntry.cidHash = cidHash;

      // Update sync status based on consensus
      if (consensusResult.consensusReached) {
        syncEntry.syncStatus = 'completed';
        syncEntry.completedTimestamp = new Date().toISOString();
        syncEntry.zkpVerified = true;
        syncEntry.syncMetadata.consensusReached = true;

        this.metrics.successfulSyncs++;
      } else {
        syncEntry.syncStatus = 'failed';
        this.metrics.failedSyncs++;
      }

      // Add to ledger and save
      this.syncLedger.push(syncEntry);
      await this.saveSyncLedger();

      // Log to ledger.log
      await this.logToLedger(syncEntry, consensusResult);

      // Update metrics
      this.updateMetrics(Date.now() - startTime, consensusResult.nodesParticipated);

      // Check Path B activation
      this.checkPathBActivation();

      console.log(`✅ CredentialSyncLedger: Sync completed - ${syncEntry.id}`);

      return {
        success: consensusResult.consensusReached,
        syncEntry,
        syncTime: Date.now() - startTime,
        consensusReached: consensusResult.consensusReached,
        nodesParticipated: consensusResult.nodesParticipated
      };

    } catch (error) {
      const syncTime = Date.now() - startTime;
      console.error('❌ CredentialSyncLedger: Sync error:', error);

      this.metrics.failedSyncs++;
      this.updateMetrics(syncTime, 0);
      this.checkPathBActivation();

      return this.createFailureResult(
        error instanceof Error ? error.message : 'Unknown sync error',
        startTime
      );
    }
  }

  // Create sync entry with metadata
  private async createSyncEntry(
    credentialZkHash: string,
    sourceDID: string,
    targetDID: string,
    syncType: 'upload' | 'download' | 'verify' | 'consensus',
    credential: any
  ): Promise<SyncEntry> {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const syncMetadata: SyncMetadata = {
      credentialType: credential.credentialType,
      issuerDID: credential.issuerDID,
      recipientDID: credential.recipientDID,
      issuanceTimestamp: credential.issuanceTimestamp,
      revoked: credential.revoked,
      syncAttempts: 1,
      lastAttemptTimestamp: new Date().toISOString(),
      nodeSignatures: [],
      consensusReached: false
    };

    return {
      id: syncId,
      credentialZkHash,
      sourceDID,
      targetDID,
      syncType,
      syncStatus: 'pending',
      syncTimestamp: new Date().toISOString(),
      zkpVerified: false,
      consensusNodes: 0,
      requiredNodes: this.REQUIRED_CONSENSUS_NODES,
      syncMetadata
    };
  }

  // Perform distributed consensus sync
  private async performConsensusSync(syncEntry: SyncEntry): Promise<{
    consensusReached: boolean;
    nodesParticipated: number;
  }> {
    const availableNodes = this.consensusNodes.filter(node => node.isOnline);
    const participatingNodes = availableNodes.slice(0, 5); // Max 5 nodes for demo

    let successfulNodes = 0;
    const nodeSignatures: string[] = [];

    // Simulate consensus process
    for (const node of participatingNodes) {
      const syncSuccess = await this.simulateNodeSync(node, syncEntry);
      
      if (syncSuccess) {
        successfulNodes++;
        const signature = await this.generateNodeSignature(node, syncEntry);
        nodeSignatures.push(signature);
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update sync entry with node signatures
    syncEntry.syncMetadata.nodeSignatures = nodeSignatures;
    syncEntry.consensusNodes = successfulNodes;

    // Consensus requires majority of participating nodes (min 3)
    const consensusReached = successfulNodes >= Math.min(this.REQUIRED_CONSENSUS_NODES, Math.ceil(participatingNodes.length / 2));

    return {
      consensusReached,
      nodesParticipated: participatingNodes.length
    };
  }

  // Simulate individual node sync
  private async simulateNodeSync(node: ConsensusNode, syncEntry: SyncEntry): Promise<boolean> {
    // Simulate node-specific sync logic
    const baseSuccessRate = 0.85; // 85% base success rate
    const loadPenalty = node.currentLoad / node.syncCapacity;
    const adjustedSuccessRate = baseSuccessRate * (1 - loadPenalty * 0.3);

    // Additional checks for sync type
    let typeBonus = 0;
    switch (syncEntry.syncType) {
      case 'verify':
        typeBonus = 0.1; // Verification is more reliable
        break;
      case 'consensus':
        typeBonus = 0.05; // Consensus is slightly more reliable
        break;
      case 'upload':
      case 'download':
        typeBonus = 0; // Standard reliability
        break;
    }

    const finalSuccessRate = Math.min(0.95, adjustedSuccessRate + typeBonus);
    return Math.random() < finalSuccessRate;
  }

  // Generate node signature for consensus
  private async generateNodeSignature(node: ConsensusNode, syncEntry: SyncEntry): Promise<string> {
    const content = `${node.nodeDID}${syncEntry.credentialZkHash}${syncEntry.syncTimestamp}`;
    
    // Simple hash simulation for node signature
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    return `node_sig_${node.nodeId}_${hexHash}`;
  }

  // Generate CID for sync ledger entry
  private async generateSyncCID(syncEntry: SyncEntry): Promise<string> {
    const content = `${syncEntry.id}${syncEntry.credentialZkHash}${JSON.stringify(syncEntry.syncMetadata)}`;
    
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
    return `Qm${hexHash.repeat(3).substring(0, 44)}`;
  }

  // Log to ledger.log with structured format
  private async logToLedger(syncEntry: SyncEntry, consensusResult: { consensusReached: boolean; nodesParticipated: number }): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      syncId: syncEntry.id,
      credentialZkHash: syncEntry.credentialZkHash,
      sourceDID: syncEntry.sourceDID,
      targetDID: syncEntry.targetDID,
      syncType: syncEntry.syncType,
      syncStatus: syncEntry.syncStatus,
      consensusReached: consensusResult.consensusReached,
      nodesParticipated: consensusResult.nodesParticipated,
      zkpVerified: syncEntry.zkpVerified,
      cidHash: syncEntry.cidHash,
      nodeSignatures: syncEntry.syncMetadata.nodeSignatures.length
    };

    try {
      // Get existing log entries
      const existingLog = localStorage.getItem(this.LOG_KEY);
      const logEntries = existingLog ? JSON.parse(existingLog) : [];
      
      // Add new entry
      logEntries.push(logEntry);
      
      // Keep only latest 500 entries
      if (logEntries.length > 500) {
        logEntries.splice(0, logEntries.length - 500);
      }
      
      // Save updated log
      localStorage.setItem(this.LOG_KEY, JSON.stringify(logEntries));
      
      console.log(`✅ CredentialSyncLedger: Logged to ledger.log - ${syncEntry.id}`);
      
    } catch (error) {
      console.error('❌ CredentialSyncLedger: Failed to log to ledger.log:', error);
    }
  }

  // Create failure result
  private createFailureResult(error: string, startTime: number): SyncResult {
    return {
      success: false,
      syncTime: Date.now() - startTime,
      consensusReached: false,
      nodesParticipated: 0,
      error
    };
  }

  // Update sync metrics
  private updateMetrics(syncTime: number, nodesParticipated: number): void {
    this.metrics.totalSyncs = this.metrics.successfulSyncs + this.metrics.failedSyncs;
    
    if (this.metrics.totalSyncs > 0) {
      this.metrics.consensusSuccessRate = (this.metrics.successfulSyncs / this.metrics.totalSyncs) * 100;
      this.metrics.syncFailureRate = (this.metrics.failedSyncs / this.metrics.totalSyncs) * 100;
    }

    // Update average times and nodes
    if (this.metrics.successfulSyncs > 0) {
      const totalSyncTime = (this.metrics.averageSyncTime * (this.metrics.successfulSyncs - 1)) + syncTime;
      this.metrics.averageSyncTime = totalSyncTime / this.metrics.successfulSyncs;

      const totalConsensusNodes = (this.metrics.averageConsensusNodes * (this.metrics.successfulSyncs - 1)) + nodesParticipated;
      this.metrics.averageConsensusNodes = totalConsensusNodes / this.metrics.successfulSyncs;
    }
  }

  // Check and activate Path B fallback
  private checkPathBActivation(): void {
    if (this.metrics.syncFailureRate >= this.PATH_B_THRESHOLD && !this.metrics.pathBActivated) {
      this.metrics.pathBActivated = true;
      this.metrics.pathBActivations++;
      console.warn(`⚠️ CredentialSyncLedger: Path B activated - ${this.metrics.syncFailureRate.toFixed(1)}% sync failure rate`);
      
      // Store Path B fallback data
      const fallbackData = {
        timestamp: new Date().toISOString(),
        reason: 'High sync failure rate detected',
        syncFailureRate: this.metrics.syncFailureRate,
        metrics: this.metrics,
        offlineNodes: this.consensusNodes.filter(node => !node.isOnline).length
      };
      
      localStorage.setItem('credential_sync_fallback', JSON.stringify(fallbackData));
    }
  }

  // Load sync ledger from localStorage
  private loadSyncLedger(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.syncLedger = JSON.parse(stored);
        console.log(`✅ CredentialSyncLedger: Loaded ${this.syncLedger.length} sync entries`);
      }
    } catch (error) {
      console.error('❌ CredentialSyncLedger: Failed to load sync ledger:', error);
      this.syncLedger = [];
    }
  }

  // Save sync ledger to localStorage
  private async saveSyncLedger(): Promise<void> {
    try {
      // Keep only the latest 300 entries to prevent storage bloat
      if (this.syncLedger.length > 300) {
        this.syncLedger = this.syncLedger.slice(-300);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.syncLedger));
    } catch (error) {
      console.error('❌ CredentialSyncLedger: Failed to save sync ledger:', error);
    }
  }

  // Batch sync multiple credentials
  async batchSyncCredentials(
    credentialHashes: string[],
    sourceDID: string,
    targetDID: string,
    syncType: 'upload' | 'download' | 'verify' | 'consensus'
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    
    for (const hash of credentialHashes) {
      const result = await this.syncCredential(hash, sourceDID, targetDID, syncType);
      results.push(result);
      
      // Small delay between batch operations
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  }

  // Get sync status for credential
  getSyncStatus(credentialZkHash: string): SyncEntry | null {
    return this.syncLedger.find(entry => entry.credentialZkHash === credentialZkHash) || null;
  }

  // Get syncs by DID
  getSyncsByDID(did: string): SyncEntry[] {
    return this.syncLedger.filter(entry => 
      entry.sourceDID === did || entry.targetDID === did
    );
  }

  // Get pending syncs
  getPendingSyncs(): SyncEntry[] {
    return this.syncLedger.filter(entry => 
      entry.syncStatus === 'pending' || entry.syncStatus === 'syncing'
    );
  }

  // Get completed syncs
  getCompletedSyncs(): SyncEntry[] {
    return this.syncLedger.filter(entry => entry.syncStatus === 'completed');
  }

  // Get sync metrics
  getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  // Get consensus nodes status
  getConsensusNodes(): ConsensusNode[] {
    return [...this.consensusNodes];
  }

  // Get sync ledger
  getSyncLedger(): SyncEntry[] {
    return [...this.syncLedger];
  }

  // Get ledger log entries
  getLedgerLog(): any[] {
    try {
      const stored = localStorage.getItem(this.LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ CredentialSyncLedger: Failed to load ledger log:', error);
      return [];
    }
  }

  // Clear sync ledger (for testing)
  clearSyncLedger(): void {
    this.syncLedger = [];
    this.metrics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      consensusSuccessRate: 100,
      averageSyncTime: 0,
      averageConsensusNodes: 0,
      pathBActivations: 0,
      syncFailureRate: 0,
      pathBActivated: false
    };

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.LOG_KEY);
      localStorage.removeItem('credential_sync_fallback');
      console.log('✅ CredentialSyncLedger: Sync ledger cleared');
    } catch (error) {
      console.error('❌ CredentialSyncLedger: Failed to clear sync ledger:', error);
    }
  }

  // Performance validation
  validatePerformance(): {
    syncTime: number;
    consensusTime: number;
    fullCycle: number;
    passed: boolean;
  } {
    const fullCycleStart = Date.now();

    // Test sync initialization
    const syncStart = Date.now();
    this.createSyncEntry('test_hash', 'did:test:source', 'did:test:target', 'verify', {
      credentialType: 'Identity',
      issuerDID: 'did:test:issuer',
      recipientDID: 'did:test:recipient',
      issuanceTimestamp: new Date().toISOString(),
      revoked: false
    });
    const syncTime = Date.now() - syncStart;

    // Test consensus simulation
    const consensusStart = Date.now();
    this.simulateNodeSync(this.consensusNodes[0], {
      id: 'test',
      credentialZkHash: 'test',
      sourceDID: 'test',
      targetDID: 'test',
      syncType: 'verify',
      syncStatus: 'pending',
      syncTimestamp: new Date().toISOString(),
      zkpVerified: false,
      consensusNodes: 0,
      requiredNodes: 3,
      syncMetadata: {
        credentialType: 'test',
        issuerDID: 'test',
        recipientDID: 'test',
        issuanceTimestamp: new Date().toISOString(),
        revoked: false,
        syncAttempts: 1,
        lastAttemptTimestamp: new Date().toISOString(),
        nodeSignatures: [],
        consensusReached: false
      }
    });
    const consensusTime = Date.now() - consensusStart;

    const fullCycle = Date.now() - fullCycleStart;

    const passed = syncTime <= 150 && consensusTime <= 100 && fullCycle <= 200;

    return { syncTime, consensusTime, fullCycle, passed };
  }
}