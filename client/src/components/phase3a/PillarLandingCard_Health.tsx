// PillarLandingCard_Health.tsx - Phase III-A Step 2/6
// Anchor: MentalHealthAccessCard.tsx (Deck #19)
// Tag: pillar_health

import { useState, useEffect } from 'react';
import { Heart, Activity, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface HealthPillarMetrics {
  name: string;
  icon: typeof Heart;
  zkpModuleCount: number;
  verifiedPercentage: number;
  providersActive: number;
  accessRequests: number;
  averageWaitTime: number;
}

export const PillarLandingCard_Health = () => {
  const [metrics, setMetrics] = useState<HealthPillarMetrics>({
    name: 'Health',
    icon: Heart,
    zkpModuleCount: 4,
    verifiedPercentage: 82.7,
    providersActive: 23,
    accessRequests: 67,
    averageWaitTime: 4.2
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [pushbackTriggered, setPushbackTriggered] = useState(false);

  useEffect(() => {
    // Simulate ZKP verification monitoring
    const interval = setInterval(() => {
      const simulatedVerification = Math.random() * 100;
      
      setMetrics(prev => ({
        ...prev,
        verifiedPercentage: simulatedVerification,
        providersActive: Math.floor(Math.random() * 10) + 20,
        accessRequests: Math.floor(Math.random() * 20) + 60
      }));

      // Pushback trigger: <70% ZKP verification
      if (simulatedVerification < 70) {
        setPushbackTriggered(true);
        console.log('⚠️ Health Pillar: ZKP verification below 70% threshold');
      } else {
        setPushbackTriggered(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setIsSelected(true);
    console.log('🔇 TTS disabled: "Health Pillar ready"');
    // Route to PillarDashboardCard_Health.tsx (stub)
    console.log('→ Routing to PillarDashboardCard_Health.tsx');
  };

  const IconComponent = metrics.icon;

  return (
    <div 
      className={`
        max-h-[600px] bg-slate-900 border rounded-lg p-6 cursor-pointer
        transition-all duration-200 transform
        ${isHovered ? 'scale-[1.02] border-blue-500' : 'border-slate-700'}
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        ${pushbackTriggered ? 'animate-pulse border-red-500 shadow-red-500/20 shadow-lg' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`${metrics.name} Pillar - ${metrics.verifiedPercentage.toFixed(1)}% verified`}
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${pushbackTriggered ? 'bg-red-900' : 'bg-blue-900'}`}>
            <IconComponent className={`w-6 h-6 ${pushbackTriggered ? 'text-red-400' : 'text-blue-400'}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{metrics.name} Pillar</h3>
        </div>
        <div className="text-xs text-slate-400">pillar_health</div>
      </div>

      {/* ZKP Module Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">ZKP Modules</span>
          <span className="text-sm font-medium text-slate-200">{metrics.zkpModuleCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                metrics.verifiedPercentage >= 70 ? 'bg-blue-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.verifiedPercentage}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${
            metrics.verifiedPercentage >= 70 ? 'text-blue-400' : 'text-red-400'
          }`}>
            {metrics.verifiedPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-300">Providers</span>
          </div>
          <div className="text-lg font-semibold text-slate-100">{metrics.providersActive}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">Requests</span>
          </div>
          <div className="text-lg font-semibold text-slate-100">{metrics.accessRequests}</div>
        </div>
      </div>

      {/* Wait Time Indicator */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Avg. Wait Time</span>
          <span className="text-sm font-medium text-slate-200">{metrics.averageWaitTime} days</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${
                metrics.averageWaitTime <= 3 ? 'bg-green-500' : 
                metrics.averageWaitTime <= 7 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(20, Math.min(100, (10 - metrics.averageWaitTime) * 10))}%` }}
            />
          </div>
          <CheckCircle className={`w-3 h-3 ${
            metrics.averageWaitTime <= 3 ? 'text-green-400' : 
            metrics.averageWaitTime <= 7 ? 'text-amber-400' : 'text-red-400'
          }`} />
        </div>
      </div>

      {/* Anchor Reference */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700 pt-3">
        <span>Anchor: MentalHealthAccessCard</span>
        <span>Deck #19</span>
      </div>

      {/* Pushback Alert */}
      {pushbackTriggered && (
        <div className="mt-3 p-2 bg-red-900 border border-red-700 rounded text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>ZKP verification below 70% threshold</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PillarLandingCard_Health;