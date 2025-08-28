// CivicMissionLedger.ts - Mission tracking and audit trail for civic engagement
// Integrates with MissionReferrerOverlay.tsx for referral trace storage

export interface MissionLedgerEntry {
  timestamp: string;
  eventType: 'mission_referral_accepted' | 'independent_citizen_proceed' | 'onboarding_completed' | 'deck_unlocked' | 'tier_advanced' | 'civic_action';
  sessionId: string;
  referrerCid?: string;
  referrerAlias?: string;
  metadata?: Record<string, any>;
  deckId?: string;
  userId?: string;
  actionDetails?: string;
}

export interface MissionProgress {
  totalActions: number;
  decksUnlocked: number;
  referralBonus: boolean;
  civicTier: string;
  truthPoints: number;
  lastActivity: string;
}

export class CivicMissionLedger {
  private static readonly STORAGE_KEY = 'civic_mission_ledger';
  private static readonly PROGRESS_KEY = 'civic_mission_progress';

  // Append new entry to mission ledger
  static appendEntry(entry: Omit<MissionLedgerEntry, 'timestamp' | 'sessionId'>): void {
    const fullEntry: MissionLedgerEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      sessionId: Date.now().toString()
    };

    const existingEntries = this.getEntries();
    existingEntries.push(fullEntry);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingEntries));
    
    console.log('📋 CivicMissionLedger: Entry appended', fullEntry);
    
    // Update progress metrics
    this.updateProgress(fullEntry);
  }

  // Retrieve all ledger entries
  static getEntries(): MissionLedgerEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ CivicMissionLedger: Failed to parse entries', error);
      return [];
    }
  }

  // Get entries by event type
  static getEntriesByType(eventType: MissionLedgerEntry['eventType']): MissionLedgerEntry[] {
    return this.getEntries().filter(entry => entry.eventType === eventType);
  }

  // Get entries by referrer CID
  static getEntriesByReferrer(referrerCid: string): MissionLedgerEntry[] {
    return this.getEntries().filter(entry => entry.referrerCid === referrerCid);
  }

  // Get mission progress summary
  static getProgress(): MissionProgress {
    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY);
      const defaultProgress: MissionProgress = {
        totalActions: 0,
        decksUnlocked: 0,
        referralBonus: false,
        civicTier: 'Citizen',
        truthPoints: 0,
        lastActivity: new Date().toISOString()
      };
      
      return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
    } catch (error) {
      console.error('❌ CivicMissionLedger: Failed to parse progress', error);
      return {
        totalActions: 0,
        decksUnlocked: 0,
        referralBonus: false,
        civicTier: 'Citizen',
        truthPoints: 0,
        lastActivity: new Date().toISOString()
      };
    }
  }

  // Update mission progress based on new entry
  private static updateProgress(entry: MissionLedgerEntry): void {
    const currentProgress = this.getProgress();
    
    // Update counters based on event type
    switch (entry.eventType) {
      case 'mission_referral_accepted':
        currentProgress.referralBonus = true;
        break;
      case 'deck_unlocked':
        currentProgress.decksUnlocked += 1;
        break;
      case 'tier_advanced':
        if (entry.metadata?.newTier) {
          currentProgress.civicTier = entry.metadata.newTier;
        }
        break;
      case 'civic_action':
        currentProgress.totalActions += 1;
        if (entry.metadata?.truthPointsAwarded) {
          currentProgress.truthPoints += entry.metadata.truthPointsAwarded;
        }
        break;
    }

    currentProgress.lastActivity = entry.timestamp;
    
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(currentProgress));
    
    console.log('📊 CivicMissionLedger: Progress updated', currentProgress);
  }

  // Export ledger for audit/analysis
  static exportLedger(): { entries: MissionLedgerEntry[], progress: MissionProgress, exportedAt: string } {
    return {
      entries: this.getEntries(),
      progress: this.getProgress(),
      exportedAt: new Date().toISOString()
    };
  }

  // Clear all ledger data (use with caution)
  static clearLedger(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
    console.log('🗑️ CivicMissionLedger: All data cleared');
  }

  // Get recent activity (last N entries)
  static getRecentActivity(limit: number = 10): MissionLedgerEntry[] {
    const entries = this.getEntries();
    return entries.slice(-limit).reverse(); // Most recent first
  }

  // Check if user has referral bonus eligibility
  static hasReferralBonus(): boolean {
    const referralEntries = this.getEntriesByType('mission_referral_accepted');
    return referralEntries.length > 0;
  }

  // Get referrer information if exists
  static getReferrerInfo(): { cid: string, alias: string } | null {
    const referralEntries = this.getEntriesByType('mission_referral_accepted');
    if (referralEntries.length > 0) {
      const latest = referralEntries[referralEntries.length - 1];
      if (latest.referrerCid && latest.referrerAlias) {
        return {
          cid: latest.referrerCid,
          alias: latest.referrerAlias
        };
      }
    }
    return null;
  }

  // Sync with TruthAffiliateTokenBridge (future integration point)
  static syncWithAffiliateBridge(): void {
    const referrerInfo = this.getReferrerInfo();
    
    if (referrerInfo) {
      const syncData = {
        referrerCid: referrerInfo.cid,
        timestamp: new Date().toISOString(),
        status: 'ready_for_tokenomics',
        missionProgress: this.getProgress()
      };
      
      localStorage.setItem('truth_affiliate_sync', JSON.stringify(syncData));
      
      console.log('🔗 CivicMissionLedger: Affiliate bridge sync prepared', syncData);
    }
  }
}