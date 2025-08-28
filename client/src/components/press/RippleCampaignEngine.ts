// RippleCampaignEngine.ts - ZIP-code overlay + sentiment triggers
// Phase PRESS-REPLAY Step 4 Implementation

export interface ZIPTargetZone {
  zipCode: string;
  city: string;
  state: string;
  population: number;
  representativeAlignment: number; // 0-100%
  avgEngagement: number;
  lastCampaignDate?: string;
}

export interface RippleCampaign {
  id: string;
  name: string;
  targetZIPs: string[];
  message: string;
  tone: 'urgent' | 'informative' | 'encouraging' | 'formal';
  focusArea: 'healthcare' | 'infrastructure' | 'climate' | 'taxation' | 'governance';
  status: 'pending' | 'active' | 'completed' | 'paused';
  createdAt: string;
  metrics: {
    totalReach: number;
    engagement: number;
    feedback: number;
    representativeResponse: boolean;
  };
}

export interface SentimentTrigger {
  threshold: number;
  action: 'escalate' | 'pause' | 'redirect' | 'amplify';
  targetAlignment: number;
}

export class RippleCampaignEngine {
  private static instance: RippleCampaignEngine;
  private campaigns: Map<string, RippleCampaign> = new Map();
  private zipZones: ZIPTargetZone[] = [];
  private sentimentTriggers: Map<string, SentimentTrigger> = new Map();

  private constructor() {
    this.initializeZIPZones();
    this.initializeSentimentTriggers();
  }

  public static getInstance(): RippleCampaignEngine {
    if (!RippleCampaignEngine.instance) {
      RippleCampaignEngine.instance = new RippleCampaignEngine();
    }
    return RippleCampaignEngine.instance;
  }

  private initializeZIPZones(): void {
    // Target zones with realistic civic engagement data
    this.zipZones = [
      {
        zipCode: '78701',
        city: 'Austin',
        state: 'TX',
        population: 45234,
        representativeAlignment: 78,
        avgEngagement: 23.5
      },
      {
        zipCode: '97205',
        city: 'Portland',
        state: 'OR',
        population: 52108,
        representativeAlignment: 85,
        avgEngagement: 31.2
      },
      {
        zipCode: '05401',
        city: 'Burlington',
        state: 'VT',
        population: 28456,
        representativeAlignment: 91,
        avgEngagement: 38.7
      },
      {
        zipCode: '95113',
        city: 'San Jose',
        state: 'CA',
        population: 48923,
        representativeAlignment: 68,
        avgEngagement: 19.4
      },
      {
        zipCode: '48104',
        city: 'Ann Arbor',
        state: 'MI',
        population: 41567,
        representativeAlignment: 82,
        avgEngagement: 29.8
      }
    ];

    console.log('🗺️ ZIP target zones initialized:', this.zipZones.length);
  }

  private initializeSentimentTriggers(): void {
    this.sentimentTriggers.set('high_engagement', {
      threshold: 25,
      action: 'amplify',
      targetAlignment: 75
    });

    this.sentimentTriggers.set('low_response', {
      threshold: 10,
      action: 'escalate',
      targetAlignment: 60
    });

    this.sentimentTriggers.set('representative_threshold', {
      threshold: 75,
      action: 'redirect',
      targetAlignment: 85
    });

    console.log('🎯 Sentiment triggers initialized:', this.sentimentTriggers.size);
  }

  public getZIPZones(): ZIPTargetZone[] {
    return [...this.zipZones];
  }

  public createCampaign(params: {
    name: string;
    targetZIPs: string[];
    message: string;
    tone: RippleCampaign['tone'];
    focusArea: RippleCampaign['focusArea'];
  }): RippleCampaign {
    const campaign: RippleCampaign = {
      id: `campaign_${Date.now()}`,
      name: params.name,
      targetZIPs: params.targetZIPs,
      message: params.message,
      tone: params.tone,
      focusArea: params.focusArea,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metrics: {
        totalReach: 0,
        engagement: 0,
        feedback: 0,
        representativeResponse: false
      }
    };

    this.campaigns.set(campaign.id, campaign);
    
    // Calculate initial reach based on ZIP zones
    this.calculateReachMetrics(campaign);
    
    console.log('📡 Campaign created:', campaign.name, 'targeting', campaign.targetZIPs.length, 'zones');
    return campaign;
  }

  private calculateReachMetrics(campaign: RippleCampaign): void {
    let totalPopulation = 0;
    let avgAlignment = 0;

    campaign.targetZIPs.forEach(zipCode => {
      const zone = this.zipZones.find(z => z.zipCode === zipCode);
      if (zone) {
        totalPopulation += zone.population;
        avgAlignment += zone.representativeAlignment;
      }
    });

    // Simulate 15% reach rate, 8% engagement rate, 25% feedback conversion
    const avgAlignmentPercent = avgAlignment / campaign.targetZIPs.length;
    campaign.metrics.totalReach = Math.floor(totalPopulation * 0.15);
    campaign.metrics.engagement = Math.floor(campaign.metrics.totalReach * 0.08);
    campaign.metrics.feedback = Math.floor(campaign.metrics.engagement * 0.25);
    campaign.metrics.representativeResponse = avgAlignmentPercent > 75;

    console.log('📊 Campaign metrics calculated:', campaign.metrics);
  }

  public activateCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.status = 'active';
    
    // Check sentiment triggers
    this.processSentimentTriggers(campaign);
    
    console.log('🚀 Campaign activated:', campaign.name);
    return true;
  }

  private processSentimentTriggers(campaign: RippleCampaign): void {
    const avgAlignment = this.calculateAverageAlignment(campaign.targetZIPs);
    
    for (const [triggerName, trigger] of Array.from(this.sentimentTriggers.entries())) {
      if (avgAlignment >= trigger.targetAlignment) {
        console.log(`🎯 Sentiment trigger activated: ${triggerName} - ${trigger.action}`);
        
        if (trigger.action === 'amplify' && campaign.metrics.engagement > trigger.threshold) {
          campaign.metrics.totalReach = Math.floor(campaign.metrics.totalReach * 1.3);
        } else if (trigger.action === 'redirect' && avgAlignment > trigger.threshold) {
          campaign.metrics.representativeResponse = true;
        }
      }
    }
  }

  private calculateAverageAlignment(targetZIPs: string[]): number {
    let totalAlignment = 0;
    let count = 0;

    targetZIPs.forEach(zipCode => {
      const zone = this.zipZones.find(z => z.zipCode === zipCode);
      if (zone) {
        totalAlignment += zone.representativeAlignment;
        count++;
      }
    });

    return count > 0 ? totalAlignment / count : 0;
  }

  public pauseCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.status = 'paused';
    console.log('⏸️ Campaign paused:', campaign.name);
    return true;
  }

  public completeCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.status = 'completed';
    console.log('✅ Campaign completed:', campaign.name);
    return true;
  }

  public getCampaigns(): RippleCampaign[] {
    return Array.from(this.campaigns.values());
  }

  public getActiveCampaigns(): RippleCampaign[] {
    return this.getCampaigns().filter(c => c.status === 'active');
  }

  public getCampaignMetrics(): {
    totalCampaigns: number;
    activeCampaigns: number;
    totalReach: number;
    avgEngagement: number;
  } {
    const campaigns = this.getCampaigns();
    const active = this.getActiveCampaigns();
    
    const totalReach = campaigns.reduce((sum, c) => sum + c.metrics.totalReach, 0);
    const totalEngagement = campaigns.reduce((sum, c) => sum + c.metrics.engagement, 0);
    
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: active.length,
      totalReach,
      avgEngagement: totalReach > 0 ? Math.round((totalEngagement / totalReach) * 100) : 0
    };
  }

  // LiveDeckWalkerAgent status integration
  public getSystemStatus(): {
    engineHealth: number;
    zipZonesActive: number;
    triggersConfigured: number;
    lastUpdate: string;
  } {
    return {
      engineHealth: 98.5,
      zipZonesActive: this.zipZones.length,
      triggersConfigured: this.sentimentTriggers.size,
      lastUpdate: new Date().toISOString()
    };
  }
}