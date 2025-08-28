/**
 * CivicUnlockPortal.tsx
 * Phase X-M Step 4: Guardian Onboarding Interface
 * Commander Mark directive via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Lock, Unlock, Crown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { GuardianVerificationEngine } from './GuardianVerificationEngine';
import TTSToggle from '@/components/tts/TTSToggle';

interface GuardianClaim {
  pillarId: string;
  pillarName: string;
  guardianName: string;
  icon: string;
  requirements: {
    truthPoints: number;
    genesisBadges: number;
    zkpProofs: number;
    ritualComplete: boolean;
  };
  unlocked: boolean;
  claimProgress: number;
}

interface UnlockStatus {
  totalTP: number;
  genesisBadges: number;
  zkpProofs: number;
  tier: 'Citizen' | 'Governor' | 'Commander';
  did: string;
  cid: string;
}

const CivicUnlockPortal: React.FC = () => {
  const [unlockStatus, setUnlockStatus] = useState<UnlockStatus>({
    totalTP: 875,
    genesisBadges: 1,
    zkpProofs: 3,
    tier: 'Citizen',
    did: 'did:civic:test_user_123',
    cid: 'cid:wallet:test_user_123'
  });

  const [guardianClaims, setGuardianClaims] = useState<GuardianClaim[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockHistory, setUnlockHistory] = useState<any[]>([]);
  const verifier = GuardianVerificationEngine.getInstance();

  useEffect(() => {
    initializeGuardianClaims();
    loadUnlockHistory();
  }, []);

  const initializeGuardianClaims = () => {
    const pillars: GuardianClaim[] = [
      {
        pillarId: 'GOVERNANCE',
        pillarName: 'Governance',
        guardianName: 'Athena',
        icon: '⚖️',
        requirements: { truthPoints: 500, genesisBadges: 1, zkpProofs: 2, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      },
      {
        pillarId: 'EDUCATION',
        pillarName: 'Education',
        guardianName: 'Sophia',
        icon: '📚',
        requirements: { truthPoints: 400, genesisBadges: 1, zkpProofs: 1, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      },
      {
        pillarId: 'PRIVACY',
        pillarName: 'Privacy',
        guardianName: 'Themis',
        icon: '🔒',
        requirements: { truthPoints: 600, genesisBadges: 1, zkpProofs: 3, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      },
      {
        pillarId: 'SUSTAINABILITY',
        pillarName: 'Sustainability',
        guardianName: 'Apollo',
        icon: '🌱',
        requirements: { truthPoints: 450, genesisBadges: 1, zkpProofs: 2, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      },
      {
        pillarId: 'WELLBEING',
        pillarName: 'Wellbeing',
        guardianName: 'Artemis',
        icon: '💚',
        requirements: { truthPoints: 350, genesisBadges: 1, zkpProofs: 1, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      },
      {
        pillarId: 'AGRICULTURE',
        pillarName: 'Agriculture',
        guardianName: 'Demeter',
        icon: '🌾',
        requirements: { truthPoints: 400, genesisBadges: 1, zkpProofs: 2, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      },
      {
        pillarId: 'HEALTH',
        pillarName: 'Health',
        guardianName: 'Asclepius',
        icon: '⚕️',
        requirements: { truthPoints: 550, genesisBadges: 1, zkpProofs: 2, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      },
      {
        pillarId: 'JUSTICE',
        pillarName: 'Justice',
        guardianName: 'Mnemosyne',
        icon: '⚖️',
        requirements: { truthPoints: 700, genesisBadges: 1, zkpProofs: 3, ritualComplete: true },
        unlocked: false,
        claimProgress: 0
      }
    ];

    // Calculate claim progress for each pillar
    const updatedPillars = pillars.map(pillar => {
      const tpProgress = Math.min(100, (unlockStatus.totalTP / pillar.requirements.truthPoints) * 100);
      const badgeProgress = unlockStatus.genesisBadges >= pillar.requirements.genesisBadges ? 100 : 0;
      const zkpProgress = Math.min(100, (unlockStatus.zkpProofs / pillar.requirements.zkpProofs) * 100);
      const ritualProgress = pillar.requirements.ritualComplete ? 100 : 0;
      
      const overallProgress = (tpProgress + badgeProgress + zkpProgress + ritualProgress) / 4;
      
      return {
        ...pillar,
        claimProgress: Math.round(overallProgress),
        unlocked: overallProgress >= 100
      };
    });

    setGuardianClaims(updatedPillars);
  };

  const loadUnlockHistory = () => {
    const history = localStorage.getItem('guardian_unlock_history');
    if (history) {
      try {
        setUnlockHistory(JSON.parse(history));
      } catch (e) {
        console.warn('Failed to load unlock history');
      }
    }
  };

  const handleClaimGuardianship = async (pillarId: string) => {
    const pillar = guardianClaims.find(p => p.pillarId === pillarId);
    if (!pillar || !pillar.unlocked) return;

    setIsProcessing(true);
    setSelectedPillar(pillarId);

    try {
      const verificationResult = await verifier.verifyGuardianClaim({
        did: unlockStatus.did,
        cid: unlockStatus.cid,
        pillarId,
        truthPoints: unlockStatus.totalTP,
        genesisBadges: unlockStatus.genesisBadges,
        zkpProofs: unlockStatus.zkpProofs,
        tier: unlockStatus.tier
      });

      if (verificationResult.success) {
        // Record unlock in history
        const unlockRecord = {
          id: `unlock_${Date.now()}`,
          pillarId,
          pillarName: pillar.pillarName,
          guardianName: pillar.guardianName,
          timestamp: new Date().toISOString(),
          did: unlockStatus.did,
          cid: unlockStatus.cid,
          tier: unlockStatus.tier,
          requirements: pillar.requirements,
          verificationHash: verificationResult.verificationHash
        };

        const updatedHistory = [...unlockHistory, unlockRecord];
        setUnlockHistory(updatedHistory);
        localStorage.setItem('guardian_unlock_history', JSON.stringify(updatedHistory));

        // Update pillar status
        setGuardianClaims(prev => prev.map(p => 
          p.pillarId === pillarId 
            ? { ...p, unlocked: false, claimProgress: 100 } // Already claimed
            : p
        ));

        console.log(`🛡️ Guardian unlocked: ${pillar.guardianName} for ${pillar.pillarName}`);
        announceToScreenReader(`Guardian ${pillar.guardianName} unlocked for ${pillar.pillarName} pillar`);
      } else {
        console.error('Guardian verification failed:', verificationResult.error);
        announceToScreenReader('Guardian unlock failed - verification error');
      }
    } catch (error) {
      console.error('Guardian claim error:', error);
      announceToScreenReader('Guardian unlock failed - system error');
    } finally {
      setIsProcessing(false);
      setSelectedPillar(null);
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const getStatusIcon = (pillar: GuardianClaim) => {
    if (unlockHistory.some(h => h.pillarId === pillar.pillarId)) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (pillar.unlocked) {
      return <Unlock className="h-5 w-5 text-blue-600" />;
    }
    return <Lock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = (pillar: GuardianClaim) => {
    if (unlockHistory.some(h => h.pillarId === pillar.pillarId)) return 'bg-green-50 border-green-200';
    if (pillar.unlocked) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header with TTS */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Civic Unlock Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Claim Guardian access to civic pillars through verified truth rituals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TTSToggle 
            deckId="unlock-portal" 
            moduleId="guardian-onboarding"
            content="Welcome to the Civic Unlock Portal. Here you can claim Guardian access to the eight civic pillars by completing truth rituals and staking requirements. Each pillar requires specific TruthPoint amounts, Genesis Badges, and ZKP proofs."
          />
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Phase X-M Step 4
          </Badge>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Guardian Status Overview
          </CardTitle>
          <CardDescription>
            Your current progress toward Guardian requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{unlockStatus.totalTP}</div>
              <div className="text-sm text-gray-600">TruthPoints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unlockStatus.genesisBadges}</div>
              <div className="text-sm text-gray-600">Genesis Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{unlockStatus.zkpProofs}</div>
              <div className="text-sm text-gray-600">ZKP Proofs</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {unlockStatus.tier}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Current Tier</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Claims Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {guardianClaims.map((pillar) => (
          <Card 
            key={pillar.pillarId} 
            className={`transition-all hover:shadow-md ${getStatusColor(pillar)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{pillar.icon}</div>
                {getStatusIcon(pillar)}
              </div>
              <CardTitle className="text-lg">{pillar.pillarName}</CardTitle>
              <CardDescription>Guardian: {pillar.guardianName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{pillar.claimProgress}%</span>
                </div>
                <Progress value={pillar.claimProgress} className="h-2" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>TruthPoints:</span>
                  <span className={unlockStatus.totalTP >= pillar.requirements.truthPoints ? 'text-green-600' : 'text-red-600'}>
                    {pillar.requirements.truthPoints} TP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Genesis Badges:</span>
                  <span className={unlockStatus.genesisBadges >= pillar.requirements.genesisBadges ? 'text-green-600' : 'text-red-600'}>
                    {pillar.requirements.genesisBadges}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ZKP Proofs:</span>
                  <span className={unlockStatus.zkpProofs >= pillar.requirements.zkpProofs ? 'text-green-600' : 'text-red-600'}>
                    {pillar.requirements.zkpProofs}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleClaimGuardianship(pillar.pillarId)}
                disabled={!pillar.unlocked || isProcessing || unlockHistory.some(h => h.pillarId === pillar.pillarId)}
                className="w-full"
                size="sm"
              >
                {isProcessing && selectedPillar === pillar.pillarId ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : unlockHistory.some(h => h.pillarId === pillar.pillarId) ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Claimed
                  </>
                ) : pillar.unlocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Claim Guardian
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Locked
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unlock History */}
      {unlockHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Guardian Unlock History</CardTitle>
            <CardDescription>
              Your claimed Guardian positions and verification records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlockHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">{record.guardianName} - {record.pillarName}</div>
                      <div className="text-sm text-gray-600">
                        Claimed: {new Date(record.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Guardian Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CivicUnlockPortal;