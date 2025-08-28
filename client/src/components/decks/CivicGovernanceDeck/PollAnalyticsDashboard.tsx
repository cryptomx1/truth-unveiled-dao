/**
 * PollAnalyticsDashboard.tsx - Civic Poll Analytics Interface
 * 
 * Comprehensive dashboard for poll response analysis, featuring tier-weighted
 * aggregation, alignment diagnostics, and DAO export capabilities for the Truth
 * Unveiled civic engagement platform.
 * 
 * Features:
 * - Real-time poll analytics with tier-weighted calculations
 * - Interactive alignment and pushback analysis visualization
 * - DAO export functionality with ZK proof verification
 * - Time-series replay visualization for response patterns
 * - CID-tier access control (Moderator+ access required)
 * 
 * Authority: Commander Mark | Phase X-J Step 2
 * Status: Implementation phase - analytics dashboard interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Users, 
  Target, 
  Scale,
  FileText,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Import aggregation functionality
import PollResponseAggregator, { 
  createPollAggregator,
  TierWeightedResults,
  TierParticipationBreakdown,
  PollImpactAnalysis,
  AlignmentReport,
  PushbackSeverityAnalysis,
  DAOExportPackage
} from './PollResponseAggregator';

// Import access control
import { TruthTokenRole } from '../../../tokenomics/TruthTokenomicsSpec';

interface Poll {
  id: number;
  title: string;
  description: string | null;
  category: string;
  pollType: string;
  options: string[];
  creatorDid: string;
  creatorTier: string;
  zkpHash: string;
  truthCoinStaked: number | null;
  expiresAt: Date | null;
  createdAt: Date;
  isActive: boolean;
}

interface AnalyticsState {
  selectedPollId: number | null;
  aggregatedResults: TierWeightedResults | null;
  tierParticipation: TierParticipationBreakdown | null;
  impactAnalysis: PollImpactAnalysis | null;
  alignmentReport: AlignmentReport | null;
  pushbackAnalysis: PushbackSeverityAnalysis | null;
  isAnalyzing: boolean;
  lastAnalyzedAt: Date | null;
}

interface PollAnalyticsDashboardProps {
  userTier?: TruthTokenRole;
  restrictedMode?: boolean;
}

export default function PollAnalyticsDashboard({ 
  userTier = TruthTokenRole.MODERATOR,
  restrictedMode = false 
}: PollAnalyticsDashboardProps) {
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    selectedPollId: null,
    aggregatedResults: null,
    tierParticipation: null,
    impactAnalysis: null,
    alignmentReport: null,
    pushbackAnalysis: null,
    isAnalyzing: false,
    lastAnalyzedAt: null
  });

  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'failed'>('idle');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const { toast } = useToast();

  // Check access permissions
  const hasAccess = PollResponseAggregator.validateAccess(userTier);

  // Fetch available polls
  const { data: polls = [], isLoading: isLoadingPolls } = useQuery<Poll[]>({
    queryKey: ['/api/polls'],
    enabled: hasAccess && !restrictedMode
  });

  // TTS functionality
  const speakMessage = useCallback((message: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          window.speechSynthesis.speak(utterance);
          console.log(`🔊 TTS: "${message}"`);
        }, 40);
      } catch (error) {
        console.error('TTS failed:', error);
      }
    }
  }, []);

  // Mount TTS message
  useEffect(() => {
    const initMessage = hasAccess 
      ? "Poll analytics dashboard ready"
      : "Access restricted - moderator privileges required";
    setTimeout(() => speakMessage(initMessage), 1000);
  }, [hasAccess, speakMessage]);

  // Analyze selected poll
  const analyzePoll = async (pollId: number) => {
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "Moderator privileges required for poll analysis.",
        variant: "destructive"
      });
      return;
    }

    setAnalyticsState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const aggregator = await createPollAggregator(pollId);
      
      const [
        aggregatedResults,
        tierParticipation,
        impactAnalysis,
        alignmentReport,
        pushbackAnalysis
      ] = await Promise.all([
        aggregator.aggregatePollResponses(),
        aggregator.getTierParticipationBreakdown(),
        aggregator.calculatePollImpact(),
        aggregator.generateAlignmentReport(),
        aggregator.getPushbackSeverityScore()
      ]);

      setAnalyticsState({
        selectedPollId: pollId,
        aggregatedResults,
        tierParticipation,
        impactAnalysis,
        alignmentReport,
        pushbackAnalysis,
        isAnalyzing: false,
        lastAnalyzedAt: new Date()
      });

      speakMessage(`Analysis complete for poll ${pollId}`);
      toast({
        title: "Analysis Complete",
        description: `Poll ${pollId} analysis generated successfully.`
      });

    } catch (error) {
      console.error('Poll analysis failed:', error);
      setAnalyticsState(prev => ({ ...prev, isAnalyzing: false }));
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze poll data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Export poll report
  const exportPollReport = async () => {
    if (!analyticsState.selectedPollId || !hasAccess) return;

    setExportStatus('exporting');

    try {
      const aggregator = await createPollAggregator(analyticsState.selectedPollId);
      const exportData = aggregator.exportPollReport(exportFormat);

      if (typeof exportData === 'string') {
        // CSV export
        const blob = new Blob([exportData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poll_${analyticsState.selectedPollId}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // JSON export
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poll_${analyticsState.selectedPollId}_report.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setExportStatus('success');
      speakMessage("DAO export package generated");
      toast({
        title: "Export Complete",
        description: `Poll report exported as ${exportFormat.toUpperCase()}.`
      });

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('failed');
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Export failed. Please try again.",
        variant: "destructive"
      });
    }

    setTimeout(() => setExportStatus('idle'), 3000);
  };

  // Render access denied state
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Access Restricted</h3>
              <p className="text-slate-400 mb-4">
                Poll analytics require Moderator-level privileges or higher.
              </p>
              <Badge variant="outline" className="text-amber-400 border-amber-400">
                Current Tier: {userTier}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render loading state
  if (isLoadingPolls) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading poll analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <div>
              <CardTitle className="text-white">Poll Analytics Dashboard</CardTitle>
              <CardDescription className="text-slate-400">
                Tier-weighted response analysis and DAO intelligence reporting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Analysis Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Select Poll</label>
                <Select
                  value={analyticsState.selectedPollId?.toString() || ''}
                  onValueChange={(value) => {
                    const pollId = parseInt(value);
                    if (!isNaN(pollId)) {
                      analyzePoll(pollId);
                    }
                  }}
                  disabled={analyticsState.isAnalyzing}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose poll..." />
                  </SelectTrigger>
                  <SelectContent>
                    {polls.map(poll => (
                      <SelectItem key={poll.id} value={poll.id.toString()}>
                        Poll #{poll.id}: {poll.title.slice(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {analyticsState.isAnalyzing && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-sm">Analyzing responses...</span>
                  </div>
                </div>
              )}

              {analyticsState.lastAnalyzedAt && (
                <div className="text-xs text-slate-500">
                  Last analyzed: {analyticsState.lastAnalyzedAt.toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Controls */}
          {analyticsState.aggregatedResults && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">DAO Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Format</label>
                  <Select
                    value={exportFormat}
                    onValueChange={(value: 'json' | 'csv') => setExportFormat(value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={exportPollReport}
                  disabled={exportStatus === 'exporting'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportStatus === 'exporting' ? 'Exporting...' : 'Export Report'}
                </Button>

                {exportStatus === 'success' && (
                  <div className="text-xs text-green-400">Export completed successfully</div>
                )}
                {exportStatus === 'failed' && (
                  <div className="text-xs text-red-400">Export failed - check console</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* User Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Access Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Tier:</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {userTier}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Access:</span>
                  <span className="text-green-400 text-sm">Analytics Enabled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Results */}
        <div className="lg:col-span-3 space-y-6">
          {!analyticsState.aggregatedResults ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-white text-lg mb-2">Select Poll for Analysis</h3>
                  <p className="text-slate-400">
                    Choose a poll from the control panel to view comprehensive analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Response Overview */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Response Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-slate-400 text-sm">Total Responses</div>
                      <div className="text-white text-2xl font-bold">
                        {analyticsState.aggregatedResults.totalRawResponses}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-slate-400 text-sm">Weighted Total</div>
                      <div className="text-white text-2xl font-bold">
                        {analyticsState.aggregatedResults.totalWeightedResponses.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-slate-400 text-sm">Average Weight</div>
                      <div className="text-white text-2xl font-bold">
                        {analyticsState.aggregatedResults.averageWeight.toFixed(2)}x
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-slate-400 text-sm">Active Tiers</div>
                      <div className="text-white text-2xl font-bold">
                        {Object.keys(analyticsState.tierParticipation || {}).length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Option Results */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Weighted Results by Option</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsState.aggregatedResults.optionResults).map(([index, data]) => {
                      const selectedPoll = polls.find(p => p.id === analyticsState.selectedPollId);
                      const optionText = selectedPoll?.options[parseInt(index)] || `Option ${parseInt(index) + 1}`;
                      const percentage = analyticsState.aggregatedResults 
                        ? (data.weightedVotes / analyticsState.aggregatedResults.totalWeightedResponses) * 100 
                        : 0;

                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300 font-medium">{optionText}</span>
                            <div className="text-right">
                              <div className="text-white">{data.weightedVotes.toFixed(1)} weighted votes</div>
                              <div className="text-slate-400 text-sm">{data.rawVotes} raw votes</div>
                            </div>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-2 bg-slate-700"
                          />
                          <div className="text-slate-400 text-sm mt-1">{percentage.toFixed(1)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Impact & Alignment Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Impact Analysis */}
                {analyticsState.impactAnalysis && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Impact Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300">Public Opinion Strength</span>
                          <span className="text-white font-medium">
                            {analyticsState.impactAnalysis.publicOpinionStrength.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={analyticsState.impactAnalysis.publicOpinionStrength} 
                          className="h-2 bg-slate-700"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300">Engagement Score</span>
                          <span className="text-white font-medium">
                            {analyticsState.impactAnalysis.engagementScore.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={analyticsState.impactAnalysis.engagementScore} 
                          className="h-2 bg-slate-700"
                        />
                      </div>

                      <Separator className="bg-slate-700" />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Dominant Tier</span>
                          <Badge variant="outline">{analyticsState.impactAnalysis.dominantTier}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Participation Rate</span>
                          <span className="text-slate-300 text-sm">
                            {analyticsState.impactAnalysis.participationRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pushback Analysis */}
                {analyticsState.pushbackAnalysis && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Pushback Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300">Severity Score</span>
                          <span className={cn(
                            "font-medium",
                            analyticsState.pushbackAnalysis.severityScore >= 50 ? "text-red-400" : "text-green-400"
                          )}>
                            {analyticsState.pushbackAnalysis.severityScore.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={analyticsState.pushbackAnalysis.severityScore} 
                          className="h-2 bg-slate-700"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {analyticsState.pushbackAnalysis.isActionRequired ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        <span className={cn(
                          "text-sm",
                          analyticsState.pushbackAnalysis.isActionRequired ? "text-red-400" : "text-green-400"
                        )}>
                          {analyticsState.pushbackAnalysis.isActionRequired ? "Action Required" : "No Action Needed"}
                        </span>
                      </div>

                      {analyticsState.pushbackAnalysis.oppositionTiers.length > 0 && (
                        <div>
                          <div className="text-slate-400 text-sm mb-2">Opposition Tiers:</div>
                          <div className="flex flex-wrap gap-1">
                            {analyticsState.pushbackAnalysis.oppositionTiers.map(tier => (
                              <Badge key={tier} variant="outline" className="text-red-400 border-red-400">
                                {tier}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">Recommended Response:</div>
                        <div className="text-slate-300 text-sm">
                          {analyticsState.pushbackAnalysis.recommendedResponse}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Tier Participation */}
              {analyticsState.tierParticipation && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Tier Participation Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(analyticsState.tierParticipation).map(([tier, data]) => (
                        <div key={tier} className="bg-slate-700/30 rounded-lg p-4">
                          <div className="text-slate-400 text-sm">{tier}</div>
                          <div className="text-white text-xl font-bold">{data.responseCount}</div>
                          <div className="text-slate-400 text-sm">
                            {data.percentage.toFixed(1)}% • Weight: {data.averageWeight.toFixed(2)}x
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alignment Report */}
              {analyticsState.alignmentReport && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      Alignment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-slate-300 font-medium mb-3">Consensus Metrics</div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-400 text-sm">Overall Consensus</span>
                              <span className="text-white">
                                {analyticsState.alignmentReport.overallConsensus.toFixed(1)}%
                              </span>
                            </div>
                            <Progress 
                              value={analyticsState.alignmentReport.overallConsensus} 
                              className="h-2 bg-slate-700"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-400 text-sm">Polarization Index</span>
                              <span className="text-white">
                                {analyticsState.alignmentReport.polarizationIndex.toFixed(1)}%
                              </span>
                            </div>
                            <Progress 
                              value={analyticsState.alignmentReport.polarizationIndex} 
                              className="h-2 bg-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-300 font-medium mb-3">Minority Concerns</div>
                        {analyticsState.alignmentReport.minorityTierConcerns.length > 0 ? (
                          <div className="space-y-2">
                            {analyticsState.alignmentReport.minorityTierConcerns.map((concern, index) => (
                              <div key={index} className="bg-amber-500/10 border border-amber-500/30 rounded p-2">
                                <div className="text-amber-400 text-sm">{concern}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm">No minority tier concerns detected</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}