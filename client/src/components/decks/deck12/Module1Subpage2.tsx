import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCIDAuthentication } from '@/hooks/useCIDAuthentication';
import { CIDAuthenticationGate } from '@/components/auth/CIDAuthenticationGate';
import { BarChart, TrendingUp, Database, Eye, Download } from 'lucide-react';

interface AnalyticsReportsProps {
  subpageId?: string;
  reportType?: 'standard' | 'detailed' | 'executive';
}

export const Deck12Module1Subpage2: React.FC<AnalyticsReportsProps> = ({ 
  subpageId = 'analytics-reports',
  reportType = 'detailed' 
}) => {
  const { isAuthenticated, cidStatus, validateCID } = useCIDAuthentication();
  const [selectedReport, setSelectedReport] = useState<string>('');

  if (!isAuthenticated) {
    return (
      <CIDAuthenticationGate 
        onValidate={validateCID}
        title="Analytics Reports Access"
        description="Access to detailed analytics reports requires CID authentication for data privacy compliance."
      />
    );
  }

  const analyticsData = {
    totalReports: 47,
    reportsGenerated: 312,
    dataPoints: 12745,
    lastUpdate: '2025-01-22 15:30:00',
    accuracy: 96.8
  };

  const availableReports = [
    {
      id: 'civic-engagement',
      title: 'Civic Engagement Analytics',
      description: 'Comprehensive analysis of citizen participation trends',
      lastGenerated: '2025-01-22',
      status: 'Ready',
      size: '2.4 MB',
      type: 'PDF'
    },
    {
      id: 'governance-metrics',
      title: 'Governance Metrics Report',
      description: 'Decision-making processes and voting pattern analysis',
      lastGenerated: '2025-01-21',
      status: 'Ready',
      size: '1.8 MB',
      type: 'PDF'
    },
    {
      id: 'platform-usage',
      title: 'Platform Usage Statistics',
      description: 'User activity, feature adoption, and system performance',
      lastGenerated: '2025-01-22',
      status: 'Generating',
      size: '3.1 MB',
      type: 'Excel'
    },
    {
      id: 'trust-analysis',
      title: 'Trust & Reputation Analysis',
      description: 'Trust score distribution and reputation system insights',
      lastGenerated: '2025-01-20',
      status: 'Ready',
      size: '1.2 MB',
      type: 'PDF'
    }
  ];

  const keyMetrics = [
    { label: 'User Engagement Rate', value: '78.4%', trend: '+5.2%', color: 'text-green-600' },
    { label: 'Platform Adoption', value: '92.1%', trend: '+2.8%', color: 'text-green-600' },
    { label: 'Trust Score Average', value: '8.3/10', trend: '+0.4', color: 'text-green-600' },
    { label: 'Response Time', value: '1.2s', trend: '-0.3s', color: 'text-green-600' }
  ];

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId);
    console.log(`📊 Generating report: ${reportId}`);
    // Simulate report generation
  };

  const handleDownloadReport = (report: any) => {
    console.log(`📥 Downloading report: ${report.title}`);
    // Simulate download
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready': return 'bg-green-500';
      case 'generating': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Deck 12 Module 1 Subpage 2: Analytics Reports
            <Badge variant="outline" className="ml-auto">
              {reportType.toUpperCase()} ACCESS
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analyticsData.totalReports}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available Reports
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analyticsData.reportsGenerated}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Reports Generated
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analyticsData.dataPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Data Points
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {analyticsData.accuracy}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Data Accuracy
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Last Updated
              </div>
              <div className="text-sm font-semibold">
                {analyticsData.lastUpdate.split(' ')[0]}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Analytics Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </div>
                <div className="text-xl font-bold">
                  {metric.value}
                </div>
                <div className={`text-sm ${metric.color} dark:${metric.color.replace('text-', 'text-')}`}>
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Available Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableReports.map((report) => (
              <Card key={report.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{report.title}</span>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {report.description}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Last generated: {report.lastGenerated}</span>
                        <span>Size: {report.size}</span>
                        <span>Type: {report.type}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={report.status === 'Generating'}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      {report.status === 'Ready' && (
                        <Button 
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  {selectedReport === report.id && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Generating {report.title}...
                      </div>
                      <Progress value={65} className="h-2 mt-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Report Generation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Active Generation Tasks:</span>
              <Badge>2 running</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Queue Position:</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Next in line</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Estimated Completion:</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">~3 minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Authenticated Analytics Access - Report Type: {reportType}</span>
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

export default Deck12Module1Subpage2;