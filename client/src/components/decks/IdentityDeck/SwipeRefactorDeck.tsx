import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IdentitySummaryCard } from '../WalletOverviewDeck/IdentitySummaryCard';
import { ParticipationStreakOverview } from './ParticipationStreakCard.1';
import { ParticipationStreakVisual } from './ParticipationStreakCard.2';

interface SwipeRefactorDeckProps {
  className?: string;
}

const SwipeRefactorDeck: React.FC<SwipeRefactorDeckProps> = ({ className }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [renderStartTime] = useState(performance.now());
  const [swipeStartTime, setSwipeStartTime] = useState<number | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Define the cards in the swipe deck
  const cards = [
    {
      id: 'identity-summary',
      title: 'Identity Summary',
      component: <IdentitySummaryCard className="w-full max-w-none" />
    },
    {
      id: 'participation-overview',
      title: 'Participation Overview',
      component: <ParticipationStreakOverview className="w-full max-w-none" />
    },
    {
      id: 'participation-visual',
      title: 'Streak Visualization',
      component: <ParticipationStreakVisual className="w-full max-w-none" />
    }
  ];

  // Initialize TTS and mount announcement
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // TTS Mount Announcement
      const timer = setTimeout(() => {
        speakText("Swipe deck interface ready. Navigate with arrows or swipe gestures.");
      }, 500);

      return () => clearTimeout(timer);
    }

    // Log render performance
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`SwipeRefactorDeck render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`SwipeRefactorDeck render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS card navigation announcements
  useEffect(() => {
    if (swipeStartTime) {
      const swipeTime = performance.now() - swipeStartTime;
      if (swipeTime > 200) {
        console.warn(`Swipe cycle time: ${swipeTime.toFixed(2)}ms (exceeds 200ms target)`);
      } else {
        console.log(`Swipe cycle time: ${swipeTime.toFixed(2)}ms ✅`);
      }
      setSwipeStartTime(null);
    }

    // Announce current card
    const timer = setTimeout(() => {
      speakText(`Card ${currentCard + 1} active: ${cards[currentCard].title}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentCard, swipeStartTime]);

  const speakText = (text: string) => {
    // TTS DISABLED - User requested to stop looping
    console.log(`🔇 TTS disabled: "${text}"`);
    return;
  };

  const handlePrevious = () => {
    setSwipeStartTime(performance.now());
    setCurrentCard(prev => prev === 0 ? cards.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setSwipeStartTime(performance.now());
    setCurrentCard(prev => (prev + 1) % cards.length);
  };

  const handleBulletClick = (index: number) => {
    setSwipeStartTime(performance.now());
    setCurrentCard(index);
  };

  // Touch/swipe handlers for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <div 
      className={cn(
        'w-full max-w-sm mx-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden',
        className
      )}
      role="region"
      aria-label="Identity Deck Swipe Interface"
      data-testid="swipe-refactor-deck"
    >
      {/* Header with Navigation */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Identity Deck</h2>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-400">
              {currentCard + 1} of {cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div 
        className="relative h-[600px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentCard * 100}%)` }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="w-full flex-shrink-0 h-full"
              aria-hidden={index !== currentCard}
            >
              <div className="h-full p-4">
                {card.component}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <Button
          onClick={handlePrevious}
          variant="ghost"
          size="sm"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-slate-800/80 hover:bg-slate-700 backdrop-blur-sm border border-slate-600"
          aria-label="Previous card"
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleNext}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-slate-800/80 hover:bg-slate-700 backdrop-blur-sm border border-slate-600"
          aria-label="Next card"
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Bullet Navigation */}
      <div className="bg-slate-900 px-4 py-3 border-t border-slate-700">
        <div className="flex justify-center space-x-2" role="tablist" aria-label="Card navigation">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleBulletClick(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-200',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900',
                index === currentCard
                  ? 'bg-blue-400 shadow-lg'
                  : 'bg-slate-600 hover:bg-slate-500'
              )}
              aria-label={`Go to ${card.title}`}
              aria-selected={index === currentCard}
              role="tab"
              style={{ minHeight: '24px', minWidth: '24px' }}
            />
          ))}
        </div>
        
        {/* Live region for screen readers */}
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          Showing {cards[currentCard].title}, card {currentCard + 1} of {cards.length}
        </div>
      </div>
    </div>
  );
};

export default SwipeRefactorDeck;