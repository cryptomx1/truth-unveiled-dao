import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  FileSignature,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  User,
  Scale,
  Fingerprint,
  Eye,
  Hash,
  Zap,
  Stamp,
  Shield,
  Clock,
  Settings
} from 'lucide-react';

type UserRole = 'citizen' | 'delegate' | 'notary';
type SignatureStatus = 'pending' | 'biometric-required' | 'signing' | 'signed' | 'failed';
type PolicySource = 'deck-11' | 'deck-12' | 'deck-13';

interface PolicyOption {
  id: string;
  title: string;
  source: PolicySource;
  requiresBiometric: boolean;
}

interface SignatureData {
  id: string;
  policyId: string;
  userRole: UserRole;
  status: SignatureStatus;
  signatureHash: string;
  biometricVerified: boolean;
  zkpFingerprint: string;
  signedAt?: Date;
  notarizedBy?: string;
  tamperDetected: boolean;
  signatureMismatch: boolean;
}

interface PolicySignatureCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock policy options from Decks #11-#13
const MOCK_POLICIES: PolicyOption[] = [
  { id: 'civic_eng_001', title: 'Civic Engagement Protocol', source: 'deck-11', requiresBiometric: true },
  { id: 'trust_streak_002', title: 'Trust Streak Validation', source: 'deck-11', requiresBiometric: false },
  { id: 'reputation_003', title: 'Reputation Ladder Policy', source: 'deck-11', requiresBiometric: true },
  { id: 'did_claim_004', title: 'DID Claim Authorization', source: 'deck-12', requiresBiometric: true },
  { id: 'biometric_005', title: 'Biometric Proof Standard', source: 'deck-12', requiresBiometric: true },
  { id: 'credential_006', title: 'Credential Issuance Policy', source: 'deck-12', requiresBiometric: false },
  { id: 'policy_enf_007', title: 'Policy Enforcement Rules', source: 'deck-13', requiresBiometric: false },
  { id: 'appeal_proc_008', title: 'Appeal Process Standard', source: 'deck-13', requiresBiometric: true }
];

// Mock user roles with different access levels
const USER_ROLES: Record<UserRole, { label: string; icon: React.ReactNode; color: string; canNotarize: boolean }> = {
  'citizen': {
    label: 'Citizen',
    icon: <User className="w-4 h-4" />,
    color: 'text-blue-400',
    canNotarize: false
  },
  'delegate': {
    label: 'Delegate',
    icon: <Scale className="w-4 h-4" />,
    color: 'text-green-400',
    canNotarize: true
  },
  'notary': {
    label: 'Notary',
    icon: <Crown className="w-4 h-4" />,
    color: 'text-purple-400',
    canNotarize: true
  }
};

// Mock ZKP fingerprints for cross-deck validation
const MOCK_ZKP_FINGERPRINTS = [
  'zkp_fp_a1b2c3d4e5f6',
  'zkp_fp_7g8h9i0j1k2l',
  'zkp_fp_m3n4o5p6q7r8',
  'zkp_fp_s9t0u1v2w3x4',
  'zkp_fp_y5z6a7b8c9d0'
];

// Get policy source display info
const getPolicySourceInfo = (source: PolicySource) => {
  switch (source) {
    case 'deck-11':
      return { label: 'Civic Engagement', color: 'text-cyan-400' };
    case 'deck-12':
      return { label: 'Identity Management', color: 'text-green-400' };
    case 'deck-13':
      return { label: 'Governance Policy', color: 'text-purple-400' };
  }
};

// Get signature status info
const getSignatureStatusInfo = (status: SignatureStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: <Clock className="w-4 h-4 text-slate-400" />,
        label: 'Ready to Sign',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20',
        ringColor: 'ring-slate-400/50'
      };
    case 'biometric-required':
      return {
        icon: <Fingerprint className="w-4 h-4 text-amber-400" />,
        label: 'Biometric Required',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        ringColor: 'ring-amber-400/50'
      };
    case 'signing':
      return {
        icon: <FileSignature className="w-4 h-4 text-blue-400" />,
        label: 'Signing...',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        ringColor: 'ring-blue-400/50'
      };
    case 'signed':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        label: 'Signed',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        ringColor: 'ring-green-400/50'
      };
    case 'failed':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Failed',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        ringColor: 'ring-red-400/50'
      };
  }
};

// Generate signature hash
const generateSignatureHash = (): string => {
  return `sig_${Math.random().toString(36).substr(2, 12)}`;
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

export const PolicySignatureCard: React.FC<PolicySignatureCardProps> = ({ className }) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('citizen');
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [pushbackTriggered, setPushbackTriggered] = useState<boolean>(false);
  const [signatureMismatchRate, setSignatureMismatchRate] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`PolicySignatureCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`PolicySignatureCard render time: ${renderTime.toFixed(2)}ms ✅`);
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
            speakMessage("Policy signature ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Simulate signature mismatch monitoring (8% stress test)
  useEffect(() => {
    const interval = setInterval(() => {
      const mismatchRate = Math.random() * 10; // 0-10% range
      setSignatureMismatchRate(mismatchRate);
      
      if (mismatchRate > 5) {
        setPushbackTriggered(true);
        console.log(`⚠️ Pushback triggered: ${mismatchRate.toFixed(1)}% signature mismatch rate`);
      } else {
        setPushbackTriggered(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle policy selection
  const handlePolicyChange = (policyId: string) => {
    setSelectedPolicyId(policyId);
    setSignatureData(null);
    
    const policy = MOCK_POLICIES.find(p => p.id === policyId);
    if (policy) {
      speakMessage(`Policy selected: ${policy.title}`);
    }
  };

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setCurrentUserRole(role);
    setSignatureData(null);
    
    const roleInfo = USER_ROLES[role];
    speakMessage(`Role changed to: ${roleInfo.label}`);
  };

  // Handle signature process
  const handleSignPolicy = async () => {
    if (!selectedPolicyId) {
      speakMessage("Please select a policy to sign");
      return;
    }

    const policy = MOCK_POLICIES.find(p => p.id === selectedPolicyId);
    if (!policy) return;

    setIsProcessing(true);

    // Initialize signature data
    const newSignatureData: SignatureData = {
      id: `sig_${Date.now().toString().slice(-6)}`,
      policyId: selectedPolicyId,
      userRole: currentUserRole,
      status: 'pending',
      signatureHash: '',
      biometricVerified: false,
      zkpFingerprint: MOCK_ZKP_FINGERPRINTS[Math.floor(Math.random() * MOCK_ZKP_FINGERPRINTS.length)],
      tamperDetected: Math.random() < 0.05, // 5% tamper rate
      signatureMismatch: Math.random() < 0.08 // 8% mismatch rate
    };

    setSignatureData(newSignatureData);

    // Check if biometric verification is required
    if (policy.requiresBiometric && (currentUserRole === 'citizen' || currentUserRole === 'notary')) {
      setSignatureData(prev => prev ? { ...prev, status: 'biometric-required' } : null);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate biometric check
      const biometricSuccess = Math.random() > 0.1; // 90% success rate
      if (biometricSuccess) {
        setSignatureData(prev => prev ? { ...prev, biometricVerified: true } : null);
        speakMessage("Biometric verification successful");
      } else {
        setSignatureData(prev => prev ? { ...prev, status: 'failed' } : null);
        setIsProcessing(false);
        speakMessage("Biometric verification failed");
        return;
      }
    }

    // Proceed with signing
    setSignatureData(prev => prev ? { ...prev, status: 'signing' } : null);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate signature hash
    const signatureHash = generateSignatureHash();
    
    // Check for signature issues
    if (newSignatureData.tamperDetected || newSignatureData.signatureMismatch) {
      setSignatureData(prev => prev ? { 
        ...prev, 
        status: 'failed',
        signatureHash: signatureHash
      } : null);
      speakMessage("Signature failed due to security issues");
    } else {
      setSignatureData(prev => prev ? { 
        ...prev, 
        status: 'signed',
        signatureHash: signatureHash,
        signedAt: new Date(),
        notarizedBy: USER_ROLES[currentUserRole].canNotarize ? currentUserRole : undefined
      } : null);
      speakMessage("Policy notarized");
    }

    setIsProcessing(false);
  };

  // Reset signature
  const handleResetSignature = () => {
    setSignatureData(null);
    speakMessage("Signature reset");
  };

  const selectedPolicy = MOCK_POLICIES.find(p => p.id === selectedPolicyId);
  const roleInfo = USER_ROLES[currentUserRole];
  const statusInfo = signatureData ? getSignatureStatusInfo(signatureData.status) : null;
  const sourceInfo = selectedPolicy ? getPolicySourceInfo(selectedPolicy.source) : null;

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
      aria-label="Policy Signature Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          pushbackTriggered ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        )}
        aria-label={pushbackTriggered ? "Status: Alert" : "Status: Active"}
        title={pushbackTriggered ? `${signatureMismatchRate.toFixed(1)}% signature mismatch detected` : "Signature system active"}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-green-400" />
            Policy Signature
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
          Digital signature and notarization of governance policies
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Role Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Signing Role
            </span>
          </div>
          
          <div className="flex gap-2">
            {Object.entries(USER_ROLES).map(([role, info]) => (
              <Button
                key={role}
                onClick={() => handleRoleChange(role as UserRole)}
                variant={currentUserRole === role ? "default" : "outline"}
                size="sm"
                className={cn(
                  'flex-1 min-h-[40px]',
                  currentUserRole === role 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                )}
              >
                <div className="flex items-center gap-1">
                  {info.icon}
                  <span className="text-xs">{info.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Policy Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Select Policy
            </span>
          </div>
          
          <Select value={selectedPolicyId} onValueChange={handlePolicyChange}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
              <SelectValue placeholder="Choose policy to sign" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {MOCK_POLICIES.map(policy => (
                <SelectItem key={policy.id} value={policy.id}>
                  <div className="flex items-center gap-2">
                    <span>{policy.title}</span>
                    {policy.requiresBiometric && (
                      <Fingerprint className="w-3 h-3 text-amber-400" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Policy Info */}
        {selectedPolicy && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={sourceInfo?.color}>
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-200">
                {selectedPolicy.title}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Source: {sourceInfo?.label}</span>
              {selectedPolicy.requiresBiometric && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Fingerprint className="w-3 h-3" />
                  <span>Biometric Required</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signature Status */}
        {signatureData && statusInfo && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-200">
                Signature Status
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                'relative p-2 rounded-full',
                statusInfo.bgColor,
                signatureData.status === 'signed' ? 'ring-2 ' + statusInfo.ringColor : ''
              )}>
                {statusInfo.icon}
                
                {/* Animated signature ring for signing process */}
                {signatureData.status === 'signing' && (
                  <div className="absolute inset-0 rounded-full ring-2 ring-blue-400/30 animate-ping" />
                )}
                
                {/* Stamp effect for signed documents */}
                {signatureData.status === 'signed' && (
                  <div className="absolute -top-1 -right-1">
                    <Stamp className="w-3 h-3 text-green-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 ml-3">
                <div className="text-sm font-medium text-slate-200">
                  {statusInfo.label}
                </div>
                {signatureData.signedAt && (
                  <div className="text-xs text-slate-400">
                    Signed: {formatTimestamp(signatureData.signedAt)}
                  </div>
                )}
                {signatureData.notarizedBy && (
                  <div className="text-xs text-green-400">
                    Notarized by: {USER_ROLES[signatureData.notarizedBy].label}
                  </div>
                )}
              </div>
            </div>

            {/* Security Issues Alert */}
            {(signatureData.tamperDetected || signatureData.signatureMismatch) && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs">
                <div className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Security Issues Detected</span>
                </div>
                {signatureData.tamperDetected && (
                  <div className="text-red-300 mt-1">• Tamper detection triggered</div>
                )}
                {signatureData.signatureMismatch && (
                  <div className="text-red-300 mt-1">• Signature hash mismatch</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cross-Deck ZKP Validation */}
        {signatureData && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-200">
                ZKP Validation
              </span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">ZKP Fingerprint:</span>
                <span className="text-purple-400 font-mono">{signatureData.zkpFingerprint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Signature Hash:</span>
                <span className="text-blue-400 font-mono break-all">
                  {signatureData.signatureHash || 'Pending...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Biometric Verified:</span>
                <span className={signatureData.biometricVerified ? 'text-green-400' : 'text-slate-400'}>
                  {signatureData.biometricVerified ? 'Yes' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pushback Alert */}
        {pushbackTriggered && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Signature Quality Alert
              </span>
            </div>
            <div className="text-xs text-red-300">
              Mismatch rate: {signatureMismatchRate.toFixed(1)}% (exceeds 5% threshold)
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!signatureData && (
            <Button
              onClick={handleSignPolicy}
              disabled={!selectedPolicyId || isProcessing}
              className={cn(
                'flex-1 min-h-[48px]',
                'bg-green-600 hover:bg-green-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileSignature className="w-4 h-4" />
                  Sign Policy
                </div>
              )}
            </Button>
          )}
          
          {signatureData && (
            <Button
              onClick={handleResetSignature}
              variant="outline"
              className={cn(
                'flex-1 min-h-[48px]',
                'border-slate-600 text-slate-300 hover:bg-slate-700'
              )}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                New Signature
              </div>
            </Button>
          )}
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Policy signature interface ready,
          Current role: {roleInfo.label},
          Selected policy: {selectedPolicy?.title || 'None'},
          {signatureData && `Signature status: ${statusInfo?.label}`},
          {pushbackTriggered && `Alert: ${signatureMismatchRate.toFixed(1)}% signature mismatch rate`}
        </div>
      </CardContent>
    </Card>
  );
};
export default PolicySignatureCard;
