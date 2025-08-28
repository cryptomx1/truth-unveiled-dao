/**
 * StreamDashboard.tsx - Phase X-ZEBEC Step 2
 * 
 * Full transaction history display with active streams, stream status, and fallback history
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  DollarSign, 
  Clock, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  Search, 
  Download,
  TrendingUp,
  Wallet
} from 'lucide-react';

interface StreamTransaction {
  id: string;
  type: 'stream_created' | 'stream_payment' | 'stream_completed' | 'stream_cancelled' | 'fallback_payment';
  amount: number;
  currency: 'TP' | 'USDC' | 'SOL';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  streamId?: string;
  recipient: string;
  originCID: string;
  metadata: {
    rewardType: string;
    tierMultiplier: number;
    gasFeePaid?: number;
    blockHash?: string;
    txSignature?: string;
  };
}

interface ActiveStream {
  id: string;
  rewardType: string;
  totalAmount: number;
  streamedAmount: number;
  remainingAmount: number;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  recipient: string;
  ratePerMinute: number;
  progress: number;
}

export default function StreamDashboard() {
  const [transactions, setTransactions] = useState<StreamTransaction[]>([]);
  const [activeStreams, setActiveStreams] = useState<ActiveStream[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize mock data and start real-time updates
   */
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('📊 Initializing Stream Dashboard...');
      
      // Mock transaction history
      const mockTransactions: StreamTransaction[] = [
        {
          id: 'tx_001',
          type: 'stream_created',
          amount: 500,
          currency: 'TP',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000),
          streamId: 'zbc_stream_001',
          recipient: 'FB8Kx3p2...',
          originCID: 'bafybeig259cb4c80810ff851107e99eed7a0a0367b81c15eac35dee38b',
          metadata: {
            rewardType: 'Municipal Participation',
            tierMultiplier: 1.2,
            txSignature: '5KJh8FjkD9QuAWK8RXbQMm...'
          }
        },
        {
          id: 'tx_002',
          type: 'stream_payment',
          amount: 125,
          currency: 'USDC',
          status: 'completed',
          timestamp: new Date(Date.now() - 1800000),
          streamId: 'zbc_stream_001',
          recipient: 'FB8Kx3p2...',
          originCID: 'bafybeig259cb4c80810ff851107e99eed7a0a0367b81c15eac35dee38b',
          metadata: {
            rewardType: 'Municipal Participation',
            tierMultiplier: 1.2,
            gasFeePaid: 0.0025,
            blockHash: '0x8f7e9d2a1b...'
          }
        },
        {
          id: 'tx_003',
          type: 'fallback_payment',
          amount: 750,
          currency: 'TP',
          status: 'completed',
          timestamp: new Date(Date.now() - 7200000),
          recipient: 'PHJk9Mp4...',
          originCID: 'bafybeig259cb4c80810ff851107e99eed7a0a0367b81c15eac35dee38b',
          metadata: {
            rewardType: 'Governance Vote',
            tierMultiplier: 1.5
          }
        }
      ];

      // Mock active streams
      const mockActiveStreams: ActiveStream[] = [
        {
          id: 'zbc_stream_001',
          rewardType: 'Municipal Participation',
          totalAmount: 1000,
          streamedAmount: 650,
          remainingAmount: 350,
          startTime: new Date(Date.now() - 3900000),
          endTime: new Date(Date.now() + 900000),
          status: 'active',
          recipient: 'FB8Kx3p2...',
          ratePerMinute: 12.5,
          progress: 65
        },
        {
          id: 'zbc_stream_002',
          rewardType: 'Referral Bonus',
          totalAmount: 300,
          streamedAmount: 300,
          remainingAmount: 0,
          startTime: new Date(Date.now() - 7200000),
          endTime: new Date(Date.now() - 3600000),
          status: 'completed',
          recipient: 'PHJk9Mp4...',
          ratePerMinute: 5.0,
          progress: 100
        }
      ];

      setTransactions(mockTransactions);
      setActiveStreams(mockActiveStreams);
      setIsLoading(false);
      
      console.log(`✅ Dashboard initialized with ${mockTransactions.length} transactions and ${mockActiveStreams.length} streams`);
    };

    initializeDashboard();
  }, []);

  /**
   * Real-time stream progress updates
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStreams(prev => prev.map(stream => {
        if (stream.status === 'active') {
          const elapsed = Date.now() - stream.startTime.getTime();
          const totalDuration = stream.endTime.getTime() - stream.startTime.getTime();
          const newProgress = Math.min(100, (elapsed / totalDuration) * 100);
          const newStreamedAmount = Math.min(stream.totalAmount, (newProgress / 100) * stream.totalAmount);
          
          if (newProgress >= 100) {
            console.log(`✅ Stream completed: ${stream.id}`);
            return {
              ...stream,
              status: 'completed' as const,
              progress: 100,
              streamedAmount: stream.totalAmount,
              remainingAmount: 0
            };
          }
          
          return {
            ...stream,
            progress: newProgress,
            streamedAmount: newStreamedAmount,
            remainingAmount: stream.totalAmount - newStreamedAmount
          };
        }
        return stream;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Filter transactions based on search and filters
   */
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchFilter) {
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        tx.streamId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        tx.metadata.rewardType.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Time filter
    const now = Date.now();
    const timeFilterMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };
    
    const filterDuration = timeFilterMs[timeFilter as keyof typeof timeFilterMs] || Infinity;
    filtered = filtered.filter(tx => (now - tx.timestamp.getTime()) <= filterDuration);

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [transactions, searchFilter, statusFilter, timeFilter]);

  /**
   * Dashboard statistics
   */
  const dashboardStats = useMemo(() => {
    const totalStreams = activeStreams.length;
    const activeStreamCount = activeStreams.filter(s => s.status === 'active').length;
    const totalStreamedAmount = activeStreams.reduce((sum, s) => sum + s.streamedAmount, 0);
    const totalTransactionVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalStreams,
      activeStreamCount,
      totalStreamedAmount,
      totalTransactionVolume,
      completionRate: totalStreams > 0 ? Math.round((activeStreams.filter(s => s.status === 'completed').length / totalStreams) * 100) : 0
    };
  }, [activeStreams, transactions]);

  /**
   * Pause/Resume stream
   */
  const toggleStreamStatus = (streamId: string) => {
    setActiveStreams(prev => prev.map(stream => 
      stream.id === streamId
        ? { 
            ...stream, 
            status: stream.status === 'active' ? 'paused' : 'active' 
          }
        : stream
    ));
    
    console.log(`🔄 Stream ${streamId} status toggled`);
  };

  /**
   * Export transaction history
   */
  const exportTransactions = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalTransactions: filteredTransactions.length,
      transactions: filteredTransactions,
      summary: dashboardStats
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream-transactions-${Date.now()}.json`;
    a.click();
    
    console.log('📄 Transaction history exported');
  };

  /**
   * Get status icon and styling
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <div>Loading stream dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stream Dashboard</h1>
          <p className="text-muted-foreground">Monitor all TruthPoint stream transactions and active payments</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Phase X-ZEBEC
        </Badge>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Total Streams</div>
            </div>
            <div className="text-2xl font-bold mt-1">{dashboardStats.totalStreams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium">Active Streams</div>
            </div>
            <div className="text-2xl font-bold mt-1">{dashboardStats.activeStreamCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <div className="text-sm font-medium">Total Streamed</div>
            </div>
            <div className="text-2xl font-bold mt-1">{Math.round(dashboardStats.totalStreamedAmount)} TP</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div className="text-sm font-medium">Volume</div>
            </div>
            <div className="text-2xl font-bold mt-1">{Math.round(dashboardStats.totalTransactionVolume)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-orange-500" />
              <div className="text-sm font-medium">Success Rate</div>
            </div>
            <div className="text-2xl font-bold mt-1">{dashboardStats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="streams" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="streams">Active Streams</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Active Streams Tab */}
        <TabsContent value="streams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active & Recent Streams</CardTitle>
            </CardHeader>
            <CardContent>
              {activeStreams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active streams
                </div>
              ) : (
                <div className="space-y-4">
                  {activeStreams.map((stream) => (
                    <div key={stream.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(stream.status)}
                            <span className="font-semibold">{stream.rewardType}</span>
                            <Badge variant="secondary">{stream.status.toUpperCase()}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Stream ID: {stream.id}
                          </div>
                          <div className="text-sm">
                            Recipient: <span className="font-mono">{stream.recipient}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-lg font-bold">
                            {Math.round(stream.streamedAmount)} / {stream.totalAmount} TP
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {stream.ratePerMinute} TP/min
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(stream.progress)}%</span>
                        </div>
                        <Progress value={stream.progress} className="w-full" />
                      </div>

                      {stream.status === 'active' && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStreamStatus(stream.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        </div>
                      )}

                      {stream.status === 'paused' && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStreamStatus(stream.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={exportTransactions} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Transaction History ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found matching your filters
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tx.status)}
                            <span className="font-medium capitalize">
                              {tx.type.replace('_', ' ')}
                            </span>
                            <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                              {tx.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>TX ID: {tx.id}</div>
                            {tx.streamId && <div>Stream: {tx.streamId}</div>}
                            <div>Recipient: <span className="font-mono">{tx.recipient}</span></div>
                            <div>Reward: {tx.metadata.rewardType}</div>
                            {tx.metadata.tierMultiplier > 1 && (
                              <div className="text-blue-600 dark:text-blue-400">
                                Tier multiplier: {tx.metadata.tierMultiplier}x
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-lg font-bold">
                            {tx.amount} {tx.currency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tx.timestamp.toLocaleString()}
                          </div>
                          {tx.metadata.gasFeePaid && (
                            <div className="text-xs text-muted-foreground">
                              Gas: ${tx.metadata.gasFeePaid.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Stream Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics view coming soon...
                <br />
                Stream performance metrics and insights will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}