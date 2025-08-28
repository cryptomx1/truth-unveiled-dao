/**
 * ProofVaultPage.tsx - Phase XXVI
 * Proof Vault Management Page
 * Authority: Commander Mark via JASMY Relay
 */

import React from 'react';
import { ProofLedgerPanel } from '@/components/evidence/ProofLedgerPanel';

const ProofVaultPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <ProofLedgerPanel 
          userHash="user-did:civic:commander-mark"
          showAllEntries={true}
          enableExport={true}
          maxEntries={200}
          onEntryClick={(entry) => {
            console.log(`🧾 Vault entry accessed: ${entry.entryId} | Mission: ${entry.capsule.missionId} | Status: ${entry.integrityStatus}`);
          }}
        />
      </div>
    </div>
  );
};

export default ProofVaultPage;