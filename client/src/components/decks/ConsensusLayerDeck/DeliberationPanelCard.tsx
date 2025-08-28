import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Eye,
  User,
  Shield,
  Scale,
  Clock,
  Hash,
} from "lucide-react";

type Role = "Citizen" | "Verifier" | "Mediator";
type FeedbackStatus = "pending" | "logged" | "verified";

interface DeliberationFeedback {
  id: string;
  role: Role;
  content: string;
  score: number;
  timestamp: Date;
  status: FeedbackStatus;
  zkpHash?: string;
  weight: number;
}

interface DeliberationSession {
  topicId: string;
  topicTitle: string;
  participantCount: number;
  feedbackEntries: DeliberationFeedback[];
  averageScore: number;
  weightedVariance: number;
  sessionStatus: "active" | "completed" | "disputed";
  lastUpdated: Date;
}

interface DeliberationPanelCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Role weights for deliberation scoring
const ROLE_WEIGHTS: Record<Role, number> = {
  Citizen: 1.0,
  Verifier: 1.5,
  Mediator: 2.0,
};

// ZKP hashes from Deck #6 and Deck #7 for sync validation
const ZKP_SYNC_HASHES = [
  "zkp_dlib_4c8a2e9f7b3d1a6e",
  "zkp_dlib_7f1e3b9c4a8d2e5f",
  "zkp_dlib_2a5c8f9e3b7d4a1c",
  "zkp_dlib_9e4b7c2f8a5d3e1b",
  "zkp_dlib_6d3a9f7e2c8b4e1a",
];

// Mock deliberation session data
const MOCK_DELIBERATION_SESSION: DeliberationSession = {
  topicId: "topic_civic_budget_001",
  topicTitle: "Community Budget Allocation for Public Infrastructure",
  participantCount: 8,
  feedbackEntries: [
    {
      id: "feedback_001",
      role: "Citizen",
      content:
        "I believe prioritizing road maintenance should come first for safety reasons.",
      score: 78,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: "logged",
      zkpHash: ZKP_SYNC_HASHES[0],
      weight: ROLE_WEIGHTS["Citizen"],
    },
    {
      id: "feedback_002",
      role: "Verifier",
      content:
        "The budget allocation shows clear priorities but needs environmental impact assessment.",
      score: 85,
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      status: "verified",
      zkpHash: ZKP_SYNC_HASHES[1],
      weight: ROLE_WEIGHTS["Verifier"],
    },
    {
      id: "feedback_003",
      role: "Mediator",
      content:
        "Both infrastructure and environmental concerns are valid. Recommend balanced approach.",
      score: 92,
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      status: "logged",
      zkpHash: ZKP_SYNC_HASHES[2],
      weight: ROLE_WEIGHTS["Mediator"],
    },
  ],
  averageScore: 85.2,
  weightedVariance: 8.7,
  sessionStatus: "active",
  lastUpdated: new Date(),
};

const getRoleIcon = (role: Role) => {
  switch (role) {
    case "Citizen":
      return <User className="w-3 h-3 text-blue-400" />;
    case "Verifier":
      return <Shield className="w-3 h-3 text-green-400" />;
    case "Mediator":
      return <Scale className="w-3 h-3 text-purple-400" />;
  }
};

const getRoleColor = (role: Role): string => {
  switch (role) {
    case "Citizen":
      return "text-blue-400";
    case "Verifier":
      return "text-green-400";
    case "Mediator":
      return "text-purple-400";
  }
};

const getStatusColor = (status: FeedbackStatus): string => {
  switch (status) {
    case "pending":
      return "text-yellow-400";
    case "logged":
      return "text-blue-400";
    case "verified":
      return "text-green-400";
  }
};

const getStatusIcon = (status: FeedbackStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="w-3 h-3 text-yellow-400" />;
    case "logged":
      return <MessageCircle className="w-3 h-3 text-blue-400" />;
    case "verified":
      return <CheckCircle className="w-3 h-3 text-green-400" />;
  }
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
};

const calculateWeightedVariance = (
  feedbackEntries: DeliberationFeedback[],
): number => {
  if (feedbackEntries.length === 0) return 0;

  const weightedScores = feedbackEntries.map(
    (entry) => entry.score * entry.weight,
  );
  const totalWeight = feedbackEntries.reduce(
    (sum, entry) => sum + entry.weight,
    0,
  );
  const weightedMean =
    weightedScores.reduce((sum, score) => sum + score, 0) / totalWeight;

  const variance =
    feedbackEntries.reduce((sum, entry) => {
      const diff = entry.score - weightedMean;
      return sum + diff * diff * entry.weight;
    }, 0) / totalWeight;

  return Math.sqrt(variance);
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
};

export const DeliberationPanelCard: React.FC<DeliberationPanelCardProps> = ({
  className,
}) => {
  const [session, setSession] = useState<DeliberationSession>(
    MOCK_DELIBERATION_SESSION,
  );
  const [newFeedback, setNewFeedback] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("Citizen");
  const [isLogging, setIsLogging] = useState(false);
  const [isPushbackActive, setIsPushbackActive] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({
    isReady: false,
    isPlaying: false,
  });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(
        `DeliberationPanelCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`,
      );
    } else {
      console.log(
        `DeliberationPanelCard render time: ${renderTime.toFixed(2)}ms ✅`,
      );
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ("speechSynthesis" in window) {
          setTtsStatus((prev) => ({ ...prev, isReady: true }));

          // Auto-play deliberation panel ready message on mount
          const utterance = new SpeechSynthesisUtterance(
            "Deliberation panel ready.",
          );
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;

          setTtsStatus((prev) => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);

          utterance.onend = () => {
            setTtsStatus((prev) => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error("TTS initialization failed:", error);
        setTtsStatus((prev) => ({ ...prev, error: "TTS not available" }));
      }
    };

    initializeTTS();
  }, []);

  // Monitor weighted variance for pushback trigger
  useEffect(() => {
    const variance = calculateWeightedVariance(session.feedbackEntries);
    if (variance > 15 && !isPushbackActive) {
      setIsPushbackActive(true);
      console.warn(
        `Weighted variance: ${variance.toFixed(1)}% (triggers pushback - Path B: Normalize weights)`,
      );
    }
  }, [session.feedbackEntries, isPushbackActive]);

  const playFeedbackTTS = (score: number) => {
    if (!ttsStatus.isReady) return;

    const message = `Feedback logged with score ${score}.`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    setTtsStatus((prev) => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setTtsStatus((prev) => ({ ...prev, isPlaying: false }));
    };
  };

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) return;

    const responseStart = performance.now();
    setIsLogging(true);

    // Simulate feedback processing
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
      const newEntry: DeliberationFeedback = {
        id: `feedback_${Date.now()}`,
        role: selectedRole,
        content: newFeedback,
        score,
        timestamp: new Date(),
        status: "logged",
        zkpHash:
          ZKP_SYNC_HASHES[Math.floor(Math.random() * ZKP_SYNC_HASHES.length)],
        weight: ROLE_WEIGHTS[selectedRole],
      };

      setSession((prev) => {
        const updatedEntries = [...prev.feedbackEntries, newEntry];
        const newAverageScore =
          updatedEntries.reduce((sum, entry) => sum + entry.score, 0) /
          updatedEntries.length;
        const newWeightedVariance = calculateWeightedVariance(updatedEntries);

        return {
          ...prev,
          feedbackEntries: updatedEntries,
          averageScore: newAverageScore,
          weightedVariance: newWeightedVariance,
          lastUpdated: new Date(),
        };
      });

      setNewFeedback("");
      setIsLogging(false);

      const responseTime = performance.now() - responseStart;
      if (responseTime > 100) {
        console.warn(
          `Feedback response time: ${responseTime.toFixed(2)}ms (exceeds 100ms target)`,
        );
      }

      playFeedbackTTS(score);
    }, 1500);
  };

  const getSessionStatusRing = (): string => {
    if (isPushbackActive) {
      return "ring-2 ring-red-500/50 animate-pulse";
    }

    switch (session.sessionStatus) {
      case "active":
        return "ring-2 ring-blue-500/50 animate-pulse";
      case "completed":
        return "ring-2 ring-green-500/50";
      case "disputed":
        return "ring-2 ring-orange-500/50 animate-pulse";
      default:
        return "";
    }
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        "w-full max-w-sm mx-auto",
        "bg-slate-900 border-slate-700/50",
        "dao-card-gradient",
        getSessionStatusRing(),
        className,
      )}
      role="region"
      aria-label="Deliberation Panel"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Deliberation Panel
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-400 border-green-500/30"
          >
            ZKP Bound
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Role-weighted civic deliberation interface
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Topic Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Active Topic
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-300 font-medium">
              {session.topicTitle}
            </div>
            <div className="text-xs text-slate-400">ID: {session.topicId}</div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Participants:</span>
              <span className="text-slate-300">{session.participantCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Status:</span>
              <span
                className={
                  session.sessionStatus === "active"
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {session.sessionStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Scoring Overview */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Scoring Overview
            </span>
            <button
              onClick={() => playFeedbackTTS(session.averageScore)}
              disabled={ttsStatus.isPlaying}
              className="ml-auto text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Play scoring overview"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-green-400">
                {session.averageScore.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Average Score</div>
            </div>
            <div>
              <div
                className={cn(
                  "text-lg font-bold",
                  session.weightedVariance > 15
                    ? "text-red-400"
                    : "text-green-400",
                )}
              >
                {session.weightedVariance.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Weighted Variance</div>
            </div>
          </div>

          <div className="mt-3">
            <Progress
              value={session.averageScore}
              className="h-2"
              aria-label={`Average score: ${session.averageScore.toFixed(1)}`}
            />
          </div>

          {isPushbackActive && (
            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
              ⚠️ Pushback: Variance &gt;15% - Path B: Normalize weights
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Your Role
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(["Citizen", "Verifier", "Mediator"] as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={cn(
                  "p-2 rounded-lg border text-xs font-medium transition-colors",
                  "min-h-[48px] flex flex-col items-center justify-center gap-1",
                  selectedRole === role
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50",
                )}
                aria-label={`Select ${role} role`}
              >
                {getRoleIcon(role)}
                <span>{role}</span>
                <span className="text-xs opacity-75">
                  ×{ROLE_WEIGHTS[role]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Submit Feedback
          </label>

          <Textarea
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder="Share your perspective on this topic..."
            className={cn(
              "min-h-[80px] bg-slate-800/50 border-slate-700/50",
              "text-slate-200 placeholder-slate-400",
              "focus:border-blue-500/50 focus:ring-blue-500/20",
            )}
            maxLength={280}
            aria-label="Feedback input"
          />

          <div className="flex justify-between text-xs text-slate-400">
            <span>
              Role: {selectedRole} (Weight: ×{ROLE_WEIGHTS[selectedRole]})
            </span>
            <span>{newFeedback.length}/280</span>
          </div>

          <Button
            onClick={handleSubmitFeedback}
            disabled={isLogging || !newFeedback.trim()}
            className={cn(
              "w-full min-h-[48px] font-medium",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "disabled:bg-slate-700/50 disabled:text-slate-500",
            )}
            aria-label="Submit feedback"
          >
            {isLogging ? (
              <>
                <MessageCircle className="w-4 h-4 mr-2 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>

        {/* Feedback History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-200">
              Recent Feedback ({session.feedbackEntries.length})
            </label>
            <Badge
              variant="outline"
              className="bg-purple-500/20 text-purple-400 border-purple-500/30"
            >
              ZKP Bound
            </Badge>
          </div>

          <ScrollArea className="h-48 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="p-3 space-y-3">
              {session.feedbackEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(entry.role)}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          getRoleColor(entry.role),
                        )}
                      >
                        {entry.role}
                      </span>
                      <span className="text-xs text-slate-400">
                        ×{entry.weight}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          getScoreColor(entry.score),
                        )}
                      >
                        {entry.score}
                      </span>
                      {getStatusIcon(entry.status)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 line-clamp-2">
                    {entry.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">
                        {entry.zkpHash?.substring(0, 16)}...
                      </span>
                    </div>
                    <span>{formatTimeAgo(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ZKP Sync Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              ZKP Sync Status
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-400">Bound Logs:</div>
              <div className="text-slate-300">
                {session.feedbackEntries.length}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Sync Decks:</div>
              <div className="text-slate-300">#6, #7</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Role-weighted civic deliberation system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliberationPanelCard;
