import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '../../../translation/useTranslation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, RotateCcw, Lock, Brain, Target, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  category: 'civic_rights' | 'voting_process' | 'democracy_principles';
}

interface CivicQuizCardProps {
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
    question: 'What is the most important principle of democratic governance?',
    options: [
      { id: 'a1', text: 'Majority rule without limits', isCorrect: false },
      { id: 'a2', text: 'Informed citizen participation', isCorrect: true },
      { id: 'a3', text: 'Government efficiency', isCorrect: false },
      { id: 'a4', text: 'Economic growth priority', isCorrect: false }
    ],
    explanation: 'Democracy thrives when citizens are informed and actively participate in decision-making processes.',
    category: 'democracy_principles'
  },
  {
    id: 'q2',
    question: 'Which right is fundamental to civic engagement?',
    options: [
      { id: 'b1', text: 'Right to privacy only', isCorrect: false },
      { id: 'b2', text: 'Right to free expression', isCorrect: true },
      { id: 'b3', text: 'Right to employment', isCorrect: false },
      { id: 'b4', text: 'Right to entertainment', isCorrect: false }
    ],
    explanation: 'Free expression allows citizens to voice opinions, debate issues, and hold leaders accountable.',
    category: 'civic_rights'
  },
  {
    id: 'q3',
    question: 'What makes a voting system trustworthy?',
    options: [
      { id: 'c1', text: 'Speed of counting', isCorrect: false },
      { id: 'c2', text: 'Transparency and verifiability', isCorrect: true },
      { id: 'c3', text: 'Government control', isCorrect: false },
      { id: 'c4', text: 'Corporate funding', isCorrect: false }
    ],
    explanation: 'Trust in voting requires transparent processes where results can be independently verified.',
    category: 'voting_process'
  }
];

const getCategoryIcon = (category: QuizQuestion['category']) => {
  switch (category) {
    case 'civic_rights':
      return <Users className="w-4 h-4" />;
    case 'voting_process':
      return <Target className="w-4 h-4" />;
    case 'democracy_principles':
      return <Brain className="w-4 h-4" />;
    default:
      return <Brain className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: QuizQuestion['category']) => {
  switch (category) {
    case 'civic_rights':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'voting_process':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'democracy_principles':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const CivicQuizCard: React.FC<CivicQuizCardProps> = ({ className }) => {
  const { t } = useTranslation();
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = (answeredQuestions.size / shuffledQuestions.length) * 100;
  const isAnswered = currentQuestion && answeredQuestions.has(currentQuestion.id);
  const isCorrect = currentQuestion && correctAnswers.has(currentQuestion.id);

  // Initialize shuffled questions
  useEffect(() => {
    setShuffledQuestions(shuffleArray(MOCK_QUIZ_QUESTIONS));
  }, []);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`CivicQuizCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`CivicQuizCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play motivational message on mount with translation
          const utterance = new SpeechSynthesisUtterance(t('tts.quiz.ready'));
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

  const playTTSFeedback = (isCorrectAnswer: boolean) => {
    if (ttsStatus.isReady) {
      const message = isCorrectAnswer ? "Correct." : "Try again.";
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      setTtsStatus(prev => ({ ...prev, isPlaying: true }));
      speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: false }));
      };
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered || !currentQuestion) return;

    const selectionStart = performance.now();
    
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    setSelectedAnswer(optionId);
    setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
    
    if (selectedOption.isCorrect) {
      setCorrectAnswers(prev => new Set([...prev, currentQuestion.id]));
    }
    
    setShowResult(true);
    playTTSFeedback(selectedOption.isCorrect);

    const selectionTime = performance.now() - selectionStart;
    if (selectionTime > 50) {
      console.warn(`Selection response time: ${selectionTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
    
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleResetQuiz = () => {
    setShuffledQuestions(shuffleArray(MOCK_QUIZ_QUESTIONS));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnsweredQuestions(new Set());
    setCorrectAnswers(new Set());
    setShowResult(false);
  };

  if (!currentQuestion) {
    return (
      <Card className={cn('w-full max-w-sm mx-auto bg-slate-800 border-slate-700/50', className)}>
        <CardContent className="p-4">
          <div className="text-center text-slate-400">Loading quiz...</div>
        </CardContent>
      </Card>
    );
  }

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
      aria-label="Civic Knowledge Quiz"
      aria-live="polite"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Civic Quiz
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
                <p>Certification available in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Test your civic knowledge and democratic understanding
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Progress: {answeredQuestions.size} / {shuffledQuestions.length}
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
            className="h-2 w-full bg-slate-700"
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
              <span className="ml-1">
                {currentQuestion.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </Badge>
          </div>

          {/* Question */}
          <div className="mb-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">
              Question {currentQuestionIndex + 1}
            </div>
            <p className="text-slate-100 font-medium leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrectOption = option.isCorrect;
              const showCorrectState = showResult && isCorrectOption;
              const showIncorrectState = showResult && isSelected && !isCorrectOption;

              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={cn(
                    'w-full min-h-[48px] p-3 text-left justify-start',
                    'bg-slate-700/50 border-slate-600 text-slate-100 hover:bg-slate-600/70 hover:text-slate-50',
                    isSelected && !showResult && 'bg-slate-600/80 border-slate-500 text-slate-50',
                    showCorrectState && 'bg-green-600/30 border-green-500 text-green-300',
                    showIncorrectState && 'bg-red-600/30 border-red-500 text-red-300',
                    isAnswered && 'cursor-default'
                  )}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={isAnswered}
                  role="radio"
                  aria-checked={isSelected}
                  aria-describedby={showResult ? `explanation-${currentQuestion.id}` : undefined}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">
                      {showCorrectState && <CheckCircle className="w-4 h-4" />}
                      {showIncorrectState && <XCircle className="w-4 h-4" />}
                      {!showResult && (
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2',
                          isSelected ? 'border-slate-300 bg-slate-300' : 'border-slate-500'
                        )} />
                      )}
                    </div>
                    <span className="flex-1">{option.text}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div 
              id={`explanation-${currentQuestion.id}`}
              className="mt-4 p-3 bg-slate-600/30 rounded border border-slate-600/50"
              role="status"
              aria-live="polite"
            >
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Explanation
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Next Question Button */}
        {showResult && (
          <Button
            onClick={handleNextQuestion}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[48px]"
          >
            {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Start Over'}
          </Button>
        )}

        {/* Quiz Statistics */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            {correctAnswers.size > 0 && (
              <>Score: {correctAnswers.size} / {answeredQuestions.size} correct</>
            )}
            {correctAnswers.size === 0 && answeredQuestions.size === 0 && (
              <>Select your answer to continue</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CivicQuizCard;
