import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  Star, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Coins, 
  Shield,
  Eye,
  Sparkles
} from 'lucide-react';
import { truthFusionEngine, type GenesisBadgeMetadata, type FusionValidation } from '@/fusion/TruthFusionEngine';

interface GenesisBadgeBinderProps {
  userDID?: string;
}

const GenesisBadgeBinder: React.FC<GenesisBadgeBinderProps> = ({ 
  userDID = 'did:civic:alice123' 
}) => {
  const [tpAmount, setTpAmount] = useState<string>('500');
  const [fusionValidation, setFusionValidation] = useState<FusionValidation | null>(null);
  const [badgePreview, setBadgePreview] = useState<Partial<GenesisBadgeMetadata> | null>(null);
  const [fusionInProgress, setFusionInProgress] = useState(false);
  const [completedBadge, setCompletedBadge] = useState<GenesisBadgeMetadata | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Suppress TTS
  useEffect(() => {
    console.log('🔇 TTS Emergency Killer: ACTIVE');
    
    // ARIA announcement without TTS
    const ariaRegion = document.createElement('div');
    ariaRegion.setAttribute('aria-live', 'polite');
    ariaRegion.setAttribute('aria-atomic', 'true');
    ariaRegion.style.position = 'absolute';
    ariaRegion.style.left = '-9999px';
    ariaRegion.textContent = 'Genesis Badge fusion interface ready for civic pioneers';
    document.body.appendChild(ariaRegion);
    
    setTimeout(() => document.body.removeChild(ariaRegion), 1000);
  }, []);

  // Calculate fusion validation when TP amount changes
  useEffect(() => {
    if (tpAmount && !isNaN(Number(tpAmount))) {
      const validation = truthFusionEngine.calculateFusionEligibility(userDID, Number(tpAmount));
      setFusionValidation(validation);

      if (validation.isEligible) {
        const preview = truthFusionEngine.previewGenesisBadge(userDID, Number(tpAmount));
        setBadgePreview(preview);
      } else {
        setBadgePreview(null);
      }
    }
  }, [tpAmount, userDID]);

  const handleFusionExecute = async () => {
    if (!fusionValidation?.isEligible) return;

    setFusionInProgress(true);
    try {
      const badge = await truthFusionEngine.executeFusion(userDID, Number(tpAmount));
      setCompletedBadge(badge);
      
      console.log('⚡ Genesis fusion completed successfully');
      
      // ARIA success announcement
      const ariaRegion = document.createElement('div');
      ariaRegion.setAttribute('aria-live', 'assertive');
      ariaRegion.style.position = 'absolute';
      ariaRegion.style.left = '-9999px';
      ariaRegion.textContent = `Genesis Badge fusion successful. ${badge.truthCoinsGenerated} TruthCoins generated from ${badge.truthPointsConsumed} Truth Points.`;
      document.body.appendChild(ariaRegion);
      
      setTimeout(() => document.body.removeChild(ariaRegion), 2000);
      
    } catch (error) {
      console.error('❌ Fusion failed:', error);
    } finally {
      setFusionInProgress(false);
    }
  };

  const handleExportBadge = () => {
    if (!completedBadge) return;

    const exportData = truthFusionEngine.exportBadgeMetadata(completedBadge);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `genesis_badge_${completedBadge.badgeId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('📤 Genesis Badge exported:', completedBadge.badgeId);
  };

  const tpBalance = truthFusionEngine.validateTPBalance(userDID);
  const tierRequirements = truthFusionEngine.getTierRequirements();

  return (
    <Card className="w-full max-w-4xl bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
          Genesis Badge Binder
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Fuse Truth Points into permanent Genesis Badges with cryptographic proof-of-origin
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current TP Balance */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Available Truth Points
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {tpBalance.availableTP.toLocaleString()} TP
              </p>
            </div>
            
            <div className="text-right">
              <Badge variant="outline" className={`
                ${tpBalance.eligibleForFusion ? 'text-green-600 border-green-300' : 'text-yellow-600 border-yellow-300'}
              `}>
                {tpBalance.tierLevel}
              </Badge>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {tpBalance.eligibleForFusion ? 'Fusion Eligible' : 'Insufficient Balance'}
              </p>
            </div>
          </div>
        </div>

        {/* Fusion Input */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tpAmount" className="text-slate-700 dark:text-slate-300">
                Truth Points to Fuse (Min: 500 TP)
              </Label>
              <Input
                id="tpAmount"
                type="number"
                value={tpAmount}
                onChange={(e) => setTpAmount(e.target.value)}
                min="500"
                max={tpBalance.availableTP}
                className="text-lg"
                placeholder="Enter TP amount"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="w-full flex items-center gap-2"
                disabled={!fusionValidation?.isEligible}
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide Preview' : 'Preview Badge'}
              </Button>
            </div>
          </div>

          {/* Validation Status */}
          {fusionValidation && (
            <div className={`rounded-lg p-4 border-l-4 ${
              fusionValidation.isEligible 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
            }`}>
              <div className="flex items-start gap-3">
                {fusionValidation.isEligible ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <p className={`font-medium ${
                    fusionValidation.isEligible ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {fusionValidation.isEligible ? 'Fusion Eligible' : 'Fusion Requirements Not Met'}
                  </p>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Estimated TruthCoins:</span>
                      <span className="ml-2 font-medium text-purple-600">
                        {fusionValidation.estimatedTC} TC
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Conversion Rate:</span>
                      <span className="ml-2 font-medium">
                        {(fusionValidation.fusionRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Tier Multiplier:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {tierRequirements[tpBalance.tierLevel]?.multiplier || 1.0}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Badge Preview */}
        {showPreview && badgePreview && (
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Genesis Badge Preview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Holder DID:</span>
                  <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                    {badgePreview.holderDID}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Truth Points Consumed:</span>
                  <p className="text-lg font-bold text-red-600">
                    -{badgePreview.truthPointsConsumed?.toLocaleString()} TP
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">TruthCoins Generated:</span>
                  <p className="text-lg font-bold text-purple-600">
                    +{badgePreview.truthCoinsGenerated} TC
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Tier Achieved:</span>
                  <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">
                    {badgePreview.tierAchieved}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fusion Action */}
        {!completedBadge ? (
          <div className="flex justify-center">
            <Button
              onClick={handleFusionExecute}
              disabled={!fusionValidation?.isEligible || fusionInProgress}
              className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {fusionInProgress ? (
                <>
                  <Zap className="h-5 w-5 mr-2 animate-spin" />
                  Fusing Genesis Badge...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Execute Genesis Fusion
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Completed Badge Display */
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle className="h-6 w-6" />
                <span className="text-xl font-bold">Genesis Badge Created!</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your civic pioneer status has been permanently encoded
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Badge ID:</span>
                  <p className="text-sm font-mono text-slate-900 dark:text-slate-100">
                    {completedBadge.badgeId}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Proof Hash:</span>
                  <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                    {completedBadge.proofHash}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Permanent CID:</span>
                  <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                    {completedBadge.permanentCID}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">TruthCoins Minted:</span>
                  <p className="text-lg font-bold text-purple-600">
                    {completedBadge.truthCoinsGenerated} TC
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Fusion Timestamp:</span>
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    {new Date(completedBadge.fusionTimestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pioneer Tier:</span>
                  <Badge variant="outline" className="ml-2 text-purple-600 border-purple-300">
                    {completedBadge.tierAchieved}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleExportBadge}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Download className="h-4 w-4" />
                Export Genesis Badge
              </Button>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {fusionInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Genesis Fusion Progress</span>
              <span>Cryptographic binding in progress...</span>
            </div>
            <Progress value={85} className="h-2 bg-purple-100" />
          </div>
        )}

        {/* Help Text */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 text-blue-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                About Genesis Badge Fusion
              </p>
              <p>
                Genesis Badges provide permanent proof-of-origin for civic pioneers. The fusion process converts Truth Points 
                into TruthCoins while creating an immutable record of early platform engagement. Higher tier holders receive 
                conversion multipliers as recognition of their civic contributions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenesisBadgeBinder;