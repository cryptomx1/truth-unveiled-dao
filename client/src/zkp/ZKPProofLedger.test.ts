/**
 * ZKPProofLedger.test.ts - Phase XXVIII Step 3
 * 
 * Mock test suite for ZKPProofLedger with 6 entries as specified:
 * - 4 valid entries (2 approved, 2 pending)
 * - 2 invalid entries (rejected)
 * 
 * Authority: Commander Mark | Phase XXVIII Step 3
 * Status: Test suite for secure ledger validation
 */

import { zkpProofLedger, ZKPProofLedger, TruthCoinPillar, recordZKPMintAttempt } from './ZKPProofLedger';

/**
 * Test function to validate ZKP Proof Ledger functionality
 * Runs comprehensive tests on all ledger operations
 */
export async function runZKPLedgerTests(): Promise<{
  success: boolean;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  results: string[];
}> {
  const results: string[] = [];
  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;

  function runTest(testName: string, testFn: () => boolean): void {
    testsRun++;
    try {
      const result = testFn();
      if (result) {
        testsPassed++;
        results.push(`✅ ${testName}: PASSED`);
        console.log(`✅ Test Passed: ${testName}`);
      } else {
        testsFailed++;
        results.push(`❌ ${testName}: FAILED`);
        console.log(`❌ Test Failed: ${testName}`);
      }
    } catch (error) {
      testsFailed++;
      results.push(`❌ ${testName}: ERROR - ${error}`);
      console.log(`❌ Test Error: ${testName} - ${error}`);
    }
  }

  console.log('🧪 Starting ZKP Proof Ledger Test Suite...');

  // Test 1: Initial mock data validation (6 entries)
  runTest('Initial Mock Data Count', () => {
    const allProofs = zkpProofLedger.getAllProofs();
    return allProofs.length === 6;
  });

  // Test 2: Status distribution validation (2 approved, 2 pending, 2 rejected)
  runTest('Status Distribution', () => {
    const approved = zkpProofLedger.getProofsByStatus('approved');
    const pending = zkpProofLedger.getProofsByStatus('pending');
    const rejected = zkpProofLedger.getProofsByStatus('rejected');
    
    return approved.length === 2 && pending.length === 2 && rejected.length === 2;
  });

  // Test 3: User-specific proof retrieval
  runTest('User Proof Retrieval', () => {
    const userProofs = zkpProofLedger.getProofsByUser('0x1234567890123456789012345678901234567890');
    return userProofs.length === 1 && userProofs[0].status === 'approved';
  });

  // Test 4: Duplicate prevention
  runTest('Duplicate Hash Prevention', () => {
    const result = zkpProofLedger.recordProof(
      '0x1234567890123456789012345678901234567890',
      TruthCoinPillar.GOVERNANCE,
      'zkp_governance_civic_participation_proof_a1b2c3', // Existing hash
      'pending'
    );
    return !result; // Should return false for duplicate
  });

  // Test 5: New proof recording
  runTest('New Proof Recording', () => {
    const result = zkpProofLedger.recordProof(
      '0x7890123456789012345678901234567890123456',
      TruthCoinPillar.PEACE,
      'zkp_peace_conflict_resolution_proof_test123',
      'pending',
      undefined,
      500
    );
    return result; // Should return true for new proof
  });

  // Test 6: Performance validation (write < 100ms)
  runTest('Write Performance', () => {
    const startTime = Date.now();
    zkpProofLedger.recordProof(
      '0x8901234567890123456789012345678901234567',
      TruthCoinPillar.JOURNALISM,
      'zkp_journalism_investigative_report_perf_test',
      'approved',
      undefined,
      750
    );
    const writeTime = Date.now() - startTime;
    return writeTime < 100;
  });

  // Test 7: Performance validation (read < 200ms)
  runTest('Read Performance', () => {
    const startTime = Date.now();
    zkpProofLedger.getAllProofs();
    const readTime = Date.now() - startTime;
    return readTime < 200;
  });

  // Test 8: Pillar-specific retrieval
  runTest('Pillar-Specific Retrieval', () => {
    const governanceProofs = zkpProofLedger.getProofsByPillar(TruthCoinPillar.GOVERNANCE);
    return governanceProofs.length >= 1;
  });

  // Test 9: Status update functionality
  runTest('Status Update', () => {
    const allProofs = zkpProofLedger.getAllProofs();
    const pendingProof = allProofs.find(p => p.status === 'pending');
    
    if (!pendingProof) return false;
    
    const result = zkpProofLedger.updateProofStatus(
      pendingProof.id,
      'approved',
      'Commander override approval',
      true
    );
    
    return result;
  });

  // Test 10: Ledger statistics
  runTest('Ledger Statistics', () => {
    const stats = zkpProofLedger.getLedgerStats();
    return stats.total > 6 && // Should be > 6 due to test additions
           stats.approved >= 2 &&
           stats.rejected >= 2 &&
           stats.averageProcessingTime > 0;
  });

  // Test 11: JSON export functionality
  runTest('JSON Export', () => {
    const exportJson = zkpProofLedger.exportToJSON();
    const parsed = JSON.parse(exportJson);
    return parsed.metadata && 
           parsed.entries && 
           Array.isArray(parsed.entries) &&
           parsed.entries.length > 0;
  });

  // Test 12: Integration function test
  runTest('Integration Function', () => {
    const result = recordZKPMintAttempt(
      '0x9012345678901234567890123456789012345678',
      TruthCoinPillar.SCIENCE,
      'zkp_science_research_contribution_integration_test',
      true,
      650,
      undefined
    );
    return result;
  });

  // Final statistics
  const successRate = (testsPassed / testsRun) * 100;
  
  console.log(`\n📊 ZKP Ledger Test Results:`);
  console.log(`Tests Run: ${testsRun}`);
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);

  if (testsFailed > 0) {
    console.log(`\n❌ Failed Tests:`);
    results.filter(r => r.includes('FAILED') || r.includes('ERROR')).forEach(r => console.log(r));
  }

  return {
    success: testsFailed === 0,
    testsRun,
    testsPassed,
    testsFailed,
    results
  };
}

/**
 * Quick test for development validation
 * Usage: await quickLedgerTest();
 */
export async function quickLedgerTest(): Promise<void> {
  console.log('🔍 Quick ZKP Ledger Test...');
  
  // Display current ledger state
  const stats = zkpProofLedger.getLedgerStats();
  console.log(`📊 Current Ledger: ${stats.total} entries (${stats.approved} approved, ${stats.rejected} rejected, ${stats.pending} pending)`);
  
  // Test basic operations
  const testResult = zkpProofLedger.recordProof(
    '0xTEST1234567890123456789012345678901234567',
    TruthCoinPillar.HEALTH,
    'zkp_health_quick_test_' + Date.now(),
    'approved',
    undefined,
    425
  );
  
  console.log(`✅ Quick test recording: ${testResult ? 'SUCCESS' : 'FAILED'}`);
  
  // Display updated stats
  const newStats = zkpProofLedger.getLedgerStats();
  console.log(`📊 Updated Ledger: ${newStats.total} entries`);
}

// Export test runner for external use
export default runZKPLedgerTests;