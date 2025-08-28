// GenesisFusionEngine.ts - Phase X-FINANCE Step 5: Genesis Badge Fusion System
// Guardian badge fusion logic across 8 pillars with auto-assignment

import TTSEngineAgent from '../../agents/TTSEngineAgent';

export interface GuardianPillar {
  pillarId: string;
  pillarName: string;
  guardian: string;
  icon: string;
  completionRequirement: number; // TruthCoins required
  fusionPower: number; // 0-100%
}

export interface GenesisBadge {
  badgeId: string;
  userId: string;
  userTier: 'Citizen' | 'Governor' | 'Commander';
  completedPillars: string[];
  assignedGuardians: string[];
  fusionPower: number; // Overall power 0-100%
  zkpHash: string;
  cidAnchor: string;
  timestamp: Date;
  status: 'pending' | 'fusing' | 'completed' | 'minted';
  claimTriggers: string[]; // Related claim IDs
}

export interface FusionMetadata {
  fusionId: string;
  badgeId: string;
  pillarId: string;
  guardian: string;
  fusionTimestamp: Date;
  powerContribution: number;
  verificationProof: string;
}

class GenesisFusionEngine {
  private static instance: GenesisFusionEngine;
  private badges: GenesisBadge[] = [];
  private fusionMetadata: FusionMetadata[] = [];
  private ttsAgent: TTSEngineAgent;
  private isInitialized = false;

  private guardianPillars: GuardianPillar[] = [
    {
      pillarId: 'governance',
      pillarName: 'Governance',
      guardian: 'Athena',
      icon: '⚖️',
      completionRequirement: 500,
      fusionPower: 15
    },
    {
      pillarId: 'education',
      pillarName: 'Education', 
      guardian: 'Sophia',
      icon: '📚',
      completionRequirement: 300,
      fusionPower: 12
    },
    {
      pillarId: 'privacy',
      pillarName: 'Privacy',
      guardian: 'Themis',
      icon: '🔒',
      completionRequirement: 400,
      fusionPower: 14
    },
    {
      pillarId: 'sustainability',
      pillarName: 'Sustainability',
      guardian: 'Apollo',
      icon: '🌱',
      completionRequirement: 350,
      fusionPower: 13
    },
    {
      pillarId: 'wellbeing',
      pillarName: 'Wellbeing',
      guardian: 'Artemis',
      icon: '💚',
      completionRequirement: 275,
      fusionPower: 11
    },
    {
      pillarId: 'agriculture',
      pillarName: 'Agriculture',
      guardian: 'Demeter',
      icon: '🌾',
      completionRequirement: 325,
      fusionPower: 12
    },
    {
      pillarId: 'health',
      pillarName: 'Health',
      guardian: 'Asclepius',
      icon: '⚕️',
      completionRequirement: 450,
      fusionPower: 14
    },
    {
      pillarId: 'justice',
      pillarName: 'Justice',
      guardian: 'Mnemosyne',
      icon: '⚖️',
      completionRequirement: 500,
      fusionPower: 19
    }
  ];

  private constructor() {
    this.ttsAgent = TTSEngineAgent.getInstance();
    this.initializeEngine();
  }

  public static getInstance(): GenesisFusionEngine {
    if (!GenesisFusionEngine.instance) {
      GenesisFusionEngine.instance = new GenesisFusionEngine();
    }
    return GenesisFusionEngine.instance;
  }

  private async initializeEngine(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing badges and fusion data
      const existingBadges = localStorage.getItem('genesis_badges');
      if (existingBadges) {
        this.badges = JSON.parse(existingBadges).map((badge: any) => ({
          ...badge,
          timestamp: new Date(badge.timestamp)
        }));
        console.log(`🏅 Loaded ${this.badges.length} existing Genesis badges`);
      }

      const existingFusions = localStorage.getItem('fusion_metadata');
      if (existingFusions) {
        this.fusionMetadata = JSON.parse(existingFusions).map((fusion: any) => ({
          ...fusion,
          fusionTimestamp: new Date(fusion.fusionTimestamp)
        }));
        console.log(`🔗 Loaded ${this.fusionMetadata.length} fusion metadata entries`);
      }

      // Check for pending fusion triggers
      this.processPendingFusions();

      this.isInitialized = true;
      console.log('🏅 GenesisFusionEngine initialized - Guardian badge fusion ready');

    } catch (error) {
      console.error('❌ GenesisFusionEngine initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Process pending fusion triggers from TruthCoinClaimEngine
   */
  private processPendingFusions(): void {
    try {
      const triggers = JSON.parse(localStorage.getItem('genesis_fusion_triggers') || '[]');
      
      triggers.forEach((trigger: any) => {
        if (trigger.triggerType === 'civic_duty_completion') {
          this.initiateBadgeFusion(trigger.userId, trigger.claimId, trigger.eligibilityScore);
        }
      });

      // Clear processed triggers
      localStorage.setItem('genesis_fusion_triggers', '[]');
      
      if (triggers.length > 0) {
        console.log(`🔄 Processed ${triggers.length} pending fusion triggers`);
      }
    } catch (error) {
      console.error('❌ Failed to process fusion triggers:', error);
    }
  }

  /**
   * Initiate badge fusion process
   */
  public async initiateBadgeFusion(
    userId: string,
    claimId: string,
    eligibilityScore: number,
    userTier: GenesisBadge['userTier'] = 'Citizen'
  ): Promise<GenesisBadge> {
    try {
      // Check if user already has a badge in progress
      let existingBadge = this.badges.find(b => b.userId === userId && b.status !== 'completed');
      
      if (!existingBadge) {
        // Create new Genesis badge
        const badgeId = `genesis_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        const zkpHash = this.generateZKPHash(badgeId, userId);
        const cidAnchor = `bafybei${Math.random().toString(36).substr(2, 46)}`;

        existingBadge = {
          badgeId,
          userId,
          userTier,
          completedPillars: [],
          assignedGuardians: [],
          fusionPower: 0,
          zkpHash,
          cidAnchor,
          timestamp: new Date(),
          status: 'pending',
          claimTriggers: [claimId]
        };

        this.badges.push(existingBadge);
        console.log(`🏅 New Genesis badge initiated: ${badgeId}`);
      } else {
        // Add claim trigger to existing badge
        if (!existingBadge.claimTriggers.includes(claimId)) {
          existingBadge.claimTriggers.push(claimId);
        }
      }

      // Determine pillar completion based on eligibility score
      const completedPillar = this.selectPillarForCompletion(eligibilityScore, existingBadge.completedPillars);
      
      if (completedPillar) {
        await this.completePillar(existingBadge, completedPillar);
      }

      // Check if badge is ready for completion
      await this.checkBadgeCompletion(existingBadge);

      return existingBadge;

    } catch (error) {
      console.error('❌ Badge fusion initiation failed:', error);
      throw error;
    }
  }

  /**
   * Select pillar for completion based on eligibility score
   */
  private selectPillarForCompletion(eligibilityScore: number, completedPillars: string[]): GuardianPillar | null {
    // Higher eligibility scores unlock higher-power pillars
    const availablePillars = this.guardianPillars
      .filter(p => !completedPillars.includes(p.pillarId))
      .sort((a, b) => a.fusionPower - b.fusionPower);

    if (availablePillars.length === 0) return null;

    // Select pillar based on eligibility score
    if (eligibilityScore >= 90) {
      // High scores can complete any pillar
      return availablePillars[Math.floor(Math.random() * availablePillars.length)];
    } else if (eligibilityScore >= 80) {
      // Medium-high scores complete medium pillars
      return availablePillars.find(p => p.fusionPower <= 15) || availablePillars[0];
    } else {
      // Lower scores complete easier pillars first
      return availablePillars.find(p => p.fusionPower <= 12) || availablePillars[0];
    }
  }

  /**
   * Complete a pillar and assign guardian
   */
  private async completePillar(badge: GenesisBadge, pillar: GuardianPillar): Promise<void> {
    try {
      // Add pillar to completed list
      badge.completedPillars.push(pillar.pillarId);
      badge.assignedGuardians.push(pillar.guardian);
      badge.fusionPower += pillar.fusionPower;
      badge.status = 'fusing';

      // Create fusion metadata entry
      const fusionId = `fusion_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const fusionEntry: FusionMetadata = {
        fusionId,
        badgeId: badge.badgeId,
        pillarId: pillar.pillarId,
        guardian: pillar.guardian,
        fusionTimestamp: new Date(),
        powerContribution: pillar.fusionPower,
        verificationProof: this.generateFusionProof(badge.badgeId, pillar.pillarId)
      };

      this.fusionMetadata.push(fusionEntry);

      console.log(`🔗 Pillar completed: ${pillar.pillarName} (${pillar.guardian})`);
      console.log(`⚡ Fusion power increased: +${pillar.fusionPower}% (Total: ${badge.fusionPower}%)`);

      // TTS notification for pillar completion
      this.ttsAgent.queueNarration(
        `${pillar.pillarName} pillar completed. Guardian ${pillar.guardian} assigned. Fusion power increased`,
        'fusion-engine',
        'encouraging'
      );

      // Save progress
      this.saveFusionData();

    } catch (error) {
      console.error('❌ Pillar completion failed:', error);
      throw error;
    }
  }

  /**
   * Check if badge is ready for completion
   */
  private async checkBadgeCompletion(badge: GenesisBadge): Promise<void> {
    // Badge completion requirements vary by tier
    const completionThresholds = {
      'Citizen': 4, // 4 pillars
      'Governor': 6, // 6 pillars  
      'Commander': 8 // All 8 pillars
    };

    const requiredPillars = completionThresholds[badge.userTier];
    
    if (badge.completedPillars.length >= requiredPillars) {
      badge.status = 'completed';
      
      // Calculate final fusion power with tier bonus
      const tierBonus = { 'Citizen': 0, 'Governor': 10, 'Commander': 20 };
      badge.fusionPower += tierBonus[badge.userTier];
      badge.fusionPower = Math.min(badge.fusionPower, 100);

      console.log(`🎉 Genesis badge completed: ${badge.badgeId}`);
      console.log(`⚡ Final fusion power: ${badge.fusionPower}%`);
      console.log(`👥 Assigned guardians: ${badge.assignedGuardians.join(', ')}`);

      // TTS notification for badge completion
      this.ttsAgent.queueNarration(
        `Genesis badge fusion complete. Final power ${badge.fusionPower} percent. All guardians assigned`,
        'fusion-engine',
        'formal'
      );

      // Trigger minting process
      await this.initiateBadgeMinting(badge);
    }
  }

  /**
   * Initiate badge minting process
   */
  private async initiateBadgeMinting(badge: GenesisBadge): Promise<void> {
    try {
      badge.status = 'minted';
      
      // Create Genesis Token (mock blockchain interaction)
      const genesisToken = {
        tokenId: `GT_${badge.badgeId}`,
        owner: badge.userId,
        pillars: badge.completedPillars,
        guardians: badge.assignedGuardians,
        power: badge.fusionPower,
        mintTimestamp: new Date().toISOString(),
        zkpHash: badge.zkpHash,
        cidAnchor: badge.cidAnchor
      };

      // Store genesis token data
      const existingTokens = JSON.parse(localStorage.getItem('genesis_tokens') || '[]');
      existingTokens.push(genesisToken);
      localStorage.setItem('genesis_tokens', JSON.stringify(existingTokens));

      console.log(`🪙 Genesis Token minted: ${genesisToken.tokenId}`);
      
      // TTS notification for minting
      this.ttsAgent.queueNarration(
        'Genesis Token successfully minted and ready for claim',
        'fusion-engine',
        'formal'
      );

      this.saveFusionData();

    } catch (error) {
      console.error('❌ Badge minting failed:', error);
      throw error;
    }
  }

  /**
   * Get badge by user ID
   */
  public getBadgeByUserId(userId: string): GenesisBadge | undefined {
    return this.badges.find(b => b.userId === userId);
  }

  /**
   * Get badges by status
   */
  public getBadgesByStatus(status: GenesisBadge['status']): GenesisBadge[] {
    return this.badges.filter(b => b.status === status);
  }

  /**
   * Get fusion statistics
   */
  public getFusionStats(): {
    totalBadges: number;
    completedBadges: number;
    averageFusionPower: number;
    totalPillarsCompleted: number;
    mostActiveGuardian: string;
  } {
    const totalBadges = this.badges.length;
    const completedBadges = this.badges.filter(b => b.status === 'completed' || b.status === 'minted').length;
    const totalFusionPower = this.badges.reduce((sum, b) => sum + b.fusionPower, 0);
    const averageFusionPower = totalBadges > 0 ? Math.round(totalFusionPower / totalBadges) : 0;
    const totalPillarsCompleted = this.badges.reduce((sum, b) => sum + b.completedPillars.length, 0);
    
    // Find most active guardian
    const guardianCounts: Record<string, number> = {};
    this.badges.forEach(badge => {
      badge.assignedGuardians.forEach(guardian => {
        guardianCounts[guardian] = (guardianCounts[guardian] || 0) + 1;
      });
    });
    
    const mostActiveGuardian = Object.keys(guardianCounts).reduce((a, b) => 
      guardianCounts[a] > guardianCounts[b] ? a : b, 'Athena'
    );

    return {
      totalBadges,
      completedBadges,
      averageFusionPower,
      totalPillarsCompleted,
      mostActiveGuardian
    };
  }

  /**
   * Get guardian pillars configuration
   */
  public getGuardianPillars(): GuardianPillar[] {
    return [...this.guardianPillars];
  }

  /**
   * Generate ZKP hash for badge
   */
  private generateZKPHash(badgeId: string, userId: string): string {
    const content = `${badgeId}:${userId}:genesis:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `zkp_genesis_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Generate fusion proof
   */
  private generateFusionProof(badgeId: string, pillarId: string): string {
    return `fusion_proof_${badgeId}_${pillarId}_${Date.now().toString(36)}`;
  }

  /**
   * Save fusion data to localStorage
   */
  private saveFusionData(): void {
    try {
      // Save badges
      localStorage.setItem('genesis_badges', JSON.stringify(this.badges.map(badge => ({
        ...badge,
        timestamp: badge.timestamp.toISOString()
      }))));

      // Save fusion metadata
      localStorage.setItem('fusion_metadata', JSON.stringify(this.fusionMetadata.map(fusion => ({
        ...fusion,
        fusionTimestamp: fusion.fusionTimestamp.toISOString()
      }))));

      // Create export data for debugging
      const exportData = {
        generated: new Date().toISOString(),
        totalBadges: this.badges.length,
        stats: this.getFusionStats(),
        badges: this.badges.map(badge => ({
          ...badge,
          timestamp: badge.timestamp.toISOString()
        })),
        fusionMetadata: this.fusionMetadata.map(fusion => ({
          ...fusion,
          fusionTimestamp: fusion.fusionTimestamp.toISOString()
        }))
      };

      (window as any).genesisFusionData = exportData;
      console.log(`🔄 Genesis fusion data saved: ${this.badges.length} badges, ${this.fusionMetadata.length} fusions`);

    } catch (error) {
      console.error('❌ Failed to save fusion data:', error);
    }
  }

  /**
   * Export fusion data for external integration
   */
  public exportFusionData(): any {
    return {
      generated: new Date().toISOString(),
      engine: 'GenesisFusionEngine',
      version: '1.0.0',
      guardianPillars: this.guardianPillars,
      stats: this.getFusionStats(),
      badges: this.badges.map(badge => ({
        ...badge,
        timestamp: badge.timestamp.toISOString()
      })),
      fusionMetadata: this.fusionMetadata.map(fusion => ({
        ...fusion,
        fusionTimestamp: fusion.fusionTimestamp.toISOString()
      }))
    };
  }
}

export default GenesisFusionEngine;