// TutorialRouter.tsx - Phase TTS-CIVIC-ENHANCE Step 4
// Tutorial routing system for /tts/deck/:deckId/tutorial
// Commander Mark directive via JASMY Relay

import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import { DeckNarrationOverlay } from '../components/ui/DeckNarrationOverlay';
import AudioTutorialInjector from '../agents/AudioTutorialInjector';

interface TutorialPageProps {
  deckId: string;
}

const TutorialPage: React.FC<TutorialPageProps> = ({ deckId }) => {
  const [tutorialInjector, setTutorialInjector] = useState<AudioTutorialInjector | null>(null);
  const [deckName, setDeckName] = useState<string>(`Deck ${deckId}`);
  const [isLoading, setIsLoading] = useState(true);

  // Deck ID to name mapping
  const DECK_NAMES: Record<string, string> = {
    '1': 'Wallet Overview',
    '2': 'Governance Feedback', 
    '3': 'Civic Identity',
    '4': 'Privacy & Security',
    '5': 'Policy Voting',
    '6': 'Community Forums',
    '7': 'Resource Allocation',
    '8': 'Audit Trail',
    '9': 'Representative Dashboard',
    '10': 'Legislative Tracking',
    '11': 'Civic Education',
    '12': 'Emergency Response',
    '13': 'Environmental Impact',
    '14': 'Economic Planning',
    '15': 'Social Services',
    '16': 'Transportation',
    '17': 'Public Health',
    '18': 'Cultural Affairs',
    '19': 'Infrastructure',
    '20': 'Future Planning'
  };

  useEffect(() => {
    const initializeTutorial = async () => {
      setIsLoading(true);
      
      try {
        // Get tutorial injector instance
        const injector = AudioTutorialInjector.getInstance();
        setTutorialInjector(injector);
        
        // Set deck name
        const name = DECK_NAMES[deckId] || `Deck ${deckId}`;
        setDeckName(name);
        
        console.log(`🎧 Tutorial page initialized for ${name} (${deckId})`);
      } catch (error) {
        console.error('❌ Failed to initialize tutorial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTutorial();
  }, [deckId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading tutorial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      {/* Tutorial Header */}
      <div className="relative z-10 pt-12 pb-8">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Audio Tutorial
          </h1>
          <h2 className="text-2xl text-blue-400 mb-4">
            {deckName}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Learn about this civic deck with our AI-generated audio guide. 
            Available in multiple languages with GPT-4o quality narration.
          </p>
        </div>
      </div>

      {/* Tutorial Content */}
      <div className="relative z-10 flex-1 flex items-start justify-center pt-8">
        <div className="w-full max-w-4xl px-6">
          {/* Main Tutorial Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114a4.369 4.369 0 00-1.657-.114C2.887 11 2 12.346 2 14s.887 3 1.343 3 1.657-1.346 1.657-3V7.051l8-1.6v4.55a4.369 4.369 0 00-1.657-.001C9.887 10 9 11.346 9 13s.887 3 1.343 3 1.657-1.346 1.657-3V3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Interactive Audio Guide
              </h3>
              <p className="text-gray-400">
                ≤90 seconds • GPT-4o generated • Multilingual support
              </p>
            </div>

            {/* Audio Tutorial Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-1">Quick Learn</h4>
                <p className="text-gray-400 text-sm">90 seconds or less</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 5h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-1">Multilingual</h4>
                <p className="text-gray-400 text-sm">EN, ES, FR, JA</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 6m14-6l-2 6M5 10l2 6m0 0h10m-10 0a1 1 0 00-1 1v1a1 1 0 001 1h10a1 1 0 001-1v-1a1 1 0 00-1-1m-10 0V10m10 6V10" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-1">IPFS Stored</h4>
                <p className="text-gray-400 text-sm">Decentralized audio</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                ← Back to Deck
              </button>
              <button
                onClick={() => window.location.href = '/command'}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Command Center
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Audio Overlay */}
      <DeckNarrationOverlay
        deckId={deckId}
        deckName={deckName}
        isVisible={true}
        position="bottom-right"
        autoPlay={true}
        className="mb-8 mr-8"
      />

      {/* Keyboard Shortcuts */}
      <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span><kbd className="px-1 py-0.5 bg-gray-700 rounded text-white">Space</kbd> Play/Pause</span>
          <span><kbd className="px-1 py-0.5 bg-gray-700 rounded text-white">R</kbd> Replay</span>
          <span><kbd className="px-1 py-0.5 bg-gray-700 rounded text-white">L</kbd> Language</span>
        </div>
      </div>
    </div>
  );
};

const TutorialRouter: React.FC = () => {
  return (
    <Switch>
      <Route path="/tts/deck/:deckId/tutorial">
        {(params) => {
          const { deckId } = params!;
          return <TutorialPage deckId={deckId} />;
        }}
      </Route>
    </Switch>
  );
};

export default TutorialRouter;