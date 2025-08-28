import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Vote, 
  Building, 
  Compass, 
  ArrowRight,
  Users,
  Scale,
  Hammer
} from 'lucide-react';

interface CompassDirection {
  id: string;
  label: string;
  description: string;
  deckRoute: string;
  deckNumber: number;
  icon: React.ReactNode;
  color: string;
  tpRequirement: number;
}

interface CivicCompassProps {
  currentTP?: number;
  onDirectionSelect?: (direction: CompassDirection & { name: string; guardian?: string }) => void;
  missionId?: string;
}

export function CivicCompass({ 
  currentTP = 87, 
  onDirectionSelect,
  missionId 
}: CivicCompassProps) {
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [compassRotation, setCompassRotation] = useState(0);

  const directions: CompassDirection[] = [
    {
      id: 'voice',
      label: 'Express Voice',
      description: 'Share feedback and participate in governance discussions',
      deckRoute: '/deck/10',
      deckNumber: 10,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-blue-600',
      tpRequirement: 25
    },
    {
      id: 'govern',
      label: 'Govern Justice',
      description: 'Participate in judicial processes and civic enforcement',
      deckRoute: '/deck/15',
      deckNumber: 15,
      icon: <Scale className="w-5 h-5" />,
      color: 'bg-purple-600',
      tpRequirement: 150
    },
    {
      id: 'build',
      label: 'Build Legacy',
      description: 'Create lasting civic contributions and preserve knowledge',
      deckRoute: '/deck/20',
      deckNumber: 20,
      icon: <Hammer className="w-5 h-5" />,
      color: 'bg-amber-600',
      tpRequirement: 500
    },
    {
      id: 'participate',
      label: 'Participate',
      description: 'Engage in community activities and civic ceremonies',
      deckRoute: '/deck/11',
      deckNumber: 11,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-600',
      tpRequirement: 50
    }
  ];

  const handleDirectionClick = (direction: CompassDirection) => {
    setSelectedDirection(direction.id);
    
    // Rotate compass needle to point to selected direction
    const rotationMap = {
      'voice': 0,
      'govern': 90,
      'build': 180,
      'participate': 270
    };
    setCompassRotation(rotationMap[direction.id as keyof typeof rotationMap] || 0);
    
    // Get pillar recommendation based on mission
    const pillarMapping = {
      'voice': { name: 'Governance', guardian: 'Athena' },
      'identity': { name: 'Identity', guardian: 'Artemis' },
      'compass': { name: 'Wisdom', guardian: 'Sophia' },
      'vault': { name: 'Justice', guardian: 'Themis' }
    };
    
    const recommendedPillar = missionId ? pillarMapping[missionId as keyof typeof pillarMapping] : null;
    
    if (onDirectionSelect) {
      onDirectionSelect({
        ...direction,
        name: recommendedPillar?.name || direction.label,
        guardian: recommendedPillar?.guardian
      });
    }
    
    // TTS announcement with pillar recommendation
    if ('speechSynthesis' in window) {
      const announcement = recommendedPillar 
        ? `You've selected ${missionId}. Recommended Pillar: ${recommendedPillar.name}. Guardian: ${recommendedPillar.guardian}.`
        : `Civic path selected: ${direction.label}. Navigating to Deck ${direction.deckNumber}.`;
        
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
    
    console.log(`🧭 Civic Compass: ${direction.label} selected → ${direction.deckRoute} ${recommendedPillar ? `(Pillar: ${recommendedPillar.name})` : ''}`);
  };

  const isDirectionUnlocked = (direction: CompassDirection) => {
    return currentTP >= direction.tpRequirement;
  };

  useEffect(() => {
    // Auto-select default direction based on TP level
    const availableDirections = directions.filter(d => isDirectionUnlocked(d));
    if (availableDirections.length > 0 && !selectedDirection) {
      setSelectedDirection(availableDirections[0].id);
    }
  }, [currentTP, selectedDirection]);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Compass className="w-6 h-6 text-blue-400" />
          <span>Civic Compass</span>
        </CardTitle>
        <p className="text-sm text-slate-300">
          Choose your civic engagement path
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Compass Visual */}
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-slate-600 bg-slate-700/50">
            {/* Compass Needle */}
            <div 
              className="absolute top-1/2 left-1/2 w-1 h-16 bg-red-500 origin-bottom transform -translate-x-1/2 -translate-y-full transition-transform duration-500"
              style={{ transform: `translate(-50%, -100%) rotate(${compassRotation}deg)` }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1.5 -left-1"></div>
            </div>
            
            {/* Center Point */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Direction Markers */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">N</div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">E</div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">S</div>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">W</div>
          </div>
        </div>

        {/* Direction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {directions.map((direction) => {
            const isUnlocked = isDirectionUnlocked(direction);
            const isSelected = selectedDirection === direction.id;
            
            return (
              <Card
                key={direction.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : isUnlocked 
                      ? 'border-slate-600 bg-slate-700/50 hover:border-slate-500' 
                      : 'border-slate-700 bg-slate-800/50 opacity-50'
                }`}
                onClick={() => isUnlocked && handleDirectionClick(direction)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-full ${direction.color} ${!isUnlocked && 'opacity-50'}`}>
                      {direction.icon}
                    </div>
                    <div className="flex space-x-2">
                      <Badge className="text-xs">
                        Deck {direction.deckNumber}
                      </Badge>
                      {!isUnlocked && (
                        <Badge variant="destructive" className="text-xs">
                          {direction.tpRequirement} TP Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{direction.label}</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      {direction.description}
                    </p>
                  </div>
                  
                  {isSelected && isUnlocked && (
                    <Button 
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = direction.deckRoute;
                      }}
                    >
                      Navigate to Deck {direction.deckNumber}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current TP Display */}
        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
          <div className="text-sm text-slate-300">Current Truth Points</div>
          <div className="text-2xl font-bold text-blue-400">{currentTP} TP</div>
          <div className="text-xs text-slate-400 mt-1">
            {directions.filter(d => isDirectionUnlocked(d)).length} of {directions.length} paths unlocked
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CivicCompass;