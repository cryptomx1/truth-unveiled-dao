interface PulseEndpoint {
  deckId: string;
  trustLevel: number;
  volatility: number;
  trend: 'stable' | 'increasing' | 'decreasing';
  participants: number;
  lastUpdate: string;
}

interface TrendData {
  period: '24h' | '7d' | '30d';
  dataPoints: Array<{
    timestamp: string;
    trustLevel: number;
    volatility: number;
  }>;
  summary: {
    averageTrust: number;
    peakTrust: number;
    minTrust: number;
    volatilityRange: number;
  };
}

interface VolatilityEndpoint {
  deckId: string;
  current: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    sentimentShift: number;
    participationChange: number;
    trustFluctuation: number;
  };
  recommendation: string;
}

class CivicPulseAPI {
  private baseURL: string = '/api/pulse'; // Would be external in production
  private mockData: Map<string, any> = new Map();

  constructor() {
    this.initializeMockEndpoints();
  }

  private initializeMockEndpoints(): void {
    // Mock pulse data for target decks
    const targetDecks = [
      { id: 'wallet_overview', name: 'Wallet Overview' },
      { id: 'civic_identity', name: 'Civic Identity' },
      { id: 'consensus_layer', name: 'Consensus Layer' },
      { id: 'civic_memory', name: 'Civic Memory' }
    ];

    targetDecks.forEach(deck => {
      // Pulse endpoint data
      this.mockData.set(`pulse_${deck.id}`, {
        deckId: deck.id,
        trustLevel: 65 + Math.random() * 30, // 65-95% range
        volatility: Math.random() * 0.4, // 0-40% volatility
        trend: ['stable', 'increasing', 'decreasing'][Math.floor(Math.random() * 3)],
        participants: 45 + Math.floor(Math.random() * 55), // 45-100 participants
        lastUpdate: new Date().toISOString()
      });

      // Volatility endpoint data
      this.mockData.set(`volatility_${deck.id}`, {
        deckId: deck.id,
        current: Math.random() * 0.5,
        riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        factors: {
          sentimentShift: (Math.random() - 0.5) * 20, // ±10%
          participationChange: (Math.random() - 0.5) * 30, // ±15%
          trustFluctuation: Math.random() * 25 // 0-25%
        },
        recommendation: this.generateRecommendation(deck.id)
      });

      // Trend endpoint data for multiple periods
      ['24h', '7d', '30d'].forEach(period => {
        const dataPoints = this.generateTrendData(deck.id, period);
        this.mockData.set(`trend_${deck.id}_${period}`, {
          period,
          dataPoints,
          summary: this.calculateTrendSummary(dataPoints)
        });
      });
    });

    console.log('🌐 CivicPulseAPI mock endpoints initialized for 4 target decks');
  }

  private generateTrendData(deckId: string, period: '24h' | '7d' | '30d'): Array<{
    timestamp: string;
    trustLevel: number;
    volatility: number;
  }> {
    const periodHours = period === '24h' ? 24 : period === '7d' ? 168 : 720;
    const dataPointCount = period === '24h' ? 24 : period === '7d' ? 7 : 30;
    const intervalHours = periodHours / dataPointCount;

    const dataPoints = [];
    let baseTrust = 70 + Math.random() * 20; // Start with 70-90% trust
    
    for (let i = dataPointCount - 1; i >= 0; i--) {
      const timestamp = new Date(Date.now() - (i * intervalHours * 60 * 60 * 1000));
      
      // Add realistic fluctuation
      baseTrust += (Math.random() - 0.5) * 10; // ±5% change
      baseTrust = Math.max(20, Math.min(95, baseTrust)); // Keep in realistic range
      
      const volatility = Math.random() * 0.3; // 0-30% volatility
      
      dataPoints.push({
        timestamp: timestamp.toISOString(),
        trustLevel: baseTrust,
        volatility
      });
    }

    return dataPoints;
  }

  private calculateTrendSummary(dataPoints: Array<{ trustLevel: number; volatility: number }>): {
    averageTrust: number;
    peakTrust: number;
    minTrust: number;
    volatilityRange: number;
  } {
    const trustLevels = dataPoints.map(dp => dp.trustLevel);
    const volatilities = dataPoints.map(dp => dp.volatility);

    return {
      averageTrust: trustLevels.reduce((sum, val) => sum + val, 0) / trustLevels.length,
      peakTrust: Math.max(...trustLevels),
      minTrust: Math.min(...trustLevels),
      volatilityRange: Math.max(...volatilities) - Math.min(...volatilities)
    };
  }

  private generateRecommendation(deckId: string): string {
    const recommendations = {
      wallet_overview: [
        'Consider implementing additional wallet verification checks',
        'Trust levels stable - maintain current security protocols',
        'High volatility detected - review recent transaction patterns',
        'Community confidence strong - consider expanding wallet features'
      ],
      civic_identity: [
        'Identity verification trust is strong across the community',
        'Consider enhancing biometric verification workflows',
        'DID validation showing high community confidence',
        'Credential issuance process functioning optimally'
      ],
      consensus_layer: [
        'Consensus mechanisms operating within expected parameters',
        'Consider reviewing proposal thresholds for efficiency',
        'High deliberation engagement - positive community indicator',
        'ZKP validation processes showing strong trust metrics'
      ],
      civic_memory: [
        'Memory trace validation showing strong community trust',
        'Consider expanding historical context preservation',
        'Truth trace mechanisms functioning optimally',
        'Community engagement with memory actions is high'
      ]
    };

    const deckRecommendations = recommendations[deckId as keyof typeof recommendations] || recommendations.civic_memory;
    return deckRecommendations[Math.floor(Math.random() * deckRecommendations.length)];
  }

  // Public API methods

  public async getPulse(deckId: string): Promise<PulseEndpoint> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const key = `pulse_${deckId}`;
    if (!this.mockData.has(key)) {
      throw new Error(`Pulse data not found for deck: ${deckId}`);
    }

    // Add minor fluctuation to simulate real-time updates
    const data = { ...this.mockData.get(key) };
    data.trustLevel += (Math.random() - 0.5) * 2; // ±1% fluctuation
    data.trustLevel = Math.max(0, Math.min(100, data.trustLevel));
    data.lastUpdate = new Date().toISOString();

    return data;
  }

  public async getVolatility(deckId: string): Promise<VolatilityEndpoint> {
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
    
    const key = `volatility_${deckId}`;
    if (!this.mockData.has(key)) {
      throw new Error(`Volatility data not found for deck: ${deckId}`);
    }

    // Add minor fluctuation
    const data = { ...this.mockData.get(key) };
    data.current += (Math.random() - 0.5) * 0.05; // ±2.5% volatility change
    data.current = Math.max(0, Math.min(1, data.current));

    return data;
  }

  public async getTrend(deckId: string, period: '24h' | '7d' | '30d'): Promise<TrendData> {
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));
    
    const key = `trend_${deckId}_${period}`;
    if (!this.mockData.has(key)) {
      throw new Error(`Trend data not found for deck: ${deckId}, period: ${period}`);
    }

    return this.mockData.get(key);
  }

  public async getAllDecksOverview(): Promise<PulseEndpoint[]> {
    const targetDecks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
    const promises = targetDecks.map(deckId => this.getPulse(deckId));
    
    return Promise.all(promises);
  }

  public async getSystemHealth(): Promise<{
    overallTrust: number;
    systemVolatility: number;
    activeDecks: number;
    totalParticipants: number;
    lastUpdate: string;
    status: 'healthy' | 'monitoring' | 'warning' | 'critical';
  }> {
    const allDecks = await this.getAllDecksOverview();
    
    const overallTrust = allDecks.reduce((sum, deck) => sum + deck.trustLevel, 0) / allDecks.length;
    const systemVolatility = allDecks.reduce((sum, deck) => sum + deck.volatility, 0) / allDecks.length;
    const totalParticipants = allDecks.reduce((sum, deck) => sum + deck.participants, 0);
    
    let status: 'healthy' | 'monitoring' | 'warning' | 'critical' = 'healthy';
    if (overallTrust < 30 || systemVolatility > 0.7) status = 'critical';
    else if (overallTrust < 50 || systemVolatility > 0.5) status = 'warning';
    else if (overallTrust < 70 || systemVolatility > 0.3) status = 'monitoring';

    return {
      overallTrust,
      systemVolatility,
      activeDecks: allDecks.length,
      totalParticipants,
      lastUpdate: new Date().toISOString(),
      status
    };
  }

  // Utility method to refresh mock data (simulates live updates)
  public refreshMockData(): void {
    console.log('🔄 Refreshing CivicPulseAPI mock data...');
    this.initializeMockEndpoints();
  }
}

// Singleton instance
export const civicPulseAPI = new CivicPulseAPI();

// Auto-refresh mock data every 5 minutes to simulate live system
setInterval(() => {
  civicPulseAPI.refreshMockData();
}, 5 * 60 * 1000);

export type { PulseEndpoint, TrendData, VolatilityEndpoint };