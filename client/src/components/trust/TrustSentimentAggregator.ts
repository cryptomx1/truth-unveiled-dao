/**
 * TrustSentimentAggregator.ts
 * Phase X-D Step 2: Trust delta aggregation and sentiment analysis
 * Commander Mark authorization via JASMY Relay
 */

import TrustFeedbackEngine, { TrustDelta, TrustLogEntry } from './TrustFeedbackEngine';

export interface DeckSentimentMetrics {
  deckId: string;
  netSentiment: number; // Positive = more support, negative = more dissent
  totalSubmissions: number;
  averageIntensity: number;
  tierBreakdown: {
    citizen: { support: number; dissent: number; count: number };
    governor: { support: number; dissent: number; count: number };
    commander: { support: number; dissent: number; count: number };
  };
  lastUpdated: string;
  volatilityFlag: boolean;
  sentimentTrend: 'rising' | 'falling' | 'stable';
}

export interface VolatilitySpike {
  deckId: string;
  timestamp: string;
  previousSentiment: number;
  currentSentiment: number;
  changePercent: number;
  triggerThreshold: number;
  cid: string;
}

export interface AggregatedTrustMetrics {
  overallSentiment: number;
  totalDecks: number;
  activeDecks: number;
  highVolatilityDecks: string[];
  lastAggregation: string;
  systemHealth: 'excellent' | 'good' | 'concerning' | 'critical';
}

export class TrustSentimentAggregator {
  private static instance: TrustSentimentAggregator;
  private deckMetrics: Map<string, DeckSentimentMetrics> = new Map();
  private volatilityHistory: VolatilitySpike[] = [];
  private aggregationInterval: number = 3 * 60 * 1000; // 3 minutes
  private volatilityThreshold: number = 0.15; // 15%
  private historicalSentiment: Map<string, number[]> = new Map();

  public static getInstance(): TrustSentimentAggregator {
    if (!TrustSentimentAggregator.instance) {
      TrustSentimentAggregator.instance = new TrustSentimentAggregator();
    }
    return TrustSentimentAggregator.instance;
  }

  private constructor() {
    this.loadPersistedData();
    this.startPeriodicAggregation();
    console.log('📊 TrustSentimentAggregator initialized - Periodic sentiment analysis ready');
  }

  public async aggregateAllTrustDeltas(): Promise<AggregatedTrustMetrics> {
    const startTime = performance.now();
    const trustEngine = TrustFeedbackEngine.getInstance();
    const allDeltas = trustEngine.getAllTrustDeltas();
    const feedbackLog = trustEngine.getFeedbackLog();

    // Group by deck
    const deckGroups = this.groupFeedbackByDeck(feedbackLog);
    
    let totalSentiment = 0;
    let activeDecks = 0;
    const highVolatilityDecks: string[] = [];

    for (const [deckId, entries] of deckGroups) {
      const metrics = await this.calculateDeckMetrics(deckId, entries);
      
      // Check for volatility spikes
      const previousSentiment = this.getPreviousSentiment(deckId);
      if (previousSentiment !== null) {
        const changePercent = Math.abs(metrics.netSentiment - previousSentiment) / Math.abs(previousSentiment || 1);
        
        if (changePercent >= this.volatilityThreshold) {
          metrics.volatilityFlag = true;
          highVolatilityDecks.push(deckId);
          
          const spike: VolatilitySpike = {
            deckId,
            timestamp: new Date().toISOString(),
            previousSentiment,
            currentSentiment: metrics.netSentiment,
            changePercent,
            triggerThreshold: this.volatilityThreshold,
            cid: this.generateCID(deckId, metrics)
          };
          
          this.volatilityHistory.push(spike);
        }
      }

      // Update historical sentiment tracking
      this.updateHistoricalSentiment(deckId, metrics.netSentiment);
      
      this.deckMetrics.set(deckId, metrics);
      
      if (metrics.totalSubmissions > 0) {
        totalSentiment += metrics.netSentiment;
        activeDecks++;
      }
    }

    const overallSentiment = activeDecks > 0 ? totalSentiment / activeDecks : 0;
    const systemHealth = this.calculateSystemHealth(overallSentiment, highVolatilityDecks.length);

    const aggregatedMetrics: AggregatedTrustMetrics = {
      overallSentiment,
      totalDecks: deckGroups.size,
      activeDecks,
      highVolatilityDecks,
      lastAggregation: new Date().toISOString(),
      systemHealth
    };

    this.persistData();
    
    const processTime = performance.now() - startTime;
    console.log(`📊 Trust sentiment aggregation complete: ${activeDecks} active decks, ${processTime.toFixed(1)}ms`);
    
    return aggregatedMetrics;
  }

  public getDeckMetrics(deckId: string): DeckSentimentMetrics | null {
    return this.deckMetrics.get(deckId) || null;
  }

  public getAllDeckMetrics(): DeckSentimentMetrics[] {
    return Array.from(this.deckMetrics.values());
  }

  public getVolatilityHistory(deckId?: string): VolatilitySpike[] {
    if (deckId) {
      return this.volatilityHistory.filter(spike => spike.deckId === deckId);
    }
    return [...this.volatilityHistory];
  }

  public exportSentimentVolatilityLog(): any {
    return {
      schema: {
        version: 'phase_xd_step_2',
        description: 'Time-series sentiment volatility tracking with CID context'
      },
      metrics: Object.fromEntries(this.deckMetrics),
      volatilitySpikes: this.volatilityHistory,
      historicalTrends: Object.fromEntries(this.historicalSentiment),
      exportedAt: new Date().toISOString(),
      systemStatus: {
        totalDecks: this.deckMetrics.size,
        volatileDecks: this.volatilityHistory.filter(spike => 
          Date.now() - new Date(spike.timestamp).getTime() < 24 * 60 * 60 * 1000
        ).length,
        aggregationInterval: this.aggregationInterval
      }
    };
  }

  private async calculateDeckMetrics(deckId: string, entries: TrustLogEntry[]): Promise<DeckSentimentMetrics> {
    const tierBreakdown = {
      citizen: { support: 0, dissent: 0, count: 0 },
      governor: { support: 0, dissent: 0, count: 0 },
      commander: { support: 0, dissent: 0, count: 0 }
    };

    let totalWeightedSupport = 0;
    let totalWeightedDissent = 0;
    let totalIntensity = 0;

    for (const entry of entries) {
      const tier = entry.payload.submitter.tier.toLowerCase() as keyof typeof tierBreakdown;
      const intensity = entry.payload.feedback.intensity;
      const weight = entry.tierWeight;
      
      tierBreakdown[tier].count++;
      
      if (entry.payload.feedback.type === 'support') {
        tierBreakdown[tier].support++;
        totalWeightedSupport += intensity * weight;
      } else {
        tierBreakdown[tier].dissent++;
        totalWeightedDissent += intensity * weight;
      }
      
      totalIntensity += intensity;
    }

    const netSentiment = totalWeightedSupport - totalWeightedDissent;
    const averageIntensity = entries.length > 0 ? totalIntensity / entries.length : 0;
    const sentimentTrend = this.calculateSentimentTrend(deckId, netSentiment);

    return {
      deckId,
      netSentiment,
      totalSubmissions: entries.length,
      averageIntensity,
      tierBreakdown,
      lastUpdated: new Date().toISOString(),
      volatilityFlag: false, // Will be set during volatility check
      sentimentTrend
    };
  }

  private groupFeedbackByDeck(feedbackLog: TrustLogEntry[]): Map<string, TrustLogEntry[]> {
    const deckGroups = new Map<string, TrustLogEntry[]>();
    
    for (const entry of feedbackLog) {
      const deckId = entry.payload.target.deckId;
      if (!deckGroups.has(deckId)) {
        deckGroups.set(deckId, []);
      }
      deckGroups.get(deckId)!.push(entry);
    }
    
    return deckGroups;
  }

  private getPreviousSentiment(deckId: string): number | null {
    const history = this.historicalSentiment.get(deckId);
    return history && history.length > 1 ? history[history.length - 2] : null;
  }

  private updateHistoricalSentiment(deckId: string, sentiment: number): void {
    if (!this.historicalSentiment.has(deckId)) {
      this.historicalSentiment.set(deckId, []);
    }
    
    const history = this.historicalSentiment.get(deckId)!;
    history.push(sentiment);
    
    // Keep last 100 readings for trend analysis
    if (history.length > 100) {
      history.shift();
    }
  }

  private calculateSentimentTrend(deckId: string, currentSentiment: number): 'rising' | 'falling' | 'stable' {
    const history = this.historicalSentiment.get(deckId);
    if (!history || history.length < 3) return 'stable';
    
    const recent = history.slice(-3);
    const trend = recent[2] - recent[0];
    
    if (Math.abs(trend) < 0.1) return 'stable';
    return trend > 0 ? 'rising' : 'falling';
  }

  private calculateSystemHealth(overallSentiment: number, volatileDecks: number): 'excellent' | 'good' | 'concerning' | 'critical' {
    if (volatileDecks > 3) return 'critical';
    if (volatileDecks > 1 || Math.abs(overallSentiment) > 50) return 'concerning';
    if (Math.abs(overallSentiment) > 20) return 'good';
    return 'excellent';
  }

  private generateCID(deckId: string, metrics: DeckSentimentMetrics): string {
    const content = JSON.stringify({
      deckId,
      sentiment: metrics.netSentiment,
      timestamp: metrics.lastUpdated,
      submissions: metrics.totalSubmissions
    });
    return `Qm${btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 44)}`;
  }

  private startPeriodicAggregation(): void {
    setInterval(async () => {
      try {
        await this.aggregateAllTrustDeltas();
      } catch (error) {
        console.error('❌ Trust sentiment aggregation failed:', error);
      }
    }, this.aggregationInterval);
  }

  private loadPersistedData(): void {
    try {
      const savedMetrics = localStorage.getItem('trust_sentiment_metrics');
      if (savedMetrics) {
        const parsed = JSON.parse(savedMetrics);
        this.deckMetrics = new Map(Object.entries(parsed));
      }

      const savedVolatility = localStorage.getItem('trust_volatility_history');
      if (savedVolatility) {
        this.volatilityHistory = JSON.parse(savedVolatility);
      }

      const savedHistory = localStorage.getItem('trust_historical_sentiment');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        this.historicalSentiment = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('⚠️ Failed to load persisted sentiment data:', error);
    }
  }

  private persistData(): void {
    try {
      const metricsObj = Object.fromEntries(this.deckMetrics);
      localStorage.setItem('trust_sentiment_metrics', JSON.stringify(metricsObj));
      
      localStorage.setItem('trust_volatility_history', JSON.stringify(this.volatilityHistory));
      
      const historyObj = Object.fromEntries(this.historicalSentiment);
      localStorage.setItem('trust_historical_sentiment', JSON.stringify(historyObj));
    } catch (error) {
      console.warn('⚠️ Failed to persist sentiment data:', error);
    }
  }
}

export default TrustSentimentAggregator;