import { useEffect, useRef, useState } from 'react';
import { useLang } from '../system/AccessibilityHarmonyEngine';
// Deck mappings with access levels
const DECK_MAPPINGS = [
    {
        id: 1,
        name: 'WalletOverviewDeck',
        title: 'Wallet Dashboard',
        cluster: 'Identity',
        modules: ['IdentitySummaryCard', 'WalletBalanceCard', 'ParticipationStreakCard', 'WalletSyncCard'],
        accessLevel: 'public'
    },
    {
        id: 8,
        name: 'CivicAuditDeck',
        title: 'Civic Audit',
        cluster: 'Audit',
        modules: ['AuditChainOverviewCard', 'LedgerAnomalyScannerCard', 'AuditResolutionPanelCard', 'TransparencyMetricsCard'],
        accessLevel: 'audit'
    },
    {
        id: 9,
        name: 'ConsensusLayerDeck',
        title: 'Consensus Layer',
        cluster: 'Audit',
        modules: ['VoteConsensusCard', 'DeliberationPanelCard', 'ZKProposalLogCard', 'CivicVoteDisputeCard'],
        accessLevel: 'audit'
    },
    {
        id: 10,
        name: 'GovernanceFeedbackDeck',
        title: 'Feedback Dashboard',
        cluster: 'Feedback',
        modules: ['ZKPFeedbackNodeCard', 'SentimentAggregationCard', 'FeedbackImpactAnalyzerCard'],
        accessLevel: 'public'
    },
    {
        id: 13,
        name: 'CivicGovernanceDeck',
        title: 'Governance Dashboard',
        cluster: 'Governance',
        modules: ['PolicyEnforcementCard', 'PolicyAppealCard', 'PolicySignatureCard', 'PolicyAppealResolutionCard'],
        accessLevel: 'public'
    }
];
// Mission to deck mapping logic
const getMissionTargetDeck = (mission) => {
    switch (mission) {
        case 'representation':
            return DECK_MAPPINGS.find(d => d.id === 13) || null; // Governance
        case 'voice':
            return DECK_MAPPINGS.find(d => d.id === 10) || null; // Feedback
        case 'data':
            return DECK_MAPPINGS.find(d => d.id === 1) || null; // Wallet/Identity
        default:
            return null;
    }
};
// Access level filtering
const getAccessibleDecks = (zkpTier) => {
    switch (zkpTier) {
        case 'citizen':
            return DECK_MAPPINGS.filter(d => d.accessLevel === 'public');
        case 'moderator':
            return DECK_MAPPINGS.filter(d => d.accessLevel === 'public' || d.accessLevel === 'audit');
        case 'governor':
            return DECK_MAPPINGS; // All clusters unlocked
        default:
            return DECK_MAPPINGS.filter(d => d.accessLevel === 'public');
    }
};
// Fallback deck selection
const getFallbackDeck = (accessibleDecks) => {
    // Default to first accessible deck, prefer identity/wallet
    const identityDeck = accessibleDecks.find(d => d.cluster === 'Identity');
    return identityDeck || accessibleDecks[0];
};
export const CivicCompass = ({ selectedMission = null, streakDays = 0, zkpTier = 'citizen', // Hardcoded simulation per directive
onRouteCalculated, className = '' }) => {
    const { lang } = useLang();
    const [initialized, setInitialized] = useState(false);
    const [currentRoute, setCurrentRoute] = useState(null);
    const [telemetryData, setTelemetryData] = useState(null);
    const compassRef = useRef(null);
    const mountTimestamp = useRef(Date.now());
    // Calculate compass route based on mission context
    const calculateRoute = (context) => {
        const accessibleDecks = getAccessibleDecks(context.zkpTier);
        const targetDeck = context.selectedMission ? getMissionTargetDeck(context.selectedMission) : null;
        const fallbackDeck = getFallbackDeck(accessibleDecks);
        // Check if target deck is accessible
        const accessGranted = targetDeck ? accessibleDecks.some(d => d.id === targetDeck.id) : false;
        const finalTargetDeck = (accessGranted && targetDeck) ? targetDeck : fallbackDeck;
        const route = {
            targetDeck: finalTargetDeck,
            fallbackDeck: fallbackDeck,
            accessGranted,
            routeReason: accessGranted
                ? `Mission-based routing to ${finalTargetDeck.cluster} cluster`
                : `Access denied, fallback to ${fallbackDeck.cluster} cluster`
        };
        return route;
    };
    // Log telemetry data
    const logTelemetry = (context, route) => {
        console.log('🧭 CivicCompass Initialized');
        console.log(`🎯 Mission Selected: ${context.selectedMission || 'none'}`);
        console.log(`🔥 Trust Streak: ${context.streakDays} days`);
        console.log(`🌍 Language: ${context.language.toUpperCase()}`);
        console.log(`🔐 ZKP Tier: ${context.zkpTier}`);
        console.log(`📊 Suggested Deck: Deck #${route.targetDeck.id} (${route.targetDeck.cluster} Cluster)`);
        console.log(`📦 Preview → Deck Title: '${route.targetDeck.title}', Modules: [${route.targetDeck.modules.slice(0, 2).join(', ')}]`);
        console.log(`🧭 CivicCompass Route → Deck #${route.targetDeck.id} (${route.targetDeck.cluster})`);
        // Additional telemetry
        console.log(`📋 Route Reason: ${route.routeReason}`);
        console.log(`🛡️ Access Granted: ${route.accessGranted ? 'Yes' : 'No'}`);
        console.log(`🔄 Fallback Available: Deck #${route.fallbackDeck.id} (${route.fallbackDeck.cluster})`);
        // Accessible decks summary
        const accessibleDecks = getAccessibleDecks(context.zkpTier);
        console.log(`🗂️ Accessible Decks: ${accessibleDecks.length} decks available for ${context.zkpTier} tier`);
        accessibleDecks.forEach(deck => {
            console.log(`  - Deck #${deck.id}: ${deck.title} (${deck.cluster})`);
        });
    };
    // Initialize compass with context
    useEffect(() => {
        if (initialized)
            return;
        const context = {
            selectedMission,
            streakDays,
            zkpTier,
            language: lang
        };
        const route = calculateRoute(context);
        // Log all telemetry
        logTelemetry(context, route);
        // Update state
        setTelemetryData(context);
        setCurrentRoute(route);
        setInitialized(true);
        // Notify parent component
        if (onRouteCalculated) {
            onRouteCalculated(route);
        }
    }, [initialized, selectedMission, streakDays, zkpTier, lang, onRouteCalculated]);
    // Update route when mission context changes
    useEffect(() => {
        if (!initialized)
            return;
        const context = {
            selectedMission,
            streakDays,
            zkpTier,
            language: lang
        };
        // Check if context has changed
        const contextChanged = !telemetryData ||
            telemetryData.selectedMission !== context.selectedMission ||
            telemetryData.streakDays !== context.streakDays ||
            telemetryData.zkpTier !== context.zkpTier ||
            telemetryData.language !== context.language;
        if (contextChanged) {
            const route = calculateRoute(context);
            console.log('🔄 CivicCompass Context Update');
            logTelemetry(context, route);
            setTelemetryData(context);
            setCurrentRoute(route);
            if (onRouteCalculated) {
                onRouteCalculated(route);
            }
        }
    }, [selectedMission, streakDays, zkpTier, lang, initialized, telemetryData, onRouteCalculated]);
    // This component is logic-only, no UI rendered per directive
    // Return null to render nothing but maintain React component structure
    return null;
};
// Utility functions for external use
export const simulateCompassRoute = (mission, streakDays, zkpTier = 'citizen', language = 'en') => {
    const context = {
        selectedMission: mission,
        streakDays,
        zkpTier,
        language
    };
    const accessibleDecks = getAccessibleDecks(context.zkpTier);
    const targetDeck = context.selectedMission ? getMissionTargetDeck(context.selectedMission) : null;
    const fallbackDeck = getFallbackDeck(accessibleDecks);
    const accessGranted = targetDeck ? accessibleDecks.some(d => d.id === targetDeck.id) : false;
    const finalTargetDeck = (accessGranted && targetDeck) ? targetDeck : fallbackDeck;
    return {
        targetDeck: finalTargetDeck,
        fallbackDeck: fallbackDeck,
        accessGranted,
        routeReason: accessGranted
            ? `Mission-based routing to ${finalTargetDeck.cluster} cluster`
            : `Access denied, fallback to ${fallbackDeck.cluster} cluster`
    };
};
export const getCompassTelemetry = (mission, streakDays, zkpTier = 'citizen', language = 'en') => {
    return {
        selectedMission: mission,
        streakDays,
        zkpTier,
        language
    };
};
export const getAccessibleDecksForTier = (zkpTier) => {
    return getAccessibleDecks(zkpTier);
};
export const getAllDeckMappings = () => {
    return [...DECK_MAPPINGS];
};
export default CivicCompass;
