import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Zap,
  AlertTriangle,
  FileText,
  Vote,
  User,
  IdCard,
  Star,
  Sparkles,
  Activity
} from 'lucide-react';

type CredentialTemplate = 'id-card' | 'voting-credential' | 'civic-permit' | 'identity-badge' | 'governance-pass';
type IssuanceStatus = 'idle' | 'validating' | 'issuing' | 'issued' | 'failed';

interface CredentialOption {
  value: CredentialTemplate;
  label: string;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
}

interface CredentialClaimCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Cross-deck ZKP hash synchronization from Decks #6-#12
const CROSS_DECK_ZKP_HASHES = [
  // From previous modules
  'zkp_did_proof_001', 'zkp_bio_hash_001', 'zkp_bio_hash_002',
  // From other decks
  'zkp_proof_001', 'zkp_asset_001', 'zkp_audit_001', 'zkp_consensus_001',
  'zkp_feedback_001', 'zkp_engagement_001'
];

// Mock credential templates
const CREDENTIAL_TEMPLATES: CredentialOption[] = [
  {
    value: 'id-card',
    label: 'Civic ID Card',
    description: 'Basic identity verification credential',
    icon: <IdCard className="w-5 h-5" />,
    requirements: ['Valid DID', 'Biometric verification']
  },
  {
    value: 'voting-credential',
    label: 'Voting Credential',
    description: 'Authorized voting participation credential',
    icon: <Vote className="w-5 h-5" />,
    requirements: ['Valid DID', 'Civic-grade biometric', 'Address verification']
  },
  {
    value: 'civic-permit',
    label: 'Civic Permit',
    description: 'General civic engagement authorization',
    icon: <FileText className="w-5 h-5" />,
    requirements: ['Valid DID', 'Enhanced biometric']
  },
  {
    value: 'identity-badge',
    label: 'Identity Badge',
    description: 'Verified identity badge for platform access',
    icon: <User className="w-5 h-5" />,
    requirements: ['Valid DID', 'Basic biometric']
  },
  {
    value: 'governance-pass',
    label: 'Governance Pass',
    description: 'High-security governance participation pass',
    icon: <Shield className="w-5 h-5" />,
    requirements: ['Valid DID', 'Civic-grade biometric', 'Trust score ≥85%']
  }
];

// Mock validation scenarios for testing
const VALIDATION_SCENARIOS = [
  // Valid attempts (5)
  { template: 'id-card', valid: true, reason: 'All requirements met' },
  { template: 'voting-credential', valid: true, reason: 'Civic-grade verification passed' },
  { template: 'civic-permit', valid: true, reason: 'Enhanced biometric confirmed' },
  { template: 'identity-badge', valid: true, reason: 'Basic requirements satisfied' },
  { template: 'governance-pass', valid: true, reason: 'High-security validation complete' },
  // Invalid attempts (2)
  { template: 'voting-credential', valid: false, reason: 'Insufficient biometric assurance' },
  { template: 'governance-pass', valid: false, reason: 'Trust score below threshold' }
];

// Generate mock ZKP hash for credential
const generateCredentialHash = (template: CredentialTemplate): string => {
  const templatePrefix = template.split('-')[0];
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `zkp_cred_${templatePrefix}_${randomSuffix}`;
};

// Validate credential requirements (mock)
const validateCredentialRequirements = (template: CredentialTemplate): { valid: boolean; reason: string } => {
  // Use predefined scenarios for testing
  const scenario = VALIDATION_SCENARIOS.find(s => s.template === template) || VALIDATION_SCENARIOS[0];
  
  // Add some randomness for dynamic testing
  const isValid = scenario.valid && Math.random() > 0.15; // 85% success rate
  
  return {
    valid: isValid,
    reason: isValid ? scenario.reason : (scenario.valid ? 'Random validation failure' : scenario.reason)
  };
};

// Calculate ZKP mismatch rate for pushback detection
const calculateIssuanceMismatchRate = (): number => {
  // Simulate credential issuance monitoring
  const totalAttempts = 15;
  const successfulIssuances = Math.floor(totalAttempts * 0.92); // 92% success rate
  const mismatchRate = ((totalAttempts - successfulIssuances) / totalAttempts) * 100;
  return Math.min(mismatchRate, 9.5); // Keep under 10% threshold most of the time
};

// Get status icon for issuance state
const getIssuanceStatusIcon = (status: IssuanceStatus) => {
  switch (status) {
    case 'issued':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'validating':
    case 'issuing':
      return <Clock className="w-5 h-5 text-amber-400 animate-spin" />;
    default:
      return <CreditCard className="w-5 h-5 text-slate-500" />;
  }
};

export const CredentialClaimCard: React.FC<CredentialClaimCardProps> = ({ className }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CredentialTemplate>('id-card');
  const [issuanceStatus, setIssuanceStatus] = useState<IssuanceStatus>('idle');
  const [credentialHash, setCredentialHash] = useState<string>('');
  const [validationReason, setValidationReason] = useState<string>('');
  const [mismatchRate, setMismatchRate] = useState<number>(0);
  const [pushbackSimulation, setPushbackSimulation] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CredentialClaimCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CredentialClaimCard render time: ${renderTime.toFixed(2)}ms ✅`);
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
            speakMessage("Credential issuance panel ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Monitor issuance mismatch rate
  useEffect(() => {
    const interval = setInterval(() => {
      const newMismatchRate = pushbackSimulation ? 12.5 : calculateIssuanceMismatchRate();
      setMismatchRate(newMismatchRate);
    }, 20000); // Check every 20 seconds

    return () => clearInterval(interval);
  }, [pushbackSimulation]);

  // Handle credential issuance process
  const handleCredentialIssuance = async () => {
    const flowStart = performance.now();
    setIssuanceStatus('validating');
    setCredentialHash('');
    setValidationReason('');

    // Validation phase (<100ms target)
    const validationStart = performance.now();
    await new Promise(resolve => setTimeout(resolve, 80)); // Simulate validation
    
    const validation = validateCredentialRequirements(selectedTemplate);
    const validationTime = performance.now() - validationStart;
    
    if (validationTime > 100) {
      console.warn(`Credential validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
    }

    setValidationReason(validation.reason);

    if (validation.valid) {
      // Transition to issuing
      setIssuanceStatus('issuing');
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate issuance
      
      // Generate credential hash
      const hash = generateCredentialHash(selectedTemplate);
      setCredentialHash(hash);
      setIssuanceStatus('issued');
      
      // TTS success announcement
      speakMessage("Credential issued", true);
    } else {
      setIssuanceStatus('failed');
      speakMessage("Credential issuance failed", true);
    }

    const totalFlowTime = performance.now() - flowStart;
    if (totalFlowTime > 200) {
      console.warn(`Credential flow time: ${totalFlowTime.toFixed(2)}ms (exceeds 200ms target)`);
    } else {
      console.log(`Credential flow time: ${totalFlowTime.toFixed(2)}ms ✅`);
    }
  };

  // Reset issuance state
  const resetIssuance = () => {
    setIssuanceStatus('idle');
    setCredentialHash('');
    setValidationReason('');
  };

  const selectedCredential = CREDENTIAL_TEMPLATES.find(t => t.value === selectedTemplate);
  const isPushbackActive = mismatchRate > 10;
  const isProcessing = issuanceStatus === 'validating' || issuanceStatus === 'issuing';

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
      aria-label="Credential Issuance Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          isPushbackActive ? 'bg-red-500' : 
          issuanceStatus === 'issued' ? 'bg-green-500' : 
          isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
        )}
        aria-label={`Status: ${issuanceStatus}`}
        title={`Status: ${issuanceStatus}`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            Credential Claim
          </CardTitle>
          {issuanceStatus === 'issued' && (
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-400/50">
              <Star className="w-3 h-3 mr-1" />
              Issued
            </Badge>
          )}
        </div>
        <CardDescription className="text-slate-300 text-sm">
          ZKP-verified civic credential issuance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Credential Template
            </span>
          </div>
          
          <Select 
            value={selectedTemplate} 
            onValueChange={(value: CredentialTemplate) => setSelectedTemplate(value)}
            disabled={isProcessing}
          >
            <SelectTrigger className={cn(
              'w-full bg-slate-700/50 border-slate-600 text-slate-200',
              'min-h-[48px]',
              'focus:ring-purple-400/50 focus:border-purple-400'
            )}>
              <SelectValue placeholder="Select credential type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {CREDENTIAL_TEMPLATES.map((template) => (
                <SelectItem 
                  key={template.value} 
                  value={template.value}
                  className="text-slate-200 focus:bg-slate-700 focus:text-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-purple-400">
                      {template.icon}
                    </div>
                    <div>
                      <div className="font-medium">{template.label}</div>
                      <div className="text-xs text-slate-400">{template.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Template Requirements */}
          {selectedCredential && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-slate-400">Requirements:</div>
              <div className="flex flex-wrap gap-1">
                {selectedCredential.requirements.map((req, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-slate-700/30 text-slate-300 border-slate-600"
                  >
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Issuance Control */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Credential Issuance
            </span>
          </div>
          
          <div className="space-y-3">
            {/* Issuance Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIssuanceStatusIcon(issuanceStatus)}
                <span className="text-sm text-slate-300">
                  {issuanceStatus === 'idle' ? 'Ready for issuance' :
                   issuanceStatus === 'validating' ? 'Validating requirements' :
                   issuanceStatus === 'issuing' ? 'Issuing credential' :
                   issuanceStatus === 'issued' ? 'Credential issued' :
                   'Issuance failed'}
                </span>
              </div>
              
              {issuanceStatus === 'issued' && (
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-400 animate-pulse" />
                  <div className="absolute inset-0 w-6 h-6 rounded-full ring-2 ring-green-400/50 animate-ping" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCredentialIssuance}
                disabled={isProcessing}
                className={cn(
                  'flex-1 bg-purple-600/80 hover:bg-purple-700 text-white',
                  'disabled:bg-slate-700/50 disabled:text-slate-500',
                  'min-h-[48px]'
                )}
              >
                {isProcessing ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Issue Credential
                  </>
                )}
              </Button>
              
              {issuanceStatus !== 'idle' && (
                <Button
                  onClick={resetIssuance}
                  disabled={isProcessing}
                  variant="outline"
                  className={cn(
                    'border-slate-600 text-slate-300 hover:bg-slate-700',
                    'min-h-[48px]'
                  )}
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Export Button (Disabled) */}
            <Button
              disabled={true}
              variant="outline"
              className={cn(
                'w-full border-slate-700/50 text-slate-500 bg-slate-800/20',
                'cursor-not-allowed opacity-50',
                'min-h-[48px]'
              )}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Credential (Future Release)
            </Button>
          </div>
        </div>

        {/* Issuance Results */}
        {issuanceStatus !== 'idle' && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              {getIssuanceStatusIcon(issuanceStatus)}
              <span className="text-sm font-medium text-slate-200">
                Issuance Status
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Validation Reason */}
              {validationReason && (
                <div className="text-xs">
                  <div className="text-slate-400 mb-1">Validation Result:</div>
                  <div className={cn(
                    'p-2 rounded border text-xs',
                    issuanceStatus === 'issued' 
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : issuanceStatus === 'failed'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  )}>
                    {validationReason}
                  </div>
                </div>
              )}
              
              {/* Credential Hash */}
              {credentialHash && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">ZKP Credential Hash:</span>
                    <span className="text-xs text-green-400">Valid</span>
                  </div>
                  <div className="text-xs font-mono text-cyan-300 bg-cyan-500/10 p-2 rounded border break-all">
                    {credentialHash}
                  </div>
                  
                  {/* Sparkles animation for issued credentials */}
                  {issuanceStatus === 'issued' && (
                    <div className="flex justify-center">
                      <div className="relative">
                        <Sparkles className="w-5 h-5 text-green-400 animate-bounce" />
                        <div className="absolute inset-0 w-5 h-5">
                          <Sparkles className="w-3 h-3 text-green-400 animate-pulse absolute top-0 right-0" />
                          <Sparkles className="w-3 h-3 text-green-400 animate-pulse absolute bottom-0 left-0" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cross-Deck Sync & Testing */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">
              System Status
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Issuance Success:</span>
              <span className="text-green-400">{(100 - mismatchRate).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mismatch Rate:</span>
              <span className={mismatchRate > 10 ? 'text-red-400' : 'text-green-400'}>
                {mismatchRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cross-Deck Sync:</span>
              <span className="text-green-400">Active</span>
            </div>
            
            {/* Pushback Simulation Toggle */}
            <button
              onClick={() => setPushbackSimulation(!pushbackSimulation)}
              className={cn(
                'w-full p-2 mt-2 rounded border text-xs transition-all',
                pushbackSimulation 
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:border-slate-500/50'
              )}
            >
              {pushbackSimulation ? '🔴 Pushback Simulation ON' : 'Simulate Pushback Trigger'}
            </button>
            
            {isPushbackActive && (
              <div className="p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400">
                ⚠️ Pushback: Issuance mismatch &gt;10%
              </div>
            )}
          </div>
        </div>

        {/* Footer Status */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
          <div className="text-xs text-slate-400">
            Template: {selectedCredential?.label || 'None'}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Shield className="w-3 h-3" />
            ZKP-Secured
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Credential issuance status: {issuanceStatus},
          Selected template: {selectedCredential?.label || 'none'},
          Validation result: {validationReason || 'pending'}
        </div>
      </CardContent>
    </Card>
  );
};
export default CredentialClaimCard;
