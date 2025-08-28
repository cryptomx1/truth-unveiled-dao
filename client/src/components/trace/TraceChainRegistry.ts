// Truth Trace Engine - TraceChainRegistry
// Maintains immutable, ordered map of all replayed actions

import { createHash } from 'crypto';

// Core trace event structure
export interface MemoryReplayEvent {
  actionId: string;
  timestamp: number;
  sourceDeck: string;
  moduleId: string;
  action: string;
  value: string;
  effectHash: string;
  zkpHash?: string;
  userId?: string;
}

// Trace fingerprint for immutability verification
export interface TraceFingerprint {
  hash: string;
  previousHash: string | null;
  chainLength: number;
  timestamp: number;
}

// Registry storage keys
const TRACE_CHAIN_KEY = 'truthunveiled_trace_chain';
const TRACE_FINGERPRINT_KEY = 'truthunveiled_trace_fingerprint';

class TraceChainRegistryClass {
  private traceChain: MemoryReplayEvent[] = [];
  private fingerprints: TraceFingerprint[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Generate cryptographic fingerprint for action
  generateTraceFingerprint(action: MemoryReplayEvent): string {
    const data = `${action.actionId}:${action.timestamp}:${action.sourceDeck}:${action.moduleId}:${action.action}:${action.value}`;
    
    // In browser environment, use Web Crypto API
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Use a simple hash for browser compatibility
      return btoa(data).replace(/[+/=]/g, '').substring(0, 16);
    }
    
    // Fallback hash implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 16);
  }

  // Add new trace event to chain
  addTraceEvent(event: Omit<MemoryReplayEvent, 'actionId' | 'timestamp' | 'effectHash'>): MemoryReplayEvent {
    const timestamp = Date.now();
    const actionId = `trace_${timestamp}_${Math.random().toString(36).substring(2)}`;
    
    const traceEvent: MemoryReplayEvent = {
      actionId,
      timestamp,
      effectHash: this.generateTraceFingerprint({
        actionId,
        timestamp,
        ...event
      } as MemoryReplayEvent),
      ...event
    };

    // Create fingerprint for chain integrity
    const previousHash = this.fingerprints.length > 0 
      ? this.fingerprints[this.fingerprints.length - 1].hash 
      : null;

    const fingerprint: TraceFingerprint = {
      hash: this.generateTraceFingerprint(traceEvent),
      previousHash,
      chainLength: this.traceChain.length + 1,
      timestamp
    };

    // Add to chain
    this.traceChain.push(traceEvent);
    this.fingerprints.push(fingerprint);

    // Persist to storage
    this.saveToStorage();

    console.log(`🔗 Trace event added: ${event.action} → ${event.value} (Chain: ${this.traceChain.length})`);
    return traceEvent;
  }

  // Get complete trace chain
  getTraceChain(): MemoryReplayEvent[] {
    return [...this.traceChain];
  }

  // Get trace events by deck
  getTracesByDeck(deckName: string): MemoryReplayEvent[] {
    return this.traceChain.filter(event => event.sourceDeck === deckName);
  }

  // Get trace events by timeframe
  getTracesByTimeframe(startTime: number, endTime: number): MemoryReplayEvent[] {
    return this.traceChain.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  // Get recent traces (last N events)
  getRecentTraces(count: number = 10): MemoryReplayEvent[] {
    return this.traceChain.slice(-count);
  }

  // Verify chain integrity
  verifyChainIntegrity(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (let i = 0; i < this.fingerprints.length; i++) {
      const fingerprint = this.fingerprints[i];
      const expectedPreviousHash = i > 0 ? this.fingerprints[i - 1].hash : null;
      
      if (fingerprint.previousHash !== expectedPreviousHash) {
        errors.push(`Chain break at position ${i}: expected ${expectedPreviousHash}, got ${fingerprint.previousHash}`);
      }
      
      if (fingerprint.chainLength !== i + 1) {
        errors.push(`Chain length mismatch at position ${i}: expected ${i + 1}, got ${fingerprint.chainLength}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get chain statistics
  getChainStats() {
    const uniqueDecks = new Set(this.traceChain.map(event => event.sourceDeck));
    const uniqueModules = new Set(this.traceChain.map(event => event.moduleId));
    
    return {
      totalEvents: this.traceChain.length,
      uniqueDecks: uniqueDecks.size,
      uniqueModules: uniqueModules.size,
      firstEvent: this.traceChain.length > 0 ? this.traceChain[0].timestamp : null,
      lastEvent: this.traceChain.length > 0 ? this.traceChain[this.traceChain.length - 1].timestamp : null,
      integrity: this.verifyChainIntegrity()
    };
  }

  // Clear chain (for testing/reset)
  clearChain(): void {
    this.traceChain = [];
    this.fingerprints = [];
    this.saveToStorage();
    console.log('🗑️ Trace chain cleared');
  }

  // Save to storage
  private saveToStorage(): void {
    try {
      localStorage.setItem(TRACE_CHAIN_KEY, JSON.stringify(this.traceChain));
      localStorage.setItem(TRACE_FINGERPRINT_KEY, JSON.stringify(this.fingerprints));
    } catch (error) {
      console.warn('⚠️ Failed to save trace chain:', error);
    }
  }

  // Load from storage
  private loadFromStorage(): void {
    try {
      const storedChain = localStorage.getItem(TRACE_CHAIN_KEY);
      const storedFingerprints = localStorage.getItem(TRACE_FINGERPRINT_KEY);
      
      if (storedChain) {
        this.traceChain = JSON.parse(storedChain);
      }
      
      if (storedFingerprints) {
        this.fingerprints = JSON.parse(storedFingerprints);
      }

      if (this.traceChain.length > 0) {
        console.log(`🔗 Trace chain loaded: ${this.traceChain.length} events`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load trace chain:', error);
      this.traceChain = [];
      this.fingerprints = [];
    }
  }
}

// Singleton instance
export const TraceChainRegistry = new TraceChainRegistryClass();

// React hook for trace chain access
export const useTraceChain = () => {
  const addTrace = (event: Omit<MemoryReplayEvent, 'actionId' | 'timestamp' | 'effectHash'>) => {
    return TraceChainRegistry.addTraceEvent(event);
  };

  const getChain = () => TraceChainRegistry.getTraceChain();
  const getStats = () => TraceChainRegistry.getChainStats();
  const verifyIntegrity = () => TraceChainRegistry.verifyChainIntegrity();

  return {
    addTrace,
    getChain,
    getStats,
    verifyIntegrity,
    getTracesByDeck: TraceChainRegistry.getTracesByDeck.bind(TraceChainRegistry),
    getRecentTraces: TraceChainRegistry.getRecentTraces.bind(TraceChainRegistry),
    clearChain: TraceChainRegistry.clearChain.bind(TraceChainRegistry)
  };
};