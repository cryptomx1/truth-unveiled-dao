import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Globe, Wifi, Router, Server, AlertTriangle } from 'lucide-react';

interface NetworkConfigurationProps {
  subpageId?: string;
  networkTier?: 'basic' | 'advanced' | 'enterprise';
}

export const Deck17Module1Subpage4: React.FC<NetworkConfigurationProps> = ({ 
  subpageId = 'network-configuration',
  networkTier = 'advanced' 
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');

  const networkMetrics = {
    activeConnections: 2847,
    bandwidth: '850 Mbps',
    latency: '12ms',
    uptime: '99.97%',
    packetsTransferred: '2.4B',
    errorRate: '0.003%'
  };

  const networkNodes = [
    {
      id: 'node-primary-001',
      name: 'Primary Data Center',
      type: 'Core Router',
      status: 'Online',
      load: 67,
      bandwidth: '10 Gbps',
      connections: 1247,
      location: 'North America East'
    },
    {
      id: 'node-backup-002',
      name: 'Backup Data Center',
      type: 'Backup Router',
      status: 'Standby',
      load: 23,
      bandwidth: '5 Gbps',
      connections: 324,
      location: 'North America West'
    },
    {
      id: 'node-edge-003',
      name: 'Edge Distribution Node',
      type: 'Edge Server',
      status: 'Online',
      load: 89,
      bandwidth: '2 Gbps',
      connections: 892,
      location: 'Europe Central'
    },
    {
      id: 'node-cdn-004',
      name: 'CDN Distribution Point',
      type: 'CDN Node',
      status: 'Online',
      load: 45,
      bandwidth: '1 Gbps',
      connections: 384,
      location: 'Asia Pacific'
    }
  ];

  const networkConfigurations = [
    {
      name: 'Load Balancing',
      status: 'Active',
      efficiency: 94,
      description: 'Distributes traffic across multiple servers'
    },
    {
      name: 'Auto-Scaling',
      status: 'Active',
      efficiency: 87,
      description: 'Automatically adjusts resources based on demand'
    },
    {
      name: 'Failover Protection',
      status: 'Active',
      efficiency: 99,
      description: 'Switches to backup systems during outages'
    },
    {
      name: 'DDoS Protection',
      status: 'Active',
      efficiency: 96,
      description: 'Filters malicious traffic and protects resources'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'text-green-600 dark:text-green-400';
      case 'standby': return 'text-blue-600 dark:text-blue-400';
      case 'maintenance': return 'text-yellow-600 dark:text-yellow-400';
      case 'offline': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 90) return 'text-red-600 dark:text-red-400';
    if (load >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'core router': return 'bg-blue-500';
      case 'backup router': return 'bg-green-500';
      case 'edge server': return 'bg-purple-500';
      case 'cdn node': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNetwork(nodeId);
    console.log(`🌐 Selected network node: ${nodeId}`);
  };

  const handleNetworkAction = (action: string, nodeId?: string) => {
    console.log(`⚡ Network action: ${action}${nodeId ? ` on ${nodeId}` : ''}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Deck 17 Module 1 Subpage 4: Network Configuration
            <Badge variant="outline" className="ml-auto">
              {networkTier.toUpperCase()} TIER
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {networkMetrics.activeConnections.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Connections
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {networkMetrics.bandwidth}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Bandwidth
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {networkMetrics.latency}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Latency
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {networkMetrics.uptime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Network Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {networkMetrics.packetsTransferred}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Packets Transferred
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {networkMetrics.errorRate}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Error Rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Network Infrastructure Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkNodes.map((node) => (
              <Card 
                key={node.id} 
                className={`border cursor-pointer transition-all ${
                  selectedNetwork === node.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => handleNodeSelect(node.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{node.name}</span>
                        <Badge className={getTypeColor(node.type)}>
                          {node.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {node.location} | {node.bandwidth} capacity
                      </div>
                      <div className="text-xs text-gray-500">
                        Node ID: {node.id}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`text-sm font-medium ${getStatusColor(node.status)}`}>
                        {node.status}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {node.connections} connections
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Load:</span>
                      <span className={getLoadColor(node.load)}>{node.load}%</span>
                    </div>
                    <Progress value={node.load} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNetworkAction('configure', node.id);
                      }}
                    >
                      <Router className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNetworkAction('monitor', node.id);
                      }}
                    >
                      <Wifi className="h-4 w-4 mr-1" />
                      Monitor
                    </Button>
                    {node.status === 'Online' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNetworkAction('restart', node.id);
                        }}
                      >
                        Restart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Network Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkConfigurations.map((config, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{config.name}</span>
                    <Badge variant={config.status === 'Active' ? 'default' : 'secondary'}>
                      {config.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {config.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{config.efficiency}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Efficiency
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Health Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Network Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                Network Status
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                Healthy
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Active Alerts
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                2 Minor
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Performance Score
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                A+
              </div>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
              <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Security Status
              </div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                Secure
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Network Management Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => handleNetworkAction('add-node')}
            >
              <Server className="h-5 w-5" />
              <span className="text-sm">Add Node</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => handleNetworkAction('configure-routing')}
            >
              <Router className="h-5 w-5" />
              <span className="text-sm">Configure Routing</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => handleNetworkAction('bandwidth-analysis')}
            >
              <Wifi className="h-5 w-5" />
              <span className="text-sm">Bandwidth Analysis</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => handleNetworkAction('security-scan')}
            >
              <Globe className="h-5 w-5" />
              <span className="text-sm">Security Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Network Configuration Subpage - Tier: {networkTier}</span>
            </div>
            <Badge variant="secondary">
              Configuration Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deck17Module1Subpage4;