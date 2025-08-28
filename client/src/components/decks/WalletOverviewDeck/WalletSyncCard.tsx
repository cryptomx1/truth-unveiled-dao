import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RefreshCw, Shield, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WalletSyncStatus {
  isSynced: boolean;
  lastSyncTime: Date;
  syncProgress: number;
}

interface WalletSyncCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const TTS_MESSAGE = "Your wallet is secure and synchronized across the network.";

export const WalletSyncCard: React.FC<WalletSyncCardProps> = ({ className }) => {
  const [syncStatus, setSyncStatus] = useState<WalletSyncStatus>({
    isSynced: true,
    lastSyncTime: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    syncProgress: 100
  });
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    if (renderTime > 125) {
      console.warn(`WalletSyncCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`WalletSyncCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // Auto-update timestamp every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: prev.lastSyncTime // Keep the same time, just trigger re-render for "time ago"
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Simulate occasional sync state changes
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setSyncStatus(prev => {
        // Occasionally toggle sync status for demo
        const shouldToggle = Math.random() < 0.1; // 10% chance
        if (shouldToggle) {
          return {
            ...prev,
            isSynced: !prev.isSynced,
            lastSyncTime: prev.isSynced ? prev.lastSyncTime : new Date(),
            syncProgress: prev.isSynced ? Math.floor(Math.random() * 80) + 20 : 100
          };
        }
        return prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(statusInterval);
  }, []);

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

  const handleManualSync = async () => {
    if (syncStatus.isSynced) return;

    setIsRefreshing(true);
    
    // Simulate sync process
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus({
        isSynced: true,
        lastSyncTime: new Date(),
        syncProgress: 100
      });
      
      toast({
        title: "Sync Complete",
        description: "Your wallet is now synchronized with the network.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div 
      className={cn(
        'dao-card-gradient border border-[hsl(var(--dao-border))] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 max-w-sm mx-auto',
        className
      )}
      role="region"
      aria-label="Wallet Synchronization Status"
      data-testid="wallet-sync-card"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 dao-primary-gradient rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Wallet Sync
            </h2>
            <p className="text-sm text-gray-300">
              Network Status
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
          aria-label={ttsStatus.isPlaying ? 'Stop security message' : 'Play security message'}
          data-testid="tts-toggle-button"
        >
          {ttsStatus.isPlaying ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Sync Status Display */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">
            Sync Status
          </span>
          <div className="flex items-center space-x-2">
            {/* Animated Status LED */}
            <div className="relative">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  syncStatus.isSynced 
                    ? "bg-green-400 animate-pulse" 
                    : "bg-yellow-400"
                )}
              />
              {!syncStatus.isSynced && (
                <div className="absolute inset-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75" />
              )}
            </div>
            <span 
              className={cn(
                "text-sm font-medium",
                syncStatus.isSynced ? "text-green-400" : "text-yellow-400"
              )}
              aria-live="polite"
            >
              {syncStatus.isSynced ? "🟢 Synced to Network" : "🟡 Sync Pending"}
            </span>
          </div>
        </div>
        
        {/* Sync Progress Bar (only show when pending) */}
        {!syncStatus.isSynced && (
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncStatus.syncProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              {syncStatus.syncProgress}% complete
            </p>
          </div>
        )}
      </div>

      {/* Last Sync Time */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Last Sync
          </span>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">
              {getTimeAgo(syncStatus.lastSyncTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Sync Button */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-white">
              Manual Sync
            </span>
            <p className="text-xs text-gray-400 mt-1">
              Only required if sync falls behind
            </p>
          </div>
          <Button
            onClick={handleManualSync}
            disabled={syncStatus.isSynced || isRefreshing}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors duration-150',
              syncStatus.isSynced || isRefreshing
                ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
            aria-label="Manually sync wallet"
            data-testid="manual-sync-button"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Network Connection Info */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="flex items-center justify-center space-x-2 text-center">
          <div className="flex items-center space-x-2">
            {syncStatus.isSynced ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-xs text-gray-400">
              {syncStatus.isSynced ? 'Connected to DAO Network' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* TTS Status Indicator */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Security Voice</span>
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

export default WalletSyncCard;