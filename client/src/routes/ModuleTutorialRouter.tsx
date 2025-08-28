/**
 * ModuleTutorialRouter.tsx - PHASE TTS-CIVIC-ENHANCE REPAIR
 * Commander Mark directive: Tutorial routes must play actual audio
 */

import React, { useState, useEffect } from 'react';
import { Route, Link, useParams } from 'wouter';
import { Play, Pause, RotateCcw, ArrowLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import TTSEngineAgent from '@/agents/TTSEngineAgent';

interface TutorialRouterProps {
  deckId?: string;
  moduleId?: string;
}

const ModuleTutorialRouter: React.FC<TutorialRouterProps> = () => {
  return (
    <>
      <Route path="/tts/deck/:deckId/tutorial" component={DeckTutorialPage} />
      <Route path="/tts/module/:moduleId/tutorial" component={ModuleTutorialPage} />
    </>
  );
};

const DeckTutorialPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  
  return (
    <TutorialInterface 
      deckId={deckId || 'unknown'} 
      moduleId="overview"
      title={`Deck ${deckId} Tutorial`}
      type="deck"
    />
  );
};

const ModuleTutorialPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  
  return (
    <TutorialInterface 
      deckId="module-tutorial" 
      moduleId={moduleId || 'unknown'}
      title={`Module ${moduleId} Tutorial`}
      type="module"
    />
  );
};

interface TutorialInterfaceProps {
  deckId: string;
  moduleId: string;
  title: string;
  type: 'deck' | 'module';
}

const TutorialInterface: React.FC<TutorialInterfaceProps> = ({
  deckId,
  moduleId,
  title,
  type
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const ttsAgent = TTSEngineAgent.getInstance();

  useEffect(() => {
    // Initialize tutorial audio
    initializeTutorialAudio();
    
    // Cleanup on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [deckId, moduleId]);

  const initializeTutorialAudio = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate tutorial content based on type
      const tutorialContent = getTutorialContent(deckId, moduleId, type);
      
      // REPAIR: Generate real audio with IPFS upload
      const cid = await ttsAgent.generateNarrationWithIPFS(
        deckId, 
        moduleId, 
        tutorialContent, 
        'encouraging'
      );
      
      if (cid) {
        // Create audio element with IPFS gateway fallback
        const audio = new Audio();
        const ipfsGateways = [
          `https://gateway.pinata.cloud/ipfs/${cid}`,
          `https://cloudflare-ipfs.com/ipfs/${cid}`,
          `https://ipfs.io/ipfs/${cid}`
        ];
        
        // Try multiple gateways
        let audioLoaded = false;
        for (const gateway of ipfsGateways) {
          try {
            audio.src = gateway;
            await new Promise((resolve, reject) => {
              audio.oncanplaythrough = resolve;
              audio.onerror = reject;
              audio.load();
            });
            audioLoaded = true;
            break;
          } catch (err) {
            console.warn(`Failed to load from ${gateway}:`, err);
          }
        }
        
        if (!audioLoaded) {
          throw new Error('Failed to load audio from all IPFS gateways');
        }
        
        // Configure audio events
        audio.ontimeupdate = () => {
          if (audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        };
        
        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          setProgress(100);
        };
        
        setAudioElement(audio);
        console.log(`🎧 Tutorial audio loaded: ${cid}`);
      } else {
        throw new Error('Failed to generate tutorial audio');
      }
      
    } catch (error) {
      console.error('❌ Tutorial audio initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Audio initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getTutorialContent = (deckId: string, moduleId: string, type: 'deck' | 'module'): string => {
    const deckNames: Record<string, string> = {
      'wallet-overview': 'Wallet Overview',
      'governance': 'Governance',
      'civic-identity': 'Civic Identity',
      'trust-feedback': 'Trust Feedback',
      'municipal': 'Municipal Policy',
      'education': 'Civic Education'
    };
    
    const deckName = deckNames[deckId] || deckId.replace(/-/g, ' ');
    
    if (type === 'deck') {
      return `Welcome to the ${deckName} deck tutorial. This section covers the key features and functionality of ${deckName}. You'll learn how to navigate the interface, understand the data displays, and interact with the various components. This tutorial provides step-by-step guidance to help you make the most of this civic engagement tool.`;
    } else {
      return `This is the ${moduleId} module tutorial. This module is an important component of the ${deckName} system. You'll learn about its specific features, how to use its controls, and how it integrates with other parts of the platform. The tutorial covers both basic usage and advanced features to enhance your civic participation experience.`;
    }
  };

  const handlePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (!audioElement) return;
    
    audioElement.currentTime = 0;
    setProgress(0);
    if (!isPlaying) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Platform
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300">
            Learn how to use this {type} with step-by-step audio guidance
          </p>
        </div>

        {/* Audio Player */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading tutorial audio...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={initializeTutorialAudio} variant="outline">
                Retry Loading
              </Button>
            </div>
          )}

          {!isLoading && !error && audioElement && (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <Progress value={progress} className="w-full h-2 mb-2" />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatTime((progress / 100) * duration)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
                
                <Button
                  onClick={handleReplay}
                  variant="outline"
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>

              {/* Status */}
              <div className="text-center mt-4">
                <Badge variant={isPlaying ? "default" : "secondary"}>
                  {isPlaying ? "Playing" : "Paused"}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Tutorial Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Tutorial Information
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Audio narration provides step-by-step guidance</li>
            <li>• Use the controls above to play, pause, or replay</li>
            <li>• Progress bar shows current position in the tutorial</li>
            <li>• Audio is stored securely on IPFS for decentralized access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModuleTutorialRouter;