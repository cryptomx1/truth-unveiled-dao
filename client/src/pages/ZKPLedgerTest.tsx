/**
 * ZKPLedgerTest.tsx - Phase XXIX Step 3 Test Page
 * 
 * Test interface for ZKPProofLedger.ts verification and Commander Mark testing
 * Provides comprehensive ledger functionality testing with export capabilities
 * 
 * Authority: Commander Mark | Phase XXIX Step 3
 * Route: /zkp/ledger-test
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Database, Shield, BarChart3, CheckCircle } from 'lucide-react';
import { zkpProofLedger, runZKPLedgerTest, TruthCoinPillar } from '@/ledger/ZKPProofLedger';

const ZKPLedgerTest: React.FC = () => {
  const { toast } = useToast();
  const [ledgerStats, setLedgerStats] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<{ valid: boolean; invalidEntries: string[] } | null>(null);

  useEffect(() => {
    refreshLedgerData();
  }, []);

  const refreshLedgerData = () => {
    const stats = zkpProofLedger.getStatistics();
    const entries = zkpProofLedger.getAllEntries().slice(-5); // Last 5 entries
    const integrity = zkpProofLedger.verifyIntegrity();
    
    setLedgerStats(stats);
    setRecentEntries(entries);
    setIntegrityStatus(integrity);
  };

  const handleRunTest = () => {
    console.log('🧪 Running ZKP Ledger Test Suite...');
    runZKPLedgerTest();
    
    setTimeout(() => {
      refreshLedgerData();
      toast({
        title: "Test Suite Complete",
        description: "Check console for detailed test results",
      });
    }, 1000);
  };

  const handleExportLedger = () => {
    zkpProofLedger.exportLedger('did:civic:commander_mark');
    toast({
      title: "Ledger Exported",
      description: "ZKP proof ledger downloaded as .zkpledger.json",
    });
  };

  const handleAddTestEntry = () => {
    const testZKP = `0x${Math.random().toString(16).substr(2, 48)}`;
    const testDID = `did:civic:test_${Date.now()}`;
    const pillars = [
      TruthCoinPillar.GOVERNANCE,
      TruthCoinPillar.EDUCATION,
      TruthCoinPillar.JUSTICE,
      TruthCoinPillar.HEALTH
    ];
    const randomPillar = pillars[Math.floor(Math.random() * pillars.length)];
    const amount = Math.floor(Math.random() * 100) + 1;
    
    const success = zkpProofLedger.addStakeEntry(
      testZKP,
      testDID,
      'Contributor',
      randomPillar,
      undefined,
      amount
    );
    
    if (success) {
      refreshLedgerData();
      toast({
        title: "Entry Added",
        description: `Test stake entry created with ${amount} TruthCoins`,
      });
    } else {
      toast({
        title: "Failed to Add Entry",
        description: "ZKP validation failed",
        variant: "destructive"
      });
    }
  };

  const getPillarName = (pillar: TruthCoinPillar): string => {
    const names = ['GOVERNANCE', 'EDUCATION', 'HEALTH', 'CULTURE', 'PEACE', 'SCIENCE', 'JOURNALISM', 'JUSTICE'];
    return names[pillar] || 'UNKNOWN';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-500" />
              ZKP Proof Ledger Test Interface
            </CardTitle>
            <CardDescription>
              Phase XXIX Step 3 - Testing ZKPProofLedger.ts functionality for Commander Mark validation
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics Overview */}
        {ledgerStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Ledger Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ledgerStats.totalEntries}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{ledgerStats.totalStaked}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Staked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{ledgerStats.uniqueStakers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique Stakers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {integrityStatus?.valid ? 'VALID' : 'INVALID'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Integrity Status</div>
                </div>
              </div>
              
              {/* Pillar Distribution */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Pillar Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(ledgerStats.pillarDistribution).map(([pillar, amount]) => (
                    <div key={pillar} className="flex justify-between text-sm">
                      <span>{pillar}:</span>
                      <Badge variant="secondary">{amount}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Execute ZKP ledger operations for testing and validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleRunTest} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Run Test Suite
              </Button>
              
              <Button onClick={handleAddTestEntry} variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Add Test Entry
              </Button>
              
              <Button onClick={handleExportLedger} variant="outline" className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Export Ledger
              </Button>
              
              <Button onClick={refreshLedgerData} variant="ghost" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent ZKP Entries
            </CardTitle>
            <CardDescription>
              Latest stake entries in the proof ledger
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>{getPillarName(entry.pillarId)}</Badge>
                        <Badge variant="outline">{entry.tier}</Badge>
                        <span className="font-mono text-sm">{entry.tokenAmount} TC</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Verified
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>DID: {entry.did}</div>
                      <div>ZKP: {entry.zkProofHash.substring(0, 20)}...</div>
                      <div>Nullifier: {entry.nullifier}</div>
                      <div>Timestamp: {new Date(entry.timestamp).toLocaleString()}</div>
                      <div>Integrity: {entry.integrityHash}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No entries found. Run the test suite or add test entries.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrity Check */}
        {integrityStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Integrity Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${integrityStatus.valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`h-5 w-5 ${integrityStatus.valid ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="font-semibold">
                    Ledger Integrity: {integrityStatus.valid ? 'VALID' : 'INVALID'}
                  </span>
                </div>
                
                {!integrityStatus.valid && integrityStatus.invalidEntries.length > 0 && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Invalid entries: {integrityStatus.invalidEntries.join(', ')}
                  </div>
                )}
                
                {integrityStatus.valid && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    All entries pass integrity verification. Ledger is tamper-evident.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Information */}
        <Card>
          <CardHeader>
            <CardTitle>Test Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>• ZKP Proof Ledger with tamper-evident logging</div>
              <div>• Performance target: &lt;200ms per log/write cycle</div>
              <div>• Mock ZKP validation with nullifier checking</div>
              <div>• Deterministic integrity hashing for audit compliance</div>
              <div>• Export functionality creates .zkpledger.json files</div>
              <div>• Integration ready for ConsensusStakeInterface.tsx</div>
              <div>• Console logging: 📑 ZKP Stake Logged — [Pillar] [Tier] @ [timestamp]</div>
              <div>• Global access: window.zkpProofLedger and window.runZKPLedgerTest()</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZKPLedgerTest;