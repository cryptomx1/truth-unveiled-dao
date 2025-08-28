import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface TrustPulseData {
  trustLevel: number;
  status: 'aligned' | 'mixed' | 'unstable';
  streak24h: number[];
  streak7d: number[];
  streak30d: number[];
  lastUpdate: Date;
}

interface TrustPulseWidgetProps {
  deckId: string;
  deckName: string;
  className?: string;
}

export const TrustPulseWidget: React.FC<TrustPulseWidgetProps> = ({
  deckId,
  deckName,
  className = ''
}) => {
  const [pulseData, setPulseData] = useState<TrustPulseData | null>(null);
  const [showStreakGraph, setShowStreakGraph] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    // Simulate pulse data fetch with realistic trust patterns
    const generatePulseData = (): TrustPulseData => {
      const baseLevel = 60 + Math.random() * 30; // 60-90% base trust
      const variance = (Math.random() - 0.5) * 20; // ±10% variance
      const trustLevel = Math.max(0, Math.min(100, baseLevel + variance));
      
      let status: 'aligned' | 'mixed' | 'unstable';
      if (trustLevel > 70) status = 'aligned';
      else if (trustLevel >= 30) status = 'mixed';
      else status = 'unstable';

      // Generate streak data with realistic fluctuations
      const generateStreak = (length: number, volatility: number) => {
        const streak = [];
        let current = trustLevel;
        for (let i = 0; i < length; i++) {
          current += (Math.random() - 0.5) * volatility;
          current = Math.max(0, Math.min(100, current));
          streak.push(current);
        }
        return streak;
      };

      return {
        trustLevel,
        status,
        streak24h: generateStreak(24, 8), // hourly data, low volatility
        streak7d: generateStreak(7, 12), // daily data, medium volatility  
        streak30d: generateStreak(30, 15), // daily data, higher volatility
        lastUpdate: new Date()
      };
    };

    const initialData = generatePulseData();
    setPulseData(initialData);

    // Update pulse data every 30 seconds with minor fluctuations
    const interval = setInterval(() => {
      if (pulseData) {
        const updated = { ...pulseData };
        const change = (Math.random() - 0.5) * 5; // ±2.5% change
        updated.trustLevel = Math.max(0, Math.min(100, updated.trustLevel + change));
        
        // Update status based on new level
        if (updated.trustLevel > 70) updated.status = 'aligned';
        else if (updated.trustLevel >= 30) updated.status = 'mixed';
        else updated.status = 'unstable';
        
        updated.lastUpdate = new Date();
        setPulseData(updated);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [deckId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aligned': return 'text-green-400 bg-green-600/20';
      case 'mixed': return 'text-yellow-400 bg-yellow-600/20';
      case 'unstable': return 'text-red-400 bg-red-600/20';
      default: return 'text-slate-400 bg-slate-600/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aligned': return '🟢';
      case 'mixed': return '🟡';
      case 'unstable': return '🔴';
      default: return '⚪';
    }
  };

  const renderStreakGraph = () => {
    if (!pulseData) return null;

    const currentStreak = pulseData[`streak${selectedPeriod}`];
    const maxValue = Math.max(...currentStreak);
    const minValue = Math.min(...currentStreak);
    
    return (
      <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-300">Trust Streak</span>
          <div className="flex gap-1">
            {(['24h', '7d', '30d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600/30 text-blue-300'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-16 flex items-end gap-1 overflow-hidden">
          {currentStreak.map((value, index) => {
            const height = ((value - minValue) / (maxValue - minValue)) * 100;
            const color = value > 70 ? 'bg-green-500' : value >= 30 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div
                key={index}
                className={`flex-1 ${color} rounded-sm transition-all duration-300`}
                style={{ height: `${Math.max(2, height)}%` }}
                title={`${value.toFixed(1)}% trust`}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{minValue.toFixed(1)}%</span>
          <span className="text-slate-300">{selectedPeriod} trend</span>
          <span>{maxValue.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  if (!pulseData) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Activity className="w-4 h-4 text-slate-500 animate-pulse" />
        <span className="text-xs text-slate-500">Loading pulse...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/20 rounded-lg px-2 py-1 transition-colors"
        onClick={() => setShowStreakGraph(!showStreakGraph)}
        onMouseEnter={() => setShowStreakGraph(true)}
        onMouseLeave={() => setShowStreakGraph(false)}
      >
        <Activity className="w-4 h-4 text-blue-400" />
        <div className="flex items-center gap-1">
          <span className="text-xs">{getStatusIcon(pulseData.status)}</span>
          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(pulseData.status)}`}>
            {pulseData.status.charAt(0).toUpperCase() + pulseData.status.slice(1)}
          </span>
        </div>
        <span className="text-xs text-slate-400">{pulseData.trustLevel.toFixed(1)}%</span>
        {pulseData.trustLevel > 70 ? (
          <TrendingUp className="w-3 h-3 text-green-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-400" />
        )}
      </div>

      {showStreakGraph && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          {renderStreakGraph()}
        </div>
      )}
    </div>
  );
};

export default TrustPulseWidget;