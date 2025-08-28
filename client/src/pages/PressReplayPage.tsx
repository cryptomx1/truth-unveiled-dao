/**
 * PressReplayPage.tsx
 * Phase PRESS-REPLAY Step 4: Main routing page for ripple campaign management
 * Commander Mark directive via JASMY Relay
 */

import React from 'react';
import PressReplayDashboard from '@/components/decks/PressReplayDashboard';

const PressReplayPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Press Replay Campaign System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            ZIP-targeted civic engagement campaigns with AI-enhanced messaging
          </p>
        </div>
        
        <PressReplayDashboard />
      </div>
    </div>
  );
};

export default PressReplayPage;