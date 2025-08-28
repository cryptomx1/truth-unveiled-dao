import React, { useState, useEffect } from 'react';
import { Scale, Users, History } from 'lucide-react';
import { SentimentAggregationCard } from '../../feedback/SentimentAggregationCard';
import { TrustVoteCard } from '../../feedback/TrustVoteCard';
import { FeedbackHistoryPanel } from '../../feedback/FeedbackHistoryPanel';
import { useTranslation } from '../../../translation/useTranslation';
import { useLangContext } from '../../../context/LanguageContext';

interface ConsensusTrustFeedbackCardProps {
  activeProposals?: number;
  consensusThreshold?: number;
  participantCount?: number;
}

export const ConsensusTrustFeedbackCard: React.FC<ConsensusTrustFeedbackCardProps> = ({
  activeProposals = 4,
  consensusThreshold = 67,
  participantCount = 127
}) => {
  const { t } = useTranslation();
  const { language } = useLangContext();
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showVoteCard, setShowVoteCard] = useState(false);

  // Console log when component re-renders in different language
  useEffect(() => {
    console.log(`🈳 ConsensusTrustFeedbackCard re-rendered in: ${language.toUpperCase()}`);
  }, [language]);

  const handleVoteCast = (voteType: 'trust' | 'concern', zkpHash: string) => {
    console.log(`✅ Consensus trust vote cast: ${voteType} (ZKP: ${zkpHash})`);
    // Auto-close vote card after successful vote
    setTimeout(() => setShowVoteCard(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Scale className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-base font-semibold text-white">{t('card.feedback.title')}</h3>
          <p className="text-xs text-slate-400">{t('card.feedback.description')}</p>
        </div>
      </div>

      {/* Consensus Context */}
      <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
        <div className="text-sm text-slate-300 mb-2">Current Consensus State</div>
        
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="text-purple-400 font-semibold">{activeProposals}</div>
            <div className="text-slate-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-semibold">{consensusThreshold}%</div>
            <div className="text-slate-400">Threshold</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-semibold">{participantCount}</div>
            <div className="text-slate-400">Participants</div>
          </div>
        </div>
      </div>

      {/* Sentiment Aggregation */}
      <div className="mb-4">
        <SentimentAggregationCard 
          deckId="consensus_layer" 
          deckName="Consensus Mechanisms Trust"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setShowVoteCard(!showVoteCard)}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
            showVoteCard
              ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
              : 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600 text-slate-300 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          {showVoteCard ? 'Hide Voting' : 'Evaluate Consensus'}
        </button>

        <button
          onClick={() => setShowHistoryPanel(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-700/20 hover:bg-slate-700/40 border border-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <History className="w-4 h-4" />
          View Consensus History
        </button>
      </div>

      {/* Trust Vote Card */}
      {showVoteCard && (
        <div className="mt-4 p-3 bg-slate-700/10 border border-slate-600 rounded-lg">
          <TrustVoteCard
            memoryAction={{
              id: 'consensus_evaluation_current',
              action: 'consensus_trust_evaluation',
              value: `Consensus Mechanisms (${activeProposals} active)`,
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
          console.log(`🔁 Replaying consensus feedback: ${entry.voteType} vote`);
        }}
      />

      {/* Trust Explanation */}
      <div className="mt-4 p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• Consensus trust affects proposal thresholds and validation</div>
        <div>• Community feedback helps optimize decision-making mechanisms</div>
      </div>
    </div>
  );
};

export default ConsensusTrustFeedbackCard;