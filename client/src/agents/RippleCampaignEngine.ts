/**
 * RippleCampaignEngine.ts
 * Phase PRESS-REPLAY Step 4: ZIP-targeted civic campaign messaging system
 * Commander Mark directive via JASMY Relay
 */

export interface CampaignTarget {
  zipCode: string;
  city: string;
  state: string;
  population: number;
  engagement_baseline: number;
  representative_alignment: number; // 0-100%
}

export interface Campaign {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'paused';
  target_zips: string[];
  topic: 'healthcare' | 'taxation' | 'infrastructure' | 'climate' | 'governance';
  created: Date;
  reach_target: number;
  actual_reach: number;
  engagement_rate: number;
  pushback_percentage: number;
  message_template: string;
  sentiment_trigger_threshold: number;
}

export interface CampaignMetrics {
  total_campaigns: number;
  active_campaigns: number;
  total_reach: number;
  avg_engagement: number;
  successful_nudges: number;
}

export class RippleCampaignEngine {
  private static instance: RippleCampaignEngine;
  private campaigns: Campaign[] = [];
  private targets: CampaignTarget[] = [];
  private metrics: CampaignMetrics = {
    total_campaigns: 0,
    active_campaigns: 0,
    total_reach: 0,
    avg_engagement: 0,
    successful_nudges: 0
  };

  private constructor() {
    this.initializeTargets();
    this.initializeMockCampaigns();
    this.calculateMetrics();
  }

  public static getInstance(): RippleCampaignEngine {
    if (!RippleCampaignEngine.instance) {
      RippleCampaignEngine.instance = new RippleCampaignEngine();
    }
    return RippleCampaignEngine.instance;
  }

  private initializeTargets(): void {
    this.targets = [
      {
        zipCode: '78701',
        city: 'Austin',
        state: 'TX',
        population: 315000,
        engagement_baseline: 0.18,
        representative_alignment: 72
      },
      {
        zipCode: '97201',
        city: 'Portland',
        state: 'OR',
        population: 295000,
        engagement_baseline: 0.22,
        representative_alignment: 68
      },
      {
        zipCode: '05401',
        city: 'Burlington',
        state: 'VT',
        population: 42000,
        engagement_baseline: 0.31,
        representative_alignment: 91
      },
      {
        zipCode: '95110',
        city: 'San Jose',
        state: 'CA',
        population: 345000,
        engagement_baseline: 0.15,
        representative_alignment: 78
      },
      {
        zipCode: '48104',
        city: 'Ann Arbor',
        state: 'MI',
        population: 52000,
        engagement_baseline: 0.28,
        representative_alignment: 84
      }
    ];
  }

  private initializeMockCampaigns(): void {
    this.campaigns = [
      {
        id: 'camp_healthcare_austin_001',
        name: 'Healthcare Access Initiative - Austin',
        status: 'active',
        target_zips: ['78701'],
        topic: 'healthcare',
        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reach_target: 47250, // 15% of 315k
        actual_reach: 45120,
        engagement_rate: 0.08,
        pushback_percentage: 0.12,
        message_template: 'Healthcare access improvements needed in your district.',
        sentiment_trigger_threshold: 65
      },
      {
        id: 'camp_infrastructure_portland_001',
        name: 'Infrastructure Modernization - Portland',
        status: 'active',
        target_zips: ['97201'],
        topic: 'infrastructure',
        created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reach_target: 44250, // 15% of 295k
        actual_reach: 41800,
        engagement_rate: 0.11,
        pushback_percentage: 0.08,
        message_template: 'Infrastructure modernization proposals affecting your community.',
        sentiment_trigger_threshold: 70
      },
      {
        id: 'camp_climate_burlington_001',
        name: 'Climate Action - Burlington',
        status: 'completed',
        target_zips: ['05401'],
        topic: 'climate',
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reach_target: 6300, // 15% of 42k
        actual_reach: 6890,
        engagement_rate: 0.25,
        pushback_percentage: 0.03,
        message_template: 'Climate resilience initiatives for Burlington communities.',
        sentiment_trigger_threshold: 80
      }
    ];
  }

  private calculateMetrics(): void {
    this.metrics = {
      total_campaigns: this.campaigns.length,
      active_campaigns: this.campaigns.filter(c => c.status === 'active').length,
      total_reach: this.campaigns.reduce((sum, c) => sum + c.actual_reach, 0),
      avg_engagement: this.campaigns.length > 0 
        ? this.campaigns.reduce((sum, c) => sum + c.engagement_rate, 0) / this.campaigns.length 
        : 0,
      successful_nudges: this.campaigns.filter(c => c.engagement_rate > 0.1).length
    };
  }

  public createCampaign(
    name: string, 
    targetZips: string[], 
    topic: Campaign['topic'],
    messageTemplate: string
  ): Campaign {
    const campaign: Campaign = {
      id: `camp_${topic}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      status: 'pending',
      target_zips: targetZips,
      topic,
      created: new Date(),
      reach_target: this.calculateReachTarget(targetZips),
      actual_reach: 0,
      engagement_rate: 0,
      pushback_percentage: 0,
      message_template: messageTemplate,
      sentiment_trigger_threshold: 70
    };

    this.campaigns.push(campaign);
    this.calculateMetrics();
    
    console.log(`📢 Campaign created: ${campaign.name} (${campaign.id})`);
    
    // Auto-activate after 2 seconds for simulation
    setTimeout(() => {
      this.activateCampaign(campaign.id);
    }, 2000);

    return campaign;
  }

  public activateCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign || campaign.status !== 'pending') return false;

    campaign.status = 'active';
    
    // Simulate progressive reach and engagement
    this.simulateCampaignProgress(campaign);
    
    console.log(`🚀 Campaign activated: ${campaign.name}`);
    this.calculateMetrics();
    return true;
  }

  public pauseCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign || campaign.status !== 'active') return false;

    campaign.status = 'paused';
    console.log(`⏸️ Campaign paused: ${campaign.name}`);
    this.calculateMetrics();
    return true;
  }

  public resumeCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign || campaign.status !== 'paused') return false;

    campaign.status = 'active';
    this.simulateCampaignProgress(campaign);
    
    console.log(`▶️ Campaign resumed: ${campaign.name}`);
    this.calculateMetrics();
    return true;
  }

  private simulateCampaignProgress(campaign: Campaign): void {
    const progressInterval = setInterval(() => {
      if (campaign.status !== 'active') {
        clearInterval(progressInterval);
        return;
      }

      // Simulate reach progress based on target ZIP engagement baseline
      const targetData = this.getTargetData(campaign.target_zips[0]);
      const progressIncrement = Math.random() * 0.02 + targetData.engagement_baseline * 0.1;
      
      campaign.actual_reach = Math.min(
        campaign.reach_target,
        campaign.actual_reach + Math.floor(campaign.reach_target * progressIncrement)
      );

      // Simulate engagement and pushback
      campaign.engagement_rate = Math.min(0.3, campaign.engagement_rate + Math.random() * 0.01);
      campaign.pushback_percentage = Math.min(0.2, campaign.pushback_percentage + Math.random() * 0.005);

      // Check for completion
      if (campaign.actual_reach >= campaign.reach_target * 0.95) {
        campaign.status = 'completed';
        console.log(`✅ Campaign completed: ${campaign.name} (${campaign.actual_reach} reach)`);
        clearInterval(progressInterval);
      }

      this.calculateMetrics();
    }, 3000); // Update every 3 seconds
  }

  private calculateReachTarget(zipCodes: string[]): number {
    return zipCodes.reduce((total, zip) => {
      const target = this.getTargetData(zip);
      return total + Math.floor(target.population * 0.15); // 15% reach simulation
    }, 0);
  }

  private getTargetData(zipCode: string): CampaignTarget {
    return this.targets.find(t => t.zipCode === zipCode) || this.targets[0];
  }

  public getCampaigns(): Campaign[] {
    return [...this.campaigns];
  }

  public getActiveCampaigns(): Campaign[] {
    return this.campaigns.filter(c => c.status === 'active');
  }

  public getTargets(): CampaignTarget[] {
    return [...this.targets];
  }

  public getMetrics(): CampaignMetrics {
    return { ...this.metrics };
  }

  public getCampaign(id: string): Campaign | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  // Deck #10 sentiment integration
  public triggerSentimentBasedCampaign(sentiment: number, topic: string): boolean {
    const availableTargets = this.targets.filter(t => 
      t.representative_alignment < sentiment && 
      !this.campaigns.some(c => 
        c.status === 'active' && 
        c.target_zips.includes(t.zipCode)
      )
    );

    if (availableTargets.length === 0) return false;

    const selectedTarget = availableTargets[0];
    const campaign = this.createCampaign(
      `Sentiment-Triggered ${topic} Campaign - ${selectedTarget.city}`,
      [selectedTarget.zipCode],
      topic as Campaign['topic'],
      `Addressing ${topic} concerns based on community sentiment in ${selectedTarget.city}.`
    );

    console.log(`🔄 Sentiment-triggered campaign: ${campaign.name} (sentiment: ${sentiment}%)`);
    return true;
  }
}

// Global access for debugging
declare global {
  interface Window {
    rippleCampaignEngine: RippleCampaignEngine;
  }
}

if (typeof window !== 'undefined') {
  window.rippleCampaignEngine = RippleCampaignEngine.getInstance();
}