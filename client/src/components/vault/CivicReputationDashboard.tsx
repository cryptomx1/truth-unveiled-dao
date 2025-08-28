import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Award, TrendingUp, Database, RefreshCw } from 'lucide-react';
import { ReputationIndexEngine } from '@/engines/ReputationIndexEngine';
import { getTierForCID, validateCIDAccess, CIDTier } from '@/access/CIDTierMap';

interface CivicProfile {
  did: string;
  username: string;
  trustScore: number;
  truthPoints: number;
  currentStreak: number;
  longestStreak: number;
  tier: string;
  zkpHash: string;
  lastVerification: Date;
  civicCredentials: number;
  proposalsVoted: number;
  referralsVerified: number;
}

interface ReputationMetrics {
  trustScore: number;
  tier: string;
  decay: number;
  truthPoints: number;
  streakDays: number;
  lastActivity: Date;
}

const CivicReputationDashboard: React.FC = () => {
  const [profile, setProfile] = useState<CivicProfile | null>(null);
  const [metrics, setMetrics] = useState<ReputationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Mock CID for testing - would come from vault context
  const mockCID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

  const initializeProfile = async () => {
    try {
      setIsLoading(true);

      // Simulate civic profile fetch
      const mockProfile: CivicProfile = {
        did: "did:civic:user_1a2b3c4d",
        username: "civic_pioneer_2025",
        trustScore: 87.3,
        truthPoints: 1247,
        currentStreak: 7,
        longestStreak: 21,
        tier: "Governor",
        zkpHash: "0x4f8d2c9e1a6b7f3d8e5c2a9b4f7e0d3c6a8f1b5e2d9c7f0a3b6e4d1c8f5a2b7e",
        lastVerification: new Date(Date.now() - 3600000), // 1 hour ago
        civicCredentials: 12,
        proposalsVoted: 34,
        referralsVerified: 8
      };

      // Calculate reputation metrics using ReputationIndexEngine
      const reputationEngine = new ReputationIndexEngine();
      const mockVaultHistory = {
        proposals: [
          { timestamp: Date.now() - 86400000, status: 'completed' }, // 1 day ago
          { timestamp: Date.now() - 172800000, status: 'completed' }, // 2 days ago
        ],
        votes: [
          { timestamp: Date.now() - 43200000, verified: true }, // 12 hours ago
          { timestamp: Date.now() - 129600000, verified: true }, // 1.5 days ago
        ],
        referrals: [
          { timestamp: Date.now() - 259200000, verified: true }, // 3 days ago
        ]
      };

      const calculatedMetrics = reputationEngine.calculateReputationScore(mockCID, mockVaultHistory);
      
      const reputationMetrics: ReputationMetrics = {
        trustScore: calculatedMetrics.score,
        tier: calculatedMetrics.tier,
        decay: calculatedMetrics.decay,
        truthPoints: mockProfile.truthPoints,
        streakDays: mockProfile.currentStreak,
        lastActivity: new Date(Date.now() - 3600000)
      };

      setProfile(mockProfile);
      setMetrics(reputationMetrics);
      setLastUpdated(new Date());

      // Console telemetry
      console.log("🧮 Civic Reputation Dashboard Loaded —", {
        DID: mockProfile.did.slice(0, 20) + "...",
        Tier: reputationMetrics.tier,
        Score: reputationMetrics.trustScore,
        Decay: `${reputationMetrics.decay}%`,
        CID: mockCID.slice(0, 20) + "..."
      });

    } catch (error) {
      console.error("Failed to load civic reputation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (metrics) {
      // Simulate minor fluctuations
      const updatedMetrics: ReputationMetrics = {
        ...metrics,
        trustScore: Math.min(100, metrics.trustScore + (Math.random() - 0.5) * 2),
        lastActivity: new Date()
      };
      setMetrics(updatedMetrics);
      setLastUpdated(new Date());
    }
    
    setIsRefreshing(false);
    
    // TTS announcement
    if (speechRef.current) {
      speechRef.current.cancel();
    }
    speechRef.current = new SpeechSynthesisUtterance("Reputation metrics refreshed");
    speechRef.current.volume = 0.7;
    speechRef.current.rate = 1.0;
    speechSynthesis.speak(speechRef.current);
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'Commander': return 'bg-purple-600 text-white';
      case 'Governor': return 'bg-blue-600 text-white';
      case 'Moderator': return 'bg-green-600 text-white';
      case 'Contributor': return 'bg-yellow-600 text-white';
      case 'Citizen': return 'bg-gray-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAccessTier = (): CIDTier => {
    if (!metrics) return CIDTier.TIER_0;
    
    if (metrics.truthPoints >= 1000) return CIDTier.TIER_X;
    if (metrics.truthPoints >= 500) return CIDTier.TIER_4;
    if (metrics.truthPoints >= 200) return CIDTier.TIER_3;
    if (metrics.truthPoints >= 100) return CIDTier.TIER_2;
    if (metrics.truthPoints >= 50) return CIDTier.TIER_1;
    return CIDTier.TIER_0;
  };

  useEffect(() => {
    initializeProfile();

    // TTS announcement on mount
    const mountAnnouncement = new SpeechSynthesisUtterance("Civic reputation dashboard interface ready");
    mountAnnouncement.volume = 0.7;
    mountAnnouncement.rate = 1.0;
    speechSynthesis.speak(mountAnnouncement);

    return () => {
      if (speechRef.current) {
        speechRef.current.cancel();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !metrics) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Failed to load civic reputation data</p>
        </CardContent>
      </Card>
    );
  }

  const accessTier = getAccessTier();
  const hasAccess = validateCIDAccess(mockCID, accessTier);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Civic Reputation Dashboard
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={isRefreshing}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Decentralized Identity</p>
              <p className="text-slate-200 font-mono text-sm break-all">{profile.did}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Civic Username</p>
              <p className="text-slate-200">{profile.username}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputation Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Trust Score */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-slate-100">
                {metrics.trustScore.toFixed(1)}%
              </div>
              <Progress value={metrics.trustScore} className="h-2" />
              <div className="flex justify-between text-sm text-slate-400">
                <span>Decay: {metrics.decay}%</span>
                <span>Updated: {lastUpdated?.toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Civic Tier */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Civic Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge className={`text-lg px-3 py-1 ${getTierColor(metrics.tier)}`}>
                {metrics.tier}
              </Badge>
              <div className="text-sm text-slate-400">
                Access Level: {accessTier}
              </div>
              <div className="text-sm text-slate-400">
                Truth Points: {metrics.truthPoints.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Streak */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-slate-100">
                {metrics.streakDays} days
              </div>
              <div className="text-sm text-slate-400">
                Current Streak
              </div>
              <div className="text-sm text-slate-400">
                Longest: {profile.longestStreak} days
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            Civic Participation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Civic Credentials</p>
              <p className="text-2xl font-bold text-slate-100">{profile.civicCredentials}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Proposals Voted</p>
              <p className="text-2xl font-bold text-slate-100">{profile.proposalsVoted}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Referrals Verified</p>
              <p className="text-2xl font-bold text-slate-100">{profile.referralsVerified}</p>
            </div>
          </div>
          
          <Separator className="my-4 bg-slate-700" />
          
          <div className="space-y-2">
            <p className="text-sm text-slate-400">ZKP Verification Hash</p>
            <p className="text-slate-300 font-mono text-xs break-all bg-slate-900 p-2 rounded">
              {profile.zkpHash}
            </p>
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-400">Last Verification</p>
            <p className="text-slate-300">{profile.lastVerification.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Access Control Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">CID Access Control Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300">Current CID Access Level</p>
              <p className="text-sm text-slate-400">Based on Truth Points and civic tier</p>
            </div>
            <Badge className={hasAccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
              {hasAccess ? 'Access Granted' : 'Access Restricted'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CivicReputationDashboard;