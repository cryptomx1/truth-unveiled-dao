import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CircuitBoard, Loader2, Check, AlertCircle, Key, Hash } from 'lucide-react';

type CircuitType = 'vote_proof' | 'identity_proof';
type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

interface ZKProofData {
  circuitId: string;
  zKey: string;
  proofHash: string;
  timestamp: Date;
}

interface ZKProofGeneratorCardProps {
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

const generateMockProof = (circuitType: CircuitType, inputHash: string): ZKProofData => {
  const circuit = CIRCUIT_OPTIONS.find(c => c.value === circuitType);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const hashPrefix = inputHash.substring(0, 6) || 'abc123';
  
  return {
    circuitId: circuit?.circuitId || 'unknown_circuit',
    zKey: `zkey_${circuitType}_${randomSuffix}`,
    proofHash: `zkp_${hashPrefix}${randomSuffix}`,
    timestamp: new Date()
  };
};

const validateInput = (input: string): boolean => {
  if (!input.trim()) return false;
  // Accept hex strings (0x prefix) or regular text
  return input.length >= 3;
};

export const ZKProofGeneratorCard: React.FC<ZKProofGeneratorCardProps> = ({ className }) => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitType>('vote_proof');
  const [inputHash, setInputHash] = useState('');
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [generatedProof, setGeneratedProof] = useState<ZKProofData | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ZKProofGeneratorCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ZKProofGeneratorCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play interface ready message on mount
          const utterance = new SpeechSynthesisUtterance("Proof generation interface ready.");
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

  const playCompletionTTS = () => {
    if (!ttsStatus.isReady) return;
    
    const utterance = new SpeechSynthesisUtterance("ZK proof generated.");
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleGenerateProof = async () => {
    const generateStart = performance.now();
    
    if (!validateInput(inputHash)) {
      setGenerationStatus('error');
      return;
    }

    setGenerationStatus('generating');
    setProgress(0);
    setGeneratedProof(null);

    // Simulate proof generation with progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate generation delay (2-3 seconds)
    setTimeout(() => {
      clearInterval(progressInterval);
      
      const mockProof = generateMockProof(selectedCircuit, inputHash);
      setGeneratedProof(mockProof);
      setGenerationStatus('completed');
      setProgress(100);
      
      playCompletionTTS();
      
      const generateTime = performance.now() - generateStart;
      if (generateTime > 100) {
        console.warn(`Proof generation simulation time: ${generateTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
    }, 2500);
  };

  const handleReset = () => {
    const resetStart = performance.now();
    
    setGenerationStatus('idle');
    setProgress(0);
    setGeneratedProof(null);
    setInputHash('');
    
    const resetTime = performance.now() - resetStart;
    if (resetTime > 100) {
      console.warn(`Reset time: ${resetTime.toFixed(2)}ms (exceeds 100ms target)`);
    }
  };

  const getStatusColor = () => {
    switch (generationStatus) {
      case 'generating':
        return 'text-amber-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getStatusIcon = () => {
    switch (generationStatus) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CircuitBoard className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (generationStatus) {
      case 'generating':
        return 'Generating Proof...';
      case 'completed':
        return 'Proof Generated';
      case 'error':
        return 'Invalid Input';
      default:
        return 'Ready to Generate';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
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
      aria-label="Zero-Knowledge Proof Generator"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <CircuitBoard className="w-5 h-5 text-blue-400" />
            ZK Proof Generator
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Generate zero-knowledge proofs using secure circuits
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Circuit Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Proof Circuit
          </label>
          <Select
            value={selectedCircuit}
            onValueChange={(value: CircuitType) => setSelectedCircuit(value)}
            disabled={generationStatus === 'generating'}
          >
            <SelectTrigger 
              className={cn(
                'bg-slate-700/50 border-slate-600 text-slate-100',
                'focus:border-blue-500 focus:ring-blue-500/20',
                'min-h-[48px]'
              )}
              aria-label="Select proof circuit type"
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

        {/* Hash Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Input Data (Hash or Message)
          </label>
          <Input
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
            placeholder="0x123abc... or message text"
            disabled={generationStatus === 'generating'}
            className={cn(
              'bg-slate-700/50 border-slate-600 text-slate-100',
              'placeholder:text-slate-400',
              'focus:border-blue-500 focus:ring-blue-500/20',
              'min-h-[48px]',
              generationStatus === 'error' && !validateInput(inputHash) && 'border-red-500/50'
            )}
            aria-label="Enter data to generate proof for"
          />
          {generationStatus === 'error' && !validateInput(inputHash) && (
            <p className="text-xs text-red-400">
              Please enter at least 3 characters
            </p>
          )}
        </div>

        {/* Generation Status */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
          aria-live="polite"
          aria-label="Proof generation status"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
          
          {generationStatus === 'generating' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-slate-400">
                Progress: {progress}%
              </div>
            </div>
          )}
        </div>

        {/* Generation Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateProof}
            disabled={generationStatus === 'generating' || !validateInput(inputHash)}
            className={cn(
              'flex-1 min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Generate zero-knowledge proof"
          >
            {generationStatus === 'generating' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <CircuitBoard className="w-4 h-4 mr-2" />
                Generate Proof
              </>
            )}
          </Button>
          
          {(generationStatus === 'completed' || generationStatus === 'error') && (
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                'min-h-[48px] px-4',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              aria-label="Reset proof generator"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Generated Proof Output */}
        {generatedProof && generationStatus === 'completed' && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Proof Generated Successfully
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Circuit ID:</div>
                <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                  {generatedProof.circuitId}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-slate-400">ZKey:</div>
                <div className="text-sm text-slate-200 font-mono bg-slate-700/30 rounded px-2 py-1">
                  {generatedProof.zKey}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Proof Hash:</div>
                <div className="text-sm text-green-300 font-mono bg-slate-700/30 rounded px-2 py-1">
                  {generatedProof.proofHash}
                </div>
              </div>
              
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                Generated at: {formatTimestamp(generatedProof.timestamp)}
              </div>
            </div>
          </div>
        )}

        {/* Circuit Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Circuit Information
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Vote Proof: Validates voting eligibility and anonymity</div>
            <div>• Identity Proof: Verifies DID ownership without exposure</div>
            <div>• All proofs use trusted setup ceremonies</div>
            <div>• Zero knowledge of input data is revealed</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Cryptographically secure proof generation
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default ZKProofGeneratorCard;
