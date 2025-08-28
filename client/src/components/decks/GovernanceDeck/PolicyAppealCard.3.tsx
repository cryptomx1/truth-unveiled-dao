import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Hash,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Link,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface ZKPProofData {
  proofHash: string;
  zkpSignature: string;
  didReference: string;
  credentialHash: string;
  timestamp: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  linkedDeckModules: string[];
}

interface ZKPProofTrailProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock ZKP proof trail data
const MOCK_ZKP_PROOF: ZKPProofData = {
  proofHash: 'zkp_0x7f8e9d2a1b3c4e5f6a8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
  zkpSignature: 'sig_0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
  didReference: 'did:civic:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
  credentialHash: 'cred_0x9f8e7d6c5b4a39281726354859607382940571829384756019283746501928',
  timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  verificationStatus: 'verified',
  linkedDeckModules: ['PolicyAppealCard', 'CredentialClaimCard (Deck #12)', 'ZKP signatures']
};

// Get verification status display info
const getVerificationStatusInfo = (status: string) => {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-700'
      };
    case 'pending':
      return {
        label: 'Pending',
        icon: Eye,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-700'
      };
    case 'failed':
      return {
        label: 'Failed',
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-900/50',
        borderColor: 'border-red-700'
      };
    default:
      return {
        label: 'Unknown',
        icon: AlertTriangle,
        color: 'text-gray-400',
        bgColor: 'bg-gray-900/50',
        borderColor: 'border-gray-700'
      };
  }
};

export const ZKPProofTrail: React.FC<ZKPProofTrailProps> = ({ className }) => {
  const [proofData, setProofData] = useState<ZKPProofData>(MOCK_ZKP_PROOF);
  const [copiedField, setCopiedField] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ZKPProofTrail render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ZKPProofTrail render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Initialize TTS
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setTtsStatus(prev => ({ ...prev, isReady: true }));
    }
  }, []);

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

  // Handle copy to clipboard
  const handleCopy = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      speakMessage(`${fieldName} copied to clipboard`);
      
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  // Handle proof validation
  const handleValidateProof = async () => {
    setIsValidating(true);
    
    try {
      // Simulate proof validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate validation result
      const isValid = Math.random() > 0.1; // 90% success rate
      
      setProofData(prev => ({
        ...prev,
        verificationStatus: isValid ? 'verified' : 'failed',
        timestamp: new Date()
      }));
      
      speakMessage(isValid ? "ZKP proof validated successfully" : "ZKP proof validation failed");
      
    } catch (error) {
      speakMessage("Proof validation error");
    } finally {
      setIsValidating(false);
    }
  };

  const statusInfo = getVerificationStatusInfo(proofData.verificationStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <Card 
      className={cn(
        'bg-slate-800 border-slate-700 shadow-xl max-h-[600px] w-full overflow-hidden',
        className
      )}
      role="region"
      aria-label="ZKP Proof Trail"
      data-testid="zkp-proof-trail"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">ZKP Proof Trail</CardTitle>
              <CardDescription className="text-slate-400">Zero-Knowledge Proof verification chain</CardDescription>
            </div>
          </div>
          <Badge className={cn('text-white', statusInfo.bgColor, statusInfo.borderColor, 'border')}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Proof Status Overview */}
        <div className={cn(
          'rounded-lg p-4 border space-y-3',
          statusInfo.bgColor,
          statusInfo.borderColor
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className={cn('w-5 h-5', statusInfo.color)} />
              <span className="text-lg font-semibold text-white">{statusInfo.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Real-time</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-300">Last Updated:</span>
            <span className="text-sm text-slate-300">
              {Math.floor((Date.now() - proofData.timestamp.getTime()) / (1000 * 60))} min ago
            </span>
          </div>
        </div>

        {/* ZKP Hash Details */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Cryptographic Proof Chain</span>
          </h3>
          
          <div className="space-y-3">
            {/* Proof Hash */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Proof Hash:</span>
                <Button
                  onClick={() => handleCopy(proofData.proofHash, 'Proof Hash')}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  {copiedField === 'Proof Hash' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs text-indigo-400 bg-slate-800 rounded p-2 break-all">
                {proofData.proofHash}
              </div>
            </div>
            
            {/* ZKP Signature */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">ZKP Signature:</span>
                <Button
                  onClick={() => handleCopy(proofData.zkpSignature, 'ZKP Signature')}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  {copiedField === 'ZKP Signature' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs text-purple-400 bg-slate-800 rounded p-2 break-all">
                {proofData.zkpSignature}
              </div>
            </div>
            
            {/* DID Reference */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">DID Reference:</span>
                <Button
                  onClick={() => handleCopy(proofData.didReference, 'DID Reference')}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  {copiedField === 'DID Reference' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs text-blue-400 bg-slate-800 rounded p-2 break-all">
                {proofData.didReference}
              </div>
            </div>
            
            {/* Credential Hash */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Credential Hash:</span>
                <Button
                  onClick={() => handleCopy(proofData.credentialHash, 'Credential Hash')}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  {copiedField === 'Credential Hash' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="font-mono text-xs text-green-400 bg-slate-800 rounded p-2 break-all">
                {proofData.credentialHash}
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Deck Integration */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Link className="w-4 h-4 text-yellow-400" />
            <span>Cross-Deck Validation</span>
          </h3>
          
          <div className="space-y-2">
            {proofData.linkedDeckModules.map((module, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{module}:</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-slate-400">
              Proof verified at {proofData.timestamp.toLocaleTimeString()}
            </span>
          </div>
          
          <Button
            onClick={handleValidateProof}
            disabled={isValidating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            style={{ minHeight: '36px', minWidth: '100px' }}
          >
            {isValidating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Validating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Validate</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZKPProofTrail;