// RoleBasedOverlay.tsx - Phase III-A Step 5/6
// Controls dynamic module visibility by DID role (Citizen, Delegate, Governor)
// Syncs with ZKP-based identity state with fallback visibility states

import { useState, useEffect, ReactNode } from 'react';
import { Shield, Eye, EyeOff, User, Users, Crown } from 'lucide-react';

export interface DIDRole {
  id: string;
  role: 'Citizen' | 'Delegate' | 'Governor';
  permissions: string[];
  zkpVerified: boolean;
  zkpHash: string;
  lastVerification: Date;
}

export interface OverlayConfig {
  id: string;
  requiredRole: DIDRole['role'] | 'any';
  fallbackVisible: boolean;
  testingMode: boolean;
  emergencyOverride: boolean;
}

interface RoleBasedOverlayProps {
  children: ReactNode;
  config: OverlayConfig;
  userRole?: DIDRole;
  onAccessViolation?: (violation: AccessViolation) => void;
  onRenderEvent?: (event: RenderEvent) => void;
}

interface AccessViolation {
  id: string;
  userId: string;
  requiredRole: string;
  actualRole: string;
  timestamp: Date;
  zkpStatus: boolean;
}

interface RenderEvent {
  id: string;
  overlayId: string;
  userId: string;
  action: 'rendered' | 'hidden' | 'fallback' | 'violation';
  timestamp: Date;
  zkpHash: string;
}

export const RoleBasedOverlay = ({ 
  children, 
  config, 
  userRole,
  onAccessViolation,
  onRenderEvent 
}: RoleBasedOverlayProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [fallbackActive, setFallbackActive] = useState<boolean>(false);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [zkpSyncStatus, setZkpSyncStatus] = useState<'synced' | 'syncing' | 'failed'>('synced');

  // Mock default user role for testing
  const defaultRole: DIDRole = {
    id: 'did:civic:0x7f3e2d1a8c9b5f2e',
    role: 'Citizen',
    permissions: ['read_public', 'vote_proposals', 'submit_feedback'],
    zkpVerified: true,
    zkpHash: '0x4f3e2d1a8c9b5f2e7d4a6b8c',
    lastVerification: new Date()
  };

  const currentRole = userRole || defaultRole;

  useEffect(() => {
    const startTime = performance.now();
    
    // Determine visibility based on role and config
    const hasAccess = checkRoleAccess(currentRole, config);
    
    if (hasAccess) {
      setVisible(true);
      setFallbackActive(false);
      
      // Log render event
      const renderEvent: RenderEvent = {
        id: `render_${Date.now()}`,
        overlayId: config.id,
        userId: currentRole.id,
        action: 'rendered',
        timestamp: new Date(),
        zkpHash: currentRole.zkpHash
      };
      
      onRenderEvent?.(renderEvent);
      console.log('🔇 TTS disabled: "Overlay rendered for role"');
      
    } else {
      // Check if fallback should be shown
      if (config.fallbackVisible || config.testingMode) {
        setVisible(true);
        setFallbackActive(true);
        
        const fallbackEvent: RenderEvent = {
          id: `fallback_${Date.now()}`,
          overlayId: config.id,
          userId: currentRole.id,
          action: 'fallback',
          timestamp: new Date(),
          zkpHash: currentRole.zkpHash
        };
        
        onRenderEvent?.(fallbackEvent);
        console.log('🔇 TTS disabled: "Fallback overlay active"');
        
      } else {
        setVisible(false);
        
        // Log access violation
        const violation: AccessViolation = {
          id: `violation_${Date.now()}`,
          userId: currentRole.id,
          requiredRole: config.requiredRole,
          actualRole: currentRole.role,
          timestamp: new Date(),
          zkpStatus: currentRole.zkpVerified
        };
        
        onAccessViolation?.(violation);
        
        const hiddenEvent: RenderEvent = {
          id: `hidden_${Date.now()}`,
          overlayId: config.id,
          userId: currentRole.id,
          action: 'hidden',
          timestamp: new Date(),
          zkpHash: currentRole.zkpHash
        };
        
        onRenderEvent?.(hiddenEvent);
        console.log('🔇 TTS disabled: "Access denied, overlay hidden"');
      }
    }

    // ZKP sync simulation
    simulateZKPSync();

    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`RoleBasedOverlay render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }

  }, [currentRole, config, onAccessViolation, onRenderEvent]);

  const checkRoleAccess = (role: DIDRole, overlayConfig: OverlayConfig): boolean => {
    // Emergency override always grants access
    if (overlayConfig.emergencyOverride) {
      return true;
    }

    // 'any' role requirement allows all authenticated users
    if (overlayConfig.requiredRole === 'any') {
      return role.zkpVerified;
    }

    // Check role hierarchy: Governor > Delegate > Citizen
    const roleHierarchy = {
      'Governor': 3,
      'Delegate': 2,
      'Citizen': 1
    };

    const userLevel = roleHierarchy[role.role];
    const requiredLevel = roleHierarchy[overlayConfig.requiredRole];

    return role.zkpVerified && userLevel >= requiredLevel;
  };

  const simulateZKPSync = () => {
    setZkpSyncStatus('syncing');
    
    setTimeout(() => {
      const syncSuccess = Math.random() > 0.05; // 95% success rate
      setZkpSyncStatus(syncSuccess ? 'synced' : 'failed');
      
      if (!syncSuccess) {
        console.log('⚠️ ZKP sync failed for overlay access verification');
      }
    }, Math.random() * 500 + 100);
  };

  const getRoleIcon = (role: DIDRole['role']) => {
    switch (role) {
      case 'Governor': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'Delegate': return <Users className="w-4 h-4 text-blue-400" />;
      case 'Citizen': return <User className="w-4 h-4 text-green-400" />;
      default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getZkpStatusColor = (status: typeof zkpSyncStatus) => {
    switch (status) {
      case 'synced': return 'text-green-400';
      case 'syncing': return 'text-amber-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="relative">
      {/* Overlay Header (only shown in testing mode or fallback) */}
      {(config.testingMode || fallbackActive) && (
        <div className="absolute top-0 right-0 z-50 bg-slate-800 border border-slate-600 rounded-bl-lg p-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              {getRoleIcon(currentRole.role)}
              <span className="text-slate-300">{currentRole.role}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Shield className={`w-3 h-3 ${getZkpStatusColor(zkpSyncStatus)}`} />
              <span className={`${getZkpStatusColor(zkpSyncStatus)}`}>
                {zkpSyncStatus === 'syncing' ? 'Syncing...' : 
                 zkpSyncStatus === 'synced' ? 'Verified' : 'Failed'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {visible ? (
                <Eye className="w-3 h-3 text-green-400" />
              ) : (
                <EyeOff className="w-3 h-3 text-red-400" />
              )}
              <span className="text-slate-400">{renderTime.toFixed(1)}ms</span>
            </div>
          </div>
          
          {fallbackActive && (
            <div className="mt-1 text-xs text-amber-300">
              Fallback Mode Active
            </div>
          )}
        </div>
      )}

      {/* Fallback styling for restricted content */}
      <div className={`${fallbackActive ? 'opacity-60 pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Fallback overlay message */}
      {fallbackActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
          <div className="text-center p-4">
            <Shield className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <div className="text-sm text-amber-200 mb-1">
              Restricted Content
            </div>
            <div className="text-xs text-slate-400">
              {config.requiredRole} role required
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Current: {currentRole.role}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedOverlay;