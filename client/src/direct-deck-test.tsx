/**
 * Direct deck test - bypasses wouter router to test component directly
 */
import React from 'react';
import DeckViewRouter from './routes/DeckViewRouter';

const DirectDeckTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Direct Deck Test</h1>
        <p className="text-slate-400 mb-8">Testing DeckViewRouter component directly</p>
        
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">DeckViewRouter (Direct Render)</h2>
          <DeckViewRouter />
        </div>
      </div>
    </div>
  );
};

export default DirectDeckTest;