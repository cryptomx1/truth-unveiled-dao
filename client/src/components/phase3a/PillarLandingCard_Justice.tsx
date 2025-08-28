// PillarLandingCard_Justice.tsx - Phase III-A Step 2/6
// Anchor: DisputeArbitrationCard.tsx (Deck #15)
// Tag: pillar_justice

import { useState, useEffect } from 'react';
import { Scale, Shield, Gavel, CheckCircle, AlertTriangle } from 'lucide-react';

interface JusticePillarMetrics {
  name: string;
  icon: typeof Scale;
  zkpModuleCount: number;
  verifiedPercentage: number;
  totalDisputes: number;
  resolvedDisputes: number;
  activeCases: number;
}

export const PillarLandingCard_Justice = () => {
  const [metrics, setMetrics] = useState<JusticePillarMetrics>({
    name: 'Justice',
    icon: Scale,
    zkpModuleCount: 3,
    verifiedPercentage: 87.3,
    totalDisputes: 42,
    resolvedDisputes: 38,
    activeCases: 4
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
        verifiedPercentage: simulatedVerification
      }));

      // Pushback trigger: <70% ZKP verification
      if (simulatedVerification < 70) {
        setPushbackTriggered(true);
        console.log('⚠️ Justice Pillar: ZKP verification below 70% threshold');
      } else {
        setPushbackTriggered(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setIsSelected(true);
    console.log('🔇 TTS disabled: "Justice Pillar ready"');
    // Route to PillarDashboardCard_Justice.tsx (stub)
    console.log('→ Routing to PillarDashboardCard_Justice.tsx');
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
        <div className="text-xs text-slate-400">pillar_justice</div>
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

      {/* Justice Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-300">Resolved</span>
          </div>
          <div className="text-lg font-semibold text-slate-100">{metrics.resolvedDisputes}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">Active</span>
          </div>
          <div className="text-lg font-semibold text-slate-100">{metrics.activeCases}</div>
        </div>
      </div>

      {/* Anchor Reference */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700 pt-3">
        <span>Anchor: DisputeArbitrationCard</span>
        <span>Deck #15</span>
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

export default PillarLandingCard_Justice;