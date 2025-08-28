import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Archive, 
  Download, 
  Shield, 
  Sparkles, 
  Database,
  FileText,
  Hash
} from 'lucide-react';
import GenesisBadgeBinder from '@/components/genesis/GenesisBadgeBinder';
import { legacyVaultExporter, type VaultSnapshot, type LegacyArchive } from '@/vault/LegacyVaultExporter';

const GenesisFusePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fusion');
  const [vaultSnapshot, setVaultSnapshot] = useState<VaultSnapshot | null>(null);
  const [legacyArchive, setLegacyArchive] = useState<LegacyArchive | null>(null);
  const [cidSnapshot, setCidSnapshot] = useState<any>(null);
  const [userDID] = useState('did:civic:alice123');

  // Suppress TTS
  useEffect(() => {
    console.log('🔇 TTS Emergency Killer: ACTIVE');
    
    // ARIA announcement for page load
    const ariaRegion = document.createElement('div');
    ariaRegion.setAttribute('aria-live', 'polite');
    ariaRegion.setAttribute('aria-atomic', 'true');
    ariaRegion.style.position = 'absolute';
    ariaRegion.style.left = '-9999px';
    ariaRegion.textContent = 'Genesis Fusion Loop interface ready - Begin permanent civic record bonding';
    document.body.appendChild(ariaRegion);
    
    setTimeout(() => document.body.removeChild(ariaRegion), 1000);
  }, []);

  const handleCreateVaultSnapshot = () => {
    const snapshot = legacyVaultExporter.createVaultSnapshot(userDID);
    setVaultSnapshot(snapshot);
    console.log('📸 Vault snapshot created for Genesis archival');
  };

  const handleCreateLegacyArchive = () => {
    const archive = legacyVaultExporter.createLegacyArchive(userDID, 90);
    setLegacyArchive(archive);
    console.log('🗄️ Legacy archive created for permanent storage');
  };

  const handleGenerateCIDSnapshot = () => {
    const cidSnap = legacyVaultExporter.generateCIDHashSnapshot(userDID);
    setCidSnapshot(cidSnap);
    console.log('🔗 CID hash snapshot generated for IPFS permanence');
  };

  const handleExportSnapshot = () => {
    if (!vaultSnapshot) return;
    
    const exportData = legacyVaultExporter.exportVaultSnapshot(vaultSnapshot);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `vault_snapshot_${vaultSnapshot.snapshotId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportArchive = () => {
    if (!legacyArchive) return;
    
    const exportData = legacyVaultExporter.exportLegacyArchive(legacyArchive);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `legacy_archive_${legacyArchive.archiveId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCIDSnapshot = () => {
    if (!cidSnapshot) return;
    
    const exportData = JSON.stringify({
      ...cidSnapshot,
      exportTimestamp: new Date().toISOString(),
      exporter: 'LegacyVaultExporter_v1.0',
      schemaVersion: '1.0.0'
    }, null, 2);
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cid_snapshot_${userDID.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Genesis Fusion Loop
            </h1>
            <Zap className="h-8 w-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Phase 0-X: Permanent cryptographic bonding of early civic engagement data into immutable proof-of-origin records
          </p>
          <div className="flex justify-center">
            <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-900/20">
              Authority: Commander Mark via JASMY Relay System
            </Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fusion" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              TP Fusion
            </TabsTrigger>
            <TabsTrigger value="vault" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Vault Archive
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Legacy Export
            </TabsTrigger>
            <TabsTrigger value="cid" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              CID Snapshot
            </TabsTrigger>
          </TabsList>

          {/* Genesis Badge Fusion Tab */}
          <TabsContent value="fusion" className="space-y-6">
            <div className="flex justify-center">
              <GenesisBadgeBinder userDID={userDID} />
            </div>
          </TabsContent>

          {/* Vault Snapshot Tab */}
          <TabsContent value="vault" className="space-y-6">
            <Card className="w-full bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Database className="h-5 w-5 text-blue-600" />
                  Civic Vault Snapshot
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Create timestamped snapshots of civic engagement records for archival
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Button
                    onClick={handleCreateVaultSnapshot}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Create Vault Snapshot
                  </Button>
                </div>

                {vaultSnapshot && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                      Vault Snapshot Created
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Snapshot ID:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100">
                          {vaultSnapshot.snapshotId}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Total Records:</span>
                        <p className="text-lg font-bold text-blue-600">
                          {vaultSnapshot.totalRecords}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Merkle Root:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                          {vaultSnapshot.merkleRoot}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Permanent CID:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                          {vaultSnapshot.permanentCID}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleExportSnapshot} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Snapshot
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legacy Archive Tab */}
          <TabsContent value="legacy" className="space-y-6">
            <Card className="w-full bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Archive className="h-5 w-5 text-green-600" />
                  Legacy Archive Creation
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Create comprehensive archives of historical civic engagement data
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Button
                    onClick={handleCreateLegacyArchive}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Create Legacy Archive (90 days)
                  </Button>
                </div>

                {legacyArchive && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                      Legacy Archive Created
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Archive ID:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100">
                          {legacyArchive.archiveId}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Total Snapshots:</span>
                        <p className="text-lg font-bold text-green-600">
                          {legacyArchive.totalSnapshots}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Total Records:</span>
                        <p className="text-lg font-bold text-purple-600">
                          {legacyArchive.totalRecords}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Archive Period:</span>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          90 days
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Archive Hash:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                          {legacyArchive.archiveHash}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Permanent CID:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                          {legacyArchive.permanentCID}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleExportArchive} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Archive
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CID Snapshot Tab */}
          <TabsContent value="cid" className="space-y-6">
            <Card className="w-full bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Hash className="h-5 w-5 text-purple-600" />
                  CID Hash Snapshot
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Generate IPFS CID snapshots for permanent decentralized storage
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Button
                    onClick={handleGenerateCIDSnapshot}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    Generate CID Snapshot
                  </Button>
                </div>

                {cidSnapshot && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                      CID Hash Snapshot Generated
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Snapshot Hash:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                          {cidSnapshot.snapshotHash}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Merkle Root:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                          {cidSnapshot.merkleRoot}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Permanent CID:</span>
                        <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                          {cidSnapshot.permanentCID}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Record Hashes:</span>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {cidSnapshot.recordHashes.length} civic record hashes included
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={handleExportCIDSnapshot} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CID Snapshot
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                Phase 0-X Genesis Fusion Loop - Cryptographic bonding of civic pioneer records
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenesisFusePage;