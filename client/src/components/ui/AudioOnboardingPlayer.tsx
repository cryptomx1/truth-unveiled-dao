// AudioOnboardingPlayer.tsx - Phase TRILAYER v1.0 Module 2
// ARIA-compliant audio player for civic deck onboarding narration
// Commander Mark directive via JASMY Relay

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioOnboardingPlayerProps {
  narrationCID?: string;
  deckId: string;
  moduleId: string;
  autoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  hasError: boolean;
  retryCount: number;
}

export const AudioOnboardingPlayer: React.FC<AudioOnboardingPlayerProps> = ({
  narrationCID,
  deckId,
  moduleId,
  autoPlay = true,
  onPlayStateChange,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    hasError: false,
    retryCount: 0
  });

  // IPFS gateway URLs for fallback
  const ipfsGateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.ipfs.io/ipfs/'
  ];

  const getAudioUrl = (cid: string, retryIndex: number = 0): string => {
    const gateway = ipfsGateways[retryIndex % ipfsGateways.length];
    return `${gateway}${cid}`;
  };

  useEffect(() => {
    if (narrationCID && audioRef.current) {
      loadAudio();
    }
  }, [narrationCID]);

  useEffect(() => {
    // Auto-play on first module visit if enabled
    if (autoPlay && narrationCID && !audioState.hasError && !audioState.isPlaying) {
      const hasVisited = localStorage.getItem(`visited_${deckId}_${moduleId}`);
      if (!hasVisited) {
        localStorage.setItem(`visited_${deckId}_${moduleId}`, 'true');
        setTimeout(() => handlePlay(), 500); // Delay for user experience
      }
    }
  }, [autoPlay, narrationCID, deckId, moduleId]);

  const loadAudio = async () => {
    if (!narrationCID || !audioRef.current) return;

    setAudioState(prev => ({ ...prev, isLoading: true, hasError: false }));

    try {
      const audioUrl = getAudioUrl(narrationCID, audioState.retryCount);
      audioRef.current.src = audioUrl;
      
      await new Promise((resolve, reject) => {
        const audio = audioRef.current!;
        
        const onLoad = () => {
          audio.removeEventListener('loadeddata', onLoad);
          audio.removeEventListener('error', onError);
          resolve(true);
        };
        
        const onError = () => {
          audio.removeEventListener('loadeddata', onLoad);
          audio.removeEventListener('error', onError);
          reject(new Error(`Failed to load audio from IPFS: ${audioUrl}`));
        };

        audio.addEventListener('loadeddata', onLoad);
        audio.addEventListener('error', onError);
        audio.load();
      });

      setAudioState(prev => ({ 
        ...prev, 
        isLoading: false, 
        duration: audioRef.current?.duration || 0 
      }));

      console.log(`🎧 Audio loaded successfully: ${narrationCID}`);

    } catch (error) {
      console.warn(`⚠️ Audio load failed (attempt ${audioState.retryCount + 1}):`, error);
      
      if (audioState.retryCount < ipfsGateways.length - 1) {
        // Retry with next gateway
        setAudioState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1, 
          isLoading: false 
        }));
        setTimeout(() => loadAudio(), 1000);
      } else {
        // All retries failed
        setAudioState(prev => ({ 
          ...prev, 
          isLoading: false, 
          hasError: true 
        }));
        console.error('❌ All IPFS gateways failed for audio:', narrationCID);
      }
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current || audioState.hasError) return;

    try {
      if (audioState.isPlaying) {
        audioRef.current.pause();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        onPlayStateChange?.(false);
      } else {
        await audioRef.current.play();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
        onPlayStateChange?.(true);
      }
    } catch (error) {
      console.error('❌ Audio play failed:', error);
      setAudioState(prev => ({ ...prev, hasError: true }));
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setAudioState(prev => ({ ...prev, currentTime: 0 }));
    
    if (!audioState.isPlaying) {
      handlePlay();
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const volume = values[0] / 100;
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setAudioState(prev => ({ 
        ...prev, 
        volume, 
        isMuted: volume === 0 
      }));
    }
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    
    const newMuted = !audioState.isMuted;
    audioRef.current.muted = newMuted;
    setAudioState(prev => ({ ...prev, isMuted: newMuted }));
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioState(prev => ({ 
        ...prev, 
        currentTime: audioRef.current?.currentTime || 0 
      }));
    }
  };

  const handleEnded = () => {
    setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    onPlayStateChange?.(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setAudioState(prev => ({ 
      ...prev, 
      hasError: false, 
      retryCount: 0 
    }));
    loadAudio();
  };

  if (!narrationCID) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-muted/30 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Volume2 className="h-4 w-4" />
          <span className="text-sm">Audio narration preparing...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-3 p-3 bg-background border rounded-lg shadow-sm ${className}`}
      role="region"
      aria-label="Audio narration player"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
        aria-hidden="true"
      />

      {/* Play/Pause Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePlay}
        disabled={audioState.isLoading || audioState.hasError}
        aria-label={audioState.isPlaying ? 'Pause narration' : 'Play narration'}
        className="shrink-0"
      >
        {audioState.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : audioState.isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Replay Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReplay}
        disabled={audioState.isLoading || audioState.hasError}
        aria-label="Replay from beginning"
        className="shrink-0"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Progress Section */}
      <div className="flex-1 min-w-0">
        {audioState.hasError ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-destructive">Audio unavailable</span>
            <Button
              variant="link"
              size="sm"
              onClick={handleRetry}
              className="p-0 h-auto text-xs"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(audioState.currentTime)}</span>
              <span>{formatTime(audioState.duration)}</span>
            </div>
            <div 
              className="w-full bg-muted/30 rounded-full h-1 cursor-pointer"
              onClick={(e) => {
                if (audioRef.current && audioState.duration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * audioState.duration;
                  audioRef.current.currentTime = newTime;
                }
              }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={audioState.duration}
              aria-valuenow={audioState.currentTime}
              aria-label="Audio progress"
            >
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-150"
                style={{ 
                  width: audioState.duration > 0 
                    ? `${(audioState.currentTime / audioState.duration) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMuteToggle}
          aria-label={audioState.isMuted ? 'Unmute' : 'Mute'}
          className="p-1"
        >
          {audioState.isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        
        <div className="w-16">
          <Slider
            value={[audioState.isMuted ? 0 : audioState.volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={5}
            className="cursor-pointer"
            aria-label="Volume control"
          />
        </div>
      </div>

      {/* Screen Reader Status */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {audioState.isPlaying ? 'Audio playing' : 
         audioState.isLoading ? 'Audio loading' : 
         audioState.hasError ? 'Audio error occurred' : 'Audio ready'}
      </div>
    </div>
  );
};

export default AudioOnboardingPlayer;