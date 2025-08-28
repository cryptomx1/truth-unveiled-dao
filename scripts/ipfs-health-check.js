#!/usr/bin/env node

/**
 * IPFS Health Check & Gateway Monitoring
 * Truth Unveiled Civic Genome Deployment Verification
 * 
 * Monitors IPFS deployment health and gateway accessibility
 */

import https from 'https';
import { performance } from 'perf_hooks';

const HEALTH_CHECK_CONFIG = {
  DEPLOYMENT_CID: null, // Will be loaded from deployment-result.json
  GATEWAYS: [
    'https://gateway.pinata.cloud',
    'https://ipfs.io',
    'https://cloudflare-ipfs.com',
    'https://dweb.link'
  ],
  TIMEOUT: 10000, // 10 seconds
  RETRY_COUNT: 3
};

class IPFSHealthMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      deployment_status: 'CHECKING',
      gateway_results: [],
      overall_health: 'UNKNOWN'
    };
  }

  async loadDeploymentConfig() {
    try {
      const fs = await import('fs/promises');
      const deploymentResult = JSON.parse(await fs.readFile('deployment-result.json', 'utf8'));
      HEALTH_CHECK_CONFIG.DEPLOYMENT_CID = deploymentResult.cid;
      console.log(`🔍 Monitoring CID: ${HEALTH_CHECK_CONFIG.DEPLOYMENT_CID}`);
      return deploymentResult;
    } catch (error) {
      throw new Error(`Failed to load deployment configuration: ${error.message}`);
    }
  }

  async checkGatewayHealth(gateway, cid) {
    const url = `${gateway}/ipfs/${cid}`;
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          gateway,
          url,
          status: 'TIMEOUT',
          response_time: HEALTH_CHECK_CONFIG.TIMEOUT,
          error: 'Request timeout'
        });
      }, HEALTH_CHECK_CONFIG.TIMEOUT);

      https.get(url, (res) => {
        clearTimeout(timeout);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        resolve({
          gateway,
          url,
          status: res.statusCode === 200 ? 'HEALTHY' : 'DEGRADED',
          response_time: responseTime,
          status_code: res.statusCode,
          headers: {
            'content-type': res.headers['content-type'],
            'cache-control': res.headers['cache-control'],
            'x-ipfs-path': res.headers['x-ipfs-path']
          }
        });
      }).on('error', (error) => {
        clearTimeout(timeout);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        resolve({
          gateway,
          url,
          status: 'ERROR',
          response_time: responseTime,
          error: error.message
        });
      });
    });
  }

  async performHealthCheck() {
    console.log(`\n🔍 IPFS Health Check Initiated`);
    console.log(`📊 Checking ${HEALTH_CHECK_CONFIG.GATEWAYS.length} gateways...`);
    
    const deploymentConfig = await this.loadDeploymentConfig();
    const cid = HEALTH_CHECK_CONFIG.DEPLOYMENT_CID;
    
    // Check all gateways concurrently
    const gatewayPromises = HEALTH_CHECK_CONFIG.GATEWAYS.map(gateway => 
      this.checkGatewayHealth(gateway, cid)
    );
    
    const gatewayResults = await Promise.all(gatewayPromises);
    this.results.gateway_results = gatewayResults;
    
    // Analyze results
    const healthyGateways = gatewayResults.filter(r => r.status === 'HEALTHY').length;
    const totalGateways = gatewayResults.length;
    const healthPercentage = (healthyGateways / totalGateways) * 100;
    
    this.results.deployment_status = 'LIVE';
    this.results.healthy_gateways = healthyGateways;
    this.results.total_gateways = totalGateways;
    this.results.health_percentage = healthPercentage;
    
    // Determine overall health
    if (healthPercentage >= 75) {
      this.results.overall_health = 'HEALTHY';
    } else if (healthPercentage >= 50) {
      this.results.overall_health = 'DEGRADED';
    } else {
      this.results.overall_health = 'CRITICAL';
    }
    
    return this.results;
  }

  generateHealthReport() {
    console.log(`\n📋 IPFS Health Report`);
    console.log(`⏰ Timestamp: ${this.results.timestamp}`);
    console.log(`🆔 CID: ${HEALTH_CHECK_CONFIG.DEPLOYMENT_CID}`);
    console.log(`💚 Healthy Gateways: ${this.results.healthy_gateways}/${this.results.total_gateways}`);
    console.log(`📊 Health Percentage: ${this.results.health_percentage.toFixed(1)}%`);
    console.log(`🎯 Overall Status: ${this.results.overall_health}`);
    
    console.log(`\n🌐 Gateway Details:`);
    this.results.gateway_results.forEach(result => {
      const statusIcon = result.status === 'HEALTHY' ? '✅' : 
                        result.status === 'DEGRADED' ? '⚠️' : 
                        result.status === 'TIMEOUT' ? '⏱️' : '❌';
      
      console.log(`${statusIcon} ${result.gateway}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response Time: ${result.response_time}ms`);
      if (result.status_code) console.log(`   Status Code: ${result.status_code}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      console.log('');
    });
    
    // Recommendations
    if (this.results.overall_health === 'HEALTHY') {
      console.log(`✅ DEPLOYMENT STATUS: OPTIMAL`);
      console.log(`🌍 Truth Unveiled Civic Genome is accessible globally`);
    } else if (this.results.overall_health === 'DEGRADED') {
      console.log(`⚠️  DEPLOYMENT STATUS: DEGRADED`);
      console.log(`🔧 Some gateways experiencing issues - monitoring recommended`);
    } else {
      console.log(`❌ DEPLOYMENT STATUS: CRITICAL`);
      console.log(`🚨 Multiple gateway failures - immediate attention required`);
    }
  }

  async saveHealthReport() {
    try {
      const fs = await import('fs/promises');
      const reportPath = `health-report-${Date.now()}.json`;
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Health report saved: ${reportPath}`);
    } catch (error) {
      console.error(`❌ Failed to save health report: ${error.message}`);
    }
  }
}

// Main health check execution
async function main() {
  try {
    const monitor = new IPFSHealthMonitor();
    await monitor.performHealthCheck();
    monitor.generateHealthReport();
    await monitor.saveHealthReport();
    
    // Exit with appropriate code based on health status
    const exitCode = monitor.results.overall_health === 'HEALTHY' ? 0 : 
                    monitor.results.overall_health === 'DEGRADED' ? 1 : 2;
    process.exit(exitCode);
    
  } catch (error) {
    console.error(`\n❌ HEALTH CHECK FAILED`);
    console.error(`🔥 Error: ${error.message}`);
    process.exit(3);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { IPFSHealthMonitor };