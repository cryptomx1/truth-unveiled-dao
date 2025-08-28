import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Download, Lock, Info, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoteRecord {
  id: string;
  proposalTitle: string;
  decision: 'support' | 'reject';
  timestamp: Date;
  region: string;
  category: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  proposer: string;
}

interface VoteLedgerCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

// Mock vote history data with CAM metadata
const MOCK_VOTE_HISTORY: VoteRecord[] = [
  {
    id: 'vote-001',
    proposalTitle: 'Expand Public Transit Routes',
    decision: 'support',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    region: 'Metro District',
    category: 'Infrastructure',
    urgencyLevel: 'medium',
    proposer: 'City Planning Council'
  },
  {
    id: 'vote-002',
    proposalTitle: 'Emergency Housing Fund',
    decision: 'support',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    region: 'Citywide',
    category: 'Social Welfare',
    urgencyLevel: 'high',
    proposer: 'Housing Justice Network'
  },
  {
    id: 'vote-003',
    proposalTitle: 'Community Garden Initiative',
    decision: 'reject',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    region: 'South Ward',
    category: 'Environment',
    urgencyLevel: 'low',
    proposer: 'Green Future Coalition'
  },
  {
    id: 'vote-004',
    proposalTitle: 'Youth Recreation Center Funding',
    decision: 'support',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    region: 'North District',
    category: 'Community Development',
    urgencyLevel: 'medium',
    proposer: 'Youth Advocacy Group'
  },
  {
    id: 'vote-005',
    proposalTitle: 'Downtown Parking Restrictions',
    decision: 'reject',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    region: 'Downtown Core',
    category: 'Transportation',
    urgencyLevel: 'low',
    proposer: 'Business District Alliance'
  }
];

const TTS_MESSAGE = "Your voting history is encrypted and preserved.";

export const VoteLedgerCard: React.FC<VoteLedgerCardProps> = ({ className }) => {
  const [voteHistory] = useState<VoteRecord[]>(MOCK_VOTE_HISTORY);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [isExporting, setIsExporting] = useState(false);
  const [renderStartTime] = useState(performance.now());
  const { toast } = useToast();

  // Initialize TTS on component mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          const waitForVoices = () => {
            return new Promise<void>((resolve) => {
              const voices = speechSynthesis.getVoices();
              if (voices.length > 0) {
                resolve();
              } else {
                speechSynthesis.addEventListener('voiceschanged', () => {
                  resolve();
                }, { once: true });
              }
            });
          };

          await waitForVoices();
          setTtsStatus({ isReady: true, isPlaying: false });
        } else {
          setTtsStatus({ isReady: false, isPlaying: false, error: 'TTS not supported' });
        }
      } catch (error) {
        setTtsStatus({ isReady: false, isPlaying: false, error: 'TTS initialization failed' });
      }
    };

    initializeTTS();

    // Log render performance
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 150) {
      console.warn(`VoteLedgerCard render time: ${renderTime.toFixed(2)}ms (exceeds 150ms target)`);
    } else {
      console.log(`VoteLedgerCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  const handleTTSToggle = async () => {
    if (!ttsStatus.isReady) {
      toast({
        title: "TTS not available",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (ttsStatus.isPlaying) {
      speechSynthesis.cancel();
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(TTS_MESSAGE);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: true }));
      };
      
      utterance.onend = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: false }));
      };
      
      utterance.onerror = () => {
        setTtsStatus(prev => ({ ...prev, isPlaying: false, error: 'TTS playback failed' }));
        toast({
          title: "TTS Error",
          description: "Failed to play text-to-speech message.",
          variant: "destructive",
        });
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      setTtsStatus(prev => ({ ...prev, error: 'TTS playback failed' }));
      toast({
        title: "TTS Error",
        description: "Failed to play text-to-speech message.",
        variant: "destructive",
      });
    }
  };

  const handleExportLedger = async () => {
    setIsExporting(true);
    const exportStartTime = performance.now();

    try {
      // Simulate export processing delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Prepare mock export data
      const exportData = {
        exportDate: new Date().toISOString(),
        totalVotes: voteHistory.length,
        supportVotes: voteHistory.filter(v => v.decision === 'support').length,
        rejectVotes: voteHistory.filter(v => v.decision === 'reject').length,
        votes: voteHistory.map(vote => ({
          id: vote.id,
          proposal: vote.proposalTitle,
          decision: vote.decision,
          timestamp: vote.timestamp.toISOString(),
          metadata: {
            region: vote.region,
            category: vote.category,
            urgencyLevel: vote.urgencyLevel,
            proposer: vote.proposer
          }
        }))
      };

      // Simulate file creation (no actual download)
      const jsonData = JSON.stringify(exportData, null, 2);
      const csvData = [
        'ID,Proposal,Decision,Timestamp,Region,Category,Urgency,Proposer',
        ...voteHistory.map(vote => 
          `${vote.id},"${vote.proposalTitle}",${vote.decision},${vote.timestamp.toISOString()},${vote.region},${vote.category},${vote.urgencyLevel},"${vote.proposer}"`
        )
      ].join('\n');

      const exportTime = performance.now() - exportStartTime;
      
      toast({
        title: "Export Simulated",
        description: `Ledger data prepared (${exportTime.toFixed(0)}ms). JSON: ${jsonData.length} chars, CSV: ${csvData.length} chars.`,
      });

      console.log('Mock Export - JSON Data:', jsonData);
      console.log('Mock Export - CSV Data:', csvData);

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to prepare ledger export data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div 
      className={cn(
        'dao-card-gradient border border-[hsl(var(--dao-border))] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 max-w-sm mx-auto',
        className
      )}
      role="region"
      aria-label="Vote Ledger History"
      data-testid="vote-ledger-card"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 dao-primary-gradient rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Vote Ledger
            </h2>
            <p className="text-sm text-gray-300">
              {voteHistory.length} votes cast
            </p>
          </div>
        </div>
        
        {/* TTS Button */}
        <Button
          onClick={handleTTSToggle}
          disabled={!ttsStatus.isReady}
          className={cn(
            'w-10 h-10 rounded-full p-0 transition-colors duration-150',
            ttsStatus.isReady 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
          )}
          aria-label={ttsStatus.isPlaying ? 'Stop ledger message' : 'Play ledger message'}
          data-testid="tts-toggle-button"
        >
          {ttsStatus.isPlaying ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Vote Statistics */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center space-x-1 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {voteHistory.filter(v => v.decision === 'support').length}
              </span>
            </div>
            <p className="text-xs text-gray-300">Supported</p>
          </div>
          <div>
            <div className="flex items-center justify-center space-x-1 mb-1">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {voteHistory.filter(v => v.decision === 'reject').length}
              </span>
            </div>
            <p className="text-xs text-gray-300">Rejected</p>
          </div>
        </div>
      </div>

      {/* Vote History List */}
      <div className="bg-white/5 rounded-lg border border-white/10 mb-4 max-h-64 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-white mb-3">Recent Votes</h3>
          <div className="space-y-3">
            {voteHistory.map((vote) => (
              <div 
                key={vote.id}
                className="bg-white/10 rounded-lg p-3 border border-white/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {vote.proposalTitle}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {vote.proposer} • {vote.region}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    {vote.decision === 'support' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={cn('font-medium', getUrgencyColor(vote.urgencyLevel))}>
                    {vote.category}
                  </span>
                  <span className="text-gray-400">
                    {formatTimeAgo(vote.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ZKP Placeholder Section */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">
            ZK Proofs of participation available in Deck #5
          </span>
          <Info className="w-3 h-3 text-gray-500" />
        </div>
      </div>

      {/* Export Button */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <Button
          onClick={handleExportLedger}
          disabled={isExporting}
          className={cn(
            'w-full flex items-center justify-center space-x-2 transition-colors duration-150',
            isExporting
              ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
          aria-label="Download vote ledger"
          data-testid="export-button"
        >
          {isExporting ? (
            <>
              <Download className="w-4 h-4 animate-spin" />
              <span>Preparing...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Ledger</span>
            </>
          )}
        </Button>
        <p className="text-sm text-gray-400 mt-2 text-center">
          Export as JSON or CSV format
        </p>
      </div>

      {/* TTS Status Indicator */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">History Voice</span>
          <div className="flex items-center space-x-2">
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                ttsStatus.isReady ? "bg-green-400" : "bg-gray-500",
                ttsStatus.isPlaying ? "animate-pulse" : ""
              )}
            />
            <span 
              className={cn(
                "font-medium text-xs",
                ttsStatus.isReady ? "text-green-400" : "text-gray-500"
              )}
              aria-live="polite"
            >
              {ttsStatus.error ? "Error" : ttsStatus.isPlaying ? "Playing" : ttsStatus.isReady ? "Ready" : "Initializing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteLedgerCard;