/**
 * IdentityOnboardingPanel.tsx - Phase XXIII
 * Civic Identity Minting + ZK-Reputation Onboarding Interface
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  Award,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Calendar,
  Star,
  Zap
} from 'lucide-react';
import { 
  mintCivicIdentity, 
  getActivityProfile,
  verifyIdentityValidity,
  type CivicIdentityToken,
  type UserActivityProfile,
  type IdentityMintingResult 
} from '../../identity/CivicIdentityMinter';
import { 
  createReputationBundle, 
  exportReputationBundle,
  type ReputationBundle,
  type ZKReputationPayload 
} from '../../services/ZKReputationAssembler';

// Component props interface
interface IdentityOnboardingPanelProps {
  did?: string;
  autoLoadProfile?: boolean;
  showAdvancedOptions?: boolean;
}

// Component state interfaces
interface OnboardingState {
  step: 'profile' | 'minting' | 'reputation' | 'export' | 'complete';
  isLoading: boolean;
  error: string | null;
}

interface ProfileState {
  profile: UserActivityProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface IdentityState {
  identity: CivicIdentityToken | null;
  mintingResult: IdentityMintingResult | null;
  isLoading: boolean;
  error: string | null;
}

interface ReputationState {
  bundle: ReputationBundle | null;
  isLoading: boolean;
  error: string | null;
  showDetails: boolean;
}

// Main IdentityOnboardingPanel component
export const IdentityOnboardingPanel: React.FC<IdentityOnboardingPanelProps> = ({
  did = 'did:civic:commander-mark',
  autoLoadProfile = true,
  showAdvancedOptions = false
}) => {
  // Component state
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    step: 'profile',
    isLoading: false,
    error: null
  });
  
  const [profileState, setProfileState] = useState<ProfileState>({
    profile: null,
    isLoading: false,
    error: null
  });
  
  const [identityState, setIdentityState] = useState<IdentityState>({
    identity: null,
    mintingResult: null,
    isLoading: false,
    error: null
  });
  
  const [reputationState, setReputationState] = useState<ReputationState>({
    bundle: null,
    isLoading: false,
    error: null,
    showDetails: false
  });
  
  const [currentDID, setCurrentDID] = useState(did);
  
  // ARIA live region ref
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  
  // Load user activity profile
  const loadActivityProfile = async () => {
    setProfileState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const profile = await getActivityProfile(currentDID);
      setProfileState({
        profile,
        isLoading: false,
        error: null
      });
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Activity profile loaded for ${currentDID}`;
      }
      
    } catch (error) {
      console.error('❌ Failed to load activity profile:', error);
      setProfileState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load profile: ${error}`
      }));
    }
  };
  
  // Mint civic identity
  const handleMintIdentity = async () => {
    if (!profileState.profile) return;
    
    setIdentityState(prev => ({ ...prev, isLoading: true, error: null }));
    setOnboardingState(prev => ({ ...prev, step: 'minting' }));
    
    try {
      const mintingResult = await mintCivicIdentity(currentDID);
      
      setIdentityState({
        identity: mintingResult.identity || null,
        mintingResult,
        isLoading: false,
        error: mintingResult.success ? null : mintingResult.error || 'Minting failed'
      });
      
      if (mintingResult.success && mintingResult.identity) {
        setOnboardingState(prev => ({ ...prev, step: 'reputation' }));
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `🪪 Civic identity minted successfully: ${mintingResult.identity.cid}`;
        }
      } else {
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Identity minting failed: ${mintingResult.error}`;
        }
      }
      
    } catch (error) {
      console.error('❌ Identity minting failed:', error);
      setIdentityState(prev => ({
        ...prev,
        isLoading: false,
        error: `Minting failed: ${error}`
      }));
    }
  };
  
  // Assemble reputation proof
  const handleAssembleReputation = async () => {
    if (!identityState.identity || !profileState.profile) return;
    
    setReputationState(prev => ({ ...prev, isLoading: true, error: null }));
    setOnboardingState(prev => ({ ...prev, step: 'reputation' }));
    
    try {
      const bundle = await createReputationBundle(identityState.identity, profileState.profile);
      
      if (bundle) {
        setReputationState(prev => ({
          ...prev,
          bundle,
          isLoading: false,
          error: null
        }));
        
        setOnboardingState(prev => ({ ...prev, step: 'export' }));
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `🧬 Reputation proof assembled and ready for export`;
        }
      } else {
        throw new Error('Failed to create reputation bundle');
      }
      
    } catch (error) {
      console.error('❌ Reputation assembly failed:', error);
      setReputationState(prev => ({
        ...prev,
        isLoading: false,
        error: `Assembly failed: ${error}`
      }));
    }
  };
  
  // Export reputation bundle
  const handleExportBundle = async () => {
    if (!reputationState.bundle) return;
    
    try {
      setOnboardingState(prev => ({ ...prev, isLoading: true }));
      
      const exportResult = await exportReputationBundle(reputationState.bundle);
      
      if (exportResult.success) {
        setOnboardingState(prev => ({ ...prev, step: 'complete', isLoading: false }));
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `📦 Reputation bundle exported: ${exportResult.filename}`;
        }
      } else {
        throw new Error(exportResult.error || 'Export failed');
      }
      
    } catch (error) {
      console.error('❌ Bundle export failed:', error);
      setOnboardingState(prev => ({ ...prev, isLoading: false, error: `Export failed: ${error}` }));
    }
  };
  
  // Reset onboarding process
  const handleReset = () => {
    setOnboardingState({
      step: 'profile',
      isLoading: false,
      error: null
    });
    setIdentityState({
      identity: null,
      mintingResult: null,
      isLoading: false,
      error: null
    });
    setReputationState({
      bundle: null,
      isLoading: false,
      error: null,
      showDetails: false
    });
  };
  
  // Format tier display
  const formatTier = (tier: string): string => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };
  
  // Get tier color
  const getTierColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'commander': return 'text-purple-400';
      case 'governor': return 'text-indigo-400';
      case 'moderator': return 'text-yellow-400';
      case 'citizen': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };
  
  // Get tier badge style
  const getTierBadgeStyle = (tier: string): string => {
    const baseStyle = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (tier.toLowerCase()) {
      case 'commander': return `${baseStyle} bg-purple-900/30 border border-purple-600 text-purple-300`;
      case 'governor': return `${baseStyle} bg-indigo-900/30 border border-indigo-600 text-indigo-300`;
      case 'moderator': return `${baseStyle} bg-yellow-900/30 border border-yellow-600 text-yellow-300`;
      case 'citizen': return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300`;
      default: return `${baseStyle} bg-gray-900/30 border border-gray-600 text-gray-300`;
    }
  };
  
  // Get step indicator style
  const getStepIndicatorStyle = (stepName: string): string => {
    const currentStepIndex = ['profile', 'minting', 'reputation', 'export', 'complete'].indexOf(onboardingState.step);
    const stepIndex = ['profile', 'minting', 'reputation', 'export', 'complete'].indexOf(stepName);
    
    if (stepIndex < currentStepIndex) {
      return "bg-green-600 text-white";
    } else if (stepIndex === currentStepIndex) {
      return "bg-blue-600 text-white";
    } else {
      return "bg-slate-600 text-slate-300";
    }
  };
  
  // Initial load
  useEffect(() => {
    if (autoLoadProfile && currentDID) {
      loadActivityProfile();
    }
  }, [currentDID, autoLoadProfile]);
  
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
            <Shield className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-semibold text-slate-200">
              Civic Identity Onboarding
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
              aria-label="Reset onboarding process"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-4">
          {['profile', 'minting', 'reputation', 'export', 'complete'].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepIndicatorStyle(step)}`}>
                {index + 1}
              </div>
              <span className="text-sm text-slate-400 capitalize">{step}</span>
              {index < 4 && <div className="w-8 h-0.5 bg-slate-600" />}
            </div>
          ))}
        </div>
        
        {/* DID Input */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Decentralized Identity (DID)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={currentDID}
              onChange={(e) => setCurrentDID(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 text-slate-200 rounded-lg text-sm"
              placeholder="did:civic:username"
              aria-label="Enter your DID"
            />
            <button
              onClick={loadActivityProfile}
              disabled={profileState.isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-900/30 border border-indigo-600 text-indigo-300 rounded-lg hover:bg-indigo-800/30 transition-colors text-sm"
              aria-label="Load activity profile"
            >
              {profileState.isLoading ? (
                <div className="w-4 h-4 animate-spin border-2 border-indigo-400 border-t-transparent rounded-full" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Load</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Activity Profile Section */}
      {profileState.profile && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Activity Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-400">Trust Index</span>
              </div>
              <div className="text-xl font-bold text-green-400">
                {profileState.profile.trustIndex}
              </div>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-400">Streak Days</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">
                {profileState.profile.streakDays}
              </div>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-400">Vote History</span>
              </div>
              <div className="text-xl font-bold text-purple-400">
                {profileState.profile.voteHistory}
              </div>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-slate-400">Engagement</span>
              </div>
              <div className="text-xl font-bold text-indigo-400">
                {profileState.profile.engagementLevel}
              </div>
            </div>
          </div>
          
          {onboardingState.step === 'profile' && (
            <button
              onClick={handleMintIdentity}
              disabled={identityState.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-900/30 border border-indigo-600 text-indigo-300 rounded-lg hover:bg-indigo-800/30 transition-colors"
              aria-label="Mint civic identity"
            >
              {identityState.isLoading ? (
                <>
                  <div className="w-4 h-4 animate-spin border-2 border-indigo-400 border-t-transparent rounded-full" />
                  <span>Minting Identity...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Mint Identity</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Identity Section */}
      {identityState.identity && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-400" />
            Civic Identity Token
          </h2>
          
          <div className="bg-green-900/10 border border-green-600/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-green-400">Civic Identity (CID)</div>
                <div className="text-green-300 font-mono text-sm break-all">
                  {identityState.identity.cid}
                </div>
              </div>
              <div className={getTierBadgeStyle(identityState.identity.tier)}>
                {formatTier(identityState.identity.tier)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-green-400">Issued:</span>
                <div className="text-green-300">
                  {new Date(identityState.identity.issuedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-green-400">Valid Until:</span>
                <div className="text-green-300">
                  {new Date(identityState.identity.metadata.validUntil).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          {onboardingState.step === 'reputation' && (
            <button
              onClick={handleAssembleReputation}
              disabled={reputationState.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-600 text-purple-300 rounded-lg hover:bg-purple-800/30 transition-colors"
              aria-label="Assemble reputation proof"
            >
              {reputationState.isLoading ? (
                <>
                  <div className="w-4 h-4 animate-spin border-2 border-purple-400 border-t-transparent rounded-full" />
                  <span>Assembling Reputation...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Assemble Reputation</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Reputation Bundle Section */}
      {reputationState.bundle && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              ZK-Reputation Proof
            </h2>
            
            <button
              onClick={() => setReputationState(prev => ({ ...prev, showDetails: !prev.showDetails }))}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              aria-label="Toggle reputation details"
              aria-expanded={reputationState.showDetails}
            >
              {reputationState.showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{reputationState.showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>
          
          <div className="bg-purple-900/10 border border-purple-600/30 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-purple-400">Signal:</span>
                <div className="text-purple-300 font-mono">
                  {reputationState.bundle.payload.signal}
                </div>
              </div>
              <div>
                <span className="text-purple-400">Epoch:</span>
                <div className="text-purple-300 font-mono">
                  {reputationState.bundle.payload.epoch}
                </div>
              </div>
              <div>
                <span className="text-purple-400">Bundle Size:</span>
                <div className="text-purple-300">
                  {(reputationState.bundle.exportMetadata.fileSize / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
            
            {reputationState.showDetails && (
              <div className="mt-4 pt-4 border-t border-purple-600/30">
                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-purple-400">Proof Hash:</span>
                    <div className="text-purple-300 font-mono break-all">
                      {reputationState.bundle.payload.proofHash}
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-400">Bundle ID:</span>
                    <div className="text-purple-300 font-mono">
                      {reputationState.bundle.exportMetadata.bundleId}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {onboardingState.step === 'export' && (
            <button
              onClick={handleExportBundle}
              disabled={onboardingState.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-600 text-emerald-300 rounded-lg hover:bg-emerald-800/30 transition-colors"
              aria-label="Export reputation bundle"
            >
              {onboardingState.isLoading ? (
                <>
                  <div className="w-4 h-4 animate-spin border-2 border-emerald-400 border-t-transparent rounded-full" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download .zkp-rep.json</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Completion Section */}
      {onboardingState.step === 'complete' && (
        <div className="bg-green-900/10 border border-green-600/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-medium text-green-300">
              Onboarding Complete!
            </h2>
          </div>
          
          <p className="text-green-200 mb-4">
            Your civic identity has been successfully minted and your reputation proof has been exported. 
            You can now participate in DAO governance with your verified identity credentials.
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-600 text-green-300 rounded-lg hover:bg-green-800/30 transition-colors"
              aria-label="Start new onboarding"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Onboarding</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {(onboardingState.error || profileState.error || identityState.error || reputationState.error) && (
        <div className="bg-red-900/10 border border-red-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">Error</span>
          </div>
          <p className="text-red-200 text-sm">
            {onboardingState.error || profileState.error || identityState.error || reputationState.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default IdentityOnboardingPanel;