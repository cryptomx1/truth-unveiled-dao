/**
 * VoteResultsPanel.tsx - Phase XXII
 * DAO Vote Results Dashboard with Tier Weighting and Live Updates
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Minus,
  Eye,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';
import { 
  getVoteTally, 
  getRecentVotes, 
  type VoteTally, 
  type DAOVote, 
  type VoterTier 
} from '../../dao/DAOVoteEngine';

// Component props interface
interface VoteResultsPanelProps {
  billId: string;
  district?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Component state interfaces
interface TallyState {
  tally: VoteTally | null;
  isLoading: boolean;
  lastUpdated: string;
  error: string | null;
}

interface RecentActivity {
  votes: DAOVote[];
  isLoading: boolean;
  error: string | null;
}

// Main VoteResultsPanel component
export const VoteResultsPanel: React.FC<VoteResultsPanelProps> = ({
  billId,
  district,
  autoRefresh = true,
  refreshInterval = 10000 // 10 seconds
}) => {
  // Component state
  const [tallyState, setTallyState] = useState<TallyState>({
    tally: null,
    isLoading: true,
    lastUpdated: '',
    error: null
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    votes: [],
    isLoading: true,
    error: null
  });
  
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTier, setSelectedTier] = useState<VoterTier | 'all'>('all');
  
  // ARIA live region ref
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  const previousTallyRef = useRef<VoteTally | null>(null);
  
  // Load vote tally
  const loadVoteTally = async () => {
    try {
      setTallyState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const tally = await getVoteTally(billId, district);
      
      // Check for changes and announce
      if (previousTallyRef.current && ariaLiveRef.current) {
        const prev = previousTallyRef.current;
        const curr = tally;
        
        if (prev.totalVotes !== curr.totalVotes) {
          ariaLiveRef.current.textContent = `🗳️ Vote tally updated: ${curr.breakdown.support.count} Support, ${curr.breakdown.oppose.count} Oppose, ${curr.breakdown.abstain.count} Abstain`;
        }
      }
      
      previousTallyRef.current = tally;
      
      setTallyState({
        tally,
        isLoading: false,
        lastUpdated: new Date().toLocaleTimeString(),
        error: null
      });
      
    } catch (error) {
      console.error('❌ Failed to load vote tally:', error);
      setTallyState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load tally: ${error}`
      }));
    }
  };
  
  // Load recent activity
  const loadRecentActivity = async () => {
    try {
      setRecentActivity(prev => ({ ...prev, isLoading: true, error: null }));
      
      const votes = await getRecentVotes(20);
      
      // Filter by bill ID and district if specified
      const filteredVotes = votes.filter(vote => {
        const matchesBill = vote.billId === billId;
        const matchesDistrict = !district || vote.district === district;
        return matchesBill && matchesDistrict;
      });
      
      setRecentActivity({
        votes: filteredVotes,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ Failed to load recent activity:', error);
      setRecentActivity(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load activity: ${error}`
      }));
    }
  };
  
  // Refresh all data
  const refreshData = async () => {
    await Promise.all([loadVoteTally(), loadRecentActivity()]);
  };
  
  // Initial load and auto-refresh setup
  useEffect(() => {
    refreshData();
    
    if (autoRefresh) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [billId, district, autoRefresh, refreshInterval]);
  
  // Get vote icon
  const getVoteIcon = (voteValue: string) => {
    switch (voteValue) {
      case 'support': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'oppose': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'abstain': return <Minus className="w-4 h-4 text-gray-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };
  
  // Get tier color
  const getTierColor = (tier: VoterTier) => {
    switch (tier) {
      case 'citizen': return 'text-blue-400';
      case 'moderator': return 'text-yellow-400';
      case 'governor': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };
  
  // Get tier weight
  const getTierWeight = (tier: VoterTier) => {
    switch (tier) {
      case 'citizen': return '1x';
      case 'moderator': return '2x';
      case 'governor': return '3x';
      default: return '1x';
    }
  };
  
  // Calculate percentage
  const calculatePercentage = (count: number, total: number): number => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };
  
  // Format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  // Filter recent votes by tier
  const filteredRecentVotes = selectedTier === 'all' 
    ? recentActivity.votes 
    : recentActivity.votes.filter(vote => vote.voterTier === selectedTier);
  
  if (tallyState.isLoading && recentActivity.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-slate-800 border border-slate-600 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
          <h2 className="text-xl font-semibold text-slate-200">Loading Vote Results...</h2>
        </div>
      </div>
    );
  }
  
  if (tallyState.error && recentActivity.error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-slate-800 border border-red-600 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-semibold text-red-300">Error Loading Results</h2>
        </div>
        <p className="text-red-400">{tallyState.error}</p>
        <button
          onClick={refreshData}
          className="mt-4 px-4 py-2 bg-red-900/30 border border-red-600 text-red-300 rounded-lg hover:bg-red-800/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ARIA Live Region */}
      <div 
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Header */}
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-semibold text-slate-200">
              DAO Vote Results
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              aria-label="Refresh vote data"
            >
              <Activity className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              aria-label="Toggle detailed view"
              aria-expanded={showDetails}
            >
              <Eye className="w-4 h-4" />
              <span>{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
          <div>
            <span className="font-medium">Bill ID:</span> {billId}
          </div>
          {district && (
            <div>
              <span className="font-medium">District:</span> {district}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Updated: {tallyState.lastUpdated}</span>
          </div>
        </div>
      </div>
      
      {/* Vote Tally Summary */}
      {tallyState.tally && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-4">Current Tally</h2>
          
          {/* Main Vote Counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-300">Support</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {tallyState.tally.breakdown.support.count}
              </div>
              <div className="text-sm text-green-300">
                Weight: {tallyState.tally.breakdown.support.weight} 
                ({calculatePercentage(tallyState.tally.breakdown.support.count, tallyState.tally.totalVotes)}%)
              </div>
            </div>
            
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-300">Oppose</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {tallyState.tally.breakdown.oppose.count}
              </div>
              <div className="text-sm text-red-300">
                Weight: {tallyState.tally.breakdown.oppose.weight}
                ({calculatePercentage(tallyState.tally.breakdown.oppose.count, tallyState.tally.totalVotes)}%)
              </div>
            </div>
            
            <div className="bg-gray-900/20 border border-gray-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Minus className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-300">Abstain</span>
              </div>
              <div className="text-2xl font-bold text-gray-400">
                {tallyState.tally.breakdown.abstain.count}
              </div>
              <div className="text-sm text-gray-300">
                Weight: {tallyState.tally.breakdown.abstain.weight}
                ({calculatePercentage(tallyState.tally.breakdown.abstain.count, tallyState.tally.totalVotes)}%)
              </div>
            </div>
          </div>
          
          {/* Tier Distribution */}
          {showDetails && (
            <div className="pt-4 border-t border-slate-600">
              <h3 className="text-md font-medium text-slate-200 mb-3">Tier Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300">Citizens</span>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-medium">
                      {tallyState.tally.tierDistribution.citizen.count}
                    </div>
                    <div className="text-xs text-blue-300">
                      Weight: {tallyState.tally.tierDistribution.citizen.weight}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300">Moderators</span>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-medium">
                      {tallyState.tally.tierDistribution.moderator.count}
                    </div>
                    <div className="text-xs text-yellow-300">
                      Weight: {tallyState.tally.tierDistribution.moderator.weight}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300">Governors</span>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 font-medium">
                      {tallyState.tally.tierDistribution.governor.count}
                    </div>
                    <div className="text-xs text-purple-300">
                      Weight: {tallyState.tally.tierDistribution.governor.weight}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Recent Activity */}
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-200">Recent Activity</h2>
          
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as VoterTier | 'all')}
            className="px-3 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-sm"
            aria-label="Filter by voter tier"
          >
            <option value="all">All Tiers</option>
            <option value="citizen">Citizens Only</option>
            <option value="moderator">Moderators Only</option>
            <option value="governor">Governors Only</option>
          </select>
        </div>
        
        {recentActivity.isLoading ? (
          <div className="flex items-center gap-3 py-8">
            <div className="w-6 h-6 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
            <span className="text-slate-400">Loading recent activity...</span>
          </div>
        ) : filteredRecentVotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No recent votes found for the selected criteria.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredRecentVotes.map((vote) => (
              <div
                key={vote.voteId}
                className="flex items-center justify-between p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getVoteIcon(vote.voteValue)}
                  <div>
                    <div className="text-sm font-medium text-slate-200">
                      Vote ID: {vote.voteId}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatTimeAgo(vote.metadata.submittedAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-right">
                  <div className={`text-sm ${getTierColor(vote.voterTier)}`}>
                    {vote.voterTier.charAt(0).toUpperCase() + vote.voterTier.slice(1)}
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    {getTierWeight(vote.voterTier)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteResultsPanel;