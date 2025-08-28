import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Award,
  HelpCircle,
  ExternalLink
} from "lucide-react";

interface DisbursementPool {
  total: number;
  allocated: number;
  claimable: number;
  pending: number;
}

interface EarningRoute {
  id: string;
  title: string;
  description: string;
  potential: string;
  deckRoute: string;
  category: 'referral' | 'civic' | 'validator' | 'ngo';
}

export function TPDisbursementCard() {
  const [disbursementPool] = useState<DisbursementPool>({
    total: 50000000000, // 50B from reserve
    allocated: 12500000000, // 25% allocated
    claimable: 2500, // User's claimable balance
    pending: 1200 // Pending verification
  });

  const [earningRoutes] = useState<EarningRoute[]>([
    {
      id: "referral_program",
      title: "Referral Program",
      description: "Earn TP by inviting new citizens to the platform",
      potential: "50-500 TP per referral",
      deckRoute: "/deck/1",
      category: 'referral'
    },
    {
      id: "civic_participation",
      title: "Civic Participation",
      description: "Complete governance actions, vote on proposals, engage in civic duties",
      potential: "10-100 TP per action",
      deckRoute: "/deck/2",
      category: 'civic'
    },
    {
      id: "education_completion",
      title: "Civic Education",
      description: "Complete civic literacy modules and community education",
      potential: "25-200 TP per module",
      deckRoute: "/deck/3",
      category: 'civic'
    },
    {
      id: "validator_participation",
      title: "Validator Activities",
      description: "Participate in consensus validation and network security",
      potential: "100-1000 TP per epoch",
      deckRoute: "/deck/8",
      category: 'validator'
    },
    {
      id: "ngo_partnerships",
      title: "NGO Partnerships",
      description: "Collaborate with verified NGOs on civic initiatives",
      potential: "500-5000 TP per project",
      deckRoute: "/deck/11",
      category: 'ngo'
    }
  ]);

  const formatTP = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}B TP`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M TP`;
    }
    return `${amount.toLocaleString()} TP`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'referral': return 'bg-purple-100 text-purple-800';
      case 'civic': return 'bg-blue-100 text-blue-800';
      case 'validator': return 'bg-green-100 text-green-800';
      case 'ngo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'referral': return <Users className="h-4 w-4" />;
      case 'civic': return <Award className="h-4 w-4" />;
      case 'validator': return <TrendingUp className="h-4 w-4" />;
      case 'ngo': return <Users className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const allocationPercentage = (disbursementPool.allocated / disbursementPool.total) * 100;

  return (
    <Card aria-label="TruthPoint Treasury Access">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          TruthPoint Treasury
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Disbursement Pool Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Disbursement Pool Status</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatTP(disbursementPool.total)}
                </div>
                <div className="text-sm text-gray-600">Total Pool</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatTP(disbursementPool.allocated)}
                </div>
                <div className="text-sm text-gray-600">Allocated</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {disbursementPool.claimable.toLocaleString()} TP
                </div>
                <div className="text-sm text-gray-600">Claimable</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {disbursementPool.pending.toLocaleString()} TP
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Pool Allocation</span>
                <span>{allocationPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={allocationPercentage} className="h-2" />
            </div>
          </div>

          {/* Claimable Balance */}
          {disbursementPool.claimable > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-green-800">Ready to Claim</h4>
                  <p className="text-sm text-green-600">
                    You have {disbursementPool.claimable.toLocaleString()} TP available
                  </p>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Claim TP
                </Button>
              </div>
            </div>
          )}

          {/* Earning Routes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">How to Earn More TP</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>TruthPoint Earning Guide</DialogTitle>
                    <DialogDescription>
                      Discover all the ways to earn TruthPoints through civic engagement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {earningRoutes.map((route) => (
                      <div key={route.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(route.category)}
                            <h4 className="font-semibold">{route.title}</h4>
                          </div>
                          <Badge className={getCategoryColor(route.category)}>
                            {route.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{route.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600">
                            {route.potential}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = route.deckRoute}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {earningRoutes.slice(0, 4).map((route) => (
                <div 
                  key={route.id} 
                  className="p-3 border rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => window.location.href = route.deckRoute}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(route.category)}
                    <span className="font-medium text-sm">{route.title}</span>
                    <Badge className={getCategoryColor(route.category)} variant="outline">
                      {route.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{route.description}</p>
                  <div className="text-xs font-medium text-green-600">
                    {route.potential}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History Link */}
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/treasury'}
            >
              View Full Treasury Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}