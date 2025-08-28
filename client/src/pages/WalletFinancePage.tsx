/**
 * WalletFinancePage.tsx
 * Phase X-FINANCE Step 5: Main page for TruthCoin claims and Genesis Badge fusion
 * Commander Mark directive via JASMY Relay
 */

import React from 'react';
import GenesisBadgeFusion from '@/components/finance/GenesisBadgeFusion';

const WalletFinancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            TruthCoin Finance Center
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Claim TruthCoins and create Genesis Badge fusions with guardian assignments
          </p>
        </div>
        
        <GenesisBadgeFusion />
      </div>
    </div>
  );
};

export default WalletFinancePage;