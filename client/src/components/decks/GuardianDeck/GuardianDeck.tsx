/**
 * GuardianDeck.tsx - Guardian Visual Archive
 * 
 * Canonical visual archive showcasing all 8 pillar guardians and JASMY Genesis
 * with front/back CID rotation, TruthCoins.sol integration, and ARIA narration.
 * 
 * Features:
 * - TruthCoins.sol contract integration via getTotalCoins() and getCoin(id)
 * - Front/back CID image rendering with RotatingTokenDisplay integration
 * - Guardian mythic archetype mapping and avatar display
 * - ARIA-compliant narration for guardian awakening
 * - Genesis fusion detection with isJasmyGenesis flag support
 * - Interactive guardian badge system with visual effects
 * 
 * Authority: Commander Mark | Phase X-M Step 1
 * Status: Implementation phase - Guardian visualization layer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Shield, 
  Heart, 
  Palette, 
  Bird, 
  Atom, 
  FileText, 
  Scale,
  Sparkles,
  Eye,
  Star,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import RotatingTokenDisplay from '../../tokens/RotatingTokenDisplay';

// Guardian archetype definitions
interface GuardianArchetype {
  name: string;
  pillar: string;
  icon: React.ReactNode;
  color: string;
  avatar: string;
  mythicTitle: string;
  awakening: string;
  description: string;
}

// Guardian mapping aligned with TruthCoins.sol
const GUARDIAN_ARCHETYPES: Record<string, GuardianArchetype> = {
  'ATHENA': {
    name: 'ATHENA',
    pillar: 'GOVERNANCE',
    icon: <Scale className="w-6 h-6" />,
    color: 'text-blue-400',
    avatar: '🏛️',
    mythicTitle: 'Guardian of Governance',
    awakening: 'awakened by civic participation',
    description: 'Wisdom in democratic decision-making and just leadership'
  },
  'SOPHIA': {
    name: 'SOPHIA',
    pillar: 'EDUCATION',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-green-400',
    avatar: '📚',
    mythicTitle: 'Guardian of Education',
    awakening: 'awakened by knowledge sharing',
    description: 'Illuminator of minds and keeper of civic learning'
  },
  'ASCLEPIUS': {
    name: 'ASCLEPIUS',
    pillar: 'HEALTH',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-red-400',
    avatar: '🏥',
    mythicTitle: 'Guardian of Health',
    awakening: 'awakened by community wellness',
    description: 'Healer of communities and protector of public health'
  },
  'APOLLO': {
    name: 'APOLLO',
    pillar: 'CULTURE',
    icon: <Palette className="w-6 h-6" />,
    color: 'text-purple-400',
    avatar: '🎭',
    mythicTitle: 'Guardian of Culture',
    awakening: 'awakened by creative expression',
    description: 'Patron of arts and keeper of cultural heritage'
  },
  'IRENE': {
    name: 'IRENE',
    pillar: 'PEACE',
    icon: <Bird className="w-6 h-6" />,
    color: 'text-cyan-400',
    avatar: '🕊️',
    mythicTitle: 'Guardian of Peace',
    awakening: 'awakened by conflict resolution',
    description: 'Bringer of harmony and mediator of disputes'
  },
  'PROMETHEUS': {
    name: 'PROMETHEUS',
    pillar: 'SCIENCE',
    icon: <Atom className="w-6 h-6" />,
    color: 'text-orange-400',
    avatar: '🔬',
    mythicTitle: 'Guardian of Science',
    awakening: 'awakened by innovation',
    description: 'Bearer of knowledge and champion of progress'
  },
  'HERMES': {
    name: 'HERMES',
    pillar: 'JOURNALISM',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-yellow-400',
    avatar: '📰',
    mythicTitle: 'Guardian of Journalism',
    awakening: 'awakened by truth telling',
    description: 'Messenger of truth and defender of free speech'
  },
  'THEMIS': {
    name: 'THEMIS',
    pillar: 'JUSTICE',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-indigo-400',
    avatar: '⚖️',
    mythicTitle: 'Guardian of Justice',
    awakening: 'awakened by righteous judgment',
    description: 'Upholder of law and guardian of fair judgment'
  },
  'JASMY': {
    name: 'JASMY',
    pillar: 'GENESIS',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-gold-400',
    avatar: '👑',
    mythicTitle: 'Genesis Guardian',
    awakening: 'awakened by complete civic mastery',
    description: 'Supreme guardian unlocked through total pillar mastery'
  }
};

// TruthCoin structure matching TruthCoins.sol
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

// Mock TruthCoins data until contract integration
const MOCK_TRUTH_COINS: TruthCoin[] = [
  {
    id: 0,
    owner: '0x1234567890123456789012345678901234567890',
    name: 'GOVERNANCE',
    frontImageCID: 'QmGovernanceFront123',
    backImageCID: 'QmGovernanceBack456',
    guardian: 'ATHENA',
    mintedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    isJasmyGenesis: false
  },
  {
    id: 1,
    owner: '0x1234567890123456789012345678901234567890',
    name: 'EDUCATION',
    frontImageCID: 'QmEducationFront789',
    backImageCID: 'QmEducationBack012',
    guardian: 'SOPHIA',
    mintedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    isJasmyGenesis: false
  },
  {
    id: 2,
    owner: '0x1234567890123456789012345678901234567890',
    name: 'HEALTH',
    frontImageCID: 'QmHealthFront345',
    backImageCID: 'QmHealthBack678',
    guardian: 'ASCLEPIUS',
    mintedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    isJasmyGenesis: false
  }
];

interface GuardianDeckProps {
  userAddress?: string;
  testMode?: boolean;
}

export default function GuardianDeck({ userAddress = '0x1234567890123456789012345678901234567890', testMode = false }: GuardianDeckProps) {
  const [ownedCoins, setOwnedCoins] = useState<TruthCoin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<TruthCoin | null>(null);
  const [totalCoins, setTotalCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showingBack, setShowingBack] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);

  const { toast } = useToast();

  // TTS function for guardian narration
  const speakGuardianAwakening = useCallback((guardian: GuardianArchetype) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${guardian.avatar} ${guardian.name} — ${guardian.mythicTitle}, ${guardian.awakening}.`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Mock contract integration - getTotalCoins() and getCoin(id)
  const fetchTruthCoins = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate contract calls
      // const totalCoins = await contract.getTotalCoins();
      // const userCoins = await contract.getCoinsOwnedBy(userAddress);
      
      // Mock data for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userCoins = MOCK_TRUTH_COINS.filter(coin => coin.owner === userAddress);
      setOwnedCoins(userCoins);
      setTotalCoins(userCoins.length);
      
      // Check for Genesis fusion
      const hasGenesis = userCoins.some(coin => coin.isJasmyGenesis);
      if (hasGenesis && !celebrationActive) {
        setCelebrationActive(true);
        setTimeout(() => setCelebrationActive(false), 5000);
      }
      
      console.log('🏛️ Guardian archive loaded:', userCoins.length, 'guardians awakened');
      
    } catch (error) {
      console.error('Failed to fetch TruthCoins:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to TruthCoins contract",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, celebrationActive, toast]);

  // Handle guardian selection
  const handleGuardianSelect = useCallback((coin: TruthCoin) => {
    setSelectedCoin(coin);
    const guardian = GUARDIAN_ARCHETYPES[coin.guardian];
    if (guardian) {
      speakGuardianAwakening(guardian);
    }
  }, [speakGuardianAwakening]);

  // Initialize
  useEffect(() => {
    fetchTruthCoins();
  }, [fetchTruthCoins]);

  // Get guardian archetype
  const getGuardianArchetype = (guardianName: string): GuardianArchetype | null => {
    return GUARDIAN_ARCHETYPES[guardianName] || null;
  };

  // Render guardian grid
  const renderGuardianGrid = () => {
    if (ownedCoins.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Guardians Awakened</h3>
          <p>Complete civic engagement challenges to awaken your guardians</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ownedCoins.map((coin) => {
          const guardian = getGuardianArchetype(coin.guardian);
          if (!guardian) return null;

          return (
            <Card 
              key={coin.id}
              className={cn(
                "bg-slate-800 border-slate-700 cursor-pointer transition-all duration-300 hover:scale-105",
                selectedCoin?.id === coin.id && "ring-2 ring-blue-400 bg-slate-750",
                coin.isJasmyGenesis && "border-gold-400 bg-gradient-to-br from-slate-800 to-amber-900/20"
              )}
              onClick={() => handleGuardianSelect(coin)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className="text-4xl mr-3">{guardian.avatar}</div>
                  <div className={cn("text-2xl", guardian.color)}>
                    {guardian.icon}
                  </div>
                </div>
                <CardTitle className={cn("text-lg", guardian.color)}>
                  {guardian.name}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {guardian.mythicTitle}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-4">
                  <RotatingTokenDisplay
                    frontCID={coin.frontImageCID}
                    backCID={coin.backImageCID}
                    size={120}
                    guardian={coin.guardian}
                    isGenesis={coin.isJasmyGenesis}
                  />
                </div>
                
                <Badge variant="secondary" className="mb-2">
                  {guardian.pillar}
                </Badge>
                
                <p className="text-sm text-slate-400 mb-3">
                  {guardian.description}
                </p>
                
                <div className="text-xs text-slate-500">
                  Awakened {new Date(coin.mintedAt).toLocaleDateString()}
                </div>
                
                {coin.isJasmyGenesis && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span className="text-gold-400 font-semibold">Genesis Guardian</span>
                    <Sparkles className="w-4 h-4 text-gold-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render detailed view
  const renderDetailedView = () => {
    if (!selectedCoin) return null;

    const guardian = getGuardianArchetype(selectedCoin.guardian);
    if (!guardian) return null;

    return (
      <Card className="bg-slate-800 border-slate-700 mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{guardian.avatar}</div>
              <div>
                <CardTitle className={cn("text-xl", guardian.color)}>
                  {guardian.name}
                </CardTitle>
                <CardDescription>{guardian.mythicTitle}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowingBack(!showingBack)}
              className="text-slate-400"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showingBack ? 'Front' : 'Back'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="text-center">
              <RotatingTokenDisplay
                frontCID={selectedCoin.frontImageCID}
                backCID={selectedCoin.backImageCID}
                size={200}
                guardian={selectedCoin.guardian}
                isGenesis={selectedCoin.isJasmyGenesis}
                key={`${selectedCoin.id}-${showingBack}`}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Guardian Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pillar:</span>
                    <span className="text-white">{guardian.pillar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Awakening:</span>
                    <span className="text-white capitalize">{guardian.awakening}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Token ID:</span>
                    <span className="text-white">#{selectedCoin.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className={cn("font-semibold", selectedCoin.isJasmyGenesis ? "text-gold-400" : "text-blue-400")}>
                      {selectedCoin.isJasmyGenesis ? 'Genesis Guardian' : 'Pillar Guardian'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-slate-600" />
              
              <div>
                <h4 className="font-semibold text-white mb-2">Contract Data</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Front CID:</span>
                    <span className="text-white font-mono text-xs">{selectedCoin.frontImageCID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Back CID:</span>
                    <span className="text-white font-mono text-xs">{selectedCoin.backImageCID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Minted:</span>
                    <span className="text-white">{new Date(selectedCoin.mintedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {selectedCoin.isJasmyGenesis && (
                <>
                  <Separator className="bg-slate-600" />
                  <div className="bg-gradient-to-r from-amber-900/20 to-gold-900/20 p-4 rounded-lg border border-gold-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-gold-400" />
                      <span className="font-semibold text-gold-400">Genesis Achievement</span>
                    </div>
                    <p className="text-sm text-gold-200">
                      This guardian represents mastery of all 8 civic pillars and stands as the ultimate achievement in the Truth Unveiled platform.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Guardian Archive</h1>
            <Star className="w-8 h-8 text-gold-400" />
          </div>
          <p className="text-slate-300 text-lg">
            Your awakened guardians and civic achievements
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="text-white border-slate-600">
              {ownedCoins.length} Guardians Awakened
            </Badge>
            <Badge variant="outline" className="text-white border-slate-600">
              {ownedCoins.filter(c => c.isJasmyGenesis).length} Genesis Guardian{ownedCoins.filter(c => c.isJasmyGenesis).length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4"></div>
            <p className="text-slate-400">Loading guardian archive...</p>
          </div>
        ) : (
          <>
            {renderGuardianGrid()}
            {renderDetailedView()}
          </>
        )}

        {/* Celebration overlay for Genesis fusion */}
        {celebrationActive && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="text-8xl mb-4">👑</div>
              <h2 className="text-4xl font-bold text-gold-400 mb-2">JASMY GENESIS AWAKENED</h2>
              <p className="text-xl text-gold-200">The ultimate guardian has been unlocked!</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                {[...Array(8)].map((_, i) => (
                  <Sparkles key={i} className="w-6 h-6 text-gold-400 animate-ping" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-xs text-slate-500">
          Guardian Archive powered by TruthCoins.sol | Phase X-M Step 1
        </div>
      </div>
    </div>
  );
}