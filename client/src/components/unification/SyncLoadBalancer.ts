// SyncLoadBalancer.ts - Phase III-A Step 6/6 Utility
// Load balancing for UnificationOrchestrator sync operations

interface LoadMetrics {
  currentLoad: number;
  averageLoad: number;
  peakLoad: number;
  loadHistory: number[];
  lastUpdate: Date;
}

interface SyncRequest {
  id: string;
  moduleId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: Date;
  estimatedLoad: number;
}

export class SyncLoadBalancer {
  private metrics: LoadMetrics;
  private requestQueue: SyncRequest[] = [];
  private processingQueue: SyncRequest[] = [];
  private maxConcurrentRequests: number = 8;
  private loadThreshold: number = 15; // 15% threshold from spec
  private loadHistorySize: number = 50;

  constructor() {
    this.metrics = {
      currentLoad: 0,
      averageLoad: 0,
      peakLoad: 0,
      loadHistory: [],
      lastUpdate: new Date()
    };

    // Start load monitoring
    this.startLoadMonitoring();
  }

  private startLoadMonitoring(): void {
    setInterval(() => {
      this.updateLoadMetrics();
    }, 1000);
  }

  private updateLoadMetrics(): void {
    const now = new Date();
    const currentLoad = this.calculateCurrentLoad();
    
    // Update metrics
    this.metrics.currentLoad = currentLoad;
    this.metrics.peakLoad = Math.max(this.metrics.peakLoad, currentLoad);
    this.metrics.loadHistory.push(currentLoad);
    this.metrics.lastUpdate = now;

    // Keep history within size limit
    if (this.metrics.loadHistory.length > this.loadHistorySize) {
      this.metrics.loadHistory.shift();
    }

    // Calculate average load
    this.metrics.averageLoad = this.metrics.loadHistory.reduce((sum, load) => sum + load, 0) / this.metrics.loadHistory.length;

    // Check if load balancing is needed
    if (currentLoad > this.loadThreshold) {
      this.activateLoadBalancing();
    }
  }

  private calculateCurrentLoad(): number {
    const processingLoad = this.processingQueue.length;
    const queueLoad = this.requestQueue.length * 0.1; // Queued requests have minimal load
    const baseLoad = Math.random() * 5; // Simulate base system load

    return Math.min(100, (processingLoad / this.maxConcurrentRequests) * 100 + queueLoad + baseLoad);
  }

  private activateLoadBalancing(): void {
    // Prioritize high-priority requests
    this.requestQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Throttle low-priority requests
    this.requestQueue = this.requestQueue.filter(request => {
      if (request.priority === 'low' && this.metrics.currentLoad > 20) {
        return false;
      }
      return true;
    });

    console.log(`Load balancing activated: ${this.metrics.currentLoad.toFixed(1)}% load`);
  }

  public queueSyncRequest(moduleId: string, priority: SyncRequest['priority'] = 'normal'): string {
    const request: SyncRequest = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      moduleId,
      priority,
      timestamp: new Date(),
      estimatedLoad: this.estimateRequestLoad(moduleId)
    };

    this.requestQueue.push(request);
    this.processQueue();
    
    return request.id;
  }

  private estimateRequestLoad(moduleId: string): number {
    // Estimate load based on module type
    if (moduleId.includes('pillar')) return 2;
    if (moduleId.includes('truth')) return 3;
    if (moduleId.includes('wallet')) return 4;
    if (moduleId.includes('overlay')) return 2;
    return 2;
  }

  private processQueue(): void {
    while (this.processingQueue.length < this.maxConcurrentRequests && this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        this.processingQueue.push(request);
        this.processRequest(request);
      }
    }
  }

  private async processRequest(request: SyncRequest): Promise<void> {
    // Simulate processing time based on priority
    const processingTime = {
      critical: 100,
      high: 200,
      normal: 300,
      low: 500
    }[request.priority];

    await new Promise(resolve => setTimeout(resolve, processingTime + Math.random() * 200));

    // Remove from processing queue
    this.processingQueue = this.processingQueue.filter(r => r.id !== request.id);
    
    // Process next request
    this.processQueue();
  }

  public getCurrentLoad(): number {
    return this.metrics.currentLoad;
  }

  public getLoadMetrics(): LoadMetrics {
    return { ...this.metrics };
  }

  public isLoadBalancingActive(): boolean {
    return this.metrics.currentLoad > this.loadThreshold;
  }

  public getQueueLength(): number {
    return this.requestQueue.length;
  }

  public getProcessingCount(): number {
    return this.processingQueue.length;
  }

  public reset(): void {
    this.requestQueue = [];
    this.processingQueue = [];
    this.metrics = {
      currentLoad: 0,
      averageLoad: 0,
      peakLoad: 0,
      loadHistory: [],
      lastUpdate: new Date()
    };
  }
}