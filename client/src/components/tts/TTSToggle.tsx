/**
 * TTSToggle.tsx - Phase TTS-CIVIC-ENHANCE Step 3: Enhanced TTS toggle
 * Commander Mark directive via JASMY Relay - Platform-wide TTS UX finalization
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TTSEngineAgent from '@/agents/TTSEngineAgent';

interface TTSToggleProps {
  deckId: string;
  moduleId: string;
  content: string;
  className?: string;
  size?: 'sm' | 'lg' | 'default' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  mode?: 'standard' | 'tutorial';
  tutorialPath?: string;
  children?: React.ReactNode;
}

export const TTSToggle: React.FC<TTSToggleProps> = ({
  deckId,
  moduleId,
  content,
  className = '',
  size = 'sm',
  variant = 'outline',
  mode = 'standard',
  tutorialPath,
  children
}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [voiceMetadata, setVoiceMetadata] = useState<{
    provider: string;
    tone: string;
    speed: string;
  } | null>(null);
  const ttsAgent = TTSEngineAgent.getInstance();

  useEffect(() => {
    // Load deck configuration and voice metadata
    const config = ttsAgent.getDeckConfiguration(deckId);
    setIsEnabled(config.enabled);
    
    // Load voice metadata for hover display
    setVoiceMetadata({
      provider: 'auto-select',
      tone: config.tone || 'formal',
      speed: config.speed || 'normal'
    });
  }, [deckId, ttsAgent]);

  useEffect(() => {
    // Monitor TTS agent status for real-time playing state
    const checkPlayingStatus = () => {
      try {
        const reportStr = ttsAgent.exportDiagnosticReport();
        const diagnostics = JSON.parse(reportStr);
        const isCurrentlyPlaying = diagnostics.queueStatus?.currentJob?.status === 'playing' && 
                                  diagnostics.queueStatus?.currentJob?.deckId === deckId;
        setIsPlaying(isCurrentlyPlaying);
      } catch (error) {
        console.warn('TTS status check failed:', error);
        setIsPlaying(false);
      }
    };

    const interval = setInterval(checkPlayingStatus, 1000);
    return () => {
      clearInterval(interval);
      if (isPlaying) {
        ttsAgent.stopNarration();
      }
    };
  }, [deckId, ttsAgent]);

  const handleToggle = async () => {
    if (!isEnabled) {
      // Enable TTS for this deck
      ttsAgent.updateDeckConfiguration(deckId, { enabled: true });
      setIsEnabled(true);
      
      // Announce enabling to screen readers
      announceToScreenReader('TTS enabled for this deck');
      return;
    }

    if (isPlaying) {
      // Stop current narration
      ttsAgent.stopNarration();
      setIsPlaying(false);
      announceToScreenReader('Narration stopped');
      return;
    }

    try {
      setIsPlaying(true);
      announceToScreenReader('Narration started');
      
      // REPAIR: Use proper TTSEngineAgent method for real narration
      if (mode === 'tutorial' && tutorialPath) {
        await ttsAgent.generateNarrationWithIPFS(deckId, moduleId, content, 'formal');
      } else {
        await ttsAgent.narrateContent(deckId, moduleId, content);
      }
      
      console.log(`🎙️ TTS narration started: ${deckId}/${moduleId}`);
      
    } catch (error) {
      console.error('TTS toggle error:', error);
      announceToScreenReader('Narration failed');
    } finally {
      setIsPlaying(false);
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      if (announcement.parentElement) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const getButtonContent = () => {
    if (isPlaying) {
      return (
        <>
          <div className="flex items-center gap-1">
            <VolumeX className="h-4 w-4" />
            {size !== 'sm' && <span className="text-xs">Stop</span>}
          </div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </>
      );
    }
    
    if (!isEnabled) {
      return (
        <>
          <VolumeX className="h-4 w-4 opacity-50" />
          {size !== 'sm' && <span className="text-xs opacity-50">Disabled</span>}
        </>
      );
    }
    
    return (
      <>
        <Volume2 className="h-4 w-4" />
        {size !== 'sm' && <span className="text-xs">Read</span>}
      </>
    );
  };

  const getTooltipContent = () => {
    if (!isEnabled) return 'TTS disabled for this deck';
    if (isPlaying) return 'Stop narration';
    
    let tooltip = 'Narrate this section aloud';
    if (isHovered && voiceMetadata) {
      tooltip += ` • ${voiceMetadata.tone} tone • ${voiceMetadata.speed} speed`;
    }
    return tooltip;
  };

  const getButtonText = () => {
    if (!isEnabled) return 'Enable TTS';
    if (isPlaying) return 'Stop';
    return 'Narrate';
  };

  return (
    <div 
      className={`flex items-center gap-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        onClick={handleToggle}
        variant={variant}
        size={size}
        title={getTooltipContent()}
        className={`
          transition-all duration-200
          ${!isEnabled ? 'opacity-50' : ''}
          ${isPlaying ? 'bg-blue-100 dark:bg-blue-900' : ''}
        `}
        aria-label={getTooltipContent()}
        aria-pressed={isPlaying}
      >
        {getButtonContent()}
        {children && (
          <span className="ml-1">{getButtonText()}</span>
        )}
      </Button>

      {/* Enhanced metadata tooltip with voice/tone info */}
      {isHovered && isEnabled && voiceMetadata && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg whitespace-nowrap z-20 shadow-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-3 w-3" />
            <span>
              {voiceMetadata.provider} • {voiceMetadata.tone} • {voiceMetadata.speed}
            </span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      )}

      {/* Live region for screen reader announcements */}
      <div
        id={`tts-live-${deckId}-${moduleId}`}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
};

export default TTSToggle;