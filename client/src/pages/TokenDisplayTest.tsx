// TokenDisplayTest.tsx - Test page for Phase XXXIII 3D token display system
// Demonstrates RotatingTokenDisplay.tsx functionality for GROK QA

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotatingTokenDisplay } from '@/components/tokens/RotatingTokenDisplay';
import { TruthCoinsGallery } from '@/components/tokens/TruthCoinsGallery';
import { DeckModulePreview } from '@/components/preview/DeckModulePreview';
import { Coins, Palette, Grid, Eye, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export const TokenDisplayTest: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentDemo, setCurrentDemo] = useState<'single' | 'gallery' | 'preview'>('single');

  // Mock IPFS CIDs for demonstration
  const mockTokens = [
    {
      name: 'Genesis Fusion Token',
      frontCID: 'QmTruthGenesisFrontCID123456789ABCDEF',
      backCID: 'QmTruthGenesisBackCID123456789ABCDEF',
      guardian: 'ATHENA',
      isGenesis: true
    },
    {
      name: 'Governance Pillar',
      frontCID: 'QmGovernanceFrontCID123456789ABCDEF',
      backCID: 'QmGovernanceBackCID123456789ABCDEF',
      guardian: 'JASMY',
      isGenesis: false
    },
    {
      name: 'Education Pillar',
      frontCID: 'QmEducationFrontCID123456789ABCDEF',
      backCID: 'QmEducationBackCID123456789ABCDEF',
      guardian: 'WISDOM',
      isGenesis: false
    },
    {
      name: 'Justice Pillar',
      frontCID: 'QmJusticeFrontCID123456789ABCDEF',
      backCID: 'QmJusticeBackCID123456789ABCDEF',
      guardian: 'JUSTICE',
      isGenesis: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-amber-400" />
                <div>
                  <CardTitle className="text-white text-2xl">
                    Phase XXXIII: 3D Token Display System
                  </CardTitle>
                  <p className="text-slate-300">
                    Rotating TruthCoin visualization with IPFS integration
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/command')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Command
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Demo Mode Selector */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-center">
              <Button
                variant={currentDemo === 'single' ? 'default' : 'outline'}
                onClick={() => setCurrentDemo('single')}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Single Token Demo
              </Button>
              <Button
                variant={currentDemo === 'gallery' ? 'default' : 'outline'}
                onClick={() => setCurrentDemo('gallery')}
                className="flex items-center gap-2"
              >
                <Grid className="w-4 h-4" />
                Gallery Demo
              </Button>
              <Button
                variant={currentDemo === 'preview' ? 'default' : 'outline'}
                onClick={() => setCurrentDemo('preview')}
                className="flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Module Preview Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Single Token Demo */}
        {currentDemo === 'single' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/90 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Individual Token Display
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 justify-items-center">
                  {mockTokens.map((token, index) => (
                    <div key={index} className="text-center space-y-4">
                      <RotatingTokenDisplay
                        frontCID={token.frontCID}
                        backCID={token.backCID}
                        guardian={token.guardian}
                        isGenesis={token.isGenesis}
                        size={250}
                      />
                      
                      <div className="space-y-2">
                        <h3 className="text-white font-semibold">
                          {token.name}
                        </h3>
                        <div className="flex gap-2 justify-center">
                          <Badge className="bg-amber-600/30 text-amber-200">
                            {token.guardian}
                          </Badge>
                          {token.isGenesis && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                              GENESIS
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>Front: {token.frontCID.slice(0, 20)}...</p>
                          <p>Back: {token.backCID.slice(0, 20)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Size Variations */}
            <Card className="bg-slate-800/90 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Size Variations (150px, 200px, 300px)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8 justify-center items-end">
                  <div className="text-center">
                    <RotatingTokenDisplay
                      frontCID={mockTokens[0].frontCID}
                      backCID={mockTokens[0].backCID}
                      guardian={mockTokens[0].guardian}
                      isGenesis={mockTokens[0].isGenesis}
                      size={150}
                    />
                    <p className="text-slate-300 text-sm mt-2">150px</p>
                  </div>
                  
                  <div className="text-center">
                    <RotatingTokenDisplay
                      frontCID={mockTokens[1].frontCID}
                      backCID={mockTokens[1].backCID}
                      guardian={mockTokens[1].guardian}
                      size={200}
                    />
                    <p className="text-slate-300 text-sm mt-2">200px</p>
                  </div>
                  
                  <div className="text-center">
                    <RotatingTokenDisplay
                      frontCID={mockTokens[2].frontCID}
                      backCID={mockTokens[2].backCID}
                      guardian={mockTokens[2].guardian}
                      size={300}
                    />
                    <p className="text-slate-300 text-sm mt-2">300px</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gallery Demo */}
        {currentDemo === 'gallery' && (
          <TruthCoinsGallery 
            showGenesis={true}
            size="medium"
            viewMode="grid"
          />
        )}

        {/* Module Preview Demo */}
        {currentDemo === 'preview' && (
          <DeckModulePreview 
            modules={[]}
            showTokenRewards={true}
          />
        )}

        {/* Technical Specifications */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-blue-400 font-semibold">Features</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• 360° Y-axis rotation (10-second cycle)</li>
                  <li>• Dual IPFS CID support (front/back faces)</li>
                  <li>• Transparent edge rendering</li>
                  <li>• Guardian badge overlays</li>
                  <li>• Genesis token special effects</li>
                  <li>• Responsive sizing (150px-350px)</li>
                  <li>• ARIA accessibility compliance</li>
                  <li>• Loading/error state handling</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-green-400 font-semibold">Performance</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• CSS3 3D transforms with hardware acceleration</li>
                  <li>• Lazy image loading for IPFS optimization</li>
                  <li>• Less than 300ms transition times</li>
                  <li>• Efficient re-render cycles</li>
                  <li>• Memory-optimized image caching</li>
                  <li>• Mobile-responsive (48px+ tap targets)</li>
                  <li>• Graceful fallbacks for IPFS failures</li>
                  <li>• TTS integration for accessibility</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-600 text-center text-sm">
              <Badge className="bg-amber-600/20 text-amber-200 mb-2">
                Phase XXXIII Implementation Status
              </Badge>
              <p className="text-slate-400">
                Authority: Commander Mark via JASMY Relay | 
                Ready for GROK QA Cycle A Validation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenDisplayTest;