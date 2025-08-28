/**
 * CivicMissionOnboardingCard - Updated for Phase XI-D Translation System
 * Using useTranslation hook for multilingual support
 * Authority: Commander Mark | JASMY Relay authorization
 */

import React, { useState } from 'react';
import { Crown, Mic, BarChart, ArrowRight } from 'lucide-react';
import { useUserSession as useUserSessionEngine } from '../system/UserSessionEngine';
import { useTranslation } from '../../translation/useTranslation';

interface CivicMissionOnboardingCardProps {
  className?: string;
}

type MissionType = 'representation' | 'voice' | 'data';

export const CivicMissionOnboardingCard: React.FC<CivicMissionOnboardingCardProps> = ({ 
  className = '' 
}) => {
  const { t } = useTranslation();
  const sessionEngine = useUserSessionEngine();
  const [selectedMission, setSelectedMission] = useState<MissionType | null>(null);

  // Mission configurations with translation keys
  const missions: Array<{
    type: MissionType;
    icon: React.ReactNode;
    titleKey: string;
    descriptionKey: string;
    color: string;
  }> = [
    {
      type: 'representation',
      icon: <Crown className="w-8 h-8" />,
      titleKey: 'mission.representation',
      descriptionKey: 'mission.description.representation',
      color: 'text-yellow-400'
    },
    {
      type: 'voice',
      icon: <Mic className="w-8 h-8" />,
      titleKey: 'mission.voice',
      descriptionKey: 'mission.description.voice',
      color: 'text-blue-400'
    },
    {
      type: 'data',
      icon: <BarChart className="w-8 h-8" />,
      titleKey: 'mission.data',
      descriptionKey: 'mission.description.data',
      color: 'text-green-400'
    }
  ];

  // Handle mission selection
  const handleMissionSelect = (mission: MissionType) => {
    setSelectedMission(mission);
    sessionEngine.updateMission(mission);
    console.log(`🎯 Mission selected: ${mission}`);
  };

  // Handle continue action
  const handleContinue = () => {
    if (selectedMission) {
      console.log(`🚀 Proceeding with mission: ${selectedMission}`);
      // Navigate to next phase or trigger callback
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-6 max-w-md mx-auto ${className}`}>
      {/* Mission Selection Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          {t('mission.selectPrompt')}
        </h2>
      </div>

      {/* Mission Options */}
      <div className="space-y-4 mb-6">
        {missions.map((mission) => (
          <button
            key={mission.type}
            onClick={() => handleMissionSelect(mission.type)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedMission === mission.type
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
            }`}
            aria-pressed={selectedMission === mission.type}
            aria-label={`Select ${t(mission.titleKey)} mission`}
          >
            <div className="flex items-center gap-4">
              <div className={mission.color}>
                {mission.icon}
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-medium">
                  {t(mission.titleKey)}
                </h3>
                <p className="text-slate-300 text-sm">
                  {t(mission.descriptionKey)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!selectedMission}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          selectedMission
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
        }`}
        aria-label={selectedMission ? `Continue with ${t(`mission.${selectedMission}`)}` : 'Select a mission to continue'}
      >
        <div className="flex items-center justify-center gap-2">
          {t('mission.continue')}
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      {/* Selected Mission Display */}
      {selectedMission && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm text-center">
            ✓ {t(`mission.${selectedMission}`)} {t('mission.selectPrompt').toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
};