import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  History,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  Shield,
  User,
  Clock,
  Zap,
  Eye,
  Star,
  IdCard,
  Vote,
  FileText,
  CreditCard,
  Link2
} from 'lucide-react';

type CredentialType = 'id-card' | 'voting-credential' | 'civic-permit' | 'identity-badge' | 'governance-pass';
type ValidationStatus = 'verified' | 'pending' | 'mismatch';

interface LineageEntry {
  id: string;
  did: string;
  timestamp: Date;
  credentialType: CredentialType;
  sourceDeck: string;
  zkpHash: string;
  validationStatus: ValidationStatus;
  issuanceSource: string;
}

interface IdentityLineageViewerCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock DID lineage data with expanded historical entries (10-15 entries)
const MOCK_LINEAGE_ENTRIES: LineageEntry[] = [
  {
    id: 'lineage_001',
    did: 'did:civic:abc123def456',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    credentialType: 'governance-pass',
    sourceDeck: 'Deck #12',
    zkpHash: 'zkp_cred_gov_abc123def',
    validationStatus: 'verified',
    issuanceSource: 'CredentialClaimCard.tsx'
  },
  {
    id: 'lineage_002',
    did: 'did:civic:ghi789jkl012',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    credentialType: 'voting-credential',
    sourceDeck: 'Deck #6',
    zkpHash: 'zkp_proof_voting_ghi789',
    validationStatus: 'mismatch',
    issuanceSource: 'ZKProofGeneratorCard.tsx'
  },
  {
    id: 'lineage_003',
    did: 'did:civic:mno345pqr678',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    credentialType: 'id-card',
    sourceDeck: 'Deck #12',
    zkpHash: 'zkp_cred_id_mno345pqr',
    validationStatus: 'verified',
    issuanceSource: 'DIDClaimCard.tsx'
  },
  {
    id: 'lineage_004',
    did: 'did:civic:stu901vwx234',
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    credentialType: 'civic-permit',
    sourceDeck: 'Deck #12',
    zkpHash: 'zkp_cred_permit_stu901',
    validationStatus: 'verified',
    issuanceSource: 'CredentialClaimCard.tsx'
  },
  {
    id: 'lineage_005',
    did: 'did:civic:yzab567cdef890',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    credentialType: 'identity-badge',
    sourceDeck: 'Deck #6',
    zkpHash: 'zkp_proof_badge_yzab567',
    validationStatus: 'mismatch',
    issuanceSource: 'ZKProofGeneratorCard.tsx'
  },
  {
    id: 'lineage_006',
    did: 'did:civic:qrs123tuv456',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    credentialType: 'voting-credential',
    sourceDeck: 'Deck #6',
    zkpHash: 'zkp_proof_voting_qrs123',
    validationStatus: 'verified',
    issuanceSource: 'ZKProofGeneratorCard.tsx'
  },
  {
    id: 'lineage_007',
    did: 'did:civic:wxy789abc012',
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    credentialType: 'governance-pass',
    sourceDeck: 'Deck #12',
    zkpHash: 'zkp_cred_gov_wxy789abc',
    validationStatus: 'verified',
    issuanceSource: 'CredentialClaimCard.tsx'
  },
  {
    id: 'lineage_008',
    did: 'did:civic:def345ghi678',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    credentialType: 'id-card',
    sourceDeck: 'Deck #12',
    zkpHash: 'zkp_cred_id_def345ghi',
    validationStatus: 'verified',
    issuanceSource: 'DIDClaimCard.tsx'
  },
  {
    id: 'lineage_009',
    did: 'did:civic:jkl901mno234',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    credentialType: 'civic-permit',
    sourceDeck: 'Deck #12',
    zkpHash: 'zkp_cred_permit_jkl901',
    validationStatus: 'mismatch',
    issuanceSource: 'CredentialClaimCard.tsx'
  },
  {
    id: 'lineage_010',
    did: 'did:civic:pqr567stu890',
    timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    credentialType: 'identity-badge',
    sourceDeck: 'Deck #6',
    zkpHash: 'zkp_proof_badge_pqr567',
    validationStatus: 'verified',
    issuanceSource: 'ZKProofGeneratorCard.tsx'
  },
  {
    id: 'lineage_011',
    did: 'did:civic:vwx123yzab456',
    timestamp: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000), // 32 days ago
    credentialType: 'voting-credential',
    sourceDeck: 'Deck #6',
    zkpHash: 'zkp_proof_voting_vwx123',
    validationStatus: 'verified',
    issuanceSource: 'ZKProofGeneratorCard.tsx'
  },
  {
    id: 'lineage_012',
    did: 'did:civic:cde789fgh012',
    timestamp: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000), // 36 days ago
    credentialType: 'governance-pass',
    sourceDeck: 'Deck #12',
    zkpHash: 'zkp_cred_gov_cde789fgh',
    validationStatus: 'verified',
    issuanceSource: 'CredentialClaimCard.tsx'
  }
];

// Get credential type icon, info, and symbolic narrative title
const getCredentialTypeInfo = (type: CredentialType) => {
  switch (type) {
    case 'id-card':
      return {
        icon: <IdCard className="w-4 h-4" />,
        label: 'Civic ID',
        narrativeTitle: 'Witness',
        color: 'text-blue-400'
      };
    case 'voting-credential':
      return {
        icon: <Vote className="w-4 h-4" />,
        label: 'Voting',
        narrativeTitle: 'Custodian',
        color: 'text-purple-400'
      };
    case 'civic-permit':
      return {
        icon: <FileText className="w-4 h-4" />,
        label: 'Permit',
        narrativeTitle: 'Guardian',
        color: 'text-green-400'
      };
    case 'identity-badge':
      return {
        icon: <User className="w-4 h-4" />,
        label: 'Badge',
        narrativeTitle: 'Sentinel',
        color: 'text-cyan-400'
      };
    case 'governance-pass':
      return {
        icon: <Shield className="w-4 h-4" />,
        label: 'Governance',
        narrativeTitle: 'Architect',
        color: 'text-amber-400'
      };
  }
};

// Get validation status styling
const getValidationStatusInfo = (status: ValidationStatus) => {
  switch (status) {
    case 'verified':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        label: 'Verified',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        ringColor: 'ring-green-400/50'
      };
    case 'mismatch':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        label: 'Mismatch',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        ringColor: 'ring-red-400/50'
      };
    case 'pending':
      return {
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        label: 'Pending',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        ringColor: 'ring-amber-400/50'
      };
  }
};

// Format timestamp for display
const formatTimestamp = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get relative time
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Truncate DID for display
const truncateDID = (did: string): string => {
  const prefix = did.substring(0, 12);
  const suffix = did.substring(did.length - 6);
  return `${prefix}...${suffix}`;
};

export const IdentityLineageViewerCard: React.FC<IdentityLineageViewerCardProps> = ({ className }) => {
  const [lineageEntries] = useState<LineageEntry[]>(MOCK_LINEAGE_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<LineageEntry | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [ttsTriggerCount, setTtsTriggerCount] = useState<number>(0);
  const [hasMismatchDistortion, setHasMismatchDistortion] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`IdentityLineageViewerCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`IdentityLineageViewerCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Enhanced TTS Integration with scroll-based narration
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
        setTtsTriggerCount(prev => prev + 1);
        
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

  // Enhanced TTS narration for lineage evolution
  const narrateLineageEntry = (entry: LineageEntry) => {
    const credentialInfo = getCredentialTypeInfo(entry.credentialType);
    const timestamp = formatTimestamp(entry.timestamp);
    const message = `Lineage evolution: ${credentialInfo.narrativeTitle} at ${timestamp}`;
    speakMessage(message, true);
  };

  // Initialize TTS on mount and check for mismatch distortion
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          // Mount TTS message
          setTimeout(() => {
            speakMessage("Identity history viewer loaded", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    // Check for mismatch distortion threshold
    const mismatchCount = lineageEntries.filter(entry => entry.validationStatus === 'mismatch').length;
    const mismatchRate = (mismatchCount / lineageEntries.length) * 100;
    setHasMismatchDistortion(mismatchRate >= 10);

    initializeTTS();
  }, [lineageEntries]);

  // Get most recent entry
  const mostRecentEntry = lineageEntries.length > 0 
    ? lineageEntries.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      ) 
    : null;

  // Calculate verification statistics
  const verifiedCount = lineageEntries.filter(entry => entry.validationStatus === 'verified').length;
  const mismatchCount = lineageEntries.filter(entry => entry.validationStatus === 'mismatch').length;
  const pendingCount = lineageEntries.filter(entry => entry.validationStatus === 'pending').length;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Identity Lineage Viewer Interface"
    >
      {/* Status Indicator Dot */}
      <div 
        className="absolute top-3 right-3 w-3 h-3 rounded-full bg-blue-500"
        aria-label="Status: Active"
        title="Lineage viewer active"
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Identity Lineage
          </CardTitle>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-400/50">
            <Star className="w-3 h-3 mr-1" />
            {lineageEntries.length} Records
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Historical DID claims and credential issuances
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Verification Statistics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-slate-200">
              Verification Status
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/30">
              <div className="text-green-400 font-medium">{verifiedCount}</div>
              <div className="text-green-300">Verified</div>
            </div>
            <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/30">
              <div className="text-red-400 font-medium">{mismatchCount}</div>
              <div className="text-red-300">Mismatch</div>
            </div>
            <div className="text-center p-2 bg-amber-500/10 rounded border border-amber-500/30">
              <div className="text-amber-400 font-medium">{pendingCount}</div>
              <div className="text-amber-300">Pending</div>
            </div>
          </div>
        </div>

        {/* Most Recent Entry Highlight */}
        {mostRecentEntry && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-200">
                Most Recent
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCredentialTypeInfo(mostRecentEntry.credentialType).icon}
                  <span className="text-sm text-slate-300">
                    {getCredentialTypeInfo(mostRecentEntry.credentialType).label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getValidationStatusInfo(mostRecentEntry.validationStatus).icon}
                  <span className={cn(
                    'text-xs',
                    getValidationStatusInfo(mostRecentEntry.validationStatus).color
                  )}>
                    {getValidationStatusInfo(mostRecentEntry.validationStatus).label}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-slate-400">
                <div>DID: {truncateDID(mostRecentEntry.did)}</div>
                <div>Issued: {getRelativeTime(mostRecentEntry.timestamp)}</div>
                <div>Source: {mostRecentEntry.sourceDeck}</div>
              </div>
            </div>
          </div>
        )}

        {/* Lineage History */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">
              History Timeline
            </span>
          </div>
          
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-3">
              {lineageEntries
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((entry, index) => {
                  const credentialInfo = getCredentialTypeInfo(entry.credentialType);
                  const validationInfo = getValidationStatusInfo(entry.validationStatus);
                  const isSelected = selectedEntry?.id === entry.id;
                  const isRecent = entry.id === mostRecentEntry?.id;

                  return (
                    <button
                      key={entry.id}
                      onClick={() => {
                        setSelectedEntry(isSelected ? null : entry);
                        if (!isSelected) {
                          narrateLineageEntry(entry);
                        }
                      }}
                      className={cn(
                        'w-full p-3 rounded-lg border transition-all duration-200',
                        'min-h-[48px] text-left relative',
                        isSelected
                          ? 'border-blue-500/50 bg-blue-500/10'
                          : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50',
                        // Mismatch distortion effects
                        hasMismatchDistortion && entry.validationStatus === 'mismatch' && [
                          'animate-pulse opacity-75',
                          'before:absolute before:inset-0 before:bg-red-500/10 before:rounded-lg',
                          'before:animate-pulse before:pointer-events-none',
                          'filter brightness-75 contrast-125'
                        ],
                        // Shimmer effect for severe mismatches
                        hasMismatchDistortion && entry.validationStatus === 'mismatch' && 
                        'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-red-400/20 before:to-transparent before:animate-shimmer'
                      )}
                      style={{
                        // CSS-based zigzag distortion for mismatch entries
                        transform: hasMismatchDistortion && entry.validationStatus === 'mismatch' 
                          ? 'skew(-0.5deg) scale(0.995)' 
                          : undefined
                      }}
                    >
                      {/* Timeline connector */}
                      {index < lineageEntries.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-6 bg-slate-600/50" />
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* Validation status ring */}
                          <div className={cn(
                            'relative p-1.5 rounded-full mt-0.5',
                            validationInfo.bgColor,
                            entry.validationStatus === 'verified' ? 'ring-2 ' + validationInfo.ringColor : ''
                          )}>
                            <div className={credentialInfo.color}>
                              {credentialInfo.icon}
                            </div>
                            
                            {/* Pulsing animation for verified entries */}
                            {entry.validationStatus === 'verified' && (
                              <div className="absolute inset-0 rounded-full ring-2 ring-green-400/30 animate-ping" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-200">
                                {credentialInfo.label}
                              </span>
                              {/* Symbolic narrative title */}
                              <Badge variant="outline" className={cn(
                                'text-xs border-opacity-50',
                                credentialInfo.color.replace('text-', 'border-').replace('-400', '-500/30'),
                                credentialInfo.color.replace('text-', 'bg-').replace('-400', '-500/10'),
                                credentialInfo.color
                              )}>
                                {credentialInfo.narrativeTitle}
                              </Badge>
                              {isRecent && (
                                <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-400/50">
                                  Latest
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-xs text-slate-400 space-y-1">
                              <div className="font-mono truncate">
                                {truncateDID(entry.did)}
                              </div>
                              <div className="flex justify-between">
                                <span>{formatTimestamp(entry.timestamp)}</span>
                                <span className={validationInfo.color}>
                                  {validationInfo.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded details */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-slate-600/50 space-y-2">
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Full DID:</span>
                              <span className="text-slate-300 font-mono text-right flex-1 ml-2 break-all">
                                {entry.did}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Source Deck:</span>
                              <span className="text-blue-400">{entry.sourceDeck}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Issuance Source:</span>
                              <span className="text-slate-300">{entry.issuanceSource}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">ZKP Hash:</span>
                              <span className="text-purple-400 font-mono text-xs">
                                {entry.zkpHash}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Age:</span>
                              <span className="text-slate-300">{getRelativeTime(entry.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Cross-Deck Integration & Distortion Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Enhanced Status
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Source Decks:</span>
              <span className="text-green-400">#6, #12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Records:</span>
              <span className="text-blue-400">{lineageEntries.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ZKP Validation:</span>
              <span className={verifiedCount / lineageEntries.length >= 0.9 ? 'text-green-400' : 'text-amber-400'}>
                {((verifiedCount / lineageEntries.length) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TTS Triggers:</span>
              <span className="text-cyan-400">{ttsTriggerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mismatch Distortion:</span>
              <span className={hasMismatchDistortion ? 'text-red-400' : 'text-green-400'}>
                {hasMismatchDistortion ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {/* Narrative titles summary */}
            <div className="pt-2 border-t border-slate-600/50">
              <div className="text-slate-400 mb-1">Narrative Titles:</div>
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(lineageEntries.map(entry => 
                  getCredentialTypeInfo(entry.credentialType).narrativeTitle
                ))).map(title => (
                  <Badge key={title} variant="outline" className="text-xs bg-slate-700/30 text-slate-300 border-slate-600">
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
          <div className="text-xs text-slate-400">
            {selectedEntry ? 'Entry selected' : 'Tap entry for details'}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Link2 className="w-3 h-3" />
            Lineage Tracked
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Identity lineage loaded with {lineageEntries.length} records,
          {verifiedCount} verified entries,
          Most recent: {mostRecentEntry ? getCredentialTypeInfo(mostRecentEntry.credentialType).label : 'none'}
        </div>
      </CardContent>
    </Card>
  );
};
export default IdentityLineageViewerCard;
