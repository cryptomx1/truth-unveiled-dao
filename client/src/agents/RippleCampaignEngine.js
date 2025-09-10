/**
 * RippleCampaignEngine.ts
 * Phase PRESS-REPLAY Step 4: ZIP-targeted civic campaign messaging system
 * Commander Mark directive via JASMY Relay
 */
export class RippleCampaignEngine {
    static instance;
    campaigns = [];
    targets = [];
    metrics = {
        total_campaigns: 0,
        active_campaigns: 0,
        total_reach: 0,
        avg_engagement: 0,
        successful_nudges: 0
    };
    constructor() {
        this.initializeTargets();
        this.initializeMockCampaigns();
        this.calculateMetrics();
    }
    static getInstance() {
        if (!RippleCampaignEngine.instance) {
            RippleCampaignEngine.instance = new RippleCampaignEngine();
        }
        return RippleCampaignEngine.instance;
    }
    initializeTargets() {
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
    initializeMockCampaigns() {
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
    calculateMetrics() {
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
    createCampaign(name, targetZips, topic, messageTemplate) {
        const campaign = {
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
    activateCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign || campaign.status !== 'pending')
            return false;
        campaign.status = 'active';
        // Simulate progressive reach and engagement
        this.simulateCampaignProgress(campaign);
        console.log(`🚀 Campaign activated: ${campaign.name}`);
        this.calculateMetrics();
        return true;
    }
    pauseCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign || campaign.status !== 'active')
            return false;
        campaign.status = 'paused';
        console.log(`⏸️ Campaign paused: ${campaign.name}`);
        this.calculateMetrics();
        return true;
    }
    resumeCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign || campaign.status !== 'paused')
            return false;
        campaign.status = 'active';
        this.simulateCampaignProgress(campaign);
        console.log(`▶️ Campaign resumed: ${campaign.name}`);
        this.calculateMetrics();
        return true;
    }
    simulateCampaignProgress(campaign) {
        const progressInterval = setInterval(() => {
            if (campaign.status !== 'active') {
                clearInterval(progressInterval);
                return;
            }
            // Simulate reach progress based on target ZIP engagement baseline
            const targetData = this.getTargetData(campaign.target_zips[0]);
            const progressIncrement = Math.random() * 0.02 + targetData.engagement_baseline * 0.1;
            campaign.actual_reach = Math.min(campaign.reach_target, campaign.actual_reach + Math.floor(campaign.reach_target * progressIncrement));
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
    calculateReachTarget(zipCodes) {
        return zipCodes.reduce((total, zip) => {
            const target = this.getTargetData(zip);
            return total + Math.floor(target.population * 0.15); // 15% reach simulation
        }, 0);
    }
    getTargetData(zipCode) {
        return this.targets.find(t => t.zipCode === zipCode) || this.targets[0];
    }
    getCampaigns() {
        return [...this.campaigns];
    }
    getActiveCampaigns() {
        return this.campaigns.filter(c => c.status === 'active');
    }
    getTargets() {
        return [...this.targets];
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getCampaign(id) {
        return this.campaigns.find(c => c.id === id);
    }
    // Deck #10 sentiment integration
    triggerSentimentBasedCampaign(sentiment, topic) {
        const availableTargets = this.targets.filter(t => t.representative_alignment < sentiment &&
            !this.campaigns.some(c => c.status === 'active' &&
                c.target_zips.includes(t.zipCode)));
        if (availableTargets.length === 0)
            return false;
        const selectedTarget = availableTargets[0];
        const campaign = this.createCampaign(`Sentiment-Triggered ${topic} Campaign - ${selectedTarget.city}`, [selectedTarget.zipCode], topic, `Addressing ${topic} concerns based on community sentiment in ${selectedTarget.city}.`);
        console.log(`🔄 Sentiment-triggered campaign: ${campaign.name} (sentiment: ${sentiment}%)`);
        return true;
    }
}
if (typeof window !== 'undefined') {
    window.rippleCampaignEngine = RippleCampaignEngine.getInstance();
}
