/**
 * Deck10IntegrationPatch.ts
 * Phase X-D Step 2: Integration patch for Deck #10 Governance Feedback
 * Commander Mark authorization via JASMY Relay
 */

import React from 'react';
import TrustPublicMetricCard from './TrustPublicMetricCard';

export interface Deck10TrustIntegrationProps {
  deckId: string;
  showDetailedMetrics?: boolean;
  className?: string;
}

/**
 * Integration component for Deck #10 Governance Feedback section
 * Embeds trust sentiment metrics directly into governance interface
 */
export const Deck10TrustIntegration: React.FC<Deck10TrustIntegrationProps> = ({
  deckId = 'governance_deck',
  showDetailedMetrics = true,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Trust Sentiment Widget */}
      <div className="bg-background/50 rounded-lg p-4 border border-border/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground/80">
              Live Trust Feedback
            </h3>
            <div className="text-xs text-muted-foreground">
              Real-time sentiment tracking
            </div>
          </div>
          
          <TrustPublicMetricCard 
            deckId={deckId}
            compact={!showDetailedMetrics}
            className="shadow-sm"
          />
        </div>
      </div>

      {/* System-wide Trust Health (if detailed) */}
      {showDetailedMetrics && (
        <div className="bg-background/30 rounded-lg p-4 border border-border/30">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80">
              Platform Trust Health
            </h3>
            
            <TrustPublicMetricCard 
              showOverall={true}
              compact={false}
              className="shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Utility function to inject trust metrics into existing Deck #10 components
 * Maintains responsive design and theme compliance
 */
export const injectTrustMetricsIntoDeck10 = (
  targetElement: HTMLElement,
  options: {
    deckId?: string;
    position?: 'top' | 'bottom' | 'sidebar';
    theme?: 'light' | 'dark' | 'auto';
    mobileResponsive?: boolean;
  } = {}
): void => {
  const {
    deckId = 'governance_deck',
    position = 'bottom',
    theme = 'auto',
    mobileResponsive = true
  } = options;

  // Create container for trust metrics
  const container = document.createElement('div');
  container.className = `trust-metrics-container ${
    mobileResponsive ? 'responsive-trust-widget' : ''
  }`;
  
  // Apply theme-specific styling
  if (theme === 'light' || theme === 'auto') {
    container.classList.add('light-theme-trust');
  }
  if (theme === 'dark' || theme === 'auto') {
    container.classList.add('dark:dark-theme-trust');
  }

  // Position the container
  switch (position) {
    case 'top':
      targetElement.insertBefore(container, targetElement.firstChild);
      break;
    case 'sidebar':
      container.classList.add('sidebar-trust-metrics');
      targetElement.appendChild(container);
      break;
    default: // bottom
      targetElement.appendChild(container);
  }

  // Mobile responsiveness styles
  if (mobileResponsive) {
    const style = document.createElement('style');
    style.textContent = `
      .responsive-trust-widget {
        width: 100%;
        max-width: 100%;
      }
      
      @media (max-width: 460px) {
        .responsive-trust-widget {
          margin: 0.5rem 0;
          padding: 0.75rem;
        }
        
        .responsive-trust-widget .trust-metric-card {
          font-size: 0.875rem;
        }
        
        .sidebar-trust-metrics {
          position: static;
          width: 100%;
          margin-top: 1rem;
        }
      }
      
      @media (min-width: 768px) {
        .sidebar-trust-metrics {
          position: sticky;
          top: 1rem;
          width: 280px;
          margin-left: 1rem;
        }
      }
      
      .light-theme-trust {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      .dark-theme-trust {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    `;
    
    if (!document.head.querySelector('#trust-metrics-styles')) {
      style.id = 'trust-metrics-styles';
      document.head.appendChild(style);
    }
  }

  console.log(`🔗 Trust metrics injected into Deck #10 at ${position} position`);
};

/**
 * Real-time feedback tracking integration
 * Monitors new submissions and updates display accordingly
 */
export class Deck10FeedbackTracker {
  private static instance: Deck10FeedbackTracker;
  private isTracking: boolean = false;
  private lastUpdateTimestamp: string = '';
  private updateCallbacks: Array<(data: any) => void> = [];

  public static getInstance(): Deck10FeedbackTracker {
    if (!Deck10FeedbackTracker.instance) {
      Deck10FeedbackTracker.instance = new Deck10FeedbackTracker();
    }
    return Deck10FeedbackTracker.instance;
  }

  public startTracking(deckId: string = 'governance_deck'): void {
    if (this.isTracking) return;

    this.isTracking = true;
    console.log(`📊 Starting real-time feedback tracking for ${deckId}`);

    // Check for updates every 30 seconds
    const trackingInterval = setInterval(() => {
      this.checkForUpdates(deckId);
    }, 30000);

    // Store interval for cleanup
    (this as any).trackingInterval = trackingInterval;
  }

  public stopTracking(): void {
    if (!(this as any).trackingInterval) return;

    clearInterval((this as any).trackingInterval);
    this.isTracking = false;
    console.log('📊 Real-time feedback tracking stopped');
  }

  public onUpdate(callback: (data: any) => void): void {
    this.updateCallbacks.push(callback);
  }

  private async checkForUpdates(deckId: string): Promise<void> {
    try {
      // Import aggregator dynamically to avoid circular dependencies
      const { TrustSentimentAggregator } = await import('./TrustSentimentAggregator');
      const aggregator = TrustSentimentAggregator.getInstance();
      
      const metrics = aggregator.getDeckMetrics(deckId);
      
      if (metrics && metrics.lastUpdated !== this.lastUpdateTimestamp) {
        this.lastUpdateTimestamp = metrics.lastUpdated;
        
        // Notify all registered callbacks
        this.updateCallbacks.forEach(callback => {
          try {
            callback({
              deckId,
              metrics,
              timestamp: metrics.lastUpdated,
              isNewUpdate: true
            });
          } catch (error) {
            console.error('❌ Feedback tracking callback error:', error);
          }
        });

        console.log(`📊 New trust feedback detected for ${deckId}`);
      }
    } catch (error) {
      console.error('❌ Feedback tracking update check failed:', error);
    }
  }
}

export default Deck10TrustIntegration;