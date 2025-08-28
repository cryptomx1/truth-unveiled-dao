// AgentInitializer.ts - Phase TTS-CIVIC-ENHANCE Step 1 + PRESS-REPLAY Step 4
// Initialize and manage all civic system agents including TTSEngineAgent and Press Replay agents

import TTSEngineAgent from './TTSEngineAgent';
import { RippleCampaignEngine } from './RippleCampaignEngine';
import { LLMPromptEmitter } from './LLMPromptEmitter';
import TruthCoinClaimEngine from '../components/finance/TruthCoinClaimEngine';
import GenesisFusionEngine from '../components/finance/GenesisFusionEngine';
import TrustFeedbackEngine from '../components/trust/TrustFeedbackEngine';
import TrustSentimentAggregator from '../components/trust/TrustSentimentAggregator';
import TrustSentimentMonitor from '../components/trust/TrustSentimentMonitor';
import FeedbackOrchestrationEngine from '../components/trust/FeedbackOrchestrationEngine';
import ProductionSimulationEngine from '../components/trust/ProductionSimulationEngine';
import ZKPMintTriggerAgent from '../components/trust/ZKPMintTriggerAgent';
import TrustFusionOrchestrator from '../components/trust/TrustFusionOrchestrator';
import TrustFeedbackFusionEngine from './TrustFeedbackFusionEngine';
import CivicImpactRing from './CivicImpactRing';
import TrustDeltaPulseAgent from './TrustDeltaPulseAgent';
import AudioTutorialInjector from './AudioTutorialInjector';
import ZebecTreasuryRouter from '../components/finance/ZebecTreasuryRouter';

interface AgentSystem {
  ttsEngine: TTSEngineAgent;
  rippleCampaignEngine: RippleCampaignEngine;
  llmPromptEmitter: LLMPromptEmitter;
  truthCoinClaimEngine: TruthCoinClaimEngine;
  genesisFusionEngine: GenesisFusionEngine;
  trustFeedbackEngine: TrustFeedbackEngine;
  trustSentimentAggregator: TrustSentimentAggregator;
  trustSentimentMonitor: TrustSentimentMonitor;
  feedbackOrchestrationEngine: FeedbackOrchestrationEngine;
  productionSimulationEngine: ProductionSimulationEngine;
  zkpMintTriggerAgent: ZKPMintTriggerAgent;
  trustFusionOrchestrator: TrustFusionOrchestrator;
  trustFeedbackFusionEngine: TrustFeedbackFusionEngine;
  civicImpactRing: CivicImpactRing;
  trustDeltaPulseAgent: TrustDeltaPulseAgent;
  audioTutorialInjector: AudioTutorialInjector;
  zebecTreasuryRouter: ZebecTreasuryRouter;
  isInitialized: boolean;
  initializationTime: Date | null;
}

class AgentSystemManager {
  private static instance: AgentSystemManager;
  private agentSystem: AgentSystem;

  static getInstance(): AgentSystemManager {
    if (!AgentSystemManager.instance) {
      AgentSystemManager.instance = new AgentSystemManager();
    }
    return AgentSystemManager.instance;
  }

  constructor() {
    this.agentSystem = {
      ttsEngine: TTSEngineAgent.getInstance(),
      rippleCampaignEngine: RippleCampaignEngine.getInstance(),
      llmPromptEmitter: LLMPromptEmitter.getInstance(),
      truthCoinClaimEngine: TruthCoinClaimEngine.getInstance(),
      genesisFusionEngine: GenesisFusionEngine.getInstance(),
      trustFeedbackEngine: TrustFeedbackEngine.getInstance(),
      trustSentimentAggregator: TrustSentimentAggregator.getInstance(),
      trustSentimentMonitor: TrustSentimentMonitor.getInstance(),
      feedbackOrchestrationEngine: FeedbackOrchestrationEngine.getInstance(),
      productionSimulationEngine: ProductionSimulationEngine.getInstance(),
      zkpMintTriggerAgent: ZKPMintTriggerAgent.getInstance(),
      trustFusionOrchestrator: TrustFusionOrchestrator.getInstance(),
      trustFeedbackFusionEngine: TrustFeedbackFusionEngine.getInstance(),
      civicImpactRing: CivicImpactRing.getInstance(),
      trustDeltaPulseAgent: TrustDeltaPulseAgent.getInstance(),
      audioTutorialInjector: AudioTutorialInjector.getInstance(),
      zebecTreasuryRouter: ZebecTreasuryRouter.getInstance(),
      isInitialized: false,
      initializationTime: null
    };
  }

  async initializeAllAgents(): Promise<void> {
    if (this.agentSystem.isInitialized) {
      console.log('✅ Agent system already initialized');
      return;
    }

    console.log('🤖 Initializing TTS-CIVIC-ENHANCE Agent System...');

    try {
      // Initialize TTS Engine Agent
      const ttsAgent = TTSEngineAgent.getInstance();
      
      // Wait for proper initialization
      await new Promise((resolve) => {
        const checkInit = () => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            resolve(true);
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });

      this.agentSystem.isInitialized = true;
      this.agentSystem.initializationTime = new Date();

      // Initialize Press Replay agents (Phase PRESS-REPLAY Step 4)
      const campaignEngine = RippleCampaignEngine.getInstance();
      const llmEmitter = LLMPromptEmitter.getInstance();
      
      // Initialize Finance agents (Phase X-FINANCE Step 5)
      const claimEngine = TruthCoinClaimEngine.getInstance();
      
      // Initialize Trust Feedback Engine (Phase X-D Step 1)
      const trustEngine = TrustFeedbackEngine.getInstance();
      
      // Initialize Trust Sentiment Aggregator (Phase X-D Step 2)
      const sentimentAggregator = TrustSentimentAggregator.getInstance();
      
      // Initialize Trust Sentiment Monitor (Phase X-D Step 3)
      const sentimentMonitor = TrustSentimentMonitor.getInstance();
      sentimentMonitor.startMonitoring();
      
      // Initialize Feedback Orchestration Engine (Phase X-D Step 3)
      const orchestrationEngine = FeedbackOrchestrationEngine.getInstance();
      
      // Initialize Production Simulation Engine (Phase X-D Step 4)
      const simulationEngine = ProductionSimulationEngine.getInstance();
      
      // Initialize ZKP Mint Trigger Agent (Phase X-D Step 4)
      const mintTriggerAgent = ZKPMintTriggerAgent.getInstance();
      
      // Initialize Trust Fusion Orchestrator (Phase X-D Step 4)
      const fusionOrchestrator = TrustFusionOrchestrator.getInstance();

      console.log('✅ TTS-CIVIC-ENHANCE Agent System initialized successfully');
      console.log('🎙️ TTSEngineAgent operational with civic deck integration');
      console.log('📢 RippleCampaignEngine initialized - ZIP-targeted campaigns ready');
      console.log('🧠 LLMPromptEmitter initialized - GPT-4o civic messaging available');
      console.log('💰 TruthCoinClaimEngine initialized - Genesis fusion system ready');
      console.log('🏅 GenesisFusionEngine initialized - Guardian badge fusion ready');
      console.log('🔗 TrustFeedbackEngine initialized - Anonymous civic trust deltas operational');
      console.log('📊 TrustSentimentAggregator initialized - Periodic sentiment analysis ready');
      console.log('📊 TrustSentimentMonitor initialized - Alert logic and user flow tracking ready');
      console.log('🔄 FeedbackOrchestrationEngine initialized - Real-time trust delta coordination ready');
      console.log('🧪 ProductionSimulationEngine initialized - 24h DAO-wide trust flow simulation ready');
      console.log('🎯 ZKPMintTriggerAgent initialized - Tiered delta threshold monitoring active');
      console.log('🔗 TrustFusionOrchestrator initialized - Final integration coordinator ready');
      console.log('🏦 ZebecTreasuryRouter initialized - Treasury stream automation ready');
      
      // Make globally accessible for debugging
      if (typeof window !== 'undefined') {
        (window as any).civicAgentSystem = this.agentSystem;
        (window as any).ttsEngine = ttsAgent;
        (window as any).rippleCampaignEngine = campaignEngine;
        (window as any).llmPromptEmitter = llmEmitter;
        (window as any).truthCoinClaimEngine = claimEngine;
        (window as any).genesisFusionEngine = this.agentSystem.genesisFusionEngine;
        (window as any).trustFeedbackEngine = trustEngine;
        (window as any).trustSentimentAggregator = sentimentAggregator;
        (window as any).trustSentimentMonitor = sentimentMonitor;
        (window as any).feedbackOrchestrationEngine = orchestrationEngine;
        (window as any).productionSimulationEngine = simulationEngine;
        (window as any).zkpMintTriggerAgent = mintTriggerAgent;
        (window as any).trustFusionOrchestrator = fusionOrchestrator;
      }

    } catch (error) {
      console.error('❌ Agent system initialization failed:', error);
      throw error;
    }
  }

  getAgentSystem(): AgentSystem {
    return this.agentSystem;
  }

  getTTSEngine(): TTSEngineAgent {
    return this.agentSystem.ttsEngine;
  }

  generateSystemReport(): any {
    return {
      systemStatus: this.agentSystem.isInitialized ? 'operational' : 'initializing',
      initializationTime: this.agentSystem.initializationTime,
      agents: {
        ttsEngine: {
          initialized: true,
          diagnostics: this.agentSystem.ttsEngine.getDiagnostics().length,
          avgLatency: this.agentSystem.ttsEngine.getDiagnostics().length > 0 ? 
            this.agentSystem.ttsEngine.getDiagnostics()
              .filter(d => d.latencyMs)
              .reduce((sum, d) => sum + (d.latencyMs || 0), 0) / 
            this.agentSystem.ttsEngine.getDiagnostics().filter(d => d.latencyMs).length : 0
        }
      }
    };
  }
}

// Auto-initialize on import
let globalAgentManager: AgentSystemManager | null = null;

if (typeof window !== 'undefined') {
  globalAgentManager = AgentSystemManager.getInstance();
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      globalAgentManager?.initializeAllAgents();
    });
  } else {
    globalAgentManager?.initializeAllAgents();
  }
}

export { AgentSystemManager };
export default globalAgentManager || AgentSystemManager.getInstance();