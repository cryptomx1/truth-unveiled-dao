import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Map, RefreshCw, Grid3X3, TrendingUp } from 'lucide-react';
import { ReputationIndexEngine } from '@/engines/ReputationIndexEngine';

interface District {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  tierComposition: {
    Commander: number;
    Governor: number;
    Moderator: number;
    Contributor: number;
    Citizen: number;
  };
  totalInfluence: number;
  aggregatedScore: number;
  zkpValidated: boolean;
  population: number;
}

interface InfluenceMetrics {
  topDistricts: District[];
  averageInfluence: number;
  totalPopulation: number;
  zkpSuccessRate: number;
}

const TierInfluenceMap: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [metrics, setMetrics] = useState<InfluenceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<District | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const generateMockDistricts = (): District[] => {
    const districtNames = [
      "Civic Center", "Innovation Hub", "Democracy Plaza", "Truth Square",
      "Governance Block", "Community Park", "Justice Quarter", "Freedom Zone",
      "Liberty District", "Consensus Ave", "Transparency Row", "Unity Commons",
      "Participation Way", "Integrity Lane", "Accountability St", "Trust Circle"
    ];

    return districtNames.map((name, index) => {
      // Generate tier composition with realistic distributions
      const commanderRatio = Math.random() * 0.15; // 0-15%
      const governorRatio = Math.random() * 0.25; // 0-25%
      const moderatorRatio = Math.random() * 0.3; // 0-30%
      const contributorRatio = Math.random() * 0.4; // 0-40%
      const citizenRatio = 1 - (commanderRatio + governorRatio + moderatorRatio + contributorRatio);

      const tierComposition = {
        Commander: Math.max(0, commanderRatio),
        Governor: Math.max(0, governorRatio),
        Moderator: Math.max(0, moderatorRatio),
        Contributor: Math.max(0, contributorRatio),
        Citizen: Math.max(0, citizenRatio)
      };

      // Calculate aggregated score based on tier weights
      const aggregatedScore = 
        tierComposition.Commander * 1000 +
        tierComposition.Governor * 500 +
        tierComposition.Moderator * 200 +
        tierComposition.Contributor * 100 +
        tierComposition.Citizen * 50;

      const population = Math.floor(Math.random() * 5000) + 1000;
      const totalInfluence = aggregatedScore * population / 1000;

      return {
        id: `${index + 1}${String.fromCharCode(65 + (index % 26))}`, // 1A, 2B, etc.
        name,
        coordinates: {
          x: (index % 4) * 25 + 12.5, // 4x4 grid positioning
          y: Math.floor(index / 4) * 25 + 12.5
        },
        tierComposition,
        totalInfluence,
        aggregatedScore,
        zkpValidated: Math.random() > 0.08, // 92% validation rate
        population
      };
    });
  };

  const initializeInfluenceMap = async () => {
    try {
      setIsLoading(true);

      // Generate districts with ZKP validation
      const mockDistricts = generateMockDistricts();
      
      // Sort by influence for metrics
      const sortedDistricts = [...mockDistricts].sort((a, b) => b.totalInfluence - a.totalInfluence);
      
      const influenceMetrics: InfluenceMetrics = {
        topDistricts: sortedDistricts.slice(0, 3),
        averageInfluence: mockDistricts.reduce((sum, d) => sum + d.totalInfluence, 0) / mockDistricts.length,
        totalPopulation: mockDistricts.reduce((sum, d) => sum + d.population, 0),
        zkpSuccessRate: mockDistricts.filter(d => d.zkpValidated).length / mockDistricts.length * 100
      };

      setDistricts(mockDistricts);
      setMetrics(influenceMetrics);

      // Console telemetry for top districts
      sortedDistricts.slice(0, 3).forEach(district => {
        const commanderRatio = Math.round(district.tierComposition.Commander * 100);
        console.log(`🌐 Tier Influence Rendered — District: ${district.id} | Commander Ratio: ${commanderRatio}%`);
      });

    } catch (error) {
      console.error("Failed to initialize influence map:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInfluenceMap = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Regenerate with slight variations
    await initializeInfluenceMap();
    
    setIsRefreshing(false);
    
    // TTS announcement
    if (speechRef.current) {
      speechRef.current.cancel();
    }
    speechRef.current = new SpeechSynthesisUtterance("Tier influence map refreshed");
    speechRef.current.volume = 0.7;
    speechRef.current.rate = 1.0;
    speechSynthesis.speak(speechRef.current);
  };

  const getHeatIntensity = (influence: number, maxInfluence: number): number => {
    return Math.min(100, (influence / maxInfluence) * 100);
  };

  const getHeatColor = (intensity: number): string => {
    if (intensity >= 80) return 'bg-red-600'; // High influence
    if (intensity >= 60) return 'bg-orange-500'; // Medium-high
    if (intensity >= 40) return 'bg-yellow-500'; // Medium
    if (intensity >= 20) return 'bg-green-500'; // Low-medium
    return 'bg-blue-500'; // Low influence
  };

  const getDominantTier = (composition: District['tierComposition']): string => {
    const entries = Object.entries(composition);
    const dominant = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    return dominant[0];
  };

  const formatTooltipContent = (district: District): string => {
    const composition = district.tierComposition;
    return `${district.name} (${district.id})
Commander: ${Math.round(composition.Commander * 100)}%
Governor: ${Math.round(composition.Governor * 100)}%
Moderator: ${Math.round(composition.Moderator * 100)}%
Contributor: ${Math.round(composition.Contributor * 100)}%
Citizen: ${Math.round(composition.Citizen * 100)}%
Population: ${district.population.toLocaleString()}
Influence: ${Math.round(district.totalInfluence)}`;
  };

  useEffect(() => {
    initializeInfluenceMap();

    // TTS announcement on mount with top 3 districts for accessibility
    const mountAnnouncement = new SpeechSynthesisUtterance("Tier influence map interface ready");
    mountAnnouncement.volume = 0.7;
    mountAnnouncement.rate = 1.0;
    speechSynthesis.speak(mountAnnouncement);

    return () => {
      if (speechRef.current) {
        speechRef.current.cancel();
      }
    };
  }, []);

  // Announce top 3 districts for screen readers when data loads
  useEffect(() => {
    if (metrics && metrics.topDistricts.length > 0) {
      const topDistrictsText = metrics.topDistricts.map((d, i) => 
        `${i + 1}. ${d.name} district ${d.id} with ${Math.round(d.totalInfluence)} influence`
      ).join(', ');
      
      const announcement = new SpeechSynthesisUtterance(
        `Top 3 most influential districts: ${topDistrictsText}`
      );
      announcement.volume = 0.7;
      announcement.rate = 1.0;
      speechSynthesis.speak(announcement);
    }
  }, [metrics]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-96 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxInfluence = Math.max(...districts.map(d => d.totalInfluence));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-400" />
              Tier Influence Map
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshInfluenceMap}
              disabled={isRefreshing}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Map Grid */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-green-400" />
            District Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div 
              className="relative w-full h-96 bg-slate-900 rounded-lg border border-slate-700"
              role="region"
              aria-label="Influence Map"
            >
              {districts.map((district) => {
                const intensity = getHeatIntensity(district.totalInfluence, maxInfluence);
                const heatColor = getHeatColor(intensity);
                const dominantTier = getDominantTier(district.tierComposition);
                
                return (
                  <Tooltip key={district.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute w-16 h-16 rounded-lg border-2 border-slate-600 cursor-pointer transition-all duration-200 hover:scale-110 hover:border-white ${heatColor}`}
                        style={{
                          left: `${district.coordinates.x}%`,
                          top: `${district.coordinates.y}%`,
                          transform: 'translate(-50%, -50%)',
                          opacity: district.zkpValidated ? 0.9 : 0.5
                        }}
                        onMouseEnter={() => setHoveredDistrict(district)}
                        onMouseLeave={() => setHoveredDistrict(null)}
                        aria-label={`District ${district.id}: ${district.name}, ${Math.round(intensity)}% influence`}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-bold">
                          <div>{district.id}</div>
                          <div className="text-[10px]">{Math.round(intensity)}%</div>
                        </div>
                        {!district.zkpValidated && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 border-slate-600 text-slate-100 max-w-xs">
                      <pre className="text-xs whitespace-pre-wrap">
                        {formatTooltipContent(district)}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Districts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                Top Influential Districts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.topDistricts.map((district, index) => {
                const commanderRatio = Math.round(district.tierComposition.Commander * 100);
                const dominantTier = getDominantTier(district.tierComposition);
                
                return (
                  <div key={district.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="text-slate-100 font-medium">{district.name}</p>
                        <p className="text-sm text-slate-400">District {district.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-100 font-bold">{Math.round(district.totalInfluence)}</p>
                      <p className="text-xs text-slate-400">Commander: {commanderRatio}%</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Overall Metrics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">System Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-900 rounded-lg">
                  <p className="text-2xl font-bold text-slate-100">
                    {Math.round(metrics.averageInfluence)}
                  </p>
                  <p className="text-sm text-slate-400">Avg Influence</p>
                </div>
                <div className="text-center p-3 bg-slate-900 rounded-lg">
                  <p className="text-2xl font-bold text-slate-100">
                    {metrics.totalPopulation.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">Total Population</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-slate-100">
                  {metrics.zkpSuccessRate.toFixed(1)}%
                </p>
                <p className="text-sm text-slate-400">ZKP Validation Rate</p>
              </div>
              
              <div className="text-center p-3 bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-slate-100">{districts.length}</p>
                <p className="text-sm text-slate-400">Active Districts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Heat Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-slate-300 text-sm">80-100% (High Influence)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-slate-300 text-sm">60-80% (Medium-High)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-slate-300 text-sm">40-60% (Medium)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-slate-300 text-sm">20-40% (Low-Medium)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-slate-300 text-sm">0-20% (Low)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
              <span className="text-slate-300 text-sm">ZKP Validation Failed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TierInfluenceMap;