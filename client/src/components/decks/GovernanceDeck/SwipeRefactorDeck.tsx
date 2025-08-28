import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import subcards
import { PolicyOverview } from './PolicyEnforcementCard.1';
import { EnforcementStatus } from './PolicyEnforcementCard.2';
import { AppealForm } from './PolicyAppealCard.1';
import { AppealStatusTracker } from './PolicyAppealCard.2';
import { ZKPProofTrail } from './PolicyAppealCard.3';

interface SwipeRefactorDeckProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

// Card configuration
const CARDS = [
  { id: 'policy-overview', component: PolicyOverview, title: 'Policy Overview' },
  { id: 'enforcement-status', component: EnforcementStatus, title: 'Enforcement Status' },
  { id: 'appeal-form', component: AppealForm, title: 'Appeal Form' },
  { id: 'appeal-status', component: AppealStatusTracker, title: 'Appeal Status' },
  { id: 'zkp-proof', component: ZKPProofTrail, title: 'ZKP Proof Trail' }
];

export const SwipeRefactorDeck: React.FC<SwipeRefactorDeckProps> = ({ className }) => {
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false
  });
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`SwipeRefactorDeck render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`SwipeRefactorDeck render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Initialize TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setTtsStatus(prev => ({ ...prev, isReady: true }));
      
      // Mount TTS message
      setTimeout(() => {
        speakMessage("Swipe deck interface ready", true);
      }, 1000);
    }
  }, []);

  // TTS Integration with proper cancellation
  const speakMessage = (message: string, force = false) => {
    // TTS DISABLED - User requested to stop looping
    console.log(`🔇 TTS disabled: "${message}"`);
    return;
  };

  // Navigation functions
  const navigateToCard = (index: number) => {
    if (index < 0 || index >= CARDS.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentCard(index);
    
    // TTS announcement
    const cardTitle = CARDS[index].title;
    speakMessage(`Card ${index + 1} active: ${cardTitle}`);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const goToNext = () => {
    if (currentCard < CARDS.length - 1) {
      navigateToCard(currentCard + 1);
    }
  };

  const goToPrevious = () => {
    if (currentCard > 0) {
      navigateToCard(currentCard - 1);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.isDragging || isTransitioning) return;
    
    const touch = e.touches[0];
    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY
    }));
  };

  const handleTouchEnd = () => {
    if (!touchState.isDragging || isTransitioning) {
      setTouchState(prev => ({ ...prev, isDragging: false }));
      return;
    }
    
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = Math.abs(touchState.currentY - touchState.startY);
    const threshold = 50;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        // Swipe right - go to previous card
        goToPrevious();
      } else {
        // Swipe left - go to next card
        goToNext();
      }
    }
    
    setTouchState(prev => ({ ...prev, isDragging: false }));
  };

  // Current card component
  const CurrentCardComponent = CARDS[currentCard].component;

  return (
    <div 
      className={cn('w-full max-w-md mx-auto', className)}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Governance Deck Swipe Interface"
      data-testid="swipe-refactor-deck"
    >
      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Deck #3: Governance (Swipe Refactor)
        </h2>
        <p className="text-sm text-slate-400">
          Policy enforcement and appeal management interface
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={goToPrevious}
          disabled={currentCard === 0 || isTransitioning}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-400 hover:bg-slate-700"
          style={{ minHeight: '48px', minWidth: '48px' }}
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Bullet Navigation */}
        <div className="flex space-x-2" role="tablist" aria-label="Card navigation">
          {CARDS.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToCard(index)}
              disabled={isTransitioning}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800',
                currentCard === index 
                  ? 'bg-blue-400 scale-110' 
                  : 'bg-slate-600 hover:bg-slate-500'
              )}
              style={{ minHeight: '24px', minWidth: '24px' }}
              role="tab"
              aria-selected={currentCard === index}
              aria-label={`Go to card ${index + 1}: ${CARDS[index].title}`}
            />
          ))}
        </div>

        <Button
          onClick={goToNext}
          disabled={currentCard === CARDS.length - 1 || isTransitioning}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-400 hover:bg-slate-700"
          style={{ minHeight: '48px', minWidth: '48px' }}
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Card Display */}
      <div className="relative overflow-hidden">
        <div
          className={cn(
            'transition-all duration-200 ease-in-out',
            isTransitioning ? 'opacity-75 scale-95' : 'opacity-100 scale-100'
          )}
          style={{ minHeight: '600px' }}
        >
          <CurrentCardComponent className="w-full" />
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm text-slate-400">
            {currentCard + 1} / {CARDS.length}
          </span>
          <span className="text-sm font-medium text-white">
            {CARDS[currentCard].title}
          </span>
        </div>
        
        {/* Touch Instructions */}
        <p className="text-xs text-slate-500 mt-2">
          Swipe left/right or use navigation buttons
        </p>
      </div>

      {/* Accessibility Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="swipe-announcements"
      >
        Showing card {currentCard + 1} of {CARDS.length}: {CARDS[currentCard].title}
      </div>
    </div>
  );
};

export default SwipeRefactorDeck;