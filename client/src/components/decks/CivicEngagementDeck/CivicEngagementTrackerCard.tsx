import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Trophy,
  Target,
  Calendar,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Star,
  Hash,
  Activity
} from 'lucide-react';

type EngagementLevel = 'novice' | 'active' | 'trusted' | 'champion';
type BadgeType = 'streak_3' | 'streak_7' | 'streak_14' | 'referral_5' | 'referral_10' | 'trusted_messenger' | 'civic_champion';

interface EngagementBadge {
  id: BadgeType;
  name: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  requirement: string;
  icon: React.ReactNode;
}

interface EngagementMetrics {
  currentStreak: number;
  longestStreak: number;
  totalEngagementDays: number;
  referralsSent: number;
  referralsVerified: number;
  weeklyHeatmap: number[]; // 7 days, 0-100 activity level
  engagementLevel: EngagementLevel;
  trustScore: number;
  zkpVerificationRate: number;
  lastActivity: Date;
  badges: EngagementBadge[];
}

interface CivicEngagementTrackerCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Cross-deck ZKP hash validation pools
const DECK_6_HASH_POOL = [
  'zkp_hash_tu0011_consensus_xyz001',
  'zkp_hash_tu0012_consensus_xyz002',
  'zkp_hash_tu0013_consensus_xyz003',
  'zkp_hash_tu0014_consensus_xyz004',
  'zkp_hash_tu0015_consensus_xyz005'
];

const DECK_9_VERIFICATION_HASHES = [
  'zkp_vote_consensus_001',
  'zkp_vote_consensus_002',
  'zkp_vote_proposal_001',
  'zkp_vote_proposal_002'
];

// Mock engagement data with ZKP verification
const MOCK_ENGAGEMENT_METRICS: EngagementMetrics = {
  currentStreak: 7,
  longestStreak: 14,
  totalEngagementDays: 23,
  referralsSent: 8,
  referralsVerified: 6,
  weeklyHeatmap: [85, 92, 78, 95, 88, 91, 96], // Last 7 days activity
  engagementLevel: 'trusted',
  trustScore: 87.3,
  zkpVerificationRate: 94.2,
  lastActivity: new Date(Date.now() - 180000), // 3 minutes ago
  badges: [
    {
      id: 'streak_3',
      name: '3-Day Streak',
      description: 'Consistent civic engagement for 3 days',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 432000000), // 5 days ago
      requirement: '3 consecutive days of engagement',
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'streak_7',
      name: '7-Day Streak',
      description: 'Dedicated weekly civic participation',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 86400000), // 1 day ago
      requirement: '7 consecutive days of engagement',
      icon: <Trophy className="w-4 h-4" />
    },
    {
      id: 'referral_5',
      name: 'Community Builder',
      description: 'Successfully referred 5 verified citizens',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 259200000), // 3 days ago
      requirement: '5 verified referrals',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'trusted_messenger',
      name: 'Trusted Messenger',
      description: 'Achieved >90% ZKP verification rate',
      isUnlocked: false,
      requirement: '>90% ZKP verification rate + 10 referrals',
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 'streak_14',
      name: '14-Day Streak',
      description: 'Outstanding commitment to civic duty',
      isUnlocked: false,
      requirement: '14 consecutive days of engagement',
      icon: <Star className="w-4 h-4" />
    }
  ]
};

const getEngagementLevelColor = (level: EngagementLevel): string => {
  switch (level) {
    case 'novice':
      return 'text-slate-400';
    case 'active':
      return 'text-blue-400';
    case 'trusted':
      return 'text-green-400';
    case 'champion':
      return 'text-purple-400';
  }
};

const getEngagementLevelBadge = (level: EngagementLevel): string => {
  switch (level) {
    case 'novice':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'active':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'trusted':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'champion':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
};

const getTrustScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-400';
  if (score >= 75) return 'text-yellow-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
};

const getActivityLevel = (value: number): string => {
  if (value >= 90) return 'bg-green-500';
  if (value >= 70) return 'bg-yellow-500';
  if (value >= 50) return 'bg-orange-500';
  if (value >= 30) return 'bg-red-500';
  return 'bg-slate-600';
};

const getStatusDotColor = (streak: number, zkpMismatchRate: number): string => {
  if (zkpMismatchRate > 10) return 'bg-red-500';
  if (streak >= 7) return 'bg-green-500';
  if (streak >= 3) return 'bg-amber-400';
  return 'bg-slate-500';
};

const getStatusDotLabel = (streak: number, zkpMismatchRate: number): string => {
  if (zkpMismatchRate > 10) return 'Status: Issue detected';
  if (streak >= 7) return 'Status: Live';
  if (streak >= 3) return 'Status: Active';
  return 'Status: Pending';
};

const formatEngagementLevel = (level: EngagementLevel): string => {
  switch (level) {
    case 'novice':
      return 'Novice';
    case 'active':
      return 'Active';
    case 'trusted':
      return 'Trusted';
    case 'champion':
      return 'Champion';
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

const validateZKPHash = (hash: string): boolean => {
  return DECK_6_HASH_POOL.includes(hash) || DECK_9_VERIFICATION_HASHES.includes(hash);
};

const calculateZKPMismatchRate = (metrics: EngagementMetrics): number => {
  // Simulate ZKP verification mismatch detection
  const totalVerifications = metrics.referralsVerified + metrics.totalEngagementDays;
  const expectedVerifications = Math.floor(totalVerifications * (metrics.zkpVerificationRate / 100));
  const actualVerifications = totalVerifications;
  const mismatchRate = Math.abs(expectedVerifications - actualVerifications) / totalVerifications * 100;
  return Math.min(mismatchRate, 15); // Keep under 10% threshold for now
};

export const CivicEngagementTrackerCard: React.FC<CivicEngagementTrackerCardProps> = ({ className }) => {
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>(MOCK_ENGAGEMENT_METRICS);
  const [isUpdating, setIsUpdating] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [zkpMismatchRate, setZkpMismatchRate] = useState(0);
  const [announcedBadges, setAnnouncedBadges] = useState<Set<string>>(new Set());
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CivicEngagementTrackerCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CivicEngagementTrackerCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation and throttling
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

  // Real-time engagement updates and ZKP monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const syncStart = performance.now();
      
      setEngagementMetrics(prev => {
        // Simulate minor activity fluctuations
        const newTrustScore = Math.max(0, Math.min(100, prev.trustScore + (Math.random() - 0.5) * 1));
        const newZkpRate = Math.max(0, Math.min(100, prev.zkpVerificationRate + (Math.random() - 0.5) * 0.5));
        
        // Update heatmap (shift left, add new day)
        const newHeatmap = [...prev.weeklyHeatmap.slice(1), Math.floor(Math.random() * 20 + 80)];
        
        const updatedMetrics = {
          ...prev,
          trustScore: newTrustScore,
          zkpVerificationRate: newZkpRate,
          weeklyHeatmap: newHeatmap,
          lastActivity: new Date()
        };
        
        // Calculate ZKP mismatch rate for pushback detection
        const mismatchRate = calculateZKPMismatchRate(updatedMetrics);
        setZkpMismatchRate(mismatchRate);
        
        const syncTime = performance.now() - syncStart;
        if (syncTime > 100) {
          console.warn(`Engagement sync time: ${syncTime.toFixed(2)}ms (exceeds 100ms target)`);
        }
        
        return updatedMetrics;
      });
    }, 12000); // Update every 12 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleRefreshEngagement = async () => {
    const validationStart = performance.now();
    setIsUpdating(true);
    
    // Simulate engagement data refresh
    setTimeout(() => {
      setEngagementMetrics(prev => ({
        ...prev,
        lastActivity: new Date(),
        trustScore: Math.max(0, Math.min(100, prev.trustScore + (Math.random() - 0.5) * 2))
      }));
      
      setIsUpdating(false);
      
      const validationTime = performance.now() - validationStart;
      if (validationTime > 100) {
        console.warn(`Engagement refresh time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
      
      // TTS handled by button click, not automatic refresh
    }, 1000);
  };

  const handleBadgeUnlock = (badgeId: BadgeType) => {
    setEngagementMetrics(prev => ({
      ...prev,
      badges: prev.badges.map(badge => 
        badge.id === badgeId 
          ? { ...badge, isUnlocked: true, unlockedAt: new Date() }
          : badge
      )
    }));

    // TTS badge unlock announcement - only once per badge
    const badge = engagementMetrics.badges.find(b => b.id === badgeId);
    if (badge && !announcedBadges.has(badge.name)) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(`${badge.name} unlocked.`);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }, 100);
      setAnnouncedBadges(prev => new Set(prev).add(badge.name));
    }
  };

  const unlockedBadges = engagementMetrics.badges.filter(badge => badge.isUnlocked);
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
      aria-label="Civic Engagement Tracker Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          getStatusDotColor(engagementMetrics.currentStreak, zkpMismatchRate),
          'animate-ping'
        )}
        aria-label={getStatusDotLabel(engagementMetrics.currentStreak, zkpMismatchRate)}
        title={getStatusDotLabel(engagementMetrics.currentStreak, zkpMismatchRate)}
      />
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          getStatusDotColor(engagementMetrics.currentStreak, zkpMismatchRate)
        )}
      />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Civic Engagement
          </CardTitle>
          <Badge variant="outline" className={getEngagementLevelBadge(engagementMetrics.engagementLevel)}>
            {formatEngagementLevel(engagementMetrics.engagementLevel)}
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Gamified participation tracking with trust metrics
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trust Streak Display */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Trust Streak
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-green-500/20 rounded p-3">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-label="Streak Active"></span>
                <div className="text-2xl font-bold text-green-400">
                  {engagementMetrics.currentStreak}
                </div>
              </div>
              <div className="text-xs text-green-300">Current</div>
            </div>
            <div className="bg-blue-500/20 rounded p-3">
              <div className="text-2xl font-bold text-blue-400">
                {engagementMetrics.longestStreak}
              </div>
              <div className="text-xs text-blue-300">Best</div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Trust Score:</span>
              <span className={getTrustScoreColor(engagementMetrics.trustScore)}>
                {engagementMetrics.trustScore.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={engagementMetrics.trustScore} 
              className="h-2 bg-slate-700/50"
            />
          </div>
        </div>

        {/* Referral Metrics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Referral Impact
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-lg font-bold text-blue-400">
                {engagementMetrics.referralsSent}
              </div>
              <div className="text-xs text-slate-400">Sent</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {engagementMetrics.referralsVerified}
              </div>
              <div className="text-xs text-slate-400">Verified</div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Success Rate:</span>
              <span className="text-slate-300">
                {((engagementMetrics.referralsVerified / engagementMetrics.referralsSent) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={(engagementMetrics.referralsVerified / engagementMetrics.referralsSent) * 100} 
              className="h-2 bg-slate-700/50"
            />
          </div>
        </div>

        {/* Weekly Activity Heatmap */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Weekly Activity
            </span>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-slate-400 mb-1">{day}</div>
                <div 
                  className={cn(
                    'w-8 h-8 rounded flex items-center justify-center text-xs font-medium',
                    getActivityLevel(engagementMetrics.weeklyHeatmap[index])
                  )}
                >
                  {engagementMetrics.weeklyHeatmap[index]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-slate-400 mt-2 text-center">
            Activity intensity (0-100)
          </div>
        </div>

        {/* Badge Collection */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-200">
                Achievements
              </span>
            </div>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              {unlockedBadges.length}/{engagementMetrics.badges.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {engagementMetrics.badges.slice(0, 4).map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'p-2 rounded-lg border text-center',
                  badge.isUnlocked 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-slate-700/30 border-slate-600/30'
                )}
              >
                <div className={cn(
                  'flex justify-center mb-1',
                  badge.isUnlocked ? 'text-green-400' : 'text-slate-500'
                )}>
                  {badge.icon}
                </div>
                <div className={cn(
                  'text-xs font-medium',
                  badge.isUnlocked ? 'text-green-300' : 'text-slate-400'
                )}>
                  {badge.name}
                </div>
                {badge.isUnlocked && badge.unlockedAt && (
                  <div className="text-xs text-slate-400 mt-1">
                    {formatTimeAgo(badge.unlockedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ZKP Verification Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              ZKP Verification
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Verification Rate:</span>
              <span className="text-green-400">{engagementMetrics.zkpVerificationRate.toFixed(1)}%</span>
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
                ⚠️ Pushback: ZKP mismatch rate exceeds 10%
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Last activity: {formatTimeAgo(engagementMetrics.lastActivity)}
          </span>
          <Button
            onClick={() => {
              handleRefreshEngagement();
              // TTS only on manual interaction
              if (!isUpdating) {
                speakMessage("Engagement tracker refreshed.");
              }
            }}
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
                <Activity className="w-3 h-3 mr-1" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Gamified civic engagement with ZKP-verified trust metrics
          </p>
        </div>
        
        {/* Engagement Metrics Update Region */}
        <div aria-live="polite" className="sr-only">
          Trust score: {engagementMetrics.trustScore.toFixed(1)}%, 
          Current streak: {engagementMetrics.currentStreak} days,
          ZKP verification: {engagementMetrics.zkpVerificationRate.toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicEngagementTrackerCard;