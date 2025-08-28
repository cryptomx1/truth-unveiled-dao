import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FileText, Check, X, Clock, Hash } from 'lucide-react';

type AuditEventType = 'generated' | 'verified';
type AuditStatus = 'success' | 'failure';

interface AuditEntry {
  id: string;
  type: AuditEventType;
  circuitId: string;
  status: AuditStatus;
  hash: string;
  timestamp: Date;
  relativeTime: string;
}

interface ZKAuditTrailCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'audit_001',
    type: 'generated',
    circuitId: 'civic_vote_v2.1',
    status: 'success',
    hash: 'zkp_4e91a7b2...c8f3a2',
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    relativeTime: '3m ago'
  },
  {
    id: 'audit_002',
    type: 'verified',
    circuitId: 'did_verify_v1.3',
    status: 'success',
    hash: 'zkp_8c2f914e...b7d5a1',
    timestamp: new Date(Date.now() - 420000), // 7 minutes ago
    relativeTime: '7m ago'
  },
  {
    id: 'audit_003',
    type: 'generated',
    circuitId: 'did_verify_v1.3',
    status: 'failure',
    hash: 'zkp_2a4c683f...e9b2c7',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    relativeTime: '15m ago'
  },
  {
    id: 'audit_004',
    type: 'verified',
    circuitId: 'civic_vote_v2.1',
    status: 'success',
    hash: 'zkp_7d5b249a...f4e8c3',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    relativeTime: '30m ago'
  },
  {
    id: 'audit_005',
    type: 'generated',
    circuitId: 'civic_vote_v2.1',
    status: 'success',
    hash: 'zkp_9f3e572b...a6d4b8',
    timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
    relativeTime: '45m ago'
  },
  {
    id: 'audit_006',
    type: 'verified',
    circuitId: 'did_verify_v1.3',
    status: 'failure',
    hash: 'zkp_1b8c496d...c2f7a9',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    relativeTime: '1h ago'
  },
  {
    id: 'audit_007',
    type: 'generated',
    circuitId: 'civic_vote_v2.1',
    status: 'success',
    hash: 'zkp_6a4f829e...d5b3c1',
    timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
    relativeTime: '1h ago'
  },
  {
    id: 'audit_008',
    type: 'verified',
    circuitId: 'did_verify_v1.3',
    status: 'success',
    hash: 'zkp_3c7d195a...e8f4b6',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    relativeTime: '2h ago'
  },
  {
    id: 'audit_009',
    type: 'generated',
    circuitId: 'civic_vote_v2.1',
    status: 'success',
    hash: 'zkp_5e2a738f...b9c6d4',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    relativeTime: '3h ago'
  },
  {
    id: 'audit_010',
    type: 'verified',
    circuitId: 'did_verify_v1.3',
    status: 'success',
    hash: 'zkp_8b6f142c...a3e7d5',
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    relativeTime: '4h ago'
  }
];

const getEventLabel = (type: AuditEventType): string => {
  return type === 'generated' ? 'Proof Generated' : 'Proof Verified';
};

const getStatusIcon = (status: AuditStatus) => {
  return status === 'success' 
    ? <Check className="w-4 h-4 text-green-400" />
    : <X className="w-4 h-4 text-red-400" />;
};

const getStatusBorderClass = (status: AuditStatus): string => {
  return status === 'success' 
    ? 'border-l-4 border-green-500' 
    : 'border-l-4 border-red-500';
};

export const ZKAuditTrailCard: React.FC<ZKAuditTrailCardProps> = ({ className }) => {
  const [auditEntries] = useState<AuditEntry[]>(MOCK_AUDIT_ENTRIES);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`ZKAuditTrailCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`ZKAuditTrailCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play audit trail ready message on mount
          const utterance = new SpeechSynthesisUtterance("ZK audit trail interface ready.");
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

  // Simulate new audit entry (for future functionality)
  const simulateNewEntry = () => {
    if (!ttsStatus.isReady) return;
    
    const utterance = new SpeechSynthesisUtterance("ZK audit trail updated.");
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Zero-Knowledge Proof Audit Trail"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            ZK Audit Trail
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Comprehensive log of zero-knowledge proof operations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Audit Statistics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">
                Recent Activity
              </span>
            </div>
            <span className="text-xs text-slate-400">{auditEntries.length} entries</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {auditEntries.filter(e => e.status === 'success').length}
              </div>
              <div className="text-xs text-slate-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {auditEntries.filter(e => e.status === 'failure').length}
              </div>
              <div className="text-xs text-slate-400">Failed</div>
            </div>
          </div>
        </div>

        {/* Audit Log Entries */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50">
          <ScrollArea className="h-80 p-4">
            <div 
              className="space-y-3" 
              aria-live="polite" 
              aria-label="Audit trail entries"
            >
              {auditEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'bg-slate-700/30 rounded-lg p-3',
                    'hover:bg-slate-600/30 transition-colors',
                    getStatusBorderClass(entry.status)
                  )}
                  tabIndex={0}
                  role="button"
                  aria-label={`${getEventLabel(entry.type)} for ${entry.circuitId} at ${entry.relativeTime}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Future: Show detailed view
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(entry.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-200">
                            {getEventLabel(entry.type)}
                          </span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            entry.status === 'success' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          )}>
                            {entry.status}
                          </span>
                        </div>
                        
                        <div className="text-xs text-slate-400 mb-2">
                          Circuit: {entry.circuitId}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{entry.hash}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-slate-400">
                        {entry.relativeTime}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Trail Summary */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Audit Summary
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• All ZK operations are permanently logged</div>
            <div>• Cryptographic integrity maintained across sessions</div>
            <div>• Proof hashes provide non-repudiation guarantees</div>
            <div>• Timeline accuracy verified against block timestamps</div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="text-xs text-slate-500">
              Log expansion available in Deck #7 for advanced analytics
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Immutable cryptographic audit system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default ZKAuditTrailCard;
