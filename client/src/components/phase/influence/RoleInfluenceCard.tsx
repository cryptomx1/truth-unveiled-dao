// Phase XI Step 1: RoleInfluenceCard.tsx
// JASMY Relay authorization via Commander Mark
// Role influence dashboard with tier-to-tier influence mapping and Truth Point distribution

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, 
  Crown, 
  Star, 
  Award, 
  Gem, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Activity, 
  Hash,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';

export interface TrustTier {
  name: string;
  threshold: number;
  color: string;
  icon: React.ComponentType<any>;
  influence: number;
  tpMultiplier: number;
  decisionWeight: number;
}

export interface InfluenceMetrics {
  currentTier: string;
  influenceScore: number;
  tpBonusMultiplier: number;
  decisionWeight: number;
  referralTrust: number;
  tierProgress: number;
}

export interface CrossRoleDistribution {
  sourceRole: string;
  targetRole: string;
  tpBonus: number;
  influenceImpact: number;
}

export interface RoleInfluenceCardProps {
  userRole?: 'Citizen' | 'Moderator' | 'Governor';
  userDid?: string;
  currentTrustScore?: number;
  onInfluenceUpdate?: (metrics: InfluenceMetrics) => void;
  className?: string;
}

export default function RoleInfluenceCard({
  userRole = 'Citizen',
  userDid = 'did:civic:role_influence_001',
  currentTrustScore = 87.3,
  onInfluenceUpdate,
  className = ''
}: RoleInfluenceCardProps) {
  const [trustTiers] = useState<TrustTier[]>([
    { name: 'Novice', threshold: 0, color: 'text-slate-400', icon: Users, influence: 10, tpMultiplier: 1.0, decisionWeight: 1 },
    { name: 'Trusted', threshold: 60, color: 'text-blue-400', icon: Star, influence: 35, tpMultiplier: 1.2, decisionWeight: 1.5 },
    { name: 'Advocate', threshold: 80, color: 'text-green-400', icon: Award, influence: 65, tpMultiplier: 1.5, decisionWeight: 2 },
    { name: 'Guardian', threshold: 90, color: 'text-purple-400', icon: Crown, influence: 85, tpMultiplier: 1.8, decisionWeight: 2.5 },
    { name: 'Architect', threshold: 95, color: 'text-yellow-400', icon: Gem, influence: 100, tpMultiplier: 2.0, decisionWeight: 3 }
  ]);

  const [currentInfluence, setCurrentInfluence] = useState<InfluenceMetrics>({
    currentTier: 'Advocate',
    influenceScore: 65,
    tpBonusMultiplier: 1.5,
    decisionWeight: 2.0,
    referralTrust: 78.5,
    tierProgress: 73.3
  });

  const [crossRoleDistribution, setCrossRoleDistribution] = useState<CrossRoleDistribution[]>([
    { sourceRole: 'Novice', targetRole: 'Trusted', tpBonus: 5, influenceImpact: 15 },
    { sourceRole: 'Trusted', targetRole: 'Advocate', tpBonus: 8, influenceImpact: 25 },
    { sourceRole: 'Advocate', targetRole: 'Guardian', tpBonus: 12, influenceImpact: 35 },
    { sourceRole: 'Guardian', targetRole: 'Architect', tpBonus: 18, influenceImpact: 50 }
  ]);

  const [zkpSignatureRequired, setZkpSignatureRequired] = useState<boolean>(false);
  const [pathBTriggered, setPathBTriggered] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const [renderTime, setRenderTime] = useState<number>(0);
  
  const mountTimestamp = useRef<number>(Date.now());
  const syncAttempts = useRef<number>(0);
  const desyncFailures = useRef<number>(0);

  // Announce messages for accessibility (TTS suppressed per requirements)
  const announce = useCallback((message: string) => {
    setAriaAnnouncement(message);
    console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
  }, []);

  // Determine current tier based on trust score
  const determineTrustTier = useCallback((score: number): TrustTier => {
    for (let i = trustTiers.length - 1; i >= 0; i--) {
      if (score >= trustTiers[i].threshold) {
        return trustTiers[i];
      }
    }
    return trustTiers[0];
  }, [trustTiers]);

  // Sync with TrustAuditOverlay for tier status
  const syncTierStatus = useCallback(async (): Promise<boolean> => {
    syncAttempts.current++;
    setSyncStatus('syncing');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Simulate 15% influence desync for Path B testing
      const syncSuccess = Math.random() > 0.15;
      
      if (!syncSuccess) {
        desyncFailures.current++;
        const desyncRate = (desyncFailures.current / syncAttempts.current) * 100;
        
        if (desyncRate >= 15) {
          setPathBTriggered(true);
          setFallbackMode(true);
          console.log(`🛑 RoleInfluenceCard: Path B activated - ${desyncRate.toFixed(1)}% influence desync rate`);
          console.log('💾 RoleInfluenceCard: Caching to vault.history.json with isMock=true');
        }
        
        throw new Error('Tier sync failed');
      }
      
      const currentTier = determineTrustTier(currentTrustScore);
      
      // Update influence metrics based on current tier
      setCurrentInfluence({
        currentTier: currentTier.name,
        influenceScore: currentTier.influence,
        tpBonusMultiplier: currentTier.tpMultiplier,
        decisionWeight: currentTier.decisionWeight,
        referralTrust: currentTrustScore * 0.9, // 90% of trust score
        tierProgress: ((currentTrustScore - currentTier.threshold) / (100 - currentTier.threshold)) * 100
      });
      
      setSyncStatus('success');
      console.log('✅ RoleInfluenceCard: Tier status synchronized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ RoleInfluenceCard: Tier sync failed:', error);
      setSyncStatus('failed');
      return false;
    }
  }, [currentTrustScore, determineTrustTier]);

  // Reset Path B fallback
  const resetFallback = () => {
    setPathBTriggered(false);
    setFallbackMode(false);
    desyncFailures.current = 0;
    syncAttempts.current = 0;
    announce('Fallback mode reset');
  };

  // Calculate tier-weighted Truth Point preview
  const calculateTpPreview = useCallback((tier: TrustTier, baseAmount: number = 15): number => {
    return Math.round(baseAmount * tier.tpMultiplier);
  }, []);

  // Get role-based signature requirement
  const getSignatureRequirement = useCallback((role: string): boolean => {
    return role === 'Governor'; // Mandatory for Governors, optional for others
  }, []);

  // Handle DID change and signature enforcement
  useEffect(() => {
    const requiresSignature = getSignatureRequirement(userRole);
    setZkpSignatureRequired(requiresSignature);
    
    if (requiresSignature) {
      console.log(`🔐 RoleInfluenceCard: ZKP signature mandatory for ${userRole}`);
    }
  }, [userRole, getSignatureRequirement]);

  // Component initialization and tier sync
  useEffect(() => {
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    console.log('👑 RoleInfluenceCard: Role influence dashboard initialized');
    console.log(`🎯 RoleInfluenceCard: User role: ${userRole}, DID: ${userDid}, Trust Score: ${currentTrustScore}`);
    announce('Role influence dashboard ready');
    
    // Initial tier sync
    syncTierStatus();
    
    const totalRenderTime = Date.now() - mountTimestamp.current;
    setRenderTime(totalRenderTime);
    
    if (totalRenderTime > 125) {
      console.warn(`⚠️ RoleInfluenceCard render time: ${totalRenderTime}ms (exceeds 125ms target)`);
    }
  }, [announce, userRole, userDid, currentTrustScore, syncTierStatus]);

  // Notify parent of influence updates
  useEffect(() => {
    onInfluenceUpdate?.(currentInfluence);
  }, [currentInfluence, onInfluenceUpdate]);

  return (
    <div className={`w-full max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
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
            <Crown className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Role Influence Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-blue-400">{userRole}</span>
            </div>
            {zkpSignatureRequired && (
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">ZKP Required</span>
              </div>
            )}
          </div>
        </div>
        
        {pathBTriggered && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-medium text-red-400">Influence Desync Fallback Active</h3>
            </div>
            <div className="text-xs text-red-300 mb-3">
              Influence desync rate ≥15%. Using LocalSaveLayer fallback.
            </div>
            <button
              onClick={resetFallback}
              className="py-1 px-3 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors duration-200"
              style={{ minHeight: '32px' }}
            >
              Reset Fallback
            </button>
          </div>
        )}
      </div>

      {/* Current Influence Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Current Tier */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-300">Current Tier</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {currentInfluence.currentTier}
          </div>
          <div className="text-xs text-blue-400">
            {currentInfluence.influenceScore}% influence
          </div>
        </div>

        {/* TP Multiplier */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-medium text-slate-300">TP Multiplier</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            ×{currentInfluence.tpBonusMultiplier}
          </div>
          <div className="text-xs text-green-400">
            +{Math.round((currentInfluence.tpBonusMultiplier - 1) * 100)}% bonus
          </div>
        </div>

        {/* Decision Weight */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-300">Decision Weight</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {currentInfluence.decisionWeight.toFixed(1)}×
          </div>
          <div className="text-xs text-purple-400">
            Vote influence
          </div>
        </div>

        {/* Referral Trust */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-medium text-slate-300">Referral Trust</h3>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {currentInfluence.referralTrust.toFixed(1)}%
          </div>
          <div className="text-xs text-yellow-400">
            Trust propagation
          </div>
        </div>
      </div>

      {/* Tier-to-Tier Influence Map */}
      <div className="mb-8 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-slate-300">Tier Influence Map</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {trustTiers.map((tier, index) => {
            const IconComponent = tier.icon;
            const isCurrentTier = tier.name === currentInfluence.currentTier;
            const isUnlocked = currentTrustScore >= tier.threshold;
            
            return (
              <div key={tier.name} className="text-center">
                <div 
                  className={`p-3 rounded-md border transition-all duration-200 ${
                    isCurrentTier 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : isUnlocked
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 mb-3">
                    <IconComponent className={`w-6 h-6 ${isUnlocked ? tier.color : 'text-slate-600'}`} />
                    <span className={`text-sm font-medium ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                      {tier.name}
                    </span>
                    {isCurrentTier && (
                      <span className="text-xs px-2 py-1 bg-blue-600 text-blue-100 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  {/* Influence Progress Bar */}
                  <div className="mb-2">
                    <div className="text-xs text-slate-400 mb-1">Influence</div>
                    <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isUnlocked ? tier.color.replace('text-', 'bg-') : 'bg-slate-600'
                        }`}
                        style={{ width: `${tier.influence}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{tier.influence}%</div>
                  </div>
                  
                  {/* TP Multiplier */}
                  <div className="text-xs text-slate-400">
                    TP: ×{tier.tpMultiplier}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Role TP Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* TP Distribution Matrix */}
        <div className="p-4 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-medium text-slate-300">TP Distribution Preview</h3>
          </div>
          
          <div className="space-y-3">
            {crossRoleDistribution.map((distribution, index) => (
              <div key={index} className="p-3 bg-slate-800 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">{distribution.sourceRole}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm text-white">{distribution.targetRole}</span>
                  </div>
                  <div className="text-sm text-green-400">+{distribution.tpBonus} TP</div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Influence Impact:</span>
                  <span>{distribution.influenceImpact}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-md">
            <div className="text-sm text-blue-300 mb-1">Your Current TP Preview</div>
            <div className="text-lg font-bold text-white">
              +{calculateTpPreview(determineTrustTier(currentTrustScore))} TP
            </div>
            <div className="text-xs text-blue-400">
              Base 15 TP × {currentInfluence.tpBonusMultiplier} multiplier
            </div>
          </div>
        </div>

        {/* Sync Status & Performance */}
        <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-slate-300">Sync Status</h3>
          </div>
          
          <div className="space-y-3">
            {/* Sync Status Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Tier Sync:</span>
              <div className="flex items-center gap-2">
                {syncStatus === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                {syncStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {syncStatus === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                <span className={`text-sm ${
                  syncStatus === 'success' ? 'text-green-400' : 
                  syncStatus === 'failed' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
                </span>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Render Time:</span>
                <span className={renderTime > 125 ? 'text-red-400' : 'text-green-400'}>
                  {renderTime}ms
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Sync Attempts:</span>
                <span className="text-white">{syncAttempts.current}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Desync Failures:</span>
                <span className={desyncFailures.current > 0 ? 'text-red-400' : 'text-green-400'}>
                  {desyncFailures.current}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Fallback Status:</span>
                <span className={pathBTriggered ? 'text-red-400' : 'text-green-400'}>
                  {pathBTriggered ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">ZKP Required:</span>
                <span className={zkpSignatureRequired ? 'text-yellow-400' : 'text-slate-400'}>
                  {zkpSignatureRequired ? 'Yes' : 'Optional'}
                </span>
              </div>
            </div>
            
            {/* Manual Sync Button */}
            <button
              onClick={syncTierStatus}
              disabled={syncStatus === 'syncing'}
              className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-md text-sm transition-colors duration-200 flex items-center justify-center gap-2"
              style={{ minHeight: '36px' }}
              aria-label="Sync tier status"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Tier Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Role:</span>
              <span className="text-white">{userRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Trust Score:</span>
              <span className="text-white">{currentTrustScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Tier:</span>
              <span className="text-white">{currentInfluence.currentTier}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">DID:</span>
              <span className="text-white font-mono text-[10px]">
                {userDid.substring(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tier Progress:</span>
              <span className="text-white">{currentInfluence.tierProgress.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Next Tier:</span>
              <span className="text-white">
                {trustTiers.find(t => t.threshold > currentTrustScore)?.name || 'Max Tier'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}