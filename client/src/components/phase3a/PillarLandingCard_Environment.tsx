// PillarLandingCard_Environment.tsx - Phase III-A Step 2/6
// Anchor: SustainabilityAllocationCard.tsx (Deck #18)
// Tag: pillar_environment

import { useState, useEffect } from 'react';
import { Leaf, TreePine, Droplets, CheckCircle, AlertTriangle } from 'lucide-react';

interface EnvironmentPillarMetrics {
  name: string;
  icon: typeof Leaf;
  zkpModuleCount: number;
  verifiedPercentage: number;
  allocatedFunds: number;
  carbonReduced: number;
  sustainabilityScore: number;
}

export const PillarLandingCard_Environment = () => {
  const [metrics, setMetrics] = useState<EnvironmentPillarMetrics>({
    name: 'Environment',
    icon: Leaf,
    zkpModuleCount: 4,
    verifiedPercentage: 78.9,
    allocatedFunds: 234000,
    carbonReduced: 12.7,
    sustainabilityScore: 87.3
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
        allocatedFunds: Math.floor(Math.random() * 50000) + 200000,
        carbonReduced: Math.round((Math.random() * 5 + 10) * 10) / 10
      }));

      // Pushback trigger: <70% ZKP verification
      if (simulatedVerification < 70) {
        setPushbackTriggered(true);
        console.log('⚠️ Environment Pillar: ZKP verification below 70% threshold');
      } else {
        setPushbackTriggered(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setIsSelected(true);
    console.log('🔇 TTS disabled: "Environment Pillar ready"');
    // Route to PillarDashboardCard_Environment.tsx (stub)
    console.log('→ Routing to PillarDashboardCard_Environment.tsx');
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
        <div className="text-xs text-slate-400">pillar_environment</div>
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

      {/* Environment Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TreePine className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-300">Allocated</span>
          </div>
          <div className="text-lg font-semibold text-slate-100">
            ${(metrics.allocatedFunds / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-300">CO₂ Reduced</span>
          </div>
          <div className="text-lg font-semibold text-slate-100">{metrics.carbonReduced}t</div>
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Sustainability Score</span>
          <span className="text-sm font-medium text-slate-200">{metrics.sustainabilityScore}%</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${
                metrics.sustainabilityScore >= 80 ? 'bg-green-500' : 
                metrics.sustainabilityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.sustainabilityScore}%` }}
            />
          </div>
          <CheckCircle className={`w-3 h-3 ${
            metrics.sustainabilityScore >= 80 ? 'text-green-400' : 
            metrics.sustainabilityScore >= 60 ? 'text-amber-400' : 'text-red-400'
          }`} />
        </div>
      </div>

      {/* Allocation Categories */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <div className="text-xs text-slate-300 mb-2">Resource Allocation</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Renewable Energy</span>
            <span className="text-slate-200">35%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Public Health</span>
            <span className="text-slate-200">28%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Food Security</span>
            <span className="text-slate-200">22%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Other</span>
            <span className="text-slate-200">15%</span>
          </div>
        </div>
      </div>

      {/* Anchor Reference */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700 pt-3">
        <span>Anchor: SustainabilityAllocationCard</span>
        <span>Deck #18</span>
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

export default PillarLandingCard_Environment;