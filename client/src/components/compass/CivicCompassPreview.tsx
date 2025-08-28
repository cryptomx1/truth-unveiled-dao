import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalCopyButton } from '@/components/ui/universal-copy-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Users, 
  Shield, 
  Zap, 
  Building, 
  MessageSquare,
  Scale,
  Hammer,
  ArrowRight
} from 'lucide-react';

interface DeckPreview {
  id: number;
  title: string;
  description: string;
  modules: number;
  tpRequirement: number;
  icon: React.ReactNode;
  color: string;
  route: string;
}

interface CivicCompassPreviewProps {
  currentTP?: number;
  onDeckSelect?: (deckId: number, route: string) => void;
}

export function CivicCompassPreview({ 
  currentTP = 87, 
  onDeckSelect 
}: CivicCompassPreviewProps) {
  const [location, setLocation] = useLocation();
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);

  const compassDecks: DeckPreview[] = [
    {
      id: 10,
      title: 'Governance Feedback',
      description: 'Express your voice through ZKP-verified feedback and trust voting systems',
      modules: 4,
      tpRequirement: 25,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-blue-600',
      route: '/deck/10'
    },
    {
      id: 11,
      title: 'Civic Engagement',
      description: 'Build civic reputation through gamified participation and trust streaks',
      modules: 4,
      tpRequirement: 50,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-600',
      route: '/deck/11'
    },
    {
      id: 15,
      title: 'Civic Justice',
      description: 'Participate in evidence submission, arbitration, and justice audit systems',
      modules: 3,
      tpRequirement: 150,
      icon: <Scale className="w-5 h-5" />,
      color: 'bg-purple-600',
      route: '/deck/15'
    },
    {
      id: 20,
      title: 'Civic Legacy',
      description: 'Create lasting civic contributions through knowledge preservation systems',
      modules: 4,
      tpRequirement: 500,
      icon: <Hammer className="w-5 h-5" />,
      color: 'bg-amber-600',
      route: '/deck/20'
    }
  ];

  const handleDeckPreview = (deck: DeckPreview) => {
    setSelectedDeck(deck.id);
    console.log(`👁️ Deck Preview: ${deck.title} (${deck.modules} modules)`);
    
    // TTS announcement
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Previewing ${deck.title}. ${deck.modules} modules available.`
      );
      utterance.rate = 0.9;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const handleDeckAccess = (deck: DeckPreview) => {
    if (onDeckSelect) {
      onDeckSelect(deck.id, deck.route);
    }
    
    console.log(`🚀 Deck Access: Navigating to ${deck.title} → ${deck.route}`);
    
    // Use wouter navigation instead of window.location
    setLocation(deck.route);
  };

  const isDeckUnlocked = (deck: DeckPreview) => {
    return currentTP >= deck.tpRequirement;
  };

  const getTPBadgeColor = (tpRequirement: number) => {
    if (currentTP >= tpRequirement) return 'bg-green-600';
    if (currentTP >= tpRequirement * 0.7) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Eye className="w-6 h-6 text-blue-400" />
          <span>Civic Compass Preview</span>
        </CardTitle>
        <p className="text-sm text-slate-300">
          Preview available civic engagement decks with TP badge overlays
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current TP Status */}
        <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
          <div>
            <div className="text-sm text-slate-300">Current Truth Points</div>
            <div className="text-xl font-bold text-blue-400">{currentTP} TP</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-300">Unlocked Decks</div>
            <div className="text-xl font-bold text-green-400">
              {compassDecks.filter(d => isDeckUnlocked(d)).length} / {compassDecks.length}
            </div>
          </div>
        </div>

        {/* Deck Cards with TP Badge Overlays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compassDecks.map((deck) => {
            const isUnlocked = isDeckUnlocked(deck);
            const isSelected = selectedDeck === deck.id;
            
            return (
              <Card
                key={deck.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : isUnlocked 
                      ? 'border-slate-600 bg-slate-700/50 hover:border-slate-500' 
                      : 'border-slate-700 bg-slate-800/50 opacity-75'
                }`}
                onClick={() => handleDeckPreview(deck)}
              >
                {/* TP Badge Overlay */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge 
                    className={`text-xs ${getTPBadgeColor(deck.tpRequirement)} text-white`}
                  >
                    {deck.tpRequirement} TP
                  </Badge>
                </div>

                {/* Unlock Status Badge */}
                {!isUnlocked && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="destructive" className="text-xs">
                      Locked
                    </Badge>
                  </div>
                )}

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-full ${deck.color} ${!isUnlocked && 'opacity-50'}`}>
                      {deck.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Deck</div>
                      <div className="text-lg font-bold">{deck.id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{deck.title}</h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {deck.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className="text-xs bg-slate-600">
                      {deck.modules} Modules
                    </Badge>
                    
                    {isSelected && (
                      <Button 
                        size="sm"
                        className={`${
                          isUnlocked 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-slate-600 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isUnlocked) {
                            handleDeckAccess(deck);
                          }
                        }}
                        disabled={!isUnlocked}
                      >
                        {isUnlocked ? 'Access Deck' : 'TP Required'}
                        {isUnlocked && <ArrowRight className="w-3 h-3 ml-1" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation Hint */}
        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
          <p className="text-sm text-slate-300">
            Click any deck card to preview, then access if you have sufficient Truth Points
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CivicCompassPreview;