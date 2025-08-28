import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalCopyButton } from '@/components/ui/universal-copy-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Award, MapPin, Zap } from 'lucide-react';
import { MissionReferrerOverlay } from './MissionReferrerOverlay';
import { CivicMissionLedger } from '@/civic/CivicMissionLedger';
import { TruthAffiliateTokenBridge } from '@/tokenomics/TruthAffiliateTokenBridge';
import { TPRewardEngine } from '@/tokenomics/TPRewardEngine';

interface MissionStep {
  id: string;
  title: string;
  description: string;
  route: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface CivicMissionOnboardingCardProps {
  citizenCID?: string;
  onMissionSelect?: (route: string) => void;
  fusionMode?: boolean;
}

export function CivicMissionOnboardingCard({ 
  citizenCID, 
  onMissionSelect,
  fusionMode = false
}: CivicMissionOnboardingCardProps) {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCommanderMode, setIsCommanderMode] = useState(false);
  const [showReferrerOverlay, setShowReferrerOverlay] = useState(false);

  // Check for Commander Mark CID pattern and referral detection
  useEffect(() => {
    if (citizenCID?.includes('commander-mark')) {
      setIsCommanderMode(true);
      console.log('🎖️ Commander Mode Activated - Auto-unlocking all decks');
    }

    // Check for referral code on mount
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || localStorage.getItem('civic_referral_code');
    
    if (refCode && !localStorage.getItem('referral_processed')) {
      setShowReferrerOverlay(true);
    }

    // Sync any pending affiliate data
    TruthAffiliateTokenBridge.syncPendingAffiliateData();
  }, [citizenCID]);

  const missionSteps: MissionStep[] = [
    {
      id: 'identity',
      title: 'Establish Civic Identity',
      description: 'Create your decentralized identity and join the civic genome',
      route: '/deck/12',
      completed: isCommanderMode,
      icon: <User className="w-4 h-4" />
    },
    {
      id: 'compass',
      title: 'Navigate Your Civic Path',
      description: 'Use the civic compass to discover your engagement style',
      route: '/command',
      completed: false,
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'voice',
      title: 'Express Your Voice',
      description: 'Participate in governance feedback and trust voting',
      route: '/deck/10',
      completed: false,
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'vault',
      title: 'Build Your Reputation',
      description: 'Access vault analytics and tier progression systems',
      route: '/vault/analyzer',
      completed: false,
      icon: <Award className="w-4 h-4" />
    }
  ];

  const progressPercentage = ((currentStep + 1) / missionSteps.length) * 100;

  const handleStepSelect = (step: MissionStep, index: number) => {
    setCurrentStep(index);
    
    // CID tier detection for fusion mode
    const mockCidTier = citizenCID?.includes('commander') ? 'Commander' : 
                       citizenCID?.includes('governor') ? 'Governor' : 'Citizen';
    
    // Check eligibility for fusion mode
    if (fusionMode && mockCidTier === 'Citizen' && !isCommanderMode) {
      console.log('⚠️ Fusion mode: CID tier insufficient for mission activation');
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          'Mission requires higher civic tier. Complete more activities to unlock.'
        );
        utterance.rate = 0.8;
        utterance.volume = 0.7;
        speechSynthesis.speak(utterance);
      }
      return;
    }
    
    // Route construction for fusion mode
    const targetRoute = fusionMode ? `/fusion/onboarding/${step.id}` : step.route;
    
    // Use wouter navigation instead of window.location
    setLocation(targetRoute);
    
    if (onMissionSelect) {
      onMissionSelect(targetRoute);
    }
    
    // TTS announcement for step selection
    if ('speechSynthesis' in window) {
      const announcement = fusionMode 
        ? `Fusion mission activated: ${step.title}. CID tier: ${mockCidTier}.`
        : `Civic mission selected: ${step.title}`;
        
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.9;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
    
    console.log(`🎯 Mission Step Selected: ${step.title} → ${targetRoute} ${fusionMode ? '(Fusion Mode)' : ''}`);
  };

  const handleCommanderAccess = () => {
    // Use wouter navigation
    setLocation('/command');
    
    if (onMissionSelect) {
      onMissionSelect('/command');
    }
    console.log('🎖️ Commander Access: Full deck unlock initiated');
  };

  const handleReferralAccepted = (referrerData: any) => {
    console.log('🪪 Referral accepted from:', referrerData.alias);
    
    // Log referral acceptance
    CivicMissionLedger.appendEntry({
      eventType: 'mission_referral_accepted',
      referrerCid: referrerData.cid,
      referrerAlias: referrerData.alias,
      metadata: { 
        tpRank: referrerData.tpRank,
        reputation: referrerData.reputation,
        truthCoins: referrerData.truthCoins
      }
    });

    // Process signup bonus
    TruthAffiliateTokenBridge.processSignupBonus(referrerData.cid, citizenCID || 'new-citizen');
    
    // Inject test TP reward
    TPRewardEngine.injectTestReward(
      citizenCID || 'new-citizen', 
      75, 
      `Referral bonus from ${referrerData.alias}`
    );

    localStorage.setItem('referral_processed', 'true');
    setShowReferrerOverlay(false);
  };

  const handleIndependentProceed = () => {
    console.log('🚶 Proceeding as independent citizen');
    
    CivicMissionLedger.appendEntry({
      eventType: 'independent_citizen_proceed',
      actionDetails: 'User chose to proceed without referral',
      metadata: { timestamp: new Date().toISOString() }
    });

    setShowReferrerOverlay(false);
  };

  return (
    <>
      {/* Mission Referrer Overlay */}
      {showReferrerOverlay && (
        <MissionReferrerOverlay
          onAccept={handleReferralAccepted}
          onIndependentProceed={handleIndependentProceed}
          onDismiss={() => setShowReferrerOverlay(false)}
        />
      )}

      <Card className="w-full max-w-2xl mx-auto bg-slate-800 border-slate-700 text-white">
        <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <CardTitle className="text-xl font-bold">
            Truth Unveiled Civic Genome
          </CardTitle>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        
        {isCommanderMode && (
          <Badge className="bg-amber-600 text-white">
            Commander Mode - Full Access Granted
          </Badge>
        )}
        
        <div className="text-sm text-slate-300 space-y-2">
          <div className="flex items-center gap-2">
            <p>Loaded from IPFS - CID: QmXj5llhfmbendtruthunveiled</p>
            <UniversalCopyButton
              content="QmXj5llhfmbendtruthunveiled"
              label="Copy CID"
              size="sm"
              showLabel={false}
              className="bg-blue-600/30 border-blue-500/50 text-blue-200 hover:bg-blue-600/40"
            />
          </div>
          <div className="flex gap-2">
            <UniversalCopyButton
              content="https://gateway.pinata.cloud/ipfs/QmXj5llhfmbendtruthunveiled"
              label="Copy IPFS Link"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
            />
            <UniversalCopyButton
              content={`Truth Unveiled Civic Genome - Mission Onboarding
CID: QmXj5llhfmbendtruthunveiled
IPFS Gateway: https://gateway.pinata.cloud/ipfs/QmXj5llhfmbendtruthunveiled
Commander Mode: ${isCommanderMode ? 'Active' : 'Inactive'}
Mission Progress: ${((currentStep + 1) / missionSteps.length * 100).toFixed(0)}%

For JASMY/Claude collaboration`}
              label="Copy Status"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white border-green-500"
            />
          </div>
        </div>
        </CardHeader>

        <CardContent className="space-y-6">
        {isCommanderMode ? (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold text-amber-400">
              Welcome back, Commander Mark
            </div>
            <p className="text-sm text-slate-300">
              All civic decks and vault analytics are unlocked for your access.
            </p>
            <Button 
              onClick={handleCommanderAccess}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Access Command Center
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mission Progress</span>
                <span>{currentStep + 1} of {missionSteps.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-center">
                Choose Your Civic Mission
              </h3>
              
              {missionSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    index === currentStep 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                  onClick={() => handleStepSelect(step, index)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      step.completed ? 'bg-green-600' : 
                      index === currentStep ? 'bg-blue-600' : 'bg-slate-600'
                    }`}>
                      {step.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{step.title}</h4>
                        {step.completed && (
                          <Badge className="bg-green-600 text-white text-xs">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 mt-1">
                        {step.description}
                      </p>
                      <div className="text-xs text-slate-400 mt-2">
                        Route: {step.route}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-600">
              <Button 
                onClick={() => handleStepSelect(missionSteps[currentStep], currentStep)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!missionSteps[currentStep]}
              >
                Begin Mission: {missionSteps[currentStep]?.title}
              </Button>
            </div>
          </>
        )}

        <div className="text-xs text-slate-400 text-center space-y-1">
          <p>Phase 0-X Deployment Active | 20 Decks + 80+ Modules</p>
          <p>Authority: Commander Mark via JASMY Relay</p>
        </div>
        </CardContent>
      </Card>
    </>
  );
}

export default CivicMissionOnboardingCard;