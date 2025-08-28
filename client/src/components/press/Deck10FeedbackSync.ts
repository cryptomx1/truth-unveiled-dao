// Deck10FeedbackSync.ts - Cross-deck feedback synchronization
// Phase PRESS-REPLAY Step 4 Implementation

import { Deck10FeedbackData } from './LLMPromptEmitter';

export interface RepresentativeData {
  id: string;
  name: string;
  district: string;
  zipCodes: string[];
  party: string;
  alignment: number;
  responsiveness: number;
  lastActivity: string;
}

export interface SyncResult {
  success: boolean;
  entriesProcessed: number;
  dissonanceDetected: boolean;
  highAlertCount: number;
  averageAlignment: number;
  timestamp: string;
}

export class Deck10FeedbackSync {
  private static instance: Deck10FeedbackSync;
  private representatives: Map<string, RepresentativeData> = new Map();
  private syncHistory: SyncResult[] = [];
  private lastSyncTime: string = '';

  private constructor() {
    this.initializeRepresentatives();
  }

  public static getInstance(): Deck10FeedbackSync {
    if (!Deck10FeedbackSync.instance) {
      Deck10FeedbackSync.instance = new Deck10FeedbackSync();
    }
    return Deck10FeedbackSync.instance;
  }

  private initializeRepresentatives(): void {
    // Initialize representative data for target ZIP zones
    const reps: RepresentativeData[] = [
      {
        id: 'rep_78701',
        name: 'Lloyd Doggett',
        district: 'TX-37',
        zipCodes: ['78701', '78702', '78703'],
        party: 'D',
        alignment: 78,
        responsiveness: 72,
        lastActivity: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'rep_97205',
        name: 'Suzanne Bonamici',
        district: 'OR-01',
        zipCodes: ['97205', '97210', '97225'],
        party: 'D',
        alignment: 85,
        responsiveness: 89,
        lastActivity: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'rep_05401',
        name: 'Peter Welch',
        district: 'VT-AL',
        zipCodes: ['05401', '05403', '05405'],
        party: 'D',
        alignment: 91,
        responsiveness: 94,
        lastActivity: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: 'rep_95113',
        name: 'Zoe Lofgren',
        district: 'CA-19',
        zipCodes: ['95113', '95112', '95126'],
        party: 'D',
        alignment: 68,
        responsiveness: 45,
        lastActivity: new Date(Date.now() - 604800000).toISOString()
      },
      {
        id: 'rep_48104',
        name: 'Debbie Dingell',
        district: 'MI-06',
        zipCodes: ['48104', '48105', '48108'],
        party: 'D',
        alignment: 82,
        responsiveness: 76,
        lastActivity: new Date(Date.now() - 259200000).toISOString()
      }
    ];

    reps.forEach(rep => this.representatives.set(rep.id, rep));
    console.log('🏛️ Representatives initialized:', this.representatives.size);
  }

  public syncFromDeck10(feedbackData: Deck10FeedbackData): SyncResult {
    const startTime = Date.now();
    let entriesProcessed = 0;
    let dissonanceDetected = false;
    let highAlertCount = 0;
    let totalAlignment = 0;
    let alignmentCount = 0;

    // Process feedback entries and update representative data
    feedbackData.feedbackEntries.forEach(entry => {
      const rep = this.findRepresentativeByZip(entry.zipCode);
      if (rep) {
        entriesProcessed++;
        
        // Calculate dissonance based on sentiment vs alignment
        const sentimentScore = this.getSentimentScore(entry.sentiment);
        const alignmentGap = Math.abs(sentimentScore - (rep.alignment / 100));
        
        if (alignmentGap > 0.3) { // 30% dissonance threshold
          dissonanceDetected = true;
          
          if (alignmentGap > 0.5) { // 50% high alert threshold
            highAlertCount++;
            console.log(`⚠️ High dissonance detected: ${rep.name} - ${alignmentGap * 100}%`);
          }
        }

        // Update representative responsiveness based on recent feedback
        if (entry.sentiment === 'concern' || entry.sentiment === 'negative') {
          rep.responsiveness = Math.max(rep.responsiveness - 2, 0);
        } else if (entry.sentiment === 'positive') {
          rep.responsiveness = Math.min(rep.responsiveness + 1, 100);
        }

        totalAlignment += rep.alignment;
        alignmentCount++;
      }
    });

    const result: SyncResult = {
      success: true,
      entriesProcessed,
      dissonanceDetected,
      highAlertCount,
      averageAlignment: alignmentCount > 0 ? totalAlignment / alignmentCount : 0,
      timestamp: new Date().toISOString()
    };

    this.syncHistory.push(result);
    this.lastSyncTime = result.timestamp;

    console.log('🔄 Deck10 sync complete:', result);
    return result;
  }

  private findRepresentativeByZip(zipCode?: string): RepresentativeData | null {
    if (!zipCode) return null;

    for (const rep of this.representatives.values()) {
      if (rep.zipCodes.includes(zipCode)) {
        return rep;
      }
    }
    return null;
  }

  private getSentimentScore(sentiment: string): number {
    const scores = {
      'positive': 0.8,
      'neutral': 0.5,
      'negative': 0.2,
      'concern': 0.3
    };
    return scores[sentiment as keyof typeof scores] || 0.5;
  }

  public getRepresentativeDissonance(): Array<{
    representative: RepresentativeData;
    dissonanceLevel: 'low' | 'medium' | 'high';
    lastFeedbackSentiment: number;
    alignmentGap: number;
  }> {
    const results: Array<{
      representative: RepresentativeData;
      dissonanceLevel: 'low' | 'medium' | 'high';
      lastFeedbackSentiment: number;
      alignmentGap: number;
    }> = [];

    for (const rep of this.representatives.values()) {
      // Mock recent sentiment for demonstration
      const recentSentiment = 0.4 + (Math.random() * 0.4); // 0.4-0.8 range
      const alignmentGap = Math.abs(recentSentiment - (rep.alignment / 100));
      
      let dissonanceLevel: 'low' | 'medium' | 'high' = 'low';
      if (alignmentGap > 0.5) dissonanceLevel = 'high';
      else if (alignmentGap > 0.3) dissonanceLevel = 'medium';

      results.push({
        representative: rep,
        dissonanceLevel,
        lastFeedbackSentiment: recentSentiment,
        alignmentGap
      });
    }

    return results.sort((a, b) => b.alignmentGap - a.alignmentGap);
  }

  public getZIPClusterData(): Array<{
    zipCode: string;
    representative: RepresentativeData;
    avgSentiment: number;
    feedbackCount: number;
    lastActivity: string;
  }> {
    const clusters: Array<{
      zipCode: string;
      representative: RepresentativeData;
      avgSentiment: number;
      feedbackCount: number;
      lastActivity: string;
    }> = [];

    for (const rep of this.representatives.values()) {
      rep.zipCodes.forEach(zipCode => {
        clusters.push({
          zipCode,
          representative: rep,
          avgSentiment: 0.45 + (Math.random() * 0.3), // Mock sentiment 0.45-0.75
          feedbackCount: Math.floor(Math.random() * 20) + 5, // 5-24 feedback entries
          lastActivity: rep.lastActivity
        });
      });
    }

    return clusters;
  }

  public getSyncMetrics(): {
    totalSyncs: number;
    lastSyncTime: string;
    avgEntriesPerSync: number;
    dissonanceRate: number;
    highAlertRate: number;
    systemHealth: number;
  } {
    const totalSyncs = this.syncHistory.length;
    const totalEntries = this.syncHistory.reduce((sum, sync) => sum + sync.entriesProcessed, 0);
    const dissonanceCount = this.syncHistory.filter(sync => sync.dissonanceDetected).length;
    const highAlertCount = this.syncHistory.reduce((sum, sync) => sum + sync.highAlertCount, 0);

    return {
      totalSyncs,
      lastSyncTime: this.lastSyncTime,
      avgEntriesPerSync: totalSyncs > 0 ? Math.round(totalEntries / totalSyncs) : 0,
      dissonanceRate: totalSyncs > 0 ? Math.round((dissonanceCount / totalSyncs) * 100) : 0,
      highAlertRate: totalEntries > 0 ? Math.round((highAlertCount / totalEntries) * 100) : 0,
      systemHealth: this.calculateSystemHealth()
    };
  }

  private calculateSystemHealth(): number {
    if (this.syncHistory.length === 0) return 100;

    const recent = this.syncHistory.slice(-5); // Last 5 syncs
    const avgAlignment = recent.reduce((sum, sync) => sum + sync.averageAlignment, 0) / recent.length;
    const dissonanceRate = recent.filter(sync => sync.dissonanceDetected).length / recent.length;
    
    return Math.round(avgAlignment * (1 - dissonanceRate * 0.3));
  }

  public triggerManualSync(deckId: string = 'deck_10_governance'): SyncResult {
    // Mock manual sync trigger
    const mockFeedback: Deck10FeedbackData = {
      deckId,
      feedbackEntries: [
        {
          id: `sync_${Date.now()}`,
          sentiment: 'concern',
          content: 'Manual sync test - representative accountability',
          timestamp: new Date().toISOString(),
          zipCode: '78701'
        }
      ],
      avgSentiment: 0.3,
      totalEntries: 1,
      lastUpdated: new Date().toISOString()
    };

    return this.syncFromDeck10(mockFeedback);
  }
}