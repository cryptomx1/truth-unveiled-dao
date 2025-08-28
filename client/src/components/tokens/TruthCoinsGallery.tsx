// TruthCoinsGallery.tsx - Gallery display for all minted TruthCoins
// Integration with RotatingTokenDisplay.tsx for Phase XXXIII

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotatingTokenDisplay } from './RotatingTokenDisplay';
import { Grid, List, Eye, Coins } from 'lucide-react';

interface TruthCoin {
  id: string;
  frontCID: string;
  backCID: string;
  guardian?: string;
  isGenesis: boolean;
  mintedAt: string;
  pillarType: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'genesis';
}

interface TruthCoinsGalleryProps {
  showGenesis?: boolean;
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const TruthCoinsGallery: React.FC<TruthCoinsGalleryProps> = ({
  showGenesis = true,
  maxDisplay,
  size = 'medium',
  viewMode = 'grid',
  className = ''
}) => {
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(viewMode);
  const [loadedTokens, setLoadedTokens] = useState(0);

  // Mock TruthCoins data - in production this would come from blockchain/IPFS
  const mockTruthCoins: TruthCoin[] = [
    {
      id: 'genesis-001',
      frontCID: 'QmTruthGenesisFrontCID123456789ABCDEF',
      backCID: 'QmTruthGenesisBackCID123456789ABCDEF',
      guardian: 'ATHENA',
      isGenesis: true,
      mintedAt: '2025-07-20T15:30:00Z',
      pillarType: 'All Pillars Fused',
      rarity: 'genesis'
    },
    {
      id: 'governance-001',
      frontCID: 'QmGovernanceFrontCID123456789ABCDEF',
      backCID: 'QmGovernanceBackCID123456789ABCDEF',
      guardian: 'JASMY',
      isGenesis: false,
      mintedAt: '2025-07-20T14:15:00Z',
      pillarType: 'Governance',
      rarity: 'legendary'
    },
    {
      id: 'education-001',
      frontCID: 'QmEducationFrontCID123456789ABCDEF',
      backCID: 'QmEducationBackCID123456789ABCDEF',
      guardian: 'WISDOM',
      isGenesis: false,
      mintedAt: '2025-07-20T13:45:00Z',
      pillarType: 'Education',
      rarity: 'epic'
    },
    {
      id: 'health-001',
      frontCID: 'QmHealthFrontCID123456789ABCDEF',
      backCID: 'QmHealthBackCID123456789ABCDEF',
      guardian: 'VITA',
      isGenesis: false,
      mintedAt: '2025-07-20T12:30:00Z',
      pillarType: 'Health',
      rarity: 'rare'
    },
    {
      id: 'culture-001',
      frontCID: 'QmCultureFrontCID123456789ABCDEF',
      backCID: 'QmCultureBackCID123456789ABCDEF',
      guardian: 'APOLLO',
      isGenesis: false,
      mintedAt: '2025-07-20T11:20:00Z',
      pillarType: 'Culture',
      rarity: 'common'
    }
  ];

  // Filter tokens based on props
  const displayTokens = mockTruthCoins
    .filter(token => showGenesis || !token.isGenesis)
    .slice(0, maxDisplay);

  // Size configurations
  const sizeMap = {
    small: 150,
    medium: 250,
    large: 350
  };

  const tokenSize = sizeMap[size];

  const handleTokenLoad = () => {
    setLoadedTokens(prev => prev + 1);
  };

  const getRarityColor = (rarity: TruthCoin['rarity']): string => {
    switch (rarity) {
      case 'genesis': return 'bg-gradient-to-r from-purple-600 to-pink-600';
      case 'legendary': return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      case 'common': return 'bg-gradient-to-r from-gray-500 to-slate-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <Card className={`w-full bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">
              TruthCoins Gallery
            </CardTitle>
            <Badge className="bg-blue-600/30 text-blue-200">
              {displayTokens.length} Tokens
            </Badge>
            {loadedTokens > 0 && (
              <Badge className="bg-green-600/30 text-green-200">
                {loadedTokens} Loaded
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentViewMode('grid')}
              className={`${currentViewMode === 'grid' ? 'bg-blue-600/20 border-blue-500' : 'border-slate-600'}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentViewMode('list')}
              className={`${currentViewMode === 'list' ? 'bg-blue-600/20 border-blue-500' : 'border-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {displayTokens.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No TruthCoins to display</p>
            <p className="text-slate-500 text-sm mt-2">
              Mint your first TruthCoin by completing civic pillars
            </p>
          </div>
        ) : (
          <>
            {currentViewMode === 'grid' ? (
              <div 
                className="grid gap-6 justify-items-center"
                style={{
                  gridTemplateColumns: `repeat(auto-fit, minmax(${tokenSize}px, 1fr))`
                }}
              >
                {displayTokens.map((token) => (
                  <div key={token.id} className="text-center space-y-3">
                    <RotatingTokenDisplay
                      frontCID={token.frontCID}
                      backCID={token.backCID}
                      guardian={token.guardian}
                      isGenesis={token.isGenesis}
                      size={tokenSize}
                      onImageLoad={handleTokenLoad}
                      className="mx-auto"
                    />
                    
                    <div className="space-y-2">
                      <Badge className={getRarityColor(token.rarity)}>
                        {token.rarity.toUpperCase()}
                      </Badge>
                      
                      <p className="text-white font-semibold">
                        {token.guardian || 'TruthCoin'}
                      </p>
                      
                      <p className="text-slate-300 text-sm">
                        {token.pillarType}
                      </p>
                      
                      <p className="text-slate-500 text-xs">
                        Minted: {new Date(token.mintedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayTokens.map((token) => (
                  <div 
                    key={token.id} 
                    className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                  >
                    <RotatingTokenDisplay
                      frontCID={token.frontCID}
                      backCID={token.backCID}
                      guardian={token.guardian}
                      isGenesis={token.isGenesis}
                      size={80}
                      onImageLoad={handleTokenLoad}
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold">
                          {token.guardian || 'TruthCoin'}
                        </h3>
                        <Badge className={getRarityColor(token.rarity)}>
                          {token.rarity}
                        </Badge>
                        {token.isGenesis && (
                          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                            GENESIS
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-300">
                        Pillar: {token.pillarType}
                      </p>
                      
                      <p className="text-slate-500 text-sm">
                        Minted: {new Date(token.mintedAt).toLocaleString()}
                      </p>
                      
                      <div className="flex gap-2 text-xs text-slate-400">
                        <span>Front: {token.frontCID.slice(0, 16)}...</span>
                        <span>Back: {token.backCID.slice(0, 16)}...</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="border-slate-600">
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-6 pt-4 border-t border-slate-600">
              <p className="text-slate-400 text-sm">
                Phase XXXIII: 3D Token Display System Active
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Authority: Commander Mark via JASMY Relay
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TruthCoinsGallery;