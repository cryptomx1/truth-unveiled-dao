/**
 * IdentityVaultCore.ts - Phase XXIV
 * Secure Identity Vault for Civic Identity Tokens & ZKP Bundles
 * Authority: Commander Mark via JASMY Relay
 */

import { CivicIdentityToken, UserActivityProfile } from './CivicIdentityMinter';
import { ReputationBundle } from '../services/ZKReputationAssembler';

// Types for Identity Vault System
export interface VaultEntry {
  entryId: string;
  cid: string;
  did: string;
  identity: CivicIdentityToken;
  reputationBundle: ReputationBundle | null;
  metadata: {
    storedAt: string;
    expiresAt: string;
    lastAccessed: string;
    accessCount: number;
    biometricHash?: string;
    passphraseHash?: string;
    refreshHistory: RefreshRecord[];
  };
  status: 'active' | 'expired' | 'locked' | 'refreshing';
}

export interface RefreshRecord {
  refreshId: string;
  refreshedAt: string;
  oldEpoch: string;
  newEpoch: string;
  biometricUsed: boolean;
  trustIndexChange: number;
  reason: 'expiry' | 'user_request' | 'security_update';
}

export interface VaultUnlockResult {
  success: boolean;
  entry?: VaultEntry;
  error?: string;
  unlockMethod: 'biometric' | 'passphrase';
  metadata: {
    unlockedAt: string;
    accessCount: number;
    remainingAttempts: number;
  };
}

export interface BiometricSession {
  sessionId: string;
  did: string;
  startedAt: string;
  expiresAt: string;
  verified: boolean;
  biometricType: 'fingerprint' | 'facial' | 'retinal';
  qualityScore: number;
}

// Mock biometric utilities
class MockBiometricUtils {
  private static sessions: Map<string, BiometricSession> = new Map();
  
  static generateBiometricHash(data: string): string {
    // Simulate biometric hash generation
    const hash = this.simpleHash(`biometric:${data}:${Date.now()}`);
    return `bio:${hash.substring(0, 32)}`;
  }
  
  static generatePassphraseHash(passphrase: string): string {
    // Simulate passphrase hash generation
    const hash = this.simpleHash(`passphrase:${passphrase}:salt`);
    return `pass:${hash.substring(0, 32)}`;
  }
  
  static createBiometricSession(did: string): BiometricSession {
    const sessionId = `bio-sess-${Math.random().toString(36).substring(2, 12)}`;
    const session: BiometricSession = {
      sessionId,
      did,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      verified: false,
      biometricType: 'fingerprint',
      qualityScore: Math.floor(Math.random() * 20 + 80) // 80-100
    };
    
    MockBiometricUtils.sessions.set(sessionId, session);
    return session;
  }
  
  static verifyBiometric(sessionId: string, biometricData: string): {
    success: boolean;
    qualityScore: number;
    reason: string;
  } {
    const session = MockBiometricUtils.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        qualityScore: 0,
        reason: 'Invalid session'
      };
    }
    
    if (new Date() > new Date(session.expiresAt)) {
      return {
        success: false,
        qualityScore: 0,
        reason: 'Session expired'
      };
    }
    
    // Simulate biometric verification (85% success rate)
    const success = Math.random() > 0.15;
    const qualityScore = success ? Math.floor(Math.random() * 15 + 85) : Math.floor(Math.random() * 40 + 20);
    
    if (success) {
      session.verified = true;
      session.qualityScore = qualityScore;
    }
    
    return {
      success,
      qualityScore,
      reason: success ? 'Biometric verified' : 'Biometric mismatch'
    };
  }
  
  private static simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}

// Main Identity Vault Core class
export class IdentityVaultCore {
  private static instance: IdentityVaultCore;
  private vault: Map<string, VaultEntry> = new Map();
  private unlockAttempts: Map<string, number> = new Map();
  private readonly maxUnlockAttempts = 3;
  private readonly entryLifetimeDays = 365;
  
  private constructor() {
    console.log('🔐 IdentityVaultCore initialized for secure identity storage');
    this.initializeMockEntries();
    this.startExpirySweep();
  }
  
  static getInstance(): IdentityVaultCore {
    if (!IdentityVaultCore.instance) {
      IdentityVaultCore.instance = new IdentityVaultCore();
    }
    return IdentityVaultCore.instance;
  }
  
  // Store identity in vault
  async storeIdentity(
    identity: CivicIdentityToken,
    reputationBundle: ReputationBundle | null,
    biometricData?: string,
    passphrase?: string
  ): Promise<{
    success: boolean;
    entryId?: string;
    error?: string;
  }> {
    try {
      console.log('🔐 Storing identity in vault...');
      
      // Validate inputs
      if (!identity.cid || !identity.tier) {
        throw new Error('Invalid identity token');
      }
      
      // Generate entry ID
      const entryId = `vault-${identity.cid.replace(/:/g, '-')}-${Date.now()}`;
      
      // Calculate expiry (365 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.entryLifetimeDays);
      
      // Create vault entry
      const entry: VaultEntry = {
        entryId,
        cid: identity.cid,
        did: identity.metadata.lastActivity || 'unknown',
        identity,
        reputationBundle,
        metadata: {
          storedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 0,
          biometricHash: biometricData ? MockBiometricUtils.generateBiometricHash(biometricData) : undefined,
          passphraseHash: passphrase ? MockBiometricUtils.generatePassphraseHash(passphrase) : undefined,
          refreshHistory: []
        },
        status: 'active'
      };
      
      // Store in vault
      this.vault.set(entryId, entry);
      
      console.log(`🔐 Vault entry created — CID: ${identity.cid} | Entry ID: ${entryId} | Expires: ${expiresAt.toLocaleDateString()}`);
      
      return {
        success: true,
        entryId
      };
      
    } catch (error) {
      console.error('❌ Vault storage failed:', error);
      return {
        success: false,
        error: `Storage failed: ${error}`
      };
    }
  }
  
  // Unlock vault entry
  async unlockEntry(
    entryId: string,
    unlockMethod: 'biometric' | 'passphrase',
    unlockData: string
  ): Promise<VaultUnlockResult> {
    try {
      const entry = this.vault.get(entryId);
      if (!entry) {
        throw new Error('Entry not found');
      }
      
      // Check if entry is expired
      if (new Date() > new Date(entry.metadata.expiresAt)) {
        entry.status = 'expired';
        throw new Error('Entry has expired');
      }
      
      // Check unlock attempts
      const attempts = this.unlockAttempts.get(entryId) || 0;
      if (attempts >= this.maxUnlockAttempts) {
        entry.status = 'locked';
        throw new Error('Maximum unlock attempts exceeded');
      }
      
      // Verify unlock method
      let unlockSuccess = false;
      
      if (unlockMethod === 'biometric' && entry.metadata.biometricHash) {
        const testHash = MockBiometricUtils.generateBiometricHash(unlockData);
        unlockSuccess = testHash === entry.metadata.biometricHash;
      } else if (unlockMethod === 'passphrase' && entry.metadata.passphraseHash) {
        const testHash = MockBiometricUtils.generatePassphraseHash(unlockData);
        unlockSuccess = testHash === entry.metadata.passphraseHash;
      }
      
      if (!unlockSuccess) {
        this.unlockAttempts.set(entryId, attempts + 1);
        throw new Error('Unlock verification failed');
      }
      
      // Update access metadata
      entry.metadata.lastAccessed = new Date().toISOString();
      entry.metadata.accessCount += 1;
      
      // Reset unlock attempts
      this.unlockAttempts.delete(entryId);
      
      console.log(`🔓 Vault entry unlocked — CID: ${entry.cid} | Method: ${unlockMethod} | Access count: ${entry.metadata.accessCount}`);
      
      return {
        success: true,
        entry,
        unlockMethod,
        metadata: {
          unlockedAt: new Date().toISOString(),
          accessCount: entry.metadata.accessCount,
          remainingAttempts: this.maxUnlockAttempts
        }
      };
      
    } catch (error) {
      const attempts = this.unlockAttempts.get(entryId) || 0;
      
      console.error(`❌ Vault unlock failed: ${error} | Attempts: ${attempts + 1}/${this.maxUnlockAttempts}`);
      
      return {
        success: false,
        error: `Unlock failed: ${error}`,
        unlockMethod,
        metadata: {
          unlockedAt: new Date().toISOString(),
          accessCount: 0,
          remainingAttempts: this.maxUnlockAttempts - (attempts + 1)
        }
      };
    }
  }
  
  // Refresh identity in vault
  async refreshIdentity(
    entryId: string,
    biometricSession: BiometricSession,
    updatedProfile: UserActivityProfile,
    reason: 'expiry' | 'user_request' | 'security_update' = 'user_request'
  ): Promise<{
    success: boolean;
    refreshedEntry?: VaultEntry;
    refreshedBundle?: ReputationBundle;
    error?: string;
  }> {
    try {
      const entry = this.vault.get(entryId);
      if (!entry) {
        throw new Error('Entry not found');
      }
      
      // Verify biometric session
      if (!biometricSession.verified) {
        throw new Error('Biometric session not verified');
      }
      
      console.log('🔄 Starting identity refresh...');
      
      // Update entry status
      entry.status = 'refreshing';
      
      // Calculate new epoch
      const now = new Date();
      const newEpoch = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const oldEpoch = entry.reputationBundle?.payload.epoch || 'unknown';
      
      // Update identity with new metrics
      const refreshedIdentity: CivicIdentityToken = {
        ...entry.identity,
        trustIndex: updatedProfile.trustIndex,
        streakDays: updatedProfile.streakDays,
        metadata: {
          ...entry.identity.metadata,
          lastActivity: updatedProfile.lastActiveAt,
          voteCount: updatedProfile.voteHistory,
          engagementScore: updatedProfile.engagementLevel
        }
      };
      
      // Create new reputation bundle if original exists
      let refreshedBundle: ReputationBundle | null = null;
      if (entry.reputationBundle) {
        refreshedBundle = {
          ...entry.reputationBundle,
          payload: {
            ...entry.reputationBundle.payload,
            epoch: newEpoch,
            metadata: {
              ...entry.reputationBundle.payload.metadata,
              trustIndex: updatedProfile.trustIndex,
              streakDays: updatedProfile.streakDays,
              voteCount: updatedProfile.voteHistory,
              engagementScore: updatedProfile.engagementLevel,
              assembledAt: new Date().toISOString()
            }
          },
          activityProfile: updatedProfile,
          exportMetadata: {
            ...entry.reputationBundle.exportMetadata,
            createdAt: new Date().toISOString()
          }
        };
      }
      
      // Create refresh record
      const refreshRecord: RefreshRecord = {
        refreshId: `refresh-${Date.now()}`,
        refreshedAt: new Date().toISOString(),
        oldEpoch,
        newEpoch,
        biometricUsed: true,
        trustIndexChange: updatedProfile.trustIndex - entry.identity.trustIndex,
        reason
      };
      
      // Update vault entry
      entry.identity = refreshedIdentity;
      entry.reputationBundle = refreshedBundle;
      entry.metadata.refreshHistory.push(refreshRecord);
      entry.metadata.lastAccessed = new Date().toISOString();
      entry.status = 'active';
      
      // Extend expiry by 365 days
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + this.entryLifetimeDays);
      entry.metadata.expiresAt = newExpiryDate.toISOString();
      
      console.log(`🔐 Vault updated — CID: ${entry.cid} → epoch ${newEpoch} | Trust change: ${refreshRecord.trustIndexChange > 0 ? '+' : ''}${refreshRecord.trustIndexChange}`);
      
      return {
        success: true,
        refreshedEntry: entry,
        refreshedBundle: refreshedBundle || undefined
      };
      
    } catch (error) {
      console.error('❌ Identity refresh failed:', error);
      
      // Reset entry status on failure
      const entry = this.vault.get(entryId);
      if (entry) {
        entry.status = 'active';
      }
      
      return {
        success: false,
        error: `Refresh failed: ${error}`
      };
    }
  }
  
  // Get all vault entries
  getVaultEntries(): VaultEntry[] {
    return Array.from(this.vault.values());
  }
  
  // Get entry by ID
  getEntryById(entryId: string): VaultEntry | null {
    return this.vault.get(entryId) || null;
  }
  
  // Get entries by DID
  getEntriesByDID(did: string): VaultEntry[] {
    return Array.from(this.vault.values()).filter(entry => entry.did === did);
  }
  
  // Check entry expiry status
  checkExpiryStatus(entryId: string): {
    isExpired: boolean;
    daysUntilExpiry: number;
    shouldRefresh: boolean;
  } {
    const entry = this.vault.get(entryId);
    if (!entry) {
      return {
        isExpired: true,
        daysUntilExpiry: 0,
        shouldRefresh: false
      };
    }
    
    const now = new Date();
    const expiry = new Date(entry.metadata.expiresAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isExpired: daysUntilExpiry <= 0,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      shouldRefresh: daysUntilExpiry <= 30 // Recommend refresh within 30 days
    };
  }
  
  // Delete vault entry
  async deleteEntry(entryId: string): Promise<boolean> {
    try {
      const entry = this.vault.get(entryId);
      if (!entry) {
        return false;
      }
      
      this.vault.delete(entryId);
      this.unlockAttempts.delete(entryId);
      
      console.log(`🗑️ Vault entry deleted — CID: ${entry.cid}`);
      return true;
      
    } catch (error) {
      console.error('❌ Entry deletion failed:', error);
      return false;
    }
  }
  
  // Initialize mock entries for testing
  private initializeMockEntries(): void {
    // This would normally be empty, but for testing we can add mock entries
    console.log('🔐 Vault initialized with empty storage');
  }
  
  // Start periodic expiry sweep
  private startExpirySweep(): void {
    setInterval(() => {
      const now = new Date();
      let expiredCount = 0;
      
      for (const [entryId, entry] of this.vault.entries()) {
        if (new Date(entry.metadata.expiresAt) < now && entry.status !== 'expired') {
          entry.status = 'expired';
          expiredCount++;
        }
      }
      
      if (expiredCount > 0) {
        console.log(`🔐 Expiry sweep completed — ${expiredCount} entries marked as expired`);
      }
    }, 60000); // Check every minute
  }
  
  // Get vault statistics
  getVaultStatistics(): {
    totalEntries: number;
    activeEntries: number;
    expiredEntries: number;
    lockedEntries: number;
    averageAccessCount: number;
    upcomingExpirations: number;
  } {
    const entries = Array.from(this.vault.values());
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      totalEntries: entries.length,
      activeEntries: entries.filter(e => e.status === 'active').length,
      expiredEntries: entries.filter(e => e.status === 'expired').length,
      lockedEntries: entries.filter(e => e.status === 'locked').length,
      averageAccessCount: entries.length > 0 ? entries.reduce((acc, e) => acc + e.metadata.accessCount, 0) / entries.length : 0,
      upcomingExpirations: entries.filter(e => new Date(e.metadata.expiresAt) < thirtyDaysFromNow && e.status === 'active').length
    };
  }
}

// Export utility functions
export const storeIdentityInVault = async (
  identity: CivicIdentityToken,
  reputationBundle: ReputationBundle | null,
  biometricData?: string,
  passphrase?: string
): Promise<{ success: boolean; entryId?: string; error?: string }> => {
  const vault = IdentityVaultCore.getInstance();
  return await vault.storeIdentity(identity, reputationBundle, biometricData, passphrase);
};

export const unlockVaultEntry = async (
  entryId: string,
  unlockMethod: 'biometric' | 'passphrase',
  unlockData: string
): Promise<VaultUnlockResult> => {
  const vault = IdentityVaultCore.getInstance();
  return await vault.unlockEntry(entryId, unlockMethod, unlockData);
};

export const refreshVaultIdentity = async (
  entryId: string,
  biometricSession: BiometricSession,
  updatedProfile: UserActivityProfile,
  reason?: 'expiry' | 'user_request' | 'security_update'
): Promise<{ success: boolean; refreshedEntry?: VaultEntry; refreshedBundle?: ReputationBundle; error?: string }> => {
  const vault = IdentityVaultCore.getInstance();
  return await vault.refreshIdentity(entryId, biometricSession, updatedProfile, reason);
};

export const createBiometricSession = (did: string): BiometricSession => {
  return MockBiometricUtils.createBiometricSession(did);
};

export const verifyBiometricSession = (sessionId: string, biometricData: string): {
  success: boolean;
  qualityScore: number;
  reason: string;
} => {
  return MockBiometricUtils.verifyBiometric(sessionId, biometricData);
};

export default IdentityVaultCore;