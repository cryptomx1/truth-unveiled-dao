/**
 * IdentityPage.tsx - Phase XXIII
 * Civic Identity Onboarding Page
 * Authority: Commander Mark via JASMY Relay
 */

import React from 'react';
import IdentityOnboardingPanel from '../components/identity/IdentityOnboardingPanel';

export const IdentityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <IdentityOnboardingPanel 
          did="did:civic:commander-mark"
          autoLoadProfile={true}
          showAdvancedOptions={true}
        />
      </div>
    </div>
  );
};

export default IdentityPage;