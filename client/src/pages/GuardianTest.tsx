/**
 * GuardianTest.tsx - Guardian Deck Test Page
 * 
 * Test route for GuardianDeck component with mock data and integration testing.
 * Route: /guardian/test
 * 
 * Authority: Commander Mark | Phase X-M Step 1
 * Status: QA validation interface
 */

import React from 'react';
import GuardianDeck from '../components/decks/GuardianDeck/GuardianDeck';

export default function GuardianTest() {
  return (
    <div className="min-h-screen bg-slate-900">
      <GuardianDeck testMode={true} />
    </div>
  );
}