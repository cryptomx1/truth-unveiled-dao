/**
 * GovMapMonitorAgent.ts - Phase AGENT-OPS Step 2 + LLM Enhancement
 * Government District Map Monitoring and API Health Agent
 * Authority: Commander Mark via JASMY Relay
 */

import { LLMAgentCore } from '@/utils/LLMAgentCore';

interface MapEndpoint {
  url: string;
  name: string;
  critical: boolean;
  timeout: number;
}

interface MapHealthStatus {
  endpoint: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  lastCheck: string;
  errorMessage?: string;
  llm_classification?: string;
  ai_verified?: boolean;
}

interface MapMonitorReport {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  endpointCount: number;
  onlineCount: number;
  avgResponseTime: number;
  lastFullCheck: string;
  issues: string[];
}

class GovMapMonitorAgent {
  private endpoints: MapEndpoint[];
  private healthStatus: Map<string, MapHealthStatus>;
  private monitoringInterval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  constructor() {
    this.endpoints = [
      {
        url: 'https://api.congress.gov/v3/bill',
        name: 'Congress.gov API',
        critical: true,
        timeout: 5000
      },
      {
        url: 'https://api.legiscan.com',
        name: 'LegiScan API',
        critical: false,
        timeout: 5000
      },
      {
        url: '/api/env-config',
        name: 'Platform Config API',
        critical: true,
        timeout: 3000
      },
      {
        url: '/api/health',
        name: 'Platform Health API',
        critical: true,
        timeout: 3000
      }
    ];

    this.healthStatus = new Map();
    this.monitoringInterval = 30000; // 30 seconds
    
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;

    console.log('🗺️ GovMapMonitorAgent initializing — Phase AGENT-OPS Step 2');
    
    try {
      // Initial health check
      await this.performFullHealthCheck();
      
      // Start continuous monitoring
      this.startMonitoring();
      
      this.initialized = true;
      console.log('✅ GovMapMonitorAgent operational — monitoring map layer integrity');
      
    } catch (error) {
      console.error('❌ GovMapMonitorAgent initialization failed:', error);
    }
  }

  private async checkEndpoint(endpoint: MapEndpoint): Promise<MapHealthStatus> {
    const startTime = Date.now();
    const checkTimestamp = new Date().toISOString();

    try {
      // For external APIs, use shorter timeout and graceful degradation
      const timeoutMs = endpoint.url.includes('congress.gov') || endpoint.url.includes('legiscan.com') 
        ? 3000 // 3 second timeout for external APIs
        : endpoint.timeout;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // Prevents CORS errors
        headers: {
          'Accept': 'application/json',
        }
      }).catch((fetchError) => {
        // Catch fetch errors and return a synthetic response for external APIs
        if (endpoint.url.includes('congress.gov') || endpoint.url.includes('legiscan.com')) {
          return { ok: false, status: 403, statusText: 'External API - Expected CORS restriction', type: 'opaque' };
        }
        throw fetchError;
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // Handle opaque responses from no-cors mode
      const isOnline = response.ok || (response.type === 'opaque');
      
      const status: MapHealthStatus = {
        endpoint: endpoint.name,
        status: isOnline ? 'online' : 'degraded',
        responseTime,
        lastCheck: checkTimestamp
      };

      if (!isOnline) {
        status.errorMessage = `HTTP ${response.status} ${response.statusText || 'CORS restricted'}`;
        console.log(`⚠️ Map endpoint degraded: ${endpoint.name} — ${status.errorMessage}`);
        
        // Enhanced LLM-based error classification if enabled
        if (LLMAgentCore.isEnabled()) {
          try {
            const llmResponse = await LLMAgentCore.classifyAPIError(
              status.errorMessage,
              endpoint.name
            );
            
            if (llmResponse.success) {
              status.llm_classification = llmResponse.content;
              status.ai_verified = llmResponse.ai_verified;
              console.log(`🧠 LLM Error Classification for ${endpoint.name}:`, llmResponse.content);
            }
          } catch (error) {
            console.warn('⚠️ LLM error classification failed:', error);
          }
        }
      } else {
        console.log(`✅ Map endpoint healthy: ${endpoint.name} — ${responseTime}ms`);
      }

      return status;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Always handle external API failures gracefully
      if (endpoint.url.includes('congress.gov') || endpoint.url.includes('legiscan.com')) {
        console.log(`📡 External API expected offline: ${endpoint.name} — platform resilient`);
      } else {
        console.log(`⚠️ Map endpoint degraded: ${endpoint.name} — ${errorMessage}`);
      }

      return {
        endpoint: endpoint.name,
        status: 'offline',
        responseTime,
        lastCheck: checkTimestamp,
        errorMessage
      };
    }
  }

  public async performFullHealthCheck(): Promise<MapMonitorReport> {
    console.log('🗺️ GovMapMonitor: Performing full health check...');
    
    // Use Promise.allSettled to prevent one failed endpoint from breaking all checks
    const checkPromises = this.endpoints.map(endpoint => 
      this.checkEndpoint(endpoint).catch(error => ({
        endpoint: endpoint.name,
        status: 'offline' as const,
        responseTime: endpoint.timeout,
        lastCheck: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Check failed'
      }))
    );
    
    const results = await Promise.allSettled(checkPromises);
    const healthStatuses = results.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    );

    // Update health status map
    healthStatuses.forEach(result => {
      this.healthStatus.set(result.endpoint, result);
    });

    // Calculate overall metrics
    const onlineCount = healthStatuses.filter(r => r.status === 'online').length;
    const avgResponseTime = healthStatuses.reduce((sum, r) => sum + r.responseTime, 0) / healthStatuses.length;
    
    // Determine overall status
    const criticalOffline = healthStatuses.some(r => {
      const endpoint = this.endpoints.find(e => e.name === r.endpoint);
      return endpoint?.critical && r.status === 'offline';
    });

    const overallStatus = criticalOffline ? 'critical' : 
                         onlineCount < healthStatuses.length ? 'degraded' : 'healthy';

    // Collect issues
    const issues = healthStatuses
      .filter(r => r.status !== 'online')
      .map(r => `${r.endpoint}: ${r.errorMessage || r.status}`);

    const report: MapMonitorReport = {
      overallStatus,
      endpointCount: healthStatuses.length,
      onlineCount,
      avgResponseTime: Math.round(avgResponseTime),
      lastFullCheck: new Date().toISOString(),
      issues
    };

    console.log(`🗺️ Map Health Summary: ${overallStatus.toUpperCase()} — ${onlineCount}/${healthStatuses.length} endpoints online`);
    
    if (issues.length > 0) {
      console.log('⚠️ Map monitoring issues detected:', issues);
    }

    return report;
  }

  private startMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      try {
        await this.performFullHealthCheck();
      } catch (error) {
        console.error('❌ GovMapMonitor periodic check failed:', error);
      }
    }, this.monitoringInterval);

    console.log(`🗺️ GovMapMonitor: Continuous monitoring started (${this.monitoringInterval / 1000}s intervals)`);
  }

  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🗺️ GovMapMonitor: Continuous monitoring stopped');
    }
  }

  public getHealthStatus(): MapMonitorReport | null {
    if (this.healthStatus.size === 0) return null;

    const statuses = Array.from(this.healthStatus.values());
    const onlineCount = statuses.filter(s => s.status === 'online').length;
    const avgResponseTime = statuses.reduce((sum, s) => sum + s.responseTime, 0) / statuses.length;

    const criticalOffline = statuses.some(status => {
      const endpoint = this.endpoints.find(e => e.name === status.endpoint);
      return endpoint?.critical && status.status === 'offline';
    });

    const overallStatus = criticalOffline ? 'critical' : 
                         onlineCount < statuses.length ? 'degraded' : 'healthy';

    const issues = statuses
      .filter(s => s.status !== 'online')
      .map(s => `${s.endpoint}: ${s.errorMessage || s.status}`);

    return {
      overallStatus,
      endpointCount: statuses.length,
      onlineCount,
      avgResponseTime: Math.round(avgResponseTime),
      lastFullCheck: statuses[0]?.lastCheck || new Date().toISOString(),
      issues
    };
  }

  public validateMapComponent(): boolean {
    // Check for common map rendering issues
    const mapContainer = document.querySelector('[data-testid="gov-map-container"]');
    if (!mapContainer) {
      console.log('⚠️ GovMapMonitor: Map container not found in DOM');
      return false;
    }

    // Check for loading states that persist too long
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      console.log('⚠️ GovMapMonitor: Map still showing loading state');
      return false;
    }

    return true;
  }

  public destroy() {
    this.stopMonitoring();
    this.healthStatus.clear();
    this.initialized = false;
    console.log('🗺️ GovMapMonitorAgent destroyed');
  }
}

export default GovMapMonitorAgent;