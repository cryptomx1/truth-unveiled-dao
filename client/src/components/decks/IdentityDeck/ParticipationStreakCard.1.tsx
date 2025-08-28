import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipationStreak {
  currentStreak: number;
  longestStreak: number;
  referralBoost: number;
}

interface ParticipationStreakOverviewProps {
  streak?: ParticipationStreak;
  className?: string;
}

// Mock streak data as per JASMY specifications
const MOCK_STREAK: ParticipationStreak = {
  currentStreak: 12,
  longestStreak: 21,
  referralBoost: 15
};

export const ParticipationStreakOverview: React.FC<ParticipationStreakOverviewProps> = ({
  streak = MOCK_STREAK,
  className
}) => {
  const [renderStartTime] = useState(performance.now());

  useEffect(() => {
    // Log render performance
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ParticipationStreakOverview render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ParticipationStreakOverview render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  return (
    <div 
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl max-h-[600px] w-full',
        className
      )}
      role="region"
      aria-label="Participation Streak Overview"
      data-testid="participation-streak-overview"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Participation Overview</h2>
            <p className="text-sm text-slate-400">Your civic engagement metrics</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Current Streak */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{streak.currentStreak}</span>
                </div>
                {/* Pulsing ring for active streak */}
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse"></div>
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Current Streak</h3>
                <p className="text-xs text-slate-400">Days active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Personal Best</h3>
                <p className="text-xs text-slate-400">{streak.longestStreak} days record</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Boost */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Community Boost</h3>
                <p className="text-xs text-slate-400">+{streak.referralBoost}% referral bonus</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-900/50 border border-blue-700 rounded-full">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium text-blue-300">Active Participant</span>
        </div>
      </div>
    </div>
  );
};

export default ParticipationStreakOverview;