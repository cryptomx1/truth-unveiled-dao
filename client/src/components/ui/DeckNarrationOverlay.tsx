// DeckNarrationOverlay.tsx - Phase TTS-CIVIC-ENHANCE Step 4
// Overlay component for injecting audio tutorials into deck interfaces
// Commander Mark directive via JASMY Relay

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Headphones, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LangToggle } from '@/components/ui/LangToggle';
import AudioTutorialInjector from '../../agents/AudioTutorialInjector';

interface DeckNarrationOverlayProps {
  deckId: string;
  deckName: string;
  isVisible?: boolean;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  autoPlay?: boolean;
  className?: string;
}

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export const DeckNarrationOverlay: React.FC<DeckNarrationOverlayProps> = ({
  deckId,
  deckName,
  isVisible = true,
  position = 'top-right',
  autoPlay = false,
  className = ''
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    isLoading: false,
    error: null
  });

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [tutorialCid, setTutorialCid] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const tutorialInjector = useRef<AudioTutorialInjector | null>(null);

  useEffect(() => {
    // Initialize tutorial injector
    tutorialInjector.current = AudioTutorialInjector.getInstance();
    loadTutorialAudio();
  }, [deckId, currentLanguage]);

  useEffect(() => {
    // Auto-play functionality
    if (autoPlay && audioState.isLoaded && !audioState.isPlaying) {
      handlePlay();
    }
  }, [audioState.isLoaded, autoPlay]);

  const loadTutorialAudio = async () => {
    if (!tutorialInjector.current) return;

    setAudioState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get tutorial CID for current deck and language
      const cid = await tutorialInjector.current?.injectTutorialForDeck(deckId, currentLanguage);
      
      if (cid) {
        setTutorialCid(cid);
        
        // For tutorial phase, create mock audio URL with text-to-speech content
        const mockAudioUrl = createMockAudioUrl(deckId, deckName, currentLanguage);
        await loadAudioFromUrl(mockAudioUrl);
        
        setAudioState(prev => ({ 
          ...prev, 
          isLoaded: true, 
          isLoading: false,
          error: null 
        }));

        console.log(`🎧 Tutorial audio loaded for deck ${deckId}: ${cid}`);
      } else {
        setAudioState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'Tutorial audio not available' 
        }));
      }
    } catch (error) {
      console.error('❌ Failed to load tutorial audio:', error);
      setAudioState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to load audio tutorial' 
      }));
    }
  };

  const loadAudioFromGateways = async (gatewayUrls: string[]): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    for (const url of gatewayUrls) {
      try {
        await new Promise<void>((resolve, reject) => {
          const testAudio = new Audio();
          testAudio.oncanplaythrough = () => {
            audio.src = url;
            audio.onloadedmetadata = () => {
              setAudioState(prev => ({ 
                ...prev, 
                duration: audio.duration 
              }));
              resolve();
            };
            audio.onerror = reject;
          };
          testAudio.onerror = reject;
          testAudio.src = url;
        });
        
        // If we get here, the URL worked
        console.log(`✅ Audio loaded from gateway: ${url}`);
        return;
      } catch {
        console.warn(`⚠️ Failed to load from gateway: ${url}`);
        continue;
      }
    }
    
    throw new Error('All IPFS gateways failed');
  };

  const handlePlay = async () => {
    if (!audioState.isLoaded) return;

    // For tutorial phase, use Web Speech API for actual audio
    const content = getTutorialContent(deckId, deckName, currentLanguage);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = getLanguageCode(currentLanguage);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setAudioState(prev => ({ ...prev, isPlaying: true }));
        console.log(`▶️ Playing tutorial for deck ${deckId}`);
      };
      
      utterance.onend = () => {
        setAudioState(prev => ({ 
          ...prev, 
          isPlaying: false,
          currentTime: 0 
        }));
      };
      
      window.speechSynthesis.speak(utterance);
      
      // Simulate progress tracking
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 1;
        if (progress <= audioState.duration) {
          setAudioState(prev => ({ 
            ...prev, 
            currentTime: progress 
          }));
        } else {
          clearInterval(progressInterval);
        }
      }, 1000);
    }
  };

  const handlePause = () => {
    if (audioState.isPlaying && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const getTutorialContent = (deckId: string, deckName: string, language: string): string => {
    const scripts = {
      'en': {
        'Wallet Overview': 'Welcome to your Wallet Overview deck. This central hub displays your Truth Points balance, recent civic activities, and reward earnings. Here you can track your contributions to democratic governance and manage your civic identity.',
        'Governance Feedback': 'The Governance Feedback deck enables anonymous civic trust deltas and sentiment tracking. Submit feedback on governance decisions while maintaining privacy through zero-knowledge proofs.'
      },
      'es': {
        'Wallet Overview': 'Bienvenido a tu panel de Resumen de Cartera. Este centro central muestra tu saldo de Puntos de Verdad, actividades cívicas recientes y ganancias de recompensas.',
        'Governance Feedback': 'El panel de Retroalimentación de Gobernanza permite deltas de confianza cívica anónima y seguimiento de sentimientos.'
      }
    };

    const langScripts = scripts[language] || scripts['en'];
    return langScripts[deckName] || `Welcome to the ${deckName} deck. This civic module helps you engage with democratic processes while maintaining privacy and security through advanced cryptographic systems.`;
  };

  const getLanguageCode = (language: string): string => {
    const codes = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'ja': 'ja-JP'
    };
    return codes[language] || 'en-US';
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setAudioState(prev => ({ ...prev, currentTime: 0 }));
      if (audioState.isPlaying) {
        handlePlay();
      }
    }
  };

  const handleLanguageChange = (language: string) => {
    if (language !== currentLanguage) {
      // Stop current audio
      handlePause();
      
      // Switch language and reload
      setCurrentLanguage(language);
      setAudioState(prev => ({ 
        ...prev, 
        isLoaded: false, 
        currentTime: 0,
        duration: 0 
      }));
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';
    switch (position) {
      case 'top-right': return `${baseClasses} top-4 right-4`;
      case 'bottom-right': return `${baseClasses} bottom-4 right-4`;
      case 'top-left': return `${baseClasses} top-4 left-4`;
      case 'bottom-left': return `${baseClasses} bottom-4 left-4`;
      default: return `${baseClasses} top-4 right-4`;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <Card className="w-80 shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Learn this deck</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {deckName}
            </Badge>
          </div>

          {/* Language Selection */}
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <div className="flex gap-1">
              {['en', 'es', 'fr', 'ja'].map((lang) => (
                <Button
                  key={lang}
                  variant={currentLanguage === lang ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="space-y-3">
            {audioState.error ? (
              <div className="text-center py-2">
                <p className="text-xs text-red-500">{audioState.error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={loadTutorialAudio}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(audioState.currentTime)}</span>
                    <span>{formatTime(audioState.duration)}</span>
                  </div>
                  <Progress 
                    value={audioState.duration > 0 ? (audioState.currentTime / audioState.duration) * 100 : 0}
                    className="h-1"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplay}
                    disabled={!audioState.isLoaded}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant={audioState.isPlaying ? "secondary" : "default"}
                    size="sm"
                    onClick={audioState.isPlaying ? handlePause : handlePlay}
                    disabled={audioState.isLoading || !audioState.isLoaded}
                    className="px-4"
                  >
                    {audioState.isLoading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : audioState.isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    <span className="ml-1 text-xs">
                      {audioState.isLoading ? 'Loading...' : audioState.isPlaying ? 'Pause' : 'Play'}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Tutorial Info */}
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Audio tutorial • ≤90 seconds • GPT-4o generated
            </p>
            {tutorialCid && (
              <p className="text-xs text-muted-foreground text-center mt-1">
                IPFS: {tutorialCid.substring(0, 12)}...
              </p>
            )}
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            preload="metadata"
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeckNarrationOverlay;