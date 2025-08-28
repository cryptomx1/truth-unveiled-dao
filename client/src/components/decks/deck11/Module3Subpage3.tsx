import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCIDAuthentication } from '@/hooks/useCIDAuthentication';
import { CIDAuthenticationGate } from '@/components/auth/CIDAuthenticationGate';
import { Shield, AlertCircle, Eye, Lock } from 'lucide-react';

interface SecurityIncidentMonitoringProps {
  subpageId?: string;
  securityLevel?: 'standard' | 'elevated' | 'high';
}

export const Deck11Module3Subpage3: React.FC<SecurityIncidentMonitoringProps> = ({ 
  subpageId = 'incident-monitoring',
  securityLevel = 'elevated' 
}) => {
  const { isAuthenticated, cidStatus, validateCID } = useCIDAuthentication();

  if (!isAuthenticated) {
    return (
      <CIDAuthenticationGate 
        onValidate={validateCID}
        title="Security Incident Monitoring"
        description="This subpage contains sensitive security incident data requiring CID authentication."
      />
    );
  }

  const securityIncidents = [
    {
      id: 'INC-2025-001',
      type: 'Failed Login Attempts',
      severity: 'Medium',
      status: 'Investigating',
      timestamp: '2025-01-22 14:30:00',
      affectedSystems: ['Auth Service', 'User Portal'],
      description: 'Multiple failed login attempts detected from suspicious IP ranges'
    },
    {
      id: 'INC-2025-002',
      type: 'Unusual API Activity',
      severity: 'Low',
      status: 'Resolved',
      timestamp: '2025-01-21 09:15:00',
      affectedSystems: ['API Gateway'],
      description: 'Elevated API request volume outside normal patterns'
    },
    {
      id: 'INC-2025-003',
      type: 'Access Anomaly',
      severity: 'High',
      status: 'Under Review',
      timestamp: '2025-01-20 22:45:00',
      affectedSystems: ['Admin Panel', 'User Database'],
      description: 'Unauthorized access attempt to administrative functions'
    }
  ];

  const monitoringStats = {
    activeMonitors: 24,
    alertsToday: 7,
    resolvedIncidents: 18,
    avgResponseTime: '12m',
    securityScore: 87
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'text-green-600 dark:text-green-400';
      case 'investigating': return 'text-yellow-600 dark:text-yellow-400';
      case 'under review': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Security Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            Deck 11 Module 3 Subpage 3: Security Incident Monitoring
            <Badge variant="destructive" className="ml-auto">
              {securityLevel.toUpperCase()} SECURITY
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {monitoringStats.activeMonitors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Monitors
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {monitoringStats.alertsToday}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Alerts Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {monitoringStats.resolvedIncidents}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Resolved This Month
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {monitoringStats.avgResponseTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Response Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {monitoringStats.securityScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Security Score
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Security Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Active Security Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityIncidents.map((incident) => (
              <Card key={incident.id} className="border-l-4 border-l-red-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{incident.id}</span>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <span className={`text-sm font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </div>
                      <div className="font-medium">{incident.type}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {incident.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        Timestamp: {incident.timestamp}
                      </div>
                      <div className="text-xs text-gray-500">
                        Affected: {incident.affectedSystems.join(', ')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Monitoring Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Security Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                System Health
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                Normal
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Active Threats
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                3
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Monitors Online
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                24/24
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
              <Lock className="h-4 w-4" />
              <span>Authenticated Access - Security Level: {securityLevel}</span>
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

export default Deck11Module3Subpage3;