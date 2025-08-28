/**
 * Phase XV: Collective Sentiment Ledger Initialization
 * SentimentReplayHeatmap.tsx - Interactive heatmap showing sentiment intensity over time
 * Authority: Commander Mark | JASMY Relay authorization
 */

import React, { useState, useEffect, useRef } from 'react';
import { SentimentLedgerEngine, SentimentLedgerEntry } from './SentimentLedgerEngine';

interface HeatmapCell {
  date: string;
  dayOfWeek: number;
  weekIndex: number;
  trust: number;
  volatility: number;
  entryCount: number;
  entries: SentimentLedgerEntry[];
}

interface HoverInfo {
  cell: HeatmapCell;
  x: number;
  y: number;
}

const SentimentReplayHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [hoveredCell, setHoveredCell] = useState<HoverInfo | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [viewMode, setViewMode] = useState<'trust' | 'volatility'>('trust');
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateHeatmapData();
  }, [selectedDeck, timeRange]);

  const generateHeatmapData = () => {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get ledger entries for the time range
    let allEntries = SentimentLedgerEngine.getLedgerByDateRange(startDate, now);
    
    if (selectedDeck !== 'all') {
      allEntries = allEntries.filter(entry => entry.deckId === selectedDeck);
    }

    // Group entries by date
    const dateGroups = new Map<string, SentimentLedgerEntry[]>();
    
    // Initialize all dates in range
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateGroups.set(dateStr, []);
    }

    // Populate with actual entries
    allEntries.forEach(entry => {
      const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];
      if (dateGroups.has(dateStr)) {
        dateGroups.get(dateStr)!.push(entry);
      }
    });

    // Convert to heatmap cells
    const cells: HeatmapCell[] = [];
    const sortedDates = Array.from(dateGroups.keys()).sort();

    sortedDates.forEach((dateStr, index) => {
      const date = new Date(dateStr);
      const entries = dateGroups.get(dateStr)!;
      
      const avgTrust = entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.averageTrust, 0) / entries.length
        : 0;
      
      const avgVolatility = entries.length > 0
        ? entries.reduce((sum, e) => sum + e.volatility, 0) / entries.length
        : 0;

      cells.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        weekIndex: Math.floor(index / 7),
        trust: avgTrust,
        volatility: avgVolatility,
        entryCount: entries.length,
        entries
      });
    });

    setHeatmapData(cells);
    console.log(`📊 Generated heatmap data: ${cells.length} cells for ${daysBack} days`);
  };

  const getTrustColor = (trust: number, entryCount: number): string => {
    if (entryCount === 0) return 'bg-slate-700'; // No data
    
    if (trust >= 80) return 'bg-green-500';
    if (trust >= 70) return 'bg-green-400';
    if (trust >= 60) return 'bg-yellow-400';
    if (trust >= 50) return 'bg-yellow-500';
    if (trust >= 40) return 'bg-orange-400';
    if (trust >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getVolatilityColor = (volatility: number, entryCount: number): string => {
    if (entryCount === 0) return 'bg-slate-700'; // No data
    
    if (volatility <= 5) return 'bg-green-500';
    if (volatility <= 10) return 'bg-green-400';
    if (volatility <= 15) return 'bg-yellow-400';
    if (volatility <= 20) return 'bg-yellow-500';
    if (volatility <= 25) return 'bg-orange-400';
    if (volatility <= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIntensityOpacity = (entryCount: number): string => {
    if (entryCount === 0) return 'opacity-20';
    if (entryCount <= 2) return 'opacity-40';
    if (entryCount <= 5) return 'opacity-60';
    if (entryCount <= 8) return 'opacity-80';
    return 'opacity-100';
  };

  const handleCellHover = (cell: HeatmapCell, event: React.MouseEvent) => {
    if (heatmapRef.current) {
      const rect = heatmapRef.current.getBoundingClientRect();
      setHoveredCell({
        cell,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDeckDisplayName = (deckId: string): string => {
    const deckNames: Record<string, string> = {
      'wallet_overview': 'Wallet Overview',
      'civic_identity': 'Education Deck',
      'consensus_layer': 'Consensus Layer',
      'civic_memory': 'Civic Identity'
    };
    return deckNames[deckId] || deckId;
  };

  // Calculate grid dimensions
  const maxWeekIndex = Math.max(...heatmapData.map(cell => cell.weekIndex), 0);
  const weekCount = maxWeekIndex + 1;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-600 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Sentiment Replay Heatmap
          </h2>
          <p className="text-slate-300 text-sm">
            Interactive intensity visualization of civic trust and volatility over time
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Deck Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-300 text-sm">Deck:</label>
          <select
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
            className="bg-slate-700 text-white rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Decks</option>
            <option value="wallet_overview">Wallet Overview</option>
            <option value="civic_identity">Education Deck</option>
            <option value="consensus_layer">Consensus Layer</option>
            <option value="civic_memory">Civic Identity</option>
          </select>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-2">
          <label className="text-slate-300 text-sm">Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="bg-slate-700 text-white rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-2">
          <label className="text-slate-300 text-sm">View:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'trust' | 'volatility')}
            className="bg-slate-700 text-white rounded-md px-3 py-1 text-sm"
          >
            <option value="trust">Trust Level</option>
            <option value="volatility">Volatility</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm">
            {viewMode === 'trust' ? 'Trust Level' : 'Volatility Level'}
          </span>
          <span className="text-slate-300 text-sm">Activity Intensity</span>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Color scale */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Low</span>
            {viewMode === 'trust' ? (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              </>
            )}
            <span className="text-xs text-slate-400">High</span>
          </div>

          {/* Activity scale */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">None</span>
            <div className="w-3 h-3 bg-slate-500 opacity-20 rounded-sm"></div>
            <div className="w-3 h-3 bg-slate-500 opacity-40 rounded-sm"></div>
            <div className="w-3 h-3 bg-slate-500 opacity-60 rounded-sm"></div>
            <div className="w-3 h-3 bg-slate-500 opacity-80 rounded-sm"></div>
            <div className="w-3 h-3 bg-slate-500 opacity-100 rounded-sm"></div>
            <span className="text-xs text-slate-400">High</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div 
        ref={heatmapRef}
        className="relative overflow-x-auto"
        style={{ minHeight: '200px' }}
      >
        <div 
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${weekCount}, 1fr)`,
            gridTemplateRows: 'repeat(7, 1fr)',
            minWidth: `${weekCount * 20}px`
          }}
        >
          {/* Day labels */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div
              key={`day-${index}`}
              className="text-xs text-slate-400 flex items-center justify-center"
              style={{
                gridColumn: 1,
                gridRow: index + 1
              }}
            >
              {day}
            </div>
          ))}

          {/* Heatmap cells */}
          {heatmapData.map((cell, index) => (
            <div
              key={index}
              className={`
                w-4 h-4 rounded-sm cursor-pointer transition-transform hover:scale-110
                ${viewMode === 'trust' 
                  ? getTrustColor(cell.trust, cell.entryCount)
                  : getVolatilityColor(cell.volatility, cell.entryCount)
                }
                ${getIntensityOpacity(cell.entryCount)}
              `}
              style={{
                gridColumn: cell.weekIndex + 2, // +2 to account for day labels
                gridRow: cell.dayOfWeek + 1
              }}
              onMouseEnter={(e) => handleCellHover(cell, e)}
              onMouseLeave={handleCellLeave}
              title={`${formatDate(cell.date)}: ${viewMode === 'trust' ? 'Trust' : 'Volatility'}: ${
                viewMode === 'trust' ? cell.trust.toFixed(1) : cell.volatility.toFixed(1)
              }%`}
            />
          ))}
        </div>

        {/* Hover Tooltip */}
        {hoveredCell && (
          <div
            className="absolute z-10 bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-lg pointer-events-none"
            style={{
              left: hoveredCell.x + 10,
              top: hoveredCell.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="text-white font-medium mb-1">
              🕒 {formatDate(hoveredCell.cell.date)}
            </div>
            <div className="text-slate-300 text-sm space-y-1">
              <div>Trust: {hoveredCell.cell.trust.toFixed(1)}%</div>
              <div>Volatility: {hoveredCell.cell.volatility.toFixed(1)}%</div>
              <div>Entries: {hoveredCell.cell.entryCount}</div>
              {hoveredCell.cell.entryCount > 0 && (
                <div className="text-xs text-slate-400 mt-2">
                  Click to explore entries
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Days with Data</div>
          <div className="text-white font-bold">
            {heatmapData.filter(cell => cell.entryCount > 0).length}
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Avg Trust</div>
          <div className="text-white font-bold">
            {heatmapData.filter(cell => cell.entryCount > 0)
              .reduce((sum, cell) => sum + cell.trust, 0) / 
              Math.max(heatmapData.filter(cell => cell.entryCount > 0).length, 1)
            }%
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Avg Volatility</div>
          <div className="text-white font-bold">
            {heatmapData.filter(cell => cell.entryCount > 0)
              .reduce((sum, cell) => sum + cell.volatility, 0) / 
              Math.max(heatmapData.filter(cell => cell.entryCount > 0).length, 1)
            }%
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Total Entries</div>
          <div className="text-white font-bold">
            {heatmapData.reduce((sum, cell) => sum + cell.entryCount, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentReplayHeatmap;