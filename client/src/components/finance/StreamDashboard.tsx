// StreamDashboard.tsx - Phase X-ZEBEC Step 2: Real-time Zebec payment stream monitoring
// Real-time dashboard interface for monitoring active Zebec payment streams with TTS integration

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Square,
  Clock,
  Wallet,
  TrendingUp,
  Eye,
  Volume2
} from 'lucide-react';
import TTSEngineAgent from '../../agents/TTSEngineAgent';

interface PaymentStream {
  id: string;
  sender: string;
  recipient: string;
  token: 'USDC' | 'SOL' | 'TP';
  amount: number;
  rate: number; // tokens per second
  startTime: Date;
  endTime?: Date;
  status: 'streaming' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  cid?: string;
  metadata?: {
    campaign?: string;
    category?: string;
    description?: string;
  };
}

interface StreamDashboardState {
  streams: PaymentStream[];
  filteredStreams: PaymentStream[];
  searchTerm: string;
  statusFilter: string;
  isLoading: boolean;
  lastRefresh: Date;
  totalValue: number;
  activeStreams: number;
}

const StreamDashboard: React.FC = () => {
  const [dashboardState, setDashboardState] = useState<StreamDashboardState>({
    streams: [],
    filteredStreams: [],
    searchTerm: '',
    statusFilter: 'all',
    isLoading: true,
    lastRefresh: new Date(),
    totalValue: 0,
    activeStreams: 0
  });

  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Generate mock stream data for demonstration
  const generateMockStreams = useCallback((): PaymentStream[] => {
    const mockStreams: PaymentStream[] = [
      {
        id: 'stream_001',
        sender: '0x1a2b...c3d4',
        recipient: '0x5e6f...7g8h',
        token: 'USDC',
        amount: 1000,
        rate: 0.1157, // ~10 USDC per day
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'streaming',
        progress: 67,
        cid: 'QmX1Y2Z3...abc123',
        metadata: {
          campaign: 'Municipal Participation',
          category: 'civic_reward',
          description: 'Austin TX participation rewards'
        }
      },
      {
        id: 'stream_002',
        sender: '0x9i10...j11k',
        recipient: '0x12l3...m14n',
        token: 'SOL',
        amount: 50,
        rate: 0.0578, // ~5 SOL per day
        startTime: new Date(Date.now() - 7200000), // 2 hours ago
        status: 'streaming',
        progress: 43,
        cid: 'QmA4B5C6...def456',
        metadata: {
          campaign: 'Governance Vote',
          category: 'voting_reward',
          description: 'Portland OR governance participation'
        }
      },
      {
        id: 'stream_003',
        sender: '0x15o6...p17q',
        recipient: '0x18r9...s20t',
        token: 'TP',
        amount: 2500,
        rate: 0.2893, // ~25 TP per day
        startTime: new Date(Date.now() - 1800000), // 30 minutes ago
        status: 'paused',
        progress: 22,
        metadata: {
          campaign: 'Content Creation',
          category: 'content_reward',
          description: 'Civic article publishing rewards'
        }
      },
      {
        id: 'stream_004',
        sender: '0x21u2...v23w',
        recipient: '0x24x5...y26z',
        token: 'USDC',
        amount: 750,
        rate: 0.0868, // ~7.5 USDC per day
        startTime: new Date(Date.now() - 10800000), // 3 hours ago
        endTime: new Date(Date.now() - 300000), // 5 minutes ago
        status: 'completed',
        progress: 100,
        cid: 'QmG7H8I9...ghi789',
        metadata: {
          campaign: 'Referral Bonus',
          category: 'referral_reward',
          description: 'San Jose CA referral completion'
        }
      }
    ];

    return mockStreams;
  }, []);

  // Load and refresh stream data
  const loadStreamData = useCallback(async () => {
    setDashboardState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const streams = generateMockStreams();
      const activeStreams = streams.filter(s => s.status === 'streaming').length;
      const totalValue = streams.reduce((sum, stream) => {
        const tokenValue = stream.token === 'USDC' ? 1 : stream.token === 'SOL' ? 150 : 0.02;
        return sum + (stream.amount * tokenValue);
      }, 0);

      setDashboardState(prev => ({
        ...prev,
        streams,
        filteredStreams: streams,
        isLoading: false,
        lastRefresh: new Date(),
        totalValue,
        activeStreams
      }));

      console.log(`💰 Stream dashboard loaded: ${streams.length} streams, ${activeStreams} active`);

      // TTS announcement for status changes
      if (ttsEnabled) {
        const ttsAgent = TTSEngineAgent.getInstance();
        ttsAgent.generateNarration(`Stream dashboard updated. ${activeStreams} active streams with total value ${totalValue.toFixed(2)} dollars.`, 'zebec-dashboard', 'informative');
      }

    } catch (error) {
      console.error('❌ Failed to load stream data:', error);
      setDashboardState(prev => ({ ...prev, isLoading: false }));
    }
  }, [generateMockStreams, ttsEnabled]);

  // Filter streams based on search and status
  const filteredStreams = useMemo(() => {
    let filtered = dashboardState.streams;

    if (dashboardState.searchTerm) {
      const term = dashboardState.searchTerm.toLowerCase();
      filtered = filtered.filter(stream => 
        stream.id.toLowerCase().includes(term) ||
        stream.recipient.toLowerCase().includes(term) ||
        stream.sender.toLowerCase().includes(term) ||
        stream.metadata?.campaign?.toLowerCase().includes(term) ||
        stream.metadata?.description?.toLowerCase().includes(term)
      );
    }

    if (dashboardState.statusFilter !== 'all') {
      filtered = filtered.filter(stream => stream.status === dashboardState.statusFilter);
    }

    return filtered;
  }, [dashboardState.streams, dashboardState.searchTerm, dashboardState.statusFilter]);

  // Handle search input
  const handleSearch = useCallback((term: string) => {
    setDashboardState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  // Handle status filter
  const handleStatusFilter = useCallback((status: string) => {
    setDashboardState(prev => ({ ...prev, statusFilter: status }));
  }, []);

  // Stream control actions
  const handleStreamAction = useCallback(async (streamId: string, action: 'pause' | 'resume' | 'cancel') => {
    console.log(`🔄 Stream action: ${action} for ${streamId}`);
    
    setDashboardState(prev => ({
      ...prev,
      streams: prev.streams.map(stream => {
        if (stream.id === streamId) {
          const newStatus = action === 'pause' ? 'paused' : 
                          action === 'resume' ? 'streaming' : 'cancelled';
          return { ...stream, status: newStatus as PaymentStream['status'] };
        }
        return stream;
      })
    }));

    if (ttsEnabled) {
      const ttsAgent = TTSEngineAgent.getInstance();
      ttsAgent.generateNarration(`Stream ${streamId} ${action}d successfully.`, 'zebec-dashboard', 'informative');
    }
  }, [ttsEnabled]);

  // Get status badge variant
  const getStatusBadgeVariant = (status: PaymentStream['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'streaming': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  // Format currency display
  const formatCurrency = (amount: number, token: string): string => {
    if (token === 'TP') return `${amount.toLocaleString()} TP`;
    return `${amount.toFixed(2)} ${token}`;
  };

  // Format time display
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${diffHours}h ago`;
  };

  // Initialize component
  useEffect(() => {
    loadStreamData();
    
    // Set up 15-second refresh interval
    const refreshInterval = setInterval(loadStreamData, 15000);
    
    return () => clearInterval(refreshInterval);
  }, [loadStreamData]);

  return (
    <div className="container mx-auto p-6 space-y-6" role="main" aria-label="Stream Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Stream Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time Zebec payment stream monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="flex items-center gap-2"
            aria-label={`TTS narration ${ttsEnabled ? 'enabled' : 'disabled'}`}
          >
            <Volume2 className="h-4 w-4" />
            {ttsEnabled ? 'TTS On' : 'TTS Off'}
          </Button>
          
          <Button
            onClick={loadStreamData}
            disabled={dashboardState.isLoading}
            size="sm"
            aria-label="Refresh stream data"
          >
            {dashboardState.isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Streams</p>
                <p className="text-2xl font-bold">{dashboardState.activeStreams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${dashboardState.totalValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">{dashboardState.streams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="text-sm font-medium">{formatTimeAgo(dashboardState.lastRefresh)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by stream ID, address, or campaign..."
                  value={dashboardState.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  aria-label="Search streams"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={dashboardState.statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="streaming">Streaming</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stream List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payment Streams
            <Badge variant="outline">
              {filteredStreams.length} of {dashboardState.streams.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardState.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading streams...</span>
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No streams found matching your criteria
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                  role="article"
                  aria-label={`Stream ${stream.id}`}
                >
                  {/* Stream Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadgeVariant(stream.status)}>
                        {stream.status.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-sm text-muted-foreground">
                        {stream.id}
                      </span>
                      {stream.cid && (
                        <Badge variant="outline" className="text-xs">
                          CID: {stream.cid.slice(0, 8)}...
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {stream.status === 'streaming' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStreamAction(stream.id, 'pause')}
                          aria-label={`Pause stream ${stream.id}`}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {stream.status === 'paused' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStreamAction(stream.id, 'resume')}
                          aria-label={`Resume stream ${stream.id}`}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {(stream.status === 'streaming' || stream.status === 'paused') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStreamAction(stream.id, 'cancel')}
                          aria-label={`Cancel stream ${stream.id}`}
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Stream Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-mono">{stream.sender}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p className="font-mono">{stream.recipient}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount & Rate</p>
                      <p className="font-semibold">
                        {formatCurrency(stream.amount, stream.token)} 
                        <span className="text-muted-foreground ml-1">
                          @ {stream.rate.toFixed(4)}/sec
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {stream.status !== 'cancelled' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{stream.progress}%</span>
                      </div>
                      <Progress value={stream.progress} className="h-2" />
                    </div>
                  )}

                  {/* Metadata */}
                  {stream.metadata && (
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {stream.metadata.campaign}
                        </Badge>
                        <span className="text-muted-foreground">
                          {stream.metadata.description}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Timing */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Started {formatTimeAgo(stream.startTime)}</span>
                    {stream.endTime && (
                      <span>Ended {formatTimeAgo(stream.endTime)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamDashboard;