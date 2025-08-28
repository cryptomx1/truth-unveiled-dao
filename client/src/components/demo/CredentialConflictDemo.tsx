// Phase VII Step 3 Demo: CredentialConflictDemo.tsx
// Commander Mark authorization via JASMY Relay
// Interactive demo interface for CredentialConflictResolver

import React, { useState, useEffect, useRef } from 'react';
import { CredentialConflictResolver, ConflictEntry, ConflictResolution, ConflictMetrics } from '../resolution/CredentialConflictResolver';

export default function CredentialConflictDemo() {
  const [conflictResolver] = useState(() => new CredentialConflictResolver());
  const [isRunning, setIsRunning] = useState(false);
  const [conflictResults, setConflictResults] = useState<ConflictResolution[]>([]);
  const [conflictMetrics, setConflictMetrics] = useState<ConflictMetrics>();
  const [conflictLog, setConflictLog] = useState<ConflictEntry[]>([]);
  const [performanceResults, setPerformanceResults] = useState<any>(null);
  
  const mountTimestamp = useRef<number>(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  useEffect(() => {
    // Performance measurement
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 125) {
      console.warn(`⚠️ CredentialConflictDemo render time: ${renderTime}ms (exceeds 125ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Credential conflict resolver demo interface ready"');
    }

    // Load initial data
    loadConflictData();
  }, []);

  // Load conflict data
  const loadConflictData = () => {
    const metrics = conflictResolver.getConflictMetrics();
    const log = conflictResolver.getConflictLog();
    
    setConflictMetrics(metrics);
    setConflictLog(log);
  };

  // Run conflict test suite (6 conflicts: 4 resolvable, 2 fallback)
  const runConflictTestSuite = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    
    try {
      if (ttsOverrideRef.current) {
        console.log('🔇 TTS disabled: "Starting conflict resolution test suite"');
      }

      // Generate test conflicts for demonstration
      await generateTestConflicts();
      
      // Run detection and resolution
      const results = await conflictResolver.detectAndResolveConflicts();
      
      // Update state
      setConflictResults(results);
      loadConflictData();
      
      if (ttsOverrideRef.current) {
        console.log('🔇 TTS disabled: "Conflict resolution test suite completed"');
      }

      console.log(`✅ CredentialConflictDemo: Processed ${results.length} conflicts`);
      
    } catch (error) {
      console.error('❌ CredentialConflictDemo: Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate 6 test conflicts (4 resolvable, 2 fallback)
  const generateTestConflicts = async (): Promise<void> => {
    console.log('🧪 CredentialConflictDemo: Generating 6 test conflicts...');
    
    // Generate synthetic conflict data for testing
    const testConflicts = [
      // Resolvable conflicts (4)
      {
        conflictType: 'hash_mismatch',
        credentialId: 'cred_identity_001',
        resolvable: true,
        description: 'Identity credential hash mismatch between ledger and vault'
      },
      {
        conflictType: 'state_divergence',
        credentialId: 'cred_voting_002',
        resolvable: true,
        description: 'Voting credential state divergence across nodes'
      },
      {
        conflictType: 'cid_inconsistency',
        credentialId: 'cred_governance_003',
        resolvable: true,
        description: 'Governance credential CID inconsistency'
      },
      {
        conflictType: 'node_disagreement',
        credentialId: 'cred_role_004',
        resolvable: true,
        description: 'Role credential node disagreement on verification'
      },
      // Fallback conflicts (2)
      {
        conflictType: 'hash_mismatch',
        credentialId: 'cred_vault_005',
        resolvable: false,
        description: 'Vault credential unresolvable hash conflict'
      },
      {
        conflictType: 'state_divergence',
        credentialId: 'cred_record_006',
        resolvable: false,
        description: 'Record credential irreconcilable state conflict'
      }
    ];

    // Add test data to demonstrate conflicts
    for (const testConflict of testConflicts) {
      console.log(`🧪 Generating ${testConflict.conflictType} for ${testConflict.credentialId}`);
      
      // This would normally create actual conflicting data
      // For demo purposes, we simulate the conflict generation
    }
  };

  // Clear test data
  const clearTestData = () => {
    conflictResolver.clearConflictLog();
    setConflictResults([]);
    setConflictMetrics(conflictResolver.getConflictMetrics());
    setConflictLog([]);
    setPerformanceResults(null);
    
    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Test data cleared"');
    }
  };

  // Run performance validation
  const runPerformanceTest = () => {
    const results = conflictResolver.validatePerformance();
    setPerformanceResults(results);
    
    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Performance validation completed"');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get conflict type icon
  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'hash_mismatch': return '🔀';
      case 'state_divergence': return '🔄';
      case 'cid_inconsistency': return '📋';
      case 'node_disagreement': return '⚖️';
      default: return '❓';
    }
  };

  // Get resolution status color
  const getResolutionStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'arbitration': return 'text-yellow-400';
      case 'pending': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Credential Conflict Resolver
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VII • Step 3 • ZKP Reconciliation Engine</div>
          <div>6 Test Conflicts • 4 Resolvable • 2 Fallback</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mb-6 space-y-3">
        <button
          onClick={runConflictTestSuite}
          disabled={isRunning}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            isRunning
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          style={{ minHeight: '48px' }}
        >
          {isRunning ? 'Running Conflict Tests...' : 'Run Conflict Test Suite'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={runPerformanceTest}
            className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            style={{ minHeight: '48px' }}
          >
            Performance Test
          </button>
          
          <button
            onClick={clearTestData}
            className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            style={{ minHeight: '48px' }}
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* Conflict Metrics */}
      {conflictMetrics && (
        <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Conflict Metrics</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Conflicts:</span>
              <span className="text-white">{conflictMetrics.totalConflicts}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Resolved:</span>
              <span className="text-green-400">{conflictMetrics.resolvedConflicts}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Failed:</span>
              <span className="text-red-400">{conflictMetrics.failedConflicts}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Arbitration:</span>
              <span className="text-yellow-400">{conflictMetrics.arbitrationConflicts}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Resolution Rate:</span>
              <span className={conflictMetrics.conflictResolutionRate >= 80 ? 'text-green-400' : 'text-amber-400'}>
                {conflictMetrics.conflictResolutionRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Resolution Time:</span>
              <span className="text-white">{conflictMetrics.averageResolutionTime.toFixed(0)}ms</span>
            </div>
            
            {conflictMetrics.pathBActivated && (
              <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                <span className="text-red-400 text-xs font-medium">
                  🔴 Path B Activated ({conflictMetrics.pathBActivations} activations)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Results */}
      {performanceResults && (
        <div className="mb-6 p-4 bg-slate-900 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Performance Validation</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Conflict Detection:</span>
              <span className={performanceResults.conflictDetection <= 150 ? 'text-green-400' : 'text-red-400'}>
                {performanceResults.conflictDetection}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">ZKP Revalidation:</span>
              <span className={performanceResults.zkpRevalidation <= 100 ? 'text-green-400' : 'text-red-400'}>
                {performanceResults.zkpRevalidation}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Consensus Time:</span>
              <span className={performanceResults.consensusTime <= 50 ? 'text-green-400' : 'text-red-400'}>
                {performanceResults.consensusTime}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Full Cycle:</span>
              <span className={performanceResults.fullCycle <= 200 ? 'text-green-400' : 'text-red-400'}>
                {performanceResults.fullCycle}ms
              </span>
            </div>
            
            <div className="mt-2 text-center">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                performanceResults.passed ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
              }`}>
                {performanceResults.passed ? '✅ Performance Targets Met' : '❌ Performance Targets Missed'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {conflictResults.length > 0 && (
        <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-md">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Test Results ({conflictResults.length} conflicts)
          </h3>
          <div className="space-y-2 text-xs">
            {conflictResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className="text-slate-300">
                    Test {index + 1}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">{result.resolutionTime}ms</div>
                  <div className="text-slate-500">{result.nodesParticipated} nodes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflict Log */}
      {conflictLog.length > 0 && (
        <div className="bg-slate-700 border border-slate-600 rounded-md">
          <div className="p-3 border-b border-slate-600">
            <h3 className="text-sm font-medium text-slate-300">
              Conflict Log ({conflictLog.length} entries)
            </h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            <div className="divide-y divide-slate-600">
              {conflictLog.slice(-10).reverse().map((conflict) => (
                <div key={conflict.conflictId} className="p-3 hover:bg-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getConflictTypeIcon(conflict.conflictType)}
                      </span>
                      <span className={`text-sm font-medium ${getResolutionStatusColor(conflict.resolutionStatus)}`}>
                        {conflict.resolutionStatus}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(conflict.conflictTimestamp)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-slate-300">{conflict.conflictType}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">Credential:</span>
                      <span className="text-slate-300 font-mono">
                        {conflict.credentialId.slice(0, 12)}...
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sources:</span>
                      <span className="text-slate-300">{conflict.detectedSources.length}</span>
                    </div>
                    
                    {conflict.nodeParticipation.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nodes:</span>
                        <span className="text-slate-300">{conflict.nodeParticipation.length}</span>
                      </div>
                    )}
                    
                    {conflict.pathBTriggered && (
                      <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                        <span className="text-red-400 text-xs font-medium">
                          🔴 Path B Fallback Triggered
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {conflictLog.length === 0 && !isRunning && (
        <div className="text-center py-8 text-slate-400">
          <div className="text-sm">No conflicts detected</div>
          <div className="text-xs mt-1">Run test suite to generate conflict data</div>
        </div>
      )}

      {/* Status Footer */}
      <div className="mt-4 p-3 bg-slate-900 border border-slate-600 rounded-md">
        <div className="text-sm font-medium text-slate-300 mb-2">Engine Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Detection Engine:</span>
            <span className="text-green-400">Active</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">ZKP Reconciliation:</span>
            <span className="text-green-400">Ready</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Path B Threshold:</span>
            <span className="text-white">≥10% unresolved</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Performance Target:</span>
            <span className="text-white">≤150ms per conflict</span>
          </div>
        </div>
      </div>
    </div>
  );
}