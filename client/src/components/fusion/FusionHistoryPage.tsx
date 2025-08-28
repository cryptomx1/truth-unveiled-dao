/**
 * FusionHistoryPage.tsx
 * Phase 0-X Step 3 - Fusion History Display Component
 * Authority: Commander Mark via JASMY Relay System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, Clock, Download, Radio, Shield } from 'lucide-react';
import FusionLedgerCommit from './FusionLedgerCommit';
import DAOBroadcastEmitter from './DAOBroadcastEmitter';

interface FusionLedgerEntry {
  id: string;
  badgeId: string;
  did: string;
  cid: string;
  zkpHash: string;
  timestamp: string;
  pillarCount: number;
  tierLevel: string;
  guardians: string[];
  auditHash: string;
  broadcastConfirmed: boolean;
}

export default function FusionHistoryPage() {
  const [ledgerEntries, setLedgerEntries] = useState<FusionLedgerEntry[]>([]);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<FusionLedgerEntry | null>(null);
  const [ledgerMetadata, setLedgerMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [integrityStatus, setIntegrityStatus] = useState<boolean | null>(null);

  // Initialize services
  const [fusionLedger] = useState(() => new FusionLedgerCommit());
  const [daoEmitter] = useState(() => new DAOBroadcastEmitter(fusionLedger));

  useEffect(() => {
    loadFusionHistory();
  }, []);

  const loadFusionHistory = () => {
    setIsLoading(true);
    
    try {
      // Load ledger entries
      const entries = fusionLedger.getLedger();
      const metadata = fusionLedger.getMetadata();
      const broadcasts = daoEmitter.getBroadcastHistory();
      
      // Verify ledger integrity
      const integrity = fusionLedger.verifyLedgerIntegrity();
      
      setLedgerEntries(entries);
      setLedgerMetadata(metadata);
      setBroadcastHistory(broadcasts);
      setIntegrityStatus(integrity);
      
      console.log(`📖 Fusion history loaded: ${entries.length} entries`);
      
    } catch (error) {
      console.error('❌ Failed to load fusion history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportFusionLog = () => {
    const logData = fusionLedger.exportLedgerAsJSON();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fusion-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('📤 Fusion log exported');
    
    // ARIA announcement
    const announcement = `Fusion log exported with ${ledgerEntries.length} entries`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-10000px';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 1000);
  };

  const exportBroadcastLog = () => {
    const logData = daoEmitter.exportBroadcastLog();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dao-broadcasts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('📤 DAO broadcast log exported');
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - time) / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getBadgeColor = (pillarCount: number): string => {
    if (pillarCount === 8) return 'bg-purple-500';
    if (pillarCount >= 6) return 'bg-blue-500';
    if (pillarCount >= 4) return 'bg-green-500';
    return 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Loading fusion history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Fusion History</h1>
        <p className="text-muted-foreground">
          Complete audit trail of Genesis badge fusions and DAO confirmations
        </p>
      </div>

      {/* Metadata & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Ledger Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              {integrityStatus ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {integrityStatus ? 'Verified' : 'Corrupted'}
              </span>
            </div>
            <div className="text-2xl font-bold">{ledgerMetadata?.totalEntries || 0}</div>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Radio className="h-4 w-4" />
              <span>DAO Broadcasts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{broadcastHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              {broadcastHistory.filter(b => b.receipt?.confirmed).length} confirmed
            </p>
            <Badge variant="outline" className="text-xs">
              Network Active
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={exportFusionLog} 
              size="sm" 
              className="w-full"
              aria-label="Export fusion ledger as JSON file"
            >
              <Download className="h-4 w-4 mr-2" />
              Fusion Log
            </Button>
            <Button 
              onClick={exportBroadcastLog} 
              size="sm" 
              variant="outline" 
              className="w-full"
              aria-label="Export DAO broadcast history as JSON file"
            >
              <Download className="h-4 w-4 mr-2" />
              Broadcasts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fusion Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Fusion Timeline</CardTitle>
          <CardDescription>
            Chronological history of all Genesis badge fusions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ledgerEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No fusion entries found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete an 8-pillar Genesis fusion to see entries here
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {ledgerEntries
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((entry, index) => (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getBadgeColor(entry.pillarCount)}`} />
                        <div>
                          <h3 className="font-medium">Badge #{entry.badgeId}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={entry.pillarCount === 8 ? 'default' : 'secondary'}>
                          {entry.pillarCount}/8 Pillars
                        </Badge>
                        {entry.broadcastConfirmed && (
                          <Badge variant="outline">
                            <Radio className="h-3 w-3 mr-1" />
                            Broadcasted
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">DID</p>
                        <p className="font-mono text-xs">{entry.did}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CID</p>
                        <p className="font-mono text-xs">{entry.cid}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tier</p>
                        <p>{entry.tierLevel}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Guardians</p>
                        <p>{entry.guardians.length} assigned</p>
                      </div>
                    </div>

                    {entry.guardians.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Guardian Assignments</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.guardians.map((guardian, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {guardian}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Entry ID: {entry.id}</span>
                        <span>Audit Hash: {entry.auditHash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* ARIA live region for announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        aria-label="Fusion history status updates"
      />
    </div>
  );
}