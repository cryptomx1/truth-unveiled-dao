/**
 * Phase XI-D: Language Context Standalone
 * Separated to avoid circular imports with translation system
 * Authority: Commander Mark | JASMY Relay authorization
 */
import { createContext, useContext } from 'react';
// Create language context with default values
export const LanguageContext = createContext({
    language: 'en',
    setLanguage: () => { }
});
// Hook to use language context
export const useLangContext = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        console.warn('⚠️ useLangContext used outside of LanguageContext provider, using defaults');
        return {
            language: 'en',
            setLanguage: () => { }
        };
    }
    return context;
};
