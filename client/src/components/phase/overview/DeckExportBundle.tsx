// Phase X-C Step 3: DeckExportBundle.tsx
// GROK Node0001 authorization via JASMY Relay System
// Deck export system with ZKP signatures, IPFS bundling, and fallback mechanisms

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Download, 
  Upload, 
  Package, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Loader2, 
  FileText, 
  Shield, 
  Globe, 
  HardDrive,
  Copy,
  ExternalLink,
  Settings,
  Archive,
  Eye,
  Key,
  Clock,
  Database,
  Zap,
  RefreshCw
} from 'lucide-react';

export interface Deck {
  id: string;
  name: string;
  modules: any[];
  metadata: {
    description: string;
    totalModules: number;
    completedModules: number;
    phase: string;
    category: string;
    lastUpdated: string;
    zkpHash?: string;
    version: string;
  };
  size: number; // in bytes
  status: 'active' | 'completed' | 'archived' | 'draft';
}

export interface ExportBundle {
  deckId: string;
  name: string;
  modules: any[];
  metadata: any;
  timestamp: number;
  did: string;
  role: string;
  zkProof: string;
  bundleSize: number;
  cid?: string;
  exportId: string;
  manifest: {
    version: string;
    checksum: string;
    dependencies: string[];
    requirements: string[];
  };
}

export interface DeckExportBundleProps {
  decks?: Deck[];
  role?: 'Citizen' | 'Moderator' | 'Governor' | 'Admin';
  userDid?: string;
  onExportComplete?: (bundle: ExportBundle) => void;
  onExportFailed?: (error: string) => void;
  className?: string;
}

export default function DeckExportBundle({
  decks = [],
  role = 'Citizen',
  userDid = 'did:civic:export_user_001',
  onExportComplete,
  onExportFailed,
  className = ''
}: DeckExportBundleProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'validating' | 'bundling' | 'uploading' | 'success' | 'failed'>('idle');
  const [exportCid, setExportCid] = useState<string>('');
  const [exportBundle, setExportBundle] = useState<ExportBundle | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportBundle[]>([]);
  const [pathBTriggered, setPathBTriggered] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const [renderTime, setRenderTime] = useState<number>(0);
  
  const mountTimestamp = useRef<number>(Date.now());
  const exportAttempts = useRef<number>(0);
  const failureCount = useRef<number>(0);

  // Generate mock deck data if none provided
  const mockDecks: Deck[] = decks.length > 0 ? decks : [
    {
      id: 'deck_wallet_overview',
      name: 'WalletOverviewDeck',
      modules: Array.from({ length: 4 }, (_, i) => ({ id: `module_${i + 1}`, name: `Module ${i + 1}` })),
      metadata: {
        description: 'Wallet overview with identity, balance, participation, and sync components',
        totalModules: 4,
        completedModules: 4,
        phase: 'I',
        category: 'Identity',
        lastUpdated: '2025-07-18T09:00:00Z',
        zkpHash: 'zkp_wallet_overview_abc123',
        version: '1.0.0'
      },
      size: 2048576, // 2MB
      status: 'completed'
    },
    {
      id: 'deck_governance',
      name: 'GovernanceDeck',
      modules: Array.from({ length: 3 }, (_, i) => ({ id: `module_${i + 1}`, name: `Module ${i + 1}` })),
      metadata: {
        description: 'Governance with civic swipe, vote ledger, and session status',
        totalModules: 3,
        completedModules: 3,
        phase: 'II',
        category: 'Governance',
        lastUpdated: '2025-07-18T08:30:00Z',
        zkpHash: 'zkp_governance_def456',
        version: '1.0.0'
      },
      size: 1572864, // 1.5MB
      status: 'completed'
    },
    {
      id: 'deck_education',
      name: 'EducationDeck',
      modules: Array.from({ length: 4 }, (_, i) => ({ id: `module_${i + 1}`, name: `Module ${i + 1}` })),
      metadata: {
        description: 'Education with literacy, quiz, resources, and forum components',
        totalModules: 4,
        completedModules: 4,
        phase: 'III',
        category: 'Education',
        lastUpdated: '2025-07-18T08:15:00Z',
        zkpHash: 'zkp_education_ghi789',
        version: '1.0.0'
      },
      size: 3145728, // 3MB
      status: 'completed'
    },
    {
      id: 'deck_finance',
      name: 'FinanceDeck',
      modules: Array.from({ length: 4 }, (_, i) => ({ id: `module_${i + 1}`, name: `Module ${i + 1}` })),
      metadata: {
        description: 'Finance with earnings, transactions, calculator, and withdrawal',
        totalModules: 4,
        completedModules: 4,
        phase: 'IV',
        category: 'Finance',
        lastUpdated: '2025-07-18T08:45:00Z',
        zkpHash: 'zkp_finance_jkl012',
        version: '1.0.0'
      },
      size: 4194304, // 4MB
      status: 'completed'
    },
    {
      id: 'deck_privacy',
      name: 'PrivacyDeck',
      modules: Array.from({ length: 4 }, (_, i) => ({ id: `module_${i + 1}`, name: `Module ${i + 1}` })),
      metadata: {
        description: 'Privacy with ZKP status, session privacy, messaging, and vault',
        totalModules: 4,
        completedModules: 4,
        phase: 'V',
        category: 'Privacy',
        lastUpdated: '2025-07-18T07:30:00Z',
        zkpHash: 'zkp_privacy_mno345',
        version: '1.0.0'
      },
      size: 2621440, // 2.5MB
      status: 'completed'
    }
  ];

  // Announce messages for accessibility
  const announce = useCallback((message: string) => {
    setAriaAnnouncement(message);
    console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
  }, []);

  // Generate ZKP proof for deck bundle
  const generateZKPProof = useCallback(async (deck: Deck): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const proofData = {
      deckId: deck.id,
      modules: deck.modules.map(m => m.id),
      timestamp: Date.now(),
      did: userDid,
      role
    };
    
    const proofString = JSON.stringify(proofData);
    const zkpHash = `zkp_export_${deck.id}_${Math.random().toString(36).substring(7)}`;
    
    console.log(`🔐 DeckExportBundle: ZKP proof generated for ${deck.name}: ${zkpHash}`);
    return zkpHash;
  }, [userDid, role]);

  // Simulate IPFS upload
  const uploadToIPFS = useCallback(async (bundle: ExportBundle): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate upload failure for testing (15% chance)
    if (Math.random() < 0.15) {
      throw new Error('IPFS upload failed');
    }
    
    const cid = `bafkreig${Math.random().toString(36).substring(7)}h4uqmdvr7gf7eqgxwpkjsbq2fwpnvxej`;
    console.log(`📡 DeckExportBundle: Bundle uploaded to IPFS with CID: ${cid}`);
    return cid;
  }, []);

  // Simulate local fallback save
  const saveToLocalFallback = useCallback(async (bundle: ExportBundle): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const fallbackData = {
      exportId: bundle.exportId,
      deckId: bundle.deckId,
      name: bundle.name,
      timestamp: bundle.timestamp,
      bundleSize: bundle.bundleSize,
      isMock: true
    };
    
    console.log('💾 DeckExportBundle: Bundle saved to local fallback storage');
    console.log('📝 DeckExportBundle: Logging to vault.history.json (simulated)');
  }, []);

  // Handle deck export process
  const handleExport = async () => {
    if (!selectedDeckId || exportStatus !== 'idle') return;
    
    const selectedDeck = mockDecks.find(d => d.id === selectedDeckId);
    if (!selectedDeck) {
      setError('Selected deck not found');
      return;
    }
    
    exportAttempts.current++;
    setError('');
    setProgress(0);
    setExportStatus('validating');
    
    console.log(`📦 DeckExportBundle: Starting export for ${selectedDeck.name} (${selectedDeck.id})`);
    announce(`Starting export for ${selectedDeck.name}`);
    
    try {
      // Step 1: Validation
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check bundle size (5MB limit)
      if (selectedDeck.size > 5 * 1024 * 1024) {
        throw new Error('Bundle exceeds 5MB size limit');
      }
      
      // Step 2: Generate ZKP proof
      setExportStatus('bundling');
      setProgress(25);
      const zkpProof = await generateZKPProof(selectedDeck);
      
      // Step 3: Create bundle manifest
      setProgress(40);
      const exportId = `export_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const bundleManifest = {
        version: '1.0.0',
        checksum: `sha256_${Math.random().toString(36).substring(7)}`,
        dependencies: ['react', 'typescript', 'tailwindcss'],
        requirements: ['ZKP validation', 'IPFS access', 'DID authentication']
      };
      
      const bundle: ExportBundle = {
        deckId: selectedDeck.id,
        name: selectedDeck.name,
        modules: selectedDeck.modules,
        metadata: selectedDeck.metadata,
        timestamp: Date.now(),
        did: userDid,
        role,
        zkProof,
        bundleSize: selectedDeck.size,
        exportId,
        manifest: bundleManifest
      };
      
      // Step 4: Upload to IPFS
      setExportStatus('uploading');
      setProgress(60);
      
      try {
        const cid = await uploadToIPFS(bundle);
        bundle.cid = cid;
        setExportCid(cid);
        
        // Step 5: Success
        setProgress(100);
        setExportStatus('success');
        setExportBundle(bundle);
        
        // Add to history
        const updatedHistory = [...exportHistory, bundle];
        setExportHistory(updatedHistory);
        
        console.log(`✅ DeckExportBundle: Export completed successfully`);
        console.log(`📡 DeckExportBundle: Bundle available at IPFS CID: ${cid}`);
        announce(`Export completed successfully. Bundle available at IPFS CID: ${cid}`);
        
        onExportComplete?.(bundle);
        
      } catch (ipfsError) {
        console.log(`⚠️ DeckExportBundle: IPFS upload failed, activating Path B fallback`);
        
        // Path B: Local fallback
        failureCount.current++;
        const failureRate = (failureCount.current / exportAttempts.current) * 100;
        
        if (failureRate > 20) {
          setPathBTriggered(true);
          setFallbackMode(true);
          console.log(`🛑 DeckExportBundle: Path B activated - ${failureRate.toFixed(1)}% failure rate`);
        }
        
        await saveToLocalFallback(bundle);
        
        setExportStatus('success');
        setProgress(100);
        setExportBundle(bundle);
        
        // Add to history with fallback flag
        const fallbackBundle = { ...bundle, cid: 'local_fallback' };
        const updatedHistory = [...exportHistory, fallbackBundle];
        setExportHistory(updatedHistory);
        
        announce('Export completed with local fallback storage');
        onExportComplete?.(fallbackBundle);
      }
      
    } catch (error) {
      console.error('❌ DeckExportBundle: Export failed:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
      setExportStatus('failed');
      announce(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      onExportFailed?.(error instanceof Error ? error.message : 'Export failed');
    }
  };

  // Reset export state
  const resetExport = () => {
    setSelectedDeckId('');
    setExportStatus('idle');
    setExportCid('');
    setExportBundle(null);
    setError('');
    setProgress(0);
    announce('Export reset');
  };

  // Copy CID to clipboard
  const copyCID = async (cid: string) => {
    try {
      await navigator.clipboard.writeText(cid);
      announce('CID copied to clipboard');
    } catch (error) {
      console.error('Failed to copy CID:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-slate-400';
      case 'validating': return 'text-blue-400';
      case 'bundling': return 'text-yellow-400';
      case 'uploading': return 'text-orange-400';
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return <Package className="w-4 h-4" />;
      case 'validating': return <Shield className="w-4 h-4" />;
      case 'bundling': return <Archive className="w-4 h-4" />;
      case 'uploading': return <Upload className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <X className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Component initialization with nuclear TTS override
  useEffect(() => {
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    console.log('📦 DeckExportBundle: Component initialized and ready');
    console.log(`🎯 DeckExportBundle: GROK QA Envelope UUID: UUID-DEB-20250718-004`);
    announce('Deck export bundle interface ready');
    
    // Nuclear override snippet - global enforcer
    const nuke = () => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"]');
      liveRegions.forEach(node => node.setAttribute('aria-live', 'off'));
      console.log('🔇 NUCLEAR TTS OVERRIDE: All aria-live regions disabled');
    };
    nuke();
    
    const totalRenderTime = Date.now() - mountTimestamp.current;
    setRenderTime(totalRenderTime);
    
    if (totalRenderTime > 150) {
      console.warn(`⚠️ DeckExportBundle render time: ${totalRenderTime}ms (exceeds 150ms target)`);
    }
    
    // Cleanup on unmount
    return () => nuke();
  }, [announce]);

  const selectedDeck = mockDecks.find(d => d.id === selectedDeckId);

  return (
    <div className={`w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
      {/* ARIA Live Region - TTS Suppressed */}
      <div 
        aria-live="off" 
        aria-atomic="true" 
        className="sr-only"
        aria-hidden="true"
      >
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Export Deck Bundle</h2>
          </div>
          <div className="text-xs text-slate-400">
            Phase X-C • Step 3
          </div>
        </div>
        
        {pathBTriggered && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-medium text-red-400">Path B Activated</h3>
            </div>
            <div className="text-xs text-red-300 mb-3">
              High failure rate detected (&gt;20%). Local fallback active.
            </div>
            <button
              onClick={() => {
                setPathBTriggered(false);
                setFallbackMode(false);
                failureCount.current = 0;
                exportAttempts.current = 0;
              }}
              className="py-1 px-3 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors duration-200"
              style={{ minHeight: '32px' }}
            >
              Reset Fallback
            </button>
          </div>
        )}
      </div>

      {/* Deck Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Select Deck to Export
        </label>
        <select
          value={selectedDeckId}
          onChange={(e) => setSelectedDeckId(e.target.value)}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Select deck to export"
          disabled={exportStatus !== 'idle'}
        >
          <option value="">Choose a deck...</option>
          {mockDecks.map(deck => (
            <option key={deck.id} value={deck.id}>
              {deck.name} - {formatFileSize(deck.size)} ({deck.metadata.totalModules} modules)
            </option>
          ))}
        </select>
      </div>

      {/* Selected Deck Info */}
      {selectedDeck && (
        <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Selected Deck Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Name:</span>
              <span className="text-white">{selectedDeck.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phase:</span>
              <span className="text-white">{selectedDeck.metadata.phase}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-white">{selectedDeck.metadata.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Modules:</span>
              <span className="text-white">{selectedDeck.metadata.totalModules}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Size:</span>
              <span className="text-white">{formatFileSize(selectedDeck.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`capitalize ${selectedDeck.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                {selectedDeck.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Export Controls */}
      <div className="mb-6">
        <button
          onClick={handleExport}
          disabled={!selectedDeckId || exportStatus !== 'idle'}
          className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          style={{ minHeight: '48px' }}
          aria-label="Export selected deck bundle"
        >
          {exportStatus === 'idle' ? (
            <>
              <Download className="w-4 h-4" />
              Export Bundle
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {exportStatus === 'validating' && 'Validating...'}
              {exportStatus === 'bundling' && 'Bundling...'}
              {exportStatus === 'uploading' && 'Uploading...'}
              {exportStatus === 'success' && 'Export Complete'}
              {exportStatus === 'failed' && 'Export Failed'}
            </>
          )}
        </button>
        
        {exportStatus !== 'idle' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export Status */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Export Status</h3>
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon(exportStatus)}
          <span className={`text-sm font-medium ${getStatusColor(exportStatus)}`}>
            {exportStatus === 'idle' && 'Ready to Export'}
            {exportStatus === 'validating' && 'Validating Deck'}
            {exportStatus === 'bundling' && 'Creating Bundle'}
            {exportStatus === 'uploading' && 'Uploading to IPFS'}
            {exportStatus === 'success' && 'Export Successful'}
            {exportStatus === 'failed' && 'Export Failed'}
          </span>
        </div>
        
        {error && (
          <div className="text-xs text-red-400 mb-2">
            Error: {error}
          </div>
        )}
        
        {exportCid && (
          <div className="text-xs">
            <span className="text-slate-400">IPFS CID: </span>
            <span className="text-green-400 font-mono break-all">{exportCid}</span>
            <button
              onClick={() => copyCID(exportCid)}
              className="ml-2 p-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Copy CID to clipboard"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Export History ({exportHistory.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {exportHistory.map((bundle, index) => (
              <div key={bundle.exportId} className="p-2 bg-slate-800 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white">{bundle.name}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(bundle.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {bundle.cid === 'local_fallback' ? (
                    <span className="text-orange-400">Local Fallback</span>
                  ) : (
                    <span className="text-green-400">IPFS: {bundle.cid?.substring(0, 16)}...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Controls */}
      {(exportStatus === 'success' || exportStatus === 'failed') && (
        <div className="mb-6">
          <button
            onClick={resetExport}
            className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-md text-sm transition-colors duration-200"
            style={{ minHeight: '40px' }}
          >
            Export Another Deck
          </button>
        </div>
      )}

      {/* System Status */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">System Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Render Time:</span>
            <span className={renderTime > 150 ? 'text-red-400' : 'text-green-400'}>
              {renderTime}ms
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Export Attempts:</span>
            <span className="text-white">{exportAttempts.current}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Failures:</span>
            <span className={failureCount.current > 0 ? 'text-red-400' : 'text-green-400'}>
              {failureCount.current}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Path B Status:</span>
            <span className={pathBTriggered ? 'text-red-400' : 'text-green-400'}>
              {pathBTriggered ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">User Role:</span>
            <span className="text-white">{role}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">User DID:</span>
            <span className="text-white font-mono text-[10px]">
              {userDid.substring(0, 20)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}