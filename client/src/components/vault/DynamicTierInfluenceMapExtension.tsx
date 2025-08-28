import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Pause, RotateCcw, Activity, TrendingUp, Zap, Eye } from 'lucide-react';

interface TierMigration {
  fromTier: string;
  toTier: string;
  fromDistrict: string;
  toDistrict: string;
  influence: number;
  timestamp: number;
}

interface DistrictState {
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
  isAnimating: boolean;
  pulseIntensity: number;
  lastMigration?: TierMigration;
}

interface SimulationState {
  isRunning: boolean;
  currentStep: number;
  maxSteps: number;
  replayProgress: number;
  scenario: string;
  turnoutEnabled: boolean;
}

interface InfluenceSwing {
  district: string;
  tier: string;
  change: number;
  timestamp: number;
}

const DynamicTierInfluenceMapExtension: React.FC = () => {
  const [districts, setDistricts] = useState<DistrictState[]>([]);
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentStep: 0,
    maxSteps: 5,
    replayProgress: 0,
    scenario: 'moderate_shift',
    turnoutEnabled: false
  });
  const [influenceSwings, setInfluenceSwings] = useState<InfluenceSwing[]>([]);
  const [migrations, setMigrations] = useState<TierMigration[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const simulationTimer = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastUpdate = useRef<number>(0);

  const scenarios = [
    { value: 'moderate_shift', label: 'Moderate Shift', description: 'Gradual tier migration across districts' },
    { value: 'high_turnout', label: 'High Turnout', description: 'Rapid influence changes with tier upgrades' },
    { value: 'polarization', label: 'Polarization', description: 'Extreme shifts to Commander/Citizen poles' },
    { value: 'consensus_building', label: 'Consensus Building', description: 'Movement toward Governor/Moderator balance' },
    { value: 'civic_surge', label: 'Civic Surge', description: 'Mass engagement increasing all tier participation' }
  ];

  const generateInitialDistricts = (): DistrictState[] => {
    const districtNames = [
      "Civic Center", "Innovation Hub", "Democracy Plaza", "Truth Square",
      "Governance Block", "Community Park", "Justice Quarter", "Freedom Zone",
      "Liberty District", "Consensus Ave", "Transparency Row", "Unity Commons",
      "Participation Way", "Integrity Lane", "Accountability St", "Trust Circle"
    ];

    return districtNames.map((name, index) => {
      const commanderRatio = Math.random() * 0.15;
      const governorRatio = Math.random() * 0.25;
      const moderatorRatio = Math.random() * 0.3;
      const contributorRatio = Math.random() * 0.4;
      const citizenRatio = 1 - (commanderRatio + governorRatio + moderatorRatio + contributorRatio);

      const tierComposition = {
        Commander: Math.max(0, commanderRatio),
        Governor: Math.max(0, governorRatio),
        Moderator: Math.max(0, moderatorRatio),
        Contributor: Math.max(0, contributorRatio),
        Citizen: Math.max(0, citizenRatio)
      };

      const totalInfluence = 
        tierComposition.Commander * 1000 +
        tierComposition.Governor * 500 +
        tierComposition.Moderator * 200 +
        tierComposition.Contributor * 100 +
        tierComposition.Citizen * 50;

      return {
        id: `${index + 1}${String.fromCharCode(65 + (index % 26))}`,
        name,
        coordinates: {
          x: (index % 4) * 25 + 12.5,
          y: Math.floor(index / 4) * 25 + 12.5
        },
        tierComposition,
        totalInfluence,
        isAnimating: false,
        pulseIntensity: 0
      };
    });
  };

  const announceInfluenceSwing = useCallback((swing: InfluenceSwing) => {
    const changeDirection = swing.change > 0 ? 'increased' : 'decreased';
    const changeAmount = Math.abs(swing.change);
    const message = `${swing.tier} influence ${changeDirection} ${changeAmount}% in District ${swing.district}`;
    
    // ARIA live region announcement
    const announcement = new SpeechSynthesisUtterance(message);
    announcement.volume = 0.7;
    announcement.rate = 1.1;
    speechSynthesis.speak(announcement);
    
    console.log(`📈 Influence Swing: ${message}`);
  }, []);

  const generateTierMigration = useCallback((fromDistrict: DistrictState, scenario: string): TierMigration | null => {
    const tiers = ['Citizen', 'Contributor', 'Moderator', 'Governor', 'Commander'];
    const weights = scenario === 'polarization' ? [0.4, 0.1, 0.1, 0.1, 0.3] : [0.3, 0.25, 0.25, 0.15, 0.05];
    
    // Select source tier based on current composition
    const sourceTiers = Object.entries(fromDistrict.tierComposition)
      .filter(([_, ratio]) => ratio > 0.05)
      .map(([tier]) => tier);
    
    if (sourceTiers.length === 0) return null;
    
    const fromTier = sourceTiers[Math.floor(Math.random() * sourceTiers.length)];
    const fromTierIndex = tiers.indexOf(fromTier);
    
    // Determine migration direction based on scenario
    let toTierIndex: number;
    switch (scenario) {
      case 'high_turnout':
        toTierIndex = Math.min(fromTierIndex + 1, tiers.length - 1);
        break;
      case 'polarization':
        toTierIndex = Math.random() > 0.5 ? 0 : tiers.length - 1;
        break;
      case 'consensus_building':
        toTierIndex = fromTierIndex < 2 ? fromTierIndex + 1 : fromTierIndex - 1;
        break;
      case 'civic_surge':
        toTierIndex = Math.min(fromTierIndex + Math.floor(Math.random() * 2) + 1, tiers.length - 1);
        break;
      default: // moderate_shift
        toTierIndex = fromTierIndex + (Math.random() > 0.5 ? 1 : -1);
        toTierIndex = Math.max(0, Math.min(toTierIndex, tiers.length - 1));
    }
    
    const toTier = tiers[toTierIndex];
    const influence = Math.random() * 0.15 + 0.05; // 5-20% influence
    
    // Select target district (prefer adjacent for realism)
    const targetDistricts = districts.filter(d => d.id !== fromDistrict.id);
    const toDistrict = targetDistricts[Math.floor(Math.random() * targetDistricts.length)];
    
    return {
      fromTier,
      toTier,
      fromDistrict: fromDistrict.id,
      toDistrict: toDistrict.id,
      influence,
      timestamp: Date.now()
    };
  }, [districts]);

  const applyMigration = useCallback((migration: TierMigration) => {
    setDistricts(prevDistricts => {
      const updated = prevDistricts.map(district => {
        if (district.id === migration.fromDistrict) {
          // Source district loses influence
          const newComposition = { ...district.tierComposition };
          newComposition[migration.fromTier as keyof typeof newComposition] = Math.max(0, 
            newComposition[migration.fromTier as keyof typeof newComposition] - migration.influence);
          
          return {
            ...district,
            tierComposition: newComposition,
            isAnimating: true,
            pulseIntensity: 0.8,
            lastMigration: migration
          };
        } else if (district.id === migration.toDistrict) {
          // Target district gains influence
          const newComposition = { ...district.tierComposition };
          newComposition[migration.toTier as keyof typeof newComposition] = Math.min(1, 
            newComposition[migration.toTier as keyof typeof newComposition] + migration.influence);
          
          return {
            ...district,
            tierComposition: newComposition,
            isAnimating: true,
            pulseIntensity: 0.8,
            lastMigration: migration
          };
        }
        return district;
      });
      
      return updated;
    });

    // Record influence swing
    const swing: InfluenceSwing = {
      district: migration.toDistrict,
      tier: migration.toTier,
      change: Math.round(migration.influence * 100),
      timestamp: migration.timestamp
    };
    
    setInfluenceSwings(prev => [...prev.slice(-4), swing]);
    announceInfluenceSwing(swing);
    
    // Console telemetry
    console.log(`🧮 Influence Simulation: Tier Migration — ${migration.fromTier} → ${migration.toTier}, ${migration.fromDistrict} → ${migration.toDistrict}`);
    
  }, [announceInfluenceSwing]);

  const runSimulationStep = useCallback(() => {
    if (!simulation.isRunning || districts.length === 0) return;
    
    const startTime = performance.now();
    
    // Generate 2-4 migrations per step
    const migrationsCount = Math.floor(Math.random() * 3) + 2;
    const newMigrations: TierMigration[] = [];
    
    for (let i = 0; i < migrationsCount; i++) {
      const sourceDistrict = districts[Math.floor(Math.random() * districts.length)];
      const migration = generateTierMigration(sourceDistrict, simulation.scenario);
      
      if (migration) {
        newMigrations.push(migration);
        applyMigration(migration);
      }
    }
    
    setMigrations(prev => [...prev.slice(-10), ...newMigrations]);
    
    // Update simulation progress
    setSimulation(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      replayProgress: Math.min(100, (prev.currentStep + 1) / prev.maxSteps * 100)
    }));
    
    // Reset animation states after delay
    setTimeout(() => {
      setDistricts(prev => prev.map(d => ({ 
        ...d, 
        isAnimating: false, 
        pulseIntensity: 0 
      })));
    }, 800);
    
    const endTime = performance.now();
    const cycleDuration = endTime - startTime;
    
    // Performance logging
    if (cycleDuration > 250) {
      console.warn(`⚠️ Simulation cycle exceeded target: ${cycleDuration.toFixed(1)}ms`);
    }
    
    lastUpdate.current = endTime;
    
  }, [simulation.isRunning, simulation.scenario, districts, generateTierMigration, applyMigration]);

  const startSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: true, currentStep: 0, replayProgress: 0 }));
    
    simulationTimer.current = setInterval(() => {
      runSimulationStep();
    }, 2000); // 2-second intervals for visibility
    
    console.log(`🎬 Dynamic Influence Simulation Started: ${simulation.scenario}`);
  };

  const pauseSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: false }));
    
    if (simulationTimer.current) {
      clearInterval(simulationTimer.current);
      simulationTimer.current = null;
    }
    
    console.log('⏸️ Simulation Paused');
  };

  const resetSimulation = () => {
    pauseSimulation();
    
    setSimulation(prev => ({ 
      ...prev, 
      currentStep: 0, 
      replayProgress: 0 
    }));
    setInfluenceSwings([]);
    setMigrations([]);
    
    // Reset districts to initial state
    setDistricts(generateInitialDistricts());
    
    console.log('🔄 Simulation Reset');
  };

  const handleReplaySlider = (value: number[]) => {
    const progress = value[0];
    const targetStep = Math.floor((progress / 100) * simulation.maxSteps);
    
    setSimulation(prev => ({ 
      ...prev, 
      replayProgress: progress,
      currentStep: targetStep
    }));
    
    // Could implement step-by-step replay here
    console.log(`📍 Replay Position: ${progress}% (Step ${targetStep})`);
  };

  const getDistrictHeatColor = (district: DistrictState): string => {
    const maxInfluence = Math.max(...districts.map(d => d.totalInfluence));
    const intensity = (district.totalInfluence / maxInfluence) * 100;
    
    if (district.isAnimating) {
      return 'bg-cyan-400 animate-pulse';
    }
    
    if (intensity >= 80) return 'bg-red-600';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getDominantTier = (composition: DistrictState['tierComposition']): string => {
    const entries = Object.entries(composition);
    const dominant = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    return dominant[0];
  };

  useEffect(() => {
    if (!isInitialized) {
      const initialDistricts = generateInitialDistricts();
      setDistricts(initialDistricts);
      setIsInitialized(true);
      
      // TTS mount announcement
      const mountMessage = new SpeechSynthesisUtterance("Dynamic tier influence map with simulation controls ready");
      mountMessage.volume = 0.7;
      mountMessage.rate = 1.0;
      speechSynthesis.speak(mountMessage);
    }
    
    return () => {
      if (simulationTimer.current) {
        clearInterval(simulationTimer.current);
      }
      if (speechRef.current) {
        speechRef.current.cancel();
      }
    };
  }, [isInitialized]);

  // Auto-stop simulation when max steps reached
  useEffect(() => {
    if (simulation.currentStep >= simulation.maxSteps && simulation.isRunning) {
      pauseSimulation();
      
      const completionMessage = new SpeechSynthesisUtterance("Simulation complete");
      completionMessage.volume = 0.7;
      speechSynthesis.speak(completionMessage);
    }
  }, [simulation.currentStep, simulation.maxSteps, simulation.isRunning]);

  if (!isInitialized || districts.length === 0) {
    return (
      <Card className="w-full max-w-6xl mx-auto bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-96 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Simulation Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Dynamic Influence Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Migration Scenario</label>
              <Select 
                value={simulation.scenario} 
                onValueChange={(value) => setSimulation(prev => ({ ...prev, scenario: value }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.value} value={scenario.value} className="text-slate-100">
                      {scenario.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Simulation Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Simulate Turnout</label>
                <Switch
                  checked={simulation.turnoutEnabled}
                  onCheckedChange={(checked) => setSimulation(prev => ({ ...prev, turnoutEnabled: checked }))}
                  className="data-[state=checked]:bg-cyan-600"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={simulation.isRunning ? pauseSimulation : startSimulation}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1"
                >
                  {simulation.isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSimulation}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Replay Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Replay Progress ({simulation.replayProgress.toFixed(0)}%)
              </label>
              <Slider
                value={[simulation.replayProgress]}
                onValueChange={handleReplaySlider}
                max={100}
                step={20}
                className="w-full"
                disabled={simulation.isRunning}
              />
              <div className="text-xs text-slate-400">
                Step {simulation.currentStep} of {simulation.maxSteps}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Influence Grid */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Live Influence Map
            {simulation.isRunning && (
              <Badge variant="outline" className="border-cyan-600 text-cyan-400 animate-pulse">
                Simulating
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div 
              className="relative w-full h-96 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
              role="region"
              aria-label="Dynamic Influence Map"
              aria-live="polite"
            >
              {districts.map((district) => {
                const heatColor = getDistrictHeatColor(district);
                const dominantTier = getDominantTier(district.tierComposition);
                
                return (
                  <Tooltip key={district.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute w-16 h-16 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-110 hover:border-white ${heatColor}`}
                        style={{
                          left: `${district.coordinates.x}%`,
                          top: `${district.coordinates.y}%`,
                          transform: 'translate(-50%, -50%)',
                          borderColor: district.isAnimating ? '#06b6d4' : '#475569',
                          boxShadow: district.pulseIntensity > 0 ? `0 0 ${district.pulseIntensity * 20}px #06b6d4` : 'none'
                        }}
                        aria-label={`District ${district.id}: ${dominantTier} dominant, ${district.isAnimating ? 'changing' : 'stable'}`}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-bold">
                          <div>{district.id}</div>
                          <div className="text-[10px]">{dominantTier.substring(0, 3)}</div>
                        </div>
                        
                        {district.isAnimating && (
                          <div className="absolute inset-0 border-2 border-cyan-400 rounded-lg animate-ping"></div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 border-slate-600 text-slate-100 max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{district.name} ({district.id})</p>
                        <p className="text-xs">Commander: {Math.round(district.tierComposition.Commander * 100)}%</p>
                        <p className="text-xs">Governor: {Math.round(district.tierComposition.Governor * 100)}%</p>
                        <p className="text-xs">Moderator: {Math.round(district.tierComposition.Moderator * 100)}%</p>
                        <p className="text-xs">Contributor: {Math.round(district.tierComposition.Contributor * 100)}%</p>
                        <p className="text-xs">Citizen: {Math.round(district.tierComposition.Citizen * 100)}%</p>
                        {district.lastMigration && (
                          <p className="text-xs text-cyan-400">
                            Recent: {district.lastMigration.fromTier} → {district.lastMigration.toTier}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              {/* Propagation waves (visual effect for inter-district sync) */}
              {districts.some(d => d.isAnimating) && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full bg-gradient-radial from-cyan-400/10 via-transparent to-transparent animate-ping"></div>
                </div>
              )}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Animated Metrics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Influence Swings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Live Influence Swings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" aria-live="polite" aria-label="Influence swing updates">
              {influenceSwings.length === 0 ? (
                <p className="text-slate-400 text-sm">No influence changes detected</p>
              ) : (
                influenceSwings.slice(-5).map((swing, index) => (
                  <div key={`${swing.district}-${swing.timestamp}`} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`border-slate-600 ${swing.change > 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {swing.change > 0 ? '+' : ''}{swing.change}%
                      </Badge>
                      <div>
                        <p className="text-slate-100 font-medium">{swing.tier}</p>
                        <p className="text-sm text-slate-400">District {swing.district}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(swing.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Migration Log */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-400" />
              Recent Migrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {migrations.length === 0 ? (
                <p className="text-slate-400 text-sm">No migrations recorded</p>
              ) : (
                migrations.slice(-4).map((migration, index) => (
                  <div key={migration.timestamp} className="p-3 bg-slate-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">
                        {new Date(migration.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                        {Math.round(migration.influence * 100)}% moved
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-100">
                      <span className="text-red-400">{migration.fromTier}</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="text-green-400">{migration.toTier}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {migration.fromDistrict} → {migration.toDistrict}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DynamicTierInfluenceMapExtension;