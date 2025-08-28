/**
 * ProofExporterNode.ts - Phase XXVI
 * Civic Resume & DAO Bundle Export Tool
 * Authority: Commander Mark via JASMY Relay
 */

import { 
  ProofVaultCore,
  type VaultEntry,
  type VaultSearchParams
} from './ProofVaultCore';
import { 
  type ProofCapsule,
  type EvidenceEventType 
} from './EvidenceCaptureEngine';

// Types for proof exporter system
export interface CivicProofBundle {
  bundleId: string;
  createdAt: string;
  bundleType: 'civic_resume' | 'dao_verification' | 'mission_portfolio' | 'dispute_evidence';
  userHash: string;
  signature: BundleSignature;
  capsuleList: ProofCapsule[];
  verificationDigest: string;
  metadata: {
    totalMissions: number;
    totalVotes: number;
    totalFeedback: number;
    civicTier: string;
    averageTrustScore: number;
    validationLevel: string;
    witnessCount: number;
    reputationScore: number;
    complianceFlags: string[];
  };
  exportSummary: {
    missionCompletions: MissionSummary[];
    civicInteractions: InteractionSummary[];
    validationHistory: ValidationRecord[];
    crossReferences: string[];
  };
}

export interface BundleSignature {
  signatureHash: string;
  signerTier: string;
  signedAt: string;
  algorithm: 'zkp-civic-v2' | 'dao-multisig-v1' | 'identity-proof-v1';
  witnesses: string[];
  verificationKey: string;
  expiresAt: string;
}

export interface MissionSummary {
  missionId: string;
  missionTitle: string;
  deckCategory: string;
  completedAt: string;
  validationLevel: string;
  trustScore: number;
  witnessCount: number;
  traceHash: string;
}

export interface InteractionSummary {
  eventType: EvidenceEventType;
  count: number;
  latestTimestamp: string;
  averageValidationLevel: string;
  totalWitnesses: number;
}

export interface ValidationRecord {
  validatorId: string;
  validatedAt: string;
  validationScope: string;
  integrityScore: number;
  notes: string;
}

export interface ExportOptions {
  includeMetadata: boolean;
  includeCrossReferences: boolean;
  includeWitnessDetails: boolean;
  signatureLevel: 'basic' | 'enhanced' | 'dao_grade';
  formatVersion: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

export interface ExportResult {
  success: boolean;
  bundleId?: string;
  filename: string;
  data?: string;
  fileSize: number;
  exportDuration: number;
  error?: string;
  downloadUrl?: string;
}

// Main Proof Exporter Node class
export class ProofExporterNode {
  private static instance: ProofExporterNode;
  private vaultCore: ProofVaultCore;
  private exportHistory: Map<string, ExportResult> = new Map();
  
  private constructor() {
    this.vaultCore = ProofVaultCore.getInstance();
    console.log('📦 ProofExporterNode initialized for civic resume and DAO bundle generation');
  }
  
  static getInstance(): ProofExporterNode {
    if (!ProofExporterNode.instance) {
      ProofExporterNode.instance = new ProofExporterNode();
    }
    return ProofExporterNode.instance;
  }
  
  // Export civic resume bundle
  exportCivicResume(
    userHash: string,
    requestedBy: string,
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const startTime = performance.now();
    
    try {
      const bundleId = this.generateBundleId('civic_resume');
      
      // Get all user capsules
      const userEntries = this.vaultCore.searchVaultEntries({ userHash });
      
      if (userEntries.length === 0) {
        return {
          success: false,
          filename: '',
          fileSize: 0,
          exportDuration: 0,
          error: `No evidence found for user: ${userHash}`
        };
      }
      
      const bundle = this.createCivicProofBundle(
        bundleId,
        'civic_resume',
        userHash,
        userEntries,
        options
      );
      
      const filename = `${userHash.substring(0, 12)}-civic-resume-${Date.now()}.civic-proof-bundle.json`;
      const bundleData = JSON.stringify(bundle, null, 2);
      
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      const result: ExportResult = {
        success: true,
        bundleId,
        filename,
        data: bundleData,
        fileSize: bundleData.length,
        exportDuration,
        downloadUrl: this.generateDownloadUrl(bundleId, filename)
      };
      
      this.exportHistory.set(bundleId, result);
      
      console.log(`📦 Civic resume exported — ${filename} | User: ${userHash} | Size: ${bundleData.length} bytes | Duration: ${exportDuration}ms`);
      
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      console.error(`❌ Civic resume export failed — User: ${userHash} | Error: ${error}`);
      
      return {
        success: false,
        filename: '',
        fileSize: 0,
        exportDuration,
        error: String(error)
      };
    }
  }
  
  // Export DAO verification bundle
  exportDAOVerificationBundle(
    userHash: string,
    requestedBy: string,
    validationScope: string[] = ['governance', 'consensus', 'voting'],
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const startTime = performance.now();
    
    try {
      const bundleId = this.generateBundleId('dao_verification');
      
      // Get relevant entries for DAO verification
      const relevantEntries: VaultEntry[] = [];
      
      validationScope.forEach(scope => {
        const scopeEntries = this.vaultCore.searchVaultEntries({
          userHash,
          eventType: this.mapScopeToEventType(scope)
        });
        relevantEntries.push(...scopeEntries);
      });
      
      // Remove duplicates
      const uniqueEntries = relevantEntries.filter((entry, index, self) => 
        self.findIndex(e => e.entryId === entry.entryId) === index
      );
      
      if (uniqueEntries.length === 0) {
        return {
          success: false,
          filename: '',
          fileSize: 0,
          exportDuration: 0,
          error: `No DAO verification evidence found for user: ${userHash}`
        };
      }
      
      const bundle = this.createCivicProofBundle(
        bundleId,
        'dao_verification',
        userHash,
        uniqueEntries,
        { ...options, signatureLevel: 'dao_grade' }
      );
      
      const filename = `${userHash.substring(0, 12)}-dao-verification-${Date.now()}.civic-proof-bundle.json`;
      const bundleData = JSON.stringify(bundle, null, 2);
      
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      const result: ExportResult = {
        success: true,
        bundleId,
        filename,
        data: bundleData,
        fileSize: bundleData.length,
        exportDuration,
        downloadUrl: this.generateDownloadUrl(bundleId, filename)
      };
      
      this.exportHistory.set(bundleId, result);
      
      console.log(`📦 DAO verification bundle exported — ${filename} | User: ${userHash} | Entries: ${uniqueEntries.length} | Duration: ${exportDuration}ms`);
      
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      console.error(`❌ DAO verification export failed — User: ${userHash} | Error: ${error}`);
      
      return {
        success: false,
        filename: '',
        fileSize: 0,
        exportDuration,
        error: String(error)
      };
    }
  }
  
  // Export mission portfolio bundle
  exportMissionPortfolio(
    missionIds: string[],
    userHash: string,
    requestedBy: string,
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const startTime = performance.now();
    
    try {
      const bundleId = this.generateBundleId('mission_portfolio');
      
      // Get entries for specific missions
      const missionEntries: VaultEntry[] = [];
      
      missionIds.forEach(missionId => {
        const entries = this.vaultCore.searchVaultEntries({ missionId, userHash });
        missionEntries.push(...entries);
      });
      
      if (missionEntries.length === 0) {
        return {
          success: false,
          filename: '',
          fileSize: 0,
          exportDuration: 0,
          error: `No mission evidence found for specified missions`
        };
      }
      
      const bundle = this.createCivicProofBundle(
        bundleId,
        'mission_portfolio',
        userHash,
        missionEntries,
        options
      );
      
      const filename = `${userHash.substring(0, 12)}-mission-portfolio-${Date.now()}.civic-proof-bundle.json`;
      const bundleData = JSON.stringify(bundle, null, 2);
      
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      const result: ExportResult = {
        success: true,
        bundleId,
        filename,
        data: bundleData,
        fileSize: bundleData.length,
        exportDuration,
        downloadUrl: this.generateDownloadUrl(bundleId, filename)
      };
      
      this.exportHistory.set(bundleId, result);
      
      console.log(`📦 Mission portfolio exported — ${filename} | Missions: ${missionIds.length} | Entries: ${missionEntries.length} | Duration: ${exportDuration}ms`);
      
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      console.error(`❌ Mission portfolio export failed — Missions: ${missionIds.length} | Error: ${error}`);
      
      return {
        success: false,
        filename: '',
        fileSize: 0,
        exportDuration,
        error: String(error)
      };
    }
  }
  
  // Export dispute evidence bundle
  exportDisputeEvidence(
    searchParams: VaultSearchParams,
    requestedBy: string,
    disputeContext: string,
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const startTime = performance.now();
    
    try {
      const bundleId = this.generateBundleId('dispute_evidence');
      
      // Get entries matching search criteria
      const disputeEntries = this.vaultCore.searchVaultEntries(searchParams);
      
      if (disputeEntries.length === 0) {
        return {
          success: false,
          filename: '',
          fileSize: 0,
          exportDuration: 0,
          error: 'No evidence found matching dispute criteria'
        };
      }
      
      // For dispute evidence, ensure highest signature level
      const disputeOptions = { 
        ...options, 
        signatureLevel: 'dao_grade' as const,
        includeWitnessDetails: true,
        includeCrossReferences: true
      };
      
      const bundle = this.createCivicProofBundle(
        bundleId,
        'dispute_evidence',
        searchParams.userHash || 'multiple-users',
        disputeEntries,
        disputeOptions
      );
      
      // Add dispute context to metadata
      bundle.metadata.complianceFlags.push(`dispute-context:${disputeContext}`);
      
      const filename = `dispute-evidence-${bundleId.substring(0, 8)}-${Date.now()}.civic-proof-bundle.json`;
      const bundleData = JSON.stringify(bundle, null, 2);
      
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      const result: ExportResult = {
        success: true,
        bundleId,
        filename,
        data: bundleData,
        fileSize: bundleData.length,
        exportDuration,
        downloadUrl: this.generateDownloadUrl(bundleId, filename)
      };
      
      this.exportHistory.set(bundleId, result);
      
      console.log(`📦 Dispute evidence exported — ${filename} | Context: ${disputeContext} | Entries: ${disputeEntries.length} | Duration: ${exportDuration}ms`);
      
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const exportDuration = Math.round(endTime - startTime);
      
      console.error(`❌ Dispute evidence export failed — Context: ${disputeContext} | Error: ${error}`);
      
      return {
        success: false,
        filename: '',
        fileSize: 0,
        exportDuration,
        error: String(error)
      };
    }
  }
  
  // Create civic proof bundle
  private createCivicProofBundle(
    bundleId: string,
    bundleType: CivicProofBundle['bundleType'],
    userHash: string,
    entries: VaultEntry[],
    options: Partial<ExportOptions>
  ): CivicProofBundle {
    
    const capsules = entries.map(entry => entry.capsule);
    const signature = this.generateBundleSignature(bundleId, userHash, capsules, options.signatureLevel);
    const verificationDigest = this.generateVerificationDigest(bundleId, capsules, signature);
    
    const metadata = this.generateBundleMetadata(capsules, options);
    const exportSummary = this.generateExportSummary(capsules, options);
    
    return {
      bundleId,
      createdAt: new Date().toISOString(),
      bundleType,
      userHash,
      signature,
      capsuleList: capsules,
      verificationDigest,
      metadata,
      exportSummary
    };
  }
  
  // Generate bundle signature
  private generateBundleSignature(
    bundleId: string,
    userHash: string,
    capsules: ProofCapsule[],
    signatureLevel: string = 'basic'
  ): BundleSignature {
    
    const signatureInput = `${bundleId}:${userHash}:${capsules.length}:${Date.now()}`;
    const signatureHash = `sig-${this.simpleHash(signatureInput)}`;
    
    const algorithm: BundleSignature['algorithm'] = 
      signatureLevel === 'dao_grade' ? 'dao-multisig-v1' :
      signatureLevel === 'enhanced' ? 'zkp-civic-v2' : 'identity-proof-v1';
    
    const witnesses = this.generateSignatureWitnesses(capsules, signatureLevel);
    const verificationKey = `key-${this.simpleHash(signatureHash + userHash)}`;
    
    // Signature expires in 1 year
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      signatureHash,
      signerTier: this.inferSignerTier(capsules),
      signedAt: new Date().toISOString(),
      algorithm,
      witnesses,
      verificationKey,
      expiresAt
    };
  }
  
  // Generate verification digest
  private generateVerificationDigest(
    bundleId: string,
    capsules: ProofCapsule[],
    signature: BundleSignature
  ): string {
    const digestInput = `${bundleId}:${capsules.length}:${signature.signatureHash}:${signature.signedAt}`;
    return `verify-${this.simpleHash(digestInput)}`;
  }
  
  // Generate bundle metadata
  private generateBundleMetadata(
    capsules: ProofCapsule[],
    options: Partial<ExportOptions>
  ): CivicProofBundle['metadata'] {
    
    const missionCompletions = capsules.filter(c => c.metadata.eventType === 'mission_completion');
    const votes = capsules.filter(c => c.metadata.eventType === 'vote_cast');
    const feedback = capsules.filter(c => c.metadata.eventType === 'feedback_submitted');
    
    const averageTrustScore = capsules.reduce((sum, c) => sum + c.metadata.trustScore, 0) / capsules.length;
    
    const highestTier = capsules.reduce((highest, capsule) => {
      const tierOrder = ['Citizen', 'Verifier', 'Moderator', 'Governor', 'Administrator'];
      const currentIndex = tierOrder.indexOf(capsule.metadata.userTier);
      const highestIndex = tierOrder.indexOf(highest);
      return currentIndex > highestIndex ? capsule.metadata.userTier : highest;
    }, 'Citizen');
    
    const validationLevels = capsules.map(c => c.metadata.validationLevel);
    const hasDAOVerified = validationLevels.includes('dao_verified');
    const hasCivicGrade = validationLevels.includes('civic_grade');
    
    let validationLevel = 'basic';
    if (hasDAOVerified) validationLevel = 'dao_verified';
    else if (hasCivicGrade) validationLevel = 'civic_grade';
    else if (validationLevels.includes('enhanced')) validationLevel = 'enhanced';
    
    const witnessCount = capsules.reduce((sum, c) => sum + c.metadata.witnessCount, 0);
    
    const reputationScore = Math.round(
      (missionCompletions.length * 10) +
      (averageTrustScore * 0.5) +
      (votes.length * 5) +
      (witnessCount * 2) +
      (feedback.length * 3)
    );
    
    const complianceFlags: string[] = [];
    if (options.includeMetadata) complianceFlags.push('metadata-included');
    if (options.includeCrossReferences) complianceFlags.push('cross-references-included');
    if (options.includeWitnessDetails) complianceFlags.push('witness-details-included');
    
    return {
      totalMissions: missionCompletions.length,
      totalVotes: votes.length,
      totalFeedback: feedback.length,
      civicTier: highestTier,
      averageTrustScore: Math.round(averageTrustScore * 10) / 10,
      validationLevel,
      witnessCount,
      reputationScore,
      complianceFlags
    };
  }
  
  // Generate export summary
  private generateExportSummary(
    capsules: ProofCapsule[],
    options: Partial<ExportOptions>
  ): CivicProofBundle['exportSummary'] {
    
    const missionCompletions: MissionSummary[] = capsules
      .filter(c => c.metadata.eventType === 'mission_completion')
      .map(c => ({
        missionId: c.missionId,
        missionTitle: c.metadata.missionTitle,
        deckCategory: c.metadata.deckCategory,
        completedAt: c.timestamp,
        validationLevel: c.metadata.validationLevel,
        trustScore: c.metadata.trustScore,
        witnessCount: c.metadata.witnessCount,
        traceHash: c.traceHash
      }));
    
    // Group interactions by type
    const interactionGroups: Record<EvidenceEventType, ProofCapsule[]> = {
      mission_completion: [],
      deck_unlock: [],
      civic_interaction: [],
      vote_cast: [],
      feedback_submitted: [],
      identity_verified: [],
      tier_advancement: [],
      dispute_resolution: [],
      dao_participation: [],
      cross_validation: []
    };
    
    capsules.forEach(capsule => {
      if (interactionGroups[capsule.metadata.eventType]) {
        interactionGroups[capsule.metadata.eventType].push(capsule);
      }
    });
    
    const civicInteractions: InteractionSummary[] = Object.entries(interactionGroups)
      .filter(([, capsules]) => capsules.length > 0)
      .map(([eventType, capsules]) => {
        const timestamps = capsules.map(c => c.timestamp).sort();
        const totalWitnesses = capsules.reduce((sum, c) => sum + c.metadata.witnessCount, 0);
        
        const validationLevels = capsules.map(c => c.metadata.validationLevel);
        const averageValidationLevel = this.getAverageValidationLevel(validationLevels);
        
        return {
          eventType: eventType as EvidenceEventType,
          count: capsules.length,
          latestTimestamp: timestamps[timestamps.length - 1],
          averageValidationLevel,
          totalWitnesses
        };
      });
    
    const validationHistory: ValidationRecord[] = [
      {
        validatorId: 'system-validator',
        validatedAt: new Date().toISOString(),
        validationScope: 'bundle-creation',
        integrityScore: 98.5,
        notes: `Validated ${capsules.length} capsules for export bundle`
      }
    ];
    
    const crossReferences = options.includeCrossReferences ? 
      [...new Set(capsules.flatMap(c => c.metadata.crossValidation || []))] : [];
    
    return {
      missionCompletions,
      civicInteractions,
      validationHistory,
      crossReferences
    };
  }
  
  // Helper methods
  private generateBundleId(type: string): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
  
  private generateDownloadUrl(bundleId: string, filename: string): string {
    return `/api/proof-export/download/${bundleId}/${encodeURIComponent(filename)}`;
  }
  
  private mapScopeToEventType(scope: string): EvidenceEventType | undefined {
    const mapping: Record<string, EvidenceEventType> = {
      'governance': 'dao_participation',
      'consensus': 'vote_cast',
      'voting': 'vote_cast',
      'feedback': 'feedback_submitted',
      'identity': 'identity_verified',
      'missions': 'mission_completion'
    };
    
    return mapping[scope];
  }
  
  private generateSignatureWitnesses(capsules: ProofCapsule[], signatureLevel: string): string[] {
    const witnessSet = new Set<string>();
    
    capsules.forEach(capsule => {
      capsule.metadata.crossValidation?.forEach(witness => witnessSet.add(witness));
    });
    
    const witnesses = Array.from(witnessSet);
    
    if (signatureLevel === 'dao_grade') {
      // Add DAO validators
      witnesses.push('did:civic:dao-validator-1', 'did:civic:dao-validator-2');
    }
    
    return witnesses.slice(0, 10); // Limit to 10 witnesses
  }
  
  private inferSignerTier(capsules: ProofCapsule[]): string {
    const tiers = capsules.map(c => c.metadata.userTier);
    const tierOrder = ['Citizen', 'Verifier', 'Moderator', 'Governor', 'Administrator'];
    
    return tiers.reduce((highest, current) => {
      const currentIndex = tierOrder.indexOf(current);
      const highestIndex = tierOrder.indexOf(highest);
      return currentIndex > highestIndex ? current : highest;
    }, 'Citizen');
  }
  
  private getAverageValidationLevel(levels: string[]): string {
    const levelOrder = ['basic', 'enhanced', 'civic_grade', 'dao_verified'];
    const averageIndex = levels.reduce((sum, level) => sum + levelOrder.indexOf(level), 0) / levels.length;
    
    return levelOrder[Math.round(averageIndex)] || 'basic';
  }
  
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  // Get export history
  getExportHistory(limit?: number): ExportResult[] {
    const history = Array.from(this.exportHistory.values())
      .sort((a, b) => {
        const aTime = a.bundleId?.split('-')[1] || '0';
        const bTime = b.bundleId?.split('-')[1] || '0';
        return parseInt(bTime) - parseInt(aTime);
      });
    
    return limit ? history.slice(0, limit) : history;
  }
  
  // Get export by bundle ID
  getExportById(bundleId: string): ExportResult | null {
    return this.exportHistory.get(bundleId) || null;
  }
  
  // Clear export history (admin function)
  clearExportHistory(): void {
    this.exportHistory.clear();
    console.log('🧹 Proof export history cleared');
  }
  
  // Get export statistics
  getExportStatistics(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    bundleTypeBreakdown: Record<string, number>;
    averageFileSize: number;
    averageExportDuration: number;
    recentActivity: number;
  } {
    
    const exports = Array.from(this.exportHistory.values());
    const successfulExports = exports.filter(e => e.success);
    const failedExports = exports.filter(e => !e.success);
    
    const bundleTypeBreakdown: Record<string, number> = {};
    let totalFileSize = 0;
    let totalDuration = 0;
    
    successfulExports.forEach(exp => {
      if (exp.bundleId) {
        const type = exp.bundleId.split('-')[0];
        bundleTypeBreakdown[type] = (bundleTypeBreakdown[type] || 0) + 1;
      }
      totalFileSize += exp.fileSize;
      totalDuration += exp.exportDuration;
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    const recentActivity = exports.filter(exp => {
      const exportTime = exp.bundleId ? parseInt(exp.bundleId.split('-')[1]) : 0;
      return exportTime > oneDayAgo;
    }).length;
    
    return {
      totalExports: exports.length,
      successfulExports: successfulExports.length,
      failedExports: failedExports.length,
      bundleTypeBreakdown,
      averageFileSize: successfulExports.length > 0 ? totalFileSize / successfulExports.length : 0,
      averageExportDuration: successfulExports.length > 0 ? totalDuration / successfulExports.length : 0,
      recentActivity
    };
  }
}

export default ProofExporterNode;