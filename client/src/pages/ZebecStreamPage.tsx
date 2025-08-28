/**
 * ZebecStreamPage.tsx - Phase X-ZEBEC Complete Interface
 * 
 * Unified page combining StreamRewardCard and StreamDashboard components
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Activity, Settings, Info, ExternalLink } from 'lucide-react';
import StreamRewardCard from '@/components/zebec/StreamRewardCard';
import StreamDashboard from '@/components/zebec/StreamDashboard';
import { ZebecTreasuryRouter } from '@/components/zebec/ZebecTreasuryRouter';

export default function ZebecStreamPage() {
  const [treasuryRouter] = useState(() => ZebecTreasuryRouter.getInstance());
  const [dailySummary, setDailySummary] = useState({
    totalAllocated: 0,
    totalStreams: 0,
    byDeck: {} as { [key: string]: number },
    byCurrency: {} as { [key: string]: number }
  });

  /**
   * Load treasury summary data
   */
  useEffect(() => {
    const loadSummary = () => {
      const summary = treasuryRouter.getDailyAllocationSummary();
      setDailySummary(summary);
    };

    loadSummary();
    const interval = setInterval(loadSummary, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [treasuryRouter]);

  /**
   * Create test allocation for demonstration
   */
  const createTestAllocation = async () => {
    console.log('🧪 Creating test allocation...');
    
    const result = await treasuryRouter.createAllocation({
      deckOrigin: 'municipal',
      taskType: 'pilot_participation',
      recipientWallet: 'TEST_WALLET_123',
      userTier: 'Citizen',
      referralCount: 2
    });

    if (result.success && result.allocationId) {
      const streamResult = await treasuryRouter.createStreamDistribution(result.allocationId);
      console.log('✅ Test allocation and stream created successfully');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zebec Stream Payments</h1>
          <p className="text-muted-foreground mt-1">
            Real-time TruthPoint redemptions via Solana blockchain streaming
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Phase X-ZEBEC
        </Badge>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Treasury System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dailySummary.totalAllocated}
              </div>
              <div className="text-sm text-muted-foreground">TP Allocated Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dailySummary.totalStreams}
              </div>
              <div className="text-sm text-muted-foreground">Active Streams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(dailySummary.byDeck).length}
              </div>
              <div className="text-sm text-muted-foreground">Deck Origins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(dailySummary.byCurrency).length}
              </div>
              <div className="text-sm text-muted-foreground">Currencies</div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button onClick={createTestAllocation} variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Create Test Allocation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                Zebec Protocol Integration
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                This interface demonstrates stream payment capabilities. For production deployment, 
                integrate with Zebec SDK for Solana mainnet or Phantom wallet connectivity.
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-blue-700 dark:text-blue-300">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Zebec Docs
                </Button>
                <Button variant="outline" size="sm" className="text-blue-700 dark:text-blue-300">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Solana Web3.js
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface Tabs */}
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Create Streams
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Stream Creation Tab */}
        <TabsContent value="create" className="space-y-6">
          <StreamRewardCard />
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <StreamDashboard />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Conversion Rates</h4>
                  <div className="text-sm space-y-1">
                    <div>1 TP = $0.02 USDC</div>
                    <div>1 TP = 0.0001 SOL</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tier Multipliers</h4>
                  <div className="text-sm space-y-1">
                    <div>Citizen: 1.0x</div>
                    <div>Advocate: 1.2x</div>
                    <div>Guardian: 1.5x</div>
                    <div>Representative: 2.0x</div>
                    <div>Commander: 3.0x</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Supported Deck Origins</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• Municipal Engagement</div>
                  <div>• Governance Participation</div>
                  <div>• Civic Fusion</div>
                  <div>• Press & Amplification</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}