import { IdentitySummaryCard, WalletBalanceCard, ParticipationStreakCard, WalletSyncCard, WalletTrustFeedbackCard } from '@/components/decks/WalletOverviewDeck';
import '@/utils/tts-disable';
import { TTSManager } from '@/components/ui/tts-killer';
import { ValidatorThrottle } from '@/components/phase3a/ValidatorThrottle';
import PillarLandingCard_Justice from '@/components/phase3a/PillarLandingCard_Justice';
import PillarLandingCard_Health from '@/components/phase3a/PillarLandingCard_Health';
import PillarLandingCard_Education from '@/components/phase3a/PillarLandingCard_Education';
import PillarLandingCard_Environment from '@/components/phase3a/PillarLandingCard_Environment';
import PillarLandingCard_Security from '@/components/phase3a/PillarLandingCard_Security';
import { TruthPointCalculator, TruthPointSimulator, PointInflationGuard } from '@/components/truth';
import { WalletOverviewCard, ColdStorageCard, TransactionStabilityCard } from '@/components/wallet';
import { RoleBasedOverlay, UrgencyTag, OverlayAuditTrail } from '@/components/overlay';
import { runTTSStressTest, getTTSMetrics } from '@/components/overlay';
import { UnificationOrchestrator } from '@/components/unification';
import { IdentityVault } from '@/components/vault';
import ProposalSubmission from '@/components/governance/ProposalSubmission';
import ConsensusTracker from '@/components/governance/ConsensusTracker';
import ZKVoteVerifierDemo from '@/components/governance/ZKVoteVerifierDemo';
import CredentialMintDemo from '@/components/demo/CredentialMintDemo';
import VaultExportDemo from '@/components/demo/VaultExportDemo';
import CredentialSyncDemo from '@/components/demo/CredentialSyncDemo';
import LedgerStreamVisualizer from '@/components/visualization/LedgerStreamVisualizer';
import CredentialConflictDemo from '@/components/demo/CredentialConflictDemo';
import PhaseVIILedgerStreamVisualizer from '@/components/decks/PhaseVII/LedgerStreamVisualizer';
import { StreamDeckOverviewLayer, DeckControlSwitchboard, CivicMirrorSyncGrid, CivicSyncDiagnosticsPanel, KnowledgeAtlasPanel, DeckIndexNavigator, DeckDetailView, DeckMissionCard, DeckExportBundle } from '@/components/phase/overview';
import { TrustVoteCard } from '@/components/phase/feedback';
import { SentimentCaptureForm, TrustAuditOverlay } from '@/components/phase/trust';
import { RoleInfluenceCard, FederatedTrustDisplay } from '@/components/phase/influence';
import { CivicValueBeacon } from '@/components/phase/beacon';
import { CivicConstellationExplorer } from '@/components/navigation/CivicConstellationExplorer';
import { CivicMemoryIndex } from '@/components/memory/CivicMemoryIndex';
import { TrustPulseWidget, DeckVolatilityOverlay } from '@/components/pulse';
import { SentimentExplorerPanel, SentimentReplayHeatmap } from '@/components/ledger';

import { CivicSwipeCard, VoteLedgerCard, SessionStatusCard, SwipeRefactorDeck as GovernanceSwipeRefactorDeck } from '@/components/decks/GovernanceDeck';
import { TruthLiteracyCard, CivicQuizCard, CivicResourceCard, CommunityForumCard } from '@/components/decks/EducationDeck';
import { ZKPLearningModuleCard, CurriculumAssessmentCard, CertificationVerificationCard, KnowledgeContributionCard } from '@/components/decks/CivicEducationDeck';
import { TreatyProposalCard, TreatyResponseCard, TreatyRatificationCard, TreatyArbitrationCard } from '@/components/decks/CivicDiplomacyDeck';
import { SustainabilityAllocationCard, ImpactEvaluationCard, OutcomeVerificationCard, SustainabilityAuditCard } from '@/components/decks/CivicSustainabilityDeck';
import { MentalHealthAccessCard, SocialCohesionCard, WellbeingDashboardCard, CommunitySupportCard } from '@/components/decks/CivicWellbeingDeck';
import { CivicMemoryVaultCard, CivicTestimonyCard, CivicLegacyIndexCard, CivicLegacySummitCard } from '@/components/decks/CivicLegacyDeck';
import { SwipeRefactorDeck } from '@/components/decks/IdentityDeck';
import { EarningsSummaryCard, TransactionHistoryCard, RewardsCalculatorCard, WithdrawalInterfaceCard } from '@/components/decks/FinanceDeck';
import { ZKPStatusCard, SessionPrivacyCard, EncryptedMessageCard, VaultAccessCard } from '@/components/decks/PrivacyDeck';
import { ZKProofGeneratorCard, ZKProofVerifierCard, ZKAuditTrailCard } from '@/components/decks/ZKPLayer';
import { ProofBoundVaultEntryCard, AssetSignatureViewerCard, CivicAssetTransferCard, AssetDisputeResolverCard } from '@/components/decks/SecureAssetsDeck';
import { AuditChainOverviewCard, LedgerAnomalyScannerCard, AuditResolutionPanelCard, TransparencyMetricsCard } from '@/components/decks/CivicAuditDeck';
import { VoteConsensusCard, DeliberationPanelCard, ZKProposalLogCard, CivicVoteDisputeCard, ConsensusTrustFeedbackCard } from '@/components/decks/ConsensusLayerDeck';
import { ZKPFeedbackNodeCard, SentimentAggregationCard, FeedbackImpactAnalyzerCard } from '@/components/decks/GovernanceFeedbackDeck';
import { CivicEngagementTrackerCard, TrustStreakRewardCard, ReputationLadderCard, EngagementIncentiveCard } from '@/components/decks/CivicEngagementDeck';
import { DIDClaimCard, BiometricProofCard, CredentialClaimCard, IdentityLineageViewerCard, IdentityTrustFeedbackCard } from '@/components/decks/CivicIdentityDeck';
import { PolicyEnforcementCard, PolicyAppealCard, PolicySignatureCard, PolicyAppealResolutionCard } from '@/components/decks/CivicGovernanceDeck';
import { AmendmentProposalCard, CommunityFeedbackCard, ZKPVotingWindowCard, DAORatificationCard } from '@/components/decks/CivicAmendmentsDeck';
import { EvidenceSubmissionCard, ArbitrationDecisionCard, JusticeAuditCard } from '@/components/decks/CivicJusticeDeck';

export default function IdentityDemo() {
  return (
    <div className="min-h-screen dao-gradient-bg flex items-center justify-center p-4">
      <TTSManager />
      <div className="flex flex-col gap-6 items-center max-w-screen-sm mx-auto w-full">
        
        {/* Phase III-A Protocol Validator - Step 1/6 */}
        <ValidatorThrottle />
        
        {/* Phase III-A Step 2/6 - PillarLandingCard Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <PillarLandingCard_Justice />
          <PillarLandingCard_Health />
          <PillarLandingCard_Education />
          <PillarLandingCard_Environment />
          <PillarLandingCard_Security />
        </div>
        
        {/* Phase III-A Step 3/6 - Truth Point Stack */}
        <div className="w-full">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-slate-100">Truth Point Stack</h2>
            <div className="text-sm text-slate-400">Step 3/6 - Calculator, Simulator & Inflation Guard</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TruthPointCalculator />
            <TruthPointSimulator />
            <PointInflationGuard />
          </div>
        </div>
        
        {/* Phase III-A Step 4/6 - Wallet Stack */}
        <div className="w-full">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-slate-100">Wallet Stack</h2>
            <div className="text-sm text-slate-400">Step 4/6 - Overview, Cold Storage & Transaction Stability</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <WalletOverviewCard />
            <ColdStorageCard />
            <TransactionStabilityCard />
          </div>
        </div>
        
        {/* Phase III-A Step 5/6 - RoleBasedOverlay Stack */}
        <div className="w-full">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-slate-100">RoleBasedOverlay Stack</h2>
            <div className="text-sm text-slate-400">Step 5/6 - Role Controls, Urgency Tags & Audit Trail</div>
          </div>
          
          {/* Overlay Demo Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <RoleBasedOverlay
              config={{
                id: 'citizen_demo',
                requiredRole: 'Citizen',
                fallbackVisible: true,
                testingMode: true,
                emergencyOverride: false
              }}
              onAccessViolation={(violation) => console.log('Access violation:', violation)}
              onRenderEvent={(event) => console.log('Render event:', event)}
            >
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">Citizen Access Demo</h3>
                <p className="text-sm text-slate-300">This content is accessible to Citizens and above.</p>
                <UrgencyTag 
                  level="info" 
                  message="General information" 
                  overlayId="citizen_demo"
                  testingMode={true}
                />
              </div>
            </RoleBasedOverlay>
            
            <RoleBasedOverlay
              config={{
                id: 'governor_demo',
                requiredRole: 'Governor',
                fallbackVisible: true,
                testingMode: true,
                emergencyOverride: false
              }}
              onAccessViolation={(violation) => console.log('Access violation:', violation)}
              onRenderEvent={(event) => console.log('Render event:', event)}
            >
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">Governor Access Demo</h3>
                <p className="text-sm text-slate-300">This content requires Governor privileges.</p>
                <UrgencyTag 
                  level="critical" 
                  message="High-level access" 
                  overlayId="governor_demo"
                  testingMode={true}
                />
              </div>
            </RoleBasedOverlay>
          </div>
          
          {/* Audit Trail */}
          <div className="mb-6">
            <OverlayAuditTrail 
              maxEvents={20}
              autoRefresh={true}
              showZkpDetails={true}
              onAuditEvent={(event) => console.log('Audit event:', event)}
            />
          </div>
        </div>
        
        {/* Phase III-A Step 6/6 - UnificationOrchestrator */}
        <div className="w-full mb-8">
          <UnificationOrchestrator />
        </div>

        {/* Phase IV - Decentralized Data Layer */}
        <div className="w-full">
          <IdentityVault />
        </div>

        {/* Phase V Step 2: Proposal Submission */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase V • Civic Proposal System
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            DID-authenticated governance proposal submission
          </p>
        </div>
        
        <div className="w-full">
          <ProposalSubmission 
            userDID="did:civic:0x7f3e2d1a8c9b5f2e"
            userTier="Citizen"
            onSubmissionComplete={(proposal) => {
              console.log('Phase V: Proposal submitted:', proposal.id, proposal.zkpHash);
            }}
          />
        </div>

        {/* Phase V Step 3: Consensus Tracker */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase V • Consensus Tracker
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            ZKP-only tallying with real-time volatility tracking
          </p>
        </div>
        
        <div className="w-full">
          <ConsensusTracker />
        </div>

        {/* Phase V Step 4: ZKP Vote Verifier */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase V • ZKP Vote Verifier
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Core vote validation engine with cryptographic verification
          </p>
        </div>
        
        <div className="w-full">
          <ZKVoteVerifierDemo />
        </div>

        {/* Phase VI Step 1: Credential Mint Layer */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VI • Credential Mint Layer
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            DID-bound ZKP credential issuance with secure storage
          </p>
        </div>
        
        <div className="w-full">
          <CredentialMintDemo />
        </div>

        {/* Phase VI Step 2: Vault Export Node */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VI • Vault Export Node
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Secure IPFS export with role-based access control and ZKP validation
          </p>
        </div>
        
        <div className="w-full">
          <VaultExportDemo />
        </div>

        {/* Phase VII Step 1: Credential Sync Ledger */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VII • Credential Sync Ledger
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Distributed ZKP credential consensus with node validation
          </p>
        </div>
        
        <div className="w-full">
          <CredentialSyncDemo />
        </div>

        {/* Phase VII Step 2: Ledger Stream Visualizer */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VII • Ledger Stream Visualizer
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Real-time DID-based credential sync stream with filtering
          </p>
        </div>
        
        <div className="w-full">
          <LedgerStreamVisualizer />
        </div>

        {/* Phase VII Step 3: Credential Conflict Resolver */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VII • Credential Conflict Resolver
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            ZKP reconciliation engine with conflict detection and resolution
          </p>
        </div>
        
        <div className="w-full">
          <CredentialConflictDemo />
        </div>

        {/* Phase VII Step 4: Ledger Stream Visualizer */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VII • Ledger Stream Visualizer
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Real-time stream with role-based filtering and export capabilities
          </p>
        </div>
        
        <div className="w-full">
          <PhaseVIILedgerStreamVisualizer />
        </div>

        {/* Phase VIII Step 1: Stream Deck Overview Layer */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VIII • Stream Deck Overview
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Deck grid renderer with commander override and export capabilities
          </p>
        </div>
        
        <div className="w-full">
          <StreamDeckOverviewLayer />
        </div>

        {/* Phase VIII Step 2: Deck Control Switchboard */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase VIII • Deck Control Switchboard
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Global deck control interface with override gating and action logging
          </p>
        </div>

        {/* Phase IX Step 1: Civic Mirror Sync Grid */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase IX • Civic Mirror Sync Grid
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Sync status grid with fault highlighting, heatmap overlay, and ARIA announcements
          </p>
        </div>
        
        <div className="w-full">
          <CivicMirrorSyncGrid />
        </div>

        {/* Phase IX Step 2: Civic Sync Diagnostics Panel */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase IX • Civic Sync Diagnostics Panel
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Diagnostic framework with TTS toggle, fallback simulation, and QA envelope
          </p>
        </div>
        
        <div className="w-full">
          <CivicSyncDiagnosticsPanel />
        </div>

        {/* Phase X Step 1: Knowledge Atlas Panel */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X • Knowledge Atlas Panel
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Pillar grid filtering with clustering, overlap detection, and GROK QA envelope
          </p>
        </div>
        
        <div className="w-full">
          <KnowledgeAtlasPanel />
        </div>

        {/* Phase X-B Step 1: Deck Index Navigator */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X-B • Deck Index Navigator
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Categorized search, backlink system, federated AI search, and ARIA navigation
          </p>
        </div>
        
        <div className="w-full">
          <DeckIndexNavigator />
        </div>

        {/* Phase X-B Step 2: Deck Detail View */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X-B • Deck Detail View
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Dynamic deck rendering, ZKP metadata validation, access control, and responsive UX
          </p>
        </div>
        
        <div className="w-full">
          <DeckDetailView />
        </div>

        {/* Phase X-C Step 2: Deck Mission Card */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X-C • Deck Mission Card
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Gamified civic interaction, mission-based Truth Point incentives, and streak tracking
          </p>
        </div>
        
        <div className="w-full">
          <DeckMissionCard />
        </div>

        {/* Phase X-C Step 3: Deck Export Bundle */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X-C • Deck Export Bundle
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            ZKP-signed deck bundling with IPFS upload and fallback mechanisms
          </p>
        </div>
        
        <div className="w-full">
          <DeckExportBundle />
        </div>

        {/* Phase X-D Step 1: Trust Feedback Engine */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X-D • Trust Feedback Engine
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            DID-authenticated trust votes with ZKP validation and Truth Point rewards
          </p>
        </div>
        
        <div className="w-full">
          <TrustVoteCard />
        </div>

        {/* Phase X-D Step 2: Sentiment Capture Form */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X-D • Sentiment Capture
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            DID-authenticated sentiment submission with ZKP signatures and anonymity toggle
          </p>
        </div>
        
        <div className="w-full">
          <SentimentCaptureForm />
        </div>

        {/* Phase X-D Step 3: Trust Audit Overlay */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase X-D • Trust Audit Overview
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Comprehensive trust audit with sentiment breakdown, TP graph, trust tiers, and anonymity ratio
          </p>
        </div>
        
        <div className="w-full">
          <TrustAuditOverlay />
        </div>

        {/* Phase XI Step 1: Role Influence Dashboard */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase XI • Role Influence Dashboard
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Tier-to-tier influence mapping with Truth Point distribution and decision weight analysis
          </p>
        </div>
        
        <div className="w-full">
          <RoleInfluenceCard />
        </div>

        {/* Phase XI Step 3: Federated Trust Display */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase XI • Federated Trust Display
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Multi-DID trust tier visualization with role-weighted trust mapping and anonymity segmentation
          </p>
        </div>
        
        <div className="w-full">
          <FederatedTrustDisplay />
        </div>

        {/* Phase XII Step 1: Civic Value Beacon */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase XII • Civic Value Beacon
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            ZKP-authenticated civic engagement beacon with automatic 60-second emission cycle
          </p>
        </div>
        
        <div className="w-full">
          <CivicValueBeacon />
        </div>

        {/* Phase XII Step 2: Civic Memory Index with Trust Feedback */}
        <div className="w-full text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Phase XII • Civic Memory Index
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Truth Trace Engine with integrated Trust Feedback capabilities
          </p>
        </div>
        
        <div className="w-full">
          <CivicMemoryIndex />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Truth Unveiled Civic Genome
          </h1>
          <p className="text-[hsl(var(--dao-text-secondary))] text-lg">
            Decentralized identity and civic engagement platform
          </p>
        </div>
        
        {/* Deck #1: WalletOverviewDeck */}
        <div className="text-center mb-6 relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl font-bold text-white">
              Wallet & Identity Overview
            </h2>
            <TrustPulseWidget deckId="wallet_overview" deckName="Wallet Overview" />
          </div>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Manage your decentralized identity and wallet
          </p>
          <DeckVolatilityOverlay deckId="wallet_overview" deckName="Wallet Overview" position="bottom" />
        </div>
        
        <div className="max-w-sm w-full">
          <IdentitySummaryCard />
        </div>
        <div className="max-w-sm w-full">
          <WalletBalanceCard />
        </div>
        <div className="max-w-sm w-full">
          <ParticipationStreakCard />
        </div>
        <div className="max-w-sm w-full">
          <WalletSyncCard />
        </div>
        <div className="max-w-sm w-full">
          <WalletTrustFeedbackCard />
        </div>
        
        {/* Deck #2: GovernanceDeck */}
        <div className="text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Governance & Democracy
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Civic participation through proposal voting
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <CivicSwipeCard />
        </div>
        <div className="max-w-sm w-full">
          <VoteLedgerCard />
        </div>
        <div className="max-w-sm w-full">
          <SessionStatusCard />
        </div>
        
        {/* Deck #3: CivicGovernanceDeck (Swipe Refactor) */}
        <div className="text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Civic Governance (Swipe Refactor)
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Policy enforcement and appeal management interface
          </p>
        </div>
        
        <div className="max-w-md w-full">
          <GovernanceSwipeRefactorDeck />
        </div>
        
        {/* Deck #3: EducationDeck */}
        <div className="text-center mb-6 mt-12 relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl font-bold text-white">
              Education & Truth Literacy
            </h2>
            <TrustPulseWidget deckId="civic_identity" deckName="Education Deck" />
          </div>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Learn civic fundamentals and build truth literacy
          </p>
          <DeckVolatilityOverlay deckId="civic_identity" deckName="Education Deck" position="bottom" />
        </div>
        
        <div className="max-w-sm w-full">
          <TruthLiteracyCard />
        </div>
        <div className="max-w-sm w-full">
          <CivicQuizCard />
        </div>
        <div className="max-w-sm w-full">
          <CivicResourceCard />
        </div>
        <div className="max-w-sm w-full">
          <CommunityForumCard />
        </div>
        
        {/* Deck #4: FinanceDeck */}
        <div className="text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Finance & Earnings
          </h2>
          <p className="text-[hsl(var(--dao-text-secondary))]">
            Track your civic earnings and referral multipliers
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <EarningsSummaryCard />
        </div>
        <div className="max-w-sm w-full">
          <TransactionHistoryCard />
        </div>
        <div className="max-w-sm w-full">
          <RewardsCalculatorCard />
        </div>
        <div className="max-w-sm w-full">
          <WithdrawalInterfaceCard />
        </div>
        
        {/* Deck #5: PrivacyDeck */}
        <div className="w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            Privacy Protection
          </h2>
          <p className="text-slate-300 text-center mb-6">
            Zero-Knowledge Proof privacy layer management
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <ZKPStatusCard />
        </div>
        <div className="max-w-sm w-full">
          <SessionPrivacyCard />
        </div>
        <div className="max-w-sm w-full">
          <EncryptedMessageCard />
        </div>
        <div className="max-w-sm w-full">
          <VaultAccessCard />
        </div>
        
        {/* Deck #6: ZKPLayer */}
        <div className="w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            ZKP Layer
          </h2>
          <p className="text-slate-300 text-center mb-6">
            Zero-Knowledge Proof cryptographic operations
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <ZKProofGeneratorCard />
        </div>
        <div className="max-w-sm w-full">
          <ZKProofVerifierCard />
        </div>
        <div className="max-w-sm w-full">
          <ZKAuditTrailCard />
        </div>
        
        {/* Deck #7: SecureAssetsDeck */}
        <div className="w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            Secure Assets Deck
          </h2>
          <p className="text-slate-300 text-center mb-6">
            Zero-knowledge proof bound asset management
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <ProofBoundVaultEntryCard />
        </div>
        <div className="max-w-sm w-full">
          <AssetSignatureViewerCard />
        </div>
        <div className="max-w-sm w-full">
          <CivicAssetTransferCard />
        </div>
        <div className="max-w-sm w-full">
          <AssetDisputeResolverCard />
        </div>
        
        {/* Deck #8: CivicAuditDeck */}
        <div className="w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            Civic Audit Deck
          </h2>
          <p className="text-slate-300 text-center mb-6">
            Real-time civic proof audit trail visualization
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <AuditChainOverviewCard />
        </div>
        <div className="max-w-sm w-full">
          <LedgerAnomalyScannerCard />
        </div>
        <div className="max-w-sm w-full">
          <AuditResolutionPanelCard />
        </div>
        <div className="max-w-sm w-full">
          <TransparencyMetricsCard />
        </div>
        
        {/* Deck #9: ConsensusLayerDeck */}
        <div className="w-full max-w-screen-sm relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl font-bold text-slate-100 text-center">
              Consensus Layer Deck
            </h2>
            <TrustPulseWidget deckId="consensus_layer" deckName="Consensus Layer" />
          </div>
          <p className="text-slate-300 text-center mb-6">
            Real-time civic proposal consensus monitoring
          </p>
          <DeckVolatilityOverlay deckId="consensus_layer" deckName="Consensus Layer" position="bottom" />
        </div>
        
        <div className="max-w-sm w-full">
          <VoteConsensusCard />
        </div>
        <div className="max-w-sm w-full">
          <DeliberationPanelCard />
        </div>
        <div className="max-w-sm w-full">
          <ZKProposalLogCard />
        </div>
        <div className="max-w-sm w-full">
          <CivicVoteDisputeCard />
        </div>
        <div className="max-w-sm w-full">
          <ConsensusTrustFeedbackCard />
        </div>
        <div className="max-w-sm w-full">
          <ZKPFeedbackNodeCard />
        </div>
        <div className="max-w-sm w-full">
          <SentimentAggregationCard />
        </div>
        <div className="max-w-sm w-full">
          <FeedbackImpactAnalyzerCard />
        </div>
        <div className="max-w-sm w-full">
          <CivicEngagementTrackerCard />
        </div>
        <div className="max-w-sm w-full">
          <TrustStreakRewardCard />
        </div>
        <div className="max-w-sm w-full">
          <ReputationLadderCard />
        </div>
        <div className="max-w-sm w-full">
          <EngagementIncentiveCard />
        </div>
        
        {/* Deck #12: CivicIdentityDeck */}
        <div className="w-full max-w-screen-sm relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl font-bold text-slate-100 text-center">
              Civic Identity Deck
            </h2>
            <TrustPulseWidget deckId="civic_memory" deckName="Civic Identity" />
          </div>
          <p className="text-slate-300 text-center mb-6">
            Decentralized identity claim interface with ZKP validation and biometric verification
          </p>
          <DeckVolatilityOverlay deckId="civic_memory" deckName="Civic Identity" position="bottom" />
        </div>
        
        <div className="max-w-sm w-full">
          <DIDClaimCard />
        </div>
        <div className="max-w-sm w-full">
          <BiometricProofCard />
        </div>
        <div className="max-w-sm w-full">
          <CredentialClaimCard />
        </div>
        <div className="max-w-sm w-full">
          <IdentityLineageViewerCard />
        </div>
        <div className="max-w-sm w-full">
          <IdentityTrustFeedbackCard />
        </div>
        <div className="max-w-sm w-full">
          <PolicyEnforcementCard />
        </div>
        <div className="max-w-sm w-full">
          <PolicyAppealCard />
        </div>
        <div className="max-w-sm w-full">
          <PolicySignatureCard />
        </div>
        <div className="max-w-sm w-full">
          <PolicyAppealResolutionCard />
        </div>
        <div className="max-w-sm w-full">
          <AmendmentProposalCard />
        </div>
        <div className="max-w-sm w-full">
          <CommunityFeedbackCard />
        </div>
        <div className="max-w-sm w-full">
          <ZKPVotingWindowCard />
        </div>
        <div className="max-w-sm w-full">
          <DAORatificationCard />
        </div>
        <div className="max-w-sm w-full">
          <EvidenceSubmissionCard />
        </div>
        <div className="max-w-sm w-full">
          <ArbitrationDecisionCard />
        </div>
        <div className="max-w-sm w-full">
          <JusticeAuditCard />
        </div>
        
        {/* Deck #16: CivicEducationDeck */}
        <div className="w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            Civic Education Deck
          </h2>
          <p className="text-slate-300 text-center mb-6">
            ZKP-certified learning validation with DID-linked progress tracking
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <ZKPLearningModuleCard />
        </div>
        <div className="max-w-sm w-full">
          <CurriculumAssessmentCard />
        </div>
        <div className="max-w-sm w-full">
          <CertificationVerificationCard />
        </div>
        <div className="max-w-sm w-full">
          <KnowledgeContributionCard />
        </div>
        
        {/* Phase X-G: Civic Constellation Explorer */}
        <div className="w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            Civic Constellation Explorer
          </h2>
          <p className="text-slate-300 text-center mb-6">
            Interactive visual deck explorer with cluster navigation
          </p>
        </div>
        
        <div className="w-full max-w-lg">
          <CivicConstellationExplorer
            userTier="citizen"
            initialZoom={1.0}
            onClusterFocus={(clusterId) => console.log('Focus:', clusterId)}
            onDeckHover={(deckId) => console.log('Hover:', deckId)}
            className="mx-auto"
          />
        </div>
        
        {/* Deck #17: CivicDiplomacyDeck */}
        <div className="w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
            Civic Diplomacy Deck
          </h2>
          <p className="text-slate-300 text-center mb-6">
            International treaty proposals with ZKP validation and DAO ratification
          </p>
        </div>
        
        <div className="max-w-sm w-full">
          <TreatyProposalCard />
        </div>
        <div className="max-w-sm w-full">
          <TreatyResponseCard />
        </div>
        <div className="max-w-sm w-full">
          <TreatyRatificationCard />
        </div>
        <div className="max-w-sm w-full">
          <TreatyArbitrationCard />
        </div>
        
        {/* Deck #18: CivicSustainabilityDeck */}
        <div className="col-span-full">
          <h2 className="text-2xl font-bold text-white mb-4">Deck #18: CivicSustainabilityDeck</h2>
        </div>
        <div className="max-w-sm w-full">
          <SustainabilityAllocationCard />
        </div>
        <div className="max-w-sm w-full">
          <ImpactEvaluationCard />
        </div>
        <div className="max-w-sm w-full">
          <OutcomeVerificationCard />
        </div>
        <div className="max-w-sm w-full">
          <SustainabilityAuditCard />
        </div>
        
        {/* Deck #19: CivicWellbeingDeck */}
        <div className="max-w-sm w-full">
          <MentalHealthAccessCard />
        </div>
        <div className="max-w-sm w-full">
          <SocialCohesionCard />
        </div>
        <div className="max-w-sm w-full">
          <WellbeingDashboardCard />
        </div>
        <div className="max-w-sm w-full">
          <CommunitySupportCard />
        </div>
        
        {/* Deck #20: CivicLegacyDeck */}
        <div className="max-w-sm w-full">
          <CivicMemoryVaultCard />
        </div>
        
        <div className="max-w-sm w-full">
          <CivicTestimonyCard />
        </div>
        
        <div className="max-w-sm w-full">
          <CivicLegacyIndexCard />
        </div>
        
        <div className="max-w-sm w-full">
          <CivicLegacySummitCard />
        </div>
        
        {/* Phase XV: Collective Sentiment Ledger Initialization */}
        <div className="col-span-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Phase XV: Collective Sentiment Ledger Initialization
          </h2>
        </div>
        
        <div className="col-span-full">
          <SentimentExplorerPanel />
        </div>
        
        <div className="col-span-full mt-6">
          <SentimentReplayHeatmap />
        </div>
        
        {/* Deck #1: IdentityDeck - SwipeRefactorDeck */}
        <div className="col-span-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Deck #1: Identity Deck (Swipe Refactor)
          </h2>
        </div>
        
        <div className="max-w-sm w-full">
          <SwipeRefactorDeck />
        </div>
        
        <div className="text-center mt-8 text-[hsl(var(--dao-text-secondary))] text-sm">
          Component ready for integration • Render time optimized • ARIA compliant
        </div>
      </div>
    </div>
  );
}