import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Vote, MessageSquare, TrendingUp, Shield, Eye, Zap } from "lucide-react";
import { TPUsageLedger } from "@/components/finance/TPUsageLedger";

interface UtilityAction {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  category: 'voting' | 'engagement' | 'visibility' | 'governance';
  available: boolean;
  cooldown?: string;
}

export function TruthPointUtilityCard() {
  const [currentBalance, setCurrentBalance] = useState(485); // Mock current TP balance
  const [confirmAction, setConfirmAction] = useState<UtilityAction | null>(null);
  const [recentUsage, setRecentUsage] = useState<any[]>([]);
  
  const usageLedger = new TPUsageLedger();

  const utilityActions: UtilityAction[] = [
    {
      id: 'vote_unlock',
      name: 'Unlock Premium Vote',
      description: 'Access advanced voting options with weighted preference selection',
      cost: 25,
      icon: <Vote className="h-4 w-4" />,
      category: 'voting',
      available: true
    },
    {
      id: 'poll_boost',
      name: 'Boost Poll Visibility',
      description: 'Increase your poll reach by 3x for 24 hours',
      cost: 50,
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'engagement',
      available: true
    },
    {
      id: 'feedback_priority',
      name: 'Priority Feedback',
      description: 'Fast-track your civic feedback to representatives',
      cost: 35,
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'engagement',
      available: true
    },
    {
      id: 'guardian_verify',
      name: 'Guardian Verification',
      description: 'Expedite identity verification process',
      cost: 100,
      icon: <Shield className="h-4 w-4" />,
      category: 'governance',
      available: currentBalance >= 100
    },
    {
      id: 'proposal_highlight',
      name: 'Highlight Proposal',
      description: 'Feature your proposal in community spotlight',
      cost: 75,
      icon: <Eye className="h-4 w-4" />,
      category: 'visibility',
      available: currentBalance >= 75
    },
    {
      id: 'instant_badges',
      name: 'Instant Badge Unlock',
      description: 'Unlock next civic tier badge immediately',
      cost: 150,
      icon: <Zap className="h-4 w-4" />,
      category: 'governance',
      available: currentBalance >= 150
    }
  ];

  const handleUtilityAction = async (action: UtilityAction) => {
    if (currentBalance < action.cost) {
      console.error(`Insufficient TP balance: ${currentBalance} < ${action.cost}`);
      return;
    }

    // Deduct cost and update balance
    const newBalance = currentBalance - action.cost;
    setCurrentBalance(newBalance);

    // Log usage to ledger
    const usageEntry = usageLedger.logUsage(
      `did:civic:user_${Date.now()}`,
      action.cost,
      action.name,
      action.category,
      action.id
    );

    // Update recent usage display
    setRecentUsage(prev => [usageEntry, ...prev.slice(0, 4)]);

    // Console telemetry
    console.log(`💰 TP Utility Used: ${action.name} — Cost: ${action.cost} TP — Balance: ${newBalance} TP`);
    console.log(`📝 Usage logged: ${usageEntry.id} @ ${usageEntry.timestamp}`);

    // Close confirmation dialog
    setConfirmAction(null);

    // Announce action completion for ARIA
    const announcement = `${action.name} activated. ${action.cost} TruthPoints spent. New balance: ${newBalance} TruthPoints.`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('class', 'sr-only');
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 3000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'voting': return 'bg-blue-100 text-blue-800';
      case 'engagement': return 'bg-green-100 text-green-800';
      case 'visibility': return 'bg-purple-100 text-purple-800';
      case 'governance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto" aria-label="TruthPoint Utility Interface">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>TruthPoint Utilities</span>
          <Badge variant="outline" className="text-lg font-semibold">
            {currentBalance.toLocaleString()} TP
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enhance your civic engagement with TruthPoint-powered features
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Utility Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {utilityActions.map((action) => (
            <div
              key={action.id}
              className={`border rounded-lg p-4 space-y-3 transition-all ${
                action.available 
                  ? 'border-gray-200 hover:border-blue-300 bg-white' 
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <Badge className={getCategoryColor(action.category)} variant="secondary">
                    {action.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{action.cost} TP</div>
                  {action.cooldown && (
                    <div className="text-xs text-gray-500">{action.cooldown}</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm">{action.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{action.description}</p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!action.available}
                    onClick={() => setConfirmAction(action)}
                  >
                    {action.available ? 'Activate' : 'Insufficient TP'}
                  </Button>
                </DialogTrigger>
                
                {confirmAction?.id === action.id && (
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Confirm Utility Action</DialogTitle>
                      <DialogDescription>
                        Activate "{confirmAction.name}" for {confirmAction.cost} TruthPoints?
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {confirmAction.icon}
                          <span className="font-medium">{confirmAction.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{confirmAction.description}</p>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Current Balance:</span>
                        <span className="font-medium">{currentBalance} TP</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cost:</span>
                        <span className="font-medium text-red-600">-{confirmAction.cost} TP</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>New Balance:</span>
                        <span>{currentBalance - confirmAction.cost} TP</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setConfirmAction(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleUtilityAction(confirmAction)}
                        >
                          Confirm & Spend
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          ))}
        </div>

        {/* Recent Usage History */}
        {recentUsage.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h3 className="font-medium text-sm">Recent Activity</h3>
            <div className="space-y-2">
              {recentUsage.map((usage) => (
                <div key={usage.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {usage.actionType}
                    </Badge>
                    <span>{usage.actionName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">-{usage.amount} TP</div>
                    <div className="text-xs text-gray-500">
                      {new Date(usage.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Guidelines */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-sm mb-2">How to Earn More TruthPoints</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Complete civic education modules (+15 TP each)</li>
            <li>• Participate in governance voting (+25 TP per vote)</li>
            <li>• Refer friends to the platform (+50 TP per signup)</li>
            <li>• Maintain daily engagement streak (+5-20 TP daily)</li>
            <li>• Contribute to community discussions (+10 TP per quality post)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}