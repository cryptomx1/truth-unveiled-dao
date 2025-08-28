/**
 * GovernanceCard - Phase XI-E Translation Integration
 * Using useTranslation hook for multilingual support
 * Authority: Commander Mark | JASMY Relay authorization
 */

import React, { useState, useEffect } from 'react';
import { Vote, Users, FileText, TrendingUp } from 'lucide-react';
import { useTranslation } from '../../../translation/useTranslation';
import { useLangContext } from '../../../context/LanguageContext';

interface Proposal {
  id: string;
  title: string;
  description: string;
  votes: { support: number; oppose: number };
  status: 'active' | 'passed' | 'rejected';
  deadline: Date;
}

interface GovernanceCardProps {
  className?: string;
  onVote?: (proposalId: string, vote: 'support' | 'oppose') => void;
}

export const GovernanceCard: React.FC<GovernanceCardProps> = ({
  className = '',
  onVote
}) => {
  const { t } = useTranslation();
  const { language } = useLangContext();
  const [proposals] = useState<Proposal[]>([
    {
      id: 'prop_1',
      title: 'Community Park Renovation',
      description: 'Allocate budget for playground equipment and green space improvements',
      votes: { support: 127, oppose: 23 },
      status: 'active',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    },
    {
      id: 'prop_2',
      title: 'Digital Privacy Initiative', 
      description: 'Implement stricter data protection measures for civic services',
      votes: { support: 89, oppose: 45 },
      status: 'active',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    }
  ]);
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());

  // Console log when component re-renders in different language
  useEffect(() => {
    console.log(`🈳 GovernanceCard re-rendered in: ${language.toUpperCase()}`);
  }, [language]);

  const handleVote = (proposalId: string, vote: 'support' | 'oppose') => {
    if (votedProposals.has(proposalId)) return;
    
    console.log(`🗳️ Vote cast: ${vote} for proposal ${proposalId}`);
    setVotedProposals(prev => new Set([...prev, proposalId]));
    onVote?.(proposalId, vote);
  };

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'active':
        return 'text-blue-400 bg-blue-600/20';
      case 'passed':
        return 'text-green-400 bg-green-600/20';
      case 'rejected':
        return 'text-red-400 bg-red-600/20';
      default:
        return 'text-slate-400 bg-slate-600/20';
    }
  };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Vote className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-base font-semibold text-white">
            {t('card.governance.title')}
          </h3>
          <p className="text-xs text-slate-400">
            {t('card.governance.description')}
          </p>
        </div>
      </div>

      {/* Governance Stats */}
      <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="text-purple-400 font-semibold">{proposals.length}</div>
            <div className="text-slate-400">{t('card.governance.proposals')}</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-semibold">
              {proposals.reduce((acc, p) => acc + p.votes.support + p.votes.oppose, 0)}
            </div>
            <div className="text-slate-400">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">{votedProposals.size}</div>
            <div className="text-slate-400">Your Votes</div>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {proposals.map((proposal) => {
          const totalVotes = proposal.votes.support + proposal.votes.oppose;
          const supportPercentage = totalVotes > 0 ? (proposal.votes.support / totalVotes) * 100 : 0;
          const hasVoted = votedProposals.has(proposal.id);

          return (
            <div key={proposal.id} className="p-3 bg-slate-700/30 rounded-lg">
              {/* Proposal Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{proposal.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{proposal.description}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(proposal.status)}`}>
                  {proposal.status}
                </div>
              </div>

              {/* Vote Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Support: {proposal.votes.support}</span>
                  <span>Oppose: {proposal.votes.oppose}</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${supportPercentage}%` }}
                  />
                </div>
              </div>

              {/* Voting Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(proposal.id, 'support')}
                    disabled={hasVoted}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      hasVoted
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-300'
                    }`}
                    aria-label={`${t('card.governance.voting')} - Support`}
                  >
                    Support
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'oppose')}
                    disabled={hasVoted}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      hasVoted
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300'
                    }`}
                    aria-label={`${t('card.governance.voting')} - Oppose`}
                  >
                    Oppose
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  {formatTimeRemaining(proposal.deadline)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-300 transition-colors"
          aria-label={t('card.governance.results')}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">{t('card.governance.results')}</span>
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 transition-colors"
          aria-label="View All Proposals"
        >
          <FileText className="w-4 h-4" />
          <span className="text-xs">All Proposals</span>
        </button>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• Proposals require majority support to pass</div>
        <div>• Your vote is recorded using zero-knowledge proofs for privacy</div>
      </div>
    </div>
  );
};

export default GovernanceCard;