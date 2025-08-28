import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface MunicipalNode {
  id: string;
  name: string;
  region: string;
  population: number;
  status: 'pending' | 'verifying' | 'active' | 'inactive';
  didStatus: 'none' | 'pending' | 'verified' | 'expired';
  onboardingProgress: number;
  lastActivity: string;
  trustedCitizens: number;
  governanceScore: number;
}

interface RegionCluster {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  nodes: MunicipalNode[];
  totalPopulation: number;
  activeNodes: number;
  averageGovernanceScore: number;
}

interface PilotRegionMapProps {
  nodes: MunicipalNode[];
  selectedNode: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export const PilotRegionMap: React.FC<PilotRegionMapProps> = ({
  nodes,
  selectedNode,
  onNodeSelect
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mapMetrics, setMapMetrics] = useState({
    totalCoverage: 0,
    activeRegions: 0,
    totalPopulation: 0,
    networkHealth: 'excellent' as 'excellent' | 'good' | 'degraded'
  });

  // Create regional clusters for visualization
  const regionClusters: RegionCluster[] = [
    {
      id: 'texas-region',
      name: 'Texas Region',
      coordinates: { x: 35, y: 65 },
      nodes: nodes.filter(n => n.region.includes('Texas')),
      totalPopulation: 965000,
      activeNodes: 1,
      averageGovernanceScore: 87
    },
    {
      id: 'oregon-region',
      name: 'Pacific Northwest',
      coordinates: { x: 15, y: 20 },
      nodes: nodes.filter(n => n.region.includes('Oregon')),
      totalPopulation: 650000,
      activeNodes: 0,
      averageGovernanceScore: 72
    },
    {
      id: 'vermont-region',
      name: 'New England',
      coordinates: { x: 80, y: 25 },
      nodes: nodes.filter(n => n.region.includes('Vermont')),
      totalPopulation: 42000,
      activeNodes: 0,
      averageGovernanceScore: 0
    },
    {
      id: 'california-region',
      name: 'California Region',
      coordinates: { x: 8, y: 55 },
      nodes: nodes.filter(n => n.region.includes('California')),
      totalPopulation: 1030000,
      activeNodes: 1,
      averageGovernanceScore: 91
    },
    {
      id: 'michigan-region',
      name: 'Great Lakes',
      coordinates: { x: 60, y: 35 },
      nodes: nodes.filter(n => n.region.includes('Michigan')),
      totalPopulation: 123000,
      activeNodes: 0,
      averageGovernanceScore: 45
    }
  ];

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981'; // green
      case 'verifying': return '#F59E0B'; // yellow
      case 'pending': return '#3B82F6'; // blue
      case 'inactive': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getRegionHealthColor = (score: number, activeNodes: number) => {
    if (activeNodes === 0) return '#6B7280'; // gray
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const handleRegionClick = (cluster: RegionCluster) => {
    if (cluster.nodes.length > 0) {
      onNodeSelect(cluster.nodes[0].id);
      console.log(`🗺️ Region selected: ${cluster.name} with ${cluster.nodes.length} nodes`);
    }
  };

  const handleNodeHover = (clusterId: string | null) => {
    setHoveredRegion(clusterId);
  };

  useEffect(() => {
    // Calculate map metrics
    const activeRegions = regionClusters.filter(r => r.activeNodes > 0).length;
    const totalPopulation = regionClusters.reduce((sum, r) => sum + r.totalPopulation, 0);
    const averageScore = regionClusters
      .filter(r => r.averageGovernanceScore > 0)
      .reduce((sum, r) => sum + r.averageGovernanceScore, 0) / 
      regionClusters.filter(r => r.averageGovernanceScore > 0).length;

    setMapMetrics({
      totalCoverage: Math.round((activeRegions / regionClusters.length) * 100),
      activeRegions,
      totalPopulation,
      networkHealth: averageScore >= 80 ? 'excellent' : averageScore >= 60 ? 'good' : 'degraded'
    });

    console.log(`🗺️ PilotRegionMap initialized: ${activeRegions}/${regionClusters.length} regions active`);
  }, [nodes]);

  return (
    <div className="space-y-6">
      {/* Map Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Regional Coverage</p>
                <p className="text-xl font-bold text-white">{mapMetrics.totalCoverage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Active Regions</p>
                <p className="text-xl font-bold text-white">{mapMetrics.activeRegions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Total Population</p>
                <p className="text-xl font-bold text-white">
                  {(mapMetrics.totalPopulation / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-xs text-slate-400">Network Health</p>
                <p className="text-xl font-bold text-white capitalize">{mapMetrics.networkHealth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Municipal Node Distribution</CardTitle>
          <CardDescription className="text-slate-400">
            Interactive map showing pilot regions and deployment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Map Background - Simplified US Map */}
            <div className="w-full h-96 bg-slate-700 rounded-lg border border-slate-600 relative overflow-hidden">
              {/* Map Grid Background */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* US Map Outline - Simplified */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 50 L15 20 L25 15 L40 15 L50 10 L75 12 L85 20 L85 45 L80 55 L70 55 L60 50 L40 52 L25 50 Z"
                  fill="rgba(71, 85, 105, 0.3)"
                  stroke="rgba(71, 85, 105, 0.6)"
                  strokeWidth="0.5"
                />
              </svg>

              {/* Regional Nodes */}
              {regionClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${cluster.coordinates.x}%`,
                    top: `${cluster.coordinates.y}%`
                  }}
                  onClick={() => handleRegionClick(cluster)}
                  onMouseEnter={() => handleNodeHover(cluster.id)}
                  onMouseLeave={() => handleNodeHover(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${cluster.name} region with ${cluster.nodes.length} nodes`}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white transition-all duration-200 ${
                      hoveredRegion === cluster.id || 
                      (selectedNode && cluster.nodes.some(n => n.id === selectedNode))
                        ? 'scale-150 shadow-lg'
                        : 'scale-100'
                    }`}
                    style={{
                      backgroundColor: getRegionHealthColor(cluster.averageGovernanceScore, cluster.activeNodes)
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {cluster.nodes.length}
                      </span>
                    </div>
                  </div>

                  {/* Hover Info */}
                  {hoveredRegion === cluster.id && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-600 rounded-lg p-3 min-w-48 z-10 shadow-xl">
                      <h4 className="font-semibold text-white mb-2">{cluster.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Nodes:</span>
                          <span className="text-white">{cluster.nodes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active:</span>
                          <span className="text-green-400">{cluster.activeNodes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Population:</span>
                          <span className="text-white">{cluster.totalPopulation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Governance:</span>
                          <span className="text-white">{cluster.averageGovernanceScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-600 rounded-lg p-3">
                <h4 className="text-white text-sm font-semibold mb-2">Status Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-300">Active (80%+ governance)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-slate-300">Good (60-79% governance)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-300">Needs attention (&lt;60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-slate-300">Inactive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Regional Node Details</CardTitle>
          <CardDescription className="text-slate-400">
            Detailed breakdown of municipal nodes by region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionClusters.map((cluster) => (
              <div
                key={cluster.id}
                className={`p-4 bg-slate-700 border rounded-lg cursor-pointer transition-colors ${
                  selectedNode && cluster.nodes.some(n => n.id === selectedNode)
                    ? 'border-blue-400 bg-slate-600'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => cluster.nodes.length > 0 && handleRegionClick(cluster)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${cluster.name}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{cluster.name}</h3>
                  <Badge
                    className={
                      cluster.activeNodes > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }
                  >
                    {cluster.activeNodes} active
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Nodes:</span>
                    <span className="text-white">{cluster.nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Population:</span>
                    <span className="text-white">{cluster.totalPopulation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg. Governance:</span>
                    <span className="text-white">{cluster.averageGovernanceScore}%</span>
                  </div>
                </div>

                {/* Node List */}
                {cluster.nodes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <div className="space-y-2">
                      {cluster.nodes.slice(0, 2).map((node) => (
                        <div key={node.id} className="flex items-center gap-2 text-xs">
                          {node.status === 'active' ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : node.status === 'verifying' ? (
                            <Clock className="w-3 h-3 text-yellow-400" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-slate-400" />
                          )}
                          <span className="text-slate-300 truncate">{node.name}</span>
                        </div>
                      ))}
                      {cluster.nodes.length > 2 && (
                        <p className="text-xs text-slate-400">
                          +{cluster.nodes.length - 2} more nodes
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};