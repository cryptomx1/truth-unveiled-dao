/**
 * Phase XV: Collective Sentiment Ledger Initialization
 * SentimentLedgerEngine.ts - Append-only ledger of timestamped trust snapshots
 * Authority: Commander Mark | JASMY Relay authorization
 */

export interface SentimentLedgerEntry {
  deckId: string;
  timestamp: number;
  averageTrust: number;
  volatility: number;
  eventSource: string;
  zkpProofHash: string;
  participantCount: number;
  entryIndex: number;
}

export interface DailyDigest {
  date: string;
  totalEntries: number;
  averageTrust: number;
  maxVolatility: number;
  zkpHashes: string[];
  digestHash: string;
}

class SentimentLedgerEngineClass {
  private ledger: SentimentLedgerEntry[] = [];
  private dailyDigests: Map<string, DailyDigest> = new Map();
  private entryCounter = 0;

  constructor() {
    this.initializeMockLedger();
    this.generateDailyDigests();
  }

  private initializeMockLedger() {
    const decks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Generate 30 days of mock ledger entries
    for (let day = 0; day < 30; day++) {
      const dayTimestamp = thirtyDaysAgo + (day * 24 * 60 * 60 * 1000);
      
      // 3-8 entries per day across different decks
      const dailyEntryCount = 3 + Math.floor(Math.random() * 6);
      
      for (let entry = 0; entry < dailyEntryCount; entry++) {
        const deckId = decks[Math.floor(Math.random() * decks.length)];
        const entryTimestamp = dayTimestamp + (entry * 3 * 60 * 60 * 1000); // Spread throughout day
        
        const ledgerEntry: SentimentLedgerEntry = {
          deckId,
          timestamp: entryTimestamp,
          averageTrust: 55 + Math.random() * 35, // 55-90% range
          volatility: Math.random() * 25, // 0-25% volatility
          eventSource: this.getRandomEventSource(),
          zkpProofHash: this.generateZKPHash(deckId, entryTimestamp),
          participantCount: 15 + Math.floor(Math.random() * 85), // 15-100 participants
          entryIndex: this.entryCounter++
        };

        this.ledger.push(ledgerEntry);
      }
    }

    // Sort by timestamp
    this.ledger.sort((a, b) => a.timestamp - b.timestamp);
    console.log(`📚 SentimentLedgerEngine initialized: ${this.ledger.length} entries across 30 days`);
  }

  private getRandomEventSource(): string {
    const sources = [
      'trust_feedback_submission',
      'consensus_vote_cast',
      'identity_verification',
      'policy_engagement',
      'community_interaction',
      'governance_participation',
      'civic_education_completion',
      'reputation_milestone'
    ];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  private generateZKPHash(deckId: string, timestamp: number): string {
    const hashInput = `${deckId}_${timestamp}_${Math.random()}`;
    return 'zkp_' + btoa(hashInput).slice(0, 16).toLowerCase();
  }

  private generateDailyDigests() {
    const dailyGroups = new Map<string, SentimentLedgerEntry[]>();
    
    // Group entries by date
    this.ledger.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      dailyGroups.get(date)!.push(entry);
    });

    // Generate digests
    dailyGroups.forEach((entries, date) => {
      const totalEntries = entries.length;
      const averageTrust = entries.reduce((sum, e) => sum + e.averageTrust, 0) / totalEntries;
      const maxVolatility = Math.max(...entries.map(e => e.volatility));
      const zkpHashes = entries.map(e => e.zkpProofHash);
      const digestHash = this.generateDigestHash(date, zkpHashes);

      this.dailyDigests.set(date, {
        date,
        totalEntries,
        averageTrust,
        maxVolatility,
        zkpHashes,
        digestHash
      });
    });

    console.log(`📊 Generated ${this.dailyDigests.size} daily digests`);
  }

  private generateDigestHash(date: string, zkpHashes: string[]): string {
    const combined = `${date}_${zkpHashes.join('_')}`;
    return 'digest_' + btoa(combined).slice(0, 20).toLowerCase();
  }

  // Public methods for ledger access
  public appendEntry(entry: Omit<SentimentLedgerEntry, 'entryIndex'>): void {
    const newEntry: SentimentLedgerEntry = {
      ...entry,
      entryIndex: this.entryCounter++
    };
    
    this.ledger.push(newEntry);
    this.ledger.sort((a, b) => a.timestamp - b.timestamp);
    
    // Update daily digest
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    this.updateDailyDigest(date);
    
    console.log(`📝 New ledger entry appended: ${entry.deckId} at ${new Date(entry.timestamp).toLocaleString()}`);
  }

  private updateDailyDigest(date: string) {
    const dayEntries = this.ledger.filter(entry => 
      new Date(entry.timestamp).toISOString().split('T')[0] === date
    );

    if (dayEntries.length > 0) {
      const totalEntries = dayEntries.length;
      const averageTrust = dayEntries.reduce((sum, e) => sum + e.averageTrust, 0) / totalEntries;
      const maxVolatility = Math.max(...dayEntries.map(e => e.volatility));
      const zkpHashes = dayEntries.map(e => e.zkpProofHash);
      const digestHash = this.generateDigestHash(date, zkpHashes);

      this.dailyDigests.set(date, {
        date,
        totalEntries,
        averageTrust,
        maxVolatility,
        zkpHashes,
        digestHash
      });
    }
  }

  public getLedgerByDeck(deckId: string): SentimentLedgerEntry[] {
    return this.ledger.filter(entry => entry.deckId === deckId);
  }

  public getLedgerByDateRange(startDate: Date, endDate: Date): SentimentLedgerEntry[] {
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    return this.ledger.filter(entry => 
      entry.timestamp >= start && entry.timestamp <= end
    );
  }

  public getLedgerByTrustThreshold(minTrust: number, maxTrust: number): SentimentLedgerEntry[] {
    return this.ledger.filter(entry => 
      entry.averageTrust >= minTrust && entry.averageTrust <= maxTrust
    );
  }

  public getLedgerByVolatilityDelta(minVolatility: number, maxVolatility: number): SentimentLedgerEntry[] {
    return this.ledger.filter(entry => 
      entry.volatility >= minVolatility && entry.volatility <= maxVolatility
    );
  }

  public getAllEntries(): SentimentLedgerEntry[] {
    return [...this.ledger]; // Return copy to prevent mutation
  }

  public getDailyDigest(date: string): DailyDigest | undefined {
    return this.dailyDigests.get(date);
  }

  public getAllDailyDigests(): DailyDigest[] {
    return Array.from(this.dailyDigests.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  public getLatestEntries(count: number): SentimentLedgerEntry[] {
    return this.ledger.slice(-count).reverse();
  }

  public getLedgerStats() {
    const totalEntries = this.ledger.length;
    const averageTrust = this.ledger.reduce((sum, e) => sum + e.averageTrust, 0) / totalEntries;
    const averageVolatility = this.ledger.reduce((sum, e) => sum + e.volatility, 0) / totalEntries;
    const uniqueDecks = new Set(this.ledger.map(e => e.deckId)).size;
    const dateRange = {
      earliest: new Date(Math.min(...this.ledger.map(e => e.timestamp))),
      latest: new Date(Math.max(...this.ledger.map(e => e.timestamp)))
    };

    return {
      totalEntries,
      averageTrust,
      averageVolatility,
      uniqueDecks,
      dateRange,
      dailyDigestCount: this.dailyDigests.size
    };
  }

  // Real-time simulation of new entries
  public startLiveSimulation() {
    const addLiveEntry = () => {
      const decks = ['wallet_overview', 'civic_identity', 'consensus_layer', 'civic_memory'];
      const deckId = decks[Math.floor(Math.random() * decks.length)];
      
      const newEntry = {
        deckId,
        timestamp: Date.now(),
        averageTrust: 60 + Math.random() * 30,
        volatility: Math.random() * 20,
        eventSource: this.getRandomEventSource(),
        zkpProofHash: this.generateZKPHash(deckId, Date.now()),
        participantCount: 20 + Math.floor(Math.random() * 80)
      };

      this.appendEntry(newEntry);
    };

    // Add new entry every 30-60 seconds
    setInterval(() => {
      if (Math.random() > 0.5) { // 50% chance
        addLiveEntry();
      }
    }, 45000);

    console.log('🔄 Live ledger simulation started - new entries every 30-60 seconds');
  }
}

// Singleton instance
export const SentimentLedgerEngine = new SentimentLedgerEngineClass();

// Start live simulation
SentimentLedgerEngine.startLiveSimulation();