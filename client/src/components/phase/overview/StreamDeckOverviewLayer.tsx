// Phase VIII Step 1: StreamDeckOverviewLayer.tsx
// Commander Mark authorization via JASMY Relay System
// Deck grid renderer with commander override support and export capabilities

import React, { useState, useEffect, useRef } from 'react';
import { protocolValidator } from '@/utils/ProtocolValidator';
import { Grid, Download, Settings, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

export interface DeckMetadata {
  id: number;
  name: string;
  modules: number;
  phase: string;
  swipeToggle: boolean;
}

export interface ExportData {
  exportId: string;
  timestamp: string;
  deckGrid: DeckMetadata[];
  phaseHashes: any;
  totalDecks: number;
  completedModules: number;
  overrideActive: boolean;
  exportedBy: string;
}

export default function StreamDeckOverviewLayer() {
  const [deckGrid, setDeckGrid] = useState<DeckMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overrideMode, setOverrideMode] = useState(false);
  const [currentUserDID] = useState('did:civic:commander_mark_0x7f3e2d1a8c9b5f2e');
  const [fallbackActive, setFallbackActive] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const mountTimestamp = useRef<number>(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // Load deck metadata from ProtocolValidator
  const loadDeckMetadata = async () => {
    const startTime = Date.now();
    
    try {
      setIsLoading(true);
      
      // Get deck metadata from ProtocolValidator
      const decks = protocolValidator.getDeckMetadata();
      
      if (decks.length === 0) {
        // Trigger fallback mode
        setFallbackActive(true);
        setDeckGrid([{
          id: 0,
          name: 'Fallback',
          modules: 0,
          phase: 'Unavailable',
          swipeToggle: false
        }]);
        
        console.warn('⚠️ StreamDeckOverviewLayer: Fallback mode triggered - no deck metadata available');
        
        if (ttsOverrideRef.current) {
          console.log('🔇 TTS disabled: "Fallback mode activated - deck metadata unavailable"');
        }
      } else {
        setDeckGrid(decks);
        setFallbackActive(false);
        
        console.log(`✅ StreamDeckOverviewLayer: Loaded ${decks.length} deck entries`);
      }
      
      const loadTime = Date.now() - startTime;
      if (loadTime > 125) {
        console.warn(`⚠️ StreamDeckOverviewLayer: Load time ${loadTime}ms (exceeds 125ms target)`);
      }
      
    } catch (error) {
      console.error('❌ StreamDeckOverviewLayer: Failed to load deck metadata:', error);
      setFallbackActive(true);
      setDeckGrid([{
        id: 0,
        name: 'Fallback',
        modules: 0,
        phase: 'Unavailable', 
        swipeToggle: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check commander override permissions
  const checkOverrideMode = () => {
    const canOverride = protocolValidator.toggleOverrideMode(currentUserDID);
    setOverrideMode(canOverride);
    
    if (canOverride) {
      console.log('🔐 StreamDeckOverviewLayer: Commander override mode enabled');
      if (ttsOverrideRef.current) {
        console.log('🔇 TTS disabled: "Commander override mode activated"');
      }
    } else {
      console.log('ℹ️ StreamDeckOverviewLayer: Standard user mode - no override permissions');
    }
  };

  // Generate export data
  const generateExportData = (): ExportData => {
    const startTime = Date.now();
    
    const phaseHashes = protocolValidator.getPhaseHashes();
    const totalModules = deckGrid.reduce((sum, deck) => sum + deck.modules, 0);
    
    const exportData: ExportData = {
      exportId: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      deckGrid: deckGrid,
      phaseHashes: phaseHashes,
      totalDecks: deckGrid.length,
      completedModules: totalModules,
      overrideActive: overrideMode,
      exportedBy: 'StreamDeckOverviewLayer'
    };
    
    const exportTime = Date.now() - startTime;
    if (exportTime > 200) {
      console.warn(`⚠️ StreamDeckOverviewLayer: Export time ${exportTime}ms (exceeds 200ms target)`);
    }
    
    console.log(`📦 StreamDeckOverviewLayer: Export generated in ${exportTime}ms`);
    
    return exportData;
  };

  // Handle export to JSON
  const handleExportJSON = () => {
    const data = generateExportData();
    setExportData(data);
    setShowExportModal(true);
    
    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Deck overview export generated"');
    }
  };

  // Download export JSON
  const downloadExportJSON = () => {
    if (!exportData) return;

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `deck_overview_export_${exportData.exportId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    
    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Deck overview export downloaded"');
    }
  };

  // Get phase status color and icon
  const getPhaseDisplay = (phase: string) => {
    switch (phase) {
      case 'Complete':
        return { icon: <CheckCircle className="w-4 h-4 text-green-400" />, color: 'text-green-400' };
      case 'In Progress':
        return { icon: <Clock className="w-4 h-4 text-yellow-400" />, color: 'text-yellow-400' };
      case 'Unavailable':
        return { icon: <XCircle className="w-4 h-4 text-red-400" />, color: 'text-red-400' };
      default:
        return { icon: <Clock className="w-4 h-4 text-slate-400" />, color: 'text-slate-400' };
    }
  };

  // Format deck name for display
  const formatDeckName = (name: string): string => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  // Component initialization with nuclear TTS override
  useEffect(() => {
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 125) {
      console.warn(`⚠️ StreamDeckOverviewLayer render time: ${renderTime}ms (exceeds 125ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Deck overview initialized"');
    }

    // Nuclear override snippet - global enforcer
    const nuke = () => {
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"]');
      liveRegions.forEach(node => node.setAttribute('aria-live', 'off'));
      console.log('🔇 NUCLEAR TTS OVERRIDE: All aria-live regions disabled');
    };
    nuke();

    loadDeckMetadata();
    checkOverrideMode();
    
    // Cleanup on unmount
    return () => nuke();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Stream Deck Overview
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VIII • Step 1 • Deck Grid Renderer</div>
          <div>{deckGrid.length} Decks • {fallbackActive ? 'Fallback Mode' : 'Normal Mode'}</div>
        </div>
      </div>

      {/* Status Panel */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">System Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Override Mode:</span>
            <span className={overrideMode ? 'text-green-400' : 'text-slate-400'}>
              {overrideMode ? 'Commander Access' : 'Standard User'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Total Decks:</span>
            <span className="text-white">{deckGrid.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Total Modules:</span>
            <span className="text-white">
              {deckGrid.reduce((sum, deck) => sum + deck.modules, 0)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Fallback Status:</span>
            <span className={fallbackActive ? 'text-red-400' : 'text-green-400'}>
              {fallbackActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Swipe-enabled Decks:</span>
            <span className="text-blue-400">
              {deckGrid.filter(deck => deck.swipeToggle).length}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <button
          onClick={handleExportJSON}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center gap-2"
          style={{ minHeight: '48px' }}
          aria-label="Export deck overview to JSON"
        >
          <Download className="w-4 h-4" />
          Export to JSON
        </button>
      </div>

      {/* Deck Grid Display */}
      <div className="bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600 flex items-center gap-2">
          <Grid className="w-4 h-4 text-slate-300" />
          <h3 className="text-sm font-medium text-slate-300">
            Deck Grid ({deckGrid.length} entries)
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-slate-400">Loading deck metadata...</div>
            </div>
          ) : deckGrid.length > 0 ? (
            <div className="divide-y divide-slate-600">
              {deckGrid.map((deck) => {
                const phaseDisplay = getPhaseDisplay(deck.phase);
                
                return (
                  <div 
                    key={deck.id} 
                    className={`p-3 hover:bg-slate-600 transition-colors duration-200 ${
                      fallbackActive && deck.name === 'Fallback' ? 'bg-red-900/20' : ''
                    }`}
                    role="row"
                    aria-label={`Deck ${deck.id}: ${formatDeckName(deck.name)} with ${deck.modules} modules, status ${deck.phase}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-200">
                          Deck #{deck.id}
                        </span>
                        {phaseDisplay.icon}
                        <span className={`text-xs px-2 py-1 rounded ${phaseDisplay.color}`}>
                          {deck.phase}
                        </span>
                      </div>
                      {deck.swipeToggle && (
                        <div className="flex items-center gap-1">
                          <Settings className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-blue-400">Swipe</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="text-slate-300">
                          {formatDeckName(deck.name)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Modules:</span>
                        <span className="text-slate-300">
                          {deck.modules} modules
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Swipe Toggle:</span>
                        <span className={deck.swipeToggle ? 'text-green-400' : 'text-slate-400'}>
                          {deck.swipeToggle ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {overrideMode && (
                      <div className="mt-2 p-2 bg-purple-900/20 border border-purple-700 rounded flex items-center gap-2">
                        <Shield className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-400 text-xs font-medium">
                          Commander Override Access
                        </span>
                      </div>
                    )}

                    {fallbackActive && deck.name === 'Fallback' && (
                      <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                        <span className="text-red-400 text-xs font-medium">
                          ⚠️ Fallback Mode Active - Deck metadata unavailable
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-sm text-slate-400">No deck metadata available</div>
              <div className="text-xs text-slate-500 mt-1">Fallback mode activated</div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Export Data Preview</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Export ID:</span>
                <span className="text-white font-mono">{exportData.exportId.slice(0, 16)}...</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Total Decks:</span>
                <span className="text-white">{exportData.totalDecks}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Total Modules:</span>
                <span className="text-white">{exportData.completedModules}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Override Active:</span>
                <span className={exportData.overrideActive ? 'text-green-400' : 'text-slate-400'}>
                  {exportData.overrideActive ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Phase Hashes:</span>
                <span className="text-blue-400">{Object.keys(exportData.phaseHashes).length - 2} phases</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white">
                  {new Date(exportData.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors duration-200"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </button>
              
              <button
                onClick={downloadExportJSON}
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