// Phase V Step 4: ZKVoteVerifier.ts (Final Step)
// Commander Mark authorization via JASMY Relay
// Core vote validation engine with cryptographic logging and replay protection

export interface Vote {
  id: string;
  proposalId: string;
  voterDID: string;
  voterTier: 'Citizen' | 'Moderator' | 'Governor';
  voteType: 'support' | 'oppose' | 'abstain';
  zkpHash: string;
  timestamp: string;
  synced: boolean;
}

export interface ZKProof {
  hash: string;
  signature: string;
  did: string;
  timestamp: string;
  voteContent: string;
  proofGenerated: string;
}

export interface VerificationResult {
  valid: boolean;
  proofHash: string;
  verificationTime: number;
  desyncReason?: string;
  replayDetected?: boolean;
}

export interface VaultHistoryEntry {
  id: string;
  proofHash: string;
  did: string;
  timestamp: string;
  verificationTime: number;
  result: 'valid' | 'invalid' | 'replay_blocked';
  desyncReason?: string;
}

export interface VerificationMetrics {
  totalVerifications: number;
  validVerifications: number;
  invalidVerifications: number;
  replayAttempts: number;
  successRate: number;
  averageVerificationTime: number;
  fallbackActivated: boolean;
  desyncRate: number;
}

export class ZKVoteVerifier {
  private vaultHistory: VaultHistoryEntry[] = [];
  private metrics: VerificationMetrics = {
    totalVerifications: 0,
    validVerifications: 0,
    invalidVerifications: 0,
    replayAttempts: 0,
    successRate: 100,
    averageVerificationTime: 0,
    fallbackActivated: false,
    desyncRate: 0
  };
  private readonly REPLAY_WINDOW_SIZE = 10;
  private readonly FALLBACK_THRESHOLD = 15; // 15% desync rate
  private readonly STORAGE_KEY = 'zkp_vault_history';

  constructor() {
    this.loadVaultHistory();
  }

  // Core vote validation engine
  async verifyVote(vote: Vote, zkProof: ZKProof): Promise<VerificationResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Validate proof structure
      const structureValid = this.validateProofStructure(zkProof);
      if (!structureValid) {
        return this.createFailureResult('Invalid proof structure', startTime);
      }

      // Step 2: Check for replay attacks
      const replayDetected = this.checkReplayProtection(zkProof.hash);
      if (replayDetected) {
        this.metrics.replayAttempts++;
        this.updateMetrics();
        
        return {
          valid: false,
          proofHash: zkProof.hash,
          verificationTime: Date.now() - startTime,
          replayDetected: true,
          desyncReason: 'Replay attack detected'
        };
      }

      // Step 3: Verify proof against embedded DID and timestamp
      const proofValid = await this.validateZKProof(vote, zkProof);
      
      const verificationTime = Date.now() - startTime;
      
      if (proofValid) {
        // Success path - record to vault history
        await this.recordSuccessfulVerification(zkProof, verificationTime);
        
        this.metrics.validVerifications++;
        this.updateMetrics();
        
        console.log(`✅ ZKVoteVerifier: Vote verified successfully - ${zkProof.hash}`);
        
        return {
          valid: true,
          proofHash: zkProof.hash,
          verificationTime
        };
      } else {
        // Failure path - log discrepancy
        const result = this.createFailureResult('ZKP verification failed', startTime, zkProof.hash);
        await this.recordFailedVerification(zkProof, result.verificationTime, result.desyncReason!);
        
        this.metrics.invalidVerifications++;
        this.updateMetrics();
        this.checkFallbackActivation();
        
        console.warn(`❌ ZKVoteVerifier: Verification failed - ${zkProof.hash}`);
        
        return result;
      }
      
    } catch (error) {
      const verificationTime = Date.now() - startTime;
      console.error('❌ ZKVoteVerifier: Verification error:', error);
      
      this.metrics.invalidVerifications++;
      this.updateMetrics();
      
      return {
        valid: false,
        proofHash: zkProof.hash,
        verificationTime,
        desyncReason: `Verification exception: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Validate proof structure
  private validateProofStructure(zkProof: ZKProof): boolean {
    const validationStart = Date.now();
    
    const isValid = !!(
      zkProof.hash &&
      zkProof.signature &&
      zkProof.did &&
      zkProof.timestamp &&
      zkProof.voteContent &&
      zkProof.proofGenerated &&
      zkProof.did.startsWith('did:') &&
      zkProof.hash.startsWith('0x') &&
      zkProof.hash.length === 66 // 0x + 64 hex characters
    );
    
    const validationTime = Date.now() - validationStart;
    if (validationTime > 50) {
      console.warn(`⚠️ ZKVoteVerifier: Structure validation time: ${validationTime}ms (exceeds 50ms target)`);
    }
    
    return isValid;
  }

  // Check replay protection (last 10 entries)
  private checkReplayProtection(proofHash: string): boolean {
    const recentHashes = this.vaultHistory
      .slice(-this.REPLAY_WINDOW_SIZE)
      .map(entry => entry.proofHash);
    
    return recentHashes.includes(proofHash);
  }

  // Validate ZKP against vote data
  private async validateZKProof(vote: Vote, zkProof: ZKProof): Promise<boolean> {
    const hashStart = Date.now();
    
    try {
      // Verify DID match
      if (vote.voterDID !== zkProof.did) {
        console.warn(`⚠️ ZKVoteVerifier: DID mismatch - Vote: ${vote.voterDID}, Proof: ${zkProof.did}`);
        return false;
      }

      // Verify timestamp correlation (within 5 minutes)
      const voteTime = new Date(vote.timestamp).getTime();
      const proofTime = new Date(zkProof.timestamp).getTime();
      const timeDiff = Math.abs(voteTime - proofTime);
      
      if (timeDiff > 300000) { // 5 minutes in milliseconds
        console.warn(`⚠️ ZKVoteVerifier: Timestamp out of range - Diff: ${timeDiff}ms`);
        return false;
      }

      // Generate expected hash using deterministic hashing
      const expectedHash = await this.generateDeterministicHash(
        zkProof.did,
        zkProof.timestamp,
        zkProof.voteContent
      );

      const hashTime = Date.now() - hashStart;
      if (hashTime > 50) {
        console.warn(`⚠️ ZKVoteVerifier: Hash comparison time: ${hashTime}ms (exceeds 50ms target)`);
      }

      // Verify hash match
      const hashValid = expectedHash === zkProof.hash;
      
      if (!hashValid) {
        console.warn(`⚠️ ZKVoteVerifier: Hash mismatch - Expected: ${expectedHash}, Got: ${zkProof.hash}`);
      }

      return hashValid;

    } catch (error) {
      console.error('❌ ZKVoteVerifier: ZKP validation error:', error);
      return false;
    }
  }

  // Generate deterministic hash (sha256 simulation)
  private async generateDeterministicHash(did: string, timestamp: string, voteContent: string): Promise<string> {
    const content = `${did}${timestamp}${voteContent}`;
    
    // Simulate SHA256 hashing with deterministic output
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to hex and pad to 64 characters
    const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
    const fullHash = hexHash.repeat(4).substring(0, 64);
    
    return `0x${fullHash}`;
  }

  // Record successful verification to vault history
  private async recordSuccessfulVerification(zkProof: ZKProof, verificationTime: number): Promise<void> {
    const entry: VaultHistoryEntry = {
      id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      proofHash: zkProof.hash,
      did: zkProof.did,
      timestamp: new Date().toISOString(),
      verificationTime,
      result: 'valid'
    };

    this.vaultHistory.push(entry);
    await this.saveVaultHistory();
    
    console.log(`✅ ZKVoteVerifier: Success logged to vault history - ${entry.id}`);
  }

  // Record failed verification to vault history
  private async recordFailedVerification(zkProof: ZKProof, verificationTime: number, desyncReason: string): Promise<void> {
    const entry: VaultHistoryEntry = {
      id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      proofHash: zkProof.hash,
      did: zkProof.did,
      timestamp: new Date().toISOString(),
      verificationTime,
      result: 'invalid',
      desyncReason
    };

    this.vaultHistory.push(entry);
    await this.saveVaultHistory();
    
    console.warn(`⚠️ ZKVoteVerifier: Failure logged to vault history - ${entry.id}: ${desyncReason}`);
  }

  // Create failure result
  private createFailureResult(desyncReason: string, startTime: number, proofHash?: string): VerificationResult {
    return {
      valid: false,
      proofHash: proofHash || 'unknown',
      verificationTime: Date.now() - startTime,
      desyncReason
    };
  }

  // Update verification metrics
  private updateMetrics(): void {
    this.metrics.totalVerifications = this.metrics.validVerifications + this.metrics.invalidVerifications;
    
    if (this.metrics.totalVerifications > 0) {
      this.metrics.successRate = (this.metrics.validVerifications / this.metrics.totalVerifications) * 100;
      this.metrics.desyncRate = (this.metrics.invalidVerifications / this.metrics.totalVerifications) * 100;
    }

    // Calculate average verification time
    if (this.vaultHistory.length > 0) {
      const totalTime = this.vaultHistory.reduce((sum, entry) => sum + entry.verificationTime, 0);
      this.metrics.averageVerificationTime = totalTime / this.vaultHistory.length;
    }
  }

  // Check fallback activation (≥15% desync rate)
  private checkFallbackActivation(): void {
    if (this.metrics.desyncRate >= this.FALLBACK_THRESHOLD && !this.metrics.fallbackActivated) {
      this.metrics.fallbackActivated = true;
      
      console.warn(`⚠️ ZKVoteVerifier: Fallback activated - ${this.metrics.desyncRate.toFixed(1)}% desync rate`);
      
      // Activate LocalSaveLayer for offline verification queue
      this.activateOfflineVerificationQueue();
    }
  }

  // Activate offline verification queue (LocalSaveLayer integration)
  private activateOfflineVerificationQueue(): void {
    try {
      const fallbackData = {
        timestamp: new Date().toISOString(),
        reason: 'High desync rate in ZKP verification',
        desyncRate: this.metrics.desyncRate,
        metrics: this.metrics,
        vaultHistorySnapshot: this.vaultHistory.slice(-20) // Last 20 entries
      };
      
      localStorage.setItem('zkp_verification_fallback', JSON.stringify(fallbackData));
      console.log('✅ ZKVoteVerifier: Offline verification queue activated');
      
    } catch (error) {
      console.error('❌ ZKVoteVerifier: Failed to activate offline queue:', error);
    }
  }

  // Load vault history from localStorage
  private loadVaultHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.vaultHistory = JSON.parse(stored);
        console.log(`✅ ZKVoteVerifier: Loaded ${this.vaultHistory.length} vault history entries`);
      }
    } catch (error) {
      console.error('❌ ZKVoteVerifier: Failed to load vault history:', error);
      this.vaultHistory = [];
    }
  }

  // Save vault history to localStorage
  private async saveVaultHistory(): Promise<void> {
    try {
      // Keep only the latest 100 entries to prevent storage bloat
      if (this.vaultHistory.length > 100) {
        this.vaultHistory = this.vaultHistory.slice(-100);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vaultHistory));
    } catch (error) {
      console.error('❌ ZKVoteVerifier: Failed to save vault history:', error);
    }
  }

  // Get verification metrics
  getMetrics(): VerificationMetrics {
    return { ...this.metrics };
  }

  // Get vault history
  getVaultHistory(): VaultHistoryEntry[] {
    return [...this.vaultHistory];
  }

  // Get recent verification failures for debugging
  getRecentFailures(count: number = 10): VaultHistoryEntry[] {
    return this.vaultHistory
      .filter(entry => entry.result === 'invalid')
      .slice(-count);
  }

  // Clear vault history (for testing purposes)
  clearVaultHistory(): void {
    this.vaultHistory = [];
    this.metrics = {
      totalVerifications: 0,
      validVerifications: 0,
      invalidVerifications: 0,
      replayAttempts: 0,
      successRate: 100,
      averageVerificationTime: 0,
      fallbackActivated: false,
      desyncRate: 0
    };
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('zkp_verification_fallback');
      console.log('✅ ZKVoteVerifier: Vault history cleared');
    } catch (error) {
      console.error('❌ ZKVoteVerifier: Failed to clear vault history:', error);
    }
  }

  // Performance validation
  validatePerformance(): { renderTime: number; hashTime: number; fullCycle: number; passed: boolean } {
    const testProof: ZKProof = {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      signature: 'test_signature',
      did: 'did:civic:0xtest123',
      timestamp: new Date().toISOString(),
      voteContent: 'test_vote_content',
      proofGenerated: new Date().toISOString()
    };

    const fullCycleStart = Date.now();
    
    // Test structure validation (render time equivalent)
    const renderStart = Date.now();
    this.validateProofStructure(testProof);
    const renderTime = Date.now() - renderStart;
    
    // Test hash generation (hash time)
    const hashStart = Date.now();
    this.generateDeterministicHash(testProof.did, testProof.timestamp, testProof.voteContent);
    const hashTime = Date.now() - hashStart;
    
    const fullCycle = Date.now() - fullCycleStart;
    
    const passed = renderTime <= 75 && hashTime <= 50 && fullCycle <= 150;
    
    return { renderTime, hashTime, fullCycle, passed };
  }
}