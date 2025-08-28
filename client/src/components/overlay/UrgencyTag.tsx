// UrgencyTag.tsx - Phase III-A Step 5/6
// UI-level tagging for urgency: info, warning, urgent, critical
// Pushback trigger at ≥30% critical-tagged overlays (simulate 50 urgent alerts)

import { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, Zap, Bell } from 'lucide-react';

export type UrgencyLevel = 'info' | 'warning' | 'urgent' | 'critical';

interface UrgencyTagProps {
  level: UrgencyLevel;
  message: string;
  overlayId: string;
  onLevelChange?: (level: UrgencyLevel, overlayId: string) => void;
  onPushbackTrigger?: (criticalCount: number, totalCount: number) => void;
  testingMode?: boolean;
}

interface UrgencyMetrics {
  totalAlerts: number;
  criticalCount: number;
  urgentCount: number;
  warningCount: number;
  infoCount: number;
  criticalPercentage: number;
  pushbackTriggered: boolean;
}

// Global state for urgency tracking
let globalUrgencyMetrics: UrgencyMetrics = {
  totalAlerts: 0,
  criticalCount: 0,
  urgentCount: 0,
  warningCount: 0,
  infoCount: 0,
  criticalPercentage: 0,
  pushbackTriggered: false
};

let urgencyRegistry: Map<string, UrgencyLevel> = new Map();

export const UrgencyTag = ({ 
  level, 
  message, 
  overlayId, 
  onLevelChange,
  onPushbackTrigger,
  testingMode = false 
}: UrgencyTagProps) => {
  const [currentLevel, setCurrentLevel] = useState<UrgencyLevel>(level);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [pulseActive, setPulseActive] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  useEffect(() => {
    const startTime = performance.now();
    
    // Register this overlay's urgency level
    urgencyRegistry.set(overlayId, currentLevel);
    updateGlobalMetrics();
    
    // Trigger pulse animation for urgent/critical
    if (currentLevel === 'urgent' || currentLevel === 'critical') {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 2000);
    }

    console.log('🔇 TTS disabled: "Urgency tag rendered"');

    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`UrgencyTag render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }

    // Cleanup on unmount
    return () => {
      urgencyRegistry.delete(overlayId);
      updateGlobalMetrics();
    };
  }, [currentLevel, overlayId]);

  useEffect(() => {
    // Simulate 50 urgent alerts for testing
    if (testingMode && !simulationActive) {
      simulateUrgentAlerts();
    }
  }, [testingMode, simulationActive]);

  const updateGlobalMetrics = () => {
    const levels = Array.from(urgencyRegistry.values());
    
    globalUrgencyMetrics = {
      totalAlerts: levels.length,
      criticalCount: levels.filter(l => l === 'critical').length,
      urgentCount: levels.filter(l => l === 'urgent').length,
      warningCount: levels.filter(l => l === 'warning').length,
      infoCount: levels.filter(l => l === 'info').length,
      criticalPercentage: levels.length > 0 ? (levels.filter(l => l === 'critical').length / levels.length) * 100 : 0,
      pushbackTriggered: false
    };

    // Check for pushback trigger (≥30% critical)
    if (globalUrgencyMetrics.criticalPercentage >= 30) {
      globalUrgencyMetrics.pushbackTriggered = true;
      console.log(`⚠️ Urgency pushback triggered: ${globalUrgencyMetrics.criticalPercentage.toFixed(1)}% critical alerts`);
      
      onPushbackTrigger?.(globalUrgencyMetrics.criticalCount, globalUrgencyMetrics.totalAlerts);
    }
  };

  const simulateUrgentAlerts = () => {
    setSimulationActive(true);
    
    // Create 50 simulated urgent/critical alerts
    const simulatedOverlays = Array.from({ length: 50 }, (_, i) => ({
      id: `sim_overlay_${i}`,
      level: i < 20 ? 'critical' : 'urgent' as UrgencyLevel
    }));

    simulatedOverlays.forEach(({ id, level }) => {
      urgencyRegistry.set(id, level);
    });

    updateGlobalMetrics();
    
    console.log(`Urgency simulation: ${simulatedOverlays.length} alerts generated`);
    console.log(`Critical percentage: ${globalUrgencyMetrics.criticalPercentage.toFixed(1)}%`);
    
    // Clean up simulation after 10 seconds
    setTimeout(() => {
      simulatedOverlays.forEach(({ id }) => {
        urgencyRegistry.delete(id);
      });
      updateGlobalMetrics();
      setSimulationActive(false);
    }, 10000);
  };

  const getUrgencyConfig = (level: UrgencyLevel) => {
    switch (level) {
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-900',
          textColor: 'text-blue-200',
          borderColor: 'border-blue-600',
          iconColor: 'text-blue-400'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-900',
          textColor: 'text-amber-200',
          borderColor: 'border-amber-600',
          iconColor: 'text-amber-400'
        };
      case 'urgent':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-900',
          textColor: 'text-orange-200',
          borderColor: 'border-orange-600',
          iconColor: 'text-orange-400'
        };
      case 'critical':
        return {
          icon: Zap,
          bgColor: 'bg-red-900',
          textColor: 'text-red-200',
          borderColor: 'border-red-600',
          iconColor: 'text-red-400'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-slate-900',
          textColor: 'text-slate-200',
          borderColor: 'border-slate-600',
          iconColor: 'text-slate-400'
        };
    }
  };

  const handleLevelChange = (newLevel: UrgencyLevel) => {
    setCurrentLevel(newLevel);
    onLevelChange?.(newLevel, overlayId);
    
    // Update registry
    urgencyRegistry.set(overlayId, newLevel);
    updateGlobalMetrics();
  };

  const config = getUrgencyConfig(currentLevel);
  const IconComponent = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor} ${
      pulseActive ? 'animate-pulse' : ''
    }`}>
      <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
      
      <span className={`text-sm font-medium ${config.textColor}`}>
        {currentLevel.toUpperCase()}
      </span>
      
      <span className={`text-xs ${config.textColor} opacity-80`}>
        {message}
      </span>

      {/* Render time indicator */}
      <span className="text-xs text-slate-400">
        {renderTime.toFixed(1)}ms
      </span>

      {/* Testing mode controls */}
      {testingMode && (
        <div className="flex items-center gap-1 ml-2 border-l border-slate-600 pl-2">
          <button
            onClick={() => handleLevelChange('info')}
            className={`w-2 h-2 rounded-full ${currentLevel === 'info' ? 'bg-blue-400' : 'bg-slate-600'}`}
            title="Set to Info"
          />
          <button
            onClick={() => handleLevelChange('warning')}
            className={`w-2 h-2 rounded-full ${currentLevel === 'warning' ? 'bg-amber-400' : 'bg-slate-600'}`}
            title="Set to Warning"
          />
          <button
            onClick={() => handleLevelChange('urgent')}
            className={`w-2 h-2 rounded-full ${currentLevel === 'urgent' ? 'bg-orange-400' : 'bg-slate-600'}`}
            title="Set to Urgent"
          />
          <button
            onClick={() => handleLevelChange('critical')}
            className={`w-2 h-2 rounded-full ${currentLevel === 'critical' ? 'bg-red-400' : 'bg-slate-600'}`}
            title="Set to Critical"
          />
        </div>
      )}

      {/* Pushback indicator */}
      {globalUrgencyMetrics.pushbackTriggered && (
        <div className="flex items-center gap-1 ml-2 border-l border-red-600 pl-2">
          <Bell className="w-3 h-3 text-red-400 animate-pulse" />
          <span className="text-xs text-red-200">
            {globalUrgencyMetrics.criticalPercentage.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Simulation indicator */}
      {simulationActive && (
        <div className="flex items-center gap-1 ml-2 border-l border-amber-600 pl-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-xs text-amber-200">SIM</span>
        </div>
      )}
    </div>
  );
};

// Export global metrics for monitoring
export const getGlobalUrgencyMetrics = (): UrgencyMetrics => {
  return { ...globalUrgencyMetrics };
};

// Export registry for debugging
export const getUrgencyRegistry = (): Map<string, UrgencyLevel> => {
  return new Map(urgencyRegistry);
};

// Reset function for testing
export const resetUrgencyState = () => {
  urgencyRegistry.clear();
  globalUrgencyMetrics = {
    totalAlerts: 0,
    criticalCount: 0,
    urgentCount: 0,
    warningCount: 0,
    infoCount: 0,
    criticalPercentage: 0,
    pushbackTriggered: false
  };
};

export default UrgencyTag;