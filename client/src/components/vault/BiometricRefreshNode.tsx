/**
 * BiometricRefreshNode.tsx - Phase XXIV
 * Biometric Identity Refresh Flow UI Component
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Fingerprint,
  Eye,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Timer,
  Zap,
  Target
} from 'lucide-react';
import { 
  createBiometricSession, 
  verifyBiometricSession,
  refreshVaultIdentity,
  type BiometricSession,
  type VaultEntry 
} from '../../identity/IdentityVaultCore';
import { 
  getActivityProfile,
  type UserActivityProfile 
} from '../../identity/CivicIdentityMinter';
import {
  exportReputationBundle,
  type ReputationBundle
} from '../../services/ZKReputationAssembler';
import {
  logBiometricVerification,
  logIdentityRefresh
} from '../../services/VaultTelemetryLogger';
import {
  announceBiometricSuccess,
  announceBiometricFailure,
  announceRefreshConfirmation
} from '../../services/VaultNarrationSystem';

// Component props interface
interface BiometricRefreshNodeProps {
  vaultEntry: VaultEntry;
  onRefreshComplete?: (refreshedEntry: VaultEntry, refreshedBundle?: ReputationBundle) => void;
  onRefreshCancel?: () => void;
  triggerReason?: 'expiry' | 'user_request' | 'security_update';
}

// Component state interfaces
interface RefreshState {
  step: 'biometric_scan' | 'verification' | 'profile_update' | 'refresh_processing' | 'export_ready' | 'complete';
  isLoading: boolean;
  error: string | null;
}

interface BiometricState {
  session: BiometricSession | null;
  scanProgress: number;
  qualityScore: number;
  isScanning: boolean;
  verified: boolean;
  error: string | null;
}

interface ProfileUpdateState {
  profile: UserActivityProfile | null;
  isLoading: boolean;
  trustChange: number;
  error: string | null;
}

// Main BiometricRefreshNode component
export const BiometricRefreshNode: React.FC<BiometricRefreshNodeProps> = ({
  vaultEntry,
  onRefreshComplete,
  onRefreshCancel,
  triggerReason = 'user_request'
}) => {
  // Component state
  const [refreshState, setRefreshState] = useState<RefreshState>({
    step: 'biometric_scan',
    isLoading: false,
    error: null
  });
  
  const [biometricState, setBiometricState] = useState<BiometricState>({
    session: null,
    scanProgress: 0,
    qualityScore: 0,
    isScanning: false,
    verified: false,
    error: null
  });
  
  const [profileUpdateState, setProfileUpdateState] = useState<ProfileUpdateState>({
    profile: null,
    isLoading: false,
    trustChange: 0,
    error: null
  });
  
  const [refreshedEntry, setRefreshedEntry] = useState<VaultEntry | null>(null);
  const [refreshedBundle, setRefreshedBundle] = useState<ReputationBundle | null>(null);
  
  // ARIA live region ref
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  
  // Start biometric session
  const startBiometricSession = async () => {
    try {
      setRefreshState(prev => ({ ...prev, isLoading: true, error: null }));
      setBiometricState(prev => ({ ...prev, error: null }));
      
      const session = createBiometricSession(vaultEntry.did);
      setBiometricState(prev => ({ 
        ...prev, 
        session,
        isScanning: false,
        verified: false
      }));
      
      setRefreshState(prev => ({ ...prev, isLoading: false }));
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = 'Biometric session created. Ready to scan fingerprint.';
      }
      
    } catch (error) {
      console.error('❌ Biometric session creation failed:', error);
      setRefreshState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Session creation failed: ${error}`
      }));
    }
  };
  
  // Simulate biometric scan
  const performBiometricScan = async () => {
    if (!biometricState.session) return;
    
    setBiometricState(prev => ({ 
      ...prev, 
      isScanning: true,
      scanProgress: 0,
      error: null
    }));
    
    const startTime = performance.now();
    
    try {
      // Simulate scanning progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setBiometricState(prev => ({ ...prev, scanProgress: progress }));
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Simulate biometric data collection
      const mockBiometricData = `fingerprint_${vaultEntry.did}_${Date.now()}`;
      
      // Verify biometric
      const verificationResult = verifyBiometricSession(
        biometricState.session.sessionId,
        mockBiometricData
      );
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Log biometric verification
      logBiometricVerification(
        vaultEntry.did,
        biometricState.session.sessionId,
        verificationResult.success,
        verificationResult.qualityScore,
        'fingerprint',
        duration
      );
      
      if (verificationResult.success) {
        setBiometricState(prev => ({
          ...prev,
          isScanning: false,
          verified: true,
          qualityScore: verificationResult.qualityScore
        }));
        
        // Update session with verification
        const updatedSession = { ...biometricState.session, verified: true };
        setBiometricState(prev => ({ ...prev, session: updatedSession }));
        
        setRefreshState(prev => ({ ...prev, step: 'profile_update' }));
        
        // Announce success
        announceBiometricSuccess(verificationResult.qualityScore, 'fingerprint');
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Biometric verification successful. Quality score: ${verificationResult.qualityScore}%`;
        }
        
        // Proceed to profile update
        await updateActivityProfile();
        
      } else {
        setBiometricState(prev => ({
          ...prev,
          isScanning: false,
          verified: false,
          error: verificationResult.reason
        }));
        
        // Announce failure
        announceBiometricFailure(verificationResult.reason, 2); // Mock remaining attempts
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Biometric verification failed: ${verificationResult.reason}`;
        }
      }
      
    } catch (error) {
      console.error('❌ Biometric scan failed:', error);
      setBiometricState(prev => ({
        ...prev,
        isScanning: false,
        error: `Scan failed: ${error}`
      }));
    }
  };
  
  // Update activity profile with mock changes
  const updateActivityProfile = async () => {
    if (!biometricState.session?.verified) return;
    
    setProfileUpdateState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get current profile
      const currentProfile = await getActivityProfile(vaultEntry.did);
      
      // Simulate profile updates (small improvements)
      const trustChange = Math.floor(Math.random() * 6) - 2; // -2 to +3 change
      const streakChange = Math.floor(Math.random() * 3); // 0 to +2 change
      const engagementChange = Math.floor(Math.random() * 8) - 3; // -3 to +4 change
      
      const updatedProfile: UserActivityProfile = {
        ...currentProfile,
        trustIndex: Math.max(0, Math.min(100, currentProfile.trustIndex + trustChange)),
        streakDays: Math.max(0, currentProfile.streakDays + streakChange),
        engagementLevel: Math.max(0, Math.min(100, currentProfile.engagementLevel + engagementChange)),
        lastActiveAt: new Date().toISOString(),
        voteHistory: currentProfile.voteHistory + Math.floor(Math.random() * 3), // 0-2 new votes
      };
      
      setProfileUpdateState({
        profile: updatedProfile,
        isLoading: false,
        trustChange,
        error: null
      });
      
      setRefreshState(prev => ({ ...prev, step: 'refresh_processing' }));
      
      // Proceed to refresh processing
      await processIdentityRefresh(updatedProfile);
      
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      setProfileUpdateState(prev => ({
        ...prev,
        isLoading: false,
        error: `Profile update failed: ${error}`
      }));
    }
  };
  
  // Process identity refresh
  const processIdentityRefresh = async (updatedProfile: UserActivityProfile) => {
    if (!biometricState.session || !profileUpdateState.profile) return;
    
    setRefreshState(prev => ({ ...prev, isLoading: true }));
    
    const startTime = performance.now();
    
    try {
      const refreshResult = await refreshVaultIdentity(
        vaultEntry.entryId,
        biometricState.session,
        updatedProfile,
        triggerReason
      );
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      if (refreshResult.success && refreshResult.refreshedEntry) {
        setRefreshedEntry(refreshResult.refreshedEntry);
        setRefreshedBundle(refreshResult.refreshedBundle || null);
        
        // Log refresh
        const oldEpoch = vaultEntry.reputationBundle?.payload.epoch || 'unknown';
        const newEpoch = refreshResult.refreshedBundle?.payload.epoch || 'unknown';
        
        logIdentityRefresh(
          vaultEntry.cid,
          vaultEntry.entryId,
          oldEpoch,
          newEpoch,
          profileUpdateState.trustChange,
          triggerReason,
          duration
        );
        
        // Announce refresh confirmation
        announceRefreshConfirmation(
          vaultEntry.cid,
          newEpoch,
          profileUpdateState.trustChange
        );
        
        setRefreshState(prev => ({ 
          ...prev, 
          step: 'export_ready',
          isLoading: false
        }));
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Identity refresh completed. New epoch: ${newEpoch}`;
        }
        
      } else {
        throw new Error(refreshResult.error || 'Refresh failed');
      }
      
    } catch (error) {
      console.error('❌ Identity refresh failed:', error);
      setRefreshState(prev => ({
        ...prev,
        isLoading: false,
        error: `Refresh failed: ${error}`
      }));
    }
  };
  
  // Export refreshed bundle
  const handleExportBundle = async () => {
    if (!refreshedBundle) return;
    
    setRefreshState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const exportResult = await exportReputationBundle(refreshedBundle);
      
      if (exportResult.success) {
        setRefreshState(prev => ({ 
          ...prev, 
          step: 'complete',
          isLoading: false
        }));
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Refreshed identity bundle exported: ${exportResult.filename}`;
        }
        
        // Call completion callback
        if (onRefreshComplete && refreshedEntry) {
          onRefreshComplete(refreshedEntry, refreshedBundle);
        }
        
      } else {
        throw new Error(exportResult.error || 'Export failed');
      }
      
    } catch (error) {
      console.error('❌ Bundle export failed:', error);
      setRefreshState(prev => ({
        ...prev,
        isLoading: false,
        error: `Export failed: ${error}`
      }));
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (onRefreshCancel) {
      onRefreshCancel();
    }
  };
  
  // Auto-start biometric session on mount
  useEffect(() => {
    startBiometricSession();
  }, []);
  
  // Get step indicator style
  const getStepIndicatorStyle = (stepName: string): string => {
    const steps = ['biometric_scan', 'verification', 'profile_update', 'refresh_processing', 'export_ready', 'complete'];
    const currentIndex = steps.indexOf(refreshState.step);
    const stepIndex = steps.indexOf(stepName);
    
    if (stepIndex < currentIndex) {
      return "bg-green-600 text-white";
    } else if (stepIndex === currentIndex) {
      return "bg-blue-600 text-white";
    } else {
      return "bg-slate-600 text-slate-300";
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
            <Fingerprint className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-semibold text-slate-200">
              Biometric Identity Refresh
            </h1>
          </div>
          
          <button
            onClick={handleCancel}
            className="px-3 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
            aria-label="Cancel refresh process"
          >
            Cancel
          </button>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-3 text-xs">
          {[
            { key: 'biometric_scan', label: 'Scan' },
            { key: 'verification', label: 'Verify' },
            { key: 'profile_update', label: 'Update' },
            { key: 'refresh_processing', label: 'Refresh' },
            { key: 'export_ready', label: 'Export' },
            { key: 'complete', label: 'Complete' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepIndicatorStyle(step.key)}`}>
                {index + 1}
              </div>
              <span className="text-slate-400">{step.label}</span>
              {index < 5 && <div className="w-6 h-0.5 bg-slate-600" />}
            </div>
          ))}
        </div>
        
        {/* Identity Info */}
        <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
          <div className="text-sm text-slate-400 mb-1">Refreshing Identity</div>
          <div className="text-slate-200 font-mono text-sm">{vaultEntry.cid}</div>
          <div className="text-xs text-slate-400 mt-1">
            Reason: {triggerReason.replace('_', ' ')}
          </div>
        </div>
      </div>
      
      {/* Biometric Scan Section */}
      {refreshState.step === 'biometric_scan' && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Biometric Authentication
          </h2>
          
          <div className="bg-blue-900/10 border border-blue-600/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-900/30 border-2 border-blue-600 rounded-full flex items-center justify-center">
                  <Fingerprint className="w-12 h-12 text-blue-400" />
                </div>
                {biometricState.isScanning && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                )}
              </div>
            </div>
            
            {biometricState.isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-blue-300 mb-1">
                  <span>Scanning...</span>
                  <span>{biometricState.scanProgress}%</span>
                </div>
                <div className="w-full bg-blue-900/30 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-150"
                    style={{ width: `${biometricState.scanProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="text-center">
              {!biometricState.session ? (
                <div className="text-slate-400">Initializing biometric session...</div>
              ) : !biometricState.isScanning && !biometricState.verified ? (
                <button
                  onClick={performBiometricScan}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-600 text-blue-300 rounded-lg hover:bg-blue-800/30 transition-colors mx-auto"
                  aria-label="Start biometric scan"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Place Finger on Scanner</span>
                </button>
              ) : biometricState.verified ? (
                <div className="flex items-center gap-2 text-green-400 justify-center">
                  <CheckCircle className="w-5 h-5" />
                  <span>Biometric Verified ({biometricState.qualityScore}%)</span>
                </div>
              ) : (
                <div className="text-blue-300">Scanning in progress...</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Update Section */}
      {(refreshState.step === 'profile_update' || refreshState.step === 'refresh_processing') && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            Profile Update & Refresh
          </h2>
          
          {profileUpdateState.profile && (
            <div className="bg-purple-900/10 border border-purple-600/30 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-400">Trust Index:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-300">{profileUpdateState.profile.trustIndex}</span>
                    {profileUpdateState.trustChange !== 0 && (
                      <span className={`text-xs ${profileUpdateState.trustChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ({profileUpdateState.trustChange > 0 ? '+' : ''}{profileUpdateState.trustChange})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-purple-400">Streak Days:</span>
                  <div className="text-purple-300">{profileUpdateState.profile.streakDays}</div>
                </div>
                <div>
                  <span className="text-purple-400">Engagement:</span>
                  <div className="text-purple-300">{profileUpdateState.profile.engagementLevel}</div>
                </div>
                <div>
                  <span className="text-purple-400">Vote History:</span>
                  <div className="text-purple-300">{profileUpdateState.profile.voteHistory}</div>
                </div>
              </div>
            </div>
          )}
          
          {refreshState.step === 'refresh_processing' && (
            <div className="flex items-center gap-3 text-purple-300">
              <div className="w-5 h-5 animate-spin border-2 border-purple-400 border-t-transparent rounded-full" />
              <span>Processing identity refresh...</span>
            </div>
          )}
        </div>
      )}
      
      {/* Export Ready Section */}
      {refreshState.step === 'export_ready' && refreshedBundle && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-400" />
            Refreshed Identity Ready
          </h2>
          
          <div className="bg-green-900/10 border border-green-600/30 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <span className="text-green-400">New Epoch:</span>
                <div className="text-green-300 font-mono">{refreshedBundle.payload.epoch}</div>
              </div>
              <div>
                <span className="text-green-400">Bundle Size:</span>
                <div className="text-green-300">{(refreshedBundle.exportMetadata.fileSize / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <CheckCircle className="w-4 h-4" />
              <span>Identity successfully refreshed and ready for export</span>
            </div>
          </div>
          
          <button
            onClick={handleExportBundle}
            disabled={refreshState.isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-600 text-green-300 rounded-lg hover:bg-green-800/30 transition-colors"
            aria-label="Export refreshed identity bundle"
          >
            {refreshState.isLoading ? (
              <>
                <div className="w-4 h-4 animate-spin border-2 border-green-400 border-t-transparent rounded-full" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Refreshed Bundle</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Complete Section */}
      {refreshState.step === 'complete' && (
        <div className="bg-green-900/10 border border-green-600/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-medium text-green-300">
              Identity Refresh Complete!
            </h2>
          </div>
          
          <p className="text-green-200 mb-4">
            Your civic identity has been successfully refreshed with updated biometric verification 
            and activity metrics. The new reputation bundle has been exported and is ready for use.
          </p>
          
          {refreshedEntry && (
            <div className="bg-green-800/20 rounded-lg p-3 text-sm">
              <div className="text-green-400 mb-1">Refreshed Identity:</div>
              <div className="text-green-300 font-mono">{refreshedEntry.cid}</div>
              <div className="text-green-400 mt-2 mb-1">Trust Index Change:</div>
              <div className="text-green-300">
                {profileUpdateState.trustChange > 0 ? '+' : ''}{profileUpdateState.trustChange} points
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Error Display */}
      {(refreshState.error || biometricState.error || profileUpdateState.error) && (
        <div className="bg-red-900/10 border border-red-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">Error</span>
          </div>
          <p className="text-red-200 text-sm">
            {refreshState.error || biometricState.error || profileUpdateState.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default BiometricRefreshNode;