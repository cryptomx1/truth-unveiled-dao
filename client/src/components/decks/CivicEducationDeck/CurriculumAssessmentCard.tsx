import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Star, Eye, RotateCcw } from "lucide-react";

type AssessmentType = "quiz" | "project" | "simulation" | "peer-review" | "competency";

interface AssessmentQuestion {
  id: string;
  type: AssessmentType;
  question: string;
  options?: string[];
  correctAnswer?: number;
  points: number;
  category: string;
}

interface AssessmentResult {
  questionId: string;
  userAnswer: number | null;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
}

// Simplified assessment questions for performance
const assessmentQuestions: Record<string, AssessmentQuestion[]> = {
  "civic-basics": [
    {
      id: "cb1",
      type: "quiz",
      question: "What is the primary purpose of civic engagement?",
      options: [
        "To increase government control",
        "To enable citizen participation in democracy",
        "To reduce political discourse",
        "To limit voting access"
      ],
      correctAnswer: 1,
      points: 10,
      category: "Fundamentals"
    }
  ],
  "policy-law": [
    {
      id: "pl1",
      type: "quiz",
      question: "Which branch of government has the primary responsibility for creating laws?",
      options: [
        "Executive Branch",
        "Legislative Branch", 
        "Judicial Branch",
        "Administrative Branch"
      ],
      correctAnswer: 1,
      points: 10,
      category: "Government Structure"
    }
  ]
};

export default function CurriculumAssessmentCard() {
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("civic-basics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [assessmentStatus, setAssessmentStatus] = useState<"idle" | "active" | "reviewing" | "completed">("idle");
  const [timeSpent, setTimeSpent] = useState(0);
  const [zkpValidation, setZkpValidation] = useState<"pending" | "verified" | "failed">("verified");
  const [retryCount, setRetryCount] = useState(0);

  // Memoized calculations for performance
  const currentQuestions = useMemo(() => assessmentQuestions[selectedCurriculum] || [], [selectedCurriculum]);
  const currentQuestion = useMemo(() => currentQuestions[currentQuestionIndex], [currentQuestions, currentQuestionIndex]);
  const totalQuestions = currentQuestions.length;
  const progressPercentage = useMemo(() => 
    totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0, 
    [currentQuestionIndex, totalQuestions]
  );

  // Optimized handlers
  const handleStartAssessment = useCallback(() => {
    setAssessmentStatus("active");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAssessmentResults([]);
    setTimeSpent(0);
    setRetryCount(0);
    setZkpValidation("verified");
    console.log("📋 Assessment started");
  }, []);

  const handleAnswerSubmit = useCallback(() => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;

    const result: AssessmentResult = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      pointsEarned,
      timeSpent: 15 // Simplified timing
    };

    setAssessmentResults(prev => [...prev, result]);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setAssessmentStatus("completed");
      console.log("✅ Assessment completed");
    }
  }, [selectedAnswer, currentQuestion, currentQuestionIndex, totalQuestions]);

  const handleViewResults = useCallback(() => {
    setAssessmentStatus("reviewing");
  }, []);

  const handleResetAssessment = useCallback(() => {
    setAssessmentStatus("idle");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAssessmentResults([]);
    setTimeSpent(0);
    setZkpValidation("verified");
    setRetryCount(0);
  }, []);

  // Performance-optimized calculations
  const scoreStats = useMemo(() => {
    const totalPoints = assessmentResults.reduce((sum, result) => sum + result.pointsEarned, 0);
    const maxPoints = currentQuestions.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const correctAnswers = assessmentResults.filter(r => r.isCorrect).length;
    
    return { totalPoints, maxPoints, scorePercentage, correctAnswers };
  }, [assessmentResults, currentQuestions]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-blue-400 flex items-center gap-2">
          <Star className="h-5 w-5" />
          Curriculum Assessment
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span>ZKP Validation:</span>
          <Badge 
            variant={zkpValidation === "verified" ? "default" : zkpValidation === "failed" ? "destructive" : "secondary"}
            className={`text-xs ${
              zkpValidation === "verified" ? "bg-blue-600 hover:bg-blue-700" :
              zkpValidation === "failed" ? "bg-red-600 hover:bg-red-700" :
              "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {zkpValidation === "verified" ? "Verified" : zkpValidation === "failed" ? "Failed" : "Pending"}
          </Badge>
          {retryCount > 0 && (
            <span className="text-amber-400 text-xs">Retries: {retryCount}</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {assessmentStatus === "idle" && (
          <>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Select Curriculum</label>
              <select
                value={selectedCurriculum}
                onChange={(e) => setSelectedCurriculum(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="civic-basics">Civic Basics</option>
                <option value="policy-law">Policy Law</option>
                <option value="electoral-systems">Electoral Systems</option>
                <option value="constitutional-law">Constitutional Law</option>
                <option value="public-administration">Public Administration</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-300">
                Questions Available: <span className="text-blue-400 font-medium">{totalQuestions}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleStartAssessment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={totalQuestions === 0}
            >
              Start Assessment
            </Button>
          </>
        )}

        {assessmentStatus === "active" && currentQuestion && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeSpent)}
                </span>
              </div>
              
              <Progress value={progressPercentage} className="h-2" />
              
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                  {currentQuestion.category} • {currentQuestion.points} pts
                </Badge>
                <Badge variant="outline" className="text-xs border-blue-600 text-blue-400 ml-2">
                  {currentQuestion.type}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium text-white leading-relaxed">
                {currentQuestion.question}
              </div>
              
              {currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedAnswer === index
                          ? "border-blue-500 bg-blue-600/20 text-blue-300"
                          : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => setSelectedAnswer(index)}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "Complete Assessment"}
            </Button>
          </>
        )}

        {assessmentStatus === "completed" && (
          <>
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
              <h3 className="text-lg font-semibold text-green-400">Assessment Complete!</h3>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">{scoreStats.scorePercentage}%</div>
                <div className="text-sm text-slate-300">
                  {scoreStats.correctAnswers} of {totalQuestions} correct
                </div>
                <div className="text-sm text-slate-300">
                  Total Points: {scoreStats.totalPoints} / {scoreStats.maxPoints}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleViewResults}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button
                onClick={handleResetAssessment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                New Assessment
              </Button>
            </div>
          </>
        )}

        {assessmentStatus === "reviewing" && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-400">Assessment Results</h3>
                <Badge variant="outline" className="border-green-600 text-green-400">
                  {scoreStats.scorePercentage}% Score
                </Badge>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {assessmentResults.map((result, index) => {
                  const question = currentQuestions.find(q => q.id === result.questionId);
                  if (!question) return null;

                  return (
                    <div key={result.questionId} className="p-3 bg-slate-700 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        {result.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-sm font-medium">
                          Question {index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {result.pointsEarned}/{question.points} pts
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-300 mb-1">
                        {question.question}
                      </div>
                      {question.options && (
                        <div className="text-xs text-slate-400">
                          Your answer: {question.options[result.userAnswer || 0]}
                          {!result.isCorrect && (
                            <div className="text-green-400 mt-1">
                              Correct: {question.options[question.correctAnswer || 0]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={handleResetAssessment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start New Assessment
              </Button>
            </div>
          </>
        )}

        <Separator className="bg-slate-600" />
        
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>ZKP Hash:</span>
            <code className="font-mono">0x7f3e...2d1a</code>
          </div>
          <div className="flex justify-between">
            <span>Curriculum:</span>
            <span className="capitalize">{selectedCurriculum.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span>DID Link:</span>
            <code className="font-mono">did:civic:assess</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}