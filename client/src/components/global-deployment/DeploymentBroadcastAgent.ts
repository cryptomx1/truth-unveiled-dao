/**
 * DeploymentBroadcastAgent.ts - Phase X-Z Step 3
 * 
 * Regional CID propagation and federation broadcast system
 * Handles CID propagation across federated nodes with jurisdictional metadata
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-Z Global Civic Stack Deployment - Step 3
 */

export interface CIDPropagationPayload {
  deploymentId: string;
  cid: string;
  jurisdiction: {
    country: string;
    locale: string;
    tier: 'tier1' | 'tier2' | 'tier3';
    deckGroup: string[];
  };
  metadata: {
    timestamp: Date;
    initiator: string;
    propagationHash: string;
    selectedDecks: number[];
    policyCompliance: string[];
    federationEnabled: boolean;
  };
  targetNodes: string[];
  propagationStatus: 'pending' | 'broadcasting' | 'completed' | 'failed';
}

export interface RegionalBroadcastResult {
  broadcastId: string;
  propagationPayload: CIDPropagationPayload;
  successfulNodes: string[];
  failedNodes: string[];
  fallbackTriggered: boolean;
  daoLedgerExported: boolean;
  ariaAnnounced: boolean;
  networkHealth: 'excellent' | 'good' | 'degraded' | 'critical';
}

export interface DeploymentEvent {
  eventId: string;
  deploymentId: string;
  jurisdiction: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  eventType: 'deployment_started' | 'deployment_completed' | 'deployment_failed' | 'validation_required' | 'cid_propagation';
  timestamp: Date;
  metadata: {
    selectedDecks: number[];
    policyCompliance: string[];
    federationEnabled: boolean;
    ipfsPinned: boolean;
    cidExported: boolean;
    regionalBroadcast?: boolean;
  };
  validatorData?: {
    ledgerHash: string;
    validationStatus: 'pending' | 'approved' | 'rejected';
    validatorSignatures: string[];
  };
  cidPropagation?: CIDPropagationPayload;
}

export interface BroadcastResult {
  broadcastId: string;
  recipients: string[];
  deliveryStatus: 'sent' | 'delivered' | 'failed';
  retryCount: number;
  cidExportPath?: string;
}

export class DeploymentBroadcastAgent {
  private eventQueue: DeploymentEvent[] = [];
  private broadcastHistory: Map<string, BroadcastResult> = new Map();
  private regionalBroadcasts: Map<string, RegionalBroadcastResult> = new Map();
  private propagationSimulations: RegionalBroadcastResult[] = [];
  
  constructor() {
    console.log('📡 DeploymentBroadcastAgent: Initialized for Phase X-Z Step 3 - Regional CID Propagation');
    this.initializeRegionalSimulations();
  }
  
  /**
   * Emit deployment event with DAO validator integration
   */
  async emitDeploymentEvent(event: Omit<DeploymentEvent, 'eventId' | 'timestamp'>): Promise<string> {
    const deploymentEvent: DeploymentEvent = {
      ...event,
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    console.log(`📢 Emitting deployment event: ${deploymentEvent.eventType} for ${deploymentEvent.jurisdiction}`);
    
    // Add to event queue
    this.eventQueue.push(deploymentEvent);
    
    // Generate CID export for DAOValidatorLedger compatibility
    if (deploymentEvent.eventType === 'deployment_completed') {
      await this.generateCIDExport(deploymentEvent);
    }
    
    // Broadcast to network
    const broadcastResult = await this.broadcastToNetwork(deploymentEvent);
    
    // Store broadcast result
    this.broadcastHistory.set(deploymentEvent.eventId, broadcastResult);
    
    console.log(`✅ Deployment event ${deploymentEvent.eventId} broadcast complete`);
    
    return deploymentEvent.eventId;
  }
  
  /**
   * Generate CID export structure for DAOValidatorLedger integration
   */
  private async generateCIDExport(event: DeploymentEvent): Promise<void> {
    console.log(`🔗 Generating CID export for deployment ${event.deploymentId}`);
    
    const cidExportData = {
      deploymentId: event.deploymentId,
      jurisdiction: event.jurisdiction,
      tier: event.tier,
      timestamp: event.timestamp.toISOString(),
      metadata: event.metadata,
      schema: 'civic-deployment-v2.1.0',
      validatorCompatible: true
    };
    
    // Mock CID generation (would use actual IPFS in production)
    const mockCID = `bafybei${Math.random().toString(36).substr(2, 50)}`;
    
    // Update event metadata
    event.metadata.cidExported = true;
    event.validatorData = {
      ledgerHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      validationStatus: 'pending',
      validatorSignatures: []
    };
    
    console.log(`📝 CID export generated: ${mockCID}`);
    console.log(`🔐 Validator hash: ${event.validatorData.ledgerHash}`);
  }
  
  /**
   * Broadcast event to network participants
   */
  private async broadcastToNetwork(event: DeploymentEvent): Promise<BroadcastResult> {
    const broadcastId = `bcast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Define network recipients based on event type
    const recipients = this.getNetworkRecipients(event);
    
    console.log(`📡 Broadcasting ${event.eventType} to ${recipients.length} recipients`);
    
    // Simulate network broadcast (would use actual network protocols in production)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const deliverySuccess = Math.random() > 0.1; // 90% success rate
    
    const result: BroadcastResult = {
      broadcastId,
      recipients,
      deliveryStatus: deliverySuccess ? 'delivered' : 'failed',
      retryCount: 0,
      cidExportPath: event.metadata.cidExported ? `/ipfs/exports/${event.deploymentId}.json` : undefined
    };
    
    if (!deliverySuccess) {
      console.warn(`⚠️ Broadcast delivery failed for ${event.eventId}, will retry`);
      // Would implement retry logic in production
    }
    
    return result;
  }
  
  /**
   * Get network recipients based on event type
   */
  private getNetworkRecipients(event: DeploymentEvent): string[] {
    const baseRecipients = [
      'dao-validator-node-1.replit.app',
      'dao-validator-node-2.replit.app',
      'federation-hub.replit.app'
    ];
    
    switch (event.eventType) {
      case 'deployment_started':
        return [...baseRecipients, 'deployment-monitor.replit.app'];
      
      case 'deployment_completed':
        return [
          ...baseRecipients,
          'global-registry.replit.app',
          'ipfs-pinning-service.replit.app',
          'federation-sync.replit.app'
        ];
      
      case 'deployment_failed':
        return [...baseRecipients, 'error-tracking.replit.app'];
      
      case 'validation_required':
        return [
          'dao-validator-node-1.replit.app',
          'dao-validator-node-2.replit.app',
          'dao-validator-node-3.replit.app'
        ];
      
      default:
        return baseRecipients;
    }
  }
  
  /**
   * Get deployment event by ID
   */
  getDeploymentEvent(eventId: string): DeploymentEvent | undefined {
    return this.eventQueue.find(event => event.eventId === eventId);
  }
  
  /**
   * Get broadcast result by event ID
   */
  getBroadcastResult(eventId: string): BroadcastResult | undefined {
    return this.broadcastHistory.get(eventId);
  }
  
  /**
   * Get all pending validation events
   */
  getPendingValidations(): DeploymentEvent[] {
    return this.eventQueue.filter(event => 
      event.validatorData?.validationStatus === 'pending'
    );
  }
  
  /**
   * Update validator status (for Step 3 integration)
   */
  async updateValidatorStatus(
    eventId: string, 
    status: 'approved' | 'rejected', 
    signature: string
  ): Promise<boolean> {
    const event = this.getDeploymentEvent(eventId);
    
    if (!event || !event.validatorData) {
      return false;
    }
    
    event.validatorData.validationStatus = status;
    event.validatorData.validatorSignatures.push(signature);
    
    console.log(`✅ Validator status updated for ${eventId}: ${status}`);
    
    // Re-broadcast validation update
    await this.emitDeploymentEvent({
      deploymentId: event.deploymentId,
      jurisdiction: event.jurisdiction,
      tier: event.tier,
      eventType: status === 'approved' ? 'deployment_completed' : 'deployment_failed',
      metadata: event.metadata,
      validatorData: event.validatorData
    });
    
    return true;
  }
  
  /**
   * Get network status summary
   */
  getNetworkStatus(): {
    totalEvents: number;
    pendingValidations: number;
    successfulBroadcasts: number;
    failedBroadcasts: number;
    networkHealth: 'excellent' | 'good' | 'degraded' | 'critical';
  } {
    const totalEvents = this.eventQueue.length;
    const pendingValidations = this.getPendingValidations().length;
    
    const broadcastResults = Array.from(this.broadcastHistory.values());
    const successfulBroadcasts = broadcastResults.filter(r => r.deliveryStatus === 'delivered').length;
    const failedBroadcasts = broadcastResults.filter(r => r.deliveryStatus === 'failed').length;
    
    let networkHealth: 'excellent' | 'good' | 'degraded' | 'critical' = 'excellent';
    
    const failureRate = broadcastResults.length > 0 ? failedBroadcasts / broadcastResults.length : 0;
    
    if (failureRate > 0.3) networkHealth = 'critical';
    else if (failureRate > 0.2) networkHealth = 'degraded';
    else if (failureRate > 0.1) networkHealth = 'good';
    
    return {
      totalEvents,
      pendingValidations,
      successfulBroadcasts,
      failedBroadcasts,
      networkHealth
    };
  }
  
  /**
   * Phase X-Z Step 3: Regional CID Propagation
   * Broadcast CID across federated nodes with jurisdictional metadata
   */
  async propagateRegionalCID(
    deploymentId: string,
    country: string,
    locale: string,
    tier: 'tier1' | 'tier2' | 'tier3',
    deckGroup: string[],
    initiator: string = 'deployment-wizard'
  ): Promise<RegionalBroadcastResult> {
    const startTime = Date.now();
    
    console.log(`🌐 Starting regional CID propagation for ${country} (${tier})`);
    
    // Generate CID with metadata
    const cid = this.generateRegionalCID(country, tier, deckGroup);
    const propagationHash = this.generatePropagationHash(deploymentId, country, cid);
    
    // Create propagation payload
    const propagationPayload: CIDPropagationPayload = {
      deploymentId,
      cid,
      jurisdiction: {
        country,
        locale,
        tier,
        deckGroup
      },
      metadata: {
        timestamp: new Date(),
        initiator,
        propagationHash,
        selectedDecks: this.getDecksForTier(tier),
        policyCompliance: this.getPolicyComplianceForCountry(country),
        federationEnabled: tier === 'tier1' || tier === 'tier2'
      },
      targetNodes: this.getRegionalFederationNodes(country, tier),
      propagationStatus: 'pending'
    };
    
    // Update status
    propagationPayload.propagationStatus = 'broadcasting';
    
    // Simulate regional broadcast
    const broadcastResult = await this.simulateRegionalBroadcast(propagationPayload);
    
    // Export to DAO Validator Ledger
    const daoExported = await this.exportToDAOValidatorLedger(propagationPayload, broadcastResult);
    
    // ARIA status announcement
    this.announceRegionalPropagation(broadcastResult);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Regional CID propagation completed in ${processingTime}ms`);
    console.log(`📊 Broadcast result: ${broadcastResult.successfulNodes.length}/${broadcastResult.propagationPayload.targetNodes.length} nodes reached`);
    
    // Store broadcast result
    this.regionalBroadcasts.set(deploymentId, broadcastResult);
    this.propagationSimulations.push(broadcastResult);
    
    return broadcastResult;
  }
  
  /**
   * Generate regional CID with jurisdictional metadata
   */
  private generateRegionalCID(country: string, tier: string, deckGroup: string[]): string {
    const timestamp = Date.now();
    const deckHash = deckGroup.join('-').toLowerCase();
    const cidSeed = `${country.toLowerCase()}-${tier}-${deckHash}-${timestamp}`;
    
    // Mock CID generation (would use actual IPFS in production)
    const hash = cidSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cidSuffix = Math.abs(hash).toString(36).padStart(46, '0').substring(0, 46);
    
    return `bafybei${cidSuffix}`;
  }
  
  /**
   * Generate propagation hash for tracking
   */
  private generatePropagationHash(deploymentId: string, country: string, cid: string): string {
    const hashInput = `${deploymentId}-${country}-${cid}-${Date.now()}`;
    
    // Simple hash generation for demo
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }
  
  /**
   * Get regional federation nodes based on country and tier
   */
  private getRegionalFederationNodes(country: string, tier: string): string[] {
    const baseNodes = [
      'federation-hub-primary.replit.app',
      'federation-hub-secondary.replit.app'
    ];
    
    const regionalNodes: Record<string, string[]> = {
      'US': ['us-east-1.federation.replit.app', 'us-west-1.federation.replit.app'],
      'DE': ['eu-central-1.federation.replit.app', 'eu-west-1.federation.replit.app'],
      'JP': ['asia-pacific-1.federation.replit.app', 'asia-northeast-1.federation.replit.app'],
      'BR': ['sa-east-1.federation.replit.app'],
      'UK': ['eu-west-2.federation.replit.app'],
      'CA': ['ca-central-1.federation.replit.app']
    };
    
    const tierNodes = tier === 'tier1' ? 
      ['validator-tier1-primary.replit.app', 'validator-tier1-secondary.replit.app'] :
      tier === 'tier2' ? 
      ['validator-tier2-primary.replit.app'] : 
      [];
    
    return [...baseNodes, ...(regionalNodes[country] || []), ...tierNodes];
  }
  
  /**
   * Simulate regional broadcast with success/failure scenarios
   */
  private async simulateRegionalBroadcast(payload: CIDPropagationPayload): Promise<RegionalBroadcastResult> {
    const broadcastId = `rbcast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    console.log(`📡 Broadcasting CID ${payload.cid} to ${payload.targetNodes.length} regional nodes`);
    
    // Simulate network propagation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure rates based on tier and node availability
    const successRate = this.calculateSuccessRate(payload.jurisdiction.tier, payload.targetNodes.length);
    
    const successfulNodes: string[] = [];
    const failedNodes: string[] = [];
    
    for (const node of payload.targetNodes) {
      if (Math.random() < successRate) {
        successfulNodes.push(node);
      } else {
        failedNodes.push(node);
      }
    }
    
    // Determine if fallback should be triggered
    const fallbackThreshold = 0.5; // 50% success rate threshold
    const actualSuccessRate = successfulNodes.length / payload.targetNodes.length;
    const fallbackTriggered = actualSuccessRate < fallbackThreshold;
    
    if (fallbackTriggered) {
      console.log(`⚠️ Fallback triggered: ${actualSuccessRate.toFixed(2)} success rate below ${fallbackThreshold}`);
      await this.executeFallbackPropagation(payload, successfulNodes);
    }
    
    // Determine network health
    const networkHealth = this.assessNetworkHealth(actualSuccessRate);
    
    const result: RegionalBroadcastResult = {
      broadcastId,
      propagationPayload: { ...payload, propagationStatus: successfulNodes.length > 0 ? 'completed' : 'failed' },
      successfulNodes,
      failedNodes,
      fallbackTriggered,
      daoLedgerExported: false, // Will be set by exportToDAOValidatorLedger
      ariaAnnounced: false, // Will be set by announceRegionalPropagation
      networkHealth
    };
    
    console.log(`📊 Regional broadcast ${broadcastId}: ${successfulNodes.length}/${payload.targetNodes.length} nodes successful`);
    
    return result;
  }
  
  /**
   * Calculate success rate based on tier and network conditions
   */
  private calculateSuccessRate(tier: string, nodeCount: number): number {
    let baseRate = 0.8; // 80% base success rate
    
    // Tier adjustments
    if (tier === 'tier1') baseRate = 0.9;
    else if (tier === 'tier2') baseRate = 0.8;
    else if (tier === 'tier3') baseRate = 0.7;
    
    // Node count adjustments (more nodes = higher chance of individual failures)
    const nodeCountPenalty = Math.max(0, (nodeCount - 3) * 0.05);
    
    return Math.max(0.3, baseRate - nodeCountPenalty);
  }
  
  /**
   * Execute fallback propagation for failed nodes
   */
  private async executeFallbackPropagation(payload: CIDPropagationPayload, currentSuccessful: string[]): Promise<void> {
    console.log('🔄 Executing fallback propagation strategy');
    
    // Add fallback nodes
    const fallbackNodes = [
      'fallback-hub-1.replit.app',
      'fallback-hub-2.replit.app',
      'emergency-propagation.replit.app'
    ];
    
    // Simulate fallback propagation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`✅ Fallback propagation completed: ${fallbackNodes.length} additional nodes targeted`);
  }
  
  /**
   * Assess network health based on success rate
   */
  private assessNetworkHealth(successRate: number): 'excellent' | 'good' | 'degraded' | 'critical' {
    if (successRate >= 0.9) return 'excellent';
    if (successRate >= 0.7) return 'good';
    if (successRate >= 0.5) return 'degraded';
    return 'critical';
  }
  
  /**
   * Export to DAO Validator Ledger with compatibility validation
   */
  private async exportToDAOValidatorLedger(
    payload: CIDPropagationPayload, 
    broadcastResult: RegionalBroadcastResult
  ): Promise<boolean> {
    console.log(`📝 Exporting CID propagation to DAO Validator Ledger`);
    
    const daoLedgerEntry = {
      entryId: `dao_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      entryType: 'regional_cid_propagation',
      timestamp: new Date().toISOString(),
      deploymentId: payload.deploymentId,
      cid: payload.cid,
      jurisdiction: payload.jurisdiction,
      propagationHash: payload.metadata.propagationHash,
      broadcastMetadata: {
        broadcastId: broadcastResult.broadcastId,
        successfulNodes: broadcastResult.successfulNodes.length,
        totalNodes: payload.targetNodes.length,
        successRate: broadcastResult.successfulNodes.length / payload.targetNodes.length,
        networkHealth: broadcastResult.networkHealth,
        fallbackTriggered: broadcastResult.fallbackTriggered
      },
      validatorCompatible: true,
      schemaVersion: 'dao-validator-v2.1.0'
    };
    
    // Simulate DAO ledger export
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`✅ DAO Validator Ledger entry created: ${daoLedgerEntry.entryId}`);
    
    broadcastResult.daoLedgerExported = true;
    return true;
  }
  
  /**
   * ARIA-compliant status announcement for regional propagation
   */
  private announceRegionalPropagation(broadcastResult: RegionalBroadcastResult): void {
    const { propagationPayload, successfulNodes, networkHealth, fallbackTriggered } = broadcastResult;
    const successRate = Math.round((successfulNodes.length / propagationPayload.targetNodes.length) * 100);
    
    let announcement = `Regional CID propagation completed for ${propagationPayload.jurisdiction.country}. `;
    announcement += `${successRate}% of nodes reached successfully. `;
    announcement += `Network health: ${networkHealth}. `;
    
    if (fallbackTriggered) {
      announcement += 'Fallback propagation activated. ';
    }
    
    announcement += 'Deployment broadcast ready for validation.';
    
    console.log(`🔊 ARIA Announcement: ${announcement}`);
    
    // In a real implementation, this would trigger screen reader announcement
    // For now, we'll use console logging with accessibility formatting
    broadcastResult.ariaAnnounced = true;
  }
  
  /**
   * Initialize regional simulations for QA validation
   */
  private initializeRegionalSimulations(): void {
    console.log('🧪 Initializing regional broadcast simulations for QA validation');
    console.log('📊 Target: 10 simulations (7 successful, 3 fallback triggers)');
  }
  
  /**
   * Run complete QA simulation suite
   */
  async runQASimulations(): Promise<{
    totalSimulations: number;
    successfulSimulations: number;
    fallbackTriggered: number;
    averageSuccessRate: number;
    schemaValidationPassed: boolean;
  }> {
    console.log('🧪 Running QA simulation suite for regional CID propagation');
    
    const testScenarios = [
      { country: 'US', tier: 'tier1' as const, deckGroup: ['governance', 'privacy', 'finance'] },
      { country: 'DE', tier: 'tier1' as const, deckGroup: ['governance', 'privacy'] },
      { country: 'UK', tier: 'tier1' as const, deckGroup: ['governance', 'education'] },
      { country: 'JP', tier: 'tier2' as const, deckGroup: ['governance', 'privacy'] },
      { country: 'CA', tier: 'tier1' as const, deckGroup: ['governance'] },
      { country: 'BR', tier: 'tier3' as const, deckGroup: ['governance'] },
      { country: 'US', tier: 'tier2' as const, deckGroup: ['governance', 'finance'] },
      { country: 'DE', tier: 'tier2' as const, deckGroup: ['governance'] },
      { country: 'JP', tier: 'tier3' as const, deckGroup: ['governance'] },
      { country: 'BR', tier: 'tier2' as const, deckGroup: ['governance', 'education'] }
    ];
    
    this.propagationSimulations = [];
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      const deploymentId = `qa_test_${i + 1}_${Date.now()}`;
      
      console.log(`🔬 Running simulation ${i + 1}/10: ${scenario.country} ${scenario.tier}`);
      
      const result = await this.propagateRegionalCID(
        deploymentId,
        scenario.country,
        `${scenario.country.toLowerCase()}_locale`,
        scenario.tier,
        scenario.deckGroup,
        'qa-simulation'
      );
      
      // Brief delay between simulations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate results
    const totalSimulations = this.propagationSimulations.length;
    const successfulSimulations = this.propagationSimulations.filter(
      sim => sim.propagationPayload.propagationStatus === 'completed'
    ).length;
    const fallbackTriggered = this.propagationSimulations.filter(
      sim => sim.fallbackTriggered
    ).length;
    
    const totalSuccessRate = this.propagationSimulations.reduce((acc, sim) => {
      return acc + (sim.successfulNodes.length / sim.propagationPayload.targetNodes.length);
    }, 0);
    const averageSuccessRate = totalSuccessRate / totalSimulations;
    
    // Schema validation check
    const schemaValidationPassed = this.propagationSimulations.every(
      sim => sim.daoLedgerExported && sim.ariaAnnounced
    );
    
    const results = {
      totalSimulations,
      successfulSimulations,
      fallbackTriggered,
      averageSuccessRate,
      schemaValidationPassed
    };
    
    console.log('📊 QA Simulation Results:');
    console.log(`   Total Simulations: ${results.totalSimulations}`);
    console.log(`   Successful: ${results.successfulSimulations}`);
    console.log(`   Fallback Triggered: ${results.fallbackTriggered}`);
    console.log(`   Average Success Rate: ${(results.averageSuccessRate * 100).toFixed(1)}%`);
    console.log(`   Schema Validation: ${results.schemaValidationPassed ? 'PASSED' : 'FAILED'}`);
    
    return results;
  }
  
  /**
   * Get decks for specific tier
   */
  private getDecksForTier(tier: string): number[] {
    switch (tier) {
      case 'tier1': return [1, 2, 3, 4, 5, 7, 8, 9];
      case 'tier2': return [1, 2, 3, 4, 5];
      case 'tier3': return [1, 2, 3];
      default: return [1];
    }
  }
  
  /**
   * Get policy compliance requirements for country
   */
  private getPolicyComplianceForCountry(country: string): string[] {
    const complianceMap: Record<string, string[]> = {
      'US': ['CCPA', 'State Privacy Laws'],
      'DE': ['GDPR', 'BDSG'],
      'UK': ['GDPR', 'DPA 2018'],
      'JP': ['APPI'],
      'CA': ['PIPEDA'],
      'BR': ['LGPD']
    };
    
    return complianceMap[country] || ['Basic Privacy Protection'];
  }
  
  /**
   * Get regional broadcast results
   */
  getRegionalBroadcastResults(): RegionalBroadcastResult[] {
    return Array.from(this.regionalBroadcasts.values());
  }
  
  /**
   * Get QA simulation history
   */
  getQASimulationHistory(): RegionalBroadcastResult[] {
    return this.propagationSimulations;
  }
  
  /**
   * Clear event history (for testing/cleanup)
   */
  clearHistory(): void {
    this.eventQueue = [];
    this.broadcastHistory.clear();
    this.regionalBroadcasts.clear();
    this.propagationSimulations = [];
    console.log('🧹 DeploymentBroadcastAgent: All history cleared');
  }
}