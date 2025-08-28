/**
 * FeedbackProofSigner.ts - Phase XIX
 * ZKP Signature & Feedback Proof Export System
 * Authority: Commander Mark via JASMY Relay
 */

// Types for feedback proof system
export interface FeedbackInput {
  zip: string;
  district: string;
  billId: string;
  vote: 'Support' | 'Oppose' | 'Abstain';
  timestamp: string;
  tier: string;
}

export interface FeedbackProof {
  feedbackHash: string;
  signature: string;
  sessionId: string;
  tier: string;
  timestamp: string;
  metadata: {
    zip: string;
    district: string;
    billId: string;
    vote: string;
    version: string;
    algorithm: string;
  };
  integrity: {
    checksum: string;
    verified: boolean;
    created: string;
  };
}

export interface ProofBundle {
  proof: FeedbackProof;
  export: {
    format: string;
    size: number;
    created: string;
  };
}

// Mock crypto utilities for simulation
class MockCrypto {
  static generateSHA256(input: string): string {
    // Mock SHA256 hash generation for simulation
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }

  static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `sess_${timestamp}_${random}`;
  }

  static generateSignature(data: string, sessionId: string): string {
    // Mock signature generation
    const combinedData = `${data}:${sessionId}`;
    return this.generateSHA256(combinedData).substring(0, 32);
  }

  static generateChecksum(proof: Omit<FeedbackProof, 'integrity'>): string {
    const dataString = JSON.stringify(proof);
    return this.generateSHA256(dataString).substring(0, 16);
  }
}

// Main FeedbackProofSigner class
export class FeedbackProofSigner {
  private static instance: FeedbackProofSigner;
  private sessionId: string;
  
  private constructor() {
    this.sessionId = MockCrypto.generateSessionId();
    console.log(`🔐 FeedbackProofSigner initialized with session: ${this.sessionId}`);
  }

  static getInstance(): FeedbackProofSigner {
    if (!FeedbackProofSigner.instance) {
      FeedbackProofSigner.instance = new FeedbackProofSigner();
    }
    return FeedbackProofSigner.instance;
  }

  // Sign feedback with ZKP simulation
  async signFeedback(input: FeedbackInput): Promise<FeedbackProof> {
    const startTime = performance.now();
    
    // Create feedback data string for hashing
    const feedbackData = `${input.zip}:${input.district}:${input.billId}:${input.vote}:${input.timestamp}:${input.tier}`;
    
    // Generate hash and signature
    const feedbackHash = MockCrypto.generateSHA256(feedbackData);
    const signature = MockCrypto.generateSignature(feedbackData, this.sessionId);
    
    // Create proof object
    const proofData: Omit<FeedbackProof, 'integrity'> = {
      feedbackHash,
      signature,
      sessionId: this.sessionId,
      tier: input.tier,
      timestamp: input.timestamp,
      metadata: {
        zip: input.zip,
        district: input.district,
        billId: input.billId,
        vote: input.vote,
        version: '1.0.0',
        algorithm: 'SHA256-Mock'
      }
    };
    
    // Generate integrity checksum
    const checksum = MockCrypto.generateChecksum(proofData);
    
    const proof: FeedbackProof = {
      ...proofData,
      integrity: {
        checksum,
        verified: true,
        created: new Date().toISOString()
      }
    };
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.log(`📝 Feedback signed — SHA256: ${feedbackHash.substring(0, 16)}... | Tier: ${input.tier} | Duration: ${duration}ms`);
    
    return proof;
  }

  // Create exportable proof bundle
  async createProofBundle(proof: FeedbackProof): Promise<ProofBundle> {
    const bundle: ProofBundle = {
      proof,
      export: {
        format: 'application/json',
        size: JSON.stringify(proof).length,
        created: new Date().toISOString()
      }
    };
    
    console.log(`📦 Proof bundle created — Size: ${bundle.export.size} bytes | Bill: ${proof.metadata.billId}`);
    
    return bundle;
  }

  // Export proof as downloadable JSON
  async exportProofAsJSON(proof: FeedbackProof, filename?: string): Promise<void> {
    const startTime = performance.now();
    
    try {
      const bundle = await this.createProofBundle(proof);
      const jsonData = JSON.stringify(bundle, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `feedback-proof-${proof.metadata.billId}-${Date.now()}.proof.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`📤 Feedback proof exported for ${proof.metadata.billId} | Duration: ${duration}ms`);
      
    } catch (error) {
      console.error('❌ Proof export failed:', error);
      throw new Error('Failed to export proof bundle');
    }
  }

  // Get proof hash for copying
  getProofHash(proof: FeedbackProof): string {
    return proof.feedbackHash;
  }

  // Verify proof integrity
  verifyProof(proof: FeedbackProof): boolean {
    try {
      const proofData = { ...proof };
      delete (proofData as any).integrity;
      
      const expectedChecksum = MockCrypto.generateChecksum(proofData);
      const isValid = expectedChecksum === proof.integrity.checksum;
      
      console.log(`🔍 Proof verification: ${isValid ? 'VALID' : 'INVALID'} | Hash: ${proof.feedbackHash.substring(0, 16)}...`);
      
      return isValid;
    } catch (error) {
      console.error('❌ Proof verification failed:', error);
      return false;
    }
  }

  // Get current session info
  getSessionInfo(): { sessionId: string; created: Date } {
    return {
      sessionId: this.sessionId,
      created: new Date() // Mock creation time
    };
  }
}

// Export utility functions
export const createFeedbackProof = async (input: FeedbackInput): Promise<FeedbackProof> => {
  const signer = FeedbackProofSigner.getInstance();
  return await signer.signFeedback(input);
};

export const exportFeedbackProof = async (proof: FeedbackProof, filename?: string): Promise<void> => {
  const signer = FeedbackProofSigner.getInstance();
  return await signer.exportProofAsJSON(proof, filename);
};

export const copyProofHash = async (proof: FeedbackProof): Promise<void> => {
  const signer = FeedbackProofSigner.getInstance();
  const hash = signer.getProofHash(proof);
  
  try {
    await navigator.clipboard.writeText(hash);
    console.log(`📋 Proof hash copied to clipboard: ${hash.substring(0, 16)}...`);
  } catch (error) {
    console.error('❌ Failed to copy proof hash:', error);
    throw new Error('Failed to copy proof hash to clipboard');
  }
};

export default FeedbackProofSigner;