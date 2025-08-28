/**
 * FeedbackZoneEngine.tsx - Phase XVIII
 * ZIP-Based Civic Feedback Engine for Direct Democracy Interface
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  Shield, 
  Target, 
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { FeedbackExportPanel } from './FeedbackExportPanel';
import { createFeedbackProof, type FeedbackProof, type FeedbackInput } from '../../services/FeedbackProofSigner';

// Types for feedback context
export interface FeedbackContext {
  zip: string;
  district: string;
  billId: string;
  title: string;
  sponsor: string;
  status: string;
}

// Types for feedback management
interface FeedbackRecord {
  billId: string;
  vote: 'Support' | 'Oppose' | 'Abstain';
  timestamp: Date;
  tier: string;
  zip: string;
  district: string;
}

interface FeedbackStats {
  votesThisMonth: number;
  totalVotes: number;
  trustIndex: number;
  streak: number;
}

// Props for the feedback engine
interface FeedbackZoneEngineProps {
  context: FeedbackContext;
  userTier?: string;
  onFeedbackSubmitted?: (feedback: FeedbackRecord) => void;
}

// Mock feedback storage for in-memory simulation
class FeedbackStorage {
  private static instance: FeedbackStorage;
  private feedbackRecords: FeedbackRecord[] = [];
  
  static getInstance(): FeedbackStorage {
    if (!FeedbackStorage.instance) {
      FeedbackStorage.instance = new FeedbackStorage();
    }
    return FeedbackStorage.instance;
  }

  addFeedback(feedback: FeedbackRecord): void {
    this.feedbackRecords.push(feedback);
    console.log(`🔐 Feedback recorded — Bill: ${feedback.billId}, Vote: ${feedback.vote}, Tier: ${feedback.tier}`);
  }

  getFeedbackStats(zip: string): FeedbackStats {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const userFeedback = this.feedbackRecords.filter(f => f.zip === zip);
    const thisMonthFeedback = userFeedback.filter(f => 
      f.timestamp.getMonth() === currentMonth && 
      f.timestamp.getFullYear() === currentYear
    );
    
    // Calculate trust index based on participation (mock calculation)
    const baseIndex = 65;
    const participationBonus = Math.min(thisMonthFeedback.length * 3, 25);
    const trustIndex = Math.min(baseIndex + participationBonus, 100);
    
    return {
      votesThisMonth: thisMonthFeedback.length,
      totalVotes: userFeedback.length,
      trustIndex,
      streak: Math.min(thisMonthFeedback.length, 7) // Mock streak calculation
    };
  }

  hasFeedbackForBill(billId: string, zip: string): boolean {
    return this.feedbackRecords.some(f => f.billId === billId && f.zip === zip);
  }

  getFeedbackForBill(billId: string, zip: string): FeedbackRecord | undefined {
    return this.feedbackRecords.find(f => f.billId === billId && f.zip === zip);
  }
}

// Main FeedbackZoneEngine component
export const FeedbackZoneEngine: React.FC<FeedbackZoneEngineProps> = ({
  context,
  userTier = 'Citizen',
  onFeedbackSubmitted
}) => {
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    votesThisMonth: 0,
    totalVotes: 0,
    trustIndex: 65,
    streak: 0
  });
  
  const [existingFeedback, setExistingFeedback] = useState<FeedbackRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [generatedProof, setGeneratedProof] = useState<FeedbackProof | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  
  // Refs for ARIA live regions
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  const storage = FeedbackStorage.getInstance();

  // Initialize component and load existing feedback
  useEffect(() => {
    const stats = storage.getFeedbackStats(context.zip);
    setFeedbackStats(stats);
    
    const existing = storage.getFeedbackForBill(context.billId, context.zip);
    setExistingFeedback(existing || null);
    
    console.log(`📊 Feedback Summary — Votes This Month: ${stats.votesThisMonth}/5, Trust Index: ${stats.trustIndex}%`);
  }, [context.billId, context.zip]);

  // Handle feedback submission
  const handleFeedbackSubmit = async (vote: 'Support' | 'Oppose' | 'Abstain') => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setLastAction(vote);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const feedback: FeedbackRecord = {
      billId: context.billId,
      vote,
      timestamp: new Date(),
      tier: userTier,
      zip: context.zip,
      district: context.district
    };
    
    // Store feedback
    storage.addFeedback(feedback);
    
    // Phase XIX: Generate ZKP proof for feedback
    try {
      const proofInput: FeedbackInput = {
        zip: context.zip,
        district: context.district,
        billId: context.billId,
        vote,
        timestamp: feedback.timestamp.toISOString(),
        tier: userTier
      };
      
      const proof = await createFeedbackProof(proofInput);
      setGeneratedProof(proof);
      setShowExportPanel(true);
      
    } catch (error) {
      console.error('❌ Proof generation failed:', error);
    }
    
    // Update local state
    setExistingFeedback(feedback);
    const newStats = storage.getFeedbackStats(context.zip);
    setFeedbackStats(newStats);
    
    // Update ARIA live region
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `Feedback recorded: ${vote} for ${context.title}`;
    }
    
    // Log summary
    console.log(`📊 Feedback Summary — Votes This Month: ${newStats.votesThisMonth}/5, Trust Index: ${newStats.trustIndex}%`);
    
    // Notify parent component
    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(feedback);
    }
    
    setIsSubmitting(false);
  };

  // Get button styling based on state
  const getButtonStyle = (voteType: 'Support' | 'Oppose' | 'Abstain') => {
    const isSelected = existingFeedback?.vote === voteType;
    const isProcessing = isSubmitting && lastAction === voteType;
    
    const baseStyle = "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 text-sm font-medium";
    
    if (isSelected) {
      switch (voteType) {
        case 'Support':
          return `${baseStyle} bg-green-900/30 border-green-600 text-green-300`;
        case 'Oppose':
          return `${baseStyle} bg-red-900/30 border-red-600 text-red-300`;
        case 'Abstain':
          return `${baseStyle} bg-yellow-900/30 border-yellow-600 text-yellow-300`;
      }
    }
    
    if (isProcessing) {
      return `${baseStyle} bg-blue-900/30 border-blue-600 text-blue-300 animate-pulse`;
    }
    
    return `${baseStyle} bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500`;
  };

  // Get button icon
  const getButtonIcon = (voteType: 'Support' | 'Oppose' | 'Abstain') => {
    const iconClass = "w-4 h-4";
    const isSelected = existingFeedback?.vote === voteType;
    
    switch (voteType) {
      case 'Support':
        return isSelected ? <CheckCircle className={iconClass} /> : <ThumbsUp className={iconClass} />;
      case 'Oppose':
        return isSelected ? <CheckCircle className={iconClass} /> : <ThumbsDown className={iconClass} />;
      case 'Abstain':
        return isSelected ? <CheckCircle className={iconClass} /> : <Minus className={iconClass} />;
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((feedbackStats.votesThisMonth / 5) * 100, 100);

  // Get trust index color
  const getTrustColor = (index: number) => {
    if (index >= 80) return 'text-green-400';
    if (index >= 65) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Civic Feedback Zone
          </h3>
          <p className="text-sm text-slate-400">
            {context.district} • ZIP {context.zip}
          </p>
        </div>
        <div className="text-2xl opacity-20">🗳️</div>
      </div>

      {/* Bill Information */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-white">{context.title}</h4>
          <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
            {context.billId}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>Sponsor: {context.sponsor}</span>
          <span>Status: {context.status}</span>
        </div>
      </div>

      {/* Feedback Buttons */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-slate-300">Your Position:</h5>
        <div className="flex gap-3">
          <button
            onClick={() => handleFeedbackSubmit('Support')}
            disabled={isSubmitting}
            className={getButtonStyle('Support')}
            role="button"
            aria-label={`Support ${context.title}`}
            tabIndex={0}
          >
            {getButtonIcon('Support')}
            <span>Support</span>
          </button>
          
          <button
            onClick={() => handleFeedbackSubmit('Oppose')}
            disabled={isSubmitting}
            className={getButtonStyle('Oppose')}
            role="button"
            aria-label={`Oppose ${context.title}`}
            tabIndex={0}
          >
            {getButtonIcon('Oppose')}
            <span>Oppose</span>
          </button>
          
          <button
            onClick={() => handleFeedbackSubmit('Abstain')}
            disabled={isSubmitting}
            className={getButtonStyle('Abstain')}
            role="button"
            aria-label={`Abstain from ${context.title}`}
            tabIndex={0}
          >
            {getButtonIcon('Abstain')}
            <span>Abstain</span>
          </button>
        </div>
        
        {existingFeedback && (
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>
              You voted {existingFeedback.vote} on {existingFeedback.timestamp.toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Feedback Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Monthly Progress</span>
            <Target className="w-4 h-4 text-orange-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white">{feedbackStats.votesThisMonth}/5 votes</span>
              <span className="text-slate-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className="h-2 bg-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Trust Index</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className={`text-lg font-semibold ${getTrustColor(feedbackStats.trustIndex)}`}>
              {feedbackStats.trustIndex}%
            </div>
            <div className="text-xs text-slate-400">
              {feedbackStats.streak > 0 && `${feedbackStats.streak} day streak`}
            </div>
          </div>
        </div>
      </div>

      {/* ZKP Status and Export Panel */}
      <div className="bg-slate-700/20 border border-slate-600 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>ZKP Privacy: Enabled</span>
          </div>
          {generatedProof && (
            <button
              onClick={() => setShowExportPanel(true)}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs"
              aria-label="Open proof export panel"
            >
              <Download className="w-3 h-3" />
              <span>Export Proof</span>
            </button>
          )}
        </div>
      </div>

      {/* Phase XIX: Feedback Export Panel */}
      {showExportPanel && generatedProof && (
        <FeedbackExportPanel
          proof={generatedProof}
          onClose={() => setShowExportPanel(false)}
          onExportComplete={() => {
            console.log(`📤 Export completed for ${generatedProof.metadata.billId}`);
          }}
        />
      )}

      {/* ARIA Live Region */}
      <div 
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
};

export default FeedbackZoneEngine;