import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  Building, 
  Shield, 
  TrendingUp,
  Users,
  Lock,
  CheckCircle,
  Clock
} from "lucide-react";
import { useTreasuryEngine, type OrgNode, type StakingInterface } from "./TreasuryEngine";

export function TreasuryDashboard() {
  const {
    allocation,
    verifiedOrgs,
    pendingOrgs,
    stakingPools,
    stats,
    allocateToOrg,
    stakeTruthPoints
  } = useTreasuryEngine();

  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [allocationAmount, setAllocationAmount] = useState<string>("");
  const [allocationPurpose, setAllocationPurpose] = useState<string>("");
  const [stakingAmount, setStakingAmount] = useState<string>("");

  const handleAllocate = () => {
    if (!selectedOrg || !allocationAmount || !allocationPurpose) return;
    
    const amount = parseInt(allocationAmount);
    const success = allocateToOrg(selectedOrg, amount, allocationPurpose);
    
    if (success) {
      setAllocationAmount("");
      setAllocationPurpose("");
      console.log(`💰 Treasury allocation successful: ${amount.toLocaleString()} TP`);
    }
  };

  const handleStaking = () => {
    if (!selectedOrg || !stakingAmount) return;
    
    const amount = parseInt(stakingAmount);
    const success = stakeTruthPoints(selectedOrg, amount);
    
    if (success) {
      setStakingAmount("");
      console.log(`🔒 Staking successful: ${amount.toLocaleString()} TP`);
    }
  };

  const formatTP = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}B TP`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M TP`;
    }
    return `${amount.toLocaleString()} TP`;
  };

  const getOrgTypeColor = (type: string) => {
    switch (type) {
      case 'ngo': return 'bg-green-100 text-green-800';
      case 'government': return 'bg-blue-100 text-blue-800';
      case 'municipal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedOrgData = verifiedOrgs.find(org => org.id === selectedOrg);
  const selectedStakingData = stakingPools.find(pool => pool.nodeId === selectedOrg);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Phase X-FINANCE Step 1: Treasury & TruthPoint Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Treasury Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Marketing</span>
                </div>
                <div className="text-2xl font-bold">{formatTP(allocation.marketing.remaining)}</div>
                <div className="text-xs text-gray-600">
                  {allocation.marketing.percentage}% of total
                </div>
                <Progress 
                  value={(allocation.marketing.allocated / allocation.marketing.amount) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">NGO Rewards</span>
                </div>
                <div className="text-2xl font-bold">{formatTP(allocation.ngoRewards.remaining)}</div>
                <div className="text-xs text-gray-600">
                  {allocation.ngoRewards.percentage}% of total
                </div>
                <Progress 
                  value={(allocation.ngoRewards.allocated / allocation.ngoRewards.amount) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Gov Rewards</span>
                </div>
                <div className="text-2xl font-bold">{formatTP(allocation.govRewards.remaining)}</div>
                <div className="text-xs text-gray-600">
                  {allocation.govRewards.percentage}% of total
                </div>
                <Progress 
                  value={(allocation.govRewards.allocated / allocation.govRewards.amount) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Reserve</span>
                </div>
                <div className="text-2xl font-bold">{formatTP(allocation.reserve.remaining)}</div>
                <div className="text-xs text-gray-600">
                  {allocation.reserve.percentage}% of total
                </div>
                <Progress 
                  value={(allocation.reserve.allocated / allocation.reserve.amount) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verified Organizations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Verified Organizations
              </h3>
              
              <div className="space-y-3 mb-4">
                {verifiedOrgs.map((org) => (
                  <div 
                    key={org.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrg === org.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOrg(org.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{org.name}</h4>
                        <p className="text-sm text-gray-600">
                          Allocated: {formatTP(org.allocationApproved)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getOrgTypeColor(org.type)}>
                          {org.type}
                        </Badge>
                        <Badge className={getStatusColor(org.verificationStatus)}>
                          {org.verificationStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <div>Staked: {formatTP(org.stakingAmount)}</div>
                      <div>Address: {org.distributionAddress}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending Organizations */}
              {pendingOrgs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Pending Verification
                  </h4>
                  <div className="space-y-2">
                    {pendingOrgs.map((org) => (
                      <div key={org.id} className="p-3 border border-yellow-200 bg-yellow-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{org.name}</span>
                          <Badge className={getOrgTypeColor(org.type)}>
                            {org.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Requested: {formatTP(org.allocationRequested)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Allocation & Staking Interface */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Allocation & Staking
              </h3>

              {selectedOrgData ? (
                <div className="space-y-4">
                  {/* Organization Details */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">{selectedOrgData.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Type</div>
                        <div className="font-medium">{selectedOrgData.type}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Status</div>
                        <div className="font-medium">{selectedOrgData.verificationStatus}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Allocated</div>
                        <div className="font-medium">{formatTP(selectedOrgData.allocationApproved)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Staked</div>
                        <div className="font-medium">{formatTP(selectedOrgData.stakingAmount)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Staking Information */}
                  {selectedStakingData && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Staking Status
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Minimum Required</div>
                          <div className="font-medium">{formatTP(selectedStakingData.minimumRequired)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Annual Rewards</div>
                          <div className="font-medium text-green-600">{formatTP(selectedStakingData.rewards)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Lock Period</div>
                          <div className="font-medium">{selectedStakingData.lockPeriod}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Status</div>
                          <Badge className={getStatusColor(selectedStakingData.status)}>
                            {selectedStakingData.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Allocation Form */}
                  <div className="space-y-3">
                    <h5 className="font-medium">New Allocation</h5>
                    <div>
                      <Label htmlFor="allocationAmount">Amount (TP)</Label>
                      <Input
                        id="allocationAmount"
                        type="number"
                        placeholder="1000000"
                        value={allocationAmount}
                        onChange={(e) => setAllocationAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="allocationPurpose">Purpose</Label>
                      <Textarea
                        id="allocationPurpose"
                        placeholder="Describe the purpose of this allocation..."
                        value={allocationPurpose}
                        onChange={(e) => setAllocationPurpose(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleAllocate}
                      disabled={!allocationAmount || !allocationPurpose}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Allocate TruthPoints
                    </Button>
                  </div>

                  {/* Staking Form */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Add Staking</h5>
                    <div>
                      <Label htmlFor="stakingAmount">Additional Stake (TP)</Label>
                      <Input
                        id="stakingAmount"
                        type="number"
                        placeholder="500000"
                        value={stakingAmount}
                        onChange={(e) => setStakingAmount(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleStaking}
                      disabled={!stakingAmount}
                      variant="outline"
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Stake TruthPoints
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a verified organization to manage allocations and staking</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Treasury Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Allocated</div>
                <div className="font-semibold">{formatTP(stats.totalAllocated)}</div>
              </div>
              <div>
                <div className="text-gray-600">Total Remaining</div>
                <div className="font-semibold">{formatTP(stats.totalRemaining)}</div>
              </div>
              <div>
                <div className="text-gray-600">Verified Orgs</div>
                <div className="font-semibold">{stats.verifiedOrgs}</div>
              </div>
              <div>
                <div className="text-gray-600">Total Staked</div>
                <div className="font-semibold">{formatTP(stats.totalStaked)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}