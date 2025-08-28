// DeckSwipeEngine.tsx - Phase TRILAYER v1.0 Module 4
// Native swipe navigation for civic deck modules with preloading
// Commander Mark directive via JASMY Relay

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PanInfo {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeModule {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
  preloaded?: boolean;
  loading?: boolean;
  error?: string;
}

interface DeckSwipeEngineProps {
  modules: SwipeModule[];
  currentModuleIndex: number;
  onModuleChange: (index: number) => void;
  deckId: string;
  className?: string;
  swipeEnabled?: boolean;
  preloadDistance?: number;
}

interface SwipeState {
  currentIndex: number;
  preloadedModules: Set<number>;
  direction: 'left' | 'right' | null;
  isAnimating: boolean;
  touchStartX: number;
  isDragging: boolean;
}

export const DeckSwipeEngine: React.FC<DeckSwipeEngineProps> = ({
  modules,
  currentModuleIndex,
  onModuleChange,
  deckId,
  className = '',
  swipeEnabled = true,
  preloadDistance = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    currentIndex: currentModuleIndex,
    preloadedModules: new Set([currentModuleIndex]),
    direction: null,
    isAnimating: false,
    touchStartX: 0,
    isDragging: false
  });

  // Sync with external currentModuleIndex changes
  useEffect(() => {
    if (currentModuleIndex !== swipeState.currentIndex) {
      setSwipeState(prev => ({
        ...prev,
        currentIndex: currentModuleIndex
      }));
    }
  }, [currentModuleIndex]);

  // Preload adjacent modules
  useEffect(() => {
    const preloadModules = async () => {
      const indicesToPreload = new Set<number>();
      
      // Add current module
      indicesToPreload.add(swipeState.currentIndex);
      
      // Add adjacent modules within preloadDistance
      for (let i = 1; i <= preloadDistance; i++) {
        const prevIndex = swipeState.currentIndex - i;
        const nextIndex = swipeState.currentIndex + i;
        
        if (prevIndex >= 0) indicesToPreload.add(prevIndex);
        if (nextIndex < modules.length) indicesToPreload.add(nextIndex);
      }

      // Only preload modules that aren't already preloaded
      const preloadedArray = Array.from(swipeState.preloadedModules);
      const newModulesToPreload = Array.from(indicesToPreload).filter(
        index => !preloadedArray.includes(index)
      );

      if (newModulesToPreload.length > 0) {
        console.log(`🔄 Preloading modules: ${newModulesToPreload.join(', ')} for deck ${deckId}`);
        
        setSwipeState(prev => ({
          ...prev,
          preloadedModules: new Set([...prev.preloadedModules, ...newModulesToPreload])
        }));

        // Simulate async preloading (in real implementation, this would load components/data)
        await Promise.all(
          newModulesToPreload.map(index => 
            new Promise(resolve => setTimeout(resolve, 100))
          )
        );

        console.log(`✅ Preloading completed for modules: ${newModulesToPreload.join(', ')}`);
      }
    };

    preloadModules();
  }, [swipeState.currentIndex, modules.length, deckId, preloadDistance]);

  const navigateToModule = useCallback((newIndex: number, direction: 'left' | 'right') => {
    if (newIndex < 0 || newIndex >= modules.length || swipeState.isAnimating) {
      return;
    }

    setSwipeState(prev => ({
      ...prev,
      currentIndex: newIndex,
      direction,
      isAnimating: true
    }));

    // Notify parent component
    onModuleChange(newIndex);

    // Clear animation state after transition
    setTimeout(() => {
      setSwipeState(prev => ({
        ...prev,
        direction: null,
        isAnimating: false
      }));
    }, 300);

    console.log(`🔄 Navigated to module ${newIndex} (${direction}) in deck ${deckId}`);
  }, [modules.length, swipeState.isAnimating, onModuleChange, deckId]);

  const handleSwipeLeft = useCallback(() => {
    const nextIndex = swipeState.currentIndex + 1;
    if (nextIndex < modules.length) {
      navigateToModule(nextIndex, 'left');
    }
  }, [swipeState.currentIndex, modules.length, navigateToModule]);

  const handleSwipeRight = useCallback(() => {
    const prevIndex = swipeState.currentIndex - 1;
    if (prevIndex >= 0) {
      navigateToModule(prevIndex, 'right');
    }
  }, [swipeState.currentIndex, navigateToModule]);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (!swipeEnabled) return;

    const swipeThreshold = 100;
    const velocityThreshold = 500;

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold) {
      if (info.offset.x > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    }

    setSwipeState(prev => ({ ...prev, isDragging: false }));
  }, [swipeEnabled, handleSwipeLeft, handleSwipeRight]);

  const handleDragStart = useCallback(() => {
    if (swipeEnabled) {
      setSwipeState(prev => ({ ...prev, isDragging: true }));
    }
  }, [swipeEnabled]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!swipeEnabled) return;
    
    setSwipeState(prev => ({
      ...prev,
      touchStartX: e.touches[0].clientX,
      isDragging: true
    }));
  }, [swipeEnabled]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeEnabled || !swipeState.isDragging) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - swipeState.touchStartX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    }

    setSwipeState(prev => ({ ...prev, isDragging: false }));
  }, [swipeEnabled, swipeState.isDragging, swipeState.touchStartX, handleSwipeLeft, handleSwipeRight]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!swipeEnabled || swipeState.isAnimating) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleSwipeRight();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSwipeLeft();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [swipeEnabled, swipeState.isAnimating, handleSwipeLeft, handleSwipeRight]);

  const currentModule = modules[swipeState.currentIndex];
  const isPreloaded = swipeState.preloadedModules.has(swipeState.currentIndex);

  const slideVariants = {
    enter: (direction: string) => ({
      x: direction === 'left' ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      zIndex: 0,
      x: direction === 'left' ? -1000 : 1000,
      opacity: 0,
    }),
  };

  if (!currentModule) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading module...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Swipeable deck modules"
    >
      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-0 z-10 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSwipeRight}
          disabled={swipeState.currentIndex === 0 || swipeState.isAnimating}
          className="ml-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          aria-label="Previous module"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 z-10 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSwipeLeft}
          disabled={swipeState.currentIndex === modules.length - 1 || swipeState.isAnimating}
          className="mr-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          aria-label="Next module"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Module Container */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={swipeState.direction}>
          <motion.div
            key={swipeState.currentIndex}
            custom={swipeState.direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag={swipeEnabled ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              touchAction: swipeEnabled ? 'pan-y' : 'auto'
            }}
          >
            {/* Loading State */}
            {!isPreloaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading module content...</p>
                </div>
              </div>
            ) : (
              /* Module Content */
              <div className="h-full">
                {React.createElement(currentModule.component, {
                  ...currentModule.props,
                  key: `${deckId}-${currentModule.id}`,
                  deckId,
                  moduleId: currentModule.id
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-2">
          {modules.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === swipeState.currentIndex
                  ? 'bg-primary scale-125'
                  : swipeState.preloadedModules.has(index)
                  ? 'bg-primary/50'
                  : 'bg-muted-foreground/30'
              }`}
              aria-label={`Module ${index + 1} ${index === swipeState.currentIndex ? '(current)' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Module {swipeState.currentIndex + 1} of {modules.length}: {currentModule.id}
        {swipeState.isAnimating && ' (transitioning)'}
      </div>

      {/* Swipe Instructions */}
      {swipeEnabled && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground">
            Swipe or use arrow keys to navigate
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckSwipeEngine;