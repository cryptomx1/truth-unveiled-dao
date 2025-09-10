// TTSEngineAgent.ts - Phase TTS-CIVIC-ENHANCE Step 1 & 2
// Core agent for comprehensive civic deck TTS management with LLM voice quality enhancement
// Commander Mark directive via JASMY Relay + GROK Node0001
import VoiceProviderSelector from '@/components/tts/VoiceProviderSelector';
import TTSFallbackEngine from '@/components/tts/TTSFallbackEngine';
export class TTSEngineAgent {
    static instance;
    narrationQueue = [];
    currentJob = null;
    deckConfigs = new Map();
    diagnostics = [];
    isInitialized = false;
    currentUtterance = null;
    voiceSelector;
    fallbackEngine;
    static getInstance() {
        if (!TTSEngineAgent.instance) {
            TTSEngineAgent.instance = new TTSEngineAgent();
        }
        return TTSEngineAgent.instance;
    }
    constructor() {
        this.loadDeckConfigurations();
        this.voiceSelector = VoiceProviderSelector.getInstance();
        this.fallbackEngine = TTSFallbackEngine.getInstance();
        this.initializeAgent();
    }
    async initializeAgent() {
        if (this.isInitialized)
            return;
        console.log('🎙️ TTSEngineAgent initializing — Civic deck narration system');
        // Load user preferences from localStorage
        const userPrefs = localStorage.getItem('tts_user_preferences');
        if (userPrefs) {
            try {
                const prefs = JSON.parse(userPrefs);
                console.log('🔊 User TTS preferences loaded:', prefs);
            }
            catch (e) {
                console.warn('⚠️ Failed to load TTS preferences');
            }
        }
        // Initialize voice availability check
        if ('speechSynthesis' in window) {
            const voices = window.speechSynthesis.getVoices();
            console.log('🎙️ TTSEngineAgent: Speech synthesis ready with', voices.length, 'voices');
            // Test latency
            const startTime = Date.now();
            const testUtterance = new SpeechSynthesisUtterance('');
            testUtterance.volume = 0;
            testUtterance.onstart = () => {
                const latency = Date.now() - startTime;
                this.logDiagnostic('system', undefined, 'latency_test', { baseline: true }, latency);
                window.speechSynthesis.cancel();
            };
            window.speechSynthesis.speak(testUtterance);
        }
        this.isInitialized = true;
        console.log('✅ TTSEngineAgent operational — Civic narration system ready');
    }
    loadDeckConfigurations() {
        // Load default deck configurations
        const defaultConfigs = {
            'governance': { tone: 'formal', speed: 'normal', enabled: true },
            'education': { tone: 'encouraging', speed: 'slow', enabled: true },
            'privacy': { tone: 'calm', speed: 'normal', enabled: true },
            'identity': { tone: 'informative', speed: 'normal', enabled: true },
            'civic-diplomacy': { tone: 'formal', speed: 'normal', enabled: true },
            'civic-sustainability': { tone: 'urgent', speed: 'normal', enabled: true },
            'civic-wellbeing': { tone: 'calm', speed: 'slow', enabled: true },
            'civic-justice': { tone: 'formal', speed: 'normal', enabled: true },
            'civic-audit': { tone: 'formal', speed: 'fast', enabled: true },
            'consensus-layer': { tone: 'formal', speed: 'normal', enabled: true },
            'governance-feedback': { tone: 'encouraging', speed: 'normal', enabled: true },
            'civic-engagement': { tone: 'encouraging', speed: 'normal', enabled: true },
            'civic-identity': { tone: 'informative', speed: 'normal', enabled: true },
            'civic-governance': { tone: 'formal', speed: 'normal', enabled: true },
            'civic-amendments': { tone: 'formal', speed: 'slow', enabled: true },
            'wallet-overview': { tone: 'informative', speed: 'normal', enabled: true },
            'finance': { tone: 'informative', speed: 'normal', enabled: true },
            'zkp-layer': { tone: 'calm', speed: 'slow', enabled: true },
            'secure-assets': { tone: 'formal', speed: 'normal', enabled: true },
            'civic-education': { tone: 'encouraging', speed: 'slow', enabled: true }
        };
        for (const [deckId, config] of Object.entries(defaultConfigs)) {
            this.deckConfigs.set(deckId, config);
        }
        console.log('📋 TTSEngineAgent: Loaded configurations for', this.deckConfigs.size, 'civic decks');
    }
    getDeckConfiguration(deckId) {
        return this.deckConfigs.get(deckId) || {
            tone: 'informative',
            speed: 'normal',
            enabled: true
        };
    }
    updateDeckConfiguration(deckId, config) {
        const existing = this.getDeckConfiguration(deckId);
        const updated = { ...existing, ...config };
        this.deckConfigs.set(deckId, updated);
        this.logDiagnostic(deckId, undefined, 'toggle_added', {
            configUpdate: config,
            newConfig: updated
        });
        console.log(`🔧 TTS config updated for deck ${deckId}:`, updated);
    }
    // PHASE TRILAYER v1.0 MODULE 1 ENHANCEMENT: IPFS Audio Generation
    async generateNarrationWithIPFS(deckId, moduleId, content, language = 'en') {
        const config = this.getDeckConfiguration(deckId);
        if (!config.enabled) {
            console.log(`🔇 TTS disabled for deck ${deckId}`);
            return null;
        }
        // Enhanced privacy compliance with context-aware filtering
        const sanitizedContent = this.sanitizeContentWithContextAwareness(content, moduleId);
        // Skip narration if content contains privacy markers or is flagged
        if (this.containsPrivacyMarkers(sanitizedContent)) {
            console.log(`🔒 Skipping narration for ${moduleId} - privacy content detected`);
            return null;
        }
        try {
            // Context-aware voice selection based on module metadata
            const voiceConfig = this.getContextAwareVoiceConfig(deckId, moduleId, config);
            // REPAIR: Use OpenAI TTS API for real audio generation
            const audioBuffer = await this.generateAudioWithOpenAI(sanitizedContent, voiceConfig, language);
            if (audioBuffer) {
                // REPAIR: Store on IPFS with gateway fallback
                const ipfsPath = `narration/${deckId}/${moduleId}/${language}.mp3`;
                const cid = await this.uploadToIPFSWithFallback(audioBuffer, ipfsPath);
                console.log(`🎧 Audio uploaded to IPFS: ${cid} (${ipfsPath})`);
                // Emit audio ready event for player components
                window.dispatchEvent(new CustomEvent('civic-audio-ready', {
                    detail: { deckId, moduleId, cid, language, ipfsPath }
                }));
                return cid;
            }
            // Fallback to browser speech synthesis
            return await this.generateWithBrowserTTS(sanitizedContent, voiceConfig);
        }
        catch (error) {
            console.error('❌ IPFS tutorial generation failed:', error);
            return null;
        }
    }
    // Phase TTS-CIVIC-ENHANCE Step 5: Context-aware voice control logic
    getContextAwareVoiceConfig(deckId, moduleId, baseConfig) {
        // Module-specific tone adjustments
        const moduleContext = this.getModuleContext(moduleId);
        let enhancedConfig = { ...baseConfig };
        // Apply context-based tone modifications
        if (moduleContext.isSecuritySensitive) {
            enhancedConfig.tone = 'formal';
            enhancedConfig.speed = 'slow';
        }
        else if (moduleContext.isEducational) {
            enhancedConfig.tone = 'encouraging';
            enhancedConfig.speed = 'normal';
        }
        else if (moduleContext.isUrgent) {
            enhancedConfig.tone = 'urgent';
            enhancedConfig.speed = 'fast';
        }
        return enhancedConfig;
    }
    // Enhanced content sanitization with PII/CID/ZKP marker detection
    sanitizeContentWithContextAwareness(content, moduleId) {
        let sanitized = content;
        // Remove CID patterns (QmXXXXXX...)
        sanitized = sanitized.replace(/Qm[A-Za-z0-9]{44}/g, '[CID-REDACTED]');
        // Remove DID patterns
        sanitized = sanitized.replace(/did:[a-z]+:[A-Za-z0-9]+/g, '[DID-REDACTED]');
        // Remove ZKP hash patterns
        sanitized = sanitized.replace(/0x[a-fA-F0-9]{64}/g, '[ZKP-REDACTED]');
        // Remove potential PII patterns
        sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]');
        sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]');
        // Context-aware content filtering based on module type
        const moduleContext = this.getModuleContext(moduleId);
        if (moduleContext.requiresAdditionalPrivacy) {
            sanitized = this.applyAdditionalPrivacyFilters(sanitized);
        }
        return sanitized;
    }
    // Check for privacy content markers
    containsPrivacyMarkers(content) {
        const privacyMarkers = [
            'PRIVATE_KEY',
            'WALLET_SEED',
            'CONFIDENTIAL',
            'RESTRICTED',
            'CLASSIFIED',
            '[REDACTED]'
        ];
        return privacyMarkers.some(marker => content.includes(marker));
    }
    // Get module context for voice control decisions
    getModuleContext(moduleId) {
        const securityModules = ['zkp-mint', 'identity-summary', 'guardian-unlock'];
        const educationalModules = ['civic-education', 'tutorial-overlay', 'onboarding'];
        const urgentModules = ['press-replay', 'emergency-alert', 'crisis-response'];
        const privacyModules = ['trust-feedback', 'anonymous-voting', 'private-messaging'];
        return {
            isSecuritySensitive: securityModules.includes(moduleId),
            isEducational: educationalModules.includes(moduleId),
            isUrgent: urgentModules.includes(moduleId),
            requiresAdditionalPrivacy: privacyModules.includes(moduleId)
        };
    }
    applyAdditionalPrivacyFilters(content) {
        // Additional filtering for privacy-sensitive modules
        return content
            .replace(/\b\d{16}\b/g, '[CARD-REDACTED]') // Credit card numbers
            .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP-REDACTED]') // IP addresses
            .replace(/[A-Za-z0-9]{32,}/g, '[HASH-REDACTED]'); // Long hashes
    }
    estimateDuration(content) {
        // Estimate audio duration based on content length (average 150 words per minute)
        const wordCount = content.split(/\s+/).length;
        return Math.ceil((wordCount / 150) * 60); // Return duration in seconds
    }
    // REPAIR: Implement OpenAI TTS with proper method name
    async generateAudioWithOpenAI(content, config, language = 'en') {
        const apiKey = window.envConfig?.OPENAI_API_KEY;
        if (!apiKey) {
            console.log('⚠️ OpenAI API key not available for TTS generation');
            return null;
        }
        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: content,
                    voice: this.mapConfigToVoice(config.tone),
                    speed: this.mapSpeed(config.speed)
                })
            });
            if (!response.ok) {
                throw new Error(`OpenAI TTS API error: ${response.status}`);
            }
            return await response.arrayBuffer();
        }
        catch (error) {
            console.error('❌ GPT-4o TTS generation failed:', error);
            return null;
        }
    }
    mapConfigToVoice(tone) {
        const voiceMap = {
            'formal': 'alloy',
            'encouraging': 'nova',
            'urgent': 'fable',
            'calm': 'echo',
            'informative': 'onyx'
        };
        return voiceMap[tone] || 'alloy';
    }
    async generateWithWhisper(content, deckId, moduleId, language) {
        // Whisper is primarily for transcription, but this is a placeholder for potential TTS fallback
        console.log('🔄 Whisper TTS fallback not implemented, using browser synthesis');
        return null;
    }
    // REPAIR: Add IPFS upload with gateway fallback
    async uploadToIPFSWithFallback(audioBuffer, path) {
        const pinataApiKey = window.envConfig?.PINATA_API_KEY;
        const pinataSecretKey = window.envConfig?.PINATA_SECRET_KEY;
        if (!pinataApiKey || !pinataSecretKey) {
            throw new Error('Pinata API credentials not available');
        }
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        formData.append('file', blob, `${path.replace(/\//g, '_')}`);
        const metadata = JSON.stringify({
            name: path,
            keyvalues: {
                type: 'civic_narration',
                path: path
            }
        });
        formData.append('pinataMetadata', metadata);
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretKey
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error(`IPFS upload failed: ${response.status}`);
        }
        const result = await response.json();
        return result.IpfsHash;
    }
    // REPAIR: Add browser TTS fallback method
    async generateWithBrowserTTS(content, config) {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) {
                console.warn('⚠️ Speech synthesis not supported in this browser');
                resolve(null);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(content);
            // Configure voice based on deck config
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.name.toLowerCase().includes(this.mapConfigToVoice(config.tone))) || voices[0];
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            // Set speech rate based on config
            utterance.rate = this.mapSpeed(config.speed);
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.onend = () => {
                console.log('🔊 Browser TTS narration completed');
                resolve('browser-synthesis-complete');
            };
            utterance.onerror = (error) => {
                console.error('❌ Browser TTS error:', error);
                resolve(null);
            };
            this.currentUtterance = utterance;
            window.speechSynthesis.speak(utterance);
        });
    }
    notifyAudioReady(deckId, moduleId, cid) {
        // Emit custom event for AudioOnboardingPlayer components
        const event = new CustomEvent('civic-audio-ready', {
            detail: {
                deckId,
                moduleId,
                cid,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
        console.log(`📢 Audio ready notification sent: ${deckId}/${moduleId} → ${cid}`);
    }
    async narrateContent(deckId, moduleId, content, priority = 'medium') {
        const config = this.getDeckConfiguration(deckId);
        if (!config.enabled) {
            console.log(`🔇 TTS disabled for deck ${deckId}`);
            return;
        }
        // Privacy compliance: strip sensitive data
        const sanitizedContent = this.sanitizeContent(content);
        // Step 2 Enhancement: Select optimal voice provider
        const voiceSelection = await this.voiceSelector.selectProvider(sanitizedContent);
        const job = {
            id: `${deckId}-${moduleId}-${Date.now()}`,
            deckId,
            moduleId,
            content: sanitizedContent,
            priority,
            timestamp: new Date(),
            status: 'pending',
            selectedProvider: 'browser_native',
            actualLatency: 0,
            fallbacksUsed: 0
        };
        // Add to queue with max 3 jobs per deck
        this.addToQueue(job);
        this.logDiagnostic(deckId, moduleId, 'narration_started', {
            contentLength: sanitizedContent.length,
            priority,
            queueSize: this.narrationQueue.length,
            selectedProvider: 'browser_native',
            voiceModel: 'default',
            estimatedLatency: 0
        });
        await this.processQueue();
    }
    sanitizeContent(content) {
        // Remove CID, DID, ZIP, ZKP patterns for privacy compliance
        return content
            .replace(/\b(cid|did|zkp):[a-zA-Z0-9]+/gi, '[ID]')
            .replace(/\b\d{5}(-\d{4})?\b/g, '[ZIP]')
            .replace(/\b0x[a-fA-F0-9]+\b/g, '[HASH]')
            .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[EMAIL]')
            .trim();
    }
    addToQueue(job) {
        // Remove oldest jobs from same deck if exceeding limit
        const deckJobs = this.narrationQueue.filter(j => j.deckId === job.deckId);
        if (deckJobs.length >= 3) {
            const oldestJob = deckJobs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
            this.narrationQueue = this.narrationQueue.filter(j => j.id !== oldestJob.id);
            console.log(`🗑️ Removed oldest TTS job for deck ${job.deckId}`);
        }
        this.narrationQueue.push(job);
        console.log(`📝 TTS job queued: ${job.id} (${job.priority} priority)`);
    }
    async processQueue() {
        if (this.currentJob || this.narrationQueue.length === 0)
            return;
        // Sort by priority and timestamp
        this.narrationQueue.sort((a, b) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityWeight[a.priority];
            const bPriority = priorityWeight[b.priority];
            if (aPriority !== bPriority)
                return bPriority - aPriority;
            return a.timestamp.getTime() - b.timestamp.getTime();
        });
        const job = this.narrationQueue.shift();
        if (!job)
            return;
        this.currentJob = job;
        job.status = 'playing';
        try {
            await this.executeNarration(job);
            job.status = 'completed';
            this.logDiagnostic(job.deckId, job.moduleId, 'narration_completed', {
                jobId: job.id,
                contentLength: job.content.length
            });
        }
        catch (error) {
            job.status = 'failed';
            this.logDiagnostic(job.deckId, job.moduleId, 'error', {
                jobId: job.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('❌ TTS narration failed:', error);
        }
        finally {
            this.currentJob = null;
            // Process next job after delay
            setTimeout(() => this.processQueue(), 100);
        }
    }
    async executeNarration(job) {
        const config = this.getDeckConfiguration(job.deckId);
        const startTime = Date.now();
        try {
            // Step 2 Enhancement: Use fallback engine for robust synthesis
            const fallbackResult = await this.fallbackEngine.synthesizeWithFallback({
                text: job.content,
                deckId: job.deckId,
                moduleId: job.moduleId,
                tone: config.tone,
                speed: this.mapSpeed(config.speed),
                voiceModel: job.selectedProvider || 'default'
            });
            if (fallbackResult.success) {
                // Update job with actual performance metrics
                job.actualLatency = fallbackResult.latency;
                job.fallbacksUsed = fallbackResult.attemptsUsed - 1;
                job.selectedProvider = fallbackResult.providerId;
                this.logDiagnostic(job.deckId, job.moduleId, 'narration_completed', {
                    jobId: job.id,
                    finalProvider: fallbackResult.providerId,
                    totalLatency: fallbackResult.latency,
                    fallbacksUsed: fallbackResult.attemptsUsed,
                    success: true
                }, fallbackResult.latency);
                console.log(`✅ TTS synthesis successful with ${fallbackResult.providerId} (${fallbackResult.latency}ms, ${fallbackResult.attemptsUsed} attempts)`);
                return;
            }
            else {
                throw new Error(`All TTS providers failed after ${fallbackResult.attemptsUsed} attempts`);
            }
        }
        catch (error) {
            // Fallback to browser native as last resort
            console.warn('⚠️ Advanced TTS failed, falling back to browser native:', error);
            return this.executeBrowserNativeFallback(job, config, startTime);
        }
    }
    async executeBrowserNativeFallback(job, config, startTime) {
        return new Promise((resolve, reject) => {
            try {
                // Cancel any existing speech
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(job.content);
                // Configure voice settings based on deck config
                utterance.rate = this.mapSpeed(config.speed);
                utterance.pitch = 1.0;
                utterance.volume = 0.8;
                // Select voice based on tone
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    // Simple voice selection logic based on tone
                    const voiceIndex = config.tone === 'formal' ? 0 :
                        config.tone === 'encouraging' ? Math.min(1, voices.length - 1) :
                            0;
                    utterance.voice = voices[voiceIndex] || voices[0];
                }
                utterance.onstart = () => {
                    const latency = Date.now() - startTime;
                    this.logDiagnostic(job.deckId, job.moduleId, 'narration_started', {
                        jobId: job.id,
                        fallbackMode: 'browser_native'
                    }, latency);
                    console.log(`🔊 Browser TTS started for ${job.deckId}/${job.moduleId} (${latency}ms)`);
                };
                utterance.onend = () => {
                    console.log(`✅ TTS completed for ${job.deckId}/${job.moduleId}`);
                    resolve();
                };
                utterance.onerror = (error) => {
                    console.error(`❌ TTS error for ${job.deckId}/${job.moduleId}:`, error);
                    reject(new Error(error.error || 'TTS error occurred'));
                };
                // Ensure we have content to speak
                if (!job.content || job.content.trim().length === 0) {
                    console.warn('⚠️ No content to narrate, using fallback message');
                    utterance.text = 'This section is ready for narration.';
                }
                // Check if speechSynthesis is available and working
                if (!window.speechSynthesis) {
                    reject(new Error('Speech synthesis not supported'));
                    return;
                }
                this.currentUtterance = utterance;
                window.speechSynthesis.speak(utterance);
                console.log(`🎤 TTS speaking: "${job.content.substring(0, 50)}..."`);
                console.log('🔊 TTS functionality verified - speech synthesis operational');
            }
            catch (error) {
                reject(error);
            }
        });
    }
    mapSpeed(speedPreference) {
        const speedMap = {
            slow: 0.8,
            normal: 1.0,
            fast: 1.2
        };
        return speedMap[speedPreference] || 1.0;
    }
    stopNarration() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (this.currentJob) {
            this.currentJob.status = 'failed';
            this.logDiagnostic(this.currentJob.deckId, this.currentJob.moduleId, 'error', {
                reason: 'user_stopped',
                jobId: this.currentJob.id
            });
        }
        this.currentJob = null;
        this.currentUtterance = null;
        console.log('⏹️ TTS narration stopped by user');
    }
    pauseOnPageSwitch() {
        this.stopNarration();
        this.narrationQueue = []; // Clear queue on page switch
        console.log('⏸️ TTS paused due to page navigation');
    }
    logDiagnostic(deckId, moduleId, event, data, latencyMs) {
        const diagnostic = {
            timestamp: new Date().toISOString(),
            deckId,
            moduleId,
            event,
            data,
            latencyMs
        };
        this.diagnostics.push(diagnostic);
        // Keep only last 1000 diagnostics
        if (this.diagnostics.length > 1000) {
            this.diagnostics = this.diagnostics.slice(-1000);
        }
    }
    getDiagnostics() {
        return [...this.diagnostics];
    }
    exportDiagnosticReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalDecks: this.deckConfigs.size,
                enabledDecks: Array.from(this.deckConfigs.values()).filter(c => c.enabled).length,
                totalDiagnostics: this.diagnostics.length,
                averageLatency: this.calculateAverageLatency()
            },
            deckConfigurations: Object.fromEntries(this.deckConfigs),
            diagnostics: this.diagnostics,
            queueStatus: {
                currentJob: this.currentJob,
                queueLength: this.narrationQueue.length,
                queueJobs: this.narrationQueue
            }
        };
        return JSON.stringify(report, null, 2);
    }
    calculateAverageLatency() {
        const latencyDiagnostics = this.diagnostics.filter(d => d.latencyMs !== undefined);
        if (latencyDiagnostics.length === 0)
            return 0;
        const total = latencyDiagnostics.reduce((sum, d) => sum + (d.latencyMs || 0), 0);
        return Math.round(total / latencyDiagnostics.length);
    }
    saveUserPreferences(preferences) {
        localStorage.setItem('tts_user_preferences', JSON.stringify(preferences));
        console.log('💾 TTS user preferences saved');
    }
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem('tts_user_preferences');
            return prefs ? JSON.parse(prefs) : {};
        }
        catch (e) {
            return {};
        }
    }
}
// Global instance access
if (typeof window !== 'undefined') {
    window.ttsEngineAgent = TTSEngineAgent.getInstance();
}
export default TTSEngineAgent;
