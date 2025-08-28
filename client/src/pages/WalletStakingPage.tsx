/**
 * WalletStakingPage.tsx
 * Phase X-FINANCE Step 4 - TruthPoint Staking Interface
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Coins, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Calendar, 
  Award, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { TruthPointStakingEngine, type StakingPosition, type StakingTier } from '@/components/finance/TruthPointStakingEngine';
import { TPRedemptionCard } from '@/components/finance/TPRedemptionCard';

interface WalletStakingPageProps {
  className?: string;
}

export default function WalletStakingPage({ className = '' }: WalletStakingPageProps) {
  const [stakingEngine] = useState(() => TruthPointStakingEngine.getInstance());
  const [stakingTiers, setStakingTiers] = useState<StakingTier[]>([]);
  const [userPositions, setUserPositions] = useState<StakingPosition[]>([]);
  const [stakingAmount, setStakingAmount] = useState<string>('');
  const [lockPeriod, setLockPeriod] = useState<string>('30');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [stakingPreview, setStakingPreview] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  // Mock user data - replace with real user context
  const walletCID = 'cid:wallet:user123';
  const userDID = 'did:civic:user123';
  const userTier = 'Contributor';
  const availableTP = 5000; // Mock balance

  useEffect(() => {
    loadStakingData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStakingData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update preview when inputs change
    if (stakingAmount && lockPeriod) {
      calculatePreview();
    } else {
      setStakingPreview(null);
    }
  }, [stakingAmount, lockPeriod, selectedTier]);

  const loadStakingData = async () => {
    try {
      // Load staking tiers
      const tiers = stakingEngine.getStakingTiers();
      setStakingTiers(tiers);

      // Load user positions
      const positions = stakingEngine.getStakingPositions(walletCID);
      setUserPositions(positions);

      // Load statistics
      const stats = stakingEngine.getStakingStatistics();
      setStatistics(stats);

      console.log(`📊 Loaded staking data: ${tiers.length} tiers, ${positions.length} positions`);

    } catch (error) {
      console.error('Failed to load staking data:', error);
    }
  };

  const calculatePreview = () => {
    try {
      const amount = parseInt(stakingAmount) || 0;
      const lockDays = parseInt(lockPeriod) || 30;
      
      if (amount <= 0) {
        setStakingPreview(null);
        return;
      }

      const preview = stakingEngine.calculateStakingPreview(
        amount,
        lockDays,
        selectedTier as any
      );
      
      setStakingPreview(preview);
      
    } catch (error) {
      console.warn('Preview calculation failed:', error);
      setStakingPreview(null);
    }
  };

  const handleStaking = async () => {
    if (!stakingAmount || !lockPeriod || !stakingPreview) return;

    setIsProcessing(true);

    try {
      const amount = parseInt(stakingAmount);
      const lockDays = parseInt(lockPeriod);
      
      // Create staking position
      const position = await stakingEngine.createStakingPosition(
        walletCID,
        userDID,
        amount,
        lockDays
      );

      // Reset form
      setStakingAmount('');
      setLockPeriod('30');
      setSelectedTier('');
      setStakingPreview(null);

      // Reload data
      await loadStakingData();

      announceStaking(`Staking position created: ${amount} TP for ${lockDays} days`, 'success');
      
      console.log(`🏦 Staking position created: ${position.id}`);

    } catch (error) {
      console.error('Staking failed:', error);
      announceStaking('Staking transaction failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (positionId: string, forceEarly: boolean = false) => {
    try {
      const result = await stakingEngine.withdrawStaking(positionId, forceEarly);
      
      await loadStakingData();
      
      const message = forceEarly 
        ? `Early withdrawal: ${result.total} TP (penalty: ${result.penalty})`
        : `Withdrawal complete: ${result.total} TP`;
      
      announceStaking(message, 'success');
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
      announceStaking('Withdrawal failed', 'error');
    }
  };

  const announceStaking = (message: string, type: 'success' | 'error' | 'info') => {
    // ARIA live announcement (TTS disabled due to killer system)
    console.log(`📢 ARIA announcement: ${message}`);
    
    // Would normally use TTS here
    if ('speechSynthesis' in window) {
      console.log(`🔇 TTS disabled: "${message}"`);
    }
  };

  const getTierBadgeColor = (tierName: string) => {
    const colors = {
      'Bronze': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Silver': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'Gold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Platinum': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Diamond': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return colors[tierName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Lock className="w-4 h-4 text-green-500" />;
      case 'unlocked': return <Unlock className="w-4 h-4 text-blue-500" />;
      case 'withdrawn': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'penalized': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (days: number) => {
    if (days === 0) return 'Ready to withdraw';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  const canAfford = availableTP >= (parseInt(stakingAmount) || 0);
  const eligibleTier = stakingPreview?.tier;

  return (
    <div className={`min-h-screen bg-slate-900 text-white p-4 ${className}`}>
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-400" />
            TruthPoint Staking
          </h1>
          <p className="text-slate-400">
            Stake TruthPoints to earn yield and unlock enhanced governance privileges
          </p>
        </div>

        <Tabs defaultValue="stake" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stake">Stake TP</TabsTrigger>
            <TabsTrigger value="positions">My Positions</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Staking Tab */}
          <TabsContent value="stake" className="space-y-6">
            {/* Balance Overview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{availableTP.toLocaleString()} TP</div>
                    <div className="text-slate-400">Available for staking</div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {userTier}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staking Form */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Create Staking Position</CardTitle>
                  <CardDescription className="text-slate-400">
                    Lock TruthPoints to earn yield and governance weight
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="stake-amount" className="text-white">Amount to Stake</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      min="100"
                      max={availableTP}
                      value={stakingAmount}
                      onChange={(e) => setStakingAmount(e.target.value)}
                      placeholder="Enter TP amount"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Minimum: 100 TP</span>
                      <span className={canAfford ? 'text-green-400' : 'text-red-400'}>
                        {canAfford ? '✓ Sufficient balance' : '✗ Insufficient balance'}
                      </span>
                    </div>
                  </div>

                  {/* Lock Period */}
                  <div className="space-y-2">
                    <Label htmlFor="lock-period" className="text-white">Lock Period (Days)</Label>
                    <Select value={lockPeriod} onValueChange={setLockPeriod}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select lock period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tier Override */}
                  {eligibleTier && (
                    <div className="space-y-2">
                      <Label className="text-white">Eligible Tier</Label>
                      <div className="p-3 bg-slate-700 rounded-lg">
                        <Badge className={getTierBadgeColor(eligibleTier.name)}>
                          {eligibleTier.name}
                        </Badge>
                        <div className="text-xs text-slate-400 mt-1">
                          {eligibleTier.baseYield}% APY • {eligibleTier.govWeight}x governance weight
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Staking Button */}
                  <Button
                    onClick={handleStaking}
                    disabled={!stakingAmount || !canAfford || isProcessing || !stakingPreview}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Create Staking Position'}
                  </Button>
                </CardContent>
              </Card>

              {/* Staking Preview */}
              {stakingPreview && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Award className="w-5 h-5 text-gold-500" />
                      Staking Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stake Amount:</span>
                        <span className="text-white font-medium">{stakingAmount} TP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lock Period:</span>
                        <span className="text-white font-medium">{lockPeriod} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tier:</span>
                        <Badge className={getTierBadgeColor(stakingPreview.tier.name)}>
                          {stakingPreview.tier.name}
                        </Badge>
                      </div>
                      <Separator className="bg-slate-600" />
                      <div className="flex justify-between">
                        <span className="text-slate-400">APY:</span>
                        <span className="text-green-400 font-medium">
                          {stakingPreview.projectedYield.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Daily Reward:</span>
                        <span className="text-yellow-400 font-medium">
                          {stakingPreview.dailyReward.toFixed(2)} TP
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Reward:</span>
                        <span className="text-green-400 font-medium">
                          {stakingPreview.totalReward.toFixed(0)} TP
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Governance Weight:</span>
                        <span className="text-purple-400 font-medium">
                          {stakingPreview.governanceWeight}x
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Staking Tiers Overview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Staking Tiers</CardTitle>
                <CardDescription className="text-slate-400">
                  Higher tiers offer better yields and governance benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {stakingTiers.map((tier) => (
                    <Card key={tier.name} className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Badge className={getTierBadgeColor(tier.name)}>
                            {tier.name}
                          </Badge>
                          <div className="space-y-1 text-xs">
                            <div className="text-slate-300">Min: {tier.minStake.toLocaleString()} TP</div>
                            <div className="text-green-400">{tier.baseYield}% APY</div>
                            <div className="text-slate-400">{tier.lockPeriod} days lock</div>
                            <div className="text-purple-400">{tier.govWeight}x gov weight</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            {userPositions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userPositions.map((position) => {
                  const rewards = stakingEngine.calculateCurrentRewards(position.id);
                  return (
                    <Card key={position.id} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(position.status)}
                            <span>{position.amount.toLocaleString()} TP</span>
                          </div>
                          <Badge className={getTierBadgeColor(position.tier)}>
                            {position.tier}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Created {formatDate(position.startDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Lock Period</div>
                            <div className="text-white">{position.lockPeriod} days</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Status</div>
                            <div className="text-white capitalize">{position.status}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">APY</div>
                            <div className="text-green-400">{position.currentYield.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Time Remaining</div>
                            <div className="text-yellow-400">{formatDuration(rewards.timeRemaining)}</div>
                          </div>
                        </div>
                        
                        <Separator className="bg-slate-600" />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Rewards Earned:</span>
                            <span className="text-green-400">{rewards.earned.toFixed(2)} TP</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Pending Rewards:</span>
                            <span className="text-yellow-400">{rewards.pending.toFixed(2)} TP</span>
                          </div>
                          {rewards.penaltyAmount && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Early Penalty:</span>
                              <span className="text-red-400">{rewards.penaltyAmount.toFixed(2)} TP</span>
                            </div>
                          )}
                        </div>

                        {position.status === 'active' && (
                          <div className="flex gap-2">
                            {rewards.canWithdraw ? (
                              <Button
                                onClick={() => handleWithdraw(position.id)}
                                className="flex-1"
                              >
                                <Unlock className="w-4 h-4 mr-2" />
                                Withdraw
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleWithdraw(position.id, true)}
                                variant="outline"
                                className="flex-1 border-red-600 text-red-400 hover:bg-red-600"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Early Withdraw
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="text-center py-12">
                  <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Staking Positions</h3>
                  <p className="text-slate-400 mb-4">
                    Create your first staking position to start earning rewards
                  </p>
                  <Button onClick={() => document.querySelector('[value="stake"]')?.click()}>
                    Start Staking
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Redemption Tab */}
          <TabsContent value="redeem">
            <TPRedemptionCard 
              walletCID={walletCID} 
              userTier={userTier}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Staked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statistics.totalStaked.toLocaleString()} TP
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-400">Active Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statistics.totalPositions}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-400">Average APY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">
                      {statistics.averageYield.toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-400">Active Stakers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statistics.activeStakers}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tier Distribution */}
            {statistics && Object.keys(statistics.tierDistribution).length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5" />
                    Staking Distribution by Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statistics.tierDistribution).map(([tier, count]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getTierBadgeColor(tier)}>
                            {tier}
                          </Badge>
                        </div>
                        <div className="text-white font-medium">{count} positions</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}