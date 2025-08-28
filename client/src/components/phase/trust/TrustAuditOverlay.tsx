// Phase X-D Step 3: TrustAuditOverlay.tsx
// JASMY Relay authorization via Commander Mark
// Trust audit visualization with sentiment breakdown, TP graph, trust tiers, and anonymity ratio

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye, 
  EyeOff, 
  Users, 
  Award, 
  Target, 
  Hash,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Star,
  Crown,
  Gem,
  RefreshCw,
  Activity,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export interface TrustMetrics {
  totalVotes: number;
  totalSentiments: number;
  trustScore: number;
  anonymityRatio: number;
  truthPointsEarned: number;
  activeStreaks: number;
}

export interface SentimentBreakdown {
  support: number;
  concern: number;
  neutral: number;
  anonymous: number;
  public: number;
}

export interface TrustTier {
  name: string;
  threshold: number;
  color: string;
  icon: React.ComponentType<any>;
  description: string;
}

export interface TruthPointHistory {
  timestamp: number;
  points: number;
  source: 'vote' | 'sentiment' | 'streak_bonus';
  cumulative: number;
}

export interface TrustAuditOverlayProps {
  userRole?: 'Citizen' | 'Moderator' | 'Governor';
  userDid?: string;
  onAuditRefresh?: () => void;
  className?: string;
}

export default function TrustAuditOverlay({
  userRole = 'Citizen',
  userDid = 'did:civic:trust_auditor_001',
  onAuditRefresh,
  className = ''
}: TrustAuditOverlayProps) {
  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics>({
    totalVotes: 23,
    totalSentiments: 15,
    trustScore: 87.3,
    anonymityRatio: 0.73,
    truthPointsEarned: 345,
    activeStreaks: 3
  });

  const [sentimentBreakdown, setSentimentBreakdown] = useState<SentimentBreakdown>({
    support: 9,
    concern: 4,
    neutral: 2,
    anonymous: 11,
    public: 4
  });

  const [truthPointHistory, setTruthPointHistory] = useState<TruthPointHistory[]>([
    { timestamp: Date.now() - 86400000 * 6, points: 5, source: 'vote', cumulative: 200 },
    { timestamp: Date.now() - 86400000 * 5, points: 15, source: 'sentiment', cumulative: 215 },
    { timestamp: Date.now() - 86400000 * 4, points: 10, source: 'vote', cumulative: 225 },
    { timestamp: Date.now() - 86400000 * 3, points: 20, source: 'sentiment', cumulative: 245 },
    { timestamp: Date.now() - 86400000 * 2, points: 5, source: 'streak_bonus', cumulative: 250 },
    { timestamp: Date.now() - 86400000 * 1, points: 15, source: 'sentiment', cumulative: 265 },
    { timestamp: Date.now(), points: 25, source: 'vote', cumulative: 290 }
  ]);

  const [currentTier, setCurrentTier] = useState<TrustTier | null>(null);
  const [pathBTriggered, setPathBTriggered] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [renderTime, setRenderTime] = useState<number>(0);
  
  const mountTimestamp = useRef<number>(Date.now());
  const vaultSyncAttempts = useRef<number>(0);
  const syncFailures = useRef<number>(0);

  // Trust tiers definition
  const trustTiers: TrustTier[] = [
    { name: 'Novice', threshold: 0, color: 'text-slate-400', icon: Users, description: 'Starting civic participant' },
    { name: 'Trusted', threshold: 60, color: 'text-blue-400', icon: Star, description: 'Reliable community member' },
    { name: 'Advocate', threshold: 80, color: 'text-green-400', icon: Award, description: 'Active civic advocate' },
    { name: 'Guardian', threshold: 90, color: 'text-purple-400', icon: Crown, description: 'Trust network guardian' },
    { name: 'Architect', threshold: 95, color: 'text-yellow-400', icon: Gem, description: 'Consensus architect' }
  ];

  // Announce messages for accessibility (TTS suppressed per requirements)
  const announce = useCallback((message: string) => {
    setAriaAnnouncement(message);
    console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
  }, []);

  // Sync with vault.history.json
  const syncVaultHistory = useCallback(async (): Promise<boolean> => {
    vaultSyncAttempts.current++;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate 25% sync failure rate for Path B testing
      const syncSuccess = Math.random() > 0.25;
      
      if (!syncSuccess) {
        syncFailures.current++;
        const failureRate = (syncFailures.current / vaultSyncAttempts.current) * 100;
        
        if (failureRate >= 25) {
          setPathBTriggered(true);
          setFallbackMode(true);
          console.log(`🛑 TrustAuditOverlay: Path B activated - ${failureRate.toFixed(1)}% sync failure rate`);
          console.log('💾 TrustAuditOverlay: Using cached vault.history.json with isMock=true');
        }
        
        throw new Error('Vault sync failed');
      }
      
      console.log('✅ TrustAuditOverlay: Vault history synchronized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ TrustAuditOverlay: Vault sync failed:', error);
      return false;
    }
  }, []);

  // Determine current trust tier
  const determineTrustTier = useCallback((score: number): TrustTier => {
    for (let i = trustTiers.length - 1; i >= 0; i--) {
      if (score >= trustTiers[i].threshold) {
        return trustTiers[i];
      }
    }
    return trustTiers[0];
  }, [trustTiers]);

  // Handle audit refresh
  const handleAuditRefresh = async () => {
    setRefreshing(true);
    announce('Refreshing trust audit data');
    
    try {
      const syncSuccess = await syncVaultHistory();
      
      if (syncSuccess) {
        // Simulate minor data fluctuations
        setTrustMetrics(prev => ({
          ...prev,
          trustScore: Math.max(0, Math.min(100, prev.trustScore + (Math.random() - 0.5) * 5)),
          anonymityRatio: Math.max(0, Math.min(1, prev.anonymityRatio + (Math.random() - 0.5) * 0.1))
        }));
        
        announce('Trust audit data refreshed successfully');
        onAuditRefresh?.();
      } else {
        announce('Audit refresh failed, using cached data');
      }
      
    } catch (error) {
      console.error('❌ TrustAuditOverlay: Refresh failed:', error);
      announce('Audit refresh failed');
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    }
  };

  // Reset Path B fallback
  const resetFallback = () => {
    setPathBTriggered(false);
    setFallbackMode(false);
    syncFailures.current = 0;
    vaultSyncAttempts.current = 0;
    announce('Fallback mode reset');
  };

  // Get sentiment display properties
  const getSentimentDisplay = (sentiment: 'support' | 'concern' | 'neutral') => {
    switch (sentiment) {
      case 'support':
        return { color: 'text-green-400', bgColor: 'bg-green-900/20', icon: TrendingUp };
      case 'concern':
        return { color: 'text-red-400', bgColor: 'bg-red-900/20', icon: TrendingDown };
      case 'neutral':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-900/20', icon: Minus };
    }
  };

  // Component initialization and tier determination
  useEffect(() => {
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    console.log('🔍 TrustAuditOverlay: Trust audit overlay initialized');
    console.log(`🎯 TrustAuditOverlay: User role: ${userRole}, DID: ${userDid}`);
    announce('Trust audit overlay ready');
    
    // Determine current trust tier
    const tier = determineTrustTier(trustMetrics.trustScore);
    setCurrentTier(tier);
    
    // Initial vault sync
    syncVaultHistory();
    
    const totalRenderTime = Date.now() - mountTimestamp.current;
    setRenderTime(totalRenderTime);
    
    if (totalRenderTime > 125) {
      console.warn(`⚠️ TrustAuditOverlay render time: ${totalRenderTime}ms (exceeds 125ms target)`);
    }
  }, [announce, userRole, userDid, trustMetrics.trustScore, determineTrustTier, syncVaultHistory]);

  // Auto-refresh timer with proper cleanup
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!refreshing && !pathBTriggered) {
        handleAuditRefresh();
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
      console.log('🧹 TrustAuditOverlay: Cleanup interval cleared');
    };
  }, [refreshing, pathBTriggered, handleAuditRefresh]);

  return (
    <div className={`min-w-[300px] max-w-[460px] h-auto mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-y-auto ${className}`}>
      {/* ARIA Live Region - TTS Suppressed */}
      <div 
        aria-live="off" 
        aria-atomic="true" 
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Trust Audit Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-blue-400">{userRole}</span>
            </div>
            <button
              onClick={handleAuditRefresh}
              disabled={refreshing}
              className="p-2 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-md transition-colors duration-200"
              style={{ minHeight: '32px', minWidth: '32px' }}
              aria-label="Refresh audit data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {pathBTriggered && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-medium text-red-400">Vault Sync Fallback Active</h3>
            </div>
            <div className="text-xs text-red-300 mb-3">
              Vault sync failure rate ≥25%. Using cached vault.history.json data.
            </div>
            <button
              onClick={resetFallback}
              className="py-1 px-3 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors duration-200"
              style={{ minHeight: '32px' }}
            >
              Reset Fallback
            </button>
          </div>
        )}
      </div>

      {/* Trust Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Trust Score */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-300">Trust Score</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {trustMetrics.trustScore.toFixed(1)}%
          </div>
          {currentTier && (
            <div className="flex items-center gap-2">
              <currentTier.icon className={`w-4 h-4 ${currentTier.color}`} />
              <span className={`text-sm ${currentTier.color}`}>{currentTier.name}</span>
            </div>
          )}
        </div>

        {/* Anonymity Ratio */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-300">Anonymity Ratio</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {(trustMetrics.anonymityRatio * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-purple-400">
            {sentimentBreakdown.anonymous}/{sentimentBreakdown.anonymous + sentimentBreakdown.public} anonymous
          </div>
        </div>

        {/* Truth Points */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-medium text-slate-300">Truth Points</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {trustMetrics.truthPointsEarned} TP
          </div>
          <div className="text-xs text-green-400">
            {trustMetrics.activeStreaks} active streaks
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Distribution */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-medium text-slate-300">Sentiment Breakdown</h3>
          </div>
          
          <div className="space-y-3">
            {(['support', 'concern', 'neutral'] as const).map((sentiment) => {
              const display = getSentimentDisplay(sentiment);
              const IconComponent = display.icon;
              const count = sentimentBreakdown[sentiment];
              const total = sentimentBreakdown.support + sentimentBreakdown.concern + sentimentBreakdown.neutral;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={sentiment} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${display.color}`} />
                    <span className="text-sm text-slate-300 capitalize">{sentiment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-16 h-2 bg-slate-600 rounded-full overflow-hidden ${display.bgColor}`}>
                      <div 
                        className={`h-full ${display.color.replace('text-', 'bg-')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-600">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Total Sentiments:</span>
              <span>{trustMetrics.totalSentiments}</span>
            </div>
          </div>
        </div>

        {/* Trust Tiers */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-slate-300">Trust Tiers</h3>
          </div>
          
          <div className="space-y-2">
            {trustTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              const isCurrentTier = currentTier?.name === tier.name;
              const isUnlocked = trustMetrics.trustScore >= tier.threshold;
              
              return (
                <div 
                  key={tier.name}
                  className={`p-2 rounded-md border transition-all duration-200 ${
                    isCurrentTier 
                      ? `border-blue-500 bg-blue-900/20` 
                      : isUnlocked
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${isUnlocked ? tier.color : 'text-slate-600'}`} />
                      <span className={`text-sm font-medium ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                        {tier.name}
                      </span>
                      {isCurrentTier && (
                        <span className="text-xs px-2 py-1 bg-blue-600 text-blue-100 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                      {tier.threshold}%+
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Truth Points Graph */}
      <div className="mb-8 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-slate-300">Truth Points History (7 Days)</h3>
        </div>
        
        <div className="relative h-32 bg-slate-800 rounded-md p-4">
          <div className="flex items-end justify-between h-full gap-1">
            {truthPointHistory.map((entry, index) => {
              const maxPoints = Math.max(...truthPointHistory.map(e => e.points));
              const height = (entry.points / maxPoints) * 100;
              const isLast = index === truthPointHistory.length - 1;
              
              let barColor = 'bg-blue-400';
              if (entry.source === 'vote') barColor = 'bg-green-400';
              if (entry.source === 'sentiment') barColor = 'bg-purple-400';
              if (entry.source === 'streak_bonus') barColor = 'bg-yellow-400';
              
              return (
                <div key={index} className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-xs text-slate-400 mb-1">{entry.points}</div>
                  <div 
                    className={`w-full rounded-sm ${barColor} ${isLast ? 'opacity-100' : 'opacity-70'}`}
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="text-xs text-slate-500">
                    {new Date(entry.timestamp).toLocaleDateString().slice(-5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-slate-400">Votes</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span className="text-slate-400">Sentiments</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-slate-400">Streak Bonus</span>
            </div>
          </div>
          <div className="text-slate-400">
            Total: {truthPointHistory[truthPointHistory.length - 1]?.cumulative || 0} TP
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Participation Metrics */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-medium text-slate-300">Participation Metrics</h3>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Votes:</span>
              <span className="text-white">{trustMetrics.totalVotes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Sentiments:</span>
              <span className="text-white">{trustMetrics.totalSentiments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Streaks:</span>
              <span className="text-white">{trustMetrics.activeStreaks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Public Submissions:</span>
              <span className="text-white">{sentimentBreakdown.public}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Anonymous Submissions:</span>
              <span className="text-white">{sentimentBreakdown.anonymous}</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-300">System Status</h3>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Render Time:</span>
              <span className={renderTime > 125 ? 'text-red-400' : 'text-green-400'}>
                {renderTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vault Sync Attempts:</span>
              <span className="text-white">{vaultSyncAttempts.current}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sync Failures:</span>
              <span className={syncFailures.current > 0 ? 'text-red-400' : 'text-green-400'}>
                {syncFailures.current}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fallback Status:</span>
              <span className={pathBTriggered ? 'text-red-400' : 'text-green-400'}>
                {pathBTriggered ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">User DID:</span>
              <span className="text-white font-mono text-[10px]">
                {userDid.substring(0, 20)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}