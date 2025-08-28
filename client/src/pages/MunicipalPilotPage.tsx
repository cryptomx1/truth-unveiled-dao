import React from "react";
import { MunicipalPilotInterface } from "@/components/gov/MunicipalPilotInterface";

export default function MunicipalPilotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Municipal Pilot Program
        </h1>
        <p className="text-gray-600">
          Deploy civic engagement solutions to pilot cities with customized templates
        </p>
      </div>
      
      <MunicipalPilotInterface />
    </div>
  );
}