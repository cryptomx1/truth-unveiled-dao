import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Scale,
  Gavel,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  User,
  Crown,
  Hash,
  Zap,
  Calendar,
  FileText,
  ArrowUp,
  Settings
} from 'lucide-react';

type UserRole = 'arbitrator' | 'observer';
type ResolutionStatus = 'pending' | 'reviewed' | 'resolved';
type ResolutionOutcome = 'approved' | 'denied' | 'escalated';

interface AppealRecord {
  id: string;
  appealId: string;
  appealReason: string;
  submittedBy: string;
  submittedAt: Date;
  justification: string;
  linkedPolicyId: string;
  status: ResolutionStatus;
  outcome?: ResolutionOutcome;
  resolvedBy?: string;
  resolvedAt?: Date;
  escalationReason?: string;
  zkpValidation: boolean;
  didVerified: boolean;
  biometricHash: string;
}

interface PolicyAppealResolutionCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock appeal records linked to PolicyAppealCard
const MOCK_APPEAL_RECORDS: AppealRecord[] = [
  {
    id: 'resolution_001',
    appealId: 'appeal_789123',
    appealReason: 'Disproportionate Enforcement',
    submittedBy: 'did:civic:citizen_a1b2c3',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    justification: 'The enforcement action was excessive given the minor nature of the violation. Request review.',
    linkedPolicyId: 'policy_001',
    status: 'pending',
    zkpValidation: true,
    didVerified: true,
    biometricHash: 'bio_hash_a1b2c3d4'
  },
  {
    id: 'resolution_002',
    appealId: 'appeal_456789',
    appealReason: 'Incorrect Enforcement',
    submittedBy: 'did:civic:citizen_d5e6f7',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    justification: 'The policy was misapplied in this case. The violation does not match the enforcement action.',
    linkedPolicyId: 'policy_002',
    status: 'resolved',
    outcome: 'approved',
    resolvedBy: 'arbitrator_001',
    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    zkpValidation: true,
    didVerified: true,
    biometricHash: 'bio_hash_d5e6f7g8'
  },
  {
    id: 'resolution_003',
    appealId: 'appeal_123456',
    appealReason: 'Jurisdiction Error',
    submittedBy: 'did:civic:citizen_h9i0j1',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    justification: 'This enforcement falls outside the jurisdiction of the local authority.',
    linkedPolicyId: 'policy_003',
    status: 'resolved',
    outcome: 'escalated',
    resolvedBy: 'arbitrator_002',
    resolvedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    escalationReason: 'Requires DAO review for jurisdictional clarity',
    zkpValidation: false,
    didVerified: true,
    biometricHash: 'bio_hash_h9i0j1k2'
  },
  {
    id: 'resolution_004',
    appealId: 'appeal_987654',
    appealReason: 'Procedural Violation',
    submittedBy: 'did:civic:citizen_l3m4n5',
    submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    justification: 'The enforcement did not follow proper procedural protocols.',
    linkedPolicyId: 'policy_004',
    status: 'resolved',
    outcome: 'denied',
    resolvedBy: 'arbitrator_001',
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    zkpValidation: true,
    didVerified: false,
    biometricHash: 'bio_hash_l3m4n5o6'
  }
];

// Get resolution status info
const getResolutionStatusInfo = (status: ResolutionStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        label: 'Pending Review',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        ringColor: 'ring-amber-400/50'
      };
    case 'reviewed':
      return {
        icon: <Eye className="w-4 h-4 text-blue-400" />,
        label: 'Under Review',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        ringColor: 'ring-blue-400/50'
      };
    case 'resolved':
      return {
        icon: <Gavel className="w-4 h-4 text-green-400" />,
        label: 'Resolved',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        ringColor: 'ring-green-400/50'
      };
  }
};

// Get resolution outcome info
const getResolutionOutcomeInfo = (outcome: ResolutionOutcome) => {
  switch (outcome) {
    case 'approved':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        label: 'Appeal Approved',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20'
      };
    case 'denied':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Appeal Denied',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20'
      };
    case 'escalated':
      return {
        icon: <ArrowUp className="w-4 h-4 text-amber-400" />,
        label: 'Escalated to DAO',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20'
      };
  }
};

// Get user role info
const getUserRoleInfo = (role: UserRole) => {
  switch (role) {
    case 'arbitrator':
      return {
        icon: <Crown className="w-4 h-4" />,
        label: 'Arbitrator',
        color: 'text-purple-400',
        canResolve: true
      };
    case 'observer':
      return {
        icon: <Eye className="w-4 h-4" />,
        label: 'Observer',
        color: 'text-slate-400',
        canResolve: false
      };
  }
};

// Format timestamp
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
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const PolicyAppealResolutionCard: React.FC<PolicyAppealResolutionCardProps> = ({ className }) => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('arbitrator');
  const [selectedAppeal, setSelectedAppeal] = useState<AppealRecord | null>(null);
  const [appeals, setAppeals] = useState<AppealRecord[]>(MOCK_APPEAL_RECORDS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [pushbackTriggered, setPushbackTriggered] = useState<boolean>(false);
  const [autoDenialRate, setAutoDenialRate] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`PolicyAppealResolutionCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`PolicyAppealResolutionCard render time: ${renderTime.toFixed(2)}ms ✅`);
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
            speakMessage("Appeal resolution interface active", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Monitor auto-denial rate and pushback triggers (simulate >10% denial rate)
  useEffect(() => {
    const interval = setInterval(() => {
      const denialRate = Math.random() * 15; // 0-15% range
      setAutoDenialRate(denialRate);
      
      if (denialRate > 10) {
        setPushbackTriggered(true);
        console.log(`⚠️ Pushback triggered: ${denialRate.toFixed(1)}% auto-denial rate`);
      } else {
        setPushbackTriggered(false);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setCurrentUserRole(role);
    const roleInfo = getUserRoleInfo(role);
    speakMessage(`Role changed to: ${roleInfo.label}`);
  };

  // Handle appeal selection
  const handleAppealSelect = (appeal: AppealRecord) => {
    setSelectedAppeal(appeal);
    speakMessage(`Appeal selected: ${appeal.appealId}`);
  };

  // Handle resolution actions
  const handleResolveAppeal = async (outcome: ResolutionOutcome, escalationReason?: string) => {
    if (!selectedAppeal || currentUserRole !== 'arbitrator') {
      speakMessage("Authorization required for resolution");
      return;
    }

    setIsProcessing(true);

    // Simulate resolution processing
    await new Promise(resolve => setTimeout(resolve, 150)); // <200ms full flow target

    const updatedAppeal: AppealRecord = {
      ...selectedAppeal,
      status: 'resolved',
      outcome: outcome,
      resolvedBy: 'arbitrator_current',
      resolvedAt: new Date(),
      escalationReason: escalationReason
    };

    setAppeals(prev => prev.map(appeal => 
      appeal.id === selectedAppeal.id ? updatedAppeal : appeal
    ));
    setSelectedAppeal(updatedAppeal);
    setIsProcessing(false);

    const outcomeInfo = getResolutionOutcomeInfo(outcome);
    speakMessage(`Appeal ${outcome}`);
  };

  // Handle escalate all appeals
  const handleEscalateAll = async () => {
    if (currentUserRole !== 'arbitrator') return;

    setIsProcessing(true);
    
    const pendingAppeals = appeals.filter(appeal => appeal.status === 'pending');
    const updatedAppeals = appeals.map(appeal => 
      appeal.status === 'pending' 
        ? {
            ...appeal,
            status: 'resolved' as ResolutionStatus,
            outcome: 'escalated' as ResolutionOutcome,
            resolvedBy: 'arbitrator_batch',
            resolvedAt: new Date(),
            escalationReason: 'Batch escalation due to high denial rate'
          }
        : appeal
    );

    setAppeals(updatedAppeals);
    setIsProcessing(false);
    setPushbackTriggered(false);
    
    speakMessage(`${pendingAppeals.length} appeals escalated to DAO`);
  };

  const roleInfo = getUserRoleInfo(currentUserRole);
  const pendingAppeals = appeals.filter(appeal => appeal.status === 'pending');
  const resolvedAppeals = appeals.filter(appeal => appeal.status === 'resolved');

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
      aria-label="Policy Appeal Resolution Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          pushbackTriggered ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        )}
        aria-label={pushbackTriggered ? "Status: Alert" : "Status: Active"}
        title={pushbackTriggered ? `${autoDenialRate.toFixed(1)}% auto-denial rate detected` : "Resolution system active"}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            Appeal Resolution
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            roleInfo.color.replace('text-', 'border-').replace('-400', '-500/30'),
            roleInfo.color.replace('text-', 'bg-').replace('-400', '-500/10'),
            roleInfo.color
          )}>
            <div className="flex items-center gap-1">
              {roleInfo.icon}
              {roleInfo.label}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Arbitrate and resolve policy enforcement appeals
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Access Level
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleRoleChange('arbitrator')}
              variant={currentUserRole === 'arbitrator' ? "default" : "outline"}
              size="sm"
              className={cn(
                'flex-1 min-h-[40px]',
                currentUserRole === 'arbitrator' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              )}
            >
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span className="text-xs">Arbitrator</span>
              </div>
            </Button>
            <Button
              onClick={() => handleRoleChange('observer')}
              variant={currentUserRole === 'observer' ? "default" : "outline"}
              size="sm"
              className={cn(
                'flex-1 min-h-[40px]',
                currentUserRole === 'observer' 
                  ? 'bg-slate-600 hover:bg-slate-700 text-white'
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              )}
            >
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">Observer</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Appeals Summary */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              Appeals Overview
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{pendingAppeals.length}</div>
              <div className="text-slate-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{resolvedAppeals.length}</div>
              <div className="text-slate-400">Resolved</div>
            </div>
          </div>
        </div>

        {/* Pushback Alert */}
        {pushbackTriggered && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                High Denial Rate Alert
              </span>
            </div>
            <div className="text-xs text-red-300 mb-3">
              Auto-denial rate: {autoDenialRate.toFixed(1)}% (exceeds 10% threshold)
            </div>
            
            {roleInfo.canResolve && (
              <Button
                onClick={handleEscalateAll}
                disabled={isProcessing}
                size="sm"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-3 h-3" />
                  Escalate All to DAO
                </div>
              </Button>
            )}
          </div>
        )}

        {/* Appeals List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Appeal Records
            </span>
          </div>
          
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2 pr-4">
              {appeals.map((appeal) => {
                const statusInfo = getResolutionStatusInfo(appeal.status);
                const outcomeInfo = appeal.outcome ? getResolutionOutcomeInfo(appeal.outcome) : null;
                
                return (
                  <div
                    key={appeal.id}
                    onClick={() => handleAppealSelect(appeal)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedAppeal?.id === appeal.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-blue-400">{appeal.appealId}</span>
                      <div className="flex items-center gap-1">
                        {statusInfo.icon}
                        <span className={cn('text-xs', statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-300 mb-1">
                      {appeal.appealReason}
                    </div>
                    
                    <div className="text-xs text-slate-400">
                      Submitted: {getRelativeTime(appeal.submittedAt)}
                    </div>
                    
                    {outcomeInfo && (
                      <div className="flex items-center gap-1 mt-2">
                        {outcomeInfo.icon}
                        <span className={cn('text-xs', outcomeInfo.color)}>
                          {outcomeInfo.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Appeal Details */}
        {selectedAppeal && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-200">
                Appeal Details
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-700/30 p-3 rounded text-xs">
                <div className="font-medium text-slate-200 mb-1">Justification:</div>
                <div className="text-slate-300">{selectedAppeal.justification}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Submitted By:</span>
                  <div className="text-blue-400 font-mono break-all">
                    {selectedAppeal.submittedBy}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Policy ID:</span>
                  <div className="text-green-400 font-mono">
                    {selectedAppeal.linkedPolicyId}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">ZKP Validation:</span>
                  <span className={selectedAppeal.zkpValidation ? 'text-green-400' : 'text-red-400'}>
                    {selectedAppeal.zkpValidation ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DID Verified:</span>
                  <span className={selectedAppeal.didVerified ? 'text-green-400' : 'text-red-400'}>
                    {selectedAppeal.didVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Biometric Hash:</span>
                  <span className="text-purple-400 font-mono">
                    {selectedAppeal.biometricHash}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Actions */}
        {selectedAppeal && selectedAppeal.status === 'pending' && roleInfo.canResolve && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleResolveAppeal('approved')}
              disabled={isProcessing}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white min-h-[48px]"
            >
              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Approve</span>
              </div>
            </Button>
            
            <Button
              onClick={() => handleResolveAppeal('denied')}
              disabled={isProcessing}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white min-h-[48px]"
            >
              <div className="flex flex-col items-center gap-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs">Deny</span>
              </div>
            </Button>
            
            <Button
              onClick={() => handleResolveAppeal('escalated', 'Requires DAO review')}
              disabled={isProcessing}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white min-h-[48px]"
            >
              <div className="flex flex-col items-center gap-1">
                <ArrowUp className="w-4 h-4" />
                <span className="text-xs">Escalate</span>
              </div>
            </Button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-sm text-blue-400">Processing...</span>
            </div>
          </div>
        )}

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Appeal resolution interface active,
          Current role: {roleInfo.label},
          {selectedAppeal && `Selected appeal: ${selectedAppeal.appealId}`},
          Pending appeals: {pendingAppeals.length},
          {pushbackTriggered && `Alert: ${autoDenialRate.toFixed(1)}% auto-denial rate`}
        </div>
      </CardContent>
    </Card>
  );
};
export default PolicyAppealResolutionCard;
