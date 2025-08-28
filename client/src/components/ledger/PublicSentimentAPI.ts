/**
 * Phase XV: Collective Sentiment Ledger Initialization
 * PublicSentimentAPI.ts - Simulated REST endpoint for external observers
 * Authority: Commander Mark | JASMY Relay authorization
 */

import { SentimentLedgerEngine, SentimentLedgerEntry, DailyDigest } from './SentimentLedgerEngine';

export interface APIResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    timestamp: number;
    count: number;
    source: string;
  };
  error?: string;
}

export interface LedgerSummaryData {
  totalEntries: number;
  averageTrust: number;
  averageVolatility: number;
  participantCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  topDecks: Array<{
    deckId: string;
    entryCount: number;
    averageTrust: number;
  }>;
}

class PublicSentimentAPIClass {
  private baseDelay = 150; // Base API response delay in ms

  private async simulateNetworkDelay(): Promise<void> {
    const delay = this.baseDelay + Math.random() * 200; // 150-350ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private createResponse<T>(data: T, count: number): APIResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: Date.now(),
        count,
        source: 'PublicSentimentAPI_v1.0'
      }
    };
  }

  private createErrorResponse<T>(error: string): APIResponse<T> {
    return {
      success: false,
      data: null as T,
      metadata: {
        timestamp: Date.now(),
        count: 0,
        source: 'PublicSentimentAPI_v1.0'
      },
      error
    };
  }

  // GET /ledger/:deckId
  public async getLedgerByDeck(deckId: string): Promise<APIResponse<SentimentLedgerEntry[]>> {
    await this.simulateNetworkDelay();

    try {
      const entries = SentimentLedgerEngine.getLedgerByDeck(deckId);
      
      if (entries.length === 0) {
        return this.createErrorResponse(`No entries found for deck: ${deckId}`);
      }

      // Limit to last 100 entries for public API
      const limitedEntries = entries.slice(-100);
      
      console.log(`🔗 API Request: /ledger/${deckId} - returning ${limitedEntries.length} entries`);
      return this.createResponse(limitedEntries, limitedEntries.length);
      
    } catch (error) {
      return this.createErrorResponse(`Internal server error: ${error}`);
    }
  }

  // GET /ledger/daily/:date
  public async getDailyLedger(date: string): Promise<APIResponse<{
    entries: SentimentLedgerEntry[];
    digest: DailyDigest | null;
  }>> {
    await this.simulateNetworkDelay();

    try {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const entries = SentimentLedgerEngine.getLedgerByDateRange(targetDate, nextDay);
      const digest = SentimentLedgerEngine.getDailyDigest(date);

      const responseData = {
        entries,
        digest
      };

      console.log(`🔗 API Request: /ledger/daily/${date} - returning ${entries.length} entries`);
      return this.createResponse(responseData, entries.length);
      
    } catch (error) {
      return this.createErrorResponse(`Invalid date format or internal error: ${error}`);
    }
  }

  // GET /ledger/summary/:range
  public async getLedgerSummary(range: '7d' | '30d' | '90d' | 'all'): Promise<APIResponse<LedgerSummaryData>> {
    await this.simulateNetworkDelay();

    try {
      let entries: SentimentLedgerEntry[];
      const now = new Date();
      
      switch (range) {
        case '7d':
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          entries = SentimentLedgerEngine.getLedgerByDateRange(sevenDaysAgo, now);
          break;
        case '30d':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          entries = SentimentLedgerEngine.getLedgerByDateRange(thirtyDaysAgo, now);
          break;
        case '90d':
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          entries = SentimentLedgerEngine.getLedgerByDateRange(ninetyDaysAgo, now);
          break;
        case 'all':
        default:
          entries = SentimentLedgerEngine.getAllEntries();
          break;
      }

      if (entries.length === 0) {
        return this.createErrorResponse(`No entries found for range: ${range}`);
      }

      // Calculate summary statistics
      const totalEntries = entries.length;
      const averageTrust = entries.reduce((sum, e) => sum + e.averageTrust, 0) / totalEntries;
      const averageVolatility = entries.reduce((sum, e) => sum + e.volatility, 0) / totalEntries;
      const participantCount = new Set(entries.map(e => e.participantCount)).size;

      const dateRange = {
        start: new Date(Math.min(...entries.map(e => e.timestamp))).toISOString(),
        end: new Date(Math.max(...entries.map(e => e.timestamp))).toISOString()
      };

      // Calculate top decks by activity
      const deckStats = new Map<string, { count: number; trustSum: number }>();
      entries.forEach(entry => {
        if (!deckStats.has(entry.deckId)) {
          deckStats.set(entry.deckId, { count: 0, trustSum: 0 });
        }
        const stats = deckStats.get(entry.deckId)!;
        stats.count++;
        stats.trustSum += entry.averageTrust;
      });

      const topDecks = Array.from(deckStats.entries())
        .map(([deckId, stats]) => ({
          deckId,
          entryCount: stats.count,
          averageTrust: stats.trustSum / stats.count
        }))
        .sort((a, b) => b.entryCount - a.entryCount)
        .slice(0, 5);

      const summaryData: LedgerSummaryData = {
        totalEntries,
        averageTrust,
        averageVolatility,
        participantCount,
        dateRange,
        topDecks
      };

      console.log(`🔗 API Request: /ledger/summary/${range} - returning summary for ${totalEntries} entries`);
      return this.createResponse(summaryData, totalEntries);
      
    } catch (error) {
      return this.createErrorResponse(`Summary generation failed: ${error}`);
    }
  }

  // GET /ledger/health
  public async getSystemHealth(): Promise<APIResponse<{
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    totalEntries: number;
    averageLatency: number;
    lastEntry: SentimentLedgerEntry | null;
    zkpValidationRate: number;
  }>> {
    await this.simulateNetworkDelay();

    try {
      const allEntries = SentimentLedgerEngine.getAllEntries();
      const latestEntries = SentimentLedgerEngine.getLatestEntries(10);
      
      const systemHealth = {
        status: 'healthy' as const,
        uptime: Date.now() - (Date.now() - 24 * 60 * 60 * 1000), // Simulate 24h uptime
        totalEntries: allEntries.length,
        averageLatency: this.baseDelay + 50,
        lastEntry: latestEntries[0] || null,
        zkpValidationRate: 98.5 + Math.random() * 1.5 // 98.5-100%
      };

      console.log('🔗 API Request: /ledger/health - system status check');
      return this.createResponse(systemHealth, 1);
      
    } catch (error) {
      return this.createErrorResponse(`Health check failed: ${error}`);
    }
  }

  // GET /ledger/search?trust_min=X&trust_max=Y&volatility_min=Z
  public async searchLedger(params: {
    trustMin?: number;
    trustMax?: number;
    volatilityMin?: number;
    volatilityMax?: number;
    deckId?: string;
    eventSource?: string;
    limit?: number;
  }): Promise<APIResponse<SentimentLedgerEntry[]>> {
    await this.simulateNetworkDelay();

    try {
      let results = SentimentLedgerEngine.getAllEntries();

      // Apply filters
      if (params.trustMin !== undefined || params.trustMax !== undefined) {
        const min = params.trustMin ?? 0;
        const max = params.trustMax ?? 100;
        results = SentimentLedgerEngine.getLedgerByTrustThreshold(min, max);
      }

      if (params.volatilityMin !== undefined || params.volatilityMax !== undefined) {
        const min = params.volatilityMin ?? 0;
        const max = params.volatilityMax ?? 100;
        results = results.filter(entry => 
          entry.volatility >= min && entry.volatility <= max
        );
      }

      if (params.deckId) {
        results = results.filter(entry => entry.deckId === params.deckId);
      }

      if (params.eventSource) {
        results = results.filter(entry => 
          entry.eventSource.toLowerCase().includes(params.eventSource!.toLowerCase())
        );
      }

      // Apply limit
      const limit = params.limit ?? 50;
      const limitedResults = results.slice(-limit);

      console.log(`🔗 API Request: /ledger/search - returning ${limitedResults.length} filtered entries`);
      return this.createResponse(limitedResults, limitedResults.length);
      
    } catch (error) {
      return this.createErrorResponse(`Search failed: ${error}`);
    }
  }

  // Mock endpoint routing for demonstration
  public async handleRequest(endpoint: string, params?: any): Promise<APIResponse<any>> {
    console.log(`🌐 PublicSentimentAPI request: ${endpoint}`, params);

    if (endpoint.startsWith('/ledger/')) {
      const path = endpoint.replace('/ledger/', '');
      
      if (path.startsWith('daily/')) {
        const date = path.replace('daily/', '');
        return this.getDailyLedger(date);
      }
      
      if (path.startsWith('summary/')) {
        const range = path.replace('summary/', '') as '7d' | '30d' | '90d' | 'all';
        return this.getLedgerSummary(range);
      }
      
      if (path === 'health') {
        return this.getSystemHealth();
      }
      
      if (path === 'search') {
        return this.searchLedger(params || {});
      }
      
      // Default to deck lookup
      return this.getLedgerByDeck(path);
    }

    return this.createErrorResponse('Endpoint not found');
  }
}

// Singleton instance
export const PublicSentimentAPI = new PublicSentimentAPIClass();

// Auto-start API simulation logging
console.log('🌐 PublicSentimentAPI initialized - mock REST endpoints available');
console.log('📡 Available endpoints:');
console.log('  GET /ledger/:deckId - Get entries by deck');
console.log('  GET /ledger/daily/:date - Get daily entries and digest');
console.log('  GET /ledger/summary/:range - Get aggregated summary (7d|30d|90d|all)');
console.log('  GET /ledger/health - System health check');
console.log('  GET /ledger/search - Advanced search with filters');