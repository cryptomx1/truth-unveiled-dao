// Truth Trace Engine - ReverseImpactAnalyzer
// Scans previous session logs for actions that influenced memory replay outcomes

import { MemoryReplayEvent, TraceChainRegistry } from './TraceChainRegistry';

export interface CausalInfluence {
  influencerEvent: MemoryReplayEvent;
  targetEvent: MemoryReplayEvent;
  influenceType: 'direct' | 'prerequisite' | 'enabler' | 'catalyst';
  strength: number; // 0-1 scale
  description: string;
  timeDelta: number; // milliseconds between events
}

export interface CausalChain {
  targetEvent: MemoryReplayEvent;
  influences: CausalInfluence[];
  rootCause?: MemoryReplayEvent;
  chainNarrative: string;
}

class ReverseImpactAnalyzerClass {
  
  // Analyze causal influences for a specific event
  analyzeCausalInfluences(targetEvent: MemoryReplayEvent): CausalChain {
    const traceChain = TraceChainRegistry.getTraceChain();
    const influences: CausalInfluence[] = [];
    
    // Find events that occurred before the target
    const priorEvents = traceChain.filter(event => 
      event.timestamp < targetEvent.timestamp
    );

    // Analyze different types of influences
    priorEvents.forEach(priorEvent => {
      const influence = this.detectInfluence(priorEvent, targetEvent);
      if (influence) {
        influences.push(influence);
      }
    });

    // Sort by influence strength and recency
    influences.sort((a, b) => {
      if (a.strength !== b.strength) {
        return b.strength - a.strength; // Higher strength first
      }
      return a.timeDelta - b.timeDelta; // More recent first for same strength
    });

    // Find root cause (earliest high-influence event)
    const rootCause = influences
      .filter(inf => inf.strength >= 0.7)
      .sort((a, b) => a.influencerEvent.timestamp - b.influencerEvent.timestamp)[0]?.influencerEvent;

    return {
      targetEvent,
      influences: influences.slice(0, 5), // Top 5 influences
      rootCause,
      chainNarrative: this.generateChainNarrative(targetEvent, influences, rootCause)
    };
  }

  // Detect influence relationship between two events
  private detectInfluence(priorEvent: MemoryReplayEvent, targetEvent: MemoryReplayEvent): CausalInfluence | null {
    const timeDelta = targetEvent.timestamp - priorEvent.timestamp;
    
    // Skip if events are too far apart (more than 1 hour)
    if (timeDelta > 60 * 60 * 1000) return null;

    let influenceType: CausalInfluence['influenceType'];
    let strength = 0;
    let description = '';

    // Direct influence: Same deck, different modules
    if (priorEvent.sourceDeck === targetEvent.sourceDeck && priorEvent.moduleId !== targetEvent.moduleId) {
      influenceType = 'direct';
      strength = 0.8;
      description = `Previous activity in ${priorEvent.sourceDeck} deck enabled this action`;
    }
    // Prerequisite: Mission selection enabling deck access
    else if (priorEvent.action === 'mission_select' && targetEvent.action === 'deck_visit') {
      influenceType = 'prerequisite';
      strength = 0.9;
      description = `Mission "${priorEvent.value}" unlocked access to ${targetEvent.value}`;
    }
    // Enabler: Tier upgrade enabling new functionality
    else if (priorEvent.action === 'tier_upgrade' && 
             ['mission_select', 'deck_visit'].includes(targetEvent.action)) {
      influenceType = 'enabler';
      strength = 0.7;
      description = `${priorEvent.value} tier provided access to ${targetEvent.action}`;
    }
    // Catalyst: Sequential deck visits (workflow pattern)
    else if (priorEvent.action === 'deck_visit' && targetEvent.action === 'deck_visit' &&
             priorEvent.sourceDeck !== targetEvent.sourceDeck) {
      influenceType = 'catalyst';
      strength = 0.5;
      description = `Navigation pattern: ${priorEvent.value} → ${targetEvent.value}`;
    }
    // Temporal clustering: Events close in time
    else if (timeDelta < 5 * 60 * 1000) { // Within 5 minutes
      influenceType = 'catalyst';
      strength = 0.3;
      description = `Temporal proximity suggests related activity`;
    }
    else {
      return null;
    }

    // Adjust strength based on time proximity
    const timeBonus = Math.max(0, 1 - (timeDelta / (30 * 60 * 1000))); // Boost for events within 30 min
    strength = Math.min(1, strength + (timeBonus * 0.2));

    return {
      influencerEvent: priorEvent,
      targetEvent,
      influenceType,
      strength,
      description,
      timeDelta
    };
  }

  // Generate human-readable narrative of causal chain
  private generateChainNarrative(
    targetEvent: MemoryReplayEvent, 
    influences: CausalInfluence[], 
    rootCause?: MemoryReplayEvent
  ): string {
    if (influences.length === 0) {
      return `${targetEvent.action} "${targetEvent.value}" appears to be an independent action with no clear prior influences.`;
    }

    const primaryInfluence = influences[0];
    let narrative = `${targetEvent.action} "${targetEvent.value}" was primarily influenced by `;
    
    if (rootCause && rootCause.actionId === primaryInfluence.influencerEvent.actionId) {
      narrative += `the root action: ${rootCause.action} "${rootCause.value}".`;
    } else {
      narrative += `${primaryInfluence.influencerEvent.action} "${primaryInfluence.influencerEvent.value}".`;
    }

    // Add secondary influences
    if (influences.length > 1) {
      const secondaryInfluences = influences.slice(1, 3);
      const secondaryDescriptions = secondaryInfluences.map(inf => 
        `${inf.influencerEvent.action} "${inf.influencerEvent.value}"`
      );
      
      if (secondaryDescriptions.length === 1) {
        narrative += ` Additionally, ${secondaryDescriptions[0]} provided supporting context.`;
      } else {
        narrative += ` Supporting factors included ${secondaryDescriptions.join(' and ')}.`;
      }
    }

    // Add timeline context
    const timespan = this.formatTimespan(primaryInfluence.timeDelta);
    narrative += ` This chain of influence developed over ${timespan}.`;

    return narrative;
  }

  // Format time delta for human readability
  private formatTimespan(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  }

  // Get influence summary for multiple events
  getInfluenceSummary(events: MemoryReplayEvent[]): {
    totalInfluences: number;
    strongInfluences: number;
    commonInfluencers: MemoryReplayEvent[];
    narrativeSummary: string;
  } {
    let totalInfluences = 0;
    let strongInfluences = 0;
    const influencerCounts = new Map<string, { event: MemoryReplayEvent; count: number }>();

    events.forEach(event => {
      const analysis = this.analyzeCausalInfluences(event);
      totalInfluences += analysis.influences.length;
      strongInfluences += analysis.influences.filter(inf => inf.strength >= 0.7).length;

      analysis.influences.forEach(inf => {
        const key = inf.influencerEvent.actionId;
        if (!influencerCounts.has(key)) {
          influencerCounts.set(key, { event: inf.influencerEvent, count: 0 });
        }
        influencerCounts.get(key)!.count++;
      });
    });

    // Find most common influencers
    const commonInfluencers = Array.from(influencerCounts.values())
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.event);

    const narrativeSummary = `Analyzed ${events.length} events with ${totalInfluences} total influences, ` +
      `${strongInfluences} of which were strong (≥70% confidence). ` +
      (commonInfluencers.length > 0 
        ? `Common influencing factors: ${commonInfluencers.map(e => `${e.action} "${e.value}"`).join(', ')}.`
        : 'No recurring influence patterns detected.');

    return {
      totalInfluences,
      strongInfluences,
      commonInfluencers,
      narrativeSummary
    };
  }

  // Generate ARIA-friendly narrative for screen readers
  generateAccessibleNarrative(causalChain: CausalChain): string {
    const { targetEvent, influences, chainNarrative } = causalChain;
    
    let ariaText = `Analyzing causal influences for ${targetEvent.action} set to ${targetEvent.value}. `;
    
    if (influences.length === 0) {
      ariaText += 'No significant prior influences detected. This appears to be an independent action.';
    } else {
      ariaText += `Found ${influences.length} influencing factor${influences.length !== 1 ? 's' : ''}. `;
      
      const strongInfluences = influences.filter(inf => inf.strength >= 0.7);
      if (strongInfluences.length > 0) {
        ariaText += `${strongInfluences.length} strong influence${strongInfluences.length !== 1 ? 's' : ''} detected. `;
      }
      
      ariaText += `Primary influence: ${influences[0].description}. `;
      ariaText += chainNarrative;
    }

    return ariaText;
  }
}

// Singleton instance
export const ReverseImpactAnalyzer = new ReverseImpactAnalyzerClass();

// React hook for reverse impact analysis
export const useReverseImpactAnalyzer = () => {
  const analyzeEvent = (event: MemoryReplayEvent) => {
    return ReverseImpactAnalyzer.analyzeCausalInfluences(event);
  };

  const getSummary = (events: MemoryReplayEvent[]) => {
    return ReverseImpactAnalyzer.getInfluenceSummary(events);
  };

  const getAccessibleNarrative = (causalChain: CausalChain) => {
    return ReverseImpactAnalyzer.generateAccessibleNarrative(causalChain);
  };

  return {
    analyzeEvent,
    getSummary,
    getAccessibleNarrative
  };
};