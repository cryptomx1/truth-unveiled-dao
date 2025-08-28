/**
 * GenesisBadgeFusion.tsx
 * Phase X-FINANCE Step 5: Genesis Badge Fusion Interface
 * Commander Mark directive via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Coins, Crown, Sparkles, Star, Shield, Zap, Award, Target, TrendingUp } from 'lucide-react';
import { TruthCoinClaimEngine, type TruthCoinClaimRequest, type ClaimResult, type TruthCoinBalance, type GenesisTokenFusion } from './TruthCoinClaimEngine';

const GenesisBadgeFusion: React.FC = () => {
  const [activeTab, setActiveTab] = useState('claim');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState<TruthCoinBalance | null>(null);
  const [recentClaims, setRecentClaims] = useState<ClaimResult[]>([]);
  const [fusionHistory, setFusionHistory] = useState<GenesisTokenFusion[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  
  // Claim form state
  const [claimType, setClaimType] = useState<string>('genesis_fusion');
  const [pillarCount, setPillarCount] = useState<number>(3);
  const [hasZKPProof, setHasZKPProof] = useState<boolean>(true);
  const [selectedWallet, setSelectedWallet] = useState<string>('cid:wallet:test_user_123');

  const claimEngine = TruthCoinClaimEngine.getInstance();

  useEffect(() => {
    updateDashboardData();
    
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(updateDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateDashboardData = () => {
    const balance = claimEngine.getUserBalance(selectedWallet);
    setUserBalance(balance);
    setRecentClaims(claimEngine.getClaimHistory().slice(0, 10));
    setFusionHistory(claimEngine.getFusionLedger().slice(0, 5));
    setMetrics(claimEngine.getClaimMetrics());
  };

  const handleSubmitClaim = async () => {
    setIsProcessing(true);
    
    try {
      const claimRequest: TruthCoinClaimRequest = {
        walletCID: selectedWallet,
        did: 'did:civic:test_user_123',
        tier: 'Citizen',
        badgeVerification: true,
        zkpProof: hasZKPProof ? '0xtest_proof_hash_' + Date.now() : undefined,
        pillarCompletions: pillarCount,
        claimType: claimType as any
      };

      const result = await claimEngine.processClaim(claimRequest);
      
      console.log(`💰 Claim submitted: ${result.claimId} - Status: ${result.status}`);
      
      updateDashboardData();
      
      // Show success notification via console
      if (result.status === 'completed') {
        console.log(`🎊 Claim successful! Awarded ${result.truthCoinsAwarded} TruthCoins`);
        if (result.genesisTokenGenerated) {
          console.log(`✨ Genesis Token created: ${result.badgeFusionId}`);
        }
      }
      
    } catch (error) {
      console.error('Claim processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getClaimTypeInfo = (type: string) => {
    switch (type) {
      case 'genesis_fusion':
        return { label: 'Genesis Fusion', icon: Crown, reward: '500+ TC', description: 'Complete Genesis Badge fusion with guardian assignments' };
      case 'pillar_milestone':
        return { label: 'Pillar Milestone', icon: Star, reward: '200+ TC', description: 'Achievement for completing civic pillar requirements' };
      case 'civic_achievement':
        return { label: 'Civic Achievement', icon: Award, reward: '150+ TC', description: 'Recognition for outstanding civic engagement' };
      case 'treasury_disbursement':
        return { label: 'Treasury Disbursement', icon: Coins, reward: '100+ TC', description: 'Regular treasury allocation based on participation' };
      default:
        return { label: 'Unknown', icon: AlertCircle, reward: '?? TC', description: 'Unknown claim type' };
    }
  };

  const claimTypeInfo = getClaimTypeInfo(claimType);
  const ClaimIcon = claimTypeInfo.icon;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold">{userBalance?.currentBalance.toLocaleString() || '0'} TC</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Genesis Tokens</p>
                <p className="text-2xl font-bold">{userBalance?.genesisTokens || 0}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold">{userBalance?.totalEarned.toLocaleString() || '0'} TC</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tier Multiplier</p>
                <p className="text-2xl font-bold">{userBalance?.tierMultiplier.toFixed(1) || '1.0'}x</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="claim">Submit Claim</TabsTrigger>
          <TabsTrigger value="history">Claim History</TabsTrigger>
          <TabsTrigger value="fusion">Genesis Fusion</TabsTrigger>
          <TabsTrigger value="analytics">Metrics</TabsTrigger>
        </TabsList>

        {/* Submit Claim Tab */}
        <TabsContent value="claim" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claim Submission Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClaimIcon className="h-5 w-5" />
                  TruthCoin Claim Request
                </CardTitle>
                <CardDescription>
                  Submit a claim for TruthCoin rewards and Genesis Token fusion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Claim Type</label>
                  <Select value={claimType} onValueChange={setClaimType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genesis_fusion">Genesis Fusion (500+ TC)</SelectItem>
                      <SelectItem value="pillar_milestone">Pillar Milestone (200+ TC)</SelectItem>
                      <SelectItem value="civic_achievement">Civic Achievement (150+ TC)</SelectItem>
                      <SelectItem value="treasury_disbursement">Treasury Disbursement (100+ TC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Pillar Completions</label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={pillarCount}
                    onChange={(e) => setPillarCount(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of civic pillars completed (1-8)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Wallet Selection</label>
                  <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cid:wallet:test_user_123">Test User Wallet</SelectItem>
                      <SelectItem value="cid:wallet:alice_vault_001">Alice Vault (Governor)</SelectItem>
                      <SelectItem value="cid:wallet:commander_prime">Commander Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="zkp-proof"
                    checked={hasZKPProof}
                    onChange={(e) => setHasZKPProof(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="zkp-proof" className="text-sm">
                    Include ZKP Proof (+10% eligibility bonus)
                  </label>
                </div>

                <Button 
                  onClick={handleSubmitClaim}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Processing Claim...
                    </>
                  ) : (
                    <>
                      <ClaimIcon className="h-4 w-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Claim Preview & Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Claim Preview
                </CardTitle>
                <CardDescription>
                  Estimated rewards and eligibility assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-lg mb-2">{claimTypeInfo.label}</h4>
                  <p className="text-sm text-gray-600 mb-3">{claimTypeInfo.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Base Reward</p>
                      <p className="font-medium">{claimTypeInfo.reward}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tier Multiplier</p>
                      <p className="font-medium">{userBalance?.tierMultiplier.toFixed(1) || '1.0'}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pillar Bonus</p>
                      <p className="font-medium">+{Math.min(pillarCount * 5, 25)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ZKP Bonus</p>
                      <p className="font-medium">{hasZKPProof ? '+10%' : 'None'}</p>
                    </div>
                  </div>
                </div>

                {claimType === 'genesis_fusion' && pillarCount >= 3 && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Genesis Token Eligible</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      This claim qualifies for Genesis Token generation with guardian assignments for {pillarCount} pillars.
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Eligibility score calculated based on badge verification, pillar completions, and tier bonuses
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Claim History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Claims
              </CardTitle>
              <CardDescription>
                Track your TruthCoin claim history and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentClaims.map((claim) => {
                  const typeInfo = getClaimTypeInfo(claim.claimId.includes('genesis') ? 'genesis_fusion' : 'civic_achievement');
                  const TypeIcon = typeInfo.icon;
                  
                  return (
                    <div key={claim.claimId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="h-5 w-5" />
                          <div>
                            <h4 className="font-medium">{claim.claimId}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(claim.timestamp).toLocaleDateString()} at{' '}
                              {new Date(claim.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">TruthCoins Awarded</p>
                          <p className="font-medium">{claim.truthCoinsAwarded.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Eligibility Score</p>
                          <p className="font-medium">{claim.eligibilityScore}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Genesis Token</p>
                          <p className="font-medium">{claim.genesisTokenGenerated ? '✅ Generated' : '❌ No'}</p>
                        </div>
                      </div>

                      {claim.transactionHash && (
                        <div className="mt-2 text-xs text-gray-500">
                          Transaction: {claim.transactionHash.substring(0, 20)}...
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {recentClaims.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No claims submitted yet. Submit your first claim above.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genesis Fusion Tab */}
        <TabsContent value="fusion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Genesis Token Fusion History
              </CardTitle>
              <CardDescription>
                Track Genesis Badge fusions and guardian assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fusionHistory.map((fusion) => (
                  <div key={fusion.fusionId} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{fusion.badgeId}</h4>
                      <Badge variant="outline" className="bg-purple-100">
                        {fusion.fusionPower.toFixed(1)}% Power
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">TruthCoins Used</p>
                        <p className="font-medium">{fusion.truthCoinsUsed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pillars</p>
                        <p className="font-medium">{fusion.pillarConfiguration.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ZKP Validated</p>
                        <p className="font-medium">{fusion.zkpValidation ? '✅ Yes' : '❌ No'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fusion Date</p>
                        <p className="font-medium">{new Date(fusion.fusionTimestamp).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Guardian Assignments:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(fusion.guardianAssignments).map(([pillar, guardian]) => (
                          <Badge key={pillar} variant="secondary" className="text-xs">
                            {pillar}: {guardian}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {fusionHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No Genesis Tokens created yet. Submit a Genesis Fusion claim above.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Metrics
              </CardTitle>
              <CardDescription>
                TruthCoin claim and fusion analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{metrics.totalClaims}</p>
                    <p className="text-sm text-gray-600">Total Claims</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{metrics.successfulClaims}</p>
                    <p className="text-sm text-gray-600">Successful Claims</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">{metrics.totalTruthCoinsIssued.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">TruthCoins Issued</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{metrics.genesisTokensGenerated}</p>
                    <p className="text-sm text-gray-600">Genesis Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{metrics.averageEligibilityScore}%</p>
                    <p className="text-sm text-gray-600">Avg Eligibility</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {metrics.totalClaims > 0 ? Math.round((metrics.successfulClaims / metrics.totalClaims) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenesisBadgeFusion;