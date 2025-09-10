import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Globe, Flag } from 'lucide-react';
import { useLang } from './AccessibilityHarmonyEngine';
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' }
];
// Mock translation dictionary for civic phrases
const CIVIC_TRANSLATIONS = {
    'My Trust Score': {
        en: 'My Trust Score',
        es: 'Mi Puntuación de Confianza',
        fr: 'Mon Score de Confiance'
    },
    'Submit Feedback': {
        en: 'Submit Feedback',
        es: 'Enviar Comentarios',
        fr: 'Soumettre des Commentaires'
    },
    'Governance Dashboard': {
        en: 'Governance Dashboard',
        es: 'Panel de Gobernanza',
        fr: 'Tableau de Gouvernance'
    },
    'Identity Verification': {
        en: 'Identity Verification',
        es: 'Verificación de Identidad',
        fr: 'Vérification d\'Identité'
    },
    'Civic Engagement': {
        en: 'Civic Engagement',
        es: 'Compromiso Cívico',
        fr: 'Engagement Civique'
    },
    'Trust Points': {
        en: 'Trust Points',
        es: 'Puntos de Confianza',
        fr: 'Points de Confiance'
    },
    'Contribution Credits': {
        en: 'Contribution Credits',
        es: 'Créditos de Contribución',
        fr: 'Crédits de Contribution'
    },
    'Vote on Proposals': {
        en: 'Vote on Proposals',
        es: 'Votar en Propuestas',
        fr: 'Voter sur les Propositions'
    },
    'Privacy Settings': {
        en: 'Privacy Settings',
        es: 'Configuración de Privacidad',
        fr: 'Paramètres de Confidentialité'
    },
    'Security Audit': {
        en: 'Security Audit',
        es: 'Auditoría de Seguridad',
        fr: 'Audit de Sécurité'
    },
    'Community Forum': {
        en: 'Community Forum',
        es: 'Foro de la Comunidad',
        fr: 'Forum Communautaire'
    },
    'Educational Resources': {
        en: 'Educational Resources',
        es: 'Recursos Educativos',
        fr: 'Ressources Éducatives'
    },
    'Wallet Overview': {
        en: 'Wallet Overview',
        es: 'Resumen de Billetera',
        fr: 'Aperçu du Portefeuille'
    },
    'ZKP Verification': {
        en: 'ZKP Verification',
        es: 'Verificación ZKP',
        fr: 'Vérification ZKP'
    },
    'Civic Proposals': {
        en: 'Civic Proposals',
        es: 'Propuestas Cívicas',
        fr: 'Propositions Civiques'
    }
};
export const LanguageToggle = ({ className = '', showFlag = true, compact = false }) => {
    const { lang, setLang } = useLang();
    const [isOpen, setIsOpen] = useState(false);
    const [renderTime, setRenderTime] = useState(0);
    const dropdownRef = useRef(null);
    const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
    // Handle language change
    const handleLanguageChange = (newLang) => {
        const startTime = Date.now();
        setLang(newLang);
        setIsOpen(false);
        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', newLang);
        document.documentElement.setAttribute('dir', SUPPORTED_LANGUAGES.find(l => l.code === newLang)?.direction || 'ltr');
        const responseTime = Date.now() - startTime;
        setRenderTime(responseTime);
        if (responseTime > 50) {
            console.warn(`⚠️ Language toggle response time: ${responseTime}ms (exceeds 50ms target)`);
        }
        console.log(`🌍 Language set to: ${newLang.toUpperCase()}`);
        console.log(`🌐 MULTILINGUAL ENGINE ONLINE`);
        // Log for future TTS speech engine handoff
        console.log(`🎤 TTS Language Context: ${newLang} (${SUPPORTED_LANGUAGES.find(l => l.code === newLang)?.name})`);
    };
    // Handle outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);
    return (<div className={`relative ${className}`} ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${compact ? 'text-sm' : 'text-base'} bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500`} aria-label={`Current language: ${currentLanguage.name}. Click to change language.`} aria-expanded={isOpen} aria-haspopup="listbox">
        {showFlag && (<span className="text-lg" role="img" aria-label={`${currentLanguage.name} flag`}>
            {currentLanguage.flag}
          </span>)}
        <span className="font-medium">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
      </button>

      {isOpen && (<div className="absolute top-full mt-1 left-0 z-50 bg-slate-800 border border-slate-600 rounded-md shadow-lg overflow-hidden min-w-[150px]">
          <div className="py-1" role="listbox" aria-label="Language options">
            {SUPPORTED_LANGUAGES.map((language) => (<button key={language.code} onClick={() => handleLanguageChange(language.code)} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-slate-700 ${language.code === lang ? 'bg-slate-700 text-blue-400' : 'text-white'}`} role="option" aria-selected={language.code === lang} aria-label={`Select ${language.name}`}>
                <span className="text-base" role="img" aria-label={`${language.name} flag`}>
                  {language.flag}
                </span>
                <span className="font-medium">{language.name}</span>
                {language.code === lang && (<span className="ml-auto text-blue-400 text-xs">✓</span>)}
              </button>))}
          </div>
        </div>)}

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && renderTime > 0 && (<div className="absolute top-full mt-1 right-0 text-xs text-slate-400">
          {renderTime}ms
        </div>)}
    </div>);
};
export const TranslatedText = ({ children, textKey, fallback, className = '', showBadge = false }) => {
    const { lang } = useLang();
    const [swapTime, setSwapTime] = useState(0);
    // Get translated text
    const getTranslatedText = (text) => {
        const startTime = Date.now();
        // Use textKey if provided, otherwise use text content
        const key = textKey || text;
        const translation = CIVIC_TRANSLATIONS[key]?.[lang] || text || fallback || key;
        const responseTime = Date.now() - startTime;
        setSwapTime(responseTime);
        if (responseTime > 5) {
            console.warn(`⚠️ Dictionary swap time: ${responseTime}ms (exceeds 5ms target)`);
        }
        return translation;
    };
    // If children is a string, translate it
    if (typeof children === 'string') {
        const translatedText = getTranslatedText(children);
        return (<span className={`${className} ${lang !== 'en' ? 'font-medium' : ''}`}>
        {translatedText}
        {showBadge && lang !== 'en' && (<span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
            <Flag className="w-3 h-3 mr-1"/>
            {lang.toUpperCase()}
          </span>)}
      </span>);
    }
    // For complex children, attempt to find and translate text nodes
    return (<span className={className}>
      {children}
      {showBadge && lang !== 'en' && (<span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
          <Flag className="w-3 h-3 mr-1"/>
          {lang.toUpperCase()}
        </span>)}
    </span>);
};
export const OverlayTranslatorWrapper = ({ children, className = '', autoTranslate = true, showLanguageToggle = true }) => {
    const { lang } = useLang();
    const [renderTime, setRenderTime] = useState(0);
    const wrapperRef = useRef(null);
    // Auto-translate common civic phrases in child elements
    useEffect(() => {
        if (!autoTranslate || lang === 'en')
            return;
        const startTime = Date.now();
        const translateTextNodes = (element) => {
            const textNodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
            let textNode;
            let translatedCount = 0;
            while (textNode = textNodes.nextNode()) {
                const text = textNode.textContent?.trim();
                if (text && CIVIC_TRANSLATIONS[text]) {
                    const translation = CIVIC_TRANSLATIONS[text][lang];
                    if (translation && translation !== text) {
                        textNode.textContent = translation;
                        translatedCount++;
                    }
                }
            }
            return translatedCount;
        };
        if (wrapperRef.current) {
            const translatedCount = translateTextNodes(wrapperRef.current);
            console.log(`🌐 Auto-translated ${translatedCount} civic phrases to ${lang.toUpperCase()}`);
        }
        const totalTime = Date.now() - startTime;
        setRenderTime(totalTime);
        if (totalTime > 50) {
            console.warn(`⚠️ Auto-translation time: ${totalTime}ms (exceeds 50ms target)`);
        }
    }, [lang, autoTranslate]);
    return (<div className={`relative ${className}`} ref={wrapperRef}>
      {showLanguageToggle && (<div className="absolute top-4 right-4 z-40">
          <LanguageToggle compact showFlag/>
        </div>)}
      
      {children}
      
      {/* Language indicator badge */}
      {lang !== 'en' && (<div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-600">
          <Globe className="w-4 h-4 text-blue-400"/>
          <span className="text-sm font-medium">
            {SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name || lang.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">
            {lang.toUpperCase()}
          </span>
        </div>)}
      
      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && renderTime > 0 && (<div className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white p-2 rounded-lg text-xs border border-slate-600">
          <div className="font-bold mb-1">🌐 Translation Engine</div>
          <div>Auto-translate: {renderTime}ms</div>
          <div>Language: {lang.toUpperCase()}</div>
        </div>)}
    </div>);
};
export const MultilingualPrepExtension = ({ children, className = '', enableOverlay = true, enableAutoTranslate = true, showLanguageToggle = true }) => {
    const { lang } = useLang();
    const [initialized, setInitialized] = useState(false);
    // Initialize multilingual system
    useEffect(() => {
        if (initialized)
            return;
        console.log('🌐 MULTILINGUAL ENGINE ONLINE');
        console.log(`🌍 Initial language: ${lang.toUpperCase()}`);
        // Set HTML attributes
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', SUPPORTED_LANGUAGES.find(l => l.code === lang)?.direction || 'ltr');
        setInitialized(true);
    }, [lang, initialized]);
    // Render with or without overlay
    if (enableOverlay) {
        return (<OverlayTranslatorWrapper className={className} autoTranslate={enableAutoTranslate} showLanguageToggle={showLanguageToggle}>
        {children}
      </OverlayTranslatorWrapper>);
    }
    return (<div className={className}>
      {children}
    </div>);
};
// Utility functions for external use
export const translateText = (text, lang) => {
    return CIVIC_TRANSLATIONS[text]?.[lang] || text;
};
export const getSupportedLanguages = () => {
    return [...SUPPORTED_LANGUAGES];
};
export const getCurrentLanguageConfig = (lang) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === lang) || null;
};
export default MultilingualPrepExtension;
