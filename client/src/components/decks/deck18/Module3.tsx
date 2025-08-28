import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCIDAuthentication } from '@/hooks/useCIDAuthentication';
import { CIDAuthenticationGate } from '@/components/auth/CIDAuthenticationGate';
import { Workflow, GitBranch, Code2, Zap, CheckCircle } from 'lucide-react';

interface AutomationWorkflowsProps {
  moduleId?: string;
  automationLevel?: 'basic' | 'advanced' | 'enterprise';
}

export const Deck18Module3: React.FC<AutomationWorkflowsProps> = ({ 
  moduleId = 'automation-workflows',
  automationLevel = 'advanced' 
}) => {
  const { isAuthenticated, cidStatus, validateCID } = useCIDAuthentication();

  if (!isAuthenticated) {
    return (
      <CIDAuthenticationGate 
        onValidate={validateCID}
        title="Automation Workflows Access"
        description="Access to automation workflow management requires CID authentication for security purposes."
      />
    );
  }

  const workflowMetrics = {
    activeWorkflows: 23,
    completedToday: 147,
    successRate: 94.2,
    avgExecutionTime: 2.4, // minutes
    automationSavings: '18.7h', // hours saved today
    scheduledTasks: 89
  };

  const activeWorkflows = [
    {
      id: 'wf-001',
      name: 'Civic Data Processing',
      status: 'Running',
      progress: 67,
      runtime: '14m 32s',
      nextRun: '2025-01-22 16:30',
      priority: 'High'
    },
    {
      id: 'wf-002',
      name: 'User Notification Pipeline',
      status: 'Completed',
      progress: 100,
      runtime: '3m 45s',
      nextRun: '2025-01-22 17:00',
      priority: 'Medium'
    },
    {
      id: 'wf-003',
      name: 'Security Audit Automation',
      status: 'Running',
      progress: 23,
      runtime: '8m 12s',
      nextRun: '2025-01-22 18:00',
      priority: 'High'
    },
    {
      id: 'wf-004',
      name: 'Backup & Archive Process',
      status: 'Scheduled',
      progress: 0,
      runtime: '-',
      nextRun: '2025-01-22 22:00',
      priority: 'Low'
    }
  ];

  const automationCategories = [
    { name: 'Data Processing', active: 8, total: 12, efficiency: 96 },
    { name: 'User Management', active: 5, total: 7, efficiency: 89 },
    { name: 'Security Tasks', active: 3, total: 5, efficiency: 98 },
    { name: 'Reporting', active: 4, total: 6, efficiency: 92 },
    { name: 'System Maintenance', active: 3, total: 4, efficiency: 94 }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return 'text-blue-600 dark:text-blue-400';
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'scheduled': return 'text-orange-600 dark:text-orange-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Deck 18 Module 3: Automation Workflows
            <Badge variant="outline" className="ml-auto">
              {automationLevel.toUpperCase()} LEVEL
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {workflowMetrics.activeWorkflows}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Workflows
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {workflowMetrics.completedToday}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completed Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {workflowMetrics.successRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {workflowMetrics.avgExecutionTime}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Runtime
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {workflowMetrics.automationSavings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Time Saved
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {workflowMetrics.scheduledTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Scheduled
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Active Automation Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <Card key={workflow.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{workflow.name}</span>
                        <Badge className={getPriorityColor(workflow.priority)}>
                          {workflow.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {workflow.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        Runtime: {workflow.runtime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{workflow.progress}%</span>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Next run: {workflow.nextRun}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Code2 className="h-4 w-4 mr-1" />
                        View Code
                      </Button>
                      <Button size="sm" variant="outline">
                        <Zap className="h-4 w-4 mr-1" />
                        Trigger Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.active}/{category.total} active
                    </span>
                    <Badge variant="secondary">
                      {category.efficiency}% efficient
                    </Badge>
                  </div>
                </div>
                <Progress value={(category.active / category.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Workflow className="h-5 w-5" />
              <span className="text-sm">New Workflow</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <GitBranch className="h-5 w-5" />
              <span className="text-sm">View Templates</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Code2 className="h-5 w-5" />
              <span className="text-sm">Script Editor</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">View Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              <span>Authenticated Automation Access - Level: {automationLevel}</span>
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

export default Deck18Module3;