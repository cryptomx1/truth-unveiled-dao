import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { History, ArrowUpRight, ArrowDownLeft, Lock, ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Transaction {
  id: string;
  timestamp: Date;
  type: 'vote_reward' | 'referral_bonus' | 'proposal_reward' | 'participation_bonus' | 'streak_bonus';
  amount: number;
  currency: 'TP' | 'CC';
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    type: 'vote_reward',
    amount: 5,
    currency: 'TP',
    description: 'Civic proposal vote participation',
    status: 'completed'
  },
  {
    id: 'tx_002',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    type: 'referral_bonus',
    amount: 10,
    currency: 'TP',
    description: 'New member referral bonus',
    status: 'completed'
  },
  {
    id: 'tx_003',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    type: 'proposal_reward',
    amount: 2,
    currency: 'CC',
    description: 'Community proposal submission',
    status: 'completed'
  },
  {
    id: 'tx_004',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    type: 'participation_bonus',
    amount: 3,
    currency: 'TP',
    description: 'Daily participation streak',
    status: 'completed'
  },
  {
    id: 'tx_005',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    type: 'vote_reward',
    amount: 4,
    currency: 'TP',
    description: 'Municipal budget vote reward',
    status: 'completed'
  },
  {
    id: 'tx_006',
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    type: 'streak_bonus',
    amount: 1,
    currency: 'CC',
    description: 'Weekly engagement milestone',
    status: 'completed'
  },
  {
    id: 'tx_007',
    timestamp: new Date(Date.now() - 21600000), // 6 hours ago
    type: 'referral_bonus',
    amount: 8,
    currency: 'TP',
    description: 'Referral activation bonus',
    status: 'completed'
  },
  {
    id: 'tx_008',
    timestamp: new Date(Date.now() - 43200000), // 12 hours ago
    type: 'vote_reward',
    amount: 6,
    currency: 'TP',
    description: 'Educational referendum vote',
    status: 'pending'
  }
];

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'vote_reward':
    case 'proposal_reward':
    case 'participation_bonus':
    case 'streak_bonus':
      return <ArrowUpRight className="w-4 h-4" />;
    case 'referral_bonus':
      return <ArrowDownLeft className="w-4 h-4" />;
    default:
      return <ArrowUpRight className="w-4 h-4" />;
  }
};

const getTransactionColor = (type: Transaction['type']) => {
  switch (type) {
    case 'vote_reward':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'referral_bonus':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'proposal_reward':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'participation_bonus':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'streak_bonus':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'failed':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const formatTransactionType = (type: Transaction['type']) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({ className }) => {
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  const displayedTransactions = isExpanded ? transactions : transactions.slice(0, 5);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`TransactionHistoryCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`TransactionHistoryCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play transaction history message on mount
          const utterance = new SpeechSynthesisUtterance("Transaction history displayed.");
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

  const handleToggleExpand = () => {
    const expandStart = performance.now();
    setIsExpanded(prev => !prev);
    
    const expandTime = performance.now() - expandStart;
    if (expandTime > 50) {
      console.warn(`Expand toggle time: ${expandTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const getTotalEarnings = () => {
    const completedTransactions = transactions.filter(tx => tx.status === 'completed');
    const tpTotal = completedTransactions
      .filter(tx => tx.currency === 'TP')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const ccTotal = completedTransactions
      .filter(tx => tx.currency === 'CC')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return { tp: tpTotal, cc: ccTotal };
  };

  const totals = getTotalEarnings();

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-800 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Transaction History"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Transaction History
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600">
                  <Lock className="w-3 h-3 mr-1" />
                  ZKP
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Encrypted ledger available in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Track your civic participation earnings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-400">{totals.tp}</div>
              <div className="text-xs text-slate-400">Total TP Earned</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{totals.cc}</div>
              <div className="text-xs text-slate-400">Total CC Earned</div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50">
          <ScrollArea className="max-h-64">
            <div className="p-3 space-y-3">
              {displayedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 rounded border border-slate-600/30 bg-slate-800/50"
                  role="row"
                  aria-label={`Transaction: ${transaction.description}, ${transaction.amount} ${transaction.currency}, ${formatTimeAgo(transaction.timestamp)}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      'p-1.5 rounded-full',
                      getTransactionColor(transaction.type)
                    )}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-100 truncate">
                          {transaction.description}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getStatusColor(transaction.status))}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {formatTransactionType(transaction.type)}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(transaction.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className={cn(
                      'text-sm font-semibold',
                      transaction.currency === 'TP' ? 'text-blue-400' : 'text-green-400'
                    )}>
                      +{transaction.amount} {transaction.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Expand/Collapse Button */}
        {transactions.length > 5 && (
          <Button
            onClick={handleToggleExpand}
            variant="outline"
            size="sm"
            className={cn(
              'w-full min-h-[48px]',
              'bg-slate-700/50 border-slate-600 text-slate-200',
              'hover:bg-slate-600/70 hover:text-slate-50'
            )}
            aria-label={isExpanded ? 'Show fewer transactions' : 'Show all transactions'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All ({transactions.length} transactions)
              </>
            )}
          </Button>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            {displayedTransactions.length} of {transactions.length} transactions shown
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistoryCard;
