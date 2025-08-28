// VaultOverlayPatch.tsx - Phase X-D Step 4 Core Deliverable 5
// Augments /vault/analyzer with aggregated trust impact score and nudge visibility
// Commander Mark directive via JASMY Relay

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Shield, AlertCircle, Eye, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrustImpactScore {
  overall: number;
  breakdown: {
    citizenEngagement: number;
    representativeResponsiveness: number;
    daoTransparency: number;
    policyAlignment: number;
  };
  trend: 'rising' | 'falling' | 'stable';
  lastUpdate: Date;
}

interface NudgeVisibility {
  activePolicyNudges: number;
  citizenFeedbackNudges: number;
  representativeActionNudges: number;
  totalNudgeReach: number;
  effectiveness: number;
}

interface VaultOverlayPatchProps {
  className?: string;
  showDetailedBreakdown?: boolean;
  enableRealTimeUpdates?: boolean;
}

export const VaultOverlayPatch: React.FC<VaultOverlayPatchProps> = ({
  className = '',
  showDetailedBreakdown = true,
  enableRealTimeUpdates = true
}) => {
  const [trustImpact, setTrustImpact] = useState<TrustImpactScore>({
    overall: 76,
    breakdown: {
      citizenEngagement: 82,
      representativeResponsiveness: 74,
      daoTransparency: 78,
      policyAlignment: 69
    },
    trend: 'rising',
    lastUpdate: new Date()
  });

  const [nudgeVisibility, setNudgeVisibility] = useState<NudgeVisibility>({
    activePolicyNudges: 12,
    citizenFeedbackNudges: 8,
    representativeActionNudges: 5,
    totalNudgeReach: 1247,
    effectiveness: 73
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    // Listen for trust fusion updates
    const handleTrustUpdate = (event: CustomEvent) => {
      const { trustMetrics, sentimentData } = event.detail;
      
      if (trustMetrics) {
        updateTrustImpactScore(trustMetrics);
      }
    };

    // Listen for nudge system updates
    const handleNudgeUpdate = (event: CustomEvent) => {
      const { nudgeStats } = event.detail;
      
      if (nudgeStats) {
        updateNudgeVisibility(nudgeStats);
      }
    };

    window.addEventListener('trust-fusion-update', handleTrustUpdate as EventListener);
    window.addEventListener('nudge-system-update', handleNudgeUpdate as EventListener);

    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      simulateRealTimeUpdates();
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('trust-fusion-update', handleTrustUpdate as EventListener);
      window.removeEventListener('nudge-system-update', handleNudgeUpdate as EventListener);
      clearInterval(updateInterval);
    };
  }, [enableRealTimeUpdates]);

  const simulateRealTimeUpdates = () => {
    setIsLoading(true);

    // Simulate trust impact fluctuations
    setTrustImpact(prev => {
      const variation = (Math.random() - 0.5) * 6; // ±3 points
      const newOverall = Math.max(0, Math.min(100, prev.overall + variation));
      
      return {
        ...prev,
        overall: Math.round(newOverall),
        breakdown: {
          citizenEngagement: Math.round(Math.max(0, Math.min(100, prev.breakdown.citizenEngagement + (Math.random() - 0.5) * 4))),
          representativeResponsiveness: Math.round(Math.max(0, Math.min(100, prev.breakdown.representativeResponsiveness + (Math.random() - 0.5) * 4))),
          daoTransparency: Math.round(Math.max(0, Math.min(100, prev.breakdown.daoTransparency + (Math.random() - 0.5) * 4))),
          policyAlignment: Math.round(Math.max(0, Math.min(100, prev.breakdown.policyAlignment + (Math.random() - 0.5) * 4)))
        },
        trend: variation > 1 ? 'rising' : variation < -1 ? 'falling' : 'stable',
        lastUpdate: new Date()
      };
    });

    // Simulate nudge visibility changes
    setNudgeVisibility(prev => ({
      activePolicyNudges: Math.max(0, prev.activePolicyNudges + Math.floor((Math.random() - 0.5) * 4)),
      citizenFeedbackNudges: Math.max(0, prev.citizenFeedbackNudges + Math.floor((Math.random() - 0.5) * 3)),
      representativeActionNudges: Math.max(0, prev.representativeActionNudges + Math.floor((Math.random() - 0.5) * 2)),
      totalNudgeReach: Math.max(0, prev.totalNudgeReach + Math.floor((Math.random() - 0.5) * 100)),
      effectiveness: Math.max(0, Math.min(100, prev.effectiveness + (Math.random() - 0.5) * 8))
    }));

    setTimeout(() => setIsLoading(false), 500);
  };

  const updateTrustImpactScore = (metrics: any) => {
    // Update from actual trust fusion engine data
    console.log('📊 Vault overlay receiving trust metrics update:', metrics);
  };

  const updateNudgeVisibility = (stats: any) => {
    // Update from actual nudge system data
    console.log('👁️ Vault overlay receiving nudge visibility update:', stats);
  };

  const getTrustLevelColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 65) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrustLevelBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 65) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'falling': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`vault-overlay-patch space-y-4 ${className}`}>
      {/* Trust Impact Score Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Trust Impact Score
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(trustImpact.trend)}
              <Badge variant={getTrustLevelBadgeVariant(trustImpact.overall)}>
                {trustImpact.overall}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Trust Level</span>
              <span className={getTrustLevelColor(trustImpact.overall)}>
                {trustImpact.overall}%
              </span>
            </div>
            <Progress 
              value={trustImpact.overall} 
              className="h-2"
            />
          </div>

          {/* Detailed Breakdown */}
          {showDetailedBreakdown && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Citizen Engagement</span>
                  <span className={getTrustLevelColor(trustImpact.breakdown.citizenEngagement)}>
                    {trustImpact.breakdown.citizenEngagement}%
                  </span>
                </div>
                <Progress value={trustImpact.breakdown.citizenEngagement} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Rep Responsiveness</span>
                  <span className={getTrustLevelColor(trustImpact.breakdown.representativeResponsiveness)}>
                    {trustImpact.breakdown.representativeResponsiveness}%
                  </span>
                </div>
                <Progress value={trustImpact.breakdown.representativeResponsiveness} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>DAO Transparency</span>
                  <span className={getTrustLevelColor(trustImpact.breakdown.daoTransparency)}>
                    {trustImpact.breakdown.daoTransparency}%
                  </span>
                </div>
                <Progress value={trustImpact.breakdown.daoTransparency} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Policy Alignment</span>
                  <span className={getTrustLevelColor(trustImpact.breakdown.policyAlignment)}>
                    {trustImpact.breakdown.policyAlignment}%
                  </span>
                </div>
                <Progress value={trustImpact.breakdown.policyAlignment} className="h-1" />
              </div>
            </div>
          )}

          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Last Updated</span>
            <span>{trustImpact.lastUpdate.toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Nudge Visibility Card */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-purple-500" />
            Nudge Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Nudges Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {nudgeVisibility.activePolicyNudges}
              </div>
              <div className="text-xs text-muted-foreground">Policy Nudges</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {nudgeVisibility.citizenFeedbackNudges}
              </div>
              <div className="text-xs text-muted-foreground">Citizen Feedback</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {nudgeVisibility.representativeActionNudges}
              </div>
              <div className="text-xs text-muted-foreground">Rep Actions</div>
            </div>
          </div>

          {/* Total Reach and Effectiveness */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Nudge Reach</span>
              <Badge variant="outline">{nudgeVisibility.totalNudgeReach.toLocaleString()}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Effectiveness</span>
                <span className={getTrustLevelColor(nudgeVisibility.effectiveness)}>
                  {nudgeVisibility.effectiveness}%
                </span>
              </div>
              <Progress value={nudgeVisibility.effectiveness} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Status Alert */}
      {isLoading && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Updating trust metrics and nudge visibility data...
          </AlertDescription>
        </Alert>
      )}

      {/* High Impact Alert */}
      {trustImpact.overall < 60 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Trust impact below threshold. Consider reviewing civic engagement strategies.
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            Debug: Vault Overlay Data
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify({ trustImpact, nudgeVisibility }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default VaultOverlayPatch;