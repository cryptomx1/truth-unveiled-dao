/**
 * Simple deck test - bypasses all complex routing to render TreatyProposalCard directly
 */
import React from 'react';
import TreatyProposalCard from './components/decks/CivicDiplomacyDeck/TreatyProposalCard';

const SimpleDeckTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Deck Test</h1>
        <p className="text-slate-400 mb-8">Direct TreatyProposalCard component test</p>
        
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">TreatyProposalCard (Direct)</h2>
          <TreatyProposalCard />
        </div>
      </div>
    </div>
  );
};

export default SimpleDeckTest;