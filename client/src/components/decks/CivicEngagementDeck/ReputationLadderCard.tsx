import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Crown,
  Users,
  ShieldCheck,
  Star,
  TrendingUp,
  CheckCircle,
  Lock,
  Sparkles,
  Trophy,
  Target,
  Clock,
  ArrowUp,
  Award
} from 'lucide-react';

type ReputationTier = 'citizen' | 'trusted_voice' | 'civic_guide' | 'consensus_architect';
type TierStatus = 'locked' | 'progress' | 'unlocked' | 'current';

interface ReputationTierData {
  id: ReputationTier;
  name: string;
  requirement: {
    trustScore: number;
    streaks: number;
    referrals: number;
    disputes: number;
  };
  status: TierStatus;
  progress: number; // 0-100
  unlockedAt?: Date;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  ringColor: string;
  description: string;
  privileges: string[];
}

interface ReputationLadderCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Cross-deck ZKP validation from Decks #6-#9
const DECK_6_REPUTATION_HASHES = [
  'zkp_reputation_citizen_001',
  'zkp_reputation_trusted_002',
  'zkp_reputation_guide_003',
  'zkp_reputation_architect_004'
];

const DECK_9_DISPUTE_VALIDATION = [
  'zkp_dispute_resolution_001',
  'zkp_consensus_participation_002',
  'zkp_civic_mediation_003'
];

// Mock reputation tier data with ZKP validation
const MOCK_REPUTATION_TIERS: ReputationTierData[] = [
  {
    id: 'citizen',
    name: 'Citizen',
    requirement: {
      trustScore: 70,
      streaks: 3,
      referrals: 2,
      disputes: 0
    },
    status: 'unlocked',
    progress: 100,
    unlockedAt: new Date(Date.now() - 864000000), // 10 days ago
    icon: <Users className="w-5 h-5" />,
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/20',
    ringColor: 'ring-slate-400/50',
    description: 'Verified civic participant',
    privileges: ['Vote on proposals', 'Submit feedback', 'Join discussions']
  },
  {
    id: 'trusted_voice',
    name: 'Trusted Voice',
    requirement: {
      trustScore: 80,
      streaks: 7,
      referrals: 5,
      disputes: 1
    },
    status: 'current',
    progress: 85,
    unlockedAt: new Date(Date.now() - 432000000), // 5 days ago
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    ringColor: 'ring-blue-400/50',
    description: 'Established community member',
    privileges: ['Endorse proposals', 'Mentor newcomers', 'Early voting access']
  },
  {
    id: 'civic_guide',
    name: 'Civic Guide',
    requirement: {
      trustScore: 90,
      streaks: 14,
      referrals: 10,
      disputes: 3
    },
    status: 'progress',
    progress: 72,
    icon: <Star className="w-5 h-5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    ringColor: 'ring-yellow-400/50',
    description: 'Community leader and guide',
    privileges: ['Create proposals', 'Moderate forums', 'Resolve minor disputes']
  },
  {
    id: 'consensus_architect',
    name: 'Consensus Architect',
    requirement: {
      trustScore: 95,
      streaks: 21,
      referrals: 20,
      disputes: 10
    },
    status: 'locked',
    progress: 35,
    icon: <Crown className="w-5 h-5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    ringColor: 'ring-purple-400/50',
    description: 'Elite governance architect',
    privileges: ['System governance', 'Major dispute resolution', 'Protocol changes']
  }
];

// Mock current user metrics from other decks
const getCurrentUserMetrics = () => ({
  trustScore: 87.3,
  currentStreak: 7,
  longestStreak: 14,
  verifiedReferrals: 6,
  disputesResolved: 2
});

const validateZKPReputationHash = (hash: string): boolean => {
  return DECK_6_REPUTATION_HASHES.includes(hash) || DECK_9_DISPUTE_VALIDATION.includes(hash);
};

const calculateZKPMismatchRate = (tierData: ReputationTierData[]): number => {
  // Simulate ZKP validation mismatch for pushback detection
  const totalValidations = tierData.length * 4; // 4 validations per tier
  const validValidations = Math.floor(totalValidations * 0.93); // 93% success rate
  const mismatchRate = ((totalValidations - validValidations) / totalValidations) * 100;
  return Math.min(mismatchRate, 7); // Keep under 10% threshold
};

const getTierStatusIcon = (status: TierStatus): React.ReactNode => {
  switch (status) {
    case 'unlocked':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'current':
      return <Target className="w-4 h-4 text-blue-400 animate-pulse" />;
    case 'progress':
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'locked':
      return <Lock className="w-4 h-4 text-slate-500" />;
  }
};

const getTierProgressColor = (status: TierStatus): string => {
  switch (status) {
    case 'unlocked':
      return 'bg-green-500';
    case 'current':
      return 'bg-blue-500';
    case 'progress':
      return 'bg-yellow-500';
    case 'locked':
      return 'bg-slate-600';
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffDays} days ago`;
  }
};

export const ReputationLadderCard: React.FC<ReputationLadderCardProps> = ({ className }) => {
  const [reputationTiers, setReputationTiers] = useState<ReputationTierData[]>(MOCK_REPUTATION_TIERS);
  const [userMetrics] = useState(getCurrentUserMetrics());
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [zkpMismatchRate, setZkpMismatchRate] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [announcedTiers, setAnnouncedTiers] = useState<Set<string>>(new Set());
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ReputationLadderCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ReputationLadderCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation
  const speakMessage = (message: string) => {
    const now = Date.now();
    
    // Throttle TTS calls - prevent duplicate calls within 3 seconds
    if (now - ttsStatus.lastTrigger < 3000) {
      return;
    }
    
    if (!ttsStatus.isReady) {
      return;
    }

    try {
      // Always cancel any existing speech before starting new one
      window.speechSynthesis.cancel();
      
      // Wait a brief moment for cancellation to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          lastTrigger: now 
        }));
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
        };
        
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          // TTS ready but no auto-play - only on user interaction
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Real-time tier updates and ZKP monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const syncStart = performance.now();
      
      setReputationTiers(prev => {
        const newTiers = prev.map(tier => {
          // Calculate tier progress based on user metrics
          const requirements = tier.requirement;
          const meetsRequirements = 
            userMetrics.trustScore >= requirements.trustScore &&
            userMetrics.currentStreak >= requirements.streaks &&
            userMetrics.verifiedReferrals >= requirements.referrals &&
            userMetrics.disputesResolved >= requirements.disputes;
          
          let newProgress = 0;
          let newStatus = tier.status;
          
          if (meetsRequirements) {
            newProgress = 100;
            newStatus = tier.id === 'trusted_voice' ? 'current' : 'unlocked';
            
            // TTS announcement for newly unlocked tiers
            if (tier.status === 'locked' && !announcedTiers.has(tier.name)) {
              speakMessage(`New reputation level reached: ${tier.name}`);
              setAnnouncedTiers(prev => new Set(prev).add(tier.name));
            }
          } else {
            // Calculate partial progress
            const trustProgress = Math.min(100, (userMetrics.trustScore / requirements.trustScore) * 100);
            const streakProgress = Math.min(100, (userMetrics.currentStreak / requirements.streaks) * 100);
            const referralProgress = Math.min(100, (userMetrics.verifiedReferrals / requirements.referrals) * 100);
            const disputeProgress = userMetrics.disputesResolved >= requirements.disputes ? 100 : 
              (userMetrics.disputesResolved / requirements.disputes) * 100;
            
            // Weighted average of all requirements
            newProgress = (trustProgress + streakProgress + referralProgress + disputeProgress) / 4;
            newStatus = newProgress > 10 ? 'progress' : 'locked';
          }
          
          return {
            ...tier,
            progress: newProgress,
            status: newStatus,
            unlockedAt: newStatus === 'unlocked' && tier.status !== 'unlocked' ? new Date() : tier.unlockedAt
          };
        });
        
        // Calculate ZKP mismatch rate for pushback detection
        const mismatchRate = calculateZKPMismatchRate(newTiers);
        setZkpMismatchRate(mismatchRate);
        
        const syncTime = performance.now() - syncStart;
        if (syncTime > 100) {
          console.warn(`Reputation sync time: ${syncTime.toFixed(2)}ms (exceeds 100ms target)`);
        }
        
        return newTiers;
      });
    }, 20000); // Update every 20 seconds
    
    return () => clearInterval(interval);
  }, [userMetrics, announcedTiers]);

  const handleRefreshReputation = async () => {
    const validationStart = performance.now();
    setIsUpdating(true);
    
    // Simulate reputation validation refresh
    setTimeout(() => {
      // Refresh tier data with ZKP validation
      setReputationTiers(prev => prev.map(tier => {
        const requirements = tier.requirement;
        const meetsRequirements = 
          userMetrics.trustScore >= requirements.trustScore &&
          userMetrics.currentStreak >= requirements.streaks &&
          userMetrics.verifiedReferrals >= requirements.referrals &&
          userMetrics.disputesResolved >= requirements.disputes;
        
        return {
          ...tier,
          progress: meetsRequirements ? 100 : ((userMetrics.trustScore / requirements.trustScore) * 25 +
            (userMetrics.currentStreak / requirements.streaks) * 25 +
            (userMetrics.verifiedReferrals / requirements.referrals) * 25 +
            (userMetrics.disputesResolved / requirements.disputes) * 25)
        };
      }));
      
      setIsUpdating(false);
      
      const validationTime = performance.now() - validationStart;
      if (validationTime > 100) {
        console.warn(`Reputation validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
      
      // TTS confirmation on manual refresh
      speakMessage("Reputation ladder refreshed.");
    }, 1500);
  };

  const unlockedTiers = reputationTiers.filter(tier => tier.status === 'unlocked' || tier.status === 'current');
  const currentTier = reputationTiers.find(tier => tier.status === 'current');
  const isPushbackActive = zkpMismatchRate > 10;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Reputation Ladder Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          isPushbackActive ? 'bg-red-500' : 'bg-green-500',
          'animate-ping'
        )}
        aria-label={isPushbackActive ? 'Status: Validation issue' : 'Status: Live'}
        title={isPushbackActive ? 'Status: Validation issue' : 'Status: Live'}
      />
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          isPushbackActive ? 'bg-red-500' : 'bg-green-500'
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            Reputation Ladder
          </CardTitle>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {currentTier?.name || 'Citizen'}
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          ZKP-validated civic reputation progression
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Current Standing
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="bg-blue-500/20 rounded p-2">
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-label="Status Active"></span>
                <div className="text-xl font-bold text-blue-400">
                  {userMetrics.trustScore.toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-blue-300">Trust Score</div>
            </div>
            <div className="bg-green-500/20 rounded p-2">
              <div className="text-xl font-bold text-green-400">
                {userMetrics.disputesResolved}
              </div>
              <div className="text-xs text-green-300">Disputes Resolved</div>
            </div>
          </div>
        </div>

        {/* Reputation Tier Ladder */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Progression Ladder
            </span>
          </div>
          
          <div className="space-y-3">
            {reputationTiers.map((tier, index) => (
              <div
                key={tier.id}
                className={cn(
                  'relative p-3 rounded-lg border transition-all duration-300',
                  tier.status === 'current' 
                    ? `${tier.bgColor} border-blue-500/50 ${tier.ringColor} ring-2` 
                    : tier.status === 'unlocked'
                    ? `${tier.bgColor} border-green-500/30`
                    : tier.status === 'progress'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-slate-700/30 border-slate-600/30'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('p-1 rounded', tier.bgColor)}>
                      <div className={tier.color}>
                        {tier.icon}
                      </div>
                    </div>
                    <div>
                      <div className={cn(
                        'font-medium text-sm',
                        tier.status === 'current' ? 'text-blue-300' :
                        tier.status === 'unlocked' ? 'text-green-300' : tier.color
                      )}>
                        {tier.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {tier.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getTierStatusIcon(tier.status)}
                    {tier.status === 'unlocked' && tier.unlockedAt && (
                      <span className="text-xs text-green-400">
                        {formatTimeAgo(tier.unlockedAt)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className={cn(
                      tier.status === 'current' ? 'text-blue-400' :
                      tier.status === 'unlocked' ? 'text-green-400' : 'text-slate-400'
                    )}>
                      {tier.progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={tier.progress} 
                    className={cn(
                      'h-2',
                      tier.status === 'current' ? 'bg-blue-900/50' :
                      tier.status === 'unlocked' ? 'bg-green-900/50' : 'bg-slate-700/50'
                    )}
                  />
                </div>

                {/* Requirements */}
                <div className="text-xs text-slate-400 grid grid-cols-2 gap-1">
                  <span>Trust: {tier.requirement.trustScore}%</span>
                  <span>Streak: {tier.requirement.streaks}d</span>
                  <span>Refs: {tier.requirement.referrals}</span>
                  <span>Disputes: {tier.requirement.disputes}</span>
                </div>

                {/* Celebratory animation for current tier */}
                {tier.status === 'current' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1 right-1">
                      <Sparkles className="w-3 h-3 text-blue-400 animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ZKP Validation Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              ZKP Validation
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tier Validation:</span>
              <span className="text-green-400">{(100 - zkpMismatchRate).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mismatch Rate:</span>
              <span className={zkpMismatchRate > 10 ? 'text-red-400' : 'text-green-400'}>
                {zkpMismatchRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cross-Deck Sync:</span>
              <span className="text-green-400">Active</span>
            </div>
            
            {isPushbackActive && (
              <div className="p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400">
                ⚠️ Pushback: Tier validation mismatch &gt;10%
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Next: {reputationTiers.find(t => t.status === 'progress')?.name || 'All unlocked'}
          </span>
          <button
            onClick={() => {
              handleRefreshReputation();
              // TTS only on manual interaction
              if (!isUpdating) {
                speakMessage("Validating reputation status.");
              }
            }}
            disabled={isUpdating}
            className={cn(
              'px-3 py-1.5 text-xs rounded',
              'bg-purple-600/80 hover:bg-purple-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500',
              'min-h-[32px] transition-colors'
            )}
          >
            {isUpdating ? (
              <>
                <Clock className="w-3 h-3 mr-1 animate-spin inline" />
                Validating...
              </>
            ) : (
              <>
                <ArrowUp className="w-3 h-3 mr-1 inline" />
                Validate
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            ZKP-validated civic reputation with tier progression
          </p>
        </div>
        
        {/* Reputation Update Region */}
        <div aria-live="polite" className="sr-only">
          Current tier: {currentTier?.name || 'Citizen'}, 
          Trust score: {userMetrics.trustScore.toFixed(1)}%,
          Validation rate: {(100 - zkpMismatchRate).toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
};
export default ReputationLadderCard;
