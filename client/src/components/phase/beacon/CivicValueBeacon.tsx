import React, { useState, useEffect, useCallback } from 'react';
import '@/utils/tts-disable';

// ZKP simulation utilities
const ZKProof = {
  generate: (payload: any): string => {
    // Simulate ZKP hash generation
    const hash = `zkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return hash;
  }
};

// LocalSaveLayer fallback simulation
const LocalSaveLayer = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 LocalSaveLayer: Saved ${key}`, data);
    } catch (error) {
      console.error('❌ LocalSaveLayer save failed:', error);
    }
  }
};

interface BeaconPayload {
  did: string;
  signalType: 'civic';
  timestamp: number;
  zkHash: string;
  TP: number;
  streakStatus: string;
}

interface CivicValueBeaconProps {
  className?: string;
}

const CivicValueBeacon: React.FC<CivicValueBeaconProps> = ({ className = '' }) => {
  const [beaconStatus, setBeaconStatus] = useState<'idle' | 'emitting' | 'success' | 'fallback'>('idle');
  const [lastPayload, setLastPayload] = useState<BeaconPayload | null>(null);
  const [emissionCount, setEmissionCount] = useState(0);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [renderStart] = useState(Date.now());

  // Mock vault.history.json data
  const mockVaultHistory = [
    { action: 'vote_cast', timestamp: Date.now() - 300000, TP: 15 },
    { action: 'proposal_submit', timestamp: Date.now() - 600000, TP: 25 },
    { action: 'civic_engage', timestamp: Date.now() - 900000, TP: 10 },
    { action: 'trust_verify', timestamp: Date.now() - 1200000, TP: 20 },
    { action: 'consensus_join', timestamp: Date.now() - 1500000, TP: 30 },
    { action: 'amendment_review', timestamp: Date.now() - 1800000, TP: 12 },
    { action: 'feedback_submit', timestamp: Date.now() - 2100000, TP: 8 },
    { action: 'identity_verify', timestamp: Date.now() - 2400000, TP: 18 },
    { action: 'governance_vote', timestamp: Date.now() - 2700000, TP: 22 },
    { action: 'civic_streak', timestamp: Date.now() - 3000000, TP: 16 }
  ];

  // Generate civic beacon payload
  const generateBeaconPayload = useCallback((): BeaconPayload => {
    const totalTP = mockVaultHistory.reduce((sum, action) => sum + action.TP, 0);
    const activeDID = 'did:civic:beacon_user_001';
    const streakDays = Math.floor((Date.now() - mockVaultHistory[0].timestamp) / (1000 * 60 * 60 * 24)) + 7;
    
    return {
      did: activeDID,
      signalType: 'civic',
      timestamp: Date.now(),
      zkHash: '', // Will be filled by ZKP generation
      TP: totalTP,
      streakStatus: `${streakDays}-day streak`
    };
  }, []);

  // Emit civic beacon with ZKP signature
  const emitBeacon = useCallback(async () => {
    const emitStart = Date.now();
    setBeaconStatus('emitting');
    
    try {
      const payload = generateBeaconPayload();
      
      // Simulate ZKP desync on 2 out of 10 emissions (20% failure rate)
      const shouldFail = (emissionCount + 1) % 5 === 0; // Fail on every 5th emission (20%)
      
      if (shouldFail) {
        // Simulate ZKP signature failure
        throw new Error('ZKP signature validation failed');
      }
      
      // Generate ZKP signature
      payload.zkHash = ZKProof.generate(payload);
      
      // Simulate broadcast delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLastPayload(payload);
      setBeaconStatus('success');
      setFallbackTriggered(false);
      
      const emitTime = Date.now() - emitStart;
      if (emitTime > 200) {
        console.warn(`⚠️ CivicValueBeacon emission time: ${emitTime}ms (exceeds 200ms target)`);
      }
      
      console.log('📡 CivicValueBeacon: Beacon emitted successfully', payload);
      
    } catch (error) {
      // Path B fallback activation
      console.error('❌ CivicValueBeacon: Emission failed, activating Path B fallback:', error);
      
      const fallbackData = {
        beaconFailure: true,
        isMock: true,
        timestamp: Date.now(),
        lastAttempt: generateBeaconPayload(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      LocalSaveLayer.save('beaconFailure', fallbackData);
      setBeaconStatus('fallback');
      setFallbackTriggered(true);
    }
  }, [generateBeaconPayload, emissionCount]);

  // 60-second emission timer
  useEffect(() => {
    const timer = setInterval(() => {
      setEmissionCount(prev => prev + 1);
      emitBeacon();
    }, 60000); // 60 seconds

    // Initial emission after 2 seconds
    const initialTimer = setTimeout(() => {
      setEmissionCount(1);
      emitBeacon();
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, [emitBeacon]);

  // Performance monitoring
  useEffect(() => {
    const renderTime = Date.now() - renderStart;
    if (renderTime > 125) {
      console.warn(`⚠️ CivicValueBeacon render time: ${renderTime}ms (exceeds 125ms target)`);
    }
  }, [renderStart]);

  const getStatusColor = () => {
    switch (beaconStatus) {
      case 'emitting': return 'text-amber-400';
      case 'success': return 'text-green-400';
      case 'fallback': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (beaconStatus) {
      case 'emitting': return '📡';
      case 'success': return '✅';
      case 'fallback': return '🚨';
      default: return '⏸️';
    }
  };

  return (
    <div className={`max-w-md mx-auto bg-slate-800 rounded-lg p-6 border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Civic Value Beacon
        </h2>
        <p className="text-sm text-slate-400">
          ZKP-authenticated civic engagement signal
        </p>
      </div>

      {/* Status Display */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-center space-x-3 p-3 bg-slate-900 rounded-lg"
          aria-live="polite"
          aria-label="Beacon emission status"
        >
          <span className="text-2xl" role="img" aria-label="status icon">
            {getStatusIcon()}
          </span>
          <div className="text-center">
            <div className={`font-medium ${getStatusColor()}`}>
              {beaconStatus === 'idle' && 'Initializing'}
              {beaconStatus === 'emitting' && 'Emitting Signal'}
              {beaconStatus === 'success' && 'Signal Broadcast'}
              {beaconStatus === 'fallback' && 'Fallback Active'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Emissions: {emissionCount}
            </div>
          </div>
        </div>
      </div>

      {/* Fallback Alert */}
      {fallbackTriggered && (
        <div 
          className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center space-x-2">
            <span className="text-red-400 font-medium text-sm">
              ⚠️ Path B Fallback Triggered
            </span>
          </div>
          <p className="text-xs text-red-300 mt-1">
            ZKP signature validation failed. Data cached to LocalSaveLayer.
          </p>
        </div>
      )}

      {/* Last Payload Preview */}
      {lastPayload && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">
            Last Signal Payload
          </h3>
          <div className="bg-slate-900 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">DID:</span>
                <div className="text-slate-200 font-mono break-all">
                  {lastPayload.did}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Type:</span>
                <div className="text-blue-400 font-medium">
                  {lastPayload.signalType}
                </div>
              </div>
              <div>
                <span className="text-slate-400">TP Total:</span>
                <div className="text-green-400 font-medium">
                  {lastPayload.TP}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Streak:</span>
                <div className="text-purple-400 font-medium">
                  {lastPayload.streakStatus}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-2">
              <div className="text-slate-400 text-xs">ZKP Hash:</div>
              <div className="text-slate-200 font-mono text-xs break-all">
                {lastPayload.zkHash}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Emitted: {new Date(lastPayload.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Manual Emit Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setEmissionCount(prev => prev + 1);
            emitBeacon();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          style={{ minHeight: '48px', minWidth: '48px' }}
          aria-label="Manually emit civic beacon signal"
        >
          Emit Signal Now
        </button>
      </div>

      {/* Next Emission Timer */}
      <div className="mt-4 text-center">
        <div className="text-xs text-slate-500">
          Next automatic emission in ~60 seconds
        </div>
      </div>
    </div>
  );
};

export default CivicValueBeacon;