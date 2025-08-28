import React, { useEffect, useState } from 'react';

// Types for deck suggestion system
interface DeckSuggestionInput {
  mission: 'representation' | 'voice' | 'data' | null;
  lang: 'en' | 'es' | 'fr';
  streakDays: number;
  tier: 'citizen' | 'moderator' | 'governor';
}

interface DeckSuggestion {
  deckId: number;
  deckTitle: string;
  score: number;
  reason: string;
  cluster: string;
  accessLevel: 'public' | 'audit' | 'governor';
  modules: string[];
}

interface DeckMetadata {
  id: number;
  title: string;
  cluster: string;
  accessLevel: 'public' | 'audit' | 'governor';
  modules: string[];
  basePriority: number;
  missionAffinity: {
    representation: number;
    voice: number;
    data: number;
  };
  languageBoost: {
    en: number;
    es: number;
    fr: number;
  };
  streakMultiplier: number;
}

// Comprehensive deck metadata for scoring
const DECK_METADATA: DeckMetadata[] = [
  {
    id: 1,
    title: 'Wallet Dashboard',
    cluster: 'Identity',
    accessLevel: 'public',
    modules: ['IdentitySummaryCard', 'WalletBalanceCard', 'ParticipationStreakCard', 'WalletSyncCard'],
    basePriority: 75,
    missionAffinity: { representation: 20, voice: 30, data: 95 },
    languageBoost: { en: 5, es: 8, fr: 6 },
    streakMultiplier: 1.2
  },
  {
    id: 8,
    title: 'Civic Audit',
    cluster: 'Audit',
    accessLevel: 'audit',
    modules: ['AuditChainOverviewCard', 'LedgerAnomalyScannerCard', 'AuditResolutionPanelCard', 'TransparencyMetricsCard'],
    basePriority: 85,
    missionAffinity: { representation: 75, voice: 60, data: 80 },
    languageBoost: { en: 10, es: 12, fr: 8 },
    streakMultiplier: 1.5
  },
  {
    id: 9,
    title: 'Consensus Layer',
    cluster: 'Audit',
    accessLevel: 'audit',
    modules: ['VoteConsensusCard', 'DeliberationPanelCard', 'ZKProposalLogCard', 'CivicVoteDisputeCard'],
    basePriority: 90,
    missionAffinity: { representation: 88, voice: 70, data: 65 },
    languageBoost: { en: 8, es: 15, fr: 10 },
    streakMultiplier: 1.4
  },
  {
    id: 10,
    title: 'Feedback Dashboard',
    cluster: 'Feedback',
    accessLevel: 'public',
    modules: ['ZKPFeedbackNodeCard', 'SentimentAggregationCard', 'FeedbackImpactAnalyzerCard'],
    basePriority: 80,
    missionAffinity: { representation: 60, voice: 92, data: 35 },
    languageBoost: { en: 6, es: 18, fr: 12 },
    streakMultiplier: 1.3
  },
  {
    id: 13,
    title: 'Governance Dashboard',
    cluster: 'Governance',
    accessLevel: 'public',
    modules: ['PolicyEnforcementCard', 'PolicyAppealCard', 'PolicySignatureCard', 'PolicyAppealResolutionCard'],
    basePriority: 88,
    missionAffinity: { representation: 95, voice: 75, data: 40 },
    languageBoost: { en: 10, es: 16, fr: 14 },
    streakMultiplier: 1.6
  },
  {
    id: 2,
    title: 'Governance Swipe',
    cluster: 'Governance',
    accessLevel: 'public',
    modules: ['CivicSwipeCard', 'VoteLedgerCard', 'SessionStatusCard'],
    basePriority: 70,
    missionAffinity: { representation: 85, voice: 65, data: 25 },
    languageBoost: { en: 5, es: 10, fr: 8 },
    streakMultiplier: 1.1
  },
  {
    id: 3,
    title: 'Education Center',
    cluster: 'Education',
    accessLevel: 'public',
    modules: ['TruthLiteracyCard', 'CivicQuizCard', 'CivicResourceCard', 'CommunityForumCard'],
    basePriority: 65,
    missionAffinity: { representation: 70, voice: 80, data: 45 },
    languageBoost: { en: 8, es: 20, fr: 16 },
    streakMultiplier: 1.0
  }
];

// Tier access filtering
const getTierAccessibleDecks = (tier: 'citizen' | 'moderator' | 'governor'): DeckMetadata[] => {
  switch (tier) {
    case 'citizen':
      return DECK_METADATA.filter(d => d.accessLevel === 'public');
    case 'moderator':
      return DECK_METADATA.filter(d => d.accessLevel === 'public' || d.accessLevel === 'audit');
    case 'governor':
      return DECK_METADATA; // All decks accessible
    default:
      return DECK_METADATA.filter(d => d.accessLevel === 'public');
  }
};

// Deck scoring algorithm
const calculateDeckScore = (deck: DeckMetadata, input: DeckSuggestionInput): number => {
  let score = deck.basePriority;
  
  // Mission affinity scoring
  if (input.mission) {
    const missionBonus = deck.missionAffinity[input.mission];
    score = Math.max(score, missionBonus);
  }
  
  // Language boost
  const langBoost = deck.languageBoost[input.lang] || 0;
  score += langBoost;
  
  // Streak multiplier
  const streakBonus = input.streakDays > 0 ? (deck.streakMultiplier * Math.min(input.streakDays, 10)) : 0;
  score += streakBonus;
  
  // Tier bonus for appropriate access level
  if (input.tier === 'governor' && deck.accessLevel === 'governor') {
    score += 15;
  } else if (input.tier === 'moderator' && deck.accessLevel === 'audit') {
    score += 10;
  }
  
  // Cap score at 100
  return Math.min(Math.round(score), 100);
};

// Reason generation engine
const generateReason = (deck: DeckMetadata, input: DeckSuggestionInput, score: number): string => {
  const reasons: string[] = [];
  
  // Mission match
  if (input.mission) {
    const missionScore = deck.missionAffinity[input.mission];
    if (missionScore >= 80) {
      reasons.push(`Strong mission match: ${input.mission}`);
    } else if (missionScore >= 60) {
      reasons.push(`Moderate mission match: ${input.mission}`);
    }
  }
  
  // Language boost
  const langBoost = deck.languageBoost[input.lang] || 0;
  if (langBoost >= 15) {
    reasons.push(`High ${input.lang.toUpperCase()} language boost`);
  } else if (langBoost >= 10) {
    reasons.push(`${input.lang.toUpperCase()} language boost`);
  }
  
  // Streak bonus
  if (input.streakDays >= 7) {
    reasons.push(`${input.streakDays}-day streak bonus`);
  } else if (input.streakDays >= 3) {
    reasons.push(`${input.streakDays}-day streak active`);
  }
  
  // Access confirmation
  const accessGranted = getTierAccessibleDecks(input.tier).some(d => d.id === deck.id);
  if (accessGranted) {
    reasons.push('Access confirmed');
  }
  
  // Tier-specific bonus
  if (input.tier === 'governor' && deck.accessLevel === 'governor') {
    reasons.push('Governor-level access');
  } else if (input.tier === 'moderator' && deck.accessLevel === 'audit') {
    reasons.push('Moderator audit access');
  }
  
  return reasons.length > 0 ? reasons.join('. ') + '.' : `Score: ${score} based on general compatibility.`;
};

// Main deck suggestion function
export const getDeckSuggestions = (input: DeckSuggestionInput): DeckSuggestion[] => {
  const accessibleDecks = getTierAccessibleDecks(input.tier);
  
  const suggestions: DeckSuggestion[] = accessibleDecks.map(deck => {
    const score = calculateDeckScore(deck, input);
    const reason = generateReason(deck, input, score);
    
    return {
      deckId: deck.id,
      deckTitle: deck.title,
      score,
      reason,
      cluster: deck.cluster,
      accessLevel: deck.accessLevel,
      modules: deck.modules
    };
  });
  
  // Sort by score (descending)
  suggestions.sort((a, b) => b.score - a.score);
  
  // Ensure at least one fallback suggestion
  if (suggestions.length === 0) {
    const fallback = DECK_METADATA.find(d => d.accessLevel === 'public');
    if (fallback) {
      suggestions.push({
        deckId: fallback.id,
        deckTitle: fallback.title,
        score: 50,
        reason: 'Fallback suggestion - default public access.',
        cluster: fallback.cluster,
        accessLevel: fallback.accessLevel,
        modules: fallback.modules
      });
    }
  }
  
  return suggestions;
};

// Explanation engine for top suggestions
const generateTopSuggestionsExplanation = (suggestions: DeckSuggestion[], input: DeckSuggestionInput): string => {
  const top3 = suggestions.slice(0, 3);
  const explanations: string[] = [];
  
  if (input.mission) {
    explanations.push(`Matched mission '${input.mission}'`);
  }
  
  if (input.lang !== 'en') {
    explanations.push(`${input.lang.toUpperCase()} lang boost`);
  }
  
  if (input.streakDays > 0) {
    explanations.push(`${input.streakDays}-day streak bonus`);
  }
  
  if (input.tier !== 'citizen') {
    explanations.push(`${input.tier} tier access`);
  }
  
  return explanations.join(', ');
};

// Main DeckSuggestionIntelligence component (logic-only)
interface DeckSuggestionIntelligenceProps {
  input?: DeckSuggestionInput;
  onSuggestionsCalculated?: (suggestions: DeckSuggestion[]) => void;
  autoInitialize?: boolean;
}

export const DeckSuggestionIntelligence: React.FC<DeckSuggestionIntelligenceProps> = ({
  input,
  onSuggestionsCalculated,
  autoInitialize = true
}) => {
  const [initialized, setInitialized] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<DeckSuggestion[]>([]);
  const [processingTime, setProcessingTime] = useState(0);

  // Initialize or update suggestions
  useEffect(() => {
    if (!autoInitialize || !input) return;
    
    const startTime = Date.now();
    
    const suggestions = getDeckSuggestions(input);
    const processingDuration = Date.now() - startTime;
    
    setCurrentSuggestions(suggestions);
    setProcessingTime(processingDuration);
    
    // Console logging as required
    if (!initialized) {
      console.log('🧠 Deck Suggestion Engine Initialized');
      setInitialized(true);
    }
    
    // Top suggestions logging
    const top3 = suggestions.slice(0, 3);
    const topScores = top3.map(s => `Deck #${s.deckId}: ${s.score}`).join(', ');
    console.log(`📊 Top Suggestions → ${topScores}`);
    
    // Explanation logging
    const explanation = generateTopSuggestionsExplanation(suggestions, input);
    console.log(`🧠 Explanation: ${explanation}`);
    
    // Performance logging
    if (processingDuration > 200) {
      console.warn(`⚠️ Deck Suggestion Engine processing time: ${processingDuration}ms (exceeds 200ms target)`);
    }
    
    // Detailed suggestion logging
    top3.forEach((suggestion, index) => {
      console.log(`🎯 Suggestion ${index + 1}: ${suggestion.deckTitle} (Score: ${suggestion.score})`);
      console.log(`   Reason: ${suggestion.reason}`);
      console.log(`   Cluster: ${suggestion.cluster} | Access: ${suggestion.accessLevel}`);
    });
    
    // Notify parent component
    if (onSuggestionsCalculated) {
      onSuggestionsCalculated(suggestions);
    }
  }, [input, autoInitialize, initialized, onSuggestionsCalculated]);

  // This component is logic-only, no UI rendered per directive
  return null;
};

// Utility functions for external integration
export const simulateDeckSuggestions = (
  mission: 'representation' | 'voice' | 'data' | null = 'voice',
  lang: 'en' | 'es' | 'fr' = 'en',
  streakDays: number = 5,
  tier: 'citizen' | 'moderator' | 'governor' = 'citizen'
): DeckSuggestion[] => {
  const input: DeckSuggestionInput = { mission, lang, streakDays, tier };
  return getDeckSuggestions(input);
};

export const getTopDeckSuggestion = (input: DeckSuggestionInput): DeckSuggestion | null => {
  const suggestions = getDeckSuggestions(input);
  return suggestions.length > 0 ? suggestions[0] : null;
};

export const getDeckMetadata = (deckId: number): DeckMetadata | null => {
  return DECK_METADATA.find(d => d.id === deckId) || null;
};

export const getAccessibleDecksForTier = (tier: 'citizen' | 'moderator' | 'governor'): DeckMetadata[] => {
  return getTierAccessibleDecks(tier);
};

export const calculateDeckCompatibility = (deckId: number, input: DeckSuggestionInput): number => {
  const deck = getDeckMetadata(deckId);
  if (!deck) return 0;
  
  const accessibleDecks = getTierAccessibleDecks(input.tier);
  const hasAccess = accessibleDecks.some(d => d.id === deckId);
  
  if (!hasAccess) return 0;
  
  return calculateDeckScore(deck, input);
};

// Export types for external use
export type { DeckSuggestionInput, DeckSuggestion, DeckMetadata };

export default DeckSuggestionIntelligence;