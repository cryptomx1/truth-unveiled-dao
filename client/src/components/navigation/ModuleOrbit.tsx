import React, { useState, useEffect } from 'react';
import { Circle, Play, Pause, MoreHorizontal } from 'lucide-react';

// Types for module orbit system
interface ModuleNode {
  id: string;
  name: string;
  type: 'card' | 'panel' | 'viewer' | 'tracker';
  status: 'active' | 'inactive' | 'locked' | 'pending';
  completionRate: number; // 0-100
  engagementScore: number; // 0-100
  position: number; // 0-360 degrees
}

interface ModuleOrbitProps {
  deckId: number;
  deckTitle: string;
  modules: ModuleNode[];
  radius: number;
  centerPosition: { x: number; y: number };
  isActive?: boolean;
  rotationSpeed?: number; // degrees per second
  onModuleClick?: (moduleId: string) => void;
  onModuleHover?: (moduleId: string | null) => void;
  className?: string;
}

// Module type icon mapping
const getModuleTypeIcon = (type: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'card': <Circle className="w-2 h-2" />,
    'panel': <Play className="w-2 h-2" />,
    'viewer': <Pause className="w-2 h-2" />,
    'tracker': <MoreHorizontal className="w-2 h-2" />
  };
  
  return iconMap[type] || <Circle className="w-2 h-2" />;
};

// Module status color mapping
const getModuleStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    'active': 'bg-green-400 border-green-300',
    'inactive': 'bg-slate-500 border-slate-400',
    'locked': 'bg-red-400 border-red-300',
    'pending': 'bg-yellow-400 border-yellow-300'
  };
  
  return colorMap[status] || 'bg-slate-400 border-slate-300';
};

export const ModuleOrbit: React.FC<ModuleOrbitProps> = ({
  deckId,
  deckTitle,
  modules,
  radius,
  centerPosition,
  isActive = false,
  rotationSpeed = 0,
  onModuleClick,
  onModuleHover,
  className = ''
}) => {
  const [currentRotation, setCurrentRotation] = useState(0);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [renderTime, setRenderTime] = useState(0);

  // Performance tracking
  useEffect(() => {
    const startTime = Date.now();
    const endTime = Date.now();
    setRenderTime(endTime - startTime);
  }, []);

  // Handle rotation animation
  useEffect(() => {
    if (!isActive || rotationSpeed === 0) return;

    const interval = setInterval(() => {
      setCurrentRotation(prev => (prev + rotationSpeed / 10) % 360);
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [isActive, rotationSpeed]);

  // Calculate module position
  const getModulePosition = (module: ModuleNode) => {
    const totalRotation = currentRotation + module.position;
    const radian = (totalRotation * Math.PI) / 180;
    
    const x = centerPosition.x + radius * Math.cos(radian);
    const y = centerPosition.y + radius * Math.sin(radian);
    
    return { x, y };
  };

  // Handle module interaction
  const handleModuleClick = (moduleId: string) => {
    if (onModuleClick) {
      onModuleClick(moduleId);
    }
    console.log(`🔧 Module clicked: ${moduleId}`);
  };

  const handleModuleHover = (moduleId: string | null) => {
    setHoveredModule(moduleId);
    if (onModuleHover) {
      onModuleHover(moduleId);
    }
  };

  // Render individual module node
  const renderModuleNode = (module: ModuleNode) => {
    const position = getModulePosition(module);
    const isHovered = hoveredModule === module.id;
    const statusColors = getModuleStatusColor(module.status);
    
    const nodeSize = isHovered ? 10 : 8;
    const glowIntensity = module.engagementScore / 100;
    const completionOpacity = module.completionRate / 100;

    return (
      <div
        key={module.id}
        className={`absolute rounded-full border transition-all duration-300 cursor-pointer ${statusColors}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          boxShadow: `0 0 ${module.engagementScore / 10}px rgba(59, 130, 246, ${glowIntensity})`,
          opacity: completionOpacity > 0.3 ? 1 : 0.7,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.2 : 1})`
        }}
        onClick={() => handleModuleClick(module.id)}
        onMouseEnter={() => handleModuleHover(module.id)}
        onMouseLeave={() => handleModuleHover(null)}
        role="listitem"
        aria-label={`Module: ${module.name} — ${module.status} — ${module.completionRate}% complete — ${module.engagementScore}% engagement`}
        tabIndex={0}
      >
        {/* Module type indicator */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {getModuleTypeIcon(module.type)}
        </div>
        
        {/* Completion ring */}
        {module.completionRate > 0 && (
          <div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            style={{
              clipPath: `conic-gradient(from 0deg, transparent 0deg, transparent ${360 - (module.completionRate * 3.6)}deg, rgba(59, 130, 246, 0.5) ${360 - (module.completionRate * 3.6)}deg)`
            }}
          />
        )}
      </div>
    );
  };

  // Calculate orbit statistics
  const activeModules = modules.filter(m => m.status === 'active').length;
  const avgCompletion = modules.reduce((sum, m) => sum + m.completionRate, 0) / modules.length;
  const avgEngagement = modules.reduce((sum, m) => sum + m.engagementScore, 0) / modules.length;

  return (
    <div
      className={`relative ${className}`}
      role="list"
      aria-label={`Module orbit for ${deckTitle} — ${modules.length} modules`}
    >
      {/* Orbit ring */}
      <div
        className={`absolute rounded-full border border-dashed transition-all duration-500 ${
          isActive ? 'border-blue-400/50' : 'border-slate-600/30'
        }`}
        style={{
          left: `${centerPosition.x}px`,
          top: `${centerPosition.y}px`,
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Render module nodes */}
      {modules.map(renderModuleNode)}

      {/* Orbit center indicator */}
      <div
        className={`absolute w-2 h-2 rounded-full transition-all duration-300 ${
          isActive ? 'bg-blue-400' : 'bg-slate-600'
        }`}
        style={{
          left: `${centerPosition.x}px`,
          top: `${centerPosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Module tooltip */}
      {hoveredModule && (
        (() => {
          const module = modules.find(m => m.id === hoveredModule);
          if (!module) return null;
          
          const position = getModulePosition(module);
          
          return (
            <div
              className="absolute bg-slate-800/90 text-white text-xs p-2 rounded-lg border border-slate-600 pointer-events-none z-20"
              style={{
                left: `${position.x}px`,
                top: `${position.y - 30}px`,
                transform: 'translate(-50%, -100%)',
                minWidth: '120px'
              }}
            >
              <div className="text-center">
                <div className="font-semibold">{module.name}</div>
                <div className="text-slate-400 mt-1">{module.type} • {module.status}</div>
                <div className="mt-1 space-y-0.5">
                  <div>Complete: {module.completionRate}%</div>
                  <div>Engagement: {module.engagementScore}%</div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Orbit statistics */}
      {isActive && (
        <div
          className="absolute bg-slate-800/80 text-white text-xs p-2 rounded-lg border border-slate-600 pointer-events-none"
          style={{
            left: `${centerPosition.x}px`,
            top: `${centerPosition.y + radius + 30}px`,
            transform: 'translate(-50%, 0)',
            minWidth: '100px'
          }}
        >
          <div className="text-center">
            <div className="font-semibold text-blue-400">{deckTitle}</div>
            <div className="mt-1 space-y-0.5">
              <div>{activeModules}/{modules.length} active</div>
              <div>{avgCompletion.toFixed(0)}% complete</div>
              <div>{avgEngagement.toFixed(0)}% engaged</div>
            </div>
          </div>
        </div>
      )}

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && renderTime > 0 && (
        <div
          className="absolute text-xs text-slate-500 pointer-events-none"
          style={{
            left: `${centerPosition.x}px`,
            top: `${centerPosition.y + radius + 60}px`,
            transform: 'translate(-50%, 0)'
          }}
        >
          Orbit: {renderTime}ms | Rotation: {currentRotation.toFixed(0)}°
        </div>
      )}
    </div>
  );
};

export default ModuleOrbit;