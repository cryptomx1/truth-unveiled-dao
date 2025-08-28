// Phase XI Step 3: FederatedTrustDisplay.tsx
// JASMY Relay authorization via Commander Mark
// Multi-DID trust tier visualization with role-weighted trust mapping

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, 
  Crown, 
  Star, 
  Award, 
  Gem, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Activity, 
  Hash,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  Filter,
  PieChart,
  MapPin,
  Clock,
  Layers,
  Grid,
  MoreVertical,
  Sparkles,
  Gauge,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Import trust tier types from RoleInfluenceCard
import { TrustTier, InfluenceMetrics, CrossRoleDistribution } from './RoleInfluenceCard';

export interface DIDCluster {
  did: string;
  role: 'Citizen' | 'Moderator' | 'Governor';
  currentTier: string;
  trustScore: number;
  tpBalance: number;
  tpDelta: number;
  lastUpdate: Date;
  isAnonymous: boolean;
  sourceTags: string[];
}

export interface TrustMapEntry {
  observerTier: string;
  targetTier: string;
  weight: number;
  tpMultiplier: number;
  influence: number;
}

export interface FederatedTrustDisplayProps {
  userRole?: 'Citizen' | 'Moderator' | 'Governor';
  userDid?: string;
  onTrustUpdate?: (metrics: InfluenceMetrics) => void;
  className?: string;
}

export default function FederatedTrustDisplay({
  userRole = 'Citizen',
  userDid = 'did:civic:federated_trust_001',
  onTrustUpdate,
  className = ''
}: FederatedTrustDisplayProps) {
  // State management
  const [didClusters, setDidClusters] = useState<DIDCluster[]>([]);
  const [trustTiers] = useState<TrustTier[]>([
    { name: 'Novice', threshold: 0, color: 'text-slate-400', icon: Users, influence: 10, tpMultiplier: 1.0, decisionWeight: 1 },
    { name: 'Trusted', threshold: 60, color: 'text-blue-400', icon: Star, influence: 35, tpMultiplier: 1.2, decisionWeight: 1.5 },
    { name: 'Advocate', threshold: 80, color: 'text-green-400', icon: Award, influence: 65, tpMultiplier: 1.5, decisionWeight: 2 },
    { name: 'Guardian', threshold: 90, color: 'text-purple-400', icon: Shield, influence: 85, tpMultiplier: 1.8, decisionWeight: 2.5 },
    { name: 'Architect', threshold: 95, color: 'text-amber-400', icon: Crown, influence: 100, tpMultiplier: 2.0, decisionWeight: 3 }
  ]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [showAnonymous, setShowAnonymous] = useState(true);
  const [aggregationFailure, setAggregationFailure] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trendlineData, setTrendlineData] = useState<any[]>([]);
  const [anonymityRatio, setAnonymityRatio] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // Performance refs
  const renderStartTime = useRef<number>(Date.now());
  const updateCycleStart = useRef<number>(Date.now());
  const ttsDisabled = useRef<boolean>(true);

  // Mock data generation
  const generateMockDIDClusters = useCallback((): DIDCluster[] => {
    const mockClusters: DIDCluster[] = [];
    const roles: ('Citizen' | 'Moderator' | 'Governor')[] = ['Citizen', 'Moderator', 'Governor'];
    const tiers = ['Novice', 'Trusted', 'Advocate', 'Guardian', 'Architect'];
    const sourceTags = ['vote', 'sentiment', 'stake', 'proposal', 'moderation'];
    
    for (let i = 0; i < 25; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const trustScore = Math.floor(Math.random() * 100);
      const tpBalance = Math.floor(Math.random() * 5000) + 500;
      const tpDelta = Math.floor(Math.random() * 200) - 100;
      const isAnonymous = Math.random() > 0.6;
      const numTags = Math.floor(Math.random() * 3) + 1;
      const selectedTags = sourceTags.sort(() => 0.5 - Math.random()).slice(0, numTags);
      
      mockClusters.push({
        did: `did:civic:cluster_${i.toString().padStart(3, '0')}`,
        role,
        currentTier: tier,
        trustScore,
        tpBalance,
        tpDelta,
        lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        isAnonymous,
        sourceTags: selectedTags
      });
    }
    
    return mockClusters;
  }, []);

  // Trust map calculation
  const calculateTrustMap = useCallback((): TrustMapEntry[] => {
    const trustMap: TrustMapEntry[] = [];
    
    trustTiers.forEach(observerTier => {
      trustTiers.forEach(targetTier => {
        const weight = observerTier.decisionWeight / targetTier.decisionWeight;
        const tpMultiplier = observerTier.tpMultiplier * targetTier.tpMultiplier;
        const influence = (observerTier.influence + targetTier.influence) / 2;
        
        trustMap.push({
          observerTier: observerTier.name,
          targetTier: targetTier.name,
          weight: Math.round(weight * 100) / 100,
          tpMultiplier: Math.round(tpMultiplier * 100) / 100,
          influence: Math.round(influence)
        });
      });
    });
    
    return trustMap;
  }, [trustTiers]);

  // Aggregation failure simulation
  const simulateAggregationFailure = useCallback(() => {
    const failureRate = Math.random() * 100;
    const threshold = 15; // 15% failure rate triggers Path B
    
    if (failureRate >= threshold) {
      setAggregationFailure(true);
      setUseMockData(true);
      console.log('🚨 FederatedTrustDisplay: Aggregation failure detected - activating vault.history.json fallback');
      console.log(`⚠️ Aggregation failure rate: ${failureRate.toFixed(1)}% (threshold: ${threshold}%)`);
    } else {
      setAggregationFailure(false);
      setUseMockData(false);
    }
  }, []);

  // TP trendline generation
  const generateTrendlineData = useCallback(() => {
    const trendData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const totalTP = didClusters.reduce((sum, cluster) => sum + cluster.tpBalance, 0);
      const variance = Math.floor(Math.random() * 1000) - 500;
      
      trendData.push({
        date: date.toISOString().split('T')[0],
        totalTP: totalTP + variance,
        boosts: Math.floor(Math.random() * 50),
        losses: Math.floor(Math.random() * 25)
      });
    }
    
    setTrendlineData(trendData);
  }, [didClusters]);

  // Anonymity ratio calculation
  const calculateAnonymityRatio = useCallback(() => {
    if (didClusters.length === 0) return;
    
    const anonymousCount = didClusters.filter(cluster => cluster.isAnonymous).length;
    const ratio = (anonymousCount / didClusters.length) * 100;
    setAnonymityRatio(Math.round(ratio));
  }, [didClusters]);

  // Filter clusters by role
  const filteredClusters = selectedRole === 'All' 
    ? didClusters 
    : didClusters.filter(cluster => cluster.role === selectedRole);

  // Further filter by anonymity preference
  const displayClusters = showAnonymous 
    ? filteredClusters 
    : filteredClusters.filter(cluster => !cluster.isAnonymous);

  // Initialize component
  useEffect(() => {
    renderStartTime.current = Date.now();
    
    const initializeFederatedTrust = async () => {
      setIsLoading(true);
      
      // Simulate aggregation failure check
      simulateAggregationFailure();
      
      // Generate mock DID clusters
      const mockClusters = generateMockDIDClusters();
      setDidClusters(mockClusters);
      
      // Calculate anonymity ratio
      const anonymousCount = mockClusters.filter(cluster => cluster.isAnonymous).length;
      const ratio = (anonymousCount / mockClusters.length) * 100;
      setAnonymityRatio(Math.round(ratio));
      
      setIsLoading(false);
      setLastUpdateTime(new Date());
      
      // Performance logging
      const renderTime = Date.now() - renderStartTime.current;
      if (renderTime > 125) {
        console.warn(`⚠️ FederatedTrustDisplay render time: ${renderTime}ms (exceeds 125ms target)`);
      }
      
      console.log('🎯 FederatedTrustDisplay: Federated trust interface initialized');
      console.log(`📊 FederatedTrustDisplay: ${mockClusters.length} DID clusters loaded`);
    };
    
    initializeFederatedTrust();
  }, [generateMockDIDClusters, simulateAggregationFailure]);

  // Update trendline data when clusters change
  useEffect(() => {
    if (didClusters.length > 0) {
      generateTrendlineData();
      calculateAnonymityRatio();
    }
  }, [didClusters, generateTrendlineData, calculateAnonymityRatio]);

  // Refresh data handler
  const handleRefresh = useCallback(async () => {
    updateCycleStart.current = Date.now();
    setIsLoading(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    simulateAggregationFailure();
    const refreshedClusters = generateMockDIDClusters();
    setDidClusters(refreshedClusters);
    
    setIsLoading(false);
    setLastUpdateTime(new Date());
    
    // Performance logging
    const updateTime = Date.now() - updateCycleStart.current;
    if (updateTime > 200) {
      console.warn(`⚠️ FederatedTrustDisplay update time: ${updateTime}ms (exceeds 200ms target)`);
    }
    
    console.log('🔄 FederatedTrustDisplay: Data refreshed successfully');
  }, [simulateAggregationFailure, generateMockDIDClusters]);

  // Get tier color and icon
  const getTierInfo = (tierName: string) => {
    const tier = trustTiers.find(t => t.name === tierName);
    return tier || trustTiers[0];
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Calculate trust map
  const trustMap = calculateTrustMap();

  return (
    <div className={`min-w-[300px] max-w-[460px] h-auto mx-auto bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Federated Trust</h3>
        </div>
        <div className="flex items-center gap-2">
          {aggregationFailure && (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label="Refresh federated trust data"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {aggregationFailure && (
        <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">
              Vault fallback active (isMock=true)
            </span>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white"
          >
            <option value="All">All Roles</option>
            <option value="Citizen">Citizens</option>
            <option value="Moderator">Moderators</option>
            <option value="Governor">Governors</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnonymous(!showAnonymous)}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            {showAnonymous ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {showAnonymous ? 'Hide Anonymous' : 'Show Anonymous'}
          </button>
        </div>
      </div>

      {/* Anonymity Ratio */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Anonymity Ratio</span>
          <span className="text-sm text-white">{anonymityRatio}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${anonymityRatio}%` }}
          />
        </div>
      </div>

      {/* TP Trendline */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">7-Day TP Trend</span>
          <Activity className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex items-end gap-1 h-8">
          {trendlineData.map((data, index) => (
            <div 
              key={index}
              className="flex-1 bg-green-400 rounded-t opacity-60 hover:opacity-100 transition-opacity"
              style={{ height: `${Math.max(10, (data.totalTP / 10000) * 100)}%` }}
              title={`${data.date}: ${data.totalTP} TP`}
            />
          ))}
        </div>
      </div>

      {/* DID Clusters */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">
            DID Clusters ({displayClusters.length})
          </span>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        
        {displayClusters.map((cluster, index) => {
          const tierInfo = getTierInfo(cluster.currentTier);
          const TierIcon = tierInfo.icon;
          
          return (
            <div 
              key={cluster.did}
              className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
              onClick={() => setExpanded(expanded === cluster.did ? null : cluster.did)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TierIcon className={`w-4 h-4 ${tierInfo.color}`} />
                  <div>
                    <div className="text-sm text-white">
                      {cluster.isAnonymous ? 'Anonymous' : cluster.did.slice(-8)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {cluster.role} • {cluster.currentTier}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm text-white">{cluster.tpBalance} TP</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      cluster.tpDelta >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {cluster.tpDelta >= 0 ? (
                        <TrendingUpIcon className="w-3 h-3" />
                      ) : (
                        <TrendingDownIcon className="w-3 h-3" />
                      )}
                      {Math.abs(cluster.tpDelta)}
                    </div>
                  </div>
                  
                  {expanded === cluster.did ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
              
              {expanded === cluster.did && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Trust Score</span>
                      <span className="text-xs text-white">{cluster.trustScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Last Update</span>
                      <span className="text-xs text-white">{formatTimeAgo(cluster.lastUpdate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Source Tags</span>
                      <div className="flex gap-1">
                        {cluster.sourceTags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="text-xs px-2 py-1 bg-slate-600 rounded text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust Map Preview */}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Role-Weighted Trust Map</span>
          <MapPin className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xs text-slate-400">
          {trustMap.length} tier combinations mapped
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {trustMap.slice(0, 25).map((entry, index) => (
            <div 
              key={index}
              className="w-2 h-2 bg-purple-400 rounded opacity-60 hover:opacity-100 transition-opacity"
              style={{ opacity: entry.weight / 3 }}
              title={`${entry.observerTier} → ${entry.targetTier}: ${entry.weight}x`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-600">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Updated {formatTimeAgo(lastUpdateTime)}</span>
          <span>DID: {userDid.slice(-8)}</span>
        </div>
      </div>
    </div>
  );
}