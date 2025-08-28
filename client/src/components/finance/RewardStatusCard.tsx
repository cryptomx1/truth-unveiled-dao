/**
 * RewardStatusCard.tsx
 * Phase X-FINANCE Step 3 - User Reward Status Interface
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Gift, TrendingUp, Clock, CheckCircle, AlertCircle, Coins } from 'lucide-react';
import { RewardTriggerAgent, type RewardTriggeredEvent, type TPTransactionEntry } from './RewardTriggerAgent';
import { RewardTriggerMatrix, type RewardTrigger } from './RewardTriggerMatrix';

interface RewardStatusCardProps {
  className?: string;
}

export function RewardStatusCard({ className = '' }: RewardStatusCardProps) {
  const [recentRewards, setRecentRewards] = useState<RewardTriggeredEvent[]>([]);
  const [pendingRewards, setPendingRewards] = useState<TPTransactionEntry[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<RewardTrigger[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const rewardAgent = RewardTriggerAgent.getInstance();

  useEffect(() => {
    loadRewardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadRewardData, 30000);
    
    // Listen for new reward events
    const handleRewardTriggered = (event: CustomEvent) => {
      loadRewardData();
      announceNewReward(event.detail);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('RewardTriggered', handleRewardTriggered as EventListener);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('RewardTriggered', handleRewardTriggered as EventListener);
      }
    };
  }, []);

  const loadRewardData = () => {
    try {
      setRecentRewards(rewardAgent.getRecentRewards(5));
      setPendingRewards(rewardAgent.getPendingRewards());
      setAvailableTriggers(RewardTriggerMatrix.getAvailableRewards('Citizen'));
      setStatistics(rewardAgent.getRewardStatistics());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load reward data:', error);
      setIsLoading(false);
    }
  };

  const announceNewReward = (rewardEvent: RewardTriggeredEvent) => {
    if ('speechSynthesis' in window) {
      // Skip TTS announcement due to TTS killer system
      console.log(`🔇 TTS disabled: "New reward earned: ${rewardEvent.TPReward} TruthPoints for ${rewardEvent.triggerId}"`);
    }
    
    // Use ARIA live region instead
    const announcement = `New reward earned: ${rewardEvent.TPReward} TruthPoints`;
    console.log(`📢 ARIA announcement: ${announcement}`);
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTriggerCategoryColor = (category: string) => {
    const colors = {
      municipal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      social: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      governance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      engagement: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      content: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const claimReward = (transactionId: string) => {
    console.log(`💰 Claiming reward: ${transactionId}`);
    // In production, this would trigger actual reward claiming
    loadRewardData();
  };

  if (isLoading) {
    return (
      <Card className={`w-full max-w-4xl ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            TruthPoint Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} aria-live="polite">
      {/* Reward Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            Reward Overview
          </CardTitle>
          <CardDescription>
            Your TruthPoint earning activity and reward status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.totalRewards || 0}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Rewards</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statistics.totalTPDisbursed || 0}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">TP Earned</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((statistics.successRate || 0) * 100)}%
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {pendingRewards.length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Recent Rewards
          </CardTitle>
          <CardDescription>
            Your latest TruthPoint rewards and civic recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rewards earned yet</p>
              <p className="text-sm">Complete civic actions to earn TruthPoints</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">{reward.triggerId.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(reward.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      +{reward.TPReward} TP
                    </div>
                    <div className="text-xs text-gray-500">
                      {reward.validated ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Rewards */}
      {pendingRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Rewards
            </CardTitle>
            <CardDescription>
              Rewards awaiting processing or claiming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(reward.status)}
                    <div>
                      <div className="font-medium">{reward.triggerId?.replace(/_/g, ' ') || 'Civic Action'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(reward.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-yellow-600 dark:text-yellow-400">
                        {reward.amount} TP
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {reward.status}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => claimReward(reward.id)}
                      disabled={reward.status !== 'completed'}
                    >
                      Claim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-500" />
            Available Rewards
          </CardTitle>
          <CardDescription>
            Civic actions you can complete to earn TruthPoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {availableTriggers.map((trigger) => (
              <div key={trigger.triggerId} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      {trigger.description}
                    </div>
                    <Badge className={getTriggerCategoryColor(trigger.category)}>
                      {trigger.category}
                    </Badge>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {trigger.TPReward} TP
                    </div>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div>Min. Tier: {trigger.conditions.minTier}</div>
                  {trigger.conditions.zkpRequired && (
                    <div>🔐 ZKP Verification Required</div>
                  )}
                  {trigger.conditions.additionalCriteria && (
                    <div className="mt-1">{trigger.conditions.additionalCriteria}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}