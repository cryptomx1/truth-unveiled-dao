// LangToggle.tsx - Phase TRILAYER v1.0 Language Toggle UI
// Injectable language toggle component for civic decks
// Commander Mark directive via JASMY Relay

import React, { useState, useEffect } from 'react';
import { Globe, Check, Loader2, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import LangToggleAgent, { LanguageContext, LanguageOption } from '@/agents/LangToggleAgent';

interface LangToggleProps {
  deckId: string;
  moduleId: string;
  onLanguageChange?: (newLanguage: string) => void;
  className?: string;
  variant?: 'button' | 'flags' | 'compact';
  showTutorialLink?: boolean;
}

export const LangToggle: React.FC<LangToggleProps> = ({
  deckId,
  moduleId,
  onLanguageChange,
  className = '',
  variant = 'button',
  showTutorialLink = true
}) => {
  const [langContext, setLangContext] = useState<LanguageContext>({
    currentLanguage: 'en',
    availableLanguages: [],
    isLoading: false
  });
  const [isChanging, setIsChanging] = useState(false);
  const langAgent = LangToggleAgent.getInstance();

  useEffect(() => {
    // Subscribe to language context changes
    const unsubscribe = langAgent.subscribe((context) => {
      setLangContext(context);
    });

    return unsubscribe;
  }, [langAgent]);

  useEffect(() => {
    // Listen for language change events to trigger re-renders
    const handleLanguageChange = (event: CustomEvent) => {
      const { newLanguage } = event.detail;
      onLanguageChange?.(newLanguage);
      
      // Regenerate TTS narration for new language
      const ttsEvent = new CustomEvent('civic-regenerate-tts', {
        detail: {
          deckId,
          moduleId,
          language: newLanguage
        }
      });
      window.dispatchEvent(ttsEvent);
    };

    window.addEventListener('civic-language-changed', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('civic-language-changed', handleLanguageChange as EventListener);
    };
  }, [deckId, moduleId, onLanguageChange]);

  const handleLanguageSwitch = async (languageCode: string) => {
    if (languageCode === langContext.currentLanguage || isChanging) {
      return;
    }

    setIsChanging(true);

    try {
      const success = await langAgent.switchLanguage(languageCode);
      
      if (success) {
        console.log(`🌐 Language switched to ${languageCode} for ${deckId}/${moduleId}`);
      } else {
        console.error(`❌ Language switch failed: ${languageCode}`);
        
        // Show user-friendly error
        const errorEvent = new CustomEvent('civic-language-error', {
          detail: {
            message: 'Language switch failed. Falling back to English.',
            fallbackLanguage: 'en'
          }
        });
        window.dispatchEvent(errorEvent);
        
        // Fallback to English
        await langAgent.switchLanguage('en');
      }
    } catch (error) {
      console.error('❌ Language switch error:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const getCurrentLanguage = (): LanguageOption | undefined => {
    return langContext.availableLanguages.find(
      lang => lang.code === langContext.currentLanguage
    );
  };

  const renderFlagsVariant = () => (
    <div className={`flex items-center gap-1 ${className}`} role="radiogroup" aria-label="Language selection">
      {langContext.availableLanguages.slice(0, 3).map((language) => (
        <Button
          key={language.code}
          variant={language.code === langContext.currentLanguage ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageSwitch(language.code)}
          disabled={isChanging}
          className="p-1 h-8 w-8 text-lg"
          aria-label={`Switch to ${language.name}`}
          role="radio"
          aria-checked={language.code === langContext.currentLanguage}
        >
          {isChanging && language.code === langContext.currentLanguage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            language.flag
          )}
        </Button>
      ))}
    </div>
  );

  const renderCompactVariant = () => {
    const currentLang = getCurrentLanguage();
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">Language:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {}} // Handled by dropdown
          disabled={isChanging}
          className="h-7 px-2 text-sm"
        >
          {isChanging ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              {currentLang?.flag} {currentLang?.code.toUpperCase()}
            </>
          )}
        </Button>
      </div>
    );
  };

  const renderButtonVariant = () => {
    const currentLang = getCurrentLanguage();
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isChanging}
            className={className}
            aria-label="Change language"
          >
            {isChanging ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            {currentLang ? (
              <>
                {currentLang.flag} {currentLang.name}
              </>
            ) : (
              'Language'
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {langContext.availableLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSwitch(language.code)}
              disabled={isChanging}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{language.name}</span>
                  <span className="text-xs text-muted-foreground">{language.nativeName}</span>
                </div>
              </div>
              {language.code === langContext.currentLanguage && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          {/* Tutorial Link */}
          {showTutorialLink && (
            <>
              <div className="border-t my-1" />
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = `/tts/deck/${deckId}/tutorial`;
                }}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
              >
                <Headphones className="h-4 w-4" />
                <span className="text-sm">🎧 Learn this deck</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Don't render if no languages available
  if (langContext.availableLanguages.length <= 1) {
    return null;
  }

  return (
    <div 
      className="lang-toggle-container"
      role="region"
      aria-label="Language selection"
    >
      {variant === 'flags' && renderFlagsVariant()}
      {variant === 'compact' && renderCompactVariant()}
      {variant === 'button' && renderButtonVariant()}
      
      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isChanging 
          ? 'Switching language...' 
          : `Current language: ${getCurrentLanguage()?.name || 'English'}`
        }
      </div>
    </div>
  );
};

export default LangToggle;