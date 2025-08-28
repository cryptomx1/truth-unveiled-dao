/**
 * VerifiableBallotCard.tsx - Phase XXVII Step 2
 * Interactive ZK-Eligible Voting Interface with Encrypted Ballot Payload
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Vote,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  EyeOff,
  Upload,
  Wallet
} from 'lucide-react';
import {
  BallotEligibilityVerifier,
  type BallotEligibilityResult,
  type EligibilityValidationContext,
  type ZKPReputationBundle
} from '../../ballot/BallotEligibilityVerifier';
import {
  ZKVoteTokenIssuer,
  type VoteSubmissionInput,
  type TokenIssuanceResult
} from '../../ballot/ZKVoteTokenIssuer';

// Component props interface
interface VerifiableBallotCardProps {
  ballotId: string;
  ballotTitle: string;
  ballotOptions: BallotOption[];
  minimumTier?: 'Citizen' | 'Verifier' | 'Moderator' | 'Governor' | 'Administrator';
  minimumTrustScore?: number;
  timeToLiveMinutes?: number;
  allowVaultDerivation?: boolean;
  onVoteSubmitted?: (result: VoteSubmissionResult) => void;
  userHash?: string;
}

// Ballot option interface
interface BallotOption {
  id: string;
  label: string;
  description?: string;
  color?: string;
}

// Vote submission result interface
interface VoteSubmissionResult {
  success: boolean;
  ballotId: string;
  encryptedPayload: string;
  voteChoice: string;
  multiplier: number;
  cidDigest: string;
  submissionTimestamp: string;
  error?: string;
}

// Voting interface state
type VotingState = 'checking_eligibility' | 'eligible' | 'ineligible' | 'voting' | 'submitted' | 'expired';

// Main VerifiableBallotCard component
export const VerifiableBallotCard: React.FC<VerifiableBallotCardProps> = ({
  ballotId,
  ballotTitle,
  ballotOptions,
  minimumTier = 'Citizen',
  minimumTrustScore = 50,
  timeToLiveMinutes = 10,
  allowVaultDerivation = true,
  onVoteSubmitted,
  userHash = 'user-did:civic:commander-mark'
}) => {
  
  // Component state
  const [votingState, setVotingState] = useState<VotingState>('checking_eligibility');
  const [eligibilityResult, setEligibilityResult] = useState<BallotEligibilityResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(timeToLiveMinutes * 60);
  const [uploadedBundle, setUploadedBundle] = useState<ZKPReputationBundle | null>(null);
  const [showEncryptedPayload, setShowEncryptedPayload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<VoteSubmissionResult | null>(null);
  
  // ARIA live region ref
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  
  // File upload ref
  const fileUploadRef = useRef<HTMLInputElement>(null);
  
  // Initialize eligibility verifier
  const eligibilityVerifier = BallotEligibilityVerifier.getInstance();
  
  // Validation context
  const validationContext: EligibilityValidationContext = {
    ballotId,
    minimumTier,
    minimumTrustScore,
    epochToleranceDays: 60,
    requireIntegrityVerification: true,
    allowVaultDerivation
  };
  
  // Check initial eligibility from vault
  const checkInitialEligibility = async () => {
    setVotingState('checking_eligibility');
    
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = 'Checking ballot eligibility...';
    }
    
    try {
      // Try vault-derived eligibility first
      const result = eligibilityVerifier.verifyEligibilityFromVault(userHash, validationContext);
      setEligibilityResult(result);
      
      if (result.valid) {
        setVotingState('eligible');
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Eligible to vote. Vote weight: ${result.multiplier} times. ${timeToLiveMinutes} minutes remaining.`;
        }
      } else {
        setVotingState('ineligible');
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Voting eligibility blocked: ${result.reason}`;
        }
      }
      
    } catch (error) {
      console.error('❌ Initial eligibility check failed:', error);
      setVotingState('ineligible');
    }
  };
  
  // Handle file upload for ZKP bundle
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadData = e.target?.result as string;
        const result = eligibilityVerifier.verifyEligibilityFromUpload(uploadData, validationContext);
        
        setEligibilityResult(result);
        
        if (result.valid) {
          // Parse bundle for display
          const bundle: ZKPReputationBundle = JSON.parse(uploadData);
          setUploadedBundle(bundle);
          setVotingState('eligible');
          
          if (ariaLiveRef.current) {
            ariaLiveRef.current.textContent = `ZKP bundle verified. Eligible to vote with ${result.multiplier} times weight.`;
          }
        } else {
          setVotingState('ineligible');
          if (ariaLiveRef.current) {
            ariaLiveRef.current.textContent = `ZKP bundle rejected: ${result.reason}`;
          }
        }
        
      } catch (error) {
        console.error('❌ File upload processing failed:', error);
        setVotingState('ineligible');
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = 'File upload failed. Invalid ZKP bundle format.';
        }
      }
    };
    
    reader.readAsText(file);
  };
  
  // Handle vote submission with ZK vote token issuance
  const handleVoteSubmission = async () => {
    if (!eligibilityResult || !selectedOption) return;
    
    setIsSubmitting(true);
    setVotingState('voting');
    
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = 'Processing ZK vote token issuance...';
    }
    
    try {
      // Create encrypted ballot payload
      const selectedBallotOption = ballotOptions.find(option => option.id === selectedOption);
      const encryptedPayload = generateEncryptedPayload(
        ballotId,
        selectedOption,
        eligibilityResult.cidDigest,
        eligibilityResult.multiplier
      );
      
      // Create vote submission input for ZK vote token issuer
      const voteSubmissionInput: VoteSubmissionInput = {
        ballotId,
        cidDigest: eligibilityResult.cidDigest,
        vote: selectedBallotOption?.label || selectedOption,
        multiplier: eligibilityResult.multiplier,
        encryptedPayload,
        eligibilityResult
      };
      
      // Issue ZK vote token through Step 3 ZKVoteTokenIssuer
      const zkVoteTokenIssuer = ZKVoteTokenIssuer.getInstance();
      const tokenResult = await zkVoteTokenIssuer.issueVoteToken(voteSubmissionInput);
      
      const submissionTimestamp = new Date().toISOString();
      
      if (tokenResult.success && tokenResult.token) {
        // Successful token issuance
        const voteResult: VoteSubmissionResult = {
          success: true,
          ballotId,
          encryptedPayload,
          voteChoice: selectedBallotOption?.label || selectedOption,
          multiplier: eligibilityResult.multiplier,
          cidDigest: eligibilityResult.cidDigest,
          submissionTimestamp
        };
        
        setSubmissionResult(voteResult);
        setVotingState('submitted');
        
        // Console logging as required - already handled by ZKVoteTokenIssuer
        const cidShort = eligibilityResult.cidDigest.length > 12 ? 
          eligibilityResult.cidDigest.substring(0, 12) + '...' : 
          eligibilityResult.cidDigest;
        
        console.log(`🗳️ Ballot Submitted — CID: ${cidShort} | Vote: ${voteResult.voteChoice} | Multiplier: ${voteResult.multiplier}x | EncryptedPayload: ${encryptedPayload.substring(0, 24)}...`);
        console.log(`✅ ZK Vote Token: ${tokenResult.token.tokenId} | Proof: ${tokenResult.token.proofSignature.substring(0, 20)}...`);
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Vote submitted successfully for ${voteResult.voteChoice}. Your vote weight: ${voteResult.multiplier} times. ZK token issued.`;
        }
        
        if (onVoteSubmitted) {
          onVoteSubmitted(voteResult);
        }
        
      } else {
        // Token issuance failed
        const errorResult: VoteSubmissionResult = {
          success: false,
          ballotId,
          encryptedPayload: '',
          voteChoice: selectedOption,
          multiplier: 0,
          cidDigest: eligibilityResult.cidDigest,
          submissionTimestamp,
          error: tokenResult.error || 'ZK vote token issuance failed'
        };
        
        setSubmissionResult(errorResult);
        setVotingState('ineligible');
        
        console.log(`❌ Token issuance failed — Ballot: ${ballotId} | Reason: ${tokenResult.reason} | Error: ${tokenResult.error}`);
        
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Vote submission failed: ${tokenResult.error}`;
        }
      }
      
    } catch (error) {
      console.error('❌ Vote submission failed:', error);
      
      const errorResult: VoteSubmissionResult = {
        success: false,
        ballotId,
        encryptedPayload: '',
        voteChoice: selectedOption,
        multiplier: 0,
        cidDigest: eligibilityResult.cidDigest,
        submissionTimestamp: new Date().toISOString(),
        error: String(error)
      };
      
      setSubmissionResult(errorResult);
      setVotingState('ineligible');
      
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Vote submission failed: ${String(error)}`;
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate encrypted payload
  const generateEncryptedPayload = (
    ballotId: string,
    voteChoice: string,
    cidDigest: string,
    multiplier: number
  ): string => {
    const payloadInput = `${ballotId}:${voteChoice}:${cidDigest}:${multiplier}:${Date.now()}`;
    const hash = simpleHash(payloadInput);
    return `encrypted-ballot-${hash}`;
  };
  
  // Simple hash function for mock encryption
  const simpleHash = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (votingState) {
      case 'checking_eligibility':
        return <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />;
      case 'eligible':
        return <Unlock className="w-6 h-6 text-green-400" />;
      case 'ineligible':
        return <Lock className="w-6 h-6 text-red-400" />;
      case 'voting':
        return <Vote className="w-6 h-6 text-purple-400 animate-pulse" />;
      case 'submitted':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'expired':
        return <Clock className="w-6 h-6 text-orange-400" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };
  
  // Get status message
  const getStatusMessage = (): string => {
    switch (votingState) {
      case 'checking_eligibility':
        return 'Checking ballot eligibility...';
      case 'eligible':
        return `🔓 Eligible to Vote (${eligibilityResult?.multiplier}x weight)`;
      case 'ineligible':
        return `🔒 Eligibility Blocked: ${eligibilityResult?.reason}`;
      case 'voting':
        return '🧠 Processing encrypted ballot...';
      case 'submitted':
        return '✅ Vote submitted successfully';
      case 'expired':
        return '⏰ Ballot expired';
      default:
        return 'Unknown status';
    }
  };
  
  // Get guidance message for ineligible state
  const getGuidanceMessage = (): string => {
    if (!eligibilityResult || eligibilityResult.valid) return '';
    
    if (eligibilityResult.reason?.includes('epoch')) {
      return '🧠 Replay required - Your credentials have expired';
    }
    
    if (eligibilityResult.reason?.includes('tier insufficient')) {
      return '🪪 Tier upgrade required - Complete more civic missions';
    }
    
    if (eligibilityResult.reason?.includes('trust insufficient')) {
      return '🤝 Trust building required - Increase civic participation';
    }
    
    if (eligibilityResult.reason?.includes('integrity')) {
      return '🔐 Integrity check failed - Verify credentials';
    }
    
    return '📋 Review eligibility requirements';
  };
  
  // Initialize component
  useEffect(() => {
    checkInitialEligibility();
  }, [ballotId, userHash]);
  
  // Time countdown
  useEffect(() => {
    if (votingState === 'submitted' || votingState === 'expired') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setVotingState('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [votingState]);
  
  return (
    <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
      {/* ARIA Live Region */}
      <div 
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Hidden file input */}
      <input
        ref={fileUploadRef}
        type="file"
        accept=".json,.zkp-rep.json"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload ZKP reputation bundle"
      />
      
      {/* Header */}
      <div className="bg-slate-700 p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <h2 className="text-lg font-semibold text-slate-200">{ballotTitle}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {timeRemaining > 0 && votingState !== 'submitted' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-900/30 border border-orange-600 text-orange-300 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTimeRemaining(timeRemaining)}</span>
              </div>
            )}
            
            <div className="text-sm text-slate-400">
              Ballot ID: {ballotId}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-slate-400">
          {getStatusMessage()}
        </div>
      </div>
      
      {/* Status Display */}
      <div className="p-4 space-y-4">
        {/* Eligibility Status */}
        {eligibilityResult && (
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-300">Eligibility Status</h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileUploadRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-900/30 border border-purple-600 text-purple-300 rounded hover:bg-purple-800/30 transition-colors"
                  aria-label="Upload ZKP bundle"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Bundle</span>
                </button>
                
                {allowVaultDerivation && (
                  <button
                    onClick={checkInitialEligibility}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-900/30 border border-blue-600 text-blue-300 rounded hover:bg-blue-800/30 transition-colors"
                    aria-label="Check vault eligibility"
                  >
                    <Wallet className="w-3 h-3" />
                    <span>Check Vault</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Civic Tier:</span>
                  <span className="text-slate-300 font-medium">{eligibilityResult.tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trust Score:</span>
                  <span className="text-slate-300 font-medium">{eligibilityResult.trustScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vote Weight:</span>
                  <span className="text-slate-300 font-medium">{eligibilityResult.multiplier}x</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Epoch Status:</span>
                  <span className={`font-medium ${
                    eligibilityResult.epochStatus === 'valid' ? 'text-green-400' : 
                    eligibilityResult.epochStatus === 'expired' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {eligibilityResult.epochStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Integrity:</span>
                  <span className={`font-medium ${
                    eligibilityResult.integrityStatus === 'verified' ? 'text-green-400' : 
                    eligibilityResult.integrityStatus === 'tampered' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {eligibilityResult.integrityStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CID:</span>
                  <span className="text-slate-300 font-mono text-xs">
                    {eligibilityResult.cidDigest.length > 16 ? 
                      eligibilityResult.cidDigest.substring(0, 16) + '...' : 
                      eligibilityResult.cidDigest
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Ineligible Guidance */}
        {votingState === 'ineligible' && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-medium">Voting Not Available</span>
            </div>
            <div className="text-red-200 text-sm mb-3">
              {getGuidanceMessage()}
            </div>
            {eligibilityResult?.reason && (
              <div className="text-red-300 text-xs font-mono bg-red-900/20 p-2 rounded">
                Reason: {eligibilityResult.reason}
              </div>
            )}
          </div>
        )}
        
        {/* Vote Options */}
        {(votingState === 'eligible' || votingState === 'voting') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-300">Ballot Options</h3>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4" />
                <span>Your vote will be encrypted and anonymized</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {ballotOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? 'bg-purple-900/30 border-purple-500 text-purple-200'
                      : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="ballot-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mr-3"
                    disabled={votingState === 'voting'}
                    aria-describedby={option.description ? `option-${option.id}-desc` : undefined}
                  />
                  
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div 
                        id={`option-${option.id}-desc`}
                        className="text-sm text-slate-400 mt-1"
                      >
                        {option.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Encrypted Payload Preview */}
        {selectedOption && votingState === 'eligible' && (
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-300">Vote Preview</h3>
              
              <button
                onClick={() => setShowEncryptedPayload(!showEncryptedPayload)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showEncryptedPayload ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showEncryptedPayload ? 'Hide' : 'Show'} Payload</span>
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Selected:</span>
                <span className="text-slate-300 font-medium">
                  {ballotOptions.find(opt => opt.id === selectedOption)?.label}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your vote weight:</span>
                <span className="text-purple-300 font-medium">{eligibilityResult?.multiplier}x</span>
              </div>
              
              {showEncryptedPayload && eligibilityResult && (
                <div className="mt-3 p-2 bg-slate-800 rounded border border-slate-600">
                  <div className="text-xs text-slate-400 mb-1">Encrypted Payload Preview:</div>
                  <div className="text-xs font-mono text-slate-300 break-all">
                    {generateEncryptedPayload(ballotId, selectedOption, eligibilityResult.cidDigest, eligibilityResult.multiplier)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Submission Result */}
        {votingState === 'submitted' && submissionResult && (
          <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Vote Submitted Successfully</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-green-200">Choice:</span>
                <span className="text-green-100 font-medium">{submissionResult.voteChoice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-200">Weight:</span>
                <span className="text-green-100 font-medium">{submissionResult.multiplier}x</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-200">Timestamp:</span>
                <span className="text-green-100 text-xs">
                  {new Date(submissionResult.submissionTimestamp).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-700">
              <div className="text-xs text-green-300 mb-1">Encrypted Ballot ID:</div>
              <div className="text-xs font-mono text-green-100 break-all">
                {submissionResult.encryptedPayload}
              </div>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        {votingState === 'eligible' && (
          <div className="pt-4 border-t border-slate-600">
            <button
              onClick={handleVoteSubmission}
              disabled={!selectedOption || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-900/50 border border-purple-600 text-purple-200 rounded-lg hover:bg-purple-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              aria-label={`Submit vote for ${ballotOptions.find(opt => opt.id === selectedOption)?.label || 'selected option'}`}
            >
              <Vote className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
              <span>{isSubmitting ? 'Submitting Encrypted Ballot...' : 'Submit Vote'}</span>
            </button>
            
            {selectedOption && (
              <div className="mt-2 text-center text-xs text-slate-400">
                Submitting vote for "{ballotOptions.find(opt => opt.id === selectedOption)?.label}" with {eligibilityResult?.multiplier}x weight
              </div>
            )}
          </div>
        )}
        
        {/* Expired State */}
        {votingState === 'expired' && (
          <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-orange-300 font-medium mb-1">Ballot Expired</div>
            <div className="text-orange-200 text-sm">
              The voting window for this ballot has closed.
            </div>
          </div>
        )}
        
        {/* Requirements Display */}
        <div className="bg-slate-700/20 rounded-lg p-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">Voting Requirements</span>
          </div>
          <div className="space-y-1">
            <div>• Minimum Tier: {minimumTier}</div>
            <div>• Minimum Trust Score: {minimumTrustScore}</div>
            <div>• Time Limit: {timeToLiveMinutes} minutes</div>
            <div>• ZKP Bundle: {allowVaultDerivation ? 'Optional (vault fallback available)' : 'Required'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiableBallotCard;