/**
 * Deck10FeedbackSync.ts
 * Phase PRESS-REPLAY Step 3 - Cross-Deck Feedback Synchronization
 * Authority: Commander Mark via JASMY Relay System
 */

interface Deck10FeedbackEntry {
  id: string;
  representativeId: string;
  representativeName: string;
  feedbackType: 'approve' | 'dissent' | 'amend' | 'abstain';
  feedbackContent: string;
  sentiment: number; // -100 to 100
  urgency: 'low' | 'medium' | 'high';
  issue: string;
  timestamp: Date;
  verified: boolean;
  zkpHash?: string;
}

interface DAO_AlignmentData {
  representativeId: string;
  representativeName: string;
  district: string;
  constituentSentiment: number;
  publicVotingRecord: number;
  lastSyncTimestamp: Date;
  feedbackEntries: Deck10FeedbackEntry[];
}

class Deck10FeedbackSync {
  private feedbackHistory: Deck10FeedbackEntry[] = [];
  private daoAlignmentData: DAO_AlignmentData[] = [];
  
  constructor() {
    this.initializeFeedbackSync();
  }

  /**
   * Initialize feedback synchronization system
   */
  private initializeFeedbackSync(): void {
    console.log('🔗 Deck10FeedbackSync: Cross-deck synchronization initialized');
    console.log('📊 Syncing: /deck/10 → RepDissonanceEngine → DAO metadata');
    
    // Load existing feedback history
    const storedFeedback = localStorage.getItem('deck10FeedbackHistory');
    if (storedFeedback) {
      this.feedbackHistory = JSON.parse(storedFeedback).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
    
    // Load DAO alignment data
    const storedAlignment = localStorage.getItem('daoAlignmentData');
    if (storedAlignment) {
      this.daoAlignmentData = JSON.parse(storedAlignment).map((item: any) => ({
        ...item,
        lastSyncTimestamp: new Date(item.lastSyncTimestamp),
        feedbackEntries: item.feedbackEntries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      }));
    } else {
      // Initialize with mock representative data for Phase PRESS-REPLAY Step 3
      this.initializeMockAlignmentData();
    }
  }

  /**
   * Initialize mock DAO alignment data for representatives
   */
  private initializeMockAlignmentData(): void {
    const mockAlignment: DAO_AlignmentData[] = [
      {
        representativeId: 'rep_district_01',
        representativeName: 'Rep. Sarah Chen',
        district: 'District 01',
        constituentSentiment: 73,
        publicVotingRecord: 45,
        lastSyncTimestamp: new Date(),
        feedbackEntries: [
          {
            id: 'feedback_001',
            representativeId: 'rep_district_01',
            representativeName: 'Rep. Sarah Chen',
            feedbackType: 'dissent',
            feedbackContent: 'Healthcare reform proposal lacks coverage for pre-existing conditions',
            sentiment: -65,
            urgency: 'high',
            issue: 'healthcare',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            verified: true,
            zkpHash: '0xabc123def456...'
          },
          {
            id: 'feedback_002',
            representativeId: 'rep_district_01',
            representativeName: 'Rep. Sarah Chen',
            feedbackType: 'dissent',
            feedbackContent: 'Climate action timeline too slow for urgent environmental crisis',
            sentiment: -78,
            urgency: 'high',
            issue: 'climate',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            verified: true,
            zkpHash: '0xdef456ghi789...'
          }
        ]
      },
      {
        representativeId: 'rep_district_02',
        representativeName: 'Rep. Michael Torres',
        district: 'District 02',
        constituentSentiment: 64,
        publicVotingRecord: 58,
        lastSyncTimestamp: new Date(),
        feedbackEntries: [
          {
            id: 'feedback_003',
            representativeId: 'rep_district_02',
            representativeName: 'Rep. Michael Torres',
            feedbackType: 'amend',
            feedbackContent: 'Infrastructure bill should include rural broadband expansion',
            sentiment: 35,
            urgency: 'medium',
            issue: 'infrastructure',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            verified: true,
            zkpHash: '0xghi789jkl012...'
          }
        ]
      },
      {
        representativeId: 'rep_district_03',
        representativeName: 'Rep. Lisa Rodriguez',
        district: 'District 03',
        constituentSentiment: 91,
        publicVotingRecord: 88,
        lastSyncTimestamp: new Date(),
        feedbackEntries: [
          {
            id: 'feedback_004',
            representativeId: 'rep_district_03',
            representativeName: 'Rep. Lisa Rodriguez',
            feedbackType: 'approve',
            feedbackContent: 'Veterans affairs support excellent, continue current policies',
            sentiment: 89,
            urgency: 'low',
            issue: 'veterans',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            verified: true,
            zkpHash: '0xjkl012mno345...'
          }
        ]
      }
    ];

    this.daoAlignmentData = mockAlignment;
    this.feedbackHistory = mockAlignment.flatMap(rep => rep.feedbackEntries);
    this.persistData();
  }

  /**
   * Sync feedback data from Deck #10 with representative alignment
   */
  syncFeedbackWithAlignment(): { 
    totalFeedback: number; 
    dissonanceThreshold: number; 
    highDissonanceReps: string[];
    syncedEntries: number;
  } {
    let syncedEntries = 0;
    const highDissonanceReps: string[] = [];
    
    // Update alignment data based on recent feedback
    this.daoAlignmentData.forEach(repData => {
      const recentFeedback = this.feedbackHistory.filter(
        feedback => 
          feedback.representativeId === repData.representativeId &&
          feedback.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      );
      
      if (recentFeedback.length > 0) {
        // Calculate weighted sentiment from feedback
        const avgFeedbackSentiment = recentFeedback.reduce(
          (sum, feedback) => sum + feedback.sentiment, 0
        ) / recentFeedback.length;
        
        // Update constituent sentiment based on feedback
        repData.constituentSentiment = Math.round(
          (repData.constituentSentiment * 0.7) + (avgFeedbackSentiment + 100) * 0.5 * 0.3
        );
        
        // Calculate dissonance
        const dissonance = Math.abs(repData.constituentSentiment - repData.publicVotingRecord);
        
        if (dissonance > 30) { // High dissonance threshold
          highDissonanceReps.push(repData.representativeName);
        }
        
        repData.lastSyncTimestamp = new Date();
        syncedEntries += recentFeedback.length;
      }
    });
    
    this.persistData();
    
    console.log('🔄 Deck10FeedbackSync: Synchronization complete', {
      totalFeedback: this.feedbackHistory.length,
      syncedEntries,
      highDissonanceReps: highDissonanceReps.length,
      timestamp: new Date().toISOString()
    });
    
    return {
      totalFeedback: this.feedbackHistory.length,
      dissonanceThreshold: 30,
      highDissonanceReps,
      syncedEntries
    };
  }

  /**
   * Add new feedback entry (simulated from Deck #10)
   */
  addFeedbackEntry(entry: Omit<Deck10FeedbackEntry, 'id' | 'timestamp'>): Deck10FeedbackEntry {
    const feedbackEntry: Deck10FeedbackEntry = {
      ...entry,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    this.feedbackHistory.unshift(feedbackEntry);
    
    // Update representative's feedback entries
    const repData = this.daoAlignmentData.find(rep => rep.representativeId === entry.representativeId);
    if (repData) {
      repData.feedbackEntries.unshift(feedbackEntry);
    }
    
    this.persistData();
    
    console.log(`📝 New feedback entry added for ${entry.representativeName}:`, {
      type: entry.feedbackType,
      sentiment: entry.sentiment,
      issue: entry.issue,
      urgency: entry.urgency
    });
    
    return feedbackEntry;
  }

  /**
   * Get feedback summary for representative
   */
  getFeedbackSummary(representativeId: string): {
    totalFeedback: number;
    sentimentAverage: number;
    urgentCount: number;
    dissentRatio: number;
    recentFeedback: Deck10FeedbackEntry[];
    lastSync: Date;
  } {
    const repData = this.daoAlignmentData.find(rep => rep.representativeId === representativeId);
    if (!repData) {
      return {
        totalFeedback: 0,
        sentimentAverage: 0,
        urgentCount: 0,
        dissentRatio: 0,
        recentFeedback: [],
        lastSync: new Date()
      };
    }
    
    const feedback = repData.feedbackEntries;
    const recentFeedback = feedback.filter(
      entry => entry.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    return {
      totalFeedback: feedback.length,
      sentimentAverage: feedback.reduce((sum, entry) => sum + entry.sentiment, 0) / feedback.length || 0,
      urgentCount: feedback.filter(entry => entry.urgency === 'high').length,
      dissentRatio: feedback.filter(entry => entry.feedbackType === 'dissent').length / feedback.length || 0,
      recentFeedback: recentFeedback.slice(0, 5), // Last 5 recent entries
      lastSync: repData.lastSyncTimestamp
    };
  }

  /**
   * Get all representatives alignment data
   */
  getAllAlignmentData(): DAO_AlignmentData[] {
    return this.daoAlignmentData;
  }

  /**
   * Get cross-deck sync status
   */
  getSyncStatus(): {
    totalRepresentatives: number;
    totalFeedback: number;
    lastSyncTime: Date;
    highDissonanceCount: number;
    avgDissonance: number;
  } {
    const dissonanceScores = this.daoAlignmentData.map(rep => 
      Math.abs(rep.constituentSentiment - rep.publicVotingRecord)
    );
    
    const avgDissonance = dissonanceScores.reduce((sum, score) => sum + score, 0) / dissonanceScores.length;
    const highDissonanceCount = dissonanceScores.filter(score => score > 30).length;
    
    return {
      totalRepresentatives: this.daoAlignmentData.length,
      totalFeedback: this.feedbackHistory.length,
      lastSyncTime: new Date(),
      highDissonanceCount,
      avgDissonance
    };
  }

  /**
   * Persist data to localStorage
   */
  private persistData(): void {
    localStorage.setItem('deck10FeedbackHistory', JSON.stringify(this.feedbackHistory));
    localStorage.setItem('daoAlignmentData', JSON.stringify(this.daoAlignmentData));
  }
}

// Export singleton instance
export const deck10FeedbackSync = new Deck10FeedbackSync();
export type { Deck10FeedbackEntry, DAO_AlignmentData };