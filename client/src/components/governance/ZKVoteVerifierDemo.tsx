// Phase V Step 4: ZKVoteVerifierDemo.tsx
// Commander Mark authorization via JASMY Relay
// Demo interface for ZKVoteVerifier with 10 vote simulations (8 pass, 2 fail)

import React, { useState, useEffect, useRef } from 'react';
import { ZKVoteVerifier, Vote, ZKProof, VerificationResult, VerificationMetrics, VaultHistoryEntry } from '../../layers/ZKVoteVerifier';

interface TestVoteScenario {
  id: string;
  vote: Vote;
  zkProof: ZKProof;
  expectedResult: boolean;
  description: string;
}

export default function ZKVoteVerifierDemo() {
  const [verifier] = useState(() => new ZKVoteVerifier());
  const [testResults, setTestResults] = useState<(VerificationResult & { scenario: TestVoteScenario })[]>([]);
  const [metrics, setMetrics] = useState<VerificationMetrics | null>(null);
  const [vaultHistory, setVaultHistory] = useState<VaultHistoryEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  
  const mountTimestamp = useRef<number>(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // 10 vote simulation scenarios (8 pass, 2 fail as per GROK instructions)
  const testScenarios: TestVoteScenario[] = [
    // Scenario 1: Valid vote (PASS)
    {
      id: 'test_001',
      vote: {
        id: 'vote_001',
        proposalId: 'prop_governance_001',
        voterDID: 'did:civic:0x1a2b3c4d5e',
        voterTier: 'Citizen',
        voteType: 'support',
        zkpHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        signature: 'valid_signature_001',
        did: 'did:civic:0x1a2b3c4d5e',
        timestamp: new Date().toISOString(),
        voteContent: 'support',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid vote with matching DID and recent timestamp'
    },
    
    // Scenario 2: Valid Moderator vote (PASS)
    {
      id: 'test_002',
      vote: {
        id: 'vote_002',
        proposalId: 'prop_funding_002',
        voterDID: 'did:civic:0x2b3c4d5e6f',
        voterTier: 'Moderator',
        voteType: 'oppose',
        zkpHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        signature: 'valid_signature_002',
        did: 'did:civic:0x2b3c4d5e6f',
        timestamp: new Date().toISOString(),
        voteContent: 'oppose',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid Moderator vote with proper ZKP validation'
    },
    
    // Scenario 3: Valid Governor vote (PASS)
    {
      id: 'test_003',
      vote: {
        id: 'vote_003',
        proposalId: 'prop_structure_003',
        voterDID: 'did:civic:0x3c4d5e6f7a',
        voterTier: 'Governor',
        voteType: 'abstain',
        zkpHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        signature: 'valid_signature_003',
        did: 'did:civic:0x3c4d5e6f7a',
        timestamp: new Date().toISOString(),
        voteContent: 'abstain',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid Governor abstain vote with ZKP verification'
    },

    // Scenario 4: DID Mismatch (FAIL)
    {
      id: 'test_004',
      vote: {
        id: 'vote_004',
        proposalId: 'prop_audit_004',
        voterDID: 'did:civic:0x4d5e6f7a8b',
        voterTier: 'Citizen',
        voteType: 'support',
        zkpHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        timestamp: new Date().toISOString(),
        synced: false
      },
      zkProof: {
        hash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        signature: 'signature_004',
        did: 'did:civic:0xWRONG_DID', // Intentional mismatch
        timestamp: new Date().toISOString(),
        voteContent: 'support',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: false,
      description: 'DID mismatch between vote and proof (should fail)'
    },

    // Scenario 5: Valid support vote (PASS)
    {
      id: 'test_005',
      vote: {
        id: 'vote_005',
        proposalId: 'prop_policy_005',
        voterDID: 'did:civic:0x5e6f7a8b9c',
        voterTier: 'Citizen',
        voteType: 'support',
        zkpHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        signature: 'valid_signature_005',
        did: 'did:civic:0x5e6f7a8b9c',
        timestamp: new Date().toISOString(),
        voteContent: 'support',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid citizen support vote with proper verification'
    },

    // Scenario 6: Hash Mismatch (FAIL) 
    {
      id: 'test_006',
      vote: {
        id: 'vote_006',
        proposalId: 'prop_funding_006',
        voterDID: 'did:civic:0x6f7a8b9c0d',
        voterTier: 'Moderator',
        voteType: 'oppose',
        zkpHash: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        timestamp: new Date().toISOString(),
        synced: false
      },
      zkProof: {
        hash: '0xWRONG_HASH_567890abcdef1234567890abcdef1234567890abcdef123456', // Intentional mismatch
        signature: 'signature_006',
        did: 'did:civic:0x6f7a8b9c0d',
        timestamp: new Date().toISOString(),
        voteContent: 'oppose',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: false,
      description: 'Hash mismatch in ZKP verification (should fail)'
    },

    // Scenario 7: Valid moderator oppose (PASS)
    {
      id: 'test_007',
      vote: {
        id: 'vote_007',
        proposalId: 'prop_structure_007',
        voterDID: 'did:civic:0x7a8b9c0d1e',
        voterTier: 'Moderator',
        voteType: 'oppose',
        zkpHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345',
        signature: 'valid_signature_007',
        did: 'did:civic:0x7a8b9c0d1e',
        timestamp: new Date().toISOString(),
        voteContent: 'oppose',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid moderator oppose vote with ZKP validation'
    },

    // Scenario 8: Valid governor support (PASS)
    {
      id: 'test_008',
      vote: {
        id: 'vote_008',
        proposalId: 'prop_audit_008',
        voterDID: 'did:civic:0x8b9c0d1e2f',
        voterTier: 'Governor',
        voteType: 'support',
        zkpHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        signature: 'valid_signature_008',
        did: 'did:civic:0x8b9c0d1e2f',
        timestamp: new Date().toISOString(),
        voteContent: 'support',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid governor support vote with complete validation'
    },

    // Scenario 9: Valid citizen abstain (PASS)
    {
      id: 'test_009',
      vote: {
        id: 'vote_009',
        proposalId: 'prop_policy_009',
        voterDID: 'did:civic:0x9c0d1e2f3a',
        voterTier: 'Citizen',
        voteType: 'abstain',
        zkpHash: '0xf1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0xf1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        signature: 'valid_signature_009',
        did: 'did:civic:0x9c0d1e2f3a',
        timestamp: new Date().toISOString(),
        voteContent: 'abstain',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid citizen abstain vote with proper ZKP'
    },

    // Scenario 10: Valid moderator support (PASS)
    {
      id: 'test_010',
      vote: {
        id: 'vote_010',
        proposalId: 'prop_funding_010',
        voterDID: 'did:civic:0xa0d1e2f3b4',
        voterTier: 'Moderator',
        voteType: 'support',
        zkpHash: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        timestamp: new Date().toISOString(),
        synced: true
      },
      zkProof: {
        hash: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        signature: 'valid_signature_010',
        did: 'did:civic:0xa0d1e2f3b4',
        timestamp: new Date().toISOString(),
        voteContent: 'support',
        proofGenerated: new Date().toISOString()
      },
      expectedResult: true,
      description: 'Valid moderator support vote completing test suite'
    }
  ];

  useEffect(() => {
    // Performance measurement
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 75) {
      console.warn(`⚠️ ZKVoteVerifierDemo render time: ${renderTime}ms (exceeds 75ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "ZKP verification demo interface ready"');
    }

    // Clear previous test data
    verifier.clearVaultHistory();
    updateMetricsAndHistory();
  }, []);

  // Run verification test suite
  const runTestSuite = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest(0);
    
    const results: (VerificationResult & { scenario: TestVoteScenario })[] = [];
    
    try {
      for (let i = 0; i < testScenarios.length; i++) {
        setCurrentTest(i + 1);
        const scenario = testScenarios[i];
        
        console.log(`🧪 Running test ${i + 1}/10: ${scenario.description}`);
        
        // Run verification with performance measurement
        const startTime = Date.now();
        const result = await verifier.verifyVote(scenario.vote, scenario.zkProof);
        const totalTime = Date.now() - startTime;
        
        // Validate performance targets
        if (totalTime > 150) {
          console.warn(`⚠️ Test ${i + 1}: Full cycle time ${totalTime}ms (exceeds 150ms target)`);
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
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Final metrics update
      updateMetricsAndHistory();
      
      console.log('✅ ZKVoteVerifier: Test suite completed');
      
      if (ttsOverrideRef.current) {
        console.log('🔇 TTS disabled: "Verification test suite completed"');
      }
      
    } catch (error) {
      console.error('❌ ZKVoteVerifier: Test suite error:', error);
    }
    
    setIsRunning(false);
    setCurrentTest(0);
  };

  // Update metrics and vault history
  const updateMetricsAndHistory = () => {
    setMetrics(verifier.getMetrics());
    setVaultHistory(verifier.getVaultHistory());
  };

  // Get result color
  const getResultColor = (valid: boolean, expected: boolean): string => {
    if (valid === expected) {
      return valid ? 'text-green-400' : 'text-orange-400'; // Expected result
    } else {
      return 'text-red-400'; // Unexpected result
    }
  };

  // Get result icon
  const getResultIcon = (valid: boolean, expected: boolean): string => {
    if (valid === expected) {
      return valid ? '✅' : '⚠️'; // Expected result
    } else {
      return '❌'; // Unexpected result
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          ZKP Vote Verifier Demo
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase V • Step 4 • Final Component</div>
          <div>10 Simulations: 8 Pass, 2 Fail</div>
          {isRunning && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400">Running Test {currentTest}/10</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-4">
        <button
          onClick={runTestSuite}
          disabled={isRunning}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            isRunning 
              ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          style={{ minHeight: '48px' }}
          aria-describedby="test-info"
        >
          {isRunning ? `Running Test ${currentTest}/10...` : 'Run Verification Test Suite'}
        </button>
        
        <div id="test-info" className="text-xs text-center text-slate-400 mt-2">
          Validates ZKP verification with performance measurement
        </div>
      </div>

      {/* Verification Metrics */}
      {metrics && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Verification Metrics</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total:</span>
              <span className="text-white">{metrics.totalVerifications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Valid:</span>
              <span className="text-green-400">{metrics.validVerifications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Invalid:</span>
              <span className="text-red-400">{metrics.invalidVerifications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className={metrics.successRate >= 80 ? 'text-green-400' : 'text-amber-400'}>
                {metrics.successRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Time:</span>
              <span className={metrics.averageVerificationTime <= 75 ? 'text-green-400' : 'text-amber-400'}>
                {metrics.averageVerificationTime.toFixed(1)}ms
              </span>
            </div>
            
            {/* Fallback Status */}
            {metrics.fallbackActivated && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-400 font-medium">Fallback Activated</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Desync rate: {metrics.desyncRate.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Test Results</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={result.scenario.id} className="text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">#{index + 1}</span>
                    <span className={getResultColor(result.valid, result.scenario.expectedResult)}>
                      {getResultIcon(result.valid, result.scenario.expectedResult)}
                    </span>
                    <span className="text-slate-300 flex-1">
                      {result.scenario.vote.voterTier} {result.scenario.vote.voteType}
                    </span>
                  </div>
                  <span className={result.verificationTime <= 150 ? 'text-green-400' : 'text-amber-400'}>
                    {result.verificationTime}ms
                  </span>
                </div>
                
                {result.desyncReason && (
                  <div className="text-slate-400 ml-8 mt-1">
                    Reason: {result.desyncReason}
                  </div>
                )}
                
                {result.replayDetected && (
                  <div className="text-amber-400 ml-8 mt-1">
                    ⚠️ Replay attack blocked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vault History Preview */}
      {vaultHistory.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">
            Vault History ({vaultHistory.length} entries)
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
            {vaultHistory.slice(-5).map((entry) => (
              <div key={entry.id} className="flex justify-between">
                <span className={entry.result === 'valid' ? 'text-green-400' : 'text-red-400'}>
                  {entry.result === 'valid' ? '✅' : '❌'} {entry.id.slice(-6)}
                </span>
                <span className="text-slate-400">{entry.verificationTime}ms</span>
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
              <span className="text-slate-400">Performance:</span>
              <span className={metrics && metrics.averageVerificationTime <= 75 ? 'text-green-400' : 'text-amber-400'}>
                {metrics ? `${metrics.averageVerificationTime.toFixed(1)}ms avg` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}