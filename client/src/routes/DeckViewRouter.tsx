/**
 * DeckViewRouter.tsx - Phase X-I Deck Interface Activation
 * 
 * Comprehensive routing system for all 20 civic decks with secure CID-tier
 * awareness, access control integration, and ARIA-compliant notifications.
 * Removes all "Coming Soon" placeholders and provides full deck interface
 * activation as authorized by Commander Mark.
 * 
 * Authority: Commander Mark | Phase X-I Implementation
 * Status: Full deck routing activation with secure access control
 */

import React, { useEffect, useState } from 'react';
import { Switch, Route, useParams, useLocation } from 'wouter';
import { CIDTier, getTierForCID, validateCIDAccess } from '../access/CIDTierMap';
import { getUserTokenomicProfile } from '../tokenomics/TruthTokenomicsSpec';
import { getTruthCoinsProfile } from '../tokenomics/TruthCoinsIntegration';
import { getGenesisStats } from '../fusion/TruthGenesisBadge';

// Import all available civic deck components
import IdentitySummaryCard from '../components/decks/WalletOverviewDeck/IdentitySummaryCard';
import WalletBalanceCard from '../components/decks/WalletOverviewDeck/WalletBalanceCard';
import ParticipationStreakCard from '../components/decks/WalletOverviewDeck/ParticipationStreakCard';
import WalletSyncCard from '../components/decks/WalletOverviewDeck/WalletSyncCard';

import CivicSwipeCard from '../components/decks/GovernanceDeck/CivicSwipeCard';
import VoteLedgerCard from '../components/decks/GovernanceDeck/VoteLedgerCard';
import SessionStatusCard from '../components/decks/GovernanceDeck/SessionStatusCard';

import TruthLiteracyCard from '../components/decks/EducationDeck/TruthLiteracyCard';
import CivicQuizCard from '../components/decks/EducationDeck/CivicQuizCard';
import CivicResourceCard from '../components/decks/EducationDeck/CivicResourceCard';
import CommunityForumCard from '../components/decks/EducationDeck/CommunityForumCard';

import EarningsSummaryCard from '../components/decks/FinanceDeck/EarningsSummaryCard';
import TransactionHistoryCard from '../components/decks/FinanceDeck/TransactionHistoryCard';
import RewardsCalculatorCard from '../components/decks/FinanceDeck/RewardsCalculatorCard';
import WithdrawalInterfaceCard from '../components/decks/FinanceDeck/WithdrawalInterfaceCard';

import ZKPStatusCard from '../components/decks/PrivacyDeck/ZKPStatusCard';
import SessionPrivacyCard from '../components/decks/PrivacyDeck/SessionPrivacyCard';
import EncryptedMessageCard from '../components/decks/PrivacyDeck/EncryptedMessageCard';
import VaultAccessCard from '../components/decks/PrivacyDeck/VaultAccessCard';

// ZKP Layer components (correct path)
import ZKProofGeneratorCard from '../components/decks/ZKPLayer/ZKProofGeneratorCard';
import ZKAuditTrailCard from '../components/decks/ZKPLayer/ZKAuditTrailCard';
import ZKProofVerifierCard from '../components/decks/ZKPLayer/ZKProofVerifierCard';

// Additional major decks
import AuditChainOverviewCard from '../components/decks/CivicAuditDeck/AuditChainOverviewCard';
import ProofBoundVaultEntryCard from '../components/decks/SecureAssetsDeck/ProofBoundVaultEntryCard';
import VoteConsensusCard from '../components/decks/ConsensusLayerDeck/VoteConsensusCard';
import CivicEngagementTrackerCard from '../components/decks/CivicEngagementDeck/CivicEngagementTrackerCard';
import DIDClaimCard from '../components/decks/CivicIdentityDeck/DIDClaimCard';
import PolicyEnforcementCard from '../components/decks/CivicGovernanceDeck/PolicyEnforcementCard';
import ZKPFeedbackNodeCard from '../components/decks/GovernanceFeedbackDeck/ZKPFeedbackNodeCard';
import SentimentAggregationCard from '../components/decks/GovernanceFeedbackDeck/SentimentAggregationCard';
import FeedbackImpactAnalyzerCard from '../components/decks/GovernanceFeedbackDeck/FeedbackImpactAnalyzerCard';
import AmendmentProposalCard from '../components/decks/CivicAmendmentsDeck/AmendmentProposalCard';
import EvidenceSubmissionCard from '../components/decks/CivicJusticeDeck/EvidenceSubmissionCard';
import { ZKPLearningModuleCard } from '../components/decks/CivicEducationDeck/ZKPLearningModuleCard';
import CurriculumAssessmentCard from '../components/decks/CivicEducationDeck/CurriculumAssessmentCard';
import CertificationVerificationCard from '../components/decks/CivicEducationDeck/CertificationVerificationCard';
import KnowledgeContributionCard from '../components/decks/CivicEducationDeck/KnowledgeContributionCard';
import TreatyProposalCard from '../components/decks/CivicDiplomacyDeck/TreatyProposalCard';
import SustainabilityAllocationCard from '../components/decks/CivicSustainabilityDeck/SustainabilityAllocationCard';
import MentalHealthAccessCard from '../components/decks/CivicWellbeingDeck/MentalHealthAccessCard';
import CivicMemoryVaultCard from '../components/decks/CivicLegacyDeck/CivicMemoryVaultCard';

/**
 * Deck configuration interface for routing and access control
 */
interface DeckConfig {
  id: string;
  name: string;
  description: string;
  modules: ModuleConfig[];
  requiredTier: CIDTier;
  genesisOverride?: boolean;
  truthPointsRequired?: number;
  pillarRequirements?: string[];
}

/**
 * Module configuration interface for individual deck components
 */
interface ModuleConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  description: string;
  requiredTier: CIDTier;
  truthPointsRequired?: number;
}

/**
 * Complete deck configuration for all 20 civic decks
 */
const DECK_CONFIGS: Record<string, DeckConfig> = {
  'wallet-overview': {
    id: 'wallet-overview',
    name: 'Wallet Overview',
    description: 'Identity management and balance tracking',
    requiredTier: CIDTier.TIER_0,
    modules: [
      {
        id: 'identity-summary',
        name: 'Identity Summary',
        component: IdentitySummaryCard,
        description: 'DID display with civic verification',
        requiredTier: CIDTier.TIER_0
      },
      {
        id: 'wallet-balance',
        name: 'Wallet Balance',
        component: WalletBalanceCard,
        description: 'Truth Points & Contribution Credits',
        requiredTier: CIDTier.TIER_0
      },
      {
        id: 'participation-streak',
        name: 'Participation Streak',
        component: ParticipationStreakCard,
        description: 'Engagement streak tracking',
        requiredTier: CIDTier.TIER_0
      },
      {
        id: 'wallet-sync',
        name: 'Wallet Sync',
        component: WalletSyncCard,
        description: 'Live sync status with network',
        requiredTier: CIDTier.TIER_0
      }
    ]
  },
  'governance': {
    id: 'governance',
    name: 'Governance',
    description: 'Civic proposal voting and decision making',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 50,
    modules: [
      {
        id: 'civic-swipe',
        name: 'Civic Swipe',
        component: CivicSwipeCard,
        description: 'Tinder-style proposal voting',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'vote-ledger',
        name: 'Vote Ledger',
        component: VoteLedgerCard,
        description: 'Chronological vote history',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'session-status',
        name: 'Session Status',
        component: SessionStatusCard,
        description: 'Real-time session monitoring',
        requiredTier: CIDTier.TIER_1
      }
    ]
  },
  'education': {
    id: 'education',
    name: 'Civic Education',
    description: 'Civic learning and knowledge building',
    requiredTier: CIDTier.TIER_0,
    modules: [
      {
        id: 'truth-literacy',
        name: 'Truth Literacy',
        component: TruthLiteracyCard,
        description: 'Interactive flashcard education',
        requiredTier: CIDTier.TIER_0
      },
      {
        id: 'civic-quiz',
        name: 'Civic Quiz',
        component: CivicQuizCard,
        description: 'Multiple-choice civic assessment',
        requiredTier: CIDTier.TIER_0
      },
      {
        id: 'civic-resources',
        name: 'Civic Resources',
        component: CivicResourceCard,
        description: 'Curated civic resource library',
        requiredTier: CIDTier.TIER_0
      },
      {
        id: 'community-forum',
        name: 'Community Forum',
        component: CommunityForumCard,
        description: 'Forum simulation with messaging',
        requiredTier: CIDTier.TIER_0
      }
    ]
  },
  'finance': {
    id: 'finance',
    name: 'Civic Finance',
    description: 'Truth Points and civic reward management',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 100,
    modules: [
      {
        id: 'earnings-summary',
        name: 'Earnings Summary',
        component: EarningsSummaryCard,
        description: 'Truth Points & Contribution Credits tracking',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'transaction-history',
        name: 'Transaction History',
        component: TransactionHistoryCard,
        description: 'Chronological reward tracking',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'rewards-calculator',
        name: 'Rewards Calculator',
        component: RewardsCalculatorCard,
        description: 'Interactive rewards projection',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'withdrawal-interface',
        name: 'Withdrawal Interface',
        component: WithdrawalInterfaceCard,
        description: 'Civic reward withdrawal management',
        requiredTier: CIDTier.TIER_2,
        truthPointsRequired: 500
      }
    ]
  },
  'privacy': {
    id: 'privacy',
    name: 'Privacy & Security',
    description: 'Zero-knowledge proof privacy management',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 200,
    modules: [
      {
        id: 'zkp-status',
        name: 'ZKP Status',
        component: ZKPStatusCard,
        description: 'Zero-knowledge proof monitoring',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'session-privacy',
        name: 'Session Privacy',
        component: SessionPrivacyCard,
        description: 'Session privacy control panel',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'encrypted-message',
        name: 'Encrypted Messaging',
        component: EncryptedMessageCard,
        description: 'Anonymous communication channel',
        requiredTier: CIDTier.TIER_2
      },
      {
        id: 'vault-access',
        name: 'Vault Access',
        component: VaultAccessCard,
        description: 'Secure file vault interface',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'zkp-layer': {
    id: 'zkp-layer',
    name: 'ZKP Layer',
    description: 'Zero-knowledge proof generation and verification',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 300,
    modules: [
      {
        id: 'zkp-generator',
        name: 'ZKP Generator',
        component: ZKProofGeneratorCard,
        description: 'Zero-knowledge proof generation',
        requiredTier: CIDTier.TIER_2
      },
      {
        id: 'zkp-audit-trail',
        name: 'ZK Audit Trail',
        component: ZKAuditTrailCard,
        description: 'ZK proof audit logging',
        requiredTier: CIDTier.TIER_2
      },
      {
        id: 'zkp-verifier',
        name: 'ZKP Verifier',
        component: ZKProofVerifierCard,
        description: 'Zero-knowledge proof verification',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'civic-audit': {
    id: 'civic-audit',
    name: 'Civic Audit',
    description: 'Transparency and audit systems',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 250,
    modules: [
      {
        id: 'audit-chain-overview',
        name: 'Audit Chain Overview',
        component: AuditChainOverviewCard,
        description: 'Real-time audit trail visualization',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'secure-assets': {
    id: 'secure-assets',
    name: 'Secure Assets',
    description: 'Cryptographic asset management',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 400,
    modules: [
      {
        id: 'proof-bound-vault',
        name: 'Proof Bound Vault',
        component: ProofBoundVaultEntryCard,
        description: 'ZKP-bound asset access',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'consensus-layer': {
    id: 'consensus-layer',
    name: 'Consensus Layer',
    description: 'Civic proposal consensus monitoring',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 350,
    modules: [
      {
        id: 'vote-consensus',
        name: 'Vote Consensus',
        component: VoteConsensusCard,
        description: 'Real-time proposal consensus monitoring',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'governance-feedback': {
    id: 'governance-feedback',
    name: 'Governance Feedback',
    description: 'ZKP-bound governance feedback and sentiment analysis',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 200,
    modules: [
      {
        id: 'zkp-feedback-node',
        name: 'ZKP Feedback Node',
        component: ZKPFeedbackNodeCard,
        description: 'ZKP-bound governance feedback classification interface',
        requiredTier: CIDTier.TIER_2
      },
      {
        id: 'sentiment-aggregation',
        name: 'Sentiment Aggregation',
        component: SentimentAggregationCard,
        description: 'Governance feedback sentiment analysis interface',
        requiredTier: CIDTier.TIER_2
      },
      {
        id: 'feedback-impact-analyzer',
        name: 'Feedback Impact Analyzer',
        component: FeedbackImpactAnalyzerCard,
        description: 'Policy impact assessment interface',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'civic-engagement': {
    id: 'civic-engagement',
    name: 'Civic Engagement',
    description: 'Gamified civic engagement tracking',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 150,
    modules: [
      {
        id: 'engagement-tracker',
        name: 'Engagement Tracker',
        component: CivicEngagementTrackerCard,
        description: 'Gamified civic engagement dashboard',
        requiredTier: CIDTier.TIER_1
      }
    ]
  },
  'civic-identity': {
    id: 'civic-identity',
    name: 'Civic Identity',
    description: 'Decentralized identity management',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 100,
    modules: [
      {
        id: 'did-claim',
        name: 'DID Claim',
        component: DIDClaimCard,
        description: 'Decentralized identity claim interface',
        requiredTier: CIDTier.TIER_1
      }
    ]
  },
  'civic-governance': {
    id: 'civic-governance',
    name: 'Civic Governance',
    description: 'Policy enforcement and governance',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 300,
    modules: [
      {
        id: 'policy-enforcement',
        name: 'Policy Enforcement',
        component: PolicyEnforcementCard,
        description: 'Policy enforcement interface',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'civic-amendments': {
    id: 'civic-amendments',
    name: 'Civic Amendments',
    description: 'Amendment proposal and ratification',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 400,
    modules: [
      {
        id: 'amendment-proposal',
        name: 'Amendment Proposal',
        component: AmendmentProposalCard,
        description: 'Comprehensive amendment proposal interface',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'civic-justice': {
    id: 'civic-justice',
    name: 'Civic Justice',
    description: 'Evidence submission and arbitration',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 350,
    modules: [
      {
        id: 'evidence-submission',
        name: 'Evidence Submission',
        component: EvidenceSubmissionCard,
        description: 'Secure evidence upload interface',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'civic-education': {
    id: 'civic-education',
    name: 'Civic Education',
    description: 'ZKP-certified learning validation',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 100,
    modules: [
      {
        id: 'zkp-learning-module',
        name: 'ZKP Learning Module',
        component: ZKPLearningModuleCard,
        description: 'ZKP-certified learning validation interface',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'curriculum-assessment',
        name: 'Curriculum Assessment',
        component: CurriculumAssessmentCard,
        description: 'Interactive assessment interface with quiz system',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'certification-verification',
        name: 'Certification Verification',
        component: CertificationVerificationCard,
        description: 'Certificate scanner interface with QR hash verification',
        requiredTier: CIDTier.TIER_1
      },
      {
        id: 'knowledge-contribution',
        name: 'Knowledge Contribution',
        component: KnowledgeContributionCard,
        description: 'Civic learner-generated content submission interface',
        requiredTier: CIDTier.TIER_1
      }
    ]
  },
  'civic-diplomacy': {
    id: 'civic-diplomacy',
    name: 'Civic Diplomacy',
    description: 'International treaty management',
    requiredTier: CIDTier.TIER_3,
    truthPointsRequired: 500,
    modules: [
      {
        id: 'treaty-proposal',
        name: 'Treaty Proposal',
        component: TreatyProposalCard,
        description: 'International treaty proposal interface',
        requiredTier: CIDTier.TIER_3
      }
    ]
  },
  'civic-sustainability': {
    id: 'civic-sustainability',
    name: 'Civic Sustainability',
    description: 'Community resource allocation',
    requiredTier: CIDTier.TIER_2,
    truthPointsRequired: 250,
    modules: [
      {
        id: 'sustainability-allocation',
        name: 'Sustainability Allocation',
        component: SustainabilityAllocationCard,
        description: 'Community-driven resource allocation interface',
        requiredTier: CIDTier.TIER_2
      }
    ]
  },
  'civic-wellbeing': {
    id: 'civic-wellbeing',
    name: 'Civic Wellbeing',
    description: 'Mental health and community support',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 150,
    modules: [
      {
        id: 'mental-health-access',
        name: 'Mental Health Access',
        component: MentalHealthAccessCard,
        description: 'Mental health provider access interface',
        requiredTier: CIDTier.TIER_1
      }
    ]
  },
  'civic-legacy': {
    id: 'civic-legacy',
    name: 'Civic Legacy',
    description: 'Historical knowledge preservation',
    requiredTier: CIDTier.TIER_1,
    truthPointsRequired: 100,
    modules: [
      {
        id: 'civic-memory-vault',
        name: 'Civic Memory Vault',
        component: CivicMemoryVaultCard,
        description: 'Historical knowledge archive interface',
        requiredTier: CIDTier.TIER_1
      }
    ]
  }
};

/**
 * Access control interface for user session validation
 */
interface UserSession {
  cid: string;
  tier: CIDTier;
  truthPoints: number;
  genesisOwner: boolean;
  accessibleDecks: string[];
}

/**
 * Mock user session for development (replace with actual session management)
 */
const getMockUserSession = (): UserSession => {
  return {
    cid: 'commander-hash',
    tier: CIDTier.TIER_3, // Set to TIER_3 for full deck access during development
    truthPoints: 1000, // Ensure sufficient TruthPoints for all decks
    genesisOwner: true, // Set as genesis owner for full access
    accessibleDecks: Object.keys(DECK_CONFIGS)
  };
};

/**
 * Access denied component for unauthorized access attempts
 */
const AccessDeniedCard: React.FC<{ requiredTier: CIDTier; currentTier: CIDTier; deckName: string }> = ({
  requiredTier,
  currentTier,
  deckName
}) => {
  useEffect(() => {
    console.log(`🚫 Access Denied: ${deckName} requires ${requiredTier}, user has ${currentTier}`);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full text-center">
        <div className="text-red-400 text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
        <p className="text-slate-400 mb-6">
          The <span className="text-white font-semibold">{deckName}</span> deck requires 
          <span className="text-blue-400 font-semibold"> {requiredTier}</span> access.
        </p>
        <p className="text-slate-500 mb-6">
          Your current tier: <span className="text-amber-400">{currentTier}</span>
        </p>
        <button
          onClick={() => window.location.href = '/onboarding-required'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          aria-label="Go to onboarding to upgrade access tier"
        >
          Upgrade Access
        </button>
      </div>
    </div>
  );
};

/**
 * Deck overview component showing all modules within a deck
 */
const DeckOverview: React.FC<{ deckId: string; userSession: UserSession }> = ({ deckId, userSession }) => {
  const deckConfig = DECK_CONFIGS[deckId];
  
  if (!deckConfig) {
    return <div>Deck not found</div>;
  }
  
  // Check deck access
  if (!validateCIDAccess(userSession.cid, deckConfig.requiredTier)) {
    return (
      <AccessDeniedCard
        requiredTier={deckConfig.requiredTier}
        currentTier={userSession.tier}
        deckName={deckConfig.name}
      />
    );
  }
  
  useEffect(() => {
    console.log(`🎯 Deck Overview Loaded: ${deckConfig.name} | User: ${userSession.cid} | Tier: ${userSession.tier}`);
    
    // TTS announcement for successful access
    if ('speechSynthesis' in window) {
      const announcement = `Unlocked — Welcome to ${deckConfig.name}`;
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.9;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  }, [deckConfig.name, userSession.cid]);
  
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Deck Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{deckConfig.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ✅ Unlocked
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Tier {userSession.tier}
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-lg">{deckConfig.description}</p>
        </div>
        
        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deckConfig.modules.map((module) => {
            const hasAccess = validateCIDAccess(userSession.cid, module.requiredTier);
            const hasRequiredTP = !module.truthPointsRequired || userSession.truthPoints >= module.truthPointsRequired;
            const canAccess = hasAccess && hasRequiredTP;
            
            return (
              <div
                key={module.id}
                className={`
                  bg-slate-800 border rounded-lg p-6 transition-all duration-200
                  ${canAccess 
                    ? 'border-slate-700 hover:border-blue-500 hover:shadow-lg cursor-pointer' 
                    : 'border-red-700 opacity-60 cursor-not-allowed'
                  }
                `}
                onClick={() => {
                  if (canAccess) {
                    window.location.href = `/deck/${deckId}/${module.id}`;
                  }
                }}
                role="button"
                tabIndex={canAccess ? 0 : -1}
                aria-label={`${canAccess ? 'Open' : 'Locked'} ${module.name} module`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                  {canAccess ? (
                    <span className="text-green-400 text-xl">🟢</span>
                  ) : (
                    <span className="text-red-400 text-xl">🔒</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-4">{module.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Required: {module.requiredTier}
                  </span>
                  {module.truthPointsRequired && (
                    <span className={`
                      ${hasRequiredTP ? 'text-green-400' : 'text-red-400'}
                    `}>
                      {module.truthPointsRequired} TP
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => window.location.href = '/command'}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            aria-label="Return to Civic Command Center"
          >
            ← Back to Command Center
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual module component wrapper
 */
const ModuleView: React.FC<{ 
  deckId: string; 
  moduleId: string; 
  userSession: UserSession;
  subpageId?: string;
}> = ({
  deckId,
  moduleId,
  userSession,
  subpageId
}) => {
  const deckConfig = DECK_CONFIGS[deckId];
  const moduleConfig = deckConfig?.modules.find(m => m.id === moduleId);
  
  if (!deckConfig || !moduleConfig) {
    console.error(`❌ ModuleView Error: deckId="${deckId}", moduleId="${moduleId}" not found`);
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Module Not Found</h2>
          <p className="text-slate-400 mb-2">Deck ID: <span className="text-blue-400">{deckId}</span></p>
          <p className="text-slate-400 mb-2">Module ID: <span className="text-blue-400">{moduleId}</span></p>
          <button
            onClick={() => window.location.href = '/command'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mt-4"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }
  
  // Check module access
  if (!validateCIDAccess(userSession.cid, moduleConfig.requiredTier)) {
    return (
      <AccessDeniedCard
        requiredTier={moduleConfig.requiredTier}
        currentTier={userSession.tier}
        deckName={`${deckConfig.name} - ${moduleConfig.name}`}
      />
    );
  }
  
  const ModuleComponent = moduleConfig.component;
  
  useEffect(() => {
    const loadMessage = subpageId 
      ? `🧩 Subpage Loaded: ${deckConfig.name} > ${moduleConfig.name} > ${subpageId} | User: ${userSession.cid}`
      : `🧩 Module Loaded: ${deckConfig.name} > ${moduleConfig.name} | User: ${userSession.cid}`;
    console.log(loadMessage);
    
    // TTS announcement for module access
    if ('speechSynthesis' in window) {
      const announcement = subpageId 
        ? `${moduleConfig.name} ${subpageId} interface ready`
        : `${moduleConfig.name} interface ready`;
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.9;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  }, [deckConfig.name, moduleConfig.name, subpageId, userSession.cid]);
  
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Module Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {deckConfig.name} → {moduleConfig.name}{subpageId && ` → ${subpageId}`}
            </h1>
            <p className="text-slate-400">{moduleConfig.description}</p>
          </div>
          <button
            onClick={() => window.location.href = `/deck/${deckId}`}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            aria-label={`Return to ${deckConfig.name} deck overview`}
          >
            ← Back to Deck
          </button>
        </div>
      </div>
      
      {/* Module Component */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <ModuleComponent />
        </div>
      </div>
    </div>
  );
};

/**
 * Main deck view router component
 */
const DeckViewRouter: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initialize user session
    const session = getMockUserSession();
    setUserSession(session);
    setLoading(false);
    
    console.log(`🎯 DeckViewRouter Initialized | User: ${session.cid} | Tier: ${session.tier} | TP: ${session.truthPoints}`);
  }, []);
  
  if (loading || !userSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading deck interface...</div>
      </div>
    );
  }
  
  // Map numerical deck IDs to string deck IDs
  const getDeckIdFromNumber = (deckNum: string): string | null => {
    const deckMapping: Record<string, string> = {
      '1': 'wallet-overview',
      '2': 'governance', 
      '3': 'education',
      '4': 'finance',
      '5': 'privacy',
      '6': 'zkp-layer',
      '7': 'secure-assets',
      '8': 'civic-audit',
      '9': 'consensus-layer',
      '10': 'governance-feedback',
      '11': 'civic-engagement',
      '12': 'civic-identity',
      '13': 'civic-governance',
      '14': 'civic-amendments',
      '15': 'civic-justice',
      '16': 'civic-education',
      '17': 'civic-diplomacy',
      '18': 'civic-sustainability',
      '19': 'civic-wellbeing',
      '20': 'civic-legacy'
    };
    return deckMapping[deckNum] || null;
  };

  return (
    <Switch>
      {/* Individual module routes - /deck/:deckId/:moduleId */}
      <Route path="/deck/:deckId/:moduleId">
        {(params) => {
          const { deckId, moduleId } = params!;
          const mappedDeckId = getDeckIdFromNumber(deckId) || deckId;
          
          console.log(`🔍 Route Debug: Original deckId="${deckId}", mapped="${mappedDeckId}", moduleId="${moduleId}"`);
          console.log(`🔍 Available decks:`, Object.keys(DECK_CONFIGS));
          
          // Check if deck exists
          const deckConfig = DECK_CONFIGS[mappedDeckId];
          if (deckConfig) {
            console.log(`🔍 Deck "${mappedDeckId}" found with modules:`, deckConfig.modules.map(m => m.id));
            
            // Check if module exists in deck
            const moduleExists = deckConfig.modules.some(m => m.id === moduleId);
            console.log(`🔍 Module "${moduleId}" exists in deck:`, moduleExists);
            
            if (moduleExists) {
              return (
                <ModuleView
                  deckId={mappedDeckId}
                  moduleId={moduleId}
                  userSession={userSession}
                />
              );
            }
          }
          
          // If we get here, either deck or module doesn't exist
          return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Route Not Found</h2>
                <p className="text-slate-400 mb-2">Deck: <span className="text-blue-400">{deckId}</span> → <span className="text-blue-400">{mappedDeckId}</span></p>
                <p className="text-slate-400 mb-4">Module: <span className="text-blue-400">{moduleId}</span></p>
                <button
                  onClick={() => window.location.href = '/command'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Return to Command Center
                </button>
              </div>
            </div>
          );
        }}
      </Route>
      
      {/* Deck overview routes - /deck/:deckId */}
      <Route path="/deck/:deckId">
        {(params) => {
          const mappedDeckId = getDeckIdFromNumber(params!.deckId) || params!.deckId;
          return (
            <DeckOverview
              deckId={mappedDeckId}
              userSession={userSession}
            />
          );
        }}
      </Route>
      
      {/* Default redirect to onboarding */}
      <Route>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Deck Access Required</h2>
            <p className="text-slate-400 mb-6">Please specify a deck to access.</p>
            <button
              onClick={() => window.location.href = '/command'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Command Center
            </button>
          </div>
        </div>
      </Route>
    </Switch>
  );
};

export default DeckViewRouter;
export { DECK_CONFIGS, type DeckConfig, type ModuleConfig, type UserSession };