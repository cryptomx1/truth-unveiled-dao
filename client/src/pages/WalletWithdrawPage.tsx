import React from "react";
import { CivicTreasuryWithdrawCard } from "@/components/finance/CivicTreasuryWithdrawCard";

export default function WalletWithdrawPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Treasury Withdrawal
        </h1>
        <p className="text-gray-600">
          Withdraw TruthPoints from civic treasury with tier-based verification and audit compliance
        </p>
      </div>
      
      <CivicTreasuryWithdrawCard />
    </div>
  );
}