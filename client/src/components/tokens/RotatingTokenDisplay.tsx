// RotatingTokenDisplay.tsx - 3D rotating token visualizer for TruthCoins
// Phase XXXIII implementation - Commander Mark authorization via JASMY Relay

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface RotatingTokenDisplayProps {
  frontCID: string;
  backCID: string;
  guardian?: string;  // Optional mythic name (for badge overlay)
  isGenesis?: boolean;
  size?: number;      // Optional pixel size (default: 300px)
  className?: string;
  onImageLoad?: () => void;
}

interface ImageLoadState {
  front: boolean;
  back: boolean;
  frontError: boolean;
  backError: boolean;
}

export const RotatingTokenDisplay: React.FC<RotatingTokenDisplayProps> = ({
  frontCID,
  backCID,
  guardian,
  isGenesis = false,
  size = 300,
  className = '',
  onImageLoad
}) => {
  const [imageState, setImageState] = useState<ImageLoadState>({
    front: false,
    back: false,
    frontError: false,
    backError: false
  });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // IPFS gateway URLs
  const frontImageUrl = `https://gateway.pinata.cloud/ipfs/${frontCID}`;
  const backImageUrl = `https://gateway.pinata.cloud/ipfs/${backCID}`;

  // Handle image loading
  const handleImageLoad = (side: 'front' | 'back') => {
    setImageState(prev => {
      const newState = { ...prev, [side]: true };
      
      // Trigger callback when both images are loaded
      if (newState.front && newState.back && onImageLoad) {
        onImageLoad();
      }
      
      return newState;
    });
  };

  const handleImageError = (side: 'front' | 'back') => {
    setImageState(prev => ({ ...prev, [`${side}Error`]: true }));
    console.error(`❌ Failed to load ${side} image for TruthCoin CID:`, side === 'front' ? frontCID : backCID);
  };

  // ARIA narration for accessibility
  const ariaLabel = guardian 
    ? `Token: ${guardian}. Rotating view. Front and back.` 
    : `TruthCoin rotating view. Front and back.`;

  const isLoading = !imageState.front || !imageState.back;
  const hasErrors = imageState.frontError || imageState.backError;
  const bothImagesLoaded = imageState.front && imageState.back;

  // TTS narration on hover
  useEffect(() => {
    if (isHovered && bothImagesLoaded) {
      // Only announce if both images are successfully loaded
      const announcement = guardian 
        ? `Viewing ${guardian} TruthCoin. ${isGenesis ? 'Genesis token. ' : ''}Rotating display active.`
        : `TruthCoin rotating display. ${isGenesis ? 'Genesis token. ' : ''}`;
      
      console.log(`🔊 TTS: ${announcement}`);
    }
  }, [isHovered, bothImagesLoaded, guardian, isGenesis]);

  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Guardian/Genesis Badge */}
      {(guardian || isGenesis) && (
        <div className="absolute top-2 left-2 z-20">
          {guardian && (
            <Badge 
              className="bg-amber-600/90 text-white text-xs font-bold backdrop-blur-sm"
              style={{ fontSize: Math.max(8, size / 30) }}
            >
              {guardian}
            </Badge>
          )}
          {isGenesis && (
            <Badge 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold mt-1 backdrop-blur-sm"
              style={{ fontSize: Math.max(8, size / 30) }}
            >
              GENESIS
            </Badge>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasErrors && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-full backdrop-blur-sm"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <div className="text-center">
            <Loader2 
              className="animate-spin text-blue-400 mx-auto mb-2" 
              size={Math.max(24, size / 12)}
            />
            <p 
              className="text-slate-300 text-xs"
              style={{ fontSize: Math.max(10, size / 30) }}
            >
              Loading TruthCoin...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasErrors && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-full backdrop-blur-sm border-2 border-red-500/30"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <div className="text-center p-4">
            <div 
              className="text-red-400 font-bold mb-2"
              style={{ fontSize: Math.max(12, size / 25) }}
            >
              ⚠️ Load Error
            </div>
            <p 
              className="text-slate-300 text-xs"
              style={{ fontSize: Math.max(10, size / 30) }}
            >
              IPFS CID failed
            </p>
          </div>
        </div>
      )}

      {/* 3D Rotating Token Container */}
      <div 
        className="token-container"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: `${size * 3}px`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="token-rotator"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            animation: 'tokenRotateY 10s linear infinite'
          }}
        >
          {/* Front Face */}
          <div 
            className="token-face token-front"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(1px)'
            }}
          >
            <img
              src={frontImageUrl}
              alt={`${guardian || 'TruthCoin'} front face`}
              className="w-full h-full object-contain"
              style={{ 
                borderRadius: '50%',
                background: 'transparent'
              }}
              onLoad={() => handleImageLoad('front')}
              onError={() => handleImageError('front')}
              loading="lazy"
            />
          </div>

          {/* Back Face */}
          <div 
            className="token-face token-back"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)'
            }}
          >
            <img
              src={backImageUrl}
              alt={`${guardian || 'TruthCoin'} back face`}
              className="w-full h-full object-contain"
              style={{ 
                borderRadius: '50%',
                background: 'transparent'
              }}
              onLoad={() => handleImageLoad('back')}
              onError={() => handleImageError('back')}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && bothImagesLoaded && (
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: isGenesis 
              ? 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Global styles for 3D token rotation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes tokenRotateY {
            from {
              transform: rotateY(0deg);
            }
            to {
              transform: rotateY(360deg);
            }
          }
          
          .token-container {
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
          }
          
          .token-face img {
            filter: brightness(1.1) contrast(1.05);
            transition: filter 0.3s ease;
          }
          
          .token-container:hover .token-face img {
            filter: brightness(1.2) contrast(1.1);
          }
        `
      }} />
    </div>
  );
};

// Export utility function for IPFS CID validation
export const validateTruthCoinCIDs = (frontCID: string, backCID: string): boolean => {
  const cidPattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  return cidPattern.test(frontCID) && cidPattern.test(backCID);
};

// Export component props type for external usage
export type { RotatingTokenDisplayProps };

export default RotatingTokenDisplay;