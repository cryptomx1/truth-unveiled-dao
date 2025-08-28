/**
 * FederationSyncEngine.ts
 * Phase X-MUNICIPALPREP Step 4: DAO node syncing for municipal-level registry alignment
 * Commander Mark directive via JASMY Relay
 */

interface PolicyEntry {
  id: string;
  title: string;
  jurisdiction: string;
  cid: string;
  zkpHash: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
  federationSynced: boolean;
}

interface FederationNode {
  nodeId: string;
  jurisdiction: string;
  endpoint: string;
  status: 'online' | 'offline' | 'syncing';
  lastSync: string;
  syncLatency: number;
}

interface SyncResult {
  success: boolean;
  nodeId: string;
  syncTime: number;
  error?: string;
}

interface SyncMetrics {
  totalNodes: number;
  onlineNodes: number;
  syncingNodes: number;
  averageLatency: number;
  successRate: number;
  lastSyncTime: string;
}

export class FederationSyncEngine {
  private static instance: FederationSyncEngine;
  private federationNodes: Map<string, FederationNode>;
  private syncQueue: PolicyEntry[];
  private syncMetrics: SyncMetrics;
  private syncHistory: any[];
  private isProcessing: boolean;

  private constructor() {
    this.federationNodes = new Map();
    this.syncQueue = [];
    this.syncHistory = [];
    this.isProcessing = false;
    this.syncMetrics = {
      totalNodes: 0,
      onlineNodes: 0,
      syncingNodes: 0,
      averageLatency: 0,
      successRate: 0,
      lastSyncTime: new Date().toISOString()
    };
    
    this.initializeFederationNodes();
    this.startPeriodicSync();
  }

  public static getInstance(): FederationSyncEngine {
    if (!FederationSyncEngine.instance) {
      FederationSyncEngine.instance = new FederationSyncEngine();
    }
    return FederationSyncEngine.instance;
  }

  private initializeFederationNodes() {
    const nodes: FederationNode[] = [
      {
        nodeId: 'node_austin_tx_001',
        jurisdiction: 'Austin-TX',
        endpoint: 'https://dao.austin.tx.municipal.api',
        status: 'online',
        lastSync: new Date().toISOString(),
        syncLatency: 145
      },
      {
        nodeId: 'node_portland_or_001',
        jurisdiction: 'Portland-OR',
        endpoint: 'https://dao.portland.or.municipal.api',
        status: 'online',
        lastSync: new Date().toISOString(),
        syncLatency: 189
      },
      {
        nodeId: 'node_burlington_vt_001',
        jurisdiction: 'Burlington-VT',
        endpoint: 'https://dao.burlington.vt.municipal.api',
        status: 'syncing',
        lastSync: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        syncLatency: 267
      }
    ];

    nodes.forEach(node => {
      this.federationNodes.set(node.nodeId, node);
    });

    this.updateSyncMetrics();
    console.log('🔗 FederationSyncEngine initialized with', nodes.length, 'municipal nodes');
  }

  private updateSyncMetrics() {
    const nodes = Array.from(this.federationNodes.values());
    
    this.syncMetrics = {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.status === 'online').length,
      syncingNodes: nodes.filter(n => n.status === 'syncing').length,
      averageLatency: Math.round(nodes.reduce((sum, n) => sum + n.syncLatency, 0) / nodes.length),
      successRate: this.calculateSuccessRate(),
      lastSyncTime: new Date().toISOString()
    };
  }

  private calculateSuccessRate(): number {
    if (this.syncHistory.length === 0) return 100;
    
    const recentSyncs = this.syncHistory.slice(-20); // Last 20 sync attempts
    const successful = recentSyncs.filter(sync => sync.success).length;
    return Math.round((successful / recentSyncs.length) * 100);
  }

  public async syncPolicyEntry(policyEntry: PolicyEntry): Promise<boolean> {
    console.log('📡 Queuing policy for federation sync:', policyEntry.title);
    
    // Add to sync queue
    this.syncQueue.push(policyEntry);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processSync();
    }
    
    return true;
  }

  private async processSync() {
    if (this.isProcessing || this.syncQueue.length === 0) return;
    
    this.isProcessing = true;
    console.log('🔄 Processing federation sync queue:', this.syncQueue.length, 'items');

    while (this.syncQueue.length > 0) {
      const policyEntry = this.syncQueue.shift();
      if (!policyEntry) continue;

      await this.syncToAllNodes(policyEntry);
    }

    this.isProcessing = false;
    this.updateSyncMetrics();
  }

  private async syncToAllNodes(policyEntry: PolicyEntry): Promise<void> {
    const syncPromises: Promise<SyncResult>[] = [];
    
    // Sync to all federation nodes
    for (const [nodeId, node] of this.federationNodes) {
      if (node.status === 'online' || node.status === 'syncing') {
        syncPromises.push(this.syncToNode(nodeId, policyEntry));
      }
    }

    const results = await Promise.allSettled(syncPromises);
    
    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
      } else {
        console.warn('❌ Federation sync failed for node:', Array.from(this.federationNodes.keys())[index]);
      }
    });

    // Log sync completion
    const syncRecord = {
      id: `sync_${Date.now()}`,
      policyId: policyEntry.id,
      policyTitle: policyEntry.title,
      timestamp: new Date().toISOString(),
      totalNodes: this.federationNodes.size,
      successfulNodes: successCount,
      success: successCount > 0,
      failureRate: Math.round(((this.federationNodes.size - successCount) / this.federationNodes.size) * 100)
    };

    this.syncHistory.push(syncRecord);
    
    if (successCount > 0) {
      console.log(`✅ Policy synced to ${successCount}/${this.federationNodes.size} federation nodes:`, policyEntry.title);
    } else {
      console.error('❌ Policy sync failed to all federation nodes:', policyEntry.title);
    }
  }

  private async syncToNode(nodeId: string, policyEntry: PolicyEntry): Promise<SyncResult> {
    const startTime = Date.now();
    const node = this.federationNodes.get(nodeId);
    
    if (!node) {
      return {
        success: false,
        nodeId,
        syncTime: 0,
        error: 'Node not found'
      };
    }

    try {
      // Simulate federation sync with realistic delays and success rates
      const syncDelay = 200 + Math.random() * 300; // 200-500ms
      await new Promise(resolve => setTimeout(resolve, syncDelay));
      
      // 95% success rate for online nodes, 80% for syncing nodes
      const successRate = node.status === 'online' ? 0.95 : 0.80;
      const success = Math.random() < successRate;
      
      const syncTime = Date.now() - startTime;
      
      if (success) {
        // Update node status
        node.lastSync = new Date().toISOString();
        node.syncLatency = syncTime;
        node.status = 'online';
        
        console.log(`🔗 Policy synced to ${nodeId} (${syncTime}ms):`, policyEntry.title);
      } else {
        // Mark node as having sync issues
        node.status = 'syncing';
        console.warn(`⚠️ Sync failed to ${nodeId} (${syncTime}ms):`, policyEntry.title);
      }

      return {
        success,
        nodeId,
        syncTime,
        error: success ? undefined : 'Sync operation failed'
      };

    } catch (error) {
      const syncTime = Date.now() - startTime;
      node.status = 'offline';
      
      return {
        success: false,
        nodeId,
        syncTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private startPeriodicSync() {
    // Run periodic sync every 30 seconds
    setInterval(() => {
      if (this.syncQueue.length > 0) {
        this.processSync();
      }
      
      // Periodic health check of federation nodes
      this.performHealthCheck();
    }, 30000);

    console.log('⏰ Periodic federation sync started (30-second intervals)');
  }

  private async performHealthCheck() {
    for (const [nodeId, node] of this.federationNodes) {
      // Simulate health check
      const healthCheckDelay = 50 + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, healthCheckDelay));
      
      // Random health check results with bias toward staying online
      if (node.status === 'offline') {
        // 30% chance to come back online
        if (Math.random() < 0.3) {
          node.status = 'syncing';
          console.log(`🟡 Node ${nodeId} coming back online`);
        }
      } else if (node.status === 'syncing') {
        // 70% chance to become fully online
        if (Math.random() < 0.7) {
          node.status = 'online';
          console.log(`🟢 Node ${nodeId} sync completed`);
        }
      } else if (node.status === 'online') {
        // 5% chance to go into syncing state
        if (Math.random() < 0.05) {
          node.status = 'syncing';
          console.log(`🟡 Node ${nodeId} started sync operation`);
        }
      }
    }

    this.updateSyncMetrics();
  }

  public getFederationNodes(): FederationNode[] {
    return Array.from(this.federationNodes.values());
  }

  public getSyncMetrics(): SyncMetrics {
    return { ...this.syncMetrics };
  }

  public getSyncHistory(): any[] {
    return [...this.syncHistory];
  }

  public getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing
    };
  }

  public async forceSyncAll(): Promise<void> {
    console.log('🔄 Force sync requested for all queued policies');
    
    if (this.syncQueue.length === 0) {
      console.log('📭 No policies in sync queue');
      return;
    }

    await this.processSync();
  }

  public exportSyncLog(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: this.syncMetrics,
      nodes: Array.from(this.federationNodes.values()),
      syncHistory: this.syncHistory,
      queueStatus: this.getQueueStatus()
    };

    return JSON.stringify(exportData, null, 2);
  }
}

export default FederationSyncEngine;