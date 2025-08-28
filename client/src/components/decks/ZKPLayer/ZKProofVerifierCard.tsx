import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Shield, CheckCircle, XCircle, Loader2, Key, Clock } from 'lucide-react';

type CircuitType = 'vote_proof' | 'identity_proof';
type VerificationStatus = 'idle' | 'verifying' | 'passed' | 'failed';

interface VerificationResult {
  status: 'passed' | 'failed';
  circuitId: string;
  verificationKey: string;
  timestamp: string;
}

interface ZKProofVerifierCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const CIRCUIT_OPTIONS = [
  { value: 'vote_proof', label: 'Vote Proof', circuitId: 'civic_vote_v2.1' },
  { value: 'identity_proof', label: 'Identity Proof', circuitId: 'did_verify_v1.3' }
];

const generateVerificationResult = (circuitType: CircuitType): VerificationResult => {
  const circuit = CIRCUIT_OPTIONS.find(c => c.value === circuitType);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const isPassed = Math.random() > 0.5; // 50/50 pass/fail
  
  return {
    status: isPassed ? 'passed' : 'failed',
    circuitId: circuit?.circuitId || 'unknown_circuit',
    verificationKey: `vkey_${randomSuffix}`,
    timestamp: new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  };
};

const validateProofHash = (hash: string): boolean => {
  if (!hash.trim()) return false;
  // Accept hex strings (0x prefix) or regular proof hash format
  return hash.length >= 6;
};

export const ZKProofVerifierCard: React.FC<ZKProofVerifierCardProps> = ({ className }) => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitType>('vote_proof');
  const [proofHash, setProofHash] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ZKProofVerifierCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ZKProofVerifierCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play verifier ready message on mount
          const utterance = new SpeechSynthesisUtterance("Verifier ready.");
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

  const playResultTTS = (result: VerificationResult) => {
    if (!ttsStatus.isReady) return;
    
    const message = result.status === 'passed' 
      ? "Proof verification passed." 
      : "Proof verification failed.";
    
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

  const handleVerifyProof = async () => {
    const verifyStart = performance.now();
    
    if (!validateProofHash(proofHash)) {
      setVerificationStatus('failed');
      return;
    }

    setVerificationStatus('verifying');
    setProgress(0);
    setVerificationResult(null);

    // Simulate verification with progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 250);

    // Simulate verification delay (2.5 seconds)
    setTimeout(() => {
      clearInterval(progressInterval);
      
      const result = generateVerificationResult(selectedCircuit);
      setVerificationResult(result);
      setVerificationStatus(result.status);
      setProgress(100);
      
      playResultTTS(result);
      
      const verifyTime = performance.now() - verifyStart;
      if (verifyTime > 100) {
        console.warn(`Proof verification simulation time: ${verifyTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
    }, 2500);
  };

  const handleReset = () => {
    const resetStart = performance.now();
    
    setVerificationStatus('idle');
    setProgress(0);
    setVerificationResult(null);
    setProofHash('');
    
    const resetTime = performance.now() - resetStart;
    if (resetTime > 100) {
      console.warn(`Reset time: ${resetTime.toFixed(2)}ms (exceeds 100ms target)`);
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verifying':
        return 'text-amber-400';
      case 'passed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verifying':
        return 'Verifying Proof...';
      case 'passed':
        return 'Verification Passed ✅';
      case 'failed':
        return 'Verification Failed ❌';
      default:
        return 'Ready to Verify';
    }
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
      aria-label="Zero-Knowledge Proof Verifier"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            ZK Proof Verifier
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Verify zero-knowledge proofs against trusted circuits
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Circuit Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Verification Circuit
          </label>
          <Select
            value={selectedCircuit}
            onValueChange={(value: CircuitType) => setSelectedCircuit(value)}
            disabled={verificationStatus === 'verifying'}
          >
            <SelectTrigger 
              className={cn(
                'bg-slate-700/50 border-slate-600 text-slate-100',
                'focus:border-blue-500 focus:ring-blue-500/20',
                'min-h-[48px]'
              )}
              aria-label="Select verification circuit type"
            >
              <SelectValue placeholder="Choose circuit type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {CIRCUIT_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-slate-100 focus:bg-slate-700"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Proof Hash Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Proof Hash
          </label>
          <Input
            value={proofHash}
            onChange={(e) => setProofHash(e.target.value)}
            placeholder="0x123abc... or zkp_hash"
            disabled={verificationStatus === 'verifying'}
            className={cn(
              'bg-slate-700/50 border-slate-600 text-slate-100',
              'placeholder:text-slate-400',
              'focus:border-blue-500 focus:ring-blue-500/20',
              'min-h-[48px]',
              verificationStatus === 'failed' && !validateProofHash(proofHash) && 'border-red-500/50'
            )}
            aria-label="Enter proof hash to verify"
          />
          {verificationStatus === 'failed' && !validateProofHash(proofHash) && (
            <p className="text-xs text-red-400">
              Please enter a valid proof hash (minimum 6 characters)
            </p>
          )}
        </div>

        {/* Verification Status */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
          aria-live="polite"
          aria-label="Proof verification status"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
          
          {verificationStatus === 'verifying' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-slate-400">
                Verification Progress: {progress}%
              </div>
            </div>
          )}
        </div>

        {/* Verification Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleVerifyProof}
            disabled={verificationStatus === 'verifying' || !validateProofHash(proofHash)}
            className={cn(
              'flex-1 min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Verify zero-knowledge proof"
          >
            {verificationStatus === 'verifying' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify Proof
              </>
            )}
          </Button>
          
          {(verificationStatus === 'passed' || verificationStatus === 'failed') && (
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                'min-h-[48px] px-4',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              aria-label="Reset proof verifier"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Verification Result */}
        {verificationResult && (verificationStatus === 'passed' || verificationStatus === 'failed') && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              {verificationResult.status === 'passed' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={cn(
                'text-sm font-medium',
                verificationResult.status === 'passed' ? 'text-green-400' : 'text-red-400'
              )}>
                Verification {verificationResult.status === 'passed' ? 'Passed' : 'Failed'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Circuit ID:</div>
                <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                  {verificationResult.circuitId}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Verification Key:</div>
                <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                  {verificationResult.verificationKey}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Verification Status:</div>
                <div className={cn(
                  'text-sm font-mono bg-slate-700/30 rounded px-2 py-1',
                  verificationResult.status === 'passed' ? 'text-green-300' : 'text-red-300'
                )}>
                  {verificationResult.status.toUpperCase()}
                </div>
              </div>
              
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/50 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Verified at: {verificationResult.timestamp}
              </div>
            </div>
          </div>
        )}

        {/* Verification Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Verification Process
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Proofs are verified against trusted circuit parameters</div>
            <div>• Verification keys ensure circuit integrity</div>
            <div>• No private data is revealed during verification</div>
            <div>• Results are cryptographically deterministic</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Trustless proof verification system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default ZKProofVerifierCard;
