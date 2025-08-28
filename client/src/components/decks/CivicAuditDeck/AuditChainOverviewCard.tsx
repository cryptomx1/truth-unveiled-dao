import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Shield, Clock, Hash, FileText, CheckCircle, AlertCircle } from 'lucide-react';

type AuditStatus = 'verified' | 'pending' | 'failed';

interface AuditEntry {
  id: string;
  proofHash: string;
  sourceDeck: string;
  circuitId: string;
  timestamp: Date;
  status: AuditStatus;
  blockHeight: number;
  gasUsed: number;
}

interface AuditChainOverviewCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock audit chain data from Decks #6-#7 ZKP proofs
const MOCK_AUDIT_CHAIN: AuditEntry[] = [
  {
    id: 'audit_001',
    proofHash: 'zkp_4e91a7b2...c8f3a2',
    sourceDeck: 'Deck #6 ZKPLayer',
    circuitId: 'civic_vote_v2.1',
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    status: 'verified',
    blockHeight: 2847391,
    gasUsed: 42150
  },
  {
    id: 'audit_002',
    proofHash: 'zkp_8c2f914e...b7d5a1',
    sourceDeck: 'Deck #7 SecureAssets',
    circuitId: 'did_verify_v1.3',
    timestamp: new Date(Date.now() - 420000), // 7 minutes ago
    status: 'verified',
    blockHeight: 2847389,
    gasUsed: 38920
  },
  {
    id: 'audit_003',
    proofHash: 'zkp_2a4c683f...e9b2c7',
    sourceDeck: 'Deck #6 ZKPLayer',
    circuitId: 'civic_vote_v2.1',
    timestamp: new Date(Date.now() - 720000), // 12 minutes ago
    status: 'failed',
    blockHeight: 2847387,
    gasUsed: 0
  },
  {
    id: 'audit_004',
    proofHash: 'zkp_7d5b249a...f4e8c3',
    sourceDeck: 'Deck #7 SecureAssets',
    circuitId: 'asset_transfer_v1.0',
    timestamp: new Date(Date.now() - 1080000), // 18 minutes ago
    status: 'verified',
    blockHeight: 2847385,
    gasUsed: 45230
  },
  {
    id: 'audit_005',
    proofHash: 'zkp_9f3e572b...a6d4b8',
    sourceDeck: 'Deck #6 ZKPLayer',
    circuitId: 'civic_vote_v2.1',
    timestamp: new Date(Date.now() - 1380000), // 23 minutes ago
    status: 'verified',
    blockHeight: 2847383,
    gasUsed: 41800
  },
  {
    id: 'audit_006',
    proofHash: 'zkp_1b8c496d...c2f7a9',
    sourceDeck: 'Deck #7 SecureAssets',
    circuitId: 'did_verify_v1.3',
    timestamp: new Date(Date.now() - 1680000), // 28 minutes ago
    status: 'failed',
    blockHeight: 2847381,
    gasUsed: 0
  },
  {
    id: 'audit_007',
    proofHash: 'zkp_6a4f829e...d5b3c1',
    sourceDeck: 'Deck #6 ZKPLayer',
    circuitId: 'privacy_proof_v1.2',
    timestamp: new Date(Date.now() - 1980000), // 33 minutes ago
    status: 'verified',
    blockHeight: 2847379,
    gasUsed: 39450
  },
  {
    id: 'audit_008',
    proofHash: 'zkp_3c7d195a...e8f4b6',
    sourceDeck: 'Deck #7 SecureAssets',
    circuitId: 'asset_transfer_v1.0',
    timestamp: new Date(Date.now() - 2280000), // 38 minutes ago
    status: 'verified',
    blockHeight: 2847377,
    gasUsed: 44120
  },
  {
    id: 'audit_009',
    proofHash: 'zkp_5e2a738f...b9c6d4',
    sourceDeck: 'Deck #6 ZKPLayer',
    circuitId: 'civic_vote_v2.1',
    timestamp: new Date(Date.now() - 2580000), // 43 minutes ago
    status: 'pending',
    blockHeight: 2847375,
    gasUsed: 0
  },
  {
    id: 'audit_010',
    proofHash: 'zkp_8b6f142c...a3e7d5',
    sourceDeck: 'Deck #7 SecureAssets',
    circuitId: 'dispute_resolution_v1.1',
    timestamp: new Date(Date.now() - 2880000), // 48 minutes ago
    status: 'verified',
    blockHeight: 2847373,
    gasUsed: 47350
  }
];

const searchAuditChain = (query: string): AuditEntry | null => {
  if (!query.trim()) return null;
  return MOCK_AUDIT_CHAIN.find(entry => 
    entry.proofHash.includes(query.trim()) ||
    entry.circuitId.includes(query.trim()) ||
    entry.sourceDeck.toLowerCase().includes(query.toLowerCase())
  ) || null;
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
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

const getStatusIcon = (status: AuditStatus) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    case 'failed':
      return <AlertCircle className="w-3 h-3 text-red-400" />;
    case 'pending':
      return <Clock className="w-3 h-3 text-amber-400 animate-pulse" />;
  }
};

const getStatusColor = (status: AuditStatus): string => {
  switch (status) {
    case 'verified':
      return 'text-green-400';
    case 'failed':
      return 'text-red-400';
    case 'pending':
      return 'text-amber-400';
  }
};

export const AuditChainOverviewCard: React.FC<AuditChainOverviewCardProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedEntry, setMatchedEntry] = useState<AuditEntry | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`AuditChainOverviewCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`AuditChainOverviewCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play audit interface activation message on mount
          const utterance = new SpeechSynthesisUtterance("Civic audit interface activated.");
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

  const playHashEchoTTS = (hash: string) => {
    if (!ttsStatus.isReady) return;
    
    const utterance = new SpeechSynthesisUtterance(`Hash match found: ${hash}`);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleSearch = () => {
    const syncStart = performance.now();
    
    const result = searchAuditChain(searchQuery);
    setMatchedEntry(result);
    
    if (result) {
      playHashEchoTTS(result.proofHash);
    }
    
    const syncTime = performance.now() - syncStart;
    if (syncTime > 100) {
      console.warn(`Audit sync time: ${syncTime.toFixed(2)}ms (exceeds 100ms target)`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setMatchedEntry(null);
  };

  const getTotalStats = () => {
    const verified = MOCK_AUDIT_CHAIN.filter(e => e.status === 'verified').length;
    const failed = MOCK_AUDIT_CHAIN.filter(e => e.status === 'failed').length;
    const pending = MOCK_AUDIT_CHAIN.filter(e => e.status === 'pending').length;
    
    return { verified, failed, pending, total: MOCK_AUDIT_CHAIN.length };
  };

  const stats = getTotalStats();

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        'ring-2 ring-blue-500/50 animate-pulse',
        className
      )}
      role="region"
      aria-label="Civic Audit Chain Overview"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            Audit Chain
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            ZKP Layer Active
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Real-time civic proof audit trail visualization
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Search Interface */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">
            Search Audit Trail
          </label>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter proof hash, circuit ID, or deck..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className={cn(
                'flex-1 bg-slate-700/50 border-slate-600 text-slate-100',
                'placeholder:text-slate-400',
                'focus:border-blue-500 focus:ring-blue-500/20',
                'min-h-[48px]'
              )}
              aria-label="Search audit chain entries"
            />
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className={cn(
                'min-h-[48px] px-4',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'disabled:bg-slate-700/50 disabled:text-slate-500'
              )}
              aria-label="Search audit chain"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {matchedEntry && (
            <Button
              onClick={handleClearSearch}
              variant="outline"
              size="sm"
              className="w-full bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/70"
              aria-label="Clear search results"
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* Search Result */}
        {matchedEntry && (
          <div 
            className="bg-slate-800/50 rounded-lg border border-blue-500/50 p-4"
            aria-live="polite"
            aria-label="Search result"
          >
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Match Found</span>
              {getStatusIcon(matchedEntry.status)}
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Proof Hash:</span>
                <span className="font-mono text-green-300">{matchedEntry.proofHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="text-slate-200">{matchedEntry.sourceDeck}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Circuit:</span>
                <span className="text-slate-200">{matchedEntry.circuitId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={getStatusColor(matchedEntry.status)}>
                  {matchedEntry.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Block:</span>
                <span className="text-slate-200">{matchedEntry.blockHeight.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Audit Statistics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Chain Statistics
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{stats.verified}</div>
              <div className="text-slate-400">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{stats.failed}</div>
              <div className="text-slate-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{stats.pending}</div>
              <div className="text-slate-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-200">{stats.total}</div>
              <div className="text-slate-400">Total</div>
            </div>
          </div>
        </div>

        {/* Audit Trail Ledger */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Recent Audit Entries
          </label>
          
          <ScrollArea className="h-64 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="p-3 space-y-3">
              {MOCK_AUDIT_CHAIN.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    'hover:bg-slate-700/30',
                    entry === matchedEntry 
                      ? 'bg-blue-600/20 border-blue-500/50' 
                      : 'bg-slate-800/50 border-slate-700/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.status)}
                      <span className="text-xs font-mono text-slate-300">
                        {entry.proofHash}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 filter blur-sm">
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <span className="text-slate-300">{entry.sourceDeck}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Circuit:</span>
                      <span className="text-slate-300">{entry.circuitId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Block:</span>
                      <span className="text-slate-300">{entry.blockHeight.toLocaleString()}</span>
                    </div>
                    {entry.gasUsed > 0 && (
                      <div className="flex justify-between">
                        <span>Gas:</span>
                        <span className="text-slate-300">{entry.gasUsed.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span className="text-slate-300">{getRelativeTime(entry.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Audit Information */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Audit Trail Info
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div>• All ZKP proofs from Decks #6-#7 are logged immutably</div>
            <div>• Timestamps blurred for privacy while maintaining verifiability</div>
            <div>• Circuit IDs link proofs to specific verification algorithms</div>
            <div>• Block height provides chronological ordering and finality</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Decentralized civic audit chain protocol
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditChainOverviewCard;