/**
 * ConsensusStakeInterface.tsx - Phase XXIX Step 2
 * 
 * DAO-ready React component to interface with stakeCoinForConsensus function
 * of the canonical TruthCoins.sol contract. Provides accessible civic engagement
 * through consensus participation with full ARIA compliance.
 * 
 * Features:
 * - 8 civic pillar selection interface
 * - Stake amount input with validation
 * - Contract call simulation with event logging
 * - Comprehensive ARIA support and TTS integration
 * - Real-time feedback and confirmation system
 * - Responsive Tailwind CSS styling
 * 
 * Authority: Commander Mark | Phase XXIX Step 2
 * Status: DAO-ready consensus staking interface
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Coins, Vote, Users, Shield, Heart, Palette, TreePine, TestTube, Newspaper, Scale } from 'lucide-react';
import { zkpProofLedger, recordConsensusStake, TruthCoinPillar } from '@/ledger/ZKPProofLedger';

// Pillar configuration with icons and descriptions
const PILLAR_CONFIG = {
  [TruthCoinPillar.GOVERNANCE]: {
    name: 'GOVERNANCE',
    icon: Vote,
    color: 'bg-blue-500',
    description: 'Democratic participation and civic leadership'
  },
  [TruthCoinPillar.EDUCATION]: {
    name: 'EDUCATION',
    icon: Users,
    color: 'bg-green-500',
    description: 'Knowledge sharing and learning advancement'
  },
  [TruthCoinPillar.HEALTH]: {
    name: 'HEALTH',
    icon: Heart,
    color: 'bg-red-500',
    description: 'Community wellness and healthcare access'
  },
  [TruthCoinPillar.CULTURE]: {
    name: 'CULTURE',
    icon: Palette,
    color: 'bg-purple-500',
    description: 'Cultural preservation and artistic expression'
  },
  [TruthCoinPillar.PEACE]: {
    name: 'PEACE',
    icon: TreePine,
    color: 'bg-yellow-500',
    description: 'Conflict resolution and harmony building'
  },
  [TruthCoinPillar.SCIENCE]: {
    name: 'SCIENCE',
    icon: TestTube,
    color: 'bg-cyan-500',
    description: 'Scientific research and innovation'
  },
  [TruthCoinPillar.JOURNALISM]: {
    name: 'JOURNALISM',
    icon: Newspaper,
    color: 'bg-orange-500',
    description: 'Truth reporting and information transparency'
  },
  [TruthCoinPillar.JUSTICE]: {
    name: 'JUSTICE',
    icon: Scale,
    color: 'bg-indigo-500',
    description: 'Fair justice and legal equity'
  }
};

// Consensus staking event interface
interface ConsensusStakeEvent {
  id: string;
  user: string;
  pillar: TruthCoinPillar;
  amount: number;
  timestamp: string;
  txHash?: string;
}

// Mock user holdings for development
interface UserHoldings {
  pillarCount: number;
  pillars: boolean[];
  hasGenesis: boolean;
  totalCoins: number;
  votingWeight: number;
}

const MOCK_USER_HOLDINGS: UserHoldings = {
  pillarCount: 5,
  pillars: [true, true, false, true, true, false, false, true], // Owns Governance, Education, Culture, Peace, Justice
  hasGenesis: false,
  totalCoins: 5,
  votingWeight: 5
};

/**
 * ConsensusStakeInterface - Main component for consensus staking
 */
export const ConsensusStakeInterface: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [selectedPillar, setSelectedPillar] = useState<TruthCoinPillar | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState(false);
  const [recentEvents, setRecentEvents] = useState<ConsensusStakeEvent[]>([]);
  const [userHoldings, setUserHoldings] = useState<UserHoldings>(MOCK_USER_HOLDINGS);
  const [currentStakes, setCurrentStakes] = useState<{ [key in TruthCoinPillar]?: number }>({});

  // Initialize mock current stakes
  useEffect(() => {
    setCurrentStakes({
      [TruthCoinPillar.GOVERNANCE]: 25,
      [TruthCoinPillar.EDUCATION]: 15,
      [TruthCoinPillar.CULTURE]: 10,
      [TruthCoinPillar.PEACE]: 20,
      [TruthCoinPillar.JUSTICE]: 5
    });
  }, []);

  /**
   * ARIA narration for accessibility
   */
  const narrateAction = (message: string) => {
    console.log(`[CONSENSUS_STAKE_ARIA] ${message}`);
    
    // TTS integration (commented out to prevent audio spam)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      // speechSynthesis.speak(utterance); // Uncomment for production TTS
    }
  };

  /**
   * Handle pillar selection
   */
  const handlePillarSelect = (pillarValue: string) => {
    const pillar = parseInt(pillarValue) as TruthCoinPillar;
    setSelectedPillar(pillar);
    
    const pillarName = PILLAR_CONFIG[pillar].name;
    narrateAction(`Pillar selected: ${pillarName}`);
    
    console.log(`🗂️ Pillar Selected: ${pillarName} (${pillar})`);
  };

  /**
   * Validate stake input
   */
  const validateStakeAmount = (amount: string): boolean => {
    const numAmount = parseInt(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Stake amount must be a positive integer",
        variant: "destructive"
      });
      return false;
    }

    if (selectedPillar === null) {
      toast({
        title: "No Pillar Selected",
        description: "Please select a civic pillar first",
        variant: "destructive"
      });
      return false;
    }

    if (!userHoldings.pillars[selectedPillar]) {
      toast({
        title: "Pillar Not Owned",
        description: `You must own the ${PILLAR_CONFIG[selectedPillar].name} pillar to stake`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  /**
   * Simulate contract call to stakeCoinForConsensus
   */
  const simulateContractCall = async (pillar: TruthCoinPillar, amount: number): Promise<boolean> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success rate (95%)
      const success = Math.random() > 0.05;
      
      if (success) {
        // Create mock event
        const event: ConsensusStakeEvent = {
          id: `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user: '0x1234567890123456789012345678901234567890',
          pillar,
          amount,
          timestamp: new Date().toISOString(),
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`
        };

        // Update local state
        setRecentEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
        setCurrentStakes(prev => ({
          ...prev,
          [pillar]: (prev[pillar] || 0) + amount
        }));

        // Record in ZKP Proof Ledger
        const zkpHash = `0x${Math.random().toString(16).substr(2, 48)}`;
        const userDID = 'did:civic:user_mock_001';
        const userTier = 'Contributor';
        
        recordConsensusStake(zkpHash, userDID, userTier, pillar, amount);

        console.log(`✅ Contract Call Success: stakeCoinForConsensus(${PILLAR_CONFIG[pillar].name}, ${amount})`);
        console.log(`📤 Event Emitted: ConsensusStaked`, event);
        console.log(`📑 ZKP Ledger Updated: ${zkpHash.substring(0, 20)}...`);
        
        return true;
      } else {
        console.log(`❌ Contract Call Failed: Network error or gas estimation failure`);
        return false;
      }
    } catch (error) {
      console.error('Contract call simulation error:', error);
      return false;
    }
  };

  /**
   * Handle stake submission
   */
  const handleStakeSubmit = async () => {
    if (!validateStakeAmount(stakeAmount) || selectedPillar === null) {
      return;
    }

    const amount = parseInt(stakeAmount);
    const pillarName = PILLAR_CONFIG[selectedPillar].name;
    
    setIsStaking(true);
    narrateAction(`Stake submitted: ${amount} TruthCoins for ${pillarName} consensus`);

    try {
      console.log(`🔄 Initiating stake: ${amount} TruthCoins for ${pillarName}`);
      
      const success = await simulateContractCall(selectedPillar, amount);
      
      if (success) {
        toast({
          title: "Stake Successful",
          description: `Staked ${amount} TruthCoins for ${pillarName} consensus`,
        });
        
        narrateAction(`Stake successful: ${amount} TruthCoins staked for ${pillarName}`);
        
        // Reset form
        setStakeAmount('');
        setSelectedPillar(null);
      } else {
        toast({
          title: "Stake Failed",
          description: "Transaction failed. Please try again.",
          variant: "destructive"
        });
        
        narrateAction(`Stake failed for ${pillarName}. Please try again.`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      
      narrateAction("Staking error occurred. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  /**
   * Get total staked across all pillars
   */
  const getTotalStaked = (): number => {
    return Object.values(currentStakes).reduce((sum, amount) => sum + (amount || 0), 0);
  };

  return (
    <div 
      className="max-w-4xl mx-auto p-6 space-y-6"
      role="main"
      aria-label="Consensus Staking Interface"
    >
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-blue-500" />
            Consensus Staking Interface
          </CardTitle>
          <CardDescription>
            Stake your TruthCoins to participate in civic consensus voting. 
            Select a pillar you own and specify your stake amount.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* User Holdings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userHoldings.pillarCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pillars Owned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userHoldings.votingWeight}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Voting Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getTotalStaked()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Staked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userHoldings.hasGenesis ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Genesis Coin</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staking Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Stake for Consensus</CardTitle>
          <CardDescription>
            Select a civic pillar and specify the amount to stake for consensus voting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pillar Selection */}
          <div className="space-y-2">
            <Label htmlFor="pillar-select">Civic Pillar</Label>
            <Select 
              value={selectedPillar?.toString() || ''} 
              onValueChange={handlePillarSelect}
            >
              <SelectTrigger 
                id="pillar-select"
                className="w-full"
                aria-label="Select civic pillar for staking"
              >
                <SelectValue placeholder="Select a civic pillar to stake" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PILLAR_CONFIG).map(([pillarValue, config]) => {
                  const pillar = parseInt(pillarValue) as TruthCoinPillar;
                  const isOwned = userHoldings.pillars[pillar];
                  const Icon = config.icon;
                  
                  return (
                    <SelectItem 
                      key={pillarValue} 
                      value={pillarValue}
                      disabled={!isOwned}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.name}</span>
                        {!isOwned && <Badge variant="outline" className="text-xs">Not Owned</Badge>}
                        {isOwned && currentStakes[pillar] && (
                          <Badge variant="secondary" className="text-xs">
                            {currentStakes[pillar]} Staked
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {selectedPillar !== null && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {React.createElement(PILLAR_CONFIG[selectedPillar].icon, { className: "h-4 w-4" })}
                  <span className="font-medium">{PILLAR_CONFIG[selectedPillar].name}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {PILLAR_CONFIG[selectedPillar].description}
                </p>
                {currentStakes[selectedPillar] && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Currently staked: {currentStakes[selectedPillar]} TruthCoins
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stake Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="stake-amount">Stake Amount</Label>
            <Input
              id="stake-amount"
              type="number"
              min="1"
              placeholder="Enter stake amount (integer)"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              aria-label="Stake amount in TruthCoins"
              className="w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the number of TruthCoins to stake for consensus participation
            </p>
          </div>

          {/* Stake Button */}
          <Button
            onClick={handleStakeSubmit}
            disabled={isStaking || !selectedPillar || !stakeAmount}
            className="w-full"
            size="lg"
            aria-label={`Stake ${stakeAmount || 'specified amount'} TruthCoins for ${selectedPillar !== null ? PILLAR_CONFIG[selectedPillar].name : 'selected pillar'} consensus`}
          >
            {isStaking ? (
              <>
                <Coins className="mr-2 h-4 w-4 animate-spin" />
                Processing Stake...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Stake for Consensus
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Events Log */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Consensus Stakes</CardTitle>
            <CardDescription>
              Your latest consensus staking transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" role="log" aria-label="Recent consensus staking events">
              {recentEvents.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {React.createElement(PILLAR_CONFIG[event.pillar].icon, { 
                      className: "h-5 w-5 text-gray-600" 
                    })}
                    <div>
                      <div className="font-medium">
                        {event.amount} TruthCoins → {PILLAR_CONFIG[event.pillar].name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Staked
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

export default ConsensusStakeInterface;