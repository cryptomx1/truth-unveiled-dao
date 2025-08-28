// Truth Trace Engine - DeckImpactGraph Component
// Visual timeline graph linking memory actions across decks

import React, { useState, useEffect, useMemo } from 'react';
import { MemoryReplayEvent, useTraceChain } from './TraceChainRegistry';
import { Layers, GitBranch, Clock, Eye, EyeOff } from 'lucide-react';

interface DeckNode {
  id: string;
  name: string;
  eventCount: number;
  lastActivity: number;
  x: number;
  y: number;
}

interface TraceConnection {
  from: string;
  to: string;
  events: MemoryReplayEvent[];
  strength: number;
}

interface DeckImpactGraphProps {
  className?: string;
  selectedEvent?: MemoryReplayEvent | null;
  onEventSelect?: (event: MemoryReplayEvent) => void;
}

export const DeckImpactGraph: React.FC<DeckImpactGraphProps> = ({
  className = '',
  selectedEvent,
  onEventSelect
}) => {
  const { getChain, getStats } = useTraceChain();
  const [impactRadius, setImpactRadius] = useState<1 | 2 | 'full'>(1);
  const [showTimeline, setShowTimeline] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const traceChain = useMemo(() => getChain(), [getChain]);
  const stats = useMemo(() => getStats(), [getStats]);

  // Generate deck nodes from trace events
  const deckNodes = useMemo((): DeckNode[] => {
    const deckMap = new Map<string, { events: MemoryReplayEvent[]; lastActivity: number }>();

    traceChain.forEach(event => {
      if (!deckMap.has(event.sourceDeck)) {
        deckMap.set(event.sourceDeck, { events: [], lastActivity: 0 });
      }
      const deck = deckMap.get(event.sourceDeck)!;
      deck.events.push(event);
      deck.lastActivity = Math.max(deck.lastActivity, event.timestamp);
    });

    const nodes: DeckNode[] = [];
    const deckArray = Array.from(deckMap.entries());
    
    deckArray.forEach(([deckName, data], index) => {
      // Position nodes in a circle for better visualization
      const angle = (index / deckArray.length) * 2 * Math.PI;
      const radius = 120;
      
      nodes.push({
        id: deckName,
        name: deckName,
        eventCount: data.events.length,
        lastActivity: data.lastActivity,
        x: 150 + radius * Math.cos(angle),
        y: 150 + radius * Math.sin(angle)
      });
    });

    return nodes;
  }, [traceChain]);

  // Generate connections between decks
  const connections = useMemo((): TraceConnection[] => {
    const connectionMap = new Map<string, MemoryReplayEvent[]>();

    for (let i = 1; i < traceChain.length; i++) {
      const current = traceChain[i];
      const previous = traceChain[i - 1];
      
      if (current.sourceDeck !== previous.sourceDeck) {
        const key = `${previous.sourceDeck}->${current.sourceDeck}`;
        if (!connectionMap.has(key)) {
          connectionMap.set(key, []);
        }
        connectionMap.get(key)!.push(current);
      }
    }

    return Array.from(connectionMap.entries()).map(([key, events]) => {
      const [from, to] = key.split('->');
      return {
        from,
        to,
        events,
        strength: events.length
      };
    });
  }, [traceChain]);

  // Filter connections based on impact radius
  const filteredConnections = useMemo(() => {
    if (impactRadius === 'full') return connections;
    
    if (!selectedEvent) return connections;

    const relevantDecks = new Set([selectedEvent.sourceDeck]);
    
    // Add 1-hop connected decks
    connections.forEach(conn => {
      if (conn.from === selectedEvent.sourceDeck) {
        relevantDecks.add(conn.to);
      }
      if (conn.to === selectedEvent.sourceDeck) {
        relevantDecks.add(conn.from);
      }
    });

    // Add 2-hop connected decks if radius is 2
    if (impactRadius === 2) {
      const firstHopDecks = Array.from(relevantDecks);
      firstHopDecks.forEach(deck => {
        connections.forEach(conn => {
          if (conn.from === deck) relevantDecks.add(conn.to);
          if (conn.to === deck) relevantDecks.add(conn.from);
        });
      });
    }

    return connections.filter(conn => 
      relevantDecks.has(conn.from) && relevantDecks.has(conn.to)
    );
  }, [connections, impactRadius, selectedEvent]);

  // Get node color based on activity and selection
  const getNodeColor = (node: DeckNode): string => {
    if (selectedEvent && node.id === selectedEvent.sourceDeck) {
      return '#3b82f6'; // Blue for selected
    }
    
    if (hoveredNode === node.id) {
      return '#8b5cf6'; // Purple for hovered
    }

    // Color by activity level
    const now = Date.now();
    const hoursSinceActivity = (now - node.lastActivity) / (1000 * 60 * 60);
    
    if (hoursSinceActivity < 1) return '#10b981'; // Green - very recent
    if (hoursSinceActivity < 24) return '#f59e0b'; // Amber - recent
    return '#6b7280'; // Gray - older
  };

  return (
    <div className={`w-full h-80 bg-slate-700 rounded-lg border border-slate-600 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-medium text-slate-200">Deck Impact Graph</h3>
          <span className="text-xs text-slate-400">
            ({stats.totalEvents} events across {stats.uniqueDecks} decks)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Impact Radius Toggle */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Radius:</span>
            <button
              onClick={() => setImpactRadius(1)}
              className={`px-2 py-1 text-xs rounded ${
                impactRadius === 1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setImpactRadius(2)}
              className={`px-2 py-1 text-xs rounded ${
                impactRadius === 2 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setImpactRadius('full')}
              className={`px-2 py-1 text-xs rounded ${
                impactRadius === 'full' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              All
            </button>
          </div>

          {/* Timeline Toggle */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="p-1 text-slate-400 hover:text-slate-200"
            title={showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          >
            {showTimeline ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative w-full h-64 bg-slate-800 rounded border border-slate-600 overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Connections */}
          {filteredConnections.map((conn, index) => {
            const fromNode = deckNodes.find(n => n.id === conn.from);
            const toNode = deckNodes.find(n => n.id === conn.to);
            
            if (!fromNode || !toNode) return null;

            return (
              <g key={`${conn.from}-${conn.to}-${index}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#475569"
                  strokeWidth={Math.min(conn.strength, 4)}
                  strokeOpacity={0.6}
                />
                
                {/* Arrow head */}
                <polygon
                  points={`${toNode.x-5},${toNode.y-3} ${toNode.x},${toNode.y} ${toNode.x-5},${toNode.y+3}`}
                  fill="#475569"
                  opacity={0.6}
                />
              </g>
            );
          })}

          {/* Deck Nodes */}
          {deckNodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={Math.max(8, Math.min(20, node.eventCount * 2))}
                fill={getNodeColor(node)}
                stroke="#1e293b"
                strokeWidth={2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  const events = traceChain.filter(e => e.sourceDeck === node.id);
                  if (events.length > 0 && onEventSelect) {
                    onEventSelect(events[events.length - 1]);
                  }
                }}
              />
              
              {/* Node Label */}
              <text
                x={node.x}
                y={node.y + 35}
                textAnchor="middle"
                className="text-xs fill-slate-300 pointer-events-none"
                fontSize="10"
              >
                {node.name.length > 12 ? `${node.name.substring(0, 12)}...` : node.name}
              </text>
              
              {/* Event Count */}
              <text
                x={node.x}
                y={node.y + 3}
                textAnchor="middle"
                className="text-xs fill-white font-bold pointer-events-none"
                fontSize="10"
              >
                {node.eventCount}
              </text>
            </g>
          ))}
        </svg>

        {/* Hovered Node Info */}
        {hoveredNode && (
          <div className="absolute top-2 left-2 bg-slate-900 p-2 rounded text-xs text-slate-200 border border-slate-600">
            <div className="font-medium">{hoveredNode}</div>
            <div className="text-slate-400">
              {deckNodes.find(n => n.id === hoveredNode)?.eventCount} events
            </div>
            <div className="text-slate-400">
              Last: {new Date(deckNodes.find(n => n.id === hoveredNode)?.lastActivity || 0).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Bar */}
      {showTimeline && traceChain.length > 0 && (
        <div className="mt-2 h-8 bg-slate-800 rounded border border-slate-600 relative overflow-hidden">
          <div className="flex items-center h-full px-2">
            <Clock className="w-3 h-3 text-slate-400 mr-2" />
            <div className="flex-1 relative">
              {traceChain.slice(-20).map((event, index) => {
                const position = (index / 19) * 100;
                return (
                  <div
                    key={event.actionId}
                    className="absolute w-1 h-4 bg-blue-400 opacity-60 hover:opacity-100 cursor-pointer"
                    style={{ left: `${position}%` }}
                    title={`${event.action}: ${event.value}`}
                    onClick={() => onEventSelect?.(event)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {traceChain.length === 0 && (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No trace events yet</div>
            <div className="text-xs">Perform memory replay actions to see the impact graph</div>
          </div>
        </div>
      )}
    </div>
  );
};