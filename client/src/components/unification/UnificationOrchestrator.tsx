// UnificationOrchestrator.tsx - Phase III-A Step 6/6 Final Build
// Synchronize PillarLandingCards, Truth Point Stack, Wallet Stack, and RoleBasedOverlay
// Single orchestrated civic interface with DID role-aware routing

import { useState, useEffect } from 'react';
import { Settings, Shield, Zap, Users, Globe, Activity } from 'lucide-react';

// Phase III-A Component Imports
import { ProtocolValidator } from '@/components/phase3a';
import PillarLandingCard_Health from '@/components/phase3a/PillarLandingCard_Health';
import PillarLandingCard_Education from '@/components/phase3a/PillarLandingCard_Education';
import PillarLandingCard_Environment from '@/components/phase3a/PillarLandingCard_Environment';
import PillarLandingCard_Security from '@/components/phase3a/PillarLandingCard_Security';
import PillarLandingCard_Justice from '@/components/phase3a/PillarLandingCard_Justice';
import { TruthPointCalculator, PointInflationGuard } from '@/components/truth';
import { WalletOverviewCard, ColdStorageCard, TransactionStabilityCard } from '@/components/wallet';
import { RoleBasedOverlay, UrgencyTag, OverlayAuditTrail } from '@/components/overlay';
import type { DIDRole, OverlayConfig } from '@/components/overlay';

// Unification Utilities
import { UnificationLog } from './UnificationLog';
import { SyncLoadBalancer } from './SyncLoadBalancer';

interface UnificationConfig {
  enableStressTest: boolean;
  maxModules: number;
  targetInteractions: number;
  syncThreshold: number;
  pushbackThreshold: number;
  roleAwareRouting: boolean;
}

interface ModuleState {
  id: string;
  name: string;
  type: 'pillar' | 'truth' | 'wallet' | 'overlay';
  status: 'active' | 'syncing' | 'failed' | 'fallback';
  renderTime: number;
  syncTime: number;
  lastSync: Date;
  zkpVerified: boolean;
  zkpHash: string;
  interactions: number;
}

interface UnificationMetrics {
  totalModules: number;
  activeModules: number;
  syncedModules: number;
  failedModules: number;
  averageRenderTime: number;
  averageSyncTime: number;
  totalInteractions: number;
  zkpSuccessRate: number;
  desyncPercentage: number;
  pathBTriggered: boolean;
}

export const UnificationOrchestrator = () => {
  const [config] = useState<UnificationConfig>({
    enableStressTest: true,
    maxModules: 12,
    targetInteractions: 1500,
    syncThreshold: 20,
    pushbackThreshold: 20,
    roleAwareRouting: true
  });

  const [currentRole, setCurrentRole] = useState<DIDRole>({
    id: 'did:civic:0x7f3e2d1a8c9b5f2e',
    role: 'Citizen',
    permissions: ['read_public', 'vote_proposals', 'submit_feedback'],
    zkpVerified: true,
    zkpHash: '0x4f3e2d1a8c9b5f2e7d4a6b8c',
    lastVerification: new Date()
  });

  const [modules, setModules] = useState<ModuleState[]>([]);
  const [metrics, setMetrics] = useState<UnificationMetrics>({
    totalModules: 0,
    activeModules: 0,
    syncedModules: 0,
    failedModules: 0,
    averageRenderTime: 0,
    averageSyncTime: 0,
    totalInteractions: 0,
    zkpSuccessRate: 100,
    desyncPercentage: 0,
    pathBTriggered: false
  });

  const [renderTime, setRenderTime] = useState<number>(0);
  const [stressTestActive, setStressTestActive] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [syncBalancer] = useState(() => new SyncLoadBalancer());
  const [unificationLog] = useState(() => new UnificationLog());

  useEffect(() => {
    const startTime = performance.now();
    
    // Initialize unified modules
    initializeUnifiedModules();
    
    // Start orchestration
    startUnificationOrchestration();
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`UnificationOrchestrator render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }
    
    unificationLog.log('system', 'UnificationOrchestrator initialized', {
      renderTime: latency,
      targetMet: latency < 125,
      moduleCount: 12
    });

    console.log('🔇 TTS disabled: "Unification orchestrator ready"');
  }, []);

  const initializeUnifiedModules = () => {
    const moduleDefinitions: Omit<ModuleState, 'renderTime' | 'syncTime' | 'lastSync' | 'interactions'>[] = [
      // Pillar Landing Cards
      { id: 'pillar_health', name: 'Health Pillar', type: 'pillar', status: 'active', zkpVerified: true, zkpHash: '0x1a2b3c4d5e6f7890' },
      { id: 'pillar_education', name: 'Education Pillar', type: 'pillar', status: 'active', zkpVerified: true, zkpHash: '0x2b3c4d5e6f78901a' },
      { id: 'pillar_environment', name: 'Environment Pillar', type: 'pillar', status: 'active', zkpVerified: true, zkpHash: '0x3c4d5e6f78901a2b' },
      { id: 'pillar_security', name: 'Security Pillar', type: 'pillar', status: 'active', zkpVerified: true, zkpHash: '0x4d5e6f78901a2b3c' },
      { id: 'pillar_governance', name: 'Governance Pillar', type: 'pillar', status: 'active', zkpVerified: true, zkpHash: '0x5e6f78901a2b3c4d' },
      
      // Truth Point Stack
      { id: 'truth_calculator', name: 'Truth Point Calculator', type: 'truth', status: 'active', zkpVerified: true, zkpHash: '0x6f78901a2b3c4d5e' },
      { id: 'inflation_guard', name: 'Point Inflation Guard', type: 'truth', status: 'active', zkpVerified: true, zkpHash: '0x78901a2b3c4d5e6f' },
      
      // Wallet Stack
      { id: 'wallet_overview', name: 'Wallet Overview', type: 'wallet', status: 'active', zkpVerified: true, zkpHash: '0x8901a2b3c4d5e6f7' },
      { id: 'cold_storage', name: 'Cold Storage', type: 'wallet', status: 'active', zkpVerified: true, zkpHash: '0x901a2b3c4d5e6f78' },
      { id: 'transaction_stability', name: 'Transaction Stability', type: 'wallet', status: 'active', zkpVerified: true, zkpHash: '0xa01b2c3d4e5f6789' },
      
      // Overlay Stack
      { id: 'role_overlay', name: 'Role-Based Overlay', type: 'overlay', status: 'active', zkpVerified: true, zkpHash: '0xb01c2d3e4f567890' },
      { id: 'audit_trail', name: 'Overlay Audit Trail', type: 'overlay', status: 'active', zkpVerified: true, zkpHash: '0xc01d2e3f45678901' }
    ];

    const initializedModules = moduleDefinitions.map(module => ({
      ...module,
      renderTime: Math.random() * 100 + 25, // 25-125ms
      syncTime: Math.random() * 50 + 25, // 25-75ms
      lastSync: new Date(),
      interactions: Math.floor(Math.random() * 100)
    }));

    setModules(initializedModules);
    updateMetrics(initializedModules);
  };

  const startUnificationOrchestration = () => {
    // Start background sync orchestration
    const orchestrationInterval = setInterval(() => {
      performUnifiedSync();
    }, 2000);

    // Start stress test if enabled
    if (config.enableStressTest) {
      setTimeout(() => {
        runStressTest();
      }, 5000);
    }

    // Cleanup interval on unmount
    return () => clearInterval(orchestrationInterval);
  };

  const performUnifiedSync = () => {
    setModules(prevModules => {
      const updatedModules = prevModules.map(module => {
        const syncStartTime = performance.now();
        
        // Simulate sync with 95% success rate
        const syncSuccess = Math.random() > 0.05;
        const zkpSuccess = Math.random() > 0.1; // 90% ZKP success rate
        
        const syncEndTime = performance.now();
        const syncTime = syncEndTime - syncStartTime;
        
        return {
          ...module,
          status: syncSuccess ? 'active' : 'failed',
          syncTime,
          lastSync: new Date(),
          zkpVerified: zkpSuccess,
          interactions: module.interactions + Math.floor(Math.random() * 5)
        };
      });

      updateMetrics(updatedModules);
      
      // Check for Path B trigger
      const failedCount = updatedModules.filter(m => m.status === 'failed').length;
      const desyncPercentage = (failedCount / updatedModules.length) * 100;
      
      if (desyncPercentage > config.pushbackThreshold) {
        triggerPathBFallback(updatedModules);
      }

      return updatedModules;
    });
  };

  const runStressTest = () => {
    setStressTestActive(true);
    
    unificationLog.log('system', 'Starting stress test', {
      targetModules: config.maxModules,
      targetInteractions: config.targetInteractions,
      duration: '30 seconds'
    });

    const stressTestInterval = setInterval(() => {
      // Simulate rapid interactions
      setModules(prevModules => {
        return prevModules.map(module => ({
          ...module,
          interactions: module.interactions + Math.floor(Math.random() * 10),
          renderTime: Math.random() * 150 + 50, // Higher stress render times
          syncTime: Math.random() * 100 + 25
        }));
      });
    }, 100);

    // End stress test after 30 seconds
    setTimeout(() => {
      clearInterval(stressTestInterval);
      setStressTestActive(false);
      
      unificationLog.log('system', 'Stress test completed', {
        duration: '30 seconds',
        status: 'completed'
      });
    }, 30000);
  };

  const triggerPathBFallback = (modules: ModuleState[]) => {
    const failedModules = modules.filter(m => m.status === 'failed');
    
    unificationLog.log('system', 'Path B fallback triggered', {
      failedModules: failedModules.length,
      desyncPercentage: (failedModules.length / modules.length) * 100,
      threshold: config.pushbackThreshold
    });

    // Activate fallback states
    setModules(prevModules => 
      prevModules.map(module => ({
        ...module,
        status: module.status === 'failed' ? 'fallback' : module.status
      }))
    );

    console.log(`⚠️ Path B fallback triggered: ${(failedModules.length / modules.length * 100).toFixed(1)}% desync`);
  };

  const updateMetrics = (moduleList: ModuleState[]) => {
    const totalModules = moduleList.length;
    const activeModules = moduleList.filter(m => m.status === 'active').length;
    const syncedModules = moduleList.filter(m => m.zkpVerified).length;
    const failedModules = moduleList.filter(m => m.status === 'failed').length;
    
    const averageRenderTime = moduleList.reduce((sum, m) => sum + m.renderTime, 0) / totalModules;
    const averageSyncTime = moduleList.reduce((sum, m) => sum + m.syncTime, 0) / totalModules;
    const totalInteractions = moduleList.reduce((sum, m) => sum + m.interactions, 0);
    
    const zkpSuccessRate = (syncedModules / totalModules) * 100;
    const desyncPercentage = (failedModules / totalModules) * 100;
    const pathBTriggered = desyncPercentage > config.pushbackThreshold;

    setMetrics({
      totalModules,
      activeModules,
      syncedModules,
      failedModules,
      averageRenderTime,
      averageSyncTime,
      totalInteractions,
      zkpSuccessRate,
      desyncPercentage,
      pathBTriggered
    });
  };

  const getModulesByType = (type: ModuleState['type']) => {
    return modules.filter(module => module.type === type);
  };

  const getStatusColor = (status: ModuleState['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'syncing': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'fallback': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const getModuleIcon = (type: ModuleState['type']) => {
    switch (type) {
      case 'pillar': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'truth': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'wallet': return <Shield className="w-4 h-4 text-green-400" />;
      case 'overlay': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const renderModuleContent = (moduleId: string) => {
    switch (moduleId) {
      case 'pillar_health': return <PillarLandingCard_Health />;
      case 'pillar_education': return <PillarLandingCard_Education />;
      case 'pillar_environment': return <PillarLandingCard_Environment />;
      case 'pillar_security': return <PillarLandingCard_Security />;
      case 'pillar_governance': return <PillarLandingCard_Justice />;
      case 'truth_calculator': return <TruthPointCalculator />;
      case 'inflation_guard': return <PointInflationGuard />;
      case 'wallet_overview': return <WalletOverviewCard />;
      case 'cold_storage': return <ColdStorageCard />;
      case 'transaction_stability': return <TransactionStabilityCard />;
      case 'role_overlay': return (
        <RoleBasedOverlay
          config={{
            id: 'unified_demo',
            requiredRole: currentRole.role,
            fallbackVisible: true,
            testingMode: true,
            emergencyOverride: false
          }}
          userRole={currentRole}
        >
          <div className="p-4 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-100">Unified Role Access</h3>
            <p className="text-sm text-slate-300">Role-based content for {currentRole.role}</p>
          </div>
        </RoleBasedOverlay>
      );
      case 'audit_trail': return <OverlayAuditTrail maxEvents={10} autoRefresh={true} />;
      default: return <div className="p-4 text-slate-400">Module not found</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Settings className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Unification Orchestrator</h1>
            <div className="text-sm text-slate-400">
              Phase III-A Step 6/6 - Unified Civic Interface
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-400">
            Render: {renderTime.toFixed(1)}ms
          </div>
          {stressTestActive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs text-amber-400">Stress Test Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Protocol Validator */}
      <div className="mb-8">
        <ProtocolValidator />
      </div>

      {/* Unified Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Total Modules</div>
          <div className="text-2xl font-bold text-slate-100">{metrics.totalModules}</div>
          <div className="text-xs text-green-400">
            {metrics.activeModules} active
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">ZKP Success</div>
          <div className="text-2xl font-bold text-slate-100">{metrics.zkpSuccessRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-300">
            {metrics.syncedModules}/{metrics.totalModules} synced
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Avg Render</div>
          <div className="text-2xl font-bold text-slate-100">{metrics.averageRenderTime.toFixed(0)}ms</div>
          <div className={`text-xs ${metrics.averageRenderTime < 125 ? 'text-green-400' : 'text-red-400'}`}>
            Target: &lt;125ms
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Interactions</div>
          <div className="text-2xl font-bold text-slate-100">{metrics.totalInteractions}</div>
          <div className="text-xs text-slate-300">
            Target: {config.targetInteractions}
          </div>
        </div>
      </div>

      {/* Path B Alert */}
      {metrics.pathBTriggered && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <UrgencyTag 
              level="critical" 
              message="Path B Fallback Active" 
              overlayId="path_b_alert"
            />
            <span className="text-red-200">
              Desync: {metrics.desyncPercentage.toFixed(1)}% (exceeds {config.pushbackThreshold}% threshold)
            </span>
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {modules.map((module) => (
          <RoleBasedOverlay
            key={module.id}
            config={{
              id: module.id,
              requiredRole: config.roleAwareRouting ? 'Citizen' : 'any',
              fallbackVisible: true,
              testingMode: false,
              emergencyOverride: false
            }}
            userRole={currentRole}
          >
            <div 
              className={`bg-slate-800 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedModule === module.id ? 'border-blue-500 bg-slate-700' : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getModuleIcon(module.type)}
                  <span className="text-sm font-medium text-slate-200">{module.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${getStatusColor(module.status)}`}>
                    {module.status.toUpperCase()}
                  </span>
                  {module.zkpVerified ? (
                    <Shield className="w-3 h-3 text-green-400" />
                  ) : (
                    <Shield className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Render:</span>
                  <span className={`${module.renderTime < 125 ? 'text-green-400' : 'text-red-400'}`}>
                    {module.renderTime.toFixed(1)}ms
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Sync:</span>
                  <span className={`${module.syncTime < 100 ? 'text-green-400' : 'text-amber-400'}`}>
                    {module.syncTime.toFixed(1)}ms
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Interactions:</span>
                  <span className="text-slate-300">{module.interactions}</span>
                </div>
              </div>

              {selectedModule === module.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-400 mb-2">Module Content:</div>
                  <div className="max-h-40 overflow-y-auto">
                    {renderModuleContent(module.id)}
                  </div>
                </div>
              )}
            </div>
          </RoleBasedOverlay>
        ))}
      </div>

      {/* Role Selector */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">Current Role:</span>
          <div className="flex gap-2">
            {(['Citizen', 'Delegate', 'Governor'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setCurrentRole(prev => ({ ...prev, role }))}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  currentRole.role === role 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            DID: {currentRole.id}
          </div>
        </div>
      </div>

      {/* Sync Load Balancer Status */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-200">Sync Load Balancer</h3>
          <div className="text-xs text-slate-400">
            Load: {syncBalancer.getCurrentLoad().toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(syncBalancer.getCurrentLoad(), 100)}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {syncBalancer.getCurrentLoad() > 15 ? 'Load balancing active' : 'Normal operation'}
        </div>
      </div>
    </div>
  );
};

export default UnificationOrchestrator;