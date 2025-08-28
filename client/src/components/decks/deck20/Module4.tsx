import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCIDAuthentication } from '@/hooks/useCIDAuthentication';
import { CIDAuthenticationGate } from '@/components/auth/CIDAuthenticationGate';
import { Bot, Cpu, Brain, Activity, Settings, TrendingUp } from 'lucide-react';

interface AIIntelligenceProps {
  moduleId?: string;
  intelligenceLevel?: 'standard' | 'advanced' | 'enterprise';
}

export const Deck20Module4: React.FC<AIIntelligenceProps> = ({ 
  moduleId = 'ai-intelligence',
  intelligenceLevel = 'advanced' 
}) => {
  const { isAuthenticated, cidStatus, validateCID } = useCIDAuthentication();
  const [selectedModel, setSelectedModel] = useState<string>('');

  if (!isAuthenticated) {
    return (
      <CIDAuthenticationGate 
        onValidate={validateCID}
        title="AI Intelligence Module Access"
        description="Access to AI intelligence systems requires CID authentication for responsible AI governance."
      />
    );
  }

  const aiMetrics = {
    activeModels: 7,
    totalInferences: 34567,
    averageLatency: 127, // ms
    accuracyRate: 97.8,
    computeUsage: 68.4,
    costSavings: '$2,340'
  };

  const aiModels = [
    {
      id: 'llm-civic-001',
      name: 'Civic Language Model',
      type: 'Large Language Model',
      status: 'Active',
      accuracy: 96.2,
      usage: 89.4,
      applications: ['Policy Analysis', 'Citizen Support', 'Document Processing']
    },
    {
      id: 'cv-audit-002',
      name: 'Document Vision Analyzer',
      type: 'Computer Vision',
      status: 'Active',
      accuracy: 94.7,
      usage: 67.3,
      applications: ['Document Verification', 'Compliance Checking', 'Form Processing']
    },
    {
      id: 'predict-gov-003',
      name: 'Governance Predictor',
      type: 'Predictive Analytics',
      status: 'Active',
      accuracy: 91.5,
      usage: 45.2,
      applications: ['Policy Impact', 'Budget Forecasting', 'Resource Planning']
    },
    {
      id: 'nlp-sentiment-004',
      name: 'Citizen Sentiment Engine',
      type: 'Natural Language Processing',
      status: 'Training',
      accuracy: 89.3,
      usage: 23.1,
      applications: ['Feedback Analysis', 'Social Monitoring', 'Survey Processing']
    }
  ];

  const intelligenceCapabilities = [
    {
      name: 'Natural Language Understanding',
      capability: 95,
      trend: '+3.2%',
      description: 'Processing citizen communications and policy documents'
    },
    {
      name: 'Predictive Analytics',
      capability: 87,
      trend: '+1.8%',
      description: 'Forecasting civic trends and policy outcomes'
    },
    {
      name: 'Computer Vision',
      capability: 92,
      trend: '+2.4%',
      description: 'Document analysis and verification automation'
    },
    {
      name: 'Decision Support',
      capability: 89,
      trend: '+4.1%',
      description: 'AI-assisted governance and policy recommendations'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'training': return 'text-blue-600 dark:text-blue-400';
      case 'maintenance': return 'text-yellow-600 dark:text-yellow-400';
      case 'offline': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-600 dark:text-red-400';
    if (usage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    console.log(`🤖 Selected AI model: ${modelId}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Deck 20 Module 4: AI Intelligence Systems
            <Badge variant="outline" className="ml-auto">
              {intelligenceLevel.toUpperCase()} AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {aiMetrics.activeModels}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Models
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {aiMetrics.totalInferences.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Inferences
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {aiMetrics.averageLatency}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Latency
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {aiMetrics.accuracyRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Accuracy Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {aiMetrics.computeUsage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Compute Usage
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {aiMetrics.costSavings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Cost Savings
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Deployed AI Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiModels.map((model) => (
              <Card 
                key={model.id} 
                className={`border cursor-pointer transition-all ${
                  selectedModel === model.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => handleModelSelect(model.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{model.name}</span>
                        <Badge variant="secondary">{model.type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {model.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(model.status)}`}>
                        {model.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        {model.accuracy}% accurate
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Resource Usage:</span>
                      <span className={getUsageColor(model.usage)}>{model.usage}%</span>
                    </div>
                    <Progress value={model.usage} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Applications:</div>
                    <div className="flex flex-wrap gap-1">
                      {model.applications.map((app, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intelligence Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Intelligence Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {intelligenceCapabilities.map((capability, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{capability.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {capability.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{capability.capability}%</div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {capability.trend}
                    </div>
                  </div>
                </div>
                <Progress value={capability.capability} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Management Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Management Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Bot className="h-5 w-5" />
              <span className="text-sm">Deploy Model</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Brain className="h-5 w-5" />
              <span className="text-sm">Train Model</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Performance</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Settings className="h-5 w-5" />
              <span className="text-sm">Configure</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Ethics & Governance */}
      <Card>
        <CardHeader>
          <CardTitle>AI Ethics & Governance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                Bias Detection
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                Compliant
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Transparency Score
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                94/100
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Privacy Protection
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                Verified
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
              <Bot className="h-4 w-4" />
              <span>Authenticated AI Access - Intelligence Level: {intelligenceLevel}</span>
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

export default Deck20Module4;