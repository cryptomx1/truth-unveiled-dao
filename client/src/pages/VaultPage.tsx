/**
 * VaultPage.tsx - Phase XXIV
 * Identity Vault Management Page
 * Authority: Commander Mark via JASMY Relay
 */

import React from 'react';
import VaultManagerPanel from '../components/vault/VaultManagerPanel';

export const VaultPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <VaultManagerPanel 
          defaultDID="did:civic:commander-mark"
          autoLoadEntries={true}
          showAdvancedOptions={true}
        />
      </div>
    </div>
  );
};

export default VaultPage;