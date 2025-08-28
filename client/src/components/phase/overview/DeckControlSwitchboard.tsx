// Phase VIII Step 2: DeckControlSwitchboard.tsx
// GROK Authorization via Commander Mark via JASMY Relay System
// Global deck control interface with override gating and action logging

import React, { useState, useEffect, useRef } from 'react';
import { protocolValidator } from '@/utils/ProtocolValidator';
import { 
  Settings, 
  Filter, 
  Volume2, 
  VolumeX, 
  Download, 
  RefreshCw, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react';

export interface ActionLog {
  action: string;
  timestamp: number;
  did: string;
  phaseHash: string;
  details: string;
}

export interface DeckControlProps {
  currentUserDID?: string;
}

export default function DeckControlSwitchboard({ 
  currentUserDID = 'did:civic:commander_mark_0x7f3e2d1a8c9b5f2e' 
}: DeckControlProps) {
  const [globalOverrideEnabled, setGlobalOverrideEnabled] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<'QA-Locked' | 'Pending' | 'Refactor' | 'All'>('All');
  const [filteredDecks, setFilteredDecks] = useState<any[]>([]);
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncHash, setLastSyncHash] = useState<string>('');
  const [exportData, setExportData] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  
  const mountTimestamp = useRef<number>(Date.now());
  const maxLogEntries = 10;

  // Check if current user has commander privileges
  const hasCommanderAccess = (): boolean => {
    return protocolValidator.toggleOverrideMode(currentUserDID);
  };

  // Log actions with proper formatting
  const logAction = (action: string, details: string) => {
    const phaseHashes = protocolValidator.getPhaseHashes();
    const newEntry: ActionLog = {
      action,
      timestamp: Date.now(),
      did: currentUserDID,
      phaseHash: phaseHashes.phaseVIII || '0x5D1F-8B6A-E9C3-P8',
      details
    };

    setActionLog(prev => {
      const updated = [...prev, newEntry];
      if (updated.length > maxLogEntries) {
        updated.shift();
      }
      return updated;
    });

    console.log(`📋 DeckControlSwitchboard: ${action} - ${details}`);
  };

  // Announce messages (TTS simulation)
  const announce = (message: string) => {
    if (ttsEnabled) {
      console.log(`🔇 TTS disabled: "${message}"`);
    } else {
      console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
    }
  };

  // Toggle global override (Commander only)
  const toggleGlobalOverride = async () => {
    if (!hasCommanderAccess()) {
      announce('Override restricted to Commander role');
      logAction('Override Denied', 'Insufficient permissions - Commander role required');
      return;
    }

    const newState = !globalOverrideEnabled;
    setGlobalOverrideEnabled(newState);
    
    const message = newState ? 'Global override enabled' : 'Global override disabled';
    announce(message);
    logAction('Global Override', `Override ${newState ? 'enabled' : 'disabled'} by Commander`);
  };

  // Toggle TTS state
  const toggleTTS = () => {
    const newState = !ttsEnabled;
    setTtsEnabled(newState);
    
    const message = newState ? 'TTS enabled' : 'TTS disabled';
    announce(message);
    logAction('TTS Toggle', message);
  };

  // Filter decks by status
  const filterDecks = async (filter: 'QA-Locked' | 'Pending' | 'Refactor' | 'All') => {
    setIsLoading(true);
    setCurrentFilter(filter);
    
    try {
      const deckData = protocolValidator.getDeckMetadata();
      let filtered = deckData;

      // Apply filter logic based on GROK specifications
      if (filter !== 'All') {
        filtered = deckData.map(deck => {
          let status = 'Complete';
          
          // Simulate different deck statuses for testing
          if (filter === 'QA-Locked' && [6, 8, 12].includes(deck.id)) {
            status = 'QA-Locked';
          } else if (filter === 'Pending' && [15, 19].includes(deck.id)) {
            status = 'Pending';
          } else if (filter === 'Refactor' && [1, 2].includes(deck.id)) {
            status = 'Refactor';
          }
          
          return { ...deck, status };
        }).filter(deck => deck.status === filter);
      }

      setFilteredDecks(filtered);
      
      if (filtered.length === 0) {
        announce('No decks match filter criteria');
        logAction('Filter Decks', `No results for filter: ${filter}`);
      } else {
        announce(`${filtered.length} decks found for ${filter} filter`);
        logAction('Filter Decks', `Applied filter: ${filter}, found ${filtered.length} decks`);
      }
      
    } catch (error) {
      console.error('❌ DeckControlSwitchboard: Filter error:', error);
      logAction('Filter Error', `Failed to apply filter: ${filter}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger phase sync with ledger
  const triggerPhaseSync = async () => {
    setIsLoading(true);
    
    try {
      // Simulate phase sync with hash generation
      const phaseHashes = protocolValidator.getPhaseHashes();
      const syncHash = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      
      setLastSyncHash(syncHash);
      
      announce('Phase sync completed');
      logAction('Phase Sync', `Ledger synced with hash: ${syncHash}`);
      
      console.log(`🔄 DeckControlSwitchboard: Phase sync completed - ${syncHash}`);
      
    } catch (error) {
      console.error('❌ DeckControlSwitchboard: Sync error:', error);
      logAction('Sync Error', 'Failed to sync with ledger');
    } finally {
      setIsLoading(false);
    }
  };

  // Export last 10 action log entries
  const exportActionLog = async () => {
    const logSnapshot = {
      exportId: `actionlog_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: new Date().toISOString(),
      actions: actionLog.slice(-maxLogEntries),
      totalActions: actionLog.length,
      exportedBy: 'DeckControlSwitchboard',
      phaseHashes: protocolValidator.getPhaseHashes(),
      lastSyncHash,
      globalOverrideEnabled,
      ttsEnabled,
      currentFilter,
      filteredDeckCount: filteredDecks.length
    };

    const exportString = JSON.stringify(logSnapshot, null, 2);
    setExportData(exportString);
    setShowExportModal(true);
    
    announce('Action log exported');
    logAction('Export Log', `Exported ${actionLog.length} action entries`);
  };

  // Download export data
  const downloadExportData = () => {
    if (!exportData) return;

    const dataBlob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `deck_control_log_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    
    announce('Action log downloaded');
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get filter badge color
  const getFilterBadgeColor = (filter: string): string => {
    switch (filter) {
      case 'QA-Locked': return 'bg-red-600 text-red-100';
      case 'Pending': return 'bg-yellow-600 text-yellow-100';
      case 'Refactor': return 'bg-blue-600 text-blue-100';
      default: return 'bg-slate-600 text-slate-100';
    }
  };

  // Initialize component and load initial data
  useEffect(() => {
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 125) {
      console.warn(`⚠️ DeckControlSwitchboard render time: ${renderTime}ms (exceeds 125ms target)`);
    }

    // Nuclear TTS override
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    announce('Deck control switchboard initialized');
    
    // Load initial deck data
    filterDecks('All');
    
    logAction('Component Init', 'DeckControlSwitchboard initialized and ready');
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Deck Control Switchboard
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VIII • Step 2 • Global Control Interface</div>
          <div>Filter: {currentFilter} • Actions: {actionLog.length}</div>
        </div>
      </div>

      {/* Commander Access Panel */}
      {hasCommanderAccess() && (
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-700 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Commander Access
              </span>
            </div>
            <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
              globalOverrideEnabled ? 'bg-green-900 text-green-200' : 'bg-slate-900 text-slate-300'
            }`}>
              {globalOverrideEnabled ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {globalOverrideEnabled ? 'Override Active' : 'Override Inactive'}
            </div>
          </div>
          
          <button
            onClick={toggleGlobalOverride}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              globalOverrideEnabled 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            style={{ minHeight: '48px' }}
            aria-label={`${globalOverrideEnabled ? 'Disable' : 'Enable'} global override`}
          >
            {globalOverrideEnabled ? 'Disable Override' : 'Enable Override'}
          </button>
        </div>
      )}

      {/* Control Panel */}
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Control Panel</h3>
        
        {/* TTS Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2">
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="text-sm text-slate-300">TTS System</span>
          </div>
          <button
            onClick={toggleTTS}
            className={`py-1 px-3 rounded text-xs font-medium transition-colors duration-200 ${
              ttsEnabled ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300'
            }`}
            style={{ minHeight: '32px' }}
            aria-label={`${ttsEnabled ? 'Disable' : 'Enable'} TTS`}
          >
            {ttsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Deck Filter */}
        <div className="p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Deck Filter</span>
            <span className={`text-xs px-2 py-1 rounded ${getFilterBadgeColor(currentFilter)}`}>
              {currentFilter}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {(['All', 'QA-Locked', 'Pending', 'Refactor'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => filterDecks(filter)}
                className={`py-2 px-3 rounded text-xs font-medium transition-colors duration-200 ${
                  currentFilter === filter 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                }`}
                style={{ minHeight: '36px' }}
                disabled={isLoading}
                aria-label={`Filter decks by ${filter}`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-slate-400">
            {isLoading ? 'Filtering...' : `${filteredDecks.length} decks visible`}
          </div>
        </div>

        {/* Phase Sync */}
        <div className="flex items-center justify-between p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-green-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm text-slate-300">Phase Sync</span>
          </div>
          <button
            onClick={triggerPhaseSync}
            className="py-1 px-3 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors duration-200"
            style={{ minHeight: '32px' }}
            disabled={isLoading}
            aria-label="Trigger phase sync"
          >
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Action Log Display */}
      <div className="mb-6 bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">
            Action Log (Last {maxLogEntries})
          </h3>
          <button
            onClick={exportActionLog}
            className="py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
            style={{ minHeight: '32px' }}
            aria-label="Export action log"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
        
        <div className="max-h-48 overflow-y-auto">
          {actionLog.length > 0 ? (
            <div className="divide-y divide-slate-600">
              {actionLog.slice(-maxLogEntries).reverse().map((entry, index) => (
                <div key={index} className="p-3 hover:bg-slate-600 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200">
                      {entry.action}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-1">
                    {entry.details}
                  </div>
                  
                  <div className="text-xs text-slate-500 font-mono">
                    Hash: {entry.phaseHash.slice(0, 16)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-sm text-slate-400">No actions logged yet</div>
              <div className="text-xs text-slate-500 mt-1">Actions will appear here as you use the controls</div>
            </div>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">System Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Commander Access:</span>
            <span className={hasCommanderAccess() ? 'text-green-400' : 'text-slate-400'}>
              {hasCommanderAccess() ? 'Granted' : 'Standard User'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Global Override:</span>
            <span className={globalOverrideEnabled ? 'text-green-400' : 'text-slate-400'}>
              {globalOverrideEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">TTS System:</span>
            <span className={ttsEnabled ? 'text-blue-400' : 'text-slate-400'}>
              {ttsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Current Filter:</span>
            <span className="text-white">{currentFilter}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Visible Decks:</span>
            <span className="text-white">{filteredDecks.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Last Sync:</span>
            <span className="text-white">
              {lastSyncHash ? lastSyncHash.slice(0, 12) + '...' : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Export Action Log</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Actions:</span>
                <span className="text-white">{actionLog.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Export Size:</span>
                <span className="text-white">{Math.ceil(exportData.length / 1024)} KB</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Global Override:</span>
                <span className={globalOverrideEnabled ? 'text-green-400' : 'text-slate-400'}>
                  {globalOverrideEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors duration-200"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </button>
              
              <button
                onClick={downloadExportData}
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                style={{ minHeight: '48px' }}
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