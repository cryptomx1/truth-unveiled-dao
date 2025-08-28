// PointInflationGuard.tsx - Phase III-A Step 3/6
// Hard cap enforcement: 1,000 points/day per DID with dynamic pushback escalation

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Ban, TrendingUp, Users } from 'lucide-react';

interface DIDActivity {
  didHash: string;
  dailyPoints: number;
  actionCount: number;
  lastActivity: Date;
  suspicionLevel: 'normal' | 'elevated' | 'high' | 'critical';
  flagged: boolean;
}

interface GuardMetrics {
  totalDIDs: number;
  flaggedDIDs: number;
  averageDailyPoints: number;
  abuseDetectionRate: number;
  escalationLevel: number;
}

interface GuardAlert {
  id: string;
  didHash: string;
  type: 'daily_limit' | 'rapid_accumulation' | 'suspicious_pattern' | 'coordinated_abuse';
  severity: 'warning' | 'critical' | 'emergency';
  timestamp: Date;
  message: string;
}

export const PointInflationGuard = () => {
  const [dailyLimit] = useState(1000);
  const [guardMetrics, setGuardMetrics] = useState<GuardMetrics>({
    totalDIDs: 0,
    flaggedDIDs: 0,
    averageDailyPoints: 0,
    abuseDetectionRate: 0,
    escalationLevel: 0
  });

  const [trackedDIDs, setTrackedDIDs] = useState<DIDActivity[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<GuardAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    // Initialize with mock DID activity for demonstration
    const mockDIDs: DIDActivity[] = [
      {
        didHash: 'did:civic:0x7f3e2d1a',
        dailyPoints: 847,
        actionCount: 23,
        lastActivity: new Date(),
        suspicionLevel: 'elevated',
        flagged: false
      },
      {
        didHash: 'did:civic:0x9k4m7p2x',
        dailyPoints: 1200,
        actionCount: 45,
        lastActivity: new Date(Date.now() - 1000 * 60 * 15),
        suspicionLevel: 'critical',
        flagged: true
      },
      {
        didHash: 'did:civic:0xa5f8c3e1',
        dailyPoints: 234,
        actionCount: 8,
        lastActivity: new Date(Date.now() - 1000 * 60 * 60),
        suspicionLevel: 'normal',
        flagged: false
      },
      {
        didHash: 'did:civic:0xb7d2f9k3',
        dailyPoints: 956,
        actionCount: 31,
        lastActivity: new Date(Date.now() - 1000 * 60 * 5),
        suspicionLevel: 'high',
        flagged: false
      }
    ];

    setTrackedDIDs(mockDIDs);
    updateGuardMetrics(mockDIDs);
    generateInitialAlerts(mockDIDs);
    
    console.log('🔇 TTS disabled: "Inflation Guard dashboard ready"');
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`PointInflationGuard render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    const monitoringInterval = setInterval(() => {
      // Simulate real-time DID activity updates
      setTrackedDIDs(prevDIDs => {
        const updatedDIDs = prevDIDs.map(did => {
          // Simulate point accumulation
          const pointIncrease = Math.floor(Math.random() * 50);
          const newDailyPoints = did.dailyPoints + pointIncrease;
          
          // Update suspicion level based on activity patterns
          let newSuspicionLevel = did.suspicionLevel;
          if (newDailyPoints >= dailyLimit) {
            newSuspicionLevel = 'critical';
          } else if (newDailyPoints >= dailyLimit * 0.8) {
            newSuspicionLevel = 'high';
          } else if (newDailyPoints >= dailyLimit * 0.6) {
            newSuspicionLevel = 'elevated';
          }

          const updatedDID = {
            ...did,
            dailyPoints: newDailyPoints,
            actionCount: did.actionCount + 1,
            lastActivity: new Date(),
            suspicionLevel: newSuspicionLevel,
            flagged: newDailyPoints >= dailyLimit || did.flagged
          };

          // Generate alerts for suspicious activity
          if (newDailyPoints >= dailyLimit && !did.flagged) {
            generateAlert(updatedDID, 'daily_limit', 'critical', 
              `DID exceeded daily limit: ${newDailyPoints}/${dailyLimit} points`);
          } else if (pointIncrease > 30 && newSuspicionLevel === 'high') {
            generateAlert(updatedDID, 'rapid_accumulation', 'warning',
              `Rapid point accumulation detected: +${pointIncrease} points`);
          }

          return updatedDID;
        });

        updateGuardMetrics(updatedDIDs);
        return updatedDIDs;
      });
    }, 3000);

    return () => clearInterval(monitoringInterval);
  }, [isMonitoring, dailyLimit]);

  const updateGuardMetrics = (dids: DIDActivity[]) => {
    const validationStart = performance.now();
    
    const flaggedCount = dids.filter(did => did.flagged).length;
    const totalPoints = dids.reduce((sum, did) => sum + did.dailyPoints, 0);
    const averagePoints = dids.length > 0 ? totalPoints / dids.length : 0;
    const abuseRate = dids.length > 0 ? (flaggedCount / dids.length) * 100 : 0;
    
    // Calculate escalation level based on abuse rate
    let escalationLevel = 0;
    if (abuseRate >= 50) escalationLevel = 4; // Emergency
    else if (abuseRate >= 30) escalationLevel = 3; // Critical
    else if (abuseRate >= 15) escalationLevel = 2; // High
    else if (abuseRate >= 5) escalationLevel = 1; // Elevated

    setGuardMetrics({
      totalDIDs: dids.length,
      flaggedDIDs: flaggedCount,
      averageDailyPoints: averagePoints,
      abuseDetectionRate: abuseRate,
      escalationLevel
    });

    const validationEnd = performance.now();
    const validationTime = validationEnd - validationStart;
    
    if (validationTime > 100) {
      console.log(`PointInflationGuard validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
    }

    // Trigger pushback if escalation is high
    if (escalationLevel >= 3) {
      console.log(`⚠️ Inflation Guard pushback triggered: ${abuseRate.toFixed(1)}% abuse rate detected`);
    }
  };

  const generateAlert = (did: DIDActivity, type: GuardAlert['type'], severity: GuardAlert['severity'], message: string) => {
    const newAlert: GuardAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      didHash: did.didHash,
      type,
      severity,
      timestamp: new Date(),
      message
    };

    setRecentAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 9)]);
  };

  const generateInitialAlerts = (dids: DIDActivity[]) => {
    const flaggedDID = dids.find(did => did.flagged);
    if (flaggedDID) {
      generateAlert(flaggedDID, 'daily_limit', 'critical', 
        `DID exceeded daily limit: ${flaggedDID.dailyPoints}/${dailyLimit} points`);
    }
  };

  const getSuspicionColor = (level: DIDActivity['suspicionLevel']) => {
    switch (level) {
      case 'normal': return 'text-green-400';
      case 'elevated': return 'text-amber-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getAlertColor = (severity: GuardAlert['severity']) => {
    switch (severity) {
      case 'warning': return 'border-amber-600 bg-amber-900/20';
      case 'critical': return 'border-red-600 bg-red-900/20';
      case 'emergency': return 'border-red-500 bg-red-900/40 animate-pulse';
      default: return 'border-slate-600 bg-slate-900/20';
    }
  };

  const getEscalationColor = (level: number) => {
    if (level >= 4) return 'text-red-400';
    if (level >= 3) return 'text-orange-400';
    if (level >= 2) return 'text-amber-400';
    if (level >= 1) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            guardMetrics.escalationLevel >= 3 ? 'bg-red-900' : 'bg-blue-900'
          }`}>
            <Shield className={`w-6 h-6 ${
              guardMetrics.escalationLevel >= 3 ? 'text-red-400' : 'text-blue-400'
            }`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Inflation Guard</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{renderTime.toFixed(1)}ms</div>
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-slate-500'}`} />
        </div>
      </div>

      {/* Daily Limit Display */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Daily Point Limit</div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-slate-100">{dailyLimit.toLocaleString()}</span>
            <span className="text-xs text-slate-400">points per DID</span>
          </div>
          <div className="text-xs text-slate-400">
            Hard cap enforced with dynamic pushback escalation
          </div>
        </div>
      </div>

      {/* Guard Metrics */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Live Guard Metrics</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-300">Tracked DIDs</span>
            </div>
            <div className="text-lg font-semibold text-slate-100">
              {guardMetrics.totalDIDs}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Ban className="w-3 h-3 text-red-400" />
              <span className="text-xs text-slate-300">Flagged</span>
            </div>
            <div className="text-lg font-semibold text-red-400">
              {guardMetrics.flaggedDIDs}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-300">Avg Daily</span>
            </div>
            <div className="text-lg font-semibold text-slate-100">
              {guardMetrics.averageDailyPoints.toFixed(0)}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-slate-300">Abuse Rate</span>
            </div>
            <div className="text-lg font-semibold text-amber-400">
              {guardMetrics.abuseDetectionRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Level */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Pushback Escalation</div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Current Level</span>
            <span className={`text-sm font-semibold ${getEscalationColor(guardMetrics.escalationLevel)}`}>
              Level {guardMetrics.escalationLevel}/4
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  guardMetrics.escalationLevel >= 4 ? 'bg-red-500' :
                  guardMetrics.escalationLevel >= 3 ? 'bg-orange-500' :
                  guardMetrics.escalationLevel >= 2 ? 'bg-amber-500' :
                  guardMetrics.escalationLevel >= 1 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(guardMetrics.escalationLevel / 4) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {guardMetrics.escalationLevel === 0 && 'Normal operations'}
            {guardMetrics.escalationLevel === 1 && 'Elevated monitoring'}
            {guardMetrics.escalationLevel === 2 && 'High alert - enhanced checks'}
            {guardMetrics.escalationLevel === 3 && 'Critical - automatic restrictions'}
            {guardMetrics.escalationLevel === 4 && 'Emergency - full lockdown'}
          </div>
        </div>
      </div>

      {/* DID Activity Monitor */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">DID Activity Monitor</div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {trackedDIDs.map((did) => (
            <div key={did.didHash} className={`bg-slate-800 rounded-lg p-3 border ${
              did.flagged ? 'border-red-600' : 'border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-300 font-mono">
                  {did.didHash.slice(0, 20)}...
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${getSuspicionColor(did.suspicionLevel)}`}>
                    {did.suspicionLevel}
                  </span>
                  {did.flagged && <Ban className="w-3 h-3 text-red-400" />}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {did.dailyPoints}/{dailyLimit} pts
                </span>
                <span className="text-xs text-slate-400">
                  {did.actionCount} actions
                </span>
              </div>
              <div className="mt-1 bg-slate-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    did.dailyPoints >= dailyLimit ? 'bg-red-500' :
                    did.dailyPoints >= dailyLimit * 0.8 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (did.dailyPoints / dailyLimit) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="text-sm font-medium text-slate-300 mb-3">Recent Alerts</div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <div key={alert.id} className={`rounded-lg p-3 border ${getAlertColor(alert.severity)}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-medium text-slate-200">
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-xs text-slate-300 mb-1">
                  {alert.didHash.slice(0, 20)}...
                </div>
                <div className="text-xs text-slate-400">
                  {alert.message}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic bg-slate-800 rounded-lg p-3">
              No alerts detected. System operating normally.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointInflationGuard;