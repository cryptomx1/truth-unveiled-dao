import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, User, Target, Vote, Eye, GitBranch, BarChart3 } from 'lucide-react';
import { useUserSession } from '../system/UserSessionEngine';
import { useOfflineReplayBuffer } from '../../hooks/useOfflineReplayBuffer';
import { useTraceChain } from '../trace/TraceChainRegistry';
import { TruthTracePanel } from '../trace/TruthTracePanel';
import { DeckImpactGraph } from '../trace/DeckImpactGraph';
import { useZKPTraceProof } from '../trace/ZKPTraceProof';
import { TrustVoteCard } from '../feedback/TrustVoteCard';
import { FeedbackImpactAnalyzerCard } from '../feedback/FeedbackImpactAnalyzerCard';
import { useTranslation } from '../../translation/useTranslation';
import { useLangContext } from '../../context/LanguageContext';

// Memory Timeline Entry Types
interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'mission_select' | 'deck_visit' | 'tier_upgrade';
  action: string;
  value: string;
  description: string;
  zkpHash: string;
}

// Mock memory timeline data
const mockMemoryEntries: MemoryEntry[] = [
  {
    id: 'mem_001',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'mission_select',
    action: 'Selected Mission',
    value: 'voice',
    description: 'User selected Voice mission to participate in civic dialogue',
    zkpHash: 'zkp_voice_4f8a2e7c'
  },
  {
    id: 'mem_002', 
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    type: 'deck_visit',
    action: 'Visited Deck',
    value: 'Feedback Dashboard',
    description: 'Accessed governance feedback interface',
    zkpHash: 'zkp_deck_9b3c5d8f'
  },
  {
    id: 'mem_003',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    type: 'tier_upgrade',
    action: 'Tier Upgrade',
    value: 'moderator',
    description: 'Elevated to moderator status through trust scoring',
    zkpHash: 'zkp_tier_7e2f9a1b'
  },
  {
    id: 'mem_004',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    type: 'mission_select',
    action: 'Selected Mission',
    value: 'data',
    description: 'Switched to Data mission for analytics focus',
    zkpHash: 'zkp_data_3c7b4e6d'
  },
  {
    id: 'mem_005',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    type: 'deck_visit',
    action: 'Visited Deck', 
    value: 'Feedback Dashboard',
    description: 'Re-accessed governance feedback dashboard',
    zkpHash: 'zkp_deck_5a8f2c9e'
  }
];

export const CivicMemoryIndex: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLangContext();
  const [memoryEntries] = useState<MemoryEntry[]>(mockMemoryEntries);
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);
  const [showTracePanel, setShowTracePanel] = useState(false);

  // Console log when component re-renders in different language
  useEffect(() => {
    console.log(`🈳 CivicMemoryIndex re-rendered in: ${language.toUpperCase()}`);
  }, [language]);
  const [showImpactGraph, setShowImpactGraph] = useState(false);
  const [showTrustVote, setShowTrustVote] = useState(false);
  const [showImpactAnalyzer, setShowImpactAnalyzer] = useState(false);
  const [glowingEntries, setGlowingEntries] = useState<Set<string>>(new Set());
  const { setSession, sessionSource, saveLastMemoryAction } = useUserSession();
  const { addToQueue, isOnline } = useOfflineReplayBuffer();
  const { addTrace, getChain, getStats } = useTraceChain();
  const { createExport, exportToFile } = useZKPTraceProof();
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // TTS setup with proper cleanup
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Mission Replay Activation Handler with Offline Buffer Support
  const handleReplayAction = (entry: MemoryEntry) => {
    // Create action object for buffer/persistence
    const replayAction = {
      type: entry.type as 'mission' | 'deck_visit' | 'tier_upgrade',
      data: { 
        value: entry.value,
        action: entry.action,
        zkpHash: entry.zkpHash,
        description: entry.description
      }
    };

    // Check if online - if not, queue for later
    if (!isOnline) {
      addToQueue(replayAction);
      console.log('📥 Queued replay action for later sync');
      return;
    }

    // Log replay action before state change
    console.log(`🔁 Reapplied state from memory: ${entry.action} → ${entry.value}`);

    try {
      switch (entry.type) {
        case 'mission_select':
          // Cast to valid mission type
          const mission = entry.value as 'representation' | 'voice' | 'data';
          setSession({ mission });
          console.log(`🔁 Mission replay activated: ${mission}`);
          break;

        case 'deck_visit':
          // Simulate deck navigation
          setSession({ lastView: 'deck' });
          console.log(`🚀 Simulated navigation to: ${entry.value}`);
          break;

        case 'tier_upgrade':
          // Cast to valid tier type  
          const tier = entry.value as 'citizen' | 'moderator' | 'governor';
          setSession({ tier });
          console.log(`🔁 Tier replay activated: ${tier}`);
          break;

        default:
          console.log(`⚠️ Unsupported replay action: ${entry.type}`);
          return;
      }

      // Save last memory action for persistence across sessions
      saveLastMemoryAction(replayAction);

      // Add to Truth Trace Engine
      addTrace({
        sourceDeck: 'CivicMemoryIndex',
        moduleId: 'replay_action',
        action: entry.action,
        value: entry.value,
        zkpHash: entry.zkpHash
      });

      // Announce replay via TTS (with override protection)
      if ('speechSynthesis' in window) {
        if (speechRef.current) {
          speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(
          t('tts.memory.ready')
        );
        utterance.rate = 0.9;
        utterance.volume = 0.7;
        speechRef.current = utterance;
        speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('🔁 Replay action failed:', error);
    }
  };

  // Handle ZKP export
  const handleZKPExport = () => {
    const traceChain = getChain();
    if (traceChain.length === 0) {
      console.log('⚠️ No trace events to export');
      return;
    }

    try {
      const exportData = createExport(traceChain, sessionSource);
      const { filename, size } = exportToFile(exportData);
      
      console.log(`📄 ZKP Trace Proof exported: ${filename} (${Math.round(size / 1024)}KB)`);
      console.log(`📋 Export contains ${exportData.proofs.length} proofs with integrity verification`);
    } catch (error) {
      console.error('❌ ZKP export failed:', error);
    }
  };

  // Handle trust vote feedback
  const handleTrustVote = (voteType: 'trust' | 'concern', zkpHash: string) => {
    if (selectedEntry) {
      // Add glow effect to entry that received feedback
      setGlowingEntries(prev => new Set([...prev, selectedEntry.id]));
      
      console.log(`✅ Trust feedback recorded: ${voteType} for ${selectedEntry.action} (ZKP: ${zkpHash})`);
      console.log(`💫 Auto-glow activated for memory entry: ${selectedEntry.id}`);
      
      // Remove glow after 5 seconds
      setTimeout(() => {
        setGlowingEntries(prev => {
          const updated = new Set(prev);
          updated.delete(selectedEntry.id);
          return updated;
        });
      }, 5000);
    }
  };

  // Get action icon
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'mission_select':
        return <Target className="w-4 h-4" />;
      case 'deck_visit':
        return <Eye className="w-4 h-4" />;
      case 'tier_upgrade':
        return <Vote className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    }
    return `${diffMinutes}m ago`;
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-400" />
        <div>
          <h2 className="text-lg font-semibold text-white">{t('timeline.heading')}</h2>
          <p className="text-sm text-slate-400">Mission Replay Timeline</p>
        </div>
      </div>

      {/* Session Source Indicator */}
      <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">{t('session.summary')}:</span>
          <span className={`text-sm font-medium ${
            sessionSource === 'DID' ? 'text-blue-400' : 
            sessionSource === 'local' ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {sessionSource.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Truth Trace Engine Controls */}
      <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">Truth Trace Engine</span>
          </div>
          <div className="text-xs text-slate-400">
            {getStats().totalEvents} events
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowTracePanel(true)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs rounded transition-colors"
            >
              <GitBranch className="w-3 h-3" />
              Trace Panel
            </button>
            <button
              onClick={() => setShowImpactGraph(!showImpactGraph)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 border text-xs rounded transition-colors ${
                showImpactGraph 
                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-300' 
                  : 'bg-slate-600/20 hover:bg-slate-600/30 border-slate-500/30 text-slate-300'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Impact Graph
            </button>
          </div>
          
          <button
            onClick={handleZKPExport}
            disabled={getStats().totalEvents === 0}
            className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 disabled:bg-slate-600/20 disabled:text-slate-500 border border-green-500/30 disabled:border-slate-500/30 text-green-300 text-xs rounded transition-colors"
            title="📄 View Zero-Knowledge Proof of Trace"
          >
            📄 Export ZKP Proof
          </button>
        </div>
        
        {/* Trust Feedback Controls */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setShowTrustVote(!showTrustVote)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 border text-xs rounded transition-colors ${
              showTrustVote 
                ? 'bg-orange-600/30 border-orange-500/50 text-orange-300' 
                : 'bg-slate-600/20 hover:bg-slate-600/30 border-slate-500/30 text-slate-300'
            }`}
          >
            💬 Trust Vote
          </button>
          <button
            onClick={() => setShowImpactAnalyzer(!showImpactAnalyzer)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 border text-xs rounded transition-colors ${
              showImpactAnalyzer 
                ? 'bg-teal-600/30 border-teal-500/50 text-teal-300' 
                : 'bg-slate-600/20 hover:bg-slate-600/30 border-slate-500/30 text-slate-300'
            }`}
          >
            📊 Impact
          </button>
        </div>
      </div>

      {/* Impact Graph */}
      {showImpactGraph && (
        <div className="mb-4">
          <DeckImpactGraph 
            selectedEvent={selectedEntry ? {
              actionId: selectedEntry.id,
              timestamp: selectedEntry.timestamp.getTime(),
              sourceDeck: 'CivicMemoryIndex',
              moduleId: 'replay_action',
              action: selectedEntry.action,
              value: selectedEntry.value,
              effectHash: selectedEntry.zkpHash,
              zkpHash: selectedEntry.zkpHash
            } : null}
            onEventSelect={(event) => {
              // Find corresponding memory entry
              const entry = memoryEntries.find(e => e.id === event.actionId);
              if (entry) setSelectedEntry(entry);
            }}
          />
        </div>
      )}

      {/* Trust Vote Interface */}
      {showTrustVote && selectedEntry && (
        <div className="mb-4">
          <TrustVoteCard
            memoryAction={{
              id: selectedEntry.id,
              action: selectedEntry.action,
              value: selectedEntry.value,
              timestamp: selectedEntry.timestamp
            }}
            onVoteCast={handleTrustVote}
          />
        </div>
      )}

      {/* Feedback Impact Analyzer */}
      {showImpactAnalyzer && (
        <div className="mb-4">
          <FeedbackImpactAnalyzerCard />
        </div>
      )}

      {/* Memory Timeline */}
      <div className="space-y-3">
        {memoryEntries.map((entry) => (
          <div
            key={entry.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              selectedEntry?.id === entry.id
                ? 'bg-slate-700 border-blue-500'
                : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
            } ${
              glowingEntries.has(entry.id) 
                ? 'ring-2 ring-blue-500/50 border-blue-500/50 bg-blue-600/10 animate-pulse' 
                : ''
            }`}
          >
            {/* Entry Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getActionIcon(entry.type)}
                <span className="text-sm font-medium text-white">
                  {entry.action}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>

            {/* Entry Details */}
            <div className="mb-3">
              <div className="text-sm text-blue-400 font-medium mb-1">
                {entry.value}
              </div>
              <div className="text-xs text-slate-300">
                {entry.description}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                ZKP: {entry.zkpHash}
              </div>
            </div>

            {/* Replay Button */}
            <button
              onClick={() => handleReplayAction(entry)}
              onFocus={() => setSelectedEntry(entry)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              aria-label={`${t('action.replay')}: ${entry.action} ${entry.value}`}
            >
              <Play className="w-4 h-4" />
              {t('action.replay')}
            </button>
          </div>
        ))}
      </div>

      {/* Timeline Stats */}
      <div className="mt-6 p-3 bg-slate-700/30 rounded-lg">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-white">
              {memoryEntries.filter(e => e.type === 'mission_select').length}
            </div>
            <div className="text-xs text-slate-400">Missions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              {memoryEntries.filter(e => e.type === 'deck_visit').length}
            </div>
            <div className="text-xs text-slate-400">Deck Visits</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              {memoryEntries.filter(e => e.type === 'tier_upgrade').length}
            </div>
            <div className="text-xs text-slate-400">Upgrades</div>
          </div>
        </div>
      </div>

      {/* Truth Trace Panel */}
      <TruthTracePanel
        isOpen={showTracePanel}
        onClose={() => setShowTracePanel(false)}
        selectedEvent={selectedEntry ? {
          actionId: selectedEntry.id,
          timestamp: selectedEntry.timestamp.getTime(),
          sourceDeck: 'CivicMemoryIndex',
          moduleId: 'replay_action',
          action: selectedEntry.action,
          value: selectedEntry.value,
          effectHash: selectedEntry.zkpHash,
          zkpHash: selectedEntry.zkpHash
        } : null}
        onEventSelect={(event) => {
          // Find corresponding memory entry
          const entry = memoryEntries.find(e => e.id === event.actionId);
          if (entry) setSelectedEntry(entry);
        }}
      />
    </div>
  );
};

export default CivicMemoryIndex;