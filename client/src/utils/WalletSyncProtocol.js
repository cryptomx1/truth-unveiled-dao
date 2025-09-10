// WalletSyncProtocol.ts - Phase III-A Step 4/6
// DID-based latency throttle system with LatencyBuffer.ts fallback (<500ms full sync)
import { LatencyBuffer } from './LatencyBuffer';
export class WalletSyncProtocol {
    latencyBuffer;
    activeSyncs;
    syncMetrics;
    maxConcurrentSyncs = 10;
    throttleThreshold = 300; // ms
    emergencyThreshold = 500; // ms
    constructor() {
        this.latencyBuffer = new LatencyBuffer();
        this.activeSyncs = new Map();
        this.syncMetrics = {
            totalSyncs: 0,
            avgLatency: 0,
            successRate: 100,
            throttledConnections: 0,
            emergencyFallbacks: 0
        };
        console.log('🔇 TTS disabled: "WalletSyncProtocol initialized"');
    }
    async syncWallet(request) {
        const startTime = performance.now();
        try {
            // Check if DID is already being synced
            const existingSync = this.activeSyncs.get(request.didId);
            if (existingSync && this.shouldThrottle(existingSync)) {
                return this.handleThrottledRequest(request, startTime);
            }
            // Initialize or update DID sync status
            const didStatus = existingSync || {
                didId: request.didId,
                lastSync: new Date(),
                syncLatency: 0,
                failureCount: 0,
                throttleLevel: 'normal'
            };
            // Determine sync method based on throttle level and priority
            const syncResult = await this.performSync(request, didStatus);
            // Update sync status
            didStatus.lastSync = new Date();
            didStatus.syncLatency = syncResult.latency;
            didStatus.throttleLevel = this.calculateThrottleLevel(syncResult.latency);
            if (!syncResult.success) {
                didStatus.failureCount++;
            }
            else {
                didStatus.failureCount = Math.max(0, didStatus.failureCount - 1);
            }
            this.activeSyncs.set(request.didId, didStatus);
            this.updateMetrics(syncResult);
            const endTime = performance.now();
            const totalLatency = endTime - startTime;
            if (totalLatency > 500) {
                console.log(`⚠️ WalletSyncProtocol: Full sync exceeded 500ms target (${totalLatency.toFixed(2)}ms)`);
            }
            return {
                success: syncResult.success,
                latency: totalLatency,
                fallbackUsed: syncResult.fallbackUsed
            };
        }
        catch (error) {
            console.error('WalletSyncProtocol error:', error);
            return this.handleEmergencyFallback(request, startTime);
        }
    }
    async performSync(request, didStatus) {
        const syncStart = performance.now();
        // Simulate different sync types with varying latencies
        let baseLatency = 150;
        switch (request.requestType) {
            case 'balance':
                baseLatency = 100;
                break;
            case 'transaction':
                baseLatency = 200;
                break;
            case 'full':
                baseLatency = 350;
                break;
            case 'emergency':
                baseLatency = 50;
                break;
        }
        // Apply throttle level adjustments
        let throttleMultiplier = 1;
        switch (didStatus.throttleLevel) {
            case 'reduced':
                throttleMultiplier = 1.5;
                break;
            case 'minimal':
                throttleMultiplier = 2;
                break;
            case 'emergency':
                throttleMultiplier = 3;
                break;
        }
        const estimatedLatency = baseLatency * throttleMultiplier;
        // Check if we need to use fallback
        if (estimatedLatency > this.emergencyThreshold || didStatus.failureCount > 3) {
            return this.latencyBuffer.executeFallbackSync(request);
        }
        // Simulate network sync with realistic latency
        await new Promise(resolve => setTimeout(resolve, Math.min(estimatedLatency, 400)));
        const syncEnd = performance.now();
        const actualLatency = syncEnd - syncStart;
        // Simulate occasional failures (5% rate)
        const success = Math.random() > 0.05;
        return {
            success,
            latency: actualLatency,
            fallbackUsed: false
        };
    }
    shouldThrottle(didStatus) {
        const timeSinceLastSync = Date.now() - didStatus.lastSync.getTime();
        const minInterval = this.getMinSyncInterval(didStatus.throttleLevel);
        return timeSinceLastSync < minInterval;
    }
    getMinSyncInterval(throttleLevel) {
        switch (throttleLevel) {
            case 'normal': return 1000; // 1 second
            case 'reduced': return 2000; // 2 seconds
            case 'minimal': return 5000; // 5 seconds
            case 'emergency': return 10000; // 10 seconds
            default: return 1000;
        }
    }
    calculateThrottleLevel(latency) {
        if (latency > 400)
            return 'emergency';
        if (latency > 300)
            return 'minimal';
        if (latency > 200)
            return 'reduced';
        return 'normal';
    }
    async handleThrottledRequest(request, startTime) {
        this.syncMetrics.throttledConnections++;
        // For high priority requests, use emergency fallback
        if (request.priority === 'critical' || request.priority === 'high') {
            return this.handleEmergencyFallback(request, startTime);
        }
        // Otherwise, return cached/throttled response
        const endTime = performance.now();
        return {
            success: true,
            latency: endTime - startTime,
            fallbackUsed: false
        };
    }
    async handleEmergencyFallback(request, startTime) {
        this.syncMetrics.emergencyFallbacks++;
        try {
            const fallbackResult = await this.latencyBuffer.executeFallbackSync(request);
            const endTime = performance.now();
            return {
                success: fallbackResult.success,
                latency: endTime - startTime,
                fallbackUsed: true
            };
        }
        catch (error) {
            console.error('Emergency fallback failed:', error);
            const endTime = performance.now();
            return {
                success: false,
                latency: endTime - startTime,
                fallbackUsed: true
            };
        }
    }
    updateMetrics(syncResult) {
        this.syncMetrics.totalSyncs++;
        // Update average latency (exponential moving average)
        const alpha = 0.1;
        this.syncMetrics.avgLatency = (1 - alpha) * this.syncMetrics.avgLatency + alpha * syncResult.latency;
        // Update success rate
        const successCount = Math.floor(this.syncMetrics.successRate * (this.syncMetrics.totalSyncs - 1) / 100);
        const newSuccessCount = successCount + (syncResult.success ? 1 : 0);
        this.syncMetrics.successRate = (newSuccessCount / this.syncMetrics.totalSyncs) * 100;
        if (syncResult.fallbackUsed) {
            this.syncMetrics.emergencyFallbacks++;
        }
    }
    getActiveSyncs() {
        return Array.from(this.activeSyncs.values());
    }
    getMetrics() {
        return { ...this.syncMetrics };
    }
    getDIDStatus(didId) {
        return this.activeSyncs.get(didId) || null;
    }
    clearThrottle(didId) {
        const didStatus = this.activeSyncs.get(didId);
        if (didStatus) {
            didStatus.throttleLevel = 'normal';
            didStatus.failureCount = 0;
            this.activeSyncs.set(didId, didStatus);
            return true;
        }
        return false;
    }
    getThrottledConnections() {
        return Array.from(this.activeSyncs.values())
            .filter(status => status.throttleLevel !== 'normal').length;
    }
    async batchSync(requests) {
        const batchStart = performance.now();
        const maxBatchSize = 5;
        // Process requests in batches to avoid overwhelming the system
        const batches = [];
        for (let i = 0; i < requests.length; i += maxBatchSize) {
            batches.push(requests.slice(i, i + maxBatchSize));
        }
        const allResults = [];
        for (const batch of batches) {
            const batchPromises = batch.map(request => this.syncWallet(request));
            const batchResults = await Promise.all(batchPromises);
            allResults.push(...batchResults);
        }
        const batchEnd = performance.now();
        const totalLatency = batchEnd - batchStart;
        const avgLatency = totalLatency / requests.length;
        const overallSuccess = allResults.every(result => result.success);
        return {
            success: overallSuccess,
            results: allResults,
            avgLatency
        };
    }
}
export default WalletSyncProtocol;
