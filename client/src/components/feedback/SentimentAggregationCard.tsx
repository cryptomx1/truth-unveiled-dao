import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Users, User, RotateCcw } from 'lucide-react';
import { useZKPFeedbackNode } from './ZKPFeedbackNode';

interface SentimentData {
  trustPercentage: number;
  concernPercentage: number;
  totalVotes: number;
  quorumMet: boolean;
  deckName: string;
}

interface SentimentAggregationCardProps {
  deckId?: string;
  deckName?: string;
}

export const SentimentAggregationCard: React.FC<SentimentAggregationCardProps> = ({
  deckId = 'general',
  deckName = 'General Civic Trust'
}) => {
  const [viewMode, setViewMode] = useState<'constituent' | 'consensus'>('constituent');
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    trustPercentage: 0,
    concernPercentage: 0,
    totalVotes: 0,
    quorumMet: false,
    deckName
  });
  const [dialAngle, setDialAngle] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { getVaultStats } = useZKPFeedbackNode();

  // Nuclear TTS override system
  useEffect(() => {
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

  // Load sentiment data
  useEffect(() => {
    const loadSentimentData = () => {
      const stats = getVaultStats();
      
      // Mock consensus data for demonstration (in real app would come from network)
      const consensusMultiplier = viewMode === 'consensus' ? 2.3 : 1;
      const totalVotes = Math.floor(stats.totalEntries * consensusMultiplier);
      const trustVotes = Math.floor(stats.trustVotes * consensusMultiplier);
      const concernVotes = totalVotes - trustVotes;
      
      const trustPercentage = totalVotes > 0 ? (trustVotes / totalVotes) * 100 : 0;
      const concernPercentage = totalVotes > 0 ? (concernVotes / totalVotes) * 100 : 0;
      const quorumMet = totalVotes >= 5; // Minimum 5 votes for consensus

      setSentimentData({
        trustPercentage,
        concernPercentage,
        totalVotes,
        quorumMet,
        deckName
      });

      // Calculate dial angle (-90 to +90 degrees, where 0 is neutral)
      const netSentiment = trustPercentage - concernPercentage;
      const angle = (netSentiment / 100) * 90; // Scale to dial range
      setDialAngle(Math.max(-90, Math.min(90, angle)));
    };

    loadSentimentData();
    
    // Update every 10 seconds to simulate live data
    const interval = setInterval(loadSentimentData, 10000);
    return () => clearInterval(interval);
  }, [viewMode, getVaultStats]);

  const getSentimentColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-400';
    if (percentage >= 50) return 'text-blue-400';
    if (percentage >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDominantSentiment = () => {
    if (sentimentData.trustPercentage > sentimentData.concernPercentage) {
      return { type: 'trust', percentage: sentimentData.trustPercentage, color: 'text-green-400' };
    } else if (sentimentData.concernPercentage > sentimentData.trustPercentage) {
      return { type: 'concern', percentage: sentimentData.concernPercentage, color: 'text-amber-400' };
    } else {
      return { type: 'neutral', percentage: 50, color: 'text-slate-400' };
    }
  };

  const dominant = getDominantSentiment();

  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-base font-semibold text-white">Sentiment Aggregation</h3>
          <p className="text-xs text-slate-400">{sentimentData.deckName}</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-4 flex bg-slate-700/30 rounded-lg p-1">
        <button
          onClick={() => setViewMode('constituent')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs transition-colors ${
            viewMode === 'constituent'
              ? 'bg-blue-600/30 border border-blue-500/30 text-blue-300'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <User className="w-3 h-3" />
          Constituent View
        </button>
        <button
          onClick={() => setViewMode('consensus')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs transition-colors ${
            viewMode === 'consensus'
              ? 'bg-purple-600/30 border border-purple-500/30 text-purple-300'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Users className="w-3 h-3" />
          Consensus View
        </button>
      </div>

      {/* Animated Dial */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-32 h-16">
          {/* Dial Background */}
          <svg className="w-32 h-16" viewBox="0 0 128 64">
            {/* Background Arc */}
            <path
              d="M 16 48 A 48 48 0 0 1 112 48"
              fill="none"
              stroke="rgb(51 65 85)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            
            {/* Trust Arc (Right Side) */}
            <path
              d="M 64 16 A 48 48 0 0 1 112 48"
              fill="none"
              stroke="rgb(34 197 94)"
              strokeWidth="4"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />
            
            {/* Concern Arc (Left Side) */}
            <path
              d="M 16 48 A 48 48 0 0 1 64 16"
              fill="none"
              stroke="rgb(245 158 11)"
              strokeWidth="4"
              strokeOpacity="0.3"
              strokeLinecap="round"
            />
            
            {/* Dial Needle */}
            <g transform={`rotate(${dialAngle} 64 48)`}>
              <line
                x1="64"
                y1="48"
                x2="64"
                y2="24"
                stroke={dominant.color.replace('text-', '').replace('-400', '') === 'green' ? '#22c55e' : 
                       dominant.color.replace('text-', '').replace('-400', '') === 'amber' ? '#f59e0b' : '#94a3b8'}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="64"
                cy="48"
                r="4"
                fill={dominant.color.replace('text-', '').replace('-400', '') === 'green' ? '#22c55e' : 
                     dominant.color.replace('text-', '').replace('-400', '') === 'amber' ? '#f59e0b' : '#94a3b8'}
              />
            </g>
          </svg>
          
          {/* Dial Labels */}
          <div className="absolute left-0 bottom-0 text-xs text-amber-400">
            Concern
          </div>
          <div className="absolute right-0 bottom-0 text-xs text-green-400">
            Trust
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 text-xs text-slate-400">
            Neutral
          </div>
        </div>
      </div>

      {/* Sentiment Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Trust Level</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${sentimentData.trustPercentage}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${getSentimentColor(sentimentData.trustPercentage)}`}>
              {sentimentData.trustPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Concern Level</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${sentimentData.concernPercentage}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${getSentimentColor(100 - sentimentData.concernPercentage)}`}>
              {sentimentData.concernPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Quorum Status */}
      <div className={`mb-4 p-2 rounded-lg border ${
        sentimentData.quorumMet
          ? 'bg-green-600/20 border-green-500/30'
          : 'bg-yellow-600/20 border-yellow-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">
            {viewMode === 'consensus' ? 'Consensus Status' : 'Response Count'}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${
              sentimentData.quorumMet ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {sentimentData.totalVotes} votes
            </span>
            {sentimentData.quorumMet && viewMode === 'consensus' && (
              <span className="text-xs text-green-400">✓ Quorum Met</span>
            )}
          </div>
        </div>
      </div>

      {/* Dominant Sentiment */}
      <div className="text-center">
        <div className={`text-lg font-semibold ${dominant.color} mb-1`}>
          {dominant.type === 'trust' ? '🔼 High Trust' : 
           dominant.type === 'concern' ? '🔽 Needs Review' : '⚖️ Neutral'}
        </div>
        <div className="text-xs text-slate-400">
          {viewMode === 'consensus' && sentimentData.quorumMet
            ? 'Community consensus achieved'
            : viewMode === 'consensus'
            ? 'Awaiting community input'
            : 'Your civic sentiment contribution'
          }
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={() => window.location.reload()}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/30 text-slate-300 text-sm rounded transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Refresh Sentiment
      </button>
    </div>
  );
};

export default SentimentAggregationCard;