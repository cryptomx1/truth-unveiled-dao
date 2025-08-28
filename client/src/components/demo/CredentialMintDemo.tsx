// Phase VI Step 1: CredentialMintDemo.tsx
// Commander Mark authorization via JASMY Relay
// Demo interface for CredentialMintLayer with 10 credential mints (8 pass, 2 fail)

import React, { useState, useEffect, useRef } from 'react';
import { CredentialMintLayer, Credential, MintResult, RevokeResult, MintMetrics, MintHistoryEntry, CredentialMetadata } from '../../layers/CredentialMintLayer';

interface TestMintScenario {
  id: string;
  did: string;
  credentialType: 'Identity' | 'Role' | 'Record' | 'Governance' | 'Vault';
  metadata: CredentialMetadata;
  expectedResult: boolean;
  description: string;
}

export default function CredentialMintDemo() {
  const [mintLayer] = useState(() => new CredentialMintLayer());
  const [testResults, setTestResults] = useState<(MintResult & { scenario: TestMintScenario })[]>([]);
  const [metrics, setMetrics] = useState<MintMetrics | null>(null);
  const [mintHistory, setMintHistory] = useState<MintHistoryEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [revokeResults, setRevokeResults] = useState<RevokeResult[]>([]);
  
  const mountTimestamp = useRef<number>(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // 10 credential mint scenarios (8 pass, 2 fail as per GROK requirements)
  const testScenarios: TestMintScenario[] = [
    // Scenario 1: Valid Identity credential (PASS)
    {
      id: 'mint_001',
      did: 'did:civic:0x1a2b3c4d5e',
      credentialType: 'Identity',
      metadata: {
        role: 'Citizen',
        attestation: 'biometric_verified',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedResult: true,
      description: 'Valid Identity credential with biometric verification'
    },

    // Scenario 2: Valid Role credential (PASS)
    {
      id: 'mint_002',
      did: 'did:civic:0x2b3c4d5e6f',
      credentialType: 'Role',
      metadata: {
        role: 'Moderator',
        permissions: ['vote_verify', 'content_moderate'],
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedResult: true,
      description: 'Valid Role credential for Moderator with permissions'
    },

    // Scenario 3: Valid Governance credential (PASS)
    {
      id: 'mint_003',
      did: 'did:civic:0x3c4d5e6f7a',
      credentialType: 'Governance',
      metadata: {
        role: 'Governor',
        permissions: ['proposal_create', 'vote_weight_2x', 'consensus_override'],
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        issuer: 'GovernanceDeck'
      },
      expectedResult: true,
      description: 'Valid Governance credential for Governor role'
    },

    // Scenario 4: Invalid DID format (FAIL)
    {
      id: 'mint_004',
      did: 'invalid_did_format', // Intentional invalid format
      credentialType: 'Identity',
      metadata: {
        role: 'Citizen',
        attestation: 'basic_verified'
      },
      expectedResult: false,
      description: 'Invalid DID format (should fail validation)'
    },

    // Scenario 5: Valid Record credential (PASS)
    {
      id: 'mint_005',
      did: 'did:civic:0x5e6f7a8b9c',
      credentialType: 'Record',
      metadata: {
        recordType: 'voting_history',
        attestation: 'zkp_verified',
        validUntil: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedResult: true,
      description: 'Valid Record credential for voting history'
    },

    // Scenario 6: Valid Vault credential (PASS)
    {
      id: 'mint_006',
      did: 'did:civic:0x6f7a8b9c0d',
      credentialType: 'Vault',
      metadata: {
        vaultAccess: ['personal_data', 'identity_docs'],
        exportRights: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        issuer: 'VaultExportNode'
      },
      expectedResult: true,
      description: 'Valid Vault credential with export rights'
    },

    // Scenario 7: Valid Identity with extended metadata (PASS)
    {
      id: 'mint_007',
      did: 'did:civic:0x7a8b9c0d1e',
      credentialType: 'Identity',
      metadata: {
        role: 'Verifier',
        attestation: 'multi_factor_verified',
        proofType: 'identity_verification',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedResult: true,
      description: 'Valid Identity credential for Verifier role'
    },

    // Scenario 8: Invalid metadata (FAIL)
    {
      id: 'mint_008',
      did: 'did:civic:0x8b9c0d1e2f',
      credentialType: 'Role',
      metadata: null as any, // Intentional invalid metadata
      expectedResult: false,
      description: 'Invalid metadata object (should fail validation)'
    },

    // Scenario 9: Valid Governance with complex permissions (PASS)
    {
      id: 'mint_009',
      did: 'did:civic:0x9c0d1e2f3a',
      credentialType: 'Governance',
      metadata: {
        role: 'Council Member',
        permissions: ['proposal_vote', 'budget_approve', 'policy_review'],
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        issuer: 'GovernanceDeck',
        proofType: 'governance_authorization'
      },
      expectedResult: true,
      description: 'Valid Governance credential for Council Member'
    },

    // Scenario 10: Valid Record with comprehensive metadata (PASS)
    {
      id: 'mint_010',
      did: 'did:civic:0xa0d1e2f3b4',
      credentialType: 'Record',
      metadata: {
        recordType: 'civic_participation',
        attestation: 'participation_verified',
        proofType: 'participation_record',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedResult: true,
      description: 'Valid Record credential for civic participation'
    }
  ];

  useEffect(() => {
    // Performance measurement
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 100) {
      console.warn(`⚠️ CredentialMintDemo render time: ${renderTime}ms (exceeds 100ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Credential mint demo interface ready"');
    }

    // Clear previous test data
    mintLayer.clearMintHistory();
    updateMetricsAndHistory();
  }, []);

  // Run credential mint test suite
  const runMintTestSuite = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest(0);
    setRevokeResults([]);

    const results: (MintResult & { scenario: TestMintScenario })[] = [];

    try {
      for (let i = 0; i < testScenarios.length; i++) {
        setCurrentTest(i + 1);
        const scenario = testScenarios[i];

        console.log(`🧪 Running mint test ${i + 1}/10: ${scenario.description}`);

        // Run mint with performance measurement
        const startTime = Date.now();
        const result = await mintLayer.mintCredential(
          scenario.did,
          scenario.credentialType,
          scenario.metadata
        );
        const totalTime = Date.now() - startTime;

        // Validate performance targets
        if (totalTime > 150) {
          console.warn(`⚠️ Mint test ${i + 1}: Full cycle time ${totalTime}ms (exceeds 150ms target)`);
        }

        const testResult = {
          ...result,
          scenario
        };

        results.push(testResult);
        setTestResults([...results]);

        // Update metrics after each test
        updateMetricsAndHistory();

        // Delay between tests for visibility
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Test revocation on some successful mints
      await testRevocation(results.filter(r => r.success));

      // Final metrics update
      updateMetricsAndHistory();

      console.log('✅ CredentialMintLayer: Test suite completed');

      if (ttsOverrideRef.current) {
        console.log('🔇 TTS disabled: "Credential mint test suite completed"');
      }

    } catch (error) {
      console.error('❌ CredentialMintLayer: Test suite error:', error);
    }

    setIsRunning(false);
    setCurrentTest(0);
  };

  // Test revocation functionality
  const testRevocation = async (successfulMints: (MintResult & { scenario: TestMintScenario })[]) => {
    if (successfulMints.length === 0) return;

    console.log('🧪 Testing credential revocation...');

    const revokeTests: RevokeResult[] = [];

    // Revoke first 3 successful credentials
    for (let i = 0; i < Math.min(3, successfulMints.length); i++) {
      const mint = successfulMints[i];
      if (mint.zkHash) {
        const revokeResult = await mintLayer.revokeCredential(
          mint.zkHash,
          `Test revocation ${i + 1}`
        );
        revokeTests.push(revokeResult);

        // Validate revoke performance
        if (revokeResult.revokeTime > 75) {
          console.warn(`⚠️ Revoke test ${i + 1}: Time ${revokeResult.revokeTime}ms (exceeds 75ms target)`);
        }
      }
    }

    setRevokeResults(revokeTests);
    console.log(`✅ CredentialMintLayer: ${revokeTests.length} revocation tests completed`);
  };

  // Update metrics and mint history
  const updateMetricsAndHistory = () => {
    setMetrics(mintLayer.getMetrics());
    setMintHistory(mintLayer.getMintHistory());
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

  // Clear test data
  const clearTestData = () => {
    mintLayer.clearMintHistory();
    setTestResults([]);
    setRevokeResults([]);
    updateMetricsAndHistory();

    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Test data cleared"');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Credential Mint Demo
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VI • Step 1 • DID-bound ZKP Credentials</div>
          <div>10 Mints: 8 Pass, 2 Fail</div>
          {isRunning && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400">Running Test {currentTest}/10</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-4 space-y-2">
        <button
          onClick={runMintTestSuite}
          disabled={isRunning}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            isRunning 
              ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          style={{ minHeight: '48px' }}
          aria-describedby="test-info"
        >
          {isRunning ? `Running Test ${currentTest}/10...` : 'Run Credential Mint Test Suite'}
        </button>

        <button
          onClick={clearTestData}
          disabled={isRunning}
          className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          style={{ minHeight: '48px' }}
        >
          Clear Test Data
        </button>
        
        <div id="test-info" className="text-xs text-center text-slate-400">
          Tests ZKP credential minting with performance measurement
        </div>
      </div>

      {/* Mint Metrics */}
      {metrics && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Mint Metrics</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Mints:</span>
              <span className="text-white">{metrics.totalMints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Successful:</span>
              <span className="text-green-400">{metrics.successfulMints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Failed:</span>
              <span className="text-red-400">{metrics.failedMints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Revocations:</span>
              <span className="text-amber-400">{metrics.revocations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className={metrics.successRate >= 80 ? 'text-green-400' : 'text-amber-400'}>
                {metrics.successRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Mint Time:</span>
              <span className={metrics.averageMintTime <= 100 ? 'text-green-400' : 'text-amber-400'}>
                {metrics.averageMintTime.toFixed(1)}ms
              </span>
            </div>
            
            {/* Path B Status */}
            {metrics.pathBActivated && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-400 font-medium">Path B Activated</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Failure rate: {metrics.failureRate.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Mint Test Results</div>
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
                      {result.scenario.credentialType}
                    </span>
                  </div>
                  <span className={result.mintTime <= 150 ? 'text-green-400' : 'text-amber-400'}>
                    {result.mintTime}ms
                  </span>
                </div>
                
                {result.error && (
                  <div className="text-slate-400 ml-8 mt-1">
                    Error: {result.error}
                  </div>
                )}
                
                {result.pathBTriggered && (
                  <div className="text-orange-400 ml-8 mt-1">
                    ⚠️ Path B fallback triggered
                  </div>
                )}

                {result.zkHash && (
                  <div className="text-slate-500 ml-8 mt-1">
                    Hash: {result.zkHash.slice(0, 10)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revocation Results */}
      {revokeResults.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">
            Revocation Tests ({revokeResults.length})
          </div>
          <div className="space-y-1 text-xs">
            {revokeResults.map((result, index) => (
              <div key={index} className="flex justify-between">
                <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.success ? '✅' : '❌'} Revoke {index + 1}
                </span>
                <span className={result.revokeTime <= 75 ? 'text-green-400' : 'text-amber-400'}>
                  {result.revokeTime}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mint History Preview */}
      {mintHistory.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">
            Mint History ({mintHistory.length} entries)
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
            {mintHistory.slice(-5).map((entry) => (
              <div key={entry.id} className="flex justify-between">
                <span className={entry.revoked ? 'text-amber-400' : 'text-green-400'}>
                  {entry.revoked ? '🚫' : '✅'} {entry.credentialType}
                </span>
                <span className="text-slate-400">{entry.id.slice(-6)}</span>
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
              <span className="text-slate-400">Mint Performance:</span>
              <span className={metrics && metrics.averageMintTime <= 100 ? 'text-green-400' : 'text-amber-400'}>
                {metrics ? `${metrics.averageMintTime.toFixed(1)}ms avg` : 'N/A'}
              </span>
            </div>
            {revokeResults.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Revoke Performance:</span>
                <span className="text-green-400">
                  {(revokeResults.reduce((sum, r) => sum + r.revokeTime, 0) / revokeResults.length).toFixed(1)}ms avg
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}