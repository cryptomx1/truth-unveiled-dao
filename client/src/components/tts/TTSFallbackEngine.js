/**
 * TTSFallbackEngine.ts
 * Phase TTS-CIVIC-ENHANCE Step 2: Robust fallback protocols for TTS
 * Commander Mark directive via JASMY Relay + GROK Node0001
 */
import VoiceProviderSelector from './VoiceProviderSelector';
export class TTSFallbackEngine {
    static instance;
    voiceSelector;
    fallbackHistory;
    fallbackChains;
    contentFilter;
    constructor() {
        this.voiceSelector = VoiceProviderSelector.getInstance();
        this.fallbackHistory = [];
        this.fallbackChains = new Map();
        this.contentFilter = /\b(bafybei[a-z0-9]{50,}|did:civic:[a-zA-Z0-9_]+|0x[a-fA-F0-9]{16,}|\d{5}-?\d{4})\b/g;
        this.initializeFallbackChains();
    }
    static getInstance() {
        if (!TTSFallbackEngine.instance) {
            TTSFallbackEngine.instance = new TTSFallbackEngine();
        }
        return TTSFallbackEngine.instance;
    }
    initializeFallbackChains() {
        // Define fallback priority chains based on deck context
        const chains = [
            {
                context: 'high_priority', // Governance, Critical announcements
                chain: {
                    primary: 'openai_gpt4o',
                    secondary: 'google_cloud',
                    tertiary: 'playht',
                    emergency: 'browser_native'
                }
            },
            {
                context: 'standard', // Most civic decks
                chain: {
                    primary: 'openai_gpt4o',
                    secondary: 'playht',
                    tertiary: 'google_cloud',
                    emergency: 'browser_native'
                }
            },
            {
                context: 'low_latency', // Real-time feedback, quick announcements
                chain: {
                    primary: 'google_cloud',
                    secondary: 'browser_native',
                    tertiary: 'openai_gpt4o',
                    emergency: 'browser_native'
                }
            }
        ];
        chains.forEach(({ context, chain }) => {
            this.fallbackChains.set(context, chain);
        });
        console.log('🔄 TTSFallbackEngine initialized with', chains.length, 'fallback chain configurations');
    }
    async synthesizeWithFallback(request) {
        const startTime = Date.now();
        const attempts = [];
        // Filter content to remove sensitive identifiers
        const filteredText = this.filterSensitiveContent(request.text);
        // Determine appropriate fallback chain
        const chainType = this.determineFallbackChain(request.deckId);
        const fallbackChain = this.fallbackChains.get(chainType) || this.fallbackChains.get('standard');
        // Try each provider in the fallback chain
        const providers = [fallbackChain.primary, fallbackChain.secondary, fallbackChain.tertiary, fallbackChain.emergency];
        for (let i = 0; i < providers.length; i++) {
            const providerId = providers[i];
            const attemptStart = Date.now();
            try {
                console.log(`🎙️ Attempting TTS synthesis with ${providerId} (attempt ${i + 1}/${providers.length})`);
                const result = await this.attemptSynthesis(providerId, {
                    ...request,
                    text: filteredText
                });
                const latency = Date.now() - attemptStart;
                const attempt = {
                    providerId,
                    attempt: i + 1,
                    success: true,
                    latency,
                    timestamp: new Date().toISOString()
                };
                attempts.push(attempt);
                this.logFallbackAttempt(attempt);
                console.log(`✅ TTS synthesis successful with ${providerId} (${latency}ms)`);
                return {
                    success: true,
                    providerId,
                    audioUrl: result.audioUrl,
                    latency: Date.now() - startTime,
                    attemptsUsed: i + 1,
                    fallbackChain: attempts
                };
            }
            catch (error) {
                const latency = Date.now() - attemptStart;
                const attempt = {
                    providerId,
                    attempt: i + 1,
                    success: false,
                    latency,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                };
                attempts.push(attempt);
                this.logFallbackAttempt(attempt);
                console.warn(`⚠️ TTS synthesis failed with ${providerId} (${latency}ms):`, error);
                // Update provider status if it failed
                this.voiceSelector.updateProviderStatus(providerId, 'degraded');
                // Continue to next provider in chain
                continue;
            }
        }
        // All providers failed
        console.error('❌ All TTS providers in fallback chain failed');
        return {
            success: false,
            providerId: 'none',
            latency: Date.now() - startTime,
            attemptsUsed: providers.length,
            fallbackChain: attempts
        };
    }
    async attemptSynthesis(providerId, request) {
        // Simulate different TTS provider APIs with realistic behavior
        switch (providerId) {
            case 'openai_gpt4o':
                return await this.synthesizeOpenAI(request);
            case 'playht':
                return await this.synthesizePlayHT(request);
            case 'google_cloud':
                return await this.synthesizeGoogleCloud(request);
            case 'wellsaid':
                return await this.synthesizeWellSaid(request);
            case 'browser_native':
                return await this.synthesizeBrowserNative(request);
            default:
                throw new Error(`Unknown TTS provider: ${providerId}`);
        }
    }
    async synthesizeOpenAI(request) {
        // Simulate OpenAI TTS API call
        const delay = 250 + Math.random() * 200; // 250-450ms
        await new Promise(resolve => setTimeout(resolve, delay));
        // 95% success rate
        if (Math.random() < 0.95) {
            return {
                audioUrl: `blob:openai-tts-${Date.now()}.mp3`
            };
        }
        else {
            throw new Error('OpenAI API rate limit exceeded');
        }
    }
    async synthesizePlayHT(request) {
        // Simulate Play.ht API call
        const delay = 400 + Math.random() * 250; // 400-650ms
        await new Promise(resolve => setTimeout(resolve, delay));
        // 88% success rate
        if (Math.random() < 0.88) {
            return {
                audioUrl: `blob:playht-tts-${Date.now()}.mp3`
            };
        }
        else {
            throw new Error('Play.ht server temporarily unavailable');
        }
    }
    async synthesizeGoogleCloud(request) {
        // Simulate Google Cloud TTS API call
        const delay = 300 + Math.random() * 200; // 300-500ms
        await new Promise(resolve => setTimeout(resolve, delay));
        // 91% success rate
        if (Math.random() < 0.91) {
            return {
                audioUrl: `blob:google-tts-${Date.now()}.mp3`
            };
        }
        else {
            throw new Error('Google Cloud TTS quota exceeded');
        }
    }
    async synthesizeWellSaid(request) {
        // Simulate WellSaid Labs API call
        const delay = 600 + Math.random() * 200; // 600-800ms
        await new Promise(resolve => setTimeout(resolve, delay));
        // 72% success rate
        if (Math.random() < 0.72) {
            return {
                audioUrl: `blob:wellsaid-tts-${Date.now()}.mp3`
            };
        }
        else {
            throw new Error('WellSaid Labs service maintenance');
        }
    }
    async synthesizeBrowserNative(request) {
        // Browser TTS is always available but lower quality
        const delay = 50 + Math.random() * 100; // 50-150ms
        await new Promise(resolve => setTimeout(resolve, delay));
        // Simulate browser speech synthesis
        if ('speechSynthesis' in window) {
            return {
                audioUrl: `blob:browser-tts-${Date.now()}.wav`
            };
        }
        else {
            throw new Error('Browser speech synthesis not supported');
        }
    }
    filterSensitiveContent(text) {
        // Remove CID, DID, ZIP, and ZKP references
        let filteredText = text.replace(this.contentFilter, '[REDACTED]');
        // Additional filters for common sensitive patterns
        filteredText = filteredText.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]'); // SSN
        filteredText = filteredText.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[CARD-REDACTED]'); // Credit cards
        filteredText = filteredText.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]'); // Emails
        return filteredText;
    }
    determineFallbackChain(deckId) {
        // Map deck types to appropriate fallback chains
        const highPriorityDecks = ['governance', 'civic-council', 'emergency-alerts'];
        const lowLatencyDecks = ['trust-feedback', 'real-time-polls', 'live-chat'];
        if (highPriorityDecks.some(deck => deckId.includes(deck))) {
            return 'high_priority';
        }
        else if (lowLatencyDecks.some(deck => deckId.includes(deck))) {
            return 'low_latency';
        }
        else {
            return 'standard';
        }
    }
    logFallbackAttempt(attempt) {
        this.fallbackHistory.push(attempt);
        // Keep only last 200 attempts
        if (this.fallbackHistory.length > 200) {
            this.fallbackHistory = this.fallbackHistory.slice(-200);
        }
    }
    getFallbackMetrics() {
        const recentAttempts = this.fallbackHistory.slice(-100);
        const successRate = recentAttempts.length > 0
            ? (recentAttempts.filter(a => a.success).length / recentAttempts.length) * 100
            : 100;
        const averageLatency = recentAttempts.length > 0
            ? recentAttempts.reduce((sum, a) => sum + a.latency, 0) / recentAttempts.length
            : 0;
        const providerSuccess = recentAttempts.reduce((acc, attempt) => {
            if (!acc[attempt.providerId]) {
                acc[attempt.providerId] = { total: 0, success: 0 };
            }
            acc[attempt.providerId].total++;
            if (attempt.success) {
                acc[attempt.providerId].success++;
            }
            return acc;
        }, {});
        const fallbackFrequency = recentAttempts.reduce((acc, attempt) => {
            acc[attempt.attempt] = (acc[attempt.attempt] || 0) + 1;
            return acc;
        }, {});
        return {
            totalAttempts: this.fallbackHistory.length,
            recentSuccessRate: Math.round(successRate),
            averageLatency: Math.round(averageLatency),
            providerSuccess,
            fallbackFrequency,
            chainConfigurations: Object.fromEntries(this.fallbackChains)
        };
    }
    exportFallbackLog() {
        const exportData = {
            timestamp: new Date().toISOString(),
            metrics: this.getFallbackMetrics(),
            recentHistory: this.fallbackHistory.slice(-50),
            fallbackChains: Object.fromEntries(this.fallbackChains),
            contentFilterPatterns: this.contentFilter.source
        };
        return JSON.stringify(exportData, null, 2);
    }
    clearHistory() {
        this.fallbackHistory = [];
        console.log('🧹 TTS fallback history cleared');
    }
    updateFallbackChain(context, chain) {
        this.fallbackChains.set(context, chain);
        console.log(`🔄 Fallback chain updated for context: ${context}`);
    }
}
export default TTSFallbackEngine;
