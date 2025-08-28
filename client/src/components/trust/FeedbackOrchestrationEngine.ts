/**
 * FeedbackOrchestrationEngine.ts
 * Phase X-D Step 3: Real-time trust feedback orchestration system
 * Commander Mark authorization via JASMY Relay
 */

import TrustFeedbackEngine, { TrustLogEntry, TrustFeedbackPayload } from './TrustFeedbackEngine';
import TrustSentimentAggregator from './TrustSentimentAggregator';

export interface OrchestrationConfig {
  rateLimitWindow: number; // milliseconds
  maxSubmissionsPerWindow: number;
  zkpEnforcementEnabled: boolean;
  writeConsistencyChecks: boolean;
  throttlingEnabled: boolean;
}

export interface SubmissionThrottle {
  userId: string;
  lastSubmissionTime: number;
  submissionCount: number;
  windowStart: number;
}

export interface OrchestrationMetrics {
  totalProcessed: number;
  rateLimitViolations: number;
  zkpValidationFailures: number;
  writeInconsistencies: number;
  averageProcessingTime: number;
  lastProcessedTimestamp: string;
}

export class FeedbackOrchestrationEngine {
  private static instance: FeedbackOrchestrationEngine;
  private config: OrchestrationConfig;
  private throttleMap: Map<string, SubmissionThrottle> = new Map();
  private metrics: OrchestrationMetrics;
  private isProcessing: boolean = false;
  private processingQueue: TrustFeedbackPayload[] = [];

  public static getInstance(): FeedbackOrchestrationEngine {
    if (!FeedbackOrchestrationEngine.instance) {
      FeedbackOrchestrationEngine.instance = new FeedbackOrchestrationEngine();
    }
    return FeedbackOrchestrationEngine.instance;
  }

  private constructor() {
    this.config = {
      rateLimitWindow: 2 * 60 * 60 * 1000, // 2 hours
      maxSubmissionsPerWindow: 1, // 1 delta per user per 2h
      zkpEnforcementEnabled: true,
      writeConsistencyChecks: true,
      throttlingEnabled: true
    };

    this.metrics = {
      totalProcessed: 0,
      rateLimitViolations: 0,
      zkpValidationFailures: 0,
      writeInconsistencies: 0,
      averageProcessingTime: 0,
      lastProcessedTimestamp: new Date().toISOString()
    };

    this.loadPersistedThrottleData();
    this.startOrchestrationProcessor();
    console.log('🔄 FeedbackOrchestrationEngine initialized - Real-time trust delta coordination ready');
  }

  public async orchestrateFeedbackSubmission(payload: TrustFeedbackPayload): Promise<{
    success: boolean;
    processedEntry?: TrustLogEntry;
    error?: string;
    rateLimitInfo?: {
      isLimited: boolean;
      resetTime: number;
      remainingSubmissions: number;
    };
  }> {
    const startTime = performance.now();
    
    try {
      // Phase 1: Rate limiting check
      const rateLimitResult = this.checkRateLimit(payload.submitter.anonymousId);
      if (rateLimitResult.isLimited) {
        this.metrics.rateLimitViolations++;
        return {
          success: false,
          error: 'Rate limit exceeded. 1 submission per 2 hours allowed.',
          rateLimitInfo: rateLimitResult
        };
      }

      // Phase 2: ZKP integrity validation
      if (this.config.zkpEnforcementEnabled) {
        const zkpValid = await this.validateZKPIntegrity(payload);
        if (!zkpValid) {
          this.metrics.zkpValidationFailures++;
          return {
            success: false,
            error: 'ZKP validation failed. Submission rejected for integrity violation.'
          };
        }
      }

      // Phase 3: Timestamp integrity check
      const timestampValid = this.validateTimestampIntegrity(payload);
      if (!timestampValid) {
        return {
          success: false,
          error: 'Timestamp integrity violation. Submission rejected.'
        };
      }

      // Phase 4: Queue for processing
      this.processingQueue.push(payload);
      
      // Phase 5: Process submission through TrustFeedbackEngine
      const trustEngine = TrustFeedbackEngine.getInstance();
      const result = await trustEngine.submitFeedback(payload);

      if (result.success && result.logEntry) {
        // Phase 6: Update throttle tracking
        this.updateThrottleTracking(payload.submitter.anonymousId);
        
        // Phase 7: Write consistency validation
        if (this.config.writeConsistencyChecks) {
          const writeConsistent = await this.validateWriteConsistency(result.logEntry);
          if (!writeConsistent) {
            this.metrics.writeInconsistencies++;
            console.warn('⚠️ Write consistency check failed for submission:', result.logEntry.id);
          }
        }

        // Phase 8: Trigger aggregation update
        const aggregator = TrustSentimentAggregator.getInstance();
        await aggregator.aggregateAllTrustDeltas();

        // Phase 9: Update metrics
        const processingTime = performance.now() - startTime;
        this.updateMetrics(processingTime);

        console.log(`🔄 Trust feedback orchestrated successfully: ${result.logEntry.id} (${processingTime.toFixed(1)}ms)`);

        return {
          success: true,
          processedEntry: result.logEntry,
          rateLimitInfo: {
            isLimited: false,
            resetTime: this.getResetTime(payload.submitter.anonymousId),
            remainingSubmissions: this.getRemainingSubmissions(payload.submitter.anonymousId)
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown processing error'
        };
      }

    } catch (error) {
      console.error('❌ FeedbackOrchestrationEngine error:', error);
      return {
        success: false,
        error: 'Internal orchestration error'
      };
    }
  }

  public getOrchestrationMetrics(): OrchestrationMetrics {
    return { ...this.metrics };
  }

  public getThrottleStatus(anonymousId: string): {
    isThrottled: boolean;
    resetTime: number;
    remainingSubmissions: number;
    windowStart: number;
  } {
    const throttle = this.throttleMap.get(anonymousId);
    const now = Date.now();
    
    if (!throttle) {
      return {
        isThrottled: false,
        resetTime: now + this.config.rateLimitWindow,
        remainingSubmissions: this.config.maxSubmissionsPerWindow,
        windowStart: now
      };
    }

    const windowExpired = now - throttle.windowStart > this.config.rateLimitWindow;
    if (windowExpired) {
      return {
        isThrottled: false,
        resetTime: now + this.config.rateLimitWindow,
        remainingSubmissions: this.config.maxSubmissionsPerWindow,
        windowStart: now
      };
    }

    const remaining = Math.max(0, this.config.maxSubmissionsPerWindow - throttle.submissionCount);
    
    return {
      isThrottled: remaining === 0,
      resetTime: throttle.windowStart + this.config.rateLimitWindow,
      remainingSubmissions: remaining,
      windowStart: throttle.windowStart
    };
  }

  public exportOrchestrationLog(): any {
    return {
      schema: {
        version: 'phase_xd_step_3',
        description: 'Trust feedback orchestration system log with throttling and integrity validation'
      },
      config: this.config,
      metrics: this.metrics,
      activeThrottles: Object.fromEntries(this.throttleMap),
      queueStatus: {
        currentQueueLength: this.processingQueue.length,
        isProcessing: this.isProcessing
      },
      exportedAt: new Date().toISOString()
    };
  }

  private checkRateLimit(anonymousId: string): {
    isLimited: boolean;
    resetTime: number;
    remainingSubmissions: number;
  } {
    if (!this.config.throttlingEnabled) {
      return {
        isLimited: false,
        resetTime: Date.now() + this.config.rateLimitWindow,
        remainingSubmissions: this.config.maxSubmissionsPerWindow
      };
    }

    const status = this.getThrottleStatus(anonymousId);
    return {
      isLimited: status.isThrottled,
      resetTime: status.resetTime,
      remainingSubmissions: status.remainingSubmissions
    };
  }

  private async validateZKPIntegrity(payload: TrustFeedbackPayload): Promise<boolean> {
    try {
      // Simulate ZKP validation
      const contentHash = this.generateContentHash(payload);
      const expectedHash = payload.zkpStub;
      
      // Simple validation - in production would use actual ZKP verification
      return contentHash.length > 10 && expectedHash.length > 10;
    } catch (error) {
      console.error('❌ ZKP validation error:', error);
      return false;
    }
  }

  private validateTimestampIntegrity(payload: TrustFeedbackPayload): boolean {
    const now = Date.now();
    const submissionTime = new Date(payload.timestamp).getTime();
    
    // Reject submissions more than 5 minutes in the future or past
    const maxDrift = 5 * 60 * 1000;
    return Math.abs(now - submissionTime) <= maxDrift;
  }

  private updateThrottleTracking(anonymousId: string): void {
    const now = Date.now();
    const existing = this.throttleMap.get(anonymousId);
    
    if (!existing || now - existing.windowStart > this.config.rateLimitWindow) {
      // Start new window
      this.throttleMap.set(anonymousId, {
        userId: anonymousId,
        lastSubmissionTime: now,
        submissionCount: 1,
        windowStart: now
      });
    } else {
      // Update existing window
      existing.lastSubmissionTime = now;
      existing.submissionCount++;
    }
    
    this.persistThrottleData();
  }

  private async validateWriteConsistency(entry: TrustLogEntry): Promise<boolean> {
    try {
      // Verify entry was actually written to the log
      const trustEngine = TrustFeedbackEngine.getInstance();
      const log = trustEngine.getFeedbackLog();
      
      return log.some(logEntry => logEntry.id === entry.id);
    } catch (error) {
      console.error('❌ Write consistency validation error:', error);
      return false;
    }
  }

  private updateMetrics(processingTime: number): void {
    this.metrics.totalProcessed++;
    
    // Update rolling average
    const totalTime = this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) + processingTime;
    this.metrics.averageProcessingTime = totalTime / this.metrics.totalProcessed;
    
    this.metrics.lastProcessedTimestamp = new Date().toISOString();
  }

  private generateContentHash(payload: TrustFeedbackPayload): string {
    const content = JSON.stringify({
      target: payload.target,
      feedback: payload.feedback,
      submitter: payload.submitter.tier,
      timestamp: payload.timestamp
    });
    return `zkp_${btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
  }

  private getResetTime(anonymousId: string): number {
    const throttle = this.throttleMap.get(anonymousId);
    if (!throttle) return Date.now() + this.config.rateLimitWindow;
    
    return throttle.windowStart + this.config.rateLimitWindow;
  }

  private getRemainingSubmissions(anonymousId: string): number {
    const status = this.getThrottleStatus(anonymousId);
    return status.remainingSubmissions;
  }

  private startOrchestrationProcessor(): void {
    // Process queue every 100ms
    setInterval(() => {
      if (this.processingQueue.length > 0 && !this.isProcessing) {
        this.isProcessing = true;
        // Queue is processed via orchestrateFeedbackSubmission calls
        this.processingQueue = [];
        this.isProcessing = false;
      }
    }, 100);
  }

  private loadPersistedThrottleData(): void {
    try {
      const saved = localStorage.getItem('trust_orchestration_throttles');
      if (saved) {
        const data = JSON.parse(saved);
        this.throttleMap = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('⚠️ Failed to load throttle data:', error);
    }
  }

  private persistThrottleData(): void {
    try {
      const data = Object.fromEntries(this.throttleMap);
      localStorage.setItem('trust_orchestration_throttles', JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Failed to persist throttle data:', error);
    }
  }
}

export default FeedbackOrchestrationEngine;