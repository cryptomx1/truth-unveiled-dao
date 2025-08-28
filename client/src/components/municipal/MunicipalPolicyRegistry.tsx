/**
 * MunicipalPolicyRegistry.tsx
 * Phase X-MUNICIPALPREP Step 4: Region-based policy registry dashboard
 * Commander Mark directive via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  FileText, 
  Users, 
  Vote, 
  Globe, 
  Search, 
  Filter,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield
} from 'lucide-react';
import TTSToggle from '@/components/tts/TTSToggle';
import RegistryContributionForm from './RegistryContributionForm';
import { FederationSyncEngine } from './FederationSyncEngine';

interface PolicyEntry {
  id: string;
  title: string;
  description: string;
  category: 'housing' | 'transportation' | 'environment' | 'healthcare' | 'education' | 'safety';
  status: 'draft' | 'review' | 'voting' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  jurisdiction: string;
  cid: string;
  zkpHash: string;
  tier: 'Citizen' | 'Governor' | 'Commander';
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  lastModified: string;
  federationSynced: boolean;
}

interface JurisdictionStats {
  totalPolicies: number;
  activeDrafts: number;
  inReview: number;
  approved: number;
  citizenContributions: number;
}

const MunicipalPolicyRegistry: React.FC = () => {
  const [policyEntries, setPolicyEntries] = useState<PolicyEntry[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [jurisdictionStats, setJurisdictionStats] = useState<Record<string, JurisdictionStats>>({});
  const [currentUser] = useState({
    did: 'did:civic:municipal_user_456',
    tier: 'Governor' as const,
    jurisdiction: 'Austin-TX'
  });

  const federationSync = FederationSyncEngine.getInstance();

  useEffect(() => {
    initializePolicyRegistry();
    loadJurisdictionStats();
  }, []);

  const initializePolicyRegistry = () => {
    const mockPolicies: PolicyEntry[] = [
      {
        id: 'policy_001',
        title: 'Affordable Housing Initiative 2025',
        description: 'Comprehensive plan to increase affordable housing units by 40% over next 3 years through zoning reforms and public-private partnerships.',
        category: 'housing',
        status: 'voting',
        submittedBy: 'did:civic:housing_advocate_123',
        submittedAt: '2025-07-20T10:00:00Z',
        jurisdiction: 'Austin-TX',
        cid: 'bafybeihhousing2025austintx',
        zkpHash: '0x1234567890abcdef',
        tier: 'Governor',
        votes: { for: 127, against: 23, abstain: 15 },
        lastModified: '2025-07-23T14:30:00Z',
        federationSynced: true
      },
      {
        id: 'policy_002',
        title: 'Green Transit Expansion',
        description: 'Electric bus fleet expansion and bike lane infrastructure development across downtown corridors.',
        category: 'transportation',
        status: 'review',
        submittedBy: 'did:civic:transport_planner_456',
        submittedAt: '2025-07-22T09:15:00Z',
        jurisdiction: 'Portland-OR',
        cid: 'bafybeigreenransitportlandor',
        zkpHash: '0x2345678901bcdef0',
        tier: 'Citizen',
        votes: { for: 0, against: 0, abstain: 0 },
        lastModified: '2025-07-24T11:20:00Z',
        federationSynced: false
      },
      {
        id: 'policy_003',
        title: 'Digital Privacy Protection Ordinance',
        description: 'Municipal data protection standards for citizen privacy in smart city initiatives and surveillance systems.',
        category: 'safety',
        status: 'approved',
        submittedBy: 'did:civic:privacy_advocate_789',
        submittedAt: '2025-07-18T16:45:00Z',
        jurisdiction: 'Burlington-VT',
        cid: 'bafybeiprivacyprotectionvt',
        zkpHash: '0x3456789012cdef01',
        tier: 'Commander',
        votes: { for: 89, against: 12, abstain: 8 },
        lastModified: '2025-07-19T13:10:00Z',
        federationSynced: true
      },
      {
        id: 'policy_004',
        title: 'Community Health Centers Expansion',
        description: 'Establishment of 5 new community health centers in underserved neighborhoods with mental health services.',
        category: 'healthcare',
        status: 'draft',
        submittedBy: 'did:civic:health_coordinator_101',
        submittedAt: '2025-07-24T08:30:00Z',
        jurisdiction: 'Austin-TX',
        cid: 'bafybeihealthcentersaustintx',
        zkpHash: '0x4567890123def012',
        tier: 'Governor',
        votes: { for: 0, against: 0, abstain: 0 },
        lastModified: '2025-07-24T08:30:00Z',
        federationSynced: false
      }
    ];

    setPolicyEntries(mockPolicies);
    console.log('🏛️ Municipal Policy Registry initialized with', mockPolicies.length, 'entries');
  };

  const loadJurisdictionStats = () => {
    const stats: Record<string, JurisdictionStats> = {
      'Austin-TX': {
        totalPolicies: 2,
        activeDrafts: 1,
        inReview: 0,
        approved: 0,
        citizenContributions: 0
      },
      'Portland-OR': {
        totalPolicies: 1,
        activeDrafts: 0,
        inReview: 1,
        approved: 0,
        citizenContributions: 1
      },
      'Burlington-VT': {
        totalPolicies: 1,
        activeDrafts: 0,
        inReview: 0,
        approved: 1,
        citizenContributions: 0
      }
    };

    setJurisdictionStats(stats);
  };

  const filteredPolicies = policyEntries.filter(policy => {
    const matchesJurisdiction = selectedJurisdiction === 'all' || policy.jurisdiction === selectedJurisdiction;
    const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesJurisdiction && matchesCategory && matchesStatus && matchesSearch;
  });

  const handlePolicySubmission = async (policyData: any) => {
    const newPolicy: PolicyEntry = {
      id: `policy_${Date.now()}`,
      title: policyData.title,
      description: policyData.description,
      category: policyData.category,
      status: 'draft',
      submittedBy: currentUser.did,
      submittedAt: new Date().toISOString(),
      jurisdiction: currentUser.jurisdiction,
      cid: `bafybei${Math.random().toString(36).substring(2, 15)}`,
      zkpHash: `0x${Math.random().toString(16).substring(2, 18)}`,
      tier: currentUser.tier,
      votes: { for: 0, against: 0, abstain: 0 },
      lastModified: new Date().toISOString(),
      federationSynced: false
    };

    setPolicyEntries(prev => [newPolicy, ...prev]);
    setShowContributionForm(false);

    // Trigger federation sync
    await federationSync.syncPolicyEntry(newPolicy);
    console.log('📡 New policy submitted and queued for federation sync:', newPolicy.title);

    // Update policy with sync status
    setTimeout(() => {
      setPolicyEntries(prev => prev.map(p => 
        p.id === newPolicy.id ? { ...p, federationSynced: true } : p
      ));
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'review': return <Clock className="h-4 w-4" />;
      case 'voting': return <Vote className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'voting': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      housing: 'bg-orange-100 text-orange-800',
      transportation: 'bg-blue-100 text-blue-800',
      environment: 'bg-green-100 text-green-800',
      healthcare: 'bg-red-100 text-red-800',
      education: 'bg-purple-100 text-purple-800',
      safety: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const jurisdictions = Array.from(new Set(policyEntries.map(p => p.jurisdiction)));
  const categories = ['housing', 'transportation', 'environment', 'healthcare', 'education', 'safety'];

  return (
    <div className="space-y-6">
      {/* Header with TTS */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            Municipal Policy Registry
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Regional policy submissions, reviews, and federation sync for {currentUser.jurisdiction}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TTSToggle 
            deckId="municipal-registry" 
            moduleId="policy-dashboard"
            content="Welcome to the Municipal Policy Registry. This system allows DID-verified citizens to submit, review, and vote on regional policies. All entries are CID-anchored and synchronized across the federation network."
          />
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Phase X-MUNICIPALPREP Step 4
          </Badge>
        </div>
      </div>

      {/* User Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Jurisdiction: {currentUser.jurisdiction}</div>
                <div className="text-sm text-gray-600">Tier: {currentUser.tier} | DID: {currentUser.did.substring(0, 30)}...</div>
              </div>
            </div>
            <Button
              onClick={() => setShowContributionForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Submit Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Jurisdiction</label>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Jurisdictions</option>
                {jurisdictions.map(jurisdiction => (
                  <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="voting">Voting</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="policies">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">Policy Registry</TabsTrigger>
          <TabsTrigger value="stats">Jurisdiction Stats</TabsTrigger>
          <TabsTrigger value="federation">Federation Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Policy Entries ({filteredPolicies.length})
            </h3>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Registry
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredPolicies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(policy.status)}
                      <CardTitle className="text-lg">{policy.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(policy.category)}>
                        {policy.category}
                      </Badge>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                      {policy.federationSynced ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Globe className="h-3 w-3 mr-1" />
                          Synced
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Syncing
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {policy.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Jurisdiction</div>
                      <div className="text-gray-600">{policy.jurisdiction}</div>
                    </div>
                    <div>
                      <div className="font-medium">Submitted By</div>
                      <div className="text-gray-600">{policy.tier} Contributor</div>
                    </div>
                    <div>
                      <div className="font-medium">Last Modified</div>
                      <div className="text-gray-600">
                        {new Date(policy.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {policy.status === 'voting' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Voting Progress</span>
                        <span>{policy.votes.for + policy.votes.against + policy.votes.abstain} votes</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 text-xs w-12">For:</span>
                          <Progress 
                            value={(policy.votes.for / (policy.votes.for + policy.votes.against + policy.votes.abstain)) * 100} 
                            className="flex-1 h-2" 
                          />
                          <span className="text-xs w-8">{policy.votes.for}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 text-xs w-12">Against:</span>
                          <Progress 
                            value={(policy.votes.against / (policy.votes.for + policy.votes.against + policy.votes.abstain)) * 100} 
                            className="flex-1 h-2" 
                          />
                          <span className="text-xs w-8">{policy.votes.against}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>CID: {policy.cid}</span>
                      <span>ZKP: {policy.zkpHash.substring(0, 10)}...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(jurisdictionStats).map(([jurisdiction, stats]) => (
              <Card key={jurisdiction}>
                <CardHeader>
                  <CardTitle className="text-lg">{jurisdiction}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Policies:</span>
                      <span className="font-medium">{stats.totalPolicies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Drafts:</span>
                      <span className="font-medium">{stats.activeDrafts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Review:</span>
                      <span className="font-medium">{stats.inReview}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-medium text-green-600">{stats.approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Citizen Contributions:</span>
                      <span className="font-medium">{stats.citizenContributions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="federation">
          <Card>
            <CardHeader>
              <CardTitle>Federation Sync Status</CardTitle>
              <CardDescription>
                DAO node synchronization for municipal policy registry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {policyEntries.filter(p => p.federationSynced).length}
                    </div>
                    <div className="text-sm text-gray-600">Synced Policies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {policyEntries.filter(p => !p.federationSynced).length}
                    </div>
                    <div className="text-sm text-gray-600">Pending Sync</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">Active Nodes</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Federation sync ensures all municipal policies are distributed across DAO nodes
                  for decentralized governance and regional coordination.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contribution Form Modal */}
      {showContributionForm && (
        <RegistryContributionForm
          onSubmit={handlePolicySubmission}
          onCancel={() => setShowContributionForm(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default MunicipalPolicyRegistry;