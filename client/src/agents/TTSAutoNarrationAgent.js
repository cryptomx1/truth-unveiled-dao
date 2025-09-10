/**
 * TTSAutoNarrationAgent.ts
 * Phase TTS-CIVIC-ENHANCE Step 3: Auto-narration trigger system
 * Commander Mark directive via JASMY Relay
 */
import TTSEngineAgent from './TTSEngineAgent';
export class TTSAutoNarrationAgent {
    static instance;
    ttsEngine;
    config;
    activeHovers = new Map();
    observerMutationMap = new Map();
    isInitialized = false;
    static getInstance() {
        if (!TTSAutoNarrationAgent.instance) {
            TTSAutoNarrationAgent.instance = new TTSAutoNarrationAgent();
        }
        return TTSAutoNarrationAgent.instance;
    }
    constructor() {
        this.ttsEngine = TTSEngineAgent.getInstance();
        this.config = this.loadConfiguration();
        this.initializeAgent();
    }
    loadConfiguration() {
        const defaultConfig = {
            enabled: true,
            lingeDuration: 5000, // 5 seconds
            respectGlobalSettings: true,
            excludedDecks: ['voting', 'live-poll', 'emergency-alert']
        };
        try {
            const stored = localStorage.getItem('tts_autoplay');
            if (stored === 'false') {
                defaultConfig.enabled = false;
            }
            const configStored = localStorage.getItem('tts_auto_config');
            if (configStored) {
                const parsed = JSON.parse(configStored);
                return { ...defaultConfig, ...parsed };
            }
        }
        catch (error) {
            console.warn('⚠️ TTSAutoNarrationAgent: Failed to load config, using defaults');
        }
        return defaultConfig;
    }
    saveConfiguration() {
        try {
            localStorage.setItem('tts_autoplay', this.config.enabled.toString());
            localStorage.setItem('tts_auto_config', JSON.stringify(this.config));
        }
        catch (error) {
            console.warn('⚠️ TTSAutoNarrationAgent: Failed to save config');
        }
    }
    async initializeAgent() {
        if (this.isInitialized)
            return;
        console.log('🎯 TTSAutoNarrationAgent initializing — Auto-narration system');
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startObservation());
        }
        else {
            this.startObservation();
        }
        this.isInitialized = true;
        console.log('✅ TTSAutoNarrationAgent operational — 5s hover detection active');
    }
    startObservation() {
        // Observe for civic cards and components
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.attachHoverListeners(node);
                    }
                });
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        // Process existing elements
        this.attachHoverListeners(document.body);
    }
    attachHoverListeners(element) {
        // Find civic cards and components
        const civicElements = element.querySelectorAll([
            '[data-civic-card]',
            '[data-deck-id]',
            '.civic-card',
            '.deck-module',
            '.identity-summary-card',
            '.civic-swipe-card'
        ].join(', '));
        civicElements.forEach((el) => {
            this.setupElementHoverTracking(el);
        });
    }
    setupElementHoverTracking(element) {
        // Extract civic context
        const deckId = element.dataset.deckId ||
            element.dataset.civicCard ||
            this.inferDeckFromClassName(element);
        if (!deckId || this.config.excludedDecks.includes(deckId)) {
            return;
        }
        const elementId = this.generateElementId(element);
        // Add hover tracking
        element.addEventListener('mouseenter', () => {
            this.startHoverTracking(elementId, element, deckId);
        });
        element.addEventListener('mouseleave', () => {
            this.stopHoverTracking(elementId);
        });
        // Touch support for mobile
        element.addEventListener('touchstart', () => {
            this.startHoverTracking(elementId, element, deckId);
        });
        element.addEventListener('touchend', () => {
            this.stopHoverTracking(elementId);
        });
    }
    inferDeckFromClassName(element) {
        const classMap = {
            'identity-summary-card': 'wallet_overview',
            'civic-swipe-card': 'governance',
            'feedback-card': 'feedback',
            'civic-identity': 'civic_identity',
            'wellbeing-card': 'wellbeing'
        };
        for (const [className, deckId] of Object.entries(classMap)) {
            if (element.classList.contains(className)) {
                return deckId;
            }
        }
        // Fallback: check parent elements
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (parent.dataset.deckId) {
                return parent.dataset.deckId;
            }
            parent = parent.parentElement;
        }
        return 'unknown';
    }
    generateElementId(element) {
        return `auto_${element.tagName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    startHoverTracking(elementId, element, deckId) {
        if (!this.config.enabled)
            return;
        // Extract content for narration
        const content = this.extractNarrationContent(element);
        if (!content || content.length < 10)
            return;
        const hoverTarget = {
            element,
            deckId,
            content,
            startTime: Date.now(),
            triggered: false
        };
        this.activeHovers.set(elementId, hoverTarget);
        // Set timer for auto-narration
        setTimeout(() => {
            this.checkAndTriggerNarration(elementId);
        }, this.config.lingeDuration);
    }
    stopHoverTracking(elementId) {
        const hover = this.activeHovers.get(elementId);
        if (hover && !hover.triggered) {
            this.activeHovers.delete(elementId);
        }
    }
    extractNarrationContent(element) {
        // Priority order for content extraction
        const contentSelectors = [
            '[data-tts-content]',
            '.card-description',
            '.civic-description',
            'p',
            '.text-content',
            'h1, h2, h3, h4, h5, h6'
        ];
        for (const selector of contentSelectors) {
            const contentEl = element.querySelector(selector);
            if (contentEl && contentEl.textContent) {
                const text = contentEl.textContent.trim();
                if (text.length > 10) {
                    return text;
                }
            }
        }
        // Fallback to element text content
        const text = element.textContent?.trim() || '';
        return text.length > 10 ? text.substring(0, 200) : '';
    }
    async checkAndTriggerNarration(elementId) {
        const hover = this.activeHovers.get(elementId);
        if (!hover || hover.triggered)
            return;
        // Check if still hovering
        const currentTime = Date.now();
        const hoverDuration = currentTime - hover.startTime;
        if (hoverDuration < this.config.lingeDuration)
            return;
        // Check if element is still hovered
        if (!this.isElementHovered(hover.element)) {
            this.activeHovers.delete(elementId);
            return;
        }
        hover.triggered = true;
        try {
            console.log(`🎯 Auto-narration triggered for ${hover.deckId} after ${hoverDuration}ms hover`);
            // Trigger narration through TTS engine
            await this.ttsEngine.narrateContent(hover.deckId, 'auto-narration', hover.content, 'medium');
            // Add visual indicator
            this.showAutoNarrationIndicator(hover.element);
        }
        catch (error) {
            console.error('❌ Auto-narration failed:', error);
        }
        finally {
            // Clean up after 2 seconds
            setTimeout(() => {
                this.activeHovers.delete(elementId);
            }, 2000);
        }
    }
    isElementHovered(element) {
        try {
            const rect = element.getBoundingClientRect();
            const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            return element.contains(elementAtPoint);
        }
        catch {
            return false;
        }
    }
    showAutoNarrationIndicator(element) {
        // Create temporary visual indicator
        const indicator = document.createElement('div');
        indicator.className = 'auto-narration-indicator';
        indicator.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
      animation: pulse 1s infinite;
      z-index: 10;
      pointer-events: none;
    `;
        // Add to element
        element.style.position = 'relative';
        element.appendChild(indicator);
        // Remove after 3 seconds
        setTimeout(() => {
            if (indicator.parentElement) {
                indicator.remove();
            }
        }, 3000);
    }
    // Public API methods
    setAutoplayEnabled(enabled) {
        this.config.enabled = enabled;
        this.saveConfiguration();
        console.log(`🎯 Auto-narration ${enabled ? 'enabled' : 'disabled'}`);
    }
    setLingeDuration(duration) {
        this.config.lingeDuration = Math.max(1000, Math.min(10000, duration));
        this.saveConfiguration();
    }
    getConfiguration() {
        return { ...this.config };
    }
    addExcludedDeck(deckId) {
        if (!this.config.excludedDecks.includes(deckId)) {
            this.config.excludedDecks.push(deckId);
            this.saveConfiguration();
        }
    }
    removeExcludedDeck(deckId) {
        const index = this.config.excludedDecks.indexOf(deckId);
        if (index > -1) {
            this.config.excludedDecks.splice(index, 1);
            this.saveConfiguration();
        }
    }
    getDiagnostics() {
        return {
            isInitialized: this.isInitialized,
            config: this.config,
            activeHovers: this.activeHovers.size,
            observedElements: this.observerMutationMap.size
        };
    }
}
export default TTSAutoNarrationAgent;
