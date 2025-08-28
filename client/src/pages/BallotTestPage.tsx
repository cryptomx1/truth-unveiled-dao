/**
 * BallotTestPage.tsx - Phase XXVII Step 2 Testing
 * Test Interface for VerifiableBallotCard Component
 * Authority: Commander Mark via JASMY Relay
 */

import React, { useState } from 'react';
import { VerifiableBallotCard } from '@/components/ballot/VerifiableBallotCard';
import { type VoteSubmissionResult } from '@/components/ballot/VerifiableBallotCard';

const BallotTestPage: React.FC = () => {
  const [submissionResults, setSubmissionResults] = useState<VoteSubmissionResult[]>([]);
  
  // Mock ballot options
  const mockBallotOptions = [
    {
      id: 'support',
      label: 'Support',
      description: 'Vote in favor of the proposal',
      color: 'green'
    },
    {
      id: 'oppose',
      label: 'Oppose', 
      description: 'Vote against the proposal',
      color: 'red'
    },
    {
      id: 'abstain',
      label: 'Abstain',
      description: 'Choose not to vote on this proposal',
      color: 'gray'
    }
  ];
  
  // Handle vote submission
  const handleVoteSubmitted = (result: VoteSubmissionResult) => {
    setSubmissionResults(prev => [result, ...prev]);
    console.log('📊 Vote submission received on test page:', result);
  };
  
  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-200 mb-2">
              Verifiable Ballot Test Interface
            </h1>
            <p className="text-slate-400">
              Phase XXVII Step 2 - ZK-Eligible Voting System Testing
            </p>
          </div>
          
          {/* Ballot Card */}
          <VerifiableBallotCard
            ballotId="test-ballot-001"
            ballotTitle="Test Civic Proposal: Community Resource Allocation"
            ballotOptions={mockBallotOptions}
            minimumTier="Citizen"
            minimumTrustScore={50}
            timeToLiveMinutes={10}
            allowVaultDerivation={true}
            onVoteSubmitted={handleVoteSubmitted}
            userHash="user-did:civic:commander-mark"
          />
          
          {/* Submission History */}
          {submissionResults.length > 0 && (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">
                Vote Submission History
              </h2>
              
              <div className="space-y-4">
                {submissionResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-900/20 border-green-600' 
                        : 'bg-red-900/20 border-red-600'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-300 font-medium mb-2">Submission Details</div>
                        <div className="space-y-1">
                          <div>
                            <span className="text-slate-400">Status:</span>
                            <span className={`ml-2 font-medium ${
                              result.success ? 'text-green-300' : 'text-red-300'
                            }`}>
                              {result.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Choice:</span>
                            <span className="text-slate-300 ml-2">{result.voteChoice}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Weight:</span>
                            <span className="text-slate-300 ml-2">{result.multiplier}x</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Timestamp:</span>
                            <span className="text-slate-300 ml-2 text-xs">
                              {new Date(result.submissionTimestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-slate-300 font-medium mb-2">Technical Details</div>
                        <div className="space-y-1">
                          <div>
                            <span className="text-slate-400">CID:</span>
                            <span className="text-slate-300 ml-2 font-mono text-xs">
                              {result.cidDigest.length > 20 ? 
                                result.cidDigest.substring(0, 20) + '...' : 
                                result.cidDigest
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Payload:</span>
                            <span className="text-slate-300 ml-2 font-mono text-xs">
                              {result.encryptedPayload.length > 20 ? 
                                result.encryptedPayload.substring(0, 20) + '...' : 
                                result.encryptedPayload
                              }
                            </span>
                          </div>
                          {result.error && (
                            <div>
                              <span className="text-red-400">Error:</span>
                              <span className="text-red-300 ml-2 text-xs">{result.error}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">
              Testing Instructions
            </h2>
            
            <div className="space-y-4 text-sm text-slate-400">
              <div>
                <h3 className="text-slate-300 font-medium mb-2">Test Scenarios:</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Initial vault-based eligibility check</li>
                  <li>• Upload .zkp-rep.json bundle for verification</li>
                  <li>• Select ballot option and submit encrypted vote</li>
                  <li>• Observe weighted vote multiplier application</li>
                  <li>• Monitor time-to-live countdown</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-slate-300 font-medium mb-2">Expected Console Output:</h3>
                <div className="bg-slate-900 p-3 rounded border font-mono text-xs">
                  🔐 Ballot Eligibility: ELIGIBLE — CID: [hash] | Tier: [tier] | Trust: [score] | Multiplier: [x]x<br/>
                  🗳️ Ballot Submitted — CID: [hash] | Vote: [choice] | Multiplier: [x]x | EncryptedPayload: [digest]
                </div>
              </div>
              
              <div>
                <h3 className="text-slate-300 font-medium mb-2">Security Features:</h3>
                <ul className="space-y-1 ml-4">
                  <li>• ZKP privacy protection (no DID exposure)</li>
                  <li>• Encrypted ballot payload generation</li>
                  <li>• Tier-based weighted voting multipliers</li>
                  <li>• Epoch freshness validation</li>
                  <li>• Integrity verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallotTestPage;