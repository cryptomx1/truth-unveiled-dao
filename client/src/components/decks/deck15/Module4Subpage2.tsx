import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCIDAuthentication } from '@/hooks/useCIDAuthentication';
import { CIDAuthenticationGate } from '@/components/auth/CIDAuthenticationGate';
import { Network, Cpu, Monitor, Settings, AlertTriangle } from 'lucide-react';

interface SystemPerformanceProps {
  subpageId?: string;
  monitoringLevel?: 'basic' | 'advanced' | 'enterprise';
}

export const Deck15Module4Subpage2: React.FC<SystemPerformanceProps> = ({ 
  subpageId = 'system-performance',
  monitoringLevel = 'advanced' 
}) => {
  const { isAuthenticated, cidStatus, validateCID } = useCIDAuthentication();
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  if (!isAuthenticated) {
    return (
      <CIDAuthenticationGate 
        onValidate={validateCID}
        title="System Performance Monitoring"
        description="Advanced system performance metrics require CID authentication for administrative access."
      />
    );
  }

  const performanceMetrics = {
    cpuUsage: 23.4,
    memoryUsage: 67.8,
    diskUsage: 45.2,
    networkThroughput: 1.2, // GB/s
    activeConnections: 342,
    uptime: '15d 7h 23m',
    responseTime: 89, // ms
    errorRate: 0.02 // %
  };

  const systemComponents = [
    {
      name: 'Web Server',
      status: 'Healthy',
      cpu: 15.2,
      memory: 52.3,
      uptime: '99.9%',
      lastRestart: '2025-01-08'
    },
    {
      name: 'Database Server',
      status: 'Healthy',
      cpu: 31.7,
      memory: 78.5,
      uptime: '99.8%',
      lastRestart: '2025-01-10'
    },
    {
      name: 'Cache Layer',
      status: 'Warning',
      cpu: 45.1,
      memory: 89.2,
      uptime: '98.7%',
      lastRestart: '2025-01-20'
    },
    {
      name: 'Load Balancer',
      status: 'Healthy',
      cpu: 8.9,
      memory: 34.1,
      uptime: '99.9%',
      lastRestart: '2025-01-05'
    }
  ];

  const performanceAlerts = [
    {
      id: 1,
      type: 'Performance',
      message: 'Cache Layer memory usage above 85% threshold',
      severity: 'Warning',
      timestamp: '2025-01-22 15:45:00'
    },
    {
      id: 2,
      type: 'Network',
      message: 'Increased latency detected on external API calls',
      severity: 'Info',
      timestamp: '2025-01-22 14:30:00'
    },
    {
      id: 3,
      type: 'Storage',
      message: 'Database query response time slightly elevated',
      severity: 'Low',
      timestamp: '2025-01-22 13:15:00'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUptime = (uptime: string) => {
    return uptime;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Deck 15 Module 4 Subpage 2: System Performance
            <Badge variant="outline" className="ml-auto">
              {monitoringLevel.toUpperCase()} MONITORING
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <div className="text-2xl font-bold">{performanceMetrics.cpuUsage}%</div>
              <Progress value={performanceMetrics.cpuUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <div className="text-2xl font-bold">{performanceMetrics.memoryUsage}%</div>
              <Progress value={performanceMetrics.memoryUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Network I/O</span>
              </div>
              <div className="text-2xl font-bold">{performanceMetrics.networkThroughput} GB/s</div>
              <div className="text-xs text-gray-500">
                {performanceMetrics.activeConnections} active connections
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <div className="text-2xl font-bold">{performanceMetrics.responseTime}ms</div>
              <div className="text-xs text-gray-500">
                Error rate: {performanceMetrics.errorRate}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Components Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Components Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemComponents.map((component, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{component.name}</span>
                        <span className={`text-sm font-medium ${getStatusColor(component.status)}`}>
                          {component.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">CPU:</span>
                          <span className="ml-1 font-medium">{component.cpu}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                          <span className="ml-1 font-medium">{component.memory}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                          <span className="ml-1 font-medium">{component.uptime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Last Restart:</span>
                          <span className="ml-1 font-medium">{component.lastRestart}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Progress value={component.cpu} className="h-1 w-20" />
                      <Progress value={component.memory} className="h-1 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="font-medium">{alert.type}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {alert.message}
                  </div>
                  <div className="text-xs text-gray-500">
                    {alert.timestamp}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Investigate
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                System Uptime
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {performanceMetrics.uptime}
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Active Connections
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {performanceMetrics.activeConnections}
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Monitoring Level
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {monitoringLevel}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Authenticated System Access - Monitoring: {monitoringLevel}</span>
            </div>
            <Badge variant={cidStatus === 'valid' ? 'default' : 'secondary'}>
              CID {cidStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deck15Module4Subpage2;