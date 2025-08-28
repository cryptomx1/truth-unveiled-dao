import React, { useState, useRef, useEffect } from 'react';
import { Eye, ZoomIn, ZoomOut, Lock, Unlock, Star } from 'lucide-react';

// Types for constellation system
interface DeckNode {
  id: number;
  title: string;
  tier: 'citizen' | 'moderator' | 'governor';
  glow: number; // 0-100 engagement intensity
  accessible: boolean;
  position: { x: number; y: number };
}

interface ClusterNode {
  id: string;
  title: string;
  theme: string;
  decks: DeckNode[];
  position: { x: number; y: number };
  radius: number;
  glowIntensity: number;
}

interface ConstellationState {
  zoomLevel: number;
  selectedCluster: string | null;
  userTier: 'citizen' | 'moderator' | 'governor';
}

// Mock cluster data
const MOCK_CLUSTERS: ClusterNode[] = [
  {
    id: 'identity',
    title: 'Identity',
    theme: 'Secure identity management and wallet functionality',
    position: { x: 150, y: 200 },
    radius: 80,
    glowIntensity: 75,
    decks: [
      {
        id: 1,
        title: 'Wallet Dashboard',
        tier: 'citizen',
        glow: 88,
        accessible: true,
        position: { x: 20, y: -30 }
      },
      {
        id: 5,
        title: 'Privacy Vault',
        tier: 'citizen',
        glow: 72,
        accessible: true,
        position: { x: -35, y: 25 }
      }
    ]
  },
  {
    id: 'governance',
    title: 'Governance',
    theme: 'Civic participation and democratic processes',
    position: { x: 350, y: 150 },
    radius: 90,
    glowIntensity: 82,
    decks: [
      {
        id: 13,
        title: 'Governance Dashboard',
        tier: 'citizen',
        glow: 91,
        accessible: true,
        position: { x: -25, y: -40 }
      },
      {
        id: 2,
        title: 'Civic Swipe',
        tier: 'citizen',
        glow: 79,
        accessible: true,
        position: { x: 30, y: 20 }
      },
      {
        id: 9,
        title: 'Consensus Layer',
        tier: 'moderator',
        glow: 85,
        accessible: false,
        position: { x: -40, y: 35 }
      }
    ]
  },
  {
    id: 'feedback',
    title: 'Feedback',
    theme: 'Community sentiment and voice amplification',
    position: { x: 200, y: 350 },
    radius: 85,
    glowIntensity: 78,
    decks: [
      {
        id: 10,
        title: 'Feedback Dashboard',
        tier: 'citizen',
        glow: 82,
        accessible: true,
        position: { x: 25, y: -35 }
      },
      {
        id: 11,
        title: 'Engagement Tracker',
        tier: 'citizen',
        glow: 74,
        accessible: true,
        position: { x: -30, y: 30 }
      }
    ]
  },
  {
    id: 'audit',
    title: 'Audit',
    theme: 'Transparency and verification systems',
    position: { x: 400, y: 300 },
    radius: 75,
    glowIntensity: 68,
    decks: [
      {
        id: 8,
        title: 'Civic Audit',
        tier: 'moderator',
        glow: 77,
        accessible: false,
        position: { x: -20, y: -25 }
      },
      {
        id: 15,
        title: 'Justice Panel',
        tier: 'moderator',
        glow: 65,
        accessible: false,
        position: { x: 25, y: 30 }
      }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    theme: 'Civic learning and knowledge sharing',
    position: { x: 120, y: 120 },
    radius: 70,
    glowIntensity: 71,
    decks: [
      {
        id: 3,
        title: 'Education Center',
        tier: 'citizen',
        glow: 76,
        accessible: true,
        position: { x: 30, y: -20 }
      },
      {
        id: 16,
        title: 'Learning Modules',
        tier: 'citizen',
        glow: 68,
        accessible: true,
        position: { x: -25, y: 25 }
      }
    ]
  }
];

// Main CivicConstellationExplorer component
interface CivicConstellationExplorerProps {
  userTier?: 'citizen' | 'moderator' | 'governor';
  initialZoom?: number;
  onClusterFocus?: (clusterId: string | null) => void;
  onDeckHover?: (deckId: number | null) => void;
  className?: string;
}

export const CivicConstellationExplorer: React.FC<CivicConstellationExplorerProps> = ({
  userTier = 'citizen',
  initialZoom = 1,
  onClusterFocus,
  onDeckHover,
  className = ''
}) => {
  const [constellationState, setConstellationState] = useState<ConstellationState>({
    zoomLevel: initialZoom,
    selectedCluster: null,
    userTier
  });
  
  const [initialized, setInitialized] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const constellationRef = useRef<HTMLDivElement>(null);

  // Initialize constellation
  useEffect(() => {
    if (initialized) return;
    
    const startTime = Date.now();
    
    console.log('🌌 CivicConstellationExplorer initialized');
    console.log(`👤 User tier: ${userTier}`);
    console.log(`🔍 Initial zoom: ${initialZoom}`);
    
    // Log clusters and decks
    MOCK_CLUSTERS.forEach(cluster => {
      console.log(`🪐 Rendering cluster: ${cluster.title}`);
      cluster.decks.forEach(deck => {
        const accessStatus = deck.accessible ? 'Accessible' : 'Locked';
        console.log(`✨ Deck: ${deck.title} — Tier: ${deck.tier} — Glow: ${deck.glow} — ${accessStatus}`);
      });
    });
    
    setInitialized(true);
    
    const initTime = Date.now() - startTime;
    setRenderTime(initTime);
    
    if (initTime > 300) {
      console.warn(`⚠️ CivicConstellationExplorer render time: ${initTime}ms (exceeds 300ms target)`);
    } else {
      console.log(`⚡ Constellation rendered in ${initTime}ms`);
    }
  }, [initialized, userTier, initialZoom]);

  // Handle zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    const zoomStep = 0.2;
    const minZoom = 0.5;
    const maxZoom = 2.0;
    
    const newZoom = direction === 'in' 
      ? Math.min(constellationState.zoomLevel + zoomStep, maxZoom)
      : Math.max(constellationState.zoomLevel - zoomStep, minZoom);
    
    setConstellationState(prev => ({
      ...prev,
      zoomLevel: newZoom
    }));
    
    const zoomAction = direction === 'in' ? 'zoomed in' : 'zoomed out';
    console.log(`🔭 User ${zoomAction} to ${(newZoom * 100).toFixed(0)}%`);
  };

  // Handle cluster focus
  const handleClusterClick = (clusterId: string) => {
    const cluster = MOCK_CLUSTERS.find(c => c.id === clusterId);
    if (!cluster) return;
    
    setConstellationState(prev => ({
      ...prev,
      selectedCluster: prev.selectedCluster === clusterId ? null : clusterId
    }));
    
    console.log(`🔭 User zoomed into ${cluster.title} Cluster`);
    
    if (onClusterFocus) {
      onClusterFocus(clusterId);
    }
  };

  // Handle touch/swipe events
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const swipeThreshold = 50;
    
    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
      console.log(`📱 Swipe detected: ${deltaX}x, ${deltaY}y`);
      // Swipe navigation will be implemented in Step 2
    }
    
    setTouchStart(null);
  };

  // Render deck node
  const renderDeckNode = (deck: DeckNode, clusterPosition: { x: number; y: number }) => {
    const nodeX = clusterPosition.x + deck.position.x;
    const nodeY = clusterPosition.y + deck.position.y;
    
    const isAccessible = deck.accessible && (
      deck.tier === 'citizen' || 
      (deck.tier === 'moderator' && (userTier === 'moderator' || userTier === 'governor')) ||
      (deck.tier === 'governor' && userTier === 'governor')
    );
    
    const glowOpacity = isAccessible ? deck.glow / 100 : 0.3;
    const nodeSize = isAccessible ? 12 : 8;
    
    return (
      <div
        key={deck.id}
        className={`absolute rounded-full transition-all duration-300 cursor-pointer ${
          isAccessible ? 'bg-blue-400 hover:bg-blue-300' : 'bg-slate-600'
        }`}
        style={{
          left: `${nodeX}px`,
          top: `${nodeY}px`,
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          boxShadow: `0 0 ${deck.glow / 5}px rgba(59, 130, 246, ${glowOpacity})`,
          transform: 'translate(-50%, -50%)'
        }}
        onMouseEnter={() => onDeckHover?.(deck.id)}
        onMouseLeave={() => onDeckHover?.(null)}
        role="listitem"
        aria-label={`Deck: ${deck.title} — ${isAccessible ? `Accessible to ${deck.tier} tier` : `Locked for ${deck.tier} tier`}`}
        tabIndex={0}
      >
        {/* Tier lock indicator */}
        {!isAccessible && (
          <div className="absolute -top-1 -right-1">
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
        )}
        
        {/* Deck title tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {deck.title}
          </div>
        </div>
      </div>
    );
  };

  // Render cluster node
  const renderCluster = (cluster: ClusterNode) => {
    const isSelected = constellationState.selectedCluster === cluster.id;
    const clusterScale = isSelected ? 1.1 : 1;
    const clusterOpacity = cluster.glowIntensity / 100;
    
    return (
      <div
        key={cluster.id}
        className="absolute group"
        style={{
          left: `${cluster.position.x}px`,
          top: `${cluster.position.y}px`,
          transform: `translate(-50%, -50%) scale(${clusterScale})`,
          transition: 'transform 0.3s ease-out'
        }}
        role="listitem"
        aria-label={`Cluster: ${cluster.title} - ${cluster.theme}`}
      >
        {/* Cluster background glow */}
        <div
          className={`absolute rounded-full border-2 transition-all duration-500 cursor-pointer ${
            isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-slate-600 bg-slate-700/10 hover:border-slate-500'
          }`}
          style={{
            width: `${cluster.radius * 2}px`,
            height: `${cluster.radius * 2}px`,
            boxShadow: `0 0 ${cluster.radius / 2}px rgba(59, 130, 246, ${clusterOpacity * 0.5})`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => handleClusterClick(cluster.id)}
        />
        
        {/* Cluster title */}
        <div
          className="absolute text-white font-semibold text-sm pointer-events-none select-none"
          style={{
            transform: 'translate(-50%, -50%)',
            top: `-${cluster.radius + 20}px`,
            left: '0'
          }}
        >
          {cluster.title}
        </div>
        
        {/* Cluster center star */}
        <div
          className="absolute text-blue-400"
          style={{
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Star className="w-4 h-4 fill-current" />
        </div>
        
        {/* Render deck nodes in orbit */}
        {cluster.decks.map(deck => renderDeckNode(deck, { x: 0, y: 0 }))}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden bg-slate-900 rounded-lg border border-slate-700 ${className}`}
      style={{ maxWidth: '460px', height: '400px' }}
      role="application"
      aria-label="Civic Constellation Explorer - Navigate deck clusters"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-600 text-white transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-600 text-white transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-600 text-white text-sm">
          {(constellationState.zoomLevel * 100).toFixed(0)}%
        </div>
      </div>

      {/* Constellation Canvas */}
      <div
        ref={constellationRef}
        className="w-full h-full relative"
        style={{
          transform: `scale(${constellationState.zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-out'
        }}
        role="list"
        aria-label="Deck clusters"
      >
        {/* Background grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Render all clusters */}
        {MOCK_CLUSTERS.map(renderCluster)}
        
        {/* Connection lines between related clusters (placeholder) */}
        <svg className="absolute inset-0 pointer-events-none opacity-20">
          <line
            x1={MOCK_CLUSTERS[0].position.x}
            y1={MOCK_CLUSTERS[0].position.y}
            x2={MOCK_CLUSTERS[2].position.x}
            y2={MOCK_CLUSTERS[2].position.y}
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <line
            x1={MOCK_CLUSTERS[1].position.x}
            y1={MOCK_CLUSTERS[1].position.y}
            x2={MOCK_CLUSTERS[3].position.x}
            y2={MOCK_CLUSTERS[3].position.y}
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        </svg>
      </div>

      {/* Cluster Info Panel */}
      {constellationState.selectedCluster && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-slate-800/90 rounded-lg border border-slate-600 p-4 backdrop-blur-sm">
            {(() => {
              const cluster = MOCK_CLUSTERS.find(c => c.id === constellationState.selectedCluster);
              if (!cluster) return null;
              
              const accessibleDecks = cluster.decks.filter(deck => {
                return deck.accessible && (
                  deck.tier === 'citizen' || 
                  (deck.tier === 'moderator' && (userTier === 'moderator' || userTier === 'governor')) ||
                  (deck.tier === 'governor' && userTier === 'governor')
                );
              });
              
              return (
                <>
                  <h3 className="text-white font-semibold mb-2">{cluster.title} Cluster</h3>
                  <p className="text-slate-400 text-sm mb-3">{cluster.theme}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-slate-300">
                      {accessibleDecks.length}/{cluster.decks.length} decks accessible
                    </div>
                    <div className="text-blue-400">
                      Engagement: {cluster.glowIntensity}%
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
          Render: {renderTime}ms | Zoom: {(constellationState.zoomLevel * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default CivicConstellationExplorer;