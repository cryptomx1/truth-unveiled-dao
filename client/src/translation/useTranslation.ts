/**
 * Phase XI-D: Translation System Bootstrap
 * useTranslation Hook with t(key) utility and fallback logic
 * Authority: Commander Mark | JASMY Relay authorization
 * Commit: TRANSLATION_SYSTEM_BOOTSTRAP_PHASE_XI_D
 */

import { useState, useEffect, useCallback } from 'react';
import { useLangContext } from '../context/LanguageContext';

// Import translation dictionaries
import enTranslations from './en.json';
import esTranslations from './es.json'; 
import frTranslations from './fr.json';

// Translation dictionaries type
type TranslationDictionary = Record<string, string>;

// Supported languages with their dictionaries
const TRANSLATION_DICTIONARIES: Record<string, TranslationDictionary> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations
};

// Default fallback language
const DEFAULT_LANGUAGE = 'en';

// Translation parameters type for interpolation
type TranslationParams = Record<string, string | number>;

// Translation function interface
interface TranslationFunction {
  (key: string, params?: TranslationParams): string;
}

// Hook return type
interface UseTranslationReturn {
  t: TranslationFunction;
  language: string;
  isReady: boolean;
  switchLanguage: (lang: string) => void;
}

// Parameter interpolation utility
const interpolateParams = (template: string, params: TranslationParams = {}): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
};

// Main useTranslation hook
export const useTranslation = (): UseTranslationReturn => {
  const langContext = useLangContext();
  const [isReady, setIsReady] = useState(false);

  // Get current language from context
  const currentLanguage = langContext.language;

  // Initialize translation system
  useEffect(() => {
    if (currentLanguage && TRANSLATION_DICTIONARIES[currentLanguage]) {
      console.log(`🌐 Translation system initialized for lang: ${currentLanguage.toUpperCase()}`);
      setIsReady(true);
    } else {
      console.log(`🌐 Translation system initialized for lang: ${DEFAULT_LANGUAGE.toUpperCase()} (fallback)`);
      setIsReady(true);
    }
  }, [currentLanguage]);

  // Translation function with fallback logic
  const t: TranslationFunction = useCallback((key: string, params?: TranslationParams) => {
    // Get the appropriate dictionary
    let dictionary = TRANSLATION_DICTIONARIES[currentLanguage];
    
    // Fallback to default language if current language not supported
    if (!dictionary) {
      console.warn(`⚠️ Unsupported language: ${currentLanguage}, falling back to ${DEFAULT_LANGUAGE}`);
      dictionary = TRANSLATION_DICTIONARIES[DEFAULT_LANGUAGE];
    }

    // Get translation from dictionary
    let translation = dictionary[key];

    // Fallback logic if key not found
    if (!translation) {
      console.warn(`⚠️ Missing translation: ${key} for ${currentLanguage}`);
      
      // Try fallback language if not already using it
      if (currentLanguage !== DEFAULT_LANGUAGE) {
        translation = TRANSLATION_DICTIONARIES[DEFAULT_LANGUAGE][key];
        
        if (!translation) {
          console.warn(`⚠️ Missing translation: ${key} for ${DEFAULT_LANGUAGE} (fallback)`);
          // Return key as last resort
          translation = key;
        }
      } else {
        // Return key as fallback
        translation = key;
      }
    }

    // Apply parameter interpolation if params provided
    if (params && Object.keys(params).length > 0) {
      translation = interpolateParams(translation, params);
    }

    return translation;
  }, [currentLanguage]);

  // Language switching function
  const switchLanguage = useCallback((lang: string) => {
    if (TRANSLATION_DICTIONARIES[lang]) {
      langContext.setLanguage(lang);
      console.log(`🌍 Language switched to: ${lang.toUpperCase()}`);
    } else {
      console.warn(`⚠️ Unsupported language: ${lang}, staying with ${currentLanguage}`);
    }
  }, [langContext, currentLanguage]);

  return {
    t,
    language: currentLanguage,
    isReady,
    switchLanguage
  };
};

// Convenience hook for components that only need the t function
export const useT = (): TranslationFunction => {
  const { t } = useTranslation();
  return t;
};

// Export translation utilities
export { TRANSLATION_DICTIONARIES, DEFAULT_LANGUAGE };
export type { TranslationFunction, TranslationParams, UseTranslationReturn };