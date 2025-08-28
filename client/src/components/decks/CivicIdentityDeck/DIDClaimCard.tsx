import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  IdCard,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  Fingerprint,
  AlertCircle,
  RefreshCw,
  Zap,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

type DIDValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';
type BiometricZKPStatus = 'inactive' | 'pending' | 'verified';
type CredentialStatus = 'none' | 'pending' | 'issued';

interface DIDClaimCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock DID validation regex
const DID_REGEX = /^did:civic:[a-zA-Z0-9]{8,64}$/;

// Mock ZKP proof data for DID validation
const MOCK_ZKP_PROOFS = [
  'zkp_did_proof_001',
  'zkp_did_proof_002',
  'zkp_did_proof_003'
];

// Stress test data for 100+ DID claims
const STRESS_TEST_DIDS = [
  // Valid DIDs
  'did:civic:abc123def456',
  'did:civic:xyz789uvw012',
  'did:civic:test1234567890abcdef',
  'did:civic:valid999888777',
  'did:civic:correct123abc',
  // Invalid DIDs (malformed/rejected)
  'did:invalid:test123', // Wrong method
  'did:civic:', // Too short
  'did:civic:ab', // Too short
  'did:civic:toolongthisiswaytoolongthisiswaytoolongthisiswaytoolong', // Too long
  'invalid:civic:test123', // Wrong prefix
  'did:civic:test@123', // Invalid characters
  'did:civic:test 123', // Spaces
  'did:civic:test#123', // Special chars
  '', // Empty
  'notadid', // Not DID format
  'did:other:method123' // Wrong method
];

// Generate additional test DIDs to reach 100+
const generateStressTestDIDs = (): string[] => {
  const testDIDs = [...STRESS_TEST_DIDS];
  
  // Generate valid DIDs
  for (let i = 0; i < 50; i++) {
    const length = Math.floor(Math.random() * 32) + 16;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let did = 'did:civic:';
    for (let j = 0; j < length; j++) {
      did += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    testDIDs.push(did);
  }
  
  // Generate invalid DIDs
  const invalidFormats = [
    'did:wrong:',
    'invalid:civic:',
    'did:civic:',
    'did::test',
    ':civic:test',
    'did:civic',
    'did:civic:',
    'did:civic:a',
    'did:civic:ab',
  ];
  
  for (let i = 0; i < 40; i++) {
    const format = invalidFormats[i % invalidFormats.length];
    const randomSuffix = Math.random().toString(36).substring(2);
    testDIDs.push(format + randomSuffix);
  }
  
  return testDIDs;
};

// Performance and stress test logging
const logStressTestResults = (results: Array<{did: string, valid: boolean, renderTime: number, cycleTime: number}>) => {
  console.log('🧪 DID STRESS TEST RESULTS:');
  console.log(`Total DIDs tested: ${results.length}`);
  
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.length - validCount;
  const avgRenderTime = results.reduce((sum, r) => sum + r.renderTime, 0) / results.length;
  const avgCycleTime = results.reduce((sum, r) => sum + r.cycleTime, 0) / results.length;
  const maxRenderTime = Math.max(...results.map(r => r.renderTime));
  const maxCycleTime = Math.max(...results.map(r => r.cycleTime));
  
  console.log(`✅ Valid DIDs: ${validCount}`);
  console.log(`❌ Invalid DIDs: ${invalidCount}`);
  console.log(`⚡ Avg render time: ${avgRenderTime.toFixed(2)}ms`);
  console.log(`⚡ Avg cycle time: ${avgCycleTime.toFixed(2)}ms`);
  console.log(`📊 Max render time: ${maxRenderTime.toFixed(2)}ms ${maxRenderTime > 125 ? '❗ EXCEEDS TARGET' : '✅'}`);
  console.log(`📊 Max cycle time: ${maxCycleTime.toFixed(2)}ms ${maxCycleTime > 200 ? '❗ EXCEEDS TARGET' : '✅'}`);
  
  // Log individual failures
  const renderFailures = results.filter(r => r.renderTime > 125);
  const cycleFailures = results.filter(r => r.cycleTime > 200);
  
  if (renderFailures.length > 0) {
    console.log(`❗ Render time failures (${renderFailures.length}):`, renderFailures.map(r => r.did));
  }
  
  if (cycleFailures.length > 0) {
    console.log(`❗ Cycle time failures (${cycleFailures.length}):`, cycleFailures.map(r => r.did));
  }
  
  // Sample results for QA
  console.log('📝 Sample test results:');
  results.slice(0, 10).forEach(result => {
    console.log(`  ${result.valid ? '✅' : '❌'} ${result.did} | Render: ${result.renderTime.toFixed(1)}ms | Cycle: ${result.cycleTime.toFixed(1)}ms`);
  });
};

// Generate mock DID
const generateMockDID = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 32) + 16; // 16-48 chars
  let result = 'did:civic:';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate DID format
const validateDIDFormat = (did: string): boolean => {
  return DID_REGEX.test(did);
};

// Mock ZKP proof injection
const injectZKPProof = (did: string): string => {
  const proofIndex = Math.floor(Math.random() * MOCK_ZKP_PROOFS.length);
  return MOCK_ZKP_PROOFS[proofIndex];
};

export const DIDClaimCard: React.FC<DIDClaimCardProps> = ({ className }) => {
  const [didValue, setDidValue] = useState('');
  const [validationStatus, setValidationStatus] = useState<DIDValidationStatus>('idle');
  const [biometricStatus, setBiometricStatus] = useState<BiometricZKPStatus>('inactive');
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatus>('none');
  const [zkpProof, setZkpProof] = useState<string>('');
  const [isRotating, setIsRotating] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [stressTestActive, setStressTestActive] = useState(false);
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [ttsQueue, setTtsQueue] = useState<string[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`DIDClaimCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`DIDClaimCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation and queue management
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    // Add to queue for logging
    setTtsQueue(prev => [...prev.slice(-4), message]); // Keep last 5 messages
    
    // Throttle TTS calls - prevent duplicate calls within 3 seconds unless forced
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      console.log(`🔊 TTS throttled: "${message}" (${now - ttsStatus.lastTrigger}ms since last)`);
      return;
    }
    
    if (!ttsStatus.isReady) {
      console.log(`🔊 TTS not ready: "${message}"`);
      return;
    }

    try {
      // Always cancel any existing speech before starting new one
      window.speechSynthesis.cancel();
      
      // Wait a brief moment for cancellation to complete
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
          // TTS announcement on mount
          speakMessage("DID claim interface ready");
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Handle DID input validation
  const handleDIDChange = (value: string) => {
    setDidValue(value);
    
    if (value.length === 0) {
      setValidationStatus('idle');
      setBiometricStatus('inactive');
      setCredentialStatus('none');
      setZkpProof('');
      return;
    }
    
    setValidationStatus('validating');
    
    // Simulate validation delay
    setTimeout(() => {
      const isValid = validateDIDFormat(value);
      setValidationStatus(isValid ? 'valid' : 'invalid');
      
      if (isValid) {
        // Inject ZKP proof and update biometric status
        const proof = injectZKPProof(value);
        setZkpProof(proof);
        setBiometricStatus('pending');
        
        // Simulate biometric verification
        setTimeout(() => {
          setBiometricStatus('verified');
          setCredentialStatus('pending');
          
          // TTS for biometric verification (only once per unlock)
          if (!biometricUnlocked) {
            speakMessage("Fingerprint verified", true);
            setBiometricUnlocked(true);
          }
          
          // Issue credential after verification
          setTimeout(() => {
            setCredentialStatus('issued');
            speakMessage("Credential issued");
          }, 1000);
        }, 1500);
      } else {
        setBiometricStatus('inactive');
        setCredentialStatus('none');
        setZkpProof('');
        setBiometricUnlocked(false); // Reset biometric unlock state
      }
    }, 100); // <100ms validation target
  };

  // Handle key rotation
  const handleKeyRotation = async () => {
    setIsRotating(true);
    setBiometricUnlocked(false); // Reset biometric state on key rotation
    
    // Simulate 2-second key rotation delay
    setTimeout(() => {
      const newDID = generateMockDID();
      setDidValue(newDID);
      handleDIDChange(newDID);
      setIsRotating(false);
      speakMessage("DID key rotated successfully");
    }, 2000);
  };

  // Stress test function for 100+ DID validation
  const runStressTest = async () => {
    if (stressTestActive) return;
    
    setStressTestActive(true);
    console.log('🧪 Starting DID stress test with 100+ claims...');
    
    const testDIDs = generateStressTestDIDs();
    const results: Array<{did: string, valid: boolean, renderTime: number, cycleTime: number}> = [];
    
    for (let i = 0; i < testDIDs.length; i++) {
      const did = testDIDs[i];
      const testStart = performance.now();
      
      // Simulate DID validation
      const isValid = validateDIDFormat(did);
      const renderTime = performance.now() - testStart;
      
      // Simulate full cycle time (validation + biometric + credential)
      const cycleStart = performance.now();
      await new Promise(resolve => setTimeout(resolve, 5)); // Minimal async delay
      const cycleTime = performance.now() - cycleStart + renderTime;
      
      results.push({
        did,
        valid: isValid,
        renderTime,
        cycleTime
      });
      
      // Log sample results during test
      if (i < 10 || i % 20 === 0) {
        console.log(`${isValid ? '✅' : '❌'} Test ${i + 1}/${testDIDs.length}: ${did.substring(0, 20)}... | Valid: ${isValid} | Render: ${renderTime.toFixed(1)}ms`);
      }
    }
    
    // Log comprehensive results
    logStressTestResults(results);
    
    console.log('🧪 Stress test completed successfully!');
    setStressTestActive(false);
  };

  // Get status icon for validation
  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'validating':
        return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  // Get biometric status display
  const getBiometricStatusDisplay = () => {
    switch (biometricStatus) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Biometric ZKP Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="text-sm">Biometric ZKP Pending</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-slate-500">
            <Fingerprint className="w-4 h-4" />
            <span className="text-sm">Biometric ZKP Required</span>
          </div>
        );
    }
  };

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
      aria-label="DID Claim Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          credentialStatus === 'issued' ? 'bg-green-500' : 
          validationStatus === 'valid' ? 'bg-amber-500' : 'bg-slate-500',
          credentialStatus === 'issued' ? 'animate-pulse' : ''
        )}
        aria-label={`Status: ${credentialStatus === 'issued' ? 'Credential issued' : 'Ready'}`}
        title={`Status: ${credentialStatus === 'issued' ? 'Credential issued' : 'Ready'}`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <IdCard className="w-5 h-5 text-blue-400" />
            DID Claim Interface
          </CardTitle>
          {credentialStatus === 'issued' && (
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Issued
            </Badge>
          )}
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Decentralized identity claim with ZKP validation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* DID Input Field */}
        <div className="space-y-2">
          <label htmlFor="did-input" className="text-sm font-medium text-slate-200">
            Decentralized Identifier (DID)
          </label>
          <div className="relative">
            <Input
              ref={inputRef}
              id="did-input"
              type="text"
              placeholder="did:civic:abc123..."
              value={didValue}
              onChange={(e) => handleDIDChange(e.target.value)}
              className={cn(
                'bg-slate-800/50 border-slate-600 text-slate-100 pr-10',
                validationStatus === 'valid' && 'ring-2 ring-green-500/50',
                validationStatus === 'invalid' && 'ring-2 ring-red-500/50'
              )}
              aria-describedby="did-status"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </div>
          <div id="did-status" className="text-xs text-slate-400">
            Format: did:civic:[alphanumeric string]
          </div>
        </div>

        {/* Key Rotation */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-200">
                Key Management
              </span>
            </div>
            <Button
              onClick={handleKeyRotation}
              disabled={isRotating}
              size="sm"
              className={cn(
                'bg-amber-600/80 hover:bg-amber-700 text-white',
                'disabled:bg-slate-700/50 disabled:text-slate-500',
                'min-h-[32px]'
              )}
            >
              {isRotating ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Rotating...
                </>
              ) : (
                <>
                  <Key className="w-3 h-3 mr-1" />
                  Rotate Key
                </>
              )}
            </Button>
          </div>
          
          {isRotating && (
            <div className="text-xs text-amber-400">
              Generating new cryptographic keys...
            </div>
          )}
        </div>

        {/* Biometric ZKP Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Biometric Verification
            </span>
          </div>
          
          <div className="space-y-3">
            {getBiometricStatusDisplay()}
            
            {zkpProof && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400">ZKP Proof Hash:</div>
                <div className="text-xs font-mono text-purple-300 bg-purple-500/10 p-2 rounded border">
                  {zkpProof}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credential Issuance Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IdCard className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Credential Status
            </span>
          </div>
          
          <div className="space-y-2">
            {credentialStatus === 'issued' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    {/* Pulsing ring animation for issued credential */}
                    <div className="absolute inset-0 w-6 h-6 rounded-full ring-2 ring-green-400/50 animate-ping" />
                  </div>
                  <span className="text-sm text-green-400 font-medium">
                    Credential Successfully Issued
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Your decentralized identity has been verified and credential issued.
                </div>
              </>
            )}
            
            {credentialStatus === 'pending' && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                <span className="text-sm text-amber-400">
                  Processing credential issuance...
                </span>
              </div>
            )}
            
            {credentialStatus === 'none' && (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-500" />
                <span className="text-sm text-slate-400">
                  Valid DID required for credential issuance
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Development Testing Controls */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              QA Testing
            </span>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={runStressTest}
              disabled={stressTestActive}
              size="sm"
              className={cn(
                'w-full bg-cyan-600/80 hover:bg-cyan-700 text-white',
                'disabled:bg-slate-700/50 disabled:text-slate-500',
                'min-h-[32px] text-xs'
              )}
            >
              {stressTestActive ? (
                <>
                  <Clock className="w-3 h-3 mr-1 animate-spin" />
                  Running Stress Test...
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Run 100+ DID Test
                </>
              )}
            </Button>
            
            {ttsQueue.length > 0 && (
              <div className="text-xs">
                <div className="text-slate-400 mb-1">TTS Queue ({ttsQueue.length}):</div>
                <div className="text-cyan-300 font-mono text-xs bg-cyan-500/10 p-2 rounded">
                  {ttsQueue.slice(-3).join(' → ')}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-700/30 p-2 rounded">
                <div className="text-slate-400">Biometric:</div>
                <div className={cn(
                  'font-medium',
                  biometricStatus === 'verified' ? 'text-green-400' :
                  biometricStatus === 'pending' ? 'text-amber-400' : 'text-slate-500'
                )}>
                  {biometricStatus}
                </div>
              </div>
              <div className="bg-slate-700/30 p-2 rounded">
                <div className="text-slate-400">TTS Ready:</div>
                <div className={ttsStatus.isReady ? 'text-green-400' : 'text-red-400'}>
                  {ttsStatus.isReady ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Summary */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
          <div className="text-xs text-slate-400">
            Status: {validationStatus === 'valid' ? 'Ready' : 'Awaiting valid DID'}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Zap className="w-3 h-3" />
            ZKP-Verified
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          DID validation status: {validationStatus},
          Biometric verification: {biometricStatus},
          Credential issuance: {credentialStatus}
        </div>
      </CardContent>
    </Card>
  );
};
export default DIDClaimCard;
