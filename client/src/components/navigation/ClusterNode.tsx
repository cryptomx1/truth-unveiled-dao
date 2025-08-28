import React, { useState, useEffect, useRef } from 'react';
import { Star, Lock, Unlock, Eye, Users, Shield, MessageCircle, BookOpen, Scale, TrendingUp } from 'lucide-react';

// Types for cluster node
interface DeckNode {
  id: number;
  title: string;
  tier: 'citizen' | 'moderator' | 'governor';
  glow: number;
  accessible: boolean;
  position: { x: number; y: number };
  moduleCount: number;
}

interface ClusterNodeProps {
  id: string;
  title: string;
  theme: string;
  decks: DeckNode[];
  position: { x: number; y: number };
  radius: number;
  glowIntensity: number;
  isSelected?: boolean;
  userTier: 'citizen' | 'moderator' | 'governor';
  onClusterClick?: (clusterId: string) => void;
  onDeckHover?: (deckId: number | null) => void;
  className?: string;
}

// Mock ZKP tier hook (citizen default as per directive)
const useZKPTier = () => {
  return 'citizen' as 'citizen' | 'moderator' | 'governor';
};

// Mock engagement data generator
const generateEngagementData = (clusterId: string) => {
  const baseEngagement = {
    'identity': 42318,
    'governance': 38947,
    'feedback': 31204,
    'audit': 28563,
    'education': 35729
  };
  
  return baseEngagement[clusterId as keyof typeof baseEngagement] || 25000;
};

// Cluster theme icon mapping
const getClusterIcon = (theme: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Identity': <Shield className="w-4 h-4" />,
    'Governance': <Scale className="w-4 h-4" />,
    'Feedback': <MessageCircle className="w-4 h-4" />,
    'Audit': <Eye className="w-4 h-4" />,
    'Education': <BookOpen className="w-4 h-4" />
  };
  
  return iconMap[theme] || <Star className="w-4 h-4" />;
};

export const ClusterNode: React.FC<ClusterNodeProps> = ({
  id,
  title,
  theme,
  decks,
  position,
  radius,
  glowIntensity,
  isSelected = false,
  userTier,
  onClusterClick,
  onDeckHover,
  className = ''
}) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const zkpTier = useZKPTier();

  // Calculate accessibility stats
  const accessibleDecks = decks.filter(deck => {
    return deck.accessible && (
      deck.tier === 'citizen' || 
      (deck.tier === 'moderator' && (userTier === 'moderator' || userTier === 'governor')) ||
      (deck.tier === 'governor' && userTier === 'governor')
    );
  });

  const accessibilityRatio = decks.length > 0 ? accessibleDecks.length / decks.length : 0;
  const avgGlow = decks.reduce((sum, deck) => sum + deck.glow, 0) / decks.length;

  // Performance tracking
  useEffect(() => {
    const startTime = Date.now();
    const endTime = Date.now();
    setRenderTime(endTime - startTime);
  }, []);

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Handle cluster click - now with expansion
  const handleClusterClick = () => {
    const engagementPoints = generateEngagementData(id);
    const newExpanded = !expanded;
    
    setExpanded(newExpanded);
    
    if (newExpanded) {
      console.log(`🌀 Cluster Expanded: ${title}`);
      console.log(`💠 Engagement: ${engagementPoints.toLocaleString()} Trust Points — Tier: ${zkpTier}`);
    } else {
      console.log(`🔻 Cluster Collapsed: ${title}`);
    }
    
    if (onClusterClick) {
      onClusterClick(id);
    }
  };

  // Handle hover with tooltip delay
  const handleMouseEnter = () => {
    setHovered(true);
    
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 250); // 250ms delay as per directive
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setShowTooltip(false);
    
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  // Handle focus for keyboard navigation
  const handleFocus = () => {
    setHovered(true);
    setShowTooltip(true);
  };

  const handleBlur = () => {
    setHovered(false);
    setShowTooltip(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClusterClick();
    }
  };

  // Check if deck is accessible based on tier
  const isDeckAccessible = (deck: DeckNode) => {
    const tierLevels = { 'citizen': 0, 'moderator': 1, 'governor': 2 };
    const userLevel = tierLevels[zkpTier];
    
    // Mock access rules - some decks require higher tiers
    const restrictedDecks = [6, 7, 8, 9]; // Audit and consensus decks
    
    if (restrictedDecks.includes(deck.id)) {
      return userLevel >= 1; // Requires moderator or governor
    }
    
    return true; // Most decks accessible to all tiers
  };

  // Get cluster description for tooltip
  const getClusterDescription = () => {
    const descriptions = {
      'identity': 'Feedback systems that let your voice be heard.',
      'governance': 'Civic engagement and voting systems for community decisions.',
      'feedback': 'Community feedback and sentiment analysis tools.',
      'audit': 'Transparency and audit trail verification systems.',
      'education': 'Learning and certification systems for civic knowledge.'
    };
    
    return descriptions[id as keyof typeof descriptions] || 'Civic engagement cluster';
  };

  // Render individual deck node with enhanced tier access
  const renderDeckNode = (deck: DeckNode) => {
    const isAccessible = isDeckAccessible(deck);
    const glowOpacity = isAccessible ? deck.glow / 100 : 0.3;
    const nodeSize = expanded ? (isAccessible ? 14 : 10) : (isAccessible ? 12 : 8);
    
    return (
      <div
        key={deck.id}
        className={`absolute rounded-full transition-all duration-300 cursor-pointer ${
          isAccessible ? 'bg-blue-400 hover:bg-blue-300' : 'bg-red-400/60 hover:bg-red-400/80'
        }`}
        style={{
          left: `${deck.position.x}px`,
          top: `${deck.position.y}px`,
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          boxShadow: `0 0 ${deck.glow / 5}px rgba(59, 130, 246, ${glowOpacity})`,
          transform: 'translate(-50%, -50%)',
          opacity: isAccessible ? 1 : 0.6
        }}
        onMouseEnter={() => {
          setHovered(true);
          if (!isAccessible) {
            console.log(`🔒 Locked deck: ${deck.title} — Upgrade required`);
          }
          onDeckHover?.(deck.id);
        }}
        onMouseLeave={() => {
          setHovered(false);
          onDeckHover?.(null);
        }}
        role="listitem"
        aria-label={`Deck: ${deck.title} — ${isAccessible ? `Accessible to ${deck.tier} tier` : `Locked for ${deck.tier} tier`} — ${deck.moduleCount} modules`}
        tabIndex={0}
        title={!isAccessible ? "Upgrade tier to access this deck" : `${deck.title} - ${deck.moduleCount} modules`}
      >
        {/* Tier lock indicator */}
        {!isAccessible && (
          <div className="absolute -top-1 -right-1">
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
        )}
        
        {/* Module count indicator */}
        {isAccessible && deck.moduleCount > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {deck.moduleCount}
          </div>
        )}
      </div>
    );
  };

  // Calculate cluster visual properties
  const clusterScale = isSelected ? 1.1 : (hovered ? 1.05 : 1);
  const clusterOpacity = glowIntensity / 100;
  const borderIntensity = isSelected ? 0.8 : (hovered ? 0.6 : 0.4);

  return (
    <div
      className={`absolute group ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(${clusterScale})`,
        transition: 'transform 0.3s ease-out'
      }}
      role="listitem"
      aria-label={`Cluster: ${title} - ${theme} - ${accessibleDecks.length}/${decks.length} decks accessible`}
    >
      {/* Cluster background glow with expansion states */}
      <div
        className={`absolute rounded-full border-2 transition-all duration-500 cursor-pointer ${
          expanded
            ? 'border-green-400 bg-green-500/20 ring-4 ring-green-400/30'
            : isSelected 
              ? 'border-blue-400 bg-blue-500/20' 
              : hovered 
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 bg-slate-700/10 hover:border-slate-500'
        }`}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          boxShadow: `0 0 ${radius / 2}px rgba(59, 130, 246, ${clusterOpacity * borderIntensity})`,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={handleClusterClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-expanded={expanded}
        aria-describedby={showTooltip ? `${id}-tooltip` : undefined}
        tabIndex={0}
        role="button"
      />
      
      {/* Cluster title */}
      <div
        className="absolute text-white font-semibold text-sm pointer-events-none select-none"
        style={{
          transform: 'translate(-50%, -50%)',
          top: `-${radius + 20}px`,
          left: '0'
        }}
      >
        {title}
      </div>
      
      {/* Cluster center icon with expansion effects */}
      <div
        className={`absolute transition-all duration-300 ${
          expanded ? 'text-green-400 scale-125' : 'text-blue-400'
        }`}
        style={{
          transform: 'translate(-50%, -50%)'
        }}
      >
        {getClusterIcon(title)}
      </div>

      {/* Engagement indicator for expanded state */}
      {expanded && (
        <div 
          className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse"
          style={{
            transform: 'translate(-50%, -50%)'
          }}
        >
          <TrendingUp className="w-3 h-3" />
        </div>
      )}
      
      {/* Accessibility indicator */}
      <div
        className="absolute text-xs text-slate-400 pointer-events-none select-none"
        style={{
          transform: 'translate(-50%, -50%)',
          top: `${radius + 15}px`,
          left: '0'
        }}
      >
        {accessibleDecks.length}/{decks.length}
      </div>
      
      {/* Render deck nodes in orbit */}
      {decks.map(renderDeckNode)}
      
      {/* Enhanced interactive tooltip with expansion states */}
      {showTooltip && (
        <div
          id={`${id}-tooltip`}
          className="absolute bg-slate-800/95 text-white text-sm p-3 rounded-lg border border-slate-600 pointer-events-none z-20 shadow-xl"
          style={{
            transform: 'translate(-50%, -50%)',
            top: `${radius + 55}px`,
            left: '0',
            minWidth: '200px',
            maxWidth: '280px'
          }}
        >
          <div className="text-center">
            <div className="font-semibold text-blue-400">{title}</div>
            <div className="text-slate-300 mt-1 text-xs">{getClusterDescription()}</div>
            <div className="mt-2 space-y-1 text-xs">
              <div>Decks: {decks.length}</div>
              <div>Accessible: {accessibleDecks.length}</div>
              <div>Avg Glow: {avgGlow.toFixed(0)}%</div>
              <div>Engagement: {glowIntensity}%</div>
            </div>
            {expanded && (
              <div className="mt-2 pt-2 border-t border-slate-600 text-xs">
                <div className="text-green-400">💠 Engagement: {generateEngagementData(id).toLocaleString()} TP</div>
                <div className="text-slate-400">Tier: {zkpTier}</div>
                <div className="text-yellow-400">🌀 Expanded Mode Active</div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
      
      {/* Development info */}
      {process.env.NODE_ENV === 'development' && renderTime > 0 && (
        <div
          className="absolute text-xs text-slate-500 pointer-events-none select-none"
          style={{
            transform: 'translate(-50%, -50%)',
            top: `${radius + 60}px`,
            left: '0'
          }}
        >
          {renderTime}ms
        </div>
      )}
    </div>
  );
};

export default ClusterNode;