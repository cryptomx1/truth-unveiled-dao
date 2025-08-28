import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, AlertTriangle, FileText, Users, Hash, Sparkles, Eye, Edit3, MessageSquare } from "lucide-react";

interface TreatyResponse {
  id: string;
  treatyId: string;
  treatyTitle: string;
  originalTerms: string;
  responseType: "accept" | "modify" | "reject";
  counterTerms?: string;
  status: "pending" | "countered" | "signed" | "escalated";
  signerDID: string;
  signerName: string;
  zkpHash: string;
  responseHash: string;
  timestamp: string;
  originalZkpHash: string;
}

interface DecisionRecord {
  id: string;
  responseId: string;
  action: string;
  signerDID: string;
  timestamp: string;
  details: string;
}

const mockResponses: TreatyResponse[] = [
  {
    id: "response_001",
    treatyId: "treaty_001",
    treatyTitle: "Municipal Water Rights Cooperation Agreement",
    originalTerms: "Establishes shared water distribution protocols and emergency backup systems between municipal entities.",
    responseType: "accept",
    status: "signed",
    signerDID: "did:civic:city_council_001",
    signerName: "City Council Representative",
    zkpHash: "0x7f4a...8e2d",
    responseHash: "0xa3b9...4c7e",
    timestamp: "2025-07-16T15:30:00Z",
    originalZkpHash: "0x7f4a...8e2d"
  },
  {
    id: "response_002",
    treatyId: "treaty_002",
    treatyTitle: "Cross-Border Educational Exchange Protocol",
    originalTerms: "Framework for student and faculty exchanges, curriculum harmonization, and joint research initiatives.",
    responseType: "modify",
    counterTerms: "Agree to framework but request 2-year initial term instead of 10 years, with expansion review clause after successful pilot period.",
    status: "countered",
    signerDID: "did:civic:education_board_002",
    signerName: "Provincial Education Board",
    zkpHash: "0x9c3b...5f1a",
    responseHash: "0x2d8f...9a1c",
    timestamp: "2025-07-16T12:45:00Z",
    originalZkpHash: "0x9c3b...5f1a"
  },
  {
    id: "response_003",
    treatyId: "treaty_003",
    treatyTitle: "Regional Climate Action Coordination",
    originalTerms: "Coordinated response framework for climate emergency protocols and resource sharing mechanisms.",
    responseType: "reject",
    status: "escalated", // 25% mismatch for pushback testing
    signerDID: "did:civic:climate_coalition_003",
    signerName: "Climate Coalition",
    zkpHash: "0x4d8e...2c7f",
    responseHash: "0x8f1b...6d2a",
    timestamp: "2025-07-16T09:15:00Z",
    originalZkpHash: "0x4d8e...2c7f"
  }
];

const mockDecisions: DecisionRecord[] = [
  {
    id: "decision_001",
    responseId: "response_001",
    action: "Accepted treaty terms",
    signerDID: "did:civic:city_council_001",
    timestamp: "2025-07-16T15:30:00Z",
    details: "Full acceptance of water distribution protocols"
  },
  {
    id: "decision_002",
    responseId: "response_002",
    action: "Counter-proposed modifications",
    signerDID: "did:civic:education_board_002",
    timestamp: "2025-07-16T12:45:00Z",
    details: "Requested 2-year pilot term with review clause"
  },
  {
    id: "decision_003",
    responseId: "response_003",
    action: "Rejected and escalated",
    signerDID: "did:civic:climate_coalition_003",
    timestamp: "2025-07-16T09:15:00Z",
    details: "Fundamental disagreement on resource allocation framework"
  }
];

export default function TreatyResponseCard() {
  const [responses, setResponses] = useState<TreatyResponse[]>(mockResponses);
  const [decisions, setDecisions] = useState<DecisionRecord[]>(mockDecisions);
  const [selectedTreaty, setSelectedTreaty] = useState<string>("");
  const [responseType, setResponseType] = useState<"accept" | "modify" | "reject" | "">("");
  const [counterTerms, setCounterTerms] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<TreatyResponse["status"]>("pending");
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [zkpSync, setZkpSync] = useState<boolean>(false);
  const [mismatchRate, setMismatchRate] = useState<number>(0);
  const [lastSpeech, setLastSpeech] = useState<number>(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Available treaties from Module #1 (mock data sync)
  const availableTreaties = [
    { id: "treaty_001", title: "Municipal Water Rights Cooperation Agreement", zkpHash: "0x7f4a...8e2d" },
    { id: "treaty_002", title: "Cross-Border Educational Exchange Protocol", zkpHash: "0x9c3b...5f1a" },
    { id: "treaty_003", title: "Regional Climate Action Coordination", zkpHash: "0x4d8e...2c7f" },
    { id: "treaty_004", title: "Inter-Municipal Transit Coordination", zkpHash: "0x6e9a...3f8b" }
  ];

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
      speak("Treaty response panel ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ZKP cross-deck validation (Module #1 + Deck #12 DID sync)
  useEffect(() => {
    const validateZKP = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      setZkpSync(true);
    };
    validateZKP();
  }, []);

  // Pushback simulation (>25% response mismatch)
  useEffect(() => {
    const pushbackTimer = setInterval(() => {
      const currentMismatch = Math.random() * 100;
      setMismatchRate(currentMismatch);
      
      if (currentMismatch > 25) {
        setShowPathB(true);
        console.log(`⚠️ Treaty response mismatch: ${currentMismatch.toFixed(1)}% (exceeds 25% threshold)`);
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 8000);

    return () => clearInterval(pushbackTimer);
  }, []);

  // Generate ZKP response hash
  const generateResponseHash = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Submit response
  const handleSubmitResponse = async () => {
    if (!selectedTreaty || !responseType) {
      return;
    }

    if (responseType === "modify" && !counterTerms.trim()) {
      return;
    }

    setCurrentStatus("pending");
    
    const selectedTreatyData = availableTreaties.find(t => t.id === selectedTreaty);
    if (!selectedTreatyData) return;

    // Generate response hash
    const responseHash = generateResponseHash();

    // Determine status based on response type
    let newStatus: TreatyResponse["status"] = "pending";
    if (responseType === "accept") {
      newStatus = "signed";
    } else if (responseType === "modify") {
      newStatus = "countered";
    } else if (responseType === "reject") {
      newStatus = "escalated";
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newResponse: TreatyResponse = {
      id: `response_${String(responses.length + 1).padStart(3, '0')}`,
      treatyId: selectedTreaty,
      treatyTitle: selectedTreatyData.title,
      originalTerms: "Treaty terms from original proposal...",
      responseType,
      counterTerms: responseType === "modify" ? counterTerms : undefined,
      status: newStatus,
      signerDID: "did:civic:current_signer",
      signerName: "Current Signer",
      zkpHash: selectedTreatyData.zkpHash,
      responseHash,
      timestamp: new Date().toISOString(),
      originalZkpHash: selectedTreatyData.zkpHash
    };

    const newDecision: DecisionRecord = {
      id: `decision_${String(decisions.length + 1).padStart(3, '0')}`,
      responseId: newResponse.id,
      action: responseType === "accept" ? "Accepted treaty terms" : 
              responseType === "modify" ? "Counter-proposed modifications" :
              "Rejected and escalated",
      signerDID: "did:civic:current_signer",
      timestamp: new Date().toISOString(),
      details: responseType === "modify" ? counterTerms : `${responseType} response submitted`
    };

    setResponses(prev => [newResponse, ...prev]);
    setDecisions(prev => [newDecision, ...prev]);
    setCurrentStatus(newStatus);
    
    // Reset form
    setSelectedTreaty("");
    setResponseType("");
    setCounterTerms("");

    // TTS feedback
    if (responseType === "accept") {
      speak("Response submitted");
    } else if (responseType === "modify") {
      speak("Treaty countered");
    } else {
      speak("Response submitted");
    }
  };

  // Get status color
  const getStatusColor = (status: TreatyResponse["status"]) => {
    switch (status) {
      case "signed":
        return "bg-green-500";
      case "countered":
        return "bg-blue-500";
      case "escalated":
        return "bg-red-500";
      case "pending":
      default:
        return "bg-amber-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: TreatyResponse["status"]) => {
    switch (status) {
      case "signed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "countered":
        return <Edit3 className="h-4 w-4" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get response type color
  const getResponseTypeColor = (type: TreatyResponse["responseType"]) => {
    switch (type) {
      case "accept":
        return "bg-green-600";
      case "modify":
        return "bg-blue-600";
      case "reject":
        return "bg-red-600";
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

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Treaty Response
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Hash className="h-3 w-3" />
          <span>ZKP Sync: {zkpSync ? "✓" : "..."}</span>
          <span>•</span>
          <span>Mismatch: {mismatchRate.toFixed(1)}%</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Response Form */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Select Treaty</label>
            <Select value={selectedTreaty} onValueChange={setSelectedTreaty}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Treaty selector">
                <SelectValue placeholder="Choose treaty to respond to..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {availableTreaties.map(treaty => (
                  <SelectItem key={treaty.id} value={treaty.id} className="text-white hover:bg-slate-600">
                    <div className="flex flex-col">
                      <span className="text-sm">{treaty.title}</span>
                      <span className="text-xs text-slate-400">{treaty.zkpHash}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Response Type</label>
            <Select value={responseType} onValueChange={(value) => setResponseType(value as typeof responseType)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Response type selector">
                <SelectValue placeholder="Select response..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="accept" className="text-white hover:bg-slate-600">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    <span>Accept Terms</span>
                  </span>
                </SelectItem>
                <SelectItem value="modify" className="text-white hover:bg-slate-600">
                  <span className="flex items-center gap-2">
                    <Edit3 className="h-3 w-3 text-blue-400" />
                    <span>Modify & Counter</span>
                  </span>
                </SelectItem>
                <SelectItem value="reject" className="text-white hover:bg-slate-600">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                    <span>Reject Treaty</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {responseType === "modify" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Counter-Terms</label>
              <Textarea
                placeholder="Describe your proposed modifications..."
                value={counterTerms}
                onChange={(e) => setCounterTerms(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-20 text-xs resize-none"
                maxLength={400}
                aria-label="Counter-terms textarea"
              />
              <div className="text-xs text-slate-400 text-right">
                {counterTerms.length}/400
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmitResponse}
            disabled={!selectedTreaty || !responseType || (responseType === "modify" && !counterTerms.trim())}
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
            aria-label="Submit treaty response"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Submit Response
          </Button>
        </div>

        <Separator className="bg-slate-600" />

        {/* Response History */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Response History</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {responses.length}
            </Badge>
          </div>

          <ScrollArea className="h-40">
            <div className="space-y-2">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className={`p-2 rounded-md border cursor-pointer transition-all ${
                    selectedResponse === response.id
                      ? "bg-slate-700 border-slate-500"
                      : "bg-slate-800 border-slate-600 hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedResponse(selectedResponse === response.id ? null : response.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Response to: ${response.treatyTitle}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedResponse(selectedResponse === response.id ? null : response.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(response.status)}`} />
                      <Badge className={`text-xs ${getResponseTypeColor(response.responseType)} text-white`}>
                        {response.responseType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(response.status)}
                      <span className="text-xs text-slate-400">
                        {formatDate(response.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <span className="text-xs text-white truncate block max-w-[200px]">
                      {response.treatyTitle}
                    </span>
                    <span className="text-xs text-slate-400">
                      by {response.signerName}
                    </span>
                  </div>
                  
                  {selectedResponse === response.id && (
                    <div className="mt-2 pt-2 border-t border-slate-600">
                      <div className="text-xs text-slate-300 space-y-1">
                        <div><strong>Status:</strong> {response.status}</div>
                        <div><strong>Signer DID:</strong> {response.signerDID}</div>
                        <div><strong>Response Hash:</strong> {response.responseHash}</div>
                        <div><strong>Original ZKP:</strong> {response.originalZkpHash}</div>
                        {response.counterTerms && (
                          <div className="mt-2">
                            <strong>Counter-Terms:</strong>
                            <div className="text-slate-400 text-xs mt-1 p-1 bg-slate-700 rounded">
                              {response.counterTerms}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Decision Log */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Decision Log</span>
          </div>
          
          <ScrollArea className="h-20">
            <div className="space-y-1">
              {decisions.slice(0, 3).map((decision) => (
                <div key={decision.id} className="text-xs text-slate-400 p-1 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">{decision.action}</span>
                    <span>{formatDate(decision.timestamp)}</span>
                  </div>
                  <div className="text-slate-500 truncate">{decision.details}</div>
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
                Path B: Response mismatch rate {mismatchRate.toFixed(1)}% detected
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}