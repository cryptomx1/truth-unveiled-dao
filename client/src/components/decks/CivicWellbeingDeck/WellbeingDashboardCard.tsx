import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Users, TrendingUp, Activity, AlertTriangle, Sparkles, Shield, CheckCircle2, Clock, Target } from "lucide-react";

interface WellbeingMetrics {
  mentalHealthAccess: {
    score: number;
    status: "excellent" | "good" | "concerning" | "critical";
    providerAvailability: number;
    averageWaitTime: number;
    emergencyResponse: boolean;
  };
  socialCohesion: {
    score: number;
    status: "strong" | "stable" | "fragile" | "disconnected";
    strongBonds: number;
    totalConnections: number;
    disengagementRate: number;
    communityTrust: number;
  };
  communityEngagement: {
    score: number;
    status: "active" | "moderate" | "low" | "inactive";
    participationRate: number;
    volunteerHours: number;
    eventAttendance: number;
  };
  overallWellbeing: {
    index: number;
    riskLevel: "low" | "moderate" | "high" | "critical";
    trend: "improving" | "stable" | "declining";
    zkpVerificationRate: number;
  };
}

interface WellbeingAlert {
  id: string;
  type: "access_critical" | "social_disconnect" | "engagement_low" | "overall_risk";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface TrustVolatilityBand {
  period: string;
  volatility: number;
  status: "stable" | "moderate" | "high" | "extreme";
}

const mockWellbeingMetrics: WellbeingMetrics = {
  mentalHealthAccess: {
    score: 78,
    status: "good",
    providerAvailability: 73,
    averageWaitTime: 8.5,
    emergencyResponse: true
  },
  socialCohesion: {
    score: 82,
    status: "strong",
    strongBonds: 3,
    totalConnections: 5,
    disengagementRate: 18,
    communityTrust: 85
  },
  communityEngagement: {
    score: 69,
    status: "moderate",
    participationRate: 67,
    volunteerHours: 12,
    eventAttendance: 8
  },
  overallWellbeing: {
    index: 76.3,
    riskLevel: "moderate",
    trend: "stable",
    zkpVerificationRate: 91
  }
};

const mockAlerts: WellbeingAlert[] = [
  {
    id: "alert_001",
    type: "access_critical",
    severity: "warning",
    message: "Mental health access below 20% threshold detected",
    timestamp: "2025-07-16T20:15:00Z",
    resolved: false
  },
  {
    id: "alert_002",
    type: "social_disconnect",
    severity: "info",
    message: "Social disengagement rate: 28% (approaching 30% threshold)",
    timestamp: "2025-07-16T19:45:00Z",
    resolved: true
  },
  {
    id: "alert_003",
    type: "overall_risk",
    severity: "critical",
    message: "Overall wellbeing risk index exceeds 40% threshold",
    timestamp: "2025-07-16T18:30:00Z",
    resolved: false
  }
];

const mockVolatilityBands: TrustVolatilityBand[] = [
  { period: "24h", volatility: 12.4, status: "moderate" },
  { period: "7d", volatility: 8.7, status: "stable" },
  { period: "30d", volatility: 15.2, status: "high" }
];

export default function WellbeingDashboardCard() {
  const [metrics, setMetrics] = useState<WellbeingMetrics>(mockWellbeingMetrics);
  const [alerts, setAlerts] = useState<WellbeingAlert[]>(mockAlerts);
  const [volatilityBands, setVolatilityBands] = useState<TrustVolatilityBand[]>(mockVolatilityBands);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [overallRiskAlert, setOverallRiskAlert] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSpeech, setLastSpeech] = useState<number>(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // TTS function with proper cancellation
  const speak = (text: string) => {
    const now = Date.now();
    if (now - lastSpeech < 2000) return; // Throttle TTS calls
    
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setLastSpeech(now);
    }
  };

  // Component mount TTS
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Wellbeing dashboard interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Real-time metrics updates
  useEffect(() => {
    const updateTimer = setInterval(() => {
      setMetrics(prev => {
        // Add small random fluctuations to simulate real-time data
        const mentalHealthVariance = (Math.random() - 0.5) * 10;
        const socialCohesionVariance = (Math.random() - 0.5) * 8;
        const engagementVariance = (Math.random() - 0.5) * 12;
        
        const newMentalHealth = Math.max(0, Math.min(100, prev.mentalHealthAccess.score + mentalHealthVariance));
        const newSocialCohesion = Math.max(0, Math.min(100, prev.socialCohesion.score + socialCohesionVariance));
        const newEngagement = Math.max(0, Math.min(100, prev.communityEngagement.score + engagementVariance));
        
        // Calculate overall wellbeing index (weighted average)
        const overallIndex = (newMentalHealth * 0.4) + (newSocialCohesion * 0.35) + (newEngagement * 0.25);
        
        // Determine risk level based on overall index
        const riskLevel: WellbeingMetrics["overallWellbeing"]["riskLevel"] = 
          overallIndex >= 80 ? "low" :
          overallIndex >= 60 ? "moderate" :
          overallIndex >= 40 ? "high" : "critical";

        return {
          ...prev,
          mentalHealthAccess: {
            ...prev.mentalHealthAccess,
            score: newMentalHealth,
            status: getHealthStatus(newMentalHealth)
          },
          socialCohesion: {
            ...prev.socialCohesion,
            score: newSocialCohesion,
            status: getSocialStatus(newSocialCohesion)
          },
          communityEngagement: {
            ...prev.communityEngagement,
            score: newEngagement,
            status: getEngagementStatus(newEngagement)
          },
          overallWellbeing: {
            ...prev.overallWellbeing,
            index: overallIndex,
            riskLevel: riskLevel
          }
        };
      });
    }, 6000);

    return () => clearInterval(updateTimer);
  }, []);

  // Overall risk monitoring (>40% threshold)
  useEffect(() => {
    const riskTimer = setInterval(() => {
      const riskThreshold = 40;
      const currentRisk = 100 - metrics.overallWellbeing.index; // Convert to risk percentage
      
      // Add variance for testing
      const variance = (Math.random() - 0.5) * 30; // ±15% variance
      const testRiskLevel = Math.max(0, Math.min(100, currentRisk + variance));
      
      if (testRiskLevel > riskThreshold) {
        setOverallRiskAlert(true);
        setShowPathB(true);
        console.log(`⚠️ Overall wellbeing risk: ${testRiskLevel.toFixed(1)}% (exceeds 40% threshold)`);
        setTimeout(() => {
          setOverallRiskAlert(false);
          setShowPathB(false);
        }, 4000);
      }
    }, 20000);

    return () => clearInterval(riskTimer);
  }, [metrics.overallWellbeing.index]);

  // Update volatility bands
  useEffect(() => {
    const volatilityTimer = setInterval(() => {
      setVolatilityBands(prev => prev.map(band => ({
        ...band,
        volatility: Math.max(0, Math.min(50, band.volatility + (Math.random() - 0.5) * 5)),
        status: getVolatilityStatus(band.volatility)
      })));
    }, 12000);

    return () => clearInterval(volatilityTimer);
  }, []);

  // Get status classifications
  const getHealthStatus = (score: number): WellbeingMetrics["mentalHealthAccess"]["status"] => {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "concerning";
    return "critical";
  };

  const getSocialStatus = (score: number): WellbeingMetrics["socialCohesion"]["status"] => {
    if (score >= 80) return "strong";
    if (score >= 65) return "stable";
    if (score >= 45) return "fragile";
    return "disconnected";
  };

  const getEngagementStatus = (score: number): WellbeingMetrics["communityEngagement"]["status"] => {
    if (score >= 75) return "active";
    if (score >= 55) return "moderate";
    if (score >= 35) return "low";
    return "inactive";
  };

  const getVolatilityStatus = (volatility: number): TrustVolatilityBand["status"] => {
    if (volatility <= 10) return "stable";
    if (volatility <= 20) return "moderate";
    if (volatility <= 35) return "high";
    return "extreme";
  };

  // Get status colors
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "excellent":
      case "strong":
      case "active":
      case "stable":
        return "text-green-400";
      case "good":
      case "moderate":
        return "text-blue-400";
      case "concerning":
      case "fragile":
      case "low":
        return "text-amber-400";
      case "critical":
      case "disconnected":
      case "inactive":
      case "high":
      case "extreme":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  // Get risk level color
  const getRiskColor = (riskLevel: WellbeingMetrics["overallWellbeing"]["riskLevel"]): string => {
    switch (riskLevel) {
      case "low":
        return "text-green-400";
      case "moderate":
        return "text-amber-400";
      case "high":
        return "text-orange-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  // Get severity colors
  const getSeverityColor = (severity: WellbeingAlert["severity"]): string => {
    switch (severity) {
      case "info":
        return "bg-blue-600";
      case "warning":
        return "bg-amber-600";
      case "critical":
        return "bg-red-600";
      default:
        return "bg-slate-600";
    }
  };

  // Handle dashboard refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate dashboard refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate new snapshot
    const timestamp = new Date().toISOString();
    speak("Dashboard refreshed");
    console.log(`✅ Wellbeing dashboard refreshed: ${timestamp}`);
    console.log(`📊 Overall index: ${metrics.overallWellbeing.index.toFixed(1)}% | Risk: ${metrics.overallWellbeing.riskLevel}`);
    
    setIsRefreshing(false);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.severity === "critical");

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-purple-400" />
          Wellbeing Dashboard
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Target className="h-3 w-3" />
          <span>Index: {metrics.overallWellbeing.index.toFixed(1)}%</span>
          <span>•</span>
          <span className={getRiskColor(metrics.overallWellbeing.riskLevel)}>
            Risk: {metrics.overallWellbeing.riskLevel}
          </span>
          {criticalAlerts.length > 0 && (
            <>
              <span>•</span>
              <Badge variant="destructive" className="text-xs">
                {criticalAlerts.length} Critical
              </Badge>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Wellbeing Index */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Overall Wellbeing Index</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getRiskColor(metrics.overallWellbeing.riskLevel)}`}>
                {metrics.overallWellbeing.index.toFixed(1)}%
              </span>
              {metrics.overallWellbeing.zkpVerificationRate >= 90 && (
                <Shield className="h-3 w-3 text-blue-400" />
              )}
            </div>
          </div>
          <Progress 
            value={metrics.overallWellbeing.index} 
            className="h-2 bg-slate-700"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Risk Level: {metrics.overallWellbeing.riskLevel}</span>
            <span className="text-slate-400">ZKP: {metrics.overallWellbeing.zkpVerificationRate}%</span>
          </div>
        </div>

        {/* Component Metrics */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-300">Component Health</div>
          
          {/* Mental Health Access */}
          <div className="p-2 bg-slate-700/50 rounded-md border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-white">Mental Health Access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(metrics.mentalHealthAccess.status)}`}>
                  {metrics.mentalHealthAccess.score.toFixed(0)}%
                </span>
                <Badge className={`text-xs ${getStatusColor(metrics.mentalHealthAccess.status)} bg-slate-600`}>
                  {metrics.mentalHealthAccess.status}
                </Badge>
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Providers: {metrics.mentalHealthAccess.providerAvailability}% | Wait: {metrics.mentalHealthAccess.averageWaitTime.toFixed(1)}d
            </div>
          </div>

          {/* Social Cohesion */}
          <div className="p-2 bg-slate-700/50 rounded-md border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-white">Social Cohesion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(metrics.socialCohesion.status)}`}>
                  {metrics.socialCohesion.score.toFixed(0)}%
                </span>
                <Badge className={`text-xs ${getStatusColor(metrics.socialCohesion.status)} bg-slate-600`}>
                  {metrics.socialCohesion.status}
                </Badge>
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Bonds: {metrics.socialCohesion.strongBonds}/{metrics.socialCohesion.totalConnections} | Trust: {metrics.socialCohesion.communityTrust}
            </div>
          </div>

          {/* Community Engagement */}
          <div className="p-2 bg-slate-700/50 rounded-md border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">Community Engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(metrics.communityEngagement.status)}`}>
                  {metrics.communityEngagement.score.toFixed(0)}%
                </span>
                <Badge className={`text-xs ${getStatusColor(metrics.communityEngagement.status)} bg-slate-600`}>
                  {metrics.communityEngagement.status}
                </Badge>
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Participation: {metrics.communityEngagement.participationRate}% | Events: {metrics.communityEngagement.eventAttendance}
            </div>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Trust Volatility Bands */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300">Trust Volatility</div>
          <div className="grid grid-cols-3 gap-2">
            {volatilityBands.map(band => (
              <div key={band.period} className="text-center">
                <div className="text-xs text-slate-400">{band.period}</div>
                <div className={`text-sm font-medium ${getStatusColor(band.status)}`}>
                  {band.volatility.toFixed(1)}%
                </div>
                <div className={`text-xs ${getStatusColor(band.status)}`}>
                  {band.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Alerts */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Active Alerts</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {unresolvedAlerts.length}
            </Badge>
          </div>

          <ScrollArea className="h-24">
            <div className="space-y-1 pr-2">
              {unresolvedAlerts.length > 0 ? (
                unresolvedAlerts.map(alert => (
                  <div key={alert.id} className="p-2 rounded-md bg-slate-700/30 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getSeverityColor(alert.severity)} text-white`}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDate(alert.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      {alert.message}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-xs text-green-400">
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1" />
                  No active alerts
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Dashboard Controls */}
        <div className="space-y-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600"
            aria-label="Refresh dashboard"
          >
            {isRefreshing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Refreshing Dashboard...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Refresh Wellbeing Snapshot
              </>
            )}
          </Button>
        </div>

        {/* Overall Risk Alert */}
        {overallRiskAlert && (
          <div className="p-2 bg-red-900/50 border border-red-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-300">
                Critical: Overall wellbeing risk exceeds 40% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}