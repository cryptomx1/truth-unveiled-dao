/**
 * OnboardingVerifyPage.tsx
 * Phase X-M Step 2: Guardian Verification Route
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GuardianPillarSync } from '@/components/guardian/GuardianPillarSync';
import { LightOfTruthBadge } from '@/components/guardian/LightOfTruthBadge';
import { zkBadgeExportService } from '@/services/ZKBadgeExport';

export const OnboardingVerifyPage: React.FC = () => {
  const [verificationStep, setVerificationStep] = useState<'pillar_check' | 'badge_preview' | 'export_ready'>('pillar_check');
  const [badgeData, setBadgeData] = useState<any>(null);
  const [exportInProgress, setExportInProgress] = useState(false);

  useEffect(() => {
    // Announce page ready for accessibility
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Guardian verification page loaded');
      utterance.rate = 0.8;
      utterance.volume = 0.3;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleBadgeUnlock = (unlockedBadgeData: any) => {
    console.log('🏆 Guardian badge unlocked:', unlockedBadgeData);
    setBadgeData(unlockedBadgeData);
    setVerificationStep('badge_preview');
    
    // TTS announcement
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Light of Truth Guardian Badge unlocked! All civic pillars mastered.');
      utterance.rate = 0.8;
      utterance.volume = 0.4;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExportBadge = async () => {
    if (!badgeData) return;
    
    setExportInProgress(true);
    console.log('💾 Exporting Guardian badge...');
    
    try {
      const exportResult = await zkBadgeExportService.exportGuardianBadge(badgeData);
      
      if (exportResult.success) {
        setVerificationStep('export_ready');
        console.log(`✅ Badge exported successfully: ${exportResult.filename}`);
        
        // TTS confirmation
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance('Guardian badge exported successfully');
          utterance.rate = 0.8;
          utterance.volume = 0.4;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('❌ Badge export failed:', error);
    } finally {
      setExportInProgress(false);
    }
  };

  const renderStepContent = () => {
    switch (verificationStep) {
      case 'pillar_check':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Guardian Pillar Verification</h2>
              <p className="text-gray-600">
                Complete all 8 Civic Pillars to unlock your Light of Truth Guardian Badge
              </p>
            </div>
            
            <GuardianPillarSync onBadgeUnlock={handleBadgeUnlock} />
          </div>
        );
        
      case 'badge_preview':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">🌟 Congratulations, Guardian!</h2>
              <p className="text-green-600 font-semibold">
                You have mastered all 8 Civic Pillars and unlocked the Light of Truth Guardian Badge
              </p>
            </div>
            
            <LightOfTruthBadge 
              isUnlocked={true}
              size="large"
              showAnimation={true}
              badgeData={badgeData}
            />
            
            <div className="text-center space-y-4">
              <Button
                onClick={handleExportBadge}
                disabled={exportInProgress}
                size="lg"
                className="min-w-64"
              >
                {exportInProgress ? '🔄 Exporting...' : '💾 Download Guardian Badge'}
              </Button>
              
              <p className="text-sm text-gray-500">
                Your badge will be saved as a .guardian.json file with ZKP verification
              </p>
            </div>
          </div>
        );
        
      case 'export_ready':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">✅ Guardian Badge Claimed</h2>
              <p className="text-green-600">
                Your Light of Truth Guardian Badge has been successfully exported
              </p>
            </div>
            
            <LightOfTruthBadge 
              isUnlocked={true}
              size="medium"
              showAnimation={true}
              badgeData={badgeData}
            />
            
            <Card className="bg-green-50 dark:bg-green-900 border-green-200">
              <CardContent className="p-6 text-center space-y-4">
                <div className="text-green-800 dark:text-green-200">
                  <h3 className="text-lg font-semibold">Badge Export Complete</h3>
                  <p>Your Guardian credentials are now ready for verification across the civic ecosystem</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-2">ZKP Hash</Badge>
                    <p className="font-mono text-xs break-all">
                      {badgeData?.zkpHash || 'Generated upon export'}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Total TP</Badge>
                    <p className="text-lg font-bold">{badgeData?.totalTp || 0}</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Return to Platform
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/genesis-fuse'}>
                    Explore Genesis Fusion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Truth Guardian Verification</h1>
          <p className="text-gray-600">Phase X-M Step 2: Truth Zone Guardian Badge System</p>
        </div>
        
        {renderStepContent()}
        
        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${verificationStep === 'pillar_check' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div className={`w-3 h-3 rounded-full ${verificationStep === 'badge_preview' ? 'bg-blue-500' : verificationStep === 'export_ready' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${verificationStep === 'export_ready' ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};