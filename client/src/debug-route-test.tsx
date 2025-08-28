/**
 * Debug route test to identify deck routing issues
 */
import React from 'react';
import { DECK_CONFIGS } from './routes/DeckViewRouter';

const DebugRouteTest: React.FC = () => {
  console.log('🔍 DECK ROUTING DEBUG TEST');
  console.log('Available decks:', Object.keys(DECK_CONFIGS));
  
  const civicDiplomacyDeck = DECK_CONFIGS['civic-diplomacy'];
  console.log('Civic Diplomacy Deck:', civicDiplomacyDeck);
  
  if (civicDiplomacyDeck) {
    console.log('Modules:', civicDiplomacyDeck.modules.map(m => ({ id: m.id, name: m.name })));
    
    const treatyModule = civicDiplomacyDeck.modules.find(m => m.id === 'treaty-proposal');
    console.log('Treaty Proposal Module:', treatyModule);
    
    if (treatyModule) {
      console.log('Component exists:', !!treatyModule.component);
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Route Test</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available Decks:</h2>
          <ul className="list-disc pl-6">
            {Object.keys(DECK_CONFIGS).map(deckId => (
              <li key={deckId}>
                {deckId} - {DECK_CONFIGS[deckId].name}
              </li>
            ))}
          </ul>
        </div>
        
        {civicDiplomacyDeck && (
          <div>
            <h2 className="text-lg font-semibold">Civic Diplomacy Modules:</h2>
            <ul className="list-disc pl-6">
              {civicDiplomacyDeck.modules.map(module => (
                <li key={module.id}>
                  {module.id} - {module.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div>
          <h2 className="text-lg font-semibold">Test Routes:</h2>
          <div className="space-y-2">
            <a href="/deck/civic-diplomacy" className="block text-blue-400 hover:text-blue-300">
              /deck/civic-diplomacy (Deck Overview)
            </a>
            <a href="/deck/civic-diplomacy/treaty-proposal" className="block text-blue-400 hover:text-blue-300">
              /deck/civic-diplomacy/treaty-proposal (Module)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugRouteTest;