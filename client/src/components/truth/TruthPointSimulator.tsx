// TruthPointSimulator.tsx - Phase III-A Step 3/6
// Simulates 5,000 contributions with stress testing and pushback triggers

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Activity, AlertTriangle, TrendingDown } from 'lucide-react';

interface SimulationMetrics {
  totalContributions: number;
  pointsGenerated: number;
  volatilityLevel: number;
  failureRate: number;
  pushbackTriggered: boolean;
  averageLatency: number;
}

interface SimulationConfig {
  targetContributions: number;
  failureSimulationRate: number;
  volatilityThreshold: number;
  batchSize: number;
}

export const TruthPointSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [config] = useState<SimulationConfig>({
    targetContributions: 5000,
    failureSimulationRate: 25, // 10-40% tier as per requirements
    volatilityThreshold: 30,
    batchSize: 100
  });

  const [metrics, setMetrics] = useState<SimulationMetrics>({
    totalContributions: 0,
    pointsGenerated: 0,
    volatilityLevel: 0,
    failureRate: 0,
    pushbackTriggered: false,
    averageLatency: 0
  });

  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    console.log('🔇 TTS disabled: "Truth Point Simulator ready"');
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`TruthPointSimulator render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }
  }, []);

  const generateSimulationBatch = (batchNumber: number, batchSize: number): Partial<SimulationMetrics> => {
    const validationStart = performance.now();
    
    // Simulate contribution processing with varying point values
    const contributionPoints = Array.from({ length: batchSize }, () => {
      const tierRoll = Math.random();
      if (tierRoll < 0.4) return 10; // Basic (40%)
      if (tierRoll < 0.7) return 50; // Verified (30%)
      if (tierRoll < 0.9) return 100; // Expert (20%)
      return 200; // Authority (10%)
    });

    // Calculate batch metrics
    const batchPoints = contributionPoints.reduce((sum, points) => sum + points, 0);
    
    // Simulate failures based on configuration
    const simulatedFailures = Math.floor(batchSize * (config.failureSimulationRate / 100));
    const successfulContributions = batchSize - simulatedFailures;
    const currentFailureRate = (simulatedFailures / batchSize) * 100;
    
    // Calculate volatility based on point distribution variance
    const averagePoints = batchPoints / batchSize;
    const variance = contributionPoints.reduce((sum, points) => 
      sum + Math.pow(points - averagePoints, 2), 0) / batchSize;
    const volatility = Math.sqrt(variance) / averagePoints * 100;
    
    const validationEnd = performance.now();
    const batchLatency = validationEnd - validationStart;
    
    // Check for pushback conditions
    const pushbackTriggered = currentFailureRate >= 40 || volatility >= config.volatilityThreshold;
    
    if (pushbackTriggered) {
      console.log(`⚠️ Simulation pushback triggered: ${currentFailureRate.toFixed(1)}% failure rate, ${volatility.toFixed(1)}% volatility`);
    }

    return {
      totalContributions: successfulContributions,
      pointsGenerated: batchPoints - (simulatedFailures * averagePoints),
      volatilityLevel: volatility,
      failureRate: currentFailureRate,
      pushbackTriggered,
      averageLatency: batchLatency
    };
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setSimulationLog([]);
    
    const totalBatches = Math.ceil(config.targetContributions / config.batchSize);
    let accumulatedMetrics: SimulationMetrics = {
      totalContributions: 0,
      pointsGenerated: 0,
      volatilityLevel: 0,
      failureRate: 0,
      pushbackTriggered: false,
      averageLatency: 0
    };

    addToLog(`Starting simulation: ${config.targetContributions} contributions in ${totalBatches} batches`);

    for (let batchIndex = 0; batchIndex < totalBatches && isRunning && !isPaused; batchIndex++) {
      const currentBatchSize = Math.min(config.batchSize, config.targetContributions - accumulatedMetrics.totalContributions);
      
      const batchMetrics = generateSimulationBatch(batchIndex + 1, currentBatchSize);
      
      // Accumulate metrics
      accumulatedMetrics = {
        totalContributions: accumulatedMetrics.totalContributions + (batchMetrics.totalContributions || 0),
        pointsGenerated: accumulatedMetrics.pointsGenerated + (batchMetrics.pointsGenerated || 0),
        volatilityLevel: (accumulatedMetrics.volatilityLevel + (batchMetrics.volatilityLevel || 0)) / 2,
        failureRate: (accumulatedMetrics.failureRate + (batchMetrics.failureRate || 0)) / 2,
        pushbackTriggered: accumulatedMetrics.pushbackTriggered || (batchMetrics.pushbackTriggered || false),
        averageLatency: (accumulatedMetrics.averageLatency + (batchMetrics.averageLatency || 0)) / 2
      };

      setMetrics(accumulatedMetrics);
      
      addToLog(`Batch ${batchIndex + 1}/${totalBatches}: ${batchMetrics.totalContributions} contributions, ${batchMetrics.pointsGenerated?.toFixed(0)} points`);
      
      // Check for critical failure condition
      if (batchMetrics.pushbackTriggered) {
        addToLog(`⚠️ CRITICAL: Pushback triggered in batch ${batchIndex + 1} - halting simulation`);
        setIsRunning(false);
        break;
      }

      // Simulate processing delay for realistic demonstration
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (accumulatedMetrics.totalContributions >= config.targetContributions) {
      addToLog(`✅ Simulation complete: ${accumulatedMetrics.totalContributions} contributions processed`);
      console.log('🔇 TTS disabled: "Simulation complete"');
    }

    setIsRunning(false);
  };

  const pauseSimulation = () => {
    setIsPaused(true);
    addToLog('⏸️ Simulation paused');
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setMetrics({
      totalContributions: 0,
      pointsGenerated: 0,
      volatilityLevel: 0,
      failureRate: 0,
      pushbackTriggered: false,
      averageLatency: 0
    });
    setSimulationLog([]);
    addToLog('🔄 Simulation reset');
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const getFailureRateColor = (rate: number) => {
    if (rate < 15) return 'text-green-400';
    if (rate < 30) return 'text-amber-400';
    return 'text-red-400';
  };

  const getVolatilityColor = (volatility: number) => {
    if (volatility < 20) return 'text-green-400';
    if (volatility < 30) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900 rounded-lg">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Truth Point Simulator</h3>
        </div>
        <div className="text-xs text-slate-400">
          {renderTime.toFixed(1)}ms
        </div>
      </div>

      {/* Simulation Configuration */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Simulation Config</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Target Contributions</div>
            <div className="text-lg font-semibold text-slate-100">
              {config.targetContributions.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Failure Rate</div>
            <div className="text-lg font-semibold text-slate-100">
              {config.failureSimulationRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Start'}
        </button>
        <button
          onClick={pauseSimulation}
          disabled={!isRunning}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          <Pause className="w-4 h-4" />
          Pause
        </button>
        <button
          onClick={resetSimulation}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Real-time Metrics */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Live Metrics</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Contributions</div>
            <div className="text-lg font-semibold text-slate-100">
              {metrics.totalContributions.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              {((metrics.totalContributions / config.targetContributions) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Points Generated</div>
            <div className="text-lg font-semibold text-slate-100">
              {metrics.pointsGenerated.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Failure Rate</div>
            <div className={`text-lg font-semibold ${getFailureRateColor(metrics.failureRate)}`}>
              {metrics.failureRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Volatility</div>
            <div className={`text-lg font-semibold ${getVolatilityColor(metrics.volatilityLevel)}`}>
              {metrics.volatilityLevel.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Pushback Alert */}
      {metrics.pushbackTriggered && (
        <div className="mb-6 p-3 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-200 font-medium">
              PUSHBACK TRIGGERED: Simulation halted due to high failure/volatility
            </span>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Performance</div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Avg Latency</span>
            <span className={`text-sm font-medium ${
              metrics.averageLatency > 100 ? 'text-red-400' : 
              metrics.averageLatency > 50 ? 'text-amber-400' : 'text-green-400'
            }`}>
              {metrics.averageLatency.toFixed(1)}ms
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${
                  metrics.averageLatency > 100 ? 'bg-red-500' : 
                  metrics.averageLatency > 50 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.averageLatency / 200) * 100)}%` }}
              />
            </div>
            <TrendingDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Simulation Log */}
      <div>
        <div className="text-sm font-medium text-slate-300 mb-3">Simulation Log</div>
        <div className="bg-slate-800 rounded-lg p-3 max-h-48 overflow-y-auto">
          {simulationLog.length > 0 ? (
            <div className="space-y-1">
              {simulationLog.map((logEntry, index) => (
                <div key={index} className="text-xs text-slate-400 font-mono">
                  {logEntry}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">
              No simulation activity yet. Click Start to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruthPointSimulator;