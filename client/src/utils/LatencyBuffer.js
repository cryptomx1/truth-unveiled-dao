// LatencyBuffer.ts - Phase III-A Step 4/6
// Fallback system for WalletSyncProtocol with <150ms emergency response
export class LatencyBuffer {
    buffer;
    maxBufferSize = 100;
    maxAge = 30000; // 30 seconds
    metrics;
    emergencyMode = false;
    constructor() {
        this.buffer = new Map();
        this.metrics = {
            totalEntries: 0,
            hitRate: 0,
            avgResponseTime: 0,
            emergencyActivations: 0
        };
        // Cleanup old entries periodically
        setInterval(() => this.cleanupBuffer(), 10000);
        console.log('🔇 TTS disabled: "LatencyBuffer initialized"');
    }
    async executeFallbackSync(request) {
        const startTime = performance.now();
        try {
            // Check if we have cached data
            const cachedEntry = this.getCachedEntry(request.didId, request.requestType);
            if (cachedEntry) {
                const endTime = performance.now();
                const latency = endTime - startTime;
                this.updateHitRate(true);
                this.updateResponseTime(latency);
                return {
                    success: true,
                    latency,
                    fallbackUsed: true
                };
            }
            // Execute emergency sync with minimal latency
            const syncResult = await this.executeEmergencySync(request);
            const endTime = performance.now();
            const latency = endTime - startTime;
            // Cache the result
            this.cacheResult(request.didId, request.requestType, syncResult.data);
            this.updateHitRate(false);
            this.updateResponseTime(latency);
            this.metrics.emergencyActivations++;
            if (latency > 150) {
                console.log(`⚠️ LatencyBuffer: Emergency sync exceeded 150ms target (${latency.toFixed(2)}ms)`);
            }
            return {
                success: syncResult.success,
                latency,
                fallbackUsed: true
            };
        }
        catch (error) {
            console.error('LatencyBuffer fallback error:', error);
            const endTime = performance.now();
            return {
                success: false,
                latency: endTime - startTime,
                fallbackUsed: true
            };
        }
    }
    async executeEmergencySync(request) {
        // Simulate ultra-fast emergency sync (target <100ms)
        const emergencyLatency = Math.random() * 80 + 20; // 20-100ms
        await new Promise(resolve => setTimeout(resolve, emergencyLatency));
        // Generate minimal response data based on request type
        const responseData = this.generateMinimalResponse(request);
        return {
            success: Math.random() > 0.02, // 98% success rate for emergency
            data: responseData
        };
    }
    generateMinimalResponse(request) {
        const baseResponse = {
            didId: request.didId,
            timestamp: new Date(),
            fallbackMode: true
        };
        switch (request.requestType) {
            case 'balance':
                return {
                    ...baseResponse,
                    balances: {
                        TP: Math.floor(Math.random() * 1000) + 100,
                        CC: Math.floor(Math.random() * 500) + 50,
                        CIV: Math.floor(Math.random() * 100) + 10
                    }
                };
            case 'transaction':
                return {
                    ...baseResponse,
                    recentTransactions: [
                        {
                            id: `tx_${Date.now()}`,
                            type: 'receive',
                            amount: Math.floor(Math.random() * 100),
                            token: 'TP',
                            status: 'confirmed'
                        }
                    ]
                };
            case 'full':
                return {
                    ...baseResponse,
                    balances: {
                        TP: Math.floor(Math.random() * 1000) + 100,
                        CC: Math.floor(Math.random() * 500) + 50,
                        CIV: Math.floor(Math.random() * 100) + 10
                    },
                    recentTransactions: [],
                    metadata: {
                        lastSync: new Date(),
                        syncType: 'emergency_fallback'
                    }
                };
            case 'emergency':
                return {
                    ...baseResponse,
                    status: 'emergency_sync_complete',
                    criticalData: {
                        connectionStatus: 'fallback_active',
                        urgentBalance: Math.floor(Math.random() * 100)
                    }
                };
            default:
                return baseResponse;
        }
    }
    getCachedEntry(didId, requestType) {
        const cacheKey = `${didId}_${requestType}`;
        const entry = this.buffer.get(cacheKey);
        if (!entry)
            return null;
        // Check if entry is still valid
        const age = Date.now() - entry.timestamp.getTime();
        if (age > this.maxAge) {
            this.buffer.delete(cacheKey);
            return null;
        }
        return entry;
    }
    cacheResult(didId, requestType, data) {
        const cacheKey = `${didId}_${requestType}`;
        // Remove oldest entries if buffer is full
        if (this.buffer.size >= this.maxBufferSize) {
            const oldestKey = Array.from(this.buffer.keys())[0];
            this.buffer.delete(oldestKey);
        }
        const entry = {
            didId,
            data,
            timestamp: new Date(),
            priority: 'normal',
            syncType: requestType
        };
        this.buffer.set(cacheKey, entry);
        this.metrics.totalEntries++;
    }
    cleanupBuffer() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.buffer.entries()) {
            const age = now - entry.timestamp.getTime();
            if (age > this.maxAge) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.buffer.delete(key));
        if (keysToDelete.length > 0) {
            console.log(`LatencyBuffer: Cleaned up ${keysToDelete.length} expired entries`);
        }
    }
    updateHitRate(wasHit) {
        const totalRequests = this.metrics.totalEntries;
        const currentHits = (this.metrics.hitRate / 100) * totalRequests;
        const newHits = currentHits + (wasHit ? 1 : 0);
        this.metrics.hitRate = (newHits / (totalRequests + 1)) * 100;
    }
    updateResponseTime(latency) {
        // Exponential moving average
        const alpha = 0.1;
        this.metrics.avgResponseTime = (1 - alpha) * this.metrics.avgResponseTime + alpha * latency;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getBufferStatus() {
        const entries = Array.from(this.buffer.values());
        const oldestEntry = entries.length > 0
            ? entries.reduce((oldest, entry) => entry.timestamp < oldest ? entry.timestamp : oldest, entries[0].timestamp)
            : null;
        return {
            size: this.buffer.size,
            utilizationPercent: (this.buffer.size / this.maxBufferSize) * 100,
            oldestEntry
        };
    }
    clearBuffer() {
        this.buffer.clear();
        console.log('LatencyBuffer: Buffer cleared');
    }
    setEmergencyMode(enabled) {
        this.emergencyMode = enabled;
        if (enabled) {
            this.maxAge = 60000; // Extend cache age in emergency mode
            console.log('LatencyBuffer: Emergency mode activated');
        }
        else {
            this.maxAge = 30000; // Normal cache age
            console.log('LatencyBuffer: Emergency mode deactivated');
        }
    }
    isEmergencyMode() {
        return this.emergencyMode;
    }
    getBufferEntries() {
        return Array.from(this.buffer.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    preloadDIDCache(didId, data) {
        const requestTypes = ['balance', 'transaction', 'full'];
        requestTypes.forEach(type => {
            this.cacheResult(didId, type, {
                ...data,
                preloaded: true,
                syncType: type
            });
        });
        console.log(`LatencyBuffer: Preloaded cache for DID ${didId}`);
    }
    async warmupCache(didIds) {
        const warmupStart = performance.now();
        for (const didId of didIds) {
            const mockData = this.generateMinimalResponse({
                didId,
                requestType: 'full',
                priority: 'normal'
            });
            this.preloadDIDCache(didId, mockData);
        }
        const warmupEnd = performance.now();
        const warmupTime = warmupEnd - warmupStart;
        console.log(`LatencyBuffer: Cache warmup completed in ${warmupTime.toFixed(2)}ms for ${didIds.length} DIDs`);
    }
}
export default LatencyBuffer;
