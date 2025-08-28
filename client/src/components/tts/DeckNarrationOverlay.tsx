/**
 * DeckNarrationOverlay.tsx
 * Phase TTS-CIVIC-ENHANCE Step 3: Active narration overlay for civic decks
 * Commander Mark directive via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, VolumeX, Pause, Play, Settings, Timer, 
  BarChart3, X, Activity, Mic, MicOff 
} from 'lucide-react';
import TTSEngineAgent from '@/agents/TTSEngineAgent';

interface NarrationSession {
  deckId: string;
  deckName: string;
  content: string;
  tone: string;
  startTime: number;
  estimatedDuration: number;
  progress: number;
  isActive: boolean;
}

interface DeckNarrationOverlayProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const DeckNarrationOverlay: React.FC<DeckNarrationOverlayProps> = ({
  isVisible = false,
  onClose
}) => {
  const [session, setSession] = useState<NarrationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsAgent] = useState(() => TTSEngineAgent.getInstance());

  useEffect(() => {
    // Monitor TTS agent for active sessions
    const checkActiveSession = () => {
      try {
        const reportStr = ttsAgent.exportDiagnosticReport();
        const diagnostics = JSON.parse(reportStr);
        
        if (diagnostics.queueStatus?.currentJob?.status === 'playing') {
          const job = diagnostics.queueStatus.currentJob;
          
          setSession({
            deckId: job.deckId,
            deckName: formatDeckName(job.deckId),
            content: job.content ? job.content.substring(0, 100) + '...' : 'Loading content...',
            tone: getToneFromDeckConfig(job.deckId),
            startTime: Date.now(),
            estimatedDuration: estimateReadingTime(job.content || ''),
            progress: calculateProgress(Date.now()),
            isActive: true
          });
          setIsPlaying(true);
        } else {
          if (session?.isActive) {
            setSession(prev => prev ? { ...prev, isActive: false } : null);
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.warn('TTS session check failed:', error);
      }
    };

    // Check every second while overlay is visible
    const interval = setInterval(checkActiveSession, 1000);
    
    return () => clearInterval(interval);
  }, [session, ttsAgent]);

  useEffect(() => {
    // Update progress for active sessions
    if (session?.isActive) {
      const updateProgress = () => {
        const elapsed = Date.now() - session.startTime;
        const progress = Math.min((elapsed / session.estimatedDuration) * 100, 100);
        
        setSession(prev => prev ? { ...prev, progress } : null);
      };

      const progressInterval = setInterval(updateProgress, 500);
      return () => clearInterval(progressInterval);
    }
  }, [session]);

  const formatDeckName = (deckId: string): string => {
    const nameMap: Record<string, string> = {
      'wallet_overview': 'Wallet Overview',
      'governance': 'Governance',
      'feedback': 'Trust Feedback',
      'civic_identity': 'Civic Identity',
      'wellbeing': 'Wellbeing Pulse',
      'municipal': 'Municipal Policy',
      'privacy': 'Privacy & ZKP',
      'education': 'Civic Education'
    };
    
    return nameMap[deckId] || deckId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getToneFromDeckConfig = (deckId: string): string => {
    const config = ttsAgent.getDeckConfiguration(deckId);
    return config.tone || 'formal';
  };

  const estimateReadingTime = (content: string): number => {
    // Estimate 150 words per minute average reading speed
    const words = content.split(/\s+/).length;
    const minutes = words / 150;
    return minutes * 60 * 1000; // Convert to milliseconds
  };

  const calculateProgress = (startTime: number): number => {
    const elapsed = Date.now() - startTime;
    const estimated = session?.estimatedDuration || 10000;
    return Math.min((elapsed / estimated) * 100, 100);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      ttsAgent.stopNarration();
      setIsPlaying(false);
    } else {
      // Resume narration would require more complex state management
      // For now, this stops the current session
      ttsAgent.stopNarration();
      setSession(null);
    }
  };

  const handleClose = () => {
    ttsAgent.stopNarration();
    setSession(null);
    onClose?.();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  // Don't render if not visible or no active session
  if (!isVisible || !session) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-w-md w-full mx-4"
      role="region"
      aria-label="Active narration overlay"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">Reading Aloud</span>
            <Badge variant="secondary" className="text-xs">
              {session.tone}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
            aria-label="Close narration overlay"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Deck Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {session.deckName}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {session.content}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{Math.round(session.progress)}%</span>
          </div>
          <Progress 
            value={session.progress} 
            className="h-1"
            aria-label={`Narration progress: ${Math.round(session.progress)}%`}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="h-8 px-3"
              aria-label={isPlaying ? 'Pause narration' : 'Resume narration'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Resume
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Timer className="h-3 w-3" />
            <span>
              {formatDuration(session.estimatedDuration - (session.progress / 100 * session.estimatedDuration))} remaining
            </span>
          </div>
        </div>

        {/* Accessibility Announcement */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {session.isActive 
            ? `Currently reading ${session.deckName}. ${Math.round(session.progress)}% complete.`
            : `Finished reading ${session.deckName}.`
          }
        </div>
      </div>
    </div>
  );
};

export default DeckNarrationOverlay;