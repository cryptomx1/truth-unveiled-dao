// Phase VII Step 2: LedgerStreamVisualizer.tsx
// Commander Mark authorization via JASMY Relay
// Interactive stream viewer for real-time DID-based credential syncs

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CredentialSyncLedger } from '../transport/CredentialSyncLedger';

interface LedgerEntry {
  timestamp: string;
  syncId: string;
  credentialZkHash: string;
  sourceDID: string;
  targetDID: string;
  syncType: 'upload' | 'download' | 'verify' | 'consensus';
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed';
  consensusReached: boolean;
  nodesParticipated: number;
  zkpVerified: boolean;
  cidHash?: string;
  nodeSignatures: number;
}

interface FilterState {
  credentialState: 'all' | 'minted' | 'revoked' | 'expired';
  searchQuery: string;
}

export default function LedgerStreamVisualizer() {
  const [syncLedger] = useState(() => new CredentialSyncLedger());
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    credentialState: 'all',
    searchQuery: ''
  });
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  
  const mountTimestamp = useRef<number>(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load ledger data on mount and setup auto-refresh
  useEffect(() => {
    // Performance measurement
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 125) {
      console.warn(`⚠️ LedgerStreamVisualizer render time: ${renderTime}ms (exceeds 125ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Ledger stream visualizer interface ready"');
    }

    // Initial data load
    loadLedgerData();

    // Setup auto-refresh
    if (isAutoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        refreshLedgerData();
      }, 2000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isAutoRefresh]);

  // Filter entries when filters change
  useEffect(() => {
    applyFilters();
  }, [ledgerEntries, filters]);

  // Load ledger data from CredentialSyncLedger
  const loadLedgerData = useCallback(() => {
    const startTime = Date.now();
    
    try {
      const logEntries = syncLedger.getLedgerLog();
      const formattedEntries: LedgerEntry[] = logEntries.map(entry => ({
        timestamp: entry.timestamp,
        syncId: entry.syncId,
        credentialZkHash: entry.credentialZkHash,
        sourceDID: entry.sourceDID,
        targetDID: entry.targetDID,
        syncType: entry.syncType,
        syncStatus: entry.syncStatus,
        consensusReached: entry.consensusReached,
        nodesParticipated: entry.nodesParticipated,
        zkpVerified: entry.zkpVerified,
        cidHash: entry.cidHash,
        nodeSignatures: entry.nodeSignatures
      }));

      // Sort by timestamp (most recent first)
      formattedEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLedgerEntries(formattedEntries);
      setLastRefresh(new Date());

      const loadTime = Date.now() - startTime;
      if (loadTime > 300) {
        console.warn(`⚠️ LedgerStreamVisualizer: Load time ${loadTime}ms (exceeds 300ms target)`);
      }

      console.log(`✅ LedgerStreamVisualizer: Loaded ${formattedEntries.length} ledger entries`);

    } catch (error) {
      console.error('❌ LedgerStreamVisualizer: Failed to load ledger data:', error);
    }
  }, [syncLedger]);

  // Refresh ledger data and detect new entries
  const refreshLedgerData = useCallback(() => {
    const startTime = Date.now();
    
    try {
      const logEntries = syncLedger.getLedgerLog();
      const formattedEntries: LedgerEntry[] = logEntries.map(entry => ({
        timestamp: entry.timestamp,
        syncId: entry.syncId,
        credentialZkHash: entry.credentialZkHash,
        sourceDID: entry.sourceDID,
        targetDID: entry.targetDID,
        syncType: entry.syncType,
        syncStatus: entry.syncStatus,
        consensusReached: entry.consensusReached,
        nodesParticipated: entry.nodesParticipated,
        zkpVerified: entry.zkpVerified,
        cidHash: entry.cidHash,
        nodeSignatures: entry.nodeSignatures
      }));

      // Sort by timestamp (most recent first)
      formattedEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Detect new entries
      const currentIds = new Set(ledgerEntries.map(entry => entry.syncId));
      const newIds = new Set<string>();
      
      formattedEntries.forEach(entry => {
        if (!currentIds.has(entry.syncId)) {
          newIds.add(entry.syncId);
          
          // ARIA announcement for new sync (TTS blocked)
          if (ttsOverrideRef.current) {
            console.log(`🔇 TTS disabled: "New sync: ${entry.credentialZkHash.slice(0, 8)} at ${new Date(entry.timestamp).toLocaleTimeString()}"`);
          }
        }
      });

      setLedgerEntries(formattedEntries);
      setNewEntryIds(newIds);
      setLastRefresh(new Date());

      // Clear new entry highlights after animation
      if (newIds.size > 0) {
        setTimeout(() => {
          setNewEntryIds(new Set());
        }, 1000);
      }

      const refreshTime = Date.now() - startTime;
      if (refreshTime > 300) {
        console.warn(`⚠️ LedgerStreamVisualizer: Refresh time ${refreshTime}ms (exceeds 300ms target)`);
      }

    } catch (error) {
      console.error('❌ LedgerStreamVisualizer: Failed to refresh ledger data:', error);
    }
  }, [syncLedger, ledgerEntries]);

  // Apply filters to ledger entries
  const applyFilters = useCallback(() => {
    let filtered = [...ledgerEntries];

    // Filter by credential state
    if (filters.credentialState !== 'all') {
      filtered = filtered.filter(entry => {
        switch (filters.credentialState) {
          case 'minted':
            return entry.zkpVerified && entry.syncStatus === 'completed';
          case 'revoked':
            return entry.syncStatus === 'failed';
          case 'expired':
            // Simulate expired credentials (older than 1 hour for demo)
            const entryTime = new Date(entry.timestamp).getTime();
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            return entryTime < oneHourAgo;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(entry => 
        entry.sourceDID.toLowerCase().includes(query) ||
        entry.targetDID.toLowerCase().includes(query) ||
        entry.credentialZkHash.toLowerCase().includes(query) ||
        entry.syncId.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
  }, [ledgerEntries, filters]);

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: value }));
    }, 250);
  };

  // Manual sync now
  const handleSyncNow = () => {
    refreshLedgerData();
    
    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Ledger data refreshed"');
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefresh(prev => {
      const newValue = !prev;
      
      if (newValue) {
        refreshIntervalRef.current = setInterval(() => {
          refreshLedgerData();
        }, 2000);
      } else {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      }
      
      return newValue;
    });
  };

  // Get status icon and color
  const getStatusDisplay = (entry: LedgerEntry) => {
    if (entry.syncStatus === 'completed' && entry.consensusReached) {
      return { icon: '🟢', color: 'text-green-400', status: 'Success' };
    } else if (entry.syncStatus === 'failed') {
      return { icon: '🔴', color: 'text-red-400', status: 'Failed' };
    } else if (entry.syncStatus === 'pending' || entry.syncStatus === 'syncing') {
      return { icon: '🟡', color: 'text-yellow-400', status: 'Pending' };
    } else {
      return { icon: '⚪', color: 'text-slate-400', status: 'Unknown' };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Format DID for display
  const formatDID = (did: string): string => {
    if (did.length > 20) {
      return `${did.slice(0, 8)}...${did.slice(-8)}`;
    }
    return did;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Ledger Stream Visualizer
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VII • Step 2 • Real-time DID Sync Stream</div>
          <div>{filteredEntries.length} of {ledgerEntries.length} entries shown</div>
          <div className="text-xs text-slate-500">
            Last refresh: {formatTimestamp(lastRefresh.toISOString())}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 space-y-3">
        {/* Filter Controls */}
        <div className="space-y-2">
          <label htmlFor="credential-state" className="block text-sm font-medium text-slate-300">
            Credential State
          </label>
          <select
            id="credential-state"
            value={filters.credentialState}
            onChange={(e) => setFilters(prev => ({ ...prev, credentialState: e.target.value as FilterState['credentialState'] }))}
            className="w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            style={{ minHeight: '48px' }}
          >
            <option value="all">All States</option>
            <option value="minted">Minted (Completed)</option>
            <option value="revoked">Revoked (Failed)</option>
            <option value="expired">Expired (&gt;1hr old)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <label htmlFor="search-query" className="block text-sm font-medium text-slate-300">
            Search DID or Credential ID
          </label>
          <input
            id="search-query"
            type="text"
            placeholder="Search by DID, credential ID, or sync ID..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Refresh Controls */}
        <div className="flex space-x-2">
          <button
            onClick={toggleAutoRefresh}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              isAutoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
            }`}
            style={{ minHeight: '48px' }}
          >
            Auto Refresh {isAutoRefresh ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={handleSyncNow}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            style={{ minHeight: '48px' }}
          >
            Sync Now
          </button>
        </div>
      </div>

      {/* Ledger Stream Table */}
      <div className="bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600">
          <h3 className="text-sm font-medium text-slate-300">
            Real-time Sync Stream
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              {ledgerEntries.length === 0 ? (
                'No ledger entries found. Run credential sync tests to populate data.'
              ) : (
                'No entries match current filters.'
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-600">
              {filteredEntries.map((entry) => {
                const statusDisplay = getStatusDisplay(entry);
                const isNewEntry = newEntryIds.has(entry.syncId);
                
                return (
                  <div
                    key={entry.syncId}
                    className={`p-3 transition-all duration-300 ${
                      isNewEntry ? 'animate-pulse bg-slate-600' : 'hover:bg-slate-600'
                    }`}
                    role="row"
                    aria-label={`Sync entry ${entry.credentialZkHash.slice(0, 8)} at ${formatTimestamp(entry.timestamp)}`}
                  >
                    {/* Status and Basic Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg" role="img" aria-label={statusDisplay.status}>
                          {statusDisplay.icon}
                        </span>
                        <span className={`text-sm font-medium ${statusDisplay.color}`}>
                          {statusDisplay.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {entry.syncType}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>

                    {/* Credential and DID Info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Credential:</span>
                        <span className="text-slate-300 font-mono">
                          {entry.credentialZkHash.slice(0, 12)}...
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Source:</span>
                        <span className="text-slate-300 font-mono">
                          {formatDID(entry.sourceDID)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target:</span>
                        <span className="text-slate-300 font-mono">
                          {formatDID(entry.targetDID)}
                        </span>
                      </div>

                      {/* Consensus Info */}
                      {entry.consensusReached && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Consensus:</span>
                          <span className="text-green-400">
                            {entry.nodesParticipated} nodes, {entry.nodeSignatures} sigs
                          </span>
                        </div>
                      )}

                      {/* CID Info */}
                      {entry.cidHash && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">CID:</span>
                          <span className="text-slate-300 font-mono">
                            {entry.cidHash.slice(0, 12)}...
                          </span>
                        </div>
                      )}

                      {/* Path B Indicator */}
                      {entry.syncStatus === 'failed' && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                          <span className="text-red-400 text-xs font-medium">
                            🔴 Path B Fallback - Sync Failed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="mt-4 p-3 bg-slate-900 border border-slate-600 rounded-md">
        <div className="text-sm font-medium text-slate-300 mb-2">Stream Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Auto Refresh:</span>
            <span className={isAutoRefresh ? 'text-green-400' : 'text-slate-400'}>
              {isAutoRefresh ? 'Every 2 seconds' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Total Entries:</span>
            <span className="text-white">{ledgerEntries.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Filtered:</span>
            <span className="text-white">{filteredEntries.length}</span>
          </div>
          
          {newEntryIds.size > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">New Entries:</span>
              <span className="text-blue-400">{newEntryIds.size}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}