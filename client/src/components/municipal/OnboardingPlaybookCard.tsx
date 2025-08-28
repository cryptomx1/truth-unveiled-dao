import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Shield, Users, FileText, MapPin, ArrowRight } from 'lucide-react';

interface PlaybookStage {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  requirements: string[];
  status: 'completed' | 'current' | 'upcoming';
  completionRate: number;
}

export const OnboardingPlaybookCard: React.FC = () => {
  const playbookStages: PlaybookStage[] = [
    {
      id: 'preparation',
      title: 'Pre-Onboarding Preparation',
      description: 'Gather required documentation and establish official contacts',
      estimatedTime: '2-3 days',
      requirements: [
        'Official government charter or incorporation documents',
        'Government seal certificate or official letterhead',
        'Primary contact official email (.gov domain preferred)',
        'List of verified municipal officials for trusted network'
      ],
      status: 'completed',
      completionRate: 100
    },
    {
      id: 'entity-registration',
      title: 'Entity Registration',
      description: 'Register municipal entity with jurisdiction details',
      estimatedTime: '1-2 hours',
      requirements: [
        'Complete entity information form',
        'Select appropriate municipal entity type',
        'Specify jurisdiction boundaries and population',
        'Upload verification documents'
      ],
      status: 'current',
      completionRate: 75
    },
    {
      id: 'official-verification',
      title: 'Official Verification',
      description: 'Verify government credentials and establish authenticity',
      estimatedTime: '3-5 days',
      requirements: [
        'Government email domain verification',
        'Document authenticity validation',
        'Cross-reference with official government databases',
        'Third-party verification through trusted municipal contacts'
      ],
      status: 'current',
      completionRate: 45
    },
    {
      id: 'network-establishment',
      title: 'Trusted Network Setup',
      description: 'Build trusted contact network and cross-verification',
      estimatedTime: '2-4 days',
      requirements: [
        'Add minimum 2 trusted municipal officials',
        'Verify contact credentials and roles',
        'Establish cross-verification relationships',
        'Configure backup authentication methods'
      ],
      status: 'upcoming',
      completionRate: 0
    },
    {
      id: 'zkp-integration',
      title: 'ZKP Integration',
      description: 'Generate privacy-preserving verification credentials',
      estimatedTime: '1 hour',
      requirements: [
        'Generate ZKP proof for municipal identity',
        'Create privacy-preserving verification stubs',
        'Integrate with decentralized identity framework',
        'Test ZKP verification workflows'
      ],
      status: 'upcoming',
      completionRate: 0
    },
    {
      id: 'pilot-activation',
      title: 'Pilot Activation',
      description: 'Activate municipal node and begin citizen onboarding',
      estimatedTime: '1-2 weeks',
      requirements: [
        'Complete all verification requirements',
        'Configure municipal-specific governance parameters',
        'Set up citizen registration and verification workflows',
        'Begin pilot citizen onboarding program'
      ],
      status: 'upcoming',
      completionRate: 0
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-slate-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'current':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'upcoming':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  const overallProgress = Math.round(
    playbookStages.reduce((sum, stage) => sum + stage.completionRate, 0) / playbookStages.length
  );

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Municipal Onboarding Playbook
        </CardTitle>
        <CardDescription className="text-slate-400">
          Step-by-step guide for municipal entity verification and activation
        </CardDescription>
        
        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-white">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {playbookStages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-slate-600 bg-slate-700/50"
            >
              {/* Stage Icon and Progress */}
              <div className="flex-shrink-0 flex flex-col items-center">
                {getStatusIcon(stage.status)}
                {index < playbookStages.length - 1 && (
                  <div className="w-px h-8 bg-slate-600 mt-2" />
                )}
              </div>
              
              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white text-sm">{stage.title}</h3>
                  <Badge className={getStatusColor(stage.status)}>
                    {stage.status}
                  </Badge>
                  <span className="text-xs text-slate-400">{stage.estimatedTime}</span>
                </div>
                
                <p className="text-sm text-slate-400 mb-3">{stage.description}</p>
                
                {/* Progress Bar for Current/Incomplete Stages */}
                {stage.completionRate > 0 && stage.completionRate < 100 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Stage Progress</span>
                      <span className="text-slate-400">{stage.completionRate}%</span>
                    </div>
                    <Progress value={stage.completionRate} className="h-1" />
                  </div>
                )}
                
                {/* Requirements List */}
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-slate-300 mb-2">Requirements:</h4>
                  {stage.requirements.map((requirement, reqIndex) => (
                    <div key={reqIndex} className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-400">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Arrow for Current Stage */}
              {stage.status === 'current' && (
                <div className="flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Key Information Footer */}
        <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <Shield className="w-4 h-4" />
                Security Level
              </div>
              <p className="text-white font-medium">Government Grade</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <Users className="w-4 h-4" />
                Support Available
              </div>
              <p className="text-white font-medium">24/7 Technical</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <MapPin className="w-4 h-4" />
                Regional Support
              </div>
              <p className="text-white font-medium">North America</p>
            </div>
          </div>
        </div>

        {/* Quick Start Tips */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Quick Start Tips:</h4>
          <ul className="text-xs text-blue-200 space-y-1">
            <li>• Ensure your government email domain is accessible for verification</li>
            <li>• Have official documents ready in PDF format (max 10MB each)</li>
            <li>• Coordinate with at least 2 municipal officials for trusted network setup</li>
            <li>• Allow 5-10 business days for complete verification process</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};