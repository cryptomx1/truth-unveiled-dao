/**
 * TruthGenesisBadge.tsx
 * Phase Civic Fusion Step 3 - Genesis Badge Rendering and Preview Component
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GenesisBadgeData {
  cid: string;
  did: string;
  fusionTimestamp: string;
  civicTier: string;
  completedPillars: string[];
  guardianAssignments: { [pillar: string]: string };
  zkpHash: string;
  badgeId: string;
}

interface TruthGenesisBadgeProps {
  badgeData: GenesisBadgeData;
  onExportReady?: (data: GenesisBadgeData) => void;
}

const TruthGenesisBadge: React.FC<TruthGenesisBadgeProps> = ({ 
  badgeData, 
  onExportReady 
}) => {
  const [badgeGenerated, setBadgeGenerated] = useState(false);
  const [animatingGuardian, setAnimatingGuardian] = useState<string | null>(null);

  useEffect(() => {
    // Simulate badge generation process
    const generateBadge = async () => {
      console.log('🏆 Generating Genesis Badge for DID:', badgeData.did);
      
      // Animate through each guardian assignment
      for (const [pillar, guardian] of Object.entries(badgeData.guardianAssignments)) {
        setAnimatingGuardian(guardian);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setAnimatingGuardian(null);
      setBadgeGenerated(true);
      
      // ARIA announcement for badge ready
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance('Genesis Badge ready');
        utterance.rate = 0.8;
        utterance.volume = 0.4;
        window.speechSynthesis.speak(utterance);
      }
      
      console.log('✅ Genesis Badge generated successfully');
      
      if (onExportReady) {
        onExportReady(badgeData);
      }
    };

    generateBadge();
  }, [badgeData, onExportReady]);

  const getGuardianIcon = (guardian: string) => {
    const guardianIcons = {
      'Athena': '🦉',
      'Artemis': '🏹', 
      'Sophia': '📚',
      'Themis': '⚖️',
      'Prometheus': '🔥',
      'Hermes': '⚡',
      'Iris': '🌈',
      'Dike': '🏛️'
    };
    return guardianIcons[guardian as keyof typeof guardianIcons] || '🛡️';
  };

  const getPillarIcon = (pillar: string) => {
    const pillarIcons = {
      'GOVERNANCE': '⚖️',
      'EDUCATION': '📚', 
      'HEALTH': '🏥',
      'CULTURE': '🎭',
      'PEACE': '🕊️',
      'SCIENCE': '🔬',
      'JOURNALISM': '📰',
      'JUSTICE': '⚖️'
    };
    return pillarIcons[pillar as keyof typeof pillarIcons] || '🏛️';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Genesis Badge Display */}
      <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-purple-700 dark:text-purple-300">
            🏆 Genesis Badge
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            8-Pillar Civic Fusion Complete
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Badge Center - Visual Identity */}
          <div className="text-center space-y-4">
            <div className={`text-8xl transition-all duration-1000 ${badgeGenerated ? 'scale-110 animate-pulse' : 'scale-75 opacity-50'}`}>
              🌟
            </div>
            <div className="text-lg font-semibold text-purple-800 dark:text-purple-200">
              {badgeData.civicTier} Genesis
            </div>
            <div className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              Badge ID: {badgeData.badgeId}
            </div>
          </div>

          {/* Completed Pillars Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Completed Pillars ({badgeData.completedPillars.length}/8)
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {badgeData.completedPillars.map((pillar, index) => {
                const guardian = badgeData.guardianAssignments[pillar];
                const isAnimating = animatingGuardian === guardian;
                
                return (
                  <div 
                    key={pillar}
                    className={`p-2 bg-white dark:bg-gray-800 border rounded-lg text-center transition-all duration-300 ${
                      isAnimating ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-lg mb-1">
                      {getPillarIcon(pillar)}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {pillar.slice(0, 4)}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
                      {getGuardianIcon(guardian)} {guardian}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badge Metadata */}
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">CID:</span>
                <div className="font-mono text-purple-600 dark:text-purple-400">
                  {badgeData.cid}
                </div>
              </div>
              <div>
                <span className="text-gray-500">DID:</span>
                <div className="font-mono text-blue-600 dark:text-blue-400 truncate">
                  {badgeData.did}
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Fusion Timestamp:</span>
              <div className="font-mono text-green-600 dark:text-green-400">
                {new Date(badgeData.fusionTimestamp).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">ZKP Hash:</span>
              <div className="font-mono text-amber-600 dark:text-amber-400 truncate">
                {badgeData.zkpHash}
              </div>
            </div>
          </div>

          {/* Badge Status */}
          <div className="text-center">
            <Badge 
              className={`px-4 py-2 ${badgeGenerated 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {badgeGenerated ? '✅ Genesis Badge Ready' : '🔄 Generating Badge...'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {badgeGenerated ? 'Genesis Badge generation complete' : 'Generating Genesis Badge with pillar confirmations'}
      </div>
    </div>
  );
};

export default TruthGenesisBadge;