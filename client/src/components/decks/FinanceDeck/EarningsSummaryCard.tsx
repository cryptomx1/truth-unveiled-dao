import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DollarSign, TrendingUp, Lock, Copy, Users, Coins } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface EarningsData {
  truthPoints: number;
  contributionCredits: number;
  referralMultipliers: {
    participation: number;
    engagement: number;
    consistency: number;
  };
  referralCode: string;
  lastUpdate: Date;
}

interface EarningsSummaryCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const INITIAL_EARNINGS: EarningsData = {
  truthPoints: 150,
  contributionCredits: 25,
  referralMultipliers: {
    participation: 15,
    engagement: 25,
    consistency: 5
  },
  referralCode: 'TU-1234-XYZ',
  lastUpdate: new Date()
};

export const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({ className }) => {
  const [earnings, setEarnings] = useState<EarningsData>(INITIAL_EARNINGS);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const [isUpdating, setIsUpdating] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const cardRef = useRef<HTMLDivElement>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`EarningsSummaryCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`EarningsSummaryCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration - Only on initial mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play earnings visibility message on mount only
          const utterance = new SpeechSynthesisUtterance("Your civic earnings are now visible.");
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
  }, []); // Empty dependency array - only run on mount

  // Auto-update earnings every 5 seconds
  useEffect(() => {
    const updateEarnings = () => {
      const updateStart = performance.now();
      setIsUpdating(true);

      // Reduced timeout to meet performance target
      setTimeout(() => {
        setEarnings(prev => ({
          ...prev,
          truthPoints: prev.truthPoints + Math.floor(Math.random() * 3), // +0-2 TP
          contributionCredits: prev.contributionCredits + (Math.random() > 0.7 ? 1 : 0), // Occasional +1 CC
          lastUpdate: new Date()
        }));

        const updateTime = performance.now() - updateStart;
        if (updateTime > 50) {
          console.warn(`Earnings update time: ${updateTime.toFixed(2)}ms (exceeds 50ms target)`);
        }
        
        setIsUpdating(false);
      }, 20); // Reduced from 100ms to 20ms
    };

    updateIntervalRef.current = setInterval(updateEarnings, 5000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const handleCopyReferralCode = async () => {
    setCopyStatus('copying');
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(earnings.referralCode);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = earnings.referralCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopyStatus('success');
      
      // TTS confirmation
      if (ttsStatus.isReady) {
        const utterance = new SpeechSynthesisUtterance("Referral code copied successfully.");
        utterance.rate = 0.9;
        utterance.volume = 0.6;
        speechSynthesis.speak(utterance);
      }
      
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy referral code:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const getTotalMultiplier = () => {
    return earnings.referralMultipliers.participation + 
           earnings.referralMultipliers.engagement + 
           earnings.referralMultipliers.consistency;
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-800 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Civic Earnings Summary"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Civic Earnings
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                  <Lock className="w-3 h-3 mr-1" />
                  ZKP
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anonymized ledger unlocks in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Track your Truth Points and Contribution Credits
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Earnings Display */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Truth Points */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
                  Truth Points
                </span>
              </div>
              <div 
                className={cn(
                  'text-2xl font-bold text-blue-400',
                  isUpdating && 'animate-pulse'
                )}
                aria-live="polite"
                aria-label={`Truth Points: ${earnings.truthPoints}`}
              >
                {earnings.truthPoints}
              </div>
              <div className="text-xs text-slate-400 mt-1">TP</div>
            </div>

            {/* Contribution Credits */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
                  Credits
                </span>
              </div>
              <div 
                className={cn(
                  'text-2xl font-bold text-green-400',
                  isUpdating && 'animate-pulse'
                )}
                aria-live="polite"
                aria-label={`Contribution Credits: ${earnings.contributionCredits}`}
              >
                {earnings.contributionCredits}
              </div>
              <div className="text-xs text-slate-400 mt-1">CC</div>
            </div>
          </div>
        </div>

        {/* Referral Multipliers */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-200">Referral Multipliers</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Participation</span>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                +{earnings.referralMultipliers.participation}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Engagement</span>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                +{earnings.referralMultipliers.engagement}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Consistency</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                +{earnings.referralMultipliers.consistency}%
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-600/50 mt-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-200">Total Boost</span>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                +{getTotalMultiplier()}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Your Referral Code</div>
              <div className="text-sm font-mono text-slate-100 bg-slate-800/50 px-2 py-1 rounded border border-slate-600/30">
                {earnings.referralCode}
              </div>
            </div>
            <Button
              onClick={handleCopyReferralCode}
              disabled={copyStatus === 'copying'}
              size="sm"
              variant="outline"
              className={cn(
                'min-h-[48px] px-3',
                'bg-slate-700 border-slate-600 text-slate-200',
                'hover:bg-slate-600 hover:border-slate-500',
                copyStatus === 'success' && 'bg-green-600/20 border-green-500/30 text-green-300',
                copyStatus === 'error' && 'bg-red-600/20 border-red-500/30 text-red-300'
              )}
              aria-label="Copy referral code to clipboard"
            >
              {copyStatus === 'copying' ? (
                <>Copying...</>
              ) : copyStatus === 'success' ? (
                <>✓ Copied</>
              ) : copyStatus === 'error' ? (
                <>Error</>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Last updated: {earnings.lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsSummaryCard;
