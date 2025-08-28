import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileText,
  User,
  Hash,
  Zap,
  Eye,
  MessageSquare,
  Calendar
} from 'lucide-react';

type AppealReason = 'disproportionate' | 'incorrect-enforcement' | 'jurisdiction-error' | 'procedural-violation';
type AppealStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';

interface AppealData {
  id: string;
  appealReason: AppealReason;
  justification: string;
  status: AppealStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  linkedEnforcementId: string;
  userRole: string;
  didReference: string;
  zkpValidation: boolean;
  processingErrors: number;
}

interface PolicyAppealCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock appeal data
const INITIAL_APPEAL_DATA: AppealData = {
  id: '',
  appealReason: 'disproportionate',
  justification: '',
  status: 'draft',
  linkedEnforcementId: 'policy_001',
  userRole: 'citizen',
  didReference: 'did:civic:abc123def456',
  zkpValidation: true,
  processingErrors: 0
};

// Mock processing error simulation (15% error rate)
const MOCK_PROCESSING_ERRORS = [
  { errorRate: 5, description: 'Minor validation delays' },
  { errorRate: 12, description: 'Cross-deck sync issues' },
  { errorRate: 18, description: 'ZKP signature mismatch' },
  { errorRate: 8, description: 'DID lineage verification lag' }
];

// Get appeal reason display info
const getAppealReasonInfo = (reason: AppealReason) => {
  switch (reason) {
    case 'disproportionate':
      return {
        icon: <Scale className="w-4 h-4" />,
        label: 'Disproportionate Enforcement',
        color: 'text-amber-400'
      };
    case 'incorrect-enforcement':
      return {
        icon: <XCircle className="w-4 h-4" />,
        label: 'Incorrect Enforcement',
        color: 'text-red-400'
      };
    case 'jurisdiction-error':
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Jurisdiction Error',
        color: 'text-orange-400'
      };
    case 'procedural-violation':
      return {
        icon: <FileText className="w-4 h-4" />,
        label: 'Procedural Violation',
        color: 'text-purple-400'
      };
  }
};

// Get appeal status styling
const getAppealStatusInfo = (status: AppealStatus) => {
  switch (status) {
    case 'draft':
      return {
        icon: <MessageSquare className="w-4 h-4 text-slate-400" />,
        label: 'Draft',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20',
        ringColor: 'ring-slate-400/50'
      };
    case 'submitted':
      return {
        icon: <Send className="w-4 h-4 text-blue-400" />,
        label: 'Submitted',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        ringColor: 'ring-blue-400/50'
      };
    case 'under-review':
      return {
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        label: 'Under Review',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        ringColor: 'ring-amber-400/50'
      };
    case 'approved':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        label: 'Approved',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        ringColor: 'ring-green-400/50'
      };
    case 'rejected':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Rejected',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        ringColor: 'ring-red-400/50'
      };
  }
};

// Format timestamp for display
const formatTimestamp = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get relative time
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const PolicyAppealCard: React.FC<PolicyAppealCardProps> = ({ className }) => {
  const [appealData, setAppealData] = useState<AppealData>(INITIAL_APPEAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [pushbackTriggered, setPushbackTriggered] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<typeof MOCK_PROCESSING_ERRORS[0] | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`PolicyAppealCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`PolicyAppealCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      console.log(`🔊 TTS throttled: "${message}" (${now - ttsStatus.lastTrigger}ms since last)`);
      return;
    }
    
    if (!ttsStatus.isReady) {
      console.log(`🔊 TTS not ready: "${message}"`);
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
          console.log(`🔊 TTS completed: "${message}"`);
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS error: "${message}"`);
        };
        
        window.speechSynthesis.speak(utterance);
        console.log(`🔊 TTS started: "${message}"`);
      }, 40); // <40ms latency requirement
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Initialize TTS on mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          // Mount TTS message
          setTimeout(() => {
            speakMessage("Policy appeal interface ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Simulate processing errors and pushback triggers
  useEffect(() => {
    if (appealData.status === 'under-review' && isProcessing) {
      const randomError = MOCK_PROCESSING_ERRORS[Math.floor(Math.random() * MOCK_PROCESSING_ERRORS.length)];
      setCurrentError(randomError);
      
      if (randomError.errorRate > 10) {
        setPushbackTriggered(true);
        console.log(`⚠️ Pushback triggered: ${randomError.errorRate}% error rate - ${randomError.description}`);
      } else {
        setPushbackTriggered(false);
      }
    }
  }, [appealData.status, isProcessing]);

  // Handle appeal reason change
  const handleReasonChange = (reason: AppealReason) => {
    setAppealData(prev => ({ ...prev, appealReason: reason }));
    
    const reasonInfo = getAppealReasonInfo(reason);
    speakMessage(`Appeal reason selected: ${reasonInfo.label}`);
  };

  // Handle justification text change
  const handleJustificationChange = (text: string) => {
    setAppealData(prev => ({ ...prev, justification: text }));
  };

  // Handle appeal submission
  const handleSubmitAppeal = async () => {
    if (!appealData.justification.trim()) {
      speakMessage("Please provide justification for your appeal");
      return;
    }

    setIsSubmitting(true);
    
    // Generate appeal ID
    const appealId = `appeal_${Date.now().toString().slice(-6)}`;
    
    // Simulate submission processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setAppealData(prev => ({
      ...prev,
      id: appealId,
      status: 'submitted',
      submittedAt: new Date()
    }));
    
    setIsSubmitting(false);
    speakMessage("Appeal submitted for review");
    
    // Auto-progress to under review after 2 seconds
    setTimeout(() => {
      setIsProcessing(true);
      setAppealData(prev => ({ ...prev, status: 'under-review' }));
      
      // Simulate review process (3 seconds)
      setTimeout(() => {
        const isApproved = Math.random() > 0.4; // 60% approval rate
        const finalStatus: AppealStatus = isApproved ? 'approved' : 'rejected';
        
        setAppealData(prev => ({
          ...prev,
          status: finalStatus,
          reviewedAt: new Date()
        }));
        setIsProcessing(false);
        
        speakMessage(`Appeal status: ${finalStatus}`);
      }, 3000);
    }, 2000);
  };

  // Reset appeal to draft
  const handleResetAppeal = () => {
    setAppealData(INITIAL_APPEAL_DATA);
    setPushbackTriggered(false);
    setCurrentError(null);
    setIsProcessing(false);
    speakMessage("Appeal reset to draft");
  };

  const reasonInfo = getAppealReasonInfo(appealData.appealReason);
  const statusInfo = getAppealStatusInfo(appealData.status);
  const canSubmit = appealData.status === 'draft' && appealData.justification.trim().length > 0;
  const canReset = appealData.status !== 'draft';

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Policy Appeal Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          pushbackTriggered ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
        )}
        aria-label={pushbackTriggered ? "Status: Alert" : "Status: Active"}
        title={pushbackTriggered ? "Processing errors detected" : "Appeal system active"}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            Policy Appeal
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            statusInfo.color.replace('text-', 'border-').replace('-400', '-500/30'),
            statusInfo.color.replace('text-', 'bg-').replace('-400', '-500/10'),
            statusInfo.color
          )}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.label}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Submit appeals for policy enforcement decisions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Appeal Status Progress */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              Appeal Status
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className={cn(
              'relative p-2 rounded-full',
              statusInfo.bgColor,
              ['submitted', 'under-review', 'approved', 'rejected'].includes(appealData.status) 
                ? 'ring-2 ' + statusInfo.ringColor : ''
            )}>
              {statusInfo.icon}
              
              {/* Animated status ring for active processing */}
              {isProcessing && appealData.status === 'under-review' && (
                <div className="absolute inset-0 rounded-full ring-2 ring-amber-400/30 animate-ping" />
              )}
            </div>
            
            <div className="flex-1 ml-3">
              <div className="text-sm font-medium text-slate-200">
                {statusInfo.label}
              </div>
              {appealData.submittedAt && (
                <div className="text-xs text-slate-400">
                  Submitted: {getRelativeTime(appealData.submittedAt)}
                </div>
              )}
              {appealData.reviewedAt && (
                <div className="text-xs text-slate-400">
                  Reviewed: {getRelativeTime(appealData.reviewedAt)}
                </div>
              )}
            </div>
          </div>
          
          {/* Processing error indicator */}
          {pushbackTriggered && currentError && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs">
              <div className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Processing Error ({currentError.errorRate}%)</span>
              </div>
              <div className="text-red-300 mt-1">{currentError.description}</div>
            </div>
          )}
        </div>

        {/* Appeal Form (only show in draft mode) */}
        {appealData.status === 'draft' && (
          <>
            {/* Appeal Reason Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">
                  Appeal Reason
                </span>
              </div>
              
              <Select value={appealData.appealReason} onValueChange={handleReasonChange}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select appeal reason" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="disproportionate">Disproportionate Enforcement</SelectItem>
                  <SelectItem value="incorrect-enforcement">Incorrect Enforcement</SelectItem>
                  <SelectItem value="jurisdiction-error">Jurisdiction Error</SelectItem>
                  <SelectItem value="procedural-violation">Procedural Violation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Justification Text Area */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">
                  Justification
                </span>
              </div>
              
              <Textarea
                value={appealData.justification}
                onChange={(e) => handleJustificationChange(e.target.value)}
                placeholder="Provide detailed justification for your appeal..."
                className="bg-slate-800/50 border-slate-600 text-slate-200 min-h-[100px]"
                maxLength={500}
              />
              
              <div className="text-xs text-slate-400 text-right">
                {appealData.justification.length}/500 characters
              </div>
            </div>
          </>
        )}

        {/* Appeal Details (show for submitted appeals) */}
        {appealData.status !== 'draft' && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={reasonInfo.color}>
                {reasonInfo.icon}
              </div>
              <span className="text-sm font-medium text-slate-200">
                {reasonInfo.label}
              </span>
            </div>
            
            <div className="text-xs text-slate-300 mb-3 bg-slate-700/30 p-3 rounded">
              {appealData.justification}
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Appeal ID:</span>
                <span className="text-slate-300 font-mono">{appealData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Linked Enforcement:</span>
                <span className="text-blue-400 font-mono">{appealData.linkedEnforcementId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Cross-Deck Validation */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Validation
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">User Role:</span>
              <span className="text-blue-400">{appealData.userRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DID Reference (Deck #12):</span>
              <span className="text-green-400 font-mono text-xs break-all">
                {appealData.didReference}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ZKP Validation:</span>
              <span className={appealData.zkpValidation ? 'text-green-400' : 'text-red-400'}>
                {appealData.zkpValidation ? 'Valid' : 'Invalid'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canSubmit && (
            <Button
              onClick={handleSubmitAppeal}
              disabled={isSubmitting}
              className={cn(
                'flex-1 min-h-[48px]',
                'bg-purple-600 hover:bg-purple-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Appeal
                </div>
              )}
            </Button>
          )}
          
          {canReset && (
            <Button
              onClick={handleResetAppeal}
              variant="outline"
              className={cn(
                'min-h-[48px]',
                canSubmit ? 'flex-none px-4' : 'flex-1',
                'border-slate-600 text-slate-300 hover:bg-slate-700'
              )}
            >
              <MessageSquare className="w-4 h-4" />
              {!canSubmit && <span className="ml-2">New Appeal</span>}
            </Button>
          )}
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Policy appeal interface ready,
          Appeal status: {statusInfo.label},
          Reason: {reasonInfo.label},
          {pushbackTriggered && 'Processing errors detected'}
        </div>
      </CardContent>
    </Card>
  );
};
export default PolicyAppealCard;
