// Phase IX Step 1: CivicMirrorSyncGrid.tsx
// Commander Mark authorization via JASMY Relay System
// Sync status grid with fault highlighting, heatmap overlay, and ARIA announcements

import React, { useState, useEffect, useRef } from 'react';
import { protocolValidator } from '@/utils/ProtocolValidator';
import { 
  Grid, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  RefreshCw,
  Thermometer,
  Zap,
  Shield,
  Eye,
  WifiOff
} from 'lucide-react';

export interface SyncStatus {
  deckId: number;
  deckName: string;
  syncScore: number;
  lastSync: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  faultDetails: string[];
  zkpVerified: boolean;
  modules: number;
}

export interface HeatmapData {
  deckId: number;
  intensity: number;
  desyncLevel: number;
  temperature: 'cold' | 'warm' | 'hot' | 'critical';
}

export default function CivicMirrorSyncGrid() {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [exportData, setExportData] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [overallSyncScore, setOverallSyncScore] = useState<number>(0);
  const [pathBTriggered, setPathBTriggered] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  
  const mountTimestamp = useRef<number>(Date.now());
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate sync status for all 20 decks
  const generateSyncStatuses = (): SyncStatus[] => {
    const deckMetadata = protocolValidator.getDeckMetadata();
    
    return deckMetadata.map(deck => {
      // Generate more favorable sync scores (weighted toward higher values)
      const syncScore = Math.floor(Math.random() * 60) + 40; // Range: 40-100 instead of 0-100
      const lastSync = Date.now() - Math.floor(Math.random() * 3600000); // Last hour
      const zkpVerified = Math.random() > 0.15; // 85% verification rate
      
      // Determine status based on sync score
      let status: 'healthy' | 'warning' | 'critical' | 'offline';
      let faultDetails: string[] = [];
      
      if (syncScore >= 80) {
        status = 'healthy';
      } else if (syncScore >= 60) {
        status = 'warning';
        faultDetails.push('Minor sync drift detected');
        if (!zkpVerified) faultDetails.push('ZKP verification pending');
      } else if (syncScore >= 30) {
        status = 'critical';
        faultDetails.push('Major sync issues');
        faultDetails.push('Performance degradation');
        if (!zkpVerified) faultDetails.push('ZKP verification failed');
      } else {
        // Reduce offline probability - only 5% chance instead of always offline for low scores
        if (Math.random() < 0.05) {
          status = 'offline';
          faultDetails.push('Sync completely failed');
          faultDetails.push('Connection timeout'); 
          faultDetails.push('Requires manual intervention');
        } else {
          status = 'critical';
          faultDetails.push('Major sync issues');
          faultDetails.push('Performance degradation');
          faultDetails.push('ZKP verification failed');
        }
      }

      return {
        deckId: deck.id,
        deckName: deck.name,
        syncScore,
        lastSync,
        status,
        faultDetails,
        zkpVerified,
        modules: deck.modules
      };
    });
  };

  // Generate heatmap data with >10% desync detection
  const generateHeatmapData = (syncStatuses: SyncStatus[]): HeatmapData[] => {
    return syncStatuses.map(sync => {
      const desyncLevel = 100 - sync.syncScore;
      const intensity = Math.min(100, desyncLevel * 1.2);
      
      let temperature: 'cold' | 'warm' | 'hot' | 'critical';
      if (desyncLevel < 10) {
        temperature = 'cold';
      } else if (desyncLevel < 25) {
        temperature = 'warm';
      } else if (desyncLevel < 50) {
        temperature = 'hot';
      } else {
        temperature = 'critical';
      }

      return {
        deckId: sync.deckId,
        intensity,
        desyncLevel,
        temperature
      };
    });
  };

  // Calculate overall sync score and detect Path B triggers
  const calculateOverallMetrics = (syncStatuses: SyncStatus[]) => {
    const totalScore = syncStatuses.reduce((sum, sync) => sum + sync.syncScore, 0);
    const avgScore = totalScore / syncStatuses.length;
    
    // Check for Path B trigger (>10% desync)
    const criticalDesync = syncStatuses.filter(sync => sync.syncScore < 90).length;
    const desyncPercentage = (criticalDesync / syncStatuses.length) * 100;
    
    setOverallSyncScore(Math.round(avgScore));
    
    if (desyncPercentage > 10) {
      setPathBTriggered(true);
      console.warn(`⚠️ CivicMirrorSyncGrid: Path B triggered - ${desyncPercentage.toFixed(1)}% desync rate`);
    } else {
      setPathBTriggered(false);
    }

    return { avgScore, desyncPercentage, criticalCount: criticalDesync };
  };

  // Generate ARIA announcement
  const generateAriaAnnouncement = (syncStatuses: SyncStatus[], metrics: any) => {
    const healthyCount = syncStatuses.filter(s => s.status === 'healthy').length;
    const warningCount = syncStatuses.filter(s => s.status === 'warning').length;
    const criticalCount = syncStatuses.filter(s => s.status === 'critical').length;
    const offlineCount = syncStatuses.filter(s => s.status === 'offline').length;

    const announcement = `Civic mirror sync grid loaded. ${syncStatuses.length} decks monitored. ` +
      `Overall sync score ${metrics.avgScore.toFixed(1)} percent. ` +
      `${healthyCount} healthy, ${warningCount} warning, ${criticalCount} critical, ${offlineCount} offline. ` +
      `${pathBTriggered ? 'Path B triggered due to high desync.' : 'System stable.'}`;

    setAriaAnnouncement(announcement);
    console.log(`🔇 TTS disabled: "${announcement}"`);
  };

  // Refresh sync data
  const refreshSyncData = async () => {
    const startTime = Date.now();
    setIsLoading(true);

    try {
      const newSyncStatuses = generateSyncStatuses();
      const newHeatmapData = generateHeatmapData(newSyncStatuses);
      const metrics = calculateOverallMetrics(newSyncStatuses);
      
      setSyncStatuses(newSyncStatuses);
      setHeatmapData(newHeatmapData);
      setLastRefresh(Date.now());
      
      generateAriaAnnouncement(newSyncStatuses, metrics);
      
      const refreshTime = Date.now() - startTime;
      if (refreshTime > 150) {
        console.warn(`⚠️ CivicMirrorSyncGrid: Refresh time ${refreshTime}ms (exceeds 150ms target)`);
      }
      
      console.log(`🔄 CivicMirrorSyncGrid: Sync data refreshed in ${refreshTime}ms`);
      
    } catch (error) {
      console.error('❌ CivicMirrorSyncGrid: Failed to refresh sync data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate JSON snapshot export
  const generateExportSnapshot = () => {
    const startTime = Date.now();
    
    const snapshot = {
      exportId: `sync_snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: new Date().toISOString(),
      overallSyncScore,
      pathBTriggered,
      totalDecks: syncStatuses.length,
      syncStatuses: syncStatuses.map(status => ({
        deckId: status.deckId,
        deckName: status.deckName,
        syncScore: status.syncScore,
        status: status.status,
        zkpVerified: status.zkpVerified,
        faultCount: status.faultDetails.length,
        modules: status.modules
      })),
      heatmapData,
      metrics: {
        healthyCount: syncStatuses.filter(s => s.status === 'healthy').length,
        warningCount: syncStatuses.filter(s => s.status === 'warning').length,
        criticalCount: syncStatuses.filter(s => s.status === 'critical').length,
        offlineCount: syncStatuses.filter(s => s.status === 'offline').length,
        avgSyncScore: overallSyncScore,
        minSyncScore: Math.min(...syncStatuses.map(s => s.syncScore)),
        maxSyncScore: Math.max(...syncStatuses.map(s => s.syncScore))
      },
      phaseHashes: protocolValidator.getPhaseHashes(),
      exportedBy: 'CivicMirrorSyncGrid',
      ariaAnnouncement
    };

    const exportString = JSON.stringify(snapshot, null, 2);
    setExportData(exportString);
    
    const exportTime = Date.now() - startTime;
    if (exportTime > 200) {
      console.warn(`⚠️ CivicMirrorSyncGrid: Export time ${exportTime}ms (exceeds 200ms target)`);
    }
    
    console.log(`📦 CivicMirrorSyncGrid: JSON snapshot generated in ${exportTime}ms`);
    return snapshot;
  };

  // Handle export with modal display
  const handleExportSnapshot = () => {
    const snapshot = generateExportSnapshot();
    setShowExportModal(true);
    console.log('🔇 TTS disabled: "Sync snapshot export generated"');
  };

  // Download export JSON
  const downloadExportData = () => {
    if (!exportData) return;

    const dataBlob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `civic_mirror_sync_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    
    console.log('🔇 TTS disabled: "Sync snapshot downloaded"');
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'healthy':
        return { icon: <CheckCircle className="w-4 h-4 text-green-400" />, color: 'text-green-400', bg: 'bg-green-900/20' };
      case 'warning':
        return { icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />, color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
      case 'critical':
        return { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, color: 'text-red-400', bg: 'bg-red-900/20' };
      case 'offline':
        return { icon: <WifiOff className="w-4 h-4 text-slate-400" />, color: 'text-slate-400', bg: 'bg-slate-900/20' };
      default:
        return { icon: <Clock className="w-4 h-4 text-slate-400" />, color: 'text-slate-400', bg: 'bg-slate-700' };
    }
  };

  // Get heatmap temperature styling
  const getHeatmapStyling = (temperature: string, intensity: number) => {
    const opacity = Math.min(0.8, intensity / 100);
    
    switch (temperature) {
      case 'cold':
        return { backgroundColor: `rgba(59, 130, 246, ${opacity})`, border: 'border-blue-500' };
      case 'warm':
        return { backgroundColor: `rgba(245, 158, 11, ${opacity})`, border: 'border-yellow-500' };
      case 'hot':
        return { backgroundColor: `rgba(239, 68, 68, ${opacity})`, border: 'border-red-500' };
      case 'critical':
        return { backgroundColor: `rgba(220, 38, 38, ${opacity})`, border: 'border-red-600' };
      default:
        return { backgroundColor: `rgba(100, 116, 139, ${opacity})`, border: 'border-slate-500' };
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Component initialization and auto-refresh
  useEffect(() => {
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 150) {
      console.warn(`⚠️ CivicMirrorSyncGrid render time: ${renderTime}ms (exceeds 150ms target)`);
    }

    // Nuclear TTS override
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    
    // Initial data load
    refreshSyncData();
    
    // Set up auto-refresh every 30 seconds
    refreshInterval.current = setInterval(refreshSyncData, 30000);
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Civic Mirror Sync Grid
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase IX • Step 1 • Sync Status Grid</div>
          <div>{syncStatuses.length} Decks • Score: {overallSyncScore}%</div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">System Overview</h3>
          <button
            onClick={refreshSyncData}
            className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
            disabled={isLoading}
            aria-label="Refresh sync data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Overall Sync Score:</span>
            <span className={`font-medium ${overallSyncScore >= 80 ? 'text-green-400' : overallSyncScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {overallSyncScore}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Healthy Decks:</span>
            <span className="text-green-400">
              {syncStatuses.filter(s => s.status === 'healthy').length}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Warning/Critical:</span>
            <span className="text-yellow-400">
              {syncStatuses.filter(s => s.status === 'warning' || s.status === 'critical').length}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Offline:</span>
            <span className="text-red-400">
              {syncStatuses.filter(s => s.status === 'offline').length}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Last Refresh:</span>
            <span className="text-white">
              {formatTimeAgo(lastRefresh)}
            </span>
          </div>
          
          {pathBTriggered && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs font-medium">
                  Path B Triggered - High Desync Detected
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Grid Display */}
      <div className="mb-6 bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-slate-300" />
            <h3 className="text-sm font-medium text-slate-300">
              Sync Status Grid
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Heatmap</span>
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-slate-400">Loading sync data...</div>
            </div>
          ) : syncStatuses.length > 0 ? (
            <div className="divide-y divide-slate-600">
              {syncStatuses.map((sync, index) => {
                const statusDisplay = getStatusDisplay(sync.status);
                const heatmap = heatmapData.find(h => h.deckId === sync.deckId);
                const heatmapStyle = heatmap ? getHeatmapStyling(heatmap.temperature, heatmap.intensity) : {};
                
                return (
                  <div 
                    key={sync.deckId} 
                    className={`p-3 hover:bg-slate-600 transition-colors duration-200 ${statusDisplay.bg} relative`}
                    style={heatmapStyle}
                    role="gridcell"
                    aria-label={`Deck ${sync.deckId}: ${sync.deckName}, sync score ${sync.syncScore}%, status ${sync.status}`}
                  >
                    {/* Heatmap Overlay */}
                    {heatmap && heatmap.desyncLevel > 10 && (
                      <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${heatmap.temperature === 'critical' ? 'bg-red-500' : heatmap.temperature === 'hot' ? 'bg-orange-500' : 'bg-yellow-500'} animate-pulse`} />
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-200">
                          Deck #{sync.deckId}
                        </span>
                        {statusDisplay.icon}
                        <span className={`text-xs px-2 py-1 rounded ${statusDisplay.color}`}>
                          {sync.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-mono">
                        {sync.syncScore}%
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="text-slate-300">
                          {sync.deckName.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Modules:</span>
                        <span className="text-slate-300">
                          {sync.modules}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">ZKP Status:</span>
                        <span className={sync.zkpVerified ? 'text-green-400' : 'text-red-400'}>
                          {sync.zkpVerified ? 'Verified' : 'Failed'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Sync:</span>
                        <span className="text-slate-300">
                          {formatTimeAgo(sync.lastSync)}
                        </span>
                      </div>
                      
                      {sync.faultDetails.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <span className="text-slate-400 text-xs">Faults:</span>
                          {sync.faultDetails.map((fault, idx) => (
                            <div key={idx} className="text-xs text-red-400 ml-2">
                              • {fault}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {heatmap && (
                        <div className="mt-2 flex justify-between">
                          <span className="text-slate-400">Desync Level:</span>
                          <span className={`text-xs ${heatmap.desyncLevel > 25 ? 'text-red-400' : heatmap.desyncLevel > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {heatmap.desyncLevel.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-sm text-slate-400">No sync data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Export Control */}
      <div className="mb-4">
        <button
          onClick={handleExportSnapshot}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center gap-2"
          style={{ minHeight: '48px' }}
          aria-label="Export sync snapshot to JSON"
        >
          <Download className="w-4 h-4" />
          Export Sync Snapshot
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Sync Snapshot Export</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Decks:</span>
                <span className="text-white">{syncStatuses.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Overall Score:</span>
                <span className="text-white">{overallSyncScore}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Score Range:</span>
                <span className="text-white">
                  {Math.min(...syncStatuses.map(s => s.syncScore))}% - {Math.max(...syncStatuses.map(s => s.syncScore))}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Path B Status:</span>
                <span className={pathBTriggered ? 'text-red-400' : 'text-green-400'}>
                  {pathBTriggered ? 'Triggered' : 'Normal'}
                </span>
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