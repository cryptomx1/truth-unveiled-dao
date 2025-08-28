import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Award,
  Clock,
  User,
  Brain
} from 'lucide-react';

type CurriculumType = 'civic-basics' | 'policy-law' | 'electoral-systems' | 'constitutional-law' | 'public-administration';
type ValidationStatus = 'pending' | 'verified' | 'failed';
type LearningStage = 'selection' | 'studying' | 'assessment' | 'certification';

interface LearningSubmission {
  id: string;
  curriculum: CurriculumType;
  topic: string;
  zkpHash: string;
  didHash: string;
  status: ValidationStatus;
  completionPercentage: number;
  certificateHash?: string;
  timestamp: Date;
}

interface ZKPLearningModuleCardProps {
  className?: string;
}

// Static curriculum options for performance
const CURRICULUM_OPTIONS = [
  { value: 'civic-basics', label: 'Civic Basics', modules: 8, duration: '2-3 weeks' },
  { value: 'policy-law', label: 'Policy & Law', modules: 12, duration: '4-5 weeks' },
  { value: 'electoral-systems', label: 'Electoral Systems', modules: 10, duration: '3-4 weeks' },
  { value: 'constitutional-law', label: 'Constitutional Law', modules: 15, duration: '6-8 weeks' },
  { value: 'public-administration', label: 'Public Administration', modules: 14, duration: '5-6 weeks' }
] as const;

// Simplified mock submissions (reduced complexity)
const MOCK_SUBMISSIONS: LearningSubmission[] = [
  {
    id: 'learn_001',
    curriculum: 'civic-basics',
    topic: 'Rights and Responsibilities',
    zkpHash: 'zkp_learn_a1b2c3d4',
    didHash: 'did:civic:learner_001',
    status: 'verified',
    completionPercentage: 100,
    certificateHash: 'cert_hash_x7y8z9',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'learn_002',
    curriculum: 'policy-law',
    topic: 'Legislative Process',
    zkpHash: 'zkp_learn_e5f6g7h8',
    didHash: 'did:civic:learner_001',
    status: 'failed',
    completionPercentage: 45,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

export const ZKPLearningModuleCard: React.FC<ZKPLearningModuleCardProps> = ({ className }) => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumType>('civic-basics');
  const [currentStage, setCurrentStage] = useState<LearningStage>('selection');
  const [studyProgress, setStudyProgress] = useState<number>(0);

  // Memoized calculations to prevent re-renders
  const curriculumInfo = useMemo(() => 
    CURRICULUM_OPTIONS.find(opt => opt.value === selectedCurriculum) || CURRICULUM_OPTIONS[0],
    [selectedCurriculum]
  );

  const validationStats = useMemo(() => {
    const verifiedSubmissions = MOCK_SUBMISSIONS.filter(sub => sub.status === 'verified').length;
    const totalSubmissions = MOCK_SUBMISSIONS.length;
    const failureRate = ((MOCK_SUBMISSIONS.filter(sub => sub.status === 'failed').length) / totalSubmissions) * 100;
    const overallProgress = totalSubmissions > 0 ? (verifiedSubmissions / totalSubmissions) * 100 : 0;
    
    return { verifiedSubmissions, totalSubmissions, failureRate, overallProgress };
  }, []);

  // Optimized handlers
  const handleCurriculumSelect = useCallback((curriculum: CurriculumType) => {
    setSelectedCurriculum(curriculum);
    setCurrentStage('selection');
    setStudyProgress(0);
  }, []);

  const handleStartLearning = useCallback(() => {
    setCurrentStage('studying');
    setStudyProgress(0);
    
    // Simplified progress simulation (no intervals)
    setTimeout(() => {
      setStudyProgress(75);
      setTimeout(() => {
        setStudyProgress(100);
        setCurrentStage('assessment');
      }, 1000);
    }, 500);
  }, []);

  const handleCompleteAssessment = useCallback(async () => {
    setCurrentStage('certification');
    
    // Fast validation simulation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`✅ Learning validation completed for ${curriculumInfo.label}`);
    
    // Reset for next module
    setTimeout(() => {
      setCurrentStage('selection');
      setStudyProgress(0);
    }, 2000);
  }, [curriculumInfo.label]);

  const getValidationStatusInfo = useCallback((status: ValidationStatus) => {
    switch (status) {
      case 'verified':
        return { icon: <CheckCircle className="w-4 h-4" />, label: 'Verified', color: 'text-green-400' };
      case 'failed':
        return { icon: <XCircle className="w-4 h-4" />, label: 'Failed', color: 'text-red-400' };
      case 'pending':
        return { icon: <Clock className="w-4 h-4" />, label: 'Pending', color: 'text-amber-400' };
    }
  }, []);

  const validationFailureDetected = validationStats.failureRate > 15;

  return (
    <Card 
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        validationFailureDetected && 'ring-2 ring-red-500/50',
        className
      )}
      role="region"
      aria-label="ZKP Learning Module Interface"
    >
      {/* Status Indicator */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          validationFailureDetected ? 'bg-red-500' :
          currentStage === 'certification' ? 'bg-green-500' :
          currentStage === 'studying' ? 'bg-blue-500' :
          'bg-slate-500'
        )}
        aria-label={`Status: ${currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            ZKP Learning Module
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            validationFailureDetected ? 'border-red-500/30 bg-red-500/10 text-red-400' :
            currentStage === 'certification' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
            currentStage === 'studying' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
            'border-slate-500/30 bg-slate-500/10 text-slate-400'
          )}>
            <div className="flex items-center gap-1">
              {validationFailureDetected ? <AlertTriangle className="w-3 h-3" /> :
               currentStage === 'certification' ? <Award className="w-3 h-3" /> :
               currentStage === 'studying' ? <BookOpen className="w-3 h-3" /> :
               <Brain className="w-3 h-3" />}
              {validationFailureDetected ? 'Alert' :
               currentStage === 'certification' ? 'Certifying' :
               currentStage === 'studying' ? 'Learning' : 'Ready'}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          ZKP-certified learning validation with DID-linked progress tracking
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validation Failure Alert */}
        {validationFailureDetected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Validation Retry Required
              </span>
            </div>
            <div className="text-xs text-red-300">
              {validationStats.failureRate.toFixed(1)}% validation failure rate exceeds threshold
            </div>
          </div>
        )}

        {/* Curriculum Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Curriculum Selection
            </span>
          </div>
          
          <Select 
            value={selectedCurriculum} 
            onValueChange={handleCurriculumSelect}
            disabled={currentStage === 'studying' || currentStage === 'certification'}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {CURRICULUM_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-slate-200 hover:bg-slate-700"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-slate-400">
                      {option.modules} modules • {option.duration}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Study Progress */}
        {currentStage === 'studying' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-200">Study Progress</span>
              <span className="text-blue-400">{Math.round(studyProgress)}%</span>
            </div>
            <Progress value={studyProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {currentStage === 'selection' && (
            <Button
              onClick={handleStartLearning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
          )}

          {currentStage === 'assessment' && (
            <Button
              onClick={handleCompleteAssessment}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Award className="w-4 h-4 mr-2" />
              Complete Assessment
            </Button>
          )}

          {currentStage === 'certification' && (
            <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <Award className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-sm text-green-400 font-medium">Certificate Generated</div>
            </div>
          )}
        </div>

        {/* Learner Stats */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Learner Record
            </span>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Modules:</span>
                <span className="text-green-400">{validationStats.verifiedSubmissions}/{validationStats.totalSubmissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overall Progress:</span>
                <span className="text-blue-400">{validationStats.overallProgress.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stage:</span>
                <span className="text-slate-200 capitalize">{currentStage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions (simplified) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Recent Submissions
            </span>
          </div>
          
          <div className="space-y-2">
            {MOCK_SUBMISSIONS.slice(0, 2).map((submission) => {
              const statusInfo = getValidationStatusInfo(submission.status);
              
              return (
                <div
                  key={submission.id}
                  className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusInfo.icon}
                      <div className="text-xs font-medium text-slate-200">
                        {submission.topic}
                      </div>
                    </div>
                    <div className={cn('text-xs', statusInfo.color)}>
                      {statusInfo.label}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Progress: {submission.completionPercentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZKPLearningModuleCard;