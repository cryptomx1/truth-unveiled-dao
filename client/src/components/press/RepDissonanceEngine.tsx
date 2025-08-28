/**
 * RepDissonanceEngine.tsx
 * Phase PRESS-REPLAY Step 3 - Representative Alignment Dissonance Detection
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface RepDissonanceData {
  representativeId: string;
  representativeName: string;
  district: string;
  constituentSentiment: number; // 0-100
  publicVotingRecord: number; // 0-100
  dissonanceLevel: 'green' | 'yellow' | 'red';
  dissonanceScore: number; // 0-100
  lastUpdate: Date;
  issueBreakdown: Array<{
    issue: string;
    constituentPosition: number;
    repVoteHistory: number;
    delta: number;
  }>;
  trustCoinReward: number;
}

const RepDissonanceEngine: React.FC = () => {
  const [dissonanceData, setDissonanceData] = useState<RepDissonanceData[]>([]);
  const [selectedRep, setSelectedRep] = useState<RepDissonanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize rep dissonance monitoring with cross-deck sync
    const initializeDissonanceTracking = async () => {
      // Import and sync with Deck #10 feedback
      const { deck10FeedbackSync } = await import('@/utils/Deck10FeedbackSync');
      const syncResult = deck10FeedbackSync.syncFeedbackWithAlignment();
      
      console.log('🔗 Cross-deck sync result:', syncResult);
      // Get synchronized representative data from Deck #10 feedback
      const alignmentData = deck10FeedbackSync.getAllAlignmentData();
      const mockRepData: RepDissonanceData[] = alignmentData.map(rep => {
        const dissonanceScore = Math.abs(rep.constituentSentiment - rep.publicVotingRecord);
        return {
          representativeId: rep.representativeId,
          representativeName: rep.representativeName,
          district: rep.district,
          constituentSentiment: rep.constituentSentiment,
          publicVotingRecord: rep.publicVotingRecord,
          dissonanceLevel: dissonanceScore > 30 ? 'red' : dissonanceScore > 15 ? 'yellow' : 'green',
          dissonanceScore,
          lastUpdate: rep.lastSyncTimestamp,
          issueBreakdown: rep.feedbackEntries.slice(0, 3).map(feedback => ({
            issue: feedback.issue,
            constituentPosition: feedback.sentiment + 50, // Convert -100/+100 to 0-100
            repVoteHistory: rep.publicVotingRecord,
            delta: Math.abs((feedback.sentiment + 50) - rep.publicVotingRecord)
          })),
          trustCoinReward: dissonanceScore > 30 ? 150 : dissonanceScore > 15 ? 75 : 25
        };
      });
      
      // Fallback data if no sync data available
      if (mockRepData.length === 0) {
        mockRepData.push({
          representativeId: 'rep_district_01',
          representativeName: 'Rep. Sarah Chen',
          district: 'District 01',
          constituentSentiment: 73,
          publicVotingRecord: 45,
          dissonanceLevel: 'red',
          dissonanceScore: 85,
          lastUpdate: new Date(),
          issueBreakdown: [
            { issue: 'Healthcare Reform', constituentPosition: 78, repVoteHistory: 32, delta: 46 },
            { issue: 'Climate Action', constituentPosition: 82, repVoteHistory: 28, delta: 54 },
            { issue: 'Education Funding', constituentPosition: 71, repVoteHistory: 89, delta: 18 }
          ],
          trustCoinReward: 150
        },
        {
          representativeId: 'rep_district_02',
          representativeName: 'Rep. Michael Torres',
          district: 'District 02',
          constituentSentiment: 64,
          publicVotingRecord: 58,
          dissonanceLevel: 'yellow',
          dissonanceScore: 32,
          lastUpdate: new Date(),
          issueBreakdown: [
            { issue: 'Infrastructure', constituentPosition: 69, repVoteHistory: 71, delta: 2 },
            { issue: 'Immigration', constituentPosition: 58, repVoteHistory: 44, delta: 14 },
            { issue: 'Tax Policy', constituentPosition: 65, repVoteHistory: 59, delta: 6 }
          ],
          trustCoinReward: 75
        },
        {
          representativeId: 'rep_district_03',
          representativeName: 'Rep. Lisa Rodriguez',
          district: 'District 03',
          constituentSentiment: 91,
          publicVotingRecord: 88,
          dissonanceLevel: 'green',
          dissonanceScore: 12,
          lastUpdate: new Date(),
          issueBreakdown: [
            { issue: 'Veterans Affairs', constituentPosition: 94, repVoteHistory: 92, delta: 2 },
            { issue: 'Small Business', constituentPosition: 87, repVoteHistory: 85, delta: 2 },
            { issue: 'Rural Development', constituentPosition: 92, repVoteHistory: 87, delta: 5 }
          ],
          trustCoinReward: 25
        });
      }

      setDissonanceData(mockRepData);
      setIsLoading(false);
      
      // Console telemetry for dissonance detection
      console.log('📊 RepDissonanceEngine: Initialized tracking for', mockRepData.length, 'representatives');
      console.log('🔍 Cross-deck integration: /deck/10 feedback → DAO alignment analysis');
    };

    initializeDissonanceTracking();

    // Real-time updates every 30 seconds
    const updateInterval = setInterval(() => {
      setDissonanceData(prev => prev.map(rep => ({
        ...rep,
        constituentSentiment: Math.max(10, Math.min(100, rep.constituentSentiment + (Math.random() - 0.5) * 6)),
        lastUpdate: new Date()
      })));
    }, 30000);

    return () => clearInterval(updateInterval);
  }, []);

  const getDissonanceColor = (level: 'green' | 'yellow' | 'red') => {
    switch (level) {
      case 'green': return 'bg-green-500 text-green-50';
      case 'yellow': return 'bg-yellow-500 text-yellow-50';
      case 'red': return 'bg-red-500 text-red-50';
    }
  };

  const getDissonanceEmoji = (level: 'green' | 'yellow' | 'red') => {
    switch (level) {
      case 'green': return '✅';
      case 'yellow': return '⚠️';
      case 'red': return '🚨';
    }
  };

  const handleTriggerNudge = (rep: RepDissonanceData) => {
    console.log(`📣 Nudge triggered for ${rep.representativeName} - Dissonance: ${rep.dissonanceLevel}`);
    console.log(`💰 TrustCoin reward available: ${rep.trustCoinReward} TC for citizen engagement`);
    
    // Emit dissonance event for DAO metadata index
    const dissonanceEvent = {
      type: 'RepDissonanceEvent',
      representativeId: rep.representativeId,
      dissonanceLevel: rep.dissonanceLevel,
      dissonanceScore: rep.dissonanceScore,
      timestamp: new Date().toISOString(),
      nudgeTriggered: true
    };
    
    // Store in DAO metadata index (mock)
    localStorage.setItem('RepDissonanceEvents', JSON.stringify([
      ...(JSON.parse(localStorage.getItem('RepDissonanceEvents') || '[]')),
      dissonanceEvent
    ]));
    
    // ARIA announcement
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(`Dissonance alert triggered for ${rep.representativeName}`);
      utterance.rate = 0.8;
      utterance.volume = 0.4;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading representative dissonance analysis...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Representative Dissonance Engine
            <Badge variant="outline">Live Tracking</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Cross-referencing /deck/10 feedback with DAO representative alignment data to detect trust deltas between constituent sentiment and public votes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {dissonanceData.filter(r => r.dissonanceLevel === 'red').length}
              </div>
              <div className="text-sm text-red-600">High Dissonance</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {dissonanceData.filter(r => r.dissonanceLevel === 'yellow').length}
              </div>
              <div className="text-sm text-yellow-600">Moderate Dissonance</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dissonanceData.filter(r => r.dissonanceLevel === 'green').length}
              </div>
              <div className="text-sm text-green-600">Aligned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Representative List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dissonanceData.map(rep => (
          <Card 
            key={rep.representativeId} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRep?.representativeId === rep.representativeId ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedRep(rep)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rep.representativeName}</CardTitle>
                <Badge className={getDissonanceColor(rep.dissonanceLevel)}>
                  {getDissonanceEmoji(rep.dissonanceLevel)} {rep.dissonanceLevel.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{rep.district}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Constituent Sentiment</span>
                  <span className="font-mono">{rep.constituentSentiment}%</span>
                </div>
                <Progress value={rep.constituentSentiment} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Voting Record Alignment</span>
                  <span className="font-mono">{rep.publicVotingRecord}%</span>
                </div>
                <Progress value={rep.publicVotingRecord} className="h-2" />
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-semibold">
                  Dissonance: {rep.dissonanceScore}%
                </span>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerNudge(rep);
                  }}
                  className="h-8 text-xs"
                >
                  📣 Nudge
                </Button>
              </div>
              
              <div className="text-xs text-gray-500">
                💰 {rep.trustCoinReward} TC reward available
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      {selectedRep && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedRep.representativeName} - Detailed Analysis</span>
              <Badge className={getDissonanceColor(selectedRep.dissonanceLevel)}>
                {selectedRep.dissonanceScore}% Dissonance
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Issue Breakdown</h4>
                <div className="space-y-3">
                  {selectedRep.issueBreakdown.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{issue.issue}</span>
                        <Badge variant={issue.delta > 20 ? 'destructive' : issue.delta > 10 ? 'secondary' : 'default'}>
                          Δ {issue.delta}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div>Constituent: {issue.constituentPosition}%</div>
                        <div>Rep Votes: {issue.repVoteHistory}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Actions</h4>
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleTriggerNudge(selectedRep)}
                    className="w-full"
                  >
                    📣 Send Nudge Signal
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('/press/wave', '_blank')}
                  >
                    📊 View Press Wave Data
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('/deck/10', '_blank')}
                  >
                    💬 Review Feedback (Deck #10)
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      // Trigger cross-deck sync
                      const { llmSentimentRefiner } = await import('@/utils/LLMSentimentRefiner');
                      const analysis = await llmSentimentRefiner.performComprehensiveAnalysis(selectedRep.representativeId);
                      console.log('🔗 Cross-deck analysis complete:', analysis);
                    }}
                  >
                    🧠 Generate LLM Insights
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">💰 TrustCoin Incentive</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Citizens who engage with nudged representatives earn {selectedRep.trustCoinReward} TrustCoins for verified engagement actions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ARIA Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        RepDissonanceEngine monitoring {dissonanceData.length} representatives. 
        {dissonanceData.filter(r => r.dissonanceLevel === 'red').length} high dissonance alerts active.
      </div>
    </div>
  );
};

export default RepDissonanceEngine;