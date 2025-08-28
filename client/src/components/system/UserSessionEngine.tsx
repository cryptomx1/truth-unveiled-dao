import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Session State Types
interface UserSessionState {
  mission: 'representation' | 'voice' | 'data';
  lang: 'en' | 'es' | 'fr';
  tier: 'citizen' | 'moderator' | 'governor';
  streakDays: number;
  lastView: 'onboarding' | 'constellation' | 'deck' | 'memory';
}

interface UserSessionContextType {
  session: UserSessionState;
  sessionSource: 'DID' | 'local' | 'default';
  setSession: (updates: Partial<UserSessionState>) => void;
  updateMission: (mission: UserSessionState['mission']) => void;
  updateLang: (lang: UserSessionState['lang']) => void;
  updateTier: (tier: UserSessionState['tier']) => void;
  updateStreak: (streakDays: number) => void;
  updateLastView: (lastView: UserSessionState['lastView']) => void;
  resetSession: () => void;
  saveLastMemoryAction: (action: any) => void;
  getLastMemoryAction: () => any | null;
  autoReplayFromMemory: () => Promise<void>;
}

// Default session state
const DEFAULT_SESSION: UserSessionState = {
  mission: 'voice',
  lang: 'es',
  tier: 'citizen',
  streakDays: 0,
  lastView: 'onboarding'
};

// Storage keys for localStorage and sessionStorage
const SESSION_STORAGE_KEY = 'truthunveiled_user_session';
const LAST_MEMORY_ACTION_KEY = 'lastMemoryAction';

// Context creation
const UserSessionContext = createContext<UserSessionContextType | null>(null);

// Custom hook to use session context
export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within UserSessionEngine');
  }
  return context;
};

// DID Session Storage Keys
const DID_SESSION_KEY = 'truthunveiled_did_session';
const SESSION_SOURCE_KEY = 'truthunveiled_session_source';

// DID Session Management Functions
const saveSessionToDID = async (session: UserSessionState): Promise<boolean> => {
  try {
    // Mock DID storage implementation
    // In production: would use actual DID protocol integration
    const didSessionData = {
      ...session,
      timestamp: Date.now(),
      version: '1.0.0',
      didSignature: `did:civic:${Math.random().toString(36).substring(2)}`
    };
    
    localStorage.setItem(DID_SESSION_KEY, JSON.stringify(didSessionData));
    localStorage.setItem(SESSION_SOURCE_KEY, 'DID');
    
    console.log('🔐 Session Saved to DID');
    return true;
  } catch (error) {
    console.warn('🔐 DID session save failed:', error);
    return false;
  }
};

const restoreSessionFromDID = async (): Promise<UserSessionState | null> => {
  try {
    const didSession = localStorage.getItem(DID_SESSION_KEY);
    if (didSession) {
      const parsed = JSON.parse(didSession);
      // Validate DID session structure
      if (parsed && typeof parsed === 'object' && 
          parsed.mission && parsed.lang && parsed.tier !== undefined && 
          parsed.streakDays !== undefined && parsed.lastView &&
          parsed.didSignature) {
        
        localStorage.setItem(SESSION_SOURCE_KEY, 'DID');
        console.log('🧠 DID Session Restored');
        
        // Return clean session state (without DID metadata)
        return {
          mission: parsed.mission,
          lang: parsed.lang,
          tier: parsed.tier,
          streakDays: parsed.streakDays,
          lastView: parsed.lastView
        };
      }
    }
  } catch (error) {
    console.warn('🧠 DID session restore failed:', error);
  }
  return null;
};

// Fallback localStorage functions (Path B)
const saveSessionToStorage = (session: UserSessionState) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_SOURCE_KEY, 'local');
  } catch (error) {
    console.warn('🧠 Session storage failed:', error);
  }
};

const loadSessionFromStorage = (): UserSessionState | null => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate stored data structure
      if (parsed && typeof parsed === 'object' && 
          parsed.mission && parsed.lang && parsed.tier !== undefined && 
          parsed.streakDays !== undefined && parsed.lastView) {
        localStorage.setItem(SESSION_SOURCE_KEY, 'local');
        return parsed as UserSessionState;
      }
    }
  } catch (error) {
    console.warn('🧠 Session restore failed:', error);
  }
  return null;
};

// Main UserSessionEngine Component
interface UserSessionEngineProps {
  children: React.ReactNode;
  initialSession?: Partial<UserSessionState>;
}

export const UserSessionEngine: React.FC<UserSessionEngineProps> = ({
  children,
  initialSession = {}
}) => {
  const engineInitialized = useRef(false);
  const mountTimestamp = useRef(Date.now());
  
  // Initialize session state and source tracking
  const [session, setSessionState] = useState<UserSessionState>(() => {
    return { ...DEFAULT_SESSION, ...initialSession };
  });
  
  const [sessionSource, setSessionSource] = useState<'DID' | 'local' | 'default'>('default');

  // DID Session Initialization with fallback logic
  useEffect(() => {
    if (!engineInitialized.current) {
      engineInitialized.current = true;
      
      const initializeSession = async () => {
        try {
          // Step 1: Attempt DID session restoration
          const didSession = await restoreSessionFromDID();
          if (didSession) {
            setSessionState({ ...didSession, ...initialSession });
            setSessionSource('DID');
            return;
          }
          
          // Step 2: Fallback to localStorage (Path B)
          const localSession = loadSessionFromStorage();
          if (localSession) {
            setSessionState({ ...localSession, ...initialSession });
            setSessionSource('local');
            return;
          }
          
          // Step 3: Use defaults if no stored session found
          const defaultSession = { ...DEFAULT_SESSION, ...initialSession };
          setSessionState(defaultSession);
          setSessionSource('default');
          console.log('🧠 Session initialized with defaults');
          
        } catch (error) {
          console.warn('🧠 Session initialization failed:', error);
          // Emergency fallback to defaults
          setSessionState({ ...DEFAULT_SESSION, ...initialSession });
          setSessionSource('default');
        }
      };
      
      initializeSession();
    }
  }, [initialSession]);

  // Telemetry and session logging
  const logSessionEvent = useCallback((event: string, details: string) => {
    console.log(`🧠 ${event} — ${details}`);
  }, []);

  // Enhanced session persistence with DID priority
  const persistSession = useCallback(async (newSession: UserSessionState) => {
    try {
      // Try DID storage first
      const didSuccess = await saveSessionToDID(newSession);
      if (didSuccess) {
        setSessionSource('DID');
        return;
      }
      
      // Fallback to localStorage (Path B)
      saveSessionToStorage(newSession);
      setSessionSource('local');
    } catch (error) {
      console.warn('🧠 Session persistence failed:', error);
      // Emergency fallback to localStorage
      saveSessionToStorage(newSession);
      setSessionSource('local');
    }
  }, []);

  // Update session with persistence
  const setSession = useCallback((updates: Partial<UserSessionState>) => {
    setSessionState(prevSession => {
      const newSession = { ...prevSession, ...updates };
      
      // Persist session with DID priority
      persistSession(newSession);
      
      // Log the update
      const updateDetails = Object.entries(updates)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      logSessionEvent('Session Updated', `${updateDetails} | Source: ${sessionSource}`);
      
      return newSession;
    });
  }, [persistSession, logSessionEvent, sessionSource]);

  // Convenience methods for specific updates
  const updateMission = useCallback((mission: UserSessionState['mission']) => {
    setSession({ mission });
  }, [setSession]);

  const updateLang = useCallback((lang: UserSessionState['lang']) => {
    setSession({ lang });
  }, [setSession]);

  const updateTier = useCallback((tier: UserSessionState['tier']) => {
    setSession({ tier });
  }, [setSession]);

  const updateStreak = useCallback((streakDays: number) => {
    setSession({ streakDays });
  }, [setSession]);

  const updateLastView = useCallback((lastView: UserSessionState['lastView']) => {
    setSession({ lastView });
  }, [setSession]);

  const resetSession = useCallback(() => {
    const resetSession = { ...DEFAULT_SESSION };
    setSessionState(resetSession);
    persistSession(resetSession);
    logSessionEvent('Session Reset', 'All values restored to defaults');
  }, [persistSession, logSessionEvent]);

  // Memory action persistence functions
  const saveLastMemoryAction = useCallback((action: any) => {
    try {
      sessionStorage.setItem(LAST_MEMORY_ACTION_KEY, JSON.stringify({
        ...action,
        timestamp: Date.now()
      }));
      console.log('✅ Persisted memory replay state');
    } catch (error) {
      console.warn('⚠️ Failed to persist memory action:', error);
    }
  }, []);

  const getLastMemoryAction = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(LAST_MEMORY_ACTION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve last memory action:', error);
      return null;
    }
  }, []);

  const autoReplayFromMemory = useCallback(async () => {
    const lastAction = getLastMemoryAction();
    if (lastAction && session) {
      console.log('🔄 Auto-replaying last memory action on session load');
      
      // Simulate replay execution (in real implementation, this would call the actual replay function)
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        switch (lastAction.type) {
          case 'mission':
            updateMission(lastAction.data.mission);
            console.log('🔁 Reapplied mission from memory:', lastAction.data.mission);
            break;
          case 'tier_upgrade':
            updateTier(lastAction.data.tier);
            console.log('🔁 Reapplied tier from memory:', lastAction.data.tier);
            break;
          case 'deck_visit':
            updateLastView('deck');
            console.log('🔁 Reapplied deck navigation from memory');
            break;
          default:
            console.log('⚠️ Unsupported memory action type:', lastAction.type);
        }
        
        console.log('✅ Auto-replay completed successfully');
      } catch (error) {
        console.warn('❌ Auto-replay failed:', error);
      }
    }
  }, [getLastMemoryAction, session, updateMission, updateTier, updateLastView]);

  // Auto-replay on session initialization
  useEffect(() => {
    if (engineInitialized.current && session && sessionSource !== 'default') {
      // Only auto-replay if we have a restored session (not default)
      autoReplayFromMemory();
    }
  }, [session, sessionSource, autoReplayFromMemory]);

  // Engine initialization and restoration logging
  useEffect(() => {
    if (engineInitialized.current) return;
    
    const startTime = Date.now();
    
    // Log session restoration details
    const restoredSession = loadSessionFromStorage();
    if (restoredSession) {
      logSessionEvent(
        'Session Restored',
        `Tier: ${session.tier}, Lang: ${session.lang.toUpperCase()}, Mission: ${session.mission}, Streak: ${session.streakDays}, View: ${session.lastView}`
      );
    } else {
      logSessionEvent(
        'Session Initialized',
        `New session — Tier: ${session.tier}, Lang: ${session.lang.toUpperCase()}, Mission: ${session.mission}`
      );
    }
    
    engineInitialized.current = true;
    
    const initTime = Date.now() - startTime;
    if (initTime > 50) {
      console.warn(`⚠️ UserSessionEngine init time: ${initTime}ms (exceeds 50ms target)`);
    }
    
    console.log('🧠 User Session Engine Online');
    console.log('📦 Session Persistence Layer Active');
    
  }, [session, logSessionEvent]);

  // Session source tracking - removed auto-save to prevent conflict with DID persistence

  // Context value
  const contextValue: UserSessionContextType = {
    session,
    sessionSource,
    setSession,
    updateMission,
    updateLang,
    updateTier,
    updateStreak,
    updateLastView,
    resetSession,
    saveLastMemoryAction,
    getLastMemoryAction,
    autoReplayFromMemory
  };

  return (
    <UserSessionContext.Provider value={contextValue}>
      {children}
      
      {/* Development Info Panel - DISABLED to prevent site blocking */}
      {false && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-slate-800 text-white p-3 rounded-lg text-xs border border-slate-700 max-w-xs">
          <div className="font-bold mb-2">🧠 User Session Engine</div>
          <div className="space-y-1">
            <div>Mission: {session.mission}</div>
            <div>Lang: {session.lang.toUpperCase()}</div>
            <div>Tier: {session.tier}</div>
            <div>Streak: {session.streakDays} days</div>
            <div>View: {session.lastView}</div>
            <div className={`mt-2 ${sessionSource === 'DID' ? 'text-blue-400' : sessionSource === 'local' ? 'text-green-400' : 'text-yellow-400'}`}>
              Source: {sessionSource.toUpperCase()}
            </div>
            <div className="text-slate-400">
              Uptime: {Math.floor((Date.now() - mountTimestamp.current) / 1000)}s
            </div>
          </div>
        </div>
      )}
    </UserSessionContext.Provider>
  );
};

export default UserSessionEngine;