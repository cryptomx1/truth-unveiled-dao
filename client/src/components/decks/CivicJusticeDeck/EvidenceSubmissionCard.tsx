import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  FileText,
  Upload,
  Hash,
  Shield,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  FileImage,
  FileAudio,
  File,
  Lock,
  Zap,
  Database,
  User,
  Calendar
} from 'lucide-react';

type EvidenceType = 'document' | 'image' | 'audio' | 'video' | 'data';
type SubmissionStatus = 'pending' | 'uploading' | 'wrapping' | 'submitted' | 'failed';

interface EvidenceFile {
  id: string;
  name: string;
  type: EvidenceType;
  size: number;
  timestamp: Date;
  zkpHash: string;
  metadataHash: string;
  didHash: string;
  credentialHash: string;
  description: string;
  verified: boolean;
  auditTrailId: string;
}

interface EvidenceSubmissionCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
  lastTrigger: number;
}

// Mock evidence files for demonstration
const MOCK_EVIDENCE_FILES: EvidenceFile[] = [
  {
    id: 'evidence_001',
    name: 'witness_statement.pdf',
    type: 'document',
    size: 245760, // 240KB
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    zkpHash: 'zkp_evidence_a1b2c3d4',
    metadataHash: 'meta_hash_x7y8z9w0',
    didHash: 'did:civic:submitter_001',
    credentialHash: 'cred_civic_k3l4m5n6',
    description: 'Sworn witness statement regarding incident #2024-0315',
    verified: true,
    auditTrailId: 'audit_trail_001'
  },
  {
    id: 'evidence_002',
    name: 'security_footage.mp4',
    type: 'video',
    size: 15728640, // 15MB
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    zkpHash: 'zkp_evidence_e5f6g7h8',
    metadataHash: 'meta_hash_p9q0r1s2',
    didHash: 'did:civic:submitter_002',
    credentialHash: 'cred_civic_t3u4v5w6',
    description: 'Security camera footage from 14:30-15:00 UTC',
    verified: false, // Simulate metadata mismatch
    auditTrailId: 'audit_trail_002'
  },
  {
    id: 'evidence_003',
    name: 'audio_recording.wav',
    type: 'audio',
    size: 8388608, // 8MB
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    zkpHash: 'zkp_evidence_i9j0k1l2',
    metadataHash: 'meta_hash_m3n4o5p6',
    didHash: 'did:civic:submitter_003',
    credentialHash: 'cred_civic_q7r8s9t0',
    description: 'Phone call recording with consent documentation',
    verified: true,
    auditTrailId: 'audit_trail_003'
  }
];

// Get evidence type info
const getEvidenceTypeInfo = (type: EvidenceType) => {
  switch (type) {
    case 'document':
      return {
        icon: <FileText className="w-4 h-4" />,
        label: 'Document',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      };
    case 'image':
      return {
        icon: <FileImage className="w-4 h-4" />,
        label: 'Image',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20'
      };
    case 'audio':
      return {
        icon: <FileAudio className="w-4 h-4" />,
        label: 'Audio',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
      };
    case 'video':
      return {
        icon: <File className="w-4 h-4" />,
        label: 'Video',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20'
      };
    case 'data':
      return {
        icon: <Database className="w-4 h-4" />,
        label: 'Data',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20'
      };
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format timestamp
const formatTimestamp = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Generate ZKP hash for evidence
const generateEvidenceZKP = (): string => {
  return `zkp_evidence_${Math.random().toString(36).substr(2, 8)}`;
};

// Generate metadata hash
const generateMetadataHash = (): string => {
  return `meta_hash_${Math.random().toString(36).substr(2, 8)}`;
};

// Generate audit trail ID
const generateAuditTrailId = (): string => {
  return `audit_trail_${Math.random().toString(36).substr(2, 3)}`;
};

// Calculate metadata mismatch rate
const calculateMetadataMismatchRate = (evidenceFiles: EvidenceFile[]): number => {
  if (evidenceFiles.length === 0) return 0;
  const mismatchedFiles = evidenceFiles.filter(file => !file.verified).length;
  return (mismatchedFiles / evidenceFiles.length) * 100;
};

export const EvidenceSubmissionCard: React.FC<EvidenceSubmissionCardProps> = ({ className }) => {
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>(MOCK_EVIDENCE_FILES);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('pending');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false, lastTrigger: 0 });
  const [renderStartTime] = useState(performance.now());
  const [tamperDetected, setTamperDetected] = useState<boolean>(false);
  const [metadataMismatchRate, setMetadataMismatchRate] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`EvidenceSubmissionCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`EvidenceSubmissionCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration with proper cancellation
  const speakMessage = (message: string, force = false) => {
    const now = Date.now();
    
    if (!force && now - ttsStatus.lastTrigger < 3000) {
      console.log(`🔊 TTS throttled: "${message}" (${now - ttsStatus.lastTrigger}ms since last)`);
      return;
    }
    
    if (!ttsStatus.isReady) {
      console.log(`🔊 TTS not ready: "${message}"`);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        setTtsStatus(prev => ({ 
          ...prev, 
          isPlaying: true, 
          lastTrigger: now 
        }));
        
        utterance.onend = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS completed: "${message}"`);
        };
        
        utterance.onerror = () => {
          setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          console.log(`🔊 TTS error: "${message}"`);
        };
        
        window.speechSynthesis.speak(utterance);
        console.log(`🔊 TTS started: "${message}"`);
      }, 40); // <40ms latency requirement
    } catch (error) {
      console.error('TTS speak failed:', error);
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Initialize TTS on mount
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          // Mount TTS message
          setTimeout(() => {
            speakMessage("Evidence submission interface ready", true);
          }, 1000);
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Monitor metadata mismatch rate for pushback trigger (>10% threshold)
  useEffect(() => {
    const mismatchRate = calculateMetadataMismatchRate(evidenceFiles);
    setMetadataMismatchRate(mismatchRate);
    
    if (mismatchRate > 10) {
      setTamperDetected(true);
      console.log(`⚠️ Evidence tamper detected: ${mismatchRate.toFixed(1)}% metadata mismatch rate`);
    } else {
      setTamperDetected(false);
    }
  }, [evidenceFiles]);

  // Simulate file upload
  const handleFileUpload = async () => {
    if (!newDescription.trim()) {
      speakMessage("Please provide evidence description");
      return;
    }

    setIsProcessing(true);
    setSubmissionStatus('uploading');

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmissionStatus('wrapping');
    
    // Simulate ZKP wrapping (<100ms validation target)
    await new Promise(resolve => setTimeout(resolve, 80));

    const newEvidence: EvidenceFile = {
      id: `evidence_${Date.now()}`,
      name: `submitted_evidence_${Date.now()}.pdf`,
      type: 'document',
      size: Math.floor(Math.random() * 1000000) + 100000, // 100KB-1MB
      timestamp: new Date(),
      zkpHash: generateEvidenceZKP(),
      metadataHash: generateMetadataHash(),
      didHash: 'did:civic:current_user',
      credentialHash: 'cred_civic_current',
      description: newDescription,
      verified: Math.random() > 0.2, // 80% verification success rate
      auditTrailId: generateAuditTrailId()
    };

    setEvidenceFiles(prev => [newEvidence, ...prev]);
    setSubmissionStatus('submitted');
    setNewDescription('');
    setIsProcessing(false);

    speakMessage("Evidence submitted with ZKP wrapping");
  };

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change (mock)
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // In a real implementation, this would process the actual files
      speakMessage(`${files.length} file selected for upload`);
    }
  };

  const verifiedFiles = evidenceFiles.filter(file => file.verified).length;
  const totalFiles = evidenceFiles.length;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto relative',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        tamperDetected && 'animate-pulse ring-2 ring-red-500/50',
        className
      )}
      role="region"
      aria-label="Evidence Submission Interface"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.wav,.mp4,.mov"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Select files for evidence submission"
      />

      {/* Status Indicator Dot */}
      <div 
        className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          tamperDetected ? 'bg-red-500 animate-pulse' :
          submissionStatus === 'submitted' ? 'bg-green-500' :
          submissionStatus === 'uploading' || submissionStatus === 'wrapping' ? 'bg-amber-500 animate-pulse' :
          'bg-blue-500'
        )}
        aria-label={
          tamperDetected ? "Status: Tamper Alert" :
          submissionStatus === 'submitted' ? "Status: Evidence Submitted" :
          submissionStatus === 'uploading' || submissionStatus === 'wrapping' ? "Status: Processing" :
          "Status: Ready"
        }
        title={
          tamperDetected ? `${metadataMismatchRate.toFixed(1)}% metadata mismatch detected` :
          `Submission status: ${submissionStatus}`
        }
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Evidence Submission
          </CardTitle>
          <Badge variant="outline" className={cn(
            'border-opacity-50',
            tamperDetected ? 'border-red-500/30 bg-red-500/10 text-red-400' :
            submissionStatus === 'submitted' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
            'border-blue-500/30 bg-blue-500/10 text-blue-400'
          )}>
            <div className="flex items-center gap-1">
              {tamperDetected ? <AlertTriangle className="w-3 h-3" /> :
               submissionStatus === 'submitted' ? <CheckCircle className="w-3 h-3" /> :
               <Upload className="w-3 h-3" />}
              {tamperDetected ? 'Tamper Alert' :
               submissionStatus === 'submitted' ? 'Submitted' : 'Ready'}
            </div>
          </Badge>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Secure evidence upload with ZKP wrapping and audit trail
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tamper Detection Alert */}
        {tamperDetected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Evidence Tamper Detected
              </span>
            </div>
            <div className="text-xs text-red-300">
              {metadataMismatchRate.toFixed(1)}% metadata mismatch rate exceeds 10% threshold
            </div>
          </div>
        )}

        {/* Evidence Statistics */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-slate-200">
              Evidence Overview
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-200">{totalFiles}</div>
              <div className="text-xs text-slate-400">Total Files</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-400">{verifiedFiles}</div>
              <div className="text-xs text-slate-400">Verified</div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Verification Rate:</span>
              <span className={cn(
                'font-medium',
                metadataMismatchRate > 10 ? 'text-red-400' : 'text-green-400'
              )}>
                {totalFiles > 0 ? ((verifiedFiles / totalFiles) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* File Upload Interface */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Submit New Evidence
            </span>
          </div>
          
          <Textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Describe the evidence and its relevance to the case..."
            className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-400 min-h-[80px] resize-none"
            maxLength={500}
          />
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400">
              {newDescription.length}/500 characters
            </div>
            <div className="flex gap-2">
              <Button
                onClick={triggerFileUpload}
                disabled={isProcessing}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-3 h-3" />
                  Select Files
                </div>
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={!newDescription.trim() || isProcessing}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {submissionStatus === 'uploading' ? 'Uploading...' :
                     submissionStatus === 'wrapping' ? 'ZKP Wrapping...' : 'Processing...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Submit
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Evidence Files List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              Evidence Files
            </span>
          </div>
          
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-3 pr-4">
              {evidenceFiles.map((file) => {
                const typeInfo = getEvidenceTypeInfo(file.type);
                
                return (
                  <div
                    key={file.id}
                    className={cn(
                      'bg-slate-800/30 rounded-lg border p-3',
                      file.verified ? 'border-slate-700/50' : 'border-red-500/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'p-1 rounded',
                          typeInfo.bgColor,
                          typeInfo.color
                        )}>
                          {typeInfo.icon}
                        </div>
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {file.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.verified ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 mb-2">
                      {file.description}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Size:</span>
                        <span className="text-slate-400">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Type:</span>
                        <span className={typeInfo.color}>{typeInfo.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Submitted:</span>
                        <span className="text-slate-400">{formatTimestamp(file.timestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className={file.verified ? 'text-green-400' : 'text-red-400'}>
                          {file.verified ? 'Verified' : 'Failed'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">ZKP Hash:</span>
                        <span className="text-blue-400 font-mono">{file.zkpHash}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Audit Trail:</span>
                        <span className="text-purple-400 font-mono">{file.auditTrailId}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Cross-Deck Verification */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">
              Cross-Deck Validation
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">DID Sync (Deck #12):</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Credential Sync (Deck #13):</span>
              <span className="text-blue-400">Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ZKP Wrapping:</span>
              <span className="text-purple-400">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Metadata Integrity:</span>
              <span className={tamperDetected ? 'text-red-400' : 'text-green-400'}>
                {tamperDetected ? 'Compromised' : 'Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Update Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          Evidence submission interface ready,
          Total evidence files: {totalFiles},
          Verified files: {verifiedFiles},
          Verification rate: {totalFiles > 0 ? ((verifiedFiles / totalFiles) * 100).toFixed(1) : 0}%,
          {tamperDetected && `Alert: ${metadataMismatchRate.toFixed(1)}% metadata mismatch detected`},
          Submission status: {submissionStatus}
        </div>
      </CardContent>
    </Card>
  );
};
export default EvidenceSubmissionCard;
