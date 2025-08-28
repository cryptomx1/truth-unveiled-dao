import React from "react";
import { TreasuryDashboard } from "@/components/finance/TreasuryDashboard";

export default function TreasuryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Treasury Management
        </h1>
        <p className="text-gray-600">
          Manage 50B TruthPoint allocation across marketing, NGO rewards, and government integration
        </p>
      </div>
      
      <TreasuryDashboard />
    </div>
  );
}