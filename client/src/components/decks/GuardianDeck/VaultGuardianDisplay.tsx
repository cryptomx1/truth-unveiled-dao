/**
 * VaultGuardianDisplay.tsx - Mini Guardian Vault Component
 * 
 * Compact component for embedding in vault views to showcase earned TruthCoins
 * with front/back rotation support and guardian badge system.
 * 
 * Features:
 * - Compact display for vault integration
 * - Front/back CID rotation with RotatingTokenDisplay
 * - Guardian badge overlay system
 * - ARIA-compliant mini narration
 * - Genesis detection and special styling
 * - Hover expansion for detailed view
 * 
 * Authority: Commander Mark | Phase X-M Step 1
 * Status: Vault integration component
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Shield, 
  Heart, 
  Palette, 
  Bird, 
  Atom, 
  FileText, 
  Scale,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RotatingTokenDisplay from '../../tokens/RotatingTokenDisplay';

// Guardian icons mapping
const GUARDIAN_ICONS: Record<string, { icon: React.ReactNode; color: string; avatar: string }> = {
  'ATHENA': { icon: <Scale className="w-4 h-4" />, color: 'text-blue-400', avatar: '🏛️' },
  'SOPHIA': { icon: <FileText className="w-4 h-4" />, color: 'text-green-400', avatar: '📚' },
  'ASCLEPIUS': { icon: <Heart className="w-4 h-4" />, color: 'text-red-400', avatar: '🏥' },
  'APOLLO': { icon: <Palette className="w-4 h-4" />, color: 'text-purple-400', avatar: '🎭' },
  'IRENE': { icon: <Bird className="w-4 h-4" />, color: 'text-cyan-400', avatar: '🕊️' },
  'PROMETHEUS': { icon: <Atom className="w-4 h-4" />, color: 'text-orange-400', avatar: '🔬' },
  'HERMES': { icon: <FileText className="w-4 h-4" />, color: 'text-yellow-400', avatar: '📰' },
  'THEMIS': { icon: <Shield className="w-4 h-4" />, color: 'text-indigo-400', avatar: '⚖️' },
  'JASMY': { icon: <Crown className="w-4 h-4" />, color: 'text-gold-400', avatar: '👑' }
};

// TruthCoin structure
interface TruthCoin {
  id: number;
  owner: string;
  name: string;
  frontImageCID: string;
  backImageCID: string;
  guardian: string;
  mintedAt: number;
  isJasmyGenesis: boolean;
}

interface VaultGuardianDisplayProps {
  ownedCoins: TruthCoin[];
  compact?: boolean;
  maxDisplay?: number;
  onGuardianClick?: (coin: TruthCoin) => void;
  className?: string;
}

export default function VaultGuardianDisplay({ 
  ownedCoins = [], 
  compact = false, 
  maxDisplay = 4,
  onGuardianClick,
  className 
}: VaultGuardianDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<TruthCoin | null>(null);

  // TTS for mini narration
  const speakGuardianName = useCallback((guardianName: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Guardian ${guardianName}`);
      utterance.rate = 1.2;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle guardian selection
  const handleGuardianSelect = useCallback((coin: TruthCoin) => {
    setSelectedCoin(coin);
    speakGuardianName(coin.guardian);
    onGuardianClick?.(coin);
  }, [speakGuardianName, onGuardianClick]);

  // Get displayable coins
  const displayCoins = isExpanded ? ownedCoins : ownedCoins.slice(0, maxDisplay);
  const hasMore = ownedCoins.length > maxDisplay;
  const genesisCount = ownedCoins.filter(coin => coin.isJasmyGenesis).length;

  if (ownedCoins.length === 0) {
    return (
      <Card className={cn("bg-slate-800 border-slate-700", className)}>
        <CardContent className="p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-slate-500" />
          <p className="text-sm text-slate-400">No guardians awakened</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-slate-800 border-slate-700", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">Guardian Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {ownedCoins.length} Guardian{ownedCoins.length !== 1 ? 's' : ''}
            </Badge>
            {genesisCount > 0 && (
              <Badge variant="outline" className="text-xs text-gold-400 border-gold-400">
                <Crown className="w-3 h-3 mr-1" />
                Genesis
              </Badge>
            )}
          </div>
        </div>

        {compact ? (
          // Compact horizontal layout
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {displayCoins.map((coin) => {
              const guardian = GUARDIAN_ICONS[coin.guardian];
              return (
                <div
                  key={coin.id}
                  className={cn(
                    "flex-shrink-0 cursor-pointer transition-transform hover:scale-110",
                    coin.isJasmyGenesis && "relative"
                  )}
                  onClick={() => handleGuardianSelect(coin)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Guardian ${coin.guardian}`}
                >
                  <div className="relative">
                    <RotatingTokenDisplay
                      frontCID={coin.frontImageCID}
                      backCID={coin.backImageCID}
                      size={48}
                      guardian={coin.guardian}
                      isGenesis={coin.isJasmyGenesis}
                    />
                    
                    {/* Guardian badge overlay */}
                    <div className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs",
                      coin.isJasmyGenesis ? "bg-gold-400 text-black" : "bg-slate-700 text-white"
                    )}>
                      {guardian?.avatar || '🛡️'}
                    </div>
                    
                    {coin.isJasmyGenesis && (
                      <Sparkles className="absolute -top-2 -left-2 w-3 h-3 text-gold-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
            
            {hasMore && !isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="flex-shrink-0 text-slate-400 hover:text-white"
              >
                +{ownedCoins.length - maxDisplay}
              </Button>
            )}
          </div>
        ) : (
          // Grid layout
          <div className="grid grid-cols-2 gap-3">
            {displayCoins.map((coin) => {
              const guardian = GUARDIAN_ICONS[coin.guardian];
              return (
                <div
                  key={coin.id}
                  className={cn(
                    "group cursor-pointer rounded-lg p-3 transition-all duration-200 hover:bg-slate-700/50",
                    selectedCoin?.id === coin.id && "bg-slate-700 ring-1 ring-blue-400",
                    coin.isJasmyGenesis && "bg-gradient-to-br from-slate-800 to-amber-900/20"
                  )}
                  onClick={() => handleGuardianSelect(coin)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Guardian ${coin.guardian} - ${coin.name}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <RotatingTokenDisplay
                        frontCID={coin.frontImageCID}
                        backCID={coin.backImageCID}
                        size={56}
                        guardian={coin.guardian}
                        isGenesis={coin.isJasmyGenesis}
                      />
                      
                      {coin.isJasmyGenesis && (
                        <div className="absolute -top-1 -right-1">
                          <Crown className="w-4 h-4 text-gold-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm">{guardian?.avatar || '🛡️'}</span>
                        <span className={cn("text-xs font-medium", guardian?.color || "text-slate-400")}>
                          {coin.guardian}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {coin.name}
                      </p>
                      {coin.isJasmyGenesis && (
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-gold-400" />
                          <span className="text-xs text-gold-400 font-medium">Genesis</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Expansion controls for grid layout */}
        {hasMore && !compact && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show {ownedCoins.length - maxDisplay} More
                </>
              )}
            </Button>
          </div>
        )}

        {/* Selected coin details */}
        {selectedCoin && !compact && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                {selectedCoin.guardian} Details
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCoin(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Token ID:</span>
                <span>#{selectedCoin.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Minted:</span>
                <span>{new Date(selectedCoin.mintedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className={selectedCoin.isJasmyGenesis ? "text-gold-400" : "text-blue-400"}>
                  {selectedCoin.isJasmyGenesis ? 'Genesis' : 'Pillar'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}