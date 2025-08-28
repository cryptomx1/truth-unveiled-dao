// WalletFinancePage.tsx - Phase X-FINANCE Step 5: Complete Finance Dashboard
// 4-tab interface with TTS integration and mobile responsiveness

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react';
import TTSToggle from '../tts/TTSToggle';
import TruthCoinClaimEngine, { type TruthCoinClaim, type ClaimStats } from './TruthCoinClaimEngine';
import GenesisFusionEngine, { type GenesisBadge, type GuardianPillar } from './GenesisFusionEngine';

export default function WalletFinancePage() {
  const [claimEngine] = useState(() => TruthCoinClaimEngine.getInstance());
  const [fusionEngine] = useState(() => GenesisFusionEngine.getInstance());
  const [claims, setClaims] = useState<TruthCoinClaim[]>([]);
  const [claimStats, setClaimStats] = useState<ClaimStats>({
    totalClaims: 0,
    approvedClaims: 0,
    totalRewards: 0,
    averageProcessingTime: 0,
    successRate: 0
  });
  const [userBadge, setUserBadge] = useState<GenesisBadge | undefined>();
  const [guardianPillars, setGuardianPillars] = useState<GuardianPillar[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClaimType, setSelectedClaimType] = useState<'referral' | 'governance' | 'civic_duty' | 'education'>('referral');

  // Mock user data
  const currentUser = {
    id: 'user_demo_123',
    tier: 'Governor' as const,
    currentBalance: 485,
    totalEarned: 1250,
    tierMultiplier: 2.0
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = () => {
    try {
      // Load claims data
      const recentClaims = claimEngine.getRecentClaims(10);
      setClaims(recentClaims);
      setClaimStats(claimEngine.getClaimStats());

      // Load Genesis badge data
      const badge = fusionEngine.getBadgeByUserId(currentUser.id);
      setUserBadge(badge);
      setGuardianPillars(fusionEngine.getGuardianPillars());

      console.log('💰 Finance data loaded:', {
        claims: recentClaims.length,
        badge: badge?.status || 'none',
        stats: claimStats
      });
    } catch (error) {
      console.error('❌ Failed to load finance data:', error);
    }
  };

  const handleSubmitClaim = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log(`🎯 Submitting ${selectedClaimType} claim`);
      
      const newClaim = await claimEngine.submitClaim(
        selectedClaimType,
        currentUser.id,
        currentUser.tier,
        'wallet-finance'
      );

      console.log('✅ Claim submitted:', newClaim.claimId);
      
      // Reload data to show new claim
      setTimeout(loadFinanceData, 500);
      
    } catch (error) {
      console.error('❌ Claim submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'completed':
      case 'minted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
      case 'fusing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'completed':
      case 'minted':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'fusing':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finance Center</h1>
          <p className="text-muted-foreground">Manage TruthCoin claims and Genesis badge fusion</p>
        </div>
        <TTSToggle 
          deckId="wallet-finance" 
          moduleId="dashboard"
          content="Finance center dashboard with claim submission, fusion tracking, and reward analytics"
        />
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{currentUser.currentBalance.toLocaleString()} TC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Genesis Tokens</p>
                <p className="text-2xl font-bold">{userBadge?.status === 'minted' ? '1' : '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">{currentUser.totalEarned.toLocaleString()} TC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tier Multiplier</p>
                <p className="text-2xl font-bold">{currentUser.tierMultiplier}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="submit">Submit Claims</TabsTrigger>
          <TabsTrigger value="history">Claim History</TabsTrigger>
          <TabsTrigger value="fusion">Fusion Center</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Submit Claims Tab */}
        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Submit New Claim</CardTitle>
                <TTSToggle 
                  deckId="wallet-finance" 
                  moduleId="submit-claims"
                  content="Submit TruthCoin claims for referrals, governance, civic duty, and education activities"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Claim Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { type: 'referral', label: 'Referral', base: 100, icon: '👥' },
                  { type: 'governance', label: 'Governance', base: 150, icon: '🏛️' },
                  { type: 'civic_duty', label: 'Civic Duty', base: 200, icon: '🎯' },
                  { type: 'education', label: 'Education', base: 125, icon: '📚' }
                ].map((claimType) => (
                  <Card 
                    key={claimType.type}
                    className={`cursor-pointer transition-all ${
                      selectedClaimType === claimType.type 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => setSelectedClaimType(claimType.type as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{claimType.icon}</div>
                      <h3 className="font-semibold">{claimType.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {claimType.base} × {currentUser.tierMultiplier}x = {claimType.base * currentUser.tierMultiplier} TC
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={handleSubmitClaim}
                disabled={isSubmitting}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Processing...' : `Submit ${selectedClaimType.replace('_', ' ')} Claim`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claim History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Claims</CardTitle>
                <TTSToggle 
                  deckId="wallet-finance" 
                  moduleId="claim-history"
                  content="Review your TruthCoin claim history with status tracking and reward details"
                />
              </div>
            </CardHeader>
            <CardContent>
              {claims.length > 0 ? (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.claimId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                        {getStatusIcon(claim.status)}
                        <div>
                          <p className="font-medium">{claim.claimType.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {claim.timestamp.toLocaleDateString()} • {claim.finalReward} TC
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {claim.eligibilityScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No claims submitted yet</p>
                  <p className="text-sm text-muted-foreground">Submit your first claim to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fusion Center Tab */}
        <TabsContent value="fusion" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Genesis Badge Fusion</CardTitle>
                <TTSToggle 
                  deckId="wallet-finance" 
                  moduleId="fusion-center"
                  content="Track Genesis badge fusion progress across civic pillars with guardian assignments"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {userBadge ? (
                <>
                  {/* Badge Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Badge Status: {userBadge.status}</h3>
                      <p className="text-muted-foreground">
                        Fusion Power: {userBadge.fusionPower}% • Pillars: {userBadge.completedPillars.length}/8
                      </p>
                    </div>
                    <Badge className={getStatusColor(userBadge.status)}>
                      {userBadge.status}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Fusion Progress</span>
                      <span>{userBadge.fusionPower}%</span>
                    </div>
                    <Progress value={userBadge.fusionPower} className="h-2" />
                  </div>

                  {/* Guardian Pillars */}
                  <div>
                    <h4 className="font-medium mb-4">Guardian Pillars</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {guardianPillars.map((pillar) => {
                        const isCompleted = userBadge.completedPillars.includes(pillar.pillarId);
                        return (
                          <div 
                            key={pillar.pillarId}
                            className={`p-3 border rounded-lg text-center ${
                              isCompleted 
                                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                            }`}
                          >
                            <div className="text-2xl mb-1">{pillar.icon}</div>
                            <p className="font-medium text-sm">{pillar.pillarName}</p>
                            <p className="text-xs text-muted-foreground">{pillar.guardian}</p>
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No Genesis badge initiated</p>
                  <p className="text-sm text-muted-foreground">Complete civic duty claims to start badge fusion</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reward Analytics</CardTitle>
                <TTSToggle 
                  deckId="wallet-finance" 
                  moduleId="analytics"
                  content="View comprehensive analytics for claims, rewards, and system performance"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Claims</p>
                  <p className="text-2xl font-bold">{claimStats.totalClaims}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{claimStats.successRate}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold">{claimStats.totalRewards.toLocaleString()} TC</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Approved Claims</p>
                  <p className="text-2xl font-bold">{claimStats.approvedClaims}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                  <p className="text-2xl font-bold">{claimStats.averageProcessingTime}ms</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">User Tier</p>
                  <p className="text-2xl font-bold">{currentUser.tier}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}