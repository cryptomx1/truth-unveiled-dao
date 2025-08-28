import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ThumbsUp, ThumbsDown, Send, Eye, AlertTriangle, CheckCircle2, Clock, User, Hash } from "lucide-react";

interface Contribution {
  id: string;
  authorDID: string;
  content: string;
  mediaURL?: string;
  topic: string;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  zkpHash: string;
  upvotes: number;
  downvotes: number;
  submissionTime: string;
  reviewTime?: string;
  userHasVoted?: "up" | "down" | null;
}

// Generate 50+ stress test contributions for DAO readiness validation
const generateStressContributions = (): Contribution[] => {
  const topics = ["civic-basics", "electoral-systems", "constitutional-law", "policy-law", "public-admin"];
  const statuses: Contribution["status"][] = ["approved", "reviewed", "submitted", "rejected", "draft"];
  const contributions: Contribution[] = [];
  
  // Base contributions with known high downvote rates for pushback testing
  const baseContribs = [
    {
      id: "contrib_001",
      authorDID: "did:civic:learn_001",
      content: "Understanding the Electoral College system requires grasping both historical context and modern implications for democratic representation.",
      topic: "electoral-systems",
      status: "approved" as const,
      zkpHash: "0x8f4a...2e9d",
      upvotes: 12,
      downvotes: 2,
      submissionTime: "2025-07-16T19:15:00Z",
      reviewTime: "2025-07-16T19:45:00Z"
    },
    {
      id: "contrib_002", 
      authorDID: "did:civic:learn_002",
      content: "Local ballot measures often have more direct impact on daily life than federal elections. Citizens should research these thoroughly.",
      mediaURL: "https://civic-resources.org/ballot-guide",
      topic: "civic-basics",
      status: "approved" as const,
      zkpHash: "0x7c3b...9f1a",
      upvotes: 8,
      downvotes: 1,
      submissionTime: "2025-07-16T18:30:00Z",
      reviewTime: "2025-07-16T19:00:00Z"
    },
    {
      id: "contrib_003",
      authorDID: "did:civic:learn_003", 
      content: "Constitutional amendments require supermajority approval for good reason - they should reflect broad consensus.",
      topic: "constitutional-law",
      status: "reviewed" as const,
      zkpHash: "0x5d8e...4c7f",
      upvotes: 3,
      downvotes: 7, // 70% downvote rate - triggers pushback
      submissionTime: "2025-07-16T17:45:00Z",
      reviewTime: "2025-07-16T18:15:00Z"
    },
    // STRESS TEST: High downvote contributions (40%+ for Path B testing)
    {
      id: "contrib_stress_40",
      authorDID: "did:civic:stress_001",
      content: "Stress test: Policy proposal with intentionally controversial stance to trigger 40% downvote threshold for DAO escalation testing.",
      topic: "policy-law",
      status: "reviewed" as const,
      zkpHash: "0x1a2b...9z8x",
      upvotes: 6,
      downvotes: 4, // 40% exactly - stress test boundary
      submissionTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      reviewTime: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: "contrib_stress_45",
      authorDID: "did:civic:stress_002",
      content: "Stress test: Controversial civic education stance designed to test Path B retry mechanisms under high disagreement rates.",
      topic: "civic-basics",
      status: "reviewed" as const,
      zkpHash: "0x2c3d...8y7w",
      upvotes: 11,
      downvotes: 9, // 45% downvote rate - stress test
      submissionTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      reviewTime: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    }
  ];
  
  contributions.push(...baseContribs);
  
  // Generate 50+ additional stress test contributions
  for (let i = 6; i <= 55; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isStressTest = i % 10 === 0; // Every 10th contribution is high-stress
    
    contributions.push({
      id: `contrib_${i.toString().padStart(3, '0')}`,
      authorDID: `did:civic:learn_${i.toString().padStart(3, '0')}`,
      content: `Stress test contribution #${i}: ${isStressTest ? 'High-controversy content designed to trigger pushback mechanisms' : 'Standard civic education content for volume testing'} in ${topic} domain.`,
      topic,
      status,
      zkpHash: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
      upvotes: isStressTest ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 15) + 1,
      downvotes: isStressTest ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 3), // High stress = more downvotes
      submissionTime: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(), // Random within last 24h
      reviewTime: status === "reviewed" || status === "approved" || status === "rejected" ? 
        new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 12).toISOString() : undefined
    });
  }
  
  return contributions;
};

const mockContributions: Contribution[] = generateStressContributions();

const topicOptions = [
  { value: "civic-basics", label: "Civic Basics" },
  { value: "electoral-systems", label: "Electoral Systems" },
  { value: "constitutional-law", label: "Constitutional Law" },
  { value: "policy-law", label: "Policy Law" },
  { value: "public-admin", label: "Public Administration" }
];

export default function KnowledgeContributionCard() {
  const [contributions, setContributions] = useState<Contribution[]>(mockContributions);
  const [newContent, setNewContent] = useState("");
  const [newMediaURL, setNewMediaURL] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [pushbackTriggered, setPushbackTriggered] = useState(false);
  const [zkpValidation, setZkpValidation] = useState<"pending" | "validated" | "failed">("pending");
  const startTimeRef = useRef<number>(0);

  // TTS setup with proper cleanup
  const [ttsSupported, setTtsSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setTtsSupported('speechSynthesis' in window);
    
    // TTS announcement on mount
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Knowledge contribution panel ready");
      utterance.rate = 0.9;
      utterance.volume = 0.7;
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    }

    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Check for pushback conditions on contributions
  useEffect(() => {
    const recentContributions = contributions.filter(contrib => {
      const submissionTime = new Date(contrib.submissionTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - submissionTime.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 24 && contrib.status === "reviewed";
    });

    const pushbackCandidates = recentContributions.filter(contrib => {
      const total = contrib.upvotes + contrib.downvotes;
      const downvoteRate = total > 0 ? contrib.downvotes / total : 0;
      return downvoteRate > 0.25; // >25% downvote rate
    });

    if (pushbackCandidates.length > 0) {
      setPushbackTriggered(true);
      console.warn("⚠️ Pushback triggered: >25% downvote rate detected in recent contributions");
      
      if (ttsSupported) {
        const pushbackUtterance = new SpeechSynthesisUtterance("Path B triggered for contribution review");
        pushbackUtterance.rate = 0.9;
        pushbackUtterance.volume = 0.7;
        speechSynthesis.speak(pushbackUtterance);
      }
    }
  }, [contributions, ttsSupported]);

  const handleSubmitContribution = () => {
    if (!newContent.trim() || !selectedTopic) return;

    setSubmissionStatus("submitting");
    setZkpValidation("pending");
    startTimeRef.current = Date.now();

    // Simulate ZKP validation
    setTimeout(() => {
      setZkpValidation("validated");
      
      // Create new contribution
      const newContribution: Contribution = {
        id: `contrib_${Date.now()}`,
        authorDID: "did:civic:learn_user",
        content: newContent.trim(),
        mediaURL: newMediaURL.trim() || undefined,
        topic: selectedTopic,
        status: "submitted",
        zkpHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        upvotes: 0,
        downvotes: 0,
        submissionTime: new Date().toISOString()
      };

      setContributions(prev => [newContribution, ...prev]);
      setSubmissionStatus("submitted");
      
      // Reset form
      setTimeout(() => {
        setNewContent("");
        setNewMediaURL("");
        setSelectedTopic("");
        setSubmissionStatus("idle");
        setZkpValidation("pending");
      }, 2000);

      // TTS confirmation
      if (ttsSupported) {
        const submitUtterance = new SpeechSynthesisUtterance("Contribution submitted for community review");
        submitUtterance.rate = 0.9;
        submitUtterance.volume = 0.7;
        speechSynthesis.speak(submitUtterance);
      }
    }, 1500);
  };

  const handleVote = (contributionId: string, voteType: "up" | "down") => {
    setContributions(prev => prev.map(contrib => {
      if (contrib.id === contributionId) {
        const hasVoted = contrib.userHasVoted;
        let newUpvotes = contrib.upvotes;
        let newDownvotes = contrib.downvotes;

        // Remove previous vote if exists
        if (hasVoted === "up") newUpvotes--;
        if (hasVoted === "down") newDownvotes--;

        // Add new vote if different from previous
        if (hasVoted !== voteType) {
          if (voteType === "up") newUpvotes++;
          if (voteType === "down") newDownvotes++;
        }

        return {
          ...contrib,
          upvotes: Math.max(0, newUpvotes),
          downvotes: Math.max(0, newDownvotes),
          userHasVoted: hasVoted === voteType ? null : voteType
        };
      }
      return contrib;
    }));

    // TTS feedback
    if (ttsSupported) {
      const voteUtterance = new SpeechSynthesisUtterance(`${voteType === "up" ? "Upvote" : "Downvote"} recorded`);
      voteUtterance.rate = 0.9;
      voteUtterance.volume = 0.7;
      speechSynthesis.speak(voteUtterance);
    }
  };

  const getStatusColor = (status: Contribution["status"]) => {
    switch (status) {
      case "approved": return "text-green-400";
      case "rejected": return "text-red-400";
      case "reviewed": return "text-amber-400";
      case "submitted": return "text-blue-400";
      default: return "text-slate-400";
    }
  };

  const getStatusIcon = (status: Contribution["status"]) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      case "rejected": return <AlertTriangle className="h-3 w-3 text-red-400" />;
      case "reviewed": return <Eye className="h-3 w-3 text-amber-400" />;
      case "submitted": return <Clock className="h-3 w-3 text-blue-400" />;
      default: return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDownvoteRate = (contrib: Contribution) => {
    const total = contrib.upvotes + contrib.downvotes;
    return total > 0 ? Math.round((contrib.downvotes / total) * 100) : 0;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-blue-400 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Knowledge Contribution
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span>ZKP Status:</span>
          <Badge 
            variant={zkpValidation === "validated" ? "default" : zkpValidation === "failed" ? "destructive" : "secondary"}
            className={`text-xs ${
              zkpValidation === "validated" ? "bg-blue-600 hover:bg-blue-700" :
              zkpValidation === "failed" ? "bg-red-600 hover:bg-red-700" :
              "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {zkpValidation === "validated" ? "Validated" : zkpValidation === "failed" ? "Failed" : "Pending"}
          </Badge>
          {pushbackTriggered && (
            <span className="text-amber-400 text-xs animate-pulse">Path B Active</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">Submit New Contribution</label>
          
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select topic category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {topicOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-600">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share your civic knowledge or insights..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            maxLength={500}
            disabled={submissionStatus === "submitting"}
          />

          <Input
            value={newMediaURL}
            onChange={(e) => setNewMediaURL(e.target.value)}
            placeholder="Optional: Add media URL or resource link"
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            disabled={submissionStatus === "submitting"}
          />

          <div className="text-xs text-slate-400 text-right">
            {newContent.length}/500 characters
          </div>
        </div>

        <Button
          onClick={handleSubmitContribution}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!newContent.trim() || !selectedTopic || submissionStatus === "submitting"}
        >
          {submissionStatus === "submitting" ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : submissionStatus === "submitted" ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submitted!
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Contribution
            </>
          )}
        </Button>

        <Separator className="bg-slate-600" />

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Community Contributions
          </h4>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {contributions.map((contrib) => {
              const downvoteRate = getDownvoteRate(contrib);
              const isHighDownvote = downvoteRate > 25;
              
              return (
                <div key={contrib.id} className={`p-3 bg-slate-700 rounded-md space-y-2 ${isHighDownvote ? 'border border-amber-600 bg-amber-900/10' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(contrib.status)}
                      <span className={`text-xs font-medium ${getStatusColor(contrib.status)}`}>
                        {contrib.status.charAt(0).toUpperCase() + contrib.status.slice(1)}
                      </span>
                      {isHighDownvote && (
                        <AlertTriangle className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {topicOptions.find(t => t.value === contrib.topic)?.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">
                    {contrib.content}
                  </p>

                  {contrib.mediaURL && (
                    <div className="text-xs text-blue-400 truncate">
                      🔗 {contrib.mediaURL}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <code className="font-mono">{contrib.authorDID.slice(0, 20)}...</code>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      <code className="font-mono">{contrib.zkpHash}</code>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVote(contrib.id, "up")}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          contrib.userHasVoted === "up" 
                            ? "bg-green-600 text-white" 
                            : "bg-slate-600 text-slate-300 hover:bg-green-600 hover:text-white"
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span className="text-xs">{contrib.upvotes}</span>
                      </button>
                      
                      <button
                        onClick={() => handleVote(contrib.id, "down")}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          contrib.userHasVoted === "down" 
                            ? "bg-red-600 text-white" 
                            : "bg-slate-600 text-slate-300 hover:bg-red-600 hover:text-white"
                        }`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                        <span className="text-xs">{contrib.downvotes}</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-400">
                      {formatTimestamp(contrib.submissionTime)}
                    </div>
                  </div>

                  {isHighDownvote && (
                    <div className="text-xs text-amber-400 bg-amber-900/20 p-2 rounded">
                      ⚠️ High downvote rate ({downvoteRate}%) - Path B review triggered
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="bg-slate-600" />
        
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Contribution Engine:</span>
            <code className="font-mono">KC-ZKP-v1.2</code>
          </div>
          <div className="flex justify-between">
            <span>Cross-Deck Sync:</span>
            <span className="text-blue-400">Deck #12 DID</span>
          </div>
          <div className="flex justify-between">
            <span>Total Contributions:</span>
            <span className="text-green-400">{contributions.length}</span>
          </div>
          {pushbackTriggered && (
            <div className="flex justify-between">
              <span>Path B Triggers:</span>
              <span className="text-amber-400">Active</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}