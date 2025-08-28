/**
 * RegionalBroadcastTest.tsx - Phase X-Z Step 3
 * 
 * QA test interface for regional CID propagation validation
 * Provides testing interface for the 10-simulation requirement
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-Z Global Civic Stack Deployment - Step 3
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Radio, Globe, CheckCircle, AlertTriangle, Activity, Database } from 'lucide-react';
import { DeploymentBroadcastAgent, type RegionalBroadcastResult } from './DeploymentBroadcastAgent';

interface QAResults {
  totalSimulations: number;
  successfulSimulations: number;
  fallbackTriggered: number;
  averageSuccessRate: number;
  schemaValidationPassed: boolean;
}

const RegionalBroadcastTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [qaResults, setQAResults] = useState<QAResults | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<RegionalBroadcastResult[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');

  const broadcastAgent = new DeploymentBroadcastAgent();

  const runQASimulations = async () => {
    setIsRunning(true);
    setCurrentStep('Initializing QA simulation suite...');
    
    try {
      // Clear previous results
      broadcastAgent.clearHistory();
      setSimulationHistory([]);
      
      // Run QA simulations
      setCurrentStep('Running 10 regional broadcast simulations...');
      const results = await broadcastAgent.runQASimulations();
      
      setQAResults(results);
      setSimulationHistory(broadcastAgent.getQASimulationHistory());
      setCurrentStep('QA simulation suite completed');
      
      console.log('✅ Phase X-Z Step 3 QA validation completed');
      
    } catch (error) {
      console.error('QA simulation failed:', error);
      setCurrentStep('QA simulation failed');
    } finally {
      setIsRunning(false);
    }
  };

  const runSinglePropagation = async (country: string, tier: 'tier1' | 'tier2' | 'tier3') => {
    setCurrentStep(`Running single propagation for ${country} (${tier})...`);
    
    const deploymentId = `manual_test_${Date.now()}`;
    const deckGroup = tier === 'tier1' ? ['governance', 'privacy', 'finance'] :
                     tier === 'tier2' ? ['governance', 'privacy'] :
                     ['governance'];
    
    try {
      const result = await broadcastAgent.propagateRegionalCID(
        deploymentId,
        country,
        `${country.toLowerCase()}_locale`,
        tier,
        deckGroup,
        'manual-test'
      );
      
      setSimulationHistory([result, ...simulationHistory]);
      setCurrentStep(`Single propagation completed for ${country}`);
      
    } catch (error) {
      console.error('Single propagation failed:', error);
      setCurrentStep('Single propagation failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-400';
      case 'failed': return 'text-red-400 border-red-400';
      case 'broadcasting': return 'text-blue-400 border-blue-400';
      default: return 'text-amber-400 border-amber-400';
    }
  };

  const getNetworkHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'degraded': return 'text-amber-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-100">
            <Radio className="h-6 w-6 text-orange-400" />
            Regional CID Propagation Test Suite
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              Phase X-Z Step 3
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QA Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={runQASimulations}
              disabled={isRunning}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isRunning ? 'Running QA Suite...' : 'Run Full QA Suite (10 Simulations)'}
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => runSinglePropagation('US', 'tier1')}
                disabled={isRunning}
                variant="outline"
                className="border-slate-600 text-slate-200 text-xs"
              >
                US T1
              </Button>
              <Button
                onClick={() => runSinglePropagation('DE', 'tier2')}
                disabled={isRunning}
                variant="outline"
                className="border-slate-600 text-slate-200 text-xs"
              >
                DE T2
              </Button>
              <Button
                onClick={() => runSinglePropagation('BR', 'tier3')}
                disabled={isRunning}
                variant="outline"
                className="border-slate-600 text-slate-200 text-xs"
              >
                BR T3
              </Button>
            </div>
          </div>

          {/* Status */}
          {currentStep && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{currentStep}</span>
              </div>
            </div>
          )}

          {/* QA Results Summary */}
          {qaResults && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-200">{qaResults.totalSimulations}</div>
                <div className="text-xs text-slate-400">Total Simulations</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{qaResults.successfulSimulations}</div>
                <div className="text-xs text-slate-400">Successful</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{qaResults.fallbackTriggered}</div>
                <div className="text-xs text-slate-400">Fallback Triggered</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{Math.round(qaResults.averageSuccessRate * 100)}%</div>
                <div className="text-xs text-slate-400">Avg Success Rate</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${qaResults.schemaValidationPassed ? 'text-green-400' : 'text-red-400'}`}>
                  {qaResults.schemaValidationPassed ? 'PASS' : 'FAIL'}
                </div>
                <div className="text-xs text-slate-400">Schema Valid</div>
              </div>
            </div>
          )}

          {/* Simulation History */}
          {simulationHistory.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-200 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Propagation History ({simulationHistory.length})
              </h4>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {simulationHistory.map((result, index) => (
                  <div key={result.broadcastId} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                          {result.propagationPayload.jurisdiction.country}
                        </Badge>
                        <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                          {result.propagationPayload.jurisdiction.tier.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(result.propagationPayload.propagationStatus)}`}
                        >
                          {result.propagationPayload.propagationStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {result.fallbackTriggered && (
                          <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                            Fallback
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getNetworkHealthColor(result.networkHealth)}`}
                        >
                          {result.networkHealth}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">CID</div>
                        <div className="text-slate-200 font-mono text-xs break-all">
                          {result.propagationPayload.cid.substring(0, 20)}...
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Success Rate</div>
                        <div className="text-slate-200">
                          {result.successfulNodes.length}/{result.propagationPayload.targetNodes.length} 
                          ({Math.round((result.successfulNodes.length / result.propagationPayload.targetNodes.length) * 100)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">DAO Export</div>
                        <div className={`flex items-center gap-1 ${result.daoLedgerExported ? 'text-green-400' : 'text-red-400'}`}>
                          {result.daoLedgerExported ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {result.daoLedgerExported ? 'Exported' : 'Failed'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">ARIA</div>
                        <div className={`flex items-center gap-1 ${result.ariaAnnounced ? 'text-green-400' : 'text-red-400'}`}>
                          {result.ariaAnnounced ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {result.ariaAnnounced ? 'Announced' : 'Silent'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="text-xs text-slate-400">
                        Deck Group: {result.propagationPayload.jurisdiction.deckGroup.join(', ')} | 
                        Propagation Hash: {result.propagationPayload.metadata.propagationHash}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements Checklist */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-slate-200 mb-4">QA Requirements Checklist</h4>
            <div className="space-y-2">
              {qaResults ? (
                <>
                  <div className={`flex items-center gap-2 ${qaResults.totalSimulations >= 10 ? 'text-green-400' : 'text-amber-400'}`}>
                    {qaResults.totalSimulations >= 10 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>10 regional broadcast simulations ({qaResults.totalSimulations}/10)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${qaResults.successfulSimulations >= 7 ? 'text-green-400' : 'text-amber-400'}`}>
                    {qaResults.successfulSimulations >= 7 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>7+ successful propagations ({qaResults.successfulSimulations}/7)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${qaResults.fallbackTriggered >= 3 ? 'text-green-400' : 'text-amber-400'}`}>
                    {qaResults.fallbackTriggered >= 3 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>3+ fallback triggers ({qaResults.fallbackTriggered}/3)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${qaResults.schemaValidationPassed ? 'text-green-400' : 'text-red-400'}`}>
                    {qaResults.schemaValidationPassed ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>CID metadata schema validation</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400">Run QA suite to validate requirements</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalBroadcastTest;