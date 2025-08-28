import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Target, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Users,
  FileText,
  Clock
} from 'lucide-react';

type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
type PolicyStatus = 'stable' | 'revision_likely' | 'escalating' | 'emergency';
type SentimentTrend = 'positive' | 'neutral' | 'negative' | 'volatile';

interface FeedbackImpactData {
  impactScore: number; // 0-100
  impactLevel: ImpactLevel;
  policyStatus: PolicyStatus;
  sentimentTrend: SentimentTrend;
  votePassRate: number;
  dissentLevel: number;
  consensusAlignment: number;
  policyRevisionProbability: number;
  lastUpdated: Date;
}

interface CrossDeckInputs {
  zkpFeedbackSentiment: {
    approve: number;
    dissent: number;
    amend: number;
    abstain: number;
  };
  sentimentMoodIndex: number;
  voteConsensusData: {
    passRate: number;
    supportPercentage: number;
    totalVotes: number;
  };
}

interface FeedbackImpactAnalyzerCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock cross-deck inputs simulating real data from other components
const MOCK_CROSS_DECK_INPUTS: CrossDeckInputs = {
  zkpFeedbackSentiment: {
    approve: 8, // From ZKPFeedbackNodeCard
    dissent: 4,
    amend: 2,
    abstain: 1
  },
  sentimentMoodIndex: 74.2, // From SentimentAggregationCard
  voteConsensusData: {
    passRate: 68.5, // From VoteConsensusCard (Deck #9)
    supportPercentage: 71.2,
    totalVotes: 247
  }
};

// Calculate impact score based on cross-deck sentiment and voting data
const calculateImpactScore = (inputs: CrossDeckInputs): FeedbackImpactData => {
  const { zkpFeedbackSentiment, sentimentMoodIndex, voteConsensusData } = inputs;
  
  const totalFeedback = Object.values(zkpFeedbackSentiment).reduce((sum, count) => sum + count, 0);
  const dissentRatio = zkpFeedbackSentiment.dissent / totalFeedback;
  const approveRatio = zkpFeedbackSentiment.approve / totalFeedback;
  const amendRatio = zkpFeedbackSentiment.amend / totalFeedback;
  
  // Impact calculation factors
  const sentimentWeight = sentimentMoodIndex / 100; // 0-1
  const passRateWeight = voteConsensusData.passRate / 100; // 0-1
  const dissentWeight = dissentRatio * 100; // 0-100
  const consensusWeight = voteConsensusData.supportPercentage / 100; // 0-1
  
  // Complex impact formula considering multiple factors
  const baseImpact = (dissentWeight * 0.4) + ((1 - sentimentWeight) * 30) + ((1 - passRateWeight) * 20) + (amendRatio * 100 * 0.1);
  const impactScore = Math.min(100, Math.max(0, baseImpact));
  
  // Determine impact level
  let impactLevel: ImpactLevel;
  if (impactScore >= 80) impactLevel = 'critical';
  else if (impactScore >= 60) impactLevel = 'high';
  else if (impactScore >= 35) impactLevel = 'medium';
  else impactLevel = 'low';
  
  // Determine policy status
  let policyStatus: PolicyStatus;
  if (impactScore >= 75 && dissentWeight > 25) policyStatus = 'emergency';
  else if (impactScore >= 60) policyStatus = 'escalating';
  else if (impactScore >= 40 || amendRatio > 0.15) policyStatus = 'revision_likely';
  else policyStatus = 'stable';
  
  // Determine sentiment trend
  let sentimentTrend: SentimentTrend;
  if (approveRatio > 0.6) sentimentTrend = 'positive';
  else if (dissentRatio > 0.3) sentimentTrend = 'negative';
  else if (amendRatio > 0.2) sentimentTrend = 'volatile';
  else sentimentTrend = 'neutral';
  
  return {
    impactScore: Math.round(impactScore * 10) / 10,
    impactLevel,
    policyStatus,
    sentimentTrend,
    votePassRate: voteConsensusData.passRate,
    dissentLevel: dissentWeight,
    consensusAlignment: consensusWeight * 100,
    policyRevisionProbability: Math.min(100, impactScore * 0.8 + (amendRatio * 100 * 0.2)),
    lastUpdated: new Date()
  };
};

const getImpactColor = (level: ImpactLevel): string => {
  switch (level) {
    case 'low':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-orange-400';
    case 'critical':
      return 'text-red-400';
  }
};

const getImpactBadgeColor = (level: ImpactLevel): string => {
  switch (level) {
    case 'low':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
};

const getPolicyStatusColor = (status: PolicyStatus): string => {
  switch (status) {
    case 'stable':
      return 'text-green-400';
    case 'revision_likely':
      return 'text-yellow-400';
    case 'escalating':
      return 'text-orange-400';
    case 'emergency':
      return 'text-red-400';
  }
};

const getPolicyStatusIcon = (status: PolicyStatus) => {
  switch (status) {
    case 'stable':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'revision_likely':
      return <FileText className="w-4 h-4 text-yellow-400" />;
    case 'escalating':
      return <TrendingUp className="w-4 h-4 text-orange-400" />;
    case 'emergency':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
  }
};

const getSentimentTrendIcon = (trend: SentimentTrend) => {
  switch (trend) {
    case 'positive':
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    case 'neutral':
      return <Activity className="w-4 h-4 text-slate-400" />;
    case 'negative':
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    case 'volatile':
      return <Zap className="w-4 h-4 text-orange-400" />;
  }
};

const getStatusRing = (policyStatus: PolicyStatus): string => {
  switch (policyStatus) {
    case 'stable':
      return 'ring-2 ring-green-500/50 animate-pulse';
    case 'revision_likely':
      return 'ring-2 ring-yellow-500/50 animate-pulse';
    case 'escalating':
      return 'ring-2 ring-orange-500/50 animate-pulse';
    case 'emergency':
      return 'ring-2 ring-red-500/50 animate-pulse';
  }
};

const formatPolicyStatus = (status: PolicyStatus): string => {
  switch (status) {
    case 'stable':
      return 'Stable';
    case 'revision_likely':
      return 'Revision Likely';
    case 'escalating':
      return 'Escalating';
    case 'emergency':
      return 'Emergency';
  }
};

const formatSentimentTrend = (trend: SentimentTrend): string => {
  return trend.charAt(0).toUpperCase() + trend.slice(1);
};

const getImpactMessage = (data: FeedbackImpactData): string => {
  const { impactLevel, policyStatus, impactScore } = data;
  
  if (impactLevel === 'critical') {
    return `Critical Impact: ${policyStatus === 'emergency' ? 'Immediate policy intervention required' : 'Significant policy revision needed'}`;
  } else if (impactLevel === 'high') {
    return `High Impact: ${policyStatus === 'escalating' ? 'Policy revision likely' : 'Enhanced monitoring recommended'}`;
  } else if (impactLevel === 'medium') {
    return `Medium Impact: ${policyStatus === 'revision_likely' ? 'Policy adjustments may be needed' : 'Continued observation advised'}`;
  } else {
    return `Low Impact: Policy measures ${policyStatus === 'stable' ? 'maintaining effectiveness' : 'showing positive trends'}`;
  }
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

export const FeedbackImpactAnalyzerCard: React.FC<FeedbackImpactAnalyzerCardProps> = ({ className }) => {
  const [crossDeckInputs, setCrossDeckInputs] = useState<CrossDeckInputs>(MOCK_CROSS_DECK_INPUTS);
  const [impactData, setImpactData] = useState<FeedbackImpactData>(() => calculateImpactScore(MOCK_CROSS_DECK_INPUTS));
  const [isUpdating, setIsUpdating] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`FeedbackImpactAnalyzerCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`FeedbackImpactAnalyzerCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play feedback impact analyzer ready message on mount
          const message = "Feedback impact analyzer ready.";
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
  }, []);

  // Real-time cross-deck data sync and impact recalculation
  useEffect(() => {
    const interval = setInterval(() => {
      const syncStart = performance.now();
      
      setCrossDeckInputs(prev => {
        // Simulate minor fluctuations in cross-deck data
        const newSentimentIndex = Math.max(0, Math.min(100, prev.sentimentMoodIndex + (Math.random() - 0.5) * 2));
        const newPassRate = Math.max(0, Math.min(100, prev.voteConsensusData.passRate + (Math.random() - 0.5) * 1.5));
        const newSupport = Math.max(0, Math.min(100, prev.voteConsensusData.supportPercentage + (Math.random() - 0.5) * 1));
        
        const updatedInputs = {
          ...prev,
          sentimentMoodIndex: newSentimentIndex,
          voteConsensusData: {
            ...prev.voteConsensusData,
            passRate: newPassRate,
            supportPercentage: newSupport
          }
        };
        
        // Recalculate impact data
        const newImpactData = calculateImpactScore(updatedInputs);
        setImpactData(newImpactData);
        
        const syncTime = performance.now() - syncStart;
        if (syncTime > 100) {
          console.warn(`Impact sync time: ${syncTime.toFixed(2)}ms (exceeds 100ms target)`);
        }
        
        return updatedInputs;
      });
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleRefreshAnalysis = async () => {
    const validationStart = performance.now();
    setIsUpdating(true);
    
    // Simulate impact analysis refresh
    setTimeout(() => {
      const newImpactData = calculateImpactScore(crossDeckInputs);
      setImpactData(newImpactData);
      setIsUpdating(false);
      
      const validationTime = performance.now() - validationStart;
      if (validationTime > 100) {
        console.warn(`Impact refresh time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
      
      // TTS impact update announcement
      if (ttsStatus.isReady) {
        const utterance = new SpeechSynthesisUtterance(
          `Impact analysis shows ${newImpactData.impactScore.toFixed(1)} percent policy effect.`
        );
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }, 1500);
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        getStatusRing(impactData.policyStatus),
        className
      )}
      role="region"
      aria-label="Feedback Impact Analyzer Interface"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Feedback Impact Analyzer
          </CardTitle>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Live Analysis
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Policy impact assessment from citizen sentiment
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Impact Score Display */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Policy Impact Score
            </span>
          </div>
          
          <div className="text-center">
            <div className={cn('text-4xl font-bold mb-2', getImpactColor(impactData.impactLevel))}>
              {impactData.impactScore.toFixed(1)}
            </div>
            <Badge 
              variant="outline" 
              className={cn('mb-3', getImpactBadgeColor(impactData.impactLevel))}
            >
              {impactData.impactLevel.toUpperCase()} IMPACT
            </Badge>
            
            <div className="w-full bg-slate-700/50 rounded-full h-3 mb-3">
              <div 
                className={cn(
                  'h-3 rounded-full transition-all duration-500',
                  impactData.impactLevel === 'critical' ? 'bg-red-500' :
                  impactData.impactLevel === 'high' ? 'bg-orange-500' :
                  impactData.impactLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${impactData.impactScore}%` }}
              />
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {getImpactMessage(impactData)}
            </p>
          </div>
        </div>

        {/* Cross-Deck Input Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Inputs
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">ZKP Feedback Node:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">
                  {Object.values(crossDeckInputs.zkpFeedbackSentiment).reduce((sum, count) => sum + count, 0)} entries
                </span>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Synced
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Sentiment Aggregation:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">
                  {crossDeckInputs.sentimentMoodIndex.toFixed(1)}% mood
                </span>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Vote Consensus:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">
                  {crossDeckInputs.voteConsensusData.passRate.toFixed(1)}% pass rate
                </span>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Status & Sentiment Trend */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              {getPolicyStatusIcon(impactData.policyStatus)}
              <span className="text-xs font-medium text-slate-200">
                Policy Status
              </span>
            </div>
            <div className={cn('text-sm font-medium', getPolicyStatusColor(impactData.policyStatus))}>
              {formatPolicyStatus(impactData.policyStatus)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {impactData.policyRevisionProbability.toFixed(1)}% revision probability
            </div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              {getSentimentTrendIcon(impactData.sentimentTrend)}
              <span className="text-xs font-medium text-slate-200">
                Sentiment Trend
              </span>
            </div>
            <div className="text-sm font-medium text-slate-300">
              {formatSentimentTrend(impactData.sentimentTrend)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {impactData.dissentLevel.toFixed(1)}% dissent level
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Detailed Metrics
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Vote Pass Rate:</span>
                <span className="text-slate-300">{impactData.votePassRate.toFixed(1)}%</span>
              </div>
              <Progress 
                value={impactData.votePassRate} 
                className="h-2 bg-slate-700/50"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Consensus Alignment:</span>
                <span className="text-slate-300">{impactData.consensusAlignment.toFixed(1)}%</span>
              </div>
              <Progress 
                value={impactData.consensusAlignment} 
                className="h-2 bg-slate-700/50"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Dissent Level:</span>
                <span className="text-slate-300">{impactData.dissentLevel.toFixed(1)}%</span>
              </div>
              <Progress 
                value={impactData.dissentLevel} 
                className="h-2 bg-slate-700/50"
              />
            </div>
          </div>
        </div>

        {/* Refresh Analysis */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Last updated: {formatTimeAgo(impactData.lastUpdated)}
          </span>
          <Button
            onClick={handleRefreshAnalysis}
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
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-3 h-3 mr-1" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50" aria-live="polite">
          <p className="text-xs text-slate-400">
            Real-time policy impact analysis from citizen feedback trends
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default FeedbackImpactAnalyzerCard;
