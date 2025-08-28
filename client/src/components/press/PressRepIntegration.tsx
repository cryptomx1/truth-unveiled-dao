/**
 * PressRepIntegration.tsx
 * Phase PRESS-REPLAY Step 3 - Cross-Deck Integration Component
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { llmSentimentRefiner, type LLMSentimentAnalysis, type RepOptimizedSnippet } from '@/utils/LLMSentimentRefiner';
import { nudgeSignalEmitter, type NudgeSignal } from '@/utils/NudgeSignalEmitter';

interface PressRepIntegrationProps {
  representativeId: string;
  representativeName: string;
  dissonanceLevel: 'green' | 'yellow' | 'red';
}

const PressRepIntegration: React.FC<PressRepIntegrationProps> = ({
  representativeId,
  representativeName,
  dissonanceLevel
}) => {
  const [analysis, setAnalysis] = useState<LLMSentimentAnalysis | null>(null);
  const [snippets, setSnippets] = useState<RepOptimizedSnippet[]>([]);
  const [nudges, setNudges] = useState<NudgeSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing nudges for this representative
    const existingNudges = nudgeSignalEmitter.getNudgesForRepresentative(representativeId);
    setNudges(existingNudges);
  }, [representativeId]);

  const performCrossIntegration = async () => {
    setIsLoading(true);
    
    try {
      // Step 1: Pull insights from all sources
      console.log('📊 Cross-deck integration initiated:', {
        representative: representativeName,
        dissonanceLevel,
        sources: ['deck/10', 'press/wave', 'social_data']
      });
      
      // Step 2: Generate LLM sentiment analysis
      const sentimentAnalysis = await llmSentimentRefiner.performComprehensiveAnalysis(representativeId);
      setAnalysis(sentimentAnalysis);
      
      // Step 3: Generate nudge signal
      const nudgeSignal = nudgeSignalEmitter.generateNudge(
        representativeId,
        representativeName,
        dissonanceLevel,
        Math.abs(sentimentAnalysis.overallSentiment),
        sentimentAnalysis.keyTopics.join(', ')
      );
      
      // Step 4: Update DAO metadata index
      const repDissonanceEvent = {
        type: 'RepDissonanceEvent',
        representativeId,
        representativeName,
        dissonanceLevel,
        overallSentiment: sentimentAnalysis.overallSentiment,
        keyTopics: sentimentAnalysis.keyTopics,
        urgentIssues: sentimentAnalysis.urgentIssues,
        timestamp: new Date().toISOString(),
        nudgeId: nudgeSignal.id,
        trustCoinPotential: nudgeSignal.trustCoinReward
      };
      
      // Store in DAO metadata index
      const existingEvents = JSON.parse(localStorage.getItem('RepDissonanceEvents') || '[]');
      existingEvents.push(repDissonanceEvent);
      localStorage.setItem('RepDissonanceEvents', JSON.stringify(existingEvents));
      
      // Step 5: Sync with press wave
      const pressWaveMetadata = {
        source: 'rep_dissonance_engine',
        representativeId,
        dissonanceScore: Math.abs(sentimentAnalysis.overallSentiment),
        engagement_potential: nudgeSignal.trustCoinReward,
        timestamp: new Date().toISOString()
      };
      
      const pressWaveData = JSON.parse(localStorage.getItem('pressWaveMetadata') || '[]');
      pressWaveData.push(pressWaveMetadata);
      localStorage.setItem('pressWaveMetadata', JSON.stringify(pressWaveData));
      
      // Update local state
      setSnippets(sentimentAnalysis.representativeActions);
      setNudges([nudgeSignal, ...nudges]);
      
      console.log('✅ Cross-deck integration complete:', {
        sentiment: sentimentAnalysis.overallSentiment,
        snippets: sentimentAnalysis.representativeActions.length,
        nudge: nudgeSignal.id,
        trustCoins: nudgeSignal.trustCoinReward
      });
      
    } catch (error) {
      console.error('❌ Cross-integration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Press-Rep Integration
          <Badge variant="outline">Live Sync</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Cross-deck sync: /deck/10 → /press/wave</span>
          <Button
            onClick={performCrossIntegration}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? '🔄 Syncing...' : '🚀 Run Integration'}
          </Button>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Sentiment Analysis</h4>
              <div className="text-xs space-y-1">
                <div>Overall: <Badge variant={analysis.overallSentiment > 0 ? 'default' : 'destructive'}>
                  {analysis.overallSentiment.toFixed(1)}%
                </Badge></div>
                <div>Topics: {analysis.keyTopics.join(', ')}</div>
                <div>Urgent: {analysis.urgentIssues.join(', ')}</div>
                <div>Confidence: {(analysis.confidenceScore * 100).toFixed(0)}%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Generated Actions</h4>
              <div className="space-y-1">
                {snippets.slice(0, 2).map((snippet, index) => (
                  <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium">{snippet.actionType.toUpperCase()}</div>
                    <div className="text-gray-600 dark:text-gray-400">{snippet.snippet}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {snippet.urgencyLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {snippet.trustCoinPotential} TC
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {nudges.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="font-semibold text-sm mb-2">Recent Nudge Signals</h4>
            <div className="space-y-2">
              {nudges.slice(0, 2).map(nudge => (
                <div key={nudge.id} className="text-xs p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{nudge.nudgeMessage}</div>
                    <div className="text-gray-500">{nudge.timestamp.toLocaleTimeString()}</div>
                  </div>
                  <Badge className={
                    nudge.dissonanceLevel === 'red' ? 'bg-red-500' :
                    nudge.dissonanceLevel === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                  }>
                    {nudge.trustCoinReward} TC
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          💡 Integration pushes live alerts to DAO metadata under "RepDissonanceEvents"
        </div>
      </CardContent>
    </Card>
  );
};

export default PressRepIntegration;