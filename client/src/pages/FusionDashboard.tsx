/**
 * FusionDashboard.tsx
 * Civic Fusion Cycle Dashboard - TruthUnveiled DNA Loop Integration
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GuardianPillarSync } from '@/components/guardian/GuardianPillarSync';
import { LightOfTruthBadge } from '@/components/guardian/LightOfTruthBadge';
import { fusionIntegrityReplayService } from '@/services/FusionIntegrityReplay';

interface FusionCycleStage {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  route: string;
  tpRequired?: number;
  userTp?: number;
}

interface UserFusionProgress {
  did: string;
  currentStage: number;
  totalTp: number;
  completedPillars: number;
  badgesEarned: string[];
  zkpMintRequests: number;
  fusionRecords: any[];
}

export const FusionDashboard: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserFusionProgress>({
    did: 'did:civic:fusion_user_456',
    currentStage: 2,
    totalTp: 485,
    completedPillars: 6,
    badgesEarned: ['civic_pillar_bronze', 'truth_seeker'],
    zkpMintRequests: 1,
    fusionRecords: []
  });

  const [fusionStages] = useState<FusionCycleStage[]>([
    {
      id: 'onboarding',
      name: 'Civic Mission Onboarding',
      icon: '🚀',
      description: 'Complete civic mission and select your pillar focus',
      status: 'completed',
      route: '/onboarding',
      tpRequired: 0
    },
    {
      id: 'pillar_mastery',
      name: 'Pillar Mastery & TP Earning',
      icon: '🏛️',
      description: 'Master 8 civic pillars and earn Truth Points',
      status: 'active',
      route: '/onboarding/verify',
      tpRequired: 500,
      userTp: 485
    },
    {
      id: 'token_fusion',
      name: 'TruthCoin Genesis Fusion',
      icon: '⚡',
      description: 'Fuse TP into TruthCoins and generate badges',
      status: 'locked',
      route: '/genesis-fuse',
      tpRequired: 500
    },
    {
      id: 'zkp_mint',
      name: 'ZKP Mint Request',
      icon: '🔐',
      description: 'Submit ZKP mint request with DAO validation',
      status: 'locked',
      route: '/zkp/mint',
      tpRequired: 750
    },
    {
      id: 'dao_validation',
      name: 'DAO Consensus Validation',
      icon: '🏛️',
      description: 'Community validation and badge inheritance',
      status: 'locked',
      route: '/governance',
      tpRequired: 1000
    }
  ]);

  const [activeAudits, setActiveAudits] = useState<any[]>([]);

  useEffect(() => {
    // Initialize fusion audit monitoring
    initializeFusionMonitoring();
    
    // Update stage statuses based on user progress
    updateStageStatuses();
  }, [userProgress]);

  const initializeFusionMonitoring = async () => {
    try {
      const auditReport = await fusionIntegrityReplayService.executeReplayAudit();
      setActiveAudits(auditReport.auditEntries.slice(0, 3)); // Show latest 3
      console.log('🔄 Fusion monitoring initialized — audit entries loaded');
    } catch (error) {
      console.error('❌ Fusion monitoring failed:', error);
    }
  };

  const updateStageStatuses = () => {
    // Mock stage progression logic
    const updatedStages = fusionStages.map((stage, index) => {
      if (index < userProgress.currentStage) {
        return { ...stage, status: 'completed' as const };
      } else if (index === userProgress.currentStage) {
        return { ...stage, status: 'active' as const };
      } else {
        return { ...stage, status: 'locked' as const };
      }
    });
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const calculateOverallProgress = () => {
    const completedStages = fusionStages.filter(s => s.status === 'completed').length;
    return (completedStages / fusionStages.length) * 100;
  };

  const handleStageNavigation = (stage: FusionCycleStage) => {
    if (stage.status === 'locked') {
      console.log(`🔒 Stage ${stage.name} is locked — requirements not met`);
      return;
    }
    
    console.log(`🎯 Navigating to stage: ${stage.name} → ${stage.route}`);
    window.location.href = stage.route;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🧬 Civic Fusion Cycle Dashboard</h1>
          <p className="text-gray-600">TruthUnveiled DNA Loop — Your Complete Civic Journey</p>
          <Badge className="mt-2" variant="outline">
            DID: {userProgress.did}
          </Badge>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Fusion Cycle Progress
              <Badge className={getStageStatusColor('active')}>
                Stage {userProgress.currentStage + 1}/5 Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={calculateOverallProgress()} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{userProgress.totalTp}</div>
                  <div className="text-sm text-gray-600">Truth Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{userProgress.completedPillars}/8</div>
                  <div className="text-sm text-gray-600">Pillars Mastered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{userProgress.badgesEarned.length}</div>
                  <div className="text-sm text-gray-600">Badges Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{userProgress.zkpMintRequests}</div>
                  <div className="text-sm text-gray-600">ZKP Requests</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fusion Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {fusionStages.map((stage, index) => (
            <Card 
              key={stage.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                stage.status === 'locked' ? 'opacity-60' : ''
              }`}
              onClick={() => handleStageNavigation(stage)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" role="img" aria-label={stage.name}>
                      {stage.icon}
                    </span>
                    <div>
                      <div className="text-lg">{stage.name}</div>
                      <div className="text-sm text-gray-500">Stage {index + 1}</div>
                    </div>
                  </div>
                  <Badge className={getStageStatusColor(stage.status)}>
                    {stage.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{stage.description}</p>
                
                {stage.tpRequired && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>TP Requirement:</span>
                      <span className="font-semibold">{stage.tpRequired} TP</span>
                    </div>
                    {stage.userTp && (
                      <Progress 
                        value={(stage.userTp / stage.tpRequired) * 100} 
                        className="h-2"
                      />
                    )}
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4" 
                  variant={stage.status === 'active' ? 'default' : 'outline'}
                  disabled={stage.status === 'locked'}
                >
                  {stage.status === 'completed' && '✅ Review Stage'}
                  {stage.status === 'active' && '🎯 Continue'}
                  {stage.status === 'locked' && '🔒 Locked'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Fusion Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Live Fusion Audits
              <Badge variant="outline">Real-time</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAudits.length > 0 ? (
                activeAudits.map((audit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        audit.hashReproduced && audit.zkpVerification ? 'bg-green-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <div className="font-medium">{audit.recordId}</div>
                        <div className="text-sm text-gray-500">
                          CID: {audit.cidLength} chars, {audit.cidEncoding}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {audit.hashReproduced && <Badge variant="outline">Hash ✓</Badge>}
                      {audit.zkpVerification && <Badge variant="outline">ZKP ✓</Badge>}
                      {audit.anomalies.length > 0 && (
                        <Badge variant="destructive">{audit.anomalies.length} Issues</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  🔄 Loading fusion audit data...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};