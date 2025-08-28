/**
 * TrustPublicMetricCard.tsx
 * Phase X-D Step 2: Public trust metric display component
 * Commander Mark authorization via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Activity
} from 'lucide-react';
import TTSToggle from '@/components/tts/TTSToggle';
import TrustSentimentAggregator, { DeckSentimentMetrics, AggregatedTrustMetrics } from './TrustSentimentAggregator';

interface TrustPublicMetricCardProps {
  deckId?: string;
  showOverall?: boolean;
  compact?: boolean;
  className?: string;
}

export const TrustPublicMetricCard: React.FC<TrustPublicMetricCardProps> = ({
  deckId,
  showOverall = false,
  compact = false,
  className = ''
}) => {
  const [deckMetrics, setDeckMetrics] = useState<DeckSentimentMetrics | null>(null);
  const [overallMetrics, setOverallMetrics] = useState<AggregatedTrustMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const aggregator = TrustSentimentAggregator.getInstance();

  useEffect(() => {
    loadMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [deckId, showOverall]);

  const loadMetrics = async () => {
    try {
      if (showOverall) {
        const overall = await aggregator.aggregateAllTrustDeltas();
        setOverallMetrics(overall);
      } else if (deckId) {
        const metrics = aggregator.getDeckMetrics(deckId);
        setDeckMetrics(metrics);
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ Failed to load trust metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 20) return 'text-green-600 dark:text-green-400';
    if (sentiment > 0) return 'text-blue-600 dark:text-blue-400';
    if (sentiment > -20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSentimentIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'falling': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'concerning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const getTierBreakdownSummary = (metrics: DeckSentimentMetrics): string => {
    const { citizen, governor, commander } = metrics.tierBreakdown;
    const total = citizen.count + governor.count + commander.count;
    if (total === 0) return 'No submissions yet';
    
    return `${citizen.count} Citizens, ${governor.count} Governors, ${commander.count} Commanders`;
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Overall system metrics view
  if (showOverall && overallMetrics) {
    const cardContent = `Overall trust system health: ${overallMetrics.systemHealth}. ${overallMetrics.activeDecks} active decks with ${overallMetrics.overallSentiment.toFixed(1)} average sentiment. Last updated ${formatTimeAgo(overallMetrics.lastAggregation)}.`;

    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {getSystemHealthIcon(overallMetrics.systemHealth)}
                System Trust Health
              </CardTitle>
              <CardDescription>
                Overall civic platform sentiment metrics
              </CardDescription>
            </div>
            <TTSToggle
              deckId="trust_metrics"
              moduleId="overall"
              content={cardContent}
              size="sm"
              variant="outline"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Sentiment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Sentiment</span>
              <span className={`text-lg font-bold ${getSentimentColor(overallMetrics.overallSentiment)}`}>
                {overallMetrics.overallSentiment > 0 ? '+' : ''}{overallMetrics.overallSentiment.toFixed(1)}
              </span>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, (overallMetrics.overallSentiment + 100) / 2))} 
              className="h-2"
            />
          </div>

          {/* System Health Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Active Decks</span>
              </div>
              <div className="text-xl font-bold">{overallMetrics.activeDecks}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">High Volatility</span>
              </div>
              <div className="text-xl font-bold text-orange-600">
                {overallMetrics.highVolatilityDecks.length}
              </div>
            </div>
          </div>

          {/* System Health Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={overallMetrics.systemHealth === 'excellent' ? 'default' : 
                      overallMetrics.systemHealth === 'good' ? 'secondary' : 'destructive'}
              className="capitalize"
            >
              {overallMetrics.systemHealth}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(overallMetrics.lastAggregation)}
            </div>
          </div>

          {/* Accessibility live region */}
          <div 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            System trust health: {overallMetrics.systemHealth}. 
            Overall sentiment: {overallMetrics.overallSentiment.toFixed(1)}.
            {overallMetrics.highVolatilityDecks.length > 0 && 
              ` ${overallMetrics.highVolatilityDecks.length} decks showing high volatility.`
            }
          </div>
        </CardContent>
      </Card>
    );
  }

  // Deck-specific metrics view
  if (deckId && deckMetrics) {
    const cardContent = `Trust metrics for ${deckMetrics.deckId}: ${deckMetrics.netSentiment.toFixed(1)} net sentiment with ${deckMetrics.totalSubmissions} submissions. Sentiment trend is ${deckMetrics.sentimentTrend}. ${getTierBreakdownSummary(deckMetrics)}.`;

    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Trust Metrics
                {deckMetrics.volatilityFlag && (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
              </CardTitle>
              <CardDescription>
                {deckMetrics.deckId.replace(/_/g, ' ')} sentiment analysis
              </CardDescription>
            </div>
            <TTSToggle
              deckId="trust_metrics"
              moduleId={deckId}
              content={cardContent}
              size="sm"
              variant="outline"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Net Sentiment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Net Sentiment</span>
              <div className="flex items-center gap-1">
                {getSentimentIcon(deckMetrics.sentimentTrend)}
                <span className={`text-lg font-bold ${getSentimentColor(deckMetrics.netSentiment)}`}>
                  {deckMetrics.netSentiment > 0 ? '+' : ''}{deckMetrics.netSentiment.toFixed(1)}
                </span>
              </div>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, (deckMetrics.netSentiment + 100) / 2))} 
              className="h-2"
            />
          </div>

          {/* Tier Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Participation by Tier</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Citizens</div>
                <div className="text-muted-foreground">{deckMetrics.tierBreakdown.citizen.count}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Governors</div>
                <div className="text-muted-foreground">{deckMetrics.tierBreakdown.governor.count}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-medium">Commanders</div>
                <div className="text-muted-foreground">{deckMetrics.tierBreakdown.commander.count}</div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {deckMetrics.totalSubmissions} submissions
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(deckMetrics.lastUpdated)}
            </div>
          </div>

          {/* Accessibility live region */}
          <div 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            Trust sentiment for {deckMetrics.deckId}: {deckMetrics.netSentiment.toFixed(1)}. 
            Trend: {deckMetrics.sentimentTrend}. 
            {deckMetrics.volatilityFlag && 'High volatility detected.'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <div className="space-y-2">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto" />
          <div className="text-sm text-muted-foreground">
            No trust metrics available yet
          </div>
          <div className="text-xs text-muted-foreground">
            Submit feedback to see sentiment analysis
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustPublicMetricCard;