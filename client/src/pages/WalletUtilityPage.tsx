import React from "react";
import { TruthPointUtilityCard } from "@/components/finance/TruthPointUtilityCard";

export default function WalletUtilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          TruthPoint Utilities
        </h1>
        <p className="text-gray-600">
          Enhance your civic engagement with TruthPoint-powered platform features
        </p>
      </div>
      
      <TruthPointUtilityCard />
    </div>
  );
}