import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Zap,
  Volume2,
  Settings,
  Crown,
  Users,
  Scale
} from 'lucide-react';

type PolicyType = 'curfew' | 'permit-rules' | 'public-space-access' | 'noise-ordinance';
type EnforcementStatus = 'enforced' | 'flagged' | 'revoked';
type UserRole = 'governor' | 'citizen' | 'delegate';

interface PolicyEnforcementData {
  id: string;
  policyType: PolicyType;
  title: string;
  description: string;
  enforcementStatus: EnforcementStatus;
  credentialVerified: boolean;
  didLineageValid: boolean;
  zkpSignatureValid: boolean;
  lastEnforced: Date;
  userRole: UserRole;
  enforcementSeal: string;
}

interface PolicyEnforcementCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock policy enforcement data
const MOCK_POLICIES: Record<PolicyType, PolicyEnforcementData> = {
  'curfew': {
    id: 'policy_001',
    policyType: 'curfew',
    title: 'Civic Curfew Enforcement',
    description: 'Enforces curfew regulations for public safety zones',
    enforcementStatus: 'enforced',
    credentialVerified: true,
    didLineageValid: true,
    zkpSignatureValid: true,
    lastEnforced: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    userRole: 'governor',
    enforcementSeal: 'seal_curfew_001'
  },
  'permit-rules': {
    id: 'policy_002',
    policyType: 'permit-rules',
    title: 'Construction Permit Rules',
    description: 'Validates construction permits and compliance',
    enforcementStatus: 'flagged',
    credentialVerified: true,
    didLineageValid: false,
    zkpSignatureValid: true,
    lastEnforced: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    userRole: 'delegate',
    enforcementSeal: 'seal_permit_002'
  },
  'public-space-access': {
    id: 'policy_003',
    policyType: 'public-space-access',
    title: 'Public Space Access Control',
    description: 'Manages access to restricted public areas',
    enforcementStatus: 'enforced',
    credentialVerified: true,
    didLineageValid: true,
    zkpSignatureValid: true,
    lastEnforced: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    userRole: 'citizen',
    enforcementSeal: 'seal_public_003'
  },
  'noise-ordinance': {
    id: 'policy_004',
    policyType: 'noise-ordinance',
    title: 'Noise Ordinance Enforcement',
    description: 'Enforces noise level regulations in residential zones',
    enforcementStatus: 'revoked',
    credentialVerified: false,
    didLineageValid: true,
    zkpSignatureValid: false,
    lastEnforced: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    userRole: 'citizen',
    enforcementSeal: 'seal_noise_004'
  }
};

// Get policy type display info
const getPolicyTypeInfo = (type: PolicyType) => {
  switch (type) {
    case 'curfew':
      return {
        icon: <Clock className="w-4 h-4" />,
        label: 'Curfew',
        color: 'text-blue-400'
      };
    case 'permit-rules':
      return {
        icon: <FileText className="w-4 h-4" />,
        label: 'Permit Rules',
        color: 'text-green-400'
      };
    case 'public-space-access':
      return {
        icon: <Users className="w-4 h-4" />,
        label: 'Public Access',
        color: 'text-purple-400'
      };
    case 'noise-ordinance':
      return {
        icon: <Volume2 className="w-4 h-4" />,
        label: 'Noise Control',
        color: 'text-amber-400'
      };
  }
};

// Get enforcement status styling
const getEnforcementStatusInfo = (status: EnforcementStatus) => {
  switch (status) {
    case 'enforced':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        label: 'Enforced',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        ringColor: 'ring-green-400/50'
      };
    case 'flagged':
      return {
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        label: 'Flagged',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        ringColor: 'ring-amber-400/50'
      };
    case 'revoked':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Revoked',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        ringColor: 'ring-red-400/50'
      };
  }
};

// Get user role info
const getUserRoleInfo = (role: UserRole) => {
  switch (role) {
    case 'governor':
      return {
        icon: <Crown className="w-4 h-4" />,
        label: 'Governor',
        color: 'text-purple-400'
      };
    case 'citizen':
      return {
        icon: <User className="w-4 h-4" />,
        label: 'Citizen',
        color: 'text-blue-400'
      };
    case 'delegate':
      return {
        icon: <Scale className="w-4 h-4" />,
        label: 'Delegate',
        color: 'text-green-400'
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

export const PolicyEnforcementCard: React.FC<PolicyEnforcementCardProps> = ({ className }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('curfew');
  const [currentPolicy, setCurrentPolicy] = useState<PolicyEnforcementData>(MOCK_POLICIES.curfew);
  const [isEnforcing, setIsEnforcing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [zkpSyncStartTime, setZkpSyncStartTime] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`PolicyEnforcementCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`PolicyEnforcementCard render time: ${renderTime.toFixed(2)}ms ✅`);
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
            speakMessage("Policy enforcement interface ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Handle policy selection change
  const handlePolicyChange = (policyType: PolicyType) => {
    setSelectedPolicy(policyType);
    setCurrentPolicy(MOCK_POLICIES[policyType]);
    
    const policyInfo = getPolicyTypeInfo(policyType);
    speakMessage(`Policy selected: ${policyInfo.label}`);
  };

  // Handle enforcement action
  const handleEnforcement = async () => {
    setIsEnforcing(true);
    setZkpSyncStartTime(performance.now());
    
    // Simulate cross-deck verification
    await new Promise(resolve => setTimeout(resolve, 100)); // <100ms ZKP sync target
    
    const zkpSyncTime = performance.now() - zkpSyncStartTime;
    console.log(`ZKP sync time: ${zkpSyncTime.toFixed(2)}ms ${zkpSyncTime <= 100 ? '✅' : '⚠️'}`);
    
    // Update enforcement timestamp
    setCurrentPolicy(prev => ({
      ...prev,
      lastEnforced: new Date()
    }));
    
    setIsEnforcing(false);
    
    // TTS enforcement outcome
    const statusInfo = getEnforcementStatusInfo(currentPolicy.enforcementStatus);
    speakMessage(`Policy enforcement outcome: ${statusInfo.label}`);
  };

  const policyInfo = getPolicyTypeInfo(currentPolicy.policyType);
  const statusInfo = getEnforcementStatusInfo(currentPolicy.enforcementStatus);
  const roleInfo = getUserRoleInfo(currentPolicy.userRole);

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
      aria-label="Policy Enforcement Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500"
        aria-label="Status: Active"
        title="Enforcement system active"
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Policy Enforcement
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
          Civic governance policy verification and enforcement
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Policy Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Select Policy
            </span>
          </div>
          
          <Select value={selectedPolicy} onValueChange={handlePolicyChange}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
              <SelectValue placeholder="Choose policy type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="curfew">Civic Curfew Enforcement</SelectItem>
              <SelectItem value="permit-rules">Construction Permit Rules</SelectItem>
              <SelectItem value="public-space-access">Public Space Access Control</SelectItem>
              <SelectItem value="noise-ordinance">Noise Ordinance Enforcement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Policy Info */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={policyInfo.color}>
              {policyInfo.icon}
            </div>
            <span className="text-sm font-medium text-slate-200">
              {currentPolicy.title}
            </span>
          </div>
          
          <p className="text-xs text-slate-400 mb-3">
            {currentPolicy.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              <span className={cn('text-xs font-medium', statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {getRelativeTime(currentPolicy.lastEnforced)}
            </span>
          </div>
        </div>

        {/* Cross-Deck Verification Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Verification
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Voter Credential (Deck #11):</span>
              <div className="flex items-center gap-1">
                {currentPolicy.credentialVerified ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
                <span className={cn(
                  'text-xs',
                  currentPolicy.credentialVerified ? 'text-green-400' : 'text-red-400'
                )}>
                  {currentPolicy.credentialVerified ? 'Verified' : 'Failed'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">DID Lineage (Deck #12):</span>
              <div className="flex items-center gap-1">
                {currentPolicy.didLineageValid ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
                <span className={cn(
                  'text-xs',
                  currentPolicy.didLineageValid ? 'text-green-400' : 'text-red-400'
                )}>
                  {currentPolicy.didLineageValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">ZKP Signature (Deck #6-#12):</span>
              <div className="flex items-center gap-1">
                {currentPolicy.zkpSignatureValid ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
                <span className={cn(
                  'text-xs',
                  currentPolicy.zkpSignatureValid ? 'text-green-400' : 'text-red-400'
                )}>
                  {currentPolicy.zkpSignatureValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enforcement Action */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'relative p-2 rounded-full',
              statusInfo.bgColor,
              currentPolicy.enforcementStatus === 'enforced' ? 'ring-2 ' + statusInfo.ringColor : ''
            )}>
              {statusInfo.icon}
              
              {/* Animated enforcement seal for enforced policies */}
              {currentPolicy.enforcementStatus === 'enforced' && (
                <div className="absolute inset-0 rounded-full ring-2 ring-green-400/30 animate-ping" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-200">
                Enforcement Seal
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {currentPolicy.enforcementSeal}
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleEnforcement}
            disabled={isEnforcing}
            className={cn(
              'w-full min-h-[48px]',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isEnforcing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enforcing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Execute Enforcement
              </div>
            )}
          </Button>
        </div>

        {/* Enforcement Details */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Policy ID:</span>
              <span className="text-slate-300 font-mono">{currentPolicy.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Enforced:</span>
              <span className="text-slate-300">{formatTimestamp(currentPolicy.lastEnforced)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Enforcement Status:</span>
              <span className={statusInfo.color}>{statusInfo.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">User Role:</span>
              <span className={roleInfo.color}>{roleInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Policy enforcement interface ready,
          Current policy: {currentPolicy.title},
          Status: {statusInfo.label},
          User role: {roleInfo.label}
        </div>
      </CardContent>
    </Card>
  );
};
export default PolicyEnforcementCard;
