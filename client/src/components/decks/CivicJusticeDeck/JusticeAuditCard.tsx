import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Shield,
  Hash,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive,
  FileText,
  Gavel,
  Upload,
  Database,
  User,
  Calendar,
  Zap,
  Search
} from 'lucide-react';

type AuditEventType = 'submitted' | 'reviewed' | 'ruled' | 'archived';
type AuditStatus = 'verified' | 'failed' | 'pending';

interface JusticeAuditEvent {
  id: string;
  moduleId: string;
  moduleName: string;
  eventType: AuditEventType;
  timestamp: Date;
  zkpHash: string;
  didHash: string;
  credentialHash: string;
  metadataHash: string;
  rulingReason?: string;
  outcome?: 'approved' | 'denied';
  status: AuditStatus;
  encryptedDetails: string;
  arbitratorDID?: string;
}

interface JusticeAuditCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock audit events from all CivicJusticeDeck modules
const MOCK_AUDIT_EVENTS: JusticeAuditEvent[] = [
  {
    id: 'audit_001',
    moduleId: 'evidence_001',
    moduleName: 'Evidence Submission',
    eventType: 'submitted',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    zkpHash: 'zkp_evidence_a1b2c3d4',
    didHash: 'did:civic:submitter_001',
    credentialHash: 'cred_civic_k3l4m5n6',
    metadataHash: 'meta_hash_x7y8z9w0',
    status: 'verified',
    encryptedDetails: 'Witness statement PDF submitted with digital signature verification',
  },
  {
    id: 'audit_002',
    moduleId: 'evidence_001',
    moduleName: 'Evidence Submission',
    eventType: 'reviewed',
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    zkpHash: 'zkp_evidence_a1b2c3d4',
    didHash: 'did:civic:reviewer_001',
    credentialHash: 'cred_civic_reviewer_x1',
    metadataHash: 'meta_hash_review_y2',
    status: 'verified',
    encryptedDetails: 'Evidence authenticity verified, metadata integrity confirmed',
  },
  {
    id: 'audit_003',
    moduleId: 'arbitration_001',
    moduleName: 'Arbitration Decision',
    eventType: 'reviewed',
    timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    zkpHash: 'zkp_arbitration_e5f6g7h8',
    didHash: 'did:civic:arbitrator_001',
    credentialHash: 'cred_civic_arbitrator_z3',
    metadataHash: 'meta_hash_arbitration_w4',
    status: 'verified',
    encryptedDetails: 'Case under arbitration review, bias monitoring active',
    arbitratorDID: 'did:civic:arbitrator_001',
  },
  {
    id: 'audit_004',
    moduleId: 'arbitration_001',
    moduleName: 'Arbitration Decision',
    eventType: 'ruled',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    zkpHash: 'zkp_arbitration_e5f6g7h8',
    didHash: 'did:civic:arbitrator_001',
    credentialHash: 'cred_civic_arbitrator_z3',
    metadataHash: 'meta_hash_ruling_v5',
    rulingReason: 'Plaintiff awarded damages based on verified evidence and testimony',
    outcome: 'approved',
    status: 'verified',
    encryptedDetails: 'Final ruling issued with ZKP validation and bias check passed',
    arbitratorDID: 'did:civic:arbitrator_001',
  },
  {
    id: 'audit_005',
    moduleId: 'evidence_002',
    moduleName: 'Evidence Submission',
    eventType: 'submitted',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    zkpHash: 'zkp_evidence_i9j0k1l2',
    didHash: 'did:civic:submitter_002',
    credentialHash: 'cred_civic_m3n4o5p6',
    metadataHash: 'meta_hash_corrupt_z9',
    status: 'failed', // Simulate ZKP mismatch
    encryptedDetails: 'Security footage submission failed metadata verification',
  },
  {
    id: 'audit_006',
    moduleId: 'arbitration_001',
    moduleName: 'Arbitration Decision',
    eventType: 'archived',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    zkpHash: 'zkp_arbitration_e5f6g7h8',
    didHash: 'did:civic:arbitrator_001',
    credentialHash: 'cred_civic_arbitrator_z3',
    metadataHash: 'meta_hash_archive_u6',
    status: 'verified',
    encryptedDetails: 'Ruling archived with encrypted verdict and audit trail complete',
    arbitratorDID: 'did:civic:arbitrator_001',
  },
  {
    id: 'audit_007',
    moduleId: 'evidence_003',
    moduleName: 'Evidence Submission',
    eventType: 'submitted',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    zkpHash: 'zkp_evidence_corrupted_x1',
    didHash: 'did:civic:submitter_003',
    credentialHash: 'cred_civic_invalid_y2',
    metadataHash: 'meta_hash_failed_z3',
    status: 'failed', // Another ZKP mismatch
    encryptedDetails: 'Audio recording submission failed ZKP validation',
  },
  {
    id: 'audit_008',
    moduleId: 'arbitration_002',
    moduleName: 'Arbitration Decision',
    eventType: 'reviewed',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    zkpHash: 'zkp_arbitration_pending_a1',
    didHash: 'did:civic:arbitrator_002',
    credentialHash: 'cred_civic_arbitrator_b2',
    metadataHash: 'meta_hash_pending_c3',
    status: 'pending',
    encryptedDetails: 'New case under review, awaiting final arbitration decision',
    arbitratorDID: 'did:civic:arbitrator_002',
  }
];

// Get event type info
const getEventTypeInfo = (eventType: AuditEventType) => {
  switch (eventType) {
    case 'submitted':
      return {
        icon: <Upload className="w-4 h-4" />,
        label: 'Submitted',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20'
      };
    case 'reviewed':
      return {
        icon: <Eye className="w-4 h-4" />,
        label: 'Reviewed',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      };
    case 'ruled':
      return {
        icon: <Gavel className="w-4 h-4" />,
        label: 'Ruled',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20'
      };
    case 'archived':
      return {
        icon: <Archive className="w-4 h-4" />,
        label: 'Archived',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20'
      };
  }
};

// Get status info
const getStatusInfo = (status: AuditStatus) => {
  switch (status) {
    case 'verified':
      return {
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Verified',
        color: 'text-green-400'
      };
    case 'failed':
      return {
        icon: <XCircle className="w-3 h-3" />,
        label: 'Failed',
        color: 'text-red-400'
      };
    case 'pending':
      return {
        icon: <Clock className="w-3 h-3" />,
        label: 'Pending',
        color: 'text-amber-400'
      };
  }
};

// Calculate ZKP mismatch rate
const calculateZKPMismatchRate = (events: JusticeAuditEvent[]): number => {
  if (events.length === 0) return 0;
  const failedEvents = events.filter(event => event.status === 'failed').length;
  return (failedEvents / events.length) * 100;
};

// Format timestamp
const formatTimestamp = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const JusticeAuditCard: React.FC<JusticeAuditCardProps> = ({ className }) => {
  const [auditEvents, setAuditEvents] = useState<JusticeAuditEvent[]>(MOCK_AUDIT_EVENTS);
  const [expandedEvents, setExpandedEvents] = useState<{ [key: string]: boolean }>({});
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [zkpMismatchDetected, setZkpMismatchDetected] = useState<boolean>(false);
  const [zkpMismatchRate, setZkpMismatchRate] = useState<number>(0);
  const [auditComplete, setAuditComplete] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`JusticeAuditCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`JusticeAuditCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      console.log(`🔊 TTS throttled: "${message}" (${now - ttsStatus.lastTrigger}ms since last)`);
      return;
    }
    
    if (!ttsStatus.isReady) {
      console.log(`🔊 TTS not ready: "${message}"`);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          lastTrigger: now 
        }));
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS completed: "${message}"`);
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS error: "${message}"`);
        };
        
        window.speechSynthesis.speak(utterance);
        console.log(`🔊 TTS started: "${message}"`);
      }, 40); // <40ms latency requirement
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Initialize TTS on mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          // Mount TTS message
          setTimeout(() => {
            speakMessage("Justice audit panel activated", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Monitor ZKP mismatch rate for pushback trigger (≥20% threshold)
  useEffect(() => {
    const mismatchRate = calculateZKPMismatchRate(auditEvents);
    setZkpMismatchRate(mismatchRate);
    
    if (mismatchRate >= 20) {
      setZkpMismatchDetected(true);
      console.log(`⚠️ Justice audit ZKP mismatch: ${mismatchRate.toFixed(1)}% (exceeds 20% threshold)`);
    } else {
      setZkpMismatchDetected(false);
    }
  }, [auditEvents]);

  // Simulate audit completion check
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuditComplete(true);
      speakMessage("Audit trail complete");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const verifiedEvents = auditEvents.filter(event => event.status === 'verified').length;
  const failedEvents = auditEvents.filter(event => event.status === 'failed').length;
  const pendingEvents = auditEvents.filter(event => event.status === 'pending').length;
  const totalEvents = auditEvents.length;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        zkpMismatchDetected && 'animate-pulse ring-2 ring-red-500/50',
        className
      )}
      role="region"
      aria-label="Justice Audit Trail Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          zkpMismatchDetected ? 'bg-red-500 animate-pulse' :
          auditComplete ? 'bg-green-500' :
          'bg-blue-500 animate-pulse'
        )}
        aria-label={
          zkpMismatchDetected ? "Status: ZKP Mismatch Alert" :
          auditComplete ? "Status: Audit Complete" :
          "Status: Audit In Progress"
        }
        title={
          zkpMismatchDetected ? `${zkpMismatchRate.toFixed(1)}% ZKP mismatch detected` :
          auditComplete ? "Audit trail complete" :
          "Audit in progress"
        }
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Justice Audit Trail
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            zkpMismatchDetected ? 'border-red-500/30 bg-red-500/10 text-red-400' :
            auditComplete ? 'border-green-500/30 bg-green-500/10 text-green-400' :
            'border-blue-500/30 bg-blue-500/10 text-blue-400'
          )}>
            <div className="flex items-center gap-1">
              {zkpMismatchDetected ? <AlertTriangle className="w-3 h-3" /> :
               auditComplete ? <CheckCircle className="w-3 h-3" /> :
               <Clock className="w-3 h-3" />}
              {zkpMismatchDetected ? 'ZKP Alert' :
               auditComplete ? 'Complete' : 'Active'}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Comprehensive audit trail with ZKP verification and cross-deck integrity
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ZKP Mismatch Alert */}
        {zkpMismatchDetected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                ZKP Integrity Alert
              </span>
            </div>
            <div className="text-xs text-red-300">
              {zkpMismatchRate.toFixed(1)}% ZKP hash mismatch rate exceeds 20% threshold
            </div>
          </div>
        )}

        {/* Audit Statistics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Audit Overview
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center mb-3">
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-200">{totalEvents}</div>
              <div className="text-xs text-slate-400">Total Events</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-400">{verifiedEvents}</div>
              <div className="text-xs text-slate-400">Verified</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-sm font-medium text-red-400">{failedEvents}</div>
              <div className="text-xs text-slate-400">Failed</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-amber-400">{pendingEvents}</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Integrity Rate:</span>
              <span className={cn(
                'font-medium',
                zkpMismatchDetected ? 'text-red-400' : 'text-green-400'
              )}>
                {totalEvents > 0 ? ((verifiedEvents / totalEvents) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Audit Timeline
            </span>
          </div>
          
          <ScrollArea className="h-[280px] w-full">
            <div className="space-y-3 pr-4">
              {auditEvents
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((event) => {
                  const eventTypeInfo = getEventTypeInfo(event.eventType);
                  const statusInfo = getStatusInfo(event.status);
                  const isExpanded = expandedEvents[event.id];
                  
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'bg-slate-800/30 rounded-lg border p-3',
                        event.status === 'verified' ? 'border-slate-700/50' :
                        event.status === 'failed' ? 'border-red-500/30' :
                        'border-amber-500/30'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'p-1 rounded',
                            eventTypeInfo.bgColor,
                            eventTypeInfo.color
                          )}>
                            {eventTypeInfo.icon}
                          </div>
                          <div className="text-sm font-medium text-slate-200">
                            {event.moduleName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'flex items-center gap-1',
                            statusInfo.color
                          )}>
                            {statusInfo.icon}
                            <span className="text-xs">{statusInfo.label}</span>
                          </div>
                          <Button
                            onClick={() => toggleEventExpansion(event.id)}
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-400 hover:bg-slate-700 p-1 h-6 w-6"
                          >
                            {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-slate-400">
                          {eventTypeInfo.label} • {formatTimeAgo(event.timestamp)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-300 mb-2">
                        {event.encryptedDetails}
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 pt-2 border-t border-slate-700/50 space-y-2">
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Module ID:</span>
                              <span className="text-slate-400 font-mono">{event.moduleId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">ZKP Hash:</span>
                              <span className="text-blue-400 font-mono">{event.zkpHash}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">DID Hash:</span>
                              <span className="text-purple-400 font-mono">{event.didHash}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Credential:</span>
                              <span className="text-cyan-400 font-mono">{event.credentialHash}</span>
                            </div>
                            {event.outcome && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Outcome:</span>
                                <span className={cn(
                                  event.outcome === 'approved' ? 'text-green-400' : 'text-red-400'
                                )}>
                                  {event.outcome.charAt(0).toUpperCase() + event.outcome.slice(1)}
                                </span>
                              </div>
                            )}
                            {event.arbitratorDID && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Arbitrator:</span>
                                <span className="text-amber-400 font-mono">{event.arbitratorDID}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.rulingReason && (
                            <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-300">
                              <span className="text-slate-500">Ruling Reason: </span>
                              {event.rulingReason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </div>

        {/* Cross-Deck Validation */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Integrity
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">DID Sync (Deck #12):</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Credential Sync (Deck #13):</span>
              <span className="text-blue-400">Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evidence Module:</span>
              <span className="text-purple-400">Linked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Arbitration Module:</span>
              <span className="text-cyan-400">Linked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ZKP Integrity:</span>
              <span className={zkpMismatchDetected ? 'text-red-400' : 'text-green-400'}>
                {zkpMismatchDetected ? 'Compromised' : 'Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Justice audit panel activated,
          Total audit events: {totalEvents},
          Verified events: {verifiedEvents},
          Failed events: {failedEvents},
          Pending events: {pendingEvents},
          Integrity rate: {totalEvents > 0 ? ((verifiedEvents / totalEvents) * 100).toFixed(1) : 0}%,
          {zkpMismatchDetected && `Alert: ${zkpMismatchRate.toFixed(1)}% ZKP mismatch detected`},
          {auditComplete && "Audit trail complete"}
        </div>
      </CardContent>
    </Card>
  );
};
export default JusticeAuditCard;
