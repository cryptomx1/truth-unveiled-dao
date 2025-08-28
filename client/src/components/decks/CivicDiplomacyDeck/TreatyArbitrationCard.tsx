import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, AlertTriangle, X, FileText, Hash, Sparkles, Eye, Scale, ArrowUp, Archive } from "lucide-react";

interface TreatyDispute {
  id: string;
  treatyId: string;
  treatyTitle: string;
  disputeType: "Ratification Failure" | "Response Conflict" | "Implementation Dispute" | "Scope Disagreement";
  description: string;
  submittedBy: string;
  submitterDID: string;
  status: "open" | "reviewing" | "resolved" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  submissionDate: string;
  lastUpdated: string;
  zkpHash: string;
  originalTreatyZkp: string;
  arbitratorDID?: string;
  resolution?: string;
  escalated: boolean;
}

interface ArbitrationAction {
  id: string;
  disputeId: string;
  action: "Assigned" | "Reviewed" | "Resolved" | "Escalated" | "Archived";
  arbitratorDID: string;
  timestamp: string;
  details: string;
  zkpSignature: string;
}

interface ArbitratorPanel {
  did: string;
  name: string;
  status: "Available" | "Busy" | "Offline";
  expertise: string[];
  activeDisputes: number;
  resolvedDisputes: number;
  lastActive: string;
}

const mockDisputes: TreatyDispute[] = [
  {
    id: "dispute_001",
    treatyId: "treaty_001",
    treatyTitle: "Municipal Water Rights Cooperation Agreement",
    disputeType: "Implementation Dispute",
    description: "Disagreement over resource allocation methodology and emergency response protocols between signatory parties.",
    submittedBy: "Regional Water Authority",
    submitterDID: "did:civic:water_authority_001",
    status: "open",
    priority: "high",
    submissionDate: "2025-07-16T14:30:00Z",
    lastUpdated: "2025-07-16T14:30:00Z",
    zkpHash: "0x7f4a...8e2d",
    originalTreatyZkp: "0x7f4a...8e2d",
    escalated: false
  },
  {
    id: "dispute_002",
    treatyId: "treaty_002",
    treatyTitle: "Cross-Border Educational Exchange Protocol",
    disputeType: "Response Conflict",
    description: "Counter-terms proposed by responder exceed original treaty scope and violate established educational standards.",
    submittedBy: "Educational Standards Board",
    submitterDID: "did:civic:education_standards_002",
    status: "reviewing",
    priority: "medium",
    submissionDate: "2025-07-16T11:15:00Z",
    lastUpdated: "2025-07-16T13:45:00Z",
    zkpHash: "0x9c3b...5f1a",
    originalTreatyZkp: "0x9c3b...5f1a",
    arbitratorDID: "did:civic:arbitrator_002",
    escalated: false
  },
  {
    id: "dispute_003",
    treatyId: "treaty_003",
    treatyTitle: "Regional Climate Action Coordination",
    disputeType: "Ratification Failure",
    description: "DAO ratification failed due to fundamental disagreements on resource allocation framework requiring escalation.",
    submittedBy: "Climate Action Coalition",
    submitterDID: "did:civic:climate_coalition_003",
    status: "resolved",
    priority: "critical",
    submissionDate: "2025-07-16T08:00:00Z",
    lastUpdated: "2025-07-16T16:30:00Z",
    zkpHash: "0x4d8e...2c7f",
    originalTreatyZkp: "0x4d8e...2c7f",
    arbitratorDID: "did:civic:arbitrator_001",
    resolution: "Escalated to DAO Supreme Council for constitutional review and binding arbitration.",
    escalated: true
  }
];

const mockActions: ArbitrationAction[] = [
  {
    id: "action_001",
    disputeId: "dispute_001",
    action: "Assigned",
    arbitratorDID: "did:civic:arbitrator_001",
    timestamp: "2025-07-16T14:30:00Z",
    details: "Dispute assigned to Senior Arbitrator for implementation review",
    zkpSignature: "0x8f1b...6d2a"
  },
  {
    id: "action_002", 
    disputeId: "dispute_002",
    action: "Reviewed",
    arbitratorDID: "did:civic:arbitrator_002",
    timestamp: "2025-07-16T13:45:00Z",
    details: "Educational standards review completed, awaiting resolution decision",
    zkpSignature: "0x3c9e...1f8b"
  },
  {
    id: "action_003",
    disputeId: "dispute_003",
    action: "Escalated",
    arbitratorDID: "did:civic:arbitrator_001",
    timestamp: "2025-07-16T16:30:00Z",
    details: "Constitutional review required, escalated to DAO Supreme Council",
    zkpSignature: "0x7a5d...9c2f"
  }
];

const mockArbitrators: ArbitratorPanel[] = [
  {
    did: "did:civic:arbitrator_001",
    name: "Senior Arbitrator Chen",
    status: "Available",
    expertise: ["Constitutional Law", "Resource Allocation", "Climate Policy"],
    activeDisputes: 1,
    resolvedDisputes: 47,
    lastActive: "2025-07-16T16:30:00Z"
  },
  {
    did: "did:civic:arbitrator_002", 
    name: "Arbitrator Rodriguez",
    status: "Busy",
    expertise: ["Educational Policy", "Cross-Border Law", "Standards Compliance"],
    activeDisputes: 2,
    resolvedDisputes: 32,
    lastActive: "2025-07-16T15:45:00Z"
  },
  {
    did: "did:civic:arbitrator_003",
    name: "Arbitrator Kim",
    status: "Available",
    expertise: ["Implementation Disputes", "Municipal Law", "Water Rights"],
    activeDisputes: 0,
    resolvedDisputes: 28,
    lastActive: "2025-07-16T14:20:00Z"
  }
];

export default function TreatyArbitrationCard() {
  const [disputes, setDisputes] = useState<TreatyDispute[]>(mockDisputes);
  const [actions, setActions] = useState<ArbitrationAction[]>(mockActions);
  const [arbitrators, setArbitrators] = useState<ArbitratorPanel[]>(mockArbitrators);
  const [selectedDispute, setSelectedDispute] = useState<string>("");
  const [resolutionText, setResolutionText] = useState<string>("");
  const [arbitrationStatus, setArbitrationStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [currentAction, setCurrentAction] = useState<"resolve" | "escalate" | "">("");
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [unresolvedRate, setUnresolvedRate] = useState<number>(0);
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
      speak("Treaty arbitration panel activated");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Pushback simulation (>20% unresolved treaties)
  useEffect(() => {
    const pushbackTimer = setInterval(() => {
      const openDisputes = disputes.filter(d => d.status === "open" || d.status === "reviewing").length;
      const totalDisputes = disputes.length;
      const currentUnresolvedRate = totalDisputes > 0 ? (openDisputes / totalDisputes) * 100 : 0;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 40; // ±20% variance
      const testRate = Math.max(0, Math.min(100, currentUnresolvedRate + variance));
      setUnresolvedRate(testRate);
      
      if (testRate > 20) {
        setShowPathB(true);
        console.log(`⚠️ Treaty arbitration unresolved rate: ${testRate.toFixed(1)}% (exceeds 20% threshold)`);
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 12000);

    return () => clearInterval(pushbackTimer);
  }, [disputes]);

  // Generate ZKP signature
  const generateZKPSignature = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle dispute resolution
  const handleDisputeAction = async (actionType: "resolve" | "escalate") => {
    if (!selectedDispute || !resolutionText.trim()) {
      return;
    }

    setArbitrationStatus("processing");
    setCurrentAction(actionType);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const dispute = disputes.find(d => d.id === selectedDispute);
    if (!dispute) return;

    // Update dispute status
    const newStatus = actionType === "resolve" ? "resolved" : "archived";
    const escalated = actionType === "escalate";

    const updatedDispute: TreatyDispute = {
      ...dispute,
      status: newStatus,
      resolution: resolutionText,
      escalated,
      arbitratorDID: "did:civic:current_arbitrator",
      lastUpdated: new Date().toISOString()
    };

    setDisputes(prev => prev.map(d => d.id === selectedDispute ? updatedDispute : d));

    // Add arbitration action
    const newAction: ArbitrationAction = {
      id: `action_${String(actions.length + 1).padStart(3, '0')}`,
      disputeId: selectedDispute,
      action: actionType === "resolve" ? "Resolved" : "Escalated",
      arbitratorDID: "did:civic:current_arbitrator",
      timestamp: new Date().toISOString(),
      details: resolutionText,
      zkpSignature: generateZKPSignature()
    };

    setActions(prev => [newAction, ...prev]);

    // TTS feedback
    if (actionType === "resolve") {
      speak("Dispute resolved");
    } else {
      speak("Dispute escalated");
    }

    setArbitrationStatus("completed");
    setSelectedDispute("");
    setResolutionText("");
    setCurrentAction("");
  };

  // Get status color
  const getStatusColor = (status: TreatyDispute["status"]) => {
    switch (status) {
      case "resolved":
        return "bg-green-500";
      case "reviewing":
        return "bg-blue-500";
      case "archived":
        return "bg-purple-500";
      case "open":
      default:
        return "bg-amber-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: TreatyDispute["status"]) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "reviewing":
        return <Eye className="h-4 w-4" />;
      case "archived":
        return <Archive className="h-4 w-4" />;
      case "open":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: TreatyDispute["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-600";
      case "medium":
        return "bg-yellow-600";
      case "low":
        return "bg-green-600";
      default:
        return "bg-slate-600";
    }
  };

  // Get arbitrator status color
  const getArbitratorStatusColor = (status: ArbitratorPanel["status"]) => {
    switch (status) {
      case "Available":
        return "bg-green-500";
      case "Busy":
        return "bg-amber-500";
      case "Offline":
        return "bg-red-500";
      default:
        return "bg-slate-500";
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

  const selectedDisputeData = disputes.find(d => d.id === selectedDispute);
  const openDisputes = disputes.filter(d => d.status === "open" || d.status === "reviewing").length;
  const resolvedDisputes = disputes.filter(d => d.status === "resolved").length;

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5 text-amber-400" />
          Treaty Arbitration
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Hash className="h-3 w-3" />
          <span>Open: {openDisputes}</span>
          <span>•</span>
          <span>Resolved: {resolvedDisputes}</span>
          <span>•</span>
          <span>Unresolved: {unresolvedRate.toFixed(1)}%</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dispute Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Select Dispute for Arbitration</label>
          <Select value={selectedDispute} onValueChange={setSelectedDispute}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Dispute selector">
              <SelectValue placeholder="Choose dispute to arbitrate..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {disputes.filter(d => d.status === "open" || d.status === "reviewing").map(dispute => (
                <SelectItem key={dispute.id} value={dispute.id} className="text-white hover:bg-slate-600">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{dispute.treatyTitle}</span>
                      <Badge className={`text-xs ${getPriorityColor(dispute.priority)} text-white`}>
                        {dispute.priority}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">{dispute.disputeType}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dispute Details */}
        {selectedDisputeData && (
          <div className="p-3 bg-slate-700 rounded-md border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedDisputeData.status)}`} />
                <span className="text-sm font-medium text-white">{selectedDisputeData.treatyTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(selectedDisputeData.status)}
                {selectedDisputeData.escalated && (
                  <ArrowUp className="h-3 w-3 text-amber-400" />
                )}
              </div>
            </div>
            
            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>Type:</strong> {selectedDisputeData.disputeType}</div>
              <div><strong>Description:</strong> {selectedDisputeData.description}</div>
              <div><strong>Submitted by:</strong> {selectedDisputeData.submittedBy}</div>
              <div><strong>Submitter DID:</strong> {selectedDisputeData.submitterDID}</div>
              <div><strong>ZKP Hash:</strong> {selectedDisputeData.zkpHash}</div>
              <div><strong>Submitted:</strong> {formatDate(selectedDisputeData.submissionDate)}</div>
              {selectedDisputeData.arbitratorDID && (
                <div><strong>Arbitrator:</strong> {selectedDisputeData.arbitratorDID}</div>
              )}
            </div>
          </div>
        )}

        {/* Resolution Interface */}
        {selectedDisputeData && (selectedDisputeData.status === "open" || selectedDisputeData.status === "reviewing") && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Resolution Details</label>
              <Textarea
                placeholder="Enter arbitration decision and reasoning..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-20 text-xs resize-none"
                maxLength={500}
                aria-label="Resolution details textarea"
              />
              <div className="text-xs text-slate-400 text-right">
                {resolutionText.length}/500
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleDisputeAction("resolve")}
                disabled={!resolutionText.trim() || arbitrationStatus === "processing"}
                className="flex-1 h-9 bg-green-600 hover:bg-green-700 disabled:bg-slate-600"
                aria-label="Resolve dispute"
              >
                {arbitrationStatus === "processing" && currentAction === "resolve" ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => handleDisputeAction("escalate")}
                disabled={!resolutionText.trim() || arbitrationStatus === "processing"}
                className="flex-1 h-9 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600"
                aria-label="Escalate dispute"
              >
                {arbitrationStatus === "processing" && currentAction === "escalate" ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Escalating...
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Escalate
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <Separator className="bg-slate-600" />

        {/* Arbitration Audit Trail */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Audit Trail</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {actions.length}
            </Badge>
          </div>

          <ScrollArea className="h-32">
            <div className="space-y-1">
              {actions.slice(0, 5).map((action) => (
                <div key={action.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        action.action === "Resolved" ? "bg-green-500" :
                        action.action === "Escalated" ? "bg-amber-500" :
                        action.action === "Reviewed" ? "bg-blue-500" : "bg-slate-500"
                      }`} />
                      <Badge className={`text-xs ${
                        action.action === "Resolved" ? "bg-green-600" :
                        action.action === "Escalated" ? "bg-amber-600" :
                        action.action === "Reviewed" ? "bg-blue-600" : "bg-slate-600"
                      } text-white`}>
                        {action.action}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(action.timestamp)}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-xs text-slate-300">
                    <div className="truncate">{action.details}</div>
                    <div className="text-slate-500 mt-1">
                      Arbitrator: {action.arbitratorDID.split(':').pop()}
                    </div>
                    <div className="text-slate-500">
                      ZKP: {action.zkpSignature}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Arbitrator Panel Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Arbitrator Panel</span>
          </div>
          
          <ScrollArea className="h-24">
            <div className="space-y-1">
              {arbitrators.map((arbitrator) => (
                <div key={arbitrator.did} className="p-1 rounded-md bg-slate-700/30 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getArbitratorStatusColor(arbitrator.status)}`} />
                      <div className="flex flex-col">
                        <span className="text-xs text-white">{arbitrator.name}</span>
                        <span className="text-xs text-slate-400">
                          Active: {arbitrator.activeDisputes} | Resolved: {arbitrator.resolvedDisputes}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${
                      arbitrator.status === "Available" ? "bg-green-700" :
                      arbitrator.status === "Busy" ? "bg-amber-700" : "bg-red-700"
                    } text-white`}>
                      {arbitrator.status}
                    </Badge>
                  </div>
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
                Path B: Unresolved rate {unresolvedRate.toFixed(1)}% exceeds 20% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}