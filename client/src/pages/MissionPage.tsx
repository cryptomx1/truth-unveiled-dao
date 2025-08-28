/**
 * MissionPage.tsx - Phase XXV
 * Mission Access Management Page
 * Authority: Commander Mark via JASMY Relay
 */

import React from 'react';
import { MissionAccessPanel } from '@/components/missions/MissionAccessPanel';

const MissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <MissionAccessPanel 
          userId="did:civic:commander-mark"
          userTier="Administrator"
          trustScore={98}
          showAdvancedInfo={true}
          onMissionClick={(missionId, eligibility) => {
            console.log(`🧭 Mission clicked: ${missionId} | Unlocked: ${eligibility.isUnlocked}`);
            if (eligibility.isUnlocked) {
              // In a real app, this would navigate to the mission
              console.log(`🧭 Would navigate to mission route: ${eligibility.missionId}`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default MissionPage;