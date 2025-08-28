import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Vote,
  Hash,
  Clock,
  Shield,
  Check,
  X,
  AlertTriangle,
  Users,
  Eye,
  Timer,
  CheckCircle,
  XCircle,
  Zap,
  Lock
} from 'lucide-react';

type VoteChoice = 'support' | 'oppose' | null;
type VotingStatus = 'open' | 'casting' | 'submitted' | 'closed';

interface ZKPBallot {
  id: string;
  choice: VoteChoice;
  zkpHash: string;
  didHash: string;
  credentialHash: string;
  timestamp: Date;
  verified: boolean;
}

interface VotingResults {
  totalVotes: number;
  supportVotes: number;
  opposeVotes: number;
  supportPercentage: number;
  opposePercentage: number;
}

interface ZKPVotingWindowCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock voting window duration (3 minutes = 180 seconds)
const VOTING_WINDOW_DURATION = 180;

// Simulate existing votes for demonstration
const MOCK_EXISTING_VOTES: ZKPBallot[] = [
  {
    id: 'ballot_001',
    choice: 'support',
    zkpHash: 'zkp_vote_a1b2c3d4',
    didHash: 'did:civic:voter_001',
    credentialHash: 'cred_x1y2z3w4',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    verified: true
  },
  {
    id: 'ballot_002',
    choice: 'oppose',
    zkpHash: 'zkp_vote_e5f6g7h8',
    didHash: 'did:civic:voter_002',
    credentialHash: 'cred_a5b6c7d8',
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
    verified: true
  },
  {
    id: 'ballot_003',
    choice: 'support',
    zkpHash: 'zkp_vote_i9j0k1l2',
    didHash: 'did:civic:voter_003',
    credentialHash: 'cred_e9f0g1h2',
    timestamp: new Date(Date.now() - 6 * 60 * 1000),
    verified: false // Simulate verification failure
  }
];

// Generate ZKP hash for ballot
const generateBallotZKP = (): string => {
  return `zkp_vote_${Math.random().toString(36).substr(2, 8)}`;
};

// Generate DID hash (cross-deck sync with Deck #12)
const generateDIDHash = (): string => {
  return `did:civic:voter_${Math.random().toString(36).substr(2, 6)}`;
};

// Generate credential hash (cross-deck sync with Deck #13)
const generateCredentialHash = (): string => {
  return `cred_${Math.random().toString(36).substr(2, 8)}`;
};

// Format countdown time
const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate voting results
const calculateResults = (ballots: ZKPBallot[]): VotingResults => {
  const verifiedBallots = ballots.filter(b => b.verified);
  const totalVotes = verifiedBallots.length;
  const supportVotes = verifiedBallots.filter(b => b.choice === 'support').length;
  const opposeVotes = verifiedBallots.filter(b => b.choice === 'oppose').length;
  
  return {
    totalVotes,
    supportVotes,
    opposeVotes,
    supportPercentage: totalVotes > 0 ? (supportVotes / totalVotes) * 100 : 0,
    opposePercentage: totalVotes > 0 ? (opposeVotes / totalVotes) * 100 : 0
  };
};

export const ZKPVotingWindowCard: React.FC<ZKPVotingWindowCardProps> = ({ className }) => {
  const [ballots, setBallots] = useState<ZKPBallot[]>(MOCK_EXISTING_VOTES);
  const [userVote, setUserVote] = useState<ZKPBallot | null>(null);
  const [votingStatus, setVotingStatus] = useState<VotingStatus>('open');
  const [timeRemaining, setTimeRemaining] = useState<number>(VOTING_WINDOW_DURATION);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [tamperDetected, setTamperDetected] = useState<boolean>(false);
  const [signatureMismatchRate, setSignatureMismatchRate] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ZKPVotingWindowCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ZKPVotingWindowCard render time: ${renderTime.toFixed(2)}ms ✅`);
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
            speakMessage("Voting window open", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && votingStatus !== 'closed') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setVotingStatus('closed');
            speakMessage("Voting window closed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, votingStatus]);

  // Simulate signature mismatch monitoring (8% test case)
  useEffect(() => {
    const interval = setInterval(() => {
      const mismatchRate = Math.random() * 12; // 0-12% range
      setSignatureMismatchRate(mismatchRate);
      
      if (mismatchRate > 5) {
        setTamperDetected(true);
        console.log(`⚠️ ZKP signature mismatch: ${mismatchRate.toFixed(1)}% (exceeds 5% threshold)`);
      } else {
        setTamperDetected(false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Simulate additional votes coming in
  useEffect(() => {
    if (votingStatus === 'open' && timeRemaining > 0) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          const newBallot: ZKPBallot = {
            id: `ballot_${Date.now()}`,
            choice: Math.random() > 0.5 ? 'support' : 'oppose',
            zkpHash: generateBallotZKP(),
            didHash: generateDIDHash(),
            credentialHash: generateCredentialHash(),
            timestamp: new Date(),
            verified: Math.random() > 0.1 // 90% verification success rate
          };
          
          setBallots(prev => [...prev, newBallot]);
        }
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [votingStatus, timeRemaining]);

  // Handle vote submission
  const handleCastVote = async (choice: VoteChoice) => {
    if (userVote || votingStatus !== 'open' || timeRemaining <= 0) {
      speakMessage("Vote already cast or voting closed");
      return;
    }

    setIsProcessing(true);
    setVotingStatus('casting');

    // Simulate processing delay (<100ms sync target)
    await new Promise(resolve => setTimeout(resolve, 80));

    // Check for duplicate DID (mock prevention)
    const currentDID = generateDIDHash();
    const existingVote = ballots.find(b => b.didHash === currentDID);
    
    if (existingVote) {
      speakMessage("Duplicate vote detected");
      setIsProcessing(false);
      setVotingStatus('open');
      return;
    }

    const newBallot: ZKPBallot = {
      id: `ballot_user_${Date.now()}`,
      choice: choice,
      zkpHash: generateBallotZKP(),
      didHash: currentDID,
      credentialHash: generateCredentialHash(),
      timestamp: new Date(),
      verified: true
    };

    setBallots(prev => [...prev, newBallot]);
    setUserVote(newBallot);
    setVotingStatus('submitted');
    setIsProcessing(false);

    speakMessage("Vote recorded anonymously");
  };

  const results = calculateResults(ballots);
  const isVotingActive = votingStatus === 'open' && timeRemaining > 0;
  const hasUserVoted = userVote !== null;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        tamperDetected && 'animate-pulse ring-2 ring-red-500/50',
        className
      )}
      role="region"
      aria-label="ZKP Voting Window Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          tamperDetected ? 'bg-red-500 animate-pulse' : 
          isVotingActive ? 'bg-green-500' : 'bg-slate-500'
        )}
        aria-label={
          tamperDetected ? "Status: Tamper Alert" :
          isVotingActive ? "Status: Voting Active" : "Status: Voting Closed"
        }
        title={
          tamperDetected ? `${signatureMismatchRate.toFixed(1)}% signature mismatch detected` :
          isVotingActive ? "Voting window is active" : "Voting window closed"
        }
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Vote className="w-5 h-5 text-cyan-400" />
            ZKP Voting Window
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            isVotingActive ? 'border-green-500/30 bg-green-500/10 text-green-400' :
            votingStatus === 'submitted' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
            'border-slate-500/30 bg-slate-500/10 text-slate-400'
          )}>
            <div className="flex items-center gap-1">
              {isVotingActive ? <Timer className="w-3 h-3" /> :
               votingStatus === 'submitted' ? <CheckCircle className="w-3 h-3" /> :
               <XCircle className="w-3 h-3" />}
              {isVotingActive ? 'Active' :
               votingStatus === 'submitted' ? 'Submitted' : 'Closed'}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Anonymous ZKP-verified amendment voting
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tamper Detection Alert */}
        {tamperDetected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Signature Mismatch Detected
              </span>
            </div>
            <div className="text-xs text-red-300">
              {signatureMismatchRate.toFixed(1)}% ZKP signature mismatch rate (exceeds 5% threshold)
            </div>
          </div>
        )}

        {/* Voting Countdown */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">
              Time Remaining
            </span>
          </div>
          
          <div className="text-center">
            <div className={cn(
              'text-3xl font-bold mb-2',
              timeRemaining > 60 ? 'text-green-400' :
              timeRemaining > 30 ? 'text-amber-400' : 'text-red-400'
            )}>
              {formatCountdown(timeRemaining)}
            </div>
            <div className="text-xs text-slate-400">
              {timeRemaining > 0 ? 'Voting closes in' : 'Voting window closed'}
            </div>
          </div>
        </div>

        {/* Vote Casting Buttons */}
        {isVotingActive && !hasUserVoted && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">
                Cast Your Vote
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleCastVote('support')}
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
                    Support
                  </div>
                )}
              </Button>

              <Button
                onClick={() => handleCastVote('oppose')}
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
                    Oppose
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* User Vote Confirmation */}
        {hasUserVoted && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Vote Recorded
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Choice:</span>
                <span className={userVote?.choice === 'support' ? 'text-green-400' : 'text-red-400'}>
                  {userVote?.choice === 'support' ? 'Support' : 'Oppose'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ZKP Hash:</span>
                <span className="text-blue-400 font-mono">{userVote?.zkpHash}</span>
              </div>
            </div>
          </div>
        )}

        {/* Public Vote Results */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Anonymous Results
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Votes:</span>
              <span className="text-slate-200 font-bold">{results.totalVotes}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-400">Support</span>
                <span className="text-green-400">{results.supportPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={results.supportPercentage} 
                className="h-2 bg-slate-700"
              />
              
              <div className="flex justify-between text-xs">
                <span className="text-red-400">Oppose</span>
                <span className="text-red-400">{results.opposePercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={results.opposePercentage} 
                className="h-2 bg-slate-700"
              />
            </div>

            <div className="pt-2 border-t border-slate-700 text-center">
              <div className="text-xs text-slate-400">
                Verified: {ballots.filter(b => b.verified).length} / {ballots.length} ballots
              </div>
            </div>
          </div>
        </div>

        {/* ZKP Verification Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              ZKP Verification
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Signature Integrity:</span>
              <span className={tamperDetected ? 'text-red-400' : 'text-green-400'}>
                {tamperDetected ? 'Compromised' : 'Verified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cross-Deck Sync:</span>
              <span className="text-blue-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DID Validation:</span>
              <span className="text-green-400">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mismatch Rate:</span>
              <span className={signatureMismatchRate > 5 ? 'text-red-400' : 'text-green-400'}>
                {signatureMismatchRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          ZKP voting window interface ready,
          Time remaining: {formatCountdown(timeRemaining)},
          Current results: {results.supportPercentage.toFixed(0)}% support {results.opposePercentage.toFixed(0)}% oppose,
          Total votes: {results.totalVotes},
          {hasUserVoted && `Your vote: ${userVote?.choice} recorded`},
          {tamperDetected && `Alert: ${signatureMismatchRate.toFixed(1)}% signature mismatch detected`}
        </div>
      </CardContent>
    </Card>
  );
};
export default ZKPVotingWindowCard;
