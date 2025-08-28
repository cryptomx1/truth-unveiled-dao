import React, { useState, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Shield, Lock } from 'lucide-react';
import { useZKPFeedbackNode } from './ZKPFeedbackNode';

interface TrustVoteCardProps {
  memoryAction?: {
    id: string;
    action: string;
    value: string;
    timestamp: Date;
  };
  onVoteCast?: (vote: 'trust' | 'concern', zkpHash: string) => void;
}

export const TrustVoteCard: React.FC<TrustVoteCardProps> = ({
  memoryAction,
  onVoteCast
}) => {
  const [selectedVote, setSelectedVote] = useState<'trust' | 'concern' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zkpCommitted, setZkpCommitted] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { generateFeedbackPayload, commitToVault } = useZKPFeedbackNode();

  // Nuclear TTS override system
  React.useEffect(() => {
    const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    const originalCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
    
    window.speechSynthesis.speak = () => {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    };
    window.speechSynthesis.cancel = originalCancel;
    console.log('TTS override applied');
    
    return () => {
      window.speechSynthesis.speak = originalSpeak;
      window.speechSynthesis.cancel = originalCancel;
    };
  }, []);

  const handleVote = async (voteType: 'trust' | 'concern') => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSelectedVote(voteType);

    try {
      // Generate ZKP payload
      const payload = generateFeedbackPayload({
        memoryActionId: memoryAction?.id || 'general_feedback',
        voteType,
        timestamp: new Date(),
        userContext: {
          sessionType: 'civic_engagement',
          actionContext: memoryAction?.action || 'direct_feedback'
        }
      });

      // Commit to vault
      const zkpHash = await commitToVault(payload);
      setZkpCommitted(true);

      // Trigger callback
      onVoteCast?.(voteType, zkpHash);

      console.log(`✅ Trust vote cast: ${voteType.toUpperCase()} with ZKP commitment`);
      console.log(`🔐 ZKP Hash: ${zkpHash}`);

    } catch (error) {
      console.error('❌ Trust vote failed:', error);
      setSelectedVote(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetVote = () => {
    setSelectedVote(null);
    setZkpCommitted(false);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-base font-semibold text-white">Trust Feedback</h3>
          <p className="text-xs text-slate-400">
            {memoryAction ? 'Rate Memory Action' : 'General Civic Trust'}
          </p>
        </div>
      </div>

      {/* Memory Action Context */}
      {memoryAction && (
        <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
          <div className="text-sm text-blue-400 font-medium mb-1">
            {memoryAction.action}: {memoryAction.value}
          </div>
          <div className="text-xs text-slate-500">
            {memoryAction.timestamp.toLocaleString()}
          </div>
        </div>
      )}

      {/* Vote Interface */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Trust Vote */}
          <button
            onClick={() => handleVote('trust')}
            disabled={isProcessing || zkpCommitted}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
              selectedVote === 'trust'
                ? 'bg-green-600/30 border-green-500/50 text-green-300'
                : 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600 text-slate-300 hover:text-white'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Cast trust vote"
          >
            <ThumbsUp className={`w-6 h-6 ${selectedVote === 'trust' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">Trust</span>
            <span className="text-xs text-slate-400">🔼 Builds Confidence</span>
          </button>

          {/* Concern Vote */}
          <button
            onClick={() => handleVote('concern')}
            disabled={isProcessing || zkpCommitted}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
              selectedVote === 'concern'
                ? 'bg-amber-600/30 border-amber-500/50 text-amber-300'
                : 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600 text-slate-300 hover:text-white'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Cast concern vote"
          >
            <ThumbsDown className={`w-6 h-6 ${selectedVote === 'concern' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">Concern</span>
            <span className="text-xs text-slate-400">🔽 Needs Review</span>
          </button>
        </div>

        {/* ZKP Status */}
        {zkpCommitted && (
          <div className="flex items-center gap-2 p-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              Vote committed with ZKP proof
            </span>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-xs text-slate-400">Generating ZKP commitment...</div>
          </div>
        )}

        {/* Reset Button */}
        {zkpCommitted && (
          <button
            onClick={resetVote}
            className="w-full py-2 px-3 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/30 text-slate-300 text-sm rounded transition-colors"
          >
            Cast New Vote
          </button>
        )}
      </div>

      {/* Vote Instructions */}
      <div className="mt-4 p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• Trust votes build civic confidence and unlock features</div>
        <div>• All votes are ZKP-secured and anonymized for audit trails</div>
      </div>
    </div>
  );
};

export default TrustVoteCard;