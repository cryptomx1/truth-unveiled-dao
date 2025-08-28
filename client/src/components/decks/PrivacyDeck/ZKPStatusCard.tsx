import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type PrivacyStatus = 'active' | 'warning' | 'disabled';

interface ZKPStatusCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

interface PrivacyMetrics {
  proofCount: number;
  anonymityLevel: number;
  lastVerification: Date;
}

const MOCK_PRIVACY_METRICS: PrivacyMetrics = {
  proofCount: 47,
  anonymityLevel: 98,
  lastVerification: new Date(Date.now() - 300000) // 5 minutes ago
};

const getStatusColor = (status: PrivacyStatus) => {
  switch (status) {
    case 'active':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'warning':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'disabled':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getStatusIcon = (status: PrivacyStatus) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'disabled':
      return <Shield className="w-4 h-4" />;
    default:
      return <Shield className="w-4 h-4" />;
  }
};

const getStatusText = (status: PrivacyStatus) => {
  switch (status) {
    case 'active':
      return 'ZKP Protection: Active';
    case 'warning':
      return 'ZKP Protection: Warning';
    case 'disabled':
      return 'ZKP Protection: Disabled';
    default:
      return 'ZKP Protection: Unknown';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const ZKPStatusCard: React.FC<ZKPStatusCardProps> = ({ className }) => {
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>('active');
  const [showProofTrace, setShowProofTrace] = useState(false);
  const [metrics] = useState<PrivacyMetrics>(MOCK_PRIVACY_METRICS);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ZKPStatusCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ZKPStatusCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play privacy status message on mount
          const utterance = new SpeechSynthesisUtterance("Your privacy status is active and protected.");
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  const handleToggleProofTrace = () => {
    const toggleStart = performance.now();
    setShowProofTrace(prev => !prev);
    
    const toggleTime = performance.now() - toggleStart;
    if (toggleTime > 50) {
      console.warn(`Proof trace toggle time: ${toggleTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleStatusToggle = (enabled: boolean) => {
    const toggleStart = performance.now();
    setPrivacyStatus(enabled ? 'active' : 'disabled');
    
    const toggleTime = performance.now() - toggleStart;
    if (toggleTime > 50) {
      console.warn(`Status toggle time: ${toggleTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const getAnonymityLevelColor = (level: number) => {
    if (level >= 95) return 'text-green-400';
    if (level >= 80) return 'text-blue-400';
    if (level >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Zero-Knowledge Proof Privacy Status"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Privacy Status
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-800/50 text-slate-400 border-slate-700">
                  <Lock className="w-3 h-3 mr-1" />
                  ZKP
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Protected by Zero-Knowledge Layer (Deck #6)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Monitor your decentralized privacy protection
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Privacy Status Display */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4"
          aria-live="polite"
          aria-label="Current privacy protection status"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(privacyStatus)}
              <span className="font-medium text-slate-100">
                {getStatusText(privacyStatus)}
              </span>
            </div>
            <Switch
              checked={privacyStatus === 'active'}
              onCheckedChange={handleStatusToggle}
              className="data-[state=checked]:bg-blue-500"
              aria-label="Toggle privacy protection"
            />
          </div>
          
          <Badge variant="outline" className={getStatusColor(privacyStatus)}>
            {privacyStatus === 'active' ? 'Protected' : 
             privacyStatus === 'warning' ? 'Review Required' : 'Inactive'}
          </Badge>
        </div>

        {/* Privacy Metrics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Privacy Metrics</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Zero-Knowledge Proofs</span>
              <span className="text-sm font-medium text-slate-200">{metrics.proofCount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Anonymity Level</span>
              <span className={cn('text-sm font-medium', getAnonymityLevelColor(metrics.anonymityLevel))}>
                {metrics.anonymityLevel}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Last Verification</span>
              <span className="text-sm text-slate-300">{formatTimeAgo(metrics.lastVerification)}</span>
            </div>
          </div>
        </div>

        {/* Proof Trace Toggle */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {showProofTrace ? (
                <Eye className="w-4 h-4 text-blue-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm font-medium text-slate-100">
                Proof Trace
              </span>
            </div>
            <Button
              onClick={handleToggleProofTrace}
              variant="outline"
              size="sm"
              className={cn(
                'min-h-[48px] px-4',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              aria-label={showProofTrace ? 'Hide proof trace' : 'Show proof trace'}
            >
              {showProofTrace ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showProofTrace && (
            <div className="space-y-2 mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 font-mono">
                zkp_proof_hash: 0x7a8f...3e2d
              </div>
              <div className="text-xs text-slate-400 font-mono">
                commitment: 0x4c91...7b8a
              </div>
              <div className="text-xs text-slate-400 font-mono">
                verification_key: 0x9d3e...5f4c
              </div>
              <div className="text-xs text-slate-400 font-mono">
                circuit_id: civic_vote_v2.1
              </div>
            </div>
          )}
        </div>

        {/* Privacy Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className={cn(
              'w-full min-h-[48px] font-medium',
              'bg-slate-700/50 border-slate-600 text-slate-200',
              'hover:bg-slate-600/70 hover:text-slate-50'
            )}
            disabled={privacyStatus === 'disabled'}
            aria-label="Generate new zero-knowledge proof"
          >
            <Shield className="w-4 h-4 mr-2" />
            Generate New Proof
          </Button>
          
          <Button
            variant="outline"
            className={cn(
              'w-full min-h-[48px] font-medium',
              'bg-slate-700/50 border-slate-600 text-slate-200',
              'hover:bg-slate-600/70 hover:text-slate-50'
            )}
            disabled={privacyStatus === 'disabled'}
            aria-label="Verify current privacy status"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Status
          </Button>
        </div>

        {/* Status Message */}
        {privacyStatus === 'active' && (
          <div className="text-center pt-2 border-t border-slate-700/50">
            <p className="text-xs text-green-400">
              Your identity and transactions are fully protected
            </p>
          </div>
        )}
        
        {privacyStatus === 'warning' && (
          <div className="text-center pt-2 border-t border-slate-700/50">
            <p className="text-xs text-amber-400">
              Privacy protection requires attention
            </p>
          </div>
        )}
        
        {privacyStatus === 'disabled' && (
          <div className="text-center pt-2 border-t border-slate-700/50">
            <p className="text-xs text-red-400">
              Privacy protection is currently disabled
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZKPStatusCard;
