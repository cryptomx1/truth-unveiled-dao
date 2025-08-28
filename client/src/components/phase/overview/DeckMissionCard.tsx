// Phase X-C Step 2: DeckMissionCard.tsx
// Commander Mark authorization via JASMY Relay System
// Gamified civic interaction, mission-based Truth Point incentives, streak tracking

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Trophy, 
  Zap, 
  Shield, 
  Users, 
  FileText, 
  Calendar, 
  Star, 
  Loader2,
  RefreshCw,
  Flag,
  Key,
  Brain,
  Heart,
  MapPin,
  Eye
} from 'lucide-react';

export interface Mission {
  id: string;
  title: string;
  description: string;
  truthPointReward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'civic' | 'governance' | 'education' | 'community' | 'verification';
  deadline: string;
  estimatedTime: string;
  status: 'available' | 'in_progress' | 'completed' | 'failed' | 'expired';
  progress: number;
  requirements: string[];
  zkpHash?: string;
  completedAt?: string;
  failureReason?: string;
}

export interface MissionStats {
  totalMissions: number;
  completedMissions: number;
  totalTruthPoints: number;
  currentStreak: number;
  longestStreak: number;
  failureRate: number;
}

export interface DeckMissionCardProps {
  userDid?: string;
  onMissionSelect?: (mission: Mission) => void;
  onMissionComplete?: (missionId: string) => void;
  className?: string;
}

export default function DeckMissionCard({
  userDid = 'did:civic:mission_user_001',
  onMissionSelect,
  onMissionComplete,
  className = ''
}: DeckMissionCardProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [stats, setStats] = useState<MissionStats>({
    totalMissions: 0,
    completedMissions: 0,
    totalTruthPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    failureRate: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submissionActive, setSubmissionActive] = useState<boolean>(false);
  const [pathBTriggered, setPathBTriggered] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const [renderTime, setRenderTime] = useState<number>(0);
  
  const mountTimestamp = useRef<number>(Date.now());
  const submissionCount = useRef<number>(0);
  const failureCount = useRef<number>(0);

  // Generate mock mission data
  const generateMissions = useCallback((): Mission[] => {
    const missionTemplates = [
      {
        title: 'Civic Proposal Review',
        description: 'Review and provide feedback on 3 active civic proposals in your district',
        truthPointReward: 50,
        difficulty: 'medium' as const,
        category: 'governance' as const,
        estimatedTime: '45 minutes',
        requirements: ['Active civic identity', 'District verification', 'Proposal access']
      },
      {
        title: 'Community Forum Participation',
        description: 'Engage in community discussions and help answer citizen questions',
        truthPointReward: 25,
        difficulty: 'easy' as const,
        category: 'community' as const,
        estimatedTime: '20 minutes',
        requirements: ['Community forum access', 'Verified identity']
      },
      {
        title: 'Policy Impact Assessment',
        description: 'Analyze the potential impact of proposed policy changes using civic data',
        truthPointReward: 100,
        difficulty: 'hard' as const,
        category: 'governance' as const,
        estimatedTime: '90 minutes',
        requirements: ['Policy analysis certification', 'Data access permission', 'Expert verification']
      },
      {
        title: 'Civic Education Content',
        description: 'Create or validate educational content about civic processes',
        truthPointReward: 75,
        difficulty: 'medium' as const,
        category: 'education' as const,
        estimatedTime: '60 minutes',
        requirements: ['Education module access', 'Content creation tools', 'Peer review']
      },
      {
        title: 'Identity Verification Assist',
        description: 'Help verify new citizen identities through the ZKP validation process',
        truthPointReward: 35,
        difficulty: 'easy' as const,
        category: 'verification' as const,
        estimatedTime: '30 minutes',
        requirements: ['Verification authority', 'ZKP tools access']
      }
    ];

    return missionTemplates.map((template, index) => ({
      id: `mission_${index + 1}_${Math.random().toString(36).substring(7)}`,
      ...template,
      deadline: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: Math.random() > 0.7 ? 'available' : 
              Math.random() > 0.5 ? 'in_progress' : 
              Math.random() > 0.3 ? 'completed' : 'failed',
      progress: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0,
      zkpHash: Math.random() > 0.6 ? `zkp_mission_${Math.random().toString(36).substring(7)}` : undefined,
      completedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined
    }));
  }, []);

  // Calculate mission statistics
  const calculateStats = useCallback((missionList: Mission[]): MissionStats => {
    const completed = missionList.filter(m => m.status === 'completed');
    const failed = missionList.filter(m => m.status === 'failed');
    const totalPoints = completed.reduce((sum, m) => sum + m.truthPointReward, 0);
    
    // Mock streak calculation
    const currentStreak = Math.floor(Math.random() * 12) + 1;
    const longestStreak = Math.max(currentStreak, Math.floor(Math.random() * 21) + 1);
    const failureRate = missionList.length > 0 ? (failed.length / missionList.length) * 100 : 0;
    
    return {
      totalMissions: missionList.length,
      completedMissions: completed.length,
      totalTruthPoints: totalPoints,
      currentStreak,
      longestStreak,
      failureRate
    };
  }, []);

  // Announce messages for accessibility
  const announce = useCallback((message: string) => {
    setAriaAnnouncement(message);
    console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
  }, []);

  // Handle mission selection
  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);
    announce(`Mission selected: ${mission.title}`);
    console.log(`🎯 DeckMissionCard: Mission selected - ${mission.title} (${mission.difficulty})`);
    onMissionSelect?.(mission);
  };

  // Handle mission submission with ZKP attestation
  const handleMissionSubmit = async (mission: Mission) => {
    if (!mission || submissionActive) return;
    
    setSubmissionActive(true);
    submissionCount.current++;
    
    console.log(`🚀 DeckMissionCard: Submitting mission "${mission.title}" for DID: ${userDid}`);
    
    try {
      // Simulate ZKP attestation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate 15% failure rate for Path B trigger
      const submissionSuccess = Math.random() > 0.15;
      
      if (!submissionSuccess) {
        failureCount.current++;
        const failureRate = (failureCount.current / submissionCount.current) * 100;
        
        console.log(`⚠️ DeckMissionCard: Mission submission failed - ${mission.title} (${failureRate.toFixed(1)}% failure rate)`);
        
        if (failureRate > 10) {
          setPathBTriggered(true);
          setFallbackMode(true);
          console.log('🛑 DeckMissionCard: Path B activated - >10% submission failures detected');
          console.log('📝 DeckMissionCard: Logging failure to vault.history.json (simulated)');
          announce('Mission submission failed, activating fallback mode');
        }
        
        // Update mission status to failed
        const updatedMissions = missions.map(m => 
          m.id === mission.id 
            ? { ...m, status: 'failed' as const, failureReason: 'ZKP attestation failed' }
            : m
        );
        setMissions(updatedMissions);
        setStats(calculateStats(updatedMissions));
        
        announce(`Mission failed: ${mission.title}`);
      } else {
        // Generate ZKP hash for successful completion
        const zkpHash = `zkp_mission_${mission.id}_${Math.random().toString(36).substring(7)}`;
        
        console.log(`✅ DeckMissionCard: Mission completed successfully - ${mission.title}`);
        console.log(`🔐 DeckMissionCard: ZKP hash generated: ${zkpHash}`);
        
        // Update mission status to completed
        const updatedMissions = missions.map(m => 
          m.id === mission.id 
            ? { 
                ...m, 
                status: 'completed' as const, 
                progress: 100,
                zkpHash,
                completedAt: new Date().toISOString()
              }
            : m
        );
        setMissions(updatedMissions);
        setStats(calculateStats(updatedMissions));
        
        announce(`Mission completed: ${mission.title}. Earned ${mission.truthPointReward} Truth Points`);
        onMissionComplete?.(mission.id);
      }
    } catch (error) {
      console.error('❌ DeckMissionCard: Mission submission error:', error);
      announce('Mission submission encountered an error');
    } finally {
      setSubmissionActive(false);
    }
  };

  // Reset Path B state
  const resetPathB = () => {
    setPathBTriggered(false);
    setFallbackMode(false);
    failureCount.current = 0;
    submissionCount.current = 0;
    announce('Fallback mode reset');
    console.log('🔄 DeckMissionCard: Path B reset - failure tracking cleared');
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'civic': return <MapPin className="w-4 h-4" />;
      case 'governance': return <Brain className="w-4 h-4" />;
      case 'education': return <FileText className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      case 'verification': return <Shield className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Target className="w-4 h-4 text-blue-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <X className="w-4 h-4 text-red-400" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default: return <Target className="w-4 h-4 text-slate-400" />;
    }
  };

  // Load missions data
  useEffect(() => {
    const loadMissions = async () => {
      setLoading(true);
      
      try {
        // Simulate API fetch delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const missionData = generateMissions();
        setMissions(missionData);
        setStats(calculateStats(missionData));
        
        console.log(`🎯 DeckMissionCard: Loaded ${missionData.length} missions for ${userDid}`);
        announce(`${missionData.length} missions loaded`);
        
      } catch (error) {
        console.error('❌ DeckMissionCard: Error loading missions:', error);
        setFallbackMode(true);
        announce('Error loading missions, using fallback mode');
      } finally {
        setLoading(false);
        const totalRenderTime = Date.now() - mountTimestamp.current;
        setRenderTime(totalRenderTime);
        
        if (totalRenderTime > 150) {
          console.warn(`⚠️ DeckMissionCard render time: ${totalRenderTime}ms (exceeds 150ms target)`);
        }
      }
    };

    loadMissions();
  }, [generateMissions, calculateStats, userDid]);

  // Component initialization
  useEffect(() => {
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    console.log('🎯 DeckMissionCard: Component initialized and ready');
    console.log(`📦 DeckMissionCard: QA Envelope UUID: UUID-DMC-20250718-003`);
    announce('Mission card interface ready');
  }, [announce]);

  if (loading) {
    return (
      <div className={`w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <div className="text-white mb-2">Loading Missions</div>
          <div className="text-sm text-slate-400">
            Fetching available civic missions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Civic Missions</h2>
          </div>
          <div className="text-xs text-slate-400">
            Phase X-C • Step 2
          </div>
        </div>
        
        {pathBTriggered && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-medium text-red-400">Path B Activated</h3>
            </div>
            <div className="text-xs text-red-300 mb-3">
              High failure rate detected (&gt;10%). Fallback mode active.
            </div>
            <button
              onClick={resetPathB}
              className="py-1 px-3 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors duration-200"
              style={{ minHeight: '32px' }}
            >
              Reset Fallback
            </button>
          </div>
        )}
      </div>

      {/* Mission Stats */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Mission Statistics</h3>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-slate-400">Total Missions:</div>
            <div className="text-white font-medium">{stats.totalMissions}</div>
          </div>
          
          <div>
            <div className="text-slate-400">Completed:</div>
            <div className="text-green-400 font-medium">{stats.completedMissions}</div>
          </div>
          
          <div>
            <div className="text-slate-400">Truth Points:</div>
            <div className="text-blue-400 font-medium">{stats.totalTruthPoints}</div>
          </div>
          
          <div>
            <div className="text-slate-400">Current Streak:</div>
            <div className="text-yellow-400 font-medium">{stats.currentStreak}</div>
          </div>
          
          <div>
            <div className="text-slate-400">Longest Streak:</div>
            <div className="text-orange-400 font-medium">{stats.longestStreak}</div>
          </div>
          
          <div>
            <div className="text-slate-400">Failure Rate:</div>
            <div className={stats.failureRate > 10 ? 'text-red-400' : 'text-green-400'}>
              {stats.failureRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Mission List */}
      <div className="mb-6 bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600">
          <h3 className="text-sm font-medium text-slate-300">
            Available Missions ({missions.filter(m => m.status === 'available').length})
          </h3>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {missions.length === 0 ? (
            <div className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-3 text-slate-500" />
              <div className="text-slate-400 mb-2">No missions available</div>
              <div className="text-xs text-slate-500">
                Check back later for new civic opportunities
              </div>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-slate-600">
              {missions.map((mission) => (
                <li key={mission.id} role="listitem" className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(mission.category)}
                      <span className="text-sm font-medium text-slate-200">
                        {mission.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(mission.status)}
                      <span className={`text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-3">
                    {mission.description}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-400">{mission.truthPointReward} TP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-300">{mission.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400">
                      Due: {mission.deadline}
                    </div>
                  </div>
                  
                  {mission.status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{mission.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {mission.zkpHash && (
                    <div className="mb-3 text-xs">
                      <span className="text-slate-400">ZKP Hash: </span>
                      <span className="text-green-400 font-mono">
                        {mission.zkpHash.substring(0, 16)}...
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {mission.status === 'available' && (
                      <button
                        onClick={() => handleMissionSelect(mission)}
                        className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs transition-colors duration-200"
                        style={{ minHeight: '40px' }}
                        aria-label={`Select mission: ${mission.title}`}
                      >
                        Select Mission
                      </button>
                    )}
                    
                    {mission.status === 'in_progress' && (
                      <button
                        onClick={() => handleMissionSubmit(mission)}
                        disabled={submissionActive}
                        className="flex-1 py-2 px-3 bg-green-700 hover:bg-green-600 disabled:bg-green-800 text-white rounded-md text-xs transition-colors duration-200 flex items-center justify-center gap-2"
                        style={{ minHeight: '40px' }}
                        aria-label={`Submit mission: ${mission.title}`}
                      >
                        {submissionActive ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Submit</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    {mission.status === 'completed' && (
                      <div className="flex-1 py-2 px-3 bg-green-900 text-green-300 rounded-md text-xs flex items-center justify-center gap-2">
                        <Trophy className="w-3 h-3" />
                        <span>Completed</span>
                      </div>
                    )}
                    
                    {mission.status === 'failed' && (
                      <div className="flex-1 py-2 px-3 bg-red-900 text-red-300 rounded-md text-xs flex items-center justify-center gap-2">
                        <X className="w-3 h-3" />
                        <span>Failed</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Selected Mission Details */}
      {selectedMission && (
        <div className="mb-6 p-4 bg-slate-900 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Selected Mission</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Title:</span>
              <span className="text-white">{selectedMission.title}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-white">{selectedMission.category}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Difficulty:</span>
              <span className={getDifficultyColor(selectedMission.difficulty)}>
                {selectedMission.difficulty}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Reward:</span>
              <span className="text-blue-400">{selectedMission.truthPointReward} TP</span>
            </div>
            
            <div className="mt-3">
              <div className="text-slate-400 mb-1">Requirements:</div>
              <ul className="text-slate-300 space-y-1">
                {selectedMission.requirements.map((req, index) => (
                  <li key={index} className="text-xs">
                    • {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Mission System Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Render Time:</span>
            <span className={renderTime > 150 ? 'text-red-400' : 'text-green-400'}>
              {renderTime}ms
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Submissions:</span>
            <span className="text-white">{submissionCount.current}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Failures:</span>
            <span className={failureCount.current > 0 ? 'text-red-400' : 'text-green-400'}>
              {failureCount.current}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Path B Status:</span>
            <span className={pathBTriggered ? 'text-red-400' : 'text-green-400'}>
              {pathBTriggered ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">User DID:</span>
            <span className="text-white font-mono text-[10px]">
              {userDid.substring(0, 20)}...
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Phase:</span>
            <span className="text-white">X-C Step 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}