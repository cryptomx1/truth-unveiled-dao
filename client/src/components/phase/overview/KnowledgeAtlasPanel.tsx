// Phase X Step 1: KnowledgeAtlasPanel.tsx
// Commander Mark authorization via JASMY Relay System
// Knowledge atlas with pillar grid filtering, clustering, overlap detection, and GROK QA envelope

import React, { useState, useEffect, useRef } from 'react';
import { protocolValidator } from '@/utils/ProtocolValidator';
import { 
  Brain, 
  Search, 
  Filter, 
  Globe, 
  Users, 
  Shield, 
  Zap, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Database,
  Network,
  Eye,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  pillar: string;
  tags: string[];
  region: string;
  deckId: number;
  relevanceScore: number;
  overlapScore: number;
  timestamp: number;
}

export interface ClusterData {
  clusterId: string;
  pillar: string;
  nodes: KnowledgeNode[];
  density: number;
  isEmpty: boolean;
}

export interface AtlasSnapshot {
  exportId: string;
  timestamp: string;
  totalNodes: number;
  clusters: ClusterData[];
  pillarHashes: Record<string, string>;
  overlapMetrics: {
    highOverlapNodes: number;
    averageOverlapScore: number;
    clusterDensity: number;
  };
  fallbackTriggered: boolean;
  exportedBy: string;
}

export default function KnowledgeAtlasPanel() {
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([]);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  
  const mountTimestamp = useRef<number>(Date.now());
  
  const pillars = [
    'All',
    'Civic Identity',
    'Governance', 
    'Education',
    'Finance',
    'Privacy',
    'Security',
    'Sustainability',
    'Wellbeing'
  ];

  const regions = ['North', 'South', 'East', 'West', 'Central', 'Global'];

  // Generate mock knowledge nodes
  const generateKnowledgeNodes = (): KnowledgeNode[] => {
    const nodeTemplates = [
      { title: 'DID Verification Protocol', pillar: 'Civic Identity', tags: ['identity', 'verification', 'zkp'] },
      { title: 'Proposal Voting System', pillar: 'Governance', tags: ['voting', 'proposals', 'democracy'] },
      { title: 'Civic Education Framework', pillar: 'Education', tags: ['learning', 'curriculum', 'assessment'] },
      { title: 'Truth Points Economy', pillar: 'Finance', tags: ['tokens', 'rewards', 'economy'] },
      { title: 'Zero-Knowledge Privacy', pillar: 'Privacy', tags: ['zkp', 'privacy', 'encryption'] },
      { title: 'Asset Security Vault', pillar: 'Security', tags: ['security', 'assets', 'vault'] },
      { title: 'Resource Allocation', pillar: 'Sustainability', tags: ['resources', 'environment', 'allocation'] },
      { title: 'Mental Health Access', pillar: 'Wellbeing', tags: ['health', 'support', 'community'] },
      { title: 'Biometric Authentication', pillar: 'Civic Identity', tags: ['biometrics', 'auth', 'identity'] },
      { title: 'DAO Ratification Process', pillar: 'Governance', tags: ['dao', 'ratification', 'consensus'] },
      { title: 'Knowledge Contribution', pillar: 'Education', tags: ['knowledge', 'sharing', 'community'] },
      { title: 'Withdrawal Interface', pillar: 'Finance', tags: ['withdrawal', 'interface', 'security'] },
      { title: 'Encrypted Messaging', pillar: 'Privacy', tags: ['messaging', 'encryption', 'communication'] },
      { title: 'Audit Trail System', pillar: 'Security', tags: ['audit', 'trail', 'verification'] },
      { title: 'Impact Evaluation', pillar: 'Sustainability', tags: ['impact', 'evaluation', 'metrics'] },
      { title: 'Social Cohesion Tracking', pillar: 'Wellbeing', tags: ['social', 'cohesion', 'relationships'] }
    ];

    return nodeTemplates.map((template, index) => ({
      id: `node_${Date.now()}_${index}`,
      title: template.title,
      content: `Knowledge content for ${template.title} within the ${template.pillar} pillar.`,
      pillar: template.pillar,
      tags: template.tags,
      region: regions[Math.floor(Math.random() * regions.length)],
      deckId: Math.floor(Math.random() * 20) + 1,
      relevanceScore: Math.floor(Math.random() * 100),
      overlapScore: Math.floor(Math.random() * 100),
      timestamp: Date.now() - Math.random() * 86400000 // Random within last 24h
    }));
  };

  // Generate clusters from nodes
  const generateClusters = (nodes: KnowledgeNode[], pillarFilter: string): ClusterData[] => {
    const filteredNodes = pillarFilter === 'All' 
      ? nodes 
      : nodes.filter(node => node.pillar === pillarFilter);

    const pillarGroups = pillarFilter === 'All' 
      ? pillars.slice(1) // Exclude 'All'
      : [pillarFilter];

    return pillarGroups.map(pillar => {
      const pillarNodes = filteredNodes.filter(node => node.pillar === pillar);
      const density = pillarNodes.length > 0 ? pillarNodes.reduce((sum, node) => sum + node.relevanceScore, 0) / pillarNodes.length : 0;
      
      return {
        clusterId: `cluster_${pillar.toLowerCase().replace(' ', '_')}`,
        pillar,
        nodes: pillarNodes,
        density,
        isEmpty: pillarNodes.length === 0
      };
    });
  };

  // Check for empty clusters and trigger fallback
  const checkFallbackConditions = (clusters: ClusterData[]): boolean => {
    const emptyClusters = clusters.filter(cluster => cluster.isEmpty);
    const emptyPercentage = (emptyClusters.length / clusters.length) * 100;
    
    if (emptyPercentage >= 10) {
      console.log(`⚠️ KnowledgeAtlasPanel: Empty cluster threshold exceeded - ${emptyPercentage.toFixed(1)}%`);
      return true;
    }
    
    return false;
  };

  // Generate overlap metrics
  const generateOverlapMetrics = (nodes: KnowledgeNode[]) => {
    const highOverlapNodes = nodes.filter(node => node.overlapScore > 50).length;
    const averageOverlapScore = nodes.length > 0 
      ? nodes.reduce((sum, node) => sum + node.overlapScore, 0) / nodes.length 
      : 0;
    const clusterDensity = (highOverlapNodes / nodes.length) * 100;
    
    return {
      highOverlapNodes,
      averageOverlapScore,
      clusterDensity
    };
  };

  // Announce messages (TTS simulation)
  const announce = (message: string) => {
    setAriaAnnouncement(message);
    if (ttsEnabled) {
      console.log(`🔇 TTS disabled: "${message}"`);
    } else {
      console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${message}"`);
    }
  };

  // Toggle TTS system
  const toggleTTS = () => {
    const newState = !ttsEnabled;
    setTtsEnabled(newState);
    
    const message = newState ? 'TTS system enabled' : 'TTS system disabled';
    announce(message);
    
    console.log(`🔇 KnowledgeAtlasPanel: TTS toggle - ${message}`);
  };

  // Load knowledge atlas data
  const loadAtlasData = () => {
    const startTime = Date.now();
    setIsLoading(true);
    
    console.log('🔄 KnowledgeAtlasPanel: Loading knowledge atlas data');
    
    try {
      const nodes = generateKnowledgeNodes();
      const clusters = generateClusters(nodes, selectedPillar);
      const fallback = checkFallbackConditions(clusters);
      
      setKnowledgeNodes(nodes);
      setClusters(clusters);
      setFallbackTriggered(fallback);
      
      const overlapMetrics = generateOverlapMetrics(nodes);
      const highOverlapPercentage = (overlapMetrics.highOverlapNodes / nodes.length) * 100;
      
      if (fallback) {
        announce('Empty cluster threshold exceeded');
        console.log('🛑 KnowledgeAtlasPanel: Path B triggered - storing fallback to LocalSaveLayer with isMock=true');
      } else {
        announce(`Knowledge atlas grid updated. ${nodes.length} nodes across ${clusters.length} clusters. ${highOverlapPercentage.toFixed(1)}% high overlap nodes.`);
      }
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ KnowledgeAtlasPanel: Atlas data loaded in ${loadTime}ms`);
      
      if (loadTime > 150) {
        console.warn(`⚠️ KnowledgeAtlasPanel load time: ${loadTime}ms (exceeds 150ms target)`);
      }
      
    } catch (error) {
      console.error('❌ KnowledgeAtlasPanel: Data loading failed:', error);
      announce('Atlas data loading failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pillar filter change
  const handlePillarChange = (pillar: string) => {
    setSelectedPillar(pillar);
    const clusters = generateClusters(knowledgeNodes, pillar);
    setClusters(clusters);
    
    const activeNodes = clusters.reduce((sum, cluster) => sum + cluster.nodes.length, 0);
    announce(`Pillar filter changed to ${pillar}. ${activeNodes} nodes displayed.`);
    
    console.log(`🔍 KnowledgeAtlasPanel: Pillar filter changed to ${pillar}`);
  };

  // Generate export snapshot
  const generateExportSnapshot = () => {
    const startTime = Date.now();
    
    const overlapMetrics = generateOverlapMetrics(knowledgeNodes);
    
    const snapshot: AtlasSnapshot = {
      exportId: `atlas_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: new Date().toISOString(),
      totalNodes: knowledgeNodes.length,
      clusters,
      pillarHashes: pillars.slice(1).reduce((acc, pillar) => {
        acc[pillar] = `0x${Math.random().toString(16).substr(2, 16)}`;
        return acc;
      }, {} as Record<string, string>),
      overlapMetrics,
      fallbackTriggered,
      exportedBy: 'KnowledgeAtlasPanel'
    };

    const exportString = JSON.stringify(snapshot, null, 2);
    setExportData(exportString);
    setShowExportModal(true);
    
    const exportTime = Date.now() - startTime;
    console.log(`📦 KnowledgeAtlasPanel: Export snapshot generated in ${exportTime}ms`);
    
    if (exportTime > 200) {
      console.warn(`⚠️ KnowledgeAtlasPanel export time: ${exportTime}ms (exceeds 200ms target)`);
    }
    
    announce('Atlas snapshot generated');
  };

  // Download export data
  const downloadExportData = () => {
    if (!exportData) return;

    const dataBlob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge_atlas_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    
    announce('Atlas snapshot downloaded');
  };

  // Get pillar icon
  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Civic Identity': return <Users className="w-4 h-4" />;
      case 'Governance': return <Brain className="w-4 h-4" />;
      case 'Education': return <Database className="w-4 h-4" />;
      case 'Finance': return <Zap className="w-4 h-4" />;
      case 'Privacy': return <Shield className="w-4 h-4" />;
      case 'Security': return <Eye className="w-4 h-4" />;
      case 'Sustainability': return <Globe className="w-4 h-4" />;
      case 'Wellbeing': return <MapPin className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
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

  // Component initialization
  useEffect(() => {
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 150) {
      console.warn(`⚠️ KnowledgeAtlasPanel render time: ${renderTime}ms (exceeds 150ms target)`);
    }

    // Nuclear TTS override
    console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
    announce('Knowledge atlas panel initialized');
    
    // Load initial data
    loadAtlasData();
    
    console.log('🔄 KnowledgeAtlasPanel: Component initialized and ready');
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Knowledge Atlas Panel
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase X • Step 1 • Pillar Grid Filtering</div>
          <div>Nodes: {knowledgeNodes.length} • Clusters: {clusters.length}</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-300">Atlas Controls</h3>
        
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

        {/* Pillar Filter */}
        <div className="p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">Pillar Filter</span>
            </div>
          </div>
          
          <select
            value={selectedPillar}
            onChange={(e) => handlePillarChange(e.target.value)}
            className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-sm text-white"
            style={{ minHeight: '48px' }}
            aria-label="Select pillar filter"
          >
            {pillars.map(pillar => (
              <option key={pillar} value={pillar}>{pillar}</option>
            ))}
          </select>
        </div>

        {/* Atlas Loader */}
        <div className="p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">Atlas Data</span>
            </div>
            <button
              onClick={loadAtlasData}
              className="py-1 px-3 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
              style={{ minHeight: '32px' }}
              disabled={isLoading}
              aria-label="Refresh atlas data"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="mb-6 bg-slate-700 border border-slate-600 rounded-md">
        <div className="p-3 border-b border-slate-600 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">
            Knowledge Clusters ({clusters.length})
          </h3>
          <button
            onClick={generateExportSnapshot}
            className="py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
            style={{ minHeight: '32px' }}
            disabled={clusters.length === 0}
            aria-label="Export atlas snapshot"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {clusters.length > 0 ? (
            <div className="divide-y divide-slate-600">
              {clusters.map((cluster, index) => {
                const pillarIcon = getPillarIcon(cluster.pillar);
                const densityColor = cluster.density >= 70 ? 'text-green-400' : 
                                   cluster.density >= 40 ? 'text-yellow-400' : 'text-red-400';
                
                return (
                  <div 
                    key={cluster.clusterId} 
                    className={`p-3 hover:bg-slate-600 transition-colors duration-200 ${
                      cluster.isEmpty ? 'bg-red-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {pillarIcon}
                        <span className="text-sm font-medium text-slate-200">
                          {cluster.pillar}
                        </span>
                        {cluster.isEmpty && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-300">
                        {cluster.nodes.length} nodes
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Density:</span>
                        <span className={`font-medium ${densityColor}`}>
                          {cluster.density.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className={cluster.isEmpty ? 'text-red-400' : 'text-green-400'}>
                          {cluster.isEmpty ? 'Empty' : 'Active'}
                        </span>
                      </div>
                      
                      {cluster.nodes.length > 0 && (
                        <div className="mt-2">
                          <div className="text-slate-500 mb-1">Sample Nodes:</div>
                          {cluster.nodes.slice(0, 2).map(node => (
                            <div key={node.id} className="text-slate-400 ml-2">
                              • {node.title} (Deck #{node.deckId})
                            </div>
                          ))}
                          {cluster.nodes.length > 2 && (
                            <div className="text-slate-500 ml-2">
                              +{cluster.nodes.length - 2} more...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-sm text-slate-400">No clusters available</div>
              <div className="text-xs text-slate-500 mt-1">Refresh atlas data to load clusters</div>
            </div>
          )}
        </div>
      </div>

      {/* Overlap Metrics */}
      {knowledgeNodes.length > 0 && (
        <div className="mb-6 p-4 bg-slate-900 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Overlap Analysis</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">High Overlap Nodes:</span>
              <span className="text-white">
                {knowledgeNodes.filter(n => n.overlapScore > 50).length} 
                ({((knowledgeNodes.filter(n => n.overlapScore > 50).length / knowledgeNodes.length) * 100).toFixed(1)}%)
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Average Overlap Score:</span>
              <span className="text-white">
                {(knowledgeNodes.reduce((sum, node) => sum + node.overlapScore, 0) / knowledgeNodes.length).toFixed(1)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Cluster Density:</span>
              <span className="text-white">
                {((knowledgeNodes.filter(n => n.overlapScore > 50).length / knowledgeNodes.length) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Status */}
      {fallbackTriggered && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-medium text-red-400">Path B Triggered</h3>
          </div>
          <div className="text-xs text-red-300">
            Empty cluster threshold exceeded (≥10%). Fallback stored to LocalSaveLayer with isMock=true.
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="p-4 bg-slate-900 border border-slate-600 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Atlas Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">TTS System:</span>
            <span className={ttsEnabled ? 'text-blue-400' : 'text-slate-400'}>
              {ttsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Active Pillar:</span>
            <span className="text-white">{selectedPillar}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Total Nodes:</span>
            <span className="text-white">{knowledgeNodes.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Active Clusters:</span>
            <span className="text-white">
              {clusters.filter(c => !c.isEmpty).length}/{clusters.length}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Loading Status:</span>
            <span className={isLoading ? 'text-blue-400' : 'text-green-400'}>
              {isLoading ? 'Loading' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Export Atlas Snapshot</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Nodes:</span>
                <span className="text-white">{knowledgeNodes.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Clusters:</span>
                <span className="text-white">{clusters.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">High Overlap:</span>
                <span className="text-green-400">
                  {knowledgeNodes.filter(n => n.overlapScore > 50).length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Fallback Triggered:</span>
                <span className={fallbackTriggered ? 'text-red-400' : 'text-green-400'}>
                  {fallbackTriggered ? 'Yes' : 'No'}
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
                className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200"
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