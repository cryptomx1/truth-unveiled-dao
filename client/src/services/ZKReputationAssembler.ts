/**
 * ZKReputationAssembler.ts - Phase XXIII
 * Zero-Knowledge Reputation Hash Packager
 * Authority: Commander Mark via JASMY Relay
 */

import { CivicIdentityToken, UserActivityProfile } from '../identity/CivicIdentityMinter';

// Types for ZK Reputation System
export interface ZKReputationPayload {
  signal: string;
  epoch: string;
  proofHash: string;
  metadata: {
    cid: string;
    tier: string;
    trustIndex: number;
    streakDays: number;
    voteCount: number;
    engagementScore: number;
    assembledAt: string;
    validUntil: string;
  };
}

export interface ReputationAssemblyResult {
  success: boolean;
  payload?: ZKReputationPayload;
  error?: string;
  metadata: {
    assembledAt: string;
    processingTime: number;
    signalGenerated: boolean;
    hashComputed: boolean;
  };
}

export interface ReputationBundle {
  payload: ZKReputationPayload;
  identity: CivicIdentityToken;
  activityProfile: UserActivityProfile;
  exportMetadata: {
    bundleId: string;
    createdAt: string;
    version: string;
    fileSize: number;
  };
}

// Mock cryptographic utilities
class MockCryptoUtils {
  static generateSignal(inputs: number[]): string {
    // Simulate signal generation from numeric inputs
    const combined = inputs.reduce((acc, val) => acc + val, 0);
    const hash = this.simpleHash(combined.toString());
    return `0x${hash.substring(0, 16)}`;
  }
  
  static computeProofHash(signal: string, epoch: string, metadata: object): string {
    // Simulate SHA256 hash computation
    const input = `${signal}${epoch}${JSON.stringify(metadata)}`;
    const hash = this.simpleHash(input);
    return `sha256:${hash}`;
  }
  
  static getCurrentEpoch(): string {
    // Generate epoch from current year/month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }
  
  static generateBundleId(): string {
    // Generate unique bundle identifier
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'RB-';
    for (let i = 0; i < 12; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
  
  private static simpleHash(input: string): string {
    // Simple hash function for simulation
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to hex and pad
    const hex = Math.abs(hash).toString(16);
    return hex.padStart(64, '0');
  }
  
  static estimateBundleSize(bundle: ReputationBundle): number {
    // Estimate JSON file size in bytes
    const jsonString = JSON.stringify(bundle, null, 2);
    return new Blob([jsonString]).size;
  }
}

// Main ZK Reputation Assembler class
export class ZKReputationAssembler {
  private static instance: ZKReputationAssembler;
  
  private constructor() {
    console.log('🧬 ZKReputationAssembler initialized for reputation hash packaging');
  }
  
  static getInstance(): ZKReputationAssembler {
    if (!ZKReputationAssembler.instance) {
      ZKReputationAssembler.instance = new ZKReputationAssembler();
    }
    return ZKReputationAssembler.instance;
  }
  
  // Main reputation assembly function
  async assembleReputationProof(
    identity: CivicIdentityToken,
    activityProfile: UserActivityProfile
  ): Promise<ReputationAssemblyResult> {
    const startTime = performance.now();
    
    try {
      console.log('🧬 Starting reputation proof assembly...');
      
      // Validate inputs
      if (!this.validateInputs(identity, activityProfile)) {
        throw new Error('Invalid identity or activity profile');
      }
      
      // Generate signal from activity data
      const inputs = [
        identity.trustIndex,
        identity.streakDays,
        activityProfile.voteHistory,
        activityProfile.engagementLevel,
        activityProfile.reputation.positive
      ];
      
      const signal = MockCryptoUtils.generateSignal(inputs);
      
      // Get current epoch
      const epoch = MockCryptoUtils.getCurrentEpoch();
      
      // Prepare metadata for hash computation
      const hashMetadata = {
        cid: identity.cid,
        tier: identity.tier,
        trustIndex: identity.trustIndex,
        streakDays: identity.streakDays,
        voteCount: activityProfile.voteHistory,
        engagementScore: activityProfile.engagementLevel
      };
      
      // Compute proof hash
      const proofHash = MockCryptoUtils.computeProofHash(signal, epoch, hashMetadata);
      
      // Calculate validity period (6 months for reputation)
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 6);
      
      // Create reputation payload
      const payload: ZKReputationPayload = {
        signal,
        epoch,
        proofHash,
        metadata: {
          cid: identity.cid,
          tier: identity.tier,
          trustIndex: identity.trustIndex,
          streakDays: identity.streakDays,
          voteCount: activityProfile.voteHistory,
          engagementScore: activityProfile.engagementLevel,
          assembledAt: new Date().toISOString(),
          validUntil: validUntil.toISOString()
        }
      };
      
      // Simulate assembly processing time
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
      
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      
      console.log(`🧬 Reputation proof assembled — Trust: ${identity.trustIndex}, Streak: ${identity.streakDays} | Signal: ${signal} | Duration: ${processingTime}ms`);
      
      return {
        success: true,
        payload,
        metadata: {
          assembledAt: new Date().toISOString(),
          processingTime,
          signalGenerated: true,
          hashComputed: true
        }
      };
      
    } catch (error) {
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      
      console.error(`❌ Reputation assembly failed: ${error} | Duration: ${processingTime}ms`);
      
      return {
        success: false,
        error: `Assembly failed: ${error}`,
        metadata: {
          assembledAt: new Date().toISOString(),
          processingTime,
          signalGenerated: false,
          hashComputed: false
        }
      };
    }
  }
  
  // Create complete reputation bundle
  async createReputationBundle(
    identity: CivicIdentityToken,
    activityProfile: UserActivityProfile
  ): Promise<ReputationBundle | null> {
    try {
      const assemblyResult = await this.assembleReputationProof(identity, activityProfile);
      
      if (!assemblyResult.success || !assemblyResult.payload) {
        throw new Error(assemblyResult.error || 'Assembly failed');
      }
      
      const bundle: ReputationBundle = {
        payload: assemblyResult.payload,
        identity,
        activityProfile,
        exportMetadata: {
          bundleId: MockCryptoUtils.generateBundleId(),
          createdAt: new Date().toISOString(),
          version: '1.0.0',
          fileSize: 0 // Will be calculated after bundle creation
        }
      };
      
      // Calculate bundle size
      bundle.exportMetadata.fileSize = MockCryptoUtils.estimateBundleSize(bundle);
      
      return bundle;
      
    } catch (error) {
      console.error('❌ Bundle creation failed:', error);
      return null;
    }
  }
  
  // Export reputation bundle as downloadable file
  async exportReputationBundle(bundle: ReputationBundle): Promise<{
    success: boolean;
    filename: string;
    error?: string;
  }> {
    try {
      const startTime = performance.now();
      
      // Generate filename from CID
      const cidSafe = bundle.identity.cid.replace(/:/g, '-').replace(/\//g, '-');
      const filename = `zkp-rep-${cidSafe}.json`;
      
      // Convert bundle to JSON
      const jsonData = JSON.stringify(bundle, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`📦 Exported reputation bundle: ${filename} | Size: ${bundle.exportMetadata.fileSize} bytes | Duration: ${duration}ms`);
      
      return {
        success: true,
        filename
      };
      
    } catch (error) {
      console.error('❌ Bundle export failed:', error);
      return {
        success: false,
        filename: '',
        error: `Export failed: ${error}`
      };
    }
  }
  
  // Validate inputs for assembly
  private validateInputs(identity: CivicIdentityToken, activityProfile: UserActivityProfile): boolean {
    try {
      // Validate identity
      if (!identity.cid || !identity.tier || identity.trustIndex < 0 || identity.streakDays < 0) {
        return false;
      }
      
      // Validate activity profile
      if (!activityProfile.did || activityProfile.trustIndex < 0 || activityProfile.voteHistory < 0) {
        return false;
      }
      
      // Validate consistency between identity and profile
      if (identity.trustIndex !== activityProfile.trustIndex) {
        console.warn('⚠️ Trust index mismatch between identity and profile');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Input validation error:', error);
      return false;
    }
  }
  
  // Verify reputation payload integrity
  async verifyReputationPayload(payload: ZKReputationPayload): Promise<{
    isValid: boolean;
    reason: string;
    components: {
      signalValid: boolean;
      epochValid: boolean;
      hashValid: boolean;
      metadataValid: boolean;
    };
  }> {
    try {
      const components = {
        signalValid: payload.signal.startsWith('0x') && payload.signal.length === 18,
        epochValid: /^\d{6}$/.test(payload.epoch),
        hashValid: payload.proofHash.startsWith('sha256:') && payload.proofHash.length === 71,
        metadataValid: payload.metadata && payload.metadata.cid && payload.metadata.tier
      };
      
      const isValid = Object.values(components).every(valid => valid);
      
      return {
        isValid,
        reason: isValid ? 'Payload is valid' : 'Invalid payload structure',
        components
      };
      
    } catch (error) {
      return {
        isValid: false,
        reason: `Verification error: ${error}`,
        components: {
          signalValid: false,
          epochValid: false,
          hashValid: false,
          metadataValid: false
        }
      };
    }
  }
  
  // Get reputation statistics
  getReputationStatistics(payload: ZKReputationPayload): {
    tier: string;
    trustLevel: 'Low' | 'Medium' | 'High' | 'Excellent';
    streakCategory: 'Newcomer' | 'Regular' | 'Dedicated' | 'Champion';
    overallRating: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  } {
    const { trustIndex, streakDays, tier } = payload.metadata;
    
    // Determine trust level
    let trustLevel: 'Low' | 'Medium' | 'High' | 'Excellent' = 'Low';
    if (trustIndex >= 90) trustLevel = 'Excellent';
    else if (trustIndex >= 75) trustLevel = 'High';
    else if (trustIndex >= 60) trustLevel = 'Medium';
    
    // Determine streak category
    let streakCategory: 'Newcomer' | 'Regular' | 'Dedicated' | 'Champion' = 'Newcomer';
    if (streakDays >= 14) streakCategory = 'Champion';
    else if (streakDays >= 7) streakCategory = 'Dedicated';
    else if (streakDays >= 3) streakCategory = 'Regular';
    
    // Determine overall rating
    let overallRating: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
    if (tier === 'Commander' || (trustLevel === 'Excellent' && streakCategory === 'Champion')) {
      overallRating = 'Platinum';
    } else if (tier === 'Governor' || (trustLevel === 'High' && streakDays >= 7)) {
      overallRating = 'Gold';
    } else if (tier === 'Moderator' || trustLevel === 'Medium') {
      overallRating = 'Silver';
    }
    
    return {
      tier,
      trustLevel,
      streakCategory,
      overallRating
    };
  }
}

// Export utility functions
export const assembleReputationProof = async (
  identity: CivicIdentityToken,
  activityProfile: UserActivityProfile
): Promise<ReputationAssemblyResult> => {
  const assembler = ZKReputationAssembler.getInstance();
  return await assembler.assembleReputationProof(identity, activityProfile);
};

export const createReputationBundle = async (
  identity: CivicIdentityToken,
  activityProfile: UserActivityProfile
): Promise<ReputationBundle | null> => {
  const assembler = ZKReputationAssembler.getInstance();
  return await assembler.createReputationBundle(identity, activityProfile);
};

export const exportReputationBundle = async (bundle: ReputationBundle): Promise<{
  success: boolean;
  filename: string;
  error?: string;
}> => {
  const assembler = ZKReputationAssembler.getInstance();
  return await assembler.exportReputationBundle(bundle);
};

export default ZKReputationAssembler;