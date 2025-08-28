import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, HandHeart, Building2, Clock, Sparkles, AlertTriangle, Hash, UserCheck } from "lucide-react";

interface SocialConnection {
  id: string;
  name: string;
  type: "neighbor" | "local_org" | "mutual_aid" | "community_leader" | "support_network";
  bondStrength: "strong" | "neutral" | "weak";
  lastInteraction: string;
  trustActions: number;
  zkpVerified: boolean;
  didReference: string;
  interactionHistory: SocialInteraction[];
  reputation: number; // 0-100
}

interface SocialInteraction {
  id: string;
  connectionId: string;
  actionType: "helped" | "received_help" | "participated" | "organized" | "referred";
  description: string;
  timestamp: string;
  zkpHash: string;
  trustImpact: number; // -10 to +10
}

interface CommunityMetrics {
  totalConnections: number;
  strongBonds: number;
  activeInteractions: number;
  disengagementRate: number;
  communityTrust: number;
  mutualAidCount: number;
}

interface CommunityReferral {
  id: string;
  referredBy: string;
  referredTo: string;
  serviceType: string;
  status: "pending" | "accepted" | "completed" | "declined";
  timestamp: string;
  zkpHash: string;
}

const mockConnections: SocialConnection[] = [
  {
    id: "conn_001",
    name: "Maya Chen",
    type: "neighbor",
    bondStrength: "strong",
    lastInteraction: "2025-07-16T19:45:00Z",
    trustActions: 12,
    zkpVerified: true,
    didReference: "did:civic:neighbor_maya_c8f3",
    reputation: 87,
    interactionHistory: [
      {
        id: "int_001",
        connectionId: "conn_001",
        actionType: "helped",
        description: "Helped with grocery shopping during illness",
        timestamp: "2025-07-16T19:45:00Z",
        zkpHash: "0x8a4f...2d1e",
        trustImpact: 8
      }
    ]
  },
  {
    id: "conn_002",
    name: "Downtown Community Center",
    type: "local_org",
    bondStrength: "strong",
    lastInteraction: "2025-07-16T17:30:00Z",
    trustActions: 8,
    zkpVerified: true,
    didReference: "did:civic:org_downtown_cc",
    reputation: 92,
    interactionHistory: [
      {
        id: "int_002",
        connectionId: "conn_002",
        actionType: "participated",
        description: "Attended community planning meeting",
        timestamp: "2025-07-16T17:30:00Z",
        zkpHash: "0x5c2b...9e8f",
        trustImpact: 5
      }
    ]
  },
  {
    id: "conn_003",
    name: "Neighborhood Mutual Aid",
    type: "mutual_aid",
    bondStrength: "strong",
    lastInteraction: "2025-07-16T16:00:00Z",
    trustActions: 15,
    zkpVerified: false,
    didReference: "did:civic:mutualaid_nw",
    reputation: 78,
    interactionHistory: [
      {
        id: "int_003",
        connectionId: "conn_003",
        actionType: "organized",
        description: "Coordinated food distribution",
        timestamp: "2025-07-16T16:00:00Z",
        zkpHash: "0x9d3c...4a7b",
        trustImpact: 9
      }
    ]
  },
  {
    id: "conn_004",
    name: "Alex Rivera",
    type: "community_leader",
    bondStrength: "neutral",
    lastInteraction: "2025-07-15T14:20:00Z",
    trustActions: 4,
    zkpVerified: true,
    didReference: "did:civic:leader_alex_r2b8",
    reputation: 65,
    interactionHistory: [
      {
        id: "int_004",
        connectionId: "conn_004",
        actionType: "referred",
        description: "Referred to mental health resources",
        timestamp: "2025-07-15T14:20:00Z",
        zkpHash: "0x7e1d...8c5f",
        trustImpact: 3
      }
    ]
  },
  {
    id: "conn_005",
    name: "Sam Torres",
    type: "support_network",
    bondStrength: "weak",
    lastInteraction: "2025-07-14T10:15:00Z",
    trustActions: 1,
    zkpVerified: false,
    didReference: "did:civic:support_sam_t9a1",
    reputation: 45,
    interactionHistory: [
      {
        id: "int_005",
        connectionId: "conn_005",
        actionType: "received_help",
        description: "Received tech support",
        timestamp: "2025-07-14T10:15:00Z",
        zkpHash: "0x2f6a...1b9c",
        trustImpact: 2
      }
    ]
  }
];

const mockReferrals: CommunityReferral[] = [
  {
    id: "ref_001",
    referredBy: "did:civic:neighbor_maya_c8f3",
    referredTo: "did:civic:current_user",
    serviceType: "Mental Health Support",
    status: "completed",
    timestamp: "2025-07-16T18:30:00Z",
    zkpHash: "0x4d8e...7c2a"
  },
  {
    id: "ref_002",
    referredBy: "did:civic:current_user",
    referredTo: "did:civic:leader_alex_r2b8",
    serviceType: "Community Garden",
    status: "accepted",
    timestamp: "2025-07-16T15:45:00Z",
    zkpHash: "0x9b3f...5e1d"
  }
];

export default function SocialCohesionCard() {
  const [connections, setConnections] = useState<SocialConnection[]>(mockConnections);
  const [referrals, setReferrals] = useState<CommunityReferral[]>(mockReferrals);
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [actionType, setActionType] = useState<SocialInteraction["actionType"]>("helped");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [disengagementAlert, setDisengagementAlert] = useState<boolean>(false);
  const [communityMetrics, setCommunityMetrics] = useState<CommunityMetrics>({
    totalConnections: 0,
    strongBonds: 0,
    activeInteractions: 0,
    disengagementRate: 0,
    communityTrust: 0,
    mutualAidCount: 0
  });
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
      speak("Social cohesion tracker ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate community metrics
  useEffect(() => {
    const total = connections.length;
    const strong = connections.filter(c => c.bondStrength === "strong").length;
    const recentInteractions = connections.filter(c => {
      const lastInteraction = new Date(c.lastInteraction);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastInteraction > weekAgo;
    }).length;
    
    const totalTrust = connections.reduce((sum, c) => sum + c.reputation, 0);
    const avgTrust = total > 0 ? totalTrust / total : 0;
    const mutualAid = connections.filter(c => c.type === "mutual_aid").length;
    
    // Calculate disengagement rate (inverse of active interactions)
    const disengagement = total > 0 ? Math.max(0, 100 - ((recentInteractions / total) * 100)) : 0;

    setCommunityMetrics({
      totalConnections: total,
      strongBonds: strong,
      activeInteractions: recentInteractions,
      disengagementRate: disengagement,
      communityTrust: avgTrust,
      mutualAidCount: mutualAid
    });
  }, [connections]);

  // Disengagement monitoring (≥30% threshold)
  useEffect(() => {
    const disengagementTimer = setInterval(() => {
      const disengagementThreshold = 30;
      const currentDisengagement = communityMetrics.disengagementRate;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 40; // ±20% variance
      const testDisengagementRate = Math.max(0, Math.min(100, currentDisengagement + variance));
      
      if (testDisengagementRate >= disengagementThreshold) {
        setDisengagementAlert(true);
        setShowPathB(true);
        console.log(`⚠️ Social disengagement critical: ${testDisengagementRate.toFixed(1)}% (exceeds 30% threshold)`);
        setTimeout(() => {
          setDisengagementAlert(false);
          setShowPathB(false);
        }, 3000);
      }
    }, 18000);

    return () => clearInterval(disengagementTimer);
  }, [communityMetrics.disengagementRate]);

  // Generate ZKP hash
  const generateZKPHash = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle social interaction recording
  const handleRecordInteraction = async () => {
    if (!selectedConnection) return;

    setIsRecording(true);

    // Simulate interaction recording
    await new Promise(resolve => setTimeout(resolve, 2000));

    const connection = connections.find(c => c.id === selectedConnection);
    if (!connection) {
      setIsRecording(false);
      return;
    }

    // Generate trust impact based on action type
    const trustImpact = 
      actionType === "helped" ? Math.floor(Math.random() * 5) + 6 :
      actionType === "organized" ? Math.floor(Math.random() * 4) + 7 :
      actionType === "participated" ? Math.floor(Math.random() * 3) + 3 :
      actionType === "referred" ? Math.floor(Math.random() * 3) + 2 :
      Math.floor(Math.random() * 2) + 1;

    const newInteraction: SocialInteraction = {
      id: `int_${Date.now()}`,
      connectionId: selectedConnection,
      actionType: actionType,
      description: getActionDescription(actionType, connection.name),
      timestamp: new Date().toISOString(),
      zkpHash: generateZKPHash(),
      trustImpact: trustImpact
    };

    // Update connection with new interaction
    const updatedConnection: SocialConnection = {
      ...connection,
      lastInteraction: newInteraction.timestamp,
      trustActions: connection.trustActions + 1,
      reputation: Math.min(100, connection.reputation + trustImpact),
      bondStrength: calculateBondStrength(connection.reputation + trustImpact, connection.trustActions + 1),
      interactionHistory: [newInteraction, ...connection.interactionHistory]
    };

    setConnections(prev => prev.map(c => c.id === selectedConnection ? updatedConnection : c));

    speak("Social interaction recorded");
    console.log(`✅ Social interaction recorded: ${newInteraction.id}`);
    console.log(`📊 Trust impact: +${trustImpact} | New reputation: ${updatedConnection.reputation}`);

    setIsRecording(false);
    setSelectedConnection("");
  };

  // Get action description
  const getActionDescription = (action: SocialInteraction["actionType"], name: string): string => {
    switch (action) {
      case "helped":
        return `Provided assistance to ${name}`;
      case "received_help":
        return `Received help from ${name}`;
      case "participated":
        return `Participated in event with ${name}`;
      case "organized":
        return `Organized community activity with ${name}`;
      case "referred":
        return `Made referral through ${name}`;
      default:
        return `Interacted with ${name}`;
    }
  };

  // Calculate bond strength
  const calculateBondStrength = (reputation: number, trustActions: number): SocialConnection["bondStrength"] => {
    const combinedScore = (reputation * 0.7) + (Math.min(trustActions, 20) * 2);
    if (combinedScore >= 70) return "strong";
    if (combinedScore >= 40) return "neutral";
    return "weak";
  };

  // Get bond strength color
  const getBondColor = (strength: SocialConnection["bondStrength"]): string => {
    switch (strength) {
      case "strong":
        return "text-green-400";
      case "neutral":
        return "text-yellow-400";
      case "weak":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  // Get bond strength icon
  const getBondIcon = (strength: SocialConnection["bondStrength"]) => {
    switch (strength) {
      case "strong":
        return "🟢";
      case "neutral":
        return "🟡";
      case "weak":
        return "🔴";
      default:
        return "⚪";
    }
  };

  // Get connection type icon
  const getConnectionIcon = (type: SocialConnection["type"]) => {
    switch (type) {
      case "neighbor":
        return <Users className="h-3 w-3" />;
      case "local_org":
        return <Building2 className="h-3 w-3" />;
      case "mutual_aid":
        return <HandHeart className="h-3 w-3" />;
      case "community_leader":
        return <UserCheck className="h-3 w-3" />;
      case "support_network":
        return <Heart className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
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
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const canRecord = selectedConnection && !isRecording;
  const selectedConnectionData = connections.find(c => c.id === selectedConnection);

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-blue-400" />
          Social Cohesion
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Heart className="h-3 w-3" />
          <span>Bonds: {communityMetrics.strongBonds}/{communityMetrics.totalConnections}</span>
          <span>•</span>
          <span className={communityMetrics.disengagementRate <= 20 ? "text-green-400" : communityMetrics.disengagementRate <= 30 ? "text-amber-400" : "text-red-400"}>
            Disengagement: {communityMetrics.disengagementRate.toFixed(0)}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Select Social Connection</label>
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Connection selector">
              <SelectValue placeholder="Choose connection..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {connections.map(connection => (
                <SelectItem key={connection.id} value={connection.id} className="text-white hover:bg-slate-600">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {getConnectionIcon(connection.type)}
                      <span className="text-sm">{connection.name}</span>
                      <span className="text-xs">{getBondIcon(connection.bondStrength)}</span>
                      {connection.zkpVerified && <Badge variant="secondary" className="text-xs bg-blue-600 text-white">ZKP</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{connection.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Trust: {connection.reputation}</span>
                      <span>•</span>
                      <span>{formatDate(connection.lastInteraction)}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Interaction Type</label>
          <Select value={actionType} onValueChange={(value: SocialInteraction["actionType"]) => setActionType(value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Action type selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="helped" className="text-white hover:bg-slate-600">Provided Help</SelectItem>
              <SelectItem value="received_help" className="text-white hover:bg-slate-600">Received Help</SelectItem>
              <SelectItem value="participated" className="text-white hover:bg-slate-600">Participated Together</SelectItem>
              <SelectItem value="organized" className="text-white hover:bg-slate-600">Organized Event</SelectItem>
              <SelectItem value="referred" className="text-white hover:bg-slate-600">Made Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Connection Details */}
        {selectedConnectionData && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Connection Details</label>
            <div className="p-2 bg-slate-700/50 rounded-md border border-slate-600">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{selectedConnectionData.name}</span>
                  <div className="flex items-center gap-1">
                    <span className={getBondColor(selectedConnectionData.bondStrength)}>
                      {getBondIcon(selectedConnectionData.bondStrength)} {selectedConnectionData.bondStrength}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getConnectionIcon(selectedConnectionData.type)}
                  <span className="text-slate-400">{selectedConnectionData.type.replace('_', ' ')}</span>
                  {selectedConnectionData.zkpVerified && <Badge className="text-xs bg-blue-600 text-white">Verified</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trust Actions: {selectedConnectionData.trustActions}</span>
                  <span className="text-slate-400">Reputation: {selectedConnectionData.reputation}</span>
                </div>
                <div className="text-slate-500 font-mono text-xs">
                  DID: {selectedConnectionData.didReference}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Record Interaction */}
        <div className="space-y-2">
          <Button
            onClick={handleRecordInteraction}
            disabled={!canRecord}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
            aria-label="Record interaction"
          >
            {isRecording ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Recording Interaction...
              </>
            ) : (
              <>
                <Hash className="h-4 w-4 mr-2" />
                Record Social Interaction
              </>
            )}
          </Button>
          
          {!canRecord && !isRecording && (
            <div className="text-xs text-amber-400 text-center" role="alert" aria-live="polite">
              Select a connection to record interaction
            </div>
          )}
        </div>

        <Separator className="bg-slate-600" />

        {/* Community Metrics */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-300">Community Health</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Trust Score:</span>
              <span className={communityMetrics.communityTrust >= 80 ? "text-green-400" : communityMetrics.communityTrust >= 60 ? "text-amber-400" : "text-red-400"}>
                {communityMetrics.communityTrust.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active:</span>
              <span className="text-blue-400">{communityMetrics.activeInteractions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mutual Aid:</span>
              <span className="text-purple-400">{communityMetrics.mutualAidCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Disengaged:</span>
              <span className={communityMetrics.disengagementRate <= 20 ? "text-green-400" : communityMetrics.disengagementRate <= 30 ? "text-amber-400" : "text-red-400"}>
                {communityMetrics.disengagementRate.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Interactions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Recent Interactions</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {connections.reduce((total, c) => total + c.interactionHistory.length, 0)}
            </Badge>
          </div>

          <ScrollArea className="h-32">
            <div className="space-y-1 pr-2">
              {connections.flatMap(c => c.interactionHistory.slice(0, 1)).map((interaction) => {
                const connection = connections.find(c => c.id === interaction.connectionId);
                
                return (
                  <div key={interaction.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getConnectionIcon(connection?.type || "neighbor")}
                        <span className="text-sm text-white">{interaction.actionType.replace('_', ' ')}</span>
                        <span className="text-xs text-green-400">+{interaction.trustImpact}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDate(interaction.timestamp)}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-xs text-slate-300">
                      <div className="text-slate-300 truncate">
                        {interaction.description}
                      </div>
                      <div className="text-slate-500 font-mono">
                        ZKP: {interaction.zkpHash}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Community Referrals */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HandHeart className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Community Referrals</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {referrals.length}
            </Badge>
          </div>
          
          <div className="space-y-1">
            {referrals.slice(0, 2).map(referral => (
              <div key={referral.id} className="p-2 rounded-md bg-slate-700/30 border border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{referral.serviceType}</span>
                  <Badge className={`text-xs ${
                    referral.status === "completed" ? "bg-green-600" :
                    referral.status === "accepted" ? "bg-blue-600" :
                    referral.status === "pending" ? "bg-yellow-600" : "bg-red-600"
                  } text-white`}>
                    {referral.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatDate(referral.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disengagement Alert */}
        {disengagementAlert && (
          <div className="p-2 bg-red-900/50 border border-red-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-300">
                Critical: Social disengagement exceeds 30% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}