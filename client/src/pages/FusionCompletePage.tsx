/**
 * FusionCompletePage.tsx
 * Phase Civic Fusion Step 3 - Genesis Badge Summary and Completion Page
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TruthGenesisBadge from '@/components/genesis/TruthGenesisBadge';
import { GenesisBadgeExport, type GenesisBadgeExportData } from '@/services/GenesisBadgeExport';
import { FusionCheckpointEmitter } from '@/utils/FusionCheckpointEmitter';
import FusionLedgerCommit from '@/components/fusion/FusionLedgerCommit';
import DAOBroadcastEmitter from '@/components/fusion/DAOBroadcastEmitter';

const FusionCompletePage: React.FC = () => {
  const [genesisBadgeData, setGenesisBadgeData] = useState<any>(null);
  const [exportInProgress, setExportInProgress] = useState(false);
  const [fusionResult, setFusionResult] = useState<{ success: boolean; transactionId: string } | null>(null);
  const [badgeReady, setBadgeReady] = useState(false);
  const [fusionLedger] = useState(() => new FusionLedgerCommit());
  const [daoEmitter] = useState(() => new DAOBroadcastEmitter(fusionLedger));

  useEffect(() => {
    // Initialize Genesis Badge data
    const initializeBadgeData = () => {
      const mockBadgeData = {
        cid: `bafybei${Math.random().toString(36).substr(2, 20)}`,
        did: `did:civic:genesis_${Math.random().toString(36).substr(2, 9)}`,
        fusionTimestamp: new Date().toISOString(),
        civicTier: 'Governor',
        completedPillars: [
          'GOVERNANCE', 'EDUCATION', 'HEALTH', 'CULTURE', 
          'PEACE', 'SCIENCE', 'JOURNALISM', 'JUSTICE'
        ],
        guardianAssignments: {
          'GOVERNANCE': 'Athena',
          'EDUCATION': 'Sophia', 
          'HEALTH': 'Artemis',
          'CULTURE': 'Iris',
          'PEACE': 'Dike',
          'SCIENCE': 'Prometheus',
          'JOURNALISM': 'Hermes',
          'JUSTICE': 'Themis'
        },
        zkpHash: '0x' + Math.random().toString(16).substr(2, 40),
        badgeId: `genesis_${Date.now()}`,
        metadata: {
          truthPoints: 750,
          verificationStatus: 'verified',
          fusionMethod: '8-pillar-complete'
        }
      };

      setGenesisBadgeData(mockBadgeData);
      
      // Emit fusion initiated checkpoint
      FusionCheckpointEmitter.emitFusionInitiated(
        mockBadgeData.did, 
        mockBadgeData.civicTier
      );
    };

    initializeBadgeData();
  }, []);

  const handleBadgeReady = (badgeData: any) => {
    setBadgeReady(true);
    
    // Emit badge generated checkpoint
    FusionCheckpointEmitter.emitBadgeGenerated(
      badgeData.did,
      badgeData.badgeId,
      badgeData.zkpHash
    );
    
    console.log('🏆 Genesis Badge ready for export');
  };

  const handleDownloadBadge = async () => {
    if (!genesisBadgeData || exportInProgress) return;
    
    setExportInProgress(true);
    console.log('📥 Starting Genesis Badge download...');
    
    try {
      // First commit to fusion ledger
      const fusionEntry = await fusionLedger.commitFusion({
        badgeId: genesisBadgeData.badgeId,
        did: genesisBadgeData.did,
        cid: genesisBadgeData.cid,
        zkpHash: genesisBadgeData.zkpHash,
        pillarCount: genesisBadgeData.completedPillars.length,
        tierLevel: genesisBadgeData.civicTier,
        guardians: Object.values(genesisBadgeData.guardianAssignments)
      });
      
      // Broadcast to DAO network
      await daoEmitter.broadcastFusion(fusionEntry);
      
      // Export the badge
      await GenesisBadgeExport.exportGenesisBadge(genesisBadgeData);
      
      // Emit export complete checkpoint
      FusionCheckpointEmitter.emitExportComplete(
        genesisBadgeData.did,
        genesisBadgeData.badgeId,
        `genesis-badge-${genesisBadgeData.badgeId}.genesis.json`
      );
      
      // Trigger Genesis Coin fusion
      const result = await GenesisBadgeExport.fuseGenesisCoin(genesisBadgeData);
      setFusionResult(result);
      
      // ARIA announcement
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance('Fusion complete — badge downloaded and committed to ledger');
        utterance.rate = 0.8;
        utterance.volume = 0.4;
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('❌ Badge download failed:', error);
    } finally {
      setExportInProgress(false);
    }
  };

  const handleReturnToDeck = () => {
    console.log('🔙 Returning to main deck navigation');
    window.location.href = '/';
  };

  const handleViewFusionHistory = () => {
    console.log('📖 Navigating to fusion history');
    window.location.href = '/fusion/history';
  };

  const handleClaimNextPillar = () => {
    console.log('🚀 Navigating to next pillar claiming');
    window.location.href = '/fusion/onboarding';
  };

  if (!genesisBadgeData) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Initializing Fusion Complete</h3>
            <p className="text-gray-600">Loading Genesis Badge data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300">
          🎉 Fusion Complete!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Congratulations on completing your 8-pillar civic fusion journey
        </p>
      </div>

      {/* Genesis Badge Display */}
      <TruthGenesisBadge 
        badgeData={genesisBadgeData}
        onExportReady={handleBadgeReady}
      />

      {/* Fusion Result */}
      {fusionResult && (
        <Card className={`border-2 ${fusionResult.success ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
          <CardHeader>
            <CardTitle className={`text-center ${fusionResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {fusionResult.success ? '🪙 Genesis Coin Fusion Successful' : '❌ Genesis Coin Fusion Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-mono text-sm mb-2">
              Transaction ID: {fusionResult.transactionId}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {fusionResult.success 
                ? 'Your Genesis Coin has been minted and is ready for use in decentralized governance'
                : 'Genesis Coin fusion encountered an error. Please try again or contact support'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={handleDownloadBadge}
            disabled={!badgeReady || exportInProgress}
            size="lg"
            className="min-h-[48px] bg-purple-600 hover:bg-purple-700"
          >
            {exportInProgress ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Downloading...
              </div>
            ) : (
              '📥 Download Badge'
            )}
          </Button>
          
          <Button
            onClick={handleReturnToDeck}
            variant="outline"
            size="lg"
            className="min-h-[48px]"
          >
            🏠 Return to Deck
          </Button>
          
          <Button
            onClick={handleClaimNextPillar}
            variant="outline"
            size="lg"
            className="min-h-[48px]"
          >
            🚀 Claim Next Pillar
          </Button>

          <Button
            onClick={handleViewFusionHistory}
            variant="outline"
            size="lg"
            className="min-h-[48px]"
          >
            📖 View History
          </Button>
        </div>

        {/* Instructions */}
        <Card className="bg-slate-50 dark:bg-slate-800">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Download your Genesis Badge for permanent records</li>
              <li>• Use your Genesis Coin for enhanced governance voting</li>
              <li>• Continue building civic reputation through pillar engagement</li>
              <li>• Share your achievement with the TruthUnveiled community</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {badgeReady 
          ? 'Genesis Badge ready for download. Fusion cycle complete.' 
          : 'Genesis Badge generation in progress'
        }
        {fusionResult && (
          fusionResult.success 
            ? 'Genesis Coin fusion successful' 
            : 'Genesis Coin fusion failed'
        )}
      </div>
    </div>
  );
};

export default FusionCompletePage;