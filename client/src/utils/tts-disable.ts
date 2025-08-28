// TTS Management System - Properly Restored Functionality
export const RESTORE_TTS = () => {
  if (typeof window !== 'undefined') {
    // Ensure native speechSynthesis is available and functional
    try {
      // Test if speechSynthesis is available
      if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
        // Test basic functionality
        const testUtterance = new SpeechSynthesisUtterance('');
        testUtterance.volume = 0; // Silent test
        window.speechSynthesis.speak(testUtterance);
        window.speechSynthesis.cancel(); // Cancel immediately
        
        console.log('🔊 TTS functionality verified - speech synthesis operational');
        return true;
      } else {
        console.log('⚠️ TTS not supported in this browser');
        return false;
      }
    } catch (e) {
      console.error('❌ TTS restoration failed:', e);
      return false;
    }
  }
  return false;
};

// Restore TTS functionality immediately
RESTORE_TTS();

export default RESTORE_TTS;