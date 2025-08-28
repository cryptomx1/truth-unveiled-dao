// TrustDeltaPulseAgent.ts - Phase X-D Step 4 TrustDeltaPulseAgent
// 1-minute volatility sweep agent with DAO sync broadcast
// Commander Mark directive via JASMY Relay

export interface VolatilityDetection {
  deckId: string;
  currentVolatility: number;
  previousVolatility: number;
  deltaChange: number;
  threshold: 'low' | 'moderate' | 'high' | 'critical';
  timestamp: Date;
  triggerEvents: string[];
}

export interface DAOSyncBroadcast {
  broadcastId: string;
  volatilityDetections: VolatilityDetection[];
  aggregateRisk: number;
  syncTargets: string[];
  broadcastTime: Date;
  status: 'pending' | 'transmitted' | 'acknowledged';
}

export class TrustDeltaPulseAgent {
  private static instance: TrustDeltaPulseAgent;
  private sweepInterval: NodeJS.Timeout | null = null;
  private volatilityHistory: Map<string, number[]> = new Map();
  private lastBroadcast: DAOSyncBroadcast | null = null;
  private isInitialized = false;

  // Volatility thresholds
  private readonly THRESHOLDS = {
    low: 5,
    moderate: 15,
    high: 25,
    critical: 35
  };

  // DAO sync targets for Phase PRESS-REPLAY integration
  private readonly DAO_SYNC_TARGETS = [
    'press_replay_engine',
    'ripple_campaign_engine', 
    'civic_impact_ring',
    'trust_fusion_orchestrator'
  ];

  static getInstance(): TrustDeltaPulseAgent {
    if (!TrustDeltaPulseAgent.instance) {
      TrustDeltaPulseAgent.instance = new TrustDeltaPulseAgent();
    }
    return TrustDeltaPulseAgent.instance;
  }

  constructor() {
    this.initializePulseAgent();
  }

  private async initializePulseAgent() {
    if (this.isInitialized) return;

    console.log('📊 TrustDeltaPulseAgent initializing - 1-minute volatility sweep system');

    // Start 1-minute volatility sweeps
    this.startVolatilitySweeps();

    // Initialize volatility tracking for key decks
    this.initializeVolatilityTracking();

    this.isInitialized = true;
    console.log('✅ TrustDeltaPulseAgent operational - Volatility monitoring active');
  }

  private startVolatilitySweeps() {
    // 1-minute interval volatility sweeps per JASMY directive
    this.sweepInterval = setInterval(() => {
      this.performVolatilitySweep();
    }, 60000); // 60 seconds

    console.log('🔄 Volatility sweeps started - 1-minute intervals');
  }

  private initializeVolatilityTracking() {
    // Initialize tracking for primary civic decks
    const primaryDecks = [
      'wallet_overview',
      'governance_feedback', 
      'civic_identity',
      'consensus_layer',
      'civic_memory',
      'treasury_management'
    ];

    primaryDecks.forEach(deckId => {
      // Initialize with baseline volatility
      const baselineVolatility = Math.random() * 10 + 5; // 5-15% baseline
      this.volatilityHistory.set(deckId, [baselineVolatility]);
    });

    console.log(`📈 Volatility tracking initialized for ${primaryDecks.length} primary decks`);
  }

  private async performVolatilitySweep() {
    const detections: VolatilityDetection[] = [];
    const sweepStartTime = Date.now();

    try {
      // Sweep each tracked deck for volatility changes
      for (const [deckId, history] of this.volatilityHistory.entries()) {
        const detection = await this.sweepDeckVolatility(deckId, history);
        if (detection) {
          detections.push(detection);
        }
      }

      // Process detections and trigger broadcasts if needed
      if (detections.length > 0) {
        await this.processSweepResults(detections);
      }

      const sweepDuration = Date.now() - sweepStartTime;
      console.log(`🔍 Volatility sweep completed: ${detections.length} detections in ${sweepDuration}ms`);

    } catch (error) {
      console.error('❌ Volatility sweep failed:', error);
    }
  }

  private async sweepDeckVolatility(deckId: string, history: number[]): Promise<VolatilityDetection | null> {
    // Simulate current volatility calculation
    const previousVolatility = history[history.length - 1] || 0;
    const baseChange = (Math.random() - 0.5) * 8; // ±4% base variation
    const momentumFactor = Math.sin(Date.now() / 100000) * 3; // Cyclical factor
    
    const currentVolatility = Math.max(0, Math.min(50, previousVolatility + baseChange + momentumFactor));
    const deltaChange = Math.abs(currentVolatility - previousVolatility);

    // Update history (keep last 10 readings)
    history.push(currentVolatility);
    if (history.length > 10) {
      history.shift();
    }

    // Check if delta exceeds thresholds
    const threshold = this.determineThreshold(deltaChange);
    
    if (threshold !== 'low') {
      // Generate trigger events based on volatility patterns
      const triggerEvents = this.identifyTriggerEvents(deckId, currentVolatility, deltaChange);

      return {
        deckId,
        currentVolatility: Math.round(currentVolatility * 100) / 100,
        previousVolatility: Math.round(previousVolatility * 100) / 100,
        deltaChange: Math.round(deltaChange * 100) / 100,
        threshold,
        timestamp: new Date(),
        triggerEvents
      };
    }

    return null;
  }

  private determineThreshold(deltaChange: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (deltaChange >= this.THRESHOLDS.critical) return 'critical';
    if (deltaChange >= this.THRESHOLDS.high) return 'high';
    if (deltaChange >= this.THRESHOLDS.moderate) return 'moderate';
    return 'low';
  }

  private identifyTriggerEvents(deckId: string, volatility: number, delta: number): string[] {
    const events: string[] = [];

    // Governance-specific triggers
    if (deckId === 'governance_feedback') {
      if (delta > 20) events.push('policy_vote_surge');
      if (volatility > 30) events.push('representative_action_spike');
    }

    // Wallet/Identity triggers
    if (deckId === 'wallet_overview' || deckId === 'civic_identity') {
      if (delta > 15) events.push('citizen_engagement_shift');
      if (volatility > 25) events.push('trust_verification_activity');
    }

    // Treasury triggers
    if (deckId === 'treasury_management') {
      if (delta > 18) events.push('truthpoint_allocation_change');
      if (volatility > 35) events.push('dao_reward_distribution');
    }

    // General triggers
    if (delta > 25) events.push('critical_trust_delta');
    if (volatility > 40) events.push('system_wide_volatility');

    return events;
  }

  private async processSweepResults(detections: VolatilityDetection[]) {
    // Calculate aggregate risk level
    const aggregateRisk = this.calculateAggregateRisk(detections);

    // Create DAO sync broadcast
    const broadcast: DAOSyncBroadcast = {
      broadcastId: this.generateBroadcastId(),
      volatilityDetections: detections,
      aggregateRisk,
      syncTargets: this.DAO_SYNC_TARGETS,
      broadcastTime: new Date(),
      status: 'pending'
    };

    // Trigger broadcast to DAO sync targets
    await this.transmitDAOBroadcast(broadcast);

    // Store last broadcast
    this.lastBroadcast = broadcast;

    console.log(`📡 DAO sync broadcast initiated: ${detections.length} volatility alerts, ${aggregateRisk}% aggregate risk`);
  }

  private calculateAggregateRisk(detections: VolatilityDetection[]): number {
    if (detections.length === 0) return 0;

    // Weight detection thresholds
    const thresholdWeights = { low: 1, moderate: 2, high: 4, critical: 8 };
    
    const totalWeight = detections.reduce((sum, detection) => {
      return sum + (thresholdWeights[detection.threshold] * detection.deltaChange);
    }, 0);

    const maxPossibleWeight = detections.length * 8 * 50; // Max critical threshold * max delta
    const riskPercentage = (totalWeight / maxPossibleWeight) * 100;

    return Math.min(100, Math.round(riskPercentage));
  }

  private async transmitDAOBroadcast(broadcast: DAOSyncBroadcast) {
    try {
      // Simulate broadcast transmission to Phase PRESS-REPLAY and other DAO components
      const transmissionPromises = broadcast.syncTargets.map(async (target) => {
        // Simulate network transmission delay
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        
        // Emit custom events for target systems
        const event = new CustomEvent(`dao-sync-${target}`, {
          detail: {
            broadcastId: broadcast.broadcastId,
            volatilityData: broadcast.volatilityDetections,
            aggregateRisk: broadcast.aggregateRisk,
            timestamp: broadcast.broadcastTime
          }
        });
        
        window.dispatchEvent(event);
        return { target, status: 'transmitted' };
      });

      await Promise.all(transmissionPromises);
      broadcast.status = 'transmitted';

      console.log(`📡 DAO broadcast transmitted to ${broadcast.syncTargets.length} targets`);

    } catch (error) {
      console.error('❌ DAO broadcast transmission failed:', error);
      broadcast.status = 'pending';
    }
  }

  private generateBroadcastId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `dao-sync-${timestamp}-${random}`;
  }

  public getCurrentVolatilityState(): Record<string, number> {
    const state: Record<string, number> = {};
    
    this.volatilityHistory.forEach((history, deckId) => {
      state[deckId] = history[history.length - 1] || 0;
    });

    return state;
  }

  public getLastBroadcast(): DAOSyncBroadcast | null {
    return this.lastBroadcast;
  }

  public getVolatilityHistory(deckId: string): number[] {
    return this.volatilityHistory.get(deckId) || [];
  }

  public exportPulseData(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      volatilityState: this.getCurrentVolatilityState(),
      lastBroadcast: this.lastBroadcast,
      sweepInterval: 60000, // 1 minute
      thresholds: this.THRESHOLDS,
      trackedDecks: Array.from(this.volatilityHistory.keys()),
      daoSyncTargets: this.DAO_SYNC_TARGETS
    };

    return JSON.stringify(exportData, null, 2);
  }

  public destroy() {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.isInitialized = false;
    console.log('📊 TrustDeltaPulseAgent destroyed');
  }
}

// Global instance access
if (typeof window !== 'undefined') {
  (window as any).trustDeltaPulseAgent = TrustDeltaPulseAgent.getInstance();
}

export default TrustDeltaPulseAgent;