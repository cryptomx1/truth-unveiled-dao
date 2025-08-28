import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ParticipationStreak {
  currentStreak: number;
  longestStreak: number;
  referralBoost: number;
}

interface ParticipationStreakVisualProps {
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

export const ParticipationStreakVisual: React.FC<ParticipationStreakVisualProps> = ({
  streak = MOCK_STREAK,
  className
}) => {
  const [renderStartTime] = useState(performance.now());
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const { toast } = useToast();

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
      console.warn(`ParticipationStreakVisual render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ParticipationStreakVisual render time: ${renderTime.toFixed(2)}ms ✅`);
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

  // Generate mock 7-day streak visualization
  const generateStreakData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      day,
      active: index < streak.currentStreak % 7 || streak.currentStreak >= 7,
      height: Math.max(20, Math.random() * 80)
    }));
  };

  const streakData = generateStreakData();

  return (
    <div 
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl max-h-[600px] w-full',
        className
      )}
      role="region"
      aria-label="Participation Streak Visualization"
      data-testid="participation-streak-visual"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Streak Visualization</h2>
            <p className="text-sm text-slate-400">7-day activity pattern</p>
          </div>
        </div>
        
        {/* TTS Control */}
        <Button
          onClick={handleTTSToggle}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-700"
          aria-label={ttsStatus.isPlaying ? "Stop motivation message" : "Play motivation message"}
          disabled={!ttsStatus.isReady}
          style={{ minHeight: '32px', minWidth: '32px' }}
        >
          {ttsStatus.isPlaying ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Streak Chart */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-6">
        <div className="flex items-end justify-between h-32 px-2">
          {streakData.map((item, index) => (
            <div key={item.day} className="flex flex-col items-center flex-1">
              <div 
                className={cn(
                  'w-6 rounded-t transition-all duration-300 mb-2',
                  item.active 
                    ? 'bg-gradient-to-t from-green-600 to-green-400' 
                    : 'bg-slate-600'
                )}
                style={{ height: `${item.height}px` }}
                aria-label={`${item.day}: ${item.active ? 'Active' : 'Inactive'}`}
              />
              <span className={cn(
                'text-xs font-medium',
                item.active ? 'text-green-400' : 'text-slate-500'
              )}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="space-y-4">
        {/* Current Progress */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Current Progress</span>
            <span className="text-sm text-slate-400">{streak.currentStreak}/{streak.longestStreak}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((streak.currentStreak / streak.longestStreak) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Goal Tracker */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Next Milestone</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-400">
                {Math.max(0, Math.ceil(streak.longestStreak / 7) * 7 - streak.currentStreak)} days
              </div>
              <div className="text-xs text-slate-400">to next goal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deck #12 Badge Placeholder */}
      <div className="mt-6 p-3 bg-slate-900 border border-slate-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400">Future badge unlock available in Deck #12</span>
        </div>
      </div>
    </div>
  );
};

export default ParticipationStreakVisual;