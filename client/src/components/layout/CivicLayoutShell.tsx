import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, BookOpen, Shield, TrendingUp, Vote } from 'lucide-react';
import { CivicMissionOnboardingCard } from '../phase/CivicMissionOnboardingCard';
import { CivicConstellationExplorer } from '../navigation/CivicConstellationExplorer';
import { AccessibilityHarmonyEngine } from '../system/AccessibilityHarmonyEngine';
import { UnifiedNavBarExtension } from './UnifiedNavBarExtension';
import { UserSessionEngine, useUserSession as useUserSessionEngine } from '../system/UserSessionEngine';
import { CivicMemoryIndex } from '../memory/CivicMemoryIndex';
import { ReplayBufferStatusComponent } from '../status/ReplayBufferStatusComponent';
import { LanguageContextAudit, LanguageToggle } from '../system/LanguageContextAudit';
import { useTranslation } from '../../translation/useTranslation';
import { LanguageContext } from '../../context/LanguageContext';

// Types for the shell
type ViewType = 'onboarding' | 'constellation' | 'deck' | 'audit' | 'memory';

// Re-export from centralized context
export { useLangContext } from '../../context/LanguageContext';

// Legacy session hook that wraps the new UserSessionEngine
export const useUserSession = () => {
  const sessionEngine = useUserSessionEngine();
  return {
    session: {
      tier: sessionEngine.session.tier,
      trustStreak: sessionEngine.session.streakDays,
      did: 'did:civic:user_001', // Mock DID for now
      engagementPoints: 42318 // Mock engagement points
    },
    updateSession: (updates: any) => {
      if (updates.tier) sessionEngine.updateTier(updates.tier);
      if (updates.trustStreak) sessionEngine.updateStreak(updates.trustStreak);
    }
  };
};

// Internal CivicLayoutShell component (wrapped by UserSessionEngine)
const CivicLayoutShellInternal: React.FC = () => {
  const sessionEngine = useUserSessionEngine();
  const { t } = useTranslation();
  const [language, setLanguage] = useState(() => sessionEngine.session.lang);
  
  // Sync current view with session engine
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    // Map session lastView to ViewType
    const viewMap: Record<string, ViewType> = {
      'onboarding': 'onboarding',
      'constellation': 'constellation', 
      'deck': 'deck',
      'memory': 'memory'
    };
    return viewMap[sessionEngine.session.lastView] || 'constellation';
  });

  // Initialize shell and log startup
  useEffect(() => {
    console.log(t('accessibility.initialized'));
    console.log(t('accessibility.tier.status', { 
      tier: sessionEngine.session.tier, 
      days: sessionEngine.session.streakDays, 
      mission: sessionEngine.session.mission 
    }));
  }, [sessionEngine.session, t]);

  // Handle view switching with session persistence
  const handleViewSwitch = (view: ViewType) => {
    setCurrentView(view);
    // Update session engine with new view
    const viewMap: Record<ViewType, 'onboarding' | 'constellation' | 'deck' | 'memory'> = {
      'onboarding': 'onboarding',
      'constellation': 'constellation',
      'deck': 'deck',
      'audit': 'deck', // Map audit to deck for session storage
      'memory': 'memory'
    };
    sessionEngine.updateLastView(viewMap[view]);
  };

  // Sync language changes with session engine
  useEffect(() => {
    if (language !== sessionEngine.session.lang) {
      sessionEngine.updateLang(language as 'en' | 'es' | 'fr');
    }
  }, [language, sessionEngine]);

  // Sync session language changes to local state
  useEffect(() => {
    if (sessionEngine.session.lang !== language) {
      setLanguage(sessionEngine.session.lang);
    }
  }, [sessionEngine.session.lang, language]);

  // Get tier icon and color
  const getTierStyle = (tier: string) => {
    switch (tier) {
      case 'governor':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'moderator':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20' };
      default:
        return { color: 'text-green-400', bg: 'bg-green-500/20' };
    }
  };

  const tierStyle = getTierStyle(sessionEngine.session.tier);

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'onboarding':
        return <CivicMissionOnboardingCard />;
      case 'constellation':
        return <CivicConstellationExplorer />;
      case 'deck':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-slate-700/50 rounded-lg p-8 max-w-sm">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Civic Deck Interfaces Active
              </h2>
              <p className="text-slate-300 text-sm">
                Access specialized civic engagement tools through the Command Center
              </p>
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-slate-700/50 rounded-lg p-8 max-w-sm">
              <Vote className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('deck.audit.title')}
              </h2>
              <p className="text-slate-300 text-sm">
                {t('deck.audit.description')}
              </p>
            </div>
          </div>
        );
      case 'memory':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <CivicMemoryIndex />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <LanguageContextAudit>
        <div className="min-h-screen bg-slate-900 text-white">
        {/* Tier Status Banner */}
        <div className={`sticky top-0 z-50 ${tierStyle.bg} border-b border-slate-700`}>
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${tierStyle.color}`} />
                <span className="text-sm font-medium">
                  {t('tier.label')} {t(`tier.${sessionEngine.session.tier}`)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm">
                  {t('streak.label')} {t('streak.days', { count: sessionEngine.session.streakDays })}
                </span>
                <LanguageToggle compact className="ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Main App Viewport */}
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          {/* View Container */}
          <div 
            className="flex-1 relative"
            role="main"
            aria-label={t('view.current', { view: currentView })}
          >
            {renderCurrentView()}
          </div>

          {/* Unified Navigation Bar Extension */}
          <UnifiedNavBarExtension
            currentView={currentView}
            onViewChange={handleViewSwitch}
            userTier={sessionEngine.session.tier}
          />
        </div>

        {/* Accessibility Engine Integration */}
        <AccessibilityHarmonyEngine />
        
        {/* Replay Buffer Status Component */}
        <ReplayBufferStatusComponent />
        </div>
      </LanguageContextAudit>
    </LanguageContext.Provider>
  );
};

// Main CivicLayoutShell component wrapped with UserSessionEngine
export const CivicLayoutShell: React.FC = () => {
  return (
    <UserSessionEngine initialSession={{ lang: 'es', tier: 'citizen', mission: 'voice' }}>
      <CivicLayoutShellInternal />
    </UserSessionEngine>
  );
};