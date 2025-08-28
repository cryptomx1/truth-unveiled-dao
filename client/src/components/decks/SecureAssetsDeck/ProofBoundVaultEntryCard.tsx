import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Lock, Unlock, Image, FileText, Music, Eye, Shield, CheckCircle } from 'lucide-react';

type AssetType = 'image' | 'pdf' | 'audio';
type VaultState = 'locked' | 'limited_preview' | 'unlocked';

interface VaultAsset {
  id: string;
  name: string;
  type: AssetType;
  size: string;
  content: string;
  requiredProofHash: string;
  circuitId: string;
}

interface ProofBoundVaultEntryCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock assets requiring ZKP proof from Deck #6 AuditTrailCard entries
const VAULT_ASSETS: VaultAsset[] = [
  {
    id: 'asset_001',
    name: 'civic_document.pdf',
    type: 'pdf',
    size: '2.4 MB',
    content: 'Confidential civic governance documentation with voting procedures and citizen protocols.',
    requiredProofHash: 'zkp_4e91a7b2...c8f3a2', // From audit trail entry 1
    circuitId: 'civic_vote_v2.1'
  },
  {
    id: 'asset_002',
    name: 'identity_verification.png',
    type: 'image',
    size: '1.8 MB',
    content: 'Secure identity verification badge with cryptographic signatures and DID confirmation.',
    requiredProofHash: 'zkp_8c2f914e...b7d5a1', // From audit trail entry 2
    circuitId: 'did_verify_v1.3'
  },
  {
    id: 'asset_003',
    name: 'secure_audio_note.mp3',
    type: 'audio',
    size: '3.1 MB',
    content: 'Encrypted audio message containing sensitive DAO operational instructions.',
    requiredProofHash: 'zkp_7d5b249a...f4e8c3', // From audit trail entry 4
    circuitId: 'civic_vote_v2.1'
  }
];

const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case 'image':
      return <Image className="w-5 h-5 text-blue-400" />;
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-400" />;
    case 'audio':
      return <Music className="w-5 h-5 text-green-400" />;
  }
};

const getAssetTypeColor = (type: AssetType): string => {
  switch (type) {
    case 'image':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'pdf':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'audio':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
};

const validateProofHash = (inputHash: string, requiredHash: string): boolean => {
  // Simple validation - in real implementation would use cryptographic verification
  return inputHash.trim() === requiredHash;
};

export const ProofBoundVaultEntryCard: React.FC<ProofBoundVaultEntryCardProps> = ({ className }) => {
  const [selectedAsset, setSelectedAsset] = useState<VaultAsset>(VAULT_ASSETS[0]);
  const [vaultState, setVaultState] = useState<VaultState>('locked');
  const [proofInput, setProofInput] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ProofBoundVaultEntryCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ProofBoundVaultEntryCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play vault access message on mount
          const utterance = new SpeechSynthesisUtterance("Vault access initiated.");
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  const playUnlockTTS = () => {
    if (!ttsStatus.isReady) return;
    
    const utterance = new SpeechSynthesisUtterance("Asset unlocked with ZKP.");
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleUnlockAttempt = async () => {
    const unlockStart = performance.now();
    
    if (!validateProofHash(proofInput, selectedAsset.requiredProofHash)) {
      setVaultState('locked');
      return;
    }

    setIsUnlocking(true);
    setVaultState('limited_preview');

    // Simulate ZKP verification delay (2.5 seconds)
    setTimeout(() => {
      setVaultState('unlocked');
      setIsUnlocking(false);
      playUnlockTTS();
      
      const unlockTime = performance.now() - unlockStart;
      if (unlockTime > 50) {
        console.warn(`Unlock transition time: ${unlockTime.toFixed(2)}ms (exceeds 50ms target)`);
      }
    }, 2500);
  };

  const handleAssetChange = (asset: VaultAsset) => {
    setSelectedAsset(asset);
    setVaultState('locked');
    setProofInput('');
    setIsUnlocking(false);
  };

  const handleReset = () => {
    setVaultState('locked');
    setProofInput('');
    setIsUnlocking(false);
  };

  const getVaultStatusIcon = () => {
    switch (vaultState) {
      case 'unlocked':
        return <Unlock className="w-4 h-4 text-green-400" />;
      case 'limited_preview':
        return <Eye className="w-4 h-4 text-amber-400" />;
      default:
        return <Lock className="w-4 h-4 text-red-400" />;
    }
  };

  const getVaultStatusText = () => {
    switch (vaultState) {
      case 'unlocked':
        return 'Fully Unlocked';
      case 'limited_preview':
        return 'Limited Preview';
      default:
        return 'Locked';
    }
  };

  const getVaultStatusColor = () => {
    switch (vaultState) {
      case 'unlocked':
        return 'text-green-400';
      case 'limited_preview':
        return 'text-amber-400';
      default:
        return 'text-red-400';
    }
  };

  const getPulseRingClass = () => {
    switch (vaultState) {
      case 'unlocked':
        return 'ring-2 ring-green-500/50 animate-pulse';
      case 'limited_preview':
        return 'ring-2 ring-amber-500/50 animate-pulse';
      default:
        return 'ring-2 ring-blue-500/50 animate-pulse';
    }
  };

  const getContentBlurClass = () => {
    switch (vaultState) {
      case 'unlocked':
        return '';
      case 'limited_preview':
        return 'filter blur-sm opacity-75';
      default:
        return 'filter blur-md opacity-50';
    }
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        getPulseRingClass(),
        className
      )}
      role="region"
      aria-label="Proof-Bound Vault Entry System"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Secure Vault Entry
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Zero-knowledge proof required for asset access
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Asset Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Select Vault Asset
          </label>
          <div className="space-y-2">
            {VAULT_ASSETS.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleAssetChange(asset)}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-colors',
                  'hover:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                  'min-h-[48px]',
                  selectedAsset.id === asset.id
                    ? 'bg-slate-700/50 border-blue-500/50'
                    : 'bg-slate-800/30 border-slate-700/50'
                )}
                disabled={isUnlocking}
                aria-label={`Select ${asset.name} for vault access`}
              >
                <div className="flex items-center gap-3">
                  {getAssetIcon(asset.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">
                      {asset.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {asset.size} • {asset.circuitId}
                    </div>
                  </div>
                  <Badge variant="outline" className={getAssetTypeColor(asset.type)}>
                    {asset.type.toUpperCase()}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vault Status */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
          aria-live="polite"
          aria-label="Vault access status"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={getVaultStatusColor()}>
              {getVaultStatusIcon()}
            </div>
            <span className={cn('text-sm font-medium', getVaultStatusColor())}>
              {getVaultStatusText()}
            </span>
          </div>
          
          <div className="text-xs text-slate-400 mb-3">
            Required Circuit: {selectedAsset.circuitId}
          </div>
          
          {isUnlocking && (
            <div className="text-xs text-amber-400 animate-pulse">
              Verifying zero-knowledge proof...
            </div>
          )}
        </div>

        {/* Proof Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            ZKP Hash (from Audit Trail)
          </label>
          <Input
            value={proofInput}
            onChange={(e) => setProofInput(e.target.value)}
            placeholder="Enter proof hash from Deck #6..."
            disabled={isUnlocking || vaultState === 'unlocked'}
            className={cn(
              'bg-slate-700/50 border-slate-600 text-slate-100',
              'placeholder:text-slate-400',
              'focus:border-blue-500 focus:ring-blue-500/20',
              'min-h-[48px]'
            )}
            aria-label="Enter zero-knowledge proof hash"
          />
          <div className="text-xs text-slate-500">
            Required: {selectedAsset.requiredProofHash}
          </div>
        </div>

        {/* Access Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleUnlockAttempt}
            disabled={isUnlocking || !proofInput.trim() || vaultState === 'unlocked'}
            className={cn(
              'flex-1 min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Unlock vault asset with proof"
          >
            {isUnlocking ? (
              <>
                <Shield className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : vaultState === 'unlocked' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Unlocked
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unlock Asset
              </>
            )}
          </Button>
          
          {vaultState !== 'locked' && (
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                'min-h-[48px] px-4',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              aria-label="Reset vault access"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Asset Preview */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            {getAssetIcon(selectedAsset.type)}
            <span className="text-sm font-medium text-slate-200">
              Asset Preview
            </span>
          </div>
          
          <div className={cn('space-y-3', getContentBlurClass())}>
            <div className="text-sm text-slate-300">
              {selectedAsset.name}
            </div>
            
            <div className="text-xs text-slate-400 leading-relaxed">
              {vaultState === 'locked' 
                ? '████████ ██████████ ████ ██████████ ████████ ██████████'
                : selectedAsset.content
              }
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <div className="text-xs text-slate-500">
                Size: {selectedAsset.size}
              </div>
              <div className="text-xs text-slate-500">
                Type: {selectedAsset.type.toUpperCase()}
              </div>
            </div>
          </div>
          
          {vaultState === 'locked' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
              <div className="text-center">
                <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-400">ZKP Required</div>
              </div>
            </div>
          )}
        </div>

        {/* Vault Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Vault Security
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Assets encrypted with circuit-specific keys</div>
            <div>• Zero-knowledge proofs verify access rights</div>
            <div>• Audit trail maintains immutable access log</div>
            <div>• Content revealed only after proof validation</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Cryptographically secured asset vault
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default ProofBoundVaultEntryCard;
