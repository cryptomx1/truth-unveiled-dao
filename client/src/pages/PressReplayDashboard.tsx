/**
 * PressReplayDashboard.tsx
 * Phase PRESS-REPLAY Step 4 - Central Campaign Ripple Dashboard
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Radio,
  Zap, 
  Target, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Eye,
  AlertCircle,

  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  MessageSquare,
  Users,
  Waves
} from 'lucide-react';
import { RippleCampaignEngine, type CampaignRipple, type ZIPCluster } from '@/components/press/RippleCampaignEngine';
import { LLMPromptEmitter, type GeneratedPrompt, type PromptQueue } from '@/components/press/LLMPromptEmitter';
import { NudgeExecutionLogger } from '@/components/press/NudgeExecutionLogger';
import { Deck10FeedbackSync } from '@/components/press/Deck10FeedbackSync';

interface PressReplayDashboardProps {
  className?: string;
}

export default function PressReplayDashboard({ className = '' }: PressReplayDashboardProps) {
  const [campaignEngine] = useState(() => RippleCampaignEngine.getInstance());
  const [promptEmitter] = useState(() => LLMPromptEmitter.getInstance());
  const [nudgeLogger] = useState(() => NudgeExecutionLogger.getInstance());
  const [feedbackSync] = useState(() => Deck10FeedbackSync.getInstance());
  
  const [zipClusters, setZipClusters] = useState<ZIPCluster[]>([]);
  const [rippleHistory, setRippleHistory] = useState<CampaignRipple[]>([]);
  const [promptQueue, setPromptQueue] = useState<GeneratedPrompt[]>([]);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [promptStats, setPromptStats] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [executionStats, setExecutionStats] = useState<any>(null);
  
  // Form state for creating new ripples
  const [selectedZIPs, setSelectedZIPs] = useState<string[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<number[]>([]);
  const [promptType, setPromptType] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadDashboardData, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load ZIP clusters
      const clusters = campaignEngine.getZIPClusters();
      setZipClusters(clusters);

      // Load ripple history
      const history = campaignEngine.getRippleHistory(15);
      setRippleHistory(history);

      // Load prompt queue
      const prompts = promptEmitter.getPrompts({ maxAge: 24 });
      setPromptQueue(prompts.slice(0, 10));

      // Load statistics
      const stats = campaignEngine.getCampaignStatistics();
      setCampaignStats(stats);
      
      const pStats = promptEmitter.getPromptStatistics();
      setPromptStats(pStats);

      // Load Deck #10 feedback data
      await feedbackSync.performSync();
      const feedback = feedbackSync.exportForPressReplay();
      setFeedbackData(feedback);

      // Load execution statistics
      const execStats = nudgeLogger.getExecutionSummary();
      setExecutionStats(execStats);

      console.log(`📊 Dashboard updated: ${clusters.length} ZIP clusters, ${history.length} ripples`);
      console.log(`📋 Feedback sync: ${feedback.feedbackEntries.length} entries, ${execStats.totalExecutions} executions`);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleCreateRipple = async () => {
    if (selectedZIPs.length === 0 || selectedDecks.length === 0 || !promptType) return;

    setIsCreating(true);

    try {
      // Generate LLM prompt if custom message not provided
      let messageTemplate = customMessage;
      if (!messageTemplate && selectedZIPs.length > 0) {
        const primaryZIP = zipClusters.find(z => z.zip === selectedZIPs[0]);
        if (primaryZIP) {
          const prompt = await promptEmitter.generatePrompt({
            zip: primaryZIP.zip,
            region: primaryZIP.region,
            sentimentIndex: primaryZIP.sentimentIndex,
            civicEngagement: primaryZIP.civicEngagement,
            userTier: 'Citizen',
            targetDecks: selectedDecks,
            recentActivity: []
          });
          messageTemplate = prompt.content;
        }
      }

      // Create campaign ripple
      const ripple = await campaignEngine.createCampaignRipple({
        zipClusters: selectedZIPs,
        targetDecks: selectedDecks,
        promptType: promptType as any,
        messageTemplate,
        llmGenerated: !customMessage
      });

      // Launch single-ripple wave
      await campaignEngine.launchCampaignWave([ripple.id], 'targeted');

      // Log nudge execution
      await nudgeLogger.logNudgeExecution({
        promptType: promptType as any,
        targetZIP: selectedZIPs.join(','),
        deckTrigger: selectedDecks,
        messageContent: messageTemplate || 'Generated content',
        userTier: 'Citizen', // Default tier
        sentimentBefore: zipClusters.find(z => z.zip === selectedZIPs[0])?.sentimentIndex || 65,
        reachCount: ripple.expectedReach,
        llmGenerated: !customMessage,
        deckWalkerTriggered: true,
        campaignRippleId: ripple.id
      });

      // Reset form
      setSelectedZIPs([]);
      setSelectedDecks([]);
      setPromptType('');
      setCustomMessage('');

      // Refresh data
      await loadDashboardData();

      announceRipple(`Campaign ripple launched: ${selectedZIPs.length} ZIP clusters targeted`, 'success');
      
      console.log(`📢 Ripple created and launched: ${ripple.id}`);

    } catch (error) {
      console.error('Failed to create ripple:', error);
      announceRipple('Failed to create campaign ripple', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const announceRipple = (message: string, type: 'success' | 'error' | 'info') => {
    // ARIA live announcement (TTS disabled due to killer system)
    console.log(`📢 ARIA announcement: ${message}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'paused': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 75) return 'text-green-500';
    if (engagement >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTimestamp = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-white p-4 ${className}`}>
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Radio className="w-8 h-8 text-blue-400" />
            Press Replay Campaign Dashboard
          </h1>
          <p className="text-slate-400">
            Ripple-based campaign messaging with LLM-driven adaptive sequencing
          </p>
        </div>

        {/* Key Statistics Cards */}
        {campaignStats && promptStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  Active Ripples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {campaignStats.activeRipples}
                </div>
                <div className="text-xs text-slate-400">
                  {campaignStats.completedRipples} completed
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Total Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {campaignStats.totalReach.toLocaleString()}
                </div>
                <div className="text-xs text-green-400">
                  {(campaignStats.averageResponseRate * 100).toFixed(1)}% response rate
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  LLM Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {promptStats.totalPrompts}
                </div>
                <div className="text-xs text-blue-400">
                  {promptStats.llmGenerated} AI-generated
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Sentiment Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {campaignStats.sentimentTrend.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400">
                  Across all ZIP clusters
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="create">Create Ripple</TabsTrigger>
            <TabsTrigger value="history">Ripple History</TabsTrigger>
            <TabsTrigger value="prompts">Prompt Queue</TabsTrigger>
            <TabsTrigger value="feedback">Deck #10 Sync</TabsTrigger>
            <TabsTrigger value="heatmap">Trigger Heatmap</TabsTrigger>
          </TabsList>

          {/* Create Ripple Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ripple Creation Form */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Create Campaign Ripple</CardTitle>
                  <CardDescription className="text-slate-400">
                    Launch targeted civic engagement campaigns across ZIP clusters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ZIP Cluster Selection */}
                  <div className="space-y-2">
                    <Label className="text-white">Target ZIP Clusters</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {zipClusters.map((cluster) => (
                        <label key={cluster.zip} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedZIPs.includes(cluster.zip)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedZIPs([...selectedZIPs, cluster.zip]);
                              } else {
                                setSelectedZIPs(selectedZIPs.filter(zip => zip !== cluster.zip));
                              }
                            }}
                            className="rounded border-slate-600"
                          />
                          <div className="text-xs">
                            <div className="text-white font-medium">{cluster.zip}</div>
                            <div className="text-slate-400">{cluster.region}</div>
                            <div className={`text-xs ${getEngagementColor(cluster.civicEngagement)}`}>
                              {cluster.civicEngagement}% engagement
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-slate-400">
                      {selectedZIPs.length} ZIP clusters selected
                    </div>
                  </div>

                  {/* Target Decks */}
                  <div className="space-y-2">
                    <Label className="text-white">Target Decks</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 18].map((deckId) => (
                        <button
                          key={deckId}
                          onClick={() => {
                            if (selectedDecks.includes(deckId)) {
                              setSelectedDecks(selectedDecks.filter(d => d !== deckId));
                            } else {
                              setSelectedDecks([...selectedDecks, deckId]);
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            selectedDecks.includes(deckId)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Deck {deckId}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-slate-400">
                      {selectedDecks.length} decks selected
                    </div>
                  </div>

                  {/* Prompt Type */}
                  <div className="space-y-2">
                    <Label className="text-white">Prompt Type</Label>
                    <Select value={promptType} onValueChange={setPromptType}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select prompt type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="municipal">Municipal</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                        <SelectItem value="transparency">Transparency</SelectItem>
                        <SelectItem value="participation">Participation</SelectItem>
                        <SelectItem value="trust">Trust Building</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Message (Optional) */}
                  <div className="space-y-2">
                    <Label className="text-white">Custom Message (Optional)</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Leave blank for AI-generated content"
                      className="bg-slate-700 border-slate-600 text-white resize-none"
                      rows={3}
                    />
                    <div className="text-xs text-slate-400">
                      {customMessage.length}/160 characters
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateRipple}
                    disabled={selectedZIPs.length === 0 || selectedDecks.length === 0 || !promptType || isCreating}
                    className="w-full"
                  >
                    {isCreating ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Creating Ripple...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Launch Campaign Ripple
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* ZIP Cluster Overview */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">ZIP Cluster Analysis</CardTitle>
                  <CardDescription className="text-slate-400">
                    Civic engagement and sentiment overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {zipClusters.slice(0, 6).map((cluster) => (
                      <div key={cluster.zip} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{cluster.zip}</span>
                            <Badge variant="outline" className="text-xs">
                              {cluster.activeCIDs} CIDs
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400">{cluster.region}</div>
                          <div className="flex gap-4 text-xs mt-1">
                            <span className={`${getEngagementColor(cluster.civicEngagement)}`}>
                              {cluster.civicEngagement}% engagement
                            </span>
                            <span className={`${getEngagementColor(cluster.sentimentIndex)}`}>
                              {cluster.sentimentIndex}% sentiment
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">
                            {cluster.population.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400">population</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ripple History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Campaign Ripples</CardTitle>
                <CardDescription className="text-slate-400">
                  History of launched campaign ripples and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rippleHistory.length > 0 ? (
                    rippleHistory.map((ripple) => (
                      <Card key={ripple.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(ripple.status)}
                                <span className="font-medium text-white capitalize">
                                  {ripple.promptType.replace('_', ' ')}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {ripple.zipClusters.length} ZIP{ripple.zipClusters.length !== 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {ripple.targetDecks.length} deck{ripple.targetDecks.length !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-slate-300 mb-2 line-clamp-2">
                                {ripple.messageTemplate}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatTimestamp(ripple.timestamp)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {ripple.zipClusters.join(', ')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {ripple.actualReach?.toLocaleString() || ripple.expectedReach.toLocaleString()} reach
                                </span>
                                {ripple.responseRate && (
                                  <span className="flex items-center gap-1 text-green-400">
                                    <Eye className="w-3 h-3" />
                                    {(ripple.responseRate * 100).toFixed(1)}% response
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Waves className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <h3 className="text-lg font-medium mb-2">No Campaign Ripples</h3>
                      <p>Create your first campaign ripple to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompt Queue Tab */}
          <TabsContent value="prompts" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Generated Prompt Queue</CardTitle>
                <CardDescription className="text-slate-400">
                  LLM-generated prompts ready for campaign deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promptQueue.length > 0 ? (
                    promptQueue.map((prompt) => (
                      <Card key={prompt.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(prompt.priority)}>
                                  {prompt.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {prompt.promptType.replace('_', ' ')}
                                </Badge>
                                {prompt.metadata.llmGenerated && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                                    AI-Generated
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-sm text-white mb-2">
                                {prompt.content}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span>{formatTimestamp(prompt.timestamp)}</span>
                                <span>{prompt.context.region}</span>
                                <span>{prompt.estimatedImpact}% estimated impact</span>
                                <span>{prompt.targeting.maxAudience} max audience</span>
                                {prompt.metadata.generationTime && (
                                  <span>{prompt.metadata.generationTime}ms generation</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <h3 className="text-lg font-medium mb-2">No Generated Prompts</h3>
                      <p>Prompts will appear here when campaign ripples are created</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing ZIPs */}
              {campaignStats?.topPerformingZIPs.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Top Performing ZIP Codes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {campaignStats.topPerformingZIPs.map((zip: string, index: number) => {
                        const cluster = zipClusters.find(c => c.zip === zip);
                        if (!cluster) return null;
                        
                        return (
                          <div key={zip} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                            <div>
                              <div className="font-medium text-white">#{index + 1} {zip}</div>
                              <div className="text-xs text-slate-400">{cluster.region}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${getEngagementColor(cluster.civicEngagement)}`}>
                                {cluster.civicEngagement}%
                              </div>
                              <div className="text-xs text-slate-400">engagement</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Engagement by Deck */}
              {campaignStats?.engagementByDeck && Object.keys(campaignStats.engagementByDeck).length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Engagement by Deck
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(campaignStats.engagementByDeck)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 8)
                        .map(([deckId, engagement]) => (
                          <div key={deckId} className="flex items-center justify-between">
                            <span className="text-white">Deck {deckId}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, ((engagement as number) / 2000) * 100)}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-400 min-w-0">
                                {(engagement as number).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Deck #10 Feedback Sync Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback Summary */}
              {feedbackData && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Deck #10 Feedback Summary
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Latest governance feedback sync from Deck #10
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-700 rounded-lg">
                          <div className="text-2xl font-bold text-white">
                            {feedbackData.feedbackEntries.length}
                          </div>
                          <div className="text-xs text-slate-400">Total Entries</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700 rounded-lg">
                          <div className="text-2xl font-bold text-orange-400">
                            {feedbackData.feedbackEntries.filter((e: any) => e.priorityLevel === 'high' || e.priorityLevel === 'urgent').length}
                          </div>
                          <div className="text-xs text-slate-400">High Priority</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-white">Recent Feedback</h4>
                        {feedbackData.feedbackEntries.slice(0, 3).map((entry: any) => (
                          <div key={entry.id} className="p-2 bg-slate-700 rounded text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getPriorityColor(entry.priorityLevel)}>
                                {entry.priorityLevel}
                              </Badge>
                              <span className="text-slate-400">{entry.zipCode}</span>
                            </div>
                            <div className="text-white line-clamp-2">{entry.content}</div>
                            <div className="text-slate-400 mt-1">
                              Sentiment: {entry.sentimentScore}% | Dissonance: {entry.dissonanceIndex}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Execution Statistics */}
              {executionStats && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Nudge Execution Stats
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Campaign ripple execution performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-700 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">
                            {executionStats.totalExecutions}
                          </div>
                          <div className="text-xs text-slate-400">Total Executions</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">
                            {(executionStats.averageResponseRate * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-400">Avg Response Rate</div>
                        </div>
                      </div>
                      
                      {executionStats.topPerformingZIPs.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">Top Performing ZIPs</h4>
                          {executionStats.topPerformingZIPs.slice(0, 3).map((zip: string, index: number) => (
                            <div key={zip} className="flex items-center justify-between p-2 bg-slate-700 rounded text-xs">
                              <span className="text-white">#{index + 1} {zip}</span>
                              <span className="text-green-400">High Performance</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-slate-400">
                        Average execution latency: {executionStats.averageExecutionLatency?.toFixed(0) || 0}ms
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Cross-Deck Integration Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Cross-Deck Integration Status</CardTitle>
                <CardDescription className="text-slate-400">
                  Deck #10 feedback sync with ripple campaign targeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">DeckWalkerAgent Integration</div>
                      <div className="text-xs text-slate-400">Route validation and trigger activation</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">NudgeSignalEmitter Sync</div>
                      <div className="text-xs text-slate-400">Representative dissonance monitoring active</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">ZIP Code Localization</div>
                      <div className="text-xs text-slate-400">Civic registration data overlay mapping</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Contextual Deck Targeting</div>
                      <div className="text-xs text-slate-400">Feedback → Voting → Vault deck routing</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}