import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  Hash,
  User,
  Calendar
} from 'lucide-react';

type EnforcementStatus = 'enforced' | 'flagged' | 'revoked';
type UserRole = 'governor' | 'citizen' | 'delegate';

interface EnforcementStatusData {
  status: EnforcementStatus;
  credentialVerified: boolean;
  didLineageValid: boolean;
  zkpSignatureValid: boolean;
  lastEnforced: Date;
  userRole: UserRole;
  enforcementSeal: string;
  verificationRate: number;
}

interface EnforcementStatusProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock enforcement status data
const MOCK_ENFORCEMENT_STATUS: EnforcementStatusData = {
  status: 'enforced',
  credentialVerified: true,
  didLineageValid: true,
  zkpSignatureValid: true,
  lastEnforced: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  userRole: 'governor',
  enforcementSeal: 'seal_enforcement_001',
  verificationRate: 94.7
};

// Get enforcement status display info
const getEnforcementStatusInfo = (status: EnforcementStatus) => {
  switch (status) {
    case 'enforced':
      return {
        label: 'Enforced',
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-700'
      };
    case 'flagged':
      return {
        label: 'Flagged',
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-700'
      };
    case 'revoked':
      return {
        label: 'Revoked',
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

export const EnforcementStatus: React.FC<EnforcementStatusProps> = ({ className }) => {
  const [statusData, setStatusData] = useState<EnforcementStatusData>(MOCK_ENFORCEMENT_STATUS);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`EnforcementStatus render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`EnforcementStatus render time: ${renderTime.toFixed(2)}ms ✅`);
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

  // Handle enforcement execution
  const handleExecuteEnforcement = async () => {
    setIsExecuting(true);
    
    try {
      // Simulate enforcement execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update status data
      setStatusData(prev => ({
        ...prev,
        lastEnforced: new Date(),
        verificationRate: Math.min(98.5, prev.verificationRate + Math.random() * 2)
      }));
      
      speakMessage("Policy enforcement executed successfully");
      
    } catch (error) {
      speakMessage("Enforcement execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const statusInfo = getEnforcementStatusInfo(statusData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Card 
      className={cn(
        'bg-slate-800 border-slate-700 shadow-xl max-h-[600px] w-full overflow-hidden',
        className
      )}
      role="region"
      aria-label="Enforcement Status"
      data-testid="enforcement-status"
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
              <CardTitle className="text-lg font-semibold text-white">Enforcement Status</CardTitle>
              <CardDescription className="text-slate-400">Real-time enforcement monitoring</CardDescription>
            </div>
          </div>
          <Badge className={cn('text-white', statusInfo.bgColor, statusInfo.borderColor, 'border')}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className={cn(
          'rounded-lg p-4 border space-y-4',
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
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>
          
          {/* Verification Metrics */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Verification Rate:</span>
              <span className="text-sm font-semibold text-green-400">{statusData.verificationRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Last Enforced:</span>
              <span className="text-sm text-slate-300">
                {Math.floor((Date.now() - statusData.lastEnforced.getTime()) / (1000 * 60))} min ago
              </span>
            </div>
          </div>
        </div>

        {/* Cross-Deck Verification Status */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Cross-Deck Verification</span>
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Voter Credentials (Deck #11):</span>
              <div className="flex items-center space-x-1">
                {statusData.credentialVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Failed</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">DID Lineage (Deck #12):</span>
              <div className="flex items-center space-x-1">
                {statusData.didLineageValid ? (
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
              <span className="text-sm text-slate-400">ZKP Signatures:</span>
              <div className="flex items-center space-x-1">
                {statusData.zkpSignatureValid ? (
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
          </div>
        </div>

        {/* Enforcement Seal */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Enforcement Seal</span>
            </div>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              VERIFIED
            </Badge>
          </div>
          <div className="font-mono text-xs text-slate-400 bg-slate-800 rounded p-2 break-all">
            {statusData.enforcementSeal}
          </div>
        </div>

        {/* User Role & Execute Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">Role:</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {statusData.userRole.toUpperCase()}
            </Badge>
          </div>
          
          <Button
            onClick={handleExecuteEnforcement}
            disabled={isExecuting || statusData.userRole === 'citizen'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            style={{ minHeight: '36px', minWidth: '100px' }}
          >
            {isExecuting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Executing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Execute</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnforcementStatus;