/**
 * ProtocolValidator.ts - Phase PRESS-FINAL
 * Protocol Validation and Release Archive System
 * Authority: Commander Mark via JASMY Relay
 */

interface ReleaseRecord {
  id: string;
  version: string;
  title: string;
  releaseDate: string;
  contentHash: string;
  ipfsCid: string;
  validationScore: number;
  status: 'draft' | 'validated' | 'published' | 'archived';
  metadata: {
    wordCount: number;
    readabilityScore: number;
    technicalAccuracy: number;
    distributionReady: boolean;
  };
}

interface ValidationResult {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  timestamp: string;
}

class ProtocolValidator {
  private releases: Map<string, ReleaseRecord>;
  private validationHistory: Map<string, ValidationResult[]>;
  private initialized: boolean = false;

  constructor() {
    this.releases = new Map();
    this.validationHistory = new Map();
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;

    console.log('📋 ProtocolValidator initializing — Release archive system');

    // Register the v1.0 press release
    this.registerRelease({
      id: 'truthunveiled/releases/launch/final',
      version: '1.0',
      title: 'Truth Unveiled: The Civic Genome Has Been Launched',
      releaseDate: '2025-07-23T21:45:00-04:00',
      contentHash: 'b47cc0f104b8ba87c69c2e1a3764b5bbf4d4a85f7dcf31c7bfa2d3f0c5ba47cc',
      ipfsCid: 'bafybeirtkz5k4yb6caagedpwgjrdlvgmtlawezrtkz5k4yb6caagedpwgj',
      validationScore: 95,
      status: 'published',
      metadata: {
        wordCount: 1156,
        readabilityScore: 64.2,
        technicalAccuracy: 97,
        distributionReady: true
      }
    });

    this.initialized = true;
    console.log('✅ ProtocolValidator operational — v1.0 press release archived');
  }

  public registerRelease(release: ReleaseRecord) {
    this.releases.set(release.id, release);
    console.log(`📋 Release archived: ${release.title} (v${release.version})`);
  }

  public validateRelease(releaseId: string): ValidationResult {
    const release = this.releases.get(releaseId);
    if (!release) {
      return {
        passed: false,
        score: 0,
        issues: ['Release not found'],
        recommendations: ['Register release before validation'],
        timestamp: new Date().toISOString()
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Readability validation
    if (release.metadata.readabilityScore < 60) {
      issues.push(`Readability too low: ${release.metadata.readabilityScore} (minimum 60)`);
      score -= 20;
    }

    // Technical accuracy validation
    if (release.metadata.technicalAccuracy < 90) {
      issues.push(`Technical accuracy below threshold: ${release.metadata.technicalAccuracy}%`);
      score -= 15;
    }

    // IPFS CID validation
    if (!this.validateIPFSCid(release.ipfsCid)) {
      issues.push('Invalid IPFS CID format');
      score -= 25;
    }

    // Content hash validation
    if (!this.validateContentHash(release.contentHash)) {
      issues.push('Invalid content hash format');
      score -= 10;
    }

    // Distribution readiness
    if (!release.metadata.distributionReady) {
      recommendations.push('Complete distribution preparation checklist');
      score -= 5;
    }

    const result: ValidationResult = {
      passed: issues.length === 0 && score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
      timestamp: new Date().toISOString()
    };

    // Store validation history
    const history = this.validationHistory.get(releaseId) || [];
    history.push(result);
    this.validationHistory.set(releaseId, history);

    console.log(`📋 Validation complete: ${releaseId} — Score: ${result.score}/100`);
    if (result.issues.length > 0) {
      console.log('⚠️ Validation issues:', result.issues);
    }

    return result;
  }

  private validateIPFSCid(cid: string): boolean {
    // Basic CID validation (CIDv1 format)
    const cidv1Pattern = /^ba[a-z2-7]{57}$/;
    return cidv1Pattern.test(cid);
  }

  private validateContentHash(hash: string): boolean {
    // SHA-256 hash validation
    const sha256Pattern = /^[a-f0-9]{64}$/i;
    return sha256Pattern.test(hash);
  }

  public getReleaseRecord(releaseId: string): ReleaseRecord | null {
    return this.releases.get(releaseId) || null;
  }

  public getValidationHistory(releaseId: string): ValidationResult[] {
    return this.validationHistory.get(releaseId) || [];
  }

  public getAllReleases(): ReleaseRecord[] {
    return Array.from(this.releases.values());
  }

  public getPublishedReleases(): ReleaseRecord[] {
    return this.getAllReleases().filter(release => release.status === 'published');
  }

  public updateReleaseStatus(releaseId: string, status: ReleaseRecord['status']) {
    const release = this.releases.get(releaseId);
    if (release) {
      release.status = status;
      console.log(`📋 Release status updated: ${releaseId} → ${status}`);
    }
  }

  public generateDigest(releaseId: string): string | null {
    const release = this.releases.get(releaseId);
    if (!release) return null;

    const validation = this.validateRelease(releaseId);
    
    return `
# Release Digest: ${release.title}

**Version**: ${release.version}
**Release Date**: ${release.releaseDate}
**Content Hash**: ${release.contentHash}
**IPFS CID**: ${release.ipfsCid}
**Validation Score**: ${validation.score}/100
**Status**: ${release.status.toUpperCase()}

## Metadata
- Word Count: ${release.metadata.wordCount}
- Readability Score: ${release.metadata.readabilityScore}
- Technical Accuracy: ${release.metadata.technicalAccuracy}%
- Distribution Ready: ${release.metadata.distributionReady ? 'Yes' : 'No'}

## Validation Results
- **Passed**: ${validation.passed ? 'Yes' : 'No'}
- **Issues**: ${validation.issues.length}
- **Recommendations**: ${validation.recommendations.length}

Generated: ${new Date().toISOString()}
    `.trim();
  }

  public monitorLinkHealth(): void {
    console.log('📋 ProtocolValidator: Monitoring press release link health');
    
    // Monitor primary press release route
    this.checkRoute('/press-release-v1.0.md');
    
    // Check IPFS gateway accessibility
    this.checkIPFSGateway('bafybeirtkz5k4yb6caagedpwgjrdlvgmtlawezrtkz5k4yb6caagedpwgj');
  }

  private async checkRoute(route: string): Promise<boolean> {
    try {
      const response = await fetch(route, { method: 'HEAD' });
      const success = response.ok;
      console.log(`📋 Route check: ${route} — ${success ? 'OK' : 'FAILED'}`);
      return success;
    } catch (error) {
      console.log(`📋 Route check failed: ${route} — ${error}`);
      return false;
    }
  }

  private async checkIPFSGateway(cid: string): Promise<boolean> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      const success = response.ok;
      console.log(`📋 IPFS Gateway check: ${cid} — ${success ? 'OK' : 'FAILED'}`);
      return success;
    } catch (error) {
      console.log(`📋 IPFS Gateway check failed: ${cid} — Expected for local development`);
      return false;
    }
  }

  public destroy() {
    this.releases.clear();
    this.validationHistory.clear();
    this.initialized = false;
    console.log('📋 ProtocolValidator destroyed');
  }
}

export default ProtocolValidator;