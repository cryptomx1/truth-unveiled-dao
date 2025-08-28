import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Clock, Hash, Target, Sparkles, Link, Shield, Eye } from "lucide-react";

interface OutcomeRecord {
  id: string;
  evaluationId: string;
  allocationId: string;
  metricName: string;
  expectedOutcome: number;
  verifiedOutcome: number;
  confidenceScore: number;
  status: "verified" | "partial" | "unverified" | "disputed" | "pending";
  zkpChain: string;
  verifiedBy: string;
  timestamp: string;
  realWorldData: string;
}

interface VerificationTask {
  id: string;
  outcomeId: string;
  taskType: "field_verification" | "data_audit" | "stakeholder_confirm" | "cross_reference";
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedTo: string;
  completedAt?: string;
}

interface ChainProof {
  allocationHash: string;
  evaluationHash: string;
  outcomeHash: string;
  verificationHash: string;
  chainValid: boolean;
  linkStrength: number;
}

const mockOutcomes: OutcomeRecord[] = [
  {
    id: "outcome_001",
    evaluationId: "eval_001",
    allocationId: "energy_allocation",
    metricName: "Carbon Emissions Reduction",
    expectedOutcome: 18.2,
    verifiedOutcome: 17.8,
    confidenceScore: 87.3,
    status: "verified",
    zkpChain: "0x8c4d...3f7a→0x2e9d...8b1c→0x7f3a...9d2e",
    verifiedBy: "did:civic:field_verifier_001",
    timestamp: "2025-07-16T20:30:00Z",
    realWorldData: "EPA monitoring station data, Q3 2025"
  },
  {
    id: "outcome_002",
    evaluationId: "eval_002",
    allocationId: "housing_allocation",
    metricName: "Affordable Housing Units",
    expectedOutcome: 142,
    verifiedOutcome: 138,
    confidenceScore: 74.1,
    status: "partial",
    zkpChain: "0x5f2a...9b8c→0x1d4e...7c3f→0x9b2a...5e1d",
    verifiedBy: "did:civic:housing_inspector_002",
    timestamp: "2025-07-16T19:45:00Z",
    realWorldData: "Municipal housing registry, July 2025"
  },
  {
    id: "outcome_003",
    evaluationId: "eval_003",
    allocationId: "health_allocation",
    metricName: "Healthcare Coverage",
    expectedOutcome: 91.3,
    verifiedOutcome: 85.7,
    confidenceScore: 43.2,
    status: "disputed",
    zkpChain: "0x2e9d...4a1f→0x8c3b...1f9e→0x4a7d...6c2b",
    verifiedBy: "did:civic:health_auditor_003",
    timestamp: "2025-07-16T18:15:00Z",
    realWorldData: "State health department records"
  },
  {
    id: "outcome_004",
    evaluationId: "eval_004",
    allocationId: "food_allocation",
    metricName: "Food Access Index",
    expectedOutcome: 78.5,
    verifiedOutcome: 0,
    confidenceScore: 0,
    status: "pending",
    zkpChain: "0x6e1f...8d4a→PENDING→PENDING",
    verifiedBy: "",
    timestamp: "2025-07-16T20:45:00Z",
    realWorldData: "Awaiting USDA community survey data"
  }
];

const mockTasks: VerificationTask[] = [
  {
    id: "task_001",
    outcomeId: "outcome_001",
    taskType: "field_verification",
    description: "On-site carbon monitoring validation",
    status: "completed",
    assignedTo: "did:civic:field_team_alpha",
    completedAt: "2025-07-16T20:25:00Z"
  },
  {
    id: "task_002",
    outcomeId: "outcome_002",
    taskType: "data_audit",
    description: "Housing registry cross-reference",
    status: "completed",
    assignedTo: "did:civic:audit_team_beta",
    completedAt: "2025-07-16T19:40:00Z"
  },
  {
    id: "task_003",
    outcomeId: "outcome_003",
    taskType: "stakeholder_confirm",
    description: "Healthcare provider confirmation",
    status: "failed",
    assignedTo: "did:civic:stakeholder_gamma",
    completedAt: "2025-07-16T18:10:00Z"
  },
  {
    id: "task_004",
    outcomeId: "outcome_004",
    taskType: "cross_reference",
    description: "USDA data integration pending",
    status: "pending",
    assignedTo: "did:civic:data_team_delta"
  }
];

export default function OutcomeVerificationCard() {
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>(mockOutcomes);
  const [tasks, setTasks] = useState<VerificationTask[]>(mockTasks);
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [failureRate, setFailureRate] = useState<number>(0);
  const [chainProof, setChainProof] = useState<ChainProof | null>(null);
  const [lastSpeech, setLastSpeech] = useState<number>(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // TTS function with proper cancellation
  const speak = (text: string) => {
    const now = Date.now();
    if (now - lastSpeech < 2000) return; // Throttle TTS calls
    
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setLastSpeech(now);
    }
  };

  // Component mount TTS
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Outcome verification interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Failure rate monitoring (≥25% threshold)
  useEffect(() => {
    const failureTimer = setInterval(() => {
      const totalOutcomes = outcomes.length;
      const failedOutcomes = outcomes.filter(o => 
        o.status === "unverified" || o.status === "disputed" || o.confidenceScore < 50
      ).length;
      
      const currentFailureRate = totalOutcomes > 0 ? (failedOutcomes / totalOutcomes) * 100 : 0;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 40; // ±20% variance
      const testFailureRate = Math.max(0, Math.min(100, currentFailureRate + variance));
      setFailureRate(testFailureRate);
      
      if (testFailureRate >= 25) {
        setShowPathB(true);
        console.log(`⚠️ Outcome verification failure: ${testFailureRate.toFixed(1)}% (exceeds 25% threshold)`);
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 12000);

    return () => clearInterval(failureTimer);
  }, [outcomes]);

  // Generate chain proof
  const generateChainProof = (outcome: OutcomeRecord): ChainProof => {
    const hashes = outcome.zkpChain.split('→');
    const linkStrength = Math.max(0, Math.min(100, outcome.confidenceScore + (Math.random() - 0.5) * 20));
    
    return {
      allocationHash: hashes[0] || "PENDING",
      evaluationHash: hashes[1] || "PENDING",
      outcomeHash: hashes[2] || "PENDING",
      verificationHash: outcome.status === "verified" ? `0x${Math.random().toString(16).substr(2, 8)}...${Date.now().toString(16).substr(-4)}` : "PENDING",
      chainValid: outcome.status === "verified" && linkStrength > 70,
      linkStrength
    };
  };

  // Handle outcome verification
  const handleVerifyOutcome = async () => {
    if (!selectedOutcome) return;

    setIsVerifying(true);

    // Simulate verification processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const outcome = outcomes.find(o => o.id === selectedOutcome);
    if (!outcome) {
      setIsVerifying(false);
      return;
    }

    // Generate verification results
    const verificationSuccess = Math.random() > 0.3; // 70% success rate
    const newConfidenceScore = verificationSuccess 
      ? Math.max(70, Math.min(100, outcome.confidenceScore + (Math.random() * 20)))
      : Math.max(0, Math.min(50, outcome.confidenceScore - (Math.random() * 30)));

    const newStatus: OutcomeRecord["status"] = 
      newConfidenceScore >= 80 ? "verified" :
      newConfidenceScore >= 50 ? "partial" :
      newConfidenceScore >= 25 ? "unverified" : "disputed";

    const updatedOutcome: OutcomeRecord = {
      ...outcome,
      verifiedOutcome: verificationSuccess 
        ? outcome.expectedOutcome + (Math.random() - 0.5) * (outcome.expectedOutcome * 0.1)
        : outcome.expectedOutcome + (Math.random() - 0.5) * (outcome.expectedOutcome * 0.3),
      confidenceScore: newConfidenceScore,
      status: newStatus,
      verifiedBy: "did:civic:current_verifier",
      timestamp: new Date().toISOString(),
      zkpChain: outcome.zkpChain.includes("PENDING") 
        ? outcome.zkpChain.replace("PENDING", `0x${Math.random().toString(16).substr(2, 8)}...${Date.now().toString(16).substr(-4)}`)
        : outcome.zkpChain
    };

    setOutcomes(prev => prev.map(o => o.id === selectedOutcome ? updatedOutcome : o));

    // Update corresponding task
    setTasks(prev => prev.map(task => 
      task.outcomeId === selectedOutcome 
        ? { ...task, status: verificationSuccess ? "completed" : "failed", completedAt: new Date().toISOString() }
        : task
    ));

    // Generate chain proof
    setChainProof(generateChainProof(updatedOutcome));

    const statusMessage = newStatus === "verified" ? "Outcome verified" :
                         newStatus === "partial" ? "Outcome partially verified" :
                         newStatus === "disputed" ? "Outcome disputed" : "Outcome unverified";
    
    speak(statusMessage);
    console.log(`✅ Outcome verification completed: ${updatedOutcome.id}`);
    console.log(`📊 Confidence: ${newConfidenceScore.toFixed(1)}% | Status: ${newStatus}`);

    setIsVerifying(false);
    setSelectedOutcome("");
  };

  // Get status color
  const getStatusColor = (status: OutcomeRecord["status"]): string => {
    switch (status) {
      case "verified":
        return "bg-green-500";
      case "partial":
        return "bg-yellow-500";
      case "unverified":
        return "bg-red-500";
      case "disputed":
        return "bg-red-600";
      case "pending":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: OutcomeRecord["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      case "partial":
        return <Eye className="h-3 w-3 text-yellow-400" />;
      case "unverified":
      case "disputed":
        return <AlertTriangle className="h-3 w-3 text-red-400" />;
      case "pending":
        return <Clock className="h-3 w-3 text-slate-400" />;
      default:
        return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  // Get confidence badge color
  const getConfidenceBadgeColor = (score: number): string => {
    if (score >= 80) return "bg-green-600";
    if (score >= 50) return "bg-yellow-600";
    if (score >= 25) return "bg-orange-600";
    return "bg-red-600";
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get variance percentage
  const getVariancePercentage = (expected: number, verified: number): number => {
    if (expected === 0) return 0;
    return ((Math.abs(expected - verified) / expected) * 100);
  };

  const canVerify = selectedOutcome && !isVerifying;
  const selectedOutcomeData = outcomes.find(o => o.id === selectedOutcome);
  const verifiedCount = outcomes.filter(o => o.status === "verified").length;
  const partialCount = outcomes.filter(o => o.status === "partial").length;
  const failedCount = outcomes.filter(o => o.status === "unverified" || o.status === "disputed").length;

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-purple-400" />
          Outcome Verification
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Target className="h-3 w-3" />
          <span>Verified: {verifiedCount}</span>
          <span>•</span>
          <span>Partial: {partialCount}</span>
          <span>•</span>
          <span className={failureRate >= 25 ? "text-red-400" : failureRate >= 15 ? "text-amber-400" : "text-green-400"}>
            Failed: {failedCount} ({failureRate.toFixed(1)}%)
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Outcome Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Select Outcome to Verify</label>
          <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Outcome selector">
              <SelectValue placeholder="Choose outcome for verification..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {outcomes.filter(o => o.status === "pending" || o.status === "partial").map(outcome => (
                <SelectItem key={outcome.id} value={outcome.id} className="text-white hover:bg-slate-600">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(outcome.status)}
                      <span className="text-sm">{outcome.metricName}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Expected: {outcome.expectedOutcome} | Confidence: {outcome.confidenceScore.toFixed(0)}%
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chain Proof Display */}
        {selectedOutcomeData && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">ZKP Chain of Proof</label>
            <div className="p-2 bg-slate-700/50 rounded-md border border-slate-600">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Link className="h-3 w-3 text-blue-400" />
                  <span className="text-slate-300">Allocation → Evaluation → Outcome</span>
                </div>
                <div className="font-mono text-slate-400 break-all">
                  {selectedOutcomeData.zkpChain}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Chain Integrity:</span>
                  <Badge className={`text-xs ${
                    selectedOutcomeData.confidenceScore >= 80 ? "bg-green-600" :
                    selectedOutcomeData.confidenceScore >= 50 ? "bg-yellow-600" : "bg-red-600"
                  } text-white`}>
                    {selectedOutcomeData.confidenceScore.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Action */}
        <div className="space-y-2">
          <Button
            onClick={handleVerifyOutcome}
            disabled={!canVerify}
            className="w-full h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600"
            aria-label="Verify outcome"
          >
            {isVerifying ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Verifying Outcome...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify Outcome
              </>
            )}
          </Button>
          
          {!canVerify && !isVerifying && (
            <div className="text-xs text-amber-400 text-center" role="alert" aria-live="polite">
              Select a pending or partial outcome to verify
            </div>
          )}
        </div>

        <Separator className="bg-slate-600" />

        {/* Verification Results */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Verification Results</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {outcomes.length}
            </Badge>
          </div>

          <ScrollArea className="h-40">
            <div className="space-y-1 pr-2">
              {outcomes.map((outcome) => {
                const variance = getVariancePercentage(outcome.expectedOutcome, outcome.verifiedOutcome);
                const relatedTask = tasks.find(t => t.outcomeId === outcome.id);
                
                return (
                  <div key={outcome.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(outcome.status)}`} />
                        {getStatusIcon(outcome.status)}
                        <span className="text-sm text-white">{outcome.metricName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-xs ${getConfidenceBadgeColor(outcome.confidenceScore)} text-white`}>
                          {outcome.confidenceScore.toFixed(0)}%
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatDate(outcome.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-1 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Expected: {outcome.expectedOutcome}</span>
                        <span>Verified: {outcome.verifiedOutcome || "Pending"}</span>
                      </div>
                      {outcome.verifiedOutcome > 0 && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Variance: {variance.toFixed(1)}%</span>
                          <span>{outcome.status.charAt(0).toUpperCase() + outcome.status.slice(1)}</span>
                        </div>
                      )}
                    </div>

                    {relatedTask && (
                      <div className="mt-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <span>Task: {relatedTask.taskType.replace('_', ' ')}</span>
                          <Badge variant="secondary" className={`text-xs ${
                            relatedTask.status === "completed" ? "bg-green-700" :
                            relatedTask.status === "failed" ? "bg-red-700" :
                            relatedTask.status === "in_progress" ? "bg-blue-700" : "bg-slate-700"
                          } text-white`}>
                            {relatedTask.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Pushback Alert */}
        {showPathB && (
          <div className="p-2 bg-amber-900/50 border border-amber-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-300">
                Path B: Verification failure {failureRate.toFixed(1)}% exceeds 25% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}