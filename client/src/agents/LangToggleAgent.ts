// LangToggleAgent.ts - Phase TRILAYER v1.0 Module 3
// Multi-language toggle agent for civic deck internationalization
// Commander Mark directive via JASMY Relay

export interface LanguageOption {
  code: string;
  flag: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export interface LanguageContext {
  currentLanguage: string;
  availableLanguages: LanguageOption[];
  isLoading: boolean;
  lastError?: string;
}

export interface TranslationRequest {
  content: string;
  fromLang: string;
  toLang: string;
  deckId: string;
  moduleId: string;
  contentType: 'title' | 'body' | 'button' | 'label' | 'narration';
}

export interface TranslationResult {
  translatedContent: string;
  confidence: number;
  method: 'gpt4o' | 'local' | 'cached';
  processingTime: number;
}

export class LangToggleAgent {
  private static instance: LangToggleAgent;
  private currentLanguage: string = 'en';
  private translationCache: Map<string, TranslationResult> = new Map();
  private listeners: Set<(context: LanguageContext) => void> = new Set();
  private isInitialized = false;

  // Supported languages for civic engagement
  private supportedLanguages: LanguageOption[] = [
    { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
    { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
    { code: 'pt', flag: '🇵🇹', name: 'Portuguese', nativeName: 'Português' },
    { code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
    { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية', rtl: true }
  ];

  static getInstance(): LangToggleAgent {
    if (!LangToggleAgent.instance) {
      LangToggleAgent.instance = new LangToggleAgent();
    }
    return LangToggleAgent.instance;
  }

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent() {
    if (this.isInitialized) return;

    console.log('🌐 LangToggleAgent initializing — Multi-language civic engagement');

    // Load saved language preference
    const savedLanguage = localStorage.getItem('civic_language_preference');
    if (savedLanguage && this.supportedLanguages.find(lang => lang.code === savedLanguage)) {
      this.currentLanguage = savedLanguage;
      console.log(`🗣️ Restored language preference: ${savedLanguage}`);
    }

    // Load cached translations
    this.loadTranslationCache();

    // Set document language and direction
    this.updateDocumentLanguage();

    this.isInitialized = true;
    console.log('✅ LangToggleAgent operational — Multi-language system ready');
    
    // Notify listeners
    this.notifyListeners();
  }

  private loadTranslationCache() {
    try {
      const cached = localStorage.getItem('civic_translation_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.translationCache = new Map(Object.entries(cacheData));
        console.log(`💾 Loaded ${this.translationCache.size} cached translations`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load translation cache:', error);
    }
  }

  private saveTranslationCache() {
    try {
      const cacheObj = Object.fromEntries(this.translationCache);
      localStorage.setItem('civic_translation_cache', JSON.stringify(cacheObj));
    } catch (error) {
      console.warn('⚠️ Failed to save translation cache:', error);
    }
  }

  private updateDocumentLanguage() {
    const selectedLang = this.supportedLanguages.find(lang => lang.code === this.currentLanguage);
    if (selectedLang) {
      document.documentElement.lang = selectedLang.code;
      document.documentElement.dir = selectedLang.rtl ? 'rtl' : 'ltr';
      
      // Update CSS custom properties for RTL support
      if (selectedLang.rtl) {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  public getLanguageContext(): LanguageContext {
    return {
      currentLanguage: this.currentLanguage,
      availableLanguages: this.supportedLanguages,
      isLoading: false
    };
  }

  public async switchLanguage(languageCode: string): Promise<boolean> {
    const targetLang = this.supportedLanguages.find(lang => lang.code === languageCode);
    if (!targetLang) {
      console.error(`❌ Unsupported language: ${languageCode}`);
      return false;
    }

    const previousLanguage = this.currentLanguage;
    this.currentLanguage = languageCode;

    try {
      // Save preference
      localStorage.setItem('civic_language_preference', languageCode);
      
      // Update document properties
      this.updateDocumentLanguage();

      console.log(`🔄 Language switched: ${previousLanguage} → ${languageCode}`);
      
      // Notify listeners to trigger re-renders
      this.notifyListeners();

      // Trigger page re-render in current module
      this.triggerModuleRerender();

      return true;
    } catch (error) {
      console.error('❌ Language switch failed:', error);
      
      // Rollback on failure
      this.currentLanguage = previousLanguage;
      this.updateDocumentLanguage();
      
      return false;
    }
  }

  public async translateContent(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = Date.now();
    const cacheKey = `${request.fromLang}-${request.toLang}-${this.hashContent(request.content)}`;

    // Check cache first
    const cached = this.translationCache.get(cacheKey);
    if (cached) {
      console.log(`💾 Using cached translation for ${request.contentType}`);
      return cached;
    }

    try {
      // Try GPT-4o translation first
      const gptResult = await this.translateWithGPT4o(request);
      if (gptResult) {
        const result: TranslationResult = {
          translatedContent: gptResult,
          confidence: 0.95,
          method: 'gpt4o',
          processingTime: Date.now() - startTime
        };
        
        this.translationCache.set(cacheKey, result);
        this.saveTranslationCache();
        return result;
      }
    } catch (error) {
      console.warn('⚠️ GPT-4o translation failed, falling back to local:', error);
    }

    // Fallback to local translation
    const localResult = this.translateLocally(request);
    const result: TranslationResult = {
      translatedContent: localResult,
      confidence: 0.7,
      method: 'local',
      processingTime: Date.now() - startTime
    };

    this.translationCache.set(cacheKey, result);
    this.saveTranslationCache();
    return result;
  }

  private async translateWithGPT4o(request: TranslationRequest): Promise<string | null> {
    // Check if OpenAI API key is available
    const apiKey = (window as any).envConfig?.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const targetLang = this.supportedLanguages.find(lang => lang.code === request.toLang);
    if (!targetLang) return null;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cost-optimized for translations
          messages: [
            {
              role: 'system',
              content: `You are a professional translator specializing in civic engagement content. Translate the following ${request.contentType} from ${request.fromLang} to ${request.toLang} (${targetLang.nativeName}). Maintain the formal, civic tone and preserve any technical terms. Return only the translated text without explanations.`
            },
            {
              role: 'user',
              content: request.content
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.choices[0]?.message?.content?.trim();
      
      if (translatedText) {
        console.log(`🧠 GPT-4o translation completed: ${request.fromLang} → ${request.toLang}`);
        return translatedText;
      }

      return null;
    } catch (error) {
      console.error('❌ GPT-4o translation error:', error);
      return null;
    }
  }

  private translateLocally(request: TranslationRequest): string {
    // Simple local translation fallback with basic term mapping
    const translations: Record<string, Record<string, string>> = {
      'es': {
        'Governance': 'Gobernanza',
        'Privacy': 'Privacidad',
        'Identity': 'Identidad',
        'Education': 'Educación',
        'Justice': 'Justicia',
        'Vote': 'Votar',
        'Submit': 'Enviar',
        'Cancel': 'Cancelar',
        'Welcome': 'Bienvenido',
        'Dashboard': 'Panel de Control'
      },
      'fr': {
        'Governance': 'Gouvernance',
        'Privacy': 'Confidentialité',
        'Identity': 'Identité',
        'Education': 'Éducation',
        'Justice': 'Justice',
        'Vote': 'Voter',
        'Submit': 'Soumettre',
        'Cancel': 'Annuler',
        'Welcome': 'Bienvenue',
        'Dashboard': 'Tableau de Bord'
      }
    };

    const langMap = translations[request.toLang];
    if (!langMap) {
      return request.content; // Return original if no mapping
    }

    let translatedContent = request.content;
    Object.entries(langMap).forEach(([english, translation]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedContent = translatedContent.replace(regex, translation);
    });

    return translatedContent;
  }

  private triggerModuleRerender() {
    // Emit custom event for module re-render
    const event = new CustomEvent('civic-language-changed', {
      detail: {
        newLanguage: this.currentLanguage,
        timestamp: Date.now()
      }
    });
    
    window.dispatchEvent(event);
    console.log('🔄 Module re-render triggered for language change');
  }

  private hashContent(content: string): string {
    // Simple hash for cache keys
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  public subscribe(listener: (context: LanguageContext) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current context
    listener(this.getLanguageContext());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const context = this.getLanguageContext();
    this.listeners.forEach(listener => {
      try {
        listener(context);
      } catch (error) {
        console.error('❌ Language context listener error:', error);
      }
    });
  }

  public clearCache() {
    this.translationCache.clear();
    localStorage.removeItem('civic_translation_cache');
    console.log('🗑️ Translation cache cleared');
  }

  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.translationCache.size,
      keys: Array.from(this.translationCache.keys())
    };
  }

  public exportDiagnostics(): string {
    const diagnostics = {
      currentLanguage: this.currentLanguage,
      supportedLanguages: this.supportedLanguages.length,
      cacheSize: this.translationCache.size,
      listenersCount: this.listeners.size,
      isInitialized: this.isInitialized,
      documentLanguage: document.documentElement.lang,
      documentDirection: document.documentElement.dir
    };

    return JSON.stringify(diagnostics, null, 2);
  }
}

// Global instance access
if (typeof window !== 'undefined') {
  (window as any).langToggleAgent = LangToggleAgent.getInstance();
}

export default LangToggleAgent;