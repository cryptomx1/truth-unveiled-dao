// TransactionStabilityCard.tsx - Phase III-A Step 4/6
// Real-time Zebec/Solana sync stability with 50-transaction buffer and 10-user simulation

import { useState, useEffect } from 'react';
import { Activity, Wifi, AlertCircle, TrendingUp, Users, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  type: 'send' | 'receive' | 'stake' | 'swap';
  amount: number;
  token: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  blockHeight: number;
  latency: number;
}

interface UserSimulation {
  id: string;
  username: string;
  activeTransactions: number;
  totalVolume: number;
  avgLatency: number;
  successRate: number;
}

interface StabilityMetrics {
  connectionHealth: number;
  avgLatency: number;
  successRate: number;
  bufferUtilization: number;
  zebekSyncStatus: 'connected' | 'degraded' | 'disconnected';
  solanaRPC: 'healthy' | 'slow' | 'down';
}

export const TransactionStabilityCard = () => {
  const [transactionBuffer, setTransactionBuffer] = useState<Transaction[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserSimulation[]>([
    { id: 'user_001', username: 'civic_voter_1', activeTransactions: 3, totalVolume: 1250, avgLatency: 245, successRate: 98.2 },
    { id: 'user_002', username: 'truth_contributor', activeTransactions: 7, totalVolume: 2840, avgLatency: 312, successRate: 96.8 },
    { id: 'user_003', username: 'governance_delegate', activeTransactions: 2, totalVolume: 890, avgLatency: 189, successRate: 99.1 },
    { id: 'user_004', username: 'community_builder', activeTransactions: 5, totalVolume: 1967, avgLatency: 278, successRate: 97.3 },
    { id: 'user_005', username: 'privacy_advocate', activeTransactions: 1, totalVolume: 567, avgLatency: 156, successRate: 99.8 },
    { id: 'user_006', username: 'policy_analyst', activeTransactions: 4, totalVolume: 1432, avgLatency: 334, successRate: 95.9 },
    { id: 'user_007', username: 'civic_educator', activeTransactions: 6, totalVolume: 2156, avgLatency: 267, successRate: 97.7 },
    { id: 'user_008', username: 'dao_member', activeTransactions: 3, totalVolume: 1098, avgLatency: 198, successRate: 98.9 },
    { id: 'user_009', username: 'truth_seeker', activeTransactions: 2, totalVolume: 745, avgLatency: 289, successRate: 96.4 },
    { id: 'user_010', username: 'consensus_node', activeTransactions: 8, totalVolume: 3421, avgLatency: 423, successRate: 94.6 }
  ]);

  const [stabilityMetrics, setStabilityMetrics] = useState<StabilityMetrics>({
    connectionHealth: 94.7,
    avgLatency: 267,
    successRate: 97.2,
    bufferUtilization: 32,
    zebekSyncStatus: 'connected',
    solanaRPC: 'healthy'
  });

  const [renderTime, setRenderTime] = useState<number>(0);
  const [pushbackTriggered, setPushbackTriggered] = useState(false);

  useEffect(() => {
    const startTime = performance.now();

    // Initialize transaction buffer
    generateInitialTransactions();

    // Real-time transaction simulation
    const transactionSimulation = setInterval(() => {
      simulateTransactionFlow();
      updateStabilityMetrics();
    }, 2000);

    // User activity simulation
    const userSimulation = setInterval(() => {
      simulateUserActivity();
    }, 5000);

    console.log('🔇 TTS disabled: "Transaction stability monitor ready"');

    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);

    if (latency > 125) {
      console.log(`TransactionStabilityCard render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }

    return () => {
      clearInterval(transactionSimulation);
      clearInterval(userSimulation);
    };
  }, []);

  const generateInitialTransactions = () => {
    const transactions: Transaction[] = [];
    const userIds = activeUsers.map(u => u.id);
    
    for (let i = 0; i < 15; i++) {
      transactions.push({
        id: `tx_${Date.now()}_${i}`,
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        type: ['send', 'receive', 'stake', 'swap'][Math.floor(Math.random() * 4)] as Transaction['type'],
        amount: Math.floor(Math.random() * 1000) + 10,
        token: ['TP', 'CC', 'CIV'][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.05 ? 'confirmed' : (Math.random() > 0.5 ? 'pending' : 'failed'),
        timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 30),
        blockHeight: 150000000 + Math.floor(Math.random() * 1000),
        latency: Math.floor(Math.random() * 500) + 100
      });
    }
    
    setTransactionBuffer(transactions);
  };

  const simulateTransactionFlow = () => {
    const validationStart = performance.now();
    
    setTransactionBuffer(prev => {
      // Add new transactions (simulate user activity)
      const newTransactions: Transaction[] = [];
      const numberOfNewTx = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numberOfNewTx; i++) {
        if (prev.length < 50) { // Buffer limit
          const userId = activeUsers[Math.floor(Math.random() * activeUsers.length)].id;
          newTransactions.push({
            id: `tx_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type: ['send', 'receive', 'stake', 'swap'][Math.floor(Math.random() * 4)] as Transaction['type'],
            amount: Math.floor(Math.random() * 1000) + 10,
            token: ['TP', 'CC', 'CIV'][Math.floor(Math.random() * 3)],
            status: 'pending',
            timestamp: new Date(),
            blockHeight: 150000000 + Math.floor(Math.random() * 1000),
            latency: Math.floor(Math.random() * 500) + 100
          });
        }
      }

      // Update existing transactions (simulate confirmations/failures)
      const updatedTransactions = prev.map(tx => {
        if (tx.status === 'pending' && Math.random() > 0.3) {
          return {
            ...tx,
            status: Math.random() > 0.05 ? 'confirmed' : 'failed' as Transaction['status'],
            latency: Math.floor(Math.random() * 400) + 150
          };
        }
        return tx;
      });

      // Combine and sort by timestamp (newest first)
      const allTransactions = [...updatedTransactions, ...newTransactions]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50); // Maintain buffer limit

      return allTransactions;
    });

    const validationEnd = performance.now();
    const validationTime = validationEnd - validationStart;
    
    if (validationTime > 100) {
      console.log(`TransactionStabilityCard validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
    }
  };

  const simulateUserActivity = () => {
    setActiveUsers(prev => prev.map(user => ({
      ...user,
      activeTransactions: Math.max(0, user.activeTransactions + (Math.random() > 0.5 ? 1 : -1)),
      totalVolume: user.totalVolume + Math.floor(Math.random() * 100),
      avgLatency: Math.max(100, user.avgLatency + (Math.random() - 0.5) * 50),
      successRate: Math.max(90, Math.min(100, user.successRate + (Math.random() - 0.5) * 2))
    })));
  };

  const updateStabilityMetrics = () => {
    const confirmedTx = transactionBuffer.filter(tx => tx.status === 'confirmed').length;
    const failedTx = transactionBuffer.filter(tx => tx.status === 'failed').length;
    const totalTx = transactionBuffer.length;
    
    const successRate = totalTx > 0 ? (confirmedTx / totalTx) * 100 : 100;
    const avgLatency = transactionBuffer.length > 0 
      ? transactionBuffer.reduce((sum, tx) => sum + tx.latency, 0) / transactionBuffer.length 
      : 250;
    
    const bufferUtil = (transactionBuffer.length / 50) * 100;
    const connectionHealth = 90 + Math.random() * 10;
    
    // Zebec sync failure simulation (25% threshold for pushback)
    const syncFailureRate = Math.random() * 30; // 0-30% failure rate
    const newPushbackState = syncFailureRate > 25;
    
    if (newPushbackState && !pushbackTriggered) {
      console.log(`⚠️ Zebec sync pushback triggered: ${syncFailureRate.toFixed(1)}% failure rate`);
      setPushbackTriggered(true);
    } else if (!newPushbackState && pushbackTriggered) {
      setPushbackTriggered(false);
    }

    setStabilityMetrics({
      connectionHealth,
      avgLatency,
      successRate,
      bufferUtilization: bufferUtil,
      zebekSyncStatus: syncFailureRate > 25 ? 'degraded' : (syncFailureRate > 15 ? 'degraded' : 'connected'),
      solanaRPC: avgLatency > 400 ? 'slow' : (avgLatency > 300 ? 'slow' : 'healthy')
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-amber-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getHealthColor = (value: number, threshold: number = 95) => {
    if (value >= threshold) return 'text-green-400';
    if (value >= threshold - 10) return 'text-amber-400';
    return 'text-red-400';
  };

  const getSyncStatusColor = (status: StabilityMetrics['zebekSyncStatus']) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'degraded': return 'text-amber-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            stabilityMetrics.zebekSyncStatus === 'connected' ? 'bg-green-900' : 'bg-amber-900'
          }`}>
            <Activity className={`w-6 h-6 ${
              stabilityMetrics.zebekSyncStatus === 'connected' ? 'text-green-400' : 'text-amber-400'
            }`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Transaction Stability</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{renderTime.toFixed(1)}ms</div>
          <Wifi className={`w-4 h-4 ${getSyncStatusColor(stabilityMetrics.zebekSyncStatus)}`} />
        </div>
      </div>

      {/* Stability Metrics */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Network Health</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Connection</div>
            <div className={`text-lg font-semibold ${getHealthColor(stabilityMetrics.connectionHealth)}`}>
              {stabilityMetrics.connectionHealth.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Success Rate</div>
            <div className={`text-lg font-semibold ${getHealthColor(stabilityMetrics.successRate)}`}>
              {stabilityMetrics.successRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Avg Latency</div>
            <div className={`text-lg font-semibold ${
              stabilityMetrics.avgLatency < 250 ? 'text-green-400' : 
              stabilityMetrics.avgLatency < 400 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {stabilityMetrics.avgLatency.toFixed(0)}ms
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Buffer</div>
            <div className={`text-lg font-semibold ${
              stabilityMetrics.bufferUtilization < 70 ? 'text-green-400' : 
              stabilityMetrics.bufferUtilization < 90 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {stabilityMetrics.bufferUtilization.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Sync Status</div>
        <div className="space-y-2">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Zebec Protocol</span>
              <span className={`text-xs font-medium ${getSyncStatusColor(stabilityMetrics.zebekSyncStatus)}`}>
                {stabilityMetrics.zebekSyncStatus.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Solana RPC</span>
              <span className={`text-xs font-medium ${
                stabilityMetrics.solanaRPC === 'healthy' ? 'text-green-400' :
                stabilityMetrics.solanaRPC === 'slow' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {stabilityMetrics.solanaRPC.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pushback Alert */}
      {pushbackTriggered && (
        <div className="mb-6 p-3 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-200 font-medium">
              SYNC DEGRADATION: Zebec failure rate exceeds 25% threshold
            </span>
          </div>
        </div>
      )}

      {/* Active Users Simulation */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Active Users (10)</div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {activeUsers.slice(0, 5).map((user) => (
            <div key={user.id} className="bg-slate-800 rounded p-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{user.username}</span>
                <span className="text-slate-400">{user.activeTransactions} tx</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">${user.totalVolume}</span>
                <span className={`${
                  user.successRate > 98 ? 'text-green-400' : 
                  user.successRate > 95 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {user.successRate.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
          {activeUsers.length > 5 && (
            <div className="text-xs text-slate-400 text-center py-1">
              +{activeUsers.length - 5} more users active...
            </div>
          )}
        </div>
      </div>

      {/* Transaction Buffer */}
      <div>
        <div className="text-sm font-medium text-slate-300 mb-3">Transaction Buffer ({transactionBuffer.length}/50)</div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {transactionBuffer.slice(0, 8).map((tx) => (
            <div key={tx.id} className="bg-slate-800 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">{tx.type.toUpperCase()}</span>
                  <span className="text-xs text-slate-400">{tx.amount} {tx.token}</span>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{tx.timestamp.toLocaleTimeString()}</span>
                <span>{tx.latency}ms</span>
              </div>
            </div>
          ))}
          {transactionBuffer.length === 0 && (
            <div className="text-xs text-slate-500 italic text-center py-4">
              No transactions in buffer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStabilityCard;