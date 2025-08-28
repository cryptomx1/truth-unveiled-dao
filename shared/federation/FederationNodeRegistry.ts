/**
 * FederationNodeRegistry.ts - Phase X-FED Step 1
 * 
 * Registry of active federation nodes by jurisdiction
 * Handles governance tier mapping, quorum baselines, and CID verification
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-FED Global Federation DAO Framework - Step 1
 */

export interface FederationNode {
  nodeId: string;
  jurisdiction: {
    country: string;
    region: string;
    locale: string;
    timezone: string;
  };
  governanceTier: 'tier1' | 'tier2' | 'tier3';
  quorumBaseline: {
    minimumParticipation: number; // Percentage
    decayThreshold: number; // Days before quorum decay
    emergencyOverride: boolean;
  };
  ledgerSyncId: string;
  cidVerification: {
    deploymentCID: string;
    verificationStatus: 'verified' | 'pending' | 'failed';
    lastVerified: Date;
    verificationHash: string;
  };
  onboardingTimestamp: Date;
  nodeStatus: 'active' | 'inactive' | 'suspended' | 'maintenance';
  capabilities: {
    crossBorderVoting: boolean;
    proposalGeneration: boolean;
    quorumValidation: boolean;
    ledgerSynchronization: boolean;
  };
  networkMetrics: {
    averageResponseTime: number; // milliseconds
    uptime: number; // percentage
    lastHeartbeat: Date;
    syncLatency: number; // milliseconds
  };
  genesisAuthority: {
    authorizedBy: string; // Genesis Badgeholder DID
    authorizationTimestamp: Date;
    authorizationSignature: string;
  };
}

export interface FederationNodeRegistration {
  nodeId: string;
  jurisdiction: FederationNode['jurisdiction'];
  governanceTier: FederationNode['governanceTier'];
  deploymentCID: string;
  genesisAuthorization: {
    badgeholderDID: string;
    signature: string;
  };
}

export interface QuorumConfiguration {
  baselinePercentage: number;
  tierMultipliers: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  decayRate: number; // Percentage per day
  emergencyThreshold: number; // Minimum for emergency decisions
}

export class FederationNodeRegistry {
  private nodes: Map<string, FederationNode> = new Map();
  private jurisdictionIndex: Map<string, string[]> = new Map(); // country -> nodeIds
  private tierIndex: Map<string, string[]> = new Map(); // tier -> nodeIds
  private quorumConfig: QuorumConfiguration;
  
  constructor() {
    this.quorumConfig = {
      baselinePercentage: 15, // 15% minimum participation
      tierMultipliers: {
        tier1: 1.0,
        tier2: 0.8,
        tier3: 0.6
      },
      decayRate: 2.5, // 2.5% decay per day
      emergencyThreshold: 5 // 5% minimum for emergency decisions
    };
    
    this.initializeDefaultNodes();
    console.log('🏛️ FederationNodeRegistry: Initialized with federation governance framework');
  }
  
  /**
   * Register new federation node with validation
   */
  async registerNode(registration: FederationNodeRegistration): Promise<{ success: boolean; nodeId?: string; error?: string }> {
    console.log(`📝 Registering federation node: ${registration.nodeId} for ${registration.jurisdiction.country}`);
    
    // Validate registration
    const validation = await this.validateNodeRegistration(registration);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    // Generate ledger sync ID
    const ledgerSyncId = this.generateLedgerSyncId(registration.nodeId, registration.jurisdiction.country);
    
    // Verify deployment CID
    const cidVerification = await this.verifyCIDDeployment(registration.deploymentCID);
    
    // Calculate quorum baseline
    const quorumBaseline = this.calculateQuorumBaseline(registration.governanceTier, registration.jurisdiction.country);
    
    // Create federation node
    const federationNode: FederationNode = {
      nodeId: registration.nodeId,
      jurisdiction: registration.jurisdiction,
      governanceTier: registration.governanceTier,
      quorumBaseline,
      ledgerSyncId,
      cidVerification,
      onboardingTimestamp: new Date(),
      nodeStatus: 'active',
      capabilities: this.getNodeCapabilities(registration.governanceTier),
      networkMetrics: {
        averageResponseTime: 0,
        uptime: 100,
        lastHeartbeat: new Date(),
        syncLatency: 0
      },
      genesisAuthority: {
        authorizedBy: registration.genesisAuthorization.badgeholderDID,
        authorizationTimestamp: new Date(),
        authorizationSignature: registration.genesisAuthorization.signature
      }
    };
    
    // Store node
    this.nodes.set(registration.nodeId, federationNode);
    
    // Update indexes
    this.updateJurisdictionIndex(registration.jurisdiction.country, registration.nodeId);
    this.updateTierIndex(registration.governanceTier, registration.nodeId);
    
    console.log(`✅ Federation node ${registration.nodeId} registered successfully`);
    console.log(`🔐 Ledger sync ID: ${ledgerSyncId}`);
    console.log(`📊 Quorum baseline: ${quorumBaseline.minimumParticipation}%`);
    
    return { success: true, nodeId: registration.nodeId };
  }
  
  /**
   * Get federation nodes by jurisdiction
   */
  getNodesByJurisdiction(country: string): FederationNode[] {
    const nodeIds = this.jurisdictionIndex.get(country) || [];
    return nodeIds.map(id => this.nodes.get(id)).filter(Boolean) as FederationNode[];
  }
  
  /**
   * Get federation nodes by governance tier
   */
  getNodesByTier(tier: 'tier1' | 'tier2' | 'tier3'): FederationNode[] {
    const nodeIds = this.tierIndex.get(tier) || [];
    return nodeIds.map(id => this.nodes.get(id)).filter(Boolean) as FederationNode[];
  }
  
  /**
   * Get active federation nodes
   */
  getActiveNodes(): FederationNode[] {
    return Array.from(this.nodes.values()).filter(node => node.nodeStatus === 'active');
  }
  
  /**
   * Get federation node by ID
   */
  getNode(nodeId: string): FederationNode | undefined {
    return this.nodes.get(nodeId);
  }
  
  /**
   * Update node status
   */
  async updateNodeStatus(nodeId: string, status: FederationNode['nodeStatus']): Promise<boolean> {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    node.nodeStatus = status;
    node.networkMetrics.lastHeartbeat = new Date();
    
    console.log(`📊 Node ${nodeId} status updated to: ${status}`);
    return true;
  }
  
  /**
   * Calculate current quorum for jurisdiction
   */
  calculateCurrentQuorum(country: string): {
    requiredParticipation: number;
    activeNodes: number;
    requiredNodes: number;
    quorumMet: boolean;
  } {
    const nodes = this.getNodesByJurisdiction(country);
    const activeNodes = nodes.filter(node => node.nodeStatus === 'active').length;
    
    if (activeNodes === 0) {
      return {
        requiredParticipation: 0,
        activeNodes: 0,
        requiredNodes: 0,
        quorumMet: false
      };
    }
    
    // Calculate weighted quorum based on tier distribution
    const tierCounts = nodes.reduce((acc, node) => {
      acc[node.governanceTier] = (acc[node.governanceTier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let weightedQuorum = 0;
    let totalWeight = 0;
    
    Object.entries(tierCounts).forEach(([tier, count]) => {
      const multiplier = this.quorumConfig.tierMultipliers[tier as keyof typeof this.quorumConfig.tierMultipliers];
      weightedQuorum += this.quorumConfig.baselinePercentage * multiplier * count;
      totalWeight += count;
    });
    
    const requiredParticipation = totalWeight > 0 ? weightedQuorum / totalWeight : 0;
    const requiredNodes = Math.ceil((requiredParticipation / 100) * activeNodes);
    
    return {
      requiredParticipation: Math.round(requiredParticipation * 100) / 100,
      activeNodes,
      requiredNodes,
      quorumMet: activeNodes >= requiredNodes
    };
  }
  
  /**
   * Get network health summary
   */
  getNetworkHealth(): {
    totalNodes: number;
    activeNodes: number;
    averageUptime: number;
    averageResponseTime: number;
    jurisdictionCoverage: number;
    healthStatus: 'excellent' | 'good' | 'degraded' | 'critical';
  } {
    const allNodes = Array.from(this.nodes.values());
    const activeNodes = allNodes.filter(node => node.nodeStatus === 'active');
    
    const totalNodes = allNodes.length;
    const activeCount = activeNodes.length;
    
    const averageUptime = activeNodes.length > 0 
      ? activeNodes.reduce((sum, node) => sum + node.networkMetrics.uptime, 0) / activeNodes.length
      : 0;
    
    const averageResponseTime = activeNodes.length > 0
      ? activeNodes.reduce((sum, node) => sum + node.networkMetrics.averageResponseTime, 0) / activeNodes.length
      : 0;
    
    const uniqueJurisdictions = new Set(allNodes.map(node => node.jurisdiction.country)).size;
    const jurisdictionCoverage = uniqueJurisdictions;
    
    // Determine health status
    let healthStatus: 'excellent' | 'good' | 'degraded' | 'critical' = 'excellent';
    const activePercentage = totalNodes > 0 ? (activeCount / totalNodes) * 100 : 0;
    
    if (activePercentage < 50 || averageUptime < 80) healthStatus = 'critical';
    else if (activePercentage < 70 || averageUptime < 90) healthStatus = 'degraded';
    else if (activePercentage < 85 || averageUptime < 95) healthStatus = 'good';
    
    return {
      totalNodes,
      activeNodes: activeCount,
      averageUptime: Math.round(averageUptime * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      jurisdictionCoverage,
      healthStatus
    };
  }
  
  /**
   * Validate node registration
   */
  private async validateNodeRegistration(registration: FederationNodeRegistration): Promise<{ isValid: boolean; error?: string }> {
    // Check if node ID already exists
    if (this.nodes.has(registration.nodeId)) {
      return { isValid: false, error: `Node ID ${registration.nodeId} already exists` };
    }
    
    // Validate jurisdiction data
    if (!registration.jurisdiction.country || !registration.jurisdiction.region) {
      return { isValid: false, error: 'Invalid jurisdiction data' };
    }
    
    // Validate deployment CID format
    if (!registration.deploymentCID.startsWith('bafybei')) {
      return { isValid: false, error: 'Invalid deployment CID format' };
    }
    
    // Validate Genesis Badgeholder authorization
    if (!registration.genesisAuthorization.badgeholderDID || !registration.genesisAuthorization.signature) {
      return { isValid: false, error: 'Missing Genesis Badgeholder authorization' };
    }
    
    return { isValid: true };
  }
  
  /**
   * Generate ledger sync ID
   */
  private generateLedgerSyncId(nodeId: string, country: string): string {
    const timestamp = Date.now();
    const seed = `${nodeId}-${country}-${timestamp}`;
    
    // Simple hash for demo purposes
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `fed_sync_${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }
  
  /**
   * Verify CID deployment
   */
  private async verifyCIDDeployment(deploymentCID: string): Promise<FederationNode['cidVerification']> {
    console.log(`🔍 Verifying deployment CID: ${deploymentCID}`);
    
    // Simulate CID verification (would use IPFS gateway in production)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const verificationSuccess = Math.random() > 0.1; // 90% success rate
    
    const verificationHash = `0x${Math.random().toString(16).substr(2, 32)}`;
    
    return {
      deploymentCID,
      verificationStatus: verificationSuccess ? 'verified' : 'failed',
      lastVerified: new Date(),
      verificationHash
    };
  }
  
  /**
   * Calculate quorum baseline for node
   */
  private calculateQuorumBaseline(tier: string, country: string): FederationNode['quorumBaseline'] {
    const basePercentage = this.quorumConfig.baselinePercentage;
    const tierMultiplier = this.quorumConfig.tierMultipliers[tier as keyof typeof this.quorumConfig.tierMultipliers];
    
    const minimumParticipation = Math.round(basePercentage * tierMultiplier * 100) / 100;
    
    return {
      minimumParticipation,
      decayThreshold: 7, // 7 days
      emergencyOverride: tier === 'tier1'
    };
  }
  
  /**
   * Get node capabilities based on tier
   */
  private getNodeCapabilities(tier: string): FederationNode['capabilities'] {
    switch (tier) {
      case 'tier1':
        return {
          crossBorderVoting: true,
          proposalGeneration: true,
          quorumValidation: true,
          ledgerSynchronization: true
        };
      case 'tier2':
        return {
          crossBorderVoting: true,
          proposalGeneration: true,
          quorumValidation: false,
          ledgerSynchronization: true
        };
      case 'tier3':
        return {
          crossBorderVoting: false,
          proposalGeneration: false,
          quorumValidation: false,
          ledgerSynchronization: true
        };
      default:
        return {
          crossBorderVoting: false,
          proposalGeneration: false,
          quorumValidation: false,
          ledgerSynchronization: false
        };
    }
  }
  
  /**
   * Update jurisdiction index
   */
  private updateJurisdictionIndex(country: string, nodeId: string): void {
    const existing = this.jurisdictionIndex.get(country) || [];
    if (!existing.includes(nodeId)) {
      this.jurisdictionIndex.set(country, [...existing, nodeId]);
    }
  }
  
  /**
   * Update tier index
   */
  private updateTierIndex(tier: string, nodeId: string): void {
    const existing = this.tierIndex.get(tier) || [];
    if (!existing.includes(tier)) {
      this.tierIndex.set(tier, [...existing, nodeId]);
    }
  }
  
  /**
   * Initialize default federation nodes for testing
   */
  private initializeDefaultNodes(): void {
    const defaultNodes: FederationNodeRegistration[] = [
      {
        nodeId: 'fed_us_east_1',
        jurisdiction: { country: 'US', region: 'East Coast', locale: 'en-US', timezone: 'EST' },
        governanceTier: 'tier1',
        deploymentCID: 'bafybeiexample1234567890abcdef',
        genesisAuthorization: {
          badgeholderDID: 'did:genesis:us_east_authority',
          signature: '0xfed_us_signature_example'
        }
      },
      {
        nodeId: 'fed_de_central_1',
        jurisdiction: { country: 'DE', region: 'Central Europe', locale: 'de-DE', timezone: 'CET' },
        governanceTier: 'tier1',
        deploymentCID: 'bafybeiexample1234567890fedcba',
        genesisAuthorization: {
          badgeholderDID: 'did:genesis:de_central_authority',
          signature: '0xfed_de_signature_example'
        }
      },
      {
        nodeId: 'fed_jp_asia_1',
        jurisdiction: { country: 'JP', region: 'Asia Pacific', locale: 'ja-JP', timezone: 'JST' },
        governanceTier: 'tier2',
        deploymentCID: 'bafybeiexample1234567890jp1234',
        genesisAuthorization: {
          badgeholderDID: 'did:genesis:jp_asia_authority',
          signature: '0xfed_jp_signature_example'
        }
      }
    ];
    
    // Register default nodes
    defaultNodes.forEach(async (node) => {
      await this.registerNode(node);
    });
    
    console.log(`🌐 Default federation nodes initialized: ${defaultNodes.length} nodes`);
  }
  
  /**
   * Get all nodes for admin/debugging
   */
  getAllNodes(): FederationNode[] {
    return Array.from(this.nodes.values());
  }
  
  /**
   * Clear registry (for testing)
   */
  clearRegistry(): void {
    this.nodes.clear();
    this.jurisdictionIndex.clear();
    this.tierIndex.clear();
    console.log('🧹 Federation node registry cleared');
  }
}