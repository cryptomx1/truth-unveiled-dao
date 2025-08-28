import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PenTool, CheckCircle, Clock, Hash, User, Shield } from 'lucide-react';

interface SignatureData {
  signerId: string;
  signerDID: string;
  signatureHash: string;
  blockTimestamp: Date;
  assetId: string;
  verificationStatus: 'verified' | 'pending' | 'invalid';
}

interface AssetSignatureViewerCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock signature data linked to Deck #6 AuditTrailCard entries
const MOCK_SIGNATURES: SignatureData[] = [
  {
    signerId: 'signer_civic_001',
    signerDID: 'did:truth:1B2M2Y8AsgTpgAmY7PhCfg',
    signatureHash: 'zkp_4e91a7b2...c8f3a2', // Matches audit trail entry 1
    blockTimestamp: new Date(Date.now() - 180000), // 3 minutes ago
    assetId: 'civic_document.pdf',
    verificationStatus: 'verified'
  },
  {
    signerId: 'signer_identity_002',
    signerDID: 'did:truth:3N4O5P8DtmUpgFnX9QiEgh',
    signatureHash: 'zkp_8c2f914e...b7d5a1', // Matches audit trail entry 2
    blockTimestamp: new Date(Date.now() - 420000), // 7 minutes ago
    assetId: 'identity_verification.png',
    verificationStatus: 'verified'
  },
  {
    signerId: 'signer_audio_003',
    signerDID: 'did:truth:7R8S9T2EvnWqhHoY1RjFik',
    signatureHash: 'zkp_7d5b249a...f4e8c3', // Matches audit trail entry 4
    blockTimestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    assetId: 'secure_audio_note.mp3',
    verificationStatus: 'verified'
  }
];

// Known ZKP hashes from Deck #6 AuditTrailCard for verification
const AUDIT_TRAIL_HASHES = [
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

const verifySignatureHash = (hash: string): boolean => {
  return AUDIT_TRAIL_HASHES.includes(hash);
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    return `${diffHours}h ago`;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'verified':
      return 'text-green-400';
    case 'pending':
      return 'text-amber-400';
    case 'invalid':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-400" />;
    case 'invalid':
      return <Shield className="w-4 h-4 text-red-400" />;
    default:
      return <Hash className="w-4 h-4 text-slate-400" />;
  }
};

export const AssetSignatureViewerCard: React.FC<AssetSignatureViewerCardProps> = ({ className }) => {
  const [selectedSignature, setSelectedSignature] = useState<SignatureData>(MOCK_SIGNATURES[0]);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`AssetSignatureViewerCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`AssetSignatureViewerCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play signature interface ready message on mount
          const utterance = new SpeechSynthesisUtterance("Asset signature interface ready.");
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

  // Verify signature hash against audit trail on selection change
  useEffect(() => {
    const verifyStart = performance.now();
    
    const isVerified = verifySignatureHash(selectedSignature.signatureHash);
    if (isVerified) {
      setVerificationStatus('Signature hash verified');
      
      // Play TTS verification message
      if (ttsStatus.isReady) {
        const utterance = new SpeechSynthesisUtterance(
          `Asset signature verified. Hash: ${selectedSignature.signatureHash}`
        );
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ ...prev, isPlaying: true }));
        speechSynthesis.speak(utterance);
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
        };
      }
    } else {
      setVerificationStatus('Signature hash not found in audit trail');
    }
    
    const verifyTime = performance.now() - verifyStart;
    if (verifyTime > 100) {
      console.warn(`Signature verification time: ${verifyTime.toFixed(2)}ms (exceeds 100ms target)`);
    }
  }, [selectedSignature, ttsStatus.isReady]);

  const handleSignatureChange = (signature: SignatureData) => {
    setSelectedSignature(signature);
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Asset Signature Viewer"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-400" />
            Asset Signatures
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          View and verify cryptographic asset signatures
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Signature Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Signed Assets
          </label>
          <div className="space-y-2">
            {MOCK_SIGNATURES.map((signature) => (
              <button
                key={signature.signatureHash}
                onClick={() => handleSignatureChange(signature)}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-colors',
                  'hover:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                  'min-h-[48px]',
                  selectedSignature.signatureHash === signature.signatureHash
                    ? 'bg-slate-700/50 border-blue-500/50'
                    : 'bg-slate-800/30 border-slate-700/50'
                )}
                aria-label={`View signature for ${signature.assetId}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(signature.verificationStatus)}
                    <div className="text-sm font-medium text-slate-200">
                      {signature.assetId}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {getRelativeTime(signature.blockTimestamp)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
          aria-live="polite"
          aria-label="Signature verification status"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              {verificationStatus}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Hash matched against Deck #6 audit trail entries
          </div>
        </div>

        {/* Signature Metadata */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Signature Details
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Signer ID:</div>
              <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                {selectedSignature.signerId}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Signer DID:</div>
              <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                {selectedSignature.signerDID}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Signature Hash:</div>
              <div className="text-sm text-green-300 font-mono bg-slate-700/30 rounded px-2 py-1">
                {selectedSignature.signatureHash}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Block Timestamp:</div>
              <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                {formatTimestamp(selectedSignature.blockTimestamp)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Verification Status:</div>
              <div className={cn(
                'text-sm font-mono bg-slate-700/30 rounded px-2 py-1',
                getStatusColor(selectedSignature.verificationStatus)
              )}>
                {selectedSignature.verificationStatus.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Watermark Overlay */}
        <div className="relative bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Asset Integrity
            </span>
          </div>
          
          <div className="relative">
            <div className="text-xs text-slate-400 leading-relaxed">
              This asset has been cryptographically signed and verified against the blockchain audit trail. 
              The signature ensures authenticity and prevents tampering.
            </div>
            
            {/* Verified Watermark */}
            {selectedSignature.verificationStatus === 'verified' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="transform rotate-12 text-green-400/20 text-4xl font-bold select-none">
                  VERIFIED
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signature Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Signature Process
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Signatures created using elliptic curve cryptography</div>
            <div>• Each signature is unique to the asset and signer</div>
            <div>• Verification requires matching against audit trail</div>
            <div>• Timestamps provide immutable chronological ordering</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Cryptographically verified digital signatures
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default AssetSignatureViewerCard;
