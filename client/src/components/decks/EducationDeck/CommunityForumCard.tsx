import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { MessageCircle, Send, Lock, Users, Shield, UserCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ForumPost {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  side: 'left' | 'right';
  category: 'question' | 'answer' | 'discussion';
}

interface CommunityForumCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post1',
    username: 'CivicLearner',
    message: 'How does local government funding actually work? I want to understand where my tax dollars go.',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    side: 'left',
    category: 'question'
  },
  {
    id: 'post2',
    username: 'PolicyExpert',
    message: 'Great question! Local funding comes from property taxes, state transfers, and fees. Each city publishes annual budgets online.',
    timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
    side: 'right',
    category: 'answer'
  },
  {
    id: 'post3',
    username: 'CommunityMember',
    message: 'What are the most effective ways to make my voice heard in local politics?',
    timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
    side: 'left',
    category: 'question'
  },
  {
    id: 'post4',
    username: 'EngagementCoach',
    message: 'Attend city council meetings, join local committees, and connect with your representatives. Consistent participation matters!',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    side: 'right',
    category: 'answer'
  },
  {
    id: 'post5',
    username: 'VoterAdvocate',
    message: 'Does anyone have resources for understanding ballot measures? They can be really confusing.',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    side: 'left',
    category: 'discussion'
  }
];

const getCategoryColor = (category: ForumPost['category']) => {
  switch (category) {
    case 'question':
      return 'bg-blue-500/20 text-blue-300';
    case 'answer':
      return 'bg-green-500/20 text-green-300';
    case 'discussion':
      return 'bg-purple-500/20 text-purple-300';
    default:
      return 'bg-slate-500/20 text-slate-300';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const CommunityForumCard: React.FC<CommunityForumCardProps> = ({ className }) => {
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_FORUM_POSTS);
  const [isPosting, setIsPosting] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CommunityForumCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CommunityForumCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play motivational message on mount
          const utterance = new SpeechSynthesisUtterance("Ask. Learn. Discuss. Together.");
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Auto-scroll to bottom when new posts are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  const playTTSEcho = (messageText: string) => {
    if (ttsStatus.isReady) {
      const utterance = new SpeechSynthesisUtterance(`You said: ${messageText}`);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.6;
      
      setTtsStatus(prev => ({ ...prev, isPlaying: true }));
      speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: false }));
      };
    }
  };

  const handleMessageChange = (value: string) => {
    if (value.length <= 150) {
      setMessage(value);
      
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Set new debounced timer
      const timer = setTimeout(() => {
        if (value.trim()) {
          console.log('Debounced message update:', value);
        }
      }, 300);
      
      setDebounceTimer(timer);
    }
  };

  const handleSubmitMessage = async () => {
    if (!message.trim() || isPosting) return;

    const postStart = performance.now();
    setIsPosting(true);

    try {
      // Simulate posting delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const newPost: ForumPost = {
        id: `post_${Date.now()}`,
        username: 'You',
        message: message.trim(),
        timestamp: new Date(),
        side: 'right',
        category: 'discussion'
      };

      setPosts(prev => [...prev, newPost]);
      playTTSEcho(message.trim());
      setMessage('');

      const postTime = performance.now() - postStart;
      if (postTime > 50) {
        console.warn(`Post display time: ${postTime.toFixed(2)}ms (exceeds 50ms target)`);
      }
    } catch (error) {
      console.error('Failed to post message:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-800 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Community Forum Discussion"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Community Forum
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                  <Lock className="w-3 h-3 mr-1" />
                  <Shield className="w-3 h-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anon Protect in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Ask questions, share knowledge, learn together
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Forum Messages */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3 max-h-64 overflow-y-auto">
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className={cn(
                  'flex',
                  post.side === 'left' ? 'justify-start' : 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-2',
                    post.side === 'left' 
                      ? 'bg-slate-600/50 rounded-tl-none' 
                      : 'bg-blue-600/30 rounded-tr-none'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-medium text-slate-300">
                        {post.username}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs px-1 py-0',
                        getCategoryColor(post.category)
                      )}
                    >
                      {post.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    {post.message}
                  </p>
                  <div className="text-xs text-slate-400 mt-1">
                    {formatTimeAgo(post.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3">
          <div className="space-y-2">
            <Textarea
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or share your thoughts..."
              className={cn(
                'min-h-[60px] resize-none border-slate-600 bg-slate-800/50',
                'text-slate-100 placeholder:text-slate-400',
                'focus:border-blue-500 focus:ring-blue-500/20'
              )}
              maxLength={150}
              aria-label="Forum message input"
              aria-describedby="char-count"
              aria-live="polite"
            />
            <div className="flex items-center justify-between">
              <span 
                id="char-count"
                className={cn(
                  'text-xs',
                  message.length > 140 ? 'text-amber-400' : 'text-slate-400'
                )}
              >
                {message.length}/150
              </span>
              <Button
                onClick={handleSubmitMessage}
                disabled={!message.trim() || isPosting}
                size="sm"
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white',
                  'min-h-[48px] px-4',
                  'disabled:bg-slate-600 disabled:text-slate-400'
                )}
                aria-label="Send message to forum"
              >
                {isPosting ? (
                  <>Posting...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Forum Statistics */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            {posts.length} messages • Active community discussion
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityForumCard;
