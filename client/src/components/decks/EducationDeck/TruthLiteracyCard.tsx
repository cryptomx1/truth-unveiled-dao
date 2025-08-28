import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRight, RotateCcw, Lock, BookOpen, Brain, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  topic: string;
  category: 'truth_voting' | 'misinformation' | 'voter_rights';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface TruthLiteracyCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary purpose of Truth Voting in a decentralized democracy?',
    answer: 'Truth Voting enables citizens to verify information authenticity through cryptographic consensus, ensuring decisions are based on validated facts rather than misinformation.',
    topic: 'Truth Voting Fundamentals',
    category: 'truth_voting',
    difficulty: 'beginner'
  },
  {
    id: 'q2',
    question: 'How can you identify misinformation in civic proposals?',
    answer: 'Look for unverified claims, missing source citations, emotional manipulation tactics, and check against multiple trusted sources. Always verify through official channels.',
    topic: 'Misinformation Detection',
    category: 'misinformation',
    difficulty: 'intermediate'
  },
  {
    id: 'q3',
    question: 'What are your fundamental rights as a voter in a decentralized system?',
    answer: 'You have the right to anonymous voting, access to verified information, fair representation, the ability to verify your vote was counted, and protection from coercion.',
    topic: 'Voter Rights Protection',
    category: 'voter_rights',
    difficulty: 'beginner'
  }
];

const getCategoryIcon = (category: QuizQuestion['category']) => {
  switch (category) {
    case 'truth_voting':
      return <Shield className="w-4 h-4" />;
    case 'misinformation':
      return <Brain className="w-4 h-4" />;
    case 'voter_rights':
      return <BookOpen className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: QuizQuestion['category']) => {
  switch (category) {
    case 'truth_voting':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'misinformation':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'voter_rights':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

export const TruthLiteracyCard: React.FC<TruthLiteracyCardProps> = ({ className }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  const currentQuestion = MOCK_QUIZ_QUESTIONS[currentQuestionIndex];
  const progress = (completedQuestions.size / MOCK_QUIZ_QUESTIONS.length) * 100;

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`TruthLiteracyCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`TruthLiteracyCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play motivational message on mount
          const utterance = new SpeechSynthesisUtterance("Learn to shape your civic voice.");
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

  // TTS on question change
  useEffect(() => {
    if (ttsStatus.isReady && currentQuestion) {
      const utterance = new SpeechSynthesisUtterance("Learn to shape your civic voice.");
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.6;
      
      setTtsStatus(prev => ({ ...prev, isPlaying: true }));
      speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: false }));
      };
    }
  }, [currentQuestionIndex, ttsStatus.isReady]);

  const handleFlipCard = () => {
    const stateChangeStart = performance.now();
    setShowAnswer(!showAnswer);
    
    const stateChangeTime = performance.now() - stateChangeStart;
    if (stateChangeTime > 50) {
      console.warn(`Quiz state change time: ${stateChangeTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleNextQuestion = () => {
    const stateChangeStart = performance.now();
    
    // Mark current question as completed
    setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
    
    // Move to next question or cycle back to start
    if (currentQuestionIndex < MOCK_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
    
    setShowAnswer(false);
    
    const stateChangeTime = performance.now() - stateChangeStart;
    if (stateChangeTime > 50) {
      console.warn(`Quiz state change time: ${stateChangeTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setCompletedQuestions(new Set());
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
      aria-label="Truth Literacy Learning Card"
      aria-live="polite"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Truth Literacy
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Certification in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Build your civic knowledge foundation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Progress: {completedQuestions.size} / {MOCK_QUIZ_QUESTIONS.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetQuiz}
              className="text-slate-400 hover:text-slate-200 h-6 px-2"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-slate-700"
          />
        </div>

        {/* Question Card */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                getCategoryColor(currentQuestion.category)
              )}
            >
              {getCategoryIcon(currentQuestion.category)}
              <span className="ml-1">{currentQuestion.topic}</span>
            </Badge>
          </div>

          {/* Question/Answer Display */}
          <div 
            className="min-h-[120px] cursor-pointer"
            onClick={handleFlipCard}
            role="button"
            tabIndex={0}
            aria-label={showAnswer ? "Hide answer" : "Show answer"}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFlipCard();
              }
            }}
          >
            {!showAnswer ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 uppercase tracking-wide">
                  Question {currentQuestionIndex + 1}
                </div>
                <p className="text-slate-100 font-medium leading-relaxed">
                  {currentQuestion.question}
                </p>
                <p className="text-xs text-slate-500 italic mt-4">
                  Tap to reveal answer
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-green-400 uppercase tracking-wide">
                  Answer
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {currentQuestion.answer}
                </p>
                <p className="text-xs text-slate-500 italic mt-4">
                  Tap to hide answer
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleFlipCard}
            variant="outline"
            className="flex-1 bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-600/50 min-h-[48px]"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>
          <Button
            onClick={handleNextQuestion}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-[48px]"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Quiz Statistics */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            {completedQuestions.size > 0 && (
              <>You've completed {completedQuestions.size} questions</>
            )}
            {completedQuestions.size === 0 && (
              <>Start learning civic fundamentals</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TruthLiteracyCard;
