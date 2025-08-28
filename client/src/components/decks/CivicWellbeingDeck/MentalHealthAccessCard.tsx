import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Clock, Heart, Users, Phone, Calendar, MapPin, Sparkles } from "lucide-react";

interface MentalHealthProvider {
  id: string;
  name: string;
  type: "therapist" | "counselor" | "psychiatrist" | "support_group" | "crisis_center";
  availability: "available" | "waitlist" | "full" | "emergency_only";
  location: string;
  waitTime: number; // in days
  rating: number; // 0-5 stars
  acceptsInsurance: boolean;
  specialties: string[];
  contactMethod: "phone" | "online" | "in_person" | "hybrid";
  zkpVerified: boolean;
}

interface AccessRequest {
  id: string;
  providerId: string;
  requestType: "appointment" | "consultation" | "emergency" | "referral";
  status: "pending" | "approved" | "denied" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  estimatedWait: number;
  zkpHash: string;
}

interface WellbeingMetrics {
  totalProviders: number;
  availableProviders: number;
  averageWaitTime: number;
  accessibilityScore: number;
  emergencyResponse: number;
  zkpVerificationRate: number;
}

const mockProviders: MentalHealthProvider[] = [
  {
    id: "provider_001",
    name: "CivicCare Therapy Center",
    type: "therapist",
    availability: "available",
    location: "Downtown District",
    waitTime: 3,
    rating: 4.8,
    acceptsInsurance: true,
    specialties: ["Anxiety", "Depression", "Trauma"],
    contactMethod: "hybrid",
    zkpVerified: true
  },
  {
    id: "provider_002",
    name: "Community Wellness Hub",
    type: "counselor",
    availability: "waitlist",
    location: "North Community",
    waitTime: 14,
    rating: 4.5,
    acceptsInsurance: true,
    specialties: ["Family Therapy", "Substance Abuse", "Grief"],
    contactMethod: "in_person",
    zkpVerified: true
  },
  {
    id: "provider_003",
    name: "Emergency Mental Health Crisis Line",
    type: "crisis_center",
    availability: "available",
    location: "24/7 Hotline",
    waitTime: 0,
    rating: 4.9,
    acceptsInsurance: false,
    specialties: ["Crisis Intervention", "Suicide Prevention", "Emergency Support"],
    contactMethod: "phone",
    zkpVerified: true
  },
  {
    id: "provider_004",
    name: "Peer Support Network",
    type: "support_group",
    availability: "available",
    location: "Virtual Meeting Space",
    waitTime: 1,
    rating: 4.3,
    acceptsInsurance: false,
    specialties: ["Peer Support", "Group Therapy", "Recovery"],
    contactMethod: "online",
    zkpVerified: false
  },
  {
    id: "provider_005",
    name: "Psychiatric Associates",
    type: "psychiatrist",
    availability: "full",
    location: "Medical Center",
    waitTime: 28,
    rating: 4.7,
    acceptsInsurance: true,
    specialties: ["Medication Management", "Bipolar Disorder", "ADHD"],
    contactMethod: "in_person",
    zkpVerified: true
  }
];

const mockRequests: AccessRequest[] = [
  {
    id: "req_001",
    providerId: "provider_001",
    requestType: "appointment",
    status: "approved",
    priority: "medium",
    timestamp: "2025-07-16T19:30:00Z",
    estimatedWait: 3,
    zkpHash: "0x8f4e...2a1b"
  },
  {
    id: "req_002",
    providerId: "provider_003",
    requestType: "emergency",
    status: "completed",
    priority: "critical",
    timestamp: "2025-07-16T18:45:00Z",
    estimatedWait: 0,
    zkpHash: "0x3c7d...9e2f"
  },
  {
    id: "req_003",
    providerId: "provider_002",
    requestType: "consultation",
    status: "pending",
    priority: "high",
    timestamp: "2025-07-16T20:15:00Z",
    estimatedWait: 14,
    zkpHash: "0x5b8a...4c3d"
  }
];

export default function MentalHealthAccessCard() {
  const [providers, setProviders] = useState<MentalHealthProvider[]>(mockProviders);
  const [requests, setRequests] = useState<AccessRequest[]>(mockRequests);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [requestType, setRequestType] = useState<AccessRequest["requestType"]>("appointment");
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [accessibilityAlert, setAccessibilityAlert] = useState<boolean>(false);
  const [wellbeingMetrics, setWellbeingMetrics] = useState<WellbeingMetrics>({
    totalProviders: 0,
    availableProviders: 0,
    averageWaitTime: 0,
    accessibilityScore: 0,
    emergencyResponse: 0,
    zkpVerificationRate: 0
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
      speak("Mental health access interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate wellbeing metrics
  useEffect(() => {
    const total = providers.length;
    const available = providers.filter(p => p.availability === "available").length;
    const waitTimes = providers.map(p => p.waitTime);
    const avgWait = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
    const zkpVerified = providers.filter(p => p.zkpVerified).length;
    const zkpRate = total > 0 ? (zkpVerified / total) * 100 : 0;
    
    // Calculate accessibility score based on availability, wait times, and emergency response
    const availabilityScore = (available / total) * 40;
    const waitScore = Math.max(0, 30 - (avgWait / 30) * 30);
    const emergencyProviders = providers.filter(p => p.type === "crisis_center" && p.availability === "available").length;
    const emergencyScore = emergencyProviders > 0 ? 30 : 0;
    const accessScore = availabilityScore + waitScore + emergencyScore;

    setWellbeingMetrics({
      totalProviders: total,
      availableProviders: available,
      averageWaitTime: avgWait,
      accessibilityScore: Math.min(100, accessScore),
      emergencyResponse: emergencyProviders,
      zkpVerificationRate: zkpRate
    });
  }, [providers]);

  // Accessibility monitoring (≥20% access threshold)
  useEffect(() => {
    const accessTimer = setInterval(() => {
      const accessibilityThreshold = 20;
      const currentAccess = wellbeingMetrics.accessibilityScore;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 30; // ±15% variance
      const testAccessScore = Math.max(0, Math.min(100, currentAccess + variance));
      
      if (testAccessScore < accessibilityThreshold) {
        setAccessibilityAlert(true);
        setShowPathB(true);
        console.log(`⚠️ Mental health access critical: ${testAccessScore.toFixed(1)}% (below 20% threshold)`);
        setTimeout(() => {
          setAccessibilityAlert(false);
          setShowPathB(false);
        }, 3000);
      }
    }, 16000);

    return () => clearInterval(accessTimer);
  }, [wellbeingMetrics.accessibilityScore]);

  // Generate ZKP hash
  const generateZKPHash = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle access request
  const handleRequestAccess = async () => {
    if (!selectedProvider) return;

    setIsRequesting(true);

    // Simulate request processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    const provider = providers.find(p => p.id === selectedProvider);
    if (!provider) {
      setIsRequesting(false);
      return;
    }

    // Generate request results based on provider availability and type
    const requestSuccess = provider.availability === "available" || 
                          provider.availability === "waitlist" ||
                          requestType === "emergency";
    
    const priority: AccessRequest["priority"] = 
      requestType === "emergency" ? "critical" :
      requestType === "consultation" ? "high" :
      requestType === "referral" ? "medium" : "low";

    const status: AccessRequest["status"] = 
      requestType === "emergency" && provider.type === "crisis_center" ? "approved" :
      provider.availability === "available" ? "approved" :
      provider.availability === "waitlist" ? "pending" :
      "denied";

    const newRequest: AccessRequest = {
      id: `req_${Date.now()}`,
      providerId: selectedProvider,
      requestType: requestType,
      status: status,
      priority: priority,
      timestamp: new Date().toISOString(),
      estimatedWait: provider.waitTime,
      zkpHash: generateZKPHash()
    };

    setRequests(prev => [newRequest, ...prev]);

    const statusMessage = status === "approved" ? "Access request approved" :
                         status === "pending" ? "Access request pending" :
                         "Access request denied";
    
    speak(statusMessage);
    console.log(`✅ Mental health access request: ${newRequest.id}`);
    console.log(`📊 Status: ${status} | Provider: ${provider.name} | Wait: ${provider.waitTime} days`);

    setIsRequesting(false);
    setSelectedProvider("");
  };

  // Get availability color
  const getAvailabilityColor = (availability: MentalHealthProvider["availability"]): string => {
    switch (availability) {
      case "available":
        return "bg-green-500";
      case "waitlist":
        return "bg-yellow-500";
      case "full":
        return "bg-red-500";
      case "emergency_only":
        return "bg-orange-500";
      default:
        return "bg-slate-500";
    }
  };

  // Get status color
  const getStatusColor = (status: AccessRequest["status"]): string => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "denied":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-slate-500";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: AccessRequest["priority"]): string => {
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

  // Get contact method icon
  const getContactIcon = (method: MentalHealthProvider["contactMethod"]) => {
    switch (method) {
      case "phone":
        return <Phone className="h-3 w-3" />;
      case "online":
        return <Users className="h-3 w-3" />;
      case "in_person":
        return <MapPin className="h-3 w-3" />;
      case "hybrid":
        return <Calendar className="h-3 w-3" />;
      default:
        return <Phone className="h-3 w-3" />;
    }
  };

  const canRequest = selectedProvider && !isRequesting;
  const selectedProviderData = providers.find(p => p.id === selectedProvider);
  const availableProviders = providers.filter(p => p.availability === "available" || p.availability === "waitlist");

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-pink-400" />
          Mental Health Access
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users className="h-3 w-3" />
          <span>Available: {wellbeingMetrics.availableProviders}/{wellbeingMetrics.totalProviders}</span>
          <span>•</span>
          <span className={wellbeingMetrics.accessibilityScore >= 70 ? "text-green-400" : wellbeingMetrics.accessibilityScore >= 40 ? "text-amber-400" : "text-red-400"}>
            Access: {wellbeingMetrics.accessibilityScore.toFixed(0)}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Select Mental Health Provider</label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Provider selector">
              <SelectValue placeholder="Choose provider..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {availableProviders.map(provider => (
                <SelectItem key={provider.id} value={provider.id} className="text-white hover:bg-slate-600">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(provider.availability)}`} />
                      <span className="text-sm">{provider.name}</span>
                      {provider.zkpVerified && <Badge variant="secondary" className="text-xs bg-blue-600 text-white">ZKP</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {getContactIcon(provider.contactMethod)}
                      <span>{provider.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{provider.waitTime === 0 ? "Immediate" : `${provider.waitTime}d wait`}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Request Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Request Type</label>
          <Select value={requestType} onValueChange={(value: AccessRequest["requestType"]) => setRequestType(value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Request type selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="appointment" className="text-white hover:bg-slate-600">Regular Appointment</SelectItem>
              <SelectItem value="consultation" className="text-white hover:bg-slate-600">Initial Consultation</SelectItem>
              <SelectItem value="emergency" className="text-white hover:bg-slate-600">Emergency Support</SelectItem>
              <SelectItem value="referral" className="text-white hover:bg-slate-600">Specialist Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Provider Details */}
        {selectedProviderData && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Provider Details</label>
            <div className="p-2 bg-slate-700/50 rounded-md border border-slate-600">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{selectedProviderData.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★{selectedProviderData.rating}</span>
                    {selectedProviderData.zkpVerified && <Badge className="text-xs bg-blue-600 text-white">Verified</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">{selectedProviderData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getContactIcon(selectedProviderData.contactMethod)}
                  <span className="text-slate-400">{selectedProviderData.contactMethod.replace('_', ' ')}</span>
                  <span className="text-slate-500">•</span>
                  <span className={`text-xs ${selectedProviderData.acceptsInsurance ? "text-green-400" : "text-red-400"}`}>
                    {selectedProviderData.acceptsInsurance ? "Insurance" : "No Insurance"}
                  </span>
                </div>
                <div className="text-slate-500">
                  Specialties: {selectedProviderData.specialties.slice(0, 2).join(", ")}
                  {selectedProviderData.specialties.length > 2 && "..."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Access */}
        <div className="space-y-2">
          <Button
            onClick={handleRequestAccess}
            disabled={!canRequest}
            className="w-full h-10 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600"
            aria-label="Request access"
          >
            {isRequesting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing Request...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Request Access
              </>
            )}
          </Button>
          
          {!canRequest && !isRequesting && (
            <div className="text-xs text-amber-400 text-center" role="alert" aria-live="polite">
              Select a provider to request access
            </div>
          )}
        </div>

        <Separator className="bg-slate-600" />

        {/* Wellbeing Metrics */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-300">Community Wellbeing</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Access Score:</span>
              <span className={wellbeingMetrics.accessibilityScore >= 70 ? "text-green-400" : wellbeingMetrics.accessibilityScore >= 40 ? "text-amber-400" : "text-red-400"}>
                {wellbeingMetrics.accessibilityScore.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Avg Wait:</span>
              <span className={wellbeingMetrics.averageWaitTime <= 7 ? "text-green-400" : wellbeingMetrics.averageWaitTime <= 14 ? "text-amber-400" : "text-red-400"}>
                {wellbeingMetrics.averageWaitTime.toFixed(0)}d
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Emergency:</span>
              <span className={wellbeingMetrics.emergencyResponse > 0 ? "text-green-400" : "text-red-400"}>
                {wellbeingMetrics.emergencyResponse > 0 ? "Available" : "Limited"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ZKP Rate:</span>
              <span className="text-blue-400">{wellbeingMetrics.zkpVerificationRate.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Recent Requests</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {requests.length}
            </Badge>
          </div>

          <ScrollArea className="h-32">
            <div className="space-y-1 pr-2">
              {requests.map((request) => {
                const provider = providers.find(p => p.id === request.providerId);
                
                return (
                  <div key={request.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                        <span className="text-sm text-white">{request.requestType.replace('_', ' ')}</span>
                        <Badge className={`text-xs ${getPriorityColor(request.priority)} text-white`}>
                          {request.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDate(request.timestamp)}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>{provider?.name || "Unknown Provider"}</span>
                        <span className="text-slate-500">Status: {request.status}</span>
                      </div>
                      {request.estimatedWait > 0 && (
                        <div className="text-slate-500">
                          Wait: {request.estimatedWait} days
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Accessibility Alert */}
        {accessibilityAlert && (
          <div className="p-2 bg-red-900/50 border border-red-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-300">
                Critical: Mental health access below 20% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}