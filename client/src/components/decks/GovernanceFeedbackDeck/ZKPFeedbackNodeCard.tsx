import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '../../../translation/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock,
  XCircle,
  Shield, 
  Hash,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Minus,
  Send,
  Activity
} from 'lucide-react';

type FeedbackClassification = 'approve' | 'dissent' | 'amend' | 'abstain';
type VerificationStatus = 'verified' | 'pending' | 'failed';

interface FeedbackEntry {
  id: string;
  proposalId: string;
  classification: FeedbackClassification;
  feedback: string;
  submittedBy: string;
  submittedAt: Date;
  zkpHash: string;
  verificationStatus: VerificationStatus;
  integrityScore: number;
  signerMatch: boolean;
}

interface FeedbackSession {
  totalPayloads: number;
  verifiedPayloads: number;
  pendingPayloads: number;
  failedPayloads: number;
  matchPercentage: number;
  integrityMismatchRate: number;
  signerMismatchRate: number;
  isPushbackActive: boolean;
  lastVerifiedAt: Date;
  entries: FeedbackEntry[];
}

interface ZKPFeedbackNodeCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Cross-deck hash pools for verification sync
const DECK_6_HASH_POOL = [
  'zkp_hash_tu0011_consensus_xyz001',
  'zkp_hash_tu0012_consensus_xyz002',
  'zkp_hash_tu0013_consensus_xyz003',
  'zkp_hash_tu0014_consensus_xyz004',
  'zkp_hash_tu0015_consensus_xyz005',
  'zkp_hash_tu0016_consensus_xyz006',
  'zkp_hash_tu0017_consensus_xyz007',
  'zkp_hash_tu0018_consensus_xyz008'
];

const DECK_9_VOTE_HASHES = [
  'zkp_vote_consensus_001',
  'zkp_vote_consensus_002',
  'zkp_vote_consensus_003',
  'zkp_vote_consensus_004',
  'zkp_vote_proposal_001',
  'zkp_vote_proposal_002',
  'zkp_vote_proposal_003',
  'zkp_vote_proposal_004'
];

// Mock feedback session data with 10 verified out of 12 total (83.3%)
const MOCK_FEEDBACK_SESSION: FeedbackSession = {
  totalPayloads: 12,
  verifiedPayloads: 10,
  pendingPayloads: 1,
  failedPayloads: 1,
  matchPercentage: 83.3, // 10/12 = 83.3%
  integrityMismatchRate: 8.3, // 1/12 = 8.3% (below 10% threshold)
  signerMismatchRate: 8.3, // 1/12 = 8.3% (below 10% threshold)
  isPushbackActive: false, // Both rates below 10%
  lastVerifiedAt: new Date(Date.now() - 180000), // 3 minutes ago
  entries: [
    {
      id: 'feedback_001',
      proposalId: 'tu-prop-0004',
      classification: 'approve',
      feedback: 'Strong support for community infrastructure investment',
      submittedBy: 'did:civic:citizen_alpha_001',
      submittedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      zkpHash: 'zkp_hash_tu0011_consensus_xyz001',
      verificationStatus: 'verified',
      integrityScore: 98.5,
      signerMatch: true
    },
    {
      id: 'feedback_002',
      proposalId: 'tu-prop-0005',
      classification: 'amend',
      feedback: 'Proposal needs environmental impact assessment clause',
      submittedBy: 'did:civic:citizen_beta_002',
      submittedAt: new Date(Date.now() - 1500000), // 25 minutes ago
      zkpHash: 'zkp_hash_tu0012_consensus_xyz002',
      verificationStatus: 'verified',
      integrityScore: 97.2,
      signerMatch: true
    },
    {
      id: 'feedback_003',
      proposalId: 'tu-prop-0006',
      classification: 'dissent',
      feedback: 'Insufficient budget allocation for safety measures',
      submittedBy: 'did:civic:citizen_gamma_003',
      submittedAt: new Date(Date.now() - 1200000), // 20 minutes ago
      zkpHash: 'zkp_hash_tu0013_consensus_xyz003',
      verificationStatus: 'verified',
      integrityScore: 96.8,
      signerMatch: true
    },
    {
      id: 'feedback_004',
      proposalId: 'tu-prop-0007',
      classification: 'approve',
      feedback: 'Educational technology modernization is essential',
      submittedBy: 'did:civic:citizen_delta_004',
      submittedAt: new Date(Date.now() - 900000), // 15 minutes ago
      zkpHash: 'zkp_hash_tu0014_consensus_xyz004',
      verificationStatus: 'verified',
      integrityScore: 99.1,
      signerMatch: true
    },
    {
      id: 'feedback_005',
      proposalId: 'tu-prop-0008',
      classification: 'abstain',
      feedback: 'Need more information on renewable energy costs',
      submittedBy: 'did:civic:citizen_epsilon_005',
      submittedAt: new Date(Date.now() - 600000), // 10 minutes ago
      zkpHash: 'zkp_hash_tu0015_consensus_xyz005',
      verificationStatus: 'verified',
      integrityScore: 95.7,
      signerMatch: true
    },
    {
      id: 'feedback_006',
      proposalId: 'tu-prop-0009',
      classification: 'amend',
      feedback: 'Transparency measures should include public audit requirements',
      submittedBy: 'did:civic:citizen_zeta_006',
      submittedAt: new Date(Date.now() - 480000), // 8 minutes ago
      zkpHash: 'zkp_hash_tu0016_consensus_xyz006',
      verificationStatus: 'verified',
      integrityScore: 97.9,
      signerMatch: true
    },
    {
      id: 'feedback_007',
      proposalId: 'tu-prop-0010',
      classification: 'approve',
      feedback: 'Community safety enhancement plan is comprehensive',
      submittedBy: 'did:civic:citizen_eta_007',
      submittedAt: new Date(Date.now() - 420000), // 7 minutes ago
      zkpHash: 'zkp_hash_tu0017_consensus_xyz007',
      verificationStatus: 'verified',
      integrityScore: 98.3,
      signerMatch: true
    },
    {
      id: 'feedback_008',
      proposalId: 'tu-prop-0003',
      classification: 'dissent',
      feedback: 'Digital privacy framework lacks enforcement mechanisms',
      submittedBy: 'did:civic:citizen_theta_008',
      submittedAt: new Date(Date.now() - 360000), // 6 minutes ago
      zkpHash: 'zkp_hash_tu0018_consensus_xyz008',
      verificationStatus: 'verified',
      integrityScore: 96.4,
      signerMatch: true
    },
    {
      id: 'feedback_009',
      proposalId: 'tu-prop-0005',
      classification: 'approve',
      feedback: 'Environmental impact assessment protocol is thorough',
      submittedBy: 'did:civic:citizen_iota_009',
      submittedAt: new Date(Date.now() - 300000), // 5 minutes ago
      zkpHash: 'zkp_vote_consensus_001',
      verificationStatus: 'verified',
      integrityScore: 97.6,
      signerMatch: true
    },
    {
      id: 'feedback_010',
      proposalId: 'tu-prop-0006',
      classification: 'amend',
      feedback: 'Safety enhancement requires additional community input sessions',
      submittedBy: 'did:civic:citizen_kappa_010',
      submittedAt: new Date(Date.now() - 240000), // 4 minutes ago
      zkpHash: 'zkp_vote_consensus_002',
      verificationStatus: 'verified',
      integrityScore: 98.8,
      signerMatch: true
    },
    {
      id: 'feedback_011',
      proposalId: 'tu-prop-0007',
      classification: 'approve',
      feedback: 'Technology modernization timeline is realistic',
      submittedBy: 'did:civic:citizen_lambda_011',
      submittedAt: new Date(Date.now() - 180000), // 3 minutes ago
      zkpHash: 'zkp_invalid_hash_mismatch',
      verificationStatus: 'failed',
      integrityScore: 45.2,
      signerMatch: false
    },
    {
      id: 'feedback_012',
      proposalId: 'tu-prop-0008',
      classification: 'abstain',
      feedback: 'Renewable energy proposal needs cost-benefit analysis',
      submittedBy: 'did:civic:citizen_mu_012',
      submittedAt: new Date(Date.now() - 120000), // 2 minutes ago
      zkpHash: 'zkp_vote_proposal_003',
      verificationStatus: 'pending',
      integrityScore: 0,
      signerMatch: false
    }
  ]
};

const getClassificationIcon = (classification: FeedbackClassification) => {
  switch (classification) {
    case 'approve':
      return <ThumbsUp className="w-3 h-3 text-green-400" />;
    case 'dissent':
      return <ThumbsDown className="w-3 h-3 text-red-400" />;
    case 'amend':
      return <Edit3 className="w-3 h-3 text-yellow-400" />;
    case 'abstain':
      return <Minus className="w-3 h-3 text-gray-400" />;
  }
};

const getClassificationColor = (classification: FeedbackClassification): string => {
  switch (classification) {
    case 'approve':
      return 'text-green-400';
    case 'dissent':
      return 'text-red-400';
    case 'amend':
      return 'text-yellow-400';
    case 'abstain':
      return 'text-gray-400';
  }
};

const getVerificationIcon = (status: VerificationStatus) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="w-3 h-3 text-blue-400" />;
    case 'pending':
      return <Clock className="w-3 h-3 text-amber-400 animate-pulse" />;
    case 'failed':
      return <XCircle className="w-3 h-3 text-red-400" />;
  }
};

const getVerificationRing = (status: VerificationStatus): string => {
  switch (status) {
    case 'verified':
      return 'ring-2 ring-blue-500/50 animate-pulse';
    case 'pending':
      return 'ring-2 ring-amber-500/50 animate-pulse';
    case 'failed':
      return 'ring-2 ring-red-500/50';
  }
};

const formatClassification = (classification: FeedbackClassification): string => {
  return classification.charAt(0).toUpperCase() + classification.slice(1);
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
};

const validateZKPHash = (hash: string): boolean => {
  return DECK_6_HASH_POOL.includes(hash) || DECK_9_VOTE_HASHES.includes(hash);
};

export const ZKPFeedbackNodeCard: React.FC<ZKPFeedbackNodeCardProps> = ({ className }) => {
  const { t } = useTranslation();
  const [feedbackSession, setFeedbackSession] = useState<FeedbackSession>(MOCK_FEEDBACK_SESSION);
  const [newFeedback, setNewFeedback] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<FeedbackClassification>('approve');
  const [selectedProposal, setSelectedProposal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ZKPFeedbackNodeCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ZKPFeedbackNodeCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play feedback node ready message on mount with translation
          const message = t('tts.node.ready', { count: feedbackSession.verifiedPayloads });
          const utterance = new SpeechSynthesisUtterance(message);
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
  }, [feedbackSession.verifiedPayloads]);

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim() || !selectedProposal) return;
    
    const validationStart = performance.now();
    setIsSubmitting(true);
    
    // Simulate feedback processing with validation time tracking
    setTimeout(() => {
      const newEntry: FeedbackEntry = {
        id: `feedback_${Date.now()}`,
        proposalId: selectedProposal,
        classification: selectedClassification,
        feedback: newFeedback,
        submittedBy: `did:civic:citizen_user_${Date.now()}`,
        submittedAt: new Date(),
        zkpHash: DECK_6_HASH_POOL[Math.floor(Math.random() * DECK_6_HASH_POOL.length)],
        verificationStatus: 'pending',
        integrityScore: Math.floor(Math.random() * 20) + 80, // 80-99
        signerMatch: Math.random() > 0.1 // 90% match rate
      };
      
      setFeedbackSession(prev => {
        const updatedEntries = [...prev.entries, newEntry];
        const newTotal = prev.totalPayloads + 1;
        const newPending = prev.pendingPayloads + 1;
        
        return {
          ...prev,
          entries: updatedEntries,
          totalPayloads: newTotal,
          pendingPayloads: newPending,
          lastVerifiedAt: new Date()
        };
      });
      
      setNewFeedback('');
      setSelectedProposal('');
      setIsSubmitting(false);
      
      const validationTime = performance.now() - validationStart;
      if (validationTime > 100) {
        console.warn(`Feedback validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
      }
      
      // TTS feedback confirmation
      if (ttsStatus.isReady) {
        const utterance = new SpeechSynthesisUtterance(`Feedback submitted for ${selectedProposal}`);
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }, 1500);
  };

  const getSessionStatusRing = (): string => {
    if (feedbackSession.isPushbackActive) {
      return 'ring-2 ring-red-500/50 animate-pulse';
    }
    
    const matchRate = feedbackSession.matchPercentage;
    if (matchRate >= 90) {
      return 'ring-2 ring-green-500/50 animate-pulse';
    } else if (matchRate >= 80) {
      return 'ring-2 ring-blue-500/50 animate-pulse';
    } else {
      return 'ring-2 ring-amber-500/50 animate-pulse';
    }
  };

  const proposalOptions = [
    'tu-prop-0003',
    'tu-prop-0004',
    'tu-prop-0005',
    'tu-prop-0006',
    'tu-prop-0007',
    'tu-prop-0008',
    'tu-prop-0009',
    'tu-prop-0010'
  ];

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        getSessionStatusRing(),
        className
      )}
      role="region"
      aria-label="ZKP Feedback Node Interface"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            ZKP Feedback Node
          </CardTitle>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Live Sync
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Governance feedback classification system
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Panel */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Verification Status
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-blue-400">
                {feedbackSession.verifiedPayloads}
              </div>
              <div className="text-xs text-slate-400">Verified</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {feedbackSession.matchPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Match Rate</div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Integrity/Signer Status</span>
              <span>
                {feedbackSession.integrityMismatchRate.toFixed(1)}% / {feedbackSession.signerMismatchRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  feedbackSession.isPushbackActive ? 'bg-red-500' : 'bg-green-500'
                )}
                style={{ width: `${100 - Math.max(feedbackSession.integrityMismatchRate, feedbackSession.signerMismatchRate)}%` }}
              />
            </div>
          </div>
          
          {feedbackSession.isPushbackActive ? (
            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
              ⚠️ Pushback: &gt;10% integrity/signer mismatch
            </div>
          ) : (
            <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
              ✅ System operational - mismatch rates within tolerance
            </div>
          )}
        </div>

        {/* Feedback Submission */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Submit Feedback
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            <Select 
              value={selectedProposal} 
              onValueChange={setSelectedProposal}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-200">
                <SelectValue placeholder="Proposal ID" />
              </SelectTrigger>
              <SelectContent>
                {proposalOptions.map((proposalId) => (
                  <SelectItem key={proposalId} value={proposalId}>
                    {proposalId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedClassification} 
              onValueChange={(value) => setSelectedClassification(value as FeedbackClassification)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="dissent">Dissent</SelectItem>
                <SelectItem value="amend">Amend</SelectItem>
                <SelectItem value="abstain">Abstain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Textarea
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder="Enter your feedback or comments..."
            className={cn(
              'min-h-[80px] bg-slate-800/50 border-slate-700/50',
              'text-slate-200 placeholder-slate-400',
              'focus:border-blue-500/50 focus:ring-blue-500/20'
            )}
            maxLength={300}
            aria-label="Feedback content"
          />
          
          <div className="flex justify-between text-xs text-slate-400">
            <span>Classification: {formatClassification(selectedClassification)}</span>
            <span>{newFeedback.length}/300</span>
          </div>
          
          <Button
            onClick={handleSubmitFeedback}
            disabled={isSubmitting || !newFeedback.trim() || !selectedProposal}
            className={cn(
              'w-full min-h-[48px] font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:bg-slate-700/50 disabled:text-slate-500'
            )}
            aria-label="Submit feedback"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>

        {/* Feedback Thread */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-200">
              Feedback Thread ({feedbackSession.totalPayloads})
            </label>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              ZKP Synced
            </Badge>
          </div>
          
          <ScrollArea className="h-64 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="p-3 space-y-3" aria-live="polite">
              {feedbackSession.entries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'bg-slate-800/50 rounded-lg border border-slate-700/50 p-3',
                    getVerificationRing(entry.verificationStatus)
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getClassificationIcon(entry.classification)}
                      <span className={cn('text-xs font-medium', getClassificationColor(entry.classification))}>
                        {formatClassification(entry.classification)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getVerificationIcon(entry.verificationStatus)}
                      <span className="text-xs font-medium text-slate-300">
                        {entry.verificationStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Proposal:</span>
                      <span className="text-slate-300 font-mono">{entry.proposalId}</span>
                    </div>
                    
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {entry.feedback}
                    </p>
                    
                    {entry.verificationStatus === 'verified' && (
                      <div className="text-xs text-slate-400">
                        Integrity: {entry.integrityScore.toFixed(1)}% | Signer: {entry.signerMatch ? '✓' : '✗'}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono truncate max-w-[120px]">
                          {entry.zkpHash}
                        </span>
                        {validateZKPHash(entry.zkpHash) && (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                      <span>{formatTimeAgo(entry.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cross-Deck Sync Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Sync
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">VoteConsensusCard:</span>
              <span className="text-green-400">Synced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ZKProposalLogCard:</span>
              <span className="text-green-400">Synced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hash Validation:</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Verified:</span>
              <span className="text-slate-300">{formatTimeAgo(feedbackSession.lastVerifiedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            ZKP-bound governance feedback classification
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default ZKPFeedbackNodeCard;
