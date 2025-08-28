import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, MapPin, CheckCircle, Clock, AlertCircle, TrendingUp, Shield } from 'lucide-react';
import { DIDVerificationWizard } from './DIDVerificationWizard';
import { OnboardingPlaybookCard } from './OnboardingPlaybookCard';
import { PilotRegionMap } from './PilotRegionMap';
import { MunicipalCIDBinderComponent } from './MunicipalCIDBinderComponent';

interface MunicipalNode {
  id: string;
  name: string;
  region: string;
  population: number;
  status: 'pending' | 'verifying' | 'active' | 'inactive';
  didStatus: 'none' | 'pending' | 'verified' | 'expired';
  onboardingProgress: number;
  lastActivity: string;
  trustedCitizens: number;
  governanceScore: number;
}

interface PilotMetrics {
  totalNodes: number;
  activeNodes: number;
  pendingVerification: number;
  trustedCitizens: number;
  completionRate: number;
  averageOnboardingTime: string;
}

const MunicipalPilotDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Mock municipal nodes data
  const [municipalNodes, setMunicipalNodes] = useState<MunicipalNode[]>([
    {
      id: 'austin-tx-001',
      name: 'Austin Municipal District',
      region: 'Texas, USA',
      population: 965000,
      status: 'active',
      didStatus: 'verified',
      onboardingProgress: 100,
      lastActivity: '2025-07-23T00:15:00Z',
      trustedCitizens: 12420,
      governanceScore: 87
    },
    {
      id: 'portland-or-001',
      name: 'Portland City Council',
      region: 'Oregon, USA',
      population: 650000,
      status: 'verifying',
      didStatus: 'pending',
      onboardingProgress: 75,
      lastActivity: '2025-07-22T18:30:00Z',
      trustedCitizens: 8950,
      governanceScore: 72
    },
    {
      id: 'burlington-vt-001',
      name: 'Burlington Township',
      region: 'Vermont, USA',
      population: 42000,
      status: 'pending',
      didStatus: 'none',
      onboardingProgress: 25,
      lastActivity: '2025-07-22T14:45:00Z',
      trustedCitizens: 1250,
      governanceScore: 0
    },
    {
      id: 'san-jose-ca-001',
      name: 'San Jose City Administration',
      region: 'California, USA',
      population: 1030000,
      status: 'active',
      didStatus: 'verified',
      onboardingProgress: 100,
      lastActivity: '2025-07-23T01:20:00Z',
      trustedCitizens: 18750,
      governanceScore: 91
    },
    {
      id: 'ann-arbor-mi-001',
      name: 'Ann Arbor Municipal Authority',
      region: 'Michigan, USA',
      population: 123000,
      status: 'inactive',
      didStatus: 'expired',
      onboardingProgress: 90,
      lastActivity: '2025-07-20T12:00:00Z',
      trustedCitizens: 3200,
      governanceScore: 45
    }
  ]);

  const [pilotMetrics, setPilotMetrics] = useState<PilotMetrics>({
    totalNodes: 5,
    activeNodes: 2,
    pendingVerification: 1,
    trustedCitizens: 44570,
    completionRate: 78,
    averageOnboardingTime: '14.5 days'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'verifying': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'verifying': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartOnboarding = () => {
    setShowWizard(true);
    console.log('🏛️ Municipal onboarding wizard initiated');
  };

  const handleNodeSelection = (nodeId: string) => {
    setSelectedNode(nodeId);
    console.log(`🏛️ Municipal node selected: ${nodeId}`);
  };

  useEffect(() => {
    console.log('🏛️ MunicipalPilotDashboard initialized — 5 nodes, 2 active');
    console.log(`📊 Pilot metrics: ${pilotMetrics.completionRate}% completion rate`);
    
    // Mock real-time updates
    const updateInterval = setInterval(() => {
      const randomNode = municipalNodes[Math.floor(Math.random() * municipalNodes.length)];
      console.log(`🔄 Municipal node status updated: ${randomNode.name}`);
    }, 45000);

    return () => clearInterval(updateInterval);
  }, []);

  if (showWizard) {
    return (
      <DIDVerificationWizard
        onComplete={() => {
          setShowWizard(false);
          console.log('✅ Municipal DID verification completed');
        }}
        onCancel={() => {
          setShowWizard(false);
          console.log('❌ Municipal DID verification cancelled');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-400" />
                Municipal Pilot Dashboard
              </h1>
              <p className="text-slate-400 mt-2">
                Decentralized governance onboarding for local government entities
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleStartOnboarding}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Start municipal onboarding process"
              >
                Start Onboarding
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/command'}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Command Center
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Nodes</p>
                  <p className="text-2xl font-bold text-white">{pilotMetrics.totalNodes}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Nodes</p>
                  <p className="text-2xl font-bold text-green-400">{pilotMetrics.activeNodes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Trusted Citizens</p>
                  <p className="text-2xl font-bold text-white">{pilotMetrics.trustedCitizens.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{pilotMetrics.completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="nodes" className="text-slate-300 data-[state=active]:text-white">
              Node Status
            </TabsTrigger>
            <TabsTrigger value="playbook" className="text-slate-300 data-[state=active]:text-white">
              Playbook
            </TabsTrigger>
            <TabsTrigger value="map" className="text-slate-300 data-[state=active]:text-white">
              Region Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Onboarding Progress</CardTitle>
                  <CardDescription className="text-slate-400">
                    Municipal node verification and activation status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Overall Completion</span>
                        <span className="text-white">{pilotMetrics.completionRate}%</span>
                      </div>
                      <Progress value={pilotMetrics.completionRate} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Avg. Onboarding Time</p>
                        <p className="text-white font-medium">{pilotMetrics.averageOnboardingTime}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Pending Verification</p>
                        <p className="text-yellow-400 font-medium">{pilotMetrics.pendingVerification}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <OnboardingPlaybookCard />
            </div>
          </TabsContent>

          <TabsContent value="nodes" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Municipal Node Directory</CardTitle>
                <CardDescription className="text-slate-400">
                  Active and pending municipal government entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {municipalNodes.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors"
                      onClick={() => handleNodeSelection(node.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${node.name} municipal node`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(node.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{node.name}</h3>
                          <p className="text-sm text-slate-400">
                            {node.region} • {node.population.toLocaleString()} residents
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(node.status)}>
                              {node.status}
                            </Badge>
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                              DID: {node.didStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Progress</p>
                        <p className="font-semibold text-white">{node.onboardingProgress}%</p>
                        <p className="text-xs text-slate-500">{formatDate(node.lastActivity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playbook" className="mt-6">
            <OnboardingPlaybookCard />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <PilotRegionMap
              nodes={municipalNodes}
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelection}
            />
          </TabsContent>
        </Tabs>

        {/* CID Binder Integration */}
        {selectedNode && (
          <div className="mt-8">
            <MunicipalCIDBinderComponent
              nodeId={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MunicipalPilotDashboard;