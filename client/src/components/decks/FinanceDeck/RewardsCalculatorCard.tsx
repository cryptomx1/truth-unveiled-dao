import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calculator, TrendingUp, Lock, Volume2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RewardsProjection {
  streak: number;
  contributions: number;
  referralTier: 1 | 2 | 3;
  projectedTP: number;
  projectedCC: number;
  multiplier: number;
}

interface RewardsCalculatorCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const REFERRAL_TIERS = [
  { value: 1, label: 'Tier 1 - Basic', multiplier: 1.0, description: 'Standard rewards' },
  { value: 2, label: 'Tier 2 - Active', multiplier: 1.25, description: '+25% bonus' },
  { value: 3, label: 'Tier 3 - Elite', multiplier: 1.5, description: '+50% bonus' }
];

const calculateRewards = (streak: number, contributions: number, referralTier: 1 | 2 | 3): RewardsProjection => {
  // Base calculation formulas
  const baseTPFromStreak = streak * 2; // 2 TP per day of streak
  const baseTPFromContributions = contributions * 3; // 3 TP per contribution
  const baseCCFromContributions = contributions * 1; // 1 CC per contribution
  const streakBonus = Math.floor(streak / 7) * 5; // 5 TP bonus every 7 days
  
  // Apply referral tier multiplier
  const tierData = REFERRAL_TIERS.find(tier => tier.value === referralTier);
  const multiplier = tierData?.multiplier || 1.0;
  
  const projectedTP = Math.floor((baseTPFromStreak + baseTPFromContributions + streakBonus) * multiplier);
  const projectedCC = Math.floor(baseCCFromContributions * multiplier);
  
  return {
    streak,
    contributions,
    referralTier,
    projectedTP,
    projectedCC,
    multiplier
  };
};

export const RewardsCalculatorCard: React.FC<RewardsCalculatorCardProps> = ({ className }) => {
  const [streak, setStreak] = useState([7]);
  const [contributions, setContributions] = useState([3]);
  const [referralTier, setReferralTier] = useState<1 | 2 | 3>(1);
  const [projection, setProjection] = useState<RewardsProjection | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`RewardsCalculatorCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`RewardsCalculatorCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Calculate rewards with performance monitoring
  const updateProjection = useCallback(() => {
    const calcStart = performance.now();
    
    const newProjection = calculateRewards(streak[0], contributions[0], referralTier);
    setProjection(newProjection);
    
    const calcTime = performance.now() - calcStart;
    if (calcTime > 50) {
      console.warn(`Calculation time: ${calcTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  }, [streak, contributions, referralTier]);

  // Update projection when inputs change
  useEffect(() => {
    updateProjection();
  }, [updateProjection]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play estimation message on mount
          const utterance = new SpeechSynthesisUtterance("Estimate your future earnings.");
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

  const handleStreakChange = (value: number[]) => {
    const inputStart = performance.now();
    setStreak(value);
    
    const inputTime = performance.now() - inputStart;
    if (inputTime > 50) {
      console.warn(`Streak input response time: ${inputTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleContributionsChange = (value: number[]) => {
    const inputStart = performance.now();
    setContributions(value);
    
    const inputTime = performance.now() - inputStart;
    if (inputTime > 50) {
      console.warn(`Contributions input response time: ${inputTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleReferralTierChange = (value: string) => {
    const inputStart = performance.now();
    setReferralTier(parseInt(value) as 1 | 2 | 3);
    
    const inputTime = performance.now() - inputStart;
    if (inputTime > 50) {
      console.warn(`Referral tier input response time: ${inputTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const playProjectionSummary = () => {
    if (!ttsStatus.isReady || !projection) return;
    
    const summary = `Projected earnings: ${projection.projectedTP} Truth Points and ${projection.projectedCC} Contribution Credits with ${projection.multiplier}x multiplier.`;
    
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const getTierColor = (tier: 1 | 2 | 3) => {
    switch (tier) {
      case 1:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 2:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 3:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
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
      aria-label="Rewards Calculator"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-400" />
            Rewards Calculator
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
                <p>Private reward estimation available in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Project your future TP and CC earnings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="space-y-5">
          {/* Voting Streak Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="streak-slider"
                className="text-sm font-medium text-slate-200"
              >
                Voting Streak
              </label>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {streak[0]} days
              </Badge>
            </div>
            <Slider
              id="streak-slider"
              value={streak}
              onValueChange={handleStreakChange}
              min={1}
              max={30}
              step={1}
              className="w-full"
              aria-label={`Voting streak: ${streak[0]} days`}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1 day</span>
              <span>30 days</span>
            </div>
          </div>

          {/* Contributions Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="contributions-slider"
                className="text-sm font-medium text-slate-200"
              >
                Monthly Contributions
              </label>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {contributions[0]} items
              </Badge>
            </div>
            <Slider
              id="contributions-slider"
              value={contributions}
              onValueChange={handleContributionsChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
              aria-label={`Monthly contributions: ${contributions[0]} items`}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1 item</span>
              <span>10 items</span>
            </div>
          </div>

          {/* Referral Tier Select */}
          <div className="space-y-3">
            <label 
              htmlFor="referral-tier-select"
              className="text-sm font-medium text-slate-200 block"
            >
              Referral Tier
            </label>
            <Select value={referralTier.toString()} onValueChange={handleReferralTierChange}>
              <SelectTrigger 
                id="referral-tier-select"
                className="w-full min-h-[48px] bg-slate-700/50 border-slate-600 text-slate-100"
                aria-label={`Current referral tier: ${referralTier}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {REFERRAL_TIERS.map((tier) => (
                  <SelectItem 
                    key={tier.value} 
                    value={tier.value.toString()}
                    className="text-slate-100 focus:bg-slate-700"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{tier.label}</span>
                      <span className="text-xs text-slate-400 ml-2">{tier.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projection Results */}
        {projection && (
          <div 
            className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4"
            aria-live="polite"
            aria-label="Earnings projection results"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Monthly Projection
              </h3>
              <Button
                onClick={playProjectionSummary}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-200 p-1 min-h-[48px] min-w-[48px]"
                aria-label="Read projection summary aloud"
                disabled={ttsStatus.isPlaying}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{projection.projectedTP}</div>
                <div className="text-xs text-slate-400">Truth Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{projection.projectedCC}</div>
                <div className="text-xs text-slate-400">Contribution Credits</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Base from streak ({projection.streak} days):</span>
                <span className="text-slate-200">{projection.streak * 2} TP</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Base from contributions ({projection.contributions} items):</span>
                <span className="text-slate-200">{projection.contributions * 3} TP + {projection.contributions} CC</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Referral multiplier:</span>
                <Badge variant="outline" className={getTierColor(projection.referralTier)}>
                  {projection.multiplier}x
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Projections based on current activity patterns
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsCalculatorCard;
