import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  Eye, 
  Activity,
  Award,
  Target
} from 'lucide-react';

interface TransparencyMetrics {
  totalAudits: number;
  verifiedAudits: number;
  resolvedAnomalies: number;
  totalAnomalies: number;
  zkpValidationRate: number;
  ledgerCoverage: number;
  trustIndex: number;
  lastUpdated: Date;
}

interface TransparencyMetricsCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock transparency metrics aggregated from Modules 1-3
const MOCK_TRANSPARENCY_METRICS: TransparencyMetrics = {
  totalAudits: 10,
  verifiedAudits: 7,
  resolvedAnomalies: 2,
  totalAnomalies: 5,
  zkpValidationRate: 94.2,
  ledgerCoverage: 87.5,
  trustIndex: 89.7,
  lastUpdated: new Date()
};

const getTrustIndexColor = (index: number): string => {
  if (index >= 90) return 'text-green-400';
  if (index >= 80) return 'text-yellow-400';
  if (index >= 70) return 'text-orange-400';
  return 'text-red-400';
};

const getTrustIndexRing = (index: number): string => {
  if (index >= 90) return 'ring-2 ring-green-500/50 animate-pulse';
  if (index >= 80) return 'ring-2 ring-yellow-500/50 animate-pulse';
  if (index >= 70) return 'ring-2 ring-orange-500/50 animate-pulse';
  return 'ring-2 ring-red-500/50 animate-pulse';
};

const getTrustIndexBadge = (index: number): string => {
  if (index >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (index >= 80) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (index >= 70) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const getTrustIndexLabel = (index: number): string => {
  if (index >= 90) return 'Excellent';
  if (index >= 80) return 'Good';
  if (index >= 70) return 'Fair';
  return 'Poor';
};

const getMetricIcon = (type: string) => {
  switch (type) {
    case 'audits':
      return <Shield className="w-4 h-4 text-blue-400" />;
    case 'anomalies':
      return <Activity className="w-4 h-4 text-orange-400" />;
    case 'zkp':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'coverage':
      return <Eye className="w-4 h-4 text-purple-400" />;
    default:
      return <Target className="w-4 h-4 text-slate-400" />;
  }
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const getRelativeTime = (date: Date): string => {
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

export const TransparencyMetricsCard: React.FC<TransparencyMetricsCardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<TransparencyMetrics>(MOCK_TRANSPARENCY_METRICS);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`TransparencyMetricsCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`TransparencyMetricsCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play transparency metrics dashboard ready message on mount
          const utterance = new SpeechSynthesisUtterance("Transparency metrics dashboard ready.");
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

  // Live metrics updates
  useEffect(() => {
    if (!isLiveMode) return;

    const updateInterval = setInterval(() => {
      const updateStart = performance.now();
      
      setMetrics(prev => {
        // Simulate small metric fluctuations
        const newMetrics = {
          ...prev,
          zkpValidationRate: Math.max(90, Math.min(98, prev.zkpValidationRate + (Math.random() - 0.5) * 0.5)),
          ledgerCoverage: Math.max(80, Math.min(95, prev.ledgerCoverage + (Math.random() - 0.5) * 0.3)),
          lastUpdated: new Date()
        };
        
        // Recalculate trust index
        const auditSuccessRate = (newMetrics.verifiedAudits / newMetrics.totalAudits) * 100;
        const anomalyResolutionRate = newMetrics.totalAnomalies > 0 ? (newMetrics.resolvedAnomalies / newMetrics.totalAnomalies) * 100 : 100;
        
        newMetrics.trustIndex = (
          auditSuccessRate * 0.3 +
          anomalyResolutionRate * 0.25 +
          newMetrics.zkpValidationRate * 0.25 +
          newMetrics.ledgerCoverage * 0.2
        );
        
        return newMetrics;
      });
      
      const updateTime = performance.now() - updateStart;
      if (updateTime > 100) {
        console.warn(`Metrics update time: ${updateTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(updateInterval);
  }, [isLiveMode]);

  const playTrustIndexTTS = () => {
    if (!ttsStatus.isReady) return;
    
    const indexLabel = getTrustIndexLabel(metrics.trustIndex);
    const message = `Current civic audit trust index: ${metrics.trustIndex.toFixed(1)} percent, rated as ${indexLabel}.`;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const auditSuccessRate = (metrics.verifiedAudits / metrics.totalAudits) * 100;
  const anomalyResolutionRate = metrics.totalAnomalies > 0 ? (metrics.resolvedAnomalies / metrics.totalAnomalies) * 100 : 100;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        getTrustIndexRing(metrics.trustIndex),
        className
      )}
      role="region"
      aria-label="Transparency Metrics Dashboard"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Transparency Metrics
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Real-time civic audit transparency dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Civic Audit Trust Index */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">
                Civic Audit Trust Index
              </span>
            </div>
            <button
              onClick={playTrustIndexTTS}
              disabled={ttsStatus.isPlaying}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Play trust index announcement"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className={cn('text-3xl font-bold', getTrustIndexColor(metrics.trustIndex))}>
                  {metrics.trustIndex.toFixed(1)}
                </span>
                <span className="text-slate-400 text-sm">/ 100</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn('text-xs', getTrustIndexBadge(metrics.trustIndex))}
              >
                {getTrustIndexLabel(metrics.trustIndex).toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Last Updated</div>
              <div className="text-xs text-slate-300">
                {getRelativeTime(metrics.lastUpdated)}
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress 
              value={metrics.trustIndex} 
              className="h-2"
              aria-label={`Trust index: ${metrics.trustIndex.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Audit Success Rate */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              {getMetricIcon('audits')}
              <span className="text-xs font-medium text-slate-200">
                Audit Success
              </span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {formatPercentage(auditSuccessRate)}
            </div>
            <div className="text-xs text-slate-400">
              {metrics.verifiedAudits}/{metrics.totalAudits} verified
            </div>
          </div>

          {/* Anomaly Resolution Rate */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              {getMetricIcon('anomalies')}
              <span className="text-xs font-medium text-slate-200">
                Anomaly Resolution
              </span>
            </div>
            <div className="text-lg font-bold text-orange-400">
              {formatPercentage(anomalyResolutionRate)}
            </div>
            <div className="text-xs text-slate-400">
              {metrics.resolvedAnomalies}/{metrics.totalAnomalies} resolved
            </div>
          </div>

          {/* ZKP Validation Rate */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              {getMetricIcon('zkp')}
              <span className="text-xs font-medium text-slate-200">
                ZKP Validation
              </span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {formatPercentage(metrics.zkpValidationRate)}
            </div>
            <div className="text-xs text-slate-400">
              Proof verification rate
            </div>
          </div>

          {/* Ledger Coverage */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              {getMetricIcon('coverage')}
              <span className="text-xs font-medium text-slate-200">
                Ledger Coverage
              </span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {formatPercentage(metrics.ledgerCoverage)}
            </div>
            <div className="text-xs text-slate-400">
              Entries monitored
            </div>
          </div>
        </div>

        {/* Detailed Breakdowns */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Metric Breakdowns
          </label>
          
          <div className="space-y-3">
            {/* Audit Verification Progress */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Audit Verification</span>
                <span className="text-xs text-green-400">
                  {formatPercentage(auditSuccessRate)}
                </span>
              </div>
              <Progress 
                value={auditSuccessRate} 
                className="h-1.5"
                aria-label={`Audit success rate: ${formatPercentage(auditSuccessRate)}`}
              />
            </div>

            {/* Anomaly Resolution Progress */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Anomaly Resolution</span>
                <span className="text-xs text-orange-400">
                  {formatPercentage(anomalyResolutionRate)}
                </span>
              </div>
              <Progress 
                value={anomalyResolutionRate} 
                className="h-1.5"
                aria-label={`Anomaly resolution rate: ${formatPercentage(anomalyResolutionRate)}`}
              />
            </div>

            {/* ZKP Validation Progress */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">ZKP Validation</span>
                <span className="text-xs text-green-400">
                  {formatPercentage(metrics.zkpValidationRate)}
                </span>
              </div>
              <Progress 
                value={metrics.zkpValidationRate} 
                className="h-1.5"
                aria-label={`ZKP validation rate: ${formatPercentage(metrics.zkpValidationRate)}`}
              />
            </div>

            {/* Ledger Coverage Progress */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Ledger Coverage</span>
                <span className="text-xs text-purple-400">
                  {formatPercentage(metrics.ledgerCoverage)}
                </span>
              </div>
              <Progress 
                value={metrics.ledgerCoverage} 
                className="h-1.5"
                aria-label={`Ledger coverage: ${formatPercentage(metrics.ledgerCoverage)}`}
              />
            </div>
          </div>
        </div>

        {/* Live Mode Toggle */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-200">Live Updates</div>
              <div className="text-xs text-slate-400">Real-time metric monitoring</div>
            </div>
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                isLiveMode ? 'bg-blue-600' : 'bg-slate-600'
              )}
              aria-label="Toggle live updates"
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  isLiveMode ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Trust Index Calculation */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Trust Index Calculation
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Audit Success Rate: 30% weight</div>
            <div>• Anomaly Resolution Rate: 25% weight</div>
            <div>• ZKP Validation Rate: 25% weight</div>
            <div>• Ledger Coverage: 20% weight</div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="text-xs text-slate-500" aria-live="polite">
              Index updates every 5 seconds with live metrics
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Comprehensive civic audit transparency system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default TransparencyMetricsCard;
