/**
 * ProofLedgerPanel.tsx - Phase XXVI
 * Evidence Timeline UI with Status Icons and ARIA Support
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Lock,
  Clock,
  Download,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Calendar,
  Hash,
  User,
  Award
} from 'lucide-react';
import {
  ProofVaultCore,
  type VaultEntry,
  type VaultSearchParams
} from '../../evidence/ProofVaultCore';
import {
  type ProofCapsule,
  type EvidenceEventType
} from '../../evidence/EvidenceCaptureEngine';
import {
  ProofExporterNode,
  type ExportResult
} from '../../evidence/ProofExporterNode';
import {
  announceVaultAccessed,
  announceDownloadReady,
  announceVerificationSuccess
} from '../../evidence/EvidenceNarrationNode';

// Component props interface
interface ProofLedgerPanelProps {
  userHash?: string;
  showAllEntries?: boolean;
  enableExport?: boolean;
  maxEntries?: number;
  onEntryClick?: (entry: VaultEntry) => void;
}

// Filter options interface
interface FilterOptions {
  eventType?: EvidenceEventType;
  integrityStatus?: 'valid' | 'needs_sync' | 'corrupted' | 'expired';
  validationLevel?: string;
  completionStatus?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

// Main ProofLedgerPanel component
export const ProofLedgerPanel: React.FC<ProofLedgerPanelProps> = ({
  userHash,
  showAllEntries = true,
  enableExport = true,
  maxEntries = 100,
  onEntryClick
}) => {
  // Component state
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);
  
  // ARIA live region ref
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  
  // Initialize engines
  const vaultCore = ProofVaultCore.getInstance();
  const exporterNode = ProofExporterNode.getInstance();
  
  // Load proof ledger entries
  const loadProofLedger = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      const searchParams: VaultSearchParams = {
        ...filters,
        userHash: showAllEntries ? undefined : userHash,
        limit: maxEntries
      };
      
      // Apply search term if provided
      let ledgerEntries = vaultCore.searchVaultEntries(searchParams);
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        ledgerEntries = ledgerEntries.filter(entry =>
          entry.capsule.missionId.toLowerCase().includes(searchLower) ||
          entry.capsule.metadata.missionTitle.toLowerCase().includes(searchLower) ||
          entry.capsule.metadata.deckCategory.toLowerCase().includes(searchLower) ||
          entry.capsule.metadata.eventType.toLowerCase().includes(searchLower)
        );
      }
      
      setEntries(ledgerEntries);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      announceVaultAccessed('ledger_browse', ledgerEntries.length, duration);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Proof ledger loaded. ${ledgerEntries.length} evidence entries displayed.`;
      }
      
    } catch (error) {
      console.error('❌ Failed to load proof ledger:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle entry click
  const handleEntryClick = (entry: VaultEntry) => {
    if (onEntryClick) {
      onEntryClick(entry);
    }
    
    announceVerificationSuccess('entry_access', entry.entryId, {
      missionId: entry.capsule.missionId,
      operation: 'ledger_access'
    });
    
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `Evidence validated for mission: ${entry.capsule.metadata.missionTitle}`;
    }
  };
  
  // Toggle entry details
  const toggleEntryDetails = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };
  
  // Export ledger entries
  const handleExport = async () => {
    if (!enableExport || exportInProgress) return;
    
    setExportInProgress(true);
    
    try {
      const exportResult = await exportEntries();
      
      if (exportResult.success) {
        announceDownloadReady(exportResult, 'proof_ledger');
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Export complete: ${exportResult.filename}. Download ready.`;
        }
        
        // Trigger download
        triggerDownload(exportResult.filename, exportResult.data || '');
      }
      
    } catch (error) {
      console.error('❌ Export failed:', error);
    } finally {
      setExportInProgress(false);
    }
  };
  
  // Export entries
  const exportEntries = async (): Promise<ExportResult> => {
    const searchParams: VaultSearchParams = {
      ...filters,
      userHash: showAllEntries ? undefined : userHash,
      limit: maxEntries
    };
    
    return vaultCore.exportSearchResults(searchParams, userHash || 'system');
  };
  
  // Trigger file download
  const triggerDownload = (filename: string, data: string) => {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Get status icon
  const getStatusIcon = (entry: VaultEntry) => {
    switch (entry.integrityStatus) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'needs_sync':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'corrupted':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-orange-400" />;
      default:
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };
  
  // Get status text
  const getStatusText = (entry: VaultEntry): string => {
    switch (entry.integrityStatus) {
      case 'valid': return 'Validated';
      case 'needs_sync': return 'Needs Sync';
      case 'corrupted': return 'Corrupted';
      case 'expired': return 'Expired';
      default: return 'Locked';
    }
  };
  
  // Get status color class
  const getStatusColorClass = (entry: VaultEntry): string => {
    switch (entry.integrityStatus) {
      case 'valid': return 'text-green-400 bg-green-900/30 border-green-600';
      case 'needs_sync': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
      case 'corrupted': return 'text-red-400 bg-red-900/30 border-red-600';
      case 'expired': return 'text-orange-400 bg-orange-900/30 border-orange-600';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-600';
    }
  };
  
  // Get event type icon
  const getEventTypeIcon = (eventType: EvidenceEventType) => {
    switch (eventType) {
      case 'mission_completion':
        return <Award className="w-4 h-4" />;
      case 'vote_cast':
        return <CheckCircle className="w-4 h-4" />;
      case 'identity_verified':
        return <Shield className="w-4 h-4" />;
      case 'feedback_submitted':
        return <FileText className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return `${Math.floor(diff / 604800000)}w ago`;
  };
  
  // Initial load and refresh on dependencies
  useEffect(() => {
    loadProofLedger();
  }, [userHash, showAllEntries, searchTerm, filters]);
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 animate-spin border-2 border-purple-400 border-t-transparent rounded-full" />
            <span className="text-slate-300">Loading proof ledger...</span>
          </div>
        </div>
      </div>
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
            <FileText className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-semibold text-slate-200">
              Proof Evidence Ledger
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {enableExport && (
              <button
                onClick={handleExport}
                disabled={exportInProgress || entries.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-600 text-green-300 rounded-lg hover:bg-green-800/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export proof ledger"
              >
                <Download className={`w-4 h-4 ${exportInProgress ? 'animate-spin' : ''}`} />
                <span>{exportInProgress ? 'Exporting...' : 'Export'}</span>
              </button>
            )}
            
            <button
              onClick={loadProofLedger}
              className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 border border-purple-600 text-purple-300 rounded-lg hover:bg-purple-800/30 transition-colors text-sm"
              aria-label="Refresh proof ledger"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search missions, categories, or event types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-900/30 border border-blue-600 text-blue-300' 
                  : 'bg-slate-700 border border-slate-600 text-slate-400 hover:text-slate-300'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
                  <select
                    value={filters.eventType || ''}
                    onChange={(e) => setFilters({...filters, eventType: e.target.value as EvidenceEventType || undefined})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Events</option>
                    <option value="mission_completion">Mission Completion</option>
                    <option value="vote_cast">Vote Cast</option>
                    <option value="feedback_submitted">Feedback Submitted</option>
                    <option value="identity_verified">Identity Verified</option>
                    <option value="civic_interaction">Civic Interaction</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Integrity Status</label>
                  <select
                    value={filters.integrityStatus || ''}
                    onChange={(e) => setFilters({...filters, integrityStatus: e.target.value as any || undefined})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Status</option>
                    <option value="valid">Valid</option>
                    <option value="needs_sync">Needs Sync</option>
                    <option value="corrupted">Corrupted</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Validation Level</label>
                  <select
                    value={filters.validationLevel || ''}
                    onChange={(e) => setFilters({...filters, validationLevel: e.target.value || undefined})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Levels</option>
                    <option value="basic">Basic</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="civic_grade">Civic Grade</option>
                    <option value="dao_verified">DAO Verified</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Completion Status</label>
                  <select
                    value={filters.completionStatus || ''}
                    onChange={(e) => setFilters({...filters, completionStatus: e.target.value || undefined})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Completion</option>
                    <option value="completed">Completed</option>
                    <option value="verified">Verified</option>
                    <option value="partial">Partial</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-400">
            {entries.length} evidence entries
            {!showAllEntries && userHash && ' for current user'}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Show:</span>
            <button
              onClick={() => setExpandedEntries(entries.length > expandedEntries.size ? new Set(entries.map(e => e.entryId)) : new Set())}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {expandedEntries.size > 0 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="ml-1">{expandedEntries.size > 0 ? 'Less' : 'More'} Details</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Evidence Ledger */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">No Evidence Found</h3>
            <p className="text-slate-500">
              No proof capsules match your search criteria or filters
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.entryId);
            
            return (
              <div 
                key={entry.entryId}
                className="bg-slate-800 border border-slate-600 rounded-lg overflow-hidden"
              >
                {/* Entry Header */}
                <div 
                  className="p-4 cursor-pointer transition-colors hover:bg-slate-700/30"
                  onClick={() => handleEntryClick(entry)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Evidence entry for ${entry.capsule.metadata.missionTitle} - ${getStatusText(entry)}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEntryClick(entry);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(entry)}
                      
                      <div>
                        <div className="text-slate-200 font-medium">{entry.capsule.metadata.missionTitle}</div>
                        <div className="text-slate-400 text-sm">
                          {entry.capsule.metadata.deckCategory} • {entry.capsule.metadata.eventType.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColorClass(entry)}`}>
                        {getStatusText(entry)}
                      </div>
                      
                      <div className="text-slate-400 text-sm">
                        {formatTimeAgo(entry.capsule.timestamp)}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEntryDetails(entry.entryId);
                        }}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                        aria-label={`${isExpanded ? 'Hide' : 'Show'} entry details`}
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {getEventTypeIcon(entry.capsule.metadata.eventType)}
                        <span className="text-slate-400">{entry.capsule.metadata.eventType.replace(/_/g, ' ')}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">{entry.capsule.metadata.validationLevel}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">{entry.capsule.metadata.userTier}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Trust: {entry.capsule.metadata.trustScore}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-400">
                      Accessed {entry.accessCount} times
                    </div>
                  </div>
                </div>
                
                {/* Entry Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-600 p-4 bg-slate-700/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Capsule Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Event ID:</span>
                            <span className="text-slate-300 font-mono text-xs">{entry.capsule.eventId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Mission ID:</span>
                            <span className="text-slate-300 font-mono text-xs">{entry.capsule.missionId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Evidence Hash:</span>
                            <span className="text-slate-300 font-mono text-xs">{entry.capsule.evidenceDigest.substring(0, 24)}...</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Trace Hash:</span>
                            <span className="text-slate-300 font-mono text-xs">{entry.capsule.traceHash}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Witnesses:</span>
                            <span className="text-slate-300">{entry.capsule.metadata.witnessCount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Vault Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Stored At:</span>
                            <span className="text-slate-300">{formatTimestamp(entry.storedAt)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Last Accessed:</span>
                            <span className="text-slate-300">{formatTimestamp(entry.lastAccessed)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Access Count:</span>
                            <span className="text-slate-300">{entry.accessCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Backup Hash:</span>
                            <span className="text-slate-300 font-mono text-xs">{entry.backupHash?.substring(0, 16)}...</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Exports:</span>
                            <span className="text-slate-300">{entry.exportHistory.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cross-References */}
                    {entry.capsule.metadata.crossValidation && entry.capsule.metadata.crossValidation.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Cross-References</h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.capsule.metadata.crossValidation.map((ref, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-slate-600/50 border border-slate-500 text-slate-300 rounded font-mono"
                            >
                              {ref.substring(0, 20)}...
                            </span>
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
    </div>
  );
};

export default ProofLedgerPanel;