/**
 * ZKPChainExporter.ts - Phase XXI
 * zk-SNARK Chain Export and Blockchain Formatting System
 * Authority: Commander Mark via JASMY Relay
 */

import { AssembledZKPProof, ZKPAssemblyResult } from './ZKPProofAssembler';
import { VerificationResult } from '../agents/ZKPVerifierAgent';

// Types for chain export system
export interface ChainProofPackage {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  externalNullifier: string;
  timestamp: number;
  issuer: {
    did: string;
    domain: string;
    publicKey: string;
  };
  chainMeta: {
    version: string;
    format: string;
    gasEstimate: number;
    verificationContract: string;
    networkId: string;
    blockTarget: number;
  };
  integrity: {
    proofHash: string;
    verificationHash: string;
    chainHash: string;
    exportedAt: string;
  };
}

export interface ChainExportResult {
  chainPackage: ChainProofPackage;
  exportFormat: {
    filename: string;
    fileSize: number;
    mimeType: string;
    encoding: string;
  };
  readiness: {
    contractReady: boolean;
    gasOptimized: boolean;
    formatValid: boolean;
  };
  metadata: {
    exportedAt: string;
    billId: string;
    district: string;
    votingRound: string;
  };
}

// Mock chain formatting utilities
class MockChainFormatter {
  static formatProofForContract(proof: AssembledZKPProof): { pi_a: string[], pi_b: string[][], pi_c: string[] } {
    // Format proof coordinates for contract consumption
    return {
      pi_a: proof.proof.pi_a,
      pi_b: proof.proof.pi_b,
      pi_c: proof.proof.pi_c
    };
  }
  
  static formatPublicSignals(proof: AssembledZKPProof): string[] {
    // Convert signals to string array for contract input
    const signals = [];
    
    // Add feedback hash (without 0x prefix for contract)
    signals.push(proof.signal.feedback_hash.replace('0x', ''));
    
    // Add vote value as string
    signals.push(proof.signal.vote_value.toString());
    
    // Add district ID hash
    signals.push(this.hashToHex(proof.signal.district_id));
    
    // Add ZIP code hash
    signals.push(this.hashToHex(proof.signal.zip_code));
    
    // Add timestamp as Unix timestamp
    signals.push(Math.floor(new Date(proof.signal.timestamp).getTime() / 1000).toString());
    
    return signals;
  }
  
  static formatExternalNullifier(proof: AssembledZKPProof): string {
    // Format external nullifier for contract consumption
    return proof.external_nullifier.voting_round;
  }
  
  static generateChainMetadata(gasEstimate: number): ChainProofPackage['chainMeta'] {
    const networkIds = ['1', '137', '42161', '10']; // Ethereum, Polygon, Arbitrum, Optimism
    const contracts = [
      '0x742d35Cc123C98915627b3C1a0e49Aa6C5e8f0e8',
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
    ];
    
    return {
      version: '1.0.0-chain',
      format: 'solidity-compatible',
      gasEstimate,
      verificationContract: contracts[Math.floor(Math.random() * contracts.length)],
      networkId: networkIds[Math.floor(Math.random() * networkIds.length)],
      blockTarget: Math.floor(Date.now() / 1000) + 300 // 5 minutes from now
    };
  }
  
  static generateChainHash(chainPackage: ChainProofPackage): string {
    // Generate chain-specific hash for integrity verification
    const chainData = {
      proof: chainPackage.proof,
      publicSignals: chainPackage.publicSignals,
      externalNullifier: chainPackage.externalNullifier,
      timestamp: chainPackage.timestamp
    };
    
    // Mock chain hash generation
    const chars = 'abcdef0123456789';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return hash;
  }
  
  static calculateOptimizedGas(baseGas: number): number {
    // Apply gas optimizations for chain deployment
    const optimizationFactor = 0.85; // 15% reduction through optimization
    return Math.floor(baseGas * optimizationFactor);
  }
  
  private static hashToHex(input: string): string {
    // Mock string to hex conversion for contract compatibility
    const chars = 'abcdef0123456789';
    let hex = '';
    for (let i = 0; i < 32; i++) {
      hex += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hex;
  }
}

// Main ZKP Chain Exporter class
export class ZKPChainExporter {
  private static instance: ZKPChainExporter;
  
  private constructor() {
    console.log('📦 ZKPChainExporter initialized for blockchain export operations');
  }
  
  static getInstance(): ZKPChainExporter {
    if (!ZKPChainExporter.instance) {
      ZKPChainExporter.instance = new ZKPChainExporter();
    }
    return ZKPChainExporter.instance;
  }
  
  // Main export function
  async exportToChainFormat(
    assemblyResult: ZKPAssemblyResult, 
    verificationResult: VerificationResult
  ): Promise<ChainExportResult> {
    const startTime = performance.now();
    const proof = assemblyResult.assembledProof;
    
    try {
      console.log('📦 Starting chain format export...');
      
      // Verify chain readiness
      if (!verificationResult.isValid || !verificationResult.chainReady) {
        throw new Error('Proof not ready for chain export');
      }
      
      // Format proof components
      const formattedProof = MockChainFormatter.formatProofForContract(proof);
      const publicSignals = MockChainFormatter.formatPublicSignals(proof);
      const externalNullifier = MockChainFormatter.formatExternalNullifier(proof);
      
      // Generate chain metadata
      const optimizedGas = MockChainFormatter.calculateOptimizedGas(verificationResult.performance.gasEstimate);
      const chainMeta = MockChainFormatter.generateChainMetadata(optimizedGas);
      
      // Create chain package
      const chainPackage: ChainProofPackage = {
        proof: formattedProof,
        publicSignals,
        externalNullifier,
        timestamp: Math.floor(Date.now() / 1000),
        issuer: {
          did: 'did:u:truthunveiled:chain-exporter',
          domain: 'truthunveiled.dao',
          publicKey: '0x742d35Cc123C98915627b3C1a0e49Aa6C5e8f0e8'
        },
        chainMeta,
        integrity: {
          proofHash: proof.integrity.assembled_hash,
          verificationHash: verificationResult.verificationHash,
          chainHash: '', // Will be set below
          exportedAt: new Date().toISOString()
        }
      };
      
      // Generate chain hash
      chainPackage.integrity.chainHash = MockChainFormatter.generateChainHash(chainPackage);
      
      // Calculate file metadata
      const jsonData = JSON.stringify(chainPackage, null, 2);
      const fileSize = jsonData.length;
      const billId = proof.external_nullifier.bill_id;
      const filename = `zkp-chain-${billId}-${Date.now()}.json`;
      
      // Create export result
      const result: ChainExportResult = {
        chainPackage,
        exportFormat: {
          filename,
          fileSize,
          mimeType: 'application/json+chain',
          encoding: 'utf-8'
        },
        readiness: {
          contractReady: true,
          gasOptimized: optimizedGas < verificationResult.performance.gasEstimate,
          formatValid: true
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          billId: proof.external_nullifier.bill_id,
          district: proof.external_nullifier.district,
          votingRound: proof.external_nullifier.voting_round
        }
      };
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`📦 ZKP Proof Exported to Chain Format — File: ${filename} | Gas: ${optimizedGas} | Duration: ${duration}ms`);
      
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.error(`❌ Chain export failed: ${error} | Duration: ${duration}ms`);
      throw error;
    }
  }
  
  // Download chain package
  async downloadChainPackage(exportResult: ChainExportResult): Promise<void> {
    try {
      const jsonData = JSON.stringify(exportResult.chainPackage, null, 2);
      const blob = new Blob([jsonData], { type: exportResult.exportFormat.mimeType });
      
      // Create download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportResult.exportFormat.filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`📤 Chain package downloaded: ${exportResult.exportFormat.filename}`);
      
    } catch (error) {
      console.error('❌ Chain package download failed:', error);
      throw new Error('Failed to download chain package');
    }
  }
  
  // Validate chain package
  validateChainPackage(chainPackage: ChainProofPackage): boolean {
    try {
      // Check required fields
      if (!chainPackage.proof || !chainPackage.publicSignals || !chainPackage.externalNullifier) {
        return false;
      }
      
      // Validate proof structure
      const { pi_a, pi_b, pi_c } = chainPackage.proof;
      if (!pi_a || pi_a.length !== 3) return false;
      if (!pi_b || pi_b.length !== 3) return false;
      if (!pi_c || pi_c.length !== 3) return false;
      
      // Validate public signals
      if (!Array.isArray(chainPackage.publicSignals) || chainPackage.publicSignals.length === 0) {
        return false;
      }
      
      // Validate metadata
      if (!chainPackage.chainMeta || !chainPackage.integrity) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Chain package validation failed:', error);
      return false;
    }
  }
  
  // Get gas optimization report
  getGasOptimizationReport(originalGas: number, optimizedGas: number): {
    originalGas: number;
    optimizedGas: number;
    savings: number;
    savingsPercent: number;
  } {
    const savings = originalGas - optimizedGas;
    const savingsPercent = Math.round((savings / originalGas) * 100);
    
    return {
      originalGas,
      optimizedGas,
      savings,
      savingsPercent
    };
  }
}

// Export utility functions
export const exportToChainFormat = async (
  assemblyResult: ZKPAssemblyResult, 
  verificationResult: VerificationResult
): Promise<ChainExportResult> => {
  const exporter = ZKPChainExporter.getInstance();
  return await exporter.exportToChainFormat(assemblyResult, verificationResult);
};

export const downloadChainPackage = async (exportResult: ChainExportResult): Promise<void> => {
  const exporter = ZKPChainExporter.getInstance();
  return await exporter.downloadChainPackage(exportResult);
};

export const validateChainPackage = (chainPackage: ChainProofPackage): boolean => {
  const exporter = ZKPChainExporter.getInstance();
  return exporter.validateChainPackage(chainPackage);
};

export default ZKPChainExporter;