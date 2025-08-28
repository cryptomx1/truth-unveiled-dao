import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, Send, CheckCircle, AlertCircle, Loader2, Shield, User, FileText } from 'lucide-react';

type TransferStatus = 'idle' | 'validating' | 'transferring' | 'completed' | 'failed';
type AssetType = 'civic_document' | 'identity_verification' | 'secure_audio';

interface TransferAsset {
  id: string;
  name: string;
  type: AssetType;
  requiredProofHash: string;
  size: string;
}

interface TransferResult {
  transactionId: string;
  recipientDID: string;
  assetId: string;
  timestamp: Date;
  status: 'success' | 'failed';
}

interface CivicAssetTransferCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock transferable assets linked to previous decks
const TRANSFERABLE_ASSETS: TransferAsset[] = [
  {
    id: 'civic_doc_001',
    name: 'civic_document.pdf',
    type: 'civic_document',
    requiredProofHash: 'zkp_4e91a7b2...c8f3a2', // From Deck #6 audit trail
    size: '2.4 MB'
  },
  {
    id: 'identity_ver_002',
    name: 'identity_verification.png',
    type: 'identity_verification',
    requiredProofHash: 'zkp_8c2f914e...b7d5a1', // From Deck #6 audit trail
    size: '1.8 MB'
  },
  {
    id: 'audio_note_003',
    name: 'secure_audio_note.mp3',
    type: 'secure_audio',
    requiredProofHash: 'zkp_7d5b249a...f4e8c3', // From Deck #6 audit trail
    size: '3.1 MB'
  }
];

// Known valid proof hashes from Deck #6 AuditTrailCard
const VALID_PROOF_HASHES = [
  'zkp_4e91a7b2...c8f3a2',
  'zkp_8c2f914e...b7d5a1',
  'zkp_2a4c683f...e9b2c7',
  'zkp_7d5b249a...f4e8c3',
  'zkp_9f3e572b...a6d4b8',
  'zkp_1b8c496d...c2f7a9',
  'zkp_6a4f829e...d5b3c1',
  'zkp_3c7d195a...e8f4b6',
  'zkp_5e2a738f...b9c6d4',
  'zkp_8b6f142c...a3e7d5'
];

const validateDID = (did: string): boolean => {
  // Basic DID format validation: did:method:identifier
  const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/;
  return didRegex.test(did) && did.length >= 20;
};

const validateProofHash = (hash: string, requiredHash: string): boolean => {
  return hash.trim() === requiredHash && VALID_PROOF_HASHES.includes(hash);
};

const generateTransactionId = (): string => {
  return `txn_${Math.random().toString(36).substring(2, 10)}`;
};

const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case 'civic_document':
      return <FileText className="w-4 h-4 text-blue-400" />;
    case 'identity_verification':
      return <Shield className="w-4 h-4 text-green-400" />;
    case 'secure_audio':
      return <User className="w-4 h-4 text-purple-400" />;
  }
};

export const CivicAssetTransferCard: React.FC<CivicAssetTransferCardProps> = ({ className }) => {
  const [selectedAsset, setSelectedAsset] = useState<TransferAsset>(TRANSFERABLE_ASSETS[0]);
  const [recipientDID, setRecipientDID] = useState('');
  const [proofHash, setProofHash] = useState('');
  const [transferStatus, setTransferStatus] = useState<TransferStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CivicAssetTransferCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CivicAssetTransferCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play transfer initialization message on mount
          const utterance = new SpeechSynthesisUtterance("Secure transfer initialized.");
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

  const playResultTTS = (result: TransferResult) => {
    if (!ttsStatus.isReady) return;
    
    const message = result.status === 'success' 
      ? `Transfer completed successfully. Transaction ID: ${result.transactionId}`
      : 'Transfer failed. Please verify credentials and try again.';
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleTransfer = async () => {
    const transferStart = performance.now();
    
    // Validation phase
    setTransferStatus('validating');
    setProgress(0);
    setTransferResult(null);

    // Validate inputs
    const validationStart = performance.now();
    const isDIDValid = validateDID(recipientDID);
    const isProofValid = validateProofHash(proofHash, selectedAsset.requiredProofHash);
    
    const validationTime = performance.now() - validationStart;
    if (validationTime > 100) {
      console.warn(`Validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
    }

    if (!isDIDValid || !isProofValid) {
      setTransferStatus('failed');
      setTransferResult({
        transactionId: '',
        recipientDID: recipientDID,
        assetId: selectedAsset.id,
        timestamp: new Date(),
        status: 'failed'
      });
      playResultTTS({
        transactionId: '',
        recipientDID: recipientDID,
        assetId: selectedAsset.id,
        timestamp: new Date(),
        status: 'failed'
      });
      return;
    }

    // Transfer phase
    setTransferStatus('transferring');
    
    // Simulate transfer progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 8;
      });
    }, 200);

    // Simulate transfer delay
    setTimeout(() => {
      clearInterval(progressInterval);
      
      const result: TransferResult = {
        transactionId: generateTransactionId(),
        recipientDID: recipientDID,
        assetId: selectedAsset.id,
        timestamp: new Date(),
        status: 'success'
      };
      
      setTransferResult(result);
      setTransferStatus('completed');
      setProgress(100);
      
      playResultTTS(result);
      
      const totalTime = performance.now() - transferStart;
      if (totalTime > 200) {
        console.warn(`Total transfer time: ${totalTime.toFixed(2)}ms (exceeds 200ms target)`);
      }
    }, 2500);
  };

  const handleReset = () => {
    setTransferStatus('idle');
    setProgress(0);
    setTransferResult(null);
    setRecipientDID('');
    setProofHash('');
  };

  const getStatusColor = () => {
    switch (transferStatus) {
      case 'validating':
      case 'transferring':
        return 'text-amber-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getStatusIcon = () => {
    switch (transferStatus) {
      case 'validating':
      case 'transferring':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <ArrowRightLeft className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (transferStatus) {
      case 'validating':
        return 'Validating Credentials...';
      case 'transferring':
        return 'Transferring Asset...';
      case 'completed':
        return 'Transfer Completed';
      case 'failed':
        return 'Transfer Failed';
      default:
        return 'Ready to Transfer';
    }
  };

  const getPulseRingClass = () => {
    switch (transferStatus) {
      case 'completed':
        return 'ring-2 ring-green-500/50 animate-pulse';
      case 'failed':
        return 'ring-2 ring-red-500/50 animate-pulse';
      case 'validating':
      case 'transferring':
        return 'ring-2 ring-amber-500/50 animate-pulse';
      default:
        return 'ring-2 ring-blue-500/50 animate-pulse';
    }
  };

  const canTransfer = () => {
    return transferStatus === 'idle' && 
           validateDID(recipientDID) && 
           validateProofHash(proofHash, selectedAsset.requiredProofHash);
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
      aria-label="Civic Asset Transfer System"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            Asset Transfer
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Secure civic asset transfer with zero-knowledge verification
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Asset Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Select Asset to Transfer
          </label>
          <Select
            value={selectedAsset.id}
            onValueChange={(value) => {
              const asset = TRANSFERABLE_ASSETS.find(a => a.id === value);
              if (asset) setSelectedAsset(asset);
            }}
            disabled={transferStatus === 'validating' || transferStatus === 'transferring'}
          >
            <SelectTrigger 
              className={cn(
                'bg-slate-700/50 border-slate-600 text-slate-100',
                'focus:border-blue-500 focus:ring-blue-500/20',
                'min-h-[48px]'
              )}
              aria-label="Select asset to transfer"
            >
              <SelectValue placeholder="Choose asset" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {TRANSFERABLE_ASSETS.map((asset) => (
                <SelectItem 
                  key={asset.id} 
                  value={asset.id}
                  className="text-slate-100 focus:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    {getAssetIcon(asset.type)}
                    <span>{asset.name}</span>
                    <span className="text-xs text-slate-400">({asset.size})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipient DID Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Recipient DID
          </label>
          <Input
            value={recipientDID}
            onChange={(e) => setRecipientDID(e.target.value)}
            placeholder="did:truth:ABC123..."
            disabled={transferStatus === 'validating' || transferStatus === 'transferring'}
            className={cn(
              'bg-slate-700/50 border-slate-600 text-slate-100',
              'placeholder:text-slate-400',
              'focus:border-blue-500 focus:ring-blue-500/20',
              'min-h-[48px]',
              recipientDID && !validateDID(recipientDID) && 'border-red-500/50'
            )}
            aria-label="Enter recipient decentralized identifier"
          />
          {recipientDID && !validateDID(recipientDID) && (
            <p className="text-xs text-red-400">
              Please enter a valid DID format (did:method:identifier)
            </p>
          )}
        </div>

        {/* ZKP Hash Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            ZKP Authorization Hash
          </label>
          <Input
            value={proofHash}
            onChange={(e) => setProofHash(e.target.value)}
            placeholder="Enter proof hash from Deck #6..."
            disabled={transferStatus === 'validating' || transferStatus === 'transferring'}
            className={cn(
              'bg-slate-700/50 border-slate-600 text-slate-100',
              'placeholder:text-slate-400',
              'focus:border-blue-500 focus:ring-blue-500/20',
              'min-h-[48px]',
              proofHash && !validateProofHash(proofHash, selectedAsset.requiredProofHash) && 'border-red-500/50'
            )}
            aria-label="Enter zero-knowledge proof hash for authorization"
          />
          <div className="text-xs text-slate-500">
            Required: {selectedAsset.requiredProofHash}
          </div>
          {proofHash && !validateProofHash(proofHash, selectedAsset.requiredProofHash) && (
            <p className="text-xs text-red-400">
              Hash must match the required proof for this asset
            </p>
          )}
        </div>

        {/* Transfer Status */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
          aria-live="polite"
          aria-label="Transfer status"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
          
          {(transferStatus === 'validating' || transferStatus === 'transferring') && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-slate-400">
                Progress: {progress}%
              </div>
            </div>
          )}
        </div>

        {/* Transfer Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleTransfer}
            disabled={!canTransfer() || transferStatus === 'validating' || transferStatus === 'transferring'}
            className={cn(
              'flex-1 min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Initiate secure asset transfer"
          >
            {transferStatus === 'validating' || transferStatus === 'transferring' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {transferStatus === 'validating' ? 'Validating...' : 'Transferring...'}
              </>
            ) : transferStatus === 'completed' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transfer Asset
              </>
            )}
          </Button>
          
          {(transferStatus === 'completed' || transferStatus === 'failed') && (
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                'min-h-[48px] px-4',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              aria-label="Reset transfer interface"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Transfer Result */}
        {transferResult && (transferStatus === 'completed' || transferStatus === 'failed') && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              {transferResult.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={cn(
                'text-sm font-medium',
                transferResult.status === 'success' ? 'text-green-400' : 'text-red-400'
              )}>
                Transfer {transferResult.status === 'success' ? 'Successful' : 'Failed'}
              </span>
            </div>
            
            {transferResult.status === 'success' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">Transaction ID:</div>
                  <div className="text-sm text-green-300 font-mono bg-slate-700/30 rounded px-2 py-1">
                    {transferResult.transactionId}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">Recipient:</div>
                  <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                    {transferResult.recipientDID}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">Asset:</div>
                  <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                    {selectedAsset.name}
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                  Completed at: {transferResult.timestamp.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transfer Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Transfer Security
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• ZKP verification ensures authorized transfers only</div>
            <div>• DID validation confirms recipient identity</div>
            <div>• Asset integrity maintained during transfer</div>
            <div>• All transfers logged on immutable ledger</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Secure civic asset transfer protocol
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default CivicAssetTransferCard;
