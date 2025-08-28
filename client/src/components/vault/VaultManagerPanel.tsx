/**
 * VaultManagerPanel.tsx - Phase XXIV
 * User Interface for Vault Contents Review & Management
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Vault,
  Shield,
  Clock,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Unlock,
  Lock,
  Calendar,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  IdentityVaultCore,
  storeIdentityInVault,
  unlockVaultEntry,
  type VaultEntry,
  type VaultUnlockResult
} from '../../identity/IdentityVaultCore';
import { BiometricRefreshNode } from './BiometricRefreshNode';
import { 
  exportReputationBundle,
  type ReputationBundle 
} from '../../services/ZKReputationAssembler';
import {
  logVaultAccess,
  logVaultEntryUnlocked
} from '../../services/VaultTelemetryLogger';
import {
  announceUnlockSuccess,
  announceUnlockFailure,
  announceExpiryWarning
} from '../../services/VaultNarrationSystem';

// Component props interface
interface VaultManagerPanelProps {
  defaultDID?: string;
  autoLoadEntries?: boolean;
  showAdvancedOptions?: boolean;
}

// Component state interfaces
interface VaultState {
  entries: VaultEntry[];
  isLoading: boolean;
  error: string | null;
  statistics: {
    totalEntries: number;
    activeEntries: number;
    expiredEntries: number;
    upcomingExpirations: number;
  };
}

interface UnlockState {
  entryId: string | null;
  isUnlocking: boolean;
  unlockMethod: 'biometric' | 'passphrase';
  unlockData: string;
  error: string | null;
}

interface RefreshState {
  activeEntry: VaultEntry | null;
  isRefreshing: boolean;
}

// Main VaultManagerPanel component
export const VaultManagerPanel: React.FC<VaultManagerPanelProps> = ({
  defaultDID = 'did:civic:commander-mark',
  autoLoadEntries = true,
  showAdvancedOptions = false
}) => {
  // Component state
  const [vaultState, setVaultState] = useState<VaultState>({
    entries: [],
    isLoading: false,
    error: null,
    statistics: {
      totalEntries: 0,
      activeEntries: 0,
      expiredEntries: 0,
      upcomingExpirations: 0
    }
  });
  
  const [unlockState, setUnlockState] = useState<UnlockState>({
    entryId: null,
    isUnlocking: false,
    unlockMethod: 'biometric',
    unlockData: '',
    error: null
  });
  
  const [refreshState, setRefreshState] = useState<RefreshState>({
    activeEntry: null,
    isRefreshing: false
  });
  
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [filterDID, setFilterDID] = useState(defaultDID);
  const [showExpiredEntries, setShowExpiredEntries] = useState(false);
  
  // ARIA live region ref
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  
  // Load vault entries
  const loadVaultEntries = async () => {
    setVaultState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const startTime = performance.now();
    
    try {
      const vault = IdentityVaultCore.getInstance();
      
      let entries = vault.getVaultEntries();
      
      // Filter by DID if specified
      if (filterDID && filterDID !== 'all') {
        entries = entries.filter(entry => entry.did === filterDID);
      }
      
      // Filter expired entries if not shown
      if (!showExpiredEntries) {
        entries = entries.filter(entry => entry.status !== 'expired');
      }
      
      const statistics = vault.getVaultStatistics();
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      setVaultState({
        entries,
        isLoading: false,
        error: null,
        statistics
      });
      
      // Log vault access
      logVaultAccess('load_entries', entries.length, duration);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Vault loaded with ${entries.length} entries`;
      }
      
    } catch (error) {
      console.error('❌ Failed to load vault entries:', error);
      setVaultState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load vault: ${error}`
      }));
    }
  };
  
  // Handle entry unlock
  const handleUnlockEntry = async (entryId: string) => {
    setUnlockState(prev => ({ 
      ...prev, 
      isUnlocking: true,
      entryId,
      error: null
    }));
    
    const startTime = performance.now();
    
    try {
      // Mock unlock data based on method
      const mockUnlockData = unlockState.unlockMethod === 'biometric' 
        ? `fingerprint_${entryId}_${Date.now()}`
        : 'test_passphrase_123';
      
      const unlockResult = await unlockVaultEntry(
        entryId,
        unlockState.unlockMethod,
        mockUnlockData
      );
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      if (unlockResult.success && unlockResult.entry) {
        // Log successful unlock
        logVaultEntryUnlocked(
          unlockResult.entry.cid,
          entryId,
          unlockState.unlockMethod,
          unlockResult.metadata.accessCount,
          duration
        );
        
        // Announce success
        announceUnlockSuccess(
          unlockResult.entry.cid,
          unlockState.unlockMethod,
          unlockResult.metadata.accessCount
        );
        
        setUnlockState({
          entryId: null,
          isUnlocking: false,
          unlockMethod: 'biometric',
          unlockData: '',
          error: null
        });
        
        // Refresh entries to show updated access count
        await loadVaultEntries();
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Vault entry unlocked successfully`;
        }
        
      } else {
        // Announce failure
        announceUnlockFailure(
          'Unknown',
          unlockResult.error || 'Unknown error',
          unlockResult.metadata.remainingAttempts
        );
        
        setUnlockState(prev => ({
          ...prev,
          isUnlocking: false,
          error: unlockResult.error || 'Unlock failed'
        }));
      }
      
    } catch (error) {
      console.error('❌ Vault unlock failed:', error);
      setUnlockState(prev => ({
        ...prev,
        isUnlocking: false,
        error: `Unlock failed: ${error}`
      }));
    }
  };
  
  // Handle refresh trigger
  const handleRefreshTrigger = (entry: VaultEntry) => {
    setRefreshState({
      activeEntry: entry,
      isRefreshing: true
    });
  };
  
  // Handle refresh completion
  const handleRefreshComplete = async (refreshedEntry: VaultEntry, refreshedBundle?: ReputationBundle) => {
    setRefreshState({
      activeEntry: null,
      isRefreshing: false
    });
    
    // Reload entries to show updated data
    await loadVaultEntries();
    
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = 'Identity refresh completed successfully';
    }
  };
  
  // Handle refresh cancel
  const handleRefreshCancel = () => {
    setRefreshState({
      activeEntry: null,
      isRefreshing: false
    });
  };
  
  // Download original bundle
  const handleDownloadBundle = async (entry: VaultEntry) => {
    if (!entry.reputationBundle) return;
    
    try {
      const exportResult = await exportReputationBundle(entry.reputationBundle);
      
      if (!exportResult.success) {
        throw new Error(exportResult.error || 'Export failed');
      }
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Bundle downloaded: ${exportResult.filename}`;
      }
      
    } catch (error) {
      console.error('❌ Bundle download failed:', error);
    }
  };
  
  // Toggle entry expansion
  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };
  
  // Check expiry and format display
  const getExpiryInfo = (entry: VaultEntry) => {
    const vault = IdentityVaultCore.getInstance();
    const expiryStatus = vault.checkExpiryStatus(entry.entryId);
    
    return {
      ...expiryStatus,
      displayText: expiryStatus.isExpired 
        ? 'Expired'
        : expiryStatus.daysUntilExpiry === 0
          ? 'Expires today'
          : `${expiryStatus.daysUntilExpiry} days remaining`,
      urgencyClass: expiryStatus.isExpired 
        ? 'text-red-400'
        : expiryStatus.shouldRefresh
          ? 'text-yellow-400'
          : 'text-green-400'
    };
  };
  
  // Get trust badge style
  const getTrustBadgeStyle = (trustIndex: number): string => {
    const baseStyle = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (trustIndex >= 90) return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
    if (trustIndex >= 75) return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300`;
    if (trustIndex >= 60) return `${baseStyle} bg-yellow-900/30 border border-yellow-600 text-yellow-300`;
    if (trustIndex >= 40) return `${baseStyle} bg-orange-900/30 border border-orange-600 text-orange-300`;
    return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string): string => {
    const baseStyle = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'active': return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'expired': return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      case 'locked': return `${baseStyle} bg-orange-900/30 border border-orange-600 text-orange-300`;
      case 'refreshing': return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300`;
      default: return `${baseStyle} bg-gray-900/30 border border-gray-600 text-gray-300`;
    }
  };
  
  // Initial load
  useEffect(() => {
    if (autoLoadEntries) {
      loadVaultEntries();
    }
  }, [filterDID, showExpiredEntries]);
  
  // Show refresh interface if active
  if (refreshState.activeEntry && refreshState.isRefreshing) {
    return (
      <BiometricRefreshNode
        vaultEntry={refreshState.activeEntry}
        onRefreshComplete={handleRefreshComplete}
        onRefreshCancel={handleRefreshCancel}
        triggerReason="user_request"
      />
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ARIA Live Region */}
      <div 
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Header */}
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Vault className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-semibold text-slate-200">
              Identity Vault Manager
            </h1>
          </div>
          
          <button
            onClick={loadVaultEntries}
            disabled={vaultState.isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 border border-purple-600 text-purple-300 rounded-lg hover:bg-purple-800/30 transition-colors text-sm"
            aria-label="Refresh vault entries"
          >
            {vaultState.isLoading ? (
              <div className="w-4 h-4 animate-spin border-2 border-purple-400 border-t-transparent rounded-full" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Vault className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Total Entries</span>
            </div>
            <div className="text-xl font-bold text-purple-400">
              {vaultState.statistics.totalEntries}
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Active</span>
            </div>
            <div className="text-xl font-bold text-green-400">
              {vaultState.statistics.activeEntries}
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Expiring Soon</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">
              {vaultState.statistics.upcomingExpirations}
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-sm text-slate-400">Expired</span>
            </div>
            <div className="text-xl font-bold text-red-400">
              {vaultState.statistics.expiredEntries}
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filter by DID
            </label>
            <select
              value={filterDID}
              onChange={(e) => setFilterDID(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-sm"
            >
              <option value="all">All DIDs</option>
              <option value="did:civic:commander-mark">Commander Mark</option>
              <option value="did:civic:verifier-alice">Verifier Alice</option>
              <option value="did:civic:citizen-bob">Citizen Bob</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-expired"
              checked={showExpiredEntries}
              onChange={(e) => setShowExpiredEntries(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded"
            />
            <label htmlFor="show-expired" className="text-sm text-slate-300">
              Show expired entries
            </label>
          </div>
        </div>
      </div>
      
      {/* Vault Entries */}
      <div className="space-y-4">
        {vaultState.entries.length === 0 ? (
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 text-center">
            <Vault className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No Vault Entries</h3>
            <p className="text-slate-500">
              {filterDID === 'all' 
                ? 'No identity entries found in the vault'
                : `No entries found for ${filterDID}`
              }
            </p>
          </div>
        ) : (
          vaultState.entries.map((entry) => {
            const expiryInfo = getExpiryInfo(entry);
            const isExpanded = expandedEntries.has(entry.entryId);
            
            return (
              <div key={entry.entryId} className="bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
                {/* Entry Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleEntryExpansion(entry.entryId)}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} entry details`}
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      
                      <div>
                        <div className="text-slate-200 font-medium">{entry.cid}</div>
                        <div className="text-slate-400 text-sm">{entry.did}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={getTrustBadgeStyle(entry.identity.trustIndex)}>
                        Trust: {entry.identity.trustIndex}
                      </div>
                      
                      <div className={getStatusBadgeStyle(entry.status)}>
                        {entry.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className={expiryInfo.urgencyClass}>{expiryInfo.displayText}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">Accessed {entry.metadata.accessCount} times</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {entry.status === 'active' && (
                        <>
                          {expiryInfo.shouldRefresh && (
                            <button
                              onClick={() => handleRefreshTrigger(entry)}
                              className="flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-600 text-yellow-300 rounded text-xs hover:bg-yellow-800/30 transition-colors"
                              aria-label="Refresh identity"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Refresh</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleUnlockEntry(entry.entryId)}
                            disabled={unlockState.isUnlocking && unlockState.entryId === entry.entryId}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 border border-blue-600 text-blue-300 rounded text-xs hover:bg-blue-800/30 transition-colors"
                            aria-label="Unlock vault entry"
                          >
                            {unlockState.isUnlocking && unlockState.entryId === entry.entryId ? (
                              <div className="w-3 h-3 animate-spin border border-blue-400 border-t-transparent rounded-full" />
                            ) : (
                              <Unlock className="w-3 h-3" />
                            )}
                            <span>Unlock</span>
                          </button>
                          
                          {entry.reputationBundle && (
                            <button
                              onClick={() => handleDownloadBundle(entry)}
                              className="flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-600 text-green-300 rounded text-xs hover:bg-green-800/30 transition-colors"
                              aria-label="Download reputation bundle"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-600 p-4 bg-slate-700/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Identity Details */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Identity Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Tier:</span>
                            <span className="text-slate-200 ml-2">{entry.identity.tier}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Streak Days:</span>
                            <span className="text-slate-200 ml-2">{entry.identity.streakDays}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Issued:</span>
                            <span className="text-slate-200 ml-2">
                              {new Date(entry.identity.issuedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Vault Metadata */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Vault Metadata</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Stored:</span>
                            <span className="text-slate-200 ml-2">
                              {new Date(entry.metadata.storedAt).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Refreshes:</span>
                            <span className="text-slate-200 ml-2">{entry.metadata.refreshHistory.length}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Last Access:</span>
                            <span className="text-slate-200 ml-2">
                              {new Date(entry.metadata.lastAccessed).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Refresh History */}
                    {entry.metadata.refreshHistory.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Recent Refreshes</h4>
                        <div className="space-y-1">
                          {entry.metadata.refreshHistory.slice(-3).map((refresh) => (
                            <div key={refresh.refreshId} className="flex items-center justify-between text-xs bg-slate-800/50 rounded p-2">
                              <span className="text-slate-400">
                                {new Date(refresh.refreshedAt).toLocaleDateString()}
                              </span>
                              <span className="text-slate-300">
                                {refresh.oldEpoch} → {refresh.newEpoch}
                              </span>
                              <span className={`${refresh.trustIndexChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {refresh.trustIndexChange >= 0 ? '+' : ''}{refresh.trustIndexChange}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Error Display */}
      {(vaultState.error || unlockState.error) && (
        <div className="bg-red-900/10 border border-red-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">Error</span>
          </div>
          <p className="text-red-200 text-sm">
            {vaultState.error || unlockState.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default VaultManagerPanel;