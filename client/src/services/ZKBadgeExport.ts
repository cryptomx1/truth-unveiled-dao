/**
 * ZKBadgeExport.ts
 * Phase X-M Step 2: Guardian Badge Export Service
 * Authority: Commander Mark via JASMY Relay
 */

interface GuardianBadgeData {
  did: string;
  badgeType: 'light_of_truth_guardian';
  pillars: {
    pillar: string;
    completed: boolean;
    tpEarned: number;
    completionTimestamp?: string;
  }[];
  totalTp: number;
  unlockTimestamp: string;
  zkpHash: string;
  verificationKey: string;
}

interface BadgeExportResult {
  success: boolean;
  filename: string;
  data: GuardianBadgeData;
  exportTimestamp: string;
}

export class ZKBadgeExportService {
  private static instance: ZKBadgeExportService;

  private constructor() {}

  public static getInstance(): ZKBadgeExportService {
    if (!ZKBadgeExportService.instance) {
      ZKBadgeExportService.instance = new ZKBadgeExportService();
    }
    return ZKBadgeExportService.instance;
  }

  public async exportGuardianBadge(badgeData: {
    did: string;
    pillars: any[];
    totalTp: number;
    unlockTimestamp: string;
  }): Promise<BadgeExportResult> {
    console.log('🏆 ZKBadgeExport: Generating Guardian badge export...');

    try {
      // Generate ZKP hash for badge verification
      const zkpHash = await this.generateZKPHash(badgeData);
      const verificationKey = this.generateVerificationKey(badgeData.did);

      // Prepare export data
      const guardianBadge: GuardianBadgeData = {
        did: badgeData.did,
        badgeType: 'light_of_truth_guardian',
        pillars: badgeData.pillars.map(pillar => ({
          pillar: pillar.pillar,
          completed: pillar.completed,
          tpEarned: pillar.tpEarned,
          completionTimestamp: pillar.completed ? new Date().toISOString() : undefined
        })),
        totalTp: badgeData.totalTp,
        unlockTimestamp: badgeData.unlockTimestamp,
        zkpHash,
        verificationKey
      };

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `guardian_badge_${badgeData.did.split(':').pop()}_${timestamp}.guardian.json`;

      // Create downloadable file
      const exportData = JSON.stringify(guardianBadge, null, 2);
      this.downloadFile(exportData, filename);

      const result: BadgeExportResult = {
        success: true,
        filename,
        data: guardianBadge,
        exportTimestamp: new Date().toISOString()
      };

      console.log(`✅ Guardian badge exported — ${filename}`);
      console.log(`🔐 ZKP Hash: ${zkpHash}`);

      return result;

    } catch (error) {
      console.error('❌ Badge export failed:', error);
      throw new Error(`Badge export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateZKPHash(badgeData: any): Promise<string> {
    // Mock ZKP hash generation based on badge content
    const content = JSON.stringify({
      did: badgeData.did,
      pillars: badgeData.pillars.length,
      totalTp: badgeData.totalTp,
      timestamp: badgeData.unlockTimestamp
    });

    // Simple hash simulation (in production, would use actual ZKP libraries)
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'zkp_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 40);
  }

  private generateVerificationKey(did: string): string {
    // Mock verification key generation
    const timestamp = Date.now();
    const combined = `${did}_${timestamp}`;
    return 'vk_' + btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  private downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  public validateBadgeFile(badgeData: GuardianBadgeData): boolean {
    const requiredFields = ['did', 'badgeType', 'pillars', 'totalTp', 'unlockTimestamp', 'zkpHash', 'verificationKey'];
    
    for (const field of requiredFields) {
      if (!(field in badgeData)) {
        console.error(`❌ Badge validation failed: Missing field ${field}`);
        return false;
      }
    }

    // Validate badge type
    if (badgeData.badgeType !== 'light_of_truth_guardian') {
      console.error('❌ Badge validation failed: Invalid badge type');
      return false;
    }

    // Validate pillars completion
    const completedPillars = badgeData.pillars.filter(p => p.completed).length;
    if (completedPillars !== 8) {
      console.error(`❌ Badge validation failed: Only ${completedPillars}/8 pillars completed`);
      return false;
    }

    console.log('✅ Badge validation passed');
    return true;
  }
}

// Export singleton instance
export const zkBadgeExportService = ZKBadgeExportService.getInstance();