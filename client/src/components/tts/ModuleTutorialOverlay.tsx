import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, Play, Pause, X, Volume2, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModuleTutorialOverlayProps {
  moduleId: string;
  moduleName: string;
  language?: string;
  onClose?: () => void;
}

interface TutorialAudio {
  cid: string;
  language: string;
  tone: string;
  duration: number;
  generated: string;
}

export default function ModuleTutorialOverlay({ 
  moduleId, 
  moduleName,
  language = 'en',
  onClose 
}: ModuleTutorialOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tutorialData, setTutorialData] = useState<TutorialAudio | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load tutorial data from ModuleNarrationRegistry
  useEffect(() => {
    const loadTutorialData = async () => {
      try {
        const response = await fetch('/api/tts/module-registry');
        if (response.ok) {
          const registry = await response.json();
          const moduleData = registry.modules[moduleId];
          if (moduleData && moduleData.audio[language]) {
            setTutorialData(moduleData.audio[language]);
          } else {
            setError('Tutorial not available for this module');
          }
        }
      } catch (err) {
        setError('Failed to load tutorial data');
      }
    };

    if (isVisible) {
      loadTutorialData();
    }
  }, [moduleId, language, isVisible]);

  // Audio progress tracking
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  // Cleanup on unmount or navigation
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handlePlay = async () => {
    if (!tutorialData) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        
        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current?.duration || 0);
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };

        audioRef.current.onerror = () => {
          setError('Failed to load audio tutorial');
          setIsLoading(false);
        };
      }

      // Try multiple IPFS gateways for resilience
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${tutorialData.cid}`,
        `https://cloudflare-ipfs.com/ipfs/${tutorialData.cid}`,
        `https://ipfs.io/ipfs/${tutorialData.cid}`
      ];

      let loaded = false;
      for (const gateway of gateways) {
        try {
          audioRef.current.src = gateway;
          await audioRef.current.load();
          loaded = true;
          break;
        } catch (gatewayError) {
          console.warn(`Failed to load from ${gateway}`);
        }
      }

      if (!loaded) {
        throw new Error('All IPFS gateways failed');
      }

      await audioRef.current.play();
      setIsPlaying(true);
      
      // Emit event for tutorial tracking
      window.dispatchEvent(new CustomEvent('civic-tutorial-started', {
        detail: { moduleId, language, cid: tutorialData.cid }
      }));

    } catch (err) {
      setError('Failed to start tutorial playback');
      console.error('Tutorial playback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        handlePlay();
      }
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsVisible(false);
    setIsPlaying(false);
    if (onClose) onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="gap-2 hover:bg-blue-50 border-blue-200"
        aria-label={`Learn ${moduleName} tutorial`}
      >
        <Headphones className="w-4 h-4 text-blue-600" />
        <span className="text-blue-600">Learn this module</span>
      </Button>

      {/* Tutorial Overlay */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-blue-600" />
                  Module Tutorial
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  aria-label="Close tutorial"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{moduleName}</p>
                {tutorialData && (
                  <div className="flex gap-2">
                    <Badge variant="secondary">{tutorialData.tone}</Badge>
                    <Badge variant="outline">{language.toUpperCase()}</Badge>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {tutorialData && !error && (
                <>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReplay}
                      disabled={isLoading}
                      aria-label="Replay tutorial"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={isPlaying ? handlePause : handlePlay}
                      disabled={isLoading}
                      className="gap-2 min-w-[100px]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isPlaying}
                      aria-label="Volume control"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tutorial Info */}
                  <div className="text-xs text-muted-foreground text-center">
                    <p>AI-generated tutorial • {tutorialData.duration}s</p>
                    <p>Generated: {new Date(tutorialData.generated).toLocaleDateString()}</p>
                  </div>
                </>
              )}

              {/* Accessibility Instructions */}
              <div 
                className="sr-only" 
                aria-live="polite"
                aria-atomic="true"
              >
                {isPlaying ? `Tutorial playing: ${moduleName}` : 
                 isLoading ? 'Loading tutorial audio' : 
                 'Tutorial ready to play'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}