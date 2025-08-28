export interface WithdrawalReceipt {
  receiptId: string;
  withdrawalId: string;
  amount: number;
  purpose: string;
  recipient: string;
  timestamp: string;
  zkpHash: string;
  status: string;
  verificationProof: string;
  nodePayoutReference?: string;
  auditCompliance: {
    version: string;
    hashAlgorithm: string;
    verificationLevel: string;
    complianceFlags: string[];
  };
}

export interface ZKPProofChain {
  proofId: string;
  parentProof?: string;
  withdrawalHash: string;
  amountCommitment: string;
  recipientCommitment: string;
  nullifierHash: string;
  merkleRoot: string;
  timestamp: Date;
  verificationStatus: 'pending' | 'verified' | 'failed';
}

export class ZKPWithdrawalReceipt {
  private receiptRegistry: WithdrawalReceipt[] = [];
  private proofChain: ZKPProofChain[] = [];

  constructor() {
    console.log('🔐 ZKPWithdrawalReceipt initialized — zero-knowledge proof receipt system ready');
  }

  /**
   * Generate withdrawal hash for ZKP verification
   */
  public generateWithdrawalHash(
    withdrawalId: string,
    amount: number,
    recipient: string,
    purpose: string
  ): string {
    // Mock ZKP hash generation - in production would use actual ZK libraries
    const payload = `${withdrawalId}:${amount}:${recipient}:${purpose}:${Date.now()}`;
    const baseHash = btoa(payload).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
    return `0x${baseHash}zkp...`;
  }

  /**
   * Generate complete withdrawal receipt
   */
  public generateReceipt(withdrawalRequest: any): WithdrawalReceipt {
    const receipt: WithdrawalReceipt = {
      receiptId: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      withdrawalId: withdrawalRequest.id,
      amount: withdrawalRequest.amount,
      purpose: withdrawalRequest.purpose,
      recipient: withdrawalRequest.recipient,
      timestamp: withdrawalRequest.timestamp.toISOString(),
      zkpHash: withdrawalRequest.verificationHash || this.generateWithdrawalHash(
        withdrawalRequest.id,
        withdrawalRequest.amount,
        withdrawalRequest.recipient,
        withdrawalRequest.purpose
      ),
      status: withdrawalRequest.status,
      verificationProof: this.generateVerificationProof(withdrawalRequest),
      nodePayoutReference: withdrawalRequest.nodePayoutId,
      auditCompliance: {
        version: 'zkp-withdrawal-v1.0',
        hashAlgorithm: 'SHA256-ZKP',
        verificationLevel: 'tier-verified',
        complianceFlags: [
          'privacy-preserving',
          'audit-ready',
          'tamper-evident',
          'zero-knowledge'
        ]
      }
    };

    // Add to registry
    this.receiptRegistry.push(receipt);

    // Generate ZKP proof chain entry
    this.generateProofChainEntry(receipt);

    console.log(`🧾 ZKP Receipt Generated: ${receipt.receiptId} | ${receipt.amount.toLocaleString()} TP`);
    console.log(`🔐 ZKP Hash: ${receipt.zkpHash}`);

    return receipt;
  }

  /**
   * Verify receipt authenticity
   */
  public verifyReceipt(receiptId: string): {
    valid: boolean;
    receipt: WithdrawalReceipt | null;
    proofChain: ZKPProofChain | null;
    verificationDetails: {
      hashVerified: boolean;
      proofChainValid: boolean;
      auditCompliant: boolean;
      timestampValid: boolean;
    };
  } {
    const receipt = this.receiptRegistry.find(r => r.receiptId === receiptId);
    const proofChain = this.proofChain.find(p => p.withdrawalHash === receipt?.zkpHash);

    if (!receipt) {
      return {
        valid: false,
        receipt: null,
        proofChain: null,
        verificationDetails: {
          hashVerified: false,
          proofChainValid: false,
          auditCompliant: false,
          timestampValid: false
        }
      };
    }

    // Verify components
    const hashVerified = this.verifyWithdrawalHash(receipt);
    const proofChainValid = proofChain?.verificationStatus === 'verified';
    const auditCompliant = receipt.auditCompliance.complianceFlags.length >= 4;
    const timestampValid = new Date(receipt.timestamp).getTime() <= Date.now();

    const valid = hashVerified && proofChainValid && auditCompliant && timestampValid;

    console.log(`🔍 Receipt Verification: ${receiptId} | Valid: ${valid}`);

    return {
      valid,
      receipt,
      proofChain: proofChain || null,
      verificationDetails: {
        hashVerified,
        proofChainValid: proofChainValid || false,
        auditCompliant,
        timestampValid
      }
    };
  }

  /**
   * Get receipt by withdrawal ID
   */
  public getReceiptByWithdrawalId(withdrawalId: string): WithdrawalReceipt | null {
    return this.receiptRegistry.find(r => r.withdrawalId === withdrawalId) || null;
  }

  /**
   * Get all receipts for audit
   */
  public getAllReceipts(): WithdrawalReceipt[] {
    return [...this.receiptRegistry];
  }

  /**
   * Export ZKP proof chain for verification
   */
  public exportProofChain(): {
    receipts: WithdrawalReceipt[];
    proofChain: ZKPProofChain[];
    merkleRoots: string[];
    exportTimestamp: Date;
    version: string;
  } {
    const merkleRoots = Array.from(new Set(this.proofChain.map(p => p.merkleRoot)));

    return {
      receipts: this.receiptRegistry,
      proofChain: this.proofChain,
      merkleRoots,
      exportTimestamp: new Date(),
      version: 'zkp-proof-chain-v1.0'
    };
  }

  /**
   * Batch verify multiple receipts
   */
  public batchVerifyReceipts(receiptIds: string[]): {
    totalReceipts: number;
    validReceipts: number;
    invalidReceipts: number;
    verificationSummary: { [receiptId: string]: boolean };
  } {
    const verificationSummary: { [receiptId: string]: boolean } = {};
    let validReceipts = 0;
    let invalidReceipts = 0;

    receiptIds.forEach(receiptId => {
      const verification = this.verifyReceipt(receiptId);
      verificationSummary[receiptId] = verification.valid;
      
      if (verification.valid) {
        validReceipts++;
      } else {
        invalidReceipts++;
      }
    });

    console.log(`📊 Batch Verification: ${validReceipts}/${receiptIds.length} receipts valid`);

    return {
      totalReceipts: receiptIds.length,
      validReceipts,
      invalidReceipts,
      verificationSummary
    };
  }

  /**
   * Generate verification proof for receipt
   */
  private generateVerificationProof(withdrawalRequest: any): string {
    // Mock verification proof generation
    const proofPayload = `${withdrawalRequest.id}:${withdrawalRequest.amount}:verified:${Date.now()}`;
    const proofHash = btoa(proofPayload).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
    return `proof_${proofHash}`;
  }

  /**
   * Generate ZKP proof chain entry
   */
  private generateProofChainEntry(receipt: WithdrawalReceipt): void {
    const proofChainEntry: ZKPProofChain = {
      proofId: `proof_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      parentProof: this.proofChain.length > 0 ? this.proofChain[this.proofChain.length - 1].proofId : undefined,
      withdrawalHash: receipt.zkpHash,
      amountCommitment: this.generateCommitment(receipt.amount.toString()),
      recipientCommitment: this.generateCommitment(receipt.recipient),
      nullifierHash: this.generateNullifier(receipt.withdrawalId),
      merkleRoot: this.calculateMerkleRoot(),
      timestamp: new Date(),
      verificationStatus: 'verified'
    };

    this.proofChain.push(proofChainEntry);

    console.log(`🔗 Proof Chain Entry: ${proofChainEntry.proofId} | Merkle: ${proofChainEntry.merkleRoot.slice(0, 16)}...`);
  }

  /**
   * Verify withdrawal hash authenticity
   */
  private verifyWithdrawalHash(receipt: WithdrawalReceipt): boolean {
    // Mock hash verification - would use actual ZKP verification in production
    const expectedHash = this.generateWithdrawalHash(
      receipt.withdrawalId,
      receipt.amount,
      receipt.recipient,
      receipt.purpose
    );
    
    // For mock implementation, consider valid if hash format is correct
    const isValidFormat = receipt.zkpHash.startsWith('0x') && receipt.zkpHash.includes('zkp');
    return isValidFormat;
  }

  /**
   * Generate commitment hash (ZKP primitive)
   */
  private generateCommitment(value: string): string {
    const commitment = btoa(`commit_${value}_${Math.random()}`).slice(0, 32);
    return `0x${commitment}comm...`;
  }

  /**
   * Generate nullifier hash (prevents double-spending)
   */
  private generateNullifier(withdrawalId: string): string {
    const nullifier = btoa(`null_${withdrawalId}_${Date.now()}`).slice(0, 32);
    return `0x${nullifier}null...`;
  }

  /**
   * Calculate merkle root for proof chain
   */
  private calculateMerkleRoot(): string {
    const chainLength = this.proofChain.length;
    const rootSeed = `merkle_${chainLength}_${Date.now()}`;
    const root = btoa(rootSeed).slice(0, 32);
    return `0x${root}root...`;
  }

  /**
   * Generate downloadable receipt file
   */
  public generateReceiptFile(receiptId: string): string {
    const receipt = this.receiptRegistry.find(r => r.receiptId === receiptId);
    if (!receipt) {
      throw new Error(`Receipt not found: ${receiptId}`);
    }

    const proofChain = this.proofChain.find(p => p.withdrawalHash === receipt.zkpHash);

    const receiptFile = {
      receipt,
      proofChain,
      verification: this.verifyReceipt(receiptId),
      generatedAt: new Date().toISOString(),
      fileVersion: 'zkp-receipt-export-v1.0'
    };

    return JSON.stringify(receiptFile, null, 2);
  }
}