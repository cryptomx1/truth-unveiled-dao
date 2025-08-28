import React, { useState, useEffect, useRef } from 'react';
import { History, Play, ThumbsUp, ThumbsDown, Filter, GitBranch } from 'lucide-react';
import { useZKPFeedbackNode } from './ZKPFeedbackNode';

interface FeedbackHistoryEntry {
  id: string;
  voteType: 'trust' | 'concern';
  actionId: string;
  timestamp: Date;
  zkpHash: string;
  memoryAction?: {
    action: string;
    value: string;
    description: string;
  };
  replayable: boolean;
  causalLinks: string[];
}

interface FeedbackHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayFeedback?: (entry: FeedbackHistoryEntry) => void;
}

export const FeedbackHistoryPanel: React.FC<FeedbackHistoryPanelProps> = ({
  isOpen,
  onClose,
  onReplayFeedback
}) => {
  const [historyEntries, setHistoryEntries] = useState<FeedbackHistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<FeedbackHistoryEntry | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'trust' | 'concern'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { vaultEntries } = useZKPFeedbackNode();

  // Nuclear TTS override system
  useEffect(() => {
    const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    const originalCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
    
    window.speechSynthesis.speak = () => {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    };
    window.speechSynthesis.cancel = originalCancel;
    console.log('TTS override applied');
    
    return () => {
      window.speechSynthesis.speak = originalSpeak;
      window.speechSynthesis.cancel = originalCancel;
    };
  }, []);

  // Load feedback history from vault entries
  useEffect(() => {
    const loadHistoryEntries = () => {
      const entries: FeedbackHistoryEntry[] = vaultEntries.map(vaultEntry => {
        // Mock memory action data (in real app would come from CivicMemoryIndex)
        const mockMemoryActions = [
          { action: 'mission_select', value: 'Privacy Protection', description: 'Selected privacy-focused civic mission' },
          { action: 'deck_visit', value: 'Identity Management', description: 'Accessed decentralized identity tools' },
          { action: 'tier_upgrade', value: 'Trusted Participant', description: 'Advanced to trusted civic tier' },
          { action: 'vote_cast', value: 'Municipal Proposal #247', description: 'Voted on local governance proposal' },
          { action: 'feedback_submit', value: 'Community Sentiment', description: 'Submitted civic trust feedback' }
        ];

        const randomAction = mockMemoryActions[Math.floor(Math.random() * mockMemoryActions.length)];

        return {
          id: vaultEntry.id,
          voteType: vaultEntry.voteType,
          actionId: vaultEntry.actionId,
          timestamp: new Date(vaultEntry.timestamp),
          zkpHash: vaultEntry.zkpHash,
          memoryAction: randomAction,
          replayable: true,
          causalLinks: [
            `trace_${vaultEntry.zkpHash.substring(0, 8)}`,
            `memory_${vaultEntry.actionId}`,
            `civic_${Date.now().toString(36)}`
          ]
        };
      });

      return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    setHistoryEntries(loadHistoryEntries());
  }, [vaultEntries]);

  // Filter entries
  const filteredEntries = historyEntries.filter(entry => {
    const matchesType = filterType === 'all' || entry.voteType === filterType;
    const matchesSearch = searchTerm === '' || 
      entry.memoryAction?.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.memoryAction?.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const handleReplay = (entry: FeedbackHistoryEntry) => {
    setSelectedEntry(entry);
    onReplayFeedback?.(entry);
    console.log(`🔁 Replaying feedback: ${entry.voteType} vote on ${entry.memoryAction?.action}`);
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Feedback History</h2>
              <p className="text-sm text-slate-400">Replayable civic trust timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close feedback history panel"
          >
            <span className="text-slate-400 text-xl">×</span>
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-700 space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search feedback history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Filter Toggle */}
          <div className="flex gap-2">
            {(['all', 'trust', 'concern'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                  filterType === type
                    ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600 text-slate-300'
                }`}
              >
                <Filter className="w-3 h-3" />
                {type === 'all' ? 'All Feedback' : 
                 type === 'trust' ? 'Trust Votes' : 'Concern Votes'}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="text-xs text-slate-400">
            Showing {filteredEntries.length} of {historyEntries.length} feedback entries
          </div>
        </div>

        {/* History Timeline */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-sm">No feedback history found</div>
              <div className="text-xs mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'Cast votes to build feedback history'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedEntry?.id === entry.id
                      ? 'bg-blue-600/20 border-blue-500/50 ring-2 ring-blue-500/30'
                      : 'bg-slate-700/20 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start gap-3">
                    {/* Vote Icon */}
                    <div className={`mt-1 p-1 rounded ${
                      entry.voteType === 'trust' ? 'bg-green-600/20' : 'bg-amber-600/20'
                    }`}>
                      {entry.voteType === 'trust' ? (
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-amber-400" />
                      )}
                    </div>

                    {/* Entry Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-white">
                          {entry.voteType === 'trust' ? 'Trust Vote' : 'Concern Vote'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>

                      {/* Memory Action */}
                      {entry.memoryAction && (
                        <div className="mb-2">
                          <div className="text-sm text-blue-400">
                            {entry.memoryAction.action}: {entry.memoryAction.value}
                          </div>
                          <div className="text-xs text-slate-400">
                            {entry.memoryAction.description}
                          </div>
                        </div>
                      )}

                      {/* ZKP Hash */}
                      <div className="text-xs text-slate-500 mb-2">
                        ZKP: {entry.zkpHash.substring(0, 16)}...
                      </div>

                      {/* Causal Links */}
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="w-3 h-3 text-purple-400" />
                        <div className="text-xs text-purple-300">
                          {entry.causalLinks.length} causal link{entry.causalLinks.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Replay Button */}
                      {entry.replayable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplay(entry);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs rounded transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          Replay Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Entry Details */}
        {selectedEntry && (
          <div className="p-4 border-t border-slate-700 bg-slate-700/20">
            <div className="text-sm font-medium text-white mb-2">Feedback Details</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 mb-1">Vote Type</div>
                <div className={`font-medium ${
                  selectedEntry.voteType === 'trust' ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {selectedEntry.voteType === 'trust' ? '🔼 Trust' : '🔽 Concern'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Action ID</div>
                <div className="text-slate-300 font-mono">{selectedEntry.actionId}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">ZKP Hash</div>
                <div className="text-slate-300 font-mono text-xs break-all">
                  {selectedEntry.zkpHash}
                </div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Causal Links</div>
                <div className="text-purple-300">
                  {selectedEntry.causalLinks.length} connection{selectedEntry.causalLinks.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ARIA Live Region */}
        <div 
          aria-live="polite" 
          aria-label="Feedback history updates"
          className="sr-only"
        >
          {selectedEntry && `Selected feedback: ${selectedEntry.voteType} vote on ${selectedEntry.memoryAction?.action}`}
        </div>
      </div>
    </div>
  );
};

export default FeedbackHistoryPanel;