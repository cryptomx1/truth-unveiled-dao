import React, { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import IdentityDemo from "@/pages/identity-demo";
import IdentityPage from "@/pages/IdentityPage";
import VaultPage from "@/pages/VaultPage";
import MissionPage from "@/pages/MissionPage";
import ProofVaultPage from "@/pages/ProofVaultPage";
import BallotTestPage from "@/pages/BallotTestPage";
import CivicShellPage from "@/pages/civic-shell";
import GovMapPage from "@/pages/gov-map";
import CivicCommandCenter from "@/command/CivicCommandCenter";
import DeckViewRouter from "@/routes/DeckViewRouter";
import CivicMissionOnboardingCard from "@/components/onboarding/CivicMissionOnboardingCard";
import CivicCompass from "@/components/compass/CivicCompass";
import CivicCompassPreview from "@/components/compass/CivicCompassPreview";
import { UserSessionEngine } from "@/components/system/UserSessionEngine";
import CivicPollForge from "@/components/decks/CivicGovernanceDeck/CivicPollForge";
import PollAnalyticsDashboard from "@/components/decks/CivicGovernanceDeck/PollAnalyticsDashboard";
import VaultAnalyzer from "@/components/vault/VaultAnalyzer";
import CivicReputationDashboard from "@/components/vault/CivicReputationDashboard";
import ZKTierBadgeCard from "@/components/vault/zk-TierBadgeCard";
import TierInfluenceMap from "@/components/vault/TierInfluenceMap";
import DynamicTierInfluenceMapExtension from "@/components/vault/DynamicTierInfluenceMapExtension";
import { InfluenceDynamic } from "@/components/vault/InfluenceDynamic";
import PollTestPage from "@/pages/PollTestPage";
import { PressReleaseViewer } from "@/components/press/PressReleaseViewer";
import TokenDisplayTest from "@/pages/TokenDisplayTest";
import GuardianTest from "@/pages/GuardianTest";
import DAOStakeTest from "@/pages/DAOStakeTest";
import ZKPLedgerTest from "@/pages/ZKPLedgerTest";
import PressWavePage from "@/pages/PressWavePage";
import GenesisFusePage from "@/pages/GenesisFusePage";
import ZKPUserMintExtension from "@/components/zkp/ZKPUserMintExtension";
import ClaudeGuardAgent from "@/agents/ClaudeGuardAgent";
import { OnboardingVerifyPage } from "@/pages/OnboardingVerifyPage";
import WalletFinancePage from "@/components/finance/WalletFinancePage";
import DeckNarrationOverlay from "@/components/tts/DeckNarrationOverlay";
import { FusionDashboard } from "@/pages/FusionDashboard";
import { FusionStatusPage } from "@/pages/FusionStatusPage";
import { CivicFusionRouter } from "@/components/fusion/CivicFusionRouter";
import FusionHistoryPage from "@/components/fusion/FusionHistoryPage";
import RepDissonanceEngine from "@/components/press/RepDissonanceEngine";
import GlobalDeploymentDashboard from "@/components/global-deployment/GlobalDeploymentDashboard";
import CivicDeploymentWizard from "@/components/global-deployment/CivicDeploymentWizard";
import RegionalBroadcastTest from "@/components/global-deployment/RegionalBroadcastTest";
import FederationActivationWizard from "@/components/federation/FederationActivationWizard";
import FederationRouter from "@/components/federation/FederationRouter";
import { TPDisbursementCard } from "@/components/finance/TPDisbursementCard";
import DebugRouteTest from "@/debug-route-test";
import TestTreatyRoute from "@/test-treaty-route";
import DirectDeckTest from "@/direct-deck-test";
import TutorialRouter from "@/routes/TutorialRouter";
import SimpleDeckTest from "@/simple-deck-test";
import TTSTestCard from "@/components/tts/TTSTestCard";
import CivicUnlockPortal from "@/components/unlock/CivicUnlockPortal";
import ModuleTutorialRouter from "@/routes/ModuleTutorialRouter";
import "@/agents/AgentInitializer";

// Lazy load Press Replay components for Phase PRESS-REPLAY Step 4
const PressReplayPage = lazy(() => import("@/pages/PressReplayPage"));

// Lazy load Municipal Pilot components for Phase X-MUNICIPALPREP Step 3
const MunicipalPilotDashboard = lazy(() => import("@/components/municipal/MunicipalPilotDashboard"));

// Finance components loaded via direct import above

// Lazy load Municipal components for Phase X-MUNICIPALPREP Step 4
const MunicipalPolicyRegistry = lazy(() => import("@/components/municipal/MunicipalPolicyRegistry"));

// Lazy load Finance components for Phase X-ZEBEC Step 2
const StreamDashboard = lazy(() => import("@/components/finance/StreamDashboard"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <CivicMissionOnboardingCard onMissionSelect={(route) => window.location.href = route} />} />
      <Route path="/civic-shell" component={CivicShellPage} />
      <Route path="/command" component={CivicCommandCenter} />
      <Route path="/onboarding" component={() => <CivicMissionOnboardingCard onMissionSelect={(route) => window.location.href = route} />} />
      <Route path="/compass" component={() => <CivicCompass onDirectionSelect={(direction) => window.location.href = direction.deckRoute} />} />
      <Route path="/compass-preview" component={() => <CivicCompassPreview onDeckSelect={(deckId, route) => window.location.href = route} />} />
      <Route path="/deck/:deckId/:moduleId" component={DeckViewRouter} />
      <Route path="/deck/:deckId" component={DeckViewRouter} />
      <Route path="/identity" component={IdentityDemo} />
      <Route path="/identity-onboarding" component={IdentityPage} />
      <Route path="/vault" component={VaultPage} />
      <Route path="/missions" component={MissionPage} />
      <Route path="/proof-vault" component={ProofVaultPage} />
      <Route path="/ballot-test" component={BallotTestPage} />
      <Route path="/gov-map" component={GovMapPage} />
      <Route path="/poll/create" component={() => <CivicPollForge />} />
      <Route path="/poll/create-test" component={() => <CivicPollForge testMode={true} />} />
      <Route path="/poll/analytics" component={() => <PollAnalyticsDashboard />} />
      <Route path="/poll/analytics-test" component={() => <PollAnalyticsDashboard restrictedMode={true} />} />
      <Route path="/vault/analyzer" component={() => <VaultAnalyzer />} />
      <Route path="/vault/analyzer-test" component={() => <VaultAnalyzer initialCid="QmTest123" autoVerify={false} />} />
      <Route path="/vault/reputation" component={() => <CivicReputationDashboard />} />
      <Route path="/vault/reputation-test" component={() => <CivicReputationDashboard />} />
      <Route path="/vault/tier-badge" component={() => <ZKTierBadgeCard />} />
      <Route path="/vault/tier-badge-test" component={() => <ZKTierBadgeCard />} />
      <Route path="/vault/influence" component={() => <TierInfluenceMap />} />
      <Route path="/vault/influence-test" component={() => <TierInfluenceMap />} />
      <Route path="/vault/influence-dynamic" component={() => <InfluenceDynamic />} />
      <Route path="/vault/influence-dynamic-test" component={() => <InfluenceDynamic />} />
      <Route path="/poll/test" component={PollTestPage} />
      <Route path="/press-release" component={() => <PressReleaseViewer />} />
      <Route path="/token-test" component={TokenDisplayTest} />
      <Route path="/guardian/test" component={GuardianTest} />
      <Route path="/dao/stake-test" component={DAOStakeTest} />
      <Route path="/zkp/ledger-test" component={ZKPLedgerTest} />
      <Route path="/tts-test" component={() => <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4"><TTSTestCard /></div>} />
      <Route path="/press/wave" component={PressWavePage} />
      <Route path="/press/rep-dissonance" component={() => (
        <div className="container mx-auto px-4 py-8">
          <RepDissonanceEngine />
        </div>
      )} />
      <Route path="/press/replay" component={PressReplayPage} />
      <Route path="/genesis-fuse" component={GenesisFusePage} />
      <Route path="/zkp/mint" component={() => <ZKPUserMintExtension />} />
      <Route path="/zkp/mint-test" component={() => <ZKPUserMintExtension />} />
      <Route path="/onboarding/verify" component={OnboardingVerifyPage} />
      <Route path="/fusion/dashboard" component={FusionDashboard} />
      <Route path="/fusion/status/:cid" component={FusionStatusPage} />
      <Route path="/fusion" component={() => <CivicFusionRouter />} />
      <Route path="/fusion/onboarding" component={() => <CivicFusionRouter />} />
      <Route path="/fusion/onboarding/:missionId" component={() => <CivicFusionRouter />} />
      <Route path="/fusion/request" component={() => <CivicFusionRouter />} />
      <Route path="/fusion/history" component={FusionHistoryPage} />
      <Route path="/global/deployment" component={() => (
        <div className="container mx-auto px-4 py-8">
          <GlobalDeploymentDashboard />
        </div>
      )} />
      <Route path="/global/deploy" component={() => (
        <div className="container mx-auto px-4 py-8">
          <CivicDeploymentWizard />
        </div>
      )} />
      <Route path="/global/broadcast-test" component={() => (
        <div className="container mx-auto px-4 py-8">
          <RegionalBroadcastTest />
        </div>
      )} />
      {/* Federation Routes - Phase X-FED Step 1 & 2 */}
      <Route path="/federation/activate" component={() => (
        <div className="container mx-auto px-4 py-8">
          <FederationActivationWizard />
        </div>
      )} />
      <Route path="/federation/proposal/submit" component={() => (
        <div className="container mx-auto px-4 py-8">
          <FederationRouter />
        </div>
      )} />
      <Route path="/federation/proposal/review/:id?" component={() => (
        <div className="container mx-auto px-4 py-8">
          <FederationRouter />
        </div>
      )} />
      <Route path="/federation/proposal/vote/:id?" component={() => (
        <div className="container mx-auto px-4 py-8">
          <FederationRouter />
        </div>
      )} />
      <Route path="/federation/proposal/audit/:id?" component={() => (
        <div className="container mx-auto px-4 py-8">
          <FederationRouter />
        </div>
      )} />
      {/* Three-Phase Activation Routes - Commander Mark Authorization */}
      <Route path="/municipal/pilot" component={MunicipalPilotDashboard} />
      <Route path="/treasury" component={lazy(() => import("./pages/TreasuryPage"))} />
      {/* Wallet Treasury Route - Phase X-FINANCE Step 1 */}
      <Route path="/wallet/treasury" component={() => (
        <div className="container mx-auto px-4 py-8">
          <TPDisbursementCard />
        </div>
      )} />
      {/* Wallet Utility Route - Phase X-FINANCE Step 2 */}
      <Route path="/wallet/utility" component={lazy(() => import("./pages/WalletUtilityPage"))} />
      {/* Wallet Withdraw Route - Phase X-FINANCE Step 3 */}
      <Route path="/wallet/withdraw" component={lazy(() => import("./pages/WalletWithdrawPage"))} />
      {/* Wallet Rewards Route - Phase X-FINANCE Step 3 */}
      <Route path="/wallet/rewards" component={lazy(() => import("./pages/WalletRewardsPage"))} />
      {/* Wallet Staking Route - Phase X-FINANCE Step 4 */}
      <Route path="/wallet/staking" component={() => (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">TruthPoint Staking</h2>
            <p className="text-muted-foreground">Staking interface coming soon...</p>
          </div>
        </div>
      )} />
      {/* Wallet Finance Route - Phase X-FINANCE Step 5 */}
      <Route path="/wallet/finance" component={WalletFinancePage} />
      {/* TTS Test Route for Debugging */}
      <Route path="/tts-test" component={() => (
        <div className="container mx-auto px-4 py-8">
          <TTSTestCard />
        </div>
      )} />
      {/* TTS Enhancement Dashboard - Phase TTS-CIVIC-ENHANCE Step 2 */}
      <Route path="/tts/dashboard" component={lazy(() => import('@/components/tts/TTSEnhancementDashboard'))} />
      {/* TTS Settings Panel - Phase TTS-CIVIC-ENHANCE Step 3 */}
      <Route path="/tts/settings" component={() => (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">TTS Settings</h2>
            <p className="text-muted-foreground">Voice preference panel coming soon...</p>
          </div>
        </div>
      )} />
      {/* Feedback Submit Route - Phase X-D Step 1 */}
      <Route path="/feedback/submit" component={lazy(() => import("@/pages/FeedbackSubmitPage"))} />
      {/* Trust Monitoring Dashboard Route - Phase X-D Step 3 */}
      <Route path="/feedback/monitor" component={() => (
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<div className="text-center py-8">Loading Trust Monitor...</div>}>
            {React.createElement(lazy(() => import("@/components/trust/TrustMonitoringDashboard")))}
          </Suspense>
        </div>
      )} />
      {/* Guardian Unlock Portal Route - Phase X-M Step 4 */}
      <Route path="/unlock/guardian" component={() => (
        <div className="container mx-auto px-4 py-8">
          <CivicUnlockPortal />
        </div>
      )} />
      {/* Municipal Policy Registry Route - Phase X-MUNICIPALPREP Step 4 */}
      <Route path="/municipal/registry" component={() => (
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<div className="text-center py-8">Loading Municipal Registry...</div>}>
            <MunicipalPolicyRegistry />
          </Suspense>
        </div>
      )} />
      {/* Zebec Stream Routes - Phase X-ZEBEC */}
      <Route path="/streams/dashboard" component={() => (
        <div className="min-h-screen bg-background">
          <Suspense fallback={<div className="text-center py-8">Loading Stream Dashboard...</div>}>
            <StreamDashboard />
          </Suspense>
        </div>
      )} />
      <Route path="/streams" component={() => (
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Zebec Stream Payments</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time TruthPoint redemptions via Solana blockchain streaming
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <span className="text-blue-800 dark:text-blue-200 font-medium">Phase X-ZEBEC</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Stream Creation</h3>
                <p className="text-sm text-muted-foreground mb-4">Create new TruthPoint reward streams</p>
                <div className="text-2xl font-bold text-blue-600">Ready</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Stream Monitor</h3>
                <p className="text-sm text-muted-foreground mb-4">Track active and completed streams</p>
                <div className="text-2xl font-bold text-green-600">Operational</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Treasury Router</h3>
                <p className="text-sm text-muted-foreground mb-4">Automated allocation system</p>
                <div className="text-2xl font-bold text-purple-600">Active</div>
                <div className="mt-4">
                  <button 
                    onClick={() => {
                      const router = (window as any).civicAgentSystem?.zebecTreasuryRouter;
                      if (router) {
                        router.routeTaskReward('deck_participation', '0xtest123', 'Citizen', 'demo');
                        console.log('🧪 Demo treasury stream created');
                      }
                    }}
                    className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  >
                    Test Stream
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-xl">ℹ️</div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Phase X-ZEBEC Implementation Complete</h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <div>✅ StreamRewardCard.tsx - Real-time stream creation UI</div>
                    <div>✅ StreamDashboard.tsx - Transaction history and monitoring</div>
                    <div>✅ ZebecTreasuryRouter.ts - Automated treasury allocation</div>
                    <div>✅ All three Commander Mark authorized substeps implemented</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} />
      <Route path="/streams/dashboard" component={() => (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Stream Dashboard</h1>
          <p>Dashboard interface operational - Phase X-ZEBEC Step 2 complete</p>
        </div>
      )} />
      <Route path="/federation" component={() => (
        <div className="container mx-auto px-4 py-8">
          <FederationRouter />
        </div>
      )} />

      <Route path="/onboarding-required" component={() => (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-blue-400 text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-white mb-4">Onboarding Required</h2>
            <p className="text-slate-400 mb-6">
              To access civic decks, you'll need to complete the onboarding process and earn the required access tier.
            </p>
            <button
              onClick={() => window.location.href = '/identity-onboarding'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
              aria-label="Start onboarding process"
            >
              Start Onboarding
            </button>
          </div>
        </div>
      )} />
      {/* Tutorial System Routes - Phase TTS-CIVIC-ENHANCE Step 4 & 5 */}
      <Route path="/tts/deck/:deckId/tutorial" component={TutorialRouter} />
      <Route path="/tts/module/:moduleId/tutorial" component={ModuleTutorialRouter} />
      <Route path="/tts/tutorials/preview" component={lazy(() => import("@/pages/TTSPreviewPage"))} />
      
      <Route path="/debug-routes" component={DebugRouteTest} />
      <Route path="/test-treaty" component={TestTreatyRoute} />
      <Route path="/direct-deck" component={DirectDeckTest} />
      <Route path="/simple-deck" component={SimpleDeckTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserSessionEngine>
        <TooltipProvider>
          <Toaster />
          <ClaudeGuardAgent />
          <Router />
        </TooltipProvider>
      </UserSessionEngine>
    </QueryClientProvider>
  );
}

export default App;
