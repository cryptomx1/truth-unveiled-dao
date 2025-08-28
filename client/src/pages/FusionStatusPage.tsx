/**
 * FusionStatusPage.tsx
 * Civic Fusion Cycle Status Tracker - Individual Record Lifecycle View
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FusionRecord {
  cid: string;
  did: string;
  recordType: 'tp_fusion' | 'tc_mint' | 'guardian_badge' | 'zkp_request';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  zkpHash: string;
  metadata: {
    inputTp?: number;
    outputTokens?: number;
    badgeType?: string;
    pillarsCompleted?: number;
    validationSteps?: string[];
    errors?: string[];
  };
  auditTrail: {
    timestamp: string;
    action: string;
    status: string;
    details: string;
  }[];
}

export const FusionStatusPage: React.FC = () => {
  const { cid } = useParams();
  const [fusionRecord, setFusionRecord] = useState<FusionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (cid) {
      loadFusionRecord(cid);
    }
  }, [cid]);

  const loadFusionRecord = async (recordCid: string) => {
    setLoading(true);
    console.log(`🔍 Loading fusion record for CID: ${recordCid}`);

    try {
      // Simulate fusion record lookup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockRecord: FusionRecord = {
        cid: recordCid,
        did: 'did:civic:fusion_user_789',
        recordType: 'guardian_badge',
        status: 'completed',
        createdAt: '2025-07-23T10:30:00Z',
        completedAt: '2025-07-23T10:45:00Z',
        zkpHash: 'zkp_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
        metadata: {
          badgeType: 'light_of_truth_guardian',
          pillarsCompleted: 8,
          inputTp: 705,
          validationSteps: [
            'Pillar verification',
            'TP threshold check',
            'ZKP generation',
            'Badge minting',
            'CID registration'
          ]
        },
        auditTrail: [
          {
            timestamp: '2025-07-23T10:30:00Z',
            action: 'Record Created',
            status: 'pending',
            details: 'Guardian badge fusion initiated'
          },
          {
            timestamp: '2025-07-23T10:32:15Z',
            action: 'Pillar Validation',
            status: 'processing',
            details: 'Validating 8 civic pillars completion'
          },
          {
            timestamp: '2025-07-23T10:35:30Z',
            action: 'TP Verification',
            status: 'processing',
            details: 'Verified 705 TP threshold met'
          },
          {
            timestamp: '2025-07-23T10:40:45Z',
            action: 'ZKP Generation',
            status: 'processing',
            details: 'Generated cryptographic proof hash'
          },
          {
            timestamp: '2025-07-23T10:45:00Z',
            action: 'Badge Minted',
            status: 'completed',
            details: 'Light of Truth Guardian Badge successfully created'
          }
        ]
      };

      setFusionRecord(mockRecord);
      console.log(`✅ Fusion record loaded: ${mockRecord.recordType} - ${mockRecord.status}`);

    } catch (error) {
      console.error('❌ Failed to load fusion record:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecord = async () => {
    if (!cid) return;
    
    setRefreshing(true);
    await loadFusionRecord(cid);
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-amber-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'tp_fusion': return '⚡';
      case 'tc_mint': return '🪙';
      case 'guardian_badge': return '🌟';
      case 'zkp_request': return '🔐';
      default: return '📄';
    }
  };

  const calculateProgress = () => {
    if (!fusionRecord) return 0;
    
    const totalSteps = fusionRecord.metadata.validationSteps?.length || 1;
    const completedSteps = fusionRecord.auditTrail.filter(
      entry => entry.status === 'completed'
    ).length;
    
    return (completedSteps / totalSteps) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-2xl font-bold mb-2">Loading Fusion Record</h2>
            <p className="text-gray-600">Retrieving CID: {cid}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!fusionRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Record Not Found</h2>
            <p className="text-gray-600">CID: {cid}</p>
            <Button 
              onClick={() => window.location.href = '/fusion/dashboard'}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/fusion/dashboard'}
            >
              ← Back to Dashboard
            </Button>
            <Button 
              onClick={refreshRecord}
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              {getRecordTypeIcon(fusionRecord.recordType)} Fusion Record Status
            </h1>
            <Badge variant="outline" className="text-sm">
              CID: {fusionRecord.cid}
            </Badge>
          </div>
        </div>

        {/* Record Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Record Overview</span>
              <Badge className={getStatusColor(fusionRecord.status)}>
                {fusionRecord.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Record Type</div>
                  <div className="font-semibold capitalize">
                    {fusionRecord.recordType.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">DID</div>
                  <div className="font-mono text-sm">{fusionRecord.did}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ZKP Hash</div>
                  <div className="font-mono text-xs break-all">{fusionRecord.zkpHash}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-semibold">
                    {new Date(fusionRecord.createdAt).toLocaleString()}
                  </div>
                </div>
                {fusionRecord.completedAt && (
                  <div>
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="font-semibold">
                      {new Date(fusionRecord.completedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Progress</div>
                  <Progress value={calculateProgress()} className="h-2 mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(calculateProgress())}% Complete
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        {fusionRecord.metadata && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Record Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fusionRecord.metadata.inputTp && (
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{fusionRecord.metadata.inputTp}</div>
                    <div className="text-sm text-gray-600">Input TP</div>
                  </div>
                )}
                {fusionRecord.metadata.outputTokens && (
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{fusionRecord.metadata.outputTokens}</div>
                    <div className="text-sm text-gray-600">Output Tokens</div>
                  </div>
                )}
                {fusionRecord.metadata.pillarsCompleted && (
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{fusionRecord.metadata.pillarsCompleted}/8</div>
                    <div className="text-sm text-gray-600">Pillars Completed</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fusionRecord.auditTrail.map((entry, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${getStatusColor(entry.status)}`} />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{entry.action}</h4>
                      <Badge variant="outline" className="text-xs">
                        {entry.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{entry.details}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};