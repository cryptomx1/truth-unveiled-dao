/**
 * FusionEligibilityGate.tsx
 * Civic Fusion Cycle - TP Threshold Validation Component
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TPVaultVerifier, type VaultVerificationResult } from '@/services/TPVaultVerifier';
import ZKPUserMintExtension from '@/components/zkp/ZKPUserMintExtension';

interface UserVaultData {
  did: string;
  truthPoints: number;
  civicTier: string;
  completedPillars: number;
  fusionEligible: boolean;
}

export const FusionEligibilityGate: React.FC = () => {
  const [vaultData, setVaultData] = useState<UserVaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [showMintInterface, setShowMintInterface] = useState(false);

  const FUSION_THRESHOLD = 500;

  useEffect(() => {
    loadVaultData();
    
    // Announce component ready
    setTimeout(() => {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance('Fusion eligibility gate interface ready');
        utterance.rate = 0.8;
        utterance.volume = 0.3;
        window.speechSynthesis.speak(utterance);
      }
    }, 500);
  }, []);

  const loadVaultData = async () => {
    setLoading(true);
    console.log('🔍 Loading user vault data for fusion eligibility...');

    try {
      // Use TPVaultVerifier for consistent TP validation
      const verificationResult = await TPVaultVerifier.verifyUserEligibility('did:civic:fusion_candidate_123');
      
      if (verificationResult.success) {
        const userData: UserVaultData = {
          did: verificationResult.userStatus.did,
          truthPoints: verificationResult.userStatus.truthPoints,
          civicTier: verificationResult.userStatus.civicTier,
          completedPillars: verificationResult.userStatus.completedPillars,
          fusionEligible: verificationResult.userStatus.fusionEligible
        };

        setVaultData(userData);
        console.log(`✅ Vault data loaded — ${userData.truthPoints} TP, ${userData.fusionEligible ? 'ELIGIBLE' : 'INSUFFICIENT'}`);
      } else {
        console.error('❌ Vault verification failed');
        setVaultData(null);
      }

    } catch (error) {
      console.error('❌ Failed to load vault data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibilityAndProceed = async () => {
    if (!vaultData) return;

    setCheckingEligibility(true);
    console.log('🔐 Checking fusion eligibility and TP threshold...');

    // ARIA announcement based on eligibility
    const announcement = vaultData.fusionEligible 
      ? `Fusion threshold reached with ${vaultData.truthPoints} Truth Points. Access granted.`
      : `Fusion threshold not yet reached. Earn more Truth Points. Current: ${vaultData.truthPoints}, Required: ${FUSION_THRESHOLD}.`;

    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.8;
      utterance.volume = 0.4;
      window.speechSynthesis.speak(utterance);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (vaultData.fusionEligible) {
      console.log('✅ Fusion eligibility confirmed — showing ZKP mint interface');
      setShowMintInterface(true);
    } else {
      console.log('❌ Fusion eligibility insufficient — redirecting to earning opportunities');
    }

    setCheckingEligibility(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Governor': return 'bg-purple-500';
      case 'Moderator': return 'bg-blue-500';
      case 'Contributor': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Loading Vault Data</h3>
            <p className="text-gray-600">Retrieving Truth Points and eligibility status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vaultData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold mb-2">Vault Access Error</h3>
            <p className="text-gray-600">Unable to retrieve vault data. Please try again.</p>
            <Button onClick={loadVaultData} className="mt-4">
              🔄 Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show ZKP Mint Interface if eligible
  if (showMintInterface && vaultData?.fusionEligible) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Card>
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={() => setShowMintInterface(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Eligibility Check
            </Button>
          </CardContent>
        </Card>
        
        {/* ZKP Mint Interface */}
        <ZKPUserMintExtension />
        
        {/* ARIA Live Region for Mint Interface */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        >
          ZKP mint request interface activated
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Eligibility Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔐 Fusion Eligibility Check</span>
            <Badge className={vaultData.fusionEligible ? 'bg-green-500' : 'bg-amber-500'}>
              {vaultData.fusionEligible ? 'ELIGIBLE' : 'THRESHOLD NOT MET'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Vault Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{vaultData.truthPoints}</div>
              <div className="text-sm text-gray-600">Truth Points</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{vaultData.completedPillars}/8</div>
              <div className="text-sm text-gray-600">Pillars Completed</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Badge className={getTierColor(vaultData.civicTier)}>
                {vaultData.civicTier}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Civic Tier</div>
            </div>
          </div>

          {/* TP Threshold Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Fusion Threshold Progress:</span>
              <span className="font-semibold">
                {vaultData.truthPoints} / {FUSION_THRESHOLD} TP
              </span>
            </div>
            <Progress 
              value={(vaultData.truthPoints / FUSION_THRESHOLD) * 100} 
              className="h-3"
            />
            <div className="text-xs text-gray-500">
              {vaultData.fusionEligible 
                ? `✅ Threshold exceeded by ${vaultData.truthPoints - FUSION_THRESHOLD} TP`
                : `⚠️ Need ${FUSION_THRESHOLD - vaultData.truthPoints} more TP`
              }
            </div>
          </div>

          {/* DID Information */}
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Decentralized Identity</div>
            <div className="font-mono text-sm">{vaultData.did}</div>
          </div>
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          {vaultData.fusionEligible ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-600">Fusion Access Granted</h3>
              <p className="text-gray-600">
                You have met the minimum Truth Points requirement and can proceed to Genesis Fusion.
              </p>
              <Button
                onClick={checkEligibilityAndProceed}
                disabled={checkingEligibility}
                size="lg"
                className="min-w-48"
              >
                {checkingEligibility ? '🔐 Verifying...' : '⚡ Proceed to ZKP Mint Request'}
              </Button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-amber-600">Threshold Not Met</h3>
              <div 
                className="text-gray-600 p-4 bg-amber-50 dark:bg-amber-900 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                Fusion threshold not yet reached. Earn more Truth Points.
                <br />
                Complete more civic pillars or participate in governance activities.
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/onboarding/verify'}
                  className="min-w-40"
                >
                  🏛️ Complete Pillars
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/deck/governance'}
                  className="min-w-40"
                >
                  🗳️ Governance Activities
                </Button>
              </div>
            </>
          )}
          
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/fusion/dashboard'}
              className="text-sm"
            >
              📊 View Fusion Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ARIA Live Region for Dynamic Updates */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {vaultData.fusionEligible 
          ? `Fusion eligibility confirmed with ${vaultData.truthPoints} Truth Points`
          : `Fusion threshold not yet reached, need ${FUSION_THRESHOLD - vaultData.truthPoints} more Truth Points`
        }
      </div>
    </div>
  );
};