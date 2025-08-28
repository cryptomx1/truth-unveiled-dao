/**
 * StreamRewardCard.tsx - Phase X-ZEBEC Step 1
 * 
 * Real-time reward stream UI for TruthPoint redemptions via Zebec/Solana integration
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Zap, DollarSign, Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StreamReward {
  streamId: string;
  rewardType: 'municipal_participation' | 'referral_bonus' | 'governance_vote' | 'content_creation' | 'fusion_completion';
  truthPointAmount: number;
  usdcEquivalent: number;
  solEquivalent: number;
  streamDuration: number; // minutes
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  recipientWallet?: string;
  originCID: string;
  tierMultiplier: number;
}

interface WalletConnection {
  connected: boolean;
  address?: string;
  provider: 'phantom' | 'firebase' | null;
}

export default function StreamRewardCard() {
  const [streams, setStreams] = useState<StreamReward[]>([]);
  const [wallet, setWallet] = useState<WalletConnection>({ connected: false, provider: null });
  const [newStream, setNewStream] = useState({
    rewardType: 'municipal_participation' as StreamReward['rewardType'],
    truthPointAmount: 250,
    streamDuration: 30
  });
  const [isCreating, setIsCreating] = useState(false);
  const [conversionRates, setConversionRates] = useState({
    tpToUsdc: 0.02, // 1 TP = $0.02 USDC
    tpToSol: 0.0001 // 1 TP = 0.0001 SOL
  });

  /**
   * Mock wallet connection with Phantom/Firebase fallback
   */
  const connectWallet = useCallback(async () => {
    try {
      // Try Phantom first
      if (typeof window !== 'undefined' && 'solana' in window) {
        console.log('🔗 Connecting to Phantom wallet...');
        const provider = (window as any).solana;
        const response = await provider.connect();
        
        setWallet({
          connected: true,
          address: response.publicKey.toString().substring(0, 8) + '...',
          provider: 'phantom'
        });
        
        console.log('✅ Phantom wallet connected');
        return;
      }
      
      // Firebase fallback
      console.log('🔗 Using Firebase wallet fallback...');
      setWallet({
        connected: true,
        address: 'FB' + Math.random().toString(36).substring(2, 8) + '...',
        provider: 'firebase'
      });
      
      console.log('✅ Firebase wallet connected');
      
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
    }
  }, []);

  /**
   * Calculate tier-weighted rewards
   */
  const calculateTierMultiplier = useCallback((userTier: string = 'Citizen'): number => {
    const tierMultipliers = {
      'Citizen': 1.0,
      'Advocate': 1.2,
      'Guardian': 1.5,
      'Representative': 2.0,
      'Commander': 3.0
    };
    return tierMultipliers[userTier as keyof typeof tierMultipliers] || 1.0;
  }, []);

  /**
   * Create new stream reward
   */
  const createStream = useCallback(async () => {
    if (!wallet.connected) {
      console.error('❌ Wallet not connected');
      return;
    }

    setIsCreating(true);
    
    try {
      const tierMultiplier = calculateTierMultiplier('Citizen');
      const adjustedAmount = newStream.truthPointAmount * tierMultiplier;
      const usdcEquivalent = adjustedAmount * conversionRates.tpToUsdc;
      const solEquivalent = adjustedAmount * conversionRates.tpToSol;
      
      const stream: StreamReward = {
        streamId: `zbc_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        rewardType: newStream.rewardType,
        truthPointAmount: adjustedAmount,
        usdcEquivalent,
        solEquivalent,
        streamDuration: newStream.streamDuration,
        status: 'pending',
        createdAt: new Date(),
        recipientWallet: wallet.address,
        originCID: `bafybei${Math.random().toString(36).substr(2, 46)}`,
        tierMultiplier
      };
      
      console.log('🚀 Creating stream reward:', stream.streamId);
      console.log(`💰 Amount: ${adjustedAmount} TP (${usdcEquivalent.toFixed(4)} USDC)`);
      console.log(`⏱️ Duration: ${newStream.streamDuration} minutes`);
      console.log(`🏆 Tier multiplier: ${tierMultiplier}x`);
      
      // Mock Zebec SDK integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      stream.status = 'active';
      setStreams(prev => [stream, ...prev]);
      
      console.log('✅ Stream created successfully');
      
      // ARIA announcement
      const announcement = `Stream reward created: ${adjustedAmount} TruthPoints over ${newStream.streamDuration} minutes`;
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.setAttribute('aria-atomic', 'true');
      ariaLive.className = 'sr-only';
      ariaLive.textContent = announcement;
      document.body.appendChild(ariaLive);
      setTimeout(() => document.body.removeChild(ariaLive), 3000);
      
    } catch (error) {
      console.error('❌ Stream creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  }, [wallet, newStream, conversionRates, calculateTierMultiplier]);

  /**
   * Cancel active stream
   */
  const cancelStream = useCallback(async (streamId: string) => {
    console.log(`🛑 Cancelling stream: ${streamId}`);
    
    setStreams(prev => prev.map(stream => 
      stream.streamId === streamId 
        ? { ...stream, status: 'cancelled' as const }
        : stream
    ));
    
    console.log('✅ Stream cancelled');
  }, []);

  /**
   * Mock stream status updates
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams(prev => prev.map(stream => {
        if (stream.status === 'active') {
          const elapsed = Date.now() - stream.createdAt.getTime();
          const durationMs = stream.streamDuration * 60 * 1000;
          
          if (elapsed >= durationMs) {
            console.log(`✅ Stream completed: ${stream.streamId}`);
            return { ...stream, status: 'completed' as const };
          }
        }
        return stream;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Get status icon and color
   */
  const getStatusDisplay = useCallback((status: StreamReward['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
      case 'active':
        return { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' };
      case 'failed':
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/20' };
    }
  }, []);

  /**
   * Format reward type display
   */
  const formatRewardType = useCallback((type: StreamReward['rewardType']): string => {
    const typeMap = {
      municipal_participation: 'Municipal Participation',
      referral_bonus: 'Referral Bonus',
      governance_vote: 'Governance Vote',
      content_creation: 'Content Creation',
      fusion_completion: 'Fusion Completion'
    };
    return typeMap[type] || type;
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Stream Rewards
          <Badge variant="outline" className="ml-auto">
            Phase X-ZEBEC
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Connection Section */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5" />
            <div>
              <div className="font-medium">
                {wallet.connected ? `Connected: ${wallet.address}` : 'Wallet Not Connected'}
              </div>
              <div className="text-sm text-muted-foreground">
                {wallet.connected ? `Provider: ${wallet.provider}` : 'Connect to create streams'}
              </div>
            </div>
          </div>
          {!wallet.connected && (
            <Button onClick={connectWallet} variant="outline">
              Connect Wallet
            </Button>
          )}
        </div>

        {wallet.connected && (
          <>
            {/* Stream Creation Form */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Create New Stream</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reward Type</label>
                  <Select 
                    value={newStream.rewardType} 
                    onValueChange={(value) => setNewStream(prev => ({ ...prev, rewardType: value as StreamReward['rewardType'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="municipal_participation">Municipal Participation</SelectItem>
                      <SelectItem value="referral_bonus">Referral Bonus</SelectItem>
                      <SelectItem value="governance_vote">Governance Vote</SelectItem>
                      <SelectItem value="content_creation">Content Creation</SelectItem>
                      <SelectItem value="fusion_completion">Fusion Completion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">TruthPoints Amount</label>
                  <Input
                    type="number"
                    value={newStream.truthPointAmount}
                    onChange={(e) => setNewStream(prev => ({ ...prev, truthPointAmount: parseInt(e.target.value) || 0 }))}
                    min="50"
                    max="5000"
                    step="25"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream Duration (min)</label>
                  <Input
                    type="number"
                    value={newStream.streamDuration}
                    onChange={(e) => setNewStream(prev => ({ ...prev, streamDuration: parseInt(e.target.value) || 30 }))}
                    min="15"
                    max="1440"
                    step="15"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Estimated: ${(newStream.truthPointAmount * conversionRates.tpToUsdc).toFixed(4)} USDC | 
                  {(newStream.truthPointAmount * conversionRates.tpToSol).toFixed(6)} SOL
                </div>
                <Button onClick={createStream} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Stream'}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Active Streams */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Streams ({streams.length})</h3>
              
              {streams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No streams created yet
                </div>
              ) : (
                <div className="space-y-3">
                  {streams.map((stream) => {
                    const StatusIcon = getStatusDisplay(stream.status).icon;
                    const statusColor = getStatusDisplay(stream.status).color;
                    const statusBg = getStatusDisplay(stream.status).bg;

                    return (
                      <div key={stream.streamId} className={`p-4 border rounded-lg ${statusBg}`}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                              <span className="font-medium">{formatRewardType(stream.rewardType)}</span>
                              <Badge variant="secondary" className="text-xs">
                                {stream.status.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              Stream ID: {stream.streamId}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {stream.truthPointAmount} TP
                              </span>
                              <span>${stream.usdcEquivalent.toFixed(4)} USDC</span>
                              <span>{stream.solEquivalent.toFixed(6)} SOL</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {stream.streamDuration}min
                              </span>
                            </div>
                            
                            {stream.tierMultiplier > 1 && (
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                Tier bonus: {stream.tierMultiplier}x multiplier applied
                              </div>
                            )}
                          </div>

                          {stream.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelStream(stream.streamId)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Conversion Rates Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Current rates: 1 TP = ${conversionRates.tpToUsdc.toFixed(4)} USDC | 1 TP = {conversionRates.tpToSol.toFixed(6)} SOL
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}