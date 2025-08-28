import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, History } from 'lucide-react';
import { SentimentAggregationCard } from '../../feedback/SentimentAggregationCard';
import { TrustVoteCard } from '../../feedback/TrustVoteCard';
import { FeedbackHistoryPanel } from '../../feedback/FeedbackHistoryPanel';
import { useTranslation } from '../../../translation/useTranslation';
import { useLangContext } from '../../../context/LanguageContext';

interface IdentityTrustFeedbackCardProps {
  userDID?: string;
  credentialCount?: number;
  verificationLevel?: 'basic' | 'enhanced' | 'civic-grade';
}

export const IdentityTrustFeedbackCard: React.FC<IdentityTrustFeedbackCardProps> = ({
  userDID = "did:civic:user123",
  credentialCount = 3,
  verificationLevel = 'civic-grade'
}) => {
  const { t } = useTranslation();
  const { language } = useLangContext();
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showVoteCard, setShowVoteCard] = useState(false);

  // Console log when component re-renders in different language
  useEffect(() => {
    console.log(`🈳 IdentityTrustFeedbackCard re-rendered in: ${language.toUpperCase()}`);
  }, [language]);

  const handleVoteCast = (voteType: 'trust' | 'concern', zkpHash: string) => {
    console.log(`✅ Identity trust vote cast: ${voteType} (ZKP: ${zkpHash})`);
    // Auto-close vote card after successful vote
    setTimeout(() => setShowVoteCard(false), 2000);
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'civic-grade':
        return 'text-emerald-400 bg-emerald-600/20';
      case 'enhanced':
        return 'text-blue-400 bg-blue-600/20';
      case 'basic':
        return 'text-yellow-400 bg-yellow-600/20';
      default:
        return 'text-slate-400 bg-slate-600/20';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-emerald-400" />
        <div>
          <h3 className="text-base font-semibold text-white">{t('card.identity.title')}</h3>
          <p className="text-xs text-slate-400">{t('card.identity.description')}</p>
        </div>
      </div>

      {/* Identity Context */}
      <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
        <div className="text-sm text-slate-300 mb-1">Identity Context</div>
        <div className="text-xs text-emerald-400 font-mono mb-2">{userDID}</div>
        
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            <span className="text-slate-400">{credentialCount} Credentials</span>
          </div>
          <div className={`px-2 py-1 rounded ${getVerificationColor(verificationLevel)}`}>
            {verificationLevel.charAt(0).toUpperCase() + verificationLevel.slice(1)}
          </div>
        </div>
      </div>

      {/* Sentiment Aggregation */}
      <div className="mb-4">
        <SentimentAggregationCard 
          deckId="civic_identity" 
          deckName="Identity Verification Trust"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setShowVoteCard(!showVoteCard)}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
            showVoteCard
              ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600 text-slate-300 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          {showVoteCard ? 'Hide Voting' : 'Verify Identity Trust'}
        </button>

        <button
          onClick={() => setShowHistoryPanel(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-700/20 hover:bg-slate-700/40 border border-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <History className="w-4 h-4" />
          View Verification History
        </button>
      </div>

      {/* Trust Vote Card */}
      {showVoteCard && (
        <div className="mt-4 p-3 bg-slate-700/10 border border-slate-600 rounded-lg">
          <TrustVoteCard
            memoryAction={{
              id: 'identity_verification_current',
              action: 'identity_trust_verification',
              value: `${verificationLevel} Identity Claims`,
              timestamp: new Date()
            }}
            onVoteCast={handleVoteCast}
          />
        </div>
      )}

      {/* Feedback History Panel */}
      <FeedbackHistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        onReplayFeedback={(entry) => {
          console.log(`🔁 Replaying identity feedback: ${entry.voteType} vote`);
        }}
      />

      {/* Trust Explanation */}
      <div className="mt-4 p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• Identity trust enables higher privilege operations</div>
        <div>• Verification feedback helps validate DID claims and credentials</div>
      </div>
    </div>
  );
};

export default IdentityTrustFeedbackCard;