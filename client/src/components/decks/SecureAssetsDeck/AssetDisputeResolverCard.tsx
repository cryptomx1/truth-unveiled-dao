import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Scale, Gavel, CheckCircle, XCircle, AlertTriangle, Clock, User, Hash, FileText } from 'lucide-react';

type DisputeStatus = 'idle' | 'pending' | 'valid' | 'rejected' | 'mediation';
type DisputeType = 'ownership' | 'integrity' | 'authenticity' | 'transfer';

interface DisputeCase {
  id: string;
  claimantId: string;
  challengedHash: string;
  linkedAsset: string;
  disputeType: DisputeType;
  timestamp: Date;
  status: DisputeStatus;
  verdict?: string;
}

interface AssetDisputeResolverCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Valid ZKP hashes from Deck #6 AuditTrailCard and Deck #7 AssetSignatureViewerCard
const VALID_ZKP_HASHES = [
  'zkp_4e91a7b2...c8f3a2',  // Civic document
  'zkp_8c2f914e...b7d5a1',  // Identity verification
  'zkp_2a4c683f...e9b2c7',  // Failed proof
  'zkp_7d5b249a...f4e8c3',  // Audio note
  'zkp_9f3e572b...a6d4b8',  // Additional proof
  'zkp_1b8c496d...c2f7a9',  // Failed verification
  'zkp_6a4f829e...d5b3c1',  // Success proof
  'zkp_3c7d195a...e8f4b6',  // Valid entry
  'zkp_5e2a738f...b9c6d4',  // Generated proof
  'zkp_8b6f142c...a3e7d5'   // Final entry
];

// Asset mapping for hash lookup
const HASH_TO_ASSET: Record<string, string> = {
  'zkp_4e91a7b2...c8f3a2': 'civic_document.pdf',
  'zkp_8c2f914e...b7d5a1': 'identity_verification.png',
  'zkp_7d5b249a...f4e8c3': 'secure_audio_note.mp3',
  'zkp_9f3e572b...a6d4b8': 'civic_document.pdf',
  'zkp_3c7d195a...e8f4b6': 'identity_verification.png',
  'zkp_5e2a738f...b9c6d4': 'civic_document.pdf',
  'zkp_8b6f142c...a3e7d5': 'identity_verification.png'
};

const validateZKPHash = (hash: string): boolean => {
  return VALID_ZKP_HASHES.includes(hash.trim());
};

const getLinkedAsset = (hash: string): string => {
  return HASH_TO_ASSET[hash] || 'unknown_asset.dat';
};

const generateClaimantId = (): string => {
  return `claimant_${Math.random().toString(36).substring(2, 8)}`;
};

const generateDisputeId = (): string => {
  return `dispute_${Math.random().toString(36).substring(2, 10)}`;
};

const getStatusIcon = (status: DisputeStatus) => {
  switch (status) {
    case 'valid':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'mediation':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
    default:
      return <Gavel className="w-4 h-4 text-slate-400" />;
  }
};

const getStatusColor = (status: DisputeStatus): string => {
  switch (status) {
    case 'valid':
      return 'text-green-400';
    case 'rejected':
      return 'text-red-400';
    case 'mediation':
      return 'text-amber-400';
    case 'pending':
      return 'text-blue-400';
    default:
      return 'text-slate-400';
  }
};

const getStatusText = (status: DisputeStatus): string => {
  switch (status) {
    case 'valid':
      return 'Dispute Valid';
    case 'rejected':
      return 'Dispute Rejected';
    case 'mediation':
      return 'Requires Mediation';
    case 'pending':
      return 'Under Review';
    default:
      return 'Ready for Submission';
  }
};

const getPulseRingClass = (status: DisputeStatus): string => {
  switch (status) {
    case 'valid':
      return 'ring-2 ring-green-500/50 animate-pulse';
    case 'rejected':
      return 'ring-2 ring-red-500/50 animate-pulse';
    case 'mediation':
      return 'ring-2 ring-amber-500/50 animate-pulse';
    case 'pending':
      return 'ring-2 ring-blue-500/50 animate-pulse';
    default:
      return 'ring-2 ring-slate-500/50';
  }
};

const getVerdictMessage = (status: DisputeStatus): string => {
  switch (status) {
    case 'valid':
      return 'The challenge has been validated. Asset integrity concerns are confirmed.';
    case 'rejected':
      return 'The challenge has been rejected. Asset remains valid and trusted.';
    case 'mediation':
      return 'Dispute requires human mediation. Case escalated to arbitration panel.';
    default:
      return '';
  }
};

export const AssetDisputeResolverCard: React.FC<AssetDisputeResolverCardProps> = ({ className }) => {
  const [challengedHash, setChallengedHash] = useState('');
  const [disputeType, setDisputeType] = useState<DisputeType>('ownership');
  const [currentDispute, setCurrentDispute] = useState<DisputeCase | null>(null);
  const [progress, setProgress] = useState(0);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`AssetDisputeResolverCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`AssetDisputeResolverCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play dispute interface ready message on mount
          const utterance = new SpeechSynthesisUtterance("Dispute resolution interface active.");
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

  const playVerdictTTS = (status: DisputeStatus) => {
    if (!ttsStatus.isReady) return;
    
    let message = '';
    switch (status) {
      case 'valid':
        message = 'Verdict: Valid dispute. Asset challenge confirmed.';
        break;
      case 'rejected':
        message = 'Verdict: Rejected dispute. Asset remains trusted.';
        break;
      case 'mediation':
        message = 'Verdict: Mediation required. Case escalated to arbitration.';
        break;
    }
    
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

  const handleSubmitDispute = async () => {
    const submitStart = performance.now();
    
    if (!validateZKPHash(challengedHash)) {
      return;
    }

    // Create new dispute case
    const dispute: DisputeCase = {
      id: generateDisputeId(),
      claimantId: generateClaimantId(),
      challengedHash: challengedHash,
      linkedAsset: getLinkedAsset(challengedHash),
      disputeType: disputeType,
      timestamp: new Date(),
      status: 'pending'
    };

    setCurrentDispute(dispute);
    setProgress(0);

    // Simulate review progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 12;
      });
    }, 150);

    // Simulate dispute resolution
    setTimeout(() => {
      clearInterval(progressInterval);
      
      // Mock verdict logic based on hash characteristics
      let verdict: DisputeStatus;
      if (challengedHash.includes('2a4c683f') || challengedHash.includes('1b8c496d')) {
        verdict = 'valid'; // Failed proofs from audit trail
      } else if (challengedHash.includes('4e91a7b2') || challengedHash.includes('8c2f914e')) {
        verdict = 'mediation'; // High-value assets need review
      } else {
        verdict = 'rejected'; // Most disputes are rejected
      }

      const resolvedDispute: DisputeCase = {
        ...dispute,
        status: verdict,
        verdict: getVerdictMessage(verdict)
      };

      setCurrentDispute(resolvedDispute);
      setProgress(100);
      
      playVerdictTTS(verdict);
      
      const totalTime = performance.now() - submitStart;
      if (totalTime > 200) {
        console.warn(`Dispute resolution time: ${totalTime.toFixed(2)}ms (exceeds 200ms target)`);
      }
    }, 2000);
  };

  const handleReset = () => {
    setCurrentDispute(null);
    setProgress(0);
    setChallengedHash('');
    setDisputeType('ownership');
  };

  const canSubmit = () => {
    return validateZKPHash(challengedHash) && 
           (!currentDispute || currentDispute.status !== 'pending');
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        currentDispute ? getPulseRingClass(currentDispute.status) : 'ring-2 ring-slate-500/50',
        className
      )}
      role="region"
      aria-label="Asset Dispute Resolution System"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            Dispute Resolver
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Multi-party asset dispute resolution with ZKP verification
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Hash Challenge Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Challenged ZKP Hash
          </label>
          <Input
            value={challengedHash}
            onChange={(e) => setChallengedHash(e.target.value)}
            placeholder="Enter hash from Deck #6 or #7..."
            disabled={currentDispute?.status === 'pending'}
            className={cn(
              'bg-slate-700/50 border-slate-600 text-slate-100',
              'placeholder:text-slate-400',
              'focus:border-blue-500 focus:ring-blue-500/20',
              'min-h-[48px]',
              challengedHash && !validateZKPHash(challengedHash) && 'border-red-500/50'
            )}
            aria-label="Enter zero-knowledge proof hash to challenge"
          />
          {challengedHash && !validateZKPHash(challengedHash) && (
            <p className="text-xs text-red-400">
              Hash not found in audit trail or signature registry
            </p>
          )}
          {challengedHash && validateZKPHash(challengedHash) && (
            <p className="text-xs text-green-400">
              Linked asset: {getLinkedAsset(challengedHash)}
            </p>
          )}
        </div>

        {/* Dispute Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Dispute Type
          </label>
          <Select
            value={disputeType}
            onValueChange={(value) => setDisputeType(value as DisputeType)}
            disabled={currentDispute?.status === 'pending'}
          >
            <SelectTrigger 
              className={cn(
                'bg-slate-700/50 border-slate-600 text-slate-100',
                'focus:border-blue-500 focus:ring-blue-500/20',
                'min-h-[48px]'
              )}
              aria-label="Select dispute type"
            >
              <SelectValue placeholder="Choose dispute type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ownership" className="text-slate-100 focus:bg-slate-700">
                Ownership Challenge
              </SelectItem>
              <SelectItem value="integrity" className="text-slate-100 focus:bg-slate-700">
                Integrity Violation
              </SelectItem>
              <SelectItem value="authenticity" className="text-slate-100 focus:bg-slate-700">
                Authenticity Question
              </SelectItem>
              <SelectItem value="transfer" className="text-slate-100 focus:bg-slate-700">
                Transfer Dispute
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Dispute Status */}
        {currentDispute && (
          <div 
            className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
            aria-live="polite"
            aria-label="Current dispute status"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={getStatusColor(currentDispute.status)}>
                {getStatusIcon(currentDispute.status)}
              </div>
              <span className={cn('text-sm font-medium', getStatusColor(currentDispute.status))}>
                {getStatusText(currentDispute.status)}
              </span>
            </div>
            
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Case ID:</span>
                <span className="font-mono text-slate-300">{currentDispute.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Claimant:</span>
                <span className="font-mono text-slate-300">{currentDispute.claimantId}</span>
              </div>
              <div className="flex justify-between">
                <span>Asset:</span>
                <span className="font-mono text-slate-300">{currentDispute.linkedAsset}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="text-slate-300 capitalize">{currentDispute.disputeType}</span>
              </div>
            </div>
            
            {currentDispute.status === 'pending' && (
              <div className="mt-3 space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-blue-400">
                  Multi-party review in progress... {progress}%
                </div>
              </div>
            )}
            
            {currentDispute.verdict && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-300 leading-relaxed">
                  {currentDispute.verdict}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmitDispute}
            disabled={!canSubmit()}
            className={cn(
              'flex-1 min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Submit asset dispute for resolution"
          >
            {currentDispute?.status === 'pending' ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-pulse" />
                Reviewing...
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4 mr-2" />
                Submit Dispute
              </>
            )}
          </Button>
          
          {currentDispute && currentDispute.status !== 'pending' && (
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                'min-h-[48px] px-4',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              aria-label="Reset dispute interface"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Dispute Process Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Resolution Process
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Multi-party verification against audit trail</div>
            <div>• Cryptographic proof validation and integrity checks</div>
            <div>• Community consensus mechanism for complex cases</div>
            <div>• Escalation to human arbitration when required</div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="text-xs text-slate-500">
              Resolution typically completes within 2-3 seconds for automated verdicts
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Decentralized dispute resolution protocol
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default AssetDisputeResolverCard;
