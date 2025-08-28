/**
 * CivicFusionRouter.tsx
 * Civic Fusion Cycle - Parent Route Wrapper
 * Authority: Commander Mark via JASMY Relay
 */

import React from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CivicMissionOnboardingCard from '@/components/onboarding/CivicMissionOnboardingCard';
import CivicCompass from '@/components/compass/CivicCompass';
import { FusionEligibilityGate } from '@/components/fusion/FusionEligibilityGate';
import { FusionDashboard } from '@/pages/FusionDashboard';
import { FusionStatusPage } from '@/pages/FusionStatusPage';
import FusionCompletePage from '@/pages/FusionCompletePage';

export const CivicFusionRouter: React.FC = () => {
  const [location] = useLocation();

  // Telemetry logging for route access
  React.useEffect(() => {
    console.log(`🧬 Civic Fusion Route accessed: ${location}`);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        
        {/* Fusion Cycle Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🧬 Civic Fusion Cycle</h1>
          <p className="text-gray-600">TruthUnveiled DNA Loop — Unified Civic Journey</p>
          <Badge variant="outline" className="mt-2">
            Phase 1: Onboarding Validation
          </Badge>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/'}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Home
                </Button>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600">Fusion Cycle</span>
                {location.includes('/onboarding/') && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">Mission Selection</span>
                  </>
                )}
                {location.includes('/request') && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">Eligibility Check</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Content */}
        <div 
          role="main" 
          aria-label="Civic Fusion Cycle Content"
          className="w-full max-w-6xl mx-auto"
        >
          <Switch>
            {/* Fusion Dashboard */}
            <Route path="/fusion/dashboard" component={FusionDashboard} />
            
            {/* Individual Record Status */}
            <Route path="/fusion/status/:cid" component={FusionStatusPage} />
            
            {/* Mission Onboarding */}
            <Route path="/fusion/onboarding">
              <CivicMissionOnboardingCard 
                onMissionSelect={(route) => {
                  console.log(`🎯 Mission selected: ${route}`);
                  window.location.href = route;
                }}
                fusionMode={true}
              />
            </Route>
            
            {/* Mission-specific Compass */}
            <Route path="/fusion/onboarding/:missionId">
              {(params) => (
                <CivicCompass 
                  onDirectionSelect={(direction) => {
                    console.log(`🧭 Pillar direction selected: ${direction.deckRoute}`);
                    // Announce pillar selection
                    if (window.speechSynthesis) {
                      const utterance = new SpeechSynthesisUtterance(
                        `You've selected ${params.missionId}. Recommended Pillar: ${direction.name}. Guardian: ${direction.guardian || 'Athena'}.`
                      );
                      utterance.rate = 0.8;
                      utterance.volume = 0.3;
                      window.speechSynthesis.speak(utterance);
                    }
                    window.location.href = direction.deckRoute;
                  }}
                  missionId={params.missionId}
                />
              )}
            </Route>
            
            {/* Fusion Eligibility Gate with ZKP Integration */}
            <Route path="/fusion/request">
              <FusionEligibilityGate />
            </Route>
            
            {/* Genesis Badge Completion */}
            <Route path="/fusion/complete">
              <FusionCompletePage />
            </Route>
            
            {/* Default Fusion Landing */}
            <Route path="/fusion">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🧬</div>
                <h2 className="text-3xl font-bold mb-4">Welcome to Civic Fusion</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Begin your journey through the TruthUnveiled DNA Loop. Complete civic missions, 
                  master pillars, and unlock the Guardian badge system.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => window.location.href = '/fusion/onboarding'}
                    size="lg"
                    className="min-w-48"
                  >
                    🚀 Start Civic Mission
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/fusion/dashboard'}
                    size="lg"
                    className="min-w-48"
                  >
                    📊 View Progress
                  </Button>
                </div>
              </div>
            </Route>
          </Switch>
        </div>

        {/* ARIA Live Region for Announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="fusion-announcements"
        >
          Civic Fusion Cycle interface ready
        </div>
      </div>
    </div>
  );
};