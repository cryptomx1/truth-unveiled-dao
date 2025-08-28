/**
 * CivicCommandCenter.tsx - Phase Zero
 * Truth Unveiled Dashboard Launch Shell
 * Unified interface for all civic modules and components
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Bell, 
  Target, 
  Calendar, 
  Shield, 
  Award, 
  BookOpen, 
  TrendingUp,
  Users,
  AlertCircle,
  Settings,
  Menu,
  X,
  ChevronUp
} from 'lucide-react';

// Import core components
import GovMapEngine from '../components/geo/GovMapEngine';
import { CivicMemoryIndex } from '../components/memory/CivicMemoryIndex';
import FeedbackZoneEngine from '../components/feedback/FeedbackZoneEngine';
import { UniversalCopyButton } from '../components/ui/universal-copy-button';

// Types for session management
interface UserSession {
  tier: 'Citizen' | 'Trusted Voice' | 'Civic Guide' | 'Consensus Architect';
  lang: 'en' | 'es' | 'fr';
  mission: string;
  lastView: string;
  zip: string;
  trustLevel: number;
  streak: number;
  notifications: number;
}

// Module configuration
interface ModuleConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
  enabled: boolean;
  tier?: UserSession['tier'][];
  description: string;
}

// Welcome card component
const WelcomeCard: React.FC<{ session: UserSession }> = ({ session }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Truth Unveiled Civic Genome
          </h1>
          <p className="text-blue-200 mb-4">
            Welcome back, {session.tier} • {session.zip}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-400">
              <Shield className="w-4 h-4" />
              <span>Trust: {session.trustLevel}%</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Target className="w-4 h-4" />
              <span>Streak: {session.streak} days</span>
            </div>
            {session.notifications > 0 && (
              <div className="flex items-center gap-1 text-red-400">
                <Bell className="w-4 h-4" />
                <span>{session.notifications} alerts</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-4xl opacity-20">🏛️</div>
      </div>
    </div>
  );
};

// Trust snapshot component
const TrustSnapshot: React.FC<{ session: UserSession }> = ({ session }) => {
  const getTrustColor = (level: number) => {
    if (level >= 75) return 'text-green-400';
    if (level >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrustStatus = (level: number) => {
    if (level >= 75) return 'Strong';
    if (level >= 50) return 'Moderate';
    return 'Building';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">Trust Status</h3>
        <Shield className="w-5 h-5 text-blue-400" />
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-300">Current Level</span>
            <span className={getTrustColor(session.trustLevel)}>
              {session.trustLevel}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                session.trustLevel >= 75 ? 'bg-green-400' :
                session.trustLevel >= 50 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${session.trustLevel}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Status: <span className={getTrustColor(session.trustLevel)}>
            {getTrustStatus(session.trustLevel)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Module panel component
const ModulePanel: React.FC<{ modules: ModuleConfig[]; onModuleSelect: (id: string) => void; activeModule: string | null }> = ({ 
  modules, 
  onModuleSelect, 
  activeModule 
}) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="font-semibold text-white mb-3">Civic Modules</h3>
      <div className="grid grid-cols-2 gap-2">
        {modules.filter(m => m.enabled).map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                isActive 
                  ? 'bg-blue-900/30 border-blue-600 text-blue-300' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
              }`}
              aria-label={`${module.name} module`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{module.name}</span>
              </div>
              <p className="text-xs opacity-75 line-clamp-2">
                {module.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mission summary component
const MissionSummary: React.FC<{ session: UserSession }> = ({ session }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">Current Mission</h3>
        <Target className="w-5 h-5 text-orange-400" />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-300">{session.mission}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>Day {session.streak} of streak</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div 
            className="h-1.5 bg-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(session.streak * 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Main CivicCommandCenter component
export const CivicCommandCenter: React.FC = () => {
  // Session state management - Check for Commander Mark CID
  const [session, setSession] = useState<UserSession>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid') || localStorage.getItem('citizenCID') || '';
    
    // Check for Commander Mark CID pattern
    if (cid.includes('commander-mark')) {
      console.log('🎖️ Commander Mode Activated - Auto-unlocking all decks');
      return {
        tier: 'Consensus Architect',
        lang: 'en',
        mission: 'Command Truth Unveiled Civic Genome infrastructure',
        lastView: 'dashboard',
        zip: '20852',
        trustLevel: 100,
        streak: 6, // Default 6-day streak as specified
        notifications: 0
      };
    }
    
    return {
      tier: 'Citizen',
      lang: 'en',
      mission: 'Build civic engagement through daily participation',
      lastView: 'dashboard',
      zip: '20852',
      trustLevel: 67,
      streak: 8,
      notifications: 3
    };
  });

  // Module state
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Refs
  const mainContentRef = useRef<HTMLDivElement>(null);
  const ariaLiveRef = useRef<HTMLDivElement>(null);

  // Module configuration
  const modules: ModuleConfig[] = [
    {
      id: 'govmap',
      name: 'Gov Map',
      component: GovMapEngine,
      icon: MapPin,
      enabled: true,
      description: 'Interactive legislative district mapping with live bill tracking'
    },
    {
      id: 'memory',
      name: 'Civic Memory',
      component: CivicMemoryIndex,
      icon: BookOpen,
      enabled: true,
      description: 'Historical civic knowledge archive and contribution tracking'
    },
    {
      id: 'decks',
      name: 'Civic Decks',
      component: () => (
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Civic Deck Interface</h3>
            <p className="text-slate-400 mb-4">Access all 20 civic decks with secure CID-tier validation</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: 'wallet-overview', name: 'Wallet Overview', tier: 'TIER_0' },
              { id: 'governance', name: 'Governance', tier: 'TIER_1' },
              { id: 'education', name: 'Education', tier: 'TIER_0' },
              { id: 'finance', name: 'Finance', tier: 'TIER_1' },
              { id: 'privacy', name: 'Privacy', tier: 'TIER_1' },
              { id: 'zkp-layer', name: 'ZKP Layer', tier: 'TIER_2' },
              { id: 'civic-audit', name: 'Civic Audit', tier: 'TIER_2' },
              { id: 'secure-assets', name: 'Secure Assets', tier: 'TIER_2' },
              { id: 'consensus-layer', name: 'Consensus Layer', tier: 'TIER_2' },
              { id: 'civic-engagement', name: 'Civic Engagement', tier: 'TIER_1' },
              { id: 'civic-identity', name: 'Civic Identity', tier: 'TIER_1' },
              { id: 'civic-governance', name: 'Civic Governance', tier: 'TIER_2' },
              { id: 'civic-amendments', name: 'Civic Amendments', tier: 'TIER_2' },
              { id: 'civic-justice', name: 'Civic Justice', tier: 'TIER_2' },
              { id: 'civic-education', name: 'Civic Education', tier: 'TIER_1' },
              { id: 'civic-diplomacy', name: 'Civic Diplomacy', tier: 'TIER_3' },
              { id: 'civic-sustainability', name: 'Civic Sustainability', tier: 'TIER_2' },
              { id: 'civic-wellbeing', name: 'Civic Wellbeing', tier: 'TIER_1' },
              { id: 'civic-legacy', name: 'Civic Legacy', tier: 'TIER_1' }
            ].map(deck => (
              <button
                key={deck.id}
                onClick={() => window.location.href = `/deck/${deck.id}`}
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-3 text-left transition-colors"
                aria-label={`Access ${deck.name} deck`}
              >
                <div className="font-medium text-white text-sm">{deck.name}</div>
                <div className="text-xs text-slate-400 mt-1">{deck.tier}</div>
              </button>
            ))}
          </div>
        </div>
      ),
      icon: Target,
      enabled: true,
      description: 'Access all civic decks with CID-tier security'
    },
    {
      id: 'notifications',
      name: 'Alerts',
      component: () => (
        <div className="p-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <h3 className="text-white font-medium mb-1">Alert System</h3>
            <p className="text-slate-400 text-sm">Real-time civic notifications and alerts</p>
          </div>
        </div>
      ),
      icon: Bell,
      enabled: false,
      description: 'Real-time civic alerts and push notifications'
    },
    {
      id: 'trust',
      name: 'Trust Zone',
      component: () => (
        <div className="p-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <h3 className="text-white font-medium mb-1">Trust Zone</h3>
            <p className="text-slate-400 text-sm">Zero-knowledge proof verification and trust management</p>
          </div>
        </div>
      ),
      icon: Shield,
      enabled: false,
      description: 'Zero-knowledge proof verification and trust management'
    },
    {
      id: 'sentiment',
      name: 'Sentiment',
      component: () => (
        <div className="p-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h3 className="text-white font-medium mb-1">Sentiment Analysis</h3>
            <p className="text-slate-400 text-sm">Community sentiment tracking and analysis</p>
          </div>
        </div>
      ),
      icon: TrendingUp,
      enabled: false,
      description: 'Community sentiment analysis and feedback systems'
    },
    {
      id: 'feedback',
      name: 'Feedback',
      component: () => (
        <FeedbackZoneEngine
          context={{
            zip: session.zip,
            district: "8B",
            billId: "HR2034",
            title: "Civic Data Privacy Act",
            sponsor: "Rep. Lin",
            status: "Introduced"
          }}
          userTier={session.tier}
        />
      ),
      icon: Users,
      enabled: true,
      description: 'ZIP-based civic feedback for live legislation'
    }
  ];

  // Initialize component
  useEffect(() => {
    console.log(`🧭 CommandCenter View Loaded for Tier: ${session.tier}, ZIP: ${session.zip}`);
    
    // Set up scroll listener for back-to-top
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [session]);

  // Handle module selection
  const handleModuleSelect = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    setActiveModule(moduleId);
    setShowMobileMenu(false);
    
    console.log(`🛠️ Module Injected: ${module.name}`);
    
    // Announce module change via ARIA
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `${module.name} module loaded`;
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setActiveModule(null);
    setShowMobileMenu(false);
    
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = 'Returned to dashboard';
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get active module component
  const getActiveModuleComponent = () => {
    const module = modules.find(m => m.id === activeModule);
    if (!module) return null;

    const Component = module.component;
    return <Component />;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Skip Links */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Top Navigation */}
      <nav 
        className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700"
        role="banner"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToDashboard}
                className="text-white font-semibold hover:text-blue-300 transition-colors"
                aria-label="Return to dashboard"
              >
                🏛️ Truth Unveiled
              </button>
              {activeModule && (
                <span className="text-slate-400 text-sm">
                  / {modules.find(m => m.id === activeModule)?.name}
                </span>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-slate-300">
                {session.tier} • {session.zip}
              </div>
              {session.notifications > 0 && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-orange-400" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {session.notifications}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white hover:text-slate-300 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={handleBackToDashboard}
                className="block w-full text-left px-3 py-2 text-white hover:bg-slate-700 rounded"
              >
                Dashboard
              </button>
              {modules.filter(m => m.enabled).map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => handleModuleSelect(module.id)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded"
                  >
                    <Icon className="w-4 h-4" />
                    {module.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main 
        ref={mainContentRef}
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
        aria-label="Command center content"
      >
        {activeModule ? (
          /* Module View */
          <div 
            className="space-y-6"
            role="region"
            aria-label={`${modules.find(m => m.id === activeModule)?.name} module`}
          >
            {getActiveModuleComponent()}
          </div>
        ) : (
          /* Dashboard View */
          <div className="space-y-6">
            {/* IPFS Deployment Banner */}
            <section role="region" aria-label="IPFS deployment status">
              <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="text-white font-semibold">Loaded from IPFS</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-300 text-sm">CID: QmXj5llhfmbendtruthunveiled</p>
                        <UniversalCopyButton
                          content="QmXj5llhfmbendtruthunveiled"
                          label="Copy CID"
                          size="sm"
                          showLabel={false}
                          className="bg-blue-600/30 border-blue-500/50 text-blue-200 hover:bg-blue-600/40"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <UniversalCopyButton
                      content="https://gateway.pinata.cloud/ipfs/QmXj5llhfmbendtruthunveiled"
                      label="Copy IPFS Link"
                      size="md"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    />
                    <UniversalCopyButton
                      content={`Truth Unveiled Civic Genome v1.0 LIVE - Deployed to IPFS
CID: QmXj5llhfmbendtruthunveiled
Gateway: https://gateway.pinata.cloud/ipfs/QmXj5llhfmbendtruthunveiled
Status: Global decentralized access enabled • 20 Decks • 80+ Modules
For JASMY/Claude collaboration`}
                      label="Copy Full Status"
                      size="md"
                      className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Welcome Section */}
            <section role="region" aria-label="Welcome and status">
              <WelcomeCard session={session} />
            </section>

            {/* Quick Stats Grid */}
            <section 
              role="region" 
              aria-label="Quick status overview"
              className="grid md:grid-cols-3 gap-6"
            >
              <TrustSnapshot session={session} />
              <MissionSummary session={session} />
              <ModulePanel 
                modules={modules} 
                onModuleSelect={handleModuleSelect}
                activeModule={activeModule}
              />
            </section>

            {/* Recent Activity */}
            <section role="region" aria-label="Recent activity">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Completed civic engagement mission (+15 TP)</span>
                    <span className="text-slate-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Viewed legislative updates for District {session.zip}</span>
                    <span className="text-slate-500 ml-auto">5 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>Trust level increased to {session.trustLevel}%</span>
                    <span className="text-slate-500 ml-auto">1 day ago</span>
                  </div>
                </div>
              </div>
            </section>

            {/* System Status */}
            <section role="region" aria-label="System status">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">
                      All systems operational • Phase XVI.3 Push Notifications Active
                    </span>
                  </div>
                  <Settings className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* ARIA Live Region */}
      <div 
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
};

export default CivicCommandCenter;