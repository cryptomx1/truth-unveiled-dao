import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Clock, Lock, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SessionStatus {
  id: string;
  title: string;
  status: 'active' | 'closing_soon' | 'closed';
  endTime: Date;
  totalProposals: number;
  votedProposals: number;
}

interface SessionStatusCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock session data with real-time status logic
const createMockSession = (): SessionStatus => {
  const now = new Date();
  const endTime = new Date(now.getTime() + 8 * 60 * 1000); // 8 minutes from now
  
  return {
    id: 'session-001',
    title: 'Community Infrastructure Proposals',
    status: 'active',
    endTime,
    totalProposals: 12,
    votedProposals: 7
  };
};

const TTS_MOUNT_MESSAGE = "Session status monitoring is active.";
const TTS_CLOSING_MESSAGE = "Poll closing in";

export const SessionStatusCard: React.FC<SessionStatusCardProps> = ({ className }) => {
  const [session, setSession] = useState<SessionStatus>(createMockSession());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [hasTriggeredClosingTTS, setHasTriggeredClosingTTS] = useState(false);
  const [renderStartTime] = useState(performance.now());
  const { toast } = useToast();

  // Initialize TTS and trigger mount message
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
          
          // Auto-trigger mount message
          setTimeout(() => {
            playTTSMessage(TTS_MOUNT_MESSAGE);
          }, 1000);
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
      console.warn(`SessionStatusCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`SessionStatusCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Timer and status update logic
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, session.endTime.getTime() - now.getTime());
      const remainingMinutes = Math.floor(remaining / (1000 * 60));
      const remainingSeconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      setTimeRemaining(remaining);
      
      // Update session status based on time remaining
      let newStatus: SessionStatus['status'] = 'active';
      if (remaining === 0) {
        newStatus = 'closed';
      } else if (remainingMinutes <= 5) {
        newStatus = 'closing_soon';
        
        // Trigger TTS warning at 5 minutes
        if (remainingMinutes === 5 && !hasTriggeredClosingTTS && ttsStatus.isReady) {
          setHasTriggeredClosingTTS(true);
          playTTSMessage(`${TTS_CLOSING_MESSAGE} ${remainingMinutes} minutes.`);
        }
      }
      
      setSession(prev => ({ ...prev, status: newStatus }));
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Run immediately
    
    return () => clearInterval(interval);
  }, [session.endTime, hasTriggeredClosingTTS, ttsStatus.isReady]);

  const playTTSMessage = async (message: string) => {
    if (!ttsStatus.isReady) return;

    try {
      const utterance = new SpeechSynthesisUtterance(message);
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
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      setTtsStatus(prev => ({ ...prev, error: 'TTS playback failed' }));
    }
  };

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

    await playTTSMessage(TTS_MOUNT_MESSAGE);
  };

  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (milliseconds === 0) {
      return 'Session ended';
    }
    
    if (minutes === 0) {
      return `${seconds} seconds remaining`;
    }
    
    return `${minutes} minutes remaining`;
  };

  const getStatusConfig = (status: SessionStatus['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/20',
          indicator: 'bg-blue-500 animate-pulse w-3 h-3 rounded-full',
          icon: <Clock className="w-4 h-4" />
        };
      case 'closing_soon':
        return {
          label: 'Closing Soon',
          color: 'text-amber-400',
          bgColor: 'bg-amber-400/20',
          indicator: 'w-3 h-3 rounded-full border-2 border-amber-400 animate-pulse',
          icon: <AlertCircle className="w-4 h-4" />
        };
      case 'closed':
        return {
          label: 'Closed',
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          indicator: 'bg-red-500 w-3 h-3 rounded-full',
          icon: <Clock className="w-4 h-4" />
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-slate-400',
          bgColor: 'bg-slate-400/20',
          indicator: 'bg-slate-400 w-3 h-3 rounded-full',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);

  return (
    <div 
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 max-w-sm mx-auto',
        className
      )}
      role="region"
      aria-label="Session Status Information"
      data-testid="session-status-card"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {statusConfig.icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Session Status
            </h2>
            <p className="text-xs text-slate-400">
              {session.title}
            </p>
          </div>
        </div>
        
        {/* TTS Button */}
        <Button
          onClick={handleTTSToggle}
          disabled={!ttsStatus.isReady}
          className={cn(
            'w-8 h-8 rounded-full p-0 transition-colors duration-150',
            ttsStatus.isReady 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' 
              : 'bg-slate-600 text-slate-500 cursor-not-allowed'
          )}
          aria-label={ttsStatus.isPlaying ? 'Stop status message' : 'Play status message'}
          data-testid="tts-toggle-button"
        >
          {ttsStatus.isPlaying ? (
            <VolumeX className="w-3 h-3" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Status Display */}
      <div className={cn('bg-slate-700 rounded-lg p-4 mb-4', statusConfig.bgColor)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={statusConfig.indicator} />
            <span className={cn('uppercase tracking-wide text-sm font-medium', statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-300">
            {session.votedProposals}/{session.totalProposals} voted
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(session.votedProposals / session.totalProposals) * 100}%` }}
          />
        </div>
        
        <p className="text-xs text-slate-400 text-center">
          Participation Progress
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
              Time Remaining
            </span>
          </div>
          <div 
            className={cn(
              'text-lg font-bold mb-1',
              session.status === 'closing_soon' ? 'text-amber-400' : 
              session.status === 'closed' ? 'text-red-500' : 'text-blue-500'
            )}
            aria-live="polite"
            aria-label={`Session timer: ${formatTimeRemaining(timeRemaining)}`}
          >
            <strong>{formatTimeRemaining(timeRemaining)}</strong>
          </div>
          <p className="text-xs text-slate-400">
            Until session closes
          </p>
        </div>
      </div>

      {/* ZKP Placeholder Section */}
      <div className="bg-slate-700 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">
            ZK Session Hash – Unlock in Deck #5
          </span>
          <Info className="w-3 h-3 text-slate-500" />
        </div>
      </div>

      {/* Session Details */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Total Proposals:</span>
            <span className="text-slate-100 ml-1 font-medium">{session.totalProposals}</span>
          </div>
          <div>
            <span className="text-slate-400">Voted:</span>
            <span className="text-green-500 ml-1 font-medium">{session.votedProposals}</span>
          </div>
        </div>
      </div>

      {/* TTS Status Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Status Voice</span>
          <div className="flex items-center space-x-2">
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                ttsStatus.isReady ? "bg-green-500" : "bg-slate-500",
                ttsStatus.isPlaying ? "animate-pulse" : ""
              )}
            />
            <span 
              className={cn(
                "font-medium",
                ttsStatus.isReady ? "text-green-500" : "text-slate-500"
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

export default SessionStatusCard;