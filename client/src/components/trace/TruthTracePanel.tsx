// Truth Trace Engine - TruthTracePanel Component
// Sidebar panel for chronological/causal view of memory actions

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, GitBranch, Eye, Filter, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { MemoryReplayEvent, useTraceChain } from './TraceChainRegistry';
import { useReverseImpactAnalyzer, CausalChain } from './ReverseImpactAnalyzer';

interface TruthTracePanelProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onEventSelect?: (event: MemoryReplayEvent) => void;
  selectedEvent?: MemoryReplayEvent | null;
}

type ViewMode = 'chronological' | 'causal';
type FilterType = 'all' | 'mission_select' | 'deck_visit' | 'tier_upgrade';

export const TruthTracePanel: React.FC<TruthTracePanelProps> = ({
  className = '',
  isOpen,
  onClose,
  onEventSelect,
  selectedEvent
}) => {
  const { getChain, getStats } = useTraceChain();
  const { analyzeEvent, getAccessibleNarrative } = useReverseImpactAnalyzer();
  
  const [viewMode, setViewMode] = useState<ViewMode>('chronological');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [causalAnalysis, setCausalAnalysis] = useState<Map<string, CausalChain>>(new Map());

  const traceChain = useMemo(() => getChain(), [getChain]);
  const stats = useMemo(() => getStats(), [getStats]);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let events = traceChain;

    // Apply type filter
    if (filterType !== 'all') {
      events = events.filter(event => event.action === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      events = events.filter(event =>
        event.action.toLowerCase().includes(term) ||
        event.value.toLowerCase().includes(term) ||
        event.sourceDeck.toLowerCase().includes(term)
      );
    }

    return events;
  }, [traceChain, filterType, searchTerm]);

  // Sort events based on view mode
  const sortedEvents = useMemo(() => {
    if (viewMode === 'chronological') {
      return [...filteredEvents].sort((a, b) => b.timestamp - a.timestamp);
    } else {
      // Causal view: Sort by influence strength if selected event exists
      if (selectedEvent) {
        return [...filteredEvents].sort((a, b) => {
          const aAnalysis = causalAnalysis.get(a.actionId);
          const bAnalysis = causalAnalysis.get(b.actionId);
          
          if (!aAnalysis && !bAnalysis) return b.timestamp - a.timestamp;
          if (!aAnalysis) return 1;
          if (!bAnalysis) return -1;
          
          const aInfluence = aAnalysis.influences.find(inf => 
            inf.influencerEvent.actionId === selectedEvent.actionId
          );
          const bInfluence = bAnalysis.influences.find(inf => 
            inf.influencerEvent.actionId === selectedEvent.actionId
          );
          
          if (!aInfluence && !bInfluence) return b.timestamp - a.timestamp;
          if (!aInfluence) return 1;
          if (!bInfluence) return -1;
          
          return bInfluence.strength - aInfluence.strength;
        });
      }
      return [...filteredEvents].sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [filteredEvents, viewMode, selectedEvent, causalAnalysis]);

  // Analyze causal relationships when view mode changes or events update
  useEffect(() => {
    if (viewMode === 'causal' && traceChain.length > 0) {
      const newAnalysis = new Map<string, CausalChain>();
      
      traceChain.forEach(event => {
        const analysis = analyzeEvent(event);
        newAnalysis.set(event.actionId, analysis);
      });
      
      setCausalAnalysis(newAnalysis);
    }
  }, [viewMode, traceChain, analyzeEvent]);

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  // Get event icon
  const getEventIcon = (event: MemoryReplayEvent) => {
    switch (event.action) {
      case 'mission_select':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'deck_visit':
        return <Eye className="w-4 h-4 text-green-400" />;
      case 'tier_upgrade':
        return <ArrowUp className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get causal influence indicator
  const getCausalIndicator = (event: MemoryReplayEvent) => {
    if (viewMode !== 'causal' || !selectedEvent) return null;
    
    const analysis = causalAnalysis.get(event.actionId);
    if (!analysis) return null;

    const influence = analysis.influences.find(inf => 
      inf.influencerEvent.actionId === selectedEvent.actionId
    );

    if (!influence) return null;

    const strengthColor = influence.strength >= 0.7 ? 'text-red-400' : 
                         influence.strength >= 0.5 ? 'text-yellow-400' : 'text-blue-400';

    return (
      <div className={`text-xs ${strengthColor} flex items-center gap-1`}>
        <GitBranch className="w-3 h-3" />
        {Math.round(influence.strength * 100)}%
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-80 bg-slate-800 border-l border-slate-600 z-50 transform transition-transform duration-300 ${className}`}
      role="complementary"
      aria-label="Truth Trace Panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-200">Truth Trace</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1"
            aria-label="Close trace panel"
          >
            ×
          </button>
        </div>

        {/* Stats */}
        <div className="text-xs text-slate-400 mb-3">
          {stats.totalEvents} events • {stats.uniqueDecks} decks • {stats.uniqueModules} modules
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* View Mode Toggle */}
          <div className="flex rounded bg-slate-700 p-1">
            <button
              onClick={() => setViewMode('chronological')}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'chronological'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 inline mr-1" />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('causal')}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'causal'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GitBranch className="w-3 h-3 inline mr-1" />
              Causal
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-400"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
          >
            <option value="all">All Events</option>
            <option value="mission_select">Mission Select</option>
            <option value="deck_visit">Deck Visit</option>
            <option value="tier_upgrade">Tier Upgrade</option>
          </select>
        </div>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sortedEvents.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Filter className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No events match your filters</div>
          </div>
        ) : (
          sortedEvents.map((event) => {
            const isExpanded = expandedEvents.has(event.actionId);
            const isSelected = selectedEvent?.actionId === event.actionId;
            const analysis = causalAnalysis.get(event.actionId);

            return (
              <div
                key={event.actionId}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                }`}
                onClick={() => {
                  onEventSelect?.(event);
                  toggleEventExpansion(event.actionId);
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Event: ${event.action} ${event.value}`}
              >
                {/* Event Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event)}
                    <div className="text-sm text-slate-200 font-medium">
                      {event.value}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCausalIndicator(event)}
                    <div className="text-xs text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="mt-2 text-xs text-slate-400">
                  {event.sourceDeck} • {event.action}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                    {/* ZKP Hash */}
                    <div className="text-xs">
                      <span className="text-slate-400">ZKP Hash:</span>
                      <span className="text-slate-300 ml-2 font-mono">
                        {event.zkpHash || event.effectHash}
                      </span>
                    </div>

                    {/* Causal Analysis */}
                    {viewMode === 'causal' && analysis && (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400">Causal Analysis:</div>
                        {analysis.influences.length > 0 ? (
                          <div className="space-y-1">
                            {analysis.influences.slice(0, 3).map((influence, index) => (
                              <div key={index} className="text-xs text-slate-300 flex justify-between">
                                <span>{influence.description}</span>
                                <span className="text-blue-400">{Math.round(influence.strength * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">No causal influences detected</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {selectedEvent && viewMode === 'causal' && causalAnalysis.has(selectedEvent.actionId) && (
          getAccessibleNarrative(causalAnalysis.get(selectedEvent.actionId)!)
        )}
      </div>
    </div>
  );
};