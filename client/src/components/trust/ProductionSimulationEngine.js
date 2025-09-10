/**
 * ProductionSimulationEngine.ts
 * Phase X-D Step 4: DAO-wide trust flow simulation for 24h production testing
 * Commander Mark authorization via JASMY Relay
 */
import TrustSentimentAggregator from './TrustSentimentAggregator';
import TrustSentimentMonitor from './TrustSentimentMonitor';
export class ProductionSimulationEngine {
    static instance;
    config;
    isRunning = false;
    simulationStartTime = 0;
    currentStep = 0;
    trustDecayCurves = [];
    alignmentEvents = [];
    simulationMetrics;
    testDataset;
    static getInstance() {
        if (!ProductionSimulationEngine.instance) {
            ProductionSimulationEngine.instance = new ProductionSimulationEngine();
        }
        return ProductionSimulationEngine.instance;
    }
    constructor() {
        this.config = {
            duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            timeStep: 5 * 60 * 1000, // 5 minutes between steps
            decayRate: 0.02, // 2% decay per hour
            alertAutoArchive: true,
            sentimentAlignmentReplay: true,
            mockDatasetSize: 1000
        };
        this.simulationMetrics = {
            totalSteps: 0,
            alertsGenerated: 0,
            alertsArchived: 0,
            trustDecayEvents: 0,
            alignmentEvents: 0,
            averageSystemTrust: 0,
            finalSystemHealth: 'unknown',
            simulationDuration: 0
        };
        this.generateTestDataset();
        console.log('🧪 ProductionSimulationEngine initialized - 24h DAO-wide trust flow simulation ready');
    }
    async startSimulation() {
        if (this.isRunning) {
            return {
                success: false,
                simulationId: '',
                estimatedDuration: 0,
                error: 'Simulation already running'
            };
        }
        try {
            const simulationId = `sim_${Date.now()}`;
            this.isRunning = true;
            this.simulationStartTime = Date.now();
            this.currentStep = 0;
            // Reset metrics
            this.simulationMetrics = {
                totalSteps: 0,
                alertsGenerated: 0,
                alertsArchived: 0,
                trustDecayEvents: 0,
                alignmentEvents: 0,
                averageSystemTrust: 0,
                finalSystemHealth: 'unknown',
                simulationDuration: 0
            };
            console.log(`🧪 Starting 24h production simulation: ${simulationId}`);
            // Start simulation loop
            this.runSimulationLoop();
            return {
                success: true,
                simulationId,
                estimatedDuration: this.config.duration
            };
        }
        catch (error) {
            this.isRunning = false;
            return {
                success: false,
                simulationId: '',
                estimatedDuration: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    stopSimulation() {
        this.isRunning = false;
        const duration = Date.now() - this.simulationStartTime;
        this.simulationMetrics.simulationDuration = duration;
        console.log(`🧪 Production simulation stopped after ${(duration / 1000).toFixed(1)}s`);
    }
    getSimulationStatus() {
        const elapsed = this.isRunning ? Date.now() - this.simulationStartTime : this.simulationMetrics.simulationDuration;
        const totalSteps = Math.floor(this.config.duration / this.config.timeStep);
        const remaining = Math.max(0, this.config.duration - elapsed);
        const progress = Math.min(100, (elapsed / this.config.duration) * 100);
        return {
            isRunning: this.isRunning,
            currentStep: this.currentStep,
            totalSteps,
            elapsed,
            remaining,
            progress,
            metrics: { ...this.simulationMetrics }
        };
    }
    getTrustDecayCurves() {
        return [...this.trustDecayCurves];
    }
    getSentimentAlignmentEvents() {
        return [...this.alignmentEvents];
    }
    exportSimulationResults() {
        return {
            schema: {
                version: 'phase_xd_step_4',
                description: '24h DAO-wide trust flow simulation results with decay and alignment'
            },
            config: this.config,
            dataset: this.testDataset,
            trustDecayCurves: this.trustDecayCurves,
            alignmentEvents: this.alignmentEvents,
            metrics: this.simulationMetrics,
            simulationStatus: this.getSimulationStatus(),
            exportedAt: new Date().toISOString()
        };
    }
    async runSimulationLoop() {
        const startTime = Date.now();
        const totalSteps = Math.floor(this.config.duration / this.config.timeStep);
        while (this.isRunning && this.currentStep < totalSteps) {
            try {
                await this.executeSimulationStep();
                this.currentStep++;
                // Wait for next step (accelerated for demo)
                await new Promise(resolve => setTimeout(resolve, 100));
                // Progress logging every 50 steps
                if (this.currentStep % 50 === 0) {
                    const progress = (this.currentStep / totalSteps) * 100;
                    console.log(`🧪 Simulation progress: ${progress.toFixed(1)}% (${this.currentStep}/${totalSteps} steps)`);
                }
            }
            catch (error) {
                console.error('❌ Simulation step failed:', error);
                break;
            }
        }
        // Finalize simulation
        this.isRunning = false;
        this.simulationMetrics.totalSteps = this.currentStep;
        this.simulationMetrics.simulationDuration = Date.now() - startTime;
        this.simulationMetrics.finalSystemHealth = await this.calculateFinalSystemHealth();
        console.log(`🧪 Production simulation complete: ${this.currentStep} steps, ${this.simulationMetrics.alertsGenerated} alerts, ${this.simulationMetrics.trustDecayEvents} decay events`);
    }
    async executeSimulationStep() {
        const stepTime = this.simulationStartTime + (this.currentStep * this.config.timeStep);
        const hoursElapsed = (Date.now() - this.simulationStartTime) / (1000 * 60 * 60);
        // Step 1: Apply trust decay
        await this.applyTrustDecay(stepTime, hoursElapsed);
        // Step 2: Process sentiment alignment events
        if (this.config.sentimentAlignmentReplay) {
            await this.processSentimentAlignment(stepTime);
        }
        // Step 3: Generate and process alerts
        await this.processAlerts(stepTime);
        // Step 4: Archive old alerts if enabled
        if (this.config.alertAutoArchive) {
            await this.archiveOldAlerts(stepTime);
        }
        // Step 5: Update metrics
        await this.updateSimulationMetrics();
    }
    async applyTrustDecay(stepTime, hoursElapsed) {
        const aggregator = TrustSentimentAggregator.getInstance();
        const deckMetrics = aggregator.getAllDeckMetrics();
        deckMetrics.forEach(deck => {
            if (Math.random() < 0.3) { // 30% chance of decay event per step
                const decayFactor = 1 - (this.config.decayRate * (hoursElapsed / 24));
                const initialTrust = Math.abs(deck.netSentiment);
                const currentTrust = initialTrust * decayFactor;
                const decayEvent = {
                    timestamp: new Date(stepTime).toISOString(),
                    deckId: deck.deckId,
                    initialTrust,
                    currentTrust,
                    decayFactor,
                    hoursElapsed
                };
                this.trustDecayCurves.push(decayEvent);
                this.simulationMetrics.trustDecayEvents++;
            }
        });
    }
    async processSentimentAlignment(stepTime) {
        const aggregator = TrustSentimentAggregator.getInstance();
        const deckMetrics = aggregator.getAllDeckMetrics();
        // Simulate alignment events for high-volatility decks
        deckMetrics.forEach(deck => {
            if (deck.volatilityFlag && Math.random() < 0.2) { // 20% chance for volatile decks
                const beforeAlignment = Math.abs(deck.netSentiment);
                const alignmentFactor = 0.8 + (Math.random() * 0.4); // 0.8-1.2x alignment
                const afterAlignment = beforeAlignment * alignmentFactor;
                const alignmentEvent = {
                    eventId: `align_${Date.now()}_${deck.deckId}`,
                    timestamp: new Date(stepTime).toISOString(),
                    deckId: deck.deckId,
                    beforeAlignment,
                    afterAlignment,
                    alignmentFactor,
                    triggerReason: 'volatility_correction'
                };
                this.alignmentEvents.push(alignmentEvent);
                this.simulationMetrics.alignmentEvents++;
            }
        });
    }
    async processAlerts(stepTime) {
        const monitor = TrustSentimentMonitor.getInstance();
        const alerts = monitor.getActiveAlerts();
        // Simulate new alert generation
        if (Math.random() < 0.15) { // 15% chance of new alert per step
            this.simulationMetrics.alertsGenerated++;
        }
    }
    async archiveOldAlerts(stepTime) {
        const monitor = TrustSentimentMonitor.getInstance();
        const alerts = monitor.getActiveAlerts();
        // Archive alerts older than 4 hours (simulated)
        const oldAlerts = alerts.filter(alert => Date.now() - new Date(alert.timestamp).getTime() > 4 * 60 * 60 * 1000);
        this.simulationMetrics.alertsArchived += oldAlerts.length;
    }
    async updateSimulationMetrics() {
        const aggregator = TrustSentimentAggregator.getInstance();
        const overallMetrics = await aggregator.aggregateAllTrustDeltas();
        this.simulationMetrics.averageSystemTrust = overallMetrics.overallSentiment;
    }
    async calculateFinalSystemHealth() {
        const aggregator = TrustSentimentAggregator.getInstance();
        const overallMetrics = await aggregator.aggregateAllTrustDeltas();
        return overallMetrics.systemHealth;
    }
    generateTestDataset() {
        // Generate mock users
        const users = [];
        for (let i = 0; i < this.config.mockDatasetSize; i++) {
            const tier = i % 10 === 0 ? 'commander' : i % 4 === 0 ? 'governor' : 'citizen';
            users.push({
                id: `sim_user_${i}`,
                tier,
                trustContribution: Math.random() * 100 - 50, // -50 to +50
                deckPreferences: this.getRandomDeckPreferences()
            });
        }
        // Generate mock decks
        const decks = [
            { id: 'wallet_overview', initialTrust: 75, volatility: 0.1, userCount: 200 },
            { id: 'governance_deck', initialTrust: 65, volatility: 0.25, userCount: 150 },
            { id: 'privacy_deck', initialTrust: 80, volatility: 0.15, userCount: 120 },
            { id: 'civic_identity', initialTrust: 70, volatility: 0.20, userCount: 180 },
            { id: 'consensus_layer', initialTrust: 60, volatility: 0.30, userCount: 100 }
        ];
        // Generate mock events
        const events = [];
        const eventCount = Math.floor(this.config.mockDatasetSize * 2);
        for (let i = 0; i < eventCount; i++) {
            const timestamp = Date.now() - (Math.random() * 24 * 60 * 60 * 1000); // Last 24 hours
            const eventType = Math.random() < 0.6 ? 'trust_submission' :
                Math.random() < 0.8 ? 'decay_cycle' : 'volatility_spike';
            events.push({
                timestamp,
                type: eventType,
                data: {
                    userId: `sim_user_${Math.floor(Math.random() * users.length)}`,
                    deckId: decks[Math.floor(Math.random() * decks.length)].id,
                    value: Math.random() * 100 - 50
                }
            });
        }
        this.testDataset = { users, decks, events };
        console.log(`🧪 Generated test dataset: ${users.length} users, ${decks.length} decks, ${events.length} events`);
    }
    getRandomDeckPreferences() {
        const allDecks = ['wallet_overview', 'governance_deck', 'privacy_deck', 'civic_identity', 'consensus_layer'];
        const preferenceCount = Math.floor(Math.random() * 3) + 1; // 1-3 preferences
        const shuffled = [...allDecks].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, preferenceCount);
    }
}
export default ProductionSimulationEngine;
