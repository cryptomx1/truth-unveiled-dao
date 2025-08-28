// TruthPointCalculator.tsx - Phase III-A Step 3/6
// Truth Point Tier System with Live Attribution Preview

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Award, Users, AlertTriangle } from 'lucide-react';

interface TruthPointTiers {
  basic: number;
  verified: number;
  expert: number;
  authority: number;
}

interface ContributorAction {
  id: string;
  type: 'vote' | 'proposal' | 'verification' | 'education' | 'dispute_resolution';
  tier: 'basic' | 'verified' | 'expert' | 'authority';
  points: number;
  timestamp: Date;
  didHash: string;
}

interface CalculatorMetrics {
  totalPoints: number;
  dailyPoints: number;
  actionCount: number;
  averagePerAction: number;
  tierDistribution: Record<string, number>;
}

export const TruthPointCalculator = () => {
  const [tiers] = useState<TruthPointTiers>({
    basic: 10,
    verified: 50,
    expert: 100,
    authority: 200
  });

  const [selectedAction, setSelectedAction] = useState<ContributorAction['type']>('vote');
  const [selectedTier, setSelectedTier] = useState<ContributorAction['tier']>('basic');
  const [calculatorMetrics, setCalculatorMetrics] = useState<CalculatorMetrics>({
    totalPoints: 0,
    dailyPoints: 0,
    actionCount: 0,
    averagePerAction: 0,
    tierDistribution: { basic: 0, verified: 0, expert: 0, authority: 0 }
  });
  
  const [recentActions, setRecentActions] = useState<ContributorAction[]>([]);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate initial actions for demonstration
    const initialActions: ContributorAction[] = [
      {
        id: 'act_001',
        type: 'vote',
        tier: 'verified',
        points: 50,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        didHash: 'did:civic:0x7f3e2d1a'
      },
      {
        id: 'act_002',
        type: 'proposal',
        tier: 'expert',
        points: 100,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        didHash: 'did:civic:0x7f3e2d1a'
      },
      {
        id: 'act_003',
        type: 'verification',
        tier: 'basic',
        points: 10,
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        didHash: 'did:civic:0x7f3e2d1a'
      }
    ];

    setRecentActions(initialActions);
    updateMetrics(initialActions);

    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`TruthPointCalculator render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }

    console.log('🔇 TTS disabled: "Truth Point Calculator ready"');
  }, []);

  const updateMetrics = (actions: ContributorAction[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyActions = actions.filter(action => 
      action.timestamp >= today
    );

    const totalPoints = actions.reduce((sum, action) => sum + action.points, 0);
    const dailyPoints = dailyActions.reduce((sum, action) => sum + action.points, 0);
    
    const tierDistribution = actions.reduce((dist, action) => {
      dist[action.tier] = (dist[action.tier] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    setCalculatorMetrics({
      totalPoints,
      dailyPoints,
      actionCount: actions.length,
      averagePerAction: actions.length > 0 ? totalPoints / actions.length : 0,
      tierDistribution
    });
  };

  const handleActionSimulation = () => {
    const validationStart = performance.now();
    
    const newAction: ContributorAction = {
      id: `act_${Date.now()}`,
      type: selectedAction,
      tier: selectedTier,
      points: tiers[selectedTier],
      timestamp: new Date(),
      didHash: 'did:civic:0x7f3e2d1a'
    };

    const updatedActions = [newAction, ...recentActions.slice(0, 9)]; // Keep last 10 actions
    setRecentActions(updatedActions);
    updateMetrics(updatedActions);

    const validationEnd = performance.now();
    const validationTime = validationEnd - validationStart;
    
    if (validationTime > 100) {
      console.log(`TruthPointCalculator validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
    }

    console.log(`Truth Point attributed: ${newAction.points} points for ${selectedAction} (${selectedTier} tier)`);
    console.log('🔇 TTS disabled: "Points calculated and attributed"');
  };

  const getActionIcon = (actionType: ContributorAction['type']) => {
    switch (actionType) {
      case 'vote': return '🗳️';
      case 'proposal': return '📝';
      case 'verification': return '✅';
      case 'education': return '📚';
      case 'dispute_resolution': return '⚖️';
      default: return '🔹';
    }
  };

  const getTierColor = (tier: ContributorAction['tier']) => {
    switch (tier) {
      case 'basic': return 'text-slate-400';
      case 'verified': return 'text-blue-400';
      case 'expert': return 'text-green-400';
      case 'authority': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Truth Point Calculator</h3>
        </div>
        <div className="text-xs text-slate-400">
          {renderTime.toFixed(1)}ms
        </div>
      </div>

      {/* Tier System Display */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Point Tier System</div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(tiers).map(([tier, points]) => (
            <div key={tier} className="bg-slate-800 rounded-lg p-3">
              <div className={`text-xs font-medium ${getTierColor(tier as ContributorAction['tier'])} mb-1`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </div>
              <div className="text-lg font-semibold text-slate-100">{points} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Simulation Interface */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Simulate Contribution</div>
        
        {/* Action Type Selection */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-2">Action Type</label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value as ContributorAction['type'])}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm"
          >
            <option value="vote">Civic Vote</option>
            <option value="proposal">Policy Proposal</option>
            <option value="verification">Identity Verification</option>
            <option value="education">Educational Content</option>
            <option value="dispute_resolution">Dispute Resolution</option>
          </select>
        </div>

        {/* Tier Selection */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-2">Contributor Tier</label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as ContributorAction['tier'])}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm"
          >
            <option value="basic">Basic (10 pts)</option>
            <option value="verified">Verified (50 pts)</option>
            <option value="expert">Expert (100 pts)</option>
            <option value="authority">Authority (200 pts)</option>
          </select>
        </div>

        {/* Live Preview */}
        <div className="bg-slate-800 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Points for this action:</span>
            <span className={`text-sm font-semibold ${getTierColor(selectedTier)}`}>
              +{tiers[selectedTier]} pts
            </span>
          </div>
        </div>

        {/* Simulate Button */}
        <button
          onClick={handleActionSimulation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          Simulate Contribution
        </button>
      </div>

      {/* Calculator Metrics */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Current Metrics</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-300">Total Points</span>
            </div>
            <div className="text-lg font-semibold text-slate-100">
              {calculatorMetrics.totalPoints.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-300">Daily Points</span>
            </div>
            <div className="text-lg font-semibold text-slate-100">
              {calculatorMetrics.dailyPoints.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-slate-300">Actions</span>
            </div>
            <div className="text-lg font-semibold text-slate-100">
              {calculatorMetrics.actionCount}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-300">Avg/Action</span>
            </div>
            <div className="text-lg font-semibold text-slate-100">
              {calculatorMetrics.averagePerAction.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Actions */}
      <div>
        <div className="text-sm font-medium text-slate-300 mb-3">Recent Actions</div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentActions.map((action) => (
            <div key={action.id} className="bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{getActionIcon(action.type)}</span>
                  <span className="text-xs text-slate-300 capitalize">
                    {action.type.replace('_', ' ')}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${getTierColor(action.tier)}`}>
                  +{action.points} pts
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {action.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Points Warning */}
      {calculatorMetrics.dailyPoints >= 800 && (
        <div className="mt-4 p-3 bg-amber-900 border border-amber-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-200">
              Approaching daily limit (1,000 pts/day)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthPointCalculator;