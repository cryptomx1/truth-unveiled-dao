import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Shield, Award, Verified } from 'lucide-react';

interface TierBadge {
  tier: string;
  trustScore: number;
  streakDays: number;
  zkProofHash: string;
  verificationTimestamp: Date;
  did: string;
}

interface BadgeExportData {
  badge: {
    tier: string;
    trustScore: number;
    streakDays: number;
    issuedAt: string;
    validUntil: string;
  };
  zkProof: {
    hash: string;
    circuit: string;
    commitment: string;
  };
  metadata: {
    did: string;
    issuer: string;
    version: string;
  };
}

const ZKTierBadgeCard: React.FC = () => {
  const [badge, setBadge] = useState<TierBadge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const initializeBadge = async () => {
    try {
      setIsLoading(true);

      // Simulate badge data loading
      const mockBadge: TierBadge = {
        tier: "Governor",
        trustScore: 87.3,
        streakDays: 7,
        zkProofHash: "0x4f8d2c9e1a6b7f3d8e5c2a9b4f7e0d3c6a8f1b5e2d9c7f0a3b6e4d1c8f5a2b7e",
        verificationTimestamp: new Date(Date.now() - 3600000), // 1 hour ago
        did: "did:civic:user_1a2b3c4d"
      };

      setBadge(mockBadge);

      // Console telemetry
      console.log("🎖️ ZK Tier Badge Loaded —", {
        Tier: mockBadge.tier,
        Score: mockBadge.trustScore,
        Streak: `${mockBadge.streakDays} days`,
        ZKP: mockBadge.zkProofHash.slice(0, 20) + "..."
      });

    } catch (error) {
      console.error("Failed to load tier badge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportBadge = async () => {
    if (!badge) return;

    setIsExporting(true);

    try {
      // Create export data structure
      const exportData: BadgeExportData = {
        badge: {
          tier: badge.tier,
          trustScore: badge.trustScore,
          streakDays: badge.streakDays,
          issuedAt: badge.verificationTimestamp.toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        },
        zkProof: {
          hash: badge.zkProofHash,
          circuit: "tier_verification_v2.1",
          commitment: "0x" + Math.random().toString(16).slice(2, 66)
        },
        metadata: {
          did: badge.did,
          issuer: "TruthUnveiledDAO",
          version: "1.0.0"
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tier-badge-${badge.tier.toLowerCase()}-${Date.now()}.badge.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Console telemetry
      console.log("📤 Badge Exported for DID:", badge.did.slice(0, 20) + "...");

      // TTS announcement
      if (speechRef.current) {
        speechRef.current.cancel();
      }
      speechRef.current = new SpeechSynthesisUtterance("Badge exported successfully");
      speechRef.current.volume = 0.7;
      speechRef.current.rate = 1.0;
      speechSynthesis.speak(speechRef.current);

    } catch (error) {
      console.error("Failed to export badge:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'Commander': return 'from-purple-600 to-purple-800 text-white'; // Diamond
      case 'Governor': return 'from-blue-600 to-blue-800 text-white'; // Sapphire
      case 'Moderator': return 'from-green-600 to-green-800 text-white'; // Emerald
      case 'Contributor': return 'from-yellow-600 to-yellow-800 text-white'; // Gold
      case 'Citizen': return 'from-gray-600 to-gray-800 text-white'; // Bronze
      default: return 'from-gray-500 to-gray-700 text-white';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Commander': return <Award className="h-6 w-6" />;
      case 'Governor': return <Shield className="h-6 w-6" />;
      case 'Moderator': return <Verified className="h-6 w-6" />;
      default: return <Badge className="h-6 w-6" />;
    }
  };

  useEffect(() => {
    initializeBadge();

    // TTS announcement on mount
    const mountAnnouncement = new SpeechSynthesisUtterance("ZK verified tier badge interface ready");
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
      <Card className="w-full max-w-md mx-auto bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!badge) {
    return (
      <Card className="w-full max-w-md mx-auto bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-300">Failed to load tier badge</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800 border-slate-700">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-slate-100 flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          ZK Tier Badge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Badge Visual */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${getTierColor(badge.tier)} flex items-center justify-center shadow-lg`}
            role="img" 
            aria-label={`${badge.tier} tier badge`}
          >
            {getTierIcon(badge.tier)}
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-100">{badge.tier}</h3>
            <p className="text-sm text-slate-400">Civic Tier</p>
          </div>
        </div>

        {/* Trust Snapshot */}
        <div className="bg-slate-900 rounded-lg p-4 space-y-3" role="region" aria-label="Trust snapshot">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Trust Score</span>
            <span className="text-slate-100 font-semibold">{badge.trustScore.toFixed(1)}%</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Streak Days</span>
            <span className="text-slate-100 font-semibold">{badge.streakDays}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Verified</span>
            <span className="text-slate-100 text-sm">
              {badge.verificationTimestamp.toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* ZK Proof Hash */}
        <div className="space-y-2">
          <p className="text-sm text-slate-400">ZK Proof Hash</p>
          <div className="bg-slate-900 p-3 rounded font-mono text-xs text-slate-300 break-all">
            {badge.zkProofHash}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={exportBadge}
          disabled={isExporting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Export badge as JSON file"
        >
          <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
          {isExporting ? 'Exporting...' : 'Export Badge'}
        </Button>

        {/* ARIA Live Region for Screen Readers */}
        <div 
          role="status" 
          aria-live="polite" 
          className="sr-only"
        >
          ZK Verified Tier: {badge.tier}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZKTierBadgeCard;