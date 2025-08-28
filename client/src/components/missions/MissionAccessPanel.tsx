/**
 * MissionAccessPanel.tsx - Phase XXV
 * Mission Access UI with Lock/Unlock Indicators
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Unlock,
  Lock,
  Brain,
  Shield,
  TrendingUp,
  MessageSquare,
  Vote,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Trophy,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  MissionUnlockEngine,
  createUserContext,
  type UnlockEligibility,
  type UserContext,
  type UnlockAttempt
} from '../../missions/MissionUnlockEngine';
import {
  CivicMissionLedger,
  type MissionDefinition
} from '../../missions/CivicMissionLedger';
import {
  announceUnlockSuccess,
  announceUnlockBlocked,
  explainEligibility,
  provideNextStepsGuidance
} from '../../missions/MissionNarrationNode';
import {
  logUnlockAttempt,
  logUnlockSuccess,
  logUnlockBlocked
} from '../../services/UnlockTelemetryLogger';

// Component props interface
interface MissionAccessPanelProps {
  userId?: string;
  userTier?: 'Citizen' | 'Verifier' | 'Moderator' | 'Governor' | 'Administrator';
  trustScore?: number;
  showAdvancedInfo?: boolean;
  onMissionClick?: (missionId: string, eligibility: UnlockEligibility) => void;
}

// Main MissionAccessPanel component
export const MissionAccessPanel: React.FC<MissionAccessPanelProps> = ({
  userId = 'did:civic:commander-mark',
  userTier = 'Administrator',
  trustScore = 98,
  showAdvancedInfo = false,
  onMissionClick
}) => {
  // Component state
  const [missions, setMissions] = useState<Array<{
    mission: MissionDefinition;
    eligibility: UnlockEligibility;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  // ARIA live region ref
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  
  // Initialize engines
  const ledger = CivicMissionLedger.getInstance();
  const unlockEngine = MissionUnlockEngine.getInstance();
  
  // Load missions and eligibility
  const loadMissions = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      const allMissions = ledger.getAllMissionDefinitions();
      
      // Create user context with mock replay history
      const userContext: UserContext = createUserContext(userId, userTier, trustScore, {
        replayHistory: [
          {
            missionId: 'wallet-overview-deck1',
            traceHash: 'trace:wallet:abc123',
            validatedAt: new Date(Date.now() - 86400000).toISOString(),
            isValid: true
          },
          {
            missionId: 'identity-verification-deck12',
            traceHash: 'trace:identity:def456',
            validatedAt: new Date(Date.now() - 43200000).toISOString(),
            isValid: true
          },
          {
            missionId: 'consensus-governance-deck9',
            traceHash: 'trace:consensus:ghi789',
            validatedAt: new Date(Date.now() - 21600000).toISOString(),
            isValid: true
          }
        ],
        feedbackBadges: userTier === 'Administrator' ? ['verified_contributor', 'trusted_voice'] : [],
        verifiedVotes: userTier === 'Administrator' ? 12 : userTier === 'Governor' ? 5 : 0,
        lastActivityAt: new Date().toISOString()
      });
      
      // Check eligibility for each mission
      const missionEligibility = allMissions.map(mission => {
        const eligibility = unlockEngine.checkUnlockEligibility(mission.missionId, userContext);
        return {
          mission,
          eligibility
        };
      });
      
      setMissions(missionEligibility);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`🧭 Missions loaded — ${allMissions.length} missions | Eligibility checked | Duration: ${duration}ms`);
      
      if (ariaLiveRef.current) {
        const unlockedCount = missionEligibility.filter(m => m.eligibility.isUnlocked).length;
        ariaLiveRef.current.textContent = `${allMissions.length} missions loaded. ${unlockedCount} unlocked, ${allMissions.length - unlockedCount} locked.`;
      }
      
    } catch (error) {
      console.error('❌ Failed to load missions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle mission click
  const handleMissionClick = async (mission: MissionDefinition, eligibility: UnlockEligibility) => {
    const startTime = performance.now();
    
    // Log unlock attempt
    logUnlockAttempt(mission.missionId, userId, userTier, trustScore, 0);
    
    if (eligibility.isUnlocked) {
      // Mission is already unlocked
      announceUnlockSuccess(mission.missionId, mission.title, eligibility.unlockedVia || 'verified', userId);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      logUnlockSuccess(mission.missionId, userId, eligibility.unlockedVia || 'verified', userTier, trustScore, duration);
      
      if (onMissionClick) {
        onMissionClick(mission.missionId, eligibility);
      }
      
      // Navigate to mission (in a real app, this would use router)
      console.log(`🧭 Navigating to mission: ${mission.title} at ${mission.route}`);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Accessing mission: ${mission.title}`;
      }
      
    } else {
      // Mission is locked, show requirements
      announceUnlockBlocked(mission.missionId, mission.title, eligibility.blockers, userId);
      explainEligibility(eligibility, mission.title, userId);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      logUnlockBlocked(mission.missionId, userId, eligibility.blockers, userTier, trustScore, duration);
      
      setSelectedMissionId(mission.missionId);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Mission "${mission.title}" is locked. ${eligibility.blockers.length} requirements must be met.`;
      }
    }
  };
  
  // Toggle mission details
  const toggleMissionDetails = (missionId: string) => {
    const newExpanded = new Set(expandedDetails);
    if (newExpanded.has(missionId)) {
      newExpanded.delete(missionId);
    } else {
      newExpanded.add(missionId);
    }
    setExpandedDetails(newExpanded);
  };
  
  // Get status icon
  const getStatusIcon = (eligibility: UnlockEligibility) => {
    if (eligibility.isUnlocked) {
      return <Unlock className="w-5 h-5 text-green-400" />;
    }
    
    const primaryBlocker = eligibility.blockers[0];
    if (!primaryBlocker) return <Lock className="w-5 h-5 text-red-400" />;
    
    switch (primaryBlocker.type) {
      case 'replay':
        return <Brain className="w-5 h-5 text-blue-400" />;
      case 'tier':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'trust':
        return <TrendingUp className="w-5 h-5 text-yellow-400" />;
      case 'feedback':
        return <MessageSquare className="w-5 h-5 text-orange-400" />;
      case 'vote':
        return <Vote className="w-5 h-5 text-indigo-400" />;
      default:
        return <Lock className="w-5 h-5 text-red-400" />;
    }
  };
  
  // Get status text
  const getStatusText = (eligibility: UnlockEligibility) => {
    if (eligibility.isUnlocked) return 'Unlocked';
    
    const primaryBlocker = eligibility.blockers[0];
    if (!primaryBlocker) return 'Locked';
    
    switch (primaryBlocker.type) {
      case 'replay':
        return 'Replay Required';
      case 'tier':
        return 'Tier Required';
      case 'trust':
        return 'Trust Required';
      case 'feedback':
        return 'Feedback Required';
      case 'vote':
        return 'Vote Required';
      default:
        return 'Locked';
    }
  };
  
  // Get status color class
  const getStatusColorClass = (eligibility: UnlockEligibility) => {
    if (eligibility.isUnlocked) return 'text-green-400 bg-green-900/30 border-green-600';
    
    const primaryBlocker = eligibility.blockers[0];
    if (!primaryBlocker) return 'text-red-400 bg-red-900/30 border-red-600';
    
    switch (primaryBlocker.type) {
      case 'replay':
        return 'text-blue-400 bg-blue-900/30 border-blue-600';
      case 'tier':
        return 'text-purple-400 bg-purple-900/30 border-purple-600';
      case 'trust':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
      case 'feedback':
        return 'text-orange-400 bg-orange-900/30 border-orange-600';
      case 'vote':
        return 'text-indigo-400 bg-indigo-900/30 border-indigo-600';
      default:
        return 'text-red-400 bg-red-900/30 border-red-600';
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wallet':
        return <TrendingUp className="w-4 h-4" />;
      case 'identity':
        return <User className="w-4 h-4" />;
      case 'consensus':
        return <Vote className="w-4 h-4" />;
      case 'feedback':
        return <MessageSquare className="w-4 h-4" />;
      case 'governance':
        return <Shield className="w-4 h-4" />;
      case 'education':
        return <Trophy className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };
  
  // Filter missions based on status
  const filteredMissions = missions.filter(({ eligibility }) => {
    if (filterStatus === 'unlocked') return eligibility.isUnlocked;
    if (filterStatus === 'locked') return !eligibility.isUnlocked;
    return true;
  });
  
  // Initial load
  useEffect(() => {
    loadMissions();
  }, [userId, userTier, trustScore]);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 animate-spin border-2 border-purple-400 border-t-transparent rounded-full" />
            <span className="text-slate-300">Loading missions...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ARIA Live Region */}
      <div 
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Header */}
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-semibold text-slate-200">
              Civic Mission Access
            </h1>
          </div>
          
          <button
            onClick={loadMissions}
            className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 border border-purple-600 text-purple-300 rounded-lg hover:bg-purple-800/30 transition-colors text-sm"
            aria-label="Refresh missions"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* User Context Display */}
        <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Tier: {userTier}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Trust: {trustScore}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">User: {userId}</span>
              </div>
            </div>
            
            {showAdvancedInfo && (
              <button
                onClick={() => setExpandedDetails(prev => new Set())}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                {expandedDetails.size > 0 ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{expandedDetails.size > 0 ? 'Hide' : 'Show'} Details</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Filter:</span>
            
            <div className="flex items-center gap-2">
              {(['all', 'unlocked', 'locked'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filterStatus === status
                      ? 'bg-purple-900/30 border border-purple-600 text-purple-300'
                      : 'bg-slate-700/30 border border-slate-600 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-slate-400">
            {filteredMissions.length} missions
          </div>
        </div>
      </div>
      
      {/* Mission List */}
      <div className="space-y-4">
        {filteredMissions.length === 0 ? (
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 text-center">
            <Brain className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No Missions Found</h3>
            <p className="text-slate-500">
              {filterStatus === 'all' 
                ? 'No missions available for this user'
                : `No ${filterStatus} missions found`
              }
            </p>
          </div>
        ) : (
          filteredMissions.map(({ mission, eligibility }) => {
            const isExpanded = expandedDetails.has(mission.missionId);
            
            return (
              <div 
                key={mission.missionId}
                className="bg-slate-800 border border-slate-600 rounded-lg overflow-hidden"
              >
                {/* Mission Header */}
                <div 
                  className={`p-4 cursor-pointer transition-colors ${
                    eligibility.isUnlocked 
                      ? 'hover:bg-green-900/10' 
                      : 'hover:bg-slate-700/30'
                  }`}
                  onClick={() => handleMissionClick(mission, eligibility)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${mission.title} - ${getStatusText(eligibility)}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMissionClick(mission, eligibility);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(eligibility)}
                      
                      <div>
                        <div className="text-slate-200 font-medium">{mission.title}</div>
                        <div className="text-slate-400 text-sm">Category: {mission.category}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColorClass(eligibility)}`}>
                        {getStatusText(eligibility)}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-3">
                    {mission.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(mission.category)}
                        <span className="text-slate-400">{mission.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Min: {mission.requirements.minTier}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Trust: {mission.requirements.minTrustScore}</span>
                      </div>
                    </div>
                    
                    {showAdvancedInfo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMissionDetails(mission.missionId);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                        aria-label={`${isExpanded ? 'Hide' : 'Show'} mission details`}
                      >
                        {isExpanded ? 'Less Info' : 'More Info'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Mission Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-600 p-4 bg-slate-700/30">
                    {!eligibility.isUnlocked && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Requirements Not Met</h4>
                        <div className="space-y-2">
                          {eligibility.blockers.map((blocker, index) => (
                            <div key={index} className="flex items-start gap-3 text-sm">
                              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-slate-300 font-medium">{blocker.message}</div>
                                <div className="text-slate-400">{blocker.actionRequired}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {eligibility.nextSteps.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Next Steps</h4>
                        <ul className="space-y-1">
                          {eligibility.nextSteps.map((step, index) => (
                            <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="text-slate-300 font-medium mb-2">Requirements</h5>
                        <div className="space-y-1">
                          <div className={`flex items-center justify-between ${eligibility.requirements.tierSufficient ? 'text-green-400' : 'text-red-400'}`}>
                            <span>Tier: {mission.requirements.minTier}</span>
                            <span>{eligibility.requirements.tierSufficient ? '✓' : '✗'}</span>
                          </div>
                          <div className={`flex items-center justify-between ${eligibility.requirements.trustSufficient ? 'text-green-400' : 'text-red-400'}`}>
                            <span>Trust: {mission.requirements.minTrustScore}</span>
                            <span>{eligibility.requirements.trustSufficient ? '✓' : '✗'}</span>
                          </div>
                          {mission.requirements.requireReplay && (
                            <div className={`flex items-center justify-between ${eligibility.requirements.replayValidated ? 'text-green-400' : 'text-red-400'}`}>
                              <span>Prerequisite</span>
                              <span>{eligibility.requirements.replayValidated ? '✓' : '✗'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-slate-300 font-medium mb-2">Current Status</h5>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Your Tier:</span>
                            <span>{eligibility.requirements.tierCurrent}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Your Trust:</span>
                            <span>{eligibility.requirements.trustCurrent}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Route:</span>
                            <span className="font-mono text-xs">{mission.route}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MissionAccessPanel;