import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Vote, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';

type VoteStatus = 'active' | 'pending' | 'completed' | 'failed';
type ConsensusOutcome = 'pass' | 'fail' | 'pending' | 'disputed';

interface VoteConsensusData {
  proposalId: string;
  proposalTitle: string;
  totalVotes: number;
  supportVotes: number;
  rejectVotes: number;
  consensusThreshold: number;
  currentConsensus: number;
  outcome: ConsensusOutcome;
  status: VoteStatus;
  zkpHashes: string[];
  hashMismatchRate: number;
  lastUpdated: Date;
  timeRemaining: number;
}

interface VoteConsensusCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// ZKP hashes from Deck #6 vote entries for sync validation
const DECK_6_VOTE_HASHES = [
  'zkp_7d5b249a8c3f1e6b...a4d8e2f9c5b3a7e1',
  'zkp_3c7d195a2b4e8f9c...e8f4b6d1a9c2e5f7',
  'zkp_2a4c683f9b7d1e5a...e9b2c7f4a6d8e1c3',
  'zkp_9f3e572b8d6a4c1f...a6d4b8e2c9f7a3e5',
  'zkp_1b8c496d7a3f2e9b...c2f7a9e4b6d1c8a3',
  'zkp_5e2a738f4b9c6d1e...b9c6d4a7e2f8c5a9',
  'zkp_4e91a7b2c5f8d3a6...c8f3a2e9b7d4c1f6',
  'zkp_8c2f914e6a3b7d5c...b7d5a1f4c8e2a9d3'
];

// Mock vote consensus data with ZKP sync
const MOCK_VOTE_CONSENSUS: VoteConsensusData = {
  proposalId: 'prop_civic_001',
  proposalTitle: 'Civic Engagement Incentive Program',
  totalVotes: 147,
  supportVotes: 89,
  rejectVotes: 58,
  consensusThreshold: 75,
  currentConsensus: 60.5,
  outcome: 'pending',
  status: 'active',
  zkpHashes: DECK_6_VOTE_HASHES.slice(0, 6),
  hashMismatchRate: 8.2,
  lastUpdated: new Date(),
  timeRemaining: 3600 // 1 hour in seconds
};

const getOutcomeColor = (outcome: ConsensusOutcome): string => {
  switch (outcome) {
    case 'pass':
      return 'text-green-400';
    case 'fail':
      return 'text-red-400';
    case 'disputed':
      return 'text-orange-400';
    default:
      return 'text-yellow-400';
  }
};

const getOutcomeIcon = (outcome: ConsensusOutcome) => {
  switch (outcome) {
    case 'pass':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'fail':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'disputed':
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    default:
      return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
  }
};

const getStatusColor = (status: VoteStatus): string => {
  switch (status) {
    case 'active':
      return 'text-green-400';
    case 'pending':
      return 'text-yellow-400';
    case 'completed':
      return 'text-blue-400';
    case 'failed':
      return 'text-red-400';
  }
};

const getStatusRing = (status: VoteStatus, hashMismatchRate: number): string => {
  if (hashMismatchRate >= 20) {
    return 'ring-2 ring-red-500/50 animate-pulse';
  }
  
  switch (status) {
    case 'active':
      return 'ring-2 ring-green-500/50 animate-pulse';
    case 'pending':
      return 'ring-2 ring-yellow-500/50 animate-pulse';
    case 'completed':
      return 'ring-2 ring-blue-500/50';
    case 'failed':
      return 'ring-2 ring-red-500/50';
  }
};

const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const getConsensusProgressColor = (consensus: number, threshold: number): string => {
  if (consensus >= threshold) {
    return 'bg-green-500';
  } else if (consensus >= threshold * 0.8) {
    return 'bg-yellow-500';
  } else {
    return 'bg-red-500';
  }
};

const validateZKPSync = (voteHashes: string[]): number => {
  const matchedHashes = voteHashes.filter(hash => 
    DECK_6_VOTE_HASHES.some(deckHash => deckHash.includes(hash.substring(0, 16)))
  );
  
  return voteHashes.length > 0 ? ((voteHashes.length - matchedHashes.length) / voteHashes.length) * 100 : 0;
};

export const VoteConsensusCard: React.FC<VoteConsensusCardProps> = ({ className }) => {
  const [consensusData, setConsensusData] = useState<VoteConsensusData>(MOCK_VOTE_CONSENSUS);
  const [isAggregating, setIsAggregating] = useState(false);
  const [isPushbackActive, setIsPushbackActive] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`VoteConsensusCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`VoteConsensusCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play vote consensus interface ready message on mount
          const utterance = new SpeechSynthesisUtterance("Vote consensus interface ready. Monitoring civic proposal voting progress.");
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
  }, []);

  // Live consensus updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const updateStart = performance.now();
      
      setConsensusData(prev => {
        const newData = { ...prev };
        
        // Simulate vote changes
        if (prev.status === 'active' && prev.timeRemaining > 0) {
          // Random vote additions
          const newVotes = Math.floor(Math.random() * 3);
          const supportRatio = Math.random() > 0.4 ? 0.6 : 0.4;
          const newSupport = Math.floor(newVotes * supportRatio);
          const newReject = newVotes - newSupport;
          
          newData.totalVotes += newVotes;
          newData.supportVotes += newSupport;
          newData.rejectVotes += newReject;
          
          // Recalculate consensus
          newData.currentConsensus = (newData.supportVotes / newData.totalVotes) * 100;
          
          // Update ZKP hash mismatch rate
          newData.hashMismatchRate = validateZKPSync(newData.zkpHashes);
          
          // Check for pushback condition
          if (newData.hashMismatchRate >= 20 && !isPushbackActive) {
            setIsPushbackActive(true);
            console.warn(`ZKP Hash mismatch rate: ${newData.hashMismatchRate.toFixed(1)}% (triggers pushback)`);
          }
          
          // Update time remaining
          newData.timeRemaining = Math.max(0, prev.timeRemaining - 1);
          
          // Determine outcome
          if (newData.currentConsensus >= newData.consensusThreshold) {
            newData.outcome = 'pass';
          } else if (newData.timeRemaining === 0) {
            newData.outcome = 'fail';
            newData.status = 'completed';
          } else if (newData.hashMismatchRate >= 20) {
            newData.outcome = 'disputed';
          } else {
            newData.outcome = 'pending';
          }
          
          newData.lastUpdated = new Date();
        }
        
        return newData;
      });
      
      const updateTime = performance.now() - updateStart;
      if (updateTime > 100) {
        console.warn(`Consensus update time: ${updateTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
    }, 1000); // Update every second

    return () => clearInterval(updateInterval);
  }, [isPushbackActive]);

  const playConsensusUpdateTTS = (outcome: ConsensusOutcome) => {
    if (!ttsStatus.isReady) return;
    
    let message = '';
    switch (outcome) {
      case 'pass':
        message = 'Consensus achieved. Proposal passed with majority support.';
        break;
      case 'fail':
        message = 'Consensus failed. Proposal rejected due to insufficient support.';
        break;
      case 'disputed':
        message = 'Consensus disputed. ZKP hash mismatch detected requiring review.';
        break;
      default:
        message = `Current consensus: ${consensusData.currentConsensus.toFixed(1)} percent.`;
    }
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleAggregateVotes = async () => {
    const aggregationStart = performance.now();
    
    setIsAggregating(true);
    
    // Simulate aggregation process
    setTimeout(() => {
      setConsensusData(prev => ({
        ...prev,
        lastUpdated: new Date(),
        hashMismatchRate: validateZKPSync(prev.zkpHashes)
      }));
      
      setIsAggregating(false);
      
      const aggregationTime = performance.now() - aggregationStart;
      if (aggregationTime > 100) {
        console.warn(`Vote aggregation time: ${aggregationTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
      
      playConsensusUpdateTTS(consensusData.outcome);
    }, 1500);
  };

  const supportPercentage = (consensusData.supportVotes / consensusData.totalVotes) * 100;
  const rejectPercentage = (consensusData.rejectVotes / consensusData.totalVotes) * 100;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        getStatusRing(consensusData.status, consensusData.hashMismatchRate),
        className
      )}
      role="region"
      aria-label="Vote Consensus Monitor"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Vote className="w-5 h-5 text-blue-400" />
            Vote Consensus
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Real-time civic proposal consensus monitoring
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Proposal Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Active Proposal
            </span>
            {getOutcomeIcon(consensusData.outcome)}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-slate-300 font-medium">
              {consensusData.proposalTitle}
            </div>
            <div className="text-xs text-slate-400">
              ID: {consensusData.proposalId}
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Status:</span>
              <span className={getStatusColor(consensusData.status)}>
                {consensusData.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Time Remaining:</span>
              <span className="text-slate-300">
                {formatTimeRemaining(consensusData.timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Consensus Progress */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Consensus Progress
            </span>
            <button
              onClick={() => playConsensusUpdateTTS(consensusData.outcome)}
              disabled={ttsStatus.isPlaying}
              className="ml-auto text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Play consensus status"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                Current: {consensusData.currentConsensus.toFixed(1)}%
              </span>
              <span className="text-sm text-slate-400">
                Target: {consensusData.consensusThreshold}%
              </span>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={consensusData.currentConsensus} 
                className="h-3"
                aria-label={`Consensus progress: ${consensusData.currentConsensus.toFixed(1)}%`}
              />
              
              <div className="flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span className="text-yellow-400">Target: {consensusData.consensusThreshold}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vote Breakdown */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Vote Breakdown
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-slate-200">{consensusData.totalVotes}</div>
              <div className="text-xs text-slate-400">Total Votes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{consensusData.supportVotes}</div>
              <div className="text-xs text-slate-400">Support</div>
              <div className="text-xs text-green-400">{supportPercentage.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">{consensusData.rejectVotes}</div>
              <div className="text-xs text-slate-400">Reject</div>
              <div className="text-xs text-red-400">{rejectPercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* ZKP Hash Validation */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              ZKP Hash Validation
            </span>
            {isPushbackActive && (
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Sync Rate:</span>
              <span className={consensusData.hashMismatchRate >= 20 ? 'text-red-400' : 'text-green-400'}>
                {(100 - consensusData.hashMismatchRate).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Mismatch Rate:</span>
              <span className={consensusData.hashMismatchRate >= 20 ? 'text-red-400' : 'text-green-400'}>
                {consensusData.hashMismatchRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Verified Hashes:</span>
              <span className="text-slate-300">{consensusData.zkpHashes.length}</span>
            </div>
            
            {isPushbackActive && (
              <div className="mt-2 p-2 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-400">
                ⚠️ Pushback triggered: Hash mismatch ≥20%
              </div>
            )}
          </div>
        </div>

        {/* ZKP Hash List */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Verified ZKP Hashes ({consensusData.zkpHashes.length})
          </label>
          
          <ScrollArea className="h-32 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="p-3 space-y-2">
              {consensusData.zkpHashes.map((hash, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-700/50"
                >
                  <span className="text-xs font-mono text-slate-300 truncate">
                    {hash}
                  </span>
                  <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Aggregate Control */}
        <div className="space-y-3">
          <Button
            onClick={handleAggregateVotes}
            disabled={isAggregating || consensusData.status !== 'active'}
            className={cn(
              'w-full min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Aggregate votes"
          >
            {isAggregating ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Aggregating...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Aggregate Votes
              </>
            )}
          </Button>
        </div>

        {/* Consensus Outcome */}
        {consensusData.outcome !== 'pending' && (
          <div 
            className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
            aria-live="polite"
            aria-label="Consensus outcome"
          >
            <div className="flex items-center gap-2 mb-2">
              {getOutcomeIcon(consensusData.outcome)}
              <span className={cn('text-sm font-medium', getOutcomeColor(consensusData.outcome))}>
                {consensusData.outcome.toUpperCase()}
              </span>
            </div>
            
            <div className="text-xs text-slate-400">
              {consensusData.outcome === 'pass' && 'Proposal has achieved consensus and will be implemented.'}
              {consensusData.outcome === 'fail' && 'Proposal failed to achieve consensus and is rejected.'}
              {consensusData.outcome === 'disputed' && 'Consensus disputed due to ZKP hash validation issues.'}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Civic proposal consensus monitoring system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default VoteConsensusCard;
