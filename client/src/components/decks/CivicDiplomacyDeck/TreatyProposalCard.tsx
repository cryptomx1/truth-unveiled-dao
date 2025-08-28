import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Globe, Users, Clock, CheckCircle2, AlertTriangle, Hash, Sparkles, Eye } from "lucide-react";

interface TreatyProposal {
  id: string;
  title: string;
  parties: string[];
  scope: "Local" | "Regional" | "National" | "International";
  terms: string;
  duration: string;
  status: "drafting" | "signed" | "pending" | "stalled";
  zkpHash: string;
  authorDID: string;
  createdAt: string;
  lastModified: string;
  ratificationRequired: boolean;
}

const mockTreaties: TreatyProposal[] = [
  {
    id: "treaty_001",
    title: "Municipal Water Rights Cooperation Agreement",
    parties: ["City Council", "Regional Water Authority"],
    scope: "Local",
    terms: "Establishes shared water distribution protocols and emergency backup systems between municipal entities.",
    duration: "5 years",
    status: "signed",
    zkpHash: "0x7f4a...8e2d",
    authorDID: "did:civic:diplomat_001",
    createdAt: "2025-07-15T14:30:00Z",
    lastModified: "2025-07-16T09:15:00Z",
    ratificationRequired: false
  },
  {
    id: "treaty_002", 
    title: "Cross-Border Educational Exchange Protocol",
    parties: ["State Education Department", "Provincial Education Board"],
    scope: "International",
    terms: "Framework for student and faculty exchanges, curriculum harmonization, and joint research initiatives.",
    duration: "10 years",
    status: "pending",
    zkpHash: "0x9c3b...5f1a",
    authorDID: "did:civic:diplomat_002", 
    createdAt: "2025-07-14T11:20:00Z",
    lastModified: "2025-07-16T16:45:00Z",
    ratificationRequired: true
  },
  {
    id: "treaty_003",
    title: "Regional Climate Action Coordination",
    parties: ["Environmental Agency", "Climate Coalition", "Municipal Alliance"],
    scope: "Regional",
    terms: "Coordinated response framework for climate emergency protocols and resource sharing mechanisms.",
    duration: "indefinite",
    status: "stalled", // 30% stall rate for pushback testing
    zkpHash: "0x4d8e...2c7f",
    authorDID: "did:civic:diplomat_003",
    createdAt: "2025-07-13T16:00:00Z",
    lastModified: "2025-07-15T12:30:00Z",
    ratificationRequired: true
  }
];

const scopeOptions = [
  { value: "Local", label: "Local", icon: "🏛️" },
  { value: "Regional", label: "Regional", icon: "🌐" },
  { value: "National", label: "National", icon: "🏴" },
  { value: "International", label: "International", icon: "🌍" }
];

export default function TreatyProposalCard() {
  const [treaties, setTreaties] = useState<TreatyProposal[]>(mockTreaties);
  const [formData, setFormData] = useState({
    title: "",
    parties: ["", ""],
    scope: "" as TreatyProposal["scope"] | "",
    terms: "",
    duration: ""
  });
  const [currentStatus, setCurrentStatus] = useState<TreatyProposal["status"]>("drafting");
  const [zkpHash, setZkpHash] = useState<string>("");
  const [selectedTreaty, setSelectedTreaty] = useState<string | null>(null);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [didSync, setDidSync] = useState<boolean>(false);
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
      speak("Treaty proposal interface ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Cross-deck DID synchronization (Deck #12)
  useEffect(() => {
    const syncDID = async () => {
      // Simulate DID sync from Deck #12 CivicIdentityDeck
      await new Promise(resolve => setTimeout(resolve, 150));
      setDidSync(true);
    };
    syncDID();
  }, []);

  // Pushback simulation (30% stall/mismatch rate)
  useEffect(() => {
    const pushbackTimer = setInterval(() => {
      const stallRate = Math.random() * 100;
      if (stallRate <= 30) {
        setShowPathB(true);
        console.log(`⚠️ Treaty pushback triggered: ${stallRate.toFixed(1)}% stall rate detected`);
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 8000);

    return () => clearInterval(pushbackTimer);
  }, []);

  // Generate ZKP hash
  const generateZKPHash = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Add party input
  const addParty = () => {
    if (formData.parties.length < 5) {
      setFormData(prev => ({
        ...prev,
        parties: [...prev.parties, ""]
      }));
    }
  };

  // Remove party input
  const removeParty = (index: number) => {
    if (formData.parties.length > 2) {
      setFormData(prev => ({
        ...prev,
        parties: prev.parties.filter((_, i) => i !== index)
      }));
    }
  };

  // Update party value
  const updateParty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      parties: prev.parties.map((party, i) => i === index ? value : party)
    }));
  };

  // Submit treaty
  const handleSubmit = async () => {
    if (!formData.title || !formData.scope || !formData.terms || !formData.duration) {
      return;
    }

    const validParties = formData.parties.filter(party => party.trim() !== "");
    if (validParties.length < 2) {
      return;
    }

    setCurrentStatus("pending");
    
    // Generate ZKP hash
    const newZkpHash = generateZKPHash();
    setZkpHash(newZkpHash);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newTreaty: TreatyProposal = {
      id: `treaty_${String(treaties.length + 1).padStart(3, '0')}`,
      title: formData.title,
      parties: validParties,
      scope: formData.scope as TreatyProposal["scope"],
      terms: formData.terms,
      duration: formData.duration,
      status: "signed",
      zkpHash: newZkpHash,
      authorDID: "did:civic:diplomat_current",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ratificationRequired: formData.scope === "International" || formData.scope === "National"
    };

    setTreaties(prev => [newTreaty, ...prev]);
    setCurrentStatus("signed");
    
    // Reset form
    setFormData({
      title: "",
      parties: ["", ""],
      scope: "",
      terms: "",
      duration: ""
    });

    speak("Treaty drafted");
  };

  // Get status color
  const getStatusColor = (status: TreatyProposal["status"]) => {
    switch (status) {
      case "signed":
        return "bg-green-500";
      case "pending":
        return "bg-blue-500";
      case "stalled":
        return "bg-red-500";
      case "drafting":
      default:
        return "bg-slate-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: TreatyProposal["status"]) => {
    switch (status) {
      case "signed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "stalled":
        return <AlertTriangle className="h-4 w-4" />;
      case "drafting":
      default:
        return <FileText className="h-4 w-4" />;
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
          <Globe className="h-5 w-5 text-blue-400" />
          Treaty Proposal
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Hash className="h-3 w-3" />
          <span>DID Sync: {didSync ? "✓" : "..."}</span>
          {zkpHash && (
            <>
              <span>•</span>
              <span>ZKP: {zkpHash}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Treaty Form */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Treaty Title</label>
            <Input
              placeholder="Enter treaty title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-8"
              maxLength={100}
              aria-label="Treaty title input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Scope</label>
            <Select value={formData.scope} onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value as TreatyProposal["scope"] }))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Treaty scope selector">
                <SelectValue placeholder="Select scope..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {scopeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-600">
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Parties ({formData.parties.filter(p => p.trim()).length}/5)</label>
            {formData.parties.map((party, index) => (
              <div key={index} className="flex gap-1">
                <Input
                  placeholder={`Party ${index + 1}...`}
                  value={party}
                  onChange={(e) => updateParty(index, e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-8"
                  maxLength={50}
                  aria-label={`Party ${index + 1} input`}
                />
                {formData.parties.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeParty(index)}
                    className="h-8 px-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                    aria-label={`Remove party ${index + 1}`}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {formData.parties.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addParty}
                className="h-7 text-xs bg-slate-700 border-slate-600 hover:bg-slate-600"
                aria-label="Add party"
              >
                + Add Party
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Terms & Conditions</label>
            <Textarea
              placeholder="Describe treaty terms and conditions..."
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-16 text-xs resize-none"
              maxLength={500}
              aria-label="Treaty terms textarea"
            />
            <div className="text-xs text-slate-400 text-right">
              {formData.terms.length}/500
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Duration</label>
            <Input
              placeholder="e.g., 5 years, indefinite..."
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-8"
              maxLength={30}
              aria-label="Treaty duration input"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.scope || !formData.terms || !formData.duration || formData.parties.filter(p => p.trim()).length < 2}
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
            aria-label="Submit treaty proposal"
          >
            <FileText className="h-4 w-4 mr-2" />
            Draft Treaty
          </Button>
        </div>

        <Separator className="bg-slate-600" />

        {/* Treaty History */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Recent Treaties</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {treaties.length}
            </Badge>
          </div>

          <ScrollArea className="h-32">
            <div className="space-y-2">
              {treaties.map((treaty) => (
                <div
                  key={treaty.id}
                  className={`p-2 rounded-md border cursor-pointer transition-all ${
                    selectedTreaty === treaty.id
                      ? "bg-slate-700 border-slate-500"
                      : "bg-slate-800 border-slate-600 hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedTreaty(selectedTreaty === treaty.id ? null : treaty.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Treaty: ${treaty.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedTreaty(selectedTreaty === treaty.id ? null : treaty.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(treaty.status)}`} />
                      <span className="text-xs font-medium text-white truncate max-w-[120px]">
                        {treaty.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(treaty.status)}
                      <span className="text-xs text-slate-400">
                        {formatDate(treaty.lastModified)}
                      </span>
                    </div>
                  </div>
                  
                  {selectedTreaty === treaty.id && (
                    <div className="mt-2 pt-2 border-t border-slate-600">
                      <div className="text-xs text-slate-300 space-y-1">
                        <div><strong>Parties:</strong> {treaty.parties.join(", ")}</div>
                        <div><strong>Scope:</strong> {treaty.scope}</div>
                        <div><strong>Duration:</strong> {treaty.duration}</div>
                        <div><strong>ZKP:</strong> {treaty.zkpHash}</div>
                        {treaty.ratificationRequired && (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Eye className="h-3 w-3" />
                            <span>DAO Ratification Required</span>
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

        {/* Pushback Alert */}
        {showPathB && (
          <div className="p-2 bg-amber-900/50 border border-amber-600 rounded-md" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-300">Path B: Treaty processing delays detected</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}