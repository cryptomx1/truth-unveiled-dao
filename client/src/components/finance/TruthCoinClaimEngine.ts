// TruthCoinClaimEngine.ts - Phase X-FINANCE Step 5: TruthCoin Claim Processing System
// Handles 4 claim types with tier-based rewards and ZKP validation

import TTSEngineAgent from '../../agents/TTSEngineAgent';

export interface TruthCoinClaim {
  claimId: string;
  claimType: 'referral' | 'governance' | 'civic_duty' | 'education';
  userId: string;
  userTier: 'Citizen' | 'Governor' | 'Commander';
  baseReward: number;
  tierMultiplier: number;
  finalReward: number;
  zkpHash: string;
  cidAnchor: string;
  timestamp: Date;
  status: 'pending' | 'validated' | 'approved' | 'rejected' | 'disbursed';
  validationProof?: string;
  originDeck?: string;
  eligibilityScore: number; // 0-100%
}

export interface ClaimTypeConfig {
  baseReward: number;
  requirements: string[];
  eligibilityFactors: string[];
  fusionTrigger?: boolean;
}

export interface ClaimStats {
  totalClaims: number;
  approvedClaims: number;
  totalRewards: number;
  averageProcessingTime: number;
  successRate: number;
}

class TruthCoinClaimEngine {
  private static instance: TruthCoinClaimEngine;
  private claims: TruthCoinClaim[] = [];
  private ttsAgent: TTSEngineAgent;
  private isInitialized = false;

  private claimTypeConfigs: Record<string, ClaimTypeConfig> = {
    'referral': {
      baseReward: 100,
      requirements: ['Valid referral code', 'Referred user active >7 days', 'Minimum 1 deck completion'],
      eligibilityFactors: ['Referral depth', 'Network quality', 'Time since referral'],
      fusionTrigger: false
    },
    'governance': {
      baseReward: 150,
      requirements: ['DAO vote participation', 'Proposal creation/support', 'Minimum Governor tier'],
      eligibilityFactors: ['Vote consistency', 'Proposal quality', 'Community engagement'],
      fusionTrigger: false
    },
    'civic_duty': {
      baseReward: 200,
      requirements: ['Municipal engagement', 'Guardian unlock', 'Civic pillar completion'],
      eligibilityFactors: ['Pillar diversity', 'Community impact', 'Consistency rating'],
      fusionTrigger: true
    },
    'education': {
      baseReward: 125,
      requirements: ['Deck tutorial completion', 'Knowledge verification', 'Teaching contributions'],
      eligibilityFactors: ['Tutorial engagement', 'Knowledge retention', 'Peer assistance'],
      fusionTrigger: false
    }
  };

  private tierMultipliers = {
    'Citizen': 1.0,
    'Governor': 2.0,
    'Commander': 3.0
  };

  private constructor() {
    this.ttsAgent = TTSEngineAgent.getInstance();
    this.initializeEngine();
  }

  public static getInstance(): TruthCoinClaimEngine {
    if (!TruthCoinClaimEngine.instance) {
      TruthCoinClaimEngine.instance = new TruthCoinClaimEngine();
    }
    return TruthCoinClaimEngine.instance;
  }

  private async initializeEngine(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing claims from localStorage
      const existingClaims = localStorage.getItem('truthcoin_claims');
      if (existingClaims) {
        this.claims = JSON.parse(existingClaims).map((claim: any) => ({
          ...claim,
          timestamp: new Date(claim.timestamp)
        }));
        console.log(`💰 Loaded ${this.claims.length} existing TruthCoin claims`);
      }

      this.isInitialized = true;
      console.log('💰 TruthCoinClaimEngine initialized - Genesis fusion system ready');

    } catch (error) {
      console.error('❌ TruthCoinClaimEngine initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Submit new TruthCoin claim with ZKP validation
   */
  public async submitClaim(
    claimType: TruthCoinClaim['claimType'],
    userId: string,
    userTier: TruthCoinClaim['userTier'],
    originDeck?: string
  ): Promise<TruthCoinClaim> {
    const startTime = Date.now();

    try {
      const config = this.claimTypeConfigs[claimType];
      const multiplier = this.tierMultipliers[userTier];
      const baseReward = config.baseReward;
      const finalReward = Math.round(baseReward * multiplier);

      // Generate claim metadata
      const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      const zkpHash = this.generateZKPHash(claimId, userId, claimType);
      const cidAnchor = `bafybei${Math.random().toString(36).substr(2, 46)}`;

      // Calculate eligibility score
      const eligibilityScore = this.calculateEligibilityScore(claimType, userTier, userId);

      const claim: TruthCoinClaim = {
        claimId,
        claimType,
        userId,
        userTier,
        baseReward,
        tierMultiplier: multiplier,
        finalReward,
        zkpHash,
        cidAnchor,
        timestamp: new Date(),
        status: 'pending',
        originDeck,
        eligibilityScore
      };

      console.log('🎯 Processing TruthCoin claim:', claimId);
      console.log(`💰 Reward: ${finalReward} TC (${baseReward} × ${multiplier}x ${userTier})`);
      console.log(`📊 Eligibility: ${eligibilityScore}% | Type: ${claimType}`);

      // Validate claim with ZKP verification
      const validationResult = await this.validateClaim(claim);
      
      if (validationResult.isValid) {
        claim.status = 'validated';
        claim.validationProof = validationResult.proof;
        
        // Auto-approve if eligibility score is high enough
        if (eligibilityScore >= 75) {
          claim.status = 'approved';
          console.log(`✅ Claim auto-approved (${eligibilityScore}% eligibility)`);
          
          // TTS notification for approved claims
          this.ttsAgent.queueNarration(
            `TruthCoin claim approved: ${finalReward} tokens for ${claimType.replace('_', ' ')}`,
            'claim-engine',
            'encouraging'
          );
          
          // Trigger Genesis fusion if applicable
          if (config.fusionTrigger && eligibilityScore >= 85) {
            console.log('🔗 Genesis fusion triggered for high-impact claim');
            this.triggerGenesisFusion(claim);
          }
        } else {
          console.log(`⏳ Claim requires manual review (${eligibilityScore}% eligibility)`);
        }
      } else {
        claim.status = 'rejected';
        console.error('❌ Claim validation failed:', validationResult.error);
      }

      // Add to claims array and save
      this.claims.push(claim);
      this.saveClaimsLog();

      const processingTime = Date.now() - startTime;
      console.log(`📊 Claim processed in ${processingTime}ms`);

      return claim;

    } catch (error) {
      console.error('❌ Claim submission failed:', error);
      throw error;
    }
  }

  /**
   * Calculate eligibility score based on multiple factors
   */
  private calculateEligibilityScore(
    claimType: string,
    userTier: string,
    userId: string
  ): number {
    let score = 50; // Base score

    // Tier bonus
    const tierBonus = { 'Citizen': 0, 'Governor': 15, 'Commander': 25 };
    score += tierBonus[userTier as keyof typeof tierBonus] || 0;

    // Claim type difficulty bonus
    const difficultyBonus = { 
      'referral': 5, 
      'governance': 15, 
      'civic_duty': 25, 
      'education': 10 
    };
    score += difficultyBonus[claimType as keyof typeof difficultyBonus] || 0;

    // Simulate user activity factors
    const activityFactor = Math.random() * 20; // 0-20 points
    score += activityFactor;

    // Historical performance bonus
    const userClaims = this.claims.filter(c => c.userId === userId && c.status === 'approved');
    const historyBonus = Math.min(userClaims.length * 2, 15); // Max 15 points
    score += historyBonus;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Validate claim with ZKP verification
   */
  private async validateClaim(claim: TruthCoinClaim): Promise<{
    isValid: boolean;
    proof?: string;
    error?: string;
  }> {
    try {
      // Simulate ZKP validation process
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock validation logic (95% success rate)
      const isValid = Math.random() > 0.05;
      
      if (isValid) {
        const proof = this.generateValidationProof(claim);
        return { isValid: true, proof };
      } else {
        return { isValid: false, error: 'ZKP validation failed' };
      }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Validation error' 
      };
    }
  }

  /**
   * Generate ZKP hash for claim verification
   */
  private generateZKPHash(claimId: string, userId: string, claimType: string): string {
    const content = `${claimId}:${userId}:${claimType}:${Date.now()}`;
    // Simple hash simulation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `zkp_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Generate validation proof
   */
  private generateValidationProof(claim: TruthCoinClaim): string {
    return `proof_${claim.claimId}_${Date.now().toString(36)}`;
  }

  /**
   * Trigger Genesis fusion for qualifying claims
   */
  private triggerGenesisFusion(claim: TruthCoinClaim): void {
    console.log(`🔗 Triggering Genesis fusion for claim: ${claim.claimId}`);
    
    // Store fusion trigger data
    const fusionData = {
      claimId: claim.claimId,
      userId: claim.userId,
      triggerType: 'civic_duty_completion',
      timestamp: new Date().toISOString(),
      eligibilityScore: claim.eligibilityScore
    };
    
    // Save to localStorage for GenesisFusionEngine pickup
    const existingFusions = JSON.parse(localStorage.getItem('genesis_fusion_triggers') || '[]');
    existingFusions.push(fusionData);
    localStorage.setItem('genesis_fusion_triggers', JSON.stringify(existingFusions));
    
    // TTS notification
    this.ttsAgent.queueNarration(
      'Genesis fusion activated - badge creation initiated',
      'claim-engine',
      'formal'
    );
  }

  /**
   * Get claim statistics
   */
  public getClaimStats(): ClaimStats {
    const totalClaims = this.claims.length;
    const approvedClaims = this.claims.filter(c => c.status === 'approved' || c.status === 'disbursed').length;
    const totalRewards = this.claims
      .filter(c => c.status === 'approved' || c.status === 'disbursed')
      .reduce((sum, c) => sum + c.finalReward, 0);
    
    return {
      totalClaims,
      approvedClaims,
      totalRewards,
      averageProcessingTime: 450, // Mock average
      successRate: totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0
    };
  }

  /**
   * Get recent claims for dashboard display
   */
  public getRecentClaims(limit: number = 10): TruthCoinClaim[] {
    return this.claims
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get claims by status
   */
  public getClaimsByStatus(status: TruthCoinClaim['status']): TruthCoinClaim[] {
    return this.claims.filter(c => c.status === status);
  }

  /**
   * Get claims by type
   */
  public getClaimsByType(claimType: TruthCoinClaim['claimType']): TruthCoinClaim[] {
    return this.claims.filter(c => c.claimType === claimType);
  }

  /**
   * Update claim status
   */
  public updateClaimStatus(claimId: string, status: TruthCoinClaim['status']): boolean {
    const claim = this.claims.find(c => c.claimId === claimId);
    if (claim) {
      claim.status = status;
      this.saveClaimsLog();
      
      console.log(`🔄 Claim ${claimId} status updated to: ${status}`);
      
      // TTS notification for status changes
      if (status === 'approved' || status === 'disbursed') {
        this.ttsAgent.queueNarration(
          `Claim ${claimId.slice(-8)} ${status}`,
          'claim-engine',
          'informative'
        );
      }
      
      return true;
    }
    return false;
  }

  /**
   * Get claim type configurations
   */
  public getClaimTypeConfigs(): Record<string, ClaimTypeConfig> {
    return { ...this.claimTypeConfigs };
  }

  /**
   * Save claims log to localStorage and export
   */
  private saveClaimsLog(): void {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('truthcoin_claims', JSON.stringify(this.claims));

      // Create audit trail data
      const auditData = {
        generated: new Date().toISOString(),
        totalClaims: this.claims.length,
        stats: this.getClaimStats(),
        claims: this.claims.map(claim => ({
          ...claim,
          timestamp: claim.timestamp.toISOString()
        }))
      };

      // Store in global window for debugging
      (window as any).truthCoinClaimsAudit = auditData;

      console.log(`📋 TruthCoin claims audit updated: ${this.claims.length} entries`);

    } catch (error) {
      console.error('❌ Failed to save claims audit trail:', error);
    }
  }

  /**
   * Export claims for external integration
   */
  public exportClaimsAudit(): any {
    return {
      generated: new Date().toISOString(),
      engine: 'TruthCoinClaimEngine',
      version: '1.0.0',
      totalClaims: this.claims.length,
      stats: this.getClaimStats(),
      claimTypes: this.claimTypeConfigs,
      tierMultipliers: this.tierMultipliers,
      claims: this.claims.map(claim => ({
        ...claim,
        timestamp: claim.timestamp.toISOString()
      }))
    };
  }
}

export default TruthCoinClaimEngine;