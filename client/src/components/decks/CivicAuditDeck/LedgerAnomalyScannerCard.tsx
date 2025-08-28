import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Shield, 
  Search, 
  Eye, 
  Clock, 
  TrendingUp, 
  Activity, 
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';

type AnomalyType = 'timestamp_gap' | 'gas_spike' | 'hash_collision' | 'circuit_failure' | 'block_orphan';
type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
type ScanStatus = 'idle' | 'scanning' | 'completed' | 'failed';

interface AnomalyDetection {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  affectedEntries: string[];
  timestamp: Date;
  riskScore: number;
  autoResolved: boolean;
}

interface ScanMetrics {
  totalScanned: number;
  anomaliesFound: number;
  criticalIssues: number;
  scanProgress: number;
  estimatedTime: number;
}

interface LedgerAnomalyScannerCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock anomaly data based on audit trail patterns
const MOCK_ANOMALIES: AnomalyDetection[] = [
  {
    id: 'anom_001',
    type: 'gas_spike',
    severity: 'high',
    description: 'Unusual gas consumption spike detected in asset transfer circuit',
    affectedEntries: ['zkp_7d5b249a...f4e8c3', 'zkp_3c7d195a...e8f4b6'],
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    riskScore: 78,
    autoResolved: false
  },
  {
    id: 'anom_002',
    type: 'timestamp_gap',
    severity: 'medium',
    description: 'Irregular timestamp intervals between consecutive audit entries',
    affectedEntries: ['zkp_2a4c683f...e9b2c7', 'zkp_9f3e572b...a6d4b8'],
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    riskScore: 45,
    autoResolved: true
  },
  {
    id: 'anom_003',
    type: 'circuit_failure',
    severity: 'critical',
    description: 'Zero-knowledge proof verification circuit returned inconsistent results',
    affectedEntries: ['zkp_1b8c496d...c2f7a9'],
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    riskScore: 92,
    autoResolved: false
  },
  {
    id: 'anom_004',
    type: 'hash_collision',
    severity: 'low',
    description: 'Potential hash prefix collision detected in proof generation',
    affectedEntries: ['zkp_4e91a7b2...c8f3a2', 'zkp_8c2f914e...b7d5a1'],
    timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
    riskScore: 23,
    autoResolved: true
  },
  {
    id: 'anom_005',
    type: 'block_orphan',
    severity: 'medium',
    description: 'Audit entry references orphaned block in chain reorganization',
    affectedEntries: ['zkp_5e2a738f...b9c6d4'],
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    riskScore: 56,
    autoResolved: false
  }
];

const getAnomalyIcon = (type: AnomalyType) => {
  switch (type) {
    case 'gas_spike':
      return <TrendingUp className="w-4 h-4 text-orange-400" />;
    case 'timestamp_gap':
      return <Clock className="w-4 h-4 text-blue-400" />;
    case 'hash_collision':
      return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'circuit_failure':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'block_orphan':
      return <Activity className="w-4 h-4 text-purple-400" />;
  }
};

const getSeverityColor = (severity: AnomalySeverity): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-400';
    case 'high':
      return 'text-orange-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-green-400';
  }
};

const getSeverityBadgeColor = (severity: AnomalySeverity): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
};

const getRiskScoreColor = (score: number): string => {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
};

const formatAnomalyType = (type: AnomalyType): string => {
  return type.replace('_', ' ').toUpperCase();
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
};

export const LedgerAnomalyScannerCard: React.FC<LedgerAnomalyScannerCardProps> = ({ className }) => {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanMetrics, setScanMetrics] = useState<ScanMetrics>({
    totalScanned: 0,
    anomaliesFound: 0,
    criticalIssues: 0,
    scanProgress: 0,
    estimatedTime: 0
  });
  const [detectedAnomalies, setDetectedAnomalies] = useState<AnomalyDetection[]>([]);
  const [isAutoScanEnabled, setIsAutoScanEnabled] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`LedgerAnomalyScannerCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`LedgerAnomalyScannerCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play anomaly scanner activation message on mount
          const utterance = new SpeechSynthesisUtterance("Ledger anomaly scanner interface activated.");
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

  const playAnomalyAlertTTS = (anomalyCount: number, criticalCount: number) => {
    if (!ttsStatus.isReady) return;
    
    const message = criticalCount > 0 
      ? `Scan complete. ${anomalyCount} anomalies detected including ${criticalCount} critical issues.`
      : `Scan complete. ${anomalyCount} anomalies detected. System stable.`;
    
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

  const runAnomalyScan = async () => {
    const scanStart = performance.now();
    
    setScanStatus('scanning');
    setDetectedAnomalies([]);
    setScanMetrics({
      totalScanned: 0,
      anomaliesFound: 0,
      criticalIssues: 0,
      scanProgress: 0,
      estimatedTime: 3000
    });

    // Simulate progressive scanning
    const scanInterval = setInterval(() => {
      setScanMetrics(prev => {
        const newProgress = Math.min(prev.scanProgress + 15, 100);
        const newScanned = Math.floor((newProgress / 100) * 10);
        
        return {
          ...prev,
          scanProgress: newProgress,
          totalScanned: newScanned,
          estimatedTime: Math.max(0, prev.estimatedTime - 300)
        };
      });
    }, 300);

    // Complete scan after 3 seconds
    setTimeout(() => {
      clearInterval(scanInterval);
      
      const foundAnomalies = MOCK_ANOMALIES.slice(0, Math.floor(Math.random() * 4) + 2);
      const criticalCount = foundAnomalies.filter(a => a.severity === 'critical').length;
      
      setDetectedAnomalies(foundAnomalies);
      setScanStatus('completed');
      setScanMetrics(prev => ({
        ...prev,
        scanProgress: 100,
        totalScanned: 10,
        anomaliesFound: foundAnomalies.length,
        criticalIssues: criticalCount,
        estimatedTime: 0
      }));
      
      setLastScanTime(new Date());
      
      playAnomalyAlertTTS(foundAnomalies.length, criticalCount);
      
      const totalTime = performance.now() - scanStart;
      if (totalTime > 200) {
        console.warn(`Anomaly scan time: ${totalTime.toFixed(2)}ms (exceeds 200ms target)`);
      }
    }, 3000);
  };

  const handleResetScan = () => {
    setScanStatus('idle');
    setDetectedAnomalies([]);
    setScanMetrics({
      totalScanned: 0,
      anomaliesFound: 0,
      criticalIssues: 0,
      scanProgress: 0,
      estimatedTime: 0
    });
    setLastScanTime(null);
  };

  const getStatusColor = () => {
    switch (scanStatus) {
      case 'scanning':
        return 'text-blue-400';
      case 'completed':
        return scanMetrics.criticalIssues > 0 ? 'text-red-400' : 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusText = () => {
    switch (scanStatus) {
      case 'scanning':
        return 'Scanning Ledger...';
      case 'completed':
        return 'Scan Complete';
      case 'failed':
        return 'Scan Failed';
      default:
        return 'Ready to Scan';
    }
  };

  const getPulseRingClass = () => {
    if (scanStatus === 'scanning') {
      return 'ring-2 ring-blue-500/50 animate-pulse';
    }
    if (scanStatus === 'completed' && scanMetrics.criticalIssues > 0) {
      return 'ring-2 ring-red-500/50 animate-pulse';
    }
    return 'ring-2 ring-slate-500/50';
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        getPulseRingClass(),
        className
      )}
      role="region"
      aria-label="Ledger Anomaly Scanner"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            Anomaly Scanner
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Real-time ledger anomaly detection and analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Scanner Status */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
          aria-live="polite"
          aria-label="Scanner status"
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className={cn('w-4 h-4', getStatusColor())} />
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
          
          {scanStatus === 'scanning' && (
            <div className="space-y-2">
              <Progress value={scanMetrics.scanProgress} className="h-2" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress: {scanMetrics.scanProgress}%</span>
                <span>ETA: {Math.ceil(scanMetrics.estimatedTime / 1000)}s</span>
              </div>
            </div>
          )}
          
          {lastScanTime && scanStatus === 'completed' && (
            <div className="text-xs text-slate-400">
              Last scan: {getRelativeTime(lastScanTime)}
            </div>
          )}
        </div>

        {/* Scan Metrics */}
        {scanStatus === 'completed' && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">
                Scan Results
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-200">{scanMetrics.totalScanned}</div>
                <div className="text-slate-400">Entries Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{scanMetrics.anomaliesFound}</div>
                <div className="text-slate-400">Anomalies Found</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{scanMetrics.criticalIssues}</div>
                <div className="text-slate-400">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  {scanMetrics.totalScanned - scanMetrics.anomaliesFound}
                </div>
                <div className="text-slate-400">Clean Entries</div>
              </div>
            </div>
          </div>
        )}

        {/* Detected Anomalies */}
        {detectedAnomalies.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Detected Anomalies
            </label>
            
            <ScrollArea className="h-48 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <div className="p-3 space-y-3">
                {detectedAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      'hover:bg-slate-700/30',
                      anomaly.severity === 'critical' 
                        ? 'bg-red-900/20 border-red-500/30' 
                        : 'bg-slate-800/50 border-slate-700/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAnomalyIcon(anomaly.type)}
                        <span className="text-xs font-medium text-slate-200">
                          {formatAnomalyType(anomaly.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getSeverityBadgeColor(anomaly.severity))}
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                        {anomaly.autoResolved ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="text-slate-300 leading-relaxed">
                        {anomaly.description}
                      </div>
                      
                      <div className="flex justify-between text-slate-400">
                        <span>Risk Score:</span>
                        <span className={getRiskScoreColor(anomaly.riskScore)}>
                          {anomaly.riskScore}/100
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-slate-400">
                        <span>Affected Entries:</span>
                        <span className="text-slate-300">{anomaly.affectedEntries.length}</span>
                      </div>
                      
                      <div className="flex justify-between text-slate-400">
                        <span>Detected:</span>
                        <span className="text-slate-300">{getRelativeTime(anomaly.timestamp)}</span>
                      </div>
                      
                      <div className="flex justify-between text-slate-400">
                        <span>Status:</span>
                        <span className={anomaly.autoResolved ? 'text-green-400' : 'text-red-400'}>
                          {anomaly.autoResolved ? 'Auto-Resolved' : 'Requires Action'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Auto-Scan Toggle */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-200">Auto-Scan</div>
              <div className="text-xs text-slate-400">Continuous anomaly monitoring</div>
            </div>
            <button
              onClick={() => setIsAutoScanEnabled(!isAutoScanEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                isAutoScanEnabled ? 'bg-blue-600' : 'bg-slate-600'
              )}
              aria-label="Toggle auto-scan"
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  isAutoScanEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Scanner Controls */}
        <div className="flex gap-2">
          <Button
            onClick={runAnomalyScan}
            disabled={scanStatus === 'scanning'}
            className={cn(
              'flex-1 min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Start anomaly scan"
          >
            {scanStatus === 'scanning' ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Scan
              </>
            )}
          </Button>
          
          {scanStatus === 'completed' && (
            <Button
              onClick={handleResetScan}
              variant="outline"
              className={cn(
                'min-h-[48px] px-4',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              aria-label="Reset scanner"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Scanner Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Detection Capabilities
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Timestamp irregularities and chronological inconsistencies</div>
            <div>• Gas consumption spikes and resource usage anomalies</div>
            <div>• ZKP circuit failures and verification inconsistencies</div>
            <div>• Hash collisions and cryptographic irregularities</div>
            <div>• Block orphaning and chain reorganization impacts</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Advanced ledger anomaly detection system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default LedgerAnomalyScannerCard;
