import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Clock, Hash, Shield, Sparkles, FileText, User, Calendar } from "lucide-react";

interface AuditRecord {
  id: string;
  outcomeId: string;
  auditType: "compliance" | "verification" | "impact_assessment" | "data_integrity";
  status: "open" | "in_progress" | "audited" | "archived" | "failed";
  confidence: number;
  auditResult: "pass" | "fail" | "partial" | "pending";
  assignedAuditor: string;
  startDate: string;
  completionDate?: string;
  zkpChain: string;
  auditNotes: string;
  category: string;
}

interface AuditTask {
  id: string;
  auditId: string;
  taskName: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedTo: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  completedAt?: string;
}

interface AuditSummary {
  totalAudits: number;
  passedAudits: number;
  failedAudits: number;
  partialAudits: number;
  pendingAudits: number;
  unverifiedRate: number;
}

const mockAudits: AuditRecord[] = [
  {
    id: "audit_001",
    outcomeId: "outcome_001",
    auditType: "compliance",
    status: "audited",
    confidence: 92.1,
    auditResult: "pass",
    assignedAuditor: "did:civic:auditor_alpha",
    startDate: "2025-07-16T18:00:00Z",
    completionDate: "2025-07-16T20:30:00Z",
    zkpChain: "0x8c4d...3f7a→0x2e9d...8b1c→0x7f3a...9d2e→0xa1b2...c3d4",
    auditNotes: "EPA carbon monitoring compliance verified",
    category: "Environment"
  },
  {
    id: "audit_002",
    outcomeId: "outcome_002",
    auditType: "verification",
    status: "audited",
    confidence: 76.3,
    auditResult: "partial",
    assignedAuditor: "did:civic:auditor_beta",
    startDate: "2025-07-16T17:30:00Z",
    completionDate: "2025-07-16T19:45:00Z",
    zkpChain: "0x5f2a...9b8c→0x1d4e...7c3f→0x9b2a...5e1d→0xe5f6...a7b8",
    auditNotes: "Housing registry discrepancies noted",
    category: "Housing"
  },
  {
    id: "audit_003",
    outcomeId: "outcome_003",
    auditType: "impact_assessment",
    status: "failed",
    confidence: 23.7,
    auditResult: "fail",
    assignedAuditor: "did:civic:auditor_gamma",
    startDate: "2025-07-16T16:00:00Z",
    completionDate: "2025-07-16T18:15:00Z",
    zkpChain: "0x2e9d...4a1f→0x8c3b...1f9e→0x4a7d...6c2b→FAILED",
    auditNotes: "Healthcare coverage data integrity compromised",
    category: "Health"
  },
  {
    id: "audit_004",
    outcomeId: "outcome_004",
    auditType: "data_integrity",
    status: "in_progress",
    confidence: 0,
    auditResult: "pending",
    assignedAuditor: "did:civic:auditor_delta",
    startDate: "2025-07-16T20:00:00Z",
    zkpChain: "0x6e1f...8d4a→PENDING→PENDING→PENDING",
    auditNotes: "USDA food access data validation in progress",
    category: "Food Security"
  },
  {
    id: "audit_005",
    outcomeId: "outcome_005",
    auditType: "compliance",
    status: "open",
    confidence: 0,
    auditResult: "pending",
    assignedAuditor: "",
    startDate: "2025-07-16T21:00:00Z",
    zkpChain: "PENDING→PENDING→PENDING→PENDING",
    auditNotes: "Awaiting auditor assignment",
    category: "Education"
  }
];

const mockTasks: AuditTask[] = [
  {
    id: "task_001",
    auditId: "audit_001",
    taskName: "EPA Compliance Review",
    description: "Verify carbon monitoring compliance with EPA standards",
    status: "completed",
    assignedTo: "did:civic:specialist_env",
    priority: "high",
    dueDate: "2025-07-16T20:00:00Z",
    completedAt: "2025-07-16T20:25:00Z"
  },
  {
    id: "task_002",
    auditId: "audit_002",
    taskName: "Registry Cross-Reference",
    description: "Cross-reference housing data with municipal records",
    status: "completed",
    assignedTo: "did:civic:specialist_housing",
    priority: "medium",
    dueDate: "2025-07-16T19:30:00Z",
    completedAt: "2025-07-16T19:40:00Z"
  },
  {
    id: "task_003",
    auditId: "audit_003",
    taskName: "Data Integrity Check",
    description: "Validate healthcare coverage data sources",
    status: "failed",
    assignedTo: "did:civic:specialist_health",
    priority: "critical",
    dueDate: "2025-07-16T18:00:00Z",
    completedAt: "2025-07-16T18:10:00Z"
  },
  {
    id: "task_004",
    auditId: "audit_004",
    taskName: "USDA Data Validation",
    description: "Validate food access survey methodology",
    status: "in_progress",
    assignedTo: "did:civic:specialist_food",
    priority: "high",
    dueDate: "2025-07-16T22:00:00Z"
  },
  {
    id: "task_005",
    auditId: "audit_005",
    taskName: "Auditor Assignment",
    description: "Assign qualified auditor for education audit",
    status: "pending",
    assignedTo: "did:civic:audit_coordinator",
    priority: "medium",
    dueDate: "2025-07-16T21:30:00Z"
  }
];

export default function SustainabilityAuditCard() {
  const [audits, setAudits] = useState<AuditRecord[]>(mockAudits);
  const [tasks, setTasks] = useState<AuditTask[]>(mockTasks);
  const [selectedAudit, setSelectedAudit] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [showPathB, setShowPathB] = useState<boolean>(false);
  const [unverifiedRate, setUnverifiedRate] = useState<number>(0);
  const [auditSummary, setAuditSummary] = useState<AuditSummary>({
    totalAudits: 0,
    passedAudits: 0,
    failedAudits: 0,
    partialAudits: 0,
    pendingAudits: 0,
    unverifiedRate: 0
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
      speak("Sustainability audit panel ready");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate audit summary
  useEffect(() => {
    const total = audits.length;
    const passed = audits.filter(a => a.auditResult === "pass").length;
    const failed = audits.filter(a => a.auditResult === "fail").length;
    const partial = audits.filter(a => a.auditResult === "partial").length;
    const pending = audits.filter(a => a.auditResult === "pending").length;
    const unverified = audits.filter(a => a.status === "failed" || a.auditResult === "fail").length;
    const unverifiedPercentage = total > 0 ? (unverified / total) * 100 : 0;

    setAuditSummary({
      totalAudits: total,
      passedAudits: passed,
      failedAudits: failed,
      partialAudits: partial,
      pendingAudits: pending,
      unverifiedRate: unverifiedPercentage
    });

    setUnverifiedRate(unverifiedPercentage);
  }, [audits]);

  // Unverified rate monitoring (≥25% threshold)
  useEffect(() => {
    const auditTimer = setInterval(() => {
      // Add random variance for testing
      const variance = (Math.random() - 0.5) * 40; // ±20% variance
      const testUnverifiedRate = Math.max(0, Math.min(100, unverifiedRate + variance));
      
      if (testUnverifiedRate >= 25) {
        setShowPathB(true);
        console.log(`⚠️ Sustainability audit failure: ${testUnverifiedRate.toFixed(1)}% (exceeds 25% threshold)`);
        setTimeout(() => setShowPathB(false), 3000);
      }
    }, 14000);

    return () => clearInterval(auditTimer);
  }, [unverifiedRate]);

  // Generate ZKP hash
  const generateZKPHash = (): string => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substr(2, 8);
    return `0x${randomHex}...${timestamp.toString(16).substr(-4)}`;
  };

  // Handle audit execution
  const handleExecuteAudit = async () => {
    if (!selectedAudit) return;

    setIsAuditing(true);

    // Simulate audit processing
    await new Promise(resolve => setTimeout(resolve, 3500));

    const audit = audits.find(a => a.id === selectedAudit);
    if (!audit) {
      setIsAuditing(false);
      return;
    }

    // Generate audit results
    const auditSuccess = Math.random() > 0.25; // 75% success rate
    const newConfidence = auditSuccess 
      ? Math.max(70, Math.min(100, 80 + (Math.random() * 20)))
      : Math.max(0, Math.min(40, 20 + (Math.random() * 20)));

    const newResult: AuditRecord["auditResult"] = 
      newConfidence >= 85 ? "pass" :
      newConfidence >= 60 ? "partial" :
      newConfidence >= 30 ? "fail" : "fail";

    const newStatus: AuditRecord["status"] = 
      auditSuccess ? "audited" : "failed";

    const updatedAudit: AuditRecord = {
      ...audit,
      status: newStatus,
      confidence: newConfidence,
      auditResult: newResult,
      assignedAuditor: audit.assignedAuditor || "did:civic:current_auditor",
      completionDate: new Date().toISOString(),
      zkpChain: audit.zkpChain.includes("PENDING") 
        ? audit.zkpChain.replace("PENDING", generateZKPHash())
        : `${audit.zkpChain}→${generateZKPHash()}`,
      auditNotes: auditSuccess 
        ? `${audit.category} audit completed successfully`
        : `${audit.category} audit failed validation`
    };

    setAudits(prev => prev.map(a => a.id === selectedAudit ? updatedAudit : a));

    // Update corresponding task
    setTasks(prev => prev.map(task => 
      task.auditId === selectedAudit 
        ? { ...task, status: auditSuccess ? "completed" : "failed", completedAt: new Date().toISOString() }
        : task
    ));

    const statusMessage = newResult === "pass" ? "Audit complete" :
                         newResult === "partial" ? "Audit partially complete" :
                         "Audit failed";
    
    speak(statusMessage);
    console.log(`✅ Sustainability audit completed: ${updatedAudit.id}`);
    console.log(`📊 Result: ${newResult} | Confidence: ${newConfidence.toFixed(1)}%`);

    setIsAuditing(false);
    setSelectedAudit("");
  };

  // Get status color
  const getStatusColor = (status: AuditRecord["status"]): string => {
    switch (status) {
      case "audited":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      case "archived":
        return "bg-slate-500";
      case "open":
        return "bg-amber-500";
      default:
        return "bg-slate-500";
    }
  };

  // Get result icon
  const getResultIcon = (result: AuditRecord["auditResult"]) => {
    switch (result) {
      case "pass":
        return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      case "partial":
        return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
      case "fail":
        return <AlertTriangle className="h-3 w-3 text-red-400" />;
      case "pending":
        return <Clock className="h-3 w-3 text-slate-400" />;
      default:
        return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  // Get result badge color
  const getResultBadgeColor = (result: AuditRecord["auditResult"]): string => {
    switch (result) {
      case "pass":
        return "bg-green-600";
      case "partial":
        return "bg-yellow-600";
      case "fail":
        return "bg-red-600";
      case "pending":
        return "bg-slate-600";
      default:
        return "bg-slate-600";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: AuditTask["priority"]): string => {
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

  const canAudit = selectedAudit && !isAuditing;
  const selectedAuditData = audits.find(a => a.id === selectedAudit);
  const auditablAudits = audits.filter(a => a.status === "open" || a.status === "in_progress");

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-emerald-400" />
          Sustainability Audit
          {showPathB && (
            <div className="ml-auto animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText className="h-3 w-3" />
          <span>Total: {auditSummary.totalAudits}</span>
          <span>•</span>
          <span className="text-green-400">Pass: {auditSummary.passedAudits}</span>
          <span>•</span>
          <span className={unverifiedRate >= 25 ? "text-red-400" : unverifiedRate >= 15 ? "text-amber-400" : "text-green-400"}>
            Failed: {auditSummary.failedAudits} ({unverifiedRate.toFixed(1)}%)
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Audit Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Select Audit to Execute</label>
          <Select value={selectedAudit} onValueChange={setSelectedAudit}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8" aria-label="Audit selector">
              <SelectValue placeholder="Choose audit to execute..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {auditablAudits.map(audit => (
                <SelectItem key={audit.id} value={audit.id} className="text-white hover:bg-slate-600">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {getResultIcon(audit.auditResult)}
                      <span className="text-sm">{audit.auditType.replace('_', ' ')}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                        {audit.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      Status: {audit.status} | Outcome: {audit.outcomeId}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ZKP Chain Display */}
        {selectedAuditData && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">ZKP Audit Chain</label>
            <div className="p-2 bg-slate-700/50 rounded-md border border-slate-600">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-emerald-400" />
                  <span className="text-slate-300">Allocation → Evaluation → Outcome → Audit</span>
                </div>
                <div className="font-mono text-slate-400 break-all">
                  {selectedAuditData.zkpChain}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Audit Confidence:</span>
                  <Badge className={`text-xs ${
                    selectedAuditData.confidence >= 80 ? "bg-green-600" :
                    selectedAuditData.confidence >= 60 ? "bg-yellow-600" : "bg-red-600"
                  } text-white`}>
                    {selectedAuditData.confidence.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Execution */}
        <div className="space-y-2">
          <Button
            onClick={handleExecuteAudit}
            disabled={!canAudit}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600"
            aria-label="Execute audit"
          >
            {isAuditing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Executing Audit...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Execute Audit
              </>
            )}
          </Button>
          
          {!canAudit && !isAuditing && (
            <div className="text-xs text-amber-400 text-center" role="alert" aria-live="polite">
              Select an open or in-progress audit to execute
            </div>
          )}
        </div>

        <Separator className="bg-slate-600" />

        {/* Audit History */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Audit Timeline</span>
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {audits.length}
            </Badge>
          </div>

          <ScrollArea className="h-40">
            <div className="space-y-1 pr-2">
              {audits.map((audit) => {
                const relatedTask = tasks.find(t => t.auditId === audit.id);
                
                return (
                  <div key={audit.id} className="p-2 rounded-md bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(audit.status)}`} />
                        {getResultIcon(audit.auditResult)}
                        <span className="text-sm text-white">{audit.auditType.replace('_', ' ')}</span>
                        <Badge className={`text-xs ${getResultBadgeColor(audit.auditResult)} text-white`}>
                          {audit.auditResult}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDate(audit.startDate)}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Category: {audit.category}</span>
                        <span>Confidence: {audit.confidence.toFixed(0)}%</span>
                      </div>
                      <div className="text-slate-500 truncate">
                        {audit.auditNotes}
                      </div>
                    </div>

                    {relatedTask && (
                      <div className="mt-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Task: {relatedTask.taskName}</span>
                          <Badge className={`text-xs ${getPriorityColor(relatedTask.priority)} text-white`}>
                            {relatedTask.priority}
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

        {/* Audit Summary */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-300">Audit Summary</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pass Rate:</span>
              <span className="text-green-400">
                {auditSummary.totalAudits > 0 ? ((auditSummary.passedAudits / auditSummary.totalAudits) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pending:</span>
              <span className="text-amber-400">{auditSummary.pendingAudits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Partial:</span>
              <span className="text-yellow-400">{auditSummary.partialAudits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Failed:</span>
              <span className="text-red-400">{auditSummary.failedAudits}</span>
            </div>
          </div>
        </div>

        {/* Pushback Alert */}
        {showPathB && (
          <div className="p-2 bg-amber-900/50 border border-amber-600 rounded-md animate-pulse" role="alert" aria-live="polite">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-300">
                Path B: Audit failure {unverifiedRate.toFixed(1)}% exceeds 25% threshold
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}