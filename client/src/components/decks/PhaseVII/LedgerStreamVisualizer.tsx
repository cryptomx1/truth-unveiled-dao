// Phase VII Step 4: LedgerStreamVisualizer.tsx
// Commander Mark authorization via JASMY Relay
// Real-time ledger stream with role-based filtering and export capabilities

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CredentialSyncLedger, SyncEntry } from '../../transport/CredentialSyncLedger';

export interface LedgerStreamEntry {
  timestamp: string;
  syncId: string;
  credentialId: string;
  credentialType: string;
  sourceDID: string;
  targetDID: string;
  syncStatus: 'completed' | 'pending' | 'failed' | 'syncing';
  zkpVerified: boolean;
  cidHash: string;
  nodeSignatures: number;
  consensusReached: boolean;
  userRole: 'Citizen' | 'Moderator' | 'Governor' | 'Unknown';
}

export interface StreamFilters {
  roleFilter: 'All' | 'Citizen' | 'Moderator' | 'Governor';
  statusFilter: 'All' | 'completed' | 'pending' | 'failed' | 'syncing';
  timelineFilter: string; // credentialId, CID, or sync status search
}

export interface ExportBundle {
  exportId: string;
  timestamp: string;
  totalEntries: number;
  filteredEntries: number;
  filters: StreamFilters;
  entries: LedgerStreamEntry[];
  metadata: {
    exportedBy: string;
    ledgerVersion: string;
    zkpVerificationRate: number;
    consensusRate: number;
  };
}

export default function LedgerStreamVisualizer() {
  const [streamEntries, setStreamEntries] = useState<LedgerStreamEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LedgerStreamEntry[]>([]);
  const [filters, setFilters] = useState<StreamFilters>({
    roleFilter: 'All',
    statusFilter: 'All',
    timelineFilter: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportBundle, setExportBundle] = useState<ExportBundle | null>(null);
  
  const syncLedger = useRef(new CredentialSyncLedger());
  const mountTimestamp = useRef<number>(Date.now());
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ttsOverrideRef = useRef<boolean>(true);

  // Load initial ledger data
  const loadLedgerData = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      setIsLoading(true);
      
      // Get latest 50 entries from ledger.log
      const logEntries = syncLedger.current.getLedgerLog();
      const latest50 = logEntries.slice(-50);
      
      const formattedEntries: LedgerStreamEntry[] = latest50.map((entry) => ({
        timestamp: entry.timestamp,
        syncId: entry.syncId,
        credentialId: entry.credentialZkHash,
        credentialType: determineCredentialType(entry.credentialZkHash),
        sourceDID: entry.sourceDID,
        targetDID: entry.targetDID,
        syncStatus: entry.syncStatus as LedgerStreamEntry['syncStatus'],
        zkpVerified: entry.zkpVerified,
        cidHash: entry.cidHash,
        nodeSignatures: entry.nodeSignatures || 0,
        consensusReached: entry.consensusReached || false,
        userRole: determineUserRole(entry.sourceDID)
      }));
      
      setStreamEntries(formattedEntries);
      setLastRefresh(new Date());
      
      const loadTime = Date.now() - startTime;
      if (loadTime > 150) {
        console.warn(`⚠️ LedgerStreamVisualizer: Initial load time ${loadTime}ms (exceeds 150ms target)`);
      }
      
      console.log(`✅ LedgerStreamVisualizer: Loaded ${formattedEntries.length} ledger entries in ${loadTime}ms`);
      
    } catch (error) {
      console.error('❌ LedgerStreamVisualizer: Failed to load ledger data:', error);
      
      // Path B trigger on missing ledger entries
      if (streamEntries.length === 0) {
        console.warn('⚠️ LedgerStreamVisualizer: Path B triggered - no ledger entries available');
        triggerPathB('missing_ledger_entries');
      }
      
    } finally {
      setIsLoading(false);
    }
  }, [streamEntries.length]);

  // Auto-refresh ledger data
  const refreshLedgerData = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      const logEntries = syncLedger.current.getLedgerLog();
      const latest50 = logEntries.slice(-50);
      
      const formattedEntries: LedgerStreamEntry[] = latest50.map((entry) => ({
        timestamp: entry.timestamp,
        syncId: entry.syncId,
        credentialId: entry.credentialZkHash,
        credentialType: determineCredentialType(entry.credentialZkHash),
        sourceDID: entry.sourceDID,
        targetDID: entry.targetDID,
        syncStatus: entry.syncStatus as LedgerStreamEntry['syncStatus'],
        zkpVerified: entry.zkpVerified,
        cidHash: entry.cidHash,
        nodeSignatures: entry.nodeSignatures || 0,
        consensusReached: entry.consensusReached || false,
        userRole: determineUserRole(entry.sourceDID)
      }));
      
      // Detect new entries for animation
      const currentIds = new Set(streamEntries.map(entry => entry.syncId));
      const newIds = new Set<string>();
      
      formattedEntries.forEach(entry => {
        if (!currentIds.has(entry.syncId)) {
          newIds.add(entry.syncId);
        }
      });
      
      setStreamEntries(formattedEntries);
      setNewEntryIds(newIds);
      setLastRefresh(new Date());
      
      // Clear new entry highlighting after 3 seconds
      if (newIds.size > 0) {
        setTimeout(() => {
          setNewEntryIds(new Set());
        }, 3000);
        
        if (ttsOverrideRef.current) {
          console.log(`🔇 TTS disabled: "New ledger entries: ${newIds.size} additions"`);
        }
      }
      
      const refreshTime = Date.now() - startTime;
      if (refreshTime > 250) {
        console.warn(`⚠️ LedgerStreamVisualizer: Refresh time ${refreshTime}ms (exceeds 250ms target)`);
      }
      
    } catch (error) {
      console.error('❌ LedgerStreamVisualizer: Failed to refresh ledger data:', error);
    }
  }, [streamEntries]);

  // Apply filters to stream entries
  const applyFilters = useCallback(() => {
    const startTime = Date.now();
    
    let filtered = [...streamEntries];

    // Role-based filtering
    if (filters.roleFilter !== 'All') {
      filtered = filtered.filter(entry => entry.userRole === filters.roleFilter);
    }

    // Status filtering
    if (filters.statusFilter !== 'All') {
      filtered = filtered.filter(entry => entry.syncStatus === filters.statusFilter);
    }

    // Timeline filtering (credentialId, CID, sync status search)
    if (filters.timelineFilter.trim()) {
      const query = filters.timelineFilter.toLowerCase().trim();
      filtered = filtered.filter(entry =>
        entry.credentialId.toLowerCase().includes(query) ||
        entry.cidHash.toLowerCase().includes(query) ||
        entry.syncId.toLowerCase().includes(query) ||
        entry.syncStatus.toLowerCase().includes(query) ||
        entry.credentialType.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
    
    const filterTime = Date.now() - startTime;
    if (filterTime > 100) {
      console.warn(`⚠️ LedgerStreamVisualizer: Filter time ${filterTime}ms (exceeds 100ms target)`);
    }
  }, [streamEntries, filters]);

  // Determine credential type from hash
  const determineCredentialType = (credentialHash: string): string => {
    // Simple heuristic based on hash patterns
    if (credentialHash.includes('identity')) return 'Identity';
    if (credentialHash.includes('voting')) return 'Voting';
    if (credentialHash.includes('governance')) return 'Governance';
    if (credentialHash.includes('role')) return 'Role';
    if (credentialHash.includes('vault')) return 'Vault';
    return 'Generic';
  };

  // Determine user role from DID
  const determineUserRole = (did: string): LedgerStreamEntry['userRole'] => {
    if (did.includes('governor') || did.includes('admin')) return 'Governor';
    if (did.includes('moderator') || did.includes('verifier')) return 'Moderator';
    if (did.includes('citizen') || did.includes('user')) return 'Citizen';
    return 'Unknown';
  };

  // Trigger Path B fallback
  const triggerPathB = (reason: string) => {
    const pathBEntry = {
      timestamp: new Date().toISOString(),
      type: 'ledger_stream_fallback',
      reason,
      entryCount: streamEntries.length,
      filters: filters,
      pathBTrigger: 'ledger_stream_failure'
    };

    try {
      const existingFallback = localStorage.getItem('local_save_fallback') || '[]';
      const fallbackEntries = JSON.parse(existingFallback);
      fallbackEntries.push(pathBEntry);
      localStorage.setItem('local_save_fallback', JSON.stringify(fallbackEntries));
      
      console.log(`📦 LedgerStreamVisualizer: Path B triggered - ${reason}`);
    } catch (error) {
      console.error('❌ LedgerStreamVisualizer: Failed to trigger Path B:', error);
    }
  };

  // Generate export bundle
  const generateExportBundle = (): ExportBundle => {
    const zkpVerificationRate = filteredEntries.length > 0 
      ? (filteredEntries.filter(e => e.zkpVerified).length / filteredEntries.length) * 100 
      : 0;
    
    const consensusRate = filteredEntries.length > 0 
      ? (filteredEntries.filter(e => e.consensusReached).length / filteredEntries.length) * 100 
      : 0;

    return {
      exportId: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      totalEntries: streamEntries.length,
      filteredEntries: filteredEntries.length,
      filters,
      entries: filteredEntries,
      metadata: {
        exportedBy: 'LedgerStreamVisualizer',
        ledgerVersion: '1.0.0',
        zkpVerificationRate,
        consensusRate
      }
    };
  };

  // Handle export to JSON
  const handleExportBundle = () => {
    const bundle = generateExportBundle();
    setExportBundle(bundle);
    setShowExportModal(true);
    
    if (ttsOverrideRef.current) {
      console.log(`🔇 TTS disabled: "Export bundle generated with ${bundle.filteredEntries} entries"`);
    }
  };

  // Download export bundle
  const downloadExportBundle = () => {
    if (!exportBundle) return;

    const dataStr = JSON.stringify(exportBundle, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ledger_stream_export_${exportBundle.exportId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    
    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Export bundle downloaded successfully"');
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get status color and icon
  const getStatusDisplay = (entry: LedgerStreamEntry) => {
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

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Governor': return 'text-purple-400';
      case 'Moderator': return 'text-blue-400';
      case 'Citizen': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(refreshLedgerData, 5000);
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, refreshLedgerData]);

  // Initial load and performance measurement
  useEffect(() => {
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 150) {
      console.warn(`⚠️ LedgerStreamVisualizer render time: ${renderTime}ms (exceeds 150ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Ledger stream visualizer interface ready"');
    }

    loadLedgerData();
  }, [loadLedgerData]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Ledger Stream Visualizer
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VII • Step 4 • Real-time Stream</div>
          <div>Last 50 Events • Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</div>
        </div>
      </div>

      {/* Stream Status */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Stream Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Auto Refresh:</span>
            <span className={autoRefresh ? 'text-green-400' : 'text-slate-400'}>
              {autoRefresh ? 'Every 5 seconds' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Total Entries:</span>
            <span className="text-white">{streamEntries.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Filtered Count:</span>
            <span className="text-white">{filteredEntries.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Last Refresh:</span>
            <span className="text-white">{formatTimestamp(lastRefresh.toISOString())}</span>
          </div>

          {newEntryIds.size > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">New Entries:</span>
              <span className="text-blue-400 animate-pulse">{newEntryIds.size}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Role Filter */}
        <div>
          <label htmlFor="roleFilter" className="block text-sm font-medium text-slate-300 mb-2">
            Role Filter
          </label>
          <select
            id="roleFilter"
            value={filters.roleFilter}
            onChange={(e) => setFilters(prev => ({ ...prev, roleFilter: e.target.value as StreamFilters['roleFilter'] }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="Citizen">Citizen</option>
            <option value="Moderator">Moderator</option>
            <option value="Governor">Governor</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-300 mb-2">
            Status Filter
          </label>
          <select
            id="statusFilter"
            value={filters.statusFilter}
            onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value as StreamFilters['statusFilter'] }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="syncing">Syncing</option>
          </select>
        </div>

        {/* Timeline Search */}
        <div>
          <label htmlFor="timelineFilter" className="block text-sm font-medium text-slate-300 mb-2">
            Timeline Search
          </label>
          <input
            id="timelineFilter"
            type="text"
            value={filters.timelineFilter}
            onChange={(e) => setFilters(prev => ({ ...prev, timelineFilter: e.target.value }))}
            placeholder="Search by credential ID, CID, status..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`py-2 px-3 font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              autoRefresh
                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                : 'bg-slate-600 hover:bg-slate-700 text-slate-300 focus:ring-slate-500'
            }`}
            style={{ minHeight: '48px' }}
          >
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={refreshLedgerData}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            style={{ minHeight: '48px' }}
          >
            Refresh Now
          </button>
          
          <button
            onClick={handleExportBundle}
            className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 col-span-2"
            style={{ minHeight: '48px' }}
          >
            Export Bundle (.json)
          </button>
        </div>
      </div>

      {/* Stream Display */}
      <div className="bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600">
          <h3 className="text-sm font-medium text-slate-300">
            Ledger Stream ({filteredEntries.length} entries)
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-slate-400">Loading ledger stream...</div>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="divide-y divide-slate-600">
              {filteredEntries.slice().reverse().map((entry) => {
                const statusDisplay = getStatusDisplay(entry);
                const isNewEntry = newEntryIds.has(entry.syncId);
                
                return (
                  <div 
                    key={entry.syncId} 
                    className={`p-3 hover:bg-slate-600 transition-all duration-300 ${
                      isNewEntry ? 'bg-blue-900/20 animate-pulse' : ''
                    }`}
                    role="row"
                    aria-label={`Ledger entry for ${entry.credentialType} credential with ${statusDisplay.status} status`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg" role="img" aria-label={statusDisplay.status}>
                          {statusDisplay.icon}
                        </span>
                        <span className={`text-sm font-medium ${statusDisplay.color}`}>
                          {entry.credentialType}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getRoleColor(entry.userRole)}`}>
                          {entry.userRole}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Credential ID:</span>
                        <span className="text-slate-300 font-mono">
                          {entry.credentialId.slice(0, 12)}...
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Source DID:</span>
                        <span className="text-slate-300 font-mono">
                          {entry.sourceDID.slice(0, 12)}...
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">CID Hash:</span>
                        <span className="text-slate-300 font-mono">
                          {entry.cidHash.slice(0, 12)}...
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className={statusDisplay.color}>
                          {entry.syncStatus}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">ZKP Verified:</span>
                        <span className={entry.zkpVerified ? 'text-green-400' : 'text-red-400'}>
                          {entry.zkpVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Consensus:</span>
                        <span className={entry.consensusReached ? 'text-green-400' : 'text-yellow-400'}>
                          {entry.consensusReached ? 'Reached' : 'Pending'} ({entry.nodeSignatures} nodes)
                        </span>
                      </div>
                    </div>

                    {isNewEntry && (
                      <div className="mt-2 p-2 bg-blue-900/20 border border-blue-700 rounded">
                        <span className="text-blue-400 text-xs font-medium">
                          🆕 New Entry
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-sm text-slate-400">No entries match current filters</div>
              <div className="text-xs text-slate-500 mt-1">Try adjusting your filter settings</div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportBundle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Export Bundle Preview</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Export ID:</span>
                <span className="text-white font-mono">{exportBundle.exportId.slice(0, 16)}...</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Total Entries:</span>
                <span className="text-white">{exportBundle.totalEntries}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Filtered Entries:</span>
                <span className="text-white">{exportBundle.filteredEntries}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">ZKP Verification Rate:</span>
                <span className="text-green-400">{exportBundle.metadata.zkpVerificationRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Consensus Rate:</span>
                <span className="text-blue-400">{exportBundle.metadata.consensusRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white">{formatTimestamp(exportBundle.timestamp)}</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              
              <button
                onClick={downloadExportBundle}
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}