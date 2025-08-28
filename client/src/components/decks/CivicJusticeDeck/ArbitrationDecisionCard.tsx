import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Gavel,
  Shield,
  Hash,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive,
  Lock,
  User,
  Calendar,
  FileText,
  Zap
} from 'lucide-react';

type DecisionStage = 'draft' | 'reviewing' | 'ruled' | 'archived';
type RulingOutcome = 'approved' | 'denied' | null;

interface ArbitrationRuling {
  id: string;
  caseId: string;
  summary: string;
  outcome: RulingOutcome;
  encryptedVerdict: string;
  decisionHash: string;
  arbitratorDID: string;
  timestamp: Date;
  zkpHash: string;
  biasScore: number;
  archived: boolean;
}

interface ArbitrationDecisionCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock arbitration rulings for bias detection
const MOCK_RULINGS: ArbitrationRuling[] = [
  {
    id: 'ruling_001',
    caseId: 'case_2024_315',
    summary: 'Property dispute resolution',
    outcome: 'approved',
    encryptedVerdict: 'Plaintiff awarded damages of $15,000 based on evidence submitted...',
    decisionHash: 'decision_hash_a1b2c3',
    arbitratorDID: 'did:civic:arbitrator_001',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    zkpHash: 'zkp_ruling_x7y8z9',
    biasScore: 0.8, // Favor plaintiff
    archived: true
  },
  {
    id: 'ruling_002',
    caseId: 'case_2024_316',
    summary: 'Contract breach arbitration',
    outcome: 'denied',
    encryptedVerdict: 'Insufficient evidence to support claim, defendant not liable...',
    decisionHash: 'decision_hash_d4e5f6',
    arbitratorDID: 'did:civic:arbitrator_001',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    zkpHash: 'zkp_ruling_p9q0r1',
    biasScore: 0.2, // Favor defendant
    archived: true
  },
  {
    id: 'ruling_003',
    caseId: 'case_2024_317',
    summary: 'Employment discrimination case',
    outcome: 'approved',
    encryptedVerdict: 'Clear evidence of discriminatory practices, damages awarded...',
    decisionHash: 'decision_hash_g7h8i9',
    arbitratorDID: 'did:civic:arbitrator_001',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    zkpHash: 'zkp_ruling_s2t3u4',
    biasScore: 0.9, // Strong favor plaintiff
    archived: true
  },
  {
    id: 'ruling_004',
    caseId: 'case_2024_318',
    summary: 'Intellectual property dispute',
    outcome: 'approved',
    encryptedVerdict: 'Patent infringement confirmed, injunction granted...',
    decisionHash: 'decision_hash_j0k1l2',
    arbitratorDID: 'did:civic:arbitrator_001',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    zkpHash: 'zkp_ruling_v5w6x7',
    biasScore: 0.7, // Favor plaintiff
    archived: true
  },
  {
    id: 'ruling_005',
    caseId: 'case_2024_319',
    summary: 'Consumer protection violation',
    outcome: 'approved',
    encryptedVerdict: 'Merchant engaged in deceptive practices, refund ordered...',
    decisionHash: 'decision_hash_m3n4o5',
    arbitratorDID: 'did:civic:arbitrator_001',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    zkpHash: 'zkp_ruling_y8z9a0',
    biasScore: 0.8, // Favor plaintiff
    archived: true
  }
];

// Get decision stage info
const getDecisionStageInfo = (stage: DecisionStage) => {
  switch (stage) {
    case 'draft':
      return {
        icon: <FileText className="w-4 h-4 text-slate-400" />,
        label: 'Draft',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20'
      };
    case 'reviewing':
      return {
        icon: <Eye className="w-4 h-4 text-blue-400" />,
        label: 'Reviewing',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      };
    case 'ruled':
      return {
        icon: <Gavel className="w-4 h-4 text-green-400" />,
        label: 'Ruled',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20'
      };
    case 'archived':
      return {
        icon: <Archive className="w-4 h-4 text-amber-400" />,
        label: 'Archived',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20'
      };
  }
};

// Get ruling outcome info
const getRulingOutcomeInfo = (outcome: RulingOutcome) => {
  switch (outcome) {
    case 'approved':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        label: 'Approved',
        color: 'text-green-400'
      };
    case 'denied':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Denied',
        color: 'text-red-400'
      };
    default:
      return {
        icon: <Clock className="w-4 h-4 text-slate-400" />,
        label: 'Pending',
        color: 'text-slate-400'
      };
  }
};

// Calculate bias deviation
const calculateBiasDeviation = (rulings: ArbitrationRuling[]): number => {
  if (rulings.length === 0) return 0;
  
  const averageBias = rulings.reduce((sum, ruling) => sum + ruling.biasScore, 0) / rulings.length;
  const neutralBias = 0.5; // Perfectly neutral
  
  return Math.abs(averageBias - neutralBias) * 100; // Convert to percentage
};

// Generate decision hash
const generateDecisionHash = (): string => {
  return `decision_hash_${Math.random().toString(36).substr(2, 6)}`;
};

// Generate ZKP hash
const generateZKPHash = (): string => {
  return `zkp_ruling_${Math.random().toString(36).substr(2, 6)}`;
};

// Format timestamp
const formatTimestamp = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ArbitrationDecisionCard: React.FC<ArbitrationDecisionCardProps> = ({ className }) => {
  const [rulings, setRulings] = useState<ArbitrationRuling[]>(MOCK_RULINGS);
  const [currentStage, setCurrentStage] = useState<DecisionStage>('draft');
  const [currentOutcome, setCurrentOutcome] = useState<RulingOutcome>(null);
  const [draftVerdict, setDraftVerdict] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [biasDetected, setBiasDetected] = useState<boolean>(false);
  const [biasDeviation, setBiasDeviation] = useState<number>(0);
  const [verdictRevealed, setVerdictRevealed] = useState<{ [key: string]: boolean }>({});
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ArbitrationDecisionCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ArbitrationDecisionCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      console.log(`🔊 TTS throttled: "${message}" (${now - ttsStatus.lastTrigger}ms since last)`);
      return;
    }
    
    if (!ttsStatus.isReady) {
      console.log(`🔊 TTS not ready: "${message}"`);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          lastTrigger: now 
        }));
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS completed: "${message}"`);
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS error: "${message}"`);
        };
        
        window.speechSynthesis.speak(utterance);
        console.log(`🔊 TTS started: "${message}"`);
      }, 40); // <40ms latency requirement
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Initialize TTS on mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          // Mount TTS message
          setTimeout(() => {
            speakMessage("Arbitration decision panel ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Monitor bias deviation for pushback trigger (>20% threshold)
  useEffect(() => {
    const deviation = calculateBiasDeviation(rulings);
    setBiasDeviation(deviation);
    
    if (deviation > 20) {
      setBiasDetected(true);
      console.log(`⚠️ Arbitration bias detected: ${deviation.toFixed(1)}% favor deviation (exceeds 20% threshold)`);
    } else {
      setBiasDetected(false);
    }
  }, [rulings]);

  // Handle stage progression
  const handleStageProgression = async (newStage: DecisionStage, outcome?: RulingOutcome) => {
    setIsProcessing(true);
    
    // Simulate processing delay (<100ms validation target)
    await new Promise(resolve => setTimeout(resolve, 80));
    
    setCurrentStage(newStage);
    if (outcome) setCurrentOutcome(outcome);
    
    setIsProcessing(false);
    
    // TTS announcements
    if (newStage === 'reviewing') {
      speakMessage("Case under review");
    } else if (newStage === 'ruled') {
      speakMessage("Ruling issued");
    } else if (newStage === 'archived') {
      speakMessage("Ruling archived");
    }
  };

  // Handle ruling submission
  const handleRulingSubmission = async () => {
    if (!draftVerdict.trim() || !currentOutcome) {
      speakMessage("Please complete verdict and outcome");
      return;
    }

    setIsProcessing(true);
    
    // Simulate ZKP validation and submission
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newRuling: ArbitrationRuling = {
      id: `ruling_${Date.now()}`,
      caseId: `case_2024_${Math.floor(Math.random() * 1000)}`,
      summary: `New arbitration case - ${currentOutcome}`,
      outcome: currentOutcome,
      encryptedVerdict: draftVerdict,
      decisionHash: generateDecisionHash(),
      arbitratorDID: 'did:civic:current_arbitrator',
      timestamp: new Date(),
      zkpHash: generateZKPHash(),
      biasScore: Math.random(), // Random bias score for simulation
      archived: false
    };
    
    setRulings(prev => [newRuling, ...prev]);
    setCurrentStage('archived');
    setDraftVerdict('');
    setCurrentOutcome(null);
    setIsProcessing(false);
    
    speakMessage("Ruling submitted and archived");
  };

  // Toggle verdict reveal
  const toggleVerdictReveal = (rulingId: string) => {
    setVerdictRevealed(prev => ({
      ...prev,
      [rulingId]: !prev[rulingId]
    }));
  };

  const stageInfo = getDecisionStageInfo(currentStage);
  const outcomeInfo = getRulingOutcomeInfo(currentOutcome);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        biasDetected && 'animate-pulse ring-2 ring-red-500/50',
        className
      )}
      role="region"
      aria-label="Arbitration Decision Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          biasDetected ? 'bg-red-500 animate-pulse' :
          currentStage === 'archived' ? 'bg-amber-500' :
          currentStage === 'ruled' ? 'bg-green-500' :
          currentStage === 'reviewing' ? 'bg-blue-500 animate-pulse' :
          'bg-slate-500'
        )}
        aria-label={
          biasDetected ? "Status: Bias Alert" :
          `Status: ${stageInfo.label}`
        }
        title={
          biasDetected ? `${biasDeviation.toFixed(1)}% bias deviation detected` :
          `Decision stage: ${stageInfo.label}`
        }
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-cyan-400" />
            Arbitration Decision
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            biasDetected ? 'border-red-500/30 bg-red-500/10 text-red-400' :
            stageInfo.color.replace('text-', 'border-').replace('-400', '-500/30'),
            biasDetected ? 'bg-red-500/10' : stageInfo.bgColor,
            biasDetected ? 'text-red-400' : stageInfo.color
          )}>
            <div className="flex items-center gap-1">
              {biasDetected ? <AlertTriangle className="w-3 h-3" /> : stageInfo.icon}
              {biasDetected ? 'Bias Alert' : stageInfo.label}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Final ruling interface with ZKP validation and bias monitoring
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bias Detection Alert */}
        {biasDetected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Arbitration Bias Detected
              </span>
            </div>
            <div className="text-xs text-red-300">
              {biasDeviation.toFixed(1)}% favor deviation exceeds 20% threshold across recent rulings
            </div>
          </div>
        )}

        {/* Decision Workflow */}
        {currentStage !== 'archived' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">
                Current Case Decision
              </span>
            </div>
            
            {currentStage === 'draft' && (
              <div className="space-y-3">
                <Textarea
                  value={draftVerdict}
                  onChange={(e) => setDraftVerdict(e.target.value)}
                  placeholder="Draft your arbitration verdict and reasoning..."
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-400 min-h-[100px] resize-none"
                  maxLength={1000}
                />
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-slate-400">
                    {draftVerdict.length}/1000 characters
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setCurrentOutcome('denied');
                        handleStageProgression('reviewing', 'denied');
                      }}
                      disabled={!draftVerdict.trim() || isProcessing}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3 h-3" />
                        Deny
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentOutcome('approved');
                        handleStageProgression('reviewing', 'approved');
                      }}
                      disabled={!draftVerdict.trim() || isProcessing}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {currentStage === 'reviewing' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">
                    Case Under Review
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outcome:</span>
                    <span className={outcomeInfo.color}>{outcomeInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ZKP Validation:</span>
                    <span className="text-blue-400">In Progress</span>
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={() => handleStageProgression('ruled')}
                    disabled={isProcessing}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white w-full"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Validating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Gavel className="w-3 h-3" />
                        Issue Ruling
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {currentStage === 'ruled' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">
                    Ruling Issued
                  </span>
                </div>
                <div className="space-y-2 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Final Outcome:</span>
                    <span className={outcomeInfo.color}>{outcomeInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Decision Hash:</span>
                    <span className="text-purple-400 font-mono">{generateDecisionHash()}</span>
                  </div>
                </div>
                <Button
                  onClick={handleRulingSubmission}
                  disabled={isProcessing}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-3 h-3" />
                    Archive Ruling
                  </div>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Ruling Archive */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Encrypted Ruling Archive
            </span>
          </div>
          
          <ScrollArea className="h-[250px] w-full">
            <div className="space-y-3 pr-4">
              {rulings.map((ruling) => {
                const outcomeInfo = getRulingOutcomeInfo(ruling.outcome);
                const isRevealed = verdictRevealed[ruling.id];
                
                return (
                  <div
                    key={ruling.id}
                    className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'p-1 rounded',
                          outcomeInfo.color.includes('green') ? 'bg-green-500/20' :
                          outcomeInfo.color.includes('red') ? 'bg-red-500/20' :
                          'bg-slate-500/20'
                        )}>
                          {outcomeInfo.icon}
                        </div>
                        <div className="text-sm font-medium text-slate-200">
                          {ruling.caseId}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => toggleVerdictReveal(ruling.id)}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-400 hover:bg-slate-700 p-1 h-6 w-6"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 mb-2">
                      {ruling.summary}
                    </div>
                    
                    <div className={cn(
                      'text-xs p-2 rounded bg-slate-900/50 mb-2',
                      !isRevealed && 'blur-sm select-none'
                    )}>
                      {isRevealed ? ruling.encryptedVerdict : '█████ ███████ ██████ ███ ████████ █████...'}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Outcome:</span>
                        <span className={outcomeInfo.color}>{outcomeInfo.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date:</span>
                        <span className="text-slate-400">{formatTimestamp(ruling.timestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hash:</span>
                        <span className="text-purple-400 font-mono">{ruling.decisionHash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ZKP:</span>
                        <span className="text-blue-400 font-mono">{ruling.zkpHash}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Cross-Deck Validation */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Validation
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">DID Sync (Deck #12):</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evidence Sync (Module #2):</span>
              <span className="text-blue-400">Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Arbitration History:</span>
              <span className="text-purple-400">{rulings.length} rulings</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bias Detection:</span>
              <span className={biasDetected ? 'text-red-400' : 'text-green-400'}>
                {biasDetected ? 'Alert' : 'Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Arbitration decision panel ready,
          Current stage: {stageInfo.label},
          {currentOutcome && `Outcome: ${outcomeInfo.label}`},
          Ruling archive: {rulings.length} decisions,
          {biasDetected && `Alert: ${biasDeviation.toFixed(1)}% bias deviation detected`}
        </div>
      </CardContent>
    </Card>
  );
};
export default ArbitrationDecisionCard;
