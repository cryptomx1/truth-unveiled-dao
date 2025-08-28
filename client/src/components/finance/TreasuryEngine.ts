import { useState, useEffect } from "react";

// Treasury allocation structure for 50B TruthPoints
export interface TreasuryAllocation {
  total: number;
  marketing: {
    amount: number;
    percentage: number;
    allocated: number;
    remaining: number;
  };
  ngoRewards: {
    amount: number;
    percentage: number;
    allocated: number;
    remaining: number;
  };
  govRewards: {
    amount: number;
    percentage: number;
    allocated: number;
    remaining: number;
  };
  reserve: {
    amount: number;
    percentage: number;
    allocated: number;
    remaining: number;
  };
}

export interface OrgNode {
  id: string;
  name: string;
  type: 'ngo' | 'government' | 'municipal';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  allocationRequested: number;
  allocationApproved: number;
  distributionAddress: string;
  stakingAmount: number;
  usageLogs: UsageLog[];
}

export interface UsageLog {
  id: string;
  orgId: string;
  amount: number;
  purpose: string;
  timestamp: Date;
  verificationProof: string;
  status: 'pending' | 'approved' | 'audited';
}

export interface StakingInterface {
  nodeId: string;
  stakedAmount: number;
  minimumRequired: number;
  rewards: number;
  lockPeriod: string;
  status: 'active' | 'cooling_down' | 'slashed';
}

export class TreasuryEngine {
  private allocation: TreasuryAllocation;
  private orgNodes: Map<string, OrgNode>;
  private stakingPools: Map<string, StakingInterface>;
  private usageLogs: UsageLog[];

  constructor() {
    // Initialize 100B TruthPoint treasury allocation per Commander Mark directive
    this.allocation = {
      total: 100_000_000_000, // 100 billion TruthPoints
      marketing: {
        amount: 25_000_000_000, // 25% - Marketing campaigns
        percentage: 25,
        allocated: 0,
        remaining: 25_000_000_000
      },
      ngoRewards: {
        amount: 5_000_000_000, // 5% - NGO grants
        percentage: 5,
        allocated: 0,
        remaining: 5_000_000_000
      },
      govRewards: {
        amount: 20_000_000_000, // 20% - Civic rewards (includes validator incentives)
        percentage: 20,
        allocated: 0,
        remaining: 20_000_000_000
      },
      reserve: {
        amount: 50_000_000_000, // 50% - Strategic reserve
        percentage: 50,
        allocated: 0,
        remaining: 50_000_000_000
      }
    };

    this.orgNodes = new Map();
    this.stakingPools = new Map();
    this.usageLogs = [];

    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize some mock verified organizations
    const mockOrgs: OrgNode[] = [
      {
        id: "ngo_001",
        name: "Democracy Forward Initiative",
        type: 'ngo',
        verificationStatus: 'verified',
        allocationRequested: 500_000_000,
        allocationApproved: 300_000_000,
        distributionAddress: "tp:ngo:democracy-forward:main",
        stakingAmount: 1_000_000,
        usageLogs: []
      },
      {
        id: "gov_001", 
        name: "Austin Digital Government",
        type: 'government',
        verificationStatus: 'verified',
        allocationRequested: 1_000_000_000,
        allocationApproved: 750_000_000,
        distributionAddress: "tp:gov:austin-tx:civic",
        stakingAmount: 2_500_000,
        usageLogs: []
      },
      {
        id: "ngo_002",
        name: "Civic Transparency Coalition",
        type: 'ngo',
        verificationStatus: 'pending',
        allocationRequested: 250_000_000,
        allocationApproved: 0,
        distributionAddress: "tp:ngo:transparency-coalition:pending",
        stakingAmount: 500_000,
        usageLogs: []
      }
    ];

    mockOrgs.forEach(org => {
      this.orgNodes.set(org.id, org);
      
      // Create corresponding staking interface
      this.stakingPools.set(org.id, {
        nodeId: org.id,
        stakedAmount: org.stakingAmount,
        minimumRequired: org.type === 'government' ? 2_000_000 : 500_000,
        rewards: Math.floor(org.stakingAmount * 0.05), // 5% annual staking rewards
        lockPeriod: "12-months",
        status: 'active'
      });
    });

    // Update allocation amounts based on approved allocations
    let totalNgoAllocated = 0;
    let totalGovAllocated = 0;

    this.orgNodes.forEach(org => {
      if (org.verificationStatus === 'verified') {
        if (org.type === 'ngo') {
          totalNgoAllocated += org.allocationApproved;
        } else if (org.type === 'government' || org.type === 'municipal') {
          totalGovAllocated += org.allocationApproved;
        }
      }
    });

    this.allocation.ngoRewards.allocated = totalNgoAllocated;
    this.allocation.ngoRewards.remaining = this.allocation.ngoRewards.amount - totalNgoAllocated;
    this.allocation.govRewards.allocated = totalGovAllocated;
    this.allocation.govRewards.remaining = this.allocation.govRewards.amount - totalGovAllocated;
  }

  // Public methods for treasury management
  public getAllocation(): TreasuryAllocation {
    return { ...this.allocation };
  }

  public getVerifiedOrgs(): OrgNode[] {
    return Array.from(this.orgNodes.values()).filter(org => org.verificationStatus === 'verified');
  }

  public getPendingOrgs(): OrgNode[] {
    return Array.from(this.orgNodes.values()).filter(org => org.verificationStatus === 'pending');
  }

  public getOrgNode(orgId: string): OrgNode | undefined {
    return this.orgNodes.get(orgId);
  }

  public getStakingInterface(nodeId: string): StakingInterface | undefined {
    return this.stakingPools.get(nodeId);
  }

  public getAllStakingPools(): StakingInterface[] {
    return Array.from(this.stakingPools.values());
  }

  public allocateToOrg(orgId: string, amount: number, purpose: string, logType: 'Referral' | 'Civic Action' | 'NGO Grant' | 'Validator Reward' = 'NGO Grant'): boolean {
    const org = this.orgNodes.get(orgId);
    if (!org || org.verificationStatus !== 'verified') {
      console.error("Cannot allocate to unverified organization:", orgId);
      return false;
    }

    const tranche = org.type === 'ngo' ? this.allocation.ngoRewards : this.allocation.govRewards;
    
    if (amount > tranche.remaining) {
      console.error("Insufficient funds in tranche for allocation:", amount, "remaining:", tranche.remaining);
      return false;
    }

    // Create timestamped ledger entry with allocation type
    const usageLog: UsageLog = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      orgId,
      amount,
      purpose: `[${logType}] ${purpose}`,
      timestamp: new Date(),
      verificationProof: this.generateVerificationProof(orgId, amount, purpose),
      status: 'pending'
    };

    this.usageLogs.push(usageLog);
    org.usageLogs.push(usageLog);

    // Update allocation
    tranche.allocated += amount;
    tranche.remaining -= amount;

    console.log(`✅ Allocated ${amount.toLocaleString()} TP to ${org.name} for [${logType}] ${purpose}`);
    return true;
  }

  public stakeTruthPoints(orgId: string, amount: number): boolean {
    const org = this.orgNodes.get(orgId);
    const stakingPool = this.stakingPools.get(orgId);
    
    if (!org || !stakingPool) {
      console.error("Organization or staking pool not found:", orgId);
      return false;
    }

    stakingPool.stakedAmount += amount;
    org.stakingAmount += amount;

    // Calculate new rewards
    stakingPool.rewards = Math.floor(stakingPool.stakedAmount * 0.05);

    console.log(`💰 Staked ${amount.toLocaleString()} TP for ${org.name}`);
    return true;
  }

  public approveUsageLog(logId: string): boolean {
    const log = this.usageLogs.find(l => l.id === logId);
    if (!log) {
      console.error("Usage log not found:", logId);
      return false;
    }

    log.status = 'approved';
    console.log(`✅ Usage log approved: ${logId}`);
    return true;
  }

  private generateVerificationProof(orgId: string, amount: number, purpose: string): string {
    // Generate a mock verification proof hash
    const data = `${orgId}:${amount}:${purpose}:${Date.now()}`;
    return `zkp:${Buffer.from(data).toString('base64').substring(0, 32)}`;
  }

  // Statistics and reporting
  public getTreasuryStats() {
    return {
      totalAllocated: this.allocation.marketing.allocated + 
                     this.allocation.ngoRewards.allocated + 
                     this.allocation.govRewards.allocated + 
                     this.allocation.reserve.allocated,
      totalRemaining: this.allocation.marketing.remaining + 
                     this.allocation.ngoRewards.remaining + 
                     this.allocation.govRewards.remaining + 
                     this.allocation.reserve.remaining,
      verifiedOrgs: this.getVerifiedOrgs().length,
      pendingOrgs: this.getPendingOrgs().length,
      totalStaked: Array.from(this.stakingPools.values()).reduce((sum, pool) => sum + pool.stakedAmount, 0),
      totalUsageLogs: this.usageLogs.length,
      approvedUsageLogs: this.usageLogs.filter(log => log.status === 'approved').length
    };
  }
}

// Singleton instance for global treasury management
export const treasuryEngine = new TreasuryEngine();

// React hook for treasury management
export function useTreasuryEngine() {
  const [allocation, setAllocation] = useState<TreasuryAllocation>(treasuryEngine.getAllocation());
  const [verifiedOrgs, setVerifiedOrgs] = useState<OrgNode[]>(treasuryEngine.getVerifiedOrgs());
  const [pendingOrgs, setPendingOrgs] = useState<OrgNode[]>(treasuryEngine.getPendingOrgs());
  const [stakingPools, setStakingPools] = useState<StakingInterface[]>(treasuryEngine.getAllStakingPools());
  const [stats, setStats] = useState(treasuryEngine.getTreasuryStats());

  const refreshData = () => {
    setAllocation(treasuryEngine.getAllocation());
    setVerifiedOrgs(treasuryEngine.getVerifiedOrgs());
    setPendingOrgs(treasuryEngine.getPendingOrgs());
    setStakingPools(treasuryEngine.getAllStakingPools());
    setStats(treasuryEngine.getTreasuryStats());
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    allocation,
    verifiedOrgs,
    pendingOrgs,
    stakingPools,
    stats,
    refreshData,
    allocateToOrg: (orgId: string, amount: number, purpose: string) => {
      const success = treasuryEngine.allocateToOrg(orgId, amount, purpose);
      if (success) refreshData();
      return success;
    },
    stakeTruthPoints: (orgId: string, amount: number) => {
      const success = treasuryEngine.stakeTruthPoints(orgId, amount);
      if (success) refreshData();
      return success;
    }
  };
}