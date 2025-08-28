// Phase V Step 2: ProposalSubmission.tsx
// Commander Mark authorization via JASMY Relay
// DID-authenticated civic proposal interface with ZKP validation

import React, { useState, useEffect, useRef } from 'react';
import { GovernanceSyncLayer, Proposal } from '../../layers/GovernanceSyncLayer';
import { LocalSaveLayer } from '../../layers/LocalSaveLayer';

interface ProposalSubmissionProps {
  userDID?: string;
  userTier?: 'Citizen' | 'Moderator' | 'Governor';
  onSubmissionComplete?: (proposal: Proposal) => void;
}

interface FormData {
  title: string;
  description: string;
  tag: 'Policy' | 'Funding' | 'Structure' | 'Audit' | '';
  attachment?: File;
}

interface SubmissionState {
  status: 'idle' | 'validating' | 'submitting' | 'success' | 'failed';
  message: string;
  proposal?: Proposal;
}

export default function ProposalSubmission({ 
  userDID = 'did:civic:0x7f3e2d1a8c9b5f2e', 
  userTier = 'Citizen',
  onSubmissionComplete 
}: ProposalSubmissionProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    tag: '',
    attachment: undefined
  });
  
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: 'idle',
    message: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [characterCounts, setCharacterCounts] = useState({ title: 0, description: 0 });
  
  const governanceLayer = useRef(new GovernanceSyncLayer());
  const localSaveLayer = useRef(new LocalSaveLayer());
  const mountTimestamp = useRef<number>(Date.now());

  // TTS override system (disabled per nuclear override directive)
  const ttsOverrideRef = useRef<boolean>(true);

  useEffect(() => {
    // Performance measurement
    const renderTime = Date.now() - mountTimestamp.current;
    if (renderTime > 125) {
      console.warn(`⚠️ ProposalSubmission render time: ${renderTime}ms (exceeds 125ms target)`);
    }

    // Nuclear TTS override
    if (ttsOverrideRef.current) {
      console.log('🔇 EMERGENCY TTS KILLER ACTIVATED - ALL SPEECH DESTROYED');
      console.log('🔇 TTS disabled: "Proposal interface ready"');
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string | File) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Update character counts
      setCharacterCounts({
        title: updated.title.length,
        description: updated.description.length
      });
      
      return updated;
    });
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Handle file attachment
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(['Attachment must be smaller than 5MB']);
        return;
      }
      
      handleInputChange('attachment', file);
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const startTime = Date.now();
    
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Title is required');
    } else if (formData.title.length > 100) {
      errors.push('Title must be 100 characters or less');
    }
    
    if (!formData.description.trim()) {
      errors.push('Description is required');
    } else if (formData.description.length > 300) {
      errors.push('Description must be 300 characters or less');
    }
    
    if (!formData.tag) {
      errors.push('Tag selection is required');
    }
    
    if (!userDID || !userDID.startsWith('did:')) {
      errors.push('Valid DID authentication required');
    }
    
    setValidationErrors(errors);
    
    const validationTime = Date.now() - startTime;
    if (validationTime > 100) {
      console.warn(`⚠️ ProposalSubmission validation time: ${validationTime}ms (exceeds 100ms target)`);
    }
    
    return errors.length === 0;
  };

  // Submit proposal
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const cycleStartTime = Date.now();
    
    if (!validateForm()) {
      setSubmissionState({
        status: 'failed',
        message: 'Please correct the errors above'
      });
      return;
    }
    
    // Generate proposal object
    const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const proposalData: Omit<Proposal, 'zkpHash' | 'id' | 'timestamp' | 'status'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      tag: formData.tag as 'Policy' | 'Funding' | 'Structure' | 'Audit',
      submitterDID: userDID,
      submitterTier: userTier,
      attachment: formData.attachment
    };
    
    // Generate ZKP hash
    const zkpHash = governanceLayer.current.generateZKPHash(proposalData);
    
    const proposal: Proposal = {
      ...proposalData,
      id: proposalId,
      timestamp,
      zkpHash,
      status: 'pending'
    };
    
    setSubmissionState({
      status: 'validating',
      message: 'Validating proposal integrity...',
      proposal
    });
    
    // Validate with GovernanceSyncLayer
    const validation = governanceLayer.current.validateProposal(proposalData);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setSubmissionState({
        status: 'failed',
        message: 'Proposal validation failed'
      });
      return;
    }
    
    setSubmissionState({
      status: 'submitting',
      message: 'Uploading to IPFS...',
      proposal
    });
    
    try {
      // Attempt upload to IPFS
      const uploadResult = await governanceLayer.current.uploadProposal(proposal);
      
      if (uploadResult.success && uploadResult.ipfsHash) {
        // Success path
        proposal.status = 'uploaded';
        proposal.ipfsHash = uploadResult.ipfsHash;
        
        // Log to vault history
        localSaveLayer.current.logSuccessfulUpload(proposal.id, uploadResult.ipfsHash);
        
        setSubmissionState({
          status: 'success',
          message: `Proposal submitted successfully! IPFS: ${uploadResult.ipfsHash}`,
          proposal
        });
        
        // Nuclear TTS override
        if (ttsOverrideRef.current) {
          console.log('🔇 TTS disabled: "Proposal submitted successfully"');
        }
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          tag: '',
          attachment: undefined
        });
        setCharacterCounts({ title: 0, description: 0 });
        
        // Callback to parent component
        if (onSubmissionComplete) {
          onSubmissionComplete(proposal);
        }
        
      } else {
        // Upload failed - activate Path B
        proposal.status = 'failed';
        
        // Save to local storage for retry
        localSaveLayer.current.saveProposal(proposal, true);
        
        setSubmissionState({
          status: 'failed',
          message: `Upload failed: ${uploadResult.error || 'Unknown error'}. Proposal saved locally for retry.`,
          proposal
        });
        
        console.warn('⚠️ ProposalSubmission: Path B activated - proposal saved locally');
      }
      
    } catch (error) {
      // Exception handling - Path B fallback
      proposal.status = 'failed';
      
      localSaveLayer.current.saveProposal(proposal, true);
      
      setSubmissionState({
        status: 'failed',
        message: `Submission error: ${error instanceof Error ? error.message : 'Unknown error'}. Proposal saved locally.`,
        proposal
      });
      
      console.error('❌ ProposalSubmission: Submission error:', error);
    }
    
    const cycleTime = Date.now() - cycleStartTime;
    if (cycleTime > 200) {
      console.warn(`⚠️ ProposalSubmission full cycle time: ${cycleTime}ms (exceeds 200ms target)`);
    }
  };

  // Get status color for UI feedback
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'validating':
      case 'submitting': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  // Get tag color for visual feedback
  const getTagColor = (tag: string): string => {
    switch (tag) {
      case 'Policy': return 'bg-blue-600';
      case 'Funding': return 'bg-green-600';
      case 'Structure': return 'bg-purple-600';
      case 'Audit': return 'bg-orange-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          Civic Proposal Submission
        </h2>
        <div className="text-sm text-slate-400 space-y-1">
          <div>Phase V • Step 2 • ZKP Authenticated</div>
          <div>DID: {userDID}</div>
          <div>Tier: <span className={`font-medium ${userTier === 'Governor' ? 'text-purple-400' : userTier === 'Moderator' ? 'text-blue-400' : 'text-green-400'}`}>{userTier}</span></div>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="proposal-title" className="block text-sm font-medium text-slate-300 mb-2">
            Proposal Title *
          </label>
          <input
            id="proposal-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter proposal title..."
            maxLength={100}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minHeight: '48px' }}
            aria-describedby="title-counter title-requirements"
          />
          <div id="title-counter" className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Character count: {characterCounts.title}/100</span>
            <span id="title-requirements">Required field</span>
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="proposal-description" className="block text-sm font-medium text-slate-300 mb-2">
            Description *
          </label>
          <textarea
            id="proposal-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your proposal in detail..."
            maxLength={300}
            rows={4}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            aria-describedby="description-counter description-requirements"
          />
          <div id="description-counter" className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Character count: {characterCounts.description}/300</span>
            <span id="description-requirements">Required field</span>
          </div>
        </div>

        {/* Tag Selection */}
        <div>
          <label htmlFor="proposal-tag" className="block text-sm font-medium text-slate-300 mb-2">
            Civic Tag *
          </label>
          <select
            id="proposal-tag"
            value={formData.tag}
            onChange={(e) => handleInputChange('tag', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minHeight: '48px' }}
            aria-describedby="tag-requirements"
          >
            <option value="">Select a tag...</option>
            <option value="Policy">Policy</option>
            <option value="Funding">Funding</option>
            <option value="Structure">Structure</option>
            <option value="Audit">Audit</option>
          </select>
          <div id="tag-requirements" className="text-xs text-slate-400 mt-1">
            Required field • Categorizes your proposal
          </div>
          
          {/* Tag Preview */}
          {formData.tag && (
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getTagColor(formData.tag)}`}>
                {formData.tag}
              </span>
            </div>
          )}
        </div>

        {/* File Attachment (Optional) */}
        <div>
          <label htmlFor="proposal-attachment" className="block text-sm font-medium text-slate-300 mb-2">
            Attachment (Optional)
          </label>
          <input
            id="proposal-attachment"
            type="file"
            onChange={handleFileAttachment}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white file:bg-slate-600 file:border-0 file:text-white file:px-2 file:py-1 file:rounded file:mr-2"
            style={{ minHeight: '48px' }}
            aria-describedby="attachment-info"
          />
          <div id="attachment-info" className="text-xs text-slate-400 mt-1">
            Max 5MB • PDF, DOC, TXT, PNG, JPG
          </div>
          
          {/* Attachment Preview */}
          {formData.attachment && (
            <div className="mt-2 p-2 bg-slate-700 rounded border border-slate-600">
              <div className="text-sm text-white font-medium">{formData.attachment.name}</div>
              <div className="text-xs text-slate-400">
                {(formData.attachment.size / 1024).toFixed(1)} KB
              </div>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-red-900/50 border border-red-600 rounded-md" role="alert" aria-live="polite">
            <div className="text-sm font-medium text-red-400 mb-1">
              Please correct the following:
            </div>
            <ul className="text-sm text-red-300 list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submission Status */}
        {submissionState.status !== 'idle' && (
          <div className="p-3 bg-slate-700 border border-slate-600 rounded-md" aria-live="polite">
            <div className={`text-sm font-medium ${getStatusColor(submissionState.status)} mb-1`}>
              {submissionState.status === 'validating' && '🔍 Validating...'}
              {submissionState.status === 'submitting' && '📤 Submitting...'}
              {submissionState.status === 'success' && '✅ Success'}
              {submissionState.status === 'failed' && '❌ Failed'}
            </div>
            <div className="text-sm text-slate-300">
              {submissionState.message}
            </div>
            
            {/* ZKP Hash Display */}
            {submissionState.proposal && (
              <div className="mt-2 text-xs text-slate-400">
                ZKP Hash: <span className="font-mono text-blue-400">{submissionState.proposal.zkpHash}</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submissionState.status === 'validating' || submissionState.status === 'submitting'}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          style={{ minHeight: '48px' }}
          aria-describedby="submit-requirements"
        >
          {submissionState.status === 'validating' && 'Validating...'}
          {submissionState.status === 'submitting' && 'Submitting...'}
          {(submissionState.status === 'idle' || submissionState.status === 'success' || submissionState.status === 'failed') && 'Submit Proposal'}
        </button>
        
        <div id="submit-requirements" className="text-xs text-center text-slate-400">
          ZKP validated • IPFS persistent • DID authenticated
        </div>
      </form>
    </div>
  );
}