import React, { useState } from 'react';
import { MessageCircle, History } from 'lucide-react';
import { SentimentAggregationCard } from '../../feedback/SentimentAggregationCard';
import { TrustVoteCard } from '../../feedback/TrustVoteCard';
import { FeedbackHistoryPanel } from '../../feedback/FeedbackHistoryPanel';

interface WalletTrustFeedbackCardProps {
  walletAddress?: string;
  userDID?: string;
}

export const WalletTrustFeedbackCard: React.FC<WalletTrustFeedbackCardProps> = ({
  walletAddress = "0x742d35c6da25ec13...c3a8",
  userDID = "did:civic:user123"
}) => {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showVoteCard, setShowVoteCard] = useState(false);

  const handleVoteCast = (voteType: 'trust' | 'concern', zkpHash: string) => {
    console.log(`✅ Wallet trust vote cast: ${voteType} (ZKP: ${zkpHash})`);
    // Auto-close vote card after successful vote
    setTimeout(() => setShowVoteCard(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-base font-semibold text-white">Wallet Trust Feedback</h3>
          <p className="text-xs text-slate-400">Community confidence in wallet operations</p>
        </div>
      </div>

      {/* Wallet Context */}
      <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
        <div className="text-sm text-slate-300 mb-1">Active Wallet</div>
        <div className="text-xs text-blue-400 font-mono">{walletAddress}</div>
        <div className="text-xs text-slate-500 mt-1">DID: {userDID}</div>
      </div>

      {/* Sentiment Aggregation */}
      <div className="mb-4">
        <SentimentAggregationCard 
          deckId="wallet_overview" 
          deckName="Wallet Operations Trust"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setShowVoteCard(!showVoteCard)}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
            showVoteCard
              ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
              : 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600 text-slate-300 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {showVoteCard ? 'Hide Voting' : 'Cast Trust Vote'}
        </button>

        <button
          onClick={() => setShowHistoryPanel(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-700/20 hover:bg-slate-700/40 border border-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <History className="w-4 h-4" />
          View Feedback History
        </button>
      </div>

      {/* Trust Vote Card */}
      {showVoteCard && (
        <div className="mt-4 p-3 bg-slate-700/10 border border-slate-600 rounded-lg">
          <TrustVoteCard
            memoryAction={{
              id: 'wallet_operation_current',
              action: 'wallet_trust_assessment',
              value: 'Overall Wallet Operations',
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
          console.log(`🔁 Replaying wallet feedback: ${entry.voteType} vote`);
        }}
      />

      {/* Trust Explanation */}
      <div className="mt-4 p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• Wallet trust affects transaction limits and advanced features</div>
        <div>• Community feedback helps validate secure wallet operations</div>
      </div>
    </div>
  );
};

export default WalletTrustFeedbackCard;