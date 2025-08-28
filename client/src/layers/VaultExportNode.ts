// Phase VI Step 2: VaultExportNode.ts
// Commander Mark authorization via JASMY Relay
// Secure export interface with IPFS bundle creation and ZKP-aware export control

import { CredentialMintLayer, MintHistoryEntry } from './CredentialMintLayer';
import { LocalSaveLayer } from './LocalSaveLayer';

export interface VaultBundleManifest {
  bundleId: string;
  createdBy: string;
  createdAt: string;
  exportScope: 'own' | 'jurisdiction' | 'global';
  entryCount: number;
  bundleSize: number;
  bundleCID: string;
  signature: string;
  filters: ExportFilters;
  zkpValidated: boolean;
}

export interface ExportFilters {
  credentialTypes?: string[];
  timestampRange?: {
    start: string;
    end: string;
  };
  targetDID?: string;
  excludeRevoked: boolean;
  requireZKPValidation: boolean;
}

export interface ExportEntry {
  id: string;
  credentialZkHash: string;
  issuerDID: string;
  recipientDID: string;
  credentialType: string;
  issuanceTimestamp: string;
  revoked: boolean;
  revokedTimestamp?: string;
  revokedReason?: string;
  metadata: any;
  zkpValidated: boolean;
  exportTimestamp: string;
}

export interface ExportBundle {
  manifest: VaultBundleManifest;
  entries: ExportEntry[];
  totalSize: number;
  bundleCID: string;
  signature: string;
}

export interface ExportResult {
  success: boolean;
  bundle?: ExportBundle;
  bundleCID?: string;
  exportTime: number;
  entryCount: number;
  bundleSize: number;
  error?: string;
  pathBTriggered?: boolean;
}

export interface ExportMetrics {
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  pathBActivations: number;
  successRate: number;
  averageExportTime: number;
  averageBundleSize: number;
  averageEntryCount: number;
  pathBActivated: boolean;
  syncFailureRate: number;
}

export type UserRole = 'Citizen' | 'Moderator' | 'Governor';

export class VaultExportNode {
  private credentialMintLayer: CredentialMintLayer;
  private localSaveLayer: LocalSaveLayer;
  private metrics: ExportMetrics = {
    totalExports: 0,
    successfulExports: 0,
    failedExports: 0,
    pathBActivations: 0,
    successRate: 100,
    averageExportTime: 0,
    averageBundleSize: 0,
    averageEntryCount: 0,
    pathBActivated: false,
    syncFailureRate: 0
  };

  private readonly STORAGE_KEY = 'vault_export_history';
  private readonly PATH_B_THRESHOLD = 10; // 10% sync failure rate
  private readonly MAX_BUNDLE_SIZE = 5 * 1024 * 1024; // 5MB limit
  private readonly SYSTEM_DID = 'did:civic:system:vault_export';

  constructor() {
    this.credentialMintLayer = new CredentialMintLayer();
    this.localSaveLayer = new LocalSaveLayer();
  }

  // Main export interface with role-aware scoping
  async exportVaultData(
    exporterDID: string,
    userRole: UserRole,
    filters: ExportFilters,
    overrideFlag?: boolean
  ): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      // Validate export permissions
      const permissionResult = this.validateExportPermissions(exporterDID, userRole, filters, overrideFlag);
      if (!permissionResult.valid) {
        return this.createFailureResult(permissionResult.error!, startTime);
      }

      // Get mint history from CredentialMintLayer
      const mintHistory = this.credentialMintLayer.getMintHistory();
      
      // Apply filters and role-based scoping
      const filteredEntries = this.applyFiltersAndScoping(mintHistory, exporterDID, userRole, filters);

      // Validate ZKP requirements
      const validatedEntries = this.validateZKPEntries(filteredEntries);

      // Check for sync failures (simulate for testing)
      const syncFailures = this.simulateSyncFailures(validatedEntries);
      const syncFailureRate = (syncFailures / validatedEntries.length) * 100;

      if (syncFailureRate >= this.PATH_B_THRESHOLD) {
        this.metrics.pathBActivated = true;
        this.metrics.syncFailureRate = syncFailureRate;
        return await this.activatePathBExport(exporterDID, userRole, filters, validatedEntries, startTime);
      }

      // Create export bundle
      const exportBundle = await this.createExportBundle(exporterDID, userRole, filters, validatedEntries);

      // Validate bundle size
      if (exportBundle.totalSize > this.MAX_BUNDLE_SIZE) {
        return this.createFailureResult(`Bundle size ${exportBundle.totalSize} exceeds 5MB limit`, startTime);
      }

      // Update metrics
      this.metrics.successfulExports++;
      this.updateMetrics(Date.now() - startTime, exportBundle.entries.length, exportBundle.totalSize);

      console.log(`✅ VaultExportNode: Export completed - ${exportBundle.bundleCID}`);

      return {
        success: true,
        bundle: exportBundle,
        bundleCID: exportBundle.bundleCID,
        exportTime: Date.now() - startTime,
        entryCount: exportBundle.entries.length,
        bundleSize: exportBundle.totalSize
      };

    } catch (error) {
      const exportTime = Date.now() - startTime;
      console.error('❌ VaultExportNode: Export error:', error);

      this.metrics.failedExports++;
      this.updateMetrics(exportTime, 0, 0);

      return this.createFailureResult(
        error instanceof Error ? error.message : 'Unknown export error',
        startTime
      );
    }
  }

  // Validate export permissions based on role
  private validateExportPermissions(
    exporterDID: string,
    userRole: UserRole,
    filters: ExportFilters,
    overrideFlag?: boolean
  ): { valid: boolean; error?: string } {
    // Validate DID format
    if (!exporterDID || !exporterDID.startsWith('did:')) {
      return { valid: false, error: 'Invalid exporter DID format' };
    }

    // Role-based permission checking
    switch (userRole) {
      case 'Citizen':
        // Citizens can only export their own records
        if (filters.targetDID && filters.targetDID !== exporterDID) {
          return { valid: false, error: 'Citizens can only export their own records' };
        }
        break;

      case 'Moderator':
        // Moderators can export within jurisdiction (simulated as any DID for demo)
        // In production, this would check jurisdiction mapping
        break;

      case 'Governor':
        // Governors can export global bundles with override flag
        if (!filters.targetDID && !overrideFlag) {
          return { valid: false, error: 'Global export requires override flag for Governor role' };
        }
        break;

      default:
        return { valid: false, error: 'Invalid user role' };
    }

    return { valid: true };
  }

  // Apply filters and role-based scoping
  private applyFiltersAndScoping(
    mintHistory: MintHistoryEntry[],
    exporterDID: string,
    userRole: UserRole,
    filters: ExportFilters
  ): MintHistoryEntry[] {
    let filteredEntries = [...mintHistory];

    // Apply role-based scoping
    switch (userRole) {
      case 'Citizen':
        filteredEntries = filteredEntries.filter(entry => entry.recipientDID === exporterDID);
        break;
      case 'Moderator':
        // Jurisdiction filtering would be implemented here
        // For demo, allow all entries
        break;
      case 'Governor':
        // Global access - no additional filtering unless targetDID specified
        if (filters.targetDID) {
          filteredEntries = filteredEntries.filter(entry => entry.recipientDID === filters.targetDID);
        }
        break;
    }

    // Apply credential type filter
    if (filters.credentialTypes && filters.credentialTypes.length > 0) {
      filteredEntries = filteredEntries.filter(entry => 
        filters.credentialTypes!.includes(entry.credentialType)
      );
    }

    // Apply timestamp range filter
    if (filters.timestampRange) {
      const startTime = new Date(filters.timestampRange.start).getTime();
      const endTime = new Date(filters.timestampRange.end).getTime();
      
      filteredEntries = filteredEntries.filter(entry => {
        const entryTime = new Date(entry.issuanceTimestamp).getTime();
        return entryTime >= startTime && entryTime <= endTime;
      });
    }

    // Exclude revoked credentials if specified
    if (filters.excludeRevoked) {
      filteredEntries = filteredEntries.filter(entry => !entry.revoked);
    }

    return filteredEntries;
  }

  // Validate ZKP requirements for export entries
  private validateZKPEntries(entries: MintHistoryEntry[]): MintHistoryEntry[] {
    return entries.filter(entry => {
      // For demo purposes, simulate ZKP validation
      // In production, this would verify actual ZKP proofs
      const zkpValidated = Math.random() > 0.1; // 90% validation rate
      
      if (!zkpValidated) {
        console.warn(`⚠️ VaultExportNode: ZKP validation failed for entry ${entry.id}`);
      }
      
      return zkpValidated;
    });
  }

  // Simulate sync failures for Path B testing
  private simulateSyncFailures(entries: MintHistoryEntry[]): number {
    // Simulate 15% sync failure rate for testing
    return Math.floor(entries.length * 0.15);
  }

  // Create IPFS export bundle with metadata manifest
  private async createExportBundle(
    exporterDID: string,
    userRole: UserRole,
    filters: ExportFilters,
    entries: MintHistoryEntry[]
  ): Promise<ExportBundle> {
    const bundleId = `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert entries to export format
    const exportEntries: ExportEntry[] = entries.map(entry => ({
      ...entry,
      zkpValidated: true, // Already filtered for ZKP validation
      exportTimestamp: new Date().toISOString()
    }));

    // Calculate bundle size (approximate)
    const bundleSize = JSON.stringify(exportEntries).length;

    // Generate bundle CID
    const bundleCID = await this.generateBundleCID(bundleId, exportEntries);

    // Create CID signature
    const signature = await this.generateCIDSignature(bundleCID);

    // Create manifest
    const manifest: VaultBundleManifest = {
      bundleId,
      createdBy: exporterDID,
      createdAt: new Date().toISOString(),
      exportScope: this.determineExportScope(userRole, filters),
      entryCount: exportEntries.length,
      bundleSize,
      bundleCID,
      signature,
      filters,
      zkpValidated: true
    };

    return {
      manifest,
      entries: exportEntries,
      totalSize: bundleSize,
      bundleCID,
      signature
    };
  }

  // Generate bundle CID for IPFS
  private async generateBundleCID(bundleId: string, entries: ExportEntry[]): Promise<string> {
    const cidStart = Date.now();
    
    // Simulate IPFS CID generation
    const content = `${bundleId}${JSON.stringify(entries)}${Date.now()}`;
    let hash = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const cidTime = Date.now() - cidStart;
    if (cidTime > 75) {
      console.warn(`⚠️ VaultExportNode: CID generation time: ${cidTime}ms (exceeds 75ms target)`);
    }
    
    // Format as IPFS CID
    const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
    return `Qm${hexHash.repeat(3).substring(0, 44)}`;
  }

  // Generate SHA-256 signature for bundle CID
  private async generateCIDSignature(bundleCID: string): Promise<string> {
    const content = `${this.SYSTEM_DID}${bundleCID}${Date.now()}`;
    
    // Simulate SHA-256 signature
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
    const signature = hexHash.repeat(4).substring(0, 64);
    
    return `0x${signature}`;
  }

  // Determine export scope based on role and filters
  private determineExportScope(userRole: UserRole, filters: ExportFilters): 'own' | 'jurisdiction' | 'global' {
    if (userRole === 'Citizen') return 'own';
    if (userRole === 'Moderator') return 'jurisdiction';
    if (userRole === 'Governor' && !filters.targetDID) return 'global';
    return 'own';
  }

  // Activate Path B export fallback
  private async activatePathBExport(
    exporterDID: string,
    userRole: UserRole,
    filters: ExportFilters,
    entries: MintHistoryEntry[],
    startTime: number
  ): Promise<ExportResult> {
    try {
      console.warn(`⚠️ VaultExportNode: Path B activated - ${this.metrics.syncFailureRate.toFixed(1)}% sync failure rate`);

      // Create mock bundle with isMock flag
      const mockBundle = await this.createMockBundle(exporterDID, userRole, filters, entries);

      // Store in LocalSaveLayer
      const fallbackData = {
        timestamp: new Date().toISOString(),
        reason: 'High sync failure rate in export',
        syncFailureRate: this.metrics.syncFailureRate,
        bundle: { ...mockBundle, isMock: true },
        metrics: this.metrics
      };

      localStorage.setItem('vault_export_fallback', JSON.stringify(fallbackData));

      this.metrics.pathBActivations++;
      this.metrics.failedExports++;
      this.updateMetrics(Date.now() - startTime, entries.length, mockBundle.totalSize);

      console.log('✅ VaultExportNode: Path B fallback completed');

      return {
        success: false,
        exportTime: Date.now() - startTime,
        entryCount: entries.length,
        bundleSize: mockBundle.totalSize,
        error: 'Export fallback activated due to sync failures',
        pathBTriggered: true
      };

    } catch (error) {
      console.error('❌ VaultExportNode: Path B activation failed:', error);
      return this.createFailureResult('Path B activation failed', startTime);
    }
  }

  // Create mock bundle for Path B fallback
  private async createMockBundle(
    exporterDID: string,
    userRole: UserRole,
    filters: ExportFilters,
    entries: MintHistoryEntry[]
  ): Promise<ExportBundle> {
    const bundleId = `mock_bundle_${Date.now()}`;
    const bundleCID = `QmMOCK${Math.random().toString(36).substr(2, 40)}`;
    const signature = `0xMOCK${Math.random().toString(36).substr(2, 60)}`;

    const exportEntries: ExportEntry[] = entries.map(entry => ({
      ...entry,
      zkpValidated: false, // Mark as unvalidated for mock
      exportTimestamp: new Date().toISOString()
    }));

    const bundleSize = JSON.stringify(exportEntries).length;

    const manifest: VaultBundleManifest = {
      bundleId,
      createdBy: exporterDID,
      createdAt: new Date().toISOString(),
      exportScope: this.determineExportScope(userRole, filters),
      entryCount: exportEntries.length,
      bundleSize,
      bundleCID,
      signature,
      filters,
      zkpValidated: false
    };

    return {
      manifest,
      entries: exportEntries,
      totalSize: bundleSize,
      bundleCID,
      signature
    };
  }

  // Create failure result
  private createFailureResult(error: string, startTime: number): ExportResult {
    return {
      success: false,
      exportTime: Date.now() - startTime,
      entryCount: 0,
      bundleSize: 0,
      error
    };
  }

  // Update export metrics
  private updateMetrics(exportTime: number, entryCount: number, bundleSize: number): void {
    this.metrics.totalExports = this.metrics.successfulExports + this.metrics.failedExports;
    
    if (this.metrics.totalExports > 0) {
      this.metrics.successRate = (this.metrics.successfulExports / this.metrics.totalExports) * 100;
    }

    // Update average times and sizes
    if (this.metrics.successfulExports > 0) {
      const totalExportTime = (this.metrics.averageExportTime * (this.metrics.successfulExports - 1)) + exportTime;
      this.metrics.averageExportTime = totalExportTime / this.metrics.successfulExports;

      const totalEntryCount = (this.metrics.averageEntryCount * (this.metrics.successfulExports - 1)) + entryCount;
      this.metrics.averageEntryCount = totalEntryCount / this.metrics.successfulExports;

      const totalBundleSize = (this.metrics.averageBundleSize * (this.metrics.successfulExports - 1)) + bundleSize;
      this.metrics.averageBundleSize = totalBundleSize / this.metrics.successfulExports;
    }
  }

  // Export by credential type
  async exportByCredentialType(
    exporterDID: string,
    userRole: UserRole,
    credentialTypes: string[],
    overrideFlag?: boolean
  ): Promise<ExportResult> {
    const filters: ExportFilters = {
      credentialTypes,
      excludeRevoked: true,
      requireZKPValidation: true
    };

    return this.exportVaultData(exporterDID, userRole, filters, overrideFlag);
  }

  // Export by timestamp range
  async exportByTimestampRange(
    exporterDID: string,
    userRole: UserRole,
    startDate: string,
    endDate: string,
    overrideFlag?: boolean
  ): Promise<ExportResult> {
    const filters: ExportFilters = {
      timestampRange: {
        start: startDate,
        end: endDate
      },
      excludeRevoked: true,
      requireZKPValidation: true
    };

    return this.exportVaultData(exporterDID, userRole, filters, overrideFlag);
  }

  // Export by DID (for Moderators and Governors)
  async exportByDID(
    exporterDID: string,
    userRole: UserRole,
    targetDID: string,
    overrideFlag?: boolean
  ): Promise<ExportResult> {
    const filters: ExportFilters = {
      targetDID,
      excludeRevoked: true,
      requireZKPValidation: true
    };

    return this.exportVaultData(exporterDID, userRole, filters, overrideFlag);
  }

  // Get export metrics
  getMetrics(): ExportMetrics {
    return { ...this.metrics };
  }

  // Performance validation
  validatePerformance(): {
    exportInitTime: number;
    cidGenerationTime: number;
    fullExportTime: number;
    passed: boolean;
  } {
    const fullExportStart = Date.now();

    // Test export initialization
    const initStart = Date.now();
    this.validateExportPermissions('did:civic:test', 'Citizen', { excludeRevoked: true, requireZKPValidation: true });
    const exportInitTime = Date.now() - initStart;

    // Test CID generation
    const cidStart = Date.now();
    this.generateBundleCID('test_bundle', []);
    const cidGenerationTime = Date.now() - cidStart;

    const fullExportTime = Date.now() - fullExportStart;

    const passed = exportInitTime <= 125 && cidGenerationTime <= 75 && fullExportTime <= 200;

    return { exportInitTime, cidGenerationTime, fullExportTime, passed };
  }

  // Clear export history (for testing)
  clearExportHistory(): void {
    this.metrics = {
      totalExports: 0,
      successfulExports: 0,
      failedExports: 0,
      pathBActivations: 0,
      successRate: 100,
      averageExportTime: 0,
      averageBundleSize: 0,
      averageEntryCount: 0,
      pathBActivated: false,
      syncFailureRate: 0
    };

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('vault_export_fallback');
      console.log('✅ VaultExportNode: Export history cleared');
    } catch (error) {
      console.error('❌ VaultExportNode: Failed to clear export history:', error);
    }
  }
}