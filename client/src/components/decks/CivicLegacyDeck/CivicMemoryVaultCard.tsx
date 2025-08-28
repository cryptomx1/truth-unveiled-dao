import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Archive, FileText, Mic, Image, Quote, Clock, CheckCircle2, AlertTriangle, Sparkles, Hash, BookOpen, Shield, Users } from "lucide-react";

interface CivicContribution {
  id: string;
  title: string;
  contributor: string;
  contributorDID: string;
  civicRole: "citizen" | "delegate" | "council_member" | "mayor" | "governor";
  region: string;
  contentType: "text" | "audio" | "image" | "citation";
  content: string;
  filterType: "legislation" | "public_speech" | "event" | "story";
  timestamp: string;
  contributionDate: string;
  lifecycle: "saved" | "verified" | "indexed" | "archived";
  zkpHash: string;
  verificationCount: number;
  isVerifiable: boolean;
}

interface VaultMetrics {
  totalContributions: number;
  verifiedContributions: number;
  indexedContributions: number;
  archivedContributions: number;
  unverifiableRate: number;
  contributorCount: number;
  averageVerificationTime: number;
}

const mockCivicContributions: CivicContribution[] = [
  {
    id: "contrib_001",
    title: "Community Housing Initiative",
    contributor: "Maria Rodriguez",
    contributorDID: "did:civic:maria_housing_advocate",
    civicRole: "delegate",
    region: "District 7",
    contentType: "text",
    content: "Proposed community-led housing development with 200 affordable units, green spaces, and community center integration...",
    filterType: "legislation",
    timestamp: "2025-07-17T00:45:00Z",
    contributionDate: "2025-07-16",
    lifecycle: "archived",
    zkpHash: "0x8f4a...2d1e",
    verificationCount: 12,
    isVerifiable: true
  },
  {
    id: "contrib_002",
    title: "Town Hall Address on Climate Action",
    contributor: "Dr. James Chen",
    contributorDID: "did:civic:dr_chen_climate",
    civicRole: "mayor",
    region: "Riverside",
    contentType: "audio",
    content: "[Audio Recording] 45-minute address on municipal climate resilience strategies and carbon neutrality goals...",
    filterType: "public_speech",
    timestamp: "2025-07-17T00:30:00Z",
    contributionDate: "2025-07-15",
    lifecycle: "indexed",
    zkpHash: "0x3b7c...8e4f",
    verificationCount: 8,
    isVerifiable: true
  },
  {
    id: "contrib_003",
    title: "Voter Registration Drive Documentation",
    contributor: "Sarah Williams",
    contributorDID: "did:civic:sarah_voter_outreach",
    civicRole: "citizen",
    region: "East Ward",
    contentType: "image",
    content: "[Photo Documentation] Images from community voter registration event with 300+ new registrations...",
    filterType: "event",
    timestamp: "2025-07-17T00:15:00Z",
    contributionDate: "2025-07-14",
    lifecycle: "verified",
    zkpHash: "0x9d2f...5a3c",
    verificationCount: 5,
    isVerifiable: true
  },
  {
    id: "contrib_004",
    title: "Founding Charter Reference",
    contributor: "Prof. Robert Johnson",
    contributorDID: "did:civic:prof_johnson_historian",
    civicRole: "council_member",
    region: "Historic District",
    contentType: "citation",
    content: "[Historical Citation] Reference to Article 7, Section 3 of the founding municipal charter regarding citizen participation...",
    filterType: "legislation",
    timestamp: "2025-07-17T00:00:00Z",
    contributionDate: "2025-07-13",
    lifecycle: "archived",
    zkpHash: "0x6e8b...7f1d",
    verificationCount: 15,
    isVerifiable: true
  },
  {
    id: "contrib_005",
    title: "Personal Democracy Story",
    contributor: "Elena Vasquez",
    contributorDID: "did:civic:elena_first_vote",
    civicRole: "citizen",
    region: "South Valley",
    contentType: "text",
    content: "My grandmother's story of voting for the first time after becoming a citizen, and how it inspired three generations...",
    filterType: "story",
    timestamp: "2025-07-16T23:45:00Z",
    contributionDate: "2025-07-12",
    lifecycle: "saved",
    zkpHash: "0x1c5d...9a8e",
    verificationCount: 0,
    isVerifiable: false
  }
];

export default function CivicMemoryVaultCard() {
  const [contributions, setContributions] = useState<CivicContribution[]>(mockCivicContributions);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [newContribution, setNewContribution] = useState({
    title: "",
    content: "",
    contentType: "text" as CivicContribution["contentType"],
    filterType: "story" as CivicContribution["filterType"]
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [unverifiableAlert, setUnverifiableAlert] = useState<boolean>(false);
  const [vaultMetrics, setVaultMetrics] = useState<VaultMetrics>({
    totalContributions: 0,
    verifiedContributions: 0,
    indexedContributions: 0,
    archivedContributions: 0,
    unverifiableRate: 0,
    contributorCount: 0,
    averageVerificationTime: 0
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
      speak("Vault interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate vault metrics
  useEffect(() => {
    const total = contributions.length;
    const verified = contributions.filter(c => c.lifecycle === "verified" || c.lifecycle === "indexed" || c.lifecycle === "archived").length;
    const indexed = contributions.filter(c => c.lifecycle === "indexed" || c.lifecycle === "archived").length;
    const archived = contributions.filter(c => c.lifecycle === "archived").length;
    const unverifiable = contributions.filter(c => !c.isVerifiable).length;
    const unverifiableRate = total > 0 ? (unverifiable / total) * 100 : 0;
    
    const uniqueContributors = new Set(contributions.map(c => c.contributorDID)).size;
    const totalVerificationTime = contributions.reduce((sum, c) => sum + c.verificationCount, 0);
    const avgVerificationTime = verified > 0 ? totalVerificationTime / verified : 0;

    setVaultMetrics({
      totalContributions: total,
      verifiedContributions: verified,
      indexedContributions: indexed,
      archivedContributions: archived,
      unverifiableRate: unverifiableRate,
      contributorCount: uniqueContributors,
      averageVerificationTime: avgVerificationTime
    });
  }, [contributions]);

  // Unverifiable entries monitoring (>20% threshold)
  useEffect(() => {
    const unverifiableTimer = setInterval(() => {
      const unverifiableThreshold = 20;
      const currentUnverifiableRate = vaultMetrics.unverifiableRate;
      
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 30; // ±15% variance
      const testUnverifiableRate = Math.max(0, Math.min(100, currentUnverifiableRate + variance));
      
      if (testUnverifiableRate > unverifiableThreshold) {
        setUnverifiableAlert(true);
        setShowPathB(true);
        console.log(`⚠️ Civic memory unverifiable: ${testUnverifiableRate.toFixed(1)}% (exceeds 20% threshold)`);
        setTimeout(() => {
          setUnverifiableAlert(false);
          setShowPathB(false);
        }, 3500);
      }
    }, 25000);

    return () => clearInterval(unverifiableTimer);
  }, [vaultMetrics.unverifiableRate]);

  // Generate ZKP hash with DID verification chain
  const generateZKPHash = (contributorDID: string): string => {
    const timestamp = Date.now();
    const didHash = contributorDID.slice(-8);
    const lifecycleHash = Math.random().toString(16).substr(2, 4);
    return `0x${didHash}${lifecycleHash}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle contribution submission
  const handleSubmitContribution = async () => {
    if (!newContribution.title.trim() || !newContribution.content.trim()) return;

    setIsSubmitting(true);

    // Simulate contribution processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    const contributorDID = "did:civic:current_contributor";
    const newContrib: CivicContribution = {
      id: `contrib_${Date.now()}`,
      title: newContribution.title,
      contributor: "Current User",
      contributorDID: contributorDID,
      civicRole: "citizen",
      region: "Local District",
      contentType: newContribution.contentType,
      content: newContribution.content,
      filterType: newContribution.filterType,
      timestamp: new Date().toISOString(),
      contributionDate: new Date().toISOString().split('T')[0],
      lifecycle: "saved",
      zkpHash: generateZKPHash(contributorDID),
      verificationCount: 0,
      isVerifiable: true
    };

    setContributions(prev => [newContrib, ...prev]);

    // Simulate automatic lifecycle progression (70% chance)
    const progressChance = Math.random();
    if (progressChance > 0.3) {
      setTimeout(() => {
        setContributions(prev => prev.map(c => 
          c.id === newContrib.id ? {
            ...c,
            lifecycle: "verified",
            verificationCount: Math.floor(Math.random() * 5) + 1
          } : c
        ));
        speak("Contribution verified");
        console.log(`✅ Contribution verified: ${newContrib.id}`);
      }, 3000);

      // Further progression to indexed (50% chance)
      if (Math.random() > 0.5) {
        setTimeout(() => {
          setContributions(prev => prev.map(c => 
            c.id === newContrib.id ? {
              ...c,
              lifecycle: "indexed",
              verificationCount: Math.floor(Math.random() * 10) + 5
            } : c
          ));
          console.log(`📚 Contribution indexed: ${newContrib.id}`);
        }, 6000);
      }
    }

    speak("Contribution saved to vault");
    console.log(`💾 Civic memory saved: ${newContrib.id} | Type: ${newContrib.filterType} | ZKP: ${newContrib.zkpHash}`);

    setIsSubmitting(false);
    setNewContribution({
      title: "",
      content: "",
      contentType: "text",
      filterType: "story"
    });
  };

  // Get content type icon
  const getContentTypeIcon = (contentType: CivicContribution["contentType"]) => {
    switch (contentType) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      case "citation":
        return <Quote className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get civic role color
  const getCivicRoleColor = (role: CivicContribution["civicRole"]): string => {
    switch (role) {
      case "governor":
        return "text-purple-400";
      case "mayor":
        return "text-blue-400";
      case "council_member":
        return "text-green-400";
      case "delegate":
        return "text-amber-400";
      case "citizen":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  // Get lifecycle color
  const getLifecycleColor = (lifecycle: CivicContribution["lifecycle"]): string => {
    switch (lifecycle) {
      case "archived":
        return "text-purple-400";
      case "indexed":
        return "text-blue-400";
      case "verified":
        return "text-green-400";
      case "saved":
        return "text-amber-400";
      default:
        return "text-slate-400";
    }
  };

  // Get lifecycle badge color
  const getLifecycleBadge = (lifecycle: CivicContribution["lifecycle"]): string => {
    switch (lifecycle) {
      case "archived":
        return "bg-purple-600";
      case "indexed":
        return "bg-blue-600";
      case "verified":
        return "bg-green-600";
      case "saved":
        return "bg-amber-600";
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

  // Filter contributions
  const filteredContributions = selectedFilter === "all" 
    ? contributions 
    : contributions.filter(c => c.filterType === selectedFilter);

  const canSubmit = newContribution.title.trim().length > 0 && newContribution.content.trim().length > 0 && !isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Archive className="h-5 w-5 text-blue-400" />
          Civic Memory Vault
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Shield className="h-3 w-3" />
          <span>Verified: {vaultMetrics.verifiedContributions}/{vaultMetrics.totalContributions}</span>
          <span>•</span>
          <span className={vaultMetrics.unverifiableRate <= 10 ? "text-green-400" : vaultMetrics.unverifiableRate <= 20 ? "text-amber-400" : "text-red-400"}>
            Unverifiable: {vaultMetrics.unverifiableRate.toFixed(0)}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contribution Form */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-300">Add Civic Memory</div>
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Title</label>
            <Input
              value={newContribution.title}
              onChange={(e) => setNewContribution(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief title for your contribution..."
              className="bg-slate-700 border-slate-600 text-white h-8"
              maxLength={100}
            />
            <div className="text-xs text-slate-400 text-right">
              {newContribution.title.length}/100
            </div>
          </div>

          {/* Content Type Selection */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-300">Content Type</label>
              <Select value={newContribution.contentType} onValueChange={(value: CivicContribution["contentType"]) => setNewContribution(prev => ({ ...prev, contentType: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Content type selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="text" className="text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>Text</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audio" className="text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <Mic className="h-3 w-3" />
                      <span>Audio</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="image" className="text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <Image className="h-3 w-3" />
                      <span>Image</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="citation" className="text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <Quote className="h-3 w-3" />
                      <span>Citation</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <Select value={newContribution.filterType} onValueChange={(value: CivicContribution["filterType"]) => setNewContribution(prev => ({ ...prev, filterType: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Filter type selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="legislation" className="text-white hover:bg-slate-600">Legislation</SelectItem>
                  <SelectItem value="public_speech" className="text-white hover:bg-slate-600">Public Speech</SelectItem>
                  <SelectItem value="event" className="text-white hover:bg-slate-600">Event</SelectItem>
                  <SelectItem value="story" className="text-white hover:bg-slate-600">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Content</label>
            <Textarea
              value={newContribution.content}
              onChange={(e) => setNewContribution(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Describe your civic contribution or memory..."
              className="bg-slate-700 border-slate-600 text-white resize-none h-16"
              maxLength={500}
            />
            <div className="text-xs text-slate-400 text-right">
              {newContribution.content.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitContribution}
            disabled={!canSubmit}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
            aria-label="Save to civic memory vault"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving to Vault...
              </>
            ) : (
              <>
                <Hash className="h-4 w-4 mr-2" />
                Save to Vault
              </>
            )}
          </Button>
        </div>

        <Separator className="bg-slate-600" />

        {/* Vault Metrics */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300">Vault Statistics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contributors:</span>
              <span className="text-green-400">{vaultMetrics.contributorCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Archived:</span>
              <span className="text-purple-400">{vaultMetrics.archivedContributions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Indexed:</span>
              <span className="text-blue-400">{vaultMetrics.indexedContributions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Avg Verify:</span>
              <span className="text-amber-400">{vaultMetrics.averageVerificationTime.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Filter Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Browse Archive</span>
          </div>
          
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Archive filter selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-white hover:bg-slate-600">All Categories</SelectItem>
              <SelectItem value="legislation" className="text-white hover:bg-slate-600">Legislation</SelectItem>
              <SelectItem value="public_speech" className="text-white hover:bg-slate-600">Public Speech</SelectItem>
              <SelectItem value="event" className="text-white hover:bg-slate-600">Events</SelectItem>
              <SelectItem value="story" className="text-white hover:bg-slate-600">Stories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contributions Archive */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Recent Contributions</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {filteredContributions.length}
            </Badge>
          </div>

          <ScrollArea className="h-40">
            <div className="space-y-2 pr-2">
              {filteredContributions.map((contribution) => (
                <div key={contribution.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(contribution.contentType)}
                      <span className="text-sm text-white font-medium truncate max-w-[120px]">
                        {contribution.title}
                      </span>
                      <Badge className={`text-xs ${getLifecycleBadge(contribution.lifecycle)} text-white`}>
                        {contribution.lifecycle}
                      </Badge>
                    </div>
                    {contribution.isVerifiable && (
                      <Shield className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                  
                  <div className="mt-1 text-xs text-slate-300">
                    <div className="truncate">
                      {contribution.content}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-3 w-3 text-blue-400" />
                      <span className={getCivicRoleColor(contribution.civicRole)}>
                        {contribution.contributor}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{contribution.region}</span>
                      {contribution.verificationCount > 0 && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-green-400">Verified {contribution.verificationCount}x</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-500 font-mono text-xs">
                        ZKP: {contribution.zkpHash}
                      </span>
                      <span className="text-slate-400">
                        {formatDate(contribution.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Unverifiable Alert */}
        {unverifiableAlert && (
          <div className="p-2 bg-red-900/50 border border-red-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-300">
                Critical: Unverifiable entries exceed 20% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}