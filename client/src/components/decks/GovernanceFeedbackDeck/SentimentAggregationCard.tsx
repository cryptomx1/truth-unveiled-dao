import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Shield,
  Hash,
  CheckCircle,
  Clock,
  Smile,
  Frown,
  Meh,
  Users,
  Zap
} from 'lucide-react';

type SentimentType = 'positive' | 'neutral' | 'negative';
type ProposalSentiment = {
  proposalId: string;
  sentiment: SentimentType;
  confidence: number;
  feedbackCount: number;
  weightedScore: number;
  zkpHash: string;
  timestamp: Date;
};

type SentimentMetrics = {
  overallIndex: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  totalFeedback: number;
  dissentSurgeRate: number;
  volatilityIndex: number;
  isPushbackActive: boolean;
  lastUpdated: Date;
  proposals: ProposalSentiment[];
};

type WeightingSource = {
  source: string;
  weight: number;
  hash: string;
  isValidated: boolean;
};

interface SentimentAggregationCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Cross-deck hash pools for validation sync
const DECK_6_HASH_POOL = [
  'zkp_hash_tu0011_consensus_xyz001',
  'zkp_hash_tu0012_consensus_xyz002',
  'zkp_hash_tu0013_consensus_xyz003',
  'zkp_hash_tu0014_consensus_xyz004',
  'zkp_hash_tu0015_consensus_xyz005',
  'zkp_hash_tu0016_consensus_xyz006',
  'zkp_hash_tu0017_consensus_xyz007',
  'zkp_hash_tu0018_consensus_xyz008'
];

const DECK_9_VOTE_HASHES = [
  'zkp_vote_consensus_001',
  'zkp_vote_consensus_002',
  'zkp_vote_consensus_003',
  'zkp_vote_consensus_004',
  'zkp_vote_proposal_001',
  'zkp_vote_proposal_002',
  'zkp_vote_proposal_003',
  'zkp_vote_proposal_004'
];

// Weighting sources from VoteConsensusCard and ZKProposalLogCard
const WEIGHTING_SOURCES: WeightingSource[] = [
  {
    source: 'VoteConsensusCard',
    weight: 0.35,
    hash: 'zkp_vote_consensus_001',
    isValidated: true
  },
  {
    source: 'ZKProposalLogCard',
    weight: 0.25,
    hash: 'zkp_vote_proposal_001',
    isValidated: true
  },
  {
    source: 'DeliberationPanelCard',
    weight: 0.20,
    hash: 'zkp_hash_tu0015_consensus_xyz005',
    isValidated: true
  },
  {
    source: 'ZKPFeedbackNodeCard',
    weight: 0.20,
    hash: 'zkp_hash_tu0011_consensus_xyz001',
    isValidated: true
  }
];

// Mock sentiment aggregation data with dissent surge detection
const MOCK_SENTIMENT_METRICS: SentimentMetrics = {
  overallIndex: 74.2, // Weighted sentiment index
  positiveCount: 8,
  neutralCount: 3,
  negativeCount: 4,
  totalFeedback: 15,
  dissentSurgeRate: 18.5, // Below 20% threshold
  volatilityIndex: 16.8, // Below 20% threshold
  isPushbackActive: false, // Both rates below 20%
  lastUpdated: new Date(Date.now() - 120000), // 2 minutes ago
  proposals: [
    {
      proposalId: 'tu-prop-0004',
      sentiment: 'positive',
      confidence: 0.92,
      feedbackCount: 3,
      weightedScore: 86.4,
      zkpHash: 'zkp_hash_tu0011_consensus_xyz001',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      proposalId: 'tu-prop-0005',
      sentiment: 'neutral',
      confidence: 0.78,
      feedbackCount: 2,
      weightedScore: 62.3,
      zkpHash: 'zkp_hash_tu0012_consensus_xyz002',
      timestamp: new Date(Date.now() - 1500000)
    },
    {
      proposalId: 'tu-prop-0006',
      sentiment: 'negative',
      confidence: 0.85,
      feedbackCount: 2,
      weightedScore: 34.7,
      zkpHash: 'zkp_hash_tu0013_consensus_xyz003',
      timestamp: new Date(Date.now() - 1200000)
    },
    {
      proposalId: 'tu-prop-0007',
      sentiment: 'positive',
      confidence: 0.89,
      feedbackCount: 3,
      weightedScore: 82.1,
      zkpHash: 'zkp_hash_tu0014_consensus_xyz004',
      timestamp: new Date(Date.now() - 900000)
    },
    {
      proposalId: 'tu-prop-0008',
      sentiment: 'neutral',
      confidence: 0.71,
      feedbackCount: 1,
      weightedScore: 58.9,
      zkpHash: 'zkp_hash_tu0015_consensus_xyz005',
      timestamp: new Date(Date.now() - 600000)
    },
    {
      proposalId: 'tu-prop-0009',
      sentiment: 'positive',
      confidence: 0.93,
      feedbackCount: 2,
      weightedScore: 88.7,
      zkpHash: 'zkp_hash_tu0016_consensus_xyz006',
      timestamp: new Date(Date.now() - 480000)
    },
    {
      proposalId: 'tu-prop-0010',
      sentiment: 'positive',
      confidence: 0.87,
      feedbackCount: 2,
      weightedScore: 79.4,
      zkpHash: 'zkp_hash_tu0017_consensus_xyz007',
      timestamp: new Date(Date.now() - 420000)
    }
  ]
};

const getSentimentIcon = (sentiment: SentimentType) => {
  switch (sentiment) {
    case 'positive':
      return <Smile className="w-4 h-4 text-green-400" />;
    case 'neutral':
      return <Meh className="w-4 h-4 text-yellow-400" />;
    case 'negative':
      return <Frown className="w-4 h-4 text-red-400" />;
  }
};

const getSentimentColor = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case 'positive':
      return 'text-green-400';
    case 'neutral':
      return 'text-yellow-400';
    case 'negative':
      return 'text-red-400';
  }
};

const getSentimentBadgeColor = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'neutral':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'negative':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
};

const getIndexColor = (index: number): string => {
  if (index >= 80) return 'text-green-400';
  if (index >= 60) return 'text-yellow-400';
  if (index >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getIndexRing = (index: number): string => {
  if (index >= 80) return 'ring-2 ring-green-500/50 animate-pulse';
  if (index >= 60) return 'ring-2 ring-yellow-500/50 animate-pulse';
  if (index >= 40) return 'ring-2 ring-orange-500/50 animate-pulse';
  return 'ring-2 ring-red-500/50 animate-pulse';
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
};

const validateZKPHash = (hash: string): boolean => {
  return DECK_6_HASH_POOL.includes(hash) || DECK_9_VOTE_HASHES.includes(hash);
};

const calculateConfidenceLevel = (confidence: number): string => {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.7) return 'Medium';
  return 'Low';
};

export const SentimentAggregationCard: React.FC<SentimentAggregationCardProps> = ({ className }) => {
  const [sentimentMetrics, setSentimentMetrics] = useState<SentimentMetrics>(MOCK_SENTIMENT_METRICS);
  const [isUpdating, setIsUpdating] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`SentimentAggregationCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`SentimentAggregationCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play sentiment interface message on mount
          const message = `Sentiment analysis ready. Current index ${sentimentMetrics.overallIndex.toFixed(1)} percent.`;
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, [sentimentMetrics.overallIndex]);

  // Real-time sentiment updates
  useEffect(() => {
    const interval = setInterval(() => {
      const syncStart = performance.now();
      
      setSentimentMetrics(prev => {
        // Simulate minor fluctuations in sentiment metrics
        const newIndex = Math.max(0, Math.min(100, prev.overallIndex + (Math.random() - 0.5) * 3));
        const newVolatility = Math.max(0, Math.min(30, prev.volatilityIndex + (Math.random() - 0.5) * 2));
        const newDissentSurge = Math.max(0, Math.min(25, prev.dissentSurgeRate + (Math.random() - 0.5) * 1.5));
        
        // Check pushback conditions
        const isPushback = newVolatility > 20 || newDissentSurge > 20;
        
        const syncTime = performance.now() - syncStart;
        if (syncTime > 100) {
          console.warn(`Sentiment sync time: ${syncTime.toFixed(2)}ms (exceeds 100ms target)`);
        }
        
        return {
          ...prev,
          overallIndex: newIndex,
          volatilityIndex: newVolatility,
          dissentSurgeRate: newDissentSurge,
          isPushbackActive: isPushback,
          lastUpdated: new Date()
        };
      });
    }, 8000); // Update every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleRefreshSentiment = async () => {
    const validationStart = performance.now();
    setIsUpdating(true);
    
    // Simulate sentiment aggregation refresh
    setTimeout(() => {
      setSentimentMetrics(prev => ({
        ...prev,
        overallIndex: Math.max(0, Math.min(100, prev.overallIndex + (Math.random() - 0.5) * 5)),
        lastUpdated: new Date()
      }));
      
      setIsUpdating(false);
      
      const validationTime = performance.now() - validationStart;
      if (validationTime > 100) {
        console.warn(`Sentiment refresh time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
      
      // TTS refresh confirmation
      if (ttsStatus.isReady) {
        const utterance = new SpeechSynthesisUtterance(`Analysis updated. Current sentiment ${sentimentMetrics.overallIndex.toFixed(1)} percent.`);
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }, 1200);
  };

  const getOverallStatusRing = (): string => {
    if (sentimentMetrics.isPushbackActive) {
      return 'ring-2 ring-red-500/50 animate-pulse';
    }
    return getIndexRing(sentimentMetrics.overallIndex);
  };

  const getDissentSurgeColor = (): string => {
    if (sentimentMetrics.dissentSurgeRate > 20) return 'text-red-400';
    if (sentimentMetrics.dissentSurgeRate > 15) return 'text-orange-400';
    return 'text-green-400';
  };

  const getVolatilityColor = (): string => {
    if (sentimentMetrics.volatilityIndex > 20) return 'text-red-400';
    if (sentimentMetrics.volatilityIndex > 15) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        getOverallStatusRing(),
        className
      )}
      role="region"
      aria-label="Sentiment Aggregation Interface"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Sentiment Aggregation
          </CardTitle>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Live Mood
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Governance feedback sentiment analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Sentiment Index */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Sentiment Analysis
            </span>
          </div>
          
          <div className="text-center">
            <div className={cn('text-4xl font-bold mb-2', getIndexColor(sentimentMetrics.overallIndex))}>
              {sentimentMetrics.overallIndex.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mb-3">
              Weighted sentiment score from {sentimentMetrics.totalFeedback} feedback entries
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-500/20 rounded p-2">
                <div className="text-lg font-bold text-green-400">
                  {sentimentMetrics.positiveCount}
                </div>
                <div className="text-xs text-green-300">Positive</div>
              </div>
              <div className="bg-yellow-500/20 rounded p-2">
                <div className="text-lg font-bold text-yellow-400">
                  {sentimentMetrics.neutralCount}
                </div>
                <div className="text-xs text-yellow-300">Neutral</div>
              </div>
              <div className="bg-red-500/20 rounded p-2">
                <div className="text-lg font-bold text-red-400">
                  {sentimentMetrics.negativeCount}
                </div>
                <div className="text-xs text-red-300">Negative</div>
              </div>
            </div>
          </div>
        </div>

        {/* Volatility & Dissent Surge Detection */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-slate-200">
              Volatility Monitor
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Dissent Surge Rate:</span>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', getDissentSurgeColor())}>
                  {sentimentMetrics.dissentSurgeRate.toFixed(1)}%
                </span>
                {sentimentMetrics.dissentSurgeRate > 20 && (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Volatility Index:</span>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', getVolatilityColor())}>
                  {sentimentMetrics.volatilityIndex.toFixed(1)}%
                </span>
                {sentimentMetrics.volatilityIndex > 20 && (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                )}
              </div>
            </div>
            
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  sentimentMetrics.isPushbackActive ? 'bg-red-500' : 'bg-green-500'
                )}
                style={{ width: `${100 - Math.max(sentimentMetrics.dissentSurgeRate, sentimentMetrics.volatilityIndex)}%` }}
              />
            </div>
            
            {sentimentMetrics.isPushbackActive ? (
              <div className="p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
                ⚠️ Pushback: &gt;20% sentiment volatility detected
              </div>
            ) : (
              <div className="p-2 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                ✅ Sentiment stability within normal range
              </div>
            )}
          </div>
        </div>

        {/* Weighting Sources */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Weighting Sources
            </span>
          </div>
          
          <div className="space-y-2">
            {WEIGHTING_SOURCES.map((source, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-slate-300">{source.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{(source.weight * 100).toFixed(0)}%</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Synced
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proposal Sentiment Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-200">
              Proposal Sentiment ({sentimentMetrics.proposals.length})
            </label>
            <Button
              onClick={handleRefreshSentiment}
              disabled={isUpdating}
              size="sm"
              className={cn(
                'min-h-[32px] text-xs',
                'bg-blue-600/80 hover:bg-blue-700 text-white',
                'disabled:bg-slate-700/50 disabled:text-slate-500'
              )}
            >
              {isUpdating ? (
                <>
                  <Clock className="w-3 h-3 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          
          <ScrollArea className="h-48 rounded-lg border border-slate-700/50 bg-slate-800/30" aria-live="polite">
            <div className="p-3 space-y-2">
              {sentimentMetrics.proposals.map((proposal) => (
                <div
                  key={proposal.proposalId}
                  className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(proposal.sentiment)}
                      <span className="text-xs font-mono text-slate-300">
                        {proposal.proposalId}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', getSentimentBadgeColor(proposal.sentiment))}
                    >
                      {proposal.sentiment.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">Weighted Score:</div>
                      <div className={cn('font-medium', getSentimentColor(proposal.sentiment))}>
                        {proposal.weightedScore.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Confidence:</div>
                      <div className="text-slate-300">
                        {calculateConfidenceLevel(proposal.confidence)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{proposal.feedbackCount} feedback</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono truncate max-w-[80px]">
                        {proposal.zkpHash}
                      </span>
                      {validateZKPHash(proposal.zkpHash) && (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 mt-1">
                    {formatTimeAgo(proposal.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cross-Deck Sync Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Sync
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">ZKPFeedbackNodeCard:</span>
              <span className="text-green-400">Aggregated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VoteConsensusCard:</span>
              <span className="text-green-400">Weighted</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ZKProposalLogCard:</span>
              <span className="text-green-400">Validated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-slate-300">{formatTimeAgo(sentimentMetrics.lastUpdated)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Real-time governance sentiment aggregation with volatility detection
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default SentimentAggregationCard;
