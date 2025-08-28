/**
 * FeedbackExportPanel.tsx - Phase XIX
 * ZKP Feedback Proof Export Interface
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Eye, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Hash,
  Clock,
  User,
  MapPin,
  X,
  Key,
  Zap,
  Link,
  ShieldCheck,
  Upload,
  Send,
  ExternalLink
} from 'lucide-react';
import { 
  FeedbackProof, 
  exportFeedbackProof, 
  copyProofHash,
  FeedbackProofSigner 
} from '../../services/FeedbackProofSigner';
import { 
  bindDIDToProof, 
  verifyDIDSignature, 
  type SignedZKPBundle 
} from '../../services/DIDSessionBinder';
import { 
  assembleZKPProof, 
  exportZKPProof, 
  verifyZKPReadiness,
  type ZKPAssemblyResult 
} from '../../services/ZKPProofAssembler';
import { 
  verifyZKPProof, 
  isChainReady,
  type VerificationResult 
} from '../../agents/ZKPVerifierAgent';
import { 
  exportToChainFormat, 
  downloadChainPackage,
  type ChainExportResult 
} from '../../services/ZKPChainExporter';
import { 
  submitProofToDAO, 
  type ProofSubmissionResult,
  type SubmissionProgress 
} from '../../services/ZKPProofRegistrar';

// Props for the export panel
interface FeedbackExportPanelProps {
  proof: FeedbackProof;
  onClose?: () => void;
  onExportComplete?: () => void;
  className?: string;
}

// Export status states
type ExportStatus = 'ready' | 'downloading' | 'completed' | 'error';
type DIDStatus = 'idle' | 'binding' | 'bound' | 'error';
type ZKPStatus = 'idle' | 'assembling' | 'assembled' | 'error';
type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'error';
type ChainExportStatus = 'idle' | 'exporting' | 'exported' | 'error';
type DAOSubmissionStatus = 'idle' | 'submitting' | 'submitted' | 'error';

// Main FeedbackExportPanel component
export const FeedbackExportPanel: React.FC<FeedbackExportPanelProps> = ({
  proof,
  onClose,
  onExportComplete,
  className = ""
}) => {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('ready');
  const [showMetadata, setShowMetadata] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  
  // Phase XX: DID and ZKP state
  const [didStatus, setDIDStatus] = useState<DIDStatus>('idle');
  const [zkpStatus, setZKPStatus] = useState<ZKPStatus>('idle');
  const [signedBundle, setSignedBundle] = useState<SignedZKPBundle | null>(null);
  const [zkpResult, setZKPResult] = useState<ZKPAssemblyResult | null>(null);
  const [showZKPPreview, setShowZKPPreview] = useState(false);
  
  // Phase XXI: Verification and Chain Export state
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [chainExportStatus, setChainExportStatus] = useState<ChainExportStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [chainExportResult, setChainExportResult] = useState<ChainExportResult | null>(null);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  
  // Phase XXII: DAO Submission state
  const [daoSubmissionStatus, setDAOSubmissionStatus] = useState<DAOSubmissionStatus>('idle');
  const [submissionResult, setSubmissionResult] = useState<ProofSubmissionResult | null>(null);
  const [submissionProgress, setSubmissionProgress] = useState<SubmissionProgress | null>(null);
  
  // Refs for ARIA live regions
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  const signer = FeedbackProofSigner.getInstance();

  // Initialize component and verify proof
  useEffect(() => {
    const verified = signer.verifyProof(proof);
    setIsVerified(verified);
    
    // Announce proof ready status
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `📤 Feedback proof ready for download`;
    }
    
    console.log(`🔐 FeedbackExportPanel initialized for ${proof.metadata.billId} | Verified: ${verified}`);
  }, [proof]);

  // Handle proof download
  const handleDownload = async () => {
    if (exportStatus === 'downloading') return;
    
    setExportStatus('downloading');
    
    try {
      const filename = `feedback-proof-${proof.metadata.billId}-${Date.now()}.proof.json`;
      await exportFeedbackProof(proof, filename);
      
      setExportStatus('completed');
      
      // Update ARIA live region
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Feedback proof downloaded for ${proof.metadata.billId}`;
      }
      
      // Notify parent component
      if (onExportComplete) {
        onExportComplete();
      }
      
      // Reset status after delay
      setTimeout(() => {
        setExportStatus('ready');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      setExportStatus('error');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Export failed for ${proof.metadata.billId}`;
      }
      
      setTimeout(() => {
        setExportStatus('ready');
      }, 3000);
    }
  };

  // Handle proof hash copy
  const handleCopyHash = async () => {
    if (copyStatus === 'copying') return;
    
    setCopyStatus('copying');
    
    try {
      await copyProofHash(proof);
      setCopyStatus('copied');
      
      // Update ARIA live region
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Proof hash copied to clipboard`;
      }
      
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Copy failed:', error);
      setCopyStatus('error');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Failed to copy proof hash`;
      }
      
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    }
  };

  // Phase XX: Handle DID binding
  const handleDIDBinding = async () => {
    if (didStatus === 'binding') return;
    
    setDIDStatus('binding');
    
    try {
      const bundle = await bindDIDToProof(proof);
      setSignedBundle(bundle);
      setDIDStatus('bound');
      
      // Update ARIA live region
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `🪪 Identity signature added to civic proof`;
      }
      
    } catch (error) {
      console.error('❌ DID binding failed:', error);
      setDIDStatus('error');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `DID binding failed: ${error}`;
      }
      
      setTimeout(() => {
        setDIDStatus('idle');
      }, 3000);
    }
  };

  // Phase XX: Handle ZKP assembly
  const handleZKPAssembly = async () => {
    if (!signedBundle || zkpStatus === 'assembling') return;
    
    setZKPStatus('assembling');
    
    try {
      const result = await assembleZKPProof(signedBundle);
      setZKPResult(result);
      setZKPStatus('assembled');
      
      // Update ARIA live region
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `🧬 ZKP-compatible proof assembled`;
      }
      
    } catch (error) {
      console.error('❌ ZKP assembly failed:', error);
      setZKPStatus('error');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `ZKP assembly failed: ${error}`;
      }
      
      setTimeout(() => {
        setZKPStatus('idle');
      }, 3000);
    }
  };

  // Handle ZKP export
  const handleZKPExport = async () => {
    if (!zkpResult) return;
    
    try {
      const filename = `zkp-proof-${zkpResult.assembledProof.external_nullifier.bill_id}-${Date.now()}.zkp.json`;
      await exportZKPProof(zkpResult, filename);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `ZKP proof exported successfully`;
      }
      
    } catch (error) {
      console.error('❌ ZKP export failed:', error);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `ZKP export failed`;
      }
    }
  };

  // Phase XXI: Handle ZKP verification
  const handleZKPVerification = async () => {
    if (!zkpResult || verificationStatus === 'verifying') return;
    
    setVerificationStatus('verifying');
    
    try {
      const result = await verifyZKPProof(zkpResult);
      setVerificationResult(result);
      setVerificationStatus('verified');
      
      // Update ARIA live region
      if (ariaLiveRef.current) {
        if (result.isValid && result.chainReady) {
          ariaLiveRef.current.textContent = `ZKP proof verified successfully and ready for export`;
        } else {
          ariaLiveRef.current.textContent = `ZKP verification completed with issues`;
        }
      }
      
    } catch (error) {
      console.error('❌ ZKP verification failed:', error);
      setVerificationStatus('error');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `ZKP verification failed: ${error}`;
      }
      
      setTimeout(() => {
        setVerificationStatus('idle');
      }, 3000);
    }
  };

  // Phase XXI: Handle chain export
  const handleChainExport = async () => {
    if (!zkpResult || !verificationResult || chainExportStatus === 'exporting') return;
    
    setChainExportStatus('exporting');
    
    try {
      const result = await exportToChainFormat(zkpResult, verificationResult);
      setChainExportResult(result);
      setChainExportStatus('exported');
      
      // Update ARIA live region
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Chain export package prepared successfully`;
      }
      
    } catch (error) {
      console.error('❌ Chain export failed:', error);
      setChainExportStatus('error');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Chain export failed: ${error}`;
      }
      
      setTimeout(() => {
        setChainExportStatus('idle');
      }, 3000);
    }
  };

  // Handle chain package download
  const handleChainDownload = async () => {
    if (!chainExportResult) return;
    
    try {
      await downloadChainPackage(chainExportResult);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Chain package downloaded successfully`;
      }
      
    } catch (error) {
      console.error('❌ Chain download failed:', error);
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Chain download failed`;
      }
    }
  };

  // Phase XXII: Handle DAO submission
  const handleDAOSubmission = async () => {
    if (!chainExportResult || daoSubmissionStatus === 'submitting') return;
    
    setDAOSubmissionStatus('submitting');
    setSubmissionProgress(null);
    
    try {
      const result = await submitProofToDAO(chainExportResult, (progress) => {
        setSubmissionProgress(progress);
      });
      
      setSubmissionResult(result);
      
      if (result.status === 'success') {
        setDAOSubmissionStatus('submitted');
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Vote successfully submitted to DAO with Vote ID ${result.voteId}`;
        }
      } else {
        setDAOSubmissionStatus('error');
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `DAO submission failed: ${result.error}`;
        }
        
        setTimeout(() => {
          setDAOSubmissionStatus('idle');
        }, 3000);
      }
      
    } catch (error) {
      console.error('❌ DAO submission failed:', error);
      setDAOSubmissionStatus('error');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `DAO submission failed: ${error}`;
      }
      
      setTimeout(() => {
        setDAOSubmissionStatus('idle');
      }, 3000);
    }
  };

  // Handle view results
  const handleViewResults = () => {
    if (!submissionResult?.voteId) return;
    
    // In a real implementation, this would navigate to results page
    // For now, we'll just log the action
    console.log(`🔗 Viewing results for Vote ID: ${submissionResult.voteId}`);
    
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `Viewing vote results for ${submissionResult.voteId}`;
    }
  };

  // Get download button state
  const getDownloadButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    
    switch (exportStatus) {
      case 'downloading':
        return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300 animate-pulse cursor-not-allowed`;
      case 'completed':
        return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'error':
        return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      default:
        return `${baseStyle} bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500`;
    }
  };

  // Get copy button state
  const getCopyButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    
    switch (copyStatus) {
      case 'copying':
        return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300 animate-pulse cursor-not-allowed`;
      case 'copied':
        return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'error':
        return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      default:
        return `${baseStyle} bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500`;
    }
  };

  // Get DID button style
  const getDIDButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    
    switch (didStatus) {
      case 'binding':
        return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300 animate-pulse cursor-not-allowed`;
      case 'bound':
        return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'error':
        return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      default:
        return `${baseStyle} bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500`;
    }
  };

  // Get ZKP button style
  const getZKPButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    
    switch (zkpStatus) {
      case 'assembling':
        return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300 animate-pulse cursor-not-allowed`;
      case 'assembled':
        return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'error':
        return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      default:
        return `${baseStyle} bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500`;
    }
  };

  // Get verification button style
  const getVerificationButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    
    switch (verificationStatus) {
      case 'verifying':
        return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300 animate-pulse cursor-not-allowed`;
      case 'verified':
        return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'error':
        return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      default:
        return `${baseStyle} bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500`;
    }
  };

  // Get chain export button style
  const getChainExportButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    
    switch (chainExportStatus) {
      case 'exporting':
        return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300 animate-pulse cursor-not-allowed`;
      case 'exported':
        return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'error':
        return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      default:
        return `${baseStyle} bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500`;
    }
  };

  // Get DAO submission button style
  const getDAOSubmissionButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    
    switch (daoSubmissionStatus) {
      case 'submitting':
        return `${baseStyle} bg-blue-900/30 border border-blue-600 text-blue-300 animate-pulse cursor-not-allowed`;
      case 'submitted':
        return `${baseStyle} bg-green-900/30 border border-green-600 text-green-300`;
      case 'error':
        return `${baseStyle} bg-red-900/30 border border-red-600 text-red-300`;
      default:
        return `${baseStyle} bg-indigo-900/30 border border-indigo-600 text-indigo-300 hover:bg-indigo-800/30 hover:border-indigo-500`;
    }
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Truncate hash for display
  const truncateHash = (hash: string, length = 16): string => {
    return `${hash.substring(0, length)}...`;
  };

  return (
    <div 
      className={`bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6 ${className}`}
      role="region"
      aria-label={`Feedback proof export panel for ${proof.metadata.billId}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Proof Export
          </h3>
          <p className="text-sm text-slate-400">
            {proof.metadata.billId} • {proof.metadata.vote}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Unverified</span>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close export panel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Proof Summary */}
      <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">ZKP Signature</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Hash:</span>
            <div className="text-white font-mono text-xs mt-1">
              {truncateHash(proof.feedbackHash)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Session:</span>
            <div className="text-white font-mono text-xs mt-1">
              {proof.sessionId.substring(0, 12)}...
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Algorithm: {proof.metadata.algorithm}</span>
          <span>Size: {formatSize(JSON.stringify(proof).length)}</span>
        </div>
      </div>

      {/* Export Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">Export Options</h4>
        
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={exportStatus === 'downloading'}
            className={getDownloadButtonStyle()}
            aria-label={`Download feedback proof for ${proof.metadata.billId}`}
          >
            {exportStatus === 'downloading' ? (
              <>
                <div className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                <span>Downloading...</span>
              </>
            ) : exportStatus === 'completed' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Downloaded</span>
              </>
            ) : exportStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Failed</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download .proof.json</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyHash}
            disabled={copyStatus === 'copying'}
            className={getCopyButtonStyle()}
            aria-label="Copy proof hash to clipboard"
          >
            {copyStatus === 'copying' ? (
              <>
                <div className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                <span>Copying...</span>
              </>
            ) : copyStatus === 'copied' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : copyStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Failed</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Hash</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500 transition-all duration-200 text-sm font-medium"
            aria-label="Toggle metadata panel"
            aria-expanded={showMetadata}
          >
            <Eye className="w-4 h-4" />
            <span>{showMetadata ? 'Hide' : 'View'} Metadata</span>
          </button>
        </div>

        {/* Phase XX: DID and ZKP Actions */}
        <div className="space-y-3 pt-4 border-t border-slate-600">
          <h4 className="text-sm font-medium text-slate-300">Identity & Zero-Knowledge</h4>
          
          <div className="flex gap-3">
            <button
              onClick={handleDIDBinding}
              disabled={didStatus === 'binding'}
              className={getDIDButtonStyle()}
              aria-label="Sign proof with decentralized identity"
            >
              {didStatus === 'binding' ? (
                <>
                  <div className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                  <span>Binding DID...</span>
                </>
              ) : didStatus === 'bound' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>DID Bound</span>
                </>
              ) : didStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Binding Failed</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign w/ DID</span>
                </>
              )}
            </button>

            {signedBundle && (
              <button
                onClick={handleZKPAssembly}
                disabled={zkpStatus === 'assembling'}
                className={getZKPButtonStyle()}
                aria-label="Assemble zero-knowledge proof"
              >
                {zkpStatus === 'assembling' ? (
                  <>
                    <div className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                    <span>Assembling...</span>
                  </>
                ) : zkpStatus === 'assembled' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>ZKP Ready</span>
                  </>
                ) : zkpStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Assembly Failed</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Assemble ZKP</span>
                  </>
                )}
              </button>
            )}

            {zkpResult && (
              <button
                onClick={handleZKPExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-900/30 border border-purple-600 text-purple-300 hover:bg-purple-800/30 hover:border-purple-500 transition-all duration-200 text-sm font-medium"
                aria-label="Export ZKP proof bundle"
              >
                <Download className="w-4 h-4" />
                <span>Export ZKP</span>
              </button>
            )}
          </div>

          {/* ZKP Preview Panel */}
          {zkpResult && (
            <div className="mt-4">
              <button
                onClick={() => setShowZKPPreview(!showZKPPreview)}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                aria-label="Toggle ZKP preview"
                aria-expanded={showZKPPreview}
              >
                <Eye className="w-3 h-3" />
                <span>{showZKPPreview ? 'Hide' : 'View'} ZKP Preview</span>
              </button>

              {showZKPPreview && (
                <div className="mt-3 bg-purple-900/10 border border-purple-600/30 rounded-lg p-3 space-y-2">
                  <div className="text-xs">
                    <span className="text-slate-400">External Nullifier:</span>
                    <div className="text-purple-300 font-mono text-xs mt-1">
                      {zkpResult.assembledProof.external_nullifier.voting_round}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Circuit ID:</span>
                    <div className="text-purple-300 font-mono text-xs mt-1">
                      {zkpResult.assembledProof.metadata.circuitId}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Verification Key:</span>
                    <div className="text-purple-300 font-mono text-xs mt-1">
                      {zkpResult.assembledProof.metadata.verificationKey}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Protocol: {zkpResult.assembledProof.proof.protocol}</span>
                    <span>Size: {formatSize(zkpResult.exportFormat.file_size)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase XXI: Verification and Chain Export */}
          {zkpResult && (
            <div className="space-y-3 pt-4 border-t border-slate-600">
              <h4 className="text-sm font-medium text-slate-300">Verification & Chain Export</h4>
              
              <div className="flex gap-3">
                <button
                  onClick={handleZKPVerification}
                  disabled={verificationStatus === 'verifying'}
                  className={getVerificationButtonStyle()}
                  aria-label="Verify ZKP proof for blockchain compatibility"
                >
                  {verificationStatus === 'verifying' ? (
                    <>
                      <div className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                      <span>Verifying...</span>
                    </>
                  ) : verificationStatus === 'verified' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </>
                  ) : verificationStatus === 'error' ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Failed</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify ZKP</span>
                    </>
                  )}
                </button>

                {verificationResult && verificationResult.isValid && (
                  <button
                    onClick={handleChainExport}
                    disabled={chainExportStatus === 'exporting'}
                    className={getChainExportButtonStyle()}
                    aria-label="Export proof to blockchain format"
                  >
                    {chainExportStatus === 'exporting' ? (
                      <>
                        <div className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                        <span>Exporting...</span>
                      </>
                    ) : chainExportStatus === 'exported' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Chain Ready</span>
                      </>
                    ) : chainExportStatus === 'error' ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Export Failed</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Export to Chain</span>
                      </>
                    )}
                  </button>
                )}

                {chainExportResult && (
                  <>
                    <button
                      onClick={handleChainDownload}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900/30 border border-emerald-600 text-emerald-300 hover:bg-emerald-800/30 hover:border-emerald-500 transition-all duration-200 text-sm font-medium"
                      aria-label="Download blockchain package"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Chain</span>
                    </button>

                    <button
                      onClick={handleDAOSubmission}
                      disabled={daoSubmissionStatus === 'submitting'}
                      className={getDAOSubmissionButtonStyle()}
                      aria-label="Submit proof to DAO for voting"
                    >
                      {daoSubmissionStatus === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                          <span>Submitting...</span>
                        </>
                      ) : daoSubmissionStatus === 'submitted' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Submitted</span>
                        </>
                      ) : daoSubmissionStatus === 'error' ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>Failed</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit to DAO</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Phase XXII: DAO Submission Progress */}
              {submissionProgress && daoSubmissionStatus === 'submitting' && (
                <div className="mt-4 bg-indigo-900/10 border border-indigo-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-indigo-300">Submission Progress</span>
                    <span className="text-sm text-indigo-400">{submissionProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-indigo-900/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${submissionProgress.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-indigo-300">
                    {submissionProgress.stage}: {submissionProgress.message}
                  </div>
                </div>
              )}

              {/* Phase XXII: DAO Submission Result */}
              {submissionResult && daoSubmissionStatus === 'submitted' && (
                <div className="mt-4 bg-green-900/10 border border-green-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-300">Vote Successfully Submitted</span>
                    <button
                      onClick={handleViewResults}
                      className="flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-600 text-green-300 rounded text-xs hover:bg-green-800/30 transition-colors"
                      aria-label="View vote results"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Results</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-green-400">Vote ID:</span>
                      <div className="text-green-300 font-mono">{submissionResult.voteId}</div>
                    </div>
                    <div>
                      <span className="text-green-400">Weight:</span>
                      <div className="text-green-300">{submissionResult.weight}x</div>
                    </div>
                    <div>
                      <span className="text-green-400">Block Time:</span>
                      <div className="text-green-300">{submissionResult.blockSimulatedAt ? new Date(submissionResult.blockSimulatedAt).toLocaleTimeString() : 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-green-400">Gas Used:</span>
                      <div className="text-green-300">{submissionResult.metadata.gasUsed.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Details Panel */}
              {verificationResult && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowVerificationDetails(!showVerificationDetails)}
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    aria-label="Toggle verification details"
                    aria-expanded={showVerificationDetails}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showVerificationDetails ? 'Hide' : 'View'} Verification Details</span>
                  </button>

                  {showVerificationDetails && (
                    <div className="mt-3 bg-emerald-900/10 border border-emerald-600/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Status:</span>
                        <div className={`font-medium ${verificationResult.isValid ? 'text-green-300' : 'text-red-300'}`}>
                          {verificationResult.isValid ? 'Valid' : 'Invalid'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Chain Ready:</span>
                        <div className={`font-medium ${verificationResult.chainReady ? 'text-green-300' : 'text-amber-300'}`}>
                          {verificationResult.chainReady ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400">Verification Hash:</span>
                        <div className="text-emerald-300 font-mono text-xs mt-1">
                          {verificationResult.verificationHash.substring(0, 24)}...
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Gas Estimate: {verificationResult.performance.gasEstimate.toLocaleString()}</span>
                        <span>Time: {verificationResult.performance.verificationTime}ms</span>
                      </div>
                      {verificationResult.errors.length > 0 && (
                        <div className="text-xs">
                          <span className="text-red-400">Errors:</span>
                          <div className="text-red-300 text-xs mt-1">
                            {verificationResult.errors.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div className="bg-slate-700/20 border border-slate-600 rounded-lg p-4 space-y-4">
          <h5 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Proof Metadata
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location:
                </span>
                <div className="text-white">ZIP {proof.metadata.zip} • District {proof.metadata.district}</div>
              </div>
              
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Tier:
                </span>
                <div className="text-white">{proof.tier}</div>
              </div>
              
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Timestamp:
                </span>
                <div className="text-white font-mono text-xs">
                  {new Date(proof.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Full Hash:
                </span>
                <div className="text-white font-mono text-xs break-all">
                  {proof.feedbackHash}
                </div>
              </div>
              
              <div>
                <span className="text-slate-400">Signature:</span>
                <div className="text-white font-mono text-xs break-all">
                  {proof.signature}
                </div>
              </div>
              
              <div>
                <span className="text-slate-400">Checksum:</span>
                <div className="text-white font-mono text-xs">
                  {proof.integrity.checksum}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARIA Live Region */}
      <div 
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
};

export default FeedbackExportPanel;