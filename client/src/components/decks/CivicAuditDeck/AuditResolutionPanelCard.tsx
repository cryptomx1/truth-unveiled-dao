import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Gavel, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  ArrowUp,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

type AnomalyType = 'timestamp_gap' | 'gas_spike' | 'hash_collision' | 'circuit_failure' | 'block_orphan';
type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
type ResolutionStatus = 'pending' | 'resolved' | 'escalated' | 'rejected';

interface AnomalyCase {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  affectedEntries: string[];
  detectedAt: Date;
  riskScore: number;
  status: ResolutionStatus;
  resolvedAt?: Date;
  operatorDID?: string;
  resolutionNotes?: string;
}

interface AuditResolutionPanelCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock anomaly cases from LedgerAnomalyScannerCard data
const MOCK_ANOMALY_CASES: AnomalyCase[] = [
  {
    id: 'anom_001',
    type: 'gas_spike',
    severity: 'high',
    description: 'Unusual gas consumption spike detected in asset transfer circuit',
    affectedEntries: ['zkp_7d5b249a...f4e8c3', 'zkp_3c7d195a...e8f4b6'],
    detectedAt: new Date(Date.now() - 300000), // 5 minutes ago
    riskScore: 78,
    status: 'pending'
  },
  {
    id: 'anom_002',
    type: 'circuit_failure',
    severity: 'critical',
    description: 'Zero-knowledge proof verification circuit returned inconsistent results',
    affectedEntries: ['zkp_1b8c496d...c2f7a9'],
    detectedAt: new Date(Date.now() - 900000), // 15 minutes ago
    riskScore: 92,
    status: 'pending'
  },
  {
    id: 'anom_003',
    type: 'timestamp_gap',
    severity: 'medium',
    description: 'Irregular timestamp intervals between consecutive audit entries',
    affectedEntries: ['zkp_2a4c683f...e9b2c7', 'zkp_9f3e572b...a6d4b8'],
    detectedAt: new Date(Date.now() - 600000), // 10 minutes ago
    riskScore: 45,
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 120000), // 2 minutes ago
    operatorDID: 'did:civic:resolver_alpha_001',
    resolutionNotes: 'Confirmed as network latency issue during peak hours. No security impact.'
  },
  {
    id: 'anom_004',
    type: 'block_orphan',
    severity: 'medium',
    description: 'Audit entry references orphaned block in chain reorganization',
    affectedEntries: ['zkp_5e2a738f...b9c6d4'],
    detectedAt: new Date(Date.now() - 1800000), // 30 minutes ago
    riskScore: 56,
    status: 'escalated',
    resolvedAt: new Date(Date.now() - 300000), // 5 minutes ago
    operatorDID: 'did:civic:resolver_beta_002',
    resolutionNotes: 'Escalated to blockchain core team for chain analysis and potential rollback.'
  }
];

const getAnomalyIcon = (type: AnomalyType) => {
  switch (type) {
    case 'gas_spike':
      return <TrendingUp className="w-4 h-4 text-orange-400" />;
    case 'timestamp_gap':
      return <Clock className="w-4 h-4 text-blue-400" />;
    case 'hash_collision':
      return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'circuit_failure':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'block_orphan':
      return <Activity className="w-4 h-4 text-purple-400" />;
  }
};

const getSeverityColor = (severity: AnomalySeverity): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-400';
    case 'high':
      return 'text-orange-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-green-400';
  }
};

const getStatusColor = (status: ResolutionStatus): string => {
  switch (status) {
    case 'resolved':
      return 'text-green-400';
    case 'escalated':
      return 'text-amber-400';
    case 'rejected':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
};

const getStatusIcon = (status: ResolutionStatus) => {
  switch (status) {
    case 'resolved':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'escalated':
      return <ArrowUp className="w-4 h-4 text-amber-400" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400 animate-pulse" />;
  }
};

const formatAnomalyType = (type: AnomalyType): string => {
  return type.replace('_', ' ').toUpperCase();
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
};

const generateOperatorDID = (): string => {
  const operators = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  const randomOperator = operators[Math.floor(Math.random() * operators.length)];
  const randomId = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `did:civic:resolver_${randomOperator}_${randomId}`;
};

export const AuditResolutionPanelCard: React.FC<AuditResolutionPanelCardProps> = ({ className }) => {
  const [selectedCase, setSelectedCase] = useState<AnomalyCase | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [cases, setCases] = useState<AnomalyCase[]>(MOCK_ANOMALY_CASES);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`AuditResolutionPanelCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`AuditResolutionPanelCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play resolution panel initialization message on mount
          const utterance = new SpeechSynthesisUtterance("Audit resolution panel initialized.");
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  const playResolutionTTS = (status: ResolutionStatus) => {
    if (!ttsStatus.isReady) return;
    
    let message = '';
    switch (status) {
      case 'resolved':
        message = 'Anomaly resolved successfully.';
        break;
      case 'escalated':
        message = 'Anomaly escalated to higher authority.';
        break;
      case 'rejected':
        message = 'Anomaly resolution rejected.';
        break;
    }
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleResolution = (status: ResolutionStatus) => {
    if (!selectedCase) return;
    
    const interactionStart = performance.now();
    
    const updatedCase: AnomalyCase = {
      ...selectedCase,
      status: status,
      resolvedAt: new Date(),
      operatorDID: generateOperatorDID(),
      resolutionNotes: resolutionNotes || `Case ${status} by automated resolution system.`
    };
    
    setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);
    
    playResolutionTTS(status);
    
    const interactionTime = performance.now() - interactionStart;
    if (interactionTime > 50) {
      console.warn(`Resolution interaction time: ${interactionTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleReset = () => {
    if (!selectedCase) return;
    
    const resetCase: AnomalyCase = {
      ...selectedCase,
      status: 'pending',
      resolvedAt: undefined,
      operatorDID: undefined,
      resolutionNotes: undefined
    };
    
    setCases(prev => prev.map(c => c.id === selectedCase.id ? resetCase : c));
    setSelectedCase(resetCase);
    setResolutionNotes('');
  };

  const pendingCases = cases.filter(c => c.status === 'pending');
  const resolvedCases = cases.filter(c => c.status !== 'pending');

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        'ring-2 ring-amber-500/50 animate-pulse',
        className
      )}
      role="region"
      aria-label="Audit Resolution Panel"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-400" />
            Resolution Panel
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Anomaly case resolution and escalation management
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Case Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Pending Cases ({pendingCases.length})
          </label>
          
          <ScrollArea className="h-32 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="p-3 space-y-2">
              {pendingCases.map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => {
                    setSelectedCase(caseItem);
                    setResolutionNotes('');
                  }}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-colors',
                    'hover:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                    'min-h-[48px]',
                    selectedCase?.id === caseItem.id
                      ? 'bg-amber-600/20 border-amber-500/50'
                      : 'bg-slate-800/50 border-slate-700/50'
                  )}
                  aria-label={`Select case ${caseItem.id}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getAnomalyIcon(caseItem.type)}
                    <span className="text-xs font-medium text-slate-200">
                      {formatAnomalyType(caseItem.type)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs ml-auto', getSeverityColor(caseItem.severity))}
                    >
                      {caseItem.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {caseItem.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Risk: {caseItem.riskScore}/100 • {getRelativeTime(caseItem.detectedAt)}
                  </div>
                </button>
              ))}
              
              {pendingCases.length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <div className="text-sm">No pending cases</div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Case Details */}
        {selectedCase && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">
                  Case Details
                </span>
                {getStatusIcon(selectedCase.status)}
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Case ID:</span>
                  <span className="text-slate-200 font-mono">{selectedCase.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-slate-200">{formatAnomalyType(selectedCase.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity:</span>
                  <span className={getSeverityColor(selectedCase.severity)}>
                    {selectedCase.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="text-slate-200">{selectedCase.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Affected Entries:</span>
                  <span className="text-slate-200">{selectedCase.affectedEntries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Detected:</span>
                  <span className="text-slate-200">{getRelativeTime(selectedCase.detectedAt)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Description:</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {selectedCase.description}
                </div>
              </div>
            </div>

            {/* Resolution Notes */}
            {selectedCase.status === 'pending' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Resolution Notes
                </label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter resolution details and analysis..."
                  className={cn(
                    'bg-slate-700/50 border-slate-600 text-slate-100',
                    'placeholder:text-slate-400 resize-none',
                    'focus:border-amber-500 focus:ring-amber-500/20',
                    'min-h-[80px]'
                  )}
                  aria-label="Enter resolution notes"
                />
              </div>
            )}

            {/* Resolution Actions */}
            {selectedCase.status === 'pending' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleResolution('resolved')}
                    className={cn(
                      'min-h-[48px] text-xs font-medium',
                      'bg-green-600 hover:bg-green-700 text-white'
                    )}
                    aria-label="Resolve case"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                  
                  <Button
                    onClick={() => handleResolution('escalated')}
                    className={cn(
                      'min-h-[48px] text-xs font-medium',
                      'bg-amber-600 hover:bg-amber-700 text-white'
                    )}
                    aria-label="Escalate case"
                  >
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Escalate
                  </Button>
                  
                  <Button
                    onClick={() => handleResolution('rejected')}
                    className={cn(
                      'min-h-[48px] text-xs font-medium',
                      'bg-red-600 hover:bg-red-700 text-white'
                    )}
                    aria-label="Reject case"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Resolution Result */}
            {selectedCase.status !== 'pending' && (
              <div 
                className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4"
                aria-live="polite"
                aria-label="Resolution result"
              >
                <div className="flex items-center gap-2 mb-3">
                  {getStatusIcon(selectedCase.status)}
                  <span className={cn('text-sm font-medium', getStatusColor(selectedCase.status))}>
                    Case {selectedCase.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolved By:</span>
                    <span className="text-slate-200 font-mono">{selectedCase.operatorDID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolved At:</span>
                    <span className="text-slate-200">
                      {selectedCase.resolvedAt ? getRelativeTime(selectedCase.resolvedAt) : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {selectedCase.resolutionNotes && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Resolution Notes:</div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {selectedCase.resolutionNotes}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="w-full bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/70"
                    aria-label="Reset case to pending status"
                  >
                    Reset to Pending
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resolution Summary */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">
              Resolution Summary
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-200">{pendingCases.length}</div>
              <div className="text-slate-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {resolvedCases.filter(c => c.status === 'resolved').length}
              </div>
              <div className="text-slate-400">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">
                {resolvedCases.filter(c => c.status === 'escalated').length}
              </div>
              <div className="text-slate-400">Escalated</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {resolvedCases.filter(c => c.status === 'rejected').length}
              </div>
              <div className="text-slate-400">Rejected</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Civic audit anomaly resolution system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default AuditResolutionPanelCard;
