/**
 * GuardianPillarSync.tsx
 * Phase X-M Step 2: Truth Zone Guardian Verification & Badge Activation
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PillarProgress {
  pillar: string;
  icon: string;
  completed: boolean;
  tpEarned: number;
  requiredTp: number;
  deckHistory: string[];
}

interface GuardianBadgeStatus {
  eligibility: 'eligible' | 'in_progress' | 'locked';
  completedPillars: number;
  totalTpEarned: number;
  requiredTpTotal: number;
  badgeUnlocked: boolean;
}

const GUARDIAN_PILLARS: PillarProgress[] = [
  { pillar: 'GOVERNANCE', icon: '🏛️', completed: false, tpEarned: 0, requiredTp: 100, deckHistory: [] },
  { pillar: 'TRANSPARENCY', icon: '🔍', completed: false, tpEarned: 0, requiredTp: 75, deckHistory: [] },
  { pillar: 'ACCOUNTABILITY', icon: '⚖️', completed: false, tpEarned: 0, requiredTp: 85, deckHistory: [] },
  { pillar: 'PARTICIPATION', icon: '🗳️', completed: false, tpEarned: 0, requiredTp: 90, deckHistory: [] },
  { pillar: 'EDUCATION', icon: '📚', completed: false, tpEarned: 0, requiredTp: 80, deckHistory: [] },
  { pillar: 'COMMUNITY', icon: '🤝', completed: false, tpEarned: 0, requiredTp: 70, deckHistory: [] },
  { pillar: 'INNOVATION', icon: '💡', completed: false, tpEarned: 0, requiredTp: 95, deckHistory: [] },
  { pillar: 'JUSTICE', icon: '⚖️', completed: false, tpEarned: 0, requiredTp: 110, deckHistory: [] }
];

interface GuardianPillarSyncProps {
  userDid?: string;
  onBadgeUnlock?: (badgeData: any) => void;
}

export const GuardianPillarSync: React.FC<GuardianPillarSyncProps> = ({
  userDid = 'did:civic:guardian_candidate_789',
  onBadgeUnlock
}) => {
  const [pillars, setPillars] = useState<PillarProgress[]>(GUARDIAN_PILLARS);
  const [badgeStatus, setBadgeStatus] = useState<GuardianBadgeStatus>({
    eligibility: 'in_progress',
    completedPillars: 0,
    totalTpEarned: 0,
    requiredTpTotal: 705,
    badgeUnlocked: false
  });
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Auto-sync on component mount
    performPillarSync();
    
    // Announce interface ready for accessibility
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Guardian pillar verification interface ready');
      utterance.rate = 0.8;
      utterance.volume = 0.3;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const performPillarSync = async (): Promise<void> => {
    setSyncInProgress(true);
    console.log('🧬 GuardianPillarSync: Syncing user deck history and TP scores...');
    
    try {
      // Simulate deck history pull and TP calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedPillars = pillars.map(pillar => {
        // Mock completion logic based on pillar requirements
        const mockTpEarned = Math.floor(Math.random() * (pillar.requiredTp + 20));
        const completed = mockTpEarned >= pillar.requiredTp;
        
        return {
          ...pillar,
          tpEarned: mockTpEarned,
          completed,
          deckHistory: completed ? [`deck_${pillar.pillar.toLowerCase()}_completed`] : []
        };
      });
      
      setPillars(updatedPillars);
      
      // Calculate badge status
      const completedCount = updatedPillars.filter(p => p.completed).length;
      const totalTp = updatedPillars.reduce((sum, p) => sum + p.tpEarned, 0);
      const allPillarsComplete = completedCount === 8;
      
      setBadgeStatus({
        eligibility: allPillarsComplete ? 'eligible' : 'in_progress',
        completedPillars: completedCount,
        totalTpEarned: totalTp,
        requiredTpTotal: 705,
        badgeUnlocked: allPillarsComplete
      });
      
      console.log(`🎯 Pillar sync complete — ${completedCount}/8 pillars, ${totalTp} TP earned`);
      
      if (allPillarsComplete && onBadgeUnlock) {
        const badgeData = {
          did: userDid,
          pillars: updatedPillars,
          totalTp: totalTp,
          unlockTimestamp: new Date().toISOString()
        };
        onBadgeUnlock(badgeData);
      }
      
    } catch (error) {
      console.error('❌ Pillar sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const getEligibilityColor = (eligibility: string) => {
    switch (eligibility) {
      case 'eligible': return 'bg-green-500';
      case 'in_progress': return 'bg-amber-500';
      default: return 'bg-red-500';
    }
  };

  const getPillarStatusColor = (completed: boolean) => {
    return completed ? 'text-green-600' : 'text-amber-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌟 Guardian Pillar Verification
          <Badge className={getEligibilityColor(badgeStatus.eligibility)}>
            {badgeStatus.eligibility.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Badge Status Overview */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{badgeStatus.completedPillars}/8</div>
              <div className="text-sm text-gray-600">Pillars Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{badgeStatus.totalTpEarned}</div>
              <div className="text-sm text-gray-600">Total TP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{badgeStatus.requiredTpTotal}</div>
              <div className="text-sm text-gray-600">Required TP</div>
            </div>
            <div>
              <div className="text-2xl">{badgeStatus.badgeUnlocked ? '🏆' : '🔒'}</div>
              <div className="text-sm text-gray-600">Badge Status</div>
            </div>
          </div>
        </div>

        {/* Pillar Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={pillar.pillar}>
                    {pillar.icon}
                  </span>
                  <span className="font-semibold">{pillar.pillar}</span>
                </div>
                <Badge variant={pillar.completed ? 'default' : 'secondary'}>
                  {pillar.completed ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
              
              <Progress 
                value={(pillar.tpEarned / pillar.requiredTp) * 100} 
                className="h-2"
              />
              
              <div className="flex justify-between text-sm">
                <span className={getPillarStatusColor(pillar.completed)}>
                  {pillar.tpEarned} / {pillar.requiredTp} TP
                </span>
                <span className="text-gray-500">
                  {Math.round((pillar.tpEarned / pillar.requiredTp) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sync Controls */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={performPillarSync}
            disabled={syncInProgress}
            className="min-w-48"
          >
            {syncInProgress ? '🔄 Syncing...' : '🔄 Refresh Pillar Status'}
          </Button>
          
          {badgeStatus.badgeUnlocked && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/onboarding/verify'}
              className="min-w-48"
            >
              ✨ Claim Guardian Badge
            </Button>
          )}
        </div>

        {/* DID Display */}
        <div className="text-center text-sm text-gray-500">
          Guardian Candidate: {userDid}
        </div>
      </CardContent>
    </Card>
  );
};