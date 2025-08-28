// Phase VI Step 2: VaultExportDemo.tsx
// Commander Mark authorization via JASMY Relay
// Demo interface for VaultExportNode with secure export testing

import React, { useState, useEffect, useRef } from 'react';
import { VaultExportNode, ExportResult, ExportMetrics, UserRole, ExportFilters } from '../../layers/VaultExportNode';
import { CredentialMintLayer } from '../../layers/CredentialMintLayer';

interface TestExportScenario {
  id: string;
  exporterDID: string;
  userRole: UserRole;
  filters: ExportFilters;
  overrideFlag?: boolean;
  expectedResult: boolean;
  description: string;
}

export default function VaultExportDemo() {
  const [exportNode] = useState(() => new VaultExportNode());
  const [mintLayer] = useState(() => new CredentialMintLayer());
  const [testResults, setTestResults] = useState<(ExportResult & { scenario: TestExportScenario })[]>([]);
  const [metrics, setMetrics] = useState<ExportMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const mountTimestamp = useRef<number>(Date.now());
  const ttsOverrideRef = useRef<boolean>(true);

  // Test export scenarios covering role-based access and filters
  const testScenarios: TestExportScenario[] = [
    // Scenario 1: Citizen exporting own records (PASS)
    {
      id: 'export_001',
      exporterDID: 'did:civic:0x1a2b3c4d5e',
      userRole: 'Citizen',
      filters: {
        excludeRevoked: true,
        requireZKPValidation: true
      },
      expectedResult: true,
      description: 'Citizen exporting own records with ZKP validation'
    },

    // Scenario 2: Moderator jurisdictional export (PASS)
    {
      id: 'export_002',
      exporterDID: 'did:civic:0x2b3c4d5e6f',
      userRole: 'Moderator',
      filters: {
        credentialTypes: ['Identity', 'Role'],
        excludeRevoked: true,
        requireZKPValidation: true
      },
      expectedResult: true,
      description: 'Moderator exporting Identity and Role credentials'
    },

    // Scenario 3: Governor global export with override (PASS)
    {
      id: 'export_003',
      exporterDID: 'did:civic:0x3c4d5e6f7a',
      userRole: 'Governor',
      filters: {
        excludeRevoked: true,
        requireZKPValidation: true
      },
      overrideFlag: true,
      expectedResult: true,
      description: 'Governor global export with override flag'
    },

    // Scenario 4: Citizen attempting other DID export (FAIL)
    {
      id: 'export_004',
      exporterDID: 'did:civic:0x4d5e6f7a8b',
      userRole: 'Citizen',
      filters: {
        targetDID: 'did:civic:0xother_user',
        excludeRevoked: true,
        requireZKPValidation: true
      },
      expectedResult: false,
      description: 'Citizen attempting to export other user records (should fail)'
    },

    // Scenario 5: Moderator timestamp range export (PASS)
    {
      id: 'export_005',
      exporterDID: 'did:civic:0x5e6f7a8b9c',
      userRole: 'Moderator',
      filters: {
        timestampRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        excludeRevoked: true,
        requireZKPValidation: true
      },
      expectedResult: true,
      description: 'Moderator exporting 24-hour timestamp range'
    },

    // Scenario 6: Governor specific DID export (PASS)
    {
      id: 'export_006',
      exporterDID: 'did:civic:0x6f7a8b9c0d',
      userRole: 'Governor',
      filters: {
        targetDID: 'did:civic:0x1a2b3c4d5e',
        excludeRevoked: true,
        requireZKPValidation: true
      },
      expectedResult: true,
      description: 'Governor exporting specific user credentials'
    },

    // Scenario 7: Governor without override (FAIL)
    {
      id: 'export_007',
      exporterDID: 'did:civic:0x7a8b9c0d1e',
      userRole: 'Governor',
      filters: {
        excludeRevoked: true,
        requireZKPValidation: true
      },
      // No override flag
      expectedResult: false,
      description: 'Governor global export without override flag (should fail)'
    },

    // Scenario 8: Citizen with credential type filter (PASS)
    {
      id: 'export_008',
      exporterDID: 'did:civic:0x8b9c0d1e2f',
      userRole: 'Citizen',
      filters: {
        credentialTypes: ['Vault'],
        excludeRevoked: true,
        requireZKPValidation: true
      },
      expectedResult: true,
      description: 'Citizen exporting own Vault credentials'
    }
  ];

  useEffect(() => {
    // Performance measurement
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 125) {
      console.warn(`⚠️ VaultExportDemo render time: ${renderTime}ms (exceeds 125ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Vault export demo interface ready"');
    }

    // Setup test credentials
    setupTestCredentials();
  }, []);

  // Setup test credentials in mint layer
  const setupTestCredentials = async () => {
    try {
      console.log('🧪 Setting up test credentials for vault export...');
      
      // Clear existing data
      mintLayer.clearMintHistory();
      exportNode.clearExportHistory();

      // Create test credentials for different DIDs and types
      const testCredentials = [
        { did: 'did:civic:0x1a2b3c4d5e', type: 'Identity' as const, metadata: { role: 'Citizen' } },
        { did: 'did:civic:0x1a2b3c4d5e', type: 'Vault' as const, metadata: { vaultAccess: ['personal'] } },
        { did: 'did:civic:0x2b3c4d5e6f', type: 'Role' as const, metadata: { role: 'Moderator' } },
        { did: 'did:civic:0x3c4d5e6f7a', type: 'Governance' as const, metadata: { role: 'Governor' } },
        { did: 'did:civic:0x4d5e6f7a8b', type: 'Identity' as const, metadata: { role: 'Citizen' } },
        { did: 'did:civic:0x5e6f7a8b9c', type: 'Record' as const, metadata: { recordType: 'voting' } }
      ];

      for (const cred of testCredentials) {
        await mintLayer.mintCredential(cred.did, cred.type, cred.metadata);
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setIsSetupComplete(true);
      updateMetrics();
      console.log('✅ Test credentials setup completed');

    } catch (error) {
      console.error('❌ Failed to setup test credentials:', error);
    }
  };

  // Run export test suite
  const runExportTestSuite = async () => {
    if (!isSetupComplete) {
      console.warn('⚠️ Test credentials not ready, running setup...');
      await setupTestCredentials();
    }

    setIsRunning(true);
    setTestResults([]);
    setCurrentTest(0);

    const results: (ExportResult & { scenario: TestExportScenario })[] = [];

    try {
      for (let i = 0; i < testScenarios.length; i++) {
        setCurrentTest(i + 1);
        const scenario = testScenarios[i];

        console.log(`🧪 Running export test ${i + 1}/8: ${scenario.description}`);

        // Run export with performance measurement
        const startTime = Date.now();
        const result = await exportNode.exportVaultData(
          scenario.exporterDID,
          scenario.userRole,
          scenario.filters,
          scenario.overrideFlag
        );
        const totalTime = Date.now() - startTime;

        // Validate performance targets
        if (totalTime > 200) {
          console.warn(`⚠️ Export test ${i + 1}: Full export time ${totalTime}ms (exceeds 200ms target)`);
        }

        const testResult = {
          ...result,
          scenario
        };

        results.push(testResult);
        setTestResults([...results]);

        // Update metrics after each test
        updateMetrics();

        // Delay between tests for visibility
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Final metrics update
      updateMetrics();

      console.log('✅ VaultExportNode: Test suite completed');

      if (ttsOverrideRef.current) {
        console.log('🔇 TTS disabled: "Vault export test suite completed"');
      }

    } catch (error) {
      console.error('❌ VaultExportNode: Test suite error:', error);
    }

    setIsRunning(false);
    setCurrentTest(0);
  };

  // Update metrics
  const updateMetrics = () => {
    setMetrics(exportNode.getMetrics());
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

  // Format bundle size
  const formatBundleSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Clear test data
  const clearTestData = () => {
    mintLayer.clearMintHistory();
    exportNode.clearExportHistory();
    setTestResults([]);
    setIsSetupComplete(false);
    updateMetrics();

    if (ttsOverrideRef.current) {
      console.log('🔇 TTS disabled: "Test data cleared"');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Vault Export Demo
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase VI • Step 2 • Secure IPFS Export</div>
          <div>8 Tests: Role-based Access Control</div>
          {isRunning && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400">Running Test {currentTest}/8</span>
            </div>
          )}
          {!isSetupComplete && (
            <div className="text-amber-400">Setting up test credentials...</div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-4 space-y-2">
        <button
          onClick={runExportTestSuite}
          disabled={isRunning}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            isRunning 
              ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          style={{ minHeight: '48px' }}
          aria-describedby="test-info"
        >
          {isRunning ? `Running Test ${currentTest}/8...` : 'Run Vault Export Test Suite'}
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
          Tests role-based export controls with ZKP validation and IPFS bundling
        </div>
      </div>

      {/* Export Metrics */}
      {metrics && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Export Metrics</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Exports:</span>
              <span className="text-white">{metrics.totalExports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Successful:</span>
              <span className="text-green-400">{metrics.successfulExports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Failed:</span>
              <span className="text-red-400">{metrics.failedExports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className={metrics.successRate >= 70 ? 'text-green-400' : 'text-amber-400'}>
                {metrics.successRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Export Time:</span>
              <span className={metrics.averageExportTime <= 200 ? 'text-green-400' : 'text-amber-400'}>
                {metrics.averageExportTime.toFixed(1)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Bundle Size:</span>
              <span className="text-slate-300">
                {formatBundleSize(metrics.averageBundleSize)}
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
                  Sync failure rate: {metrics.syncFailureRate.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Export Test Results</div>
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
                      {result.scenario.userRole}
                    </span>
                  </div>
                  <span className={result.exportTime <= 200 ? 'text-green-400' : 'text-amber-400'}>
                    {result.exportTime}ms
                  </span>
                </div>
                
                <div className="ml-8 mt-1 space-y-1">
                  {result.success && (
                    <>
                      <div className="text-slate-400">
                        Entries: {result.entryCount} | Size: {formatBundleSize(result.bundleSize)}
                      </div>
                      {result.bundleCID && (
                        <div className="text-slate-500">
                          CID: {result.bundleCID.slice(0, 12)}...
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

      {/* Performance Summary */}
      {testResults.length === testScenarios.length && (
        <div className="p-3 bg-slate-900 border border-slate-600 rounded-md">
          <div className="text-sm font-medium text-slate-300 mb-2">Performance Summary</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tests Completed:</span>
              <span className="text-white">{testResults.length}/8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Passes:</span>
              <span className="text-green-400">6 ✅</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Fails:</span>
              <span className="text-orange-400">2 ⚠️</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Export Performance:</span>
              <span className={metrics && metrics.averageExportTime <= 200 ? 'text-green-400' : 'text-amber-400'}>
                {metrics ? `${metrics.averageExportTime.toFixed(1)}ms avg` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bundle Size Limit:</span>
              <span className="text-green-400">
                {metrics && metrics.averageBundleSize > 0 ? 
                  `${((metrics.averageBundleSize / (5 * 1024 * 1024)) * 100).toFixed(1)}% of 5MB` : 
                  'Within limits'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}