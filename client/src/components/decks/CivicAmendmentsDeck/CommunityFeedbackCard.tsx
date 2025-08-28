import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  MessageSquare,
  Hash,
  TrendingUp,
  Filter,
  Eye,
  Clock,
  Shield,
  Zap,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Brain,
  Send,
  Lock
} from 'lucide-react';

type SentimentType = 'support' | 'oppose' | 'question' | 'insight';
type AmendmentScope = 'local' | 'regional' | 'national' | 'constitutional';

interface CommunityComment {
  id: string;
  content: string;
  sentiment: SentimentType;
  scope: AmendmentScope;
  submittedAt: Date;
  zkpHash: string;
  encrypted: boolean;
  endorsements: number;
  influence: number; // 0-100% influence on amendment
}

interface SentimentStats {
  support: number;
  oppose: number;
  question: number;
  insight: number;
  total: number;
}

interface CommunityFeedbackCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock community comments with cryptographic blinding
const MOCK_COMMENTS: CommunityComment[] = [
  {
    id: 'comment_001',
    content: 'This amendment addresses a critical gap in our local governance framework.',
    sentiment: 'support',
    scope: 'local',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    zkpHash: 'zkp_comm_a1b2c3d4',
    encrypted: true,
    endorsements: 12,
    influence: 15
  },
  {
    id: 'comment_002',
    content: '******* ******** *** ******** ***** *** ******', // Encrypted placeholder
    sentiment: 'oppose',
    scope: 'regional',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    zkpHash: 'zkp_comm_e5f6g7h8',
    encrypted: true,
    endorsements: 8,
    influence: 22
  },
  {
    id: 'comment_003',
    content: 'Can someone clarify the implementation timeline for this proposal?',
    sentiment: 'question',
    scope: 'national',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    zkpHash: 'zkp_comm_i9j0k1l2',
    encrypted: false,
    endorsements: 5,
    influence: 8
  },
  {
    id: 'comment_004',
    content: '****** ******** *** ******** ******* *** ******* ********', // Encrypted placeholder
    sentiment: 'insight',
    scope: 'constitutional',
    submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    zkpHash: 'zkp_comm_m3n4o5p6',
    encrypted: true,
    endorsements: 18,
    influence: 35
  },
  {
    id: 'comment_005',
    content: 'Strong support for this amendment. Long overdue reform.',
    sentiment: 'support',
    scope: 'local',
    submittedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    zkpHash: 'zkp_comm_q7r8s9t0',
    encrypted: false,
    endorsements: 25,
    influence: 42
  }
];

// Get sentiment info with emoji icons
const getSentimentInfo = (sentiment: SentimentType) => {
  switch (sentiment) {
    case 'support':
      return {
        emoji: '👍',
        label: 'Support',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        icon: <ThumbsUp className="w-3 h-3" />
      };
    case 'oppose':
      return {
        emoji: '👎',
        label: 'Oppose',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        icon: <ThumbsDown className="w-3 h-3" />
      };
    case 'question':
      return {
        emoji: '❓',
        label: 'Question',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        icon: <HelpCircle className="w-3 h-3" />
      };
    case 'insight':
      return {
        emoji: '🧠',
        label: 'Insight',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        icon: <Brain className="w-3 h-3" />
      };
  }
};

// Get scope info
const getScopeInfo = (scope: AmendmentScope) => {
  switch (scope) {
    case 'local':
      return { label: 'Local', color: 'text-blue-400' };
    case 'regional':
      return { label: 'Regional', color: 'text-green-400' };
    case 'national':
      return { label: 'National', color: 'text-purple-400' };
    case 'constitutional':
      return { label: 'Constitutional', color: 'text-amber-400' };
  }
};

// Generate ZKP hash for comments
const generateCommentZKP = (): string => {
  return `zkp_comm_${Math.random().toString(36).substr(2, 8)}`;
};

// Format timestamp
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  } else {
    return 'Just now';
  }
};

// Calculate sentiment statistics
const calculateSentimentStats = (comments: CommunityComment[], scopeFilter?: AmendmentScope): SentimentStats => {
  const filteredComments = scopeFilter 
    ? comments.filter(c => c.scope === scopeFilter)
    : comments;

  const stats = {
    support: filteredComments.filter(c => c.sentiment === 'support').length,
    oppose: filteredComments.filter(c => c.sentiment === 'oppose').length,
    question: filteredComments.filter(c => c.sentiment === 'question').length,
    insight: filteredComments.filter(c => c.sentiment === 'insight').length,
    total: filteredComments.length
  };

  return stats;
};

export const CommunityFeedbackCard: React.FC<CommunityFeedbackCardProps> = ({ className }) => {
  const [comments, setComments] = useState<CommunityComment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState<string>('');
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType>('support');
  const [selectedScope, setSelectedScope] = useState<AmendmentScope>('local');
  const [scopeFilter, setScopeFilter] = useState<AmendmentScope | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [sentimentSkewTriggered, setSentimentSkewTriggered] = useState<boolean>(false);
  const [influenceMeter, setInfluenceMeter] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CommunityFeedbackCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CommunityFeedbackCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      console.log(`🔊 TTS throttled: "${message}" (${now - ttsStatus.lastTrigger}ms since last)`);
      return;
    }
    
    if (!ttsStatus.isReady) {
      console.log(`🔊 TTS not ready: "${message}"`);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          lastTrigger: now 
        }));
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS completed: "${message}"`);
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS error: "${message}"`);
        };
        
        window.speechSynthesis.speak(utterance);
        console.log(`🔊 TTS started: "${message}"`);
      }, 40); // <40ms latency requirement
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Initialize TTS on mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          // Mount TTS message
          setTimeout(() => {
            speakMessage("Community feedback interface ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Real-time update simulation (5-second interval)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new comment or endorsement
      if (Math.random() > 0.7) {
        setComments(prev => prev.map(comment => ({
          ...comment,
          endorsements: comment.endorsements + Math.floor(Math.random() * 3),
          influence: Math.min(100, comment.influence + Math.floor(Math.random() * 5))
        })));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Monitor sentiment skew for pushback trigger (>70% in one direction)
  useEffect(() => {
    const stats = calculateSentimentStats(comments, scopeFilter === 'all' ? undefined : scopeFilter);
    if (stats.total > 0) {
      const supportPercentage = (stats.support / stats.total) * 100;
      const opposePercentage = (stats.oppose / stats.total) * 100;
      
      if (supportPercentage > 70 || opposePercentage > 70) {
        setSentimentSkewTriggered(true);
        console.log(`⚠️ Sentiment skew detected: ${supportPercentage.toFixed(1)}% support, ${opposePercentage.toFixed(1)}% oppose`);
      } else {
        setSentimentSkewTriggered(false);
      }
    }

    // Calculate overall influence meter
    const totalInfluence = comments.reduce((sum, comment) => sum + comment.influence, 0);
    const averageInfluence = comments.length > 0 ? totalInfluence / comments.length : 0;
    setInfluenceMeter(Math.min(100, averageInfluence));
  }, [comments, scopeFilter]);

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      speakMessage("Please enter a comment");
      return;
    }

    setIsSubmitting(true);

    // Simulate processing delay (<100ms sync target)
    await new Promise(resolve => setTimeout(resolve, 80));

    const zkpHash = generateCommentZKP();
    const newCommentObj: CommunityComment = {
      id: `comment_${Date.now()}`,
      content: newComment,
      sentiment: selectedSentiment,
      scope: selectedScope,
      submittedAt: new Date(),
      zkpHash: zkpHash,
      encrypted: Math.random() > 0.5, // 50% chance of encryption
      endorsements: 0,
      influence: Math.floor(Math.random() * 20) + 5 // 5-25% initial influence
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
    setIsSubmitting(false);

    const sentimentInfo = getSentimentInfo(selectedSentiment);
    speakMessage(`${sentimentInfo.label} feedback submitted`);
  };

  // Filter comments based on scope
  const filteredComments = scopeFilter === 'all' 
    ? comments 
    : comments.filter(comment => comment.scope === scopeFilter);

  const sentimentStats = calculateSentimentStats(comments, scopeFilter === 'all' ? undefined : scopeFilter);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Community Feedback Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          sentimentSkewTriggered ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        )}
        aria-label={sentimentSkewTriggered ? "Status: Sentiment Skew Alert" : "Status: Active"}
        title={sentimentSkewTriggered ? "Sentiment heavily skewed in one direction" : "Community feedback active"}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Community Feedback
          </CardTitle>
          <Badge variant="outline" className="border-slate-600 bg-slate-700/20 text-slate-300">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {influenceMeter.toFixed(0)}%
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Anonymous sentiment and encrypted community discussion
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sentiment Skew Alert */}
        {sentimentSkewTriggered && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Sentiment Skew Detected
              </span>
            </div>
            <div className="text-xs text-red-300">
              Over 70% sentiment bias detected in current scope
            </div>
          </div>
        )}

        {/* Sentiment Statistics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              Sentiment Overview
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['support', 'oppose', 'question', 'insight'] as SentimentType[]).map(sentiment => {
              const info = getSentimentInfo(sentiment);
              const count = sentimentStats[sentiment];
              const percentage = sentimentStats.total > 0 ? (count / sentimentStats.total) * 100 : 0;
              
              return (
                <div key={sentiment} className="space-y-1">
                  <div className="text-lg">{info.emoji}</div>
                  <div className="text-xs font-bold text-slate-200">{count}</div>
                  <div className="text-xs text-slate-400">{percentage.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700 text-center">
            <div className="text-xs text-slate-400">
              Total: {sentimentStats.total} comments
            </div>
          </div>
        </div>

        {/* Endorsement Impact Meter */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Community Influence
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Impact Level</span>
              <span className="text-purple-400 font-bold">{influenceMeter.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${influenceMeter}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scope Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Scope Filter
            </span>
          </div>
          
          <Select value={scopeFilter} onValueChange={(value: AmendmentScope | 'all') => setScopeFilter(value)}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="constitutional">Constitutional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comment Submission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Submit Feedback
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedSentiment} onValueChange={(value: SentimentType) => setSelectedSentiment(value)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {(['support', 'oppose', 'question', 'insight'] as SentimentType[]).map(sentiment => {
                  const info = getSentimentInfo(sentiment);
                  return (
                    <SelectItem key={sentiment} value={sentiment}>
                      <div className="flex items-center gap-2">
                        <span>{info.emoji}</span>
                        <span>{info.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={selectedScope} onValueChange={(value: AmendmentScope) => setSelectedScope(value)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="national">National</SelectItem>
                <SelectItem value="constitutional">Constitutional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your feedback on this amendment..."
            className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-400 min-h-[80px] resize-none"
            maxLength={280}
          />
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400">
              {newComment.length}/280 characters
            </div>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-3 h-3" />
                  Submit
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Comment Thread */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Community Comments
            </span>
          </div>
          
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-3 pr-4">
              {filteredComments.map((comment) => {
                const sentimentInfo = getSentimentInfo(comment.sentiment);
                const scopeInfo = getScopeInfo(comment.scope);
                
                return (
                  <div
                    key={comment.id}
                    className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'p-1 rounded text-xs',
                          sentimentInfo.bgColor,
                          sentimentInfo.color
                        )}>
                          {sentimentInfo.emoji}
                        </div>
                        <Badge variant="outline" className={cn(
                          'text-xs border-opacity-50',
                          scopeInfo.color.replace('text-', 'border-').replace('-400', '-500/30'),
                          scopeInfo.color.replace('text-', 'bg-').replace('-400', '-500/10'),
                          scopeInfo.color
                        )}>
                          {scopeInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {comment.encrypted && <Lock className="w-3 h-3" />}
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(comment.submittedAt)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-300 mb-2">
                      {comment.encrypted && comment.content.includes('*') ? (
                        <span className="font-mono text-slate-500">{comment.content}</span>
                      ) : (
                        comment.content
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-slate-400">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.endorsements}
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                          <TrendingUp className="w-3 h-3" />
                          {comment.influence}%
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">{comment.zkpHash}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Community feedback interface ready,
          Current scope filter: {scopeFilter === 'all' ? 'All scopes' : getScopeInfo(scopeFilter).label},
          Total comments: {sentimentStats.total},
          Community influence: {influenceMeter.toFixed(0)}%,
          {sentimentSkewTriggered && 'Alert: Sentiment heavily skewed in one direction'}
        </div>
      </CardContent>
    </Card>
  );
};
export default CommunityFeedbackCard;
