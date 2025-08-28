/**
 * FederationProposalReview.tsx - Phase X-FED Step 2
 * 
 * Badgeholder review pane with real-time sentiment and reputation streak overlays
 * Integration with /deck/10 sentiment analysis and cross-deck synchronization
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-FED Global Federation DAO Framework - Step 2
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Eye, ThumbsUp, ThumbsDown, AlertTriangle, Users, TrendingUp, MessageSquare, Shield } from 'lucide-react';

interface ProposalDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  submitterDID: string;
  targetJurisdictions: string[];
  submissionDate: string;
  votingDeadline: string;
  quorumRequired: number;
  currentParticipation: number;
}

interface SentimentData {
  overallSentiment: number; // -100 to 100
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalReviews: number;
  sentimentTrend: 'increasing' | 'decreasing' | 'stable';
}

interface BadgeholderReview {
  reviewerDID: string;
  reviewerTier: string;
  reviewerReputation: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  comments: string;
  timestamp: string;
  zkpVerified: boolean;
}

interface ReviewSubmission {
  sentiment: 'positive' | 'negative' | 'neutral';
  comments: string;
  confidenceLevel: number;
  recommendedAction: 'approve' | 'reject' | 'request_changes' | 'abstain';
}

const FederationProposalReview: React.FC<{ proposalId?: string }> = ({ proposalId = 'fed_prop_001' }) => {
  const [proposal] = useState<ProposalDetails>({
    id: proposalId,
    title: 'Cross-Border ZKP Voting Enhancement',
    description: 'Implementation of enhanced zero-knowledge proof mechanisms for cross-jurisdictional voting to improve privacy and security while maintaining transparency for audit purposes.',
    category: 'privacy',
    urgency: 'high',
    submitterDID: 'did:genesis:commander_mark_authority',
    targetJurisdictions: ['US', 'DE', 'UK', 'CA'],
    submissionDate: '2025-07-24T07:30:00Z',
    votingDeadline: '2025-07-31T23:59:59Z',
    quorumRequired: 25,
    currentParticipation: 18
  });

  const [sentimentData, setSentimentData] = useState<SentimentData>({
    overallSentiment: 67,
    positiveCount: 12,
    negativeCount: 3,
    neutralCount: 2,
    totalReviews: 17,
    sentimentTrend: 'increasing'
  });

  const [existingReviews, setExistingReviews] = useState<BadgeholderReview[]>([
    {
      reviewerDID: 'did:genesis:athena_wisdom',
      reviewerTier: 'Commander',
      reviewerReputation: 987,
      sentiment: 'positive',
      comments: 'Excellent privacy enhancement proposal. The ZKP implementation aligns well with cross-border privacy requirements.',
      timestamp: '2025-07-24T08:15:00Z',
      zkpVerified: true
    },
    {
      reviewerDID: 'did:genesis:artemis_governance',
      reviewerTier: 'Governor',
      reviewerReputation: 743,
      sentiment: 'positive',
      comments: 'Strong technical foundation. Recommend proceeding with implementation phases.',
      timestamp: '2025-07-24T08:45:00Z',
      zkpVerified: true
    },
    {
      reviewerDID: 'did:genesis:sophia_consensus',
      reviewerTier: 'Moderator',
      reviewerReputation: 456,
      sentiment: 'neutral',
      comments: 'Proposal has merit but requires clarification on implementation timeline and resource allocation.',
      timestamp: '2025-07-24T09:10:00Z',
      zkpVerified: true
    }
  ]);

  const [currentReview, setCurrentReview] = useState<ReviewSubmission>({
    sentiment: 'neutral',
    comments: '',
    confidenceLevel: 75,
    recommendedAction: 'abstain'
  });

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewerInfo] = useState({
    did: 'did:genesis:current_reviewer',
    tier: 'Governor',
    reputation: 654,
    streakDays: 23
  });

  // Simulate real-time sentiment updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentData(prev => {
        const fluctuation = (Math.random() - 0.5) * 4; // Small fluctuation
        const newSentiment = Math.max(-100, Math.min(100, prev.overallSentiment + fluctuation));
        
        return {
          ...prev,
          overallSentiment: Math.round(newSentiment),
          sentimentTrend: fluctuation > 0 ? 'increasing' : fluctuation < 0 ? 'decreasing' : 'stable'
        };
      });
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const submitReview = async () => {
    setIsSubmittingReview(true);
    
    try {
      console.log('📝 Submitting federation proposal review...');
      
      // Simulate review submission with ZKP verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReview: BadgeholderReview = {
        reviewerDID: reviewerInfo.did,
        reviewerTier: reviewerInfo.tier,
        reviewerReputation: reviewerInfo.reputation,
        sentiment: currentReview.sentiment,
        comments: currentReview.comments,
        timestamp: new Date().toISOString(),
        zkpVerified: true
      };
      
      setExistingReviews(prev => [newReview, ...prev]);
      
      // Update sentiment data
      setSentimentData(prev => {
        const newTotal = prev.totalReviews + 1;
        let newPositive = prev.positiveCount;
        let newNegative = prev.negativeCount;
        let newNeutral = prev.neutralCount;
        
        if (currentReview.sentiment === 'positive') newPositive++;
        else if (currentReview.sentiment === 'negative') newNegative++;
        else newNeutral++;
        
        const newOverallSentiment = Math.round(((newPositive - newNegative) / newTotal) * 100);
        
        return {
          overallSentiment: newOverallSentiment,
          positiveCount: newPositive,
          negativeCount: newNegative,
          neutralCount: newNeutral,
          totalReviews: newTotal,
          sentimentTrend: newOverallSentiment > prev.overallSentiment ? 'increasing' : 'decreasing'
        };
      });
      
      // Reset form
      setCurrentReview({
        sentiment: 'neutral',
        comments: '',
        confidenceLevel: 75,
        recommendedAction: 'abstain'
      });
      
      console.log('✅ Review submitted successfully');
      
      // Emit cross-deck synchronization event
      console.log('🔗 Cross-deck sync: Review data sent to /deck/10');
      
    } catch (error) {
      console.error('❌ Review submission failed:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4" />;
      case 'negative': return <ThumbsDown className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Proposal Overview */}
      <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-100">
            <Eye className="h-6 w-6 text-blue-400" />
            Proposal Review: {proposal.title}
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Phase X-FED Step 2
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <Label className="text-slate-200">Proposal Description</Label>
                <div className="bg-slate-800/50 rounded-lg p-4 text-slate-300">
                  {proposal.description}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-slate-400">Category</Label>
                  <div className="text-slate-200 capitalize">{proposal.category}</div>
                </div>
                <div>
                  <Label className="text-slate-400">Urgency</Label>
                  <Badge variant="outline" className={
                    proposal.urgency === 'high' ? 'text-red-400 border-red-400' :
                    proposal.urgency === 'medium' ? 'text-yellow-400 border-yellow-400' :
                    'text-green-400 border-green-400'
                  }>
                    {proposal.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-400">Quorum</Label>
                  <div className="text-slate-200">{proposal.quorumRequired}%</div>
                </div>
                <div>
                  <Label className="text-slate-400">Participation</Label>
                  <div className="text-slate-200">{proposal.currentParticipation}%</div>
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400">Target Jurisdictions</Label>
                <div className="flex gap-2 mt-1">
                  {proposal.targetJurisdictions.map(jurisdiction => (
                    <Badge key={jurisdiction} variant="outline" className="text-cyan-400 border-cyan-400">
                      {jurisdiction}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <Label className="text-slate-200">Voting Deadline</Label>
                <div className="text-slate-300 text-sm">
                  {new Date(proposal.votingDeadline).toLocaleDateString()}
                </div>
                <div className="text-slate-400 text-xs">
                  {Math.ceil((new Date(proposal.votingDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <Label className="text-slate-200">Submitter</Label>
                <div className="text-slate-300 text-sm font-mono break-all">
                  {proposal.submitterDID.split(':').pop()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Sentiment Analysis */}
        <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-100">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Real-time Sentiment Analysis
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-200">
                {sentimentData.overallSentiment > 0 ? '+' : ''}{sentimentData.overallSentiment}%
              </div>
              <div className="text-slate-400">Overall Sentiment</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className={`h-4 w-4 ${
                  sentimentData.sentimentTrend === 'increasing' ? 'text-green-400' :
                  sentimentData.sentimentTrend === 'decreasing' ? 'text-red-400' :
                  'text-yellow-400'
                }`} />
                <span className="text-sm text-slate-400 capitalize">
                  {sentimentData.sentimentTrend}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-400" />
                  <span className="text-slate-300">Positive</span>
                </div>
                <span className="text-green-400">{sentimentData.positiveCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-400" />
                  <span className="text-slate-300">Negative</span>
                </div>
                <span className="text-red-400">{sentimentData.negativeCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-yellow-400" />
                  <span className="text-slate-300">Neutral</span>
                </div>
                <span className="text-yellow-400">{sentimentData.neutralCount}</span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Reviews</span>
                <span className="text-slate-200">{sentimentData.totalReviews}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Review */}
        <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-100">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              Submit Your Review
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Reviewer</span>
                <span className="text-slate-200">{reviewerInfo.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reputation</span>
                <span className="text-slate-200">{reviewerInfo.reputation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Streak</span>
                <span className="text-green-400">{reviewerInfo.streakDays} days</span>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-200">Sentiment</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['positive', 'neutral', 'negative'].map(sentiment => (
                  <Button
                    key={sentiment}
                    variant={currentReview.sentiment === sentiment ? 'default' : 'outline'}
                    onClick={() => setCurrentReview(prev => ({ ...prev, sentiment: sentiment as any }))}
                    className={`${
                      currentReview.sentiment === sentiment
                        ? sentiment === 'positive' ? 'bg-green-600 hover:bg-green-700' :
                          sentiment === 'negative' ? 'bg-red-600 hover:bg-red-700' :
                          'bg-yellow-600 hover:bg-yellow-700'
                        : 'border-slate-600 text-slate-200'
                    }`}
                  >
                    {getSentimentIcon(sentiment)}
                    <span className="ml-2 capitalize">{sentiment}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comments" className="text-slate-200">Comments</Label>
              <Textarea
                id="comments"
                value={currentReview.comments}
                onChange={(e) => setCurrentReview(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Provide detailed feedback on the proposal..."
                rows={3}
                className="bg-slate-800 border-slate-600 text-slate-200"
              />
            </div>
            
            <div>
              <Label className="text-slate-200">
                Confidence Level ({currentReview.confidenceLevel}%)
              </Label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentReview.confidenceLevel}
                onChange={(e) => setCurrentReview(prev => ({ ...prev, confidenceLevel: Number(e.target.value) }))}
                className="w-full mt-2"
              />
            </div>
            
            <div>
              <Label className="text-slate-200">Recommended Action</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { value: 'approve', label: 'Approve', color: 'green' },
                  { value: 'reject', label: 'Reject', color: 'red' },
                  { value: 'request_changes', label: 'Request Changes', color: 'yellow' },
                  { value: 'abstain', label: 'Abstain', color: 'gray' }
                ].map(action => (
                  <Button
                    key={action.value}
                    variant={currentReview.recommendedAction === action.value ? 'default' : 'outline'}
                    onClick={() => setCurrentReview(prev => ({ ...prev, recommendedAction: action.value as any }))}
                    className={`text-xs ${
                      currentReview.recommendedAction === action.value
                        ? `bg-${action.color}-600 hover:bg-${action.color}-700`
                        : 'border-slate-600 text-slate-200'
                    }`}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={submitReview}
              disabled={isSubmittingReview || !currentReview.comments.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isSubmittingReview ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Submit ZKP-Verified Review
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Reviews */}
      <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-100">
            <Users className="h-5 w-5 text-orange-400" />
            Badgeholder Reviews ({existingReviews.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {existingReviews.map((review, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${getSentimentColor(review.sentiment)}`}>
                      {getSentimentIcon(review.sentiment)}
                    </div>
                    <div>
                      <div className="text-slate-200 font-medium">
                        {review.reviewerDID.split(':').pop()}
                      </div>
                      <div className="text-slate-400 text-sm flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {review.reviewerTier}
                        </Badge>
                        <span>Rep: {review.reviewerReputation}</span>
                        {review.zkpVerified && (
                          <Shield className="h-3 w-3 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {formatTimeAgo(review.timestamp)}
                  </div>
                </div>
                
                <div className="text-slate-300">
                  {review.comments}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FederationProposalReview;