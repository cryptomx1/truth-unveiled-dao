import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  MapPin, 
  Users, 
  FileText,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";

interface CityTemplate {
  id: string;
  name: string;
  state: string;
  population: number;
  templateType: 'small' | 'medium' | 'large';
  features: string[];
  readinessScore: number;
}

interface PilotConfig {
  cityId: string;
  targetDecks: string[];
  citizenGoal: number;
  timeframe: string;
  specialFeatures: string[];
}

interface DIDRegistryStatus {
  registered: number;
  pending: number;
  verified: number;
  total: number;
}

export function MunicipalPilotInterface() {
  const [cityTemplates] = useState<CityTemplate[]>([
    {
      id: "austin_tx",
      name: "Austin",
      state: "Texas",
      population: 965000,
      templateType: 'large',
      features: ["Tech Hub", "Open Government", "Civic Innovation"],
      readinessScore: 92
    },
    {
      id: "portland_or",
      name: "Portland", 
      state: "Oregon",
      population: 650000,
      templateType: 'medium',
      features: ["Environmental Focus", "Participatory Budgeting", "Digital Services"],
      readinessScore: 88
    },
    {
      id: "burlington_vt",
      name: "Burlington",
      state: "Vermont", 
      population: 44000,
      templateType: 'small',
      features: ["Community Engagement", "Local Democracy", "Transparency"],
      readinessScore: 85
    },
    {
      id: "san_jose_ca",
      name: "San Jose",
      state: "California",
      population: 1030000,
      templateType: 'large',
      features: ["Smart City", "Digital Infrastructure", "Innovation District"],
      readinessScore: 90
    },
    {
      id: "ann_arbor_mi",
      name: "Ann Arbor",
      state: "Michigan",
      population: 123000,
      templateType: 'medium',
      features: ["University Partnership", "Civic Tech", "Data-Driven Policy"],
      readinessScore: 87
    }
  ]);

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [pilotConfig, setPilotConfig] = useState<PilotConfig>({
    cityId: "",
    targetDecks: [],
    citizenGoal: 1000,
    timeframe: "6-months",
    specialFeatures: []
  });
  const [didRegistry, setDidRegistry] = useState<DIDRegistryStatus>({
    registered: 0,
    pending: 0,
    verified: 0,
    total: 0
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState<string>("");

  const deckOptions = [
    { id: "governance", name: "Governance & Voting" },
    { id: "finance", name: "Finance & TruthPoints" },
    { id: "privacy", name: "Privacy & ZKP" },
    { id: "education", name: "Civic Education" }
  ];

  const handleCitySelection = (cityId: string) => {
    setSelectedCity(cityId);
    setPilotConfig(prev => ({ ...prev, cityId }));
    
    // Generate mock DID registry data based on city
    const city = cityTemplates.find(c => c.id === cityId);
    if (city) {
      const baseRegistrations = Math.floor(city.population * 0.02); // 2% initial adoption
      setDidRegistry({
        registered: baseRegistrations,
        pending: Math.floor(baseRegistrations * 0.1),
        verified: Math.floor(baseRegistrations * 0.8),
        total: baseRegistrations + Math.floor(baseRegistrations * 0.1)
      });
    }
  };

  const deployPilot = async () => {
    if (!selectedCity) return;
    
    setIsDeploying(true);
    const steps = [
      "Initializing city template",
      "Configuring civic deck modules", 
      "Setting up DID registry sync",
      "Deploying regional smart contracts",
      "Activating citizen onboarding flows",
      "Pilot deployment complete"
    ];

    for (let i = 0; i < steps.length; i++) {
      setDeploymentStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setIsDeploying(false);
    console.log("🏛️ Municipal pilot deployment completed for", selectedCity);
  };

  const getTemplateColor = (templateType: string) => {
    switch (templateType) {
      case 'large': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'small': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedCityData = cityTemplates.find(city => city.id === selectedCity);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Phase X-MunicipalPrep: Municipal Pilot Activation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Select Pilot City
              </h3>
              
              <div className="space-y-3">
                {cityTemplates.map((city) => (
                  <div 
                    key={city.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCity === city.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCitySelection(city.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{city.name}, {city.state}</h4>
                        <p className="text-sm text-gray-600">
                          Population: {city.population.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getTemplateColor(city.templateType)}>
                          {city.templateType}
                        </Badge>
                        <div className="text-sm font-semibold text-green-600">
                          {city.readinessScore}% ready
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {city.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration Panel */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Pilot Configuration
              </h3>

              {selectedCityData ? (
                <div className="space-y-4">
                  {/* Target Decks */}
                  <div>
                    <Label className="text-sm font-medium">Target Civic Decks</Label>
                    <div className="mt-2 space-y-2">
                      {deckOptions.map((deck) => (
                        <label key={deck.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={pilotConfig.targetDecks.includes(deck.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPilotConfig(prev => ({
                                  ...prev,
                                  targetDecks: [...prev.targetDecks, deck.id]
                                }));
                              } else {
                                setPilotConfig(prev => ({
                                  ...prev,
                                  targetDecks: prev.targetDecks.filter(id => id !== deck.id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{deck.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Citizen Goal */}
                  <div>
                    <Label htmlFor="citizenGoal">Initial Citizen Goal</Label>
                    <Input
                      id="citizenGoal"
                      type="number"
                      value={pilotConfig.citizenGoal}
                      onChange={(e) => setPilotConfig(prev => ({
                        ...prev,
                        citizenGoal: parseInt(e.target.value) || 0
                      }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Timeframe */}
                  <div>
                    <Label>Pilot Timeframe</Label>
                    <Select 
                      value={pilotConfig.timeframe} 
                      onValueChange={(value) => setPilotConfig(prev => ({ ...prev, timeframe: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-months">3 Months</SelectItem>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="12-months">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DID Registry Status */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      DID Registry Status
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Registered</div>
                        <div className="font-semibold text-green-600">
                          {didRegistry.registered.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Verified</div>
                        <div className="font-semibold text-blue-600">
                          {didRegistry.verified.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Pending</div>
                        <div className="font-semibold text-orange-600">
                          {didRegistry.pending.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total</div>
                        <div className="font-semibold">
                          {didRegistry.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={(didRegistry.verified / didRegistry.total) * 100} 
                      className="mt-3"
                    />
                  </div>

                  {/* Deployment Button */}
                  <Button 
                    onClick={deployPilot}
                    disabled={isDeploying || pilotConfig.targetDecks.length === 0}
                    className="w-full"
                  >
                    {isDeploying ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 animate-spin" />
                        {deploymentStep || "Deploying..."}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Deploy Municipal Pilot
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a city to configure the pilot deployment</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}