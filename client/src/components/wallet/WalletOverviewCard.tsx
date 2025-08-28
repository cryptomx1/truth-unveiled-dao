// WalletOverviewCard.tsx - Phase III-A Step 4/6
// DID-linked crypto portfolio summary with ZKP-verified balance sync

import { useState, useEffect } from 'react';
import { Wallet, Shield, TrendingUp, Eye, Copy, CheckCircle } from 'lucide-react';

interface TokenHolding {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  verified: boolean;
  zkpHash: string;
}

interface WalletPortfolio {
  didId: string;
  totalUsdValue: number;
  change24h: number;
  holdings: TokenHolding[];
  zkpVerified: boolean;
  lastSync: Date;
}

export const WalletOverviewCard = () => {
  const [portfolio, setPortfolio] = useState<WalletPortfolio>({
    didId: 'did:civic:0x7f3e2d1a8c9b5f2e',
    totalUsdValue: 24567.89,
    change24h: 3.45,
    holdings: [
      {
        id: 'truth_points',
        symbol: 'TP',
        name: 'Truth Points',
        balance: 1247,
        usdValue: 12470.00,
        change24h: 2.8,
        verified: true,
        zkpHash: '0x4f3e2d1a8c9b5f2e7d4a6b8c'
      },
      {
        id: 'contribution_credits',
        symbol: 'CC',
        name: 'Contribution Credits', 
        balance: 583,
        usdValue: 8745.00,
        change24h: 5.2,
        verified: true,
        zkpHash: '0x7a2b4c6d8e0f1a3b5c7d9e1f'
      },
      {
        id: 'civic_tokens',
        symbol: 'CIV',
        name: 'Civic Governance',
        balance: 89.5,
        usdValue: 3352.89,
        change24h: -1.7,
        verified: true,
        zkpHash: '0x9c3e5f7a1b4d6e8f0a2c4e6f'
      }
    ],
    zkpVerified: true,
    lastSync: new Date()
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate real-time portfolio updates
    const portfolioUpdateInterval = setInterval(() => {
      setPortfolio(prev => {
        const updatedHoldings = prev.holdings.map(holding => ({
          ...holding,
          balance: holding.balance + (Math.random() - 0.5) * 0.1,
          change24h: holding.change24h + (Math.random() - 0.5) * 0.2,
          usdValue: holding.balance * (holding.symbol === 'TP' ? 10 : holding.symbol === 'CC' ? 15 : 37.5)
        }));

        const newTotalValue = updatedHoldings.reduce((sum, holding) => sum + holding.usdValue, 0);
        const avgChange = updatedHoldings.reduce((sum, holding) => sum + holding.change24h, 0) / updatedHoldings.length;

        return {
          ...prev,
          holdings: updatedHoldings,
          totalUsdValue: newTotalValue,
          change24h: avgChange,
          lastSync: new Date()
        };
      });
    }, 5000);

    console.log('🔇 TTS disabled: "Wallet Overview ready"');
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    setRenderTime(latency);
    
    if (latency > 125) {
      console.log(`WalletOverviewCard render time: ${latency.toFixed(2)}ms (exceeds 125ms target)`);
    }

    return () => clearInterval(portfolioUpdateInterval);
  }, []);

  const handleCopyToClipboard = async (text: string, field: string) => {
    const validationStart = performance.now();
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      
      console.log('🔇 TTS disabled: "Copied to clipboard"');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }

    const validationEnd = performance.now();
    const validationTime = validationEnd - validationStart;
    
    if (validationTime > 100) {
      console.log(`WalletOverviewCard validation time: ${validationTime.toFixed(2)}ms (exceeds 100ms target)`);
    }
  };

  const triggerSync = () => {
    setSyncStatus('syncing');
    
    setTimeout(() => {
      setPortfolio(prev => ({
        ...prev,
        lastSync: new Date()
      }));
      setSyncStatus('synced');
      console.log('🔇 TTS disabled: "Portfolio synced"');
    }, 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900 rounded-lg">
            <Wallet className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Wallet Overview</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{renderTime.toFixed(1)}ms</div>
          {portfolio.zkpVerified && (
            <Shield className="w-4 h-4 text-green-400" title="ZKP Verified" />
          )}
        </div>
      </div>

      {/* DID Identity */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-2">Decentralized Identity</div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              {portfolio.didId}
            </div>
            <button
              onClick={() => handleCopyToClipboard(portfolio.didId, 'did')}
              className="p-1 hover:bg-slate-700 rounded"
            >
              {copiedField === 'did' ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Portfolio Value</div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(portfolio.totalUsdValue)}
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${getChangeColor(portfolio.change24h)}`}>
                {getChangeIcon(portfolio.change24h)} {Math.abs(portfolio.change24h).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-400">24h change</div>
        </div>
      </div>

      {/* Token Holdings */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Holdings</div>
        <div className="space-y-3">
          {portfolio.holdings.map((holding) => (
            <div key={holding.id} className="bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-200">{holding.symbol}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{holding.name}</div>
                    <div className="text-xs text-slate-400">{holding.balance.toFixed(2)} {holding.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-200">
                    {formatCurrency(holding.usdValue)}
                  </div>
                  <div className={`text-xs ${getChangeColor(holding.change24h)}`}>
                    {getChangeIcon(holding.change24h)} {Math.abs(holding.change24h).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* ZKP Verification Hash */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400">ZKP Hash:</div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono text-slate-400">
                    {holding.zkpHash.slice(0, 12)}...
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(holding.zkpHash, holding.id)}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    {copiedField === holding.id ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                  {holding.verified && (
                    <Shield className="w-3 h-3 text-green-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-300 mb-3">Sync Status</div>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-green-400' :
                syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' :
                'bg-red-400'
              }`} />
              <span className="text-sm text-slate-300">
                {syncStatus === 'synced' ? 'Synchronized' :
                 syncStatus === 'syncing' ? 'Syncing...' :
                 'Connection Error'}
              </span>
            </div>
            <button
              onClick={triggerSync}
              disabled={syncStatus === 'syncing'}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:text-slate-500"
            >
              Refresh
            </button>
          </div>
          <div className="text-xs text-slate-400">
            Last sync: {portfolio.lastSync.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
          <TrendingUp className="w-4 h-4" />
          Analytics
        </button>
      </div>
    </div>
  );
};

export default WalletOverviewCard;