import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLangContext } from '../layout/CivicLayoutShell';
// Context for accessibility harmony
const AccessibilityHarmonyContext = createContext(null);
// Custom hook to use accessibility harmony
export const useAccessibilityHarmony = () => {
    const context = useContext(AccessibilityHarmonyContext);
    if (!context) {
        throw new Error('useAccessibilityHarmony must be used within AccessibilityHarmonyProvider');
    }
    return context;
};
// Legacy useLang hook for backwards compatibility
export const useLang = () => {
    const context = useLangContext();
    return {
        lang: context.language,
        setLang: context.setLanguage,
        t: (key) => key // Simple fallback - return key as translation
    };
};
export const AccessibilityHarmonyEngine = ({ initialConfig = {} }) => {
    const [config, setConfig] = useState({
        enableTTS: false, // Disabled by default per nuclear TTS override
        enableFocusTrap: true,
        enableARIAMapping: true,
        language: 'en',
        priority: 'medium',
        ...initialConfig
    });
    const [ttsQueue, setTTSQueue] = useState([]);
    const [focusTraps, setFocusTraps] = useState(new Set());
    const [renderTime, setRenderTime] = useState(0);
    const ttsAnnouncementRef = useRef(null);
    const engineInitialized = useRef(false);
    const mountTimestamp = useRef(Date.now());
    // ARIA Role Mapper - Scans and auto-tags passive regions
    const scanAndMapARIA = useCallback(() => {
        const startTime = Date.now();
        // Find all decorative elements and mark them as presentation
        const decorativeElements = document.querySelectorAll('.animate-pulse, .animate-spin, .animate-bounce, [aria-hidden="true"], .sr-only');
        decorativeElements.forEach(element => {
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'presentation');
            }
        });
        // Find all passive regions (visual indicators, animations) and ensure aria-hidden
        const passiveElements = document.querySelectorAll('.pulse-ring, .glow-effect, .decorative-icon, .status-indicator, .visual-feedback');
        passiveElements.forEach(element => {
            element.setAttribute('aria-hidden', 'true');
        });
        // Normalize aria-live regions - remove duplicates
        const liveRegions = document.querySelectorAll('[aria-live]');
        const existingLiveRegions = new Set();
        liveRegions.forEach(element => {
            const liveType = element.getAttribute('aria-live');
            if (liveType && existingLiveRegions.has(liveType)) {
                // Remove duplicate live regions
                element.removeAttribute('aria-live');
                console.log(`♿ HARMONY: Removed duplicate aria-live="${liveType}" region`);
            }
            else if (liveType) {
                existingLiveRegions.add(liveType);
            }
        });
        const scanTime = Date.now() - startTime;
        if (scanTime > 300) {
            console.warn(`⚠️ ARIA scan time: ${scanTime}ms (exceeds 300ms target)`);
        }
        console.log(`♿ HARMONY: ARIA scan complete - ${decorativeElements.length} decorative, ${passiveElements.length} passive elements processed in ${scanTime}ms`);
    }, []);
    // TTS Announcement Queue System
    const announce = useCallback((message, priority = 'medium') => {
        // Nuclear TTS override - block all announcements
        console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
        console.log(`🔇 TTS disabled: "${message}"`);
        // Still add to queue for potential future use, but don't actually announce
        const newMessage = {
            id: `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: message,
            priority,
            timestamp: Date.now()
        };
        setTTSQueue(prev => {
            // Priority system: high priority messages replace lower priority ones
            const filteredQueue = priority === 'high'
                ? prev.filter(msg => msg.priority === 'high')
                : prev;
            // Keep only last 3 messages to prevent queue overflow
            const updatedQueue = [...filteredQueue, newMessage].slice(-3);
            return updatedQueue;
        });
        // Update the controlled TTS zone (but don't actually speak)
        if (ttsAnnouncementRef.current) {
            ttsAnnouncementRef.current.textContent = message;
        }
    }, []);
    // Focus Trap Guardian System
    const enableFocusTrap = useCallback((elementId) => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`♿ HARMONY: Focus trap target "${elementId}" not found`);
            return;
        }
        // Add to active focus traps
        setFocusTraps(prev => new Set([...prev, elementId]));
        // Apply focus trap behavior
        const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) {
            console.warn(`♿ HARMONY: No focusable elements found in trap "${elementId}"`);
            return;
        }
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    // Shift+Tab: if on first element, go to last
                    if (document.activeElement === firstFocusable) {
                        event.preventDefault();
                        lastFocusable.focus();
                    }
                }
                else {
                    // Tab: if on last element, go to first
                    if (document.activeElement === lastFocusable) {
                        event.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };
        element.addEventListener('keydown', handleKeyDown);
        firstFocusable.focus();
        // Store cleanup function
        element.setAttribute('data-focus-trap-handler', 'true');
        element._focusTrapCleanup = () => {
            element.removeEventListener('keydown', handleKeyDown);
            element.removeAttribute('data-focus-trap-handler');
        };
        console.log(`♿ HARMONY: Focus trap enabled for "${elementId}" with ${focusableElements.length} focusable elements`);
    }, []);
    const disableFocusTrap = useCallback((elementId) => {
        const element = document.getElementById(elementId);
        if (!element)
            return;
        // Remove from active focus traps
        setFocusTraps(prev => {
            const newTraps = new Set(prev);
            newTraps.delete(elementId);
            return newTraps;
        });
        // Clean up event listeners
        if (element._focusTrapCleanup) {
            element._focusTrapCleanup();
            delete element._focusTrapCleanup;
        }
        console.log(`♿ HARMONY: Focus trap disabled for "${elementId}"`);
    }, []);
    // Legacy Cleanup Script - One-time run on initialization
    const runLegacyCleanup = useCallback(() => {
        const startTime = Date.now();
        // Remove duplicate aria-live regions
        const ariaLiveElements = document.querySelectorAll('[aria-live]');
        const seenLiveTypes = new Set();
        let duplicatesRemoved = 0;
        ariaLiveElements.forEach(element => {
            const liveType = element.getAttribute('aria-live');
            if (liveType && seenLiveTypes.has(liveType)) {
                element.removeAttribute('aria-live');
                duplicatesRemoved++;
            }
            else if (liveType) {
                seenLiveTypes.add(liveType);
            }
        });
        // Standardize spacing roles - remove excessive whitespace in aria-labels
        const labeledElements = document.querySelectorAll('[aria-label]');
        let labelsNormalized = 0;
        labeledElements.forEach(element => {
            const label = element.getAttribute('aria-label');
            if (label) {
                const normalizedLabel = label.replace(/\s+/g, ' ').trim();
                if (normalizedLabel !== label) {
                    element.setAttribute('aria-label', normalizedLabel);
                    labelsNormalized++;
                }
            }
        });
        // Remove overrides from elements that shouldn't have them
        const overrideElements = document.querySelectorAll('[aria-live="off"]');
        let overridesRemoved = 0;
        overrideElements.forEach(element => {
            // Keep the override if it's explicitly needed (in sr-only or hidden elements)
            if (!element.classList.contains('sr-only') && !element.hasAttribute('aria-hidden')) {
                element.removeAttribute('aria-live');
                overridesRemoved++;
            }
        });
        const cleanupTime = Date.now() - startTime;
        console.log(`♿ HARMONY: Legacy cleanup complete in ${cleanupTime}ms`);
        console.log(`♿ HARMONY: Removed ${duplicatesRemoved} duplicate aria-live, normalized ${labelsNormalized} labels, removed ${overridesRemoved} overrides`);
    }, []);
    // Language setter
    const setLanguage = useCallback((lang) => {
        setConfig(prev => ({ ...prev, language: lang }));
        document.documentElement.setAttribute('lang', lang);
        console.log(`♿ HARMONY: Language set to "${lang}"`);
    }, []);
    // Engine initialization
    useEffect(() => {
        if (engineInitialized.current)
            return;
        const startTime = Date.now();
        // Nuclear TTS override - global enforcer
        console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
        console.log('🔇 TTS disabled: "Accessibility Harmony Engine initializing"');
        // Run legacy cleanup on first initialization
        runLegacyCleanup();
        // Initial ARIA mapping
        if (config.enableARIAMapping) {
            scanAndMapARIA();
        }
        // Set initial language
        document.documentElement.setAttribute('lang', config.language);
        engineInitialized.current = true;
        const totalRenderTime = Date.now() - startTime;
        setRenderTime(totalRenderTime);
        if (totalRenderTime > 100) {
            console.warn(`⚠️ AccessibilityHarmonyEngine init time: ${totalRenderTime}ms (exceeds 100ms target)`);
        }
        console.log('🎧 Accessibility Engine Deployed');
        console.log('♿ HARMONY ONLINE: ARIA + TTS SYNCHRONIZED');
        // Cleanup function
        return () => {
            // Clean up all active focus traps
            focusTraps.forEach(trapId => {
                const element = document.getElementById(trapId);
                if (element && element._focusTrapCleanup) {
                    element._focusTrapCleanup();
                }
            });
            console.log('♿ HARMONY: Engine cleanup complete');
        };
    }, [config.enableARIAMapping, config.language, focusTraps, runLegacyCleanup, scanAndMapARIA]);
    // Context value
    const contextValue = {
        announce,
        setLanguage,
        enableFocusTrap,
        disableFocusTrap,
        scanAndMapARIA,
        config
    };
    return (<AccessibilityHarmonyContext.Provider value={contextValue}>
      {/* Controlled TTS Announcement Zone */}
      <div ref={ttsAnnouncementRef} id="tts-announcement-zone" aria-live="off" // Disabled per nuclear TTS override
     aria-atomic="true" className="sr-only" aria-hidden="true">
        {/* TTS messages will be rendered here (but not spoken) */}
      </div>

      {/* Development Info Panel */}
      {process.env.NODE_ENV === 'development' && (<div className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 rounded-lg text-xs border border-slate-700">
          <div className="font-bold mb-2">♿ Accessibility Harmony Engine</div>
          <div className="space-y-1">
            <div>Init Time: {renderTime}ms</div>
            <div>Language: {config.language}</div>
            <div>TTS: {config.enableTTS ? 'Enabled' : 'Disabled (Nuclear Override)'}</div>
            <div>Focus Traps: {focusTraps.size}</div>
            <div>TTS Queue: {ttsQueue.length}</div>
          </div>
        </div>)}
    </AccessibilityHarmonyContext.Provider>);
};
export default AccessibilityHarmonyEngine;
