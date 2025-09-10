/**
 * Phase XI-C: LanguageContextAudit.tsx
 * Language Toggle Patch & Context Sync Audit
 * Authority: Commander Mark | JASMY Relay authorization
 * Commit: LANGUAGE_CONTEXT_AUDIT_PHASE_XI_C
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useUserSession as useUserSessionEngine } from './UserSessionEngine';
import { useLangContext } from '../../context/LanguageContext';
// Language definitions with display names
const SUPPORTED_LANGUAGES = {
    en: { code: 'en', name: 'English', flag: '🇺🇸' },
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    fr: { code: 'fr', name: 'Français', flag: '🇫🇷' }
};
// Localized ARIA labels
const ARIA_LABELS = {
    en: 'Toggle Language',
    es: 'Cambiar Idioma',
    fr: 'Changer de Langue'
};
export const LanguageToggle = ({ className = '', compact = false }) => {
    const sessionEngine = useUserSessionEngine();
    const langContext = useLangContext();
    // Get current language from session engine (canonical source)
    const currentLang = sessionEngine.session.lang;
    const [isOpen, setIsOpen] = useState(false);
    // Handle language toggle with full sync pipeline
    const handleLanguageChange = useCallback((newLang) => {
        console.log(`🌐 Language toggled to: ${newLang.toUpperCase()}`);
        // Step 1: Update UserSession (canonical source)
        sessionEngine.updateLang(newLang);
        // Step 2: Update LangContext for UI consistency 
        langContext.setLanguage(newLang);
        // Step 3: Update document language attribute
        document.documentElement.setAttribute('lang', newLang);
        // Step 4: Console confirmation
        console.log(`🌍 Language set to: ${newLang.toUpperCase()}`);
        setIsOpen(false);
    }, [sessionEngine, langContext]);
    // Sync check and fallback enforcement
    useEffect(() => {
        // Validate session has valid language, apply fallback if needed
        const validLanguages = ['en', 'es', 'fr'];
        if (!validLanguages.includes(currentLang)) {
            console.log('🔁 Fallback language applied: en');
            handleLanguageChange('en');
        }
        // Ensure LangContext is in sync with session
        if (langContext.language !== currentLang) {
            langContext.setLanguage(currentLang);
        }
    }, [currentLang, langContext, handleLanguageChange]);
    const currentLangData = SUPPORTED_LANGUAGES[currentLang];
    const ariaLabel = ARIA_LABELS[currentLang];
    if (compact) {
        // Compact version for mobile/nav
        return (<div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-1 px-2 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors ${className}`} aria-label={ariaLabel} aria-expanded={isOpen} title={`${ariaLabel} (${currentLangData.name})`}>
          <span className="text-xs">{currentLangData.flag}</span>
          <span className="hidden sm:inline text-xs">{currentLang.toUpperCase()}</span>
        </button>
        
        {isOpen && (<div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg z-50 min-w-[120px]" role="menu" aria-label="Language selection menu">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (<button key={code} onClick={() => handleLanguageChange(code)} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 ${currentLang === code ? 'bg-slate-600 text-blue-300' : 'text-white'}`} role="menuitem" aria-current={currentLang === code ? 'true' : 'false'}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>))}
          </div>)}
      </div>);
    }
    // Full version for desktop/header
    return (<div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-slate-400">🌐</span>
      <select value={currentLang} onChange={(e) => handleLanguageChange(e.target.value)} className="bg-slate-700 text-white border border-slate-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-label={ariaLabel} title={ariaLabel}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (<option key={code} value={code}>
            {lang.flag} {lang.name}
          </option>))}
      </select>
    </div>);
};
export const LanguageContextAudit = ({ children, enableDebugLogs = true }) => {
    const sessionEngine = useUserSessionEngine();
    const langContext = useLangContext();
    const [auditComplete, setAuditComplete] = useState(false);
    // Audit and sync language contexts on mount
    useEffect(() => {
        const performLanguageAudit = () => {
            if (enableDebugLogs) {
                console.log('🔍 Language Context Audit Starting...');
            }
            const sessionLang = sessionEngine.session.lang;
            const contextLang = langContext.language;
            // Report audit findings
            if (enableDebugLogs) {
                console.log(`📊 Audit Results:`);
                console.log(`  SessionEngine.lang: ${sessionLang}`);
                console.log(`  LangContext.language: ${contextLang}`);
                console.log(`  Document.lang: ${document.documentElement.lang || 'unset'}`);
            }
            // Fix mismatches - SessionEngine is canonical source
            let syncRequired = false;
            if (contextLang !== sessionLang) {
                langContext.setLanguage(sessionLang);
                syncRequired = true;
                if (enableDebugLogs) {
                    console.log(`🔧 Fixed LangContext mismatch: ${contextLang} → ${sessionLang}`);
                }
            }
            if (document.documentElement.lang !== sessionLang) {
                document.documentElement.setAttribute('lang', sessionLang);
                syncRequired = true;
                if (enableDebugLogs) {
                    console.log(`🔧 Fixed document.lang mismatch: ${document.documentElement.lang} → ${sessionLang}`);
                }
            }
            // Validate language is supported
            const validLanguages = ['en', 'es', 'fr'];
            if (!validLanguages.includes(sessionLang)) {
                console.log('🔁 Fallback language applied: en');
                sessionEngine.updateLang('en');
                syncRequired = true;
            }
            if (enableDebugLogs) {
                if (syncRequired) {
                    console.log('✅ Language Context Audit: Synchronization Complete');
                }
                else {
                    console.log('✅ Language Context Audit: All contexts in sync');
                }
            }
            setAuditComplete(true);
        };
        // Run audit after component mount
        setTimeout(performLanguageAudit, 100);
    }, [sessionEngine, langContext, enableDebugLogs]);
    // Monitor for future sync issues
    useEffect(() => {
        if (!auditComplete)
            return;
        const sessionLang = sessionEngine.session.lang;
        const contextLang = langContext.language;
        if (sessionLang !== contextLang) {
            if (enableDebugLogs) {
                console.log(`⚠️ Language drift detected: Session(${sessionLang}) vs Context(${contextLang})`);
            }
            // Re-sync with SessionEngine as source of truth
            langContext.setLanguage(sessionLang);
        }
    }, [sessionEngine.session.lang, langContext.language, auditComplete, enableDebugLogs]);
    return (<>
      {children}
      {/* Audit status indicator (hidden, for debugging) */}
      {enableDebugLogs && (<div className="hidden" aria-hidden="true" data-audit-status={auditComplete ? 'complete' : 'pending'}>
          Language Context Audit Status: {auditComplete ? 'Complete' : 'Pending'}
        </div>)}
    </>);
};
// Enhanced useLang hook with audit features
export const useLanguageAudit = () => {
    const sessionEngine = useUserSessionEngine();
    const langContext = useLangContext();
    return {
        // Current language from canonical source
        currentLanguage: sessionEngine.session.lang,
        // Language change handler with full sync
        setLanguage: useCallback((lang) => {
            console.log(`🌐 Language toggled to: ${lang.toUpperCase()}`);
            sessionEngine.updateLang(lang);
            langContext.setLanguage(lang);
            document.documentElement.setAttribute('lang', lang);
            console.log(`🌍 Language set to: ${lang.toUpperCase()}`);
        }, [sessionEngine, langContext]),
        // Context sync status
        isInSync: sessionEngine.session.lang === langContext.language,
        // Translation helper (basic fallback)
        t: (key) => key,
        // Supported languages
        supportedLanguages: SUPPORTED_LANGUAGES
    };
};
export default LanguageContextAudit;
