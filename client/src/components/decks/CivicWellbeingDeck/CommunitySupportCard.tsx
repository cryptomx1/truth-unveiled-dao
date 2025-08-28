import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HandHeart, Home, Utensils, Car, Zap, Heart, Clock, CheckCircle2, AlertTriangle, Sparkles, Hash, UserCheck } from "lucide-react";

interface SupportRequest {
  id: string;
  category: "housing" | "food" | "utilities" | "transportation" | "mental_health";
  description: string;
  requesterDID: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "request" | "matched" | "delivered" | "resolved";
  agentId?: string;
  agentName?: string;
  submittedAt: string;
  matchedAt?: string;
  deliveredAt?: string;
  resolvedAt?: string;
  zkpHash: string;
  estimatedTime?: string;
}

interface CommunityAgent {
  id: string;
  name: string;
  did: string;
  specialties: SupportRequest["category"][];
  availability: boolean;
  responseTime: number; // hours
  successRate: number; // percentage
  activeRequests: number;
  zkpVerified: boolean;
}

interface SupportMetrics {
  totalRequests: number;
  matchedRequests: number;
  deliveredSupport: number;
  unresolvedRequests: number;
  unmatchedRate: number;
  averageResponseTime: number;
  communityAgents: number;
  satisfactionRate: number;
}

const mockSupportRequests: SupportRequest[] = [
  {
    id: "req_001",
    category: "food",
    description: "Need groceries for family of 4 this week",
    requesterDID: "did:civic:user_food_assistance",
    priority: "high",
    status: "delivered",
    agentId: "agent_001",
    agentName: "Maria Santos",
    submittedAt: "2025-07-16T18:30:00Z",
    matchedAt: "2025-07-16T19:15:00Z",
    deliveredAt: "2025-07-16T21:00:00Z",
    zkpHash: "0x9f2a...7d3e",
    estimatedTime: "2-3 hours"
  },
  {
    id: "req_002",
    category: "transportation",
    description: "Medical appointment ride needed tomorrow",
    requesterDID: "did:civic:user_transport_need",
    priority: "critical",
    status: "matched",
    agentId: "agent_002",
    agentName: "David Kim",
    submittedAt: "2025-07-16T20:00:00Z",
    matchedAt: "2025-07-16T20:30:00Z",
    zkpHash: "0x4c8b...9e1f",
    estimatedTime: "1 hour"
  },
  {
    id: "req_003",
    category: "utilities",
    description: "Assistance with utility bill payment",
    requesterDID: "did:civic:user_utilities_help",
    priority: "medium",
    status: "request",
    submittedAt: "2025-07-16T19:45:00Z",
    zkpHash: "0x7d1e...5a2c"
  },
  {
    id: "req_004",
    category: "mental_health",
    description: "Need counseling referral and support",
    requesterDID: "did:civic:user_mental_support",
    priority: "high",
    status: "resolved",
    agentId: "agent_003",
    agentName: "Dr. Sarah Chen",
    submittedAt: "2025-07-16T16:20:00Z",
    matchedAt: "2025-07-16T17:00:00Z",
    deliveredAt: "2025-07-16T18:30:00Z",
    resolvedAt: "2025-07-16T20:45:00Z",
    zkpHash: "0x3b6f...8c4d",
    estimatedTime: "Same day"
  }
];

const mockCommunityAgents: CommunityAgent[] = [
  {
    id: "agent_001",
    name: "Maria Santos",
    did: "did:civic:agent_maria_s8f3",
    specialties: ["food", "housing"],
    availability: true,
    responseTime: 2.5,
    successRate: 94,
    activeRequests: 2,
    zkpVerified: true
  },
  {
    id: "agent_002",
    name: "David Kim",
    did: "did:civic:agent_david_k2b7",
    specialties: ["transportation", "utilities"],
    availability: true,
    responseTime: 1.8,
    successRate: 87,
    activeRequests: 1,
    zkpVerified: true
  },
  {
    id: "agent_003",
    name: "Dr. Sarah Chen",
    did: "did:civic:agent_sarah_c9e4",
    specialties: ["mental_health"],
    availability: false,
    responseTime: 4.2,
    successRate: 98,
    activeRequests: 3,
    zkpVerified: true
  }
];

export default function CommunitySupportCard() {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>(mockSupportRequests);
  const [communityAgents, setCommunityAgents] = useState<CommunityAgent[]>(mockCommunityAgents);
  const [selectedCategory, setSelectedCategory] = useState<SupportRequest["category"]>("food");
  const [requestDescription, setRequestDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [unmatchedAlert, setUnmatchedAlert] = useState<boolean>(false);
  const [supportMetrics, setSupportMetrics] = useState<SupportMetrics>({
    totalRequests: 0,
    matchedRequests: 0,
    deliveredSupport: 0,
    unresolvedRequests: 0,
    unmatchedRate: 0,
    averageResponseTime: 0,
    communityAgents: 0,
    satisfactionRate: 0
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
      speak("Community support interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate support metrics
  useEffect(() => {
    const total = supportRequests.length;
    const matched = supportRequests.filter(req => req.status !== "request").length;
    const delivered = supportRequests.filter(req => req.status === "delivered" || req.status === "resolved").length;
    const unresolved = supportRequests.filter(req => req.status === "request" || req.status === "matched").length;
    const unmatchedRate = total > 0 ? ((total - matched) / total) * 100 : 0;
    
    const totalResponseTimes = communityAgents.reduce((sum, agent) => sum + agent.responseTime, 0);
    const avgResponseTime = communityAgents.length > 0 ? totalResponseTimes / communityAgents.length : 0;
    
    const totalSatisfaction = communityAgents.reduce((sum, agent) => sum + agent.successRate, 0);
    const avgSatisfaction = communityAgents.length > 0 ? totalSatisfaction / communityAgents.length : 0;

    setSupportMetrics({
      totalRequests: total,
      matchedRequests: matched,
      deliveredSupport: delivered,
      unresolvedRequests: unresolved,
      unmatchedRate: unmatchedRate,
      averageResponseTime: avgResponseTime,
      communityAgents: communityAgents.length,
      satisfactionRate: avgSatisfaction
    });
  }, [supportRequests, communityAgents]);

  // Unmatched support monitoring (≥25% threshold)
  useEffect(() => {
    const unmatchedTimer = setInterval(() => {
      const unmatchedThreshold = 25;
      const currentUnmatchedRate = supportMetrics.unmatchedRate;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 40; // ±20% variance
      const testUnmatchedRate = Math.max(0, Math.min(100, currentUnmatchedRate + variance));
      
      if (testUnmatchedRate >= unmatchedThreshold) {
        setUnmatchedAlert(true);
        setShowPathB(true);
        console.log(`⚠️ Community support unmatched: ${testUnmatchedRate.toFixed(1)}% (exceeds 25% threshold)`);
        setTimeout(() => {
          setUnmatchedAlert(false);
          setShowPathB(false);
        }, 3500);
      }
    }, 22000);

    return () => clearInterval(unmatchedTimer);
  }, [supportMetrics.unmatchedRate]);

  // Generate ZKP hash
  const generateZKPHash = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle support request submission
  const handleSubmitRequest = async () => {
    if (!requestDescription.trim()) return;

    setIsSubmitting(true);

    // Simulate request submission
    await new Promise(resolve => setTimeout(resolve, 2500));

    const priority: SupportRequest["priority"] = 
      selectedCategory === "mental_health" ? "high" :
      selectedCategory === "transportation" ? "critical" :
      selectedCategory === "utilities" ? "medium" : "low";

    const newRequest: SupportRequest = {
      id: `req_${Date.now()}`,
      category: selectedCategory,
      description: requestDescription,
      requesterDID: "did:civic:current_user",
      priority: priority,
      status: "request",
      submittedAt: new Date().toISOString(),
      zkpHash: generateZKPHash()
    };

    setSupportRequests(prev => [newRequest, ...prev]);

    // Simulate automatic matching (70% chance)
    const matchChance = Math.random();
    if (matchChance > 0.3) {
      setTimeout(async () => {
        const availableAgents = communityAgents.filter(agent => 
          agent.availability && agent.specialties.includes(selectedCategory)
        );
        
        if (availableAgents.length > 0) {
          const selectedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
          
          setSupportRequests(prev => prev.map(req => 
            req.id === newRequest.id ? {
              ...req,
              status: "matched",
              agentId: selectedAgent.id,
              agentName: selectedAgent.name,
              matchedAt: new Date().toISOString(),
              estimatedTime: `${Math.floor(selectedAgent.responseTime * 2)}-${Math.ceil(selectedAgent.responseTime * 3)} hours`
            } : req
          ));

          speak("Support request matched");
          console.log(`✅ Support request matched: ${newRequest.id} → ${selectedAgent.name}`);
        }
      }, 3000);
    }

    speak("Support request submitted");
    console.log(`✅ Support request submitted: ${newRequest.id}`);
    console.log(`📊 Category: ${selectedCategory} | Priority: ${priority} | ZKP: ${newRequest.zkpHash}`);

    setIsSubmitting(false);
    setRequestDescription("");
  };

  // Get category icon
  const getCategoryIcon = (category: SupportRequest["category"]) => {
    switch (category) {
      case "housing":
        return <Home className="h-4 w-4" />;
      case "food":
        return <Utensils className="h-4 w-4" />;
      case "utilities":
        return <Zap className="h-4 w-4" />;
      case "transportation":
        return <Car className="h-4 w-4" />;
      case "mental_health":
        return <Heart className="h-4 w-4" />;
      default:
        return <HandHeart className="h-4 w-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: SupportRequest["priority"]): string => {
    switch (priority) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-amber-400";
      case "low":
        return "text-green-400";
      default:
        return "text-slate-400";
    }
  };

  // Get status color
  const getStatusColor = (status: SupportRequest["status"]): string => {
    switch (status) {
      case "resolved":
        return "text-green-400";
      case "delivered":
        return "text-blue-400";
      case "matched":
        return "text-amber-400";
      case "request":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  // Get status badge color
  const getStatusBadge = (status: SupportRequest["status"]): string => {
    switch (status) {
      case "resolved":
        return "bg-green-600";
      case "delivered":
        return "bg-blue-600";
      case "matched":
        return "bg-amber-600";
      case "request":
        return "bg-slate-600";
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

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const canSubmit = requestDescription.trim().length > 0 && !isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HandHeart className="h-5 w-5 text-purple-400" />
          Community Support
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <UserCheck className="h-3 w-3" />
          <span>Matched: {supportMetrics.matchedRequests}/{supportMetrics.totalRequests}</span>
          <span>•</span>
          <span className={supportMetrics.unmatchedRate <= 15 ? "text-green-400" : supportMetrics.unmatchedRate <= 25 ? "text-amber-400" : "text-red-400"}>
            Unmatched: {supportMetrics.unmatchedRate.toFixed(0)}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Support Request Form */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-300">Request Community Support</div>
          
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Support Category</label>
            <Select value={selectedCategory} onValueChange={(value: SupportRequest["category"]) => setSelectedCategory(value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Support category selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="housing" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3" />
                    <span>Housing</span>
                  </div>
                </SelectItem>
                <SelectItem value="food" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-3 w-3" />
                    <span>Food Assistance</span>
                  </div>
                </SelectItem>
                <SelectItem value="utilities" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>Utilities</span>
                  </div>
                </SelectItem>
                <SelectItem value="transportation" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <Car className="h-3 w-3" />
                    <span>Transportation</span>
                  </div>
                </SelectItem>
                <SelectItem value="mental_health" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3" />
                    <span>Mental Health</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Request Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Describe Your Need</label>
            <Textarea
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              placeholder="Please describe what kind of support you need..."
              className="bg-slate-700 border-slate-600 text-white resize-none h-16"
              maxLength={300}
            />
            <div className="text-xs text-slate-400 text-right">
              {requestDescription.length}/300
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitRequest}
            disabled={!canSubmit}
            className="w-full h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600"
            aria-label="Submit support request"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Hash className="h-4 w-4 mr-2" />
                Submit Support Request
              </>
            )}
          </Button>
        </div>

        <Separator className="bg-slate-600" />

        {/* Support Metrics */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300">Community Metrics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Response Time:</span>
              <span className="text-blue-400">{supportMetrics.averageResponseTime.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Agents:</span>
              <span className="text-green-400">{supportMetrics.communityAgents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className="text-purple-400">{supportMetrics.satisfactionRate.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Delivered:</span>
              <span className="text-blue-400">{supportMetrics.deliveredSupport}</span>
            </div>
          </div>
        </div>

        {/* Recent Support Requests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Recent Requests</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {supportRequests.length}
            </Badge>
          </div>

          <ScrollArea className="h-40">
            <div className="space-y-2 pr-2">
              {supportRequests.map((request) => (
                <div key={request.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(request.category)}
                      <span className="text-sm text-white capitalize">
                        {request.category.replace('_', ' ')}
                      </span>
                      <Badge className={`text-xs ${getStatusBadge(request.status)} text-white`}>
                        {request.status}
                      </Badge>
                    </div>
                    <span className={`text-xs ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-xs text-slate-300">
                    <div className="truncate">
                      {request.description}
                    </div>
                    
                    {request.agentName && (
                      <div className="flex items-center gap-2 mt-1">
                        <UserCheck className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Agent: {request.agentName}</span>
                        {request.estimatedTime && (
                          <span className="text-slate-400">• ETA: {request.estimatedTime}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-500 font-mono">
                        ZKP: {request.zkpHash}
                      </span>
                      <span className="text-slate-400">
                        {formatDate(request.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Community Agents */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Available Agents</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {communityAgents.filter(agent => agent.availability).length}/{communityAgents.length}
            </Badge>
          </div>
          
          <div className="space-y-1">
            {communityAgents.slice(0, 2).map(agent => (
              <div key={agent.id} className="p-2 rounded-md bg-slate-700/30 border border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">{agent.name}</span>
                    {agent.zkpVerified && <Badge className="text-xs bg-blue-600 text-white">ZKP</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${agent.availability ? "text-green-400" : "text-red-400"}`}>
                      {agent.availability ? "Available" : "Busy"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {agent.successRate}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Specialties: {agent.specialties.map(s => s.replace('_', ' ')).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unmatched Alert */}
        {unmatchedAlert && (
          <div className="p-2 bg-red-900/50 border border-red-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-300">
                Critical: Support unmatched rate exceeds 25% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}