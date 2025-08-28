/**
 * FeedbackSubmitPage.tsx
 * Phase X-D Step 1: Feedback submission page with trust delta system
 * Commander Mark authorization via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Shield, TrendingUp, Users, Clock } from 'lucide-react';
import TrustDeltaSubmissionCard from '@/components/trust/TrustDeltaSubmissionCard';
import TrustFeedbackEngine from '@/components/trust/TrustFeedbackEngine';

const FeedbackSubmitPage: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<{
    type: 'deck' | 'module' | 'component';
    deckId: string;
    moduleId?: string;
    componentId?: string;
    displayName: string;
  } | null>(null);

  const [userSession] = useState({
    tier: 'Governor' as 'Citizen' | 'Governor' | 'Commander',
    did: 'did:civic:user_gov_12345',
    truthPoints: 750
  });

  const [engineStats, setEngineStats] = useState<any>(null);
  const trustEngine = TrustFeedbackEngine.getInstance();

  useEffect(() => {
    // Load engine statistics
    setEngineStats(trustEngine.getEngineStats());
  }, []);

  const availableTargets = [
    {
      type: 'deck' as const,
      deckId: 'governance_deck',
      displayName: 'Governance Deck',
      description: 'Democratic decision-making and proposal systems'
    },
    {
      type: 'deck' as const,
      deckId: 'civic_identity',
      displayName: 'Civic Identity System',
      description: 'Identity verification and DID management'
    },
    {
      type: 'module' as const,
      deckId: 'privacy_deck',
      moduleId: 'zkp_module',
      displayName: 'Privacy Deck → ZKP Module',
      description: 'Zero-knowledge proof implementation'
    },
    {
      type: 'component' as const,
      deckId: 'civic_reputation',
      moduleId: 'tier_system',
      componentId: 'badge_renderer',
      displayName: 'Reputation → Tier System → Badge Renderer',
      description: 'Civic tier badge display component'
    }
  ];

  const handleSubmissionComplete = (success: boolean, deltaId: string) => {
    if (success) {
      // Refresh statistics
      setEngineStats(trustEngine.getEngineStats());
      
      // Show success notification
      console.log(`✅ Trust feedback submitted successfully for ${deltaId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Anonymous Trust Feedback</h1>
            <p className="text-muted-foreground mt-1">
              Submit weighted civic feedback with ZKP-backed integrity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Phase X-D Step 1
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {userSession.tier}
            </Badge>
          </div>
        </div>

        {/* System Statistics */}
        {engineStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{engineStats.totalSubmissions}</div>
                  <div className="text-xs text-muted-foreground">Total Submissions</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{engineStats.activeDeltas}</div>
                  <div className="text-xs text-muted-foreground">Active Deltas</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{engineStats.avgProcessTime}ms</div>
                  <div className="text-xs text-muted-foreground">Avg Process Time</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(engineStats.tierDistribution).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Tiers</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Target Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Feedback Target</CardTitle>
          <CardDescription>
            Choose the civic component you want to provide trust feedback for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={(value) => {
              const target = availableTargets.find((t, index) => index.toString() === value);
              setSelectedTarget(target || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a deck, module, or component" />
            </SelectTrigger>
            <SelectContent>
              {availableTargets.map((target, index) => (
                <SelectItem key={index} value={index.toString()}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {target.type}
                    </Badge>
                    <span>{target.displayName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTarget && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    Target Selected: {selectedTarget.displayName}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    {availableTargets.find(t => 
                      t.deckId === selectedTarget.deckId && 
                      t.moduleId === selectedTarget.moduleId &&
                      t.componentId === selectedTarget.componentId
                    )?.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Form */}
      {selectedTarget && (
        <TrustDeltaSubmissionCard
          target={selectedTarget}
          userTier={userSession.tier}
          userDID={userSession.did}
          onSubmissionComplete={handleSubmissionComplete}
        />
      )}

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trust Feedback</CardTitle>
          <CardDescription>
            Latest anonymous submissions (anonymized for privacy)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trustEngine.getFeedbackLog({ limit: 5 }).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {entry.payload.target.deckId}
                    {entry.payload.target.moduleId && ` → ${entry.payload.target.moduleId}`}
                    {entry.payload.target.componentId && ` → ${entry.payload.target.componentId}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.payload.feedback.type} • Intensity {entry.payload.feedback.intensity} • 
                    Tier weight {entry.tierWeight}x
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.processedAt).toLocaleTimeString()}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entry.payload.submitter.tier}
                  </Badge>
                </div>
              </div>
            ))}
            
            {trustEngine.getFeedbackLog().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet. Be the first to provide trust feedback!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackSubmitPage;