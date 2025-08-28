import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, TrendingUp, Users, Vote, Zap } from 'lucide-react';

interface InnovationProposalsProps {
  moduleId?: string;
  proposalType?: 'community' | 'technical' | 'governance';
}

export const Deck9Module1: React.FC<InnovationProposalsProps> = ({ 
  moduleId = 'innovation-proposals',
  proposalType = 'community' 
}) => {
  const [selectedProposal, setSelectedProposal] = useState<string>('');

  const innovationMetrics = {
    activeProposals: 23,
    totalSubmissions: 156,
    communityVotes: 4892,
    implementationRate: 67.4,
    avgFundingAmount: '$12,500',
    successfulInnovations: 42
  };

  const proposals = [
    {
      id: 'PROP-2025-001',
      title: 'AI-Powered Citizen Services Chatbot',
      category: 'Technical Innovation',
      submitter: 'TechCivic Solutions',
      status: 'Under Review',
      votes: 847,
      funding: '$25,000',
      progress: 35,
      description: 'Implement an AI chatbot to handle common citizen service requests 24/7'
    },
    {
      id: 'PROP-2025-002',
      title: 'Community Garden Network Expansion',
      category: 'Community Initiative',
      submitter: 'Green Neighborhoods',
      status: 'Approved',
      votes: 1203,
      funding: '$8,500',
      progress: 78,
      description: 'Expand urban community gardens to increase local food security'
    },
    {
      id: 'PROP-2025-003',
      title: 'Digital Democracy Platform Enhancement',
      category: 'Governance Innovation',
      submitter: 'Civic Tech Collective',
      status: 'Voting Phase',
      votes: 592,
      funding: '$18,700',
      progress: 12,
      description: 'Enhance online voting and citizen engagement tools'
    },
    {
      id: 'PROP-2025-004',
      title: 'Renewable Energy Micro-Grid Pilot',
      category: 'Environmental Innovation',
      submitter: 'SustainableCity Initiative',
      status: 'Implementation',
      votes: 934,
      funding: '$45,000',
      progress: 89,
      description: 'Pilot program for neighborhood-scale renewable energy systems'
    }
  ];

  const innovationCategories = [
    { name: 'Technical Innovation', count: 7, funded: 4, successRate: 71 },
    { name: 'Community Initiatives', count: 9, funded: 6, successRate: 89 },
    { name: 'Governance Innovation', count: 4, funded: 2, successRate: 50 },
    { name: 'Environmental Solutions', count: 3, funded: 3, successRate: 100 }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 dark:text-green-400';
      case 'implementation': return 'text-blue-600 dark:text-blue-400';
      case 'voting phase': return 'text-purple-600 dark:text-purple-400';
      case 'under review': return 'text-yellow-600 dark:text-yellow-400';
      case 'rejected': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical innovation': return 'bg-blue-500';
      case 'community initiative': return 'bg-green-500';
      case 'governance innovation': return 'bg-purple-500';
      case 'environmental innovation': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleProposalSelect = (proposalId: string) => {
    setSelectedProposal(proposalId);
    console.log(`💡 Selected proposal: ${proposalId}`);
  };

  const handleVote = (proposalId: string, voteType: 'support' | 'oppose') => {
    console.log(`🗳️ Voted ${voteType} on proposal: ${proposalId}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            Deck 9 Module 1: Innovation Proposals
            <Badge variant="outline" className="ml-auto">
              {proposalType.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {innovationMetrics.activeProposals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Proposals
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {innovationMetrics.totalSubmissions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Submissions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {innovationMetrics.communityVotes.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Community Votes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {innovationMetrics.implementationRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Implementation Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {innovationMetrics.avgFundingAmount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Funding
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {innovationMetrics.successfulInnovations}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Implemented
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Proposals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Innovation Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card 
                key={proposal.id} 
                className={`border cursor-pointer transition-all ${
                  selectedProposal === proposal.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => handleProposalSelect(proposal.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{proposal.title}</span>
                        <Badge className={getCategoryColor(proposal.category)}>
                          {proposal.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {proposal.description}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>ID: {proposal.id}</span>
                        <span>By: {proposal.submitter}</span>
                        <span>Funding: {proposal.funding}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`text-sm font-medium ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {proposal.votes} votes
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Implementation Progress:</span>
                      <span>{proposal.progress}%</span>
                    </div>
                    <Progress value={proposal.progress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(proposal.id, 'support');
                      }}
                    >
                      <Vote className="h-4 w-4 mr-1" />
                      Support
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(proposal.id, 'oppose');
                      }}
                    >
                      <Vote className="h-4 w-4 mr-1" />
                      Oppose
                    </Button>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Innovation Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Innovation Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {innovationCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="space-y-1">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {category.count} proposals | {category.funded} funded
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{category.successRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Success Rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Innovation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Lightbulb className="h-5 w-5" />
              <span className="text-sm">Submit Proposal</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Join Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm">Fund Innovation</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Innovation Proposals Module - Type: {proposalType}</span>
            </div>
            <Badge variant="secondary">
              Module Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deck9Module1;