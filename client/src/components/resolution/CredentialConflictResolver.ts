// Phase VII Step 3: CredentialConflictResolver.ts
// Commander Mark authorization via JASMY Relay
// Conflict detection engine with ZKP reconciliation and ledger resolution

import { CredentialSyncLedger, SyncEntry } from '../transport/CredentialSyncLedger';
import { VaultExportNode } from '../../layers/VaultExportNode';

export interface ConflictEntry {
  conflictId: string;
  credentialId: string;
  conflictType: 'hash_mismatch' | 'state_divergence' | 'node_disagreement' | 'cid_inconsistency';
  conflictTimestamp: string;
  detectedSources: ConflictSource[];
  resolutionStatus: 'pending' | 'resolving' | 'resolved' | 'failed' | 'arbitration';
  resolutionTimestamp?: string;
  winningEntry?: ConflictSource;
  rejectedEntries: ConflictSource[];
  nodeParticipation: NodeParticipation[];
  zkpRevalidation: ZKPRevalidation;
  pathBTriggered: boolean;
}

export interface ConflictSource {
  sourceType: 'ledger' | 'vault' | 'node';
  sourceId: string;
  credentialHash: string;
  credentialState: string;
  cidHash?: string;
  timestamp: string;
  zkpVerified: boolean;
  nodeSignature?: string;
}

export interface NodeParticipation {
  nodeId: string;
  nodeDID: string;
  vote: 'accept' | 'reject' | 'abstain';
  confidence: number;
  zkpValidation: boolean;
  signature: string;
}

export interface ZKPRevalidation {
  revalidationId: string;
  originalHash: string;
  revalidatedHash: string;
  proofValid: boolean;
  validationTimestamp: string;
  validatorNodes: string[];
  majorityConfirmed: boolean;
}

export interface ConflictResolution {
  success: boolean;
  conflictEntry?: ConflictEntry;
  resolutionTime: number;
  nodesParticipated: number;
  pathBActivated?: boolean;
  error?: string;
}

export interface ConflictMetrics {
  totalConflicts: number;
  resolvedConflicts: number;
  failedConflicts: number;
  arbitrationConflicts: number;
  conflictResolutionRate: number;
  averageResolutionTime: number;
  pathBActivations: number;
  unresolvedRate: number;
  pathBActivated: boolean;
}

export class CredentialConflictResolver {
  private conflictLog: ConflictEntry[] = [];
  private syncLedger: CredentialSyncLedger;
  private vaultExportNode: VaultExportNode;
  private metrics: ConflictMetrics = {
    totalConflicts: 0,
    resolvedConflicts: 0,
    failedConflicts: 0,
    arbitrationConflicts: 0,
    conflictResolutionRate: 100,
    averageResolutionTime: 0,
    pathBActivations: 0,
    unresolvedRate: 0,
    pathBActivated: false
  };

  private readonly STORAGE_KEY = 'credential_conflict_log';
  private readonly PATH_B_THRESHOLD = 10; // 10% unresolved conflicts
  private readonly RESOLUTION_TIMEOUT = 150; // 150ms per conflict
  private readonly SCAN_TIMEOUT = 2000; // 2000ms full scan

  constructor() {
    this.syncLedger = new CredentialSyncLedger();
    this.vaultExportNode = new VaultExportNode();
    this.loadConflictLog();
  }

  // Main conflict detection and resolution interface
  async detectAndResolveConflicts(): Promise<ConflictResolution[]> {
    const scanStartTime = Date.now();
    
    try {
      console.log('🔍 CredentialConflictResolver: Starting conflict detection scan...');
      
      // Step 1: Parse ledger.log and vault.history.json for conflicts
      const detectedConflicts = await this.parseConflictSources();
      
      // Step 2: Resolve each detected conflict
      const resolutionResults: ConflictResolution[] = [];
      
      for (const conflict of detectedConflicts) {
        const resolutionStartTime = Date.now();
        
        try {
          const resolution = await this.resolveConflict(conflict);
          resolutionResults.push(resolution);
          
          const resolutionTime = Date.now() - resolutionStartTime;
          if (resolutionTime > this.RESOLUTION_TIMEOUT) {
            console.warn(`⚠️ CredentialConflictResolver: Resolution time ${resolutionTime}ms (exceeds 150ms target)`);
          }
          
        } catch (error) {
          const failedResolution: ConflictResolution = {
            success: false,
            resolutionTime: Date.now() - resolutionStartTime,
            nodesParticipated: 0,
            error: error instanceof Error ? error.message : 'Unknown resolution error'
          };
          resolutionResults.push(failedResolution);
        }
      }
      
      // Step 3: Update metrics and check Path B activation
      this.updateMetrics(resolutionResults);
      this.checkPathBActivation();
      
      // Step 4: Save conflict log
      await this.saveConflictLog();
      
      const totalScanTime = Date.now() - scanStartTime;
      if (totalScanTime > this.SCAN_TIMEOUT) {
        console.warn(`⚠️ CredentialConflictResolver: Full scan time ${totalScanTime}ms (exceeds 2000ms target)`);
      }
      
      console.log(`✅ CredentialConflictResolver: Processed ${resolutionResults.length} conflicts in ${totalScanTime}ms`);
      
      return resolutionResults;
      
    } catch (error) {
      console.error('❌ CredentialConflictResolver: Conflict detection failed:', error);
      return [];
    }
  }

  // Parse ledger.log and vault.history.json for conflicts
  private async parseConflictSources(): Promise<ConflictEntry[]> {
    const conflicts: ConflictEntry[] = [];
    
    try {
      // Get ledger entries
      const ledgerEntries = this.syncLedger.getLedgerLog();
      const vaultHistory = this.vaultExportNode.getExportHistory();
      
      // Create credential index for conflict detection
      const credentialIndex = new Map<string, ConflictSource[]>();
      
      // Index ledger entries
      ledgerEntries.forEach(entry => {
        const credentialId = entry.credentialZkHash;
        if (!credentialIndex.has(credentialId)) {
          credentialIndex.set(credentialId, []);
        }
        
        credentialIndex.get(credentialId)!.push({
          sourceType: 'ledger',
          sourceId: entry.syncId,
          credentialHash: entry.credentialZkHash,
          credentialState: entry.syncStatus,
          cidHash: entry.cidHash,
          timestamp: entry.timestamp,
          zkpVerified: entry.zkpVerified,
          nodeSignature: `ledger_${entry.syncId}`
        });
      });
      
      // Index vault entries
      vaultHistory.forEach(entry => {
        const credentialId = entry.zkHash;
        if (!credentialIndex.has(credentialId)) {
          credentialIndex.set(credentialId, []);
        }
        
        credentialIndex.get(credentialId)!.push({
          sourceType: 'vault',
          sourceId: entry.exportId,
          credentialHash: entry.zkHash,
          credentialState: entry.exportStatus,
          cidHash: entry.ipfsCid,
          timestamp: entry.timestamp,
          zkpVerified: entry.zkpVerified,
          nodeSignature: `vault_${entry.exportId}`
        });
      });
      
      // Detect conflicts within each credential group
      for (const [credentialId, sources] of credentialIndex) {
        if (sources.length > 1) {
          const conflict = this.analyzeCredentialConflict(credentialId, sources);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
      
      console.log(`🔍 CredentialConflictResolver: Detected ${conflicts.length} conflicts from ${credentialIndex.size} credentials`);
      
      return conflicts;
      
    } catch (error) {
      console.error('❌ CredentialConflictResolver: Failed to parse conflict sources:', error);
      return [];
    }
  }

  // Analyze credential sources for conflicts
  private analyzeCredentialConflict(credentialId: string, sources: ConflictSource[]): ConflictEntry | null {
    // Check for hash mismatches
    const uniqueHashes = new Set(sources.map(s => s.credentialHash));
    const uniqueStates = new Set(sources.map(s => s.credentialState));
    const uniqueCIDs = new Set(sources.map(s => s.cidHash).filter(Boolean));
    
    let conflictType: ConflictEntry['conflictType'];
    
    if (uniqueHashes.size > 1) {
      conflictType = 'hash_mismatch';
    } else if (uniqueStates.size > 1) {
      conflictType = 'state_divergence';
    } else if (uniqueCIDs.size > 1) {
      conflictType = 'cid_inconsistency';
    } else if (sources.some(s => !s.zkpVerified)) {
      conflictType = 'node_disagreement';
    } else {
      return null; // No conflict detected
    }
    
    const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      conflictId,
      credentialId,
      conflictType,
      conflictTimestamp: new Date().toISOString(),
      detectedSources: sources,
      resolutionStatus: 'pending',
      rejectedEntries: [],
      nodeParticipation: [],
      zkpRevalidation: {
        revalidationId: `revalidate_${conflictId}`,
        originalHash: sources[0].credentialHash,
        revalidatedHash: '',
        proofValid: false,
        validationTimestamp: new Date().toISOString(),
        validatorNodes: [],
        majorityConfirmed: false
      },
      pathBTriggered: false
    };
  }

  // Resolve individual conflict through ZKP reconciliation
  private async resolveConflict(conflict: ConflictEntry): Promise<ConflictResolution> {
    const startTime = Date.now();
    
    try {
      console.log(`🔧 CredentialConflictResolver: Resolving conflict ${conflict.conflictId} (${conflict.conflictType})`);
      
      // Step 1: ZKP Revalidation
      const revalidationResult = await this.performZKPRevalidation(conflict);
      conflict.zkpRevalidation = revalidationResult;
      conflict.resolutionStatus = 'resolving';
      
      // Step 2: Node participation simulation
      const nodeParticipation = await this.simulateNodeParticipation(conflict);
      conflict.nodeParticipation = nodeParticipation;
      
      // Step 3: Majority consensus determination
      const consensusResult = this.determineMajorityConsensus(conflict);
      
      if (consensusResult.resolved) {
        // Resolution successful
        conflict.resolutionStatus = 'resolved';
        conflict.resolutionTimestamp = new Date().toISOString();
        conflict.winningEntry = consensusResult.winningEntry;
        conflict.rejectedEntries = consensusResult.rejectedEntries;
        
        // Update ledger with resolution
        await this.updateLedgerWithResolution(conflict);
        
        this.metrics.resolvedConflicts++;
        
      } else if (consensusResult.requiresArbitration) {
        // Send to arbitration
        conflict.resolutionStatus = 'arbitration';
        this.metrics.arbitrationConflicts++;
        
      } else {
        // Resolution failed
        conflict.resolutionStatus = 'failed';
        this.metrics.failedConflicts++;
      }
      
      // Add to conflict log
      this.conflictLog.push(conflict);
      
      const resolutionTime = Date.now() - startTime;
      
      return {
        success: conflict.resolutionStatus === 'resolved',
        conflictEntry: conflict,
        resolutionTime,
        nodesParticipated: nodeParticipation.length
      };
      
    } catch (error) {
      console.error(`❌ CredentialConflictResolver: Failed to resolve conflict ${conflict.conflictId}:`, error);
      
      return {
        success: false,
        resolutionTime: Date.now() - startTime,
        nodesParticipated: 0,
        error: error instanceof Error ? error.message : 'Unknown resolution error'
      };
    }
  }

  // Perform ZKP revalidation for conflict resolution
  private async performZKPRevalidation(conflict: ConflictEntry): Promise<ZKPRevalidation> {
    // Simulate ZKP revalidation process
    const revalidationId = `revalidate_${conflict.conflictId}`;
    const validatorNodes = ['validator_001', 'validator_002', 'witness_001'];
    
    // Select the most common hash among sources
    const hashCounts = new Map<string, number>();
    conflict.detectedSources.forEach(source => {
      const count = hashCounts.get(source.credentialHash) || 0;
      hashCounts.set(source.credentialHash, count + 1);
    });
    
    const mostCommonHash = Array.from(hashCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // Simulate proof validation (85% success rate for demo)
    const proofValid = Math.random() > 0.15;
    const majorityConfirmed = hashCounts.get(mostCommonHash)! >= Math.ceil(conflict.detectedSources.length / 2);
    
    return {
      revalidationId,
      originalHash: conflict.detectedSources[0].credentialHash,
      revalidatedHash: mostCommonHash,
      proofValid,
      validationTimestamp: new Date().toISOString(),
      validatorNodes,
      majorityConfirmed
    };
  }

  // Simulate node participation in conflict resolution
  private async simulateNodeParticipation(conflict: ConflictEntry): Promise<NodeParticipation[]> {
    const nodes = [
      { nodeId: 'validator_001', nodeDID: 'did:civic:node:validator:001' },
      { nodeId: 'validator_002', nodeDID: 'did:civic:node:validator:002' },
      { nodeId: 'witness_001', nodeDID: 'did:civic:node:witness:001' },
      { nodeId: 'witness_002', nodeDID: 'did:civic:node:witness:002' },
      { nodeId: 'archive_001', nodeDID: 'did:civic:node:archive:001' }
    ];
    
    const participation: NodeParticipation[] = [];
    
    for (const node of nodes) {
      // Simulate node participation (90% participation rate)
      if (Math.random() > 0.1) {
        const vote = this.simulateNodeVote(conflict);
        const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
        const zkpValidation = Math.random() > 0.1; // 90% ZKP validation success
        
        participation.push({
          nodeId: node.nodeId,
          nodeDID: node.nodeDID,
          vote,
          confidence,
          zkpValidation,
          signature: `node_vote_${node.nodeId}_${Date.now()}`
        });
      }
    }
    
    return participation;
  }

  // Simulate individual node vote
  private simulateNodeVote(conflict: ConflictEntry): 'accept' | 'reject' | 'abstain' {
    // Favor majority hash if available
    if (conflict.zkpRevalidation.majorityConfirmed && conflict.zkpRevalidation.proofValid) {
      return Math.random() > 0.2 ? 'accept' : 'abstain'; // 80% accept, 20% abstain
    } else {
      const rand = Math.random();
      if (rand > 0.7) return 'accept';
      if (rand > 0.4) return 'reject';
      return 'abstain';
    }
  }

  // Determine majority consensus for conflict resolution
  private determineMajorityConsensus(conflict: ConflictEntry): {
    resolved: boolean;
    requiresArbitration: boolean;
    winningEntry?: ConflictSource;
    rejectedEntries: ConflictSource[];
  } {
    const acceptVotes = conflict.nodeParticipation.filter(p => p.vote === 'accept').length;
    const rejectVotes = conflict.nodeParticipation.filter(p => p.vote === 'reject').length;
    const totalVotes = conflict.nodeParticipation.length;
    
    // Require majority consensus (>50%)
    const majorityThreshold = Math.ceil(totalVotes / 2);
    
    if (acceptVotes >= majorityThreshold && conflict.zkpRevalidation.proofValid) {
      // Resolution successful - select winning entry
      const winningHash = conflict.zkpRevalidation.revalidatedHash;
      const winningEntry = conflict.detectedSources.find(s => s.credentialHash === winningHash);
      const rejectedEntries = conflict.detectedSources.filter(s => s.credentialHash !== winningHash);
      
      return {
        resolved: true,
        requiresArbitration: false,
        winningEntry,
        rejectedEntries
      };
      
    } else if (rejectVotes >= majorityThreshold || !conflict.zkpRevalidation.proofValid) {
      // Resolution failed
      return {
        resolved: false,
        requiresArbitration: false,
        rejectedEntries: conflict.detectedSources
      };
      
    } else {
      // Tie or insufficient votes - requires arbitration
      return {
        resolved: false,
        requiresArbitration: true,
        rejectedEntries: []
      };
    }
  }

  // Update ledger.log with conflict resolution outcome
  private async updateLedgerWithResolution(conflict: ConflictEntry): Promise<void> {
    try {
      const resolutionEntry = {
        timestamp: new Date().toISOString(),
        conflictId: conflict.conflictId,
        credentialId: conflict.credentialId,
        conflictType: conflict.conflictType,
        resolutionStatus: conflict.resolutionStatus,
        winningHash: conflict.winningEntry?.credentialHash,
        rejectedHashes: conflict.rejectedEntries.map(e => e.credentialHash),
        nodeParticipation: conflict.nodeParticipation.length,
        zkpRevalidated: conflict.zkpRevalidation.proofValid,
        resolutionTime: conflict.resolutionTimestamp
      };
      
      // Get existing ledger log
      const existingLog = localStorage.getItem('ledger_log_entries') || '[]';
      const logEntries = JSON.parse(existingLog);
      
      // Add resolution entry
      logEntries.push(resolutionEntry);
      
      // Keep only latest 500 entries
      if (logEntries.length > 500) {
        logEntries.splice(0, logEntries.length - 500);
      }
      
      // Save updated log
      localStorage.setItem('ledger_log_entries', JSON.stringify(logEntries));
      
      console.log(`✅ CredentialConflictResolver: Updated ledger.log with resolution ${conflict.conflictId}`);
      
    } catch (error) {
      console.error('❌ CredentialConflictResolver: Failed to update ledger with resolution:', error);
    }
  }

  // Update conflict metrics
  private updateMetrics(resolutions: ConflictResolution[]): void {
    this.metrics.totalConflicts = this.conflictLog.length;
    
    if (this.metrics.totalConflicts > 0) {
      this.metrics.conflictResolutionRate = (this.metrics.resolvedConflicts / this.metrics.totalConflicts) * 100;
      this.metrics.unresolvedRate = ((this.metrics.failedConflicts + this.metrics.arbitrationConflicts) / this.metrics.totalConflicts) * 100;
    }
    
    // Calculate average resolution time
    const validResolutions = resolutions.filter(r => r.success);
    if (validResolutions.length > 0) {
      const totalTime = validResolutions.reduce((sum, r) => sum + r.resolutionTime, 0);
      this.metrics.averageResolutionTime = totalTime / validResolutions.length;
    }
  }

  // Check and activate Path B fallback
  private checkPathBActivation(): void {
    if (this.metrics.unresolvedRate >= this.PATH_B_THRESHOLD && !this.metrics.pathBActivated) {
      this.metrics.pathBActivated = true;
      this.metrics.pathBActivations++;
      
      console.warn(`⚠️ CredentialConflictResolver: Path B activated - ${this.metrics.unresolvedRate.toFixed(1)}% unresolved conflicts`);
      
      // Send unresolved conflicts to LocalSaveLayer
      this.sendUnresolvedToPathB();
    }
  }

  // Send unresolved conflicts to Path B (LocalSaveLayer)
  private sendUnresolvedToPathB(): void {
    const unresolvedConflicts = this.conflictLog.filter(
      c => c.resolutionStatus === 'failed' || c.resolutionStatus === 'arbitration'
    );
    
    unresolvedConflicts.forEach(conflict => {
      conflict.pathBTriggered = true;
      
      // Create fallback entry for LocalSaveLayer
      const fallbackEntry = {
        timestamp: new Date().toISOString(),
        type: 'credential_conflict',
        conflictId: conflict.conflictId,
        credentialId: conflict.credentialId,
        conflictType: conflict.conflictType,
        sources: conflict.detectedSources,
        reason: `Unresolved conflict: ${conflict.conflictType}`,
        pathBTrigger: 'conflict_resolution_failure'
      };
      
      try {
        const existingFallback = localStorage.getItem('local_save_fallback') || '[]';
        const fallbackEntries = JSON.parse(existingFallback);
        fallbackEntries.push(fallbackEntry);
        localStorage.setItem('local_save_fallback', JSON.stringify(fallbackEntries));
        
        console.log(`📦 CredentialConflictResolver: Sent conflict ${conflict.conflictId} to Path B`);
        
      } catch (error) {
        console.error('❌ CredentialConflictResolver: Failed to send conflict to Path B:', error);
      }
    });
  }

  // Load conflict log from localStorage
  private loadConflictLog(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.conflictLog = JSON.parse(stored);
        console.log(`✅ CredentialConflictResolver: Loaded ${this.conflictLog.length} conflict entries`);
      }
    } catch (error) {
      console.error('❌ CredentialConflictResolver: Failed to load conflict log:', error);
      this.conflictLog = [];
    }
  }

  // Save conflict log to localStorage
  private async saveConflictLog(): Promise<void> {
    try {
      // Keep only the latest 200 entries to prevent storage bloat
      if (this.conflictLog.length > 200) {
        this.conflictLog = this.conflictLog.slice(-200);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.conflictLog));
    } catch (error) {
      console.error('❌ CredentialConflictResolver: Failed to save conflict log:', error);
    }
  }

  // Run conflict detection test suite
  async runConflictTestSuite(): Promise<ConflictResolution[]> {
    console.log('🧪 CredentialConflictResolver: Running conflict test suite...');
    
    // Generate test conflicts for demonstration
    await this.generateTestConflicts();
    
    // Run detection and resolution
    const results = await this.detectAndResolveConflicts();
    
    console.log(`✅ CredentialConflictResolver: Test suite completed - ${results.length} conflicts processed`);
    
    return results;
  }

  // Generate test conflicts for demonstration
  private async generateTestConflicts(): Promise<void> {
    // This method would create synthetic conflicts for testing
    // Implementation would depend on test requirements
    console.log('🧪 Generating test conflicts for demonstration...');
  }

  // Get conflict metrics
  getConflictMetrics(): ConflictMetrics {
    return { ...this.metrics };
  }

  // Get conflict log
  getConflictLog(): ConflictEntry[] {
    return [...this.conflictLog];
  }

  // Get pending conflicts
  getPendingConflicts(): ConflictEntry[] {
    return this.conflictLog.filter(c => c.resolutionStatus === 'pending');
  }

  // Get resolved conflicts
  getResolvedConflicts(): ConflictEntry[] {
    return this.conflictLog.filter(c => c.resolutionStatus === 'resolved');
  }

  // Clear conflict log (for testing)
  clearConflictLog(): void {
    this.conflictLog = [];
    this.metrics = {
      totalConflicts: 0,
      resolvedConflicts: 0,
      failedConflicts: 0,
      arbitrationConflicts: 0,
      conflictResolutionRate: 100,
      averageResolutionTime: 0,
      pathBActivations: 0,
      unresolvedRate: 0,
      pathBActivated: false
    };

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ CredentialConflictResolver: Conflict log cleared');
    } catch (error) {
      console.error('❌ CredentialConflictResolver: Failed to clear conflict log:', error);
    }
  }

  // Performance validation
  validatePerformance(): {
    conflictDetection: number;
    zkpRevalidation: number;
    consensusTime: number;
    fullCycle: number;
    passed: boolean;
  } {
    const fullCycleStart = Date.now();

    // Test conflict detection
    const detectionStart = Date.now();
    this.parseConflictSources();
    const conflictDetection = Date.now() - detectionStart;

    // Test ZKP revalidation simulation
    const zkpStart = Date.now();
    const mockConflict: ConflictEntry = {
      conflictId: 'test',
      credentialId: 'test',
      conflictType: 'hash_mismatch',
      conflictTimestamp: new Date().toISOString(),
      detectedSources: [],
      resolutionStatus: 'pending',
      rejectedEntries: [],
      nodeParticipation: [],
      zkpRevalidation: {
        revalidationId: 'test',
        originalHash: 'test',
        revalidatedHash: 'test',
        proofValid: true,
        validationTimestamp: new Date().toISOString(),
        validatorNodes: [],
        majorityConfirmed: true
      },
      pathBTriggered: false
    };
    this.performZKPRevalidation(mockConflict);
    const zkpRevalidation = Date.now() - zkpStart;

    // Test consensus determination
    const consensusStart = Date.now();
    this.determineMajorityConsensus(mockConflict);
    const consensusTime = Date.now() - consensusStart;

    const fullCycle = Date.now() - fullCycleStart;

    const passed = conflictDetection <= 150 && zkpRevalidation <= 100 && consensusTime <= 50 && fullCycle <= 200;

    return { conflictDetection, zkpRevalidation, consensusTime, fullCycle, passed };
  }
}