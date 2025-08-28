import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ParticipationStreak {
  currentStreak: number;
  longestStreak: number;
  referralBoost: number;
}

interface ParticipationStreakCardProps {
  streak?: ParticipationStreak;
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock streak data as per JASMY specifications
const MOCK_STREAK: ParticipationStreak = {
  currentStreak: 12,
  longestStreak: 21,
  referralBoost: 15
};

const TTS_MESSAGE = "You're building momentum—keep showing up for your community.";

export const ParticipationStreakCard: React.FC<ParticipationStreakCardProps> = ({
  streak = MOCK_STREAK,
  className
}) => {
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const { toast } = useToast();

  // Initialize TTS on component mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        // Check if Speech Synthesis is supported
        if ('speechSynthesis' in window) {
          // Wait for voices to be loaded
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
      console.warn(`ParticipationStreakCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ParticipationStreakCard render time: ${renderTime.toFixed(2)}ms ✅`);
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

  return (
    <div 
      className={cn(
        'dao-card-gradient border border-[hsl(var(--dao-border))] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 max-w-sm mx-auto',
        className
      )}
      role="region"
      aria-label="Participation Streak Information"
      data-testid="participation-streak-card"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 dao-primary-gradient rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🔥</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Participation Streak
            </h2>
            <p className="text-sm text-gray-300">
              Civic Engagement
            </p>
          </div>
        </div>
        
        {/* TTS Button */}
        <Button
          onClick={handleTTSToggle}
          disabled={!ttsStatus.isReady}
          className={cn(
            'w-10 h-10 rounded-full p-0 transition-colors duration-150',
            ttsStatus.isReady 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
          )}
          aria-label={ttsStatus.isPlaying ? 'Stop motivation message' : 'Play motivation message'}
          data-testid="tts-toggle-button"
        >
          {ttsStatus.isPlaying ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Current Streak Display */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center mb-3">
          {/* Animated Pulse Ring */}
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse" />
          <div className="absolute inset-1 rounded-full bg-green-400/10 animate-pulse" style={{animationDelay: '0.5s'}} />
          
          {/* Current Streak Number */}
          <div className="relative bg-green-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center border-2 border-green-400/30">
            <span 
              className="text-3xl font-bold text-green-400"
              aria-live="polite"
              aria-label={`Current streak: ${streak.currentStreak} days`}
            >
              {streak.currentStreak}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-white font-medium mb-1">
          Current Streak
        </div>
        <div className="text-xs text-gray-300">
          {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
        </div>
      </div>

      {/* Longest Streak */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Longest Streak
          </span>
          <span className="text-sm font-bold text-blue-400">
            {streak.longestStreak} {streak.longestStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Referral Boost */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Referral Boost
          </span>
          <span className="text-sm font-medium text-green-400">
            +{streak.referralBoost}%
          </span>
        </div>
      </div>

      {/* Future Badge Placeholder */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="flex items-center justify-center text-center">
          <div className="text-xs text-gray-400">
            🏆 Earn badges in Deck #12
          </div>
        </div>
      </div>

      {/* TTS Status Indicator */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Motivation</span>
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

export default ParticipationStreakCard;