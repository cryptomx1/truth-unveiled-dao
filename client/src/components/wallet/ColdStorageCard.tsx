// ColdStorageCard.tsx - Phase III-A Step 4/6
// Deep vault crypto locking interface with proof-of-preservation ZKP badges

import { useState, useEffect } from 'react';
import { Vault, Lock, Shield, Clock, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';

interface VaultAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  lockDate: Date;
  unlockDate: Date;
  zkpProof: string;
  preservationStatus: 'active' | 'pending' | 'expired' | 'compromised';
  transferDelay: number; // in hours
}

interface ColdStorageStatus {
  totalLocked: number;
  assetsCount: number;
  vaultHealth: number;
  lastProofUpdate: Date;
  securityLevel: 'maximum' | 'high' | 'medium' | 'low';
}

export const ColdStorageCard = () => {
  const [vaultAssets, setVaultAssets] = useState<VaultAsset[]>([
    {
      id: 'cs_001',
      symbol: 'TP',
      name: 'Truth Points',
      amount: 5000,
      lockDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days from now
      zkpProof: '0x8f3a2c1e9b7d5f3a8c2e6d1b4f9a7c3e',
      preservationStatus: 'active',
      transferDelay: 72
    },
    {
      id: 'cs_002', 
      symbol: 'CC',
      name: 'Contribution Credits',
      amount: 2500,
      lockDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
      zkpProof: '0x2b4f6a8c0e2d5f7a9c1e3b6d8f0a2c4e',
      preservationStatus: 'active',
      transferDelay: 48
    },
    {
      id: 'cs_003',
      symbol: 'CIV',
      name: 'Civic Governance',
      amount: 150,
      lockDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      zkpProof: '0x4e6c8a0d2f5b7d9f1a3c5e7b9d1f3a5c',
      preservationStatus: 'pending',
      transferDelay: 24
    }
  ]);

  const [storageStatus, setStorageStatus] = useState<ColdStorageStatus>({
    totalLocked: 7650,
    assetsCount: 3,
    vaultHealth: 97.8,
    lastProofUpdate: new Date(),
    securityLevel: 'maximum'
  });

  const [selectedAsset, setSelectedAsset] = useState<VaultAsset | null>(null);
  const [transferInProgress, setTransferInProgress] = useState<string | null>(null);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate proof-of-preservation updates
    const proofUpdateInterval = setInterval(() => {
      setVaultAssets(prev => prev.map(asset => ({
        ...asset,
        preservationStatus: Math.random() > 0.1 ? 'active' : 'pending' as VaultAsset['preservationStatus']
      })));
      
      setStorageStatus(prev => ({
        ...prev,
        vaultHealth: 95 + Math.random() * 5,
        lastProofUpdate: new Date()
      }));
    }, 10000);

    console.log('🔇 TTS disabled: "Cold Storage interface ready"');
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`ColdStorageCard render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }

    return () => clearInterval(proofUpdateInterval);
  }, []);

  const initiateTransfer = async (assetId: string) => {
    const validationStart = performance.now();
    
    setTransferInProgress(assetId);
    const asset = vaultAssets.find(a => a.id === assetId);
    
    if (asset) {
      // Simulate signer delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Transfer initiated for ${asset.name}: ${asset.transferDelay}h delay required`);
      console.log('🔇 TTS disabled: "Transfer initiated with signer delay"');
      
      setTransferInProgress(null);
    }

    const validationEnd = performance.now();
    const validationTime = validationEnd - validationStart;
    
    if (validationTime > 100) {
      console.log(`ColdStorageCard validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
    }
  };

  const getStatusColor = (status: VaultAsset['preservationStatus']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-amber-400';
      case 'expired': return 'text-orange-400';
      case 'compromised': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: VaultAsset['preservationStatus']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'expired': return <AlertTriangle className="w-3 h-3" />;
      case 'compromised': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getSecurityColor = (level: ColdStorageStatus['securityLevel']) => {
    switch (level) {
      case 'maximum': return 'text-green-400';
      case 'high': return 'text-blue-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const formatTimeUntilUnlock = (unlockDate: Date) => {
    const now = new Date();
    const diffMs = unlockDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days`;
    } else {
      return 'Unlocked';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-900 rounded-lg">
            <Vault className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Cold Storage</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{renderTime.toFixed(1)}ms</div>
          <Lock className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      {/* Storage Status */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Vault Status</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Total Locked</div>
            <div className="text-lg font-semibold text-slate-100">
              {storageStatus.totalLocked.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">{storageStatus.assetsCount} assets</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Vault Health</div>
            <div className="text-lg font-semibold text-green-400">
              {storageStatus.vaultHealth.toFixed(1)}%
            </div>
            <div className={`text-xs ${getSecurityColor(storageStatus.securityLevel)}`}>
              {storageStatus.securityLevel}
            </div>
          </div>
        </div>
      </div>

      {/* ZKP Proof Status */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Proof-of-Preservation</div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-200">ZKP Verified</span>
            </div>
            <div className="text-xs text-slate-400">
              Updated: {storageStatus.lastProofUpdate.toLocaleTimeString()}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            All vault assets protected by zero-knowledge preservation proofs
          </div>
        </div>
      </div>

      {/* Locked Assets */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Locked Assets</div>
        <div className="space-y-3">
          {vaultAssets.map((asset) => (
            <div 
              key={asset.id} 
              className={`bg-slate-800 rounded-lg p-3 border ${
                selectedAsset?.id === asset.id ? 'border-blue-500' : 'border-slate-700'
              } cursor-pointer transition-colors`}
              onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-200">{asset.symbol}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{asset.name}</div>
                    <div className="text-xs text-slate-400">{asset.amount.toLocaleString()} {asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${getStatusColor(asset.preservationStatus)}`}>
                    {getStatusIcon(asset.preservationStatus)}
                    <span className="text-xs font-medium capitalize">{asset.preservationStatus}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatTimeUntilUnlock(asset.unlockDate)}
                  </div>
                </div>
              </div>

              {/* Expanded Asset Details */}
              {selectedAsset?.id === asset.id && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Lock Date:</span>
                      <span className="text-slate-300">{asset.lockDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Unlock Date:</span>
                      <span className="text-slate-300">{asset.unlockDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Transfer Delay:</span>
                      <span className="text-slate-300">{asset.transferDelay}h</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">ZKP Proof:</span>
                      <span className="text-slate-300 font-mono">{asset.zkpProof.slice(0, 12)}...</span>
                    </div>
                  </div>

                  {/* Transfer Control */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateTransfer(asset.id);
                    }}
                    disabled={transferInProgress === asset.id || asset.preservationStatus !== 'active'}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                  >
                    {transferInProgress === asset.id ? (
                      <>
                        <Clock className="w-3 h-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-3 h-3" />
                        Initiate Transfer
                      </>
                    )}
                  </button>
                  
                  {asset.preservationStatus !== 'active' && (
                    <div className="mt-2 p-2 bg-amber-900/20 border border-amber-600 rounded text-xs text-amber-200">
                      Transfer unavailable: Asset proof verification required
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Signer Delay Notice */}
      <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-200">Signer Delay Active</span>
        </div>
        <div className="text-xs text-blue-200">
          All vault transfers require signature delay for enhanced security.
          Transfer times vary by asset type and preservation status.
        </div>
      </div>
    </div>
  );
};

export default ColdStorageCard;