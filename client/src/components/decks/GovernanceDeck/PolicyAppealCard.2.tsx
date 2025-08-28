import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Calendar,
  RotateCcw,
  Zap
} from 'lucide-react';

type AppealStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';

interface AppealStatusData {
  id: string;
  status: AppealStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  processingErrors: number;
  zkpValidation: boolean;
  pushbackTriggered: boolean;
  appealReason: string;
  reviewDuration?: number; // in minutes
}

interface AppealStatusTrackerProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock appeal status data
const MOCK_APPEAL_STATUS: AppealStatusData = {
  id: 'appeal_001',
  status: 'submitted',
  submittedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  processingErrors: 2,
  zkpValidation: true,
  pushbackTriggered: false,
  appealReason: 'Disproportionate Response',
  reviewDuration: 45
};

// Get appeal status display info
const getAppealStatusInfo = (status: AppealStatus) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Draft',
        icon: Clock,
        color: 'text-gray-400',
        bgColor: 'bg-gray-900/50',
        borderColor: 'border-gray-700',
        description: 'Appeal is being prepared'
      };
    case 'submitted':
      return {
        label: 'Submitted',
        icon: Eye,
        color: 'text-blue-400',
        bgColor: 'bg-blue-900/50',
        borderColor: 'border-blue-700',
        description: 'Appeal has been submitted for review'
      };
    case 'under-review':
      return {
        label: 'Under Review',
        icon: Clock,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-700',
        description: 'Appeal is being reviewed by authorities'
      };
    case 'approved':
      return {
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-700',
        description: 'Appeal has been approved'
      };
    case 'rejected':
      return {
        label: 'Rejected',
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-900/50',
        borderColor: 'border-red-700',
        description: 'Appeal has been rejected'
      };
    default:
      return {
        label: 'Unknown',
        icon: AlertTriangle,
        color: 'text-gray-400',
        bgColor: 'bg-gray-900/50',
        borderColor: 'border-gray-700',
        description: 'Status unknown'
      };
  }
};

// Status progression order
const STATUS_PROGRESSION: AppealStatus[] = ['draft', 'submitted', 'under-review', 'approved'];

export const AppealStatusTracker: React.FC<AppealStatusTrackerProps> = ({ className }) => {
  const [statusData, setStatusData] = useState<AppealStatusData>(MOCK_APPEAL_STATUS);
  const [isProgressing, setIsProgressing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`AppealStatusTracker render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`AppealStatusTracker render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Initialize TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setTtsStatus(prev => ({ ...prev, isReady: true }));
    }
  }, []);

  // Simulate status progression
  useEffect(() => {
    if (statusData.status === 'submitted' || statusData.status === 'under-review') {
      const timer = setTimeout(() => {
        autoProgressStatus();
      }, 5000); // Auto progress after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [statusData.status]);

  // TTS Integration
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      return;
    }
    
    if (!ttsStatus.isReady) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          lastTrigger: now 
        }));
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
        };
        
        window.speechSynthesis.speak(utterance);
      }, 40);
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Auto progress status simulation
  const autoProgressStatus = () => {
    setIsProgressing(true);
    
    setTimeout(() => {
      setStatusData(prev => {
        const currentIndex = STATUS_PROGRESSION.indexOf(prev.status);
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < STATUS_PROGRESSION.length) {
          const newStatus = STATUS_PROGRESSION[nextIndex];
          const now = new Date();
          
          // Simulate 15% processing error rate for pushback trigger
          const hasError = Math.random() < 0.15;
          
          const newData = {
            ...prev,
            status: newStatus,
            reviewedAt: newStatus === 'approved' || newStatus === 'rejected' ? now : prev.reviewedAt,
            processingErrors: hasError ? prev.processingErrors + 1 : prev.processingErrors,
            pushbackTriggered: hasError && prev.processingErrors >= 2
          };
          
          speakMessage(`Appeal status: ${getAppealStatusInfo(newStatus).label}`);
          
          return newData;
        }
        
        return prev;
      });
      
      setIsProgressing(false);
    }, 2000);
  };

  // Handle manual status reset
  const handleReset = () => {
    setStatusData({
      ...MOCK_APPEAL_STATUS,
      status: 'draft',
      submittedAt: undefined,
      reviewedAt: undefined,
      processingErrors: 0,
      pushbackTriggered: false
    });
    
    speakMessage("Appeal status reset to draft");
  };

  const statusInfo = getAppealStatusInfo(statusData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Card 
      className={cn(
        'bg-slate-800 border-slate-700 shadow-xl max-h-[600px] w-full overflow-hidden',
        className
      )}
      role="region"
      aria-label="Appeal Status Tracker"
      data-testid="appeal-status-tracker"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              statusInfo.bgColor,
              statusInfo.borderColor,
              'border'
            )}>
              <StatusIcon className={cn('w-5 h-5', statusInfo.color)} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Appeal Status</CardTitle>
              <CardDescription className="text-slate-400">Track appeal progress and updates</CardDescription>
            </div>
          </div>
          <Badge className={cn('text-white', statusInfo.bgColor, statusInfo.borderColor, 'border')}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Timeline */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-4">
          <h3 className="text-sm font-semibold text-white">Appeal Timeline</h3>
          
          <div className="space-y-3">
            {STATUS_PROGRESSION.map((status, index) => {
              const statusItemInfo = getAppealStatusInfo(status);
              const StatusItemIcon = statusItemInfo.icon;
              const isCurrent = statusData.status === status;
              const isPast = STATUS_PROGRESSION.indexOf(statusData.status) > index;
              const isActive = isCurrent || isPast;
              
              return (
                <div key={status} className="flex items-center space-x-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2',
                    isActive 
                      ? `${statusItemInfo.bgColor} ${statusItemInfo.borderColor} border` 
                      : 'bg-slate-800 border-slate-600'
                  )}>
                    <StatusItemIcon className={cn(
                      'w-4 h-4',
                      isActive ? statusItemInfo.color : 'text-slate-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-white' : 'text-slate-500'
                    )}>
                      {statusItemInfo.label}
                    </p>
                    <p className={cn(
                      'text-xs',
                      isActive ? 'text-slate-300' : 'text-slate-600'
                    )}>
                      {statusItemInfo.description}
                    </p>
                  </div>
                  {isCurrent && isProgressing && (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Appeal Details */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="text-sm font-semibold text-white">Appeal Details</h3>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Appeal ID:</span>
              <span className="text-sm font-mono text-slate-300">{statusData.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Reason:</span>
              <span className="text-sm text-slate-300">{statusData.appealReason}</span>
            </div>
            {statusData.submittedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Submitted:</span>
                <span className="text-sm text-slate-300">
                  {Math.floor((Date.now() - statusData.submittedAt.getTime()) / (1000 * 60))} min ago
                </span>
              </div>
            )}
            {statusData.reviewDuration && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Review Duration:</span>
                <span className="text-sm text-slate-300">{statusData.reviewDuration} min</span>
              </div>
            )}
          </div>
        </div>

        {/* ZKP Validation & Processing Status */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="text-sm font-semibold text-white">Validation Status</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">ZKP Validation:</span>
              <div className="flex items-center space-x-1">
                {statusData.zkpValidation ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Valid</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Invalid</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Processing Errors:</span>
              <div className="flex items-center space-x-1">
                <span className={cn(
                  'text-sm',
                  statusData.processingErrors > 2 ? 'text-red-400' : 
                  statusData.processingErrors > 0 ? 'text-yellow-400' : 'text-green-400'
                )}>
                  {statusData.processingErrors}
                </span>
                {statusData.processingErrors > 2 && (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
            
            {statusData.pushbackTriggered && (
              <div className="flex items-center space-x-2 p-2 bg-red-900/30 border border-red-700 rounded">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Pushback triggered: &gt;10% error rate</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-600 text-slate-400 hover:bg-slate-700"
            style={{ minHeight: '36px' }}
          >
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </div>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">
              Estimated resolution: {statusData.status === 'approved' || statusData.status === 'rejected' ? 'Complete' : '2-3 business days'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppealStatusTracker;