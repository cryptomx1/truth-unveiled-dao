import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Lock, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import TTSToggle from '@/components/tts/TTSToggle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CivicProposal {
  id: string;
  title: string;
  summary: string;
  topic: string;
  proposer: string;
  region: string;
  category: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  daysLeft: number;
}

interface SwipeDecision {
  proposalId: string;
  decision: 'support' | 'reject';
  timestamp: Date;
}

interface CivicSwipeCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock civic proposals data (CAM-aligned structure)
const MOCK_PROPOSALS: CivicProposal[] = [
  {
    id: 'prop-001',
    title: 'Expand Public Transit Routes',
    summary: 'Proposal to add 3 new bus routes connecting underserved neighborhoods to downtown area, including late-night service.',
    topic: 'Transportation',
    proposer: 'City Planning Council',
    region: 'Metro District',
    category: 'Infrastructure',
    urgencyLevel: 'medium',
    daysLeft: 12
  },
  {
    id: 'prop-002', 
    title: 'Community Garden Initiative',
    summary: 'Establish neighborhood gardens in vacant lots to promote food security and community engagement.',
    topic: 'Community Development',
    proposer: 'Green Future Coalition',
    region: 'South Ward',
    category: 'Environment',
    urgencyLevel: 'low',
    daysLeft: 18
  },
  {
    id: 'prop-003',
    title: 'Emergency Housing Fund',
    summary: 'Create rapid response fund for homeless individuals during extreme weather events and emergencies.',
    topic: 'Social Services',
    proposer: 'Housing Justice Network',
    region: 'Citywide',
    category: 'Social Welfare',
    urgencyLevel: 'high',
    daysLeft: 5
  }
];

const TTS_MESSAGE = "Swipe to shape democracy—your voice matters.";

export const CivicSwipeCard: React.FC<CivicSwipeCardProps> = ({ className }) => {
  const [currentProposalIndex, setCurrentProposalIndex] = useState(0);
  const [swipeDecisions, setSwipeDecisions] = useState<SwipeDecision[]>([]);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentProposal = MOCK_PROPOSALS[currentProposalIndex];

  // Initialize TTS on component mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          const waitForVoices = () => {
            return new Promise<void>((resolve) => {
              const voices = speechSynthesis.getVoices();
              if (voices.length > 0) {
                resolve();
              } else {
                speechSynthesis.addEventListener('voiceschanged', () => {
                  resolve();
                }, { once: true });
              }
            });
          };

          await waitForVoices();
          setTtsStatus({ isReady: true, isPlaying: false });
        } else {
          setTtsStatus({ isReady: false, isPlaying: false, error: 'TTS not supported' });
        }
      } catch (error) {
        setTtsStatus({ isReady: false, isPlaying: false, error: 'TTS initialization failed' });
      }
    };

    initializeTTS();

    // Log render performance
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CivicSwipeCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CivicSwipeCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  const handleTTSToggle = async () => {
    if (!ttsStatus.isReady) {
      toast({
        title: "TTS not available",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (ttsStatus.isPlaying) {
      speechSynthesis.cancel();
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(TTS_MESSAGE);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: true }));
      };
      
      utterance.onend = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: false }));
      };
      
      utterance.onerror = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: false, error: 'TTS playback failed' }));
        toast({
          title: "TTS Error",
          description: "Failed to play text-to-speech message.",
          variant: "destructive",
        });
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      setTtsStatus(prev => ({ ...prev, error: 'TTS playback failed' }));
      toast({
        title: "TTS Error",
        description: "Failed to play text-to-speech message.",
        variant: "destructive",
      });
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentProposal) return;

    const decision: 'support' | 'reject' = direction === 'right' ? 'support' : 'reject';
    
    // Store swipe decision
    const newDecision: SwipeDecision = {
      proposalId: currentProposal.id,
      decision,
      timestamp: new Date()
    };

    setSwipeDecisions(prev => [...prev, newDecision]);
    setSwipeDirection(direction);
    setIsSwipeActive(true);
    setShowCheckmark(true);

    // Show feedback toast
    toast({
      title: decision === 'support' ? "Proposal Supported" : "Proposal Rejected",
      description: `Your vote on "${currentProposal.title}" has been recorded.`,
    });

    // Animate and move to next proposal
    setTimeout(() => {
      setIsSwipeActive(false);
      setSwipeDirection(null);
      
      if (currentProposalIndex < MOCK_PROPOSALS.length - 1) {
        setCurrentProposalIndex(prev => prev + 1);
      } else {
        // Reset to first proposal when reaching the end
        setCurrentProposalIndex(0);
        toast({
          title: "All proposals reviewed",
          description: "Starting over with first proposal.",
        });
      }
    }, 300);

    // Fade out checkmark after 500ms
    setTimeout(() => {
      setShowCheckmark(false);
    }, 500);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (!currentProposal) {
    return (
      <div className="dao-card-gradient border border-[hsl(var(--dao-border))] rounded-xl p-6 max-w-sm mx-auto">
        <div className="text-center text-white">
          <p>No proposals available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'dao-card-gradient border border-[hsl(var(--dao-border))] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 max-w-sm mx-auto relative overflow-hidden',
        className
      )}
      role="region"
      aria-label="Civic Proposal Voting Card"
      data-testid="civic-swipe-card"
    >
      {/* Swipe Animation Overlay */}
      {isSwipeActive && (
        <div 
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center rounded-xl transition-all duration-300',
            swipeDirection === 'right' ? 'bg-green-500/30' : 'bg-red-500/30'
          )}
        >
          <div className={cn(
            'text-6xl font-bold',
            swipeDirection === 'right' ? 'text-green-400' : 'text-red-400'
          )}>
            {swipeDirection === 'right' ? '✓' : '✗'}
          </div>
        </div>
      )}

      {/* Success Checkmark Overlay */}
      {showCheckmark && (
        <div 
          className={cn(
            'absolute inset-0 z-20 flex items-center justify-center rounded-xl transition-opacity duration-500',
            showCheckmark ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="text-8xl text-green-400 animate-pulse">
            ✅
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 dao-primary-gradient rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🗳️</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Civic Vote
            </h2>
            <p className="text-sm text-gray-300">
              Proposal {currentProposalIndex + 1} of {MOCK_PROPOSALS.length}
            </p>
          </div>
        </div>
        
        {/* TTS Toggle */}
        <TTSToggle
          deckId="governance"
          moduleId="civic-swipe"
          content={`Civic Vote. ${currentProposal.title}. ${currentProposal.summary}. Topic: ${currentProposal.topic}. Region: ${currentProposal.region}. ${currentProposal.urgencyLevel} priority with ${currentProposal.daysLeft} days left to vote.`}
          size="sm"
          variant="outline"
        />
      </div>

      {/* Proposal Card */}
      <div 
        ref={cardRef}
        className={cn(
          'bg-white/10 rounded-lg p-4 border border-white/20 mb-6 transition-transform duration-300',
          isSwipeActive && swipeDirection === 'right' && 'transform translate-x-full',
          isSwipeActive && swipeDirection === 'left' && 'transform -translate-x-full'
        )}
      >
        {/* Urgency Badge */}
        <div className="flex items-center justify-between mb-3">
          <span 
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
              getUrgencyColor(currentProposal.urgencyLevel)
            )}
          >
            {currentProposal.urgencyLevel} priority
          </span>
          <span className="text-xs text-gray-400">
            {currentProposal.daysLeft} days left
          </span>
        </div>

        {/* Proposal Title */}
        <h3 className="text-lg font-semibold text-white mb-2">
          {currentProposal.title}
        </h3>

        {/* Proposal Summary */}
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          {currentProposal.summary}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Topic:</span>
            <span className="text-white ml-1">{currentProposal.topic}</span>
          </div>
          <div>
            <span className="text-gray-400">Region:</span>
            <span className="text-white ml-1">{currentProposal.region}</span>
          </div>
          <div>
            <span className="text-gray-400">Category:</span>
            <span className="text-white ml-1">{currentProposal.category}</span>
          </div>
          <div>
            <span className="text-gray-400">Proposer:</span>
            <span className="text-white ml-1">{currentProposal.proposer}</span>
          </div>
        </div>
      </div>

      {/* ZKP Locked Section */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-6">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">
            ZK Vote Proof – Unlock in Deck #5
          </span>
          <Info className="w-3 h-3 text-gray-500" />
        </div>
      </div>

      {/* Swipe Controls */}
      <div className="flex items-center justify-center space-x-8">
        {/* Reject Button */}
        <Button
          onClick={() => handleSwipe('left')}
          disabled={isSwipeActive}
          className="w-16 h-16 rounded-full bg-red-600/20 hover:bg-red-600/30 border-2 border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-150"
          aria-label="Reject proposal"
          data-testid="reject-button"
        >
          <ThumbsDown className="w-6 h-6" />
        </Button>

        {/* Swipe Instructions */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Swipe or Click</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <ChevronLeft className="w-4 h-4" />
            <span>Reject</span>
            <span className="mx-2">•</span>
            <span>Support</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Support Button */}
        <Button
          onClick={() => handleSwipe('right')}
          disabled={isSwipeActive}
          className="w-16 h-16 rounded-full bg-green-600/20 hover:bg-green-600/30 border-2 border-green-500/30 text-green-400 hover:text-green-300 transition-all duration-150"
          aria-label="Support proposal"
          data-testid="support-button"
        >
          <ThumbsUp className="w-6 h-6" />
        </Button>
      </div>

      {/* Vote History Counter */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Votes Cast</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400 text-xs">
                {swipeDecisions.filter(d => d.decision === 'support').length}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-red-400 text-xs">
                {swipeDecisions.filter(d => d.decision === 'reject').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TTS Status Indicator */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Democracy Voice</span>
          <div className="flex items-center space-x-2">
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                ttsStatus.isReady ? "bg-green-400" : "bg-gray-500",
                ttsStatus.isPlaying ? "animate-pulse" : ""
              )}
            />
            <span 
              className={cn(
                "font-medium text-xs",
                ttsStatus.isReady ? "text-green-400" : "text-gray-500"
              )}
              aria-live="polite"
            >
              {ttsStatus.error ? "Error" : ttsStatus.isPlaying ? "Playing" : ttsStatus.isReady ? "Ready" : "Initializing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicSwipeCard;