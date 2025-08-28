// DeckNarrationTTSBridge.tsx - Phase X-D Step 4 Core Deliverable 2
// Real-time delta narration via ARIA live regions for trust spikes
// Commander Mark directive via JASMY Relay

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Volume2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrustDelta {
  deckId: string;
  deltaType: 'spike' | 'dip' | 'stable';
  magnitude: number;
  timestamp: Date;
  triggerSource: 'policy_vote' | 'citizen_feedback' | 'representative_action';
}

interface TTSNarrationEvent {
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deltaType: string;
  deckId: string;
}

interface DeckNarrationTTSBridgeProps {
  deckId: string;
  enableRealTimeNarration?: boolean;
  voicePriority?: 'accessibility' | 'ambient' | 'alert';
  className?: string;
}

export const DeckNarrationTTSBridge: React.FC<DeckNarrationTTSBridgeProps> = ({
  deckId,
  enableRealTimeNarration = true,
  voicePriority = 'accessibility',
  className = ''
}) => {
  const [activeDelta, setActiveDelta] = useState<TrustDelta | null>(null);
  const [narrationQueue, setNarrationQueue] = useState<TTSNarrationEvent[]>([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const narrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trust spike detection thresholds
  const SPIKE_THRESHOLD = 15; // >=15% change triggers narration
  const CRITICAL_THRESHOLD = 30; // >=30% change triggers immediate narration

  useEffect(() => {
    if (!enableRealTimeNarration) return;

    // Listen for trust delta events
    const handleTrustDelta = (event: CustomEvent) => {
      const { deckId: eventDeckId, deltaType, magnitude, triggerSource } = event.detail;
      
      // Filter for current deck or system-wide critical events
      if (eventDeckId === deckId || magnitude >= CRITICAL_THRESHOLD) {
        const trustDelta: TrustDelta = {
          deckId: eventDeckId,
          deltaType,
          magnitude,
          timestamp: new Date(),
          triggerSource
        };

        setActiveDelta(trustDelta);
        processTrustDelta(trustDelta);
      }
    };

    // Listen for policy voting completion
    const handlePolicyVote = (event: CustomEvent) => {
      const { result, impactScore } = event.detail;
      
      if (impactScore > 70) { // High-impact policy votes
        const narrationEvent: TTSNarrationEvent = {
          content: `Policy vote completed with ${impactScore}% civic impact. Trust feedback active.`,
          priority: 'medium',
          deltaType: 'policy_impact',
          deckId
        };

        addToNarrationQueue(narrationEvent);
      }
    };

    window.addEventListener('trust-delta-detected', handleTrustDelta as EventListener);
    window.addEventListener('policy-vote-complete', handlePolicyVote as EventListener);

    // Simulate trust delta events for testing
    if (deckId === 'governance_feedback') {
      const simulateDeltas = () => {
        const deltaTypes = ['spike', 'dip', 'stable'] as const;
        const triggerSources = ['policy_vote', 'citizen_feedback', 'representative_action'] as const;
        
        const event = new CustomEvent('trust-delta-detected', {
          detail: {
            deckId,
            deltaType: deltaTypes[Math.floor(Math.random() * deltaTypes.length)],
            magnitude: Math.floor(Math.random() * 40) + 5, // 5-45% range
            triggerSource: triggerSources[Math.floor(Math.random() * triggerSources.length)]
          }
        });
        
        window.dispatchEvent(event);
      };

      const interval = setInterval(simulateDeltas, 45000); // Every 45 seconds

      return () => {
        window.removeEventListener('trust-delta-detected', handleTrustDelta as EventListener);
        window.removeEventListener('policy-vote-complete', handlePolicyVote as EventListener);
        clearInterval(interval);
      };
    }

    return () => {
      window.removeEventListener('trust-delta-detected', handleTrustDelta as EventListener);
      window.removeEventListener('policy-vote-complete', handlePolicyVote as EventListener);
    };
  }, [deckId, enableRealTimeNarration]);

  const processTrustDelta = (delta: TrustDelta) => {
    // Generate narration based on delta characteristics
    const narrationContent = generateDeltaNarration(delta);
    const priority = determinePriority(delta);

    const narrationEvent: TTSNarrationEvent = {
      content: narrationContent,
      priority,
      deltaType: delta.deltaType,
      deckId: delta.deckId
    };

    addToNarrationQueue(narrationEvent);
    
    console.log(`🔊 Trust delta narration triggered: ${delta.deckId} (${delta.magnitude}% ${delta.deltaType})`);
  };

  const generateDeltaNarration = (delta: TrustDelta): string => {
    // Sanitize content - remove CID/DID/PII before narration per privacy flags
    const sanitizedDeckId = delta.deckId.replace(/^did:/, '').replace(/^Qm[a-zA-Z0-9]{44}/, 'deck');
    
    const magnitude = Math.floor(delta.magnitude);
    const deltaTypeText = delta.deltaType === 'spike' ? 'increase' : 
                         delta.deltaType === 'dip' ? 'decrease' : 'stabilization';
    
    let narrationText = '';

    if (magnitude >= CRITICAL_THRESHOLD) {
      narrationText = `Critical trust ${deltaTypeText} detected: ${magnitude} percent change in civic engagement.`;
    } else if (magnitude >= SPIKE_THRESHOLD) {
      narrationText = `Moderate trust ${deltaTypeText}: ${magnitude} percent shift in community sentiment.`;
    } else {
      narrationText = `Trust level ${deltaTypeText} of ${magnitude} percent registered.`;
    }

    // Add trigger context
    const triggerContext = {
      'policy_vote': 'following policy decision',
      'citizen_feedback': 'from community input',
      'representative_action': 'due to representative engagement'
    };

    if (delta.triggerSource && triggerContext[delta.triggerSource]) {
      narrationText += ` This change occurred ${triggerContext[delta.triggerSource]}.`;
    }

    return narrationText;
  };

  const determinePriority = (delta: TrustDelta): 'low' | 'medium' | 'high' | 'critical' => {
    if (delta.magnitude >= CRITICAL_THRESHOLD) return 'critical';
    if (delta.magnitude >= SPIKE_THRESHOLD) return 'high';
    if (delta.magnitude >= 10) return 'medium';
    return 'low';
  };

  const addToNarrationQueue = (event: TTSNarrationEvent) => {
    setNarrationQueue(prev => {
      // Sort by priority (critical first)
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const newQueue = [...prev, event].sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      
      // Limit queue size to prevent overflow
      return newQueue.slice(0, 5);
    });

    // Start narration processing if not already active
    if (!isNarrating) {
      processNarrationQueue();
    }
  };

  const processNarrationQueue = async () => {
    if (narrationQueue.length === 0 || isNarrating) return;

    setIsNarrating(true);

    try {
      const currentEvent = narrationQueue[0];
      
      // Update ARIA live region for screen readers
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = currentEvent.content;
      }

      // Trigger TTS narration with <100ms sync requirement
      await triggerTTSNarration(currentEvent);

      // Remove processed event from queue
      setNarrationQueue(prev => prev.slice(1));

      // Process next event after delay
      narrationTimeoutRef.current = setTimeout(() => {
        setIsNarrating(false);
        processNarrationQueue();
      }, 2000); // 2-second gap between narrations

    } catch (error) {
      console.error('❌ TTS narration failed:', error);
      setIsNarrating(false);
    }
  };

  const triggerTTSNarration = async (event: TTSNarrationEvent): Promise<void> => {
    const startTime = Date.now();

    try {
      // Check if TTS agent is available
      const ttsAgent = (window as any).ttsEngineAgent;
      
      if (ttsAgent && typeof ttsAgent.narrateContent === 'function') {
        // Use existing TTS agent with high priority for trust deltas
        await ttsAgent.narrateContent(
          event.deckId,
          'trust_delta',
          event.content,
          event.priority === 'critical' ? 'high' : 'medium'
        );
      } else {
        // Fallback to browser speech synthesis
        const utterance = new SpeechSynthesisUtterance(event.content);
        utterance.rate = event.priority === 'critical' ? 1.2 : 1.0;
        utterance.volume = 0.8;
        
        // Select appropriate voice based on priority
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || voice.name.includes('Microsoft')
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        speechSynthesis.speak(utterance);
      }

      const syncTime = Date.now() - startTime;
      console.log(`🎤 TTS delta narration completed: ${syncTime}ms sync time`);

    } catch (error) {
      console.error('❌ TTS narration synthesis failed:', error);
      throw error;
    }
  };

  const getDeltaIcon = (deltaType: string) => {
    switch (deltaType) {
      case 'spike': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'dip': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDeltaVariant = (magnitude: number) => {
    if (magnitude >= CRITICAL_THRESHOLD) return 'destructive';
    if (magnitude >= SPIKE_THRESHOLD) return 'default';
    return 'secondary';
  };

  return (
    <div className={`trust-narration-bridge ${className}`}>
      {/* ARIA Live Region for Screen Readers */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="status"
      />

      {/* Visual Trust Delta Alert */}
      {activeDelta && activeDelta.magnitude >= SPIKE_THRESHOLD && (
        <Alert 
          variant={getDeltaVariant(activeDelta.magnitude)}
          className="mb-4 border-l-4"
        >
          <div className="flex items-center gap-2">
            {getDeltaIcon(activeDelta.deltaType)}
            <Volume2 className="h-4 w-4" />
          </div>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Trust {activeDelta.deltaType}: {Math.floor(activeDelta.magnitude)}% change detected
              </span>
              <span className="text-xs text-muted-foreground">
                {activeDelta.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Narration Queue Status */}
      {narrationQueue.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Volume2 className="h-3 w-3" />
          <span>
            {isNarrating ? 'Narrating trust impact...' : `${narrationQueue.length} narration(s) queued`}
          </span>
        </div>
      )}

      {/* Trust Impact Feedback Cue */}
      {activeDelta && activeDelta.triggerSource === 'policy_vote' && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Trust Impact Active</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Policy voting has triggered civic trust feedback. Audio narration in progress.
          </p>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && activeDelta && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            Debug: Trust Delta Details
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(activeDelta, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default DeckNarrationTTSBridge;