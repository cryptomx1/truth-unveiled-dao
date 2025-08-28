/**
 * TrustSentimentMonitor.ts
 * Phase X-D Step 3: Real-time trust sentiment monitoring and alert system
 * Commander Mark authorization via JASMY Relay
 */

import TrustSentimentAggregator, { DeckSentimentMetrics, AggregatedTrustMetrics, VolatilitySpike } from './TrustSentimentAggregator';
import FeedbackOrchestrationEngine from './FeedbackOrchestrationEngine';

export interface SentimentAlert {
  id: string;
  alertType: 'moderate_volatility' | 'critical_volatility' | 'dissonance_threshold' | 'system_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  deckId: string;
  timestamp: string;
  metrics: {
    currentSentiment: number;
    previousSentiment: number;
    changePercent: number;
    timespan: number; // hours
  };
  description: string;
  cid: string;
  broadcastRequired: boolean;
}

export interface MonitoringMetrics {
  totalAggregationCycles: number;
  volatilityEventsDetected: number;
  dissonanceAlertsTriggered: number;
  systemHealthDegradations: number;
  averageCycleTime: number;
  lastMonitoringCycle: string;
  userFlowPatterns: {
    uniqueSubmitters: number;
    peakActivityHour: number;
    averageSubmissionsPerUser: number;
    tierDistribution: Record<string, number>;
  };
}

export interface UserFlowPattern {
  anonymousId: string;
  firstSeen: string;
  lastSeen: string;
  totalSubmissions: number;
  deckPreferences: string[];
  averageIntensity: number;
  tier: string;
}

export class TrustSentimentMonitor {
  private static instance: TrustSentimentMonitor;
  private isMonitoring: boolean = false;
  private monitoringInterval: number = 3 * 60 * 1000; // 3 minutes
  private alerts: SentimentAlert[] = [];
  private metrics: MonitoringMetrics;
  private userFlowPatterns: Map<string, UserFlowPattern> = new Map();
  private lastAlertCheck: number = Date.now();

  // Alert thresholds
  private readonly MODERATE_VOLATILITY_THRESHOLD = 0.15; // 15%
  private readonly CRITICAL_VOLATILITY_THRESHOLD = 0.30; // 30%
  private readonly DISSONANCE_TIMESPAN = 12; // hours
  private readonly BROADCAST_THRESHOLD = 0.25; // 25%

  public static getInstance(): TrustSentimentMonitor {
    if (!TrustSentimentMonitor.instance) {
      TrustSentimentMonitor.instance = new TrustSentimentMonitor();
    }
    return TrustSentimentMonitor.instance;
  }

  private constructor() {
    this.metrics = {
      totalAggregationCycles: 0,
      volatilityEventsDetected: 0,
      dissonanceAlertsTriggered: 0,
      systemHealthDegradations: 0,
      averageCycleTime: 0,
      lastMonitoringCycle: new Date().toISOString(),
      userFlowPatterns: {
        uniqueSubmitters: 0,
        peakActivityHour: 0,
        averageSubmissionsPerUser: 0,
        tierDistribution: { citizen: 0, governor: 0, commander: 0 }
      }
    };

    this.loadPersistedData();
    console.log('📊 TrustSentimentMonitor initialized - Alert logic and user flow tracking ready');
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('📊 Starting trust sentiment monitoring with 3-minute polling interval');

    const monitoringLoop = setInterval(async () => {
      try {
        await this.runMonitoringCycle();
      } catch (error) {
        console.error('❌ Trust sentiment monitoring cycle failed:', error);
      }
    }, this.monitoringInterval);

    // Store interval for cleanup
    (this as any).monitoringInterval = monitoringLoop;
  }

  public stopMonitoring(): void {
    if (!(this as any).monitoringInterval) return;

    clearInterval((this as any).monitoringInterval);
    this.isMonitoring = false;
    console.log('📊 Trust sentiment monitoring stopped');
  }

  public async runMonitoringCycle(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Phase 1: Get latest aggregation data
      const aggregator = TrustSentimentAggregator.getInstance();
      const overallMetrics = await aggregator.aggregateAllTrustDeltas();
      const allDeckMetrics = aggregator.getAllDeckMetrics();
      const volatilityHistory = aggregator.getVolatilityHistory();

      // Phase 2: Check for new volatility events
      await this.checkVolatilityAlerts(volatilityHistory);

      // Phase 3: Monitor system health degradations
      await this.checkSystemHealthAlerts(overallMetrics);

      // Phase 4: Analyze user flow patterns
      await this.analyzeUserFlowPatterns();

      // Phase 5: Update monitoring metrics
      const cycleTime = performance.now() - startTime;
      this.updateMonitoringMetrics(cycleTime);

      // Phase 6: Process alerts requiring broadcast
      await this.processBroadcastAlerts();

      console.log(`📊 Trust sentiment monitoring cycle complete: ${allDeckMetrics.length} decks, ${this.alerts.length} active alerts, ${cycleTime.toFixed(1)}ms`);

    } catch (error) {
      console.error('❌ Monitoring cycle error:', error);
    }
  }

  public getActiveAlerts(severity?: string): SentimentAlert[] {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    let filteredAlerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoffTime
    );

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    return filteredAlerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getMonitoringMetrics(): MonitoringMetrics {
    return { ...this.metrics };
  }

  public getUserFlowInsights(): {
    totalPatterns: number;
    activePatternsLast24h: number;
    topDecks: Array<{ deckId: string; submissions: number }>;
    tierDistribution: Record<string, number>;
  } {
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    const activePatternsLast24h = Array.from(this.userFlowPatterns.values())
      .filter(pattern => new Date(pattern.lastSeen).getTime() > last24h).length;

    // Calculate top decks
    const deckCounts: Record<string, number> = {};
    this.userFlowPatterns.forEach(pattern => {
      pattern.deckPreferences.forEach(deckId => {
        deckCounts[deckId] = (deckCounts[deckId] || 0) + 1;
      });
    });

    const topDecks = Object.entries(deckCounts)
      .map(([deckId, submissions]) => ({ deckId, submissions }))
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 5);

    return {
      totalPatterns: this.userFlowPatterns.size,
      activePatternsLast24h,
      topDecks,
      tierDistribution: this.metrics.userFlowPatterns.tierDistribution
    };
  }

  public exportSentimentAlerts(): any {
    return {
      schema: {
        version: 'phase_xd_step_3',
        description: 'Trust sentiment alerts with volatility and dissonance tracking'
      },
      alerts: this.alerts,
      metrics: this.metrics,
      userFlowInsights: this.getUserFlowInsights(),
      thresholds: {
        moderateVolatility: this.MODERATE_VOLATILITY_THRESHOLD,
        criticalVolatility: this.CRITICAL_VOLATILITY_THRESHOLD,
        dissonanceTimespan: this.DISSONANCE_TIMESPAN,
        broadcastThreshold: this.BROADCAST_THRESHOLD
      },
      exportedAt: new Date().toISOString()
    };
  }

  private async checkVolatilityAlerts(volatilityHistory: VolatilitySpike[]): Promise<void> {
    const recentSpikes = volatilityHistory.filter(spike => {
      const spikeTime = new Date(spike.timestamp).getTime();
      return spikeTime > this.lastAlertCheck;
    });

    for (const spike of recentSpikes) {
      let alertType: SentimentAlert['alertType'] = 'moderate_volatility';
      let severity: SentimentAlert['severity'] = 'medium';

      if (spike.changePercent >= this.CRITICAL_VOLATILITY_THRESHOLD) {
        alertType = 'critical_volatility';
        severity = 'critical';
      } else if (spike.changePercent >= this.MODERATE_VOLATILITY_THRESHOLD) {
        alertType = 'moderate_volatility';
        severity = 'medium';
      }

      const alert: SentimentAlert = {
        id: `alert_${Date.now()}_${spike.deckId}`,
        alertType,
        severity,
        deckId: spike.deckId,
        timestamp: spike.timestamp,
        metrics: {
          currentSentiment: spike.currentSentiment,
          previousSentiment: spike.previousSentiment,
          changePercent: spike.changePercent,
          timespan: 1 // Assuming spikes are detected within 1 hour
        },
        description: `${alertType.replace('_', ' ')} detected: ${(spike.changePercent * 100).toFixed(1)}% sentiment shift in ${spike.deckId}`,
        cid: spike.cid,
        broadcastRequired: spike.changePercent >= this.BROADCAST_THRESHOLD
      };

      this.alerts.push(alert);
      this.metrics.volatilityEventsDetected++;

      console.log(`🚨 ${severity.toUpperCase()} volatility alert: ${spike.deckId} - ${(spike.changePercent * 100).toFixed(1)}% change`);
    }

    this.lastAlertCheck = Date.now();
  }

  private async checkSystemHealthAlerts(overallMetrics: AggregatedTrustMetrics): Promise<void> {
    if (overallMetrics.systemHealth === 'critical' || overallMetrics.systemHealth === 'concerning') {
      const existingHealthAlert = this.alerts.find(alert => 
        alert.alertType === 'system_degradation' && 
        Date.now() - new Date(alert.timestamp).getTime() < 60 * 60 * 1000 // 1 hour
      );

      if (!existingHealthAlert) {
        const alert: SentimentAlert = {
          id: `health_alert_${Date.now()}`,
          alertType: 'system_degradation',
          severity: overallMetrics.systemHealth === 'critical' ? 'critical' : 'high',
          deckId: 'system_wide',
          timestamp: overallMetrics.lastAggregation,
          metrics: {
            currentSentiment: overallMetrics.overallSentiment,
            previousSentiment: 0, // Would need historical tracking
            changePercent: 0,
            timespan: 1
          },
          description: `System health degraded to ${overallMetrics.systemHealth}. ${overallMetrics.highVolatilityDecks.length} high volatility decks detected.`,
          cid: `system_health_${Date.now()}`,
          broadcastRequired: overallMetrics.systemHealth === 'critical'
        };

        this.alerts.push(alert);
        this.metrics.systemHealthDegradations++;

        console.log(`🚨 System health alert: ${overallMetrics.systemHealth} - ${overallMetrics.highVolatilityDecks.length} volatile decks`);
      }
    }
  }

  private async analyzeUserFlowPatterns(): Promise<void> {
    try {
      const orchestrator = FeedbackOrchestrationEngine.getInstance();
      const orchestrationData = orchestrator.exportOrchestrationLog();
      
      // Update user flow metrics based on orchestration data
      this.metrics.userFlowPatterns.uniqueSubmitters = this.userFlowPatterns.size;
      
      // Calculate tier distribution
      const tierCounts = { citizen: 0, governor: 0, commander: 0 };
      this.userFlowPatterns.forEach(pattern => {
        const tier = pattern.tier.toLowerCase() as keyof typeof tierCounts;
        if (tierCounts[tier] !== undefined) {
          tierCounts[tier]++;
        }
      });
      this.metrics.userFlowPatterns.tierDistribution = tierCounts;

    } catch (error) {
      console.error('❌ User flow analysis error:', error);
    }
  }

  private async processBroadcastAlerts(): Promise<void> {
    const broadcastAlerts = this.alerts.filter(alert => 
      alert.broadcastRequired && 
      Date.now() - new Date(alert.timestamp).getTime() < 60 * 60 * 1000 // Last hour
    );

    if (broadcastAlerts.length > 0) {
      try {
        // Simulate DAO federation broadcast
        await this.broadcastToFederation(broadcastAlerts);
        
        // Mark alerts as broadcast
        broadcastAlerts.forEach(alert => {
          alert.broadcastRequired = false;
        });

        console.log(`📡 Broadcast sent to federation: ${broadcastAlerts.length} critical alerts`);
      } catch (error) {
        console.error('❌ Federation broadcast failed:', error);
      }
    }
  }

  private async broadcastToFederation(alerts: SentimentAlert[]): Promise<void> {
    // Simulate federation broadcast
    const broadcastPayload = {
      source: 'TrustSentimentMonitor',
      timestamp: new Date().toISOString(),
      alertCount: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      affectedDecks: [...new Set(alerts.map(a => a.deckId))],
      broadcastId: `trust_alert_${Date.now()}`
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('📡 Federation broadcast payload:', broadcastPayload);
    return Promise.resolve();
  }

  private updateMonitoringMetrics(cycleTime: number): void {
    this.metrics.totalAggregationCycles++;
    
    // Update rolling average
    const totalTime = this.metrics.averageCycleTime * (this.metrics.totalAggregationCycles - 1) + cycleTime;
    this.metrics.averageCycleTime = totalTime / this.metrics.totalAggregationCycles;
    
    this.metrics.lastMonitoringCycle = new Date().toISOString();
    
    this.persistData();
  }

  private loadPersistedData(): void {
    try {
      const savedAlerts = localStorage.getItem('trust_sentiment_alerts');
      if (savedAlerts) {
        this.alerts = JSON.parse(savedAlerts);
      }

      const savedMetrics = localStorage.getItem('trust_monitoring_metrics');
      if (savedMetrics) {
        const loaded = JSON.parse(savedMetrics);
        this.metrics = { ...this.metrics, ...loaded };
      }

      const savedPatterns = localStorage.getItem('trust_user_flow_patterns');
      if (savedPatterns) {
        const patterns = JSON.parse(savedPatterns);
        this.userFlowPatterns = new Map(Object.entries(patterns));
      }
    } catch (error) {
      console.warn('⚠️ Failed to load monitoring data:', error);
    }
  }

  private persistData(): void {
    try {
      localStorage.setItem('trust_sentiment_alerts', JSON.stringify(this.alerts));
      localStorage.setItem('trust_monitoring_metrics', JSON.stringify(this.metrics));
      
      const patternsObj = Object.fromEntries(this.userFlowPatterns);
      localStorage.setItem('trust_user_flow_patterns', JSON.stringify(patternsObj));
    } catch (error) {
      console.warn('⚠️ Failed to persist monitoring data:', error);
    }
  }
}

export default TrustSentimentMonitor;