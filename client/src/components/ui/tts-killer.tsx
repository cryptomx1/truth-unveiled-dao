// TTS Management Component - Fully Functional Implementation
import { useEffect } from 'react';

export const TTSManager = () => {
  useEffect(() => {
    // Initialize and verify TTS functionality
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        // Load voices if not already loaded
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            console.log('🔊 TTS Manager: Speech synthesis ready with', voices.length, 'voices');
          }
        };
        
        // Load voices immediately and on voice change
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        // Test basic functionality
        const testUtterance = new SpeechSynthesisUtterance('');
        testUtterance.volume = 0; // Silent test
        testUtterance.onstart = () => console.log('🔊 TTS verification: Speech synthesis operational');
        testUtterance.onerror = (e) => console.error('❌ TTS verification failed:', e);
        
        window.speechSynthesis.speak(testUtterance);
        setTimeout(() => window.speechSynthesis.cancel(), 50); // Cancel quickly
        
      } catch (error) {
        console.error('❌ TTS Manager initialization failed:', error);
      }
    } else {
      console.log('⚠️ TTS Manager: Speech synthesis not supported');
    }
  }, []);
  
  return null;
};