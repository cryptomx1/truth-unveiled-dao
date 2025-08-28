/**
 * TPRedemptionCard.tsx
 * Phase X-FINANCE Step 4 - TruthPoint Redemption Interface
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Coins, Vote, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { RedemptionEligibility } from './RedemptionEligibility';
import { TPRedemptionLedger, type RedemptionEntry, type RedemptionType } from './TPRedemptionLedger';

interface RedemptionOption {
  type: RedemptionType;
  name: string;
  description: string;
  icon: React.ReactNode;
  rate: number; // TP cost per unit
  minAmount: number;
  maxAmount: number;
  category: 'civic' | 'governance' | 'fusion';
  benefits: string[];
}

interface TPRedemptionCardProps {
  className?: string;
  walletCID?: string;
  userTier?: string;
}

export function TPRedemptionCard({ 
  className = '', 
  walletCID = 'cid:wallet:default',
  userTier = 'Citizen'
}: TPRedemptionCardProps) {
  const [selectedRedemption, setSelectedRedemption] = useState<RedemptionType | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentRedemptions, setRecentRedemptions] = useState<RedemptionEntry[]>([]);
  const [eligibilityCheck, setEligibilityCheck] = useState<any>(null);

  const redemptionLedger = TPRedemptionLedger.getInstance();
  const redemptionEligibility = RedemptionEligibility.getInstance();

  // Define redemption options
  const redemptionOptions: RedemptionOption[] = [
    {
      type: 'civic_voucher',
      name: 'Civic Voucher',
      description: 'Priority access to municipal pilot programs and civic initiatives',
      icon: <Gift className="w-5 h-5 text-blue-500" />,
      rate: 50, // 50 TP per voucher
      minAmount: 1,
      maxAmount: 10,
      category: 'civic',
      benefits: [
        'Municipal pilot priority enrollment',
        'Civic event access',
        'Community program discounts',
        'Local government meeting priority seating'
      ]
    },
    {
      type: 'governance_credit',
      name: 'Governance Credit',
      description: 'Enhanced voting weight and proposal submission privileges',
      icon: <Vote className="w-5 h-5 text-purple-500" />,
      rate: 100, // 100 TP per credit
      minAmount: 1,
      maxAmount: 25,
      category: 'governance',
      benefits: [
        '1.5x voting weight multiplier',
        'Proposal submission eligibility',
        'Committee participation access',
        'Advanced governance analytics'
      ]
    },
    {
      type: 'fusion_token',
      name: 'Fusion Token',
      description: 'Unlock premium fusion cycles and Genesis badge eligibility',
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      rate: 250, // 250 TP per fusion token
      minAmount: 1,
      maxAmount: 8, // 8 pillars max
      category: 'fusion',
      benefits: [
        'Genesis badge fusion eligibility',
        'Premium pillar unlock access',
        'Enhanced ZKP verification',
        'Exclusive guardian assignments'
      ]
    }
  ];

  useEffect(() => {
    loadRedemptionData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadRedemptionData, 30000);
    
    return () => clearInterval(interval);
  }, [walletCID]);

  const loadRedemptionData = async () => {
    try {
      // Load recent redemptions
      const recent = redemptionLedger.getRedemptionHistory(walletCID, 5);
      setRecentRedemptions(recent);

      // Check eligibility
      const eligibility = await redemptionEligibility.checkEligibility(walletCID, userTier);
      setEligibilityCheck(eligibility);

    } catch (error) {
      console.error('Failed to load redemption data:', error);
    }
  };

  const calculateRedemptionCost = (): number => {
    const option = redemptionOptions.find(opt => opt.type === selectedRedemption);
    if (!option || !redemptionAmount) return 0;
    
    const amount = parseInt(redemptionAmount) || 0;
    return amount * option.rate;
  };

  const handleRedemption = async () => {
    if (!selectedRedemption || !redemptionAmount) return;

    setIsProcessing(true);
    
    try {
      const option = redemptionOptions.find(opt => opt.type === selectedRedemption)!;
      const amount = parseInt(redemptionAmount);
      const totalCost = calculateRedemptionCost();

      // Validate eligibility
      const canRedeem = await redemptionEligibility.validateRedemption(
        walletCID,
        selectedRedemption,
        totalCost,
        userTier
      );

      if (!canRedeem.eligible) {
        console.warn('Redemption not eligible:', canRedeem.reason);
        announceRedemption(`Redemption failed: ${canRedeem.reason}`, 'error');
        return;
      }

      // Process redemption
      const redemption = await redemptionLedger.processRedemption({
        walletCID,
        did: `did:civic:${walletCID.split(':')[2]}`,
        type: selectedRedemption,
        amount,
        tpCost: totalCost,
        metadata: {
          tier: userTier,
          benefits: option.benefits,
          category: option.category
        }
      });

      // Reset form
      setSelectedRedemption(null);
      setRedemptionAmount('');
      
      // Reload data
      await loadRedemptionData();

      announceRedemption(`${option.name} redeemed successfully`, 'success');
      
      console.log(`💰 Redemption processed: ${amount}x ${option.name} for ${totalCost} TP`);

    } catch (error) {
      console.error('Redemption failed:', error);
      announceRedemption('Redemption processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const announceRedemption = (message: string, type: 'success' | 'error' | 'info') => {
    // ARIA live announcement (TTS disabled due to killer system)
    console.log(`📢 ARIA announcement: ${message}`);
    
    // Would normally use TTS here, but system has TTS killer active
    if ('speechSynthesis' in window) {
      console.log(`🔇 TTS disabled: "${message}"`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      civic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      governance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      fusion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const selectedOption = redemptionOptions.find(opt => opt.type === selectedRedemption);
  const totalCost = calculateRedemptionCost();
  const canAfford = eligibilityCheck && totalCost <= eligibilityCheck.availableTP;

  return (
    <div className={`space-y-6 ${className}`} aria-live="polite">
      {/* Redemption Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            TruthPoint Redemption
          </CardTitle>
          <CardDescription>
            Convert TruthPoints into civic vouchers, governance credits, or fusion tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Redemption Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="redemption-type">Redemption Type</Label>
              <Select 
                value={selectedRedemption || ''} 
                onValueChange={(value) => setSelectedRedemption(value as RedemptionType)}
              >
                <SelectTrigger id="redemption-type">
                  <SelectValue placeholder="Select redemption type" />
                </SelectTrigger>
                <SelectContent>
                  {redemptionOptions.map((option) => (
                    <SelectItem key={option.type} value={option.type}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.name}</span>
                        <Badge className={getCategoryColor(option.category)}>
                          {option.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Option Details */}
            {selectedOption && (
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {selectedOption.icon}
                      <h4 className="font-medium">{selectedOption.name}</h4>
                      <Badge className={getCategoryColor(selectedOption.category)}>
                        {selectedOption.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedOption.description}
                    </p>
                    <div className="text-sm">
                      <div className="font-medium text-green-600 dark:text-green-400">
                        Cost: {selectedOption.rate} TP per unit
                      </div>
                      <div className="text-gray-500">
                        Range: {selectedOption.minAmount}-{selectedOption.maxAmount} units
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-medium text-sm mb-1">Benefits:</div>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {selectedOption.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amount Selection */}
            {selectedOption && (
              <div className="space-y-2">
                <Label htmlFor="redemption-amount">
                  Amount ({selectedOption.minAmount}-{selectedOption.maxAmount} units)
                </Label>
                <Input
                  id="redemption-amount"
                  type="number"
                  min={selectedOption.minAmount}
                  max={selectedOption.maxAmount}
                  value={redemptionAmount}
                  onChange={(e) => setRedemptionAmount(e.target.value)}
                  placeholder={`Enter amount (${selectedOption.minAmount}-${selectedOption.maxAmount})`}
                />
                {redemptionAmount && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Total Cost: {totalCost} TP
                    </span>
                    <span className={canAfford ? 'text-green-600' : 'text-red-600'}>
                      {canAfford ? '✓ Affordable' : '✗ Insufficient TP'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Redemption Button */}
            <Button
              onClick={handleRedemption}
              disabled={!selectedRedemption || !redemptionAmount || isProcessing || !canAfford}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : `Redeem for ${totalCost} TP`}
            </Button>

            {/* Eligibility Status */}
            {eligibilityCheck && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Available TP: {eligibilityCheck.availableTP}</span>
                  <span className="text-gray-500">|</span>
                  <span>Tier: {userTier}</span>
                  <span className="text-gray-500">|</span>
                  <span>Weekly Cap: {eligibilityCheck.weeklyRemaining}/{eligibilityCheck.weeklyLimit}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Redemptions */}
      {recentRedemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              Recent Redemptions
            </CardTitle>
            <CardDescription>
              Your latest TruthPoint redemption activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRedemptions.map((redemption) => {
                const option = redemptionOptions.find(opt => opt.type === redemption.type);
                return (
                  <div key={redemption.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(redemption.status)}
                      <div className="flex items-center gap-2">
                        {option?.icon}
                        <div>
                          <div className="font-medium">
                            {redemption.amount}x {option?.name || redemption.type}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimestamp(redemption.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600 dark:text-red-400">
                        -{redemption.tpCost} TP
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {redemption.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}