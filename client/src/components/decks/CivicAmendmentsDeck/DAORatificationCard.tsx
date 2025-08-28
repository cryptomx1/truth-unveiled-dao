import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  Gavel,
  Hash,
  Users,
  Shield,
  Check,
  X,
  AlertTriangle,
  Clock,
  Vote,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Eye,
  Settings
} from 'lucide-react';

type QuorumThreshold = 51 | 66 | 75;
type RatificationStatus = 'pending' | 'ratifying' | 'ratified' | 'vetoed' | 'failed';
type DAOVote = 'ratify' | 'veto' | null;

interface DAOSigner {
  id: string;
  didHash: string;
  credentialHash: string;
  vote: DAOVote;
  timestamp: Date | null;
  verified: boolean;
}

interface AmendmentSummary {
  id: string;
  title: string;
  scope: string;
  proposedBy: string;
  submittedAt: Date;
  zkpHash: string;
}

interface DAORatificationCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock DAO signers (5 total, need 3/5 for passage)
const MOCK_DAO_SIGNERS: DAOSigner[] = [
  {
    id: 'dao_signer_001',
    didHash: 'did:civic:dao_member_001',
    credentialHash: 'cred_dao_x1y2z3',
    vote: null,
    timestamp: null,
    verified: true
  },
  {
    id: 'dao_signer_002',
    didHash: 'did:civic:dao_member_002',
    credentialHash: 'cred_dao_a4b5c6',
    vote: null,
    timestamp: null,
    verified: true
  },
  {
    id: 'dao_signer_003',
    didHash: 'did:civic:dao_member_003',
    credentialHash: 'cred_dao_d7e8f9',
    vote: null,
    timestamp: null,
    verified: false // Simulate DID mismatch
  },
  {
    id: 'dao_signer_004',
    didHash: 'did:civic:dao_member_004',
    credentialHash: 'cred_dao_g0h1i2',
    vote: null,
    timestamp: null,
    verified: true
  },
  {
    id: 'dao_signer_005',
    didHash: 'did:civic:dao_member_005',
    credentialHash: 'cred_dao_j3k4l5',
    vote: null,
    timestamp: null,
    verified: true
  }
];

// Mock amendment from Module #1 (cross-deck sync)
const MOCK_AMENDMENT: AmendmentSummary = {
  id: 'amend_001',
  title: 'Digital Privacy Protection Amendment',
  scope: 'National',
  proposedBy: 'did:civic:proposer_123',
  submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  zkpHash: 'zkp_amend_x7y8z9w0'
};

// Get ratification status info
const getRatificationStatusInfo = (status: RatificationStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        label: 'Pending',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20'
      };
    case 'ratifying':
      return {
        icon: <Vote className="w-4 h-4 text-blue-400" />,
        label: 'Ratifying',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      };
    case 'ratified':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        label: 'Ratified',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20'
      };
    case 'vetoed':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Vetoed',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20'
      };
    case 'failed':
      return {
        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
        label: 'Failed',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20'
      };
  }
};

// Calculate voting progress
const calculateVotingProgress = (signers: DAOSigner[], quorumThreshold: QuorumThreshold) => {
  const votedSigners = signers.filter(s => s.vote !== null && s.verified);
  const ratifyVotes = signers.filter(s => s.vote === 'ratify' && s.verified).length;
  const vetoVotes = signers.filter(s => s.vote === 'veto' && s.verified).length;
  const totalVotes = ratifyVotes + vetoVotes;
  const requiredSignatures = 3; // 3/5 minimum
  const didMismatchRate = (signers.filter(s => !s.verified).length / signers.length) * 100;
  
  return {
    totalVotes,
    ratifyVotes,
    vetoVotes,
    requiredSignatures,
    signatureProgress: (totalVotes / requiredSignatures) * 100,
    quorumMet: totalVotes >= requiredSignatures,
    ratificationPassed: ratifyVotes >= requiredSignatures && (ratifyVotes / totalVotes) * 100 >= quorumThreshold,
    didMismatchRate
  };
};

// Generate credential hash (cross-deck sync)
const generateCredentialHash = (): string => {
  return `cred_dao_${Math.random().toString(36).substr(2, 6)}`;
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

export const DAORatificationCard: React.FC<DAORatificationCardProps> = ({ className }) => {
  const [signers, setSigners] = useState<DAOSigner[]>(MOCK_DAO_SIGNERS);
  const [quorumThreshold, setQuorumThreshold] = useState<QuorumThreshold>(66);
  const [ratificationStatus, setRatificationStatus] = useState<RatificationStatus>('pending');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [pathBTriggered, setPathBTriggered] = useState<boolean>(false);
  const [userVote, setUserVote] = useState<DAOVote>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`DAORatificationCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`DAORatificationCard render time: ${renderTime.toFixed(2)}ms ✅`);
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
            speakMessage("DAO ratification interface ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Monitor for Path B triggers (quorum failure or >20% DID mismatch)
  useEffect(() => {
    const progress = calculateVotingProgress(signers, quorumThreshold);
    
    if (progress.didMismatchRate >= 20) {
      setPathBTriggered(true);
      setRatificationStatus('failed');
      console.log(`⚠️ Path B triggered: ${progress.didMismatchRate.toFixed(1)}% DID mismatch rate`);
    } else if (progress.quorumMet) {
      if (progress.ratificationPassed) {
        setRatificationStatus('ratified');
        setPathBTriggered(false);
      } else {
        setRatificationStatus('vetoed');
        setPathBTriggered(false);
      }
    } else {
      setPathBTriggered(false);
    }
  }, [signers, quorumThreshold]);

  // Simulate additional DAO votes coming in
  useEffect(() => {
    if (ratificationStatus === 'pending') {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          setSigners(prev => {
            const availableSigners = prev.filter(s => s.vote === null && s.verified);
            if (availableSigners.length > 0) {
              const randomSigner = availableSigners[Math.floor(Math.random() * availableSigners.length)];
              return prev.map(s => 
                s.id === randomSigner.id ? {
                  ...s,
                  vote: Math.random() > 0.7 ? 'ratify' : 'veto',
                  timestamp: new Date()
                } : s
              );
            }
            return prev;
          });
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [ratificationStatus]);

  // Handle DAO vote submission
  const handleDAOVote = async (vote: DAOVote) => {
    if (userVote || ratificationStatus !== 'pending') {
      speakMessage("Vote already cast or ratification closed");
      return;
    }

    setIsProcessing(true);
    setRatificationStatus('ratifying');

    // Simulate processing delay (<100ms validation target)
    await new Promise(resolve => setTimeout(resolve, 80));

    // Find available signer slot
    const availableSigner = signers.find(s => s.vote === null && s.verified);
    
    if (!availableSigner) {
      speakMessage("No available DAO slots");
      setIsProcessing(false);
      setRatificationStatus('pending');
      return;
    }

    setSigners(prev => prev.map(s => 
      s.id === availableSigner.id ? {
        ...s,
        vote: vote,
        timestamp: new Date(),
        credentialHash: generateCredentialHash()
      } : s
    ));

    setUserVote(vote);
    setIsProcessing(false);

    const outcome = vote === 'ratify' ? 'Amendment ratified' : 'Amendment vetoed';
    speakMessage(outcome);
  };

  const progress = calculateVotingProgress(signers, quorumThreshold);
  const statusInfo = getRatificationStatusInfo(ratificationStatus);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        pathBTriggered && 'animate-pulse ring-2 ring-red-500/50',
        ratificationStatus === 'ratifying' && 'animate-pulse ring-2 ring-amber-500/50',
        className
      )}
      role="region"
      aria-label="DAO Ratification Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          pathBTriggered ? 'bg-red-500 animate-pulse' :
          ratificationStatus === 'ratified' ? 'bg-green-500' :
          ratificationStatus === 'vetoed' ? 'bg-red-500' :
          ratificationStatus === 'ratifying' ? 'bg-amber-500 animate-pulse' :
          'bg-blue-500'
        )}
        aria-label={`Status: ${statusInfo.label}`}
        title={pathBTriggered ? `${progress.didMismatchRate.toFixed(1)}% DID mismatch detected` : `Ratification status: ${statusInfo.label}`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-cyan-400" />
            DAO Ratification
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            statusInfo.color.replace('text-', 'border-').replace('-400', '-500/30'),
            statusInfo.bgColor,
            statusInfo.color
          )}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.label}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Multi-signature DAO amendment ratification
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Path B Failure Alert */}
        {pathBTriggered && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                DAO Ratification Failed
              </span>
            </div>
            <div className="text-xs text-red-300">
              {progress.didMismatchRate.toFixed(1)}% DID mismatch rate exceeds 20% threshold
            </div>
          </div>
        )}

        {/* Amendment Summary */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Amendment Summary
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-slate-200 text-sm">
              {MOCK_AMENDMENT.title}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Scope:</span>
                <span className="text-slate-300">{MOCK_AMENDMENT.scope}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submitted:</span>
                <span className="text-slate-300">{formatTimestamp(MOCK_AMENDMENT.submittedAt)}</span>
              </div>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-slate-700">
              <span className="text-slate-400">ZKP Hash:</span>
              <span className="text-blue-400 font-mono">{MOCK_AMENDMENT.zkpHash}</span>
            </div>
          </div>
        </div>

        {/* Quorum Configuration */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Quorum Threshold
            </span>
          </div>
          
          <Select 
            value={quorumThreshold.toString()} 
            onValueChange={(value) => setQuorumThreshold(parseInt(value) as QuorumThreshold)}
            disabled={ratificationStatus !== 'pending'}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="51">51% Simple Majority</SelectItem>
              <SelectItem value="66">66% Supermajority</SelectItem>
              <SelectItem value="75">75% Constitutional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DAO Voting Buttons */}
        {ratificationStatus === 'pending' && !userVote && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">
                Cast DAO Vote
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleDAOVote('ratify')}
                disabled={isProcessing}
                className={cn(
                  'min-h-[48px] bg-green-600 hover:bg-green-700 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Ratify
                  </div>
                )}
              </Button>

              <Button
                onClick={() => handleDAOVote('veto')}
                disabled={isProcessing}
                className={cn(
                  'min-h-[48px] bg-red-600 hover:bg-red-700 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Veto
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Multi-Sig Progress */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              DAO Signature Progress
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Signatures:</span>
              <span className="text-slate-200">
                {progress.totalVotes}/{progress.requiredSignatures} required
              </span>
            </div>
            
            <Progress 
              value={progress.signatureProgress} 
              className="h-3 bg-slate-700"
            />
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-400">Ratify:</span>
                  <span className="text-green-400">{progress.ratifyVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Veto:</span>
                  <span className="text-red-400">{progress.vetoVotes}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Quorum:</span>
                  <span className="text-purple-400">{quorumThreshold}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DID Verified:</span>
                  <span className={progress.didMismatchRate > 20 ? 'text-red-400' : 'text-green-400'}>
                    {(100 - progress.didMismatchRate).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Vote Confirmation */}
        {userVote && (
          <div className={cn(
            'rounded-lg border p-3',
            userVote === 'ratify' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          )}>
            <div className="flex items-center gap-2 mb-2">
              {userVote === 'ratify' ? 
                <CheckCircle className="w-4 h-4 text-green-400" /> :
                <XCircle className="w-4 h-4 text-red-400" />
              }
              <span className={cn(
                'text-sm font-medium',
                userVote === 'ratify' ? 'text-green-400' : 'text-red-400'
              )}>
                DAO Vote Cast: {userVote === 'ratify' ? 'Ratify' : 'Veto'}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Your signature has been recorded in the DAO ledger
            </div>
          </div>
        )}

        {/* Cross-Deck Verification */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Verification
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">DID Sync (Deck #12):</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Credential Sync (Deck #13):</span>
              <span className="text-blue-400">Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amendment Sync (Module #1):</span>
              <span className="text-purple-400">Linked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Signature Integrity:</span>
              <span className={pathBTriggered ? 'text-red-400' : 'text-green-400'}>
                {pathBTriggered ? 'Compromised' : 'Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          DAO ratification interface ready,
          Amendment: {MOCK_AMENDMENT.title},
          Quorum threshold: {quorumThreshold}%,
          Current signatures: {progress.totalVotes} of {progress.requiredSignatures} required,
          Ratify votes: {progress.ratifyVotes}, Veto votes: {progress.vetoVotes},
          {userVote && `Your vote: ${userVote} recorded`},
          {pathBTriggered && `Alert: ${progress.didMismatchRate.toFixed(1)}% DID mismatch detected`},
          Status: {statusInfo.label}
        </div>
      </CardContent>
    </Card>
  );
};
export default DAORatificationCard;
