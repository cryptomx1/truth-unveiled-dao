import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDownToLine, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { NodePayoutEngine } from "@/components/finance/NodePayoutEngine";
import { ZKPWithdrawalReceipt } from "@/components/finance/ZKPWithdrawalReceipt";

interface UserTier {
  name: string;
  level: number;
  dailyLimit: number;
  monthlyLimit: number;
  minimumWithdrawal: number;
  verificationRequired: boolean;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  purpose: string;
  recipient: string;
  tier: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
  verificationHash?: string;
  nodePayoutId?: string;
}

export function CivicTreasuryWithdrawCard() {
  const [currentTier, setCurrentTier] = useState<UserTier>({
    name: 'Contributor',
    level: 2,
    dailyLimit: 10000,
    monthlyLimit: 100000,
    minimumWithdrawal: 1000,
    verificationRequired: true
  });
  
  const [availableBalance] = useState(485750); // Mock treasury balance for user
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPurpose, setWithdrawPurpose] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [confirmWithdrawal, setConfirmWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);

  const nodePayoutEngine = new NodePayoutEngine();
  const zkpReceiptGenerator = new ZKPWithdrawalReceipt();

  const userTiers: UserTier[] = [
    {
      name: 'Citizen',
      level: 1,
      dailyLimit: 1000,
      monthlyLimit: 10000,
      minimumWithdrawal: 100,
      verificationRequired: false
    },
    {
      name: 'Contributor',
      level: 2,
      dailyLimit: 10000,
      monthlyLimit: 100000,
      minimumWithdrawal: 1000,
      verificationRequired: true
    },
    {
      name: 'Moderator',
      level: 3,
      dailyLimit: 50000,
      monthlyLimit: 500000,
      minimumWithdrawal: 5000,
      verificationRequired: true
    },
    {
      name: 'Governor',
      level: 4,
      dailyLimit: 250000,
      monthlyLimit: 2000000,
      minimumWithdrawal: 10000,
      verificationRequired: true
    },
    {
      name: 'Commander',
      level: 5,
      dailyLimit: 1000000,
      monthlyLimit: 10000000,
      minimumWithdrawal: 50000,
      verificationRequired: true
    }
  ];

  const withdrawalPurposes = [
    'civic_participation_reward',
    'community_development_grant',
    'educational_program_funding',
    'infrastructure_improvement',
    'emergency_civic_response',
    'research_and_development',
    'other_approved_purpose'
  ];

  const validateWithdrawal = (amount: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (amount < currentTier.minimumWithdrawal) {
      errors.push(`Minimum withdrawal for ${currentTier.name} tier is ${currentTier.minimumWithdrawal.toLocaleString()} TP`);
    }
    
    if (amount > currentTier.dailyLimit) {
      errors.push(`Daily limit for ${currentTier.name} tier is ${currentTier.dailyLimit.toLocaleString()} TP`);
    }
    
    if (amount > availableBalance) {
      errors.push(`Insufficient balance. Available: ${availableBalance.toLocaleString()} TP`);
    }

    if (!recipientAddress.trim()) {
      errors.push('Recipient address is required');
    }

    if (!withdrawPurpose) {
      errors.push('Withdrawal purpose must be specified');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleWithdrawalRequest = async () => {
    const amount = parseInt(withdrawAmount);
    const validation = validateWithdrawal(amount);
    
    if (!validation.valid) {
      console.error('Withdrawal validation failed:', validation.errors);
      return;
    }

    // Create withdrawal request
    const withdrawalRequest: WithdrawalRequest = {
      id: `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      amount,
      purpose: withdrawPurpose,
      recipient: recipientAddress,
      tier: currentTier.name,
      timestamp: new Date(),
      status: 'pending'
    };

    // Generate ZKP verification hash
    withdrawalRequest.verificationHash = zkpReceiptGenerator.generateWithdrawalHash(
      withdrawalRequest.id,
      amount,
      recipientAddress,
      withdrawPurpose
    );

    // Initiate node payout process
    const nodePayoutResult = await nodePayoutEngine.processWithdrawal(withdrawalRequest);
    withdrawalRequest.nodePayoutId = nodePayoutResult.payoutId;
    withdrawalRequest.status = 'processing';

    // Add to requests list
    setWithdrawalRequests(prev => [withdrawalRequest, ...prev]);

    // Clear form
    setWithdrawAmount('');
    setWithdrawPurpose('');
    setRecipientAddress('');
    setConfirmWithdrawal(null);

    // Generate receipt
    const receipt = zkpReceiptGenerator.generateReceipt(withdrawalRequest);
    
    // Console telemetry
    console.log(`💰 Treasury Withdrawal Initiated: ${amount.toLocaleString()} TP`);
    console.log(`🎯 Purpose: ${withdrawPurpose} | Recipient: ${recipientAddress.slice(0, 20)}...`);
    console.log(`🔐 Verification Hash: ${withdrawalRequest.verificationHash}`);
    console.log(`🌐 Node Payout ID: ${withdrawalRequest.nodePayoutId}`);

    // ARIA announcement
    const announcement = `Withdrawal request submitted for ${amount.toLocaleString()} TruthPoints. Request ID: ${withdrawalRequest.id.slice(-8)}. Status: Processing.`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('class', 'sr-only');
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 3000);

    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      setWithdrawalRequests(prev => 
        prev.map(req => 
          req.id === withdrawalRequest.id 
            ? { ...req, status: 'approved' }
            : req
        )
      );
      console.log(`✅ Withdrawal Approved: ${withdrawalRequest.id}`);
    }, 3000);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Citizen': return 'bg-gray-100 text-gray-800';
      case 'Contributor': return 'bg-blue-100 text-blue-800';
      case 'Moderator': return 'bg-green-100 text-green-800';
      case 'Governor': return 'bg-purple-100 text-purple-800';
      case 'Commander': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto" aria-label="Civic Treasury Withdrawal Interface">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Treasury Withdrawal
          </span>
          <div className="flex items-center gap-3">
            <Badge className={getTierColor(currentTier.name)} variant="secondary">
              {currentTier.name} Tier
            </Badge>
            <Badge variant="outline" className="text-lg font-semibold">
              {availableBalance.toLocaleString()} TP
            </Badge>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Withdraw TruthPoints from civic treasury with tier-based limits and verification
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tier Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-sm mb-3">Current Tier Limits</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-600">Daily Limit</Label>
              <div className="font-medium">{currentTier.dailyLimit.toLocaleString()} TP</div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Monthly Limit</Label>
              <div className="font-medium">{currentTier.monthlyLimit.toLocaleString()} TP</div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Minimum</Label>
              <div className="font-medium">{currentTier.minimumWithdrawal.toLocaleString()} TP</div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Verification</Label>
              <div className="flex items-center gap-1">
                {currentTier.verificationRequired ? (
                  <>
                    <Shield className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 text-xs">Required</span>
                  </>
                ) : (
                  <span className="text-gray-600 text-xs">Optional</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="space-y-4">
          <h3 className="font-medium">New Withdrawal Request</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (TP)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Min: ${currentTier.minimumWithdrawal.toLocaleString()}`}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={currentTier.minimumWithdrawal}
                max={Math.min(currentTier.dailyLimit, availableBalance)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={withdrawPurpose} onValueChange={setWithdrawPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select withdrawal purpose" />
                </SelectTrigger>
                <SelectContent>
                  {withdrawalPurposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="Treasury recipient address or CID"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                disabled={!withdrawAmount || !withdrawPurpose || !recipientAddress}
                onClick={() => {
                  const amount = parseInt(withdrawAmount);
                  const validation = validateWithdrawal(amount);
                  if (validation.valid) {
                    setConfirmWithdrawal({
                      id: 'temp',
                      amount,
                      purpose: withdrawPurpose,
                      recipient: recipientAddress,
                      tier: currentTier.name,
                      timestamp: new Date(),
                      status: 'pending'
                    });
                  }
                }}
              >
                Request Withdrawal
              </Button>
            </DialogTrigger>

            {confirmWithdrawal && (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm Treasury Withdrawal</DialogTitle>
                  <DialogDescription>
                    Review your withdrawal request details before submission
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-medium">{confirmWithdrawal.amount.toLocaleString()} TP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Purpose:</span>
                      <span className="font-medium text-sm">
                        {confirmWithdrawal.purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Recipient:</span>
                      <span className="font-medium text-sm">{confirmWithdrawal.recipient.slice(0, 20)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tier:</span>
                      <Badge className={getTierColor(confirmWithdrawal.tier)} variant="secondary">
                        {confirmWithdrawal.tier}
                      </Badge>
                    </div>
                  </div>

                  {currentTier.verificationRequired && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        This withdrawal requires verification and may take 1-3 business days to process.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setConfirmWithdrawal(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={handleWithdrawalRequest}
                    >
                      Confirm & Submit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>

        {/* Recent Withdrawal Requests */}
        {withdrawalRequests.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h3 className="font-medium text-sm">Recent Withdrawal Requests</h3>
            <div className="space-y-3">
              {withdrawalRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium">{request.amount.toLocaleString()} TP</span>
                      <Badge variant="outline" className="text-xs">
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {request.purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      ID: {request.id.slice(-8)}
                    </div>
                    {request.verificationHash && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={() => setShowReceipt(request.id)}
                      >
                        View Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Guidelines */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Withdrawal Guidelines</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• All withdrawals require proper justification and purpose documentation</li>
            <li>• Higher tier users have increased limits but require additional verification</li>
            <li>• Emergency civic response withdrawals may bypass normal processing times</li>
            <li>• Treasury funds are allocated for legitimate civic engagement activities only</li>
            <li>• Misuse of withdrawal privileges may result in tier demotion or restrictions</li>
          </ul>
        </div>
      </CardContent>

      {/* ZKP Receipt Modal */}
      {showReceipt && (
        <Dialog open={!!showReceipt} onOpenChange={() => setShowReceipt(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Withdrawal Receipt</DialogTitle>
              <DialogDescription>
                Zero-knowledge proof verification receipt
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const request = withdrawalRequests.find(r => r.id === showReceipt);
                if (!request) return null;
                
                const receipt = zkpReceiptGenerator.generateReceipt(request);
                return (
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs space-y-2">
                    <div><strong>Receipt ID:</strong> {receipt.receiptId}</div>
                    <div><strong>Amount:</strong> {receipt.amount.toLocaleString()} TP</div>
                    <div><strong>ZKP Hash:</strong> {receipt.zkpHash.slice(0, 32)}...</div>
                    <div><strong>Timestamp:</strong> {receipt.timestamp}</div>
                    <div><strong>Status:</strong> {receipt.status}</div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}