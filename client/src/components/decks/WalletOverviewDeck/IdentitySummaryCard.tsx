import React, { useState, useEffect, useRef } from 'react';
import { Copy, User, Check, AlertCircle, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import type { IdentitySummaryCardProps, TTSStatus, CopyButtonProps, UserIdentity } from './types';
import TTSToggle from '@/components/tts/TTSToggle';
import LangToggle from '@/components/tts/LangToggle';

// Mock identity data as per JASMY specifications
const MOCK_IDENTITY: UserIdentity = {
  did: 'did:tu:0xA1B2C3D4E5F6G7H8',
  walletAddress: '0xFEEDBEEF1234567890',
  civicStatus: 'Verified',
  referralCode: 'TU-9XQ4Z2'
};

const TTS_MESSAGE = "Your decentralized identity is secure and synced.";

// Copy button component with fallback functionality
const CopyButton: React.FC<CopyButtonProps> = ({
  targetText,
  label,
  variant = 'primary',
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
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-xs">Copying...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check className="w-4 h-4" />
            <span className="text-xs">Copied!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Failed</span>
          </>
        );
      default:
        return (
          <>
            <Copy className="w-4 h-4" />
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
    
    if (variant === 'accent') {
      return 'bg-[hsl(var(--dao-accent))] hover:bg-[hsl(var(--dao-accent))]/80 text-white';
    }
    
    return 'bg-[hsl(var(--dao-primary))]/20 hover:bg-[hsl(var(--dao-primary))]/30 text-[hsl(var(--dao-primary))]';
  };

  const sizeClasses = size === 'md' ? 'px-3 py-2' : 'px-2 py-1';

  return (
    <Button
      onClick={handleCopy}
      disabled={copyState === 'copying'}
      className={cn(
        'flex items-center space-x-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--dao-primary))]/50',
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

const IdentitySummaryCard: React.FC<IdentitySummaryCardProps> = React.memo(({
  identity = MOCK_IDENTITY,
  onCopySuccess,
  onCopyError,
  className
}) => {
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
      console.warn(`IdentitySummaryCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`IdentitySummaryCard render time: ${renderTime.toFixed(2)}ms ✅`);
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

  const truncateAddress = (address: string, startChars = 6, endChars = 4) => {
    if (address.length <= startChars + endChars + 3) return address;
    return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
  };

  return (
    <div 
      className={cn(
        'dao-card-gradient border border-[hsl(var(--dao-border))] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 min-w-[300px] max-w-[460px] h-auto overflow-y-auto',
        className
      )}
      role="region"
      aria-label="Decentralized Identity Summary"
      data-testid="identity-summary-card"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 dao-primary-gradient rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Identity Summary
            </h2>
            <p className="text-sm text-gray-300">
              Decentralized Profile
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* REPAIR: Working TTS Toggle with LangToggle */}
          <TTSToggle
            deckId="wallet-overview"
            moduleId="identity-summary"
            content={`Identity Summary. Your decentralized identifier is ${identity.did}. Wallet address is ${identity.walletAddress}. Civic status is ${identity.civicStatus}. Referral code is ${identity.referralCode}.`}
            size="sm"
            variant="outline"
            mode="standard"
          />
          
          <LangToggle
            deckId="wallet-overview"
            moduleId="identity-summary"
            variant="compact"
            showTutorialLink={true}
          />
          
          {/* ZKP Indicator */}
          <div 
            className="flex items-center space-x-1 bg-[hsl(var(--dao-accent))]/20 px-2 py-1 rounded-full"
            title="Zero-Knowledge Proof Enabled"
            aria-label="Zero-Knowledge Proof Status: Active"
          >
            <div className={cn(
              "w-2 h-2 bg-green-400 rounded-full",
              ttsStatus.isPlaying ? "animate-pulse" : ""
            )} />
            <span className="text-xs text-green-400 font-medium">ZKP</span>
          </div>
        </div>
      </div>

      {/* Identity Fields */}
      <div className="space-y-4">
        {/* DID Display */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <label 
            className="block text-sm font-medium text-white mb-2" 
            htmlFor="did-display"
          >
            Decentralized Identifier (DID)
          </label>
          <div className="flex items-center justify-between">
            <span 
              className="font-mono text-sm text-white truncate flex-1 mr-2"
              id="did-display"
              title={identity.did}
            >
              {window.innerWidth < 768 ? truncateAddress(identity.did, 8, 6) : identity.did}
            </span>
            <CopyButton
              targetText={identity.did}
              label="Copy"
              onSuccess={() => handleCopySuccess(identity.did)}
              onError={handleCopyError}
            />
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <label 
            className="block text-sm font-medium text-white mb-2" 
            htmlFor="wallet-address"
          >
            Wallet Address
          </label>
          <div className="flex items-center justify-between">
            <span 
              className="font-mono text-sm text-white truncate flex-1 mr-2"
              id="wallet-address"
              title={identity.walletAddress}
            >
              {truncateAddress(identity.walletAddress)}
            </span>
            <CopyButton
              targetText={identity.walletAddress}
              label="Copy"
              onSuccess={() => handleCopySuccess(identity.walletAddress)}
              onError={handleCopyError}
            />
          </div>
        </div>

        {/* Civic Status */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">
              Civic Status
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-lg" aria-hidden="true">
                {identity.civicStatus === 'Verified' ? '✅' : '⚪'}
              </span>
              <span className={cn(
                "text-sm font-medium",
                identity.civicStatus === 'Verified' ? "text-green-400" : "text-gray-400"
              )}>
                {identity.civicStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Referral Code with QR Code */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <label 
            className="block text-sm font-medium text-white mb-3" 
            htmlFor="referral-code"
          >
            Referral Code (TruthUnveiled.io)
          </label>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span 
                className="font-mono text-lg font-semibold text-white tracking-wider block mb-3"
                id="referral-code"
              >
                {identity.referralCode}
              </span>
              
              <div className="flex gap-2">
                <CopyButton
                  targetText={identity.referralCode}
                  label="Copy"
                  variant="accent"
                  size="md"
                  onSuccess={() => handleCopySuccess(identity.referralCode)}
                  onError={handleCopyError}
                />
                
                <Button
                  onClick={() => {
                    const qrUrl = `https://truthunveiled.io/ref/${identity.referralCode}`;
                    handleCopySuccess(qrUrl);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors duration-150"
                  size="sm"
                  aria-label="Copy referral URL"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs">URL</span>
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG 
                value={`https://truthunveiled.io/ref/${identity.referralCode}`}
                size={80}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        {/* ZKP Placeholder */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <label 
            className="block text-sm font-medium text-white mb-2" 
            htmlFor="zkp-hash"
          >
            ZKP Hash
          </label>
          <div className="bg-black/30 rounded p-3 border border-green-400/30">
            <span 
              className="font-mono text-xs text-green-400 break-all"
              id="zkp-hash"
              title="Zero-Knowledge Proof Hash (Placeholder)"
            >
              0x7f9a2b8c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c
            </span>
          </div>
        </div>
      </div>

      {/* TTS Status Indicator */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Text-to-Speech</span>
          <div className="flex items-center space-x-2">
            <div 
              className={cn(
                "w-2 h-2 bg-green-400 rounded-full",
                ttsStatus.isPlaying ? "animate-pulse" : "",
                !ttsStatus.isReady ? "bg-gray-500" : ""
              )}
              id="tts-indicator"
            />
            <span 
              className={cn(
                "font-medium",
                ttsStatus.isReady ? "text-green-400" : "text-gray-500"
              )}
              id="tts-status" 
              aria-live="polite"
            >
              {ttsStatus.error ? "Error" : ttsStatus.isPlaying ? "Playing" : ttsStatus.isReady ? "Ready" : "Initializing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { IdentitySummaryCard };
export default IdentitySummaryCard;
