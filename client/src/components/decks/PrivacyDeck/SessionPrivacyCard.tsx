import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, Lock, Globe, Key, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SessionPrivacySettings {
  ipMasking: boolean;
  sessionObfuscation: boolean;
  keyRotation: boolean;
}

interface SessionPrivacyCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_SESSION_DATA = {
  originalIP: '192.168.1.104',
  maskedIP: '10.0.0.1',
  sessionId: 'sess_7f3e2d1a',
  obfuscatedId: 'anon_9k4m7p2x',
  keyRotationInterval: 300, // 5 minutes
  lastRotation: new Date(Date.now() - 180000) // 3 minutes ago
};

export const SessionPrivacyCard: React.FC<SessionPrivacyCardProps> = ({ className }) => {
  const [privacySettings, setPrivacySettings] = useState<SessionPrivacySettings>({
    ipMasking: true,
    sessionObfuscation: true,
    keyRotation: true
  });
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const [lastKeyRotation, setLastKeyRotation] = useState(MOCK_SESSION_DATA.lastRotation);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`SessionPrivacyCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`SessionPrivacyCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play session privacy message on mount
          const utterance = new SpeechSynthesisUtterance("Session privacy active.");
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

  // Key rotation simulation
  useEffect(() => {
    if (!privacySettings.keyRotation) return;

    const interval = setInterval(() => {
      setLastKeyRotation(new Date());
    }, MOCK_SESSION_DATA.keyRotationInterval * 1000);

    return () => clearInterval(interval);
  }, [privacySettings.keyRotation]);

  const playToggleConfirmation = (feature: string, enabled: boolean) => {
    if (!ttsStatus.isReady) return;
    
    const message = `${feature} ${enabled ? 'enabled' : 'disabled'}.`;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleIPMaskingToggle = (enabled: boolean) => {
    const toggleStart = performance.now();
    
    setPrivacySettings(prev => ({ ...prev, ipMasking: enabled }));
    playToggleConfirmation('IP masking', enabled);
    
    const toggleTime = performance.now() - toggleStart;
    if (toggleTime > 50) {
      console.warn(`IP masking toggle time: ${toggleTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleSessionObfuscationToggle = (enabled: boolean) => {
    const toggleStart = performance.now();
    
    setPrivacySettings(prev => ({ ...prev, sessionObfuscation: enabled }));
    playToggleConfirmation('Session obfuscation', enabled);
    
    const toggleTime = performance.now() - toggleStart;
    if (toggleTime > 50) {
      console.warn(`Session obfuscation toggle time: ${toggleTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleKeyRotationToggle = (enabled: boolean) => {
    const toggleStart = performance.now();
    
    setPrivacySettings(prev => ({ ...prev, keyRotation: enabled }));
    playToggleConfirmation('Key rotation', enabled);
    
    if (enabled) {
      setLastKeyRotation(new Date());
    }
    
    const toggleTime = performance.now() - toggleStart;
    if (toggleTime > 50) {
      console.warn(`Key rotation toggle time: ${toggleTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleManualKeyRotation = () => {
    const rotationStart = performance.now();
    
    setLastKeyRotation(new Date());
    playToggleConfirmation('Key rotation', true);
    
    const rotationTime = performance.now() - rotationStart;
    if (rotationTime > 50) {
      console.warn(`Manual key rotation time: ${rotationTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getOverallStatus = () => {
    const activeCount = Object.values(privacySettings).filter(Boolean).length;
    if (activeCount === 3) return { status: 'Fully Protected', color: 'text-blue-400' };
    if (activeCount === 2) return { status: 'Partially Protected', color: 'text-amber-400' };
    if (activeCount === 1) return { status: 'Minimal Protection', color: 'text-amber-400' };
    return { status: 'Unprotected', color: 'text-red-400' };
  };

  const overallStatus = getOverallStatus();

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
      aria-label="Session Privacy Controls"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Session Privacy
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
                <p>Session anonymity secured by Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Control your session privacy and anonymity
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Overall Status */}
        <div 
          className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 text-center"
          aria-live="polite"
          aria-label="Overall privacy status"
        >
          <div className={cn('text-lg font-semibold', overallStatus.color)}>
            {overallStatus.status}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {Object.values(privacySettings).filter(Boolean).length} of 3 protections active
          </div>
        </div>

        {/* Privacy Controls */}
        <div className="space-y-4">
          {/* IP Masking */}
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-slate-100">IP Masking</span>
              </div>
              <Switch
                checked={privacySettings.ipMasking}
                onCheckedChange={handleIPMaskingToggle}
                className="data-[state=checked]:bg-blue-500"
                aria-label="Toggle IP masking"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Original IP:</span>
                <span className="text-slate-300 font-mono">
                  {privacySettings.ipMasking ? '••••••••••••' : MOCK_SESSION_DATA.originalIP}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Masked IP:</span>
                <span className="text-slate-300 font-mono">
                  {privacySettings.ipMasking ? MOCK_SESSION_DATA.maskedIP : 'Disabled'}
                </span>
              </div>
            </div>
            
            <Badge variant="outline" className={cn('mt-2', getStatusColor(privacySettings.ipMasking))}>
              {privacySettings.ipMasking ? 'Active' : 'Disabled'}
            </Badge>
          </div>

          {/* Session Obfuscation */}
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {privacySettings.sessionObfuscation ? (
                  <EyeOff className="w-4 h-4 text-blue-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
                <span className="font-medium text-slate-100">Session Obfuscation</span>
              </div>
              <Switch
                checked={privacySettings.sessionObfuscation}
                onCheckedChange={handleSessionObfuscationToggle}
                className="data-[state=checked]:bg-blue-500"
                aria-label="Toggle session obfuscation"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Session ID:</span>
                <span className="text-slate-300 font-mono">
                  {privacySettings.sessionObfuscation ? MOCK_SESSION_DATA.obfuscatedId : MOCK_SESSION_DATA.sessionId}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Metadata:</span>
                <span className="text-slate-300">
                  {privacySettings.sessionObfuscation ? 'Obfuscated' : 'Visible'}
                </span>
              </div>
            </div>
            
            <Badge variant="outline" className={cn('mt-2', getStatusColor(privacySettings.sessionObfuscation))}>
              {privacySettings.sessionObfuscation ? 'Active' : 'Disabled'}
            </Badge>
          </div>

          {/* Key Rotation */}
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-slate-100">Key Rotation</span>
              </div>
              <Switch
                checked={privacySettings.keyRotation}
                onCheckedChange={handleKeyRotationToggle}
                className="data-[state=checked]:bg-blue-500"
                aria-label="Toggle automatic key rotation"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Interval:</span>
                <span className="text-slate-300">
                  {privacySettings.keyRotation ? `${MOCK_SESSION_DATA.keyRotationInterval}s` : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Rotation:</span>
                <span className="text-slate-300">
                  {privacySettings.keyRotation ? formatTimeAgo(lastKeyRotation) : 'Never'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className={cn(getStatusColor(privacySettings.keyRotation))}>
                {privacySettings.keyRotation ? 'Auto-Rotating' : 'Disabled'}
              </Badge>
              
              <Button
                onClick={handleManualKeyRotation}
                variant="outline"
                size="sm"
                disabled={!privacySettings.keyRotation}
                className={cn(
                  'min-h-[48px] px-3 flex-1',
                  'bg-slate-700/50 border-slate-600 text-slate-200',
                  'hover:bg-slate-600/70 hover:text-slate-50',
                  'disabled:bg-slate-800/50 disabled:text-slate-500'
                )}
                aria-label="Manually rotate encryption keys"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Rotate Now
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className={cn('text-xs font-medium', overallStatus.color)}>
            {overallStatus.status === 'Fully Protected' && 'All privacy features are active'}
            {overallStatus.status === 'Partially Protected' && 'Some privacy features need attention'}
            {overallStatus.status === 'Minimal Protection' && 'Most privacy features are disabled'}
            {overallStatus.status === 'Unprotected' && 'No privacy protection active'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionPrivacyCard;
