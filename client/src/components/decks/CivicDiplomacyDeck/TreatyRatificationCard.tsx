import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, AlertTriangle, X, Users, Hash, Sparkles, Eye, Shield, Vote, FileCheck } from "lucide-react";

interface TreatyForRatification {
  id: string;
  title: string;
  scope: "Local" | "Regional" | "National" | "International";
  originalZkpHash: string;
  responseZkpHash?: string;
  proposerDID: string;
  responderDID?: string;
  status: "awaiting_ratification" | "ratifying" | "ratified" | "vetoed";
  requiredSignatures: number;
  currentSignatures: number;
  lastUpdated: string;
  summary: string;
}

interface DAOSigner {
  id: string;
  did: string;
  name: string;
  role: "Governor" | "Council Member" | "Citizen Delegate";
  hasVoted: boolean;
  vote?: "ratify" | "veto";
  timestamp?: string;
  zkpSignature?: string;
}

interface RatificationProgress {
  treatyId: string;
  totalRequired: number;
  ratifyVotes: number;
  vetoVotes: number;
  quorumMet: boolean;
  outcome?: "ratified" | "vetoed" | "failed";
}

const mockTreaties: TreatyForRatification[] = [
  {
    id: "treaty_001",
    title: "Municipal Water Rights Cooperation Agreement",
    scope: "Regional",
    originalZkpHash: "0x7f4a...8e2d",
    responseZkpHash: "0xa3b9...4c7e",
    proposerDID: "did:civic:city_council_001",
    responderDID: "did:civic:water_authority_002",
    status: "awaiting_ratification",
    requiredSignatures: 3,
    currentSignatures: 1,
    lastUpdated: "2025-07-16T15:30:00Z",
    summary: "Cross-municipal water distribution and emergency backup protocols"
  },
  {
    id: "treaty_002",
    title: "Cross-Border Educational Exchange Protocol",
    scope: "International",
    originalZkpHash: "0x9c3b...5f1a",
    responseZkpHash: "0x2d8f...9a1c",
    proposerDID: "did:civic:education_ministry_001",
    responderDID: "did:civic:education_board_002",
    status: "ratifying",
    requiredSignatures: 5,
    currentSignatures: 3,
    lastUpdated: "2025-07-16T12:45:00Z",
    summary: "Student exchange framework with 2-year pilot modification"
  },
  {
    id: "treaty_003",
    title: "Regional Climate Action Coordination",
    scope: "National",
    originalZkpHash: "0x4d8e...2c7f",
    proposerDID: "did:civic:climate_coalition_003",
    status: "vetoed", // Failed ratification for testing
    requiredSignatures: 4,
    currentSignatures: 4,
    lastUpdated: "2025-07-16T09:15:00Z",
    summary: "Rejected due to resource allocation disagreements"
  }
];

const mockSigners: DAOSigner[] = [
  {
    id: "signer_001",
    did: "did:civic:governor_001",
    name: "Regional Governor",
    role: "Governor",
    hasVoted: true,
    vote: "ratify",
    timestamp: "2025-07-16T15:30:00Z",
    zkpSignature: "0x8f1b...6d2a"
  },
  {
    id: "signer_002",
    did: "did:civic:council_002",
    name: "Council Representative",
    role: "Council Member",
    hasVoted: true,
    vote: "ratify",
    timestamp: "2025-07-16T14:45:00Z",
    zkpSignature: "0x3c9e...1f8b"
  },
  {
    id: "signer_003",
    did: "did:civic:delegate_003",
    name: "Citizen Delegate",
    role: "Citizen Delegate",
    hasVoted: false
  },
  {
    id: "signer_004",
    did: "did:civic:delegate_004",
    name: "Environmental Delegate",
    role: "Citizen Delegate",
    hasVoted: true,
    vote: "veto",
    timestamp: "2025-07-16T13:15:00Z",
    zkpSignature: "0x7a5d...9c2f"
  },
  {
    id: "signer_005",
    did: "did:civic:council_005",
    name: "Economic Council Rep",
    role: "Council Member",
    hasVoted: false
  }
];

export default function TreatyRatificationCard() {
  const [treaties, setTreaties] = useState<TreatyForRatification[]>(mockTreaties);
  const [signers, setSigners] = useState<DAOSigner[]>(mockSigners);
  const [selectedTreaty, setSelectedTreaty] = useState<string>("");
  const [currentProgress, setCurrentProgress] = useState<RatificationProgress | null>(null);
  const [userVote, setUserVote] = useState<"ratify" | "veto" | "">("");
  const [ratificationStatus, setRatificationStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [quorumFailRate, setQuorumFailRate] = useState<number>(0);
  const [didMismatchRate, setDidMismatchRate] = useState<number>(0);
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
      speak("Treaty ratification interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Pushback simulation (quorum failure or >20% DID mismatch)
  useEffect(() => {
    const pushbackTimer = setInterval(() => {
      const currentQuorumFail = Math.random() * 100;
      const currentDIDMismatch = Math.random() * 100;
      setQuorumFailRate(currentQuorumFail);
      setDidMismatchRate(currentDIDMismatch);
      
      if (currentQuorumFail > 15 || currentDIDMismatch > 20) {
        setShowPathB(true);
        if (currentQuorumFail > 15) {
          console.log(`⚠️ Treaty ratification quorum failure: ${currentQuorumFail.toFixed(1)}% risk detected`);
        }
        if (currentDIDMismatch > 20) {
          console.log(`⚠️ Treaty ratification DID mismatch: ${currentDIDMismatch.toFixed(1)}% (exceeds 20% threshold)`);
        }
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 10000);

    return () => clearInterval(pushbackTimer);
  }, []);

  // Calculate ratification progress
  const calculateProgress = (treatyId: string): RatificationProgress => {
    const treaty = treaties.find(t => t.id === treatyId);
    if (!treaty) {
      return {
        treatyId,
        totalRequired: 0,
        ratifyVotes: 0,
        vetoVotes: 0,
        quorumMet: false
      };
    }

    const treatySigners = signers.filter(s => s.hasVoted);
    const ratifyVotes = treatySigners.filter(s => s.vote === "ratify").length;
    const vetoVotes = treatySigners.filter(s => s.vote === "veto").length;
    const totalVotes = ratifyVotes + vetoVotes;
    const quorumMet = totalVotes >= Math.ceil(treaty.requiredSignatures * 0.67); // ⅔ quorum

    let outcome: "ratified" | "vetoed" | "failed" | undefined;
    if (quorumMet) {
      if (ratifyVotes > vetoVotes) {
        outcome = "ratified";
      } else {
        outcome = "vetoed";
      }
    } else if (totalVotes >= treaty.requiredSignatures && ratifyVotes <= vetoVotes) {
      outcome = "failed";
    }

    return {
      treatyId,
      totalRequired: treaty.requiredSignatures,
      ratifyVotes,
      vetoVotes,
      quorumMet,
      outcome
    };
  };

  // Handle treaty selection
  const handleTreatySelection = (treatyId: string) => {
    setSelectedTreaty(treatyId);
    const progress = calculateProgress(treatyId);
    setCurrentProgress(progress);
    setUserVote("");
    setRatificationStatus("idle");
  };

  // Generate ZKP signature
  const generateZKPSignature = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle vote submission
  const handleVoteSubmission = async () => {
    if (!selectedTreaty || !userVote) return;

    setRatificationStatus("processing");

    // Simulate voting delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add current user vote
    const userSigner: DAOSigner = {
      id: `signer_${String(signers.length + 1).padStart(3, '0')}`,
      did: "did:civic:current_user",
      name: "Current User",
      role: "Citizen Delegate",
      hasVoted: true,
      vote: userVote,
      timestamp: new Date().toISOString(),
      zkpSignature: generateZKPSignature()
    };

    setSigners(prev => [...prev, userSigner]);

    // Update treaty status
    const updatedProgress = calculateProgress(selectedTreaty);
    setCurrentProgress(updatedProgress);

    if (updatedProgress.outcome) {
      setTreaties(prev => prev.map(treaty => 
        treaty.id === selectedTreaty 
          ? { 
              ...treaty, 
              status: updatedProgress.outcome === "ratified" ? "ratified" : "vetoed",
              currentSignatures: updatedProgress.ratifyVotes + updatedProgress.vetoVotes,
              lastUpdated: new Date().toISOString()
            }
          : treaty
      ));

      // TTS feedback
      if (updatedProgress.outcome === "ratified") {
        speak("Treaty ratified");
      } else {
        speak("Treaty vetoed");
      }
    }

    setRatificationStatus("completed");
    setUserVote("");
  };

  // Get status color
  const getStatusColor = (status: TreatyForRatification["status"]) => {
    switch (status) {
      case "ratified":
        return "bg-green-500";
      case "vetoed":
        return "bg-red-500";
      case "ratifying":
        return "bg-blue-500";
      case "awaiting_ratification":
      default:
        return "bg-amber-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: TreatyForRatification["status"]) => {
    switch (status) {
      case "ratified":
        return <CheckCircle2 className="h-4 w-4" />;
      case "vetoed":
        return <X className="h-4 w-4" />;
      case "ratifying":
        return <Vote className="h-4 w-4" />;
      case "awaiting_ratification":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get scope color
  const getScopeColor = (scope: TreatyForRatification["scope"]) => {
    switch (scope) {
      case "International":
        return "bg-purple-600";
      case "National":
        return "bg-red-600";
      case "Regional":
        return "bg-blue-600";
      case "Local":
        return "bg-green-600";
      default:
        return "bg-slate-600";
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const selectedTreatyData = treaties.find(t => t.id === selectedTreaty);

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-purple-400" />
          Treaty Ratification
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Hash className="h-3 w-3" />
          <span>Quorum Risk: {quorumFailRate.toFixed(1)}%</span>
          <span>•</span>
          <span>DID Mismatch: {didMismatchRate.toFixed(1)}%</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Treaty Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Select Treaty for Ratification</label>
          <Select value={selectedTreaty} onValueChange={handleTreatySelection}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Treaty selector">
              <SelectValue placeholder="Choose treaty to ratify..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {treaties.map(treaty => (
                <SelectItem key={treaty.id} value={treaty.id} className="text-white hover:bg-slate-600">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{treaty.title}</span>
                      <Badge className={`text-xs ${getScopeColor(treaty.scope)} text-white`}>
                        {treaty.scope}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">{treaty.originalZkpHash}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Treaty Preview */}
        {selectedTreatyData && (
          <div className="p-3 bg-slate-700 rounded-md border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedTreatyData.status)}`} />
                <span className="text-sm font-medium text-white">{selectedTreatyData.title}</span>
              </div>
              {getStatusIcon(selectedTreatyData.status)}
            </div>
            
            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>Summary:</strong> {selectedTreatyData.summary}</div>
              <div><strong>Proposer:</strong> {selectedTreatyData.proposerDID}</div>
              {selectedTreatyData.responderDID && (
                <div><strong>Responder:</strong> {selectedTreatyData.responderDID}</div>
              )}
              <div><strong>Original ZKP:</strong> {selectedTreatyData.originalZkpHash}</div>
              {selectedTreatyData.responseZkpHash && (
                <div><strong>Response ZKP:</strong> {selectedTreatyData.responseZkpHash}</div>
              )}
              <div><strong>Updated:</strong> {formatDate(selectedTreatyData.lastUpdated)}</div>
            </div>
          </div>
        )}

        {/* Ratification Progress */}
        {currentProgress && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Ratification Progress</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Quorum Progress</span>
                <span className="text-slate-300">
                  {currentProgress.ratifyVotes + currentProgress.vetoVotes}/{currentProgress.totalRequired}
                </span>
              </div>
              
              <Progress 
                value={(currentProgress.ratifyVotes + currentProgress.vetoVotes) / currentProgress.totalRequired * 100} 
                className="h-2"
              />
              
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-slate-300">Ratify: {currentProgress.ratifyVotes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-slate-300">Veto: {currentProgress.vetoVotes}</span>
                </div>
              </div>
              
              {currentProgress.quorumMet && (
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">⅔ Quorum Achieved</span>
                </div>
              )}
              
              {currentProgress.outcome && (
                <Badge 
                  className={`text-xs w-full justify-center ${
                    currentProgress.outcome === "ratified" ? "bg-green-600" : "bg-red-600"
                  } text-white`}
                >
                  {currentProgress.outcome.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Voting Interface */}
        {selectedTreatyData && !currentProgress?.outcome && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Cast Your Vote</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setUserVote("ratify")}
                  variant={userVote === "ratify" ? "default" : "outline"}
                  className={`flex-1 h-9 ${
                    userVote === "ratify" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                  aria-label="Vote to ratify treaty"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Ratify
                </Button>
                <Button
                  onClick={() => setUserVote("veto")}
                  variant={userVote === "veto" ? "default" : "outline"}
                  className={`flex-1 h-9 ${
                    userVote === "veto" 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                  aria-label="Vote to veto treaty"
                >
                  <X className="h-4 w-4 mr-1" />
                  Veto
                </Button>
              </div>
            </div>

            <Button
              onClick={handleVoteSubmission}
              disabled={!userVote || ratificationStatus === "processing"}
              className="w-full h-9 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600"
              aria-label="Submit ratification vote"
            >
              {ratificationStatus === "processing" ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing Vote...
                </>
              ) : (
                <>
                  <Vote className="h-4 w-4 mr-2" />
                  Submit Vote
                </>
              )}
            </Button>
          </div>
        )}

        <Separator className="bg-slate-600" />

        {/* Signer Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">DAO Signers</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {signers.filter(s => s.hasVoted).length}/{signers.length}
            </Badge>
          </div>

          <ScrollArea className="h-32">
            <div className="space-y-1">
              {signers.map((signer) => (
                <div
                  key={signer.id}
                  className="p-2 rounded-md bg-slate-700/50 border border-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        signer.hasVoted 
                          ? signer.vote === "ratify" ? "bg-green-500" : "bg-red-500"
                          : "bg-slate-500"
                      }`} />
                      <div className="flex flex-col">
                        <span className="text-xs text-white">{signer.name}</span>
                        <span className="text-xs text-slate-400">{signer.role}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {signer.hasVoted ? (
                        <div className="flex flex-col items-end">
                          <Badge className={`text-xs ${
                            signer.vote === "ratify" ? "bg-green-600" : "bg-red-600"
                          } text-white`}>
                            {signer.vote}
                          </Badge>
                          {signer.timestamp && (
                            <span className="mt-1">{formatDate(signer.timestamp)}</span>
                          )}
                        </div>
                      ) : (
                        <span>Pending</span>
                      )}
                    </div>
                  </div>
                  
                  {signer.zkpSignature && (
                    <div className="mt-1 text-xs text-slate-500">
                      ZKP: {signer.zkpSignature}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Pushback Alert */}
        {showPathB && (
          <div className="p-2 bg-amber-900/50 border border-amber-600 rounded-md" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-300">
                Path B: {quorumFailRate > 15 && "Quorum failure risk"} 
                {quorumFailRate > 15 && didMismatchRate > 20 && " • "}
                {didMismatchRate > 20 && `DID mismatch ${didMismatchRate.toFixed(1)}%`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}