/**
 * GlobalDeploymentDashboard.tsx - Phase X-Z Step 1
 * 
 * Complete global deployment management interface
 * Orchestrates international Truth Unveiled replication
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-Z Global Civic Stack Deployment
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Rocket, Settings, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';

interface DeploymentInstance {
  id: string;
  jurisdiction: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  status: 'deploying' | 'completed' | 'failed';
  progress: number;
  url: string;
  culturalAccuracy: number;
  complianceStatus: boolean;
  deployedAt?: Date;
}

interface GlobalStats {
  totalDeployments: number;
  activeJurisdictions: number;
  federationNodes: number;
  globalCitizens: number;
  crossBorderConsensus: number;
}

const GlobalDeploymentDashboard: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentInstance[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalDeployments: 6,
    activeJurisdictions: 5,
    federationNodes: 15,
    globalCitizens: 12847,
    crossBorderConsensus: 3
  });

  // Initialize with existing deployments
  useEffect(() => {
    const existingDeployments: DeploymentInstance[] = [
      {
        id: 'deploy_us_001',
        jurisdiction: 'United States',
        tier: 'tier1',
        status: 'completed',
        progress: 100,
        url: 'https://truthunveiled-us.replit.app',
        culturalAccuracy: 96,
        complianceStatus: true,
        deployedAt: new Date('2025-07-20')
      },
      {
        id: 'deploy_de_001',
        jurisdiction: 'Germany',
        tier: 'tier1',
        status: 'completed',
        progress: 100,
        url: 'https://truthunveiled-germany.replit.app',
        culturalAccuracy: 94,
        complianceStatus: true,
        deployedAt: new Date('2025-07-22')
      },
      {
        id: 'deploy_jp_001',
        jurisdiction: 'Japan',
        tier: 'tier2',
        status: 'completed',
        progress: 100,
        url: 'https://truthunveiled-japan.replit.app',
        culturalAccuracy: 91,
        complianceStatus: true,
        deployedAt: new Date('2025-07-23')
      },
      {
        id: 'deploy_br_001',
        jurisdiction: 'Brazil',
        tier: 'tier3',
        status: 'deploying',
        progress: 75,
        url: 'https://truthunveiled-brazil.replit.app',
        culturalAccuracy: 87,
        complianceStatus: false
      }
    ];

    setDeployments(existingDeployments);
  }, []);

  // Update global stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        ...prev,
        globalCitizens: prev.globalCitizens + Math.floor(Math.random() * 5),
        federationNodes: prev.federationNodes + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const supportedJurisdictions = [
    'United Kingdom', 'Canada', 'Australia', 'France',
    'South Korea', 'Netherlands', 'Sweden', 'Switzerland', 
    'India', 'South Africa', 'Mexico', 'Poland'
  ];

  const availableJurisdictions = supportedJurisdictions.filter(
    j => !deployments.some(d => d.jurisdiction === j)
  );

  const handleDeployment = async () => {
    if (!selectedJurisdiction) return;

    setIsDeploying(true);

    const newDeployment: DeploymentInstance = {
      id: `deploy_${selectedJurisdiction.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      jurisdiction: selectedJurisdiction,
      tier: getTierForJurisdiction(selectedJurisdiction),
      status: 'deploying',
      progress: 0,
      url: `https://truthunveiled-${selectedJurisdiction.toLowerCase().replace(/\s+/g, '-')}.replit.app`,
      culturalAccuracy: 0,
      complianceStatus: false
    };

    setDeployments(prev => [...prev, newDeployment]);

    // Simulate deployment progress
    const progressInterval = setInterval(() => {
      setDeployments(prev => prev.map(d => {
        if (d.id === newDeployment.id && d.progress < 100) {
          const newProgress = Math.min(100, d.progress + Math.random() * 15);
          return {
            ...d,
            progress: newProgress,
            culturalAccuracy: Math.min(95, Math.floor(newProgress * 0.9)),
            complianceStatus: newProgress > 80,
            status: newProgress === 100 ? 'completed' : 'deploying',
            deployedAt: newProgress === 100 ? new Date() : undefined
          };
        }
        return d;
      }));
    }, 2000);

    setTimeout(() => {
      clearInterval(progressInterval);
      setIsDeploying(false);
      setGlobalStats(prev => ({
        ...prev,
        totalDeployments: prev.totalDeployments + 1,
        activeJurisdictions: prev.activeJurisdictions + 1
      }));
    }, 20000);

    console.log(`🚀 Deploying Truth Unveiled to ${selectedJurisdiction}`);
  };

  const getTierForJurisdiction = (jurisdiction: string): 'tier1' | 'tier2' | 'tier3' => {
    const tier1 = ['United Kingdom', 'Canada', 'Australia', 'France'];
    const tier2 = ['South Korea', 'Netherlands', 'Sweden', 'Switzerland'];
    
    if (tier1.includes(jurisdiction)) return 'tier1';
    if (tier2.includes(jurisdiction)) return 'tier2';
    return 'tier3';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier1': return 'text-green-400 border-green-400';
      case 'tier2': return 'text-blue-400 border-blue-400';
      case 'tier3': return 'text-amber-400 border-amber-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'deploying': return <Clock className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-100">
            <Globe className="h-6 w-6 text-blue-400" />
            Global Deployment Dashboard
            <Badge variant="outline" className="text-green-400 border-green-400">
              Phase X-Z Step 1
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Global Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{globalStats.totalDeployments}</div>
              <div className="text-xs text-slate-400">Total Deployments</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{globalStats.activeJurisdictions}</div>
              <div className="text-xs text-slate-400">Active Jurisdictions</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{globalStats.federationNodes}</div>
              <div className="text-xs text-slate-400">Federation Nodes</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{globalStats.globalCitizens.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Global Citizens</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{globalStats.crossBorderConsensus}</div>
              <div className="text-xs text-slate-400">Cross-Border Consensus</div>
            </div>
          </div>

          {/* New Deployment Section */}
          <div className="border border-slate-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-orange-400" />
              <span className="font-medium text-slate-200">Deploy New Jurisdiction</span>
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger className="flex-1 bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select jurisdiction for deployment" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {availableJurisdictions.map(jurisdiction => (
                    <SelectItem key={jurisdiction} value={jurisdiction} className="text-slate-200">
                      {jurisdiction} ({getTierForJurisdiction(jurisdiction)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleDeployment}
                disabled={!selectedJurisdiction || isDeploying}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>

          {/* Deployment Instances */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-400" />
              <span className="font-medium text-slate-200">Active Deployments</span>
            </div>

            {deployments.map(deployment => (
              <Card key={deployment.id} className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <span className="font-medium text-slate-200">{deployment.jurisdiction}</span>
                      <Badge variant="outline" className={getTierColor(deployment.tier)}>
                        {deployment.tier.toUpperCase()}
                      </Badge>
                      {deployment.complianceStatus && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Compliant
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-slate-300">{deployment.progress}% Complete</div>
                      {deployment.culturalAccuracy > 0 && (
                        <div className="text-xs text-slate-400">
                          Cultural Accuracy: {deployment.culturalAccuracy}%
                        </div>
                      )}
                    </div>
                  </div>

                  <Progress value={deployment.progress} className="mb-2" />

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{deployment.url}</span>
                    {deployment.deployedAt && (
                      <span>Deployed: {deployment.deployedAt.toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Federation Status */}
          <div className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-cyan-400" />
              <span className="font-medium text-slate-200">International Federation Status</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Cross-Border Consensus:</span>
                <span className="text-green-400 ml-2">Active</span>
              </div>
              <div>
                <span className="text-slate-400">ZKP Verification Network:</span>
                <span className="text-blue-400 ml-2">Operational</span>
              </div>
              <div>
                <span className="text-slate-400">TruthCoin Exchange:</span>
                <span className="text-purple-400 ml-2">Live</span>
              </div>
              <div>
                <span className="text-slate-400">Network Health:</span>
                <span className="text-green-400 ml-2">Excellent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalDeploymentDashboard;