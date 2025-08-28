/**
 * CivicIdentityMinter.ts - Phase XXIII
 * Civic Identity Credential Generation Engine
 * Authority: Commander Mark via JASMY Relay
 */

// Types for Civic Identity System
export interface CivicIdentityToken {
  cid: string;
  issuedAt: string;
  tier: CivicTier;
  trustIndex: number;
  streakDays: number;
  metadata: {
    issuer: string;
    version: string;
    network: string;
    validUntil: string;
    lastActivity: string;
    voteCount: number;
    engagementScore: number;
  };
}

export interface IdentityMintingResult {
  success: boolean;
  identity?: CivicIdentityToken;
  error?: string;
  metadata: {
    mintedAt: string;
    processingTime: number;
    validationPassed: boolean;
    tierAssigned: boolean;
  };
}

export interface UserActivityProfile {
  did: string;
  trustIndex: number;
  streakDays: number;
  voteHistory: number;
  engagementLevel: number;
  lastActiveAt: string;
  reputation: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export type CivicTier = 'Citizen' | 'Moderator' | 'Governor' | 'Commander';

// Mock activity data service
class MockActivityService {
  private static activityProfiles: Map<string, UserActivityProfile> = new Map([
    ['did:civic:commander-mark', {
      did: 'did:civic:commander-mark',
      trustIndex: 95,
      streakDays: 14,
      voteHistory: 87,
      engagementLevel: 92,
      lastActiveAt: new Date().toISOString(),
      reputation: { positive: 89, neutral: 8, negative: 3 }
    }],
    ['did:civic:verifier-alice', {
      did: 'did:civic:verifier-alice',
      trustIndex: 81,
      streakDays: 6,
      voteHistory: 34,
      engagementLevel: 78,
      lastActiveAt: new Date().toISOString(),
      reputation: { positive: 72, neutral: 22, negative: 6 }
    }],
    ['did:civic:citizen-bob', {
      did: 'did:civic:citizen-bob',
      trustIndex: 67,
      streakDays: 3,
      voteHistory: 12,
      engagementLevel: 54,
      lastActiveAt: new Date().toISOString(),
      reputation: { positive: 58, neutral: 31, negative: 11 }
    }]
  ]);
  
  static getActivityProfile(did: string): UserActivityProfile {
    // Return existing profile or generate new one
    if (MockActivityService.activityProfiles.has(did)) {
      return MockActivityService.activityProfiles.get(did)!;
    }
    
    // Generate mock profile for new DID
    const profile: UserActivityProfile = {
      did,
      trustIndex: Math.floor(Math.random() * 40 + 50), // 50-90
      streakDays: Math.floor(Math.random() * 10 + 1), // 1-10
      voteHistory: Math.floor(Math.random() * 25 + 5), // 5-30
      engagementLevel: Math.floor(Math.random() * 35 + 45), // 45-80
      lastActiveAt: new Date().toISOString(),
      reputation: {
        positive: Math.floor(Math.random() * 30 + 50), // 50-80
        neutral: Math.floor(Math.random() * 25 + 15), // 15-40
        negative: Math.floor(Math.random() * 15 + 5)   // 5-20
      }
    };
    
    MockActivityService.activityProfiles.set(did, profile);
    return profile;
  }
  
  static determineTier(profile: UserActivityProfile): CivicTier {
    // Tier determination based on trust index and engagement
    const { trustIndex, engagementLevel, voteHistory } = profile;
    
    if (profile.did.includes('commander')) return 'Commander';
    if (trustIndex >= 90 && engagementLevel >= 85 && voteHistory >= 50) return 'Governor';
    if (trustIndex >= 75 && engagementLevel >= 70 && voteHistory >= 25) return 'Moderator';
    return 'Citizen';
  }
  
  static generateCID(did: string, tier: CivicTier): string {
    // Generate CID from DID pattern
    const username = did.split(':').pop() || 'user';
    const tierCode = tier.charAt(0).toLowerCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    
    return `cid:${tierCode}:${username}:${randomSuffix}`;
  }
  
  static calculateValidityPeriod(): string {
    // 1 year validity
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    return validUntil.toISOString();
  }
}

// Main Civic Identity Minter class
export class CivicIdentityMinter {
  private static instance: CivicIdentityMinter;
  
  private constructor() {
    console.log('🪪 CivicIdentityMinter initialized for identity credential generation');
  }
  
  static getInstance(): CivicIdentityMinter {
    if (!CivicIdentityMinter.instance) {
      CivicIdentityMinter.instance = new CivicIdentityMinter();
    }
    return CivicIdentityMinter.instance;
  }
  
  // Main identity minting function
  async mintCivicIdentity(did: string): Promise<IdentityMintingResult> {
    const startTime = performance.now();
    
    try {
      console.log('🪪 Starting civic identity minting process...');
      
      // Validate DID format
      if (!this.validateDIDFormat(did)) {
        throw new Error('Invalid DID format');
      }
      
      // Get user activity profile
      const profile = MockActivityService.getActivityProfile(did);
      
      // Determine civic tier
      const tier = MockActivityService.determineTier(profile);
      
      // Generate CID
      const cid = MockActivityService.generateCID(did, tier);
      
      // Create civic identity token
      const identity: CivicIdentityToken = {
        cid,
        issuedAt: new Date().toISOString(),
        tier,
        trustIndex: profile.trustIndex,
        streakDays: profile.streakDays,
        metadata: {
          issuer: 'TruthUnveiled DAO Identity Registry',
          version: '1.0.0',
          network: 'civic-testnet',
          validUntil: MockActivityService.calculateValidityPeriod(),
          lastActivity: profile.lastActiveAt,
          voteCount: profile.voteHistory,
          engagementScore: profile.engagementLevel
        }
      };
      
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      
      console.log(`🪪 Civic Identity Minted — CID: ${cid} | Tier: ${tier} | Trust: ${profile.trustIndex} | Duration: ${processingTime}ms`);
      
      return {
        success: true,
        identity,
        metadata: {
          mintedAt: new Date().toISOString(),
          processingTime,
          validationPassed: true,
          tierAssigned: true
        }
      };
      
    } catch (error) {
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      
      console.error(`❌ Identity minting failed: ${error} | Duration: ${processingTime}ms`);
      
      return {
        success: false,
        error: `Minting failed: ${error}`,
        metadata: {
          mintedAt: new Date().toISOString(),
          processingTime,
          validationPassed: false,
          tierAssigned: false
        }
      };
    }
  }
  
  // Validate DID format
  private validateDIDFormat(did: string): boolean {
    try {
      // Basic DID format validation: did:method:identifier
      const didPattern = /^did:[a-z0-9]+:[a-zA-Z0-9\-_]+$/;
      return didPattern.test(did);
    } catch (error) {
      console.error('❌ DID validation error:', error);
      return false;
    }
  }
  
  // Get identity by CID
  async getIdentityByCID(cid: string): Promise<CivicIdentityToken | null> {
    try {
      // In a real implementation, this would query a registry
      // For now, we'll simulate lookup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log(`🔍 Looking up identity for CID: ${cid}`);
      
      // Mock lookup - would return null if not found
      return null;
      
    } catch (error) {
      console.error('❌ Identity lookup failed:', error);
      return null;
    }
  }
  
  // Verify identity validity
  async verifyIdentityValidity(identity: CivicIdentityToken): Promise<{
    isValid: boolean;
    reason: string;
    expiresIn: number; // days
  }> {
    try {
      const now = new Date();
      const validUntil = new Date(identity.metadata.validUntil);
      const expiresIn = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (expiresIn <= 0) {
        return {
          isValid: false,
          reason: 'Identity token has expired',
          expiresIn: 0
        };
      }
      
      if (!identity.cid || !identity.tier || identity.trustIndex < 0) {
        return {
          isValid: false,
          reason: 'Invalid identity structure',
          expiresIn
        };
      }
      
      return {
        isValid: true,
        reason: 'Identity is valid',
        expiresIn
      };
      
    } catch (error) {
      return {
        isValid: false,
        reason: `Verification error: ${error}`,
        expiresIn: 0
      };
    }
  }
  
  // Get activity profile for DID
  async getActivityProfile(did: string): Promise<UserActivityProfile> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      return MockActivityService.getActivityProfile(did);
    } catch (error) {
      console.error('❌ Activity profile retrieval failed:', error);
      throw error;
    }
  }
  
  // Update activity profile
  async updateActivityProfile(did: string, updates: Partial<UserActivityProfile>): Promise<boolean> {
    try {
      const profile = MockActivityService.getActivityProfile(did);
      const updatedProfile = { ...profile, ...updates };
      MockActivityService.activityProfiles.set(did, updatedProfile);
      
      console.log(`📊 Activity profile updated for ${did}`);
      return true;
      
    } catch (error) {
      console.error('❌ Activity profile update failed:', error);
      return false;
    }
  }
  
  // Get tier requirements
  getTierRequirements(): Record<CivicTier, {
    minTrustIndex: number;
    minEngagement: number;
    minVotes: number;
    description: string;
  }> {
    return {
      'Citizen': {
        minTrustIndex: 0,
        minEngagement: 0,
        minVotes: 0,
        description: 'Basic civic participation level'
      },
      'Moderator': {
        minTrustIndex: 75,
        minEngagement: 70,
        minVotes: 25,
        description: 'Trusted community moderator'
      },
      'Governor': {
        minTrustIndex: 90,
        minEngagement: 85,
        minVotes: 50,
        description: 'Governance leader with high trust'
      },
      'Commander': {
        minTrustIndex: 95,
        minEngagement: 90,
        minVotes: 75,
        description: 'System administrator with full access'
      }
    };
  }
}

// Export utility functions
export const mintCivicIdentity = async (did: string): Promise<IdentityMintingResult> => {
  const minter = CivicIdentityMinter.getInstance();
  return await minter.mintCivicIdentity(did);
};

export const getActivityProfile = async (did: string): Promise<UserActivityProfile> => {
  const minter = CivicIdentityMinter.getInstance();
  return await minter.getActivityProfile(did);
};

export const verifyIdentityValidity = async (identity: CivicIdentityToken): Promise<{
  isValid: boolean;
  reason: string;
  expiresIn: number;
}> => {
  const minter = CivicIdentityMinter.getInstance();
  return await minter.verifyIdentityValidity(identity);
};

export default CivicIdentityMinter;