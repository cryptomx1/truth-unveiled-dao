/**
 * Phase XI-D: Language Context Standalone
 * Separated to avoid circular imports with translation system
 * Authority: Commander Mark | JASMY Relay authorization
 */

import { createContext, useContext } from 'react';

// Language context interface
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

// Create language context with default values
export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {}
});

// Hook to use language context
export const useLangContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.warn('⚠️ useLangContext used outside of LanguageContext provider, using defaults');
    return {
      language: 'en',
      setLanguage: () => {}
    };
  }
  return context;
};