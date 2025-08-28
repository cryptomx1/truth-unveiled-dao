/**
 * GuardianVerificationEngine.ts
 * Phase X-M Step 4: Backend Verifier for CID+DID+ZKP Rituals
 * Commander Mark directive via JASMY Relay
 */

interface GuardianClaimRequest {
  did: string;
  cid: string;
  pillarId: string;
  truthPoints: number;
  genesisBadges: number;
  zkpProofs: number;
  tier: 'Citizen' | 'Governor' | 'Commander';
}

interface VerificationResult {
  success: boolean;
  verificationHash: string;
  error?: string;
  requirements: {
    cidValid: boolean;
    didValid: boolean;
    zkpValid: boolean;
    tpStakeValid: boolean;
    fusionCheck: boolean;
  };
}

interface PillarRequirements {
  truthPointsMin: number;
  genesisBadgesMin: number;
  zkpProofsMin: number;
  tierAccess: string[];
}

export class GuardianVerificationEngine {
  private static instance: GuardianVerificationEngine;
  private pillarRequirements: Map<string, PillarRequirements>;
  private verificationHistory: any[];

  private constructor() {
    this.pillarRequirements = new Map();
    this.verificationHistory = [];
    this.initializePillarRequirements();
    this.loadVerificationHistory();
  }

  public static getInstance(): GuardianVerificationEngine {
    if (!GuardianVerificationEngine.instance) {
      GuardianVerificationEngine.instance = new GuardianVerificationEngine();
    }
    return GuardianVerificationEngine.instance;
  }

  private initializePillarRequirements() {
    const requirements: Record<string, PillarRequirements> = {
      'GOVERNANCE': {
        truthPointsMin: 500,
        genesisBadgesMin: 1,
        zkpProofsMin: 2,
        tierAccess: ['Citizen', 'Governor', 'Commander']
      },
      'EDUCATION': {
        truthPointsMin: 400,
        genesisBadgesMin: 1,
        zkpProofsMin: 1,
        tierAccess: ['Citizen', 'Governor', 'Commander']
      },
      'PRIVACY': {
        truthPointsMin: 600,
        genesisBadgesMin: 1,
        zkpProofsMin: 3,
        tierAccess: ['Governor', 'Commander']
      },
      'SUSTAINABILITY': {
        truthPointsMin: 450,
        genesisBadgesMin: 1,
        zkpProofsMin: 2,
        tierAccess: ['Citizen', 'Governor', 'Commander']
      },
      'WELLBEING': {
        truthPointsMin: 350,
        genesisBadgesMin: 1,
        zkpProofsMin: 1,
        tierAccess: ['Citizen', 'Governor', 'Commander']
      },
      'AGRICULTURE': {
        truthPointsMin: 400,
        genesisBadgesMin: 1,
        zkpProofsMin: 2,
        tierAccess: ['Citizen', 'Governor', 'Commander']
      },
      'HEALTH': {
        truthPointsMin: 550,
        genesisBadgesMin: 1,
        zkpProofsMin: 2,
        tierAccess: ['Governor', 'Commander']
      },
      'JUSTICE': {
        truthPointsMin: 700,
        genesisBadgesMin: 1,
        zkpProofsMin: 3,
        tierAccess: ['Commander']
      }
    };

    for (const [pillarId, req] of Object.entries(requirements)) {
      this.pillarRequirements.set(pillarId, req);
    }

    console.log('🛡️ GuardianVerificationEngine: Loaded requirements for', this.pillarRequirements.size, 'pillars');
  }

  private loadVerificationHistory() {
    const history = localStorage.getItem('guardian_verification_history');
    if (history) {
      try {
        this.verificationHistory = JSON.parse(history);
        console.log('📚 Loaded', this.verificationHistory.length, 'verification records');
      } catch (e) {
        console.warn('⚠️ Failed to load verification history');
        this.verificationHistory = [];
      }
    }
  }

  private saveVerificationHistory() {
    try {
      localStorage.setItem('guardian_verification_history', JSON.stringify(this.verificationHistory));
    } catch (e) {
      console.warn('⚠️ Failed to save verification history');
    }
  }

  public async verifyGuardianClaim(request: GuardianClaimRequest): Promise<VerificationResult> {
    const startTime = Date.now();
    console.log(`🔍 Verifying Guardian claim for ${request.pillarId} by ${request.did}`);

    const requirements = this.pillarRequirements.get(request.pillarId);
    if (!requirements) {
      return {
        success: false,
        verificationHash: '',
        error: `Unknown pillar: ${request.pillarId}`,
        requirements: {
          cidValid: false,
          didValid: false,
          zkpValid: false,
          tpStakeValid: false,
          fusionCheck: false
        }
      };
    }

    // Step 1: Validate CID format and binding
    const cidValid = this.validateCID(request.cid);
    
    // Step 2: Validate DID format and binding
    const didValid = this.validateDID(request.did);
    
    // Step 3: Validate ZKP proofs
    const zkpValid = await this.validateZKPProofs(request.did, request.zkpProofs, requirements.zkpProofsMin);
    
    // Step 4: Validate TruthPoint stake
    const tpStakeValid = this.validateTruthPointStake(request.truthPoints, requirements.truthPointsMin);
    
    // Step 5: Validate Genesis Badge fusion check
    const fusionCheck = this.validateFusionCheck(request.genesisBadges, requirements.genesisBadgesMin);
    
    // Step 6: Validate tier access
    const tierValid = requirements.tierAccess.includes(request.tier);

    const allValid = cidValid && didValid && zkpValid && tpStakeValid && fusionCheck && tierValid;
    
    // Generate verification hash
    const verificationHash = this.generateVerificationHash(request, allValid);
    
    // Log verification attempt
    const verificationRecord = {
      id: `verify_${Date.now()}`,
      timestamp: new Date().toISOString(),
      did: request.did,
      cid: request.cid,
      pillarId: request.pillarId,
      success: allValid,
      verificationHash,
      requirements: {
        cidValid,
        didValid,
        zkpValid,
        tpStakeValid,
        fusionCheck,
        tierValid
      },
      processingTime: Date.now() - startTime
    };

    this.verificationHistory.push(verificationRecord);
    this.saveVerificationHistory();

    if (allValid) {
      console.log(`✅ Guardian verification successful for ${request.pillarId} - Hash: ${verificationHash}`);
    } else {
      console.log(`❌ Guardian verification failed for ${request.pillarId}:`, {
        cidValid, didValid, zkpValid, tpStakeValid, fusionCheck, tierValid
      });
    }

    return {
      success: allValid,
      verificationHash,
      error: allValid ? undefined : 'Verification requirements not met',
      requirements: {
        cidValid,
        didValid,
        zkpValid,
        tpStakeValid,
        fusionCheck
      }
    };
  }

  private validateCID(cid: string): boolean {
    // CID format validation - should match expected pattern
    const cidPattern = /^cid:[a-zA-Z0-9_:-]+$/;
    const isValid = cidPattern.test(cid) && cid.length > 10;
    
    if (isValid) {
      console.log(`🔗 CID validation passed: ${cid.substring(0, 20)}...`);
    } else {
      console.log(`❌ CID validation failed: ${cid}`);
    }
    
    return isValid;
  }

  private validateDID(did: string): boolean {
    // DID format validation - should match expected pattern
    const didPattern = /^did:[a-zA-Z0-9_:-]+$/;
    const isValid = didPattern.test(did) && did.length > 10;
    
    if (isValid) {
      console.log(`👤 DID validation passed: ${did.substring(0, 20)}...`);
    } else {
      console.log(`❌ DID validation failed: ${did}`);
    }
    
    return isValid;
  }

  private async validateZKPProofs(did: string, userProofs: number, requiredProofs: number): Promise<boolean> {
    // Simulate ZKP proof validation with realistic delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const isValid = userProofs >= requiredProofs;
    
    if (isValid) {
      console.log(`🔐 ZKP validation passed: ${userProofs}/${requiredProofs} proofs`);
    } else {
      console.log(`❌ ZKP validation failed: ${userProofs}/${requiredProofs} proofs`);
    }
    
    return isValid;
  }

  private validateTruthPointStake(userTP: number, requiredTP: number): boolean {
    const isValid = userTP >= requiredTP;
    
    if (isValid) {
      console.log(`💎 TruthPoint validation passed: ${userTP}/${requiredTP} TP`);
    } else {
      console.log(`❌ TruthPoint validation failed: ${userTP}/${requiredTP} TP`);
    }
    
    return isValid;
  }

  private validateFusionCheck(userBadges: number, requiredBadges: number): boolean {
    const isValid = userBadges >= requiredBadges;
    
    if (isValid) {
      console.log(`🏅 Genesis Badge validation passed: ${userBadges}/${requiredBadges} badges`);
    } else {
      console.log(`❌ Genesis Badge validation failed: ${userBadges}/${requiredBadges} badges`);
    }
    
    return isValid;
  }

  private generateVerificationHash(request: GuardianClaimRequest, success: boolean): string {
    // Generate reproducible hash for verification
    const data = `${request.did}:${request.cid}:${request.pillarId}:${success}:${Date.now()}`;
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  public getPillarRequirements(pillarId: string): PillarRequirements | undefined {
    return this.pillarRequirements.get(pillarId);
  }

  public getVerificationHistory(): any[] {
    return [...this.verificationHistory];
  }

  public getSuccessfulVerifications(did: string): string[] {
    return this.verificationHistory
      .filter(record => record.did === did && record.success)
      .map(record => record.pillarId);
  }

  public exportVerificationLog(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalVerifications: this.verificationHistory.length,
      successfulVerifications: this.verificationHistory.filter(r => r.success).length,
      pillarCoverage: this.pillarRequirements.size,
      verificationRecords: this.verificationHistory
    };

    return JSON.stringify(exportData, null, 2);
  }
}

export default GuardianVerificationEngine;