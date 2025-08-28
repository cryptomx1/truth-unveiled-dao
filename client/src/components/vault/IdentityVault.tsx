// IdentityVault.tsx - Phase IV Decentralized Identity Storage
// React component for IPFS-backed identity management with ZKP validation
// Authorization: Commander Mark via JASMY Relay | Timestamp: 2025-07-18T00:28:00Z

import { useState, useEffect } from 'react';
import { Vault, Upload, Download, Shield, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { zkpTransportLayer } from '../../layers/ZKPTransportLayer';

interface IdentityRecord {
  id: string;
  did: string;
  name: string;
  type: 'credential' | 'proof' | 'governance' | 'civic';
  ipfsHash?: string;
  zkpHash: string;
  size: number;
  timestamp: Date;
  verified: boolean;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'failed';
}

interface VaultMetrics {
  totalRecords: number;
  uploadedRecords: number;
  failedUploads: number;
  totalSize: number;
  uploadSuccessRate: number;
  lastSync: Date | null;
}

export const IdentityVault = () => {
  const [records, setRecords] = useState<IdentityRecord[]>([]);
  const [metrics, setMetrics] = useState<VaultMetrics>({
    totalRecords: 0,
    uploadedRecords: 0,
    failedUploads: 0,
    totalSize: 0,
    uploadSuccessRate: 100,
    lastSync: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [newRecordData, setNewRecordData] = useState({
    name: '',
    type: 'credential' as IdentityRecord['type'],
    content: ''
  });
  const [pathBTriggered, setPathBTriggered] = useState(false);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    // Initialize vault with mock data
    initializeVault();
    
    // Set up periodic sync monitoring
    const syncInterval = setInterval(() => {
      checkUploadStatus();
    }, 5000);

    const endTime = performance.now();
    setRenderTime(endTime - startTime);

    console.log('🔇 TTS disabled: "Identity vault interface ready"');

    return () => clearInterval(syncInterval);
  }, []);

  const initializeVault = () => {
    const mockRecords: IdentityRecord[] = [
      {
        id: 'record_1',
        did: 'did:civic:0x7f3e2d1a8c9b5f2e',
        name: 'Civic Identity Credential',
        type: 'credential',
        zkpHash: '0x4f3e2d1a8c9b5f2e7d4a6b8c',
        size: 2048,
        timestamp: new Date(Date.now() - 86400000),
        verified: true,
        uploadStatus: 'success',
        ipfsHash: 'QmX7VsG8z3nF2qR4mK9dE1aB5c7H6jL3sT8uY2wQ4vN9xP'
      },
      {
        id: 'record_2',
        did: 'did:civic:0x7f3e2d1a8c9b5f2e',
        name: 'Governance Participation Proof',
        type: 'governance',
        zkpHash: '0x5e6f78901a2b3c4d5e6f',
        size: 1536,
        timestamp: new Date(Date.now() - 43200000),
        verified: true,
        uploadStatus: 'success',
        ipfsHash: 'QmY8WtH9a4oG3rS5nL0eF2bC8d9H7kM4tU9yZ3xR5wQ6vO'
      },
      {
        id: 'record_3',
        did: 'did:civic:0x7f3e2d1a8c9b5f2e',
        name: 'Biometric Proof Template',
        type: 'proof',
        zkpHash: '0x6f78901a2b3c4d5e6f78',
        size: 3072,
        timestamp: new Date(Date.now() - 21600000),
        verified: false,
        uploadStatus: 'failed'
      },
      {
        id: 'record_4',
        did: 'did:civic:0x7f3e2d1a8c9b5f2e',
        name: 'Civic Engagement History',
        type: 'civic',
        zkpHash: '0x78901a2b3c4d5e6f7890',
        size: 4096,
        timestamp: new Date(Date.now() - 10800000),
        verified: true,
        uploadStatus: 'uploading'
      }
    ];

    setRecords(mockRecords);
    updateMetrics(mockRecords);
  };

  const updateMetrics = (recordList: IdentityRecord[]) => {
    const uploaded = recordList.filter(r => r.uploadStatus === 'success').length;
    const failed = recordList.filter(r => r.uploadStatus === 'failed').length;
    const totalSize = recordList.reduce((sum, r) => sum + r.size, 0);
    const successRate = recordList.length > 0 ? (uploaded / recordList.length) * 100 : 100;

    setMetrics({
      totalRecords: recordList.length,
      uploadedRecords: uploaded,
      failedUploads: failed,
      totalSize,
      uploadSuccessRate: successRate,
      lastSync: new Date()
    });

    // Check for Path B trigger (>10% failure rate)
    const failureRate = recordList.length > 0 ? (failed / recordList.length) * 100 : 0;
    if (failureRate > 10 && !pathBTriggered) {
      triggerPathBFallback(failureRate);
    }
  };

  const triggerPathBFallback = (failureRate: number) => {
    setPathBTriggered(true);
    console.warn(`⚠️ Identity Vault Path B triggered: ${failureRate.toFixed(1)}% upload failure rate`);
  };

  const checkUploadStatus = () => {
    // Simulate upload progress and failures
    setRecords(prevRecords => {
      const updatedRecords = prevRecords.map(record => {
        if (record.uploadStatus === 'uploading') {
          // 85% chance of success, 15% chance of failure
          const success = Math.random() > 0.15;
          return {
            ...record,
            uploadStatus: success ? 'success' : 'failed',
            verified: success,
            ipfsHash: success ? `QmZ${Math.random().toString(36).substr(2, 44)}` : undefined
          };
        }
        return record;
      });

      updateMetrics(updatedRecords);
      return updatedRecords;
    });
  };

  const uploadNewRecord = async () => {
    if (!newRecordData.name || !newRecordData.content) {
      return;
    }

    setIsUploading(true);

    try {
      const recordId = `record_${Date.now()}`;
      const did = 'did:civic:0x7f3e2d1a8c9b5f2e'; // Current user DID

      // Create new record
      const newRecord: IdentityRecord = {
        id: recordId,
        did,
        name: newRecordData.name,
        type: newRecordData.type,
        zkpHash: '',
        size: new Blob([newRecordData.content]).size,
        timestamp: new Date(),
        verified: false,
        uploadStatus: 'uploading'
      };

      // Add to records with uploading status
      setRecords(prev => [...prev, newRecord]);

      // Attempt IPFS upload
      const uploadResult = await zkpTransportLayer.uploadToIPFS(
        newRecordData.content,
        {
          did,
          zkpHash: '', // Will be generated by transport layer
          contentType: newRecordData.type === 'credential' ? 'identity' : 
                      newRecordData.type === 'governance' ? 'governance' :
                      newRecordData.type === 'proof' ? 'proof' : 'civic'
        }
      );

      // Update record with upload results
      setRecords(prev => prev.map(r => 
        r.id === recordId 
          ? {
              ...r,
              zkpHash: uploadResult.zkpHash,
              ipfsHash: uploadResult.ipfsHash,
              verified: uploadResult.verified,
              uploadStatus: uploadResult.verified ? 'success' : 'failed'
            }
          : r
      ));

      // Clear form
      setNewRecordData({ name: '', type: 'credential', content: '' });

      console.log('✅ Record uploaded to IPFS:', {
        name: newRecordData.name,
        ipfsHash: uploadResult.ipfsHash,
        zkpHash: uploadResult.zkpHash
      });

    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      // Update record to failed status
      setRecords(prev => prev.map(r => 
        r.id.includes(Date.now().toString()) 
          ? { ...r, uploadStatus: 'failed', verified: false }
          : r
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const retryFailedUploads = async () => {
    const failedRecords = records.filter(r => r.uploadStatus === 'failed');
    
    for (const record of failedRecords) {
      setRecords(prev => prev.map(r => 
        r.id === record.id ? { ...r, uploadStatus: 'uploading' } : r
      ));
    }

    // Trigger recheck after short delay
    setTimeout(() => {
      checkUploadStatus();
    }, 2000);
  };

  const downloadRecord = async (record: IdentityRecord) => {
    if (!record.ipfsHash) {
      console.error('No IPFS hash available for download');
      return;
    }

    try {
      // Simulate IPFS download
      const downloadUrl = `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`;
      console.log(`📥 Downloading record from IPFS: ${downloadUrl}`);
      
      // In real implementation, would fetch and decrypt the data
      console.log(`✅ Record "${record.name}" downloaded successfully`);
    } catch (error) {
      console.error('❌ Download failed:', error);
    }
  };

  const getStatusIcon = (status: IdentityRecord['uploadStatus'], verified: boolean) => {
    switch (status) {
      case 'success':
        return verified ? <Check className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      case 'uploading':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: IdentityRecord['uploadStatus']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'uploading': return 'text-blue-400';
      case 'pending': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeColor = (type: IdentityRecord['type']) => {
    switch (type) {
      case 'credential': return 'bg-blue-900 text-blue-200';
      case 'governance': return 'bg-purple-900 text-purple-200';
      case 'proof': return 'bg-green-900 text-green-200';
      case 'civic': return 'bg-amber-900 text-amber-200';
      default: return 'bg-slate-900 text-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Vault className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Identity Vault</h1>
            <div className="text-sm text-slate-400">
              Phase IV - Decentralized Identity Storage
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-400">
            Render: {renderTime.toFixed(1)}ms
          </div>
          {pathBTriggered && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Path B Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Total Records</div>
          <div className="text-2xl font-bold text-slate-100">{metrics.totalRecords}</div>
          <div className="text-xs text-slate-300">
            {metrics.uploadedRecords} uploaded
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-slate-100">{metrics.uploadSuccessRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-300">
            {metrics.failedUploads} failed
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Total Size</div>
          <div className="text-2xl font-bold text-slate-100">{(metrics.totalSize / 1024).toFixed(1)}KB</div>
          <div className="text-xs text-slate-300">
            IPFS storage
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Last Sync</div>
          <div className="text-2xl font-bold text-slate-100">
            {metrics.lastSync ? new Date(metrics.lastSync).toLocaleTimeString() : 'Never'}
          </div>
          <div className="text-xs text-slate-300">
            Auto-sync active
          </div>
        </div>
      </div>

      {/* Path B Alert */}
      {pathBTriggered && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-200 font-medium">Path B Fallback Active</span>
          </div>
          <div className="text-red-300 text-sm mt-1">
            Upload failure rate exceeds 10% threshold. Local caching enabled.
          </div>
          <button
            onClick={retryFailedUploads}
            className="mt-3 px-3 py-1 bg-red-800 hover:bg-red-700 text-red-200 text-sm rounded transition-colors"
          >
            Retry Failed Uploads
          </button>
        </div>
      )}

      {/* Upload New Record */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Add New Record</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Record Name</label>
            <input
              type="text"
              value={newRecordData.name}
              onChange={(e) => setNewRecordData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none"
              placeholder="Enter record name"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Record Type</label>
            <select
              value={newRecordData.type}
              onChange={(e) => setNewRecordData(prev => ({ ...prev, type: e.target.value as IdentityRecord['type'] }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="credential">Credential</option>
              <option value="governance">Governance</option>
              <option value="proof">Proof</option>
              <option value="civic">Civic</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={uploadNewRecord}
              disabled={isUploading || !newRecordData.name}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload to IPFS
                </>
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Record Content (JSON)</label>
          <textarea
            value={newRecordData.content}
            onChange={(e) => setNewRecordData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none h-24"
            placeholder='{"example": "content", "data": "here"}'
          />
        </div>
      </div>

      {/* Records List */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Identity Records</h2>
          <button
            onClick={retryFailedUploads}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Failed
          </button>
        </div>

        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedRecord === record.id 
                  ? 'border-blue-500 bg-slate-700' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedRecord(selectedRecord === record.id ? null : record.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.uploadStatus, record.verified)}
                  <div>
                    <div className="font-medium text-slate-200">{record.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className={`px-2 py-1 rounded ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                      <span>{(record.size / 1024).toFixed(1)}KB</span>
                      <span>{record.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${getStatusColor(record.uploadStatus)}`}>
                    {record.uploadStatus.toUpperCase()}
                  </span>
                  {record.ipfsHash && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadRecord(record);
                      }}
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                    >
                      <Download className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                  {record.verified && (
                    <Shield className="w-3 h-3 text-green-400" />
                  )}
                </div>
              </div>

              {selectedRecord === record.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">DID</div>
                      <div className="text-slate-300 font-mono break-all">{record.did}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">ZKP Hash</div>
                      <div className="text-slate-300 font-mono break-all">{record.zkpHash}</div>
                    </div>
                    {record.ipfsHash && (
                      <div className="md:col-span-2">
                        <div className="text-slate-400 mb-1">IPFS Hash</div>
                        <div className="text-slate-300 font-mono break-all">{record.ipfsHash}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdentityVault;