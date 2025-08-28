/**
 * Direct test of treaty proposal route functionality
 */
import React from 'react';
import { DECK_CONFIGS } from './routes/DeckViewRouter';
import TreatyProposalCard from './components/decks/CivicDiplomacyDeck/TreatyProposalCard';

const TestTreatyRoute: React.FC = () => {
  console.log('🧪 Treaty Route Test');
  
  // Test deck configuration
  const civicDiplomacyDeck = DECK_CONFIGS['civic-diplomacy'];
  console.log('Civic Diplomacy deck config:', civicDiplomacyDeck);
  
  if (civicDiplomacyDeck) {
    const treatyModule = civicDiplomacyDeck.modules.find(m => m.id === 'treaty-proposal');
    console.log('Treaty proposal module:', treatyModule);
    
    if (treatyModule) {
      console.log('Component available:', !!treatyModule.component);
      console.log('Component constructor:', treatyModule.component.name);
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Treaty Route Test</h1>
        
        <div className="bg-slate-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          <div className="space-y-2">
            <div>Deck exists: {civicDiplomacyDeck ? '✅' : '❌'}</div>
            <div>Module exists: {civicDiplomacyDeck?.modules.find(m => m.id === 'treaty-proposal') ? '✅' : '❌'}</div>
            <div>Component loaded: {typeof TreatyProposalCard === 'function' ? '✅' : '❌'}</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Direct Component Test</h2>
          <div className="bg-slate-700 p-4 rounded">
            <TreatyProposalCard />
          </div>
        </div>
        
        <div className="space-y-2">
          <a href="/deck/civic-diplomacy" className="block text-blue-400 hover:text-blue-300">
            Test: /deck/civic-diplomacy (overview)
          </a>
          <a href="/deck/civic-diplomacy/treaty-proposal" className="block text-blue-400 hover:text-blue-300">
            Test: /deck/civic-diplomacy/treaty-proposal (module)
          </a>
          <a href="/deck/17/treaty-proposal" className="block text-blue-400 hover:text-blue-300">
            Test: /deck/17/treaty-proposal (numerical)
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestTreatyRoute;