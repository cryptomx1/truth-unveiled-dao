/**
 * VoiceProviderSelector.ts
 * Phase TTS-CIVIC-ENHANCE Step 3: Voice provider selection system
 * Commander Mark directive via JASMY Relay
 */
export class VoiceProviderSelector {
    static instance;
    selectedProvider = 'auto';
    providers = [
        {
            id: 'auto',
            name: 'Auto-Select Best',
            status: 'online',
            premium: false,
            description: 'Intelligent provider selection based on performance',
            latency: 145,
            qualityScore: 85
        },
        {
            id: 'openai_gpt4o',
            name: 'OpenAI GPT-4o Voice',
            status: 'online',
            premium: true,
            description: 'Premium AI voice synthesis with natural intonation',
            latency: 120,
            qualityScore: 95
        },
        {
            id: 'google_cloud',
            name: 'Google Cloud TTS',
            status: 'online',
            premium: true,
            description: 'WaveNet neural voices with multilingual support',
            latency: 200,
            qualityScore: 88
        },
        {
            id: 'playht',
            name: 'Play.ht Premium',
            status: 'degraded',
            premium: true,
            description: 'Ultra-realistic AI voices with emotional range',
            latency: 350,
            qualityScore: 92
        },
        {
            id: 'wellsaid',
            name: 'WellSaid Labs',
            status: 'degraded',
            premium: true,
            description: 'Human-like voice avatars for professional content',
            latency: 280,
            qualityScore: 90
        },
        {
            id: 'browser_native',
            name: 'Browser Native TTS',
            status: 'online',
            premium: false,
            description: 'Built-in browser speech synthesis (fallback)',
            latency: 50,
            qualityScore: 65
        }
    ];
    static getInstance() {
        if (!VoiceProviderSelector.instance) {
            VoiceProviderSelector.instance = new VoiceProviderSelector();
        }
        return VoiceProviderSelector.instance;
    }
    constructor() {
        // Load saved provider preference
        const saved = localStorage.getItem('tts_voice_provider');
        if (saved && this.providers.find(p => p.id === saved)) {
            this.selectedProvider = saved;
        }
        console.log('🎤 VoiceProviderSelector initialized with', this.providers.length, 'providers');
    }
    getAvailableProviders() {
        return [...this.providers];
    }
    getSelectedProvider() {
        return this.providers.find(p => p.id === this.selectedProvider) || this.providers[0];
    }
    selectProvider(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) {
            console.warn('⚠️ Unknown voice provider:', providerId);
            return false;
        }
        this.selectedProvider = providerId;
        localStorage.setItem('tts_voice_provider', providerId);
        console.log('🎤 Voice provider selected:', provider.name);
        return true;
    }
    getBestAvailableProvider() {
        if (this.selectedProvider !== 'auto') {
            const selected = this.getSelectedProvider();
            if (selected.status === 'online') {
                return selected;
            }
        }
        // Auto-select based on status and performance
        const onlineProviders = this.providers.filter(p => p.status === 'online');
        if (onlineProviders.length === 0) {
            return this.providers.find(p => p.id === 'browser_native');
        }
        // Score based on quality and latency (lower latency is better)
        const scored = onlineProviders.map(p => ({
            provider: p,
            score: p.qualityScore - (p.latency / 10)
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored[0].provider;
    }
    updateProviderStatus(providerId, status) {
        const provider = this.providers.find(p => p.id === providerId);
        if (provider) {
            provider.status = status;
            console.log(`🎤 Provider ${provider.name} status updated:`, status);
        }
    }
    getProviderHealthReport() {
        const online = this.providers.filter(p => p.status === 'online').length;
        const degraded = this.providers.filter(p => p.status === 'degraded').length;
        const offline = this.providers.filter(p => p.status === 'offline').length;
        return {
            total: this.providers.length,
            online,
            degraded,
            offline,
            bestProvider: this.getBestAvailableProvider().name
        };
    }
}
export default VoiceProviderSelector;
