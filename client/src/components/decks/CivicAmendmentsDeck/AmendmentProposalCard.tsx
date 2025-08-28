import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  FileEdit,
  Hash,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  Shield,
  Zap,
  Calendar,
  User,
  Settings
} from 'lucide-react';

type AmendmentScope = 'local' | 'regional' | 'national' | 'constitutional';
type AmendmentIntent = 'clarification' | 'expansion' | 'restriction' | 'repeal' | 'creation';
type ProposalStatus = 'draft' | 'validating' | 'submitted' | 'endorsed' | 'failed';

interface AmendmentProposal {
  id: string;
  title: string;
  body: string;
  scope: AmendmentScope;
  intent: AmendmentIntent;
  submittedBy: string;
  submittedAt: Date;
  endorsementCount: number;
  zkpHash: string;
  overlapDetected: boolean;
  overlapPercentage: number;
  status: ProposalStatus;
  didVerified: boolean;
  credentialHash: string;
}

interface AmendmentProposalCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock validation test cases (5 scenarios)
const MOCK_VALIDATION_CASES = [
  { title: 'Voting Rights Clarification', overlap: 15, shouldPass: true },
  { title: 'Privacy Protection Amendment', overlap: 8, shouldPass: true },
  { title: 'Digital Rights Framework', overlap: 32, shouldPass: false }, // >20% overlap
  { title: 'Transparency Requirements', overlap: 18, shouldPass: true },
  { title: 'Enforcement Protocol Update', overlap: 27, shouldPass: false } // >20% overlap
];

// Get amendment scope info
const getAmendmentScopeInfo = (scope: AmendmentScope) => {
  switch (scope) {
    case 'local':
      return { label: 'Local', color: 'text-blue-400', description: 'Municipal/City level' };
    case 'regional':
      return { label: 'Regional', color: 'text-green-400', description: 'State/Province level' };
    case 'national':
      return { label: 'National', color: 'text-purple-400', description: 'Federal/Country level' };
    case 'constitutional':
      return { label: 'Constitutional', color: 'text-amber-400', description: 'Constitutional amendment' };
  }
};

// Get amendment intent info
const getAmendmentIntentInfo = (intent: AmendmentIntent) => {
  switch (intent) {
    case 'clarification':
      return { label: 'Clarification', color: 'text-cyan-400', icon: <Eye className="w-3 h-3" /> };
    case 'expansion':
      return { label: 'Expansion', color: 'text-green-400', icon: <Zap className="w-3 h-3" /> };
    case 'restriction':
      return { label: 'Restriction', color: 'text-amber-400', icon: <Shield className="w-3 h-3" /> };
    case 'repeal':
      return { label: 'Repeal', color: 'text-red-400', icon: <XCircle className="w-3 h-3" /> };
    case 'creation':
      return { label: 'Creation', color: 'text-purple-400', icon: <CheckCircle className="w-3 h-3" /> };
  }
};

// Get proposal status info
const getProposalStatusInfo = (status: ProposalStatus) => {
  switch (status) {
    case 'draft':
      return {
        icon: <FileEdit className="w-4 h-4 text-slate-400" />,
        label: 'Draft',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20'
      };
    case 'validating':
      return {
        icon: <Clock className="w-4 h-4 text-blue-400" />,
        label: 'Validating',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      };
    case 'submitted':
      return {
        icon: <Send className="w-4 h-4 text-green-400" />,
        label: 'Submitted',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20'
      };
    case 'endorsed':
      return {
        icon: <Users className="w-4 h-4 text-purple-400" />,
        label: 'Endorsed',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
      };
    case 'failed':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Failed',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20'
      };
  }
};

// Generate ZKP hash
const generateZKPHash = (): string => {
  return `zkp_amend_${Math.random().toString(36).substr(2, 12)}`;
};

// Generate credential hash (cross-deck sync with Deck #12)
const generateCredentialHash = (): string => {
  return `cred_${Math.random().toString(36).substr(2, 10)}`;
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

export const AmendmentProposalCard: React.FC<AmendmentProposalCardProps> = ({ className }) => {
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [scope, setScope] = useState<AmendmentScope>('local');
  const [intent, setIntent] = useState<AmendmentIntent>('clarification');
  const [proposal, setProposal] = useState<AmendmentProposal | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [pathBTriggered, setPathBTriggered] = useState<boolean>(false);
  const [overlapRate, setOverlapRate] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`AmendmentProposalCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`AmendmentProposalCard render time: ${renderTime.toFixed(2)}ms ✅`);
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
            speakMessage("Amendment proposal interface ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Simulate overlap monitoring (Path B trigger at >20%)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentOverlap = Math.random() * 35; // 0-35% range
      setOverlapRate(currentOverlap);
      
      if (currentOverlap > 20) {
        setPathBTriggered(true);
        console.log(`⚠️ Path B triggered: ${currentOverlap.toFixed(1)}% proposal overlap`);
      } else {
        setPathBTriggered(false);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  const handleSubmitProposal = async () => {
    if (!title.trim() || !body.trim()) {
      speakMessage("Please complete all required fields");
      return;
    }

    setIsProcessing(true);

    // Use validation test case based on title
    const testCase = MOCK_VALIDATION_CASES.find(tc => 
      title.toLowerCase().includes(tc.title.toLowerCase().split(' ')[0])
    ) || MOCK_VALIDATION_CASES[0];

    // Validation phase
    setProposal(prev => prev ? { ...prev, status: 'validating' } : {
      id: `amend_${Date.now().toString().slice(-6)}`,
      title,
      body,
      scope,
      intent,
      submittedBy: 'did:civic:user_current',
      submittedAt: new Date(),
      endorsementCount: 0,
      zkpHash: '',
      overlapDetected: testCase.overlap > 20,
      overlapPercentage: testCase.overlap,
      status: 'validating',
      didVerified: true,
      credentialHash: generateCredentialHash()
    });

    await new Promise(resolve => setTimeout(resolve, 100)); // <100ms validation target

    if (testCase.shouldPass) {
      // Successful submission
      const zkpHash = generateZKPHash();
      const endorsements = Math.floor(Math.random() * 50) + 10; // 10-60 endorsements

      setProposal(prev => prev ? {
        ...prev,
        status: 'submitted',
        zkpHash: zkpHash,
        endorsementCount: endorsements
      } : null);

      speakMessage("Proposal endorsed");
      
      // Auto-transition to endorsed status
      setTimeout(() => {
        setProposal(prev => prev ? { ...prev, status: 'endorsed' } : null);
      }, 2000);
    } else {
      // Failed validation due to overlap
      setProposal(prev => prev ? {
        ...prev,
        status: 'failed',
        zkpHash: generateZKPHash()
      } : null);
      
      speakMessage("Proposal failed validation due to overlap");
    }

    setIsProcessing(false);
  };

  // Reset form
  const handleResetForm = () => {
    setTitle('');
    setBody('');
    setScope('local');
    setIntent('clarification');
    setProposal(null);
    speakMessage("Form reset");
  };

  const scopeInfo = getAmendmentScopeInfo(scope);
  const intentInfo = getAmendmentIntentInfo(intent);
  const statusInfo = proposal ? getProposalStatusInfo(proposal.status) : null;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        proposal?.status === 'submitted' && 'animate-pulse ring-2 ring-blue-500/50',
        className
      )}
      role="region"
      aria-label="Amendment Proposal Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          pathBTriggered ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        )}
        aria-label={pathBTriggered ? "Status: Path B Alert" : "Status: Active"}
        title={pathBTriggered ? `${overlapRate.toFixed(1)}% proposal overlap detected` : "Amendment system active"}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-cyan-400" />
            Amendment Proposal
          </CardTitle>
          {statusInfo && (
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
          )}
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Submit civic amendments with anonymous endorsement
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Path B Overlap Alert */}
        {pathBTriggered && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Path B: Overlap Detected
              </span>
            </div>
            <div className="text-xs text-red-300">
              Proposal overlap: {overlapRate.toFixed(1)}% (exceeds 20% threshold)
            </div>
          </div>
        )}

        {!proposal && (
          <>
            {/* Amendment Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Amendment Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter amendment title..."
                className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-400"
                maxLength={100}
              />
            </div>

            {/* Amendment Body */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Amendment Text
              </label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe the proposed amendment in detail..."
                className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-400 min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-slate-400 text-right">
                {body.length}/500 characters
              </div>
            </div>

            {/* Scope and Intent Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Scope
                </label>
                <Select value={scope} onValueChange={(value: AmendmentScope) => setScope(value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="constitutional">Constitutional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Intent
                </label>
                <Select value={intent} onValueChange={(value: AmendmentIntent) => setIntent(value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="clarification">Clarification</SelectItem>
                    <SelectItem value="expansion">Expansion</SelectItem>
                    <SelectItem value="restriction">Restriction</SelectItem>
                    <SelectItem value="repeal">Repeal</SelectItem>
                    <SelectItem value="creation">Creation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scope and Intent Info */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scope:</span>
                  <span className={scopeInfo.color}>{scopeInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Intent:</span>
                  <div className="flex items-center gap-1">
                    {intentInfo.icon}
                    <span className={intentInfo.color}>{intentInfo.label}</span>
                  </div>
                </div>
                <div className="text-slate-400 text-center pt-1 border-t border-slate-700">
                  {scopeInfo.description}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitProposal}
              disabled={!title.trim() || !body.trim() || isProcessing}
              className={cn(
                'w-full min-h-[48px]',
                'bg-cyan-600 hover:bg-cyan-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Amendment
                </div>
              )}
            </Button>
          </>
        )}

        {/* Proposal Details */}
        {proposal && (
          <div className="space-y-4">
            {/* Proposal Summary */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileEdit className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-slate-200">
                  Proposal Summary
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-slate-200 text-sm">
                  {proposal.title}
                </div>
                <div className="text-xs text-slate-300 line-clamp-3">
                  {proposal.body}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Submitted:</span>
                  <span className="text-slate-300">{formatTimestamp(proposal.submittedAt)}</span>
                </div>
              </div>
            </div>

            {/* Anonymous Endorsements */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-slate-200">
                  Anonymous Endorsements
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {proposal.endorsementCount}
                </div>
                <div className="text-xs text-slate-400">
                  Community endorsements received
                </div>
              </div>
            </div>

            {/* ZKP and Cross-Deck Sync */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-slate-200">
                  ZKP Validation
                </span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">ZKP Hash:</span>
                  <span className="text-green-400 font-mono break-all">
                    {proposal.zkpHash || 'Generating...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DID Verified:</span>
                  <span className={proposal.didVerified ? 'text-green-400' : 'text-red-400'}>
                    {proposal.didVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credential Hash:</span>
                  <span className="text-blue-400 font-mono">{proposal.credentialHash}</span>
                </div>
                {proposal.overlapDetected && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Overlap Rate:</span>
                    <span className="text-red-400">{proposal.overlapPercentage.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Results */}
            {proposal.status === 'failed' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    Validation Failed
                  </span>
                </div>
                <div className="text-xs text-red-300">
                  Proposal rejected due to {proposal.overlapPercentage.toFixed(1)}% overlap with existing amendments
                </div>
              </div>
            )}

            {/* New Proposal Button */}
            <Button
              onClick={handleResetForm}
              variant="outline"
              className={cn(
                'w-full min-h-[48px]',
                'border-slate-600 text-slate-300 hover:bg-slate-700'
              )}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                New Amendment
              </div>
            </Button>
          </div>
        )}

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Amendment proposal interface ready,
          Current scope: {scopeInfo.label},
          Current intent: {intentInfo.label},
          {proposal && `Proposal status: ${statusInfo?.label}`},
          {proposal && `Endorsements: ${proposal.endorsementCount}`},
          {pathBTriggered && `Alert: ${overlapRate.toFixed(1)}% proposal overlap detected`}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmendmentProposalCard;