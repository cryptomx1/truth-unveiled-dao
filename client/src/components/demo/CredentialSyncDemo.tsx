// Phase VII Step 1: CredentialSyncDemo.tsx
// Commander Mark authorization via JASMY Relay
// Demo interface for CredentialSyncLedger with 10 sync simulations (8 pass, 2 fail)

import React, { useState, useEffect, useRef } from 'react';
import { CredentialSyncLedger, SyncResult, SyncMetrics, SyncEntry } from '../transport/CredentialSyncLedger';
import { CredentialMintLayer } from '../../layers/CredentialMintLayer';

interface TestSyncScenario {
  id: string;
  credentialZkHash: string;
  sourceDID: string;
  targetDID: string;
  syncType: 'upload' | 'download' | 'verify' | 'consensus';
  expectedResult: boolean;
  description: string;
}

export default function CredentialSyncDemo() {
  const [syncLedger] = useState(() => new CredentialSyncLedger());
  const [mintLayer] = useState(() => new CredentialMintLayer());
  const [testResults, setTestResults] = useState<(SyncResult & { scenario: TestSyncScenario })[]>([]);
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [consensusNodes, setConsensusNodes] = useState<any[]>([]);
  const [ledgerLog, setLedgerLog] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const mountTimestamp = useRef<number>(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // 10 credential sync scenarios (8 pass, 2 fail as per GROK requirements)
  const testScenarios: TestSyncScenario[] = [
    // Scenario 1: Valid identity credential upload (PASS)
    {
      id: 'sync_001',
      credentialZkHash: '', // Will be populated during setup
      sourceDID: 'did:civic:0x1a2b3c4d5e',
      targetDID: 'did:civic:node:validator:001',
      syncType: 'upload',
      expectedResult: true,
      description: 'Valid identity credential upload to validator node'
    },

    // Scenario 2: Valid credential verification sync (PASS)
    {
      id: 'sync_002',
      credentialZkHash: '',
      sourceDID: 'did:civic:0x2b3c4d5e6f',
      targetDID: 'did:civic:node:witness:001',
      syncType: 'verify',
      expectedResult: true,
      description: 'Valid credential verification with witness node'
    },

    // Scenario 3: Valid consensus sync (PASS)
    {
      id: 'sync_003',
      credentialZkHash: '',
      sourceDID: 'did:civic:0x3c4d5e6f7a',
      targetDID: 'did:civic:consensus:pool',
      syncType: 'consensus',
      expectedResult: true,
      description: 'Valid consensus sync across multiple nodes'
    },

    // Scenario 4: Invalid credential hash (FAIL)
    {
      id: 'sync_004',
      credentialZkHash: 'invalid_hash_format', // Intentional invalid hash
      sourceDID: 'did:civic:0x4d5e6f7a8b',
      targetDID: 'did:civic:node:validator:002',
      syncType: 'upload',
      expectedResult: false,
      description: 'Invalid credential hash (should fail sync)'
    },

    // Scenario 5: Valid role credential download (PASS)
    {
      id: 'sync_005',
      credentialZkHash: '',
      sourceDID: 'did:civic:node:archive:001',
      targetDID: 'did:civic:0x5e6f7a8b9c',
      syncType: 'download',
      expectedResult: true,
      description: 'Valid role credential download from archive node'
    },

    // Scenario 6: Valid governance credential upload (PASS)
    {
      id: 'sync_006',
      credentialZkHash: '',
      sourceDID: 'did:civic:0x6f7a8b9c0d',
      targetDID: 'did:civic:node:validator:001',
      syncType: 'upload',
      expectedResult: true,
      description: 'Valid governance credential upload with verification'
    },

    // Scenario 7: Valid verification with multiple nodes (PASS)
    {
      id: 'sync_007',
      credentialZkHash: '',
      sourceDID: 'did:civic:0x7a8b9c0d1e',
      targetDID: 'did:civic:verification:network',
      syncType: 'verify',
      expectedResult: true,
      description: 'Valid multi-node verification sync'
    },

    // Scenario 8: Network timeout simulation (FAIL)
    {
      id: 'sync_008',
      credentialZkHash: '',
      sourceDID: 'did:civic:0x8b9c0d1e2f',
      targetDID: 'did:civic:node:offline',
      syncType: 'consensus',
      expectedResult: false,
      description: 'Network timeout during consensus sync (should fail)'
    },

    // Scenario 9: Valid vault credential consensus (PASS)
    {
      id: 'sync_009',
      credentialZkHash: '',
      sourceDID: 'did:civic:0x9c0d1e2f3a',
      targetDID: 'did:civic:consensus:secure',
      syncType: 'consensus',
      expectedResult: true,
      description: 'Valid vault credential consensus sync'
    },

    // Scenario 10: Valid record credential verification (PASS)
    {
      id: 'sync_010',
      credentialZkHash: '',
      sourceDID: 'did:civic:0xa0d1e2f3b4',
      targetDID: 'did:civic:node:witness:002',
      syncType: 'verify',
      expectedResult: true,
      description: 'Valid record credential verification sync'
    }
  ];

  useEffect(() => {
    // Performance measurement
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 150) {
      console.warn(`⚠️ CredentialSyncDemo render time: ${renderTime}ms (exceeds 150ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Credential sync demo interface ready"');
    }

    // Setup test credentials and sync environment
    setupTestEnvironment();
  }, []);

  // Setup test credentials and sync environment
  const setupTestEnvironment = async () => {
    try {
      console.log('🧪 Setting up test environment for credential sync...');
      
      // Clear existing data
      mintLayer.clearMintHistory();
      syncLedger.clearSyncLedger();

      // Create test credentials for sync scenarios
      const testCredentials = [
        { did: 'did:civic:0x1a2b3c4d5e', type: 'Identity' as const, metadata: { role: 'Citizen', attestation: 'verified' } },
        { did: 'did:civic:0x2b3c4d5e6f', type: 'Identity' as const, metadata: { role: 'Citizen', attestation: 'verified' } },
        { did: 'did:civic:0x3c4d5e6f7a', type: 'Governance' as const, metadata: { role: 'Governor', permissions: ['consensus'] } },
        { did: 'did:civic:0x5e6f7a8b9c', type: 'Role' as const, metadata: { role: 'Moderator', permissions: ['verify'] } },
        { did: 'did:civic:0x6f7a8b9c0d', type: 'Governance' as const, metadata: { role: 'Council', permissions: ['vote'] } },
        { did: 'did:civic:0x7a8b9c0d1e', type: 'Identity' as const, metadata: { role: 'Verifier', attestation: 'multi_factor' } },
        { did: 'did:civic:0x9c0d1e2f3a', type: 'Vault' as const, metadata: { vaultAccess: ['secure'], exportRights: true } },
        { did: 'did:civic:0xa0d1e2f3b4', type: 'Record' as const, metadata: { recordType: 'voting', attestation: 'verified' } }
      ];

      const credentialHashes: string[] = [];

      for (const cred of testCredentials) {
        const result = await mintLayer.mintCredential(cred.did, cred.type, cred.metadata);
        if (result.success && result.zkHash) {
          credentialHashes.push(result.zkHash);
        }
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Update test scenarios with actual credential hashes
      for (let i = 0; i < testScenarios.length && i < credentialHashes.length; i++) {
        if (testScenarios[i].expectedResult) { // Only assign valid hashes to expected pass scenarios
          testScenarios[i].credentialZkHash = credentialHashes[i];
        }
      }

      setIsSetupComplete(true);
      updateAllData();
      console.log('✅ Test environment setup completed');

    } catch (error) {
      console.error('❌ Failed to setup test environment:', error);
    }
  };

  // Run credential sync test suite
  const runSyncTestSuite = async () => {
    if (!isSetupComplete) {
      console.warn('⚠️ Test environment not ready, running setup...');
      await setupTestEnvironment();
    }

    setIsRunning(true);
    setTestResults([]);
    setCurrentTest(0);

    const results: (SyncResult & { scenario: TestSyncScenario })[] = [];

    try {
      for (let i = 0; i < testScenarios.length; i++) {
        setCurrentTest(i + 1);
        const scenario = testScenarios[i];

        console.log(`🧪 Running sync test ${i + 1}/10: ${scenario.description}`);

        // Run sync with performance measurement
        const startTime = Date.now();
        const result = await syncLedger.syncCredential(
          scenario.credentialZkHash,
          scenario.sourceDID,
          scenario.targetDID,
          scenario.syncType
        );
        const totalTime = Date.now() - startTime;

        // Validate performance targets
        if (totalTime > 5000) {
          console.warn(`⚠️ Sync test ${i + 1}: Sync time ${totalTime}ms (exceeds 5000ms timeout)`);
        }

        const testResult = {
          ...result,
          scenario
        };

        results.push(testResult);
        setTestResults([...results]);

        // Update all data after each test
        updateAllData();

        // Delay between tests for visibility
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Final data update
      updateAllData();

      console.log('✅ CredentialSyncLedger: Test suite completed');

      if (ttsOverrideRef.current) {
        console.log('🔇 TTS disabled: "Credential sync test suite completed"');
      }

    } catch (error) {
      console.error('❌ CredentialSyncLedger: Test suite error:', error);
    }

    setIsRunning(false);
    setCurrentTest(0);
  };

  // Update all data displays
  const updateAllData = () => {
    setMetrics(syncLedger.getMetrics());
    setConsensusNodes(syncLedger.getConsensusNodes());
    setLedgerLog(syncLedger.getLedgerLog().slice(-10)); // Show latest 10 log entries
  };

  // Get result color
  const getResultColor = (success: boolean, expected: boolean): string => {
    if (success === expected) {
      return success ? 'text-green-400' : 'text-orange-400'; // Expected result
    } else {
      return 'text-red-400'; // Unexpected result
    }
  };

  // Get result icon
  const getResultIcon = (success: boolean, expected: boolean): string => {
    if (success === expected) {
      return success ? '✅' : '⚠️'; // Expected result
    } else {
      return '❌'; // Unexpected result
    }
  };

  // Format sync time
  const formatSyncTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Clear test data
  const clearTestData = () => {
    mintLayer.clearMintHistory();
    syncLedger.clearSyncLedger();
    setTestResults([]);
    setIsSetupComplete(false);
    updateAllData();

    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Test data cleared"');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Credential Sync Demo
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VII • Step 1 • Distributed ZKP Consensus</div>
          <div>10 Syncs: 8 Pass, 2 Fail</div>
          {isRunning && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400">Running Test {currentTest}/10</span>
            </div>
          )}
          {!isSetupComplete && (
            <div className="text-amber-400">Setting up test environment...</div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-4 space-y-2">
        <button
          onClick={runSyncTestSuite}
          disabled={isRunning}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            isRunning 
              ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          style={{ minHeight: '48px' }}
          aria-describedby="test-info"
        >
          {isRunning ? `Running Test ${currentTest}/10...` : 'Run Credential Sync Test Suite'}
        </button>

        <button
          onClick={clearTestData}
          disabled={isRunning}
          className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          style={{ minHeight: '48px' }}
        >
          Clear Test Data & Reset
        </button>
        
        <div id="test-info" className="text-xs text-center text-slate-400">
          Tests distributed ZKP credential consensus with node sync validation
        </div>
      </div>

      {/* Sync Metrics */}
      {metrics && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Sync Metrics</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Syncs:</span>
              <span className="text-white">{metrics.totalSyncs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Successful:</span>
              <span className="text-green-400">{metrics.successfulSyncs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Failed:</span>
              <span className="text-red-400">{metrics.failedSyncs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consensus Rate:</span>
              <span className={metrics.consensusSuccessRate >= 80 ? 'text-green-400' : 'text-amber-400'}>
                {metrics.consensusSuccessRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Sync Time:</span>
              <span className={metrics.averageSyncTime <= 3000 ? 'text-green-400' : 'text-amber-400'}>
                {formatSyncTime(metrics.averageSyncTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Consensus Nodes:</span>
              <span className="text-slate-300">{metrics.averageConsensusNodes.toFixed(1)}</span>
            </div>
            
            {/* Path B Status */}
            {metrics.pathBActivated && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-400 font-medium">Path B Activated</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Sync failure rate: {metrics.syncFailureRate.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consensus Nodes Status */}
      {consensusNodes.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">
            Consensus Nodes ({consensusNodes.filter(n => n.isOnline).length}/{consensusNodes.length} online)
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
            {consensusNodes.map((node, index) => (
              <div key={node.nodeId} className="flex justify-between">
                <span className={node.isOnline ? 'text-green-400' : 'text-red-400'}>
                  {node.isOnline ? '🟢' : '🔴'} {node.nodeType}
                </span>
                <span className="text-slate-400">
                  {node.currentLoad}/{node.syncCapacity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Sync Test Results</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={result.scenario.id} className="text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">#{index + 1}</span>
                    <span className={getResultColor(result.success, result.scenario.expectedResult)}>
                      {getResultIcon(result.success, result.scenario.expectedResult)}
                    </span>
                    <span className="text-slate-300 flex-1">
                      {result.scenario.syncType}
                    </span>
                  </div>
                  <span className={result.syncTime <= 3000 ? 'text-green-400' : 'text-amber-400'}>
                    {formatSyncTime(result.syncTime)}
                  </span>
                </div>
                
                <div className="ml-8 mt-1 space-y-1">
                  {result.success && (
                    <>
                      <div className="text-slate-400">
                        Consensus: {result.consensusReached ? 'Yes' : 'No'} | Nodes: {result.nodesParticipated}
                      </div>
                      {result.syncEntry?.cidHash && (
                        <div className="text-slate-500">
                          CID: {result.syncEntry.cidHash.slice(0, 12)}...
                        </div>
                      )}
                    </>
                  )}
                  
                  {result.error && (
                    <div className="text-slate-400">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.pathBTriggered && (
                    <div className="text-orange-400">
                      ⚠️ Path B fallback triggered
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger Log Preview */}
      {ledgerLog.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">
            Ledger Log (Latest {ledgerLog.length})
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
            {ledgerLog.map((entry, index) => (
              <div key={entry.syncId || index} className="flex justify-between">
                <span className={entry.consensusReached ? 'text-green-400' : 'text-red-400'}>
                  {entry.consensusReached ? '✅' : '❌'} {entry.syncType}
                </span>
                <span className="text-slate-400">
                  {entry.nodesParticipated}n | {entry.nodeSignatures}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {testResults.length === testScenarios.length && (
        <div className="p-3 bg-slate-900 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Performance Summary</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tests Completed:</span>
              <span className="text-white">{testResults.length}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Passes:</span>
              <span className="text-green-400">8 ✅</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Fails:</span>
              <span className="text-orange-400">2 ⚠️</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consensus Performance:</span>
              <span className={metrics && metrics.consensusSuccessRate >= 80 ? 'text-green-400' : 'text-amber-400'}>
                {metrics ? `${metrics.consensusSuccessRate.toFixed(1)}% rate` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sync Performance:</span>
              <span className={metrics && metrics.averageSyncTime <= 3000 ? 'text-green-400' : 'text-amber-400'}>
                {metrics ? formatSyncTime(metrics.averageSyncTime) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ledger Logging:</span>
              <span className="text-green-400">
                {ledgerLog.length} entries
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}