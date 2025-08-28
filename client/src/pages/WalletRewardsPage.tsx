/**
 * WalletRewardsPage.tsx
 * Phase X-FINANCE Step 3 - Wallet Rewards Interface
 * Authority: Commander Mark via JASMY Relay System
 */

import React from 'react';
import { RewardStatusCard } from '@/components/finance/RewardStatusCard';

export default function WalletRewardsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            TruthPoint Rewards
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Track your civic engagement rewards and claim earned TruthPoints
          </p>
        </div>
        
        <RewardStatusCard />
      </div>
    </div>
  );
}