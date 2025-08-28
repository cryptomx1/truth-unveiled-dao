// DeckModulePreview.tsx - Preview interface for deck modules with TruthCoin integration
// Phase XXXIII integration with RotatingTokenDisplay.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotatingTokenDisplay } from '@/components/tokens/RotatingTokenDisplay';
import { Eye, Play, Lock, CheckCircle, Coins, Trophy } from 'lucide-react';

interface DeckModule {
  id: string;
  title: string;
  description: string;
  deckId: string;
  deckName: string;
  status: 'locked' | 'available' | 'completed';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rewardTokens: {
    frontCID: string;
    backCID: string;
    guardian?: string;
    pillarType: string;
  } | null;
  completedAt?: string;
}

interface DeckModulePreviewProps {
  modules: DeckModule[];
  showTokenRewards?: boolean;
  onModuleSelect?: (module: DeckModule) => void;
  className?: string;
}

export const DeckModulePreview: React.FC<DeckModulePreviewProps> = ({
  modules,
  showTokenRewards = true,
  onModuleSelect,
  className = ''
}) => {
  const [selectedModule, setSelectedModule] = useState<DeckModule | null>(null);

  // Mock modules for demonstration
  const mockModules: DeckModule[] = [
    {
      id: 'gov-consensus-001',
      title: 'Vote Consensus Card',
      description: 'Real-time civic proposal consensus monitoring with ZKP validation',
      deckId: 'deck-9',
      deckName: 'Consensus Layer',
      status: 'completed',
      difficulty: 'intermediate',
      rewardTokens: {
        frontCID: 'QmConsensusFrontCID123456789ABCDEF',
        backCID: 'QmConsensusBackCID123456789ABCDEF',
        guardian: 'CONSENSUS',
        pillarType: 'Governance'
      },
      completedAt: '2025-07-20T14:30:00Z'
    },
    {
      id: 'edu-literacy-001',
      title: 'Truth Literacy Card',
      description: 'Interactive flashcard system with civic education content',
      deckId: 'deck-3',
      deckName: 'Education',
      status: 'available',
      difficulty: 'beginner',
      rewardTokens: {
        frontCID: 'QmEducationFrontCID123456789ABCDEF',
        backCID: 'QmEducationBackCID123456789ABCDEF',
        guardian: 'WISDOM',
        pillarType: 'Education'
      }
    },
    {
      id: 'identity-did-001',
      title: 'DID Claim Card',
      description: 'Decentralized identity claim interface with ZKP validation',
      deckId: 'deck-12',
      deckName: 'Civic Identity',
      status: 'locked',
      difficulty: 'advanced',
      rewardTokens: {
        frontCID: 'QmIdentityFrontCID123456789ABCDEF',
        backCID: 'QmIdentityBackCID123456789ABCDEF',
        guardian: 'IDENTITY',
        pillarType: 'Identity'
      }
    },
    {
      id: 'justice-evidence-001',
      title: 'Evidence Submission Card',
      description: 'Secure evidence upload with ZKP wrapping and tamper detection',
      deckId: 'deck-15',
      deckName: 'Civic Justice',
      status: 'available',
      difficulty: 'expert',
      rewardTokens: {
        frontCID: 'QmJusticeFrontCID123456789ABCDEF',
        backCID: 'QmJusticeBackCID123456789ABCDEF',
        guardian: 'JUSTICE',
        pillarType: 'Justice'
      }
    }
  ];

  const displayModules = modules.length > 0 ? modules : mockModules;

  const getStatusColor = (status: DeckModule['status']): string => {
    switch (status) {
      case 'completed': return 'bg-green-600/20 text-green-400 border-green-500/50';
      case 'available': return 'bg-blue-600/20 text-blue-400 border-blue-500/50';
      case 'locked': return 'bg-slate-600/20 text-slate-400 border-slate-500/50';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-500/50';
    }
  };

  const getDifficultyColor = (difficulty: DeckModule['difficulty']): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-yellow-600';
      case 'advanced': return 'bg-orange-600';
      case 'expert': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  const handleModuleClick = (module: DeckModule) => {
    if (module.status === 'locked') return;
    
    setSelectedModule(module);
    onModuleSelect?.(module);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            Deck Module Preview
            <Badge className="bg-blue-600/30 text-blue-200">
              {displayModules.length} Modules
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {displayModules.map((module) => (
              <Card 
                key={module.id}
                className={`relative overflow-hidden border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${getStatusColor(module.status)} ${
                  module.status === 'locked' ? 'cursor-not-allowed opacity-60' : ''
                }`}
                onClick={() => handleModuleClick(module)}
              >
                {/* Status Icon */}
                <div className="absolute top-3 right-3">
                  {module.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {module.status === 'available' && (
                    <Play className="w-5 h-5 text-blue-400" />
                  )}
                  {module.status === 'locked' && (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Module Title & Deck */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(module.difficulty)}>
                        {module.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-500">
                        {module.deckName}
                      </Badge>
                    </div>
                    
                    <h3 className="text-white font-semibold text-lg">
                      {module.title}
                    </h3>
                    
                    <p className="text-slate-300 text-sm line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  {/* Token Reward Preview */}
                  {showTokenRewards && module.rewardTokens && (
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-600">
                      <div className="flex-shrink-0">
                        <RotatingTokenDisplay
                          frontCID={module.rewardTokens.frontCID}
                          backCID={module.rewardTokens.backCID}
                          guardian={module.rewardTokens.guardian}
                          size={60}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-medium">
                          Reward: {module.rewardTokens.guardian || 'TruthCoin'}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {module.rewardTokens.pillarType} Pillar
                        </p>
                        {module.completedAt && (
                          <p className="text-green-400 text-xs mt-1">
                            ✓ Earned {new Date(module.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <Coins className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${
                        module.status === 'completed' 
                          ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                          : module.status === 'available'
                          ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10'
                          : 'border-slate-500 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={module.status === 'locked'}
                    >
                      {module.status === 'completed' && (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Review Module
                        </>
                      )}
                      {module.status === 'available' && (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Module
                        </>
                      )}
                      {module.status === 'locked' && (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Module Details */}
          {selectedModule && (
            <Card className="mt-6 bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Selected: {selectedModule.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-slate-300">
                      {selectedModule.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(selectedModule.difficulty)}>
                        {selectedModule.difficulty}
                      </Badge>
                      <Badge className={getStatusColor(selectedModule.status)}>
                        {selectedModule.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-slate-400">
                      <p>Deck: {selectedModule.deckName} (#{selectedModule.deckId})</p>
                      {selectedModule.completedAt && (
                        <p>Completed: {new Date(selectedModule.completedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Token Reward Display */}
                  {selectedModule.rewardTokens && (
                    <div className="flex flex-col items-center space-y-3">
                      <RotatingTokenDisplay
                        frontCID={selectedModule.rewardTokens.frontCID}
                        backCID={selectedModule.rewardTokens.backCID}
                        guardian={selectedModule.rewardTokens.guardian}
                        size={120}
                      />
                      
                      <div className="text-center">
                        <p className="text-white font-medium">
                          {selectedModule.rewardTokens.guardian || 'TruthCoin'}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {selectedModule.rewardTokens.pillarType} Pillar Reward
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-slate-400 text-sm">
        <p>Phase XXXIII: 3D Token Integration Active</p>
        <p className="text-slate-500 text-xs mt-1">
          Authority: Commander Mark via JASMY Relay
        </p>
      </div>
    </div>
  );
};

export default DeckModulePreview;