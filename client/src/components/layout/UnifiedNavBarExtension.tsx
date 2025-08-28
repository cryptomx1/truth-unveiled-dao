import React, { useEffect } from 'react';
import { Compass, Sparkles, BookOpen, Vote, Clock } from 'lucide-react';
import { useTranslation } from '../../translation/useTranslation';

// Types for navigation
type ViewType = 'onboarding' | 'constellation' | 'deck' | 'audit' | 'memory';
type TierType = 'citizen' | 'moderator' | 'governor';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  tierRequired: TierType[];
}

interface UnifiedNavBarExtensionProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userTier?: TierType;
}

// Mock ZKP tier hook
const useZKPTier = (): TierType => {
  // Mock tier - can be extended with real ZKP logic
  return 'citizen';
};

// Navigation items with tier requirements - now using translation function
const getNavItems = (t: (key: string) => string): NavItem[] => [
  {
    id: 'onboarding',
    label: t('nav.onboarding'),
    icon: <Compass className="w-5 h-5" />,
    emoji: '🧭',
    tierRequired: ['citizen', 'moderator', 'governor']
  },
  {
    id: 'constellation',
    label: t('nav.constellation'),
    icon: <Sparkles className="w-5 h-5" />,
    emoji: '🌌',
    tierRequired: ['citizen', 'moderator', 'governor']
  },
  {
    id: 'deck',
    label: t('nav.deck'),
    icon: <BookOpen className="w-5 h-5" />,
    emoji: '📚',
    tierRequired: ['citizen', 'moderator', 'governor']
  },
  {
    id: 'audit',
    label: t('nav.audit'),
    icon: <Vote className="w-5 h-5" />,
    emoji: '🗳️',
    tierRequired: ['moderator', 'governor']
  },
  {
    id: 'memory',
    label: t('nav.memory'),
    icon: <Clock className="w-5 h-5" />,
    emoji: '🔁',
    tierRequired: ['citizen', 'moderator', 'governor']
  }
];

export const UnifiedNavBarExtension: React.FC<UnifiedNavBarExtensionProps> = ({
  currentView,
  onViewChange,
  userTier
}) => {
  const { t } = useTranslation();
  const zkpTier = useZKPTier();
  const effectiveTier = userTier || zkpTier;
  const navItems = getNavItems(t);

  // Filter nav items based on tier
  const visibleItems = navItems.filter(item => 
    item.tierRequired.includes(effectiveTier)
  );

  // Handle navigation click
  const handleNavClick = (view: ViewType) => {
    const viewNames = {
      onboarding: t('nav.onboarding'),
      constellation: t('nav.constellation'),
      deck: t('nav.deck'),
      audit: t('nav.audit'),
      memory: t('nav.memory')
    };
    
    console.log(`🧭 Navigation: Switched to ${viewNames[view]}`);
    onViewChange(view);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, view: ViewType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavClick(view);
    }
  };

  // Log tier-based visibility on mount
  useEffect(() => {
    console.log(`🛡️ NavBar: Tier ${effectiveTier} - ${visibleItems.length} tabs visible`);
  }, [effectiveTier, visibleItems.length]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 max-w-md mx-auto"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
              currentView === item.id
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            role="tab"
            aria-current={currentView === item.id ? 'page' : undefined}
            aria-selected={currentView === item.id}
            aria-label={`Navigate to ${item.label}`}
            tabIndex={0}
          >
            <span className="text-lg" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-xs font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* Tier indicator (subtle) */}
      <div className="absolute top-1 right-2 text-xs text-slate-500">
        {effectiveTier}
      </div>
    </nav>
  );
};