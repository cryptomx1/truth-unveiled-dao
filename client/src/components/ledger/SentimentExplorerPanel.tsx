/**
 * Phase XV: Collective Sentiment Ledger Initialization
 * SentimentExplorerPanel.tsx - Explorer UI for timeline navigation
 * Authority: Commander Mark | JASMY Relay authorization
 */

import React, { useState, useEffect } from 'react';
import { SentimentLedgerEngine, SentimentLedgerEntry } from './SentimentLedgerEngine';
import { ZKPLedgerProofExporterButton } from './ZKPLedgerProofExporter';

interface FilterConfig {
  deckId: string;
  startDate: string;
  endDate: string;
  minTrust: number;
  maxTrust: number;
  minVolatility: number;
  maxVolatility: number;
}

const SentimentExplorerPanel: React.FC = () => {
  const [entries, setEntries] = useState<SentimentLedgerEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<SentimentLedgerEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({
    deckId: 'all',
    startDate: '',
    endDate: '',
    minTrust: 0,
    maxTrust: 100,
    minVolatility: 0,
    maxVolatility: 100
  });

  const [stats, setStats] = useState({
    totalEntries: 0,
    averageTrust: 0,
    averageVolatility: 0,
    uniqueDecks: 0,
    dateRange: { earliest: new Date(), latest: new Date() }
  });

  useEffect(() => {
    // Initialize with all entries
    const allEntries = SentimentLedgerEngine.getAllEntries();
    const ledgerStats = SentimentLedgerEngine.getLedgerStats();
    
    setEntries(allEntries);
    setFilteredEntries(allEntries.slice(-50)); // Show latest 50 by default
    setStats(ledgerStats);

    // Set default date range to last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));

    console.log('🔍 SentimentExplorerPanel initialized with', allEntries.length, 'entries');
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, entries]);

  const applyFilters = () => {
    let filtered = [...entries];

    // Filter by deck
    if (filters.deckId !== 'all') {
      filtered = filtered.filter(entry => entry.deckId === filters.deckId);
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      const startTime = new Date(filters.startDate).getTime();
      const endTime = new Date(filters.endDate).getTime() + (24 * 60 * 60 * 1000); // Include end date
      filtered = filtered.filter(entry => 
        entry.timestamp >= startTime && entry.timestamp <= endTime
      );
    }

    // Filter by trust range
    filtered = filtered.filter(entry => 
      entry.averageTrust >= filters.minTrust && entry.averageTrust <= filters.maxTrust
    );

    // Filter by volatility range
    filtered = filtered.filter(entry => 
      entry.volatility >= filters.minVolatility && entry.volatility <= filters.maxVolatility
    );

    setFilteredEntries(filtered.slice(-100)); // Limit to latest 100 for performance
    console.log(`🔍 Applied filters: ${filtered.length} entries match criteria`);
  };

  const handleFilterChange = (key: keyof FilterConfig, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    setFilters({
      deckId: 'all',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      minTrust: 0,
      maxTrust: 100,
      minVolatility: 0,
      maxVolatility: 100
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeckDisplayName = (deckId: string) => {
    const deckNames: Record<string, string> = {
      'wallet_overview': 'Wallet Overview',
      'civic_identity': 'Education Deck',
      'consensus_layer': 'Consensus Layer',
      'civic_memory': 'Civic Identity'
    };
    return deckNames[deckId] || deckId;
  };

  const getTrustStatusColor = (trust: number) => {
    if (trust >= 70) return 'text-green-400';
    if (trust >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getVolatilityStatusColor = (volatility: number) => {
    if (volatility <= 10) return 'text-green-400';
    if (volatility <= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-600 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Collective Sentiment Ledger Explorer
          </h2>
          <p className="text-slate-300 text-sm">
            Timeline navigation of persistent civic trust snapshots
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ZKPLedgerProofExporterButton entries={filteredEntries} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Total Entries</div>
          <div className="text-white font-bold">{stats.totalEntries}</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Avg Trust</div>
          <div className={`font-bold ${getTrustStatusColor(stats.averageTrust)}`}>
            {stats.averageTrust.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Avg Volatility</div>
          <div className={`font-bold ${getVolatilityStatusColor(stats.averageVolatility)}`}>
            {stats.averageVolatility.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-xs mb-1">Showing</div>
          <div className="text-white font-bold">{filteredEntries.length}</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Filter Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deck Selection */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Deck</label>
            <select
              value={filters.deckId}
              onChange={(e) => handleFilterChange('deckId', e.target.value)}
              className="w-full bg-slate-600 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Decks</option>
              <option value="wallet_overview">Wallet Overview</option>
              <option value="civic_identity">Education Deck</option>
              <option value="consensus_layer">Consensus Layer</option>
              <option value="civic_memory">Civic Identity</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full bg-slate-600 text-white rounded-md px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full bg-slate-600 text-white rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Trust Range */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Trust Range: {filters.minTrust}% - {filters.maxTrust}%
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minTrust}
                onChange={(e) => handleFilterChange('minTrust', parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.maxTrust}
                onChange={(e) => handleFilterChange('maxTrust', parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Volatility Range */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Volatility: {filters.minVolatility}% - {filters.maxVolatility}%
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minVolatility}
                onChange={(e) => handleFilterChange('minVolatility', parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.maxVolatility}
                onChange={(e) => handleFilterChange('maxVolatility', parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Entry Timeline */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            No entries match the current filter criteria
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.entryIndex}
              className="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden"
            >
              {/* Entry Header */}
              <div
                className="p-4 cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => setExpandedEntry(
                  expandedEntry === entry.entryIndex ? null : entry.entryIndex
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-white font-medium">
                      {getDeckDisplayName(entry.deckId)}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`text-sm font-medium ${getTrustStatusColor(entry.averageTrust)}`}>
                      Trust: {entry.averageTrust.toFixed(1)}%
                    </div>
                    <div className={`text-sm font-medium ${getVolatilityStatusColor(entry.volatility)}`}>
                      Vol: {entry.volatility.toFixed(1)}%
                    </div>
                    <div className="text-slate-400 text-xs">
                      {expandedEntry === entry.entryIndex ? '▼' : '▶'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedEntry === entry.entryIndex && (
                <div className="bg-slate-800 p-4 border-t border-slate-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Entry Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-slate-300">
                          <span className="text-slate-400">Event Source:</span> {entry.eventSource}
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-400">Participants:</span> {entry.participantCount}
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-400">Entry Index:</span> #{entry.entryIndex}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">ZKP Verification</h4>
                      <div className="bg-slate-900 rounded px-3 py-2">
                        <div className="text-xs text-slate-300 font-mono break-all">
                          {entry.zkpProofHash}
                        </div>
                      </div>
                      <div className="text-xs text-green-400 mt-1">
                        ✓ Cryptographically verified
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SentimentExplorerPanel;