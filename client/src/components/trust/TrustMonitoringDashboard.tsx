/**
 * TrustMonitoringDashboard.tsx
 * Phase X-D Step 3: Trust sentiment monitoring dashboard interface
 * Commander Mark authorization via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Users, 
  Clock, 
  BarChart3,
  RefreshCw,
  Bell,
  Radio
} from 'lucide-react';
import TTSToggle from '@/components/tts/TTSToggle';
import TrustSentimentMonitor, { SentimentAlert, MonitoringMetrics } from './TrustSentimentMonitor';
import TrustSentimentAggregator, { DeckSentimentMetrics } from './TrustSentimentAggregator';
import FeedbackOrchestrationEngine from './FeedbackOrchestrationEngine';
import ProductionSimulationEngine from './ProductionSimulationEngine';
import ZKPMintTriggerAgent from './ZKPMintTriggerAgent';
import TrustFusionOrchestrator from './TrustFusionOrchestrator';

export const TrustMonitoringDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [monitoringMetrics, setMonitoringMetrics] = useState<MonitoringMetrics | null>(null);
  const [deckMetrics, setDeckMetrics] = useState<DeckSentimentMetrics[]>([]);
  const [orchestrationMetrics, setOrchestrationMetrics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SentimentAlert | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<any>(null);

  const monitor = TrustSentimentMonitor.getInstance();
  const aggregator = TrustSentimentAggregator.getInstance();
  const orchestrator = FeedbackOrchestrationEngine.getInstance();
  const simulator = ProductionSimulationEngine.getInstance();
  const mintTrigger = ZKPMintTriggerAgent.getInstance();
  const fusionOrchestrator = TrustFusionOrchestrator.getInstance();

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);
      
      // Load alerts and metrics
      const currentAlerts = monitor.getActiveAlerts();
      const metrics = monitor.getMonitoringMetrics();
      const allDecks = aggregator.getAllDeckMetrics();
      const orchMetrics = orchestrator.getOrchestrationMetrics();
      const simStatus = simulator.getSimulationStatus();
      
      setAlerts(currentAlerts);
      setMonitoringMetrics(metrics);
      setDeckMetrics(allDecks);
      setOrchestrationMetrics(orchMetrics);
      setSimulationStatus(simStatus);
      
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'critical_volatility': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'moderate_volatility': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'system_degradation': return <Shield className="h-4 w-4 text-red-600" />;
      default: return <Bell className="h-4 w-4 text-blue-600" />;
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

  const dashboardContent = `Trust monitoring dashboard showing ${alerts.length} active alerts, ${deckMetrics.length} monitored decks, and system health status. Monitoring metrics include ${monitoringMetrics?.totalAggregationCycles || 0} aggregation cycles completed.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Trust Sentiment Monitor</h1>
          <p className="text-muted-foreground">
            Real-time volatility tracking and alert management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TTSToggle
            deckId="trust_monitoring"
            moduleId="dashboard"
            content={dashboardContent}
            size="sm"
            variant="outline"
          />
          <Button 
            onClick={loadDashboardData} 
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Monitored Decks</p>
                <p className="text-2xl font-bold">{deckMetrics.length}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cycles Complete</p>
                <p className="text-2xl font-bold">{monitoringMetrics?.totalAggregationCycles || 0}</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Cycle Time</p>
                <p className="text-2xl font-bold">
                  {monitoringMetrics?.averageCycleTime.toFixed(0) || 0}ms
                </p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="decks">Deck Status</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
          <TabsTrigger value="simulation">Simulation Mode</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Volatility spikes and system health notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No active alerts</p>
                  <p className="text-xs text-muted-foreground">System monitoring normally</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${getSeverityColor(alert.severity)}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {getAlertIcon(alert.alertType)}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium">
                                {alert.deckId.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(alert.timestamp)}</span>
                              <span>
                                {(alert.metrics.changePercent * 100).toFixed(1)}% change
                              </span>
                              {alert.broadcastRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  <Radio className="h-2 w-2 mr-1" />
                                  Broadcast
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deck Status Tab */}
        <TabsContent value="decks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deckMetrics.map((deck) => (
              <Card key={deck.deckId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {deck.deckId.replace(/_/g, ' ')}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {deck.volatilityFlag && (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                      <Badge variant={deck.netSentiment > 0 ? 'default' : 'secondary'}>
                        {deck.sentimentTrend}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Net Sentiment</span>
                      <span className={deck.netSentiment > 0 ? 'text-green-600' : 'text-red-600'}>
                        {deck.netSentiment > 0 ? '+' : ''}{deck.netSentiment.toFixed(1)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, (deck.netSentiment + 100) / 2))} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">Citizens</div>
                      <div className="text-muted-foreground">{deck.tierBreakdown.citizen.count}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">Governors</div>
                      <div className="text-muted-foreground">{deck.tierBreakdown.governor.count}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">Commanders</div>
                      <div className="text-muted-foreground">{deck.tierBreakdown.commander.count}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{deck.totalSubmissions} submissions</span>
                    <span>{formatTimeAgo(deck.lastUpdated)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* System Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Cycles</span>
                    <span>{monitoringMetrics?.totalAggregationCycles || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Volatility Events</span>
                    <span>{monitoringMetrics?.volatilityEventsDetected || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Health Degradations</span>
                    <span>{monitoringMetrics?.systemHealthDegradations || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Cycle Time</span>
                    <span>{monitoringMetrics?.averageCycleTime.toFixed(1) || 0}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Flow Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Unique Submitters</span>
                    <span>{monitoringMetrics?.userFlowPatterns.uniqueSubmitters || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Submissions/User</span>
                    <span>{monitoringMetrics?.userFlowPatterns.averageSubmissionsPerUser.toFixed(1) || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Peak Activity Hour</span>
                    <span>{monitoringMetrics?.userFlowPatterns.peakActivityHour || 0}:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orchestration Tab */}
        <TabsContent value="orchestration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orchestration Engine Status</CardTitle>
              <CardDescription>
                Real-time feedback processing and rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orchestrationMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="text-lg font-bold">{orchestrationMetrics.totalProcessed}</div>
                    <div className="text-xs text-muted-foreground">Total Processed</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="text-lg font-bold">{orchestrationMetrics.rateLimitViolations}</div>
                    <div className="text-xs text-muted-foreground">Rate Violations</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="text-lg font-bold">{orchestrationMetrics.zkpValidationFailures}</div>
                    <div className="text-xs text-muted-foreground">ZKP Failures</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="text-lg font-bold">
                      {orchestrationMetrics.averageProcessingTime.toFixed(1)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Process Time</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Mode Tab */}
        <TabsContent value="simulation" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Production Rollout Simulation</h3>
            <div className="flex items-center gap-2">
              <Badge variant={simulationMode ? "default" : "secondary"}>
                {simulationMode ? "Live Mode" : "Simulation Mode"}
              </Badge>
              <Button
                onClick={() => setSimulationMode(!simulationMode)}
                size="sm"
                variant="outline"
              >
                Toggle Mode
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simulation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Simulation Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {simulationStatus && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{simulationStatus.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={simulationStatus.progress} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">Current Step</div>
                        <div>{simulationStatus.currentStep}</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">Total Steps</div>
                        <div>{simulationStatus.totalSteps}</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {simulationStatus.isRunning ? 'Simulation running...' : 'Simulation stopped'}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={async () => {
                      await simulator.startSimulation();
                      await loadDashboardData();
                    }}
                    disabled={simulationStatus?.isRunning}
                  >
                    Start 24h Simulation
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      simulator.stopSimulation();
                      loadDashboardData();
                    }}
                    disabled={!simulationStatus?.isRunning}
                  >
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ZKP Mint Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ZKP Mint Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Mint Signals</span>
                    <span>{mintTrigger.getMintTriggerMetrics().totalSignalsEmitted}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="font-medium">Citizens</div>
                      <div>{mintTrigger.getMintTriggerMetrics().signalsByTier.citizen}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="font-medium">Governors</div>
                      <div>{mintTrigger.getMintTriggerMetrics().signalsByTier.governor}</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="font-medium">Commanders</div>
                      <div>{mintTrigger.getMintTriggerMetrics().signalsByTier.commander}</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Total Mint Value</span>
                    <span>{mintTrigger.getMintTriggerMetrics().totalMintValue} TP</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await mintTrigger.checkForMintTriggers();
                    await loadDashboardData();
                  }}
                  className="w-full"
                >
                  Manual Trigger Check
                </Button>
              </CardContent>
            </Card>

            {/* Trust Fusion Integration */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trust Fusion Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Deck Integrations</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Deck #1 (Wallet)</span>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Deck #10 (Governance)</span>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Treasury Module</span>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Fusion Metrics</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Total Syncs</span>
                        <span>{fusionOrchestrator.getFusionMetrics().totalSyncs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Rewards</span>
                        <span>{fusionOrchestrator.getFusionMetrics().totalRewards} TP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Sync Time</span>
                        <span>{fusionOrchestrator.getFusionMetrics().averageSyncDuration.toFixed(1)}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await fusionOrchestrator.orchestrateFinalIntegration();
                          await loadDashboardData();
                        }}
                        className="w-full"
                      >
                        Run Final Integration
                      </Button>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fusionOrchestrator.syncWithDeck1()}
                          className="text-xs"
                        >
                          Sync #1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fusionOrchestrator.syncWithDeck10()}
                          className="text-xs"
                        >
                          Sync #10
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fusionOrchestrator.syncWithTreasury()}
                          className="text-xs"
                        >
                          Treasury
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Accessibility live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Trust monitoring dashboard updated. 
        {alerts.length > 0 && `${alerts.length} active alerts requiring attention.`}
        System monitoring {monitoringMetrics?.totalAggregationCycles || 0} aggregation cycles complete.
      </div>
    </div>
  );
};

export default TrustMonitoringDashboard;