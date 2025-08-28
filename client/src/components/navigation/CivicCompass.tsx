import React, { useState, useEffect, useRef } from 'react';
import { Compass, Search, X, Target, Users, Shield, BookOpen, DollarSign } from 'lucide-react';

interface CivicCompassProps {
  isDarkMode?: boolean;
  onMissionSelect?: (mission: string) => void;
  onClose?: () => void;
  className?: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  estimatedTime: string;
}

const CivicCompass: React.FC<CivicCompassProps> = ({
  isDarkMode = true,
  onMissionSelect,
  onClose,
  className = ''
}) => {
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [renderTime, setRenderTime] = useState(0);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const mountTimestamp = useRef(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // Mock missions for scaffolding
  const missions: Mission[] = [
    {
      id: 'identity-setup',
      title: 'Establish Digital Identity',
      description: 'Set up your decentralized identity and verify credentials',
      icon: <Users className="w-5 h-5" />,
      category: 'Identity',
      estimatedTime: '10-15 min'
    },
    {
      id: 'governance-participate',
      title: 'Participate in Governance',
      description: 'Review and vote on active civic proposals',
      icon: <Shield className="w-5 h-5" />,
      category: 'Governance',
      estimatedTime: '5-10 min'
    },
    {
      id: 'education-explore',
      title: 'Explore Civic Education',
      description: 'Learn about civic processes and earn certifications',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'Education',
      estimatedTime: '15-30 min'
    },
    {
      id: 'finance-manage',
      title: 'Manage Trust Points',
      description: 'Check earnings, review transactions, and manage rewards',
      icon: <DollarSign className="w-5 h-5" />,
      category: 'Finance',
      estimatedTime: '5-10 min'
    },
    {
      id: 'security-audit',
      title: 'Review Security Status',
      description: 'Audit your privacy settings and security compliance',
      icon: <Shield className="w-5 h-5" />,
      category: 'Security',
      estimatedTime: '10-15 min'
    }
  ];

  // Filter missions based on search query
  const filteredMissions = missions.filter(mission =>
    mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle mission selection
  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission.id);
    onMissionSelect?.(mission.title);
    console.log(`🧭 NAV SCAFFOLD: Mission selected - ${mission.title}`);
  };

  // Handle close
  const handleClose = () => {
    onClose?.();
  };

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Component initialization with nuclear TTS override
  useEffect(() => {
    const startTime = Date.now();
    
    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Civic compass initialized"');
    }

    // Nuclear override snippet - global enforcer
    const nuke = () => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"]');
      liveRegions.forEach(node => node.setAttribute('aria-live', 'off'));
      console.log('🔇 NUCLEAR TTS OVERRIDE: All aria-live regions disabled');
    };
    nuke();

    const totalRenderTime = Date.now() - startTime;
    setRenderTime(totalRenderTime);
    
    if (totalRenderTime > 30) {
      console.warn(`⚠️ CivicCompass render time: ${totalRenderTime}ms (exceeds 30ms target)`);
    }
    
    console.log('🧭 NAV SCAFFOLD: Civic Compass Online');
    
    // Cleanup on unmount
    return () => nuke();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      {/* ARIA Live Region - TTS Suppressed */}
      <div 
        aria-live="off" 
        aria-atomic="true" 
        className="sr-only"
        aria-hidden="true"
      >
        Civic compass mission selector
      </div>

      <div 
        ref={overlayRef}
        className={`w-full max-w-2xl max-h-[80vh] ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
        } border rounded-lg shadow-2xl overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <Compass className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Civic Compass
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  What's your mission today?
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Close civic compass"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search missions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-md border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              aria-label="Search missions"
            />
          </div>
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => handleMissionSelect(mission)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMission === mission.id
                      ? isDarkMode 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-blue-500 bg-blue-50'
                      : isDarkMode 
                        ? 'border-slate-700 bg-slate-700/50 hover:border-slate-600' 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Mission: ${mission.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMissionSelect(mission);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-md ${
                      isDarkMode ? 'bg-slate-600' : 'bg-white'
                    }`}>
                      <div className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                        {mission.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {mission.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDarkMode 
                            ? 'bg-slate-600 text-slate-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {mission.estimatedTime}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'} mb-2`}>
                        {mission.description}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Target className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {mission.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Search className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-slate-500' : 'text-gray-400'
                }`} />
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  No missions found matching your search
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              {filteredMissions.length} missions available
            </span>
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              Render: {renderTime}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicCompass;