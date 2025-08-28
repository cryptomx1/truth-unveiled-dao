import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, AlertCircle, Lock, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  truthPoints: number;
  contributionCredits: number;
  referralBoost: number;
  tpAddress: string;
  zkpHash: string;
}

interface WalletBalanceCardProps {
  balance?: WalletBalance;
  onCopySuccess?: (text: string) => void;
  onCopyError?: (error: Error) => void;
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

interface CopyButtonProps {
  targetText: string;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Mock wallet data as per JASMY specifications
const MOCK_BALANCE: WalletBalance = {
  truthPoints: 3421,
  contributionCredits: 142,
  referralBoost: 15,
  tpAddress: '0xTP742d35Cc6734C0532925a3b8D4521d3f',
  zkpHash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c'
};

const TTS_MESSAGE = "Tracking your civic earnings in real time.";

// Copy button component with fallback functionality
const CopyButton: React.FC<CopyButtonProps> = ({
  targetText,
  label,
  size = 'sm',
  className,
  onSuccess,
  onError
}) => {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleCopy = async () => {
    setCopyState('copying');

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(targetText);
      } else {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = targetText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }

      setCopyState('success');
      onSuccess?.();

      // Reset state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setCopyState('idle');
      }, 2000);

    } catch (error) {
      setCopyState('error');
      onError?.(error as Error);

      // Reset state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setCopyState('idle');
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getButtonContent = () => {
    switch (copyState) {
      case 'copying':
        return (
          <>
            <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-xs">Copying...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check className="w-3 h-3" />
            <span className="text-xs">Copied!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-3 h-3" />
            <span className="text-xs">Failed</span>
          </>
        );
      default:
        return (
          <>
            <Copy className="w-3 h-3" />
            <span className="text-xs">{label}</span>
          </>
        );
    }
  };

  const getButtonStyles = () => {
    if (copyState === 'success') {
      return 'bg-green-500 hover:bg-green-600 text-white';
    }
    if (copyState === 'error') {
      return 'bg-red-500 hover:bg-red-600 text-white';
    }
    
    return 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400';
  };

  const sizeClasses = size === 'md' ? 'px-3 py-2' : 'px-2 py-1';

  return (
    <Button
      onClick={handleCopy}
      disabled={copyState === 'copying'}
      className={cn(
        'flex items-center space-x-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400/50',
        getButtonStyles(),
        sizeClasses,
        className
      )}
      aria-label={`Copy ${label} to clipboard`}
      data-testid={`copy-${label.toLowerCase().replace(/\s+/g, '-')}-button`}
    >
      {getButtonContent()}
    </Button>
  );
};

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = React.memo(({
  balance = MOCK_BALANCE,
  onCopySuccess,
  onCopyError,
  className
}) => {
  const [viewMode, setViewMode] = useState<'tp' | 'cc'>('tp');
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const { toast } = useToast();

  // Initialize TTS on component mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        // Check if Speech Synthesis is supported
        if ('speechSynthesis' in window) {
          // Wait for voices to be loaded
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

          // TTS completely disabled with nuclear override
          console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
          console.log(`🔇 EMERGENCY TTS KILLER ACTIVATED - MESSAGE BLOCKED: "${TTS_MESSAGE}"`);
          setTtsStatus({ isReady: false, isPlaying: false, error: 'TTS blocked by nuclear override' });

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
    if (renderTime > 125) {
      console.warn(`WalletBalanceCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`WalletBalanceCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  const handleCopySuccess = (text: string) => {
    toast({
      title: "Copied to clipboard",
      description: `${text.substring(0, 20)}${text.length > 20 ? '...' : ''} copied successfully`,
    });
    onCopySuccess?.(text);
  };

  const handleCopyError = (error: Error) => {
    toast({
      title: "Copy failed",
      description: "Unable to copy to clipboard. Please try again.",
      variant: "destructive",
    });
    onCopyError?.(error);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'tp' ? 'cc' : 'tp');
  };

  const currentBalance = viewMode === 'tp' ? balance.truthPoints : balance.contributionCredits;
  const currentToken = viewMode === 'tp' ? 'Truth Points' : 'Contribution Credits';
  const currentTokenSymbol = viewMode === 'tp' ? 'TP' : 'CC';

  return (
    <div 
      className={cn(
        'dao-card-gradient border border-[hsl(var(--dao-border))] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 min-w-[300px] max-w-[460px] h-auto overflow-y-auto',
        className
      )}
      role="region"
      aria-label="Civic Wallet Balance"
      data-testid="wallet-balance-card"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 dao-primary-gradient rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{currentTokenSymbol}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Civic Wallet
            </h2>
            <p className="text-sm text-gray-300">
              Balance Tracking
            </p>
          </div>
        </div>
        
        {/* Token Toggle */}
        <Button
          onClick={toggleViewMode}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
          aria-label={`Switch to ${viewMode === 'tp' ? 'Contribution Credits' : 'Truth Points'}`}
          aria-pressed={viewMode === 'cc'}
        >
          {viewMode === 'tp' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
          <span className="text-xs font-medium">{viewMode.toUpperCase()}</span>
        </Button>
      </div>

      {/* Balance Display */}
      <div className="bg-white/10 rounded-lg p-6 border border-white/20 mb-4">
        <div className="text-center">
          <div 
            className="text-3xl font-bold text-white mb-2"
            aria-live="polite"
            aria-label={`Current ${currentToken} balance: ${formatNumber(currentBalance)}`}
          >
            {formatNumber(currentBalance)}
          </div>
          <div className="text-sm text-gray-300 mb-4">
            {currentToken}
          </div>
          
          {/* Token Badge */}
          <div className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
            viewMode === 'tp' 
              ? "bg-blue-500/20 text-blue-400" 
              : "bg-purple-500/20 text-purple-400"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full mr-2",
              viewMode === 'tp' ? "bg-blue-400" : "bg-purple-400"
            )} />
            {currentTokenSymbol}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <label 
          className="block text-sm font-medium text-white mb-2" 
          htmlFor="tp-address"
        >
          Truth Points Address
        </label>
        <div className="flex items-center justify-between">
          <span 
            className="font-mono text-sm text-white truncate flex-1 mr-2"
            id="tp-address"
            title={balance.tpAddress}
          >
            {balance.tpAddress.substring(0, 20)}...{balance.tpAddress.substring(balance.tpAddress.length - 6)}
          </span>
          <CopyButton
            targetText={balance.tpAddress}
            label="Copy"
            onSuccess={() => handleCopySuccess(balance.tpAddress)}
            onError={handleCopyError}
          />
        </div>
      </div>

      {/* Referral Boost */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Referral Boost
          </span>
          <span className="text-sm font-medium text-green-400">
            +{balance.referralBoost}%
          </span>
        </div>
      </div>

      {/* ZKP Hash */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            ZKP Hash
          </span>
        </div>
        <div className="bg-black/30 rounded p-3 border border-green-400/30">
          <span 
            className="font-mono text-xs text-green-400 break-all"
            title="Zero-Knowledge Proof Hash"
          >
            {balance.zkpHash}
          </span>
        </div>
      </div>

      {/* TTS Status Indicator */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Balance Tracking</span>
          <div className="flex items-center space-x-2">
            <div 
              className={cn(
                "w-2 h-2 bg-green-400 rounded-full",
                ttsStatus.isPlaying ? "animate-pulse" : "",
                !ttsStatus.isReady ? "bg-gray-500" : ""
              )}
            />
            <span 
              className={cn(
                "font-medium",
                ttsStatus.isReady ? "text-green-400" : "text-gray-500"
              )}
              aria-live="polite"
            >
              {ttsStatus.error ? "Error" : ttsStatus.isPlaying ? "Active" : ttsStatus.isReady ? "Ready" : "Initializing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { WalletBalanceCard };
export default WalletBalanceCard;