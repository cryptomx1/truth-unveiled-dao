import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, CheckCircle, Circle, Zap, Shield, AlertTriangle } from 'lucide-react';

interface StreakData {
  id: string;
  date: string;
  action: 'vote' | 'proposal' | 'feedback' | 'validation' | 'referral';
  completed: boolean;
  zkpHash: string;
  trustPoints: number;
}

interface FeedbackStreakSyncCardProps {
  className?: string;
  userDid?: string;
  onStreakUpdate?: (streak: number) => void;
}

const FeedbackStreakSyncCard: React.FC<FeedbackStreakSyncCardProps> = ({
  className = '',
  userDid = 'did:civic:feedback_sync_001',
  onStreakUpdate
}) => {
  const [currentStreak, setCurrentStreak] = useState(7);
  const [longestStreak, setLongestStreak] = useState(14);
  const [streakData, setStreakData] = useState<StreakData[]>([]);
  const [zkpValidated, setZkpValidated] = useState(false);
  const [pathBActive, setPathBActive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'failed'>('synced');
  const [renderTime, setRenderTime] = useState(0);
  
  const mountTimestamp = useRef(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // Generate mock streak data
  const generateStreakData = useCallback((): StreakData[] => {
    const actions: StreakData['action'][] = ['vote', 'proposal', 'feedback', 'validation', 'referral'];
    const data: StreakData[] = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        id: `streak_${i}`,
        date: date.toISOString().split('T')[0],
        action: actions[Math.floor(Math.random() * actions.length)],
        completed: i < 7, // Current 7-day streak
        zkpHash: `zkp_streak_${Math.random().toString(36).substring(7)}`,
        trustPoints: Math.floor(Math.random() * 10) + 5
      });
    }
    
    return data.reverse();
  }, []);

  // ZKP validation simulation
  const validateZKPStreak = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate validation failure for Path B testing (15% chance)
    const validationSuccess = Math.random() > 0.15;
    
    if (validationSuccess) {
      console.log('🔐 FeedbackStreakSyncCard: ZKP validation successful');
      return true;
    } else {
      console.log('🛑 FeedbackStreakSyncCard: ZKP validation failed - activating Path B');
      return false;
    }
  }, []);

  // Sync daily civic actions
  const syncDailyCivicActions = useCallback(async () => {
    setSyncStatus('syncing');
    
    try {
      const isValid = await validateZKPStreak();
      setZkpValidated(isValid);
      
      if (!isValid) {
        setPathBActive(true);
        console.log('💾 FeedbackStreakSyncCard: Using cached streak data (Path B)');
      }
      
      const data = generateStreakData();
      setStreakData(data);
      
      // Calculate current streak
      const completedStreak = data.filter(d => d.completed).length;
      setCurrentStreak(completedStreak);
      
      setSyncStatus('synced');
      onStreakUpdate?.(completedStreak);
      
    } catch (error) {
      console.error('❌ FeedbackStreakSyncCard: Sync failed:', error);
      setSyncStatus('failed');
      setPathBActive(true);
    }
  }, [validateZKPStreak, generateStreakData, onStreakUpdate]);

  // Get action icon
  const getActionIcon = (action: StreakData['action']) => {
    switch (action) {
      case 'vote': return <CheckCircle className="w-3 h-3" />;
      case 'proposal': return <Calendar className="w-3 h-3" />;
      case 'feedback': return <Zap className="w-3 h-3" />;
      case 'validation': return <Shield className="w-3 h-3" />;
      case 'referral': return <Circle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  // Component initialization with nuclear TTS override
  useEffect(() => {
    const startTime = Date.now();
    
    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Feedback streak sync initialized"');
    }

    // Nuclear override snippet - global enforcer
    const nuke = () => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"]');
      liveRegions.forEach(node => node.setAttribute('aria-live', 'off'));
      console.log('🔇 NUCLEAR TTS OVERRIDE: All aria-live regions disabled');
    };
    nuke();

    syncDailyCivicActions();
    
    const totalRenderTime = Date.now() - startTime;
    setRenderTime(totalRenderTime);
    
    if (totalRenderTime > 30) {
      console.warn(`⚠️ FeedbackStreakSyncCard render time: ${totalRenderTime}ms (exceeds 30ms target)`);
    }
    
    console.log('🧠 TRUST SYNC: Streak & Pulse Active');
    
    // Cleanup on unmount
    return () => nuke();
  }, [syncDailyCivicActions]);

  return (
    <div className={`w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
      {/* ARIA Live Region - TTS Suppressed */}
      <div 
        aria-live="off" 
        aria-atomic="true" 
        className="sr-only"
        aria-hidden="true"
      >
        Feedback streak sync status
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Daily Civic Streak
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase X-D • Step 2 • Feedback Sync</div>
          <div>ZKP Validated • Trust Points Synced</div>
        </div>
      </div>

      {/* Streak Stats */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {currentStreak}
            </div>
            <div className="text-xs text-slate-400">Current Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {longestStreak}
            </div>
            <div className="text-xs text-slate-400">Longest Streak</div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Sync Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-400' : 
              syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' : 
              'bg-red-400'
            }`}></div>
            <span className={
              syncStatus === 'synced' ? 'text-green-400' : 
              syncStatus === 'syncing' ? 'text-yellow-400' : 
              'text-red-400'
            }>
              {syncStatus === 'synced' ? 'Synced' : 
               syncStatus === 'syncing' ? 'Syncing...' : 
               'Failed'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-slate-400">ZKP Validation:</span>
          <span className={zkpValidated ? 'text-green-400' : 'text-red-400'}>
            {zkpValidated ? 'Verified' : 'Failed'}
          </span>
        </div>
        
        {pathBActive && (
          <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            <span>Path B: Using cached data</span>
          </div>
        )}
      </div>

      {/* Streak Visualization */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Daily Actions (Last 14 Days)</h3>
        <div className="grid grid-cols-7 gap-2" aria-hidden="true">
          {streakData.map((day, index) => (
            <div
              key={day.id}
              className={`relative aspect-square rounded-md border-2 flex items-center justify-center ${
                day.completed 
                  ? 'bg-green-900 border-green-500' 
                  : 'bg-slate-700 border-slate-600'
              }`}
              role="presentation"
            >
              <div className={`${
                day.completed ? 'text-green-400' : 'text-slate-400'
              }`}>
                {getActionIcon(day.action)}
              </div>
              
              {/* Pulse animation for recent days */}
              {index >= 7 && day.completed && (
                <div className="absolute inset-0 rounded-md border-2 border-green-400 animate-pulse opacity-50"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Points Summary */}
      <div className="p-3 bg-slate-700 border border-slate-600 rounded-md">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Trust Points:</span>
          <span className="text-blue-400 font-medium">
            {streakData.reduce((sum, day) => sum + (day.completed ? day.trustPoints : 0), 0)} TP
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-slate-400">Render Time:</span>
          <span className="text-slate-300">{renderTime}ms</span>
        </div>
      </div>

      {/* Manual Sync Button */}
      <div className="mt-4">
        <button
          onClick={syncDailyCivicActions}
          disabled={syncStatus === 'syncing'}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center gap-2"
          style={{ minHeight: '48px' }}
          aria-label="Sync daily civic actions"
        >
          {syncStatus === 'syncing' ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Syncing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Sync Actions
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FeedbackStreakSyncCard;