/**
 * LangToggle.tsx - PHASE TTS-CIVIC-ENHANCE REPAIR
 * Commander Mark directive: Multilingual dropdown must be visible and functional
 */

import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LangToggleProps {
  deckId?: string;
  moduleId?: string;
  variant?: 'button' | 'flags' | 'compact';
  showTutorialLink?: boolean;
  className?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export const LangToggle: React.FC<LangToggleProps> = ({
  deckId,
  moduleId,
  variant = 'button',
  showTutorialLink = false,
  className = ''
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Load current language from localStorage
    const savedLang = localStorage.getItem('civic-language') || 'en';
    setCurrentLanguage(savedLang);
    
    // Set document language attribute
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) return;
    
    setIsChanging(true);
    
    try {
      // Update current language
      setCurrentLanguage(languageCode);
      localStorage.setItem('civic-language', languageCode);
      
      // Update document attributes
      document.documentElement.lang = languageCode;
      document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
      
      // Emit custom event for TTS system to regenerate narration
      const event = new CustomEvent('civic-language-changed', {
        detail: { 
          language: languageCode, 
          deckId: deckId || 'global',
          moduleId: moduleId || 'global'
        }
      });
      window.dispatchEvent(event);
      
      // Emit TTS regeneration event if deck/module context available
      if (deckId && moduleId) {
        const ttsEvent = new CustomEvent('civic-regenerate-tts', {
          detail: { deckId, moduleId, language: languageCode }
        });
        window.dispatchEvent(ttsEvent);
      }
      
      console.log(`🌐 Language switched to ${languageCode} for ${deckId || 'global'}/${moduleId || 'global'}`);
      
    } catch (error) {
      console.error('Language change failed:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleTutorialAccess = () => {
    if (deckId) {
      window.location.href = `/tts/deck/${deckId}/tutorial`;
    } else if (moduleId) {
      window.location.href = `/tts/module/${moduleId}/tutorial`;
    }
  };

  const getCurrentLanguageDisplay = () => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
    return lang || SUPPORTED_LANGUAGES[0];
  };

  if (variant === 'flags') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {SUPPORTED_LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              text-lg transition-all duration-200 hover:scale-110
              ${currentLanguage === lang.code ? 'opacity-100 scale-110' : 'opacity-60'}
            `}
            title={lang.name}
            aria-label={`Switch to ${lang.name}`}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs ${className}`}
            disabled={isChanging}
          >
            {getCurrentLanguageDisplay().flag}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {SUPPORTED_LANGUAGES.map(lang => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={currentLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-950' : ''}
            >
              <span className="mr-2">{lang.flag}</span>
              <span className="text-sm">{lang.code.toUpperCase()}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default button variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${className}`}
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span>{getCurrentLanguageDisplay().flag}</span>
          <span className="hidden sm:inline">{getCurrentLanguageDisplay().name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SUPPORTED_LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              flex items-center gap-3 px-3 py-2 cursor-pointer
              ${currentLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-950 font-medium' : ''}
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLanguage === lang.code && (
              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
        
        {showTutorialLink && (deckId || moduleId) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleTutorialAccess}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer text-blue-600 dark:text-blue-400"
            >
              <Headphones className="h-4 w-4" />
              <span>🎧 Learn this deck</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LangToggle;