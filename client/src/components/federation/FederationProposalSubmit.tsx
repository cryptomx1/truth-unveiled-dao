/**
 * FederationProposalSubmit.tsx - Phase X-FED Step 2
 * 
 * ZKP-gated proposal composer with metadata + intent hash generation
 * Genesis badgeholder verification and CID binding via TruthCoins.sol
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-FED Global Federation DAO Framework - Step 2
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Shield, FileText, Hash, CheckCircle, AlertTriangle, Lock, Globe, Vote } from 'lucide-react';
import { FederationNodeRegistry } from '@shared/federation/FederationNodeRegistry';

interface ProposalMetadata {
  title: string;
  description: string;
  category: 'governance' | 'privacy' | 'audit' | 'cross-border' | 'federation';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  targetJurisdictions: string[];
  requiresZKP: boolean;
  estimatedImpact: 'local' | 'regional' | 'global';
  votingPeriod: number; // days
  quorumRequired: number; // percentage
}

interface GenesisAuthorization {
  badgeholderDID: string;
  signature: string;
  zkpHash: string;
  guardianPillar: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
}

interface ProposalSubmission {
  metadata: ProposalMetadata;
  intentHash: string;
  cidBinding: string;
  authorization: GenesisAuthorization;
  submissionStatus: 'draft' | 'validating' | 'submitted' | 'failed';
}

const FederationProposalSubmit: React.FC = () => {
  const [proposal, setProposal] = useState<ProposalSubmission>({
    metadata: {
      title: '',
      description: '',
      category: 'governance',
      urgency: 'medium',
      targetJurisdictions: [],
      requiresZKP: true,
      estimatedImpact: 'regional',
      votingPeriod: 7,
      quorumRequired: 15
    },
    intentHash: '',
    cidBinding: '',
    authorization: {
      badgeholderDID: '',
      signature: '',
      zkpHash: '',
      guardianPillar: '',
      verificationStatus: 'pending'
    },
    submissionStatus: 'draft'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [zkpVerificationProgress, setZkpVerificationProgress] = useState(0);
  
  const federationRegistry = new FederationNodeRegistry();
  
  const availableJurisdictions = [
    { code: 'US', name: 'United States' },
    { code: 'DE', name: 'Germany' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'JP', name: 'Japan' },
    { code: 'CA', name: 'Canada' },
    { code: 'BR', name: 'Brazil' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' }
  ];

  const guardianPillars = [
    { code: 'GOVERNANCE', name: 'Governance Guardian', icon: '⚖️' },
    { code: 'TRANSPARENCY', name: 'Transparency Guardian', icon: '🔍' },
    { code: 'PRIVACY', name: 'Privacy Guardian', icon: '🔒' },
    { code: 'CONSENSUS', name: 'Consensus Guardian', icon: '🤝' },
    { code: 'INTEGRITY', name: 'Integrity Guardian', icon: '🛡️' },
    { code: 'INNOVATION', name: 'Innovation Guardian', icon: '💡' },
    { code: 'PARTICIPATION', name: 'Participation Guardian', icon: '🗳️' },
    { code: 'JUSTICE', name: 'Justice Guardian', icon: '⚖️' }
  ];

  const validateProposal = (): boolean => {
    const errors: string[] = [];
    
    if (!proposal.metadata.title.trim()) {
      errors.push('Proposal title is required');
    }
    
    if (!proposal.metadata.description.trim() || proposal.metadata.description.length < 50) {
      errors.push('Proposal description must be at least 50 characters');
    }
    
    if (proposal.metadata.targetJurisdictions.length === 0) {
      errors.push('At least one target jurisdiction is required');
    }
    
    if (!proposal.authorization.badgeholderDID.trim()) {
      errors.push('Genesis Badgeholder DID is required');
    }
    
    if (!proposal.authorization.signature.trim()) {
      errors.push('Authorization signature is required');
    }
    
    if (!proposal.authorization.guardianPillar) {
      errors.push('Guardian pillar selection is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generateIntentHash = async (): Promise<string> => {
    const intentData = {
      title: proposal.metadata.title,
      description: proposal.metadata.description,
      category: proposal.metadata.category,
      jurisdictions: proposal.metadata.targetJurisdictions,
      timestamp: Date.now()
    };
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(intentData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateZKPHash = async (): Promise<string> => {
    // Mock ZKP hash generation - in production this would use actual ZKP libraries
    const zkpData = {
      badgeholderDID: proposal.authorization.badgeholderDID,
      guardianPillar: proposal.authorization.guardianPillar,
      signature: proposal.authorization.signature,
      timestamp: Date.now()
    };
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(zkpData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return `zkp_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)}`;
  };

  const generateCIDBinding = (): string => {
    // Mock CID generation - in production this would interface with IPFS/TruthCoins.sol
    const cidPrefix = 'bafybei';
    const randomSuffix = Math.random().toString(36).substring(2, 48);
    return `${cidPrefix}${randomSuffix}`;
  };

  const verifyGenesisAuthorization = async (): Promise<boolean> => {
    console.log('🔐 Initiating Genesis Badgeholder verification...');
    
    // Simulate ZKP verification process
    for (let i = 0; i <= 100; i += 10) {
      setZkpVerificationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Mock verification logic - in production this would check against actual Genesis badges
    const isValidDID = proposal.authorization.badgeholderDID.startsWith('did:genesis:');
    const isValidSignature = proposal.authorization.signature.length >= 20;
    const hasValidGuardian = guardianPillars.some(pillar => pillar.code === proposal.authorization.guardianPillar);
    
    const isVerified = isValidDID && isValidSignature && hasValidGuardian;
    
    if (isVerified) {
      setProposal(prev => ({
        ...prev,
        authorization: {
          ...prev.authorization,
          verificationStatus: 'verified'
        }
      }));
      console.log('✅ Genesis Badgeholder verification successful');
      return true;
    } else {
      setProposal(prev => ({
        ...prev,
        authorization: {
          ...prev.authorization,
          verificationStatus: 'failed'
        }
      }));
      console.log('❌ Genesis Badgeholder verification failed');
      return false;
    }
  };

  const submitProposal = async () => {
    if (!validateProposal()) {
      return;
    }
    
    setIsSubmitting(true);
    setProposal(prev => ({ ...prev, submissionStatus: 'validating' }));
    
    try {
      console.log('📝 Starting federation proposal submission...');
      
      // Step 1: Genesis authorization verification
      const isAuthorized = await verifyGenesisAuthorization();
      if (!isAuthorized) {
        throw new Error('Genesis Badgeholder authorization failed');
      }
      
      // Step 2: Generate intent hash
      const intentHash = await generateIntentHash();
      console.log(`🔐 Intent hash generated: ${intentHash.substring(0, 16)}...`);
      
      // Step 3: Generate ZKP hash
      const zkpHash = await generateZKPHash();
      console.log(`🔒 ZKP hash generated: ${zkpHash}`);
      
      // Step 4: Generate CID binding
      const cidBinding = generateCIDBinding();
      console.log(`📡 CID binding generated: ${cidBinding}`);
      
      // Step 5: Update proposal with generated data
      setProposal(prev => ({
        ...prev,
        intentHash,
        cidBinding,
        authorization: {
          ...prev.authorization,
          zkpHash
        },
        submissionStatus: 'submitted'
      }));
      
      console.log('✅ Federation proposal submitted successfully');
      
      // Emit DAO broadcast for proposal submission
      const broadcastData = {
        type: 'federation_proposal_submitted',
        proposalId: cidBinding,
        badgeholderDID: proposal.authorization.badgeholderDID,
        category: proposal.metadata.category,
        jurisdictions: proposal.metadata.targetJurisdictions,
        timestamp: new Date().toISOString()
      };
      
      console.log('📡 DAO broadcast emitted:', broadcastData);
      
    } catch (error) {
      console.error('❌ Proposal submission failed:', error);
      setProposal(prev => ({ ...prev, submissionStatus: 'failed' }));
      setValidationErrors([`Submission failed: ${error}`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProposal({
      metadata: {
        title: '',
        description: '',
        category: 'governance',
        urgency: 'medium',
        targetJurisdictions: [],
        requiresZKP: true,
        estimatedImpact: 'regional',
        votingPeriod: 7,
        quorumRequired: 15
      },
      intentHash: '',
      cidBinding: '',
      authorization: {
        badgeholderDID: '',
        signature: '',
        zkpHash: '',
        guardianPillar: '',
        verificationStatus: 'pending'
      },
      submissionStatus: 'draft'
    });
    setValidationErrors([]);
    setZkpVerificationProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-100">
            <FileText className="h-6 w-6 text-blue-400" />
            Federation Proposal Submission
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Phase X-FED Step 2
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Proposal Metadata Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-slate-200">
              <Globe className="h-5 w-5 text-green-400" />
              Proposal Metadata
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-200">Proposal Title</Label>
                  <Input
                    id="title"
                    value={proposal.metadata.title}
                    onChange={(e) => setProposal(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, title: e.target.value }
                    }))}
                    placeholder="Federation Governance Enhancement..."
                    className="bg-slate-800 border-slate-600 text-slate-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-slate-200">Category</Label>
                  <Select 
                    value={proposal.metadata.category}
                    onValueChange={(value: any) => setProposal(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, category: value }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="privacy">Privacy</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="cross-border">Cross-Border</SelectItem>
                      <SelectItem value="federation">Federation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="urgency" className="text-slate-200">Urgency Level</Label>
                  <Select 
                    value={proposal.metadata.urgency}
                    onValueChange={(value: any) => setProposal(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, urgency: value }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="impact" className="text-slate-200">Estimated Impact</Label>
                  <Select 
                    value={proposal.metadata.estimatedImpact}
                    onValueChange={(value: any) => setProposal(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, estimatedImpact: value }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Impact</SelectItem>
                      <SelectItem value="regional">Regional Impact</SelectItem>
                      <SelectItem value="global">Global Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="votingPeriod" className="text-slate-200">Voting Period (days)</Label>
                  <Input
                    id="votingPeriod"
                    type="number"
                    min="1"
                    max="30"
                    value={proposal.metadata.votingPeriod}
                    onChange={(e) => setProposal(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, votingPeriod: Number(e.target.value) }
                    }))}
                    className="bg-slate-800 border-slate-600 text-slate-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quorum" className="text-slate-200">
                    Quorum Required ({proposal.metadata.quorumRequired}%)
                  </Label>
                  <input
                    type="range"
                    min="5"
                    max="67"
                    value={proposal.metadata.quorumRequired}
                    onChange={(e) => setProposal(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, quorumRequired: Number(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-slate-200">Proposal Description</Label>
              <Textarea
                id="description"
                value={proposal.metadata.description}
                onChange={(e) => setProposal(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, description: e.target.value }
                }))}
                placeholder="Detailed description of the proposal, its objectives, implementation plan, and expected outcomes..."
                rows={4}
                className="bg-slate-800 border-slate-600 text-slate-200"
              />
              <div className="text-xs text-slate-500 mt-1">
                {proposal.metadata.description.length}/500 characters (minimum 50)
              </div>
            </div>
            
            <div>
              <Label className="text-slate-200">Target Jurisdictions</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {availableJurisdictions.map(jurisdiction => (
                  <div key={jurisdiction.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={jurisdiction.code}
                      checked={proposal.metadata.targetJurisdictions.includes(jurisdiction.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProposal(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              targetJurisdictions: [...prev.metadata.targetJurisdictions, jurisdiction.code]
                            }
                          }));
                        } else {
                          setProposal(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              targetJurisdictions: prev.metadata.targetJurisdictions.filter(j => j !== jurisdiction.code)
                            }
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={jurisdiction.code} className="text-slate-200 text-sm">
                      {jurisdiction.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresZKP"
                checked={proposal.metadata.requiresZKP}
                onCheckedChange={(checked) => setProposal(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, requiresZKP: Boolean(checked) }
                }))}
              />
              <Label htmlFor="requiresZKP" className="text-slate-200">
                Requires Zero-Knowledge Proof Verification
              </Label>
            </div>
          </div>

          {/* Genesis Authorization Section */}
          <div className="space-y-6 border-t border-slate-700 pt-6">
            <div className="flex items-center gap-2 text-lg font-medium text-slate-200">
              <Shield className="h-5 w-5 text-purple-400" />
              Genesis Badgeholder Authorization
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="badgeholderDID" className="text-slate-200">Genesis Badgeholder DID</Label>
                  <Input
                    id="badgeholderDID"
                    value={proposal.authorization.badgeholderDID}
                    onChange={(e) => setProposal(prev => ({
                      ...prev,
                      authorization: { ...prev.authorization, badgeholderDID: e.target.value }
                    }))}
                    placeholder="did:genesis:commander_mark_authority"
                    className="bg-slate-800 border-slate-600 text-slate-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signature" className="text-slate-200">Authorization Signature</Label>
                  <Input
                    id="signature"
                    value={proposal.authorization.signature}
                    onChange={(e) => setProposal(prev => ({
                      ...prev,
                      authorization: { ...prev.authorization, signature: e.target.value }
                    }))}
                    placeholder="0xfederation_proposal_signature"
                    className="bg-slate-800 border-slate-600 text-slate-200"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="guardianPillar" className="text-slate-200">Guardian Pillar</Label>
                  <Select 
                    value={proposal.authorization.guardianPillar}
                    onValueChange={(value) => setProposal(prev => ({
                      ...prev,
                      authorization: { ...prev.authorization, guardianPillar: value }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Select guardian pillar" />
                    </SelectTrigger>
                    <SelectContent>
                      {guardianPillars.map(pillar => (
                        <SelectItem key={pillar.code} value={pillar.code}>
                          {pillar.icon} {pillar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-200">Verification Status</Label>
                  <div className="flex items-center gap-2">
                    {proposal.authorization.verificationStatus === 'pending' && (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                    {proposal.authorization.verificationStatus === 'verified' && (
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {proposal.authorization.verificationStatus === 'failed' && (
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Verification Failed
                      </Badge>
                    )}
                  </div>
                </div>
                
                {zkpVerificationProgress > 0 && zkpVerificationProgress < 100 && (
                  <div className="space-y-2">
                    <Label className="text-slate-200">ZKP Verification Progress</Label>
                    <Progress value={zkpVerificationProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generated Hashes Section */}
          {(proposal.intentHash || proposal.cidBinding || proposal.authorization.zkpHash) && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex items-center gap-2 text-lg font-medium text-slate-200">
                <Hash className="h-5 w-5 text-cyan-400" />
                Generated Verification Data
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proposal.intentHash && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <Label className="text-slate-300">Intent Hash</Label>
                    <div className="text-xs text-cyan-400 font-mono break-all">
                      {proposal.intentHash}
                    </div>
                  </div>
                )}
                
                {proposal.authorization.zkpHash && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <Label className="text-slate-300">ZKP Hash</Label>
                    <div className="text-xs text-purple-400 font-mono break-all">
                      {proposal.authorization.zkpHash}
                    </div>
                  </div>
                )}
                
                {proposal.cidBinding && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <Label className="text-slate-300">CID Binding</Label>
                    <div className="text-xs text-green-400 font-mono break-all">
                      {proposal.cidBinding}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-900/50 rounded-lg p-4 border border-red-700">
              <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                <AlertTriangle className="h-4 w-4" />
                Validation Errors
              </div>
              <ul className="list-disc list-inside space-y-1 text-red-300">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submission Status */}
          {proposal.submissionStatus === 'submitted' && (
            <div className="bg-green-900/50 rounded-lg p-4 border border-green-700">
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <CheckCircle className="h-4 w-4" />
                Proposal Successfully Submitted
              </div>
              <div className="text-green-300 text-sm mt-2">
                Your federation proposal has been submitted and is now available for review by Genesis Badgeholders.
                CID: {proposal.cidBinding}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-700">
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-slate-600 text-slate-200"
              disabled={isSubmitting}
            >
              Reset Form
            </Button>

            <Button
              onClick={submitProposal}
              disabled={isSubmitting || proposal.submissionStatus === 'submitted'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Vote className="h-4 w-4 mr-2" />
                  Submit Proposal
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FederationProposalSubmit;