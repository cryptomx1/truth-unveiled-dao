/**
 * ZKPVerifierAgent.ts - Phase XXI
 * Feedback Verification + zk-SNARK Onchain Export System
 * Authority: Commander Mark via JASMY Relay
 */

import { AssembledZKPProof, ZKPAssemblyResult } from '../services/ZKPProofAssembler';

// Types for verification system
export interface VerificationResult {
  isValid: boolean;
  chainReady: boolean;
  verificationHash: string;
  verifiedAt: string;
  errors: string[];
  metadata: {
    algorithm: string;
    curve: string;
    protocol: string;
    publicSignalCount: number;
    nullifierCount: number;
  };
  performance: {
    verificationTime: number;
    gasEstimate: number;
  };
}

export interface VerificationCriteria {
  proofStructure: boolean;
  publicSignals: boolean;
  nullifierValidation: boolean;
  timestampCheck: boolean;
  signatureValidation: boolean;
}

// Mock verification utilities
class MockGroth16Verifier {
  static verifyProofStructure(proof: AssembledZKPProof): boolean {
    // Check pi_a, pi_b, pi_c structure
    const { pi_a, pi_b, pi_c, protocol, curve } = proof.proof;
    
    if (protocol !== 'groth16') return false;
    if (curve !== 'bn128') return false;
    if (!pi_a || pi_a.length !== 3) return false;
    if (!pi_b || pi_b.length !== 3 || !pi_b.every(arr => Array.isArray(arr) && arr.length === 2)) return false;
    if (!pi_c || pi_c.length !== 3) return false;
    
    return true;
  }
  
  static verifyPublicSignals(proof: AssembledZKPProof): boolean {
    const { signal } = proof;
    
    // Validate signal structure
    if (!signal.feedback_hash || typeof signal.feedback_hash !== 'string') return false;
    if (signal.vote_value === undefined || signal.vote_value < -1 || signal.vote_value > 1) return false;
    if (!signal.district_id || typeof signal.district_id !== 'string') return false;
    if (!signal.zip_code || typeof signal.zip_code !== 'string') return false;
    if (!signal.timestamp || typeof signal.timestamp !== 'string') return false;
    
    return true;
  }
  
  static verifyNullifiers(proof: AssembledZKPProof): boolean {
    const { nullifier } = proof;
    
    // Check nullifier structure
    if (!nullifier.session_nullifier || typeof nullifier.session_nullifier !== 'string') return false;
    if (!nullifier.did_nullifier || typeof nullifier.did_nullifier !== 'string') return false;
    if (!nullifier.bill_nullifier || typeof nullifier.bill_nullifier !== 'string') return false;
    if (!nullifier.combined_nullifier || typeof nullifier.combined_nullifier !== 'string') return false;
    
    return true;
  }
  
  static verifyTimestamp(proof: AssembledZKPProof): boolean {
    const { epoch } = proof;
    const now = new Date();
    const started = new Date(epoch.started_at);
    const expires = new Date(epoch.expires_at);
    
    // Check if timestamp is within valid epoch
    return now >= started && now <= expires;
  }
  
  static verifySignature(proof: AssembledZKPProof): boolean {
    // Mock signature verification
    const { integrity } = proof;
    return integrity.did_binding_verified && integrity.zkp_ready;
  }
  
  static estimateGas(proof: AssembledZKPProof): number {
    // Mock gas estimation based on proof complexity
    const baseGas = 250000; // Base verification cost
    const signalGas = Object.keys(proof.signal).length * 5000;
    const nullifierGas = Object.keys(proof.nullifier).length * 3000;
    
    return baseGas + signalGas + nullifierGas;
  }
  
  static generateVerificationHash(proof: AssembledZKPProof): string {
    // Generate verification hash from proof components
    const verificationData = {
      proof_hash: proof.integrity.assembled_hash,
      public_signals: proof.signal,
      nullifiers: proof.nullifier,
      timestamp: proof.metadata.assembledAt
    };
    
    // Mock hash generation
    const chars = 'abcdef0123456789';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return hash;
  }
}

// Main ZKP Verifier Agent class
export class ZKPVerifierAgent {
  private static instance: ZKPVerifierAgent;
  
  private constructor() {
    console.log('🔍 ZKPVerifierAgent initialized for proof verification operations');
  }
  
  static getInstance(): ZKPVerifierAgent {
    if (!ZKPVerifierAgent.instance) {
      ZKPVerifierAgent.instance = new ZKPVerifierAgent();
    }
    return ZKPVerifierAgent.instance;
  }
  
  // Main verification function
  async verifyZKPProof(assemblyResult: ZKPAssemblyResult): Promise<VerificationResult> {
    const startTime = performance.now();
    const proof = assemblyResult.assembledProof;
    const errors: string[] = [];
    
    try {
      console.log('🔍 Starting ZKP proof verification...');
      
      // Run verification criteria
      const criteria: VerificationCriteria = {
        proofStructure: MockGroth16Verifier.verifyProofStructure(proof),
        publicSignals: MockGroth16Verifier.verifyPublicSignals(proof),
        nullifierValidation: MockGroth16Verifier.verifyNullifiers(proof),
        timestampCheck: MockGroth16Verifier.verifyTimestamp(proof),
        signatureValidation: MockGroth16Verifier.verifySignature(proof)
      };
      
      // Collect errors
      if (!criteria.proofStructure) errors.push('Invalid proof structure');
      if (!criteria.publicSignals) errors.push('Malformed public signals');
      if (!criteria.nullifierValidation) errors.push('Invalid nullifier format');
      if (!criteria.timestampCheck) errors.push('Timestamp outside valid epoch');
      if (!criteria.signatureValidation) errors.push('Signature validation failed');
      
      // Overall validation
      const isValid = Object.values(criteria).every(criterion => criterion);
      const chainReady = isValid && assemblyResult.readiness.chain_ready;
      
      // Generate verification hash
      const verificationHash = MockGroth16Verifier.generateVerificationHash(proof);
      
      // Calculate performance metrics
      const endTime = performance.now();
      const verificationTime = Math.round(endTime - startTime);
      const gasEstimate = MockGroth16Verifier.estimateGas(proof);
      
      // Create result
      const result: VerificationResult = {
        isValid,
        chainReady,
        verificationHash,
        verifiedAt: new Date().toISOString(),
        errors,
        metadata: {
          algorithm: 'groth16-mock',
          curve: proof.proof.curve,
          protocol: proof.proof.protocol,
          publicSignalCount: Object.keys(proof.signal).length,
          nullifierCount: Object.keys(proof.nullifier).length
        },
        performance: {
          verificationTime,
          gasEstimate
        }
      };
      
      // Log results
      if (isValid && chainReady) {
        console.log(`✅ ZKP Proof Verified — Chain Ready: ${chainReady} | Hash: ${verificationHash} | Time: ${verificationTime}ms`);
      } else {
        const errorMsg = errors.length > 0 ? errors[0] : 'unknown error';
        console.log(`⚠️ Verification failed — ${errorMsg} | Time: ${verificationTime}ms`);
      }
      
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const verificationTime = Math.round(endTime - startTime);
      
      console.error(`❌ ZKP verification error: ${error} | Time: ${verificationTime}ms`);
      
      return {
        isValid: false,
        chainReady: false,
        verificationHash: '',
        verifiedAt: new Date().toISOString(),
        errors: [`Verification error: ${error}`],
        metadata: {
          algorithm: 'groth16-mock',
          curve: 'unknown',
          protocol: 'unknown',
          publicSignalCount: 0,
          nullifierCount: 0
        },
        performance: {
          verificationTime,
          gasEstimate: 0
        }
      };
    }
  }
  
  // Verify specific proof component
  async verifyProofComponent(proof: AssembledZKPProof, component: keyof VerificationCriteria): Promise<boolean> {
    try {
      switch (component) {
        case 'proofStructure':
          return MockGroth16Verifier.verifyProofStructure(proof);
        case 'publicSignals':
          return MockGroth16Verifier.verifyPublicSignals(proof);
        case 'nullifierValidation':
          return MockGroth16Verifier.verifyNullifiers(proof);
        case 'timestampCheck':
          return MockGroth16Verifier.verifyTimestamp(proof);
        case 'signatureValidation':
          return MockGroth16Verifier.verifySignature(proof);
        default:
          return false;
      }
    } catch (error) {
      console.error(`❌ Component verification failed for ${component}:`, error);
      return false;
    }
  }
  
  // Get verification criteria breakdown
  async getVerificationCriteria(proof: AssembledZKPProof): Promise<VerificationCriteria> {
    return {
      proofStructure: await this.verifyProofComponent(proof, 'proofStructure'),
      publicSignals: await this.verifyProofComponent(proof, 'publicSignals'),
      nullifierValidation: await this.verifyProofComponent(proof, 'nullifierValidation'),
      timestampCheck: await this.verifyProofComponent(proof, 'timestampCheck'),
      signatureValidation: await this.verifyProofComponent(proof, 'signatureValidation')
    };
  }
  
  // Estimate verification gas cost
  estimateVerificationCost(proof: AssembledZKPProof): number {
    return MockGroth16Verifier.estimateGas(proof);
  }
  
  // Check if proof is ready for chain export
  isChainReady(verificationResult: VerificationResult): boolean {
    return verificationResult.isValid && 
           verificationResult.chainReady && 
           verificationResult.errors.length === 0;
  }
}

// Export utility functions
export const verifyZKPProof = async (assemblyResult: ZKPAssemblyResult): Promise<VerificationResult> => {
  const verifier = ZKPVerifierAgent.getInstance();
  return await verifier.verifyZKPProof(assemblyResult);
};

export const verifyProofComponent = async (proof: AssembledZKPProof, component: keyof VerificationCriteria): Promise<boolean> => {
  const verifier = ZKPVerifierAgent.getInstance();
  return await verifier.verifyProofComponent(proof, component);
};

export const getVerificationCriteria = async (proof: AssembledZKPProof): Promise<VerificationCriteria> => {
  const verifier = ZKPVerifierAgent.getInstance();
  return await verifier.getVerificationCriteria(proof);
};

export const isChainReady = (verificationResult: VerificationResult): boolean => {
  const verifier = ZKPVerifierAgent.getInstance();
  return verifier.isChainReady(verificationResult);
};

export default ZKPVerifierAgent;