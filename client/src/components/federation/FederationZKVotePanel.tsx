/**
 * FederationZKVotePanel.tsx - Phase X-FED Step 2
 * 
 * Encrypted voting interface with TP-weighted consensus visibility
 * Anonymous ballot confirmation with cryptographic proof
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-FED Global Federation DAO Framework - Step 2
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, Lock, Shield, CheckCircle, AlertTriangle, Users, TrendingUp, Eye, EyeOff } from 'lucide-react';

interface VoteOption {
  id: string;
  label: string;
  description: string;
  color: string;
}

interface VoterProfile {
  did: string;
  tier: string;
  truthPoints: number;
  votingWeight: number;
  reputation: number;
}

interface EncryptedBallot {
  ballotId: string;
  encryptedVote: string;
  zkpProof: string;
  timestamp: string;
  voterWeight: number;
  verified: boolean;
}

interface ConsensusData {
  totalVotes: number;
  totalWeight: number;
  weightedConsensus: { [key: string]: number };
  unweightedConsensus: { [key: string]: number };
  quorumMet: boolean;
  confidenceLevel: number;
}

const FederationZKVotePanel: React.FC<{ proposalId?: string }> = ({ proposalId = 'fed_prop_001' }) => {
  const [voteOptions] = useState<VoteOption[]>([
    {
      id: 'approve',
      label: 'Approve',
      description: 'Support the proposal as presented',
      color: 'green'
    },
    {
      id: 'approve_with_changes',
      label: 'Approve with Changes',
      description: 'Support with recommended modifications',
      color: 'yellow'
    },
    {
      id: 'reject',
      label: 'Reject',
      description: 'Oppose the proposal',
      color: 'red'
    },
    {
      id: 'abstain',
      label: 'Abstain',
      description: 'Neutral stance or conflict of interest',
      color: 'gray'
    }
  ]);

  const [voterProfile] = useState<VoterProfile>({
    did: 'did:genesis:current_voter',
    tier: 'Governor',
    truthPoints: 1247,
    votingWeight: 2.3,
    reputation: 734
  });

  const [selectedVote, setSelectedVote] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [showProofs, setShowProofs] = useState(false);
  
  const [submittedBallot, setSubmittedBallot] = useState<EncryptedBallot | null>(null);
  
  const [consensusData, setConsensusData] = useState<ConsensusData>({
    totalVotes: 47,
    totalWeight: 89.7,
    weightedConsensus: {
      approve: 42.1,
      approve_with_changes: 28.6,
      reject: 19.8,
      abstain: 9.5
    },
    unweightedConsensus: {
      approve: 38.3,
      approve_with_changes: 31.9,
      reject: 21.3,
      abstain: 8.5
    },
    quorumMet: true,
    confidenceLevel: 87
  });

  const [recentBallots, setRecentBallots] = useState<EncryptedBallot[]>([
    {
      ballotId: 'ballot_001',
      encryptedVote: 'enc_7f4e2a1b9c8d5e3f',
      zkpProof: 'zkp_a1b2c3d4e5f6g7h8',
      timestamp: '2025-07-24T10:15:00Z',
      voterWeight: 3.2,
      verified: true
    },
    {
      ballotId: 'ballot_002',
      encryptedVote: 'enc_9a8b7c6d5e4f3g2h',
      zkpProof: 'zkp_h8g7f6e5d4c3b2a1',
      timestamp: '2025-07-24T10:12:00Z',
      voterWeight: 1.8,
      verified: true
    },
    {
      ballotId: 'ballot_003',
      encryptedVote: 'enc_3e4f5g6h7i8j9k0l',
      zkpProof: 'zkp_l0k9j8i7h6g5f4e3',
      timestamp: '2025-07-24T10:08:00Z',
      voterWeight: 2.1,
      verified: true
    }
  ]);

  // Simulate real-time vote updates
  useEffect(() => {
    if (voteSubmitted) return;
    
    const interval = setInterval(() => {
      setConsensusData(prev => {
        const fluctuation = (Math.random() - 0.5) * 2;
        const newTotal = prev.totalVotes + (Math.random() < 0.3 ? 1 : 0);
        
        // Small adjustments to consensus
        const adjustedWeighted = { ...prev.weightedConsensus };
        Object.keys(adjustedWeighted).forEach(key => {
          adjustedWeighted[key] = Math.max(0, Math.min(100, adjustedWeighted[key] + fluctuation));
        });
        
        // Normalize to 100%
        const total = Object.values(adjustedWeighted).reduce((sum, val) => sum + val, 0);
        Object.keys(adjustedWeighted).forEach(key => {
          adjustedWeighted[key] = (adjustedWeighted[key] / total) * 100;
        });
        
        return {
          ...prev,
          totalVotes: newTotal,
          totalWeight: prev.totalWeight + (newTotal > prev.totalVotes ? Math.random() * 3 : 0),
          weightedConsensus: adjustedWeighted,
          confidenceLevel: Math.min(95, prev.confidenceLevel + (Math.random() - 0.5))
        };
      });
    }, 20000); // Update every 20 seconds

    return () => clearInterval(interval);
  }, [voteSubmitted]);

  const generateEncryptedVote = async (vote: string): Promise<string> => {
    // Mock encryption - in production this would use actual encryption libraries
    const voteData = {
      vote,
      voterDID: voterProfile.did,
      timestamp: Date.now(),
      nonce: Math.random().toString(36)
    };
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(voteData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return `enc_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)}`;
  };

  const generateZKPProof = async (encryptedVote: string): Promise<string> => {
    // Mock ZKP generation - in production this would use ZKP libraries
    const proofData = {
      encryptedVote,
      voterTier: voterProfile.tier,
      votingWeight: voterProfile.votingWeight,
      timestamp: Date.now()
    };
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(proofData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return `zkp_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)}`;
  };

  const submitVote = async () => {
    if (!selectedVote) return;
    
    setIsVoting(true);
    setEncryptionProgress(0);
    
    try {
      console.log('🗳️ Starting ZKP-encrypted vote submission...');
      
      // Step 1: Encrypt vote
      setEncryptionProgress(25);
      const encryptedVote = await generateEncryptedVote(selectedVote);
      console.log(`🔐 Vote encrypted: ${encryptedVote}`);
      
      // Step 2: Generate ZKP proof
      setEncryptionProgress(50);
      const zkpProof = await generateZKPProof(encryptedVote);
      console.log(`🔒 ZKP proof generated: ${zkpProof}`);
      
      // Step 3: Submit to federation network
      setEncryptionProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Verify and confirm
      setEncryptionProgress(100);
      const ballotId = `ballot_${Date.now()}`;
      
      const newBallot: EncryptedBallot = {
        ballotId,
        encryptedVote,
        zkpProof,
        timestamp: new Date().toISOString(),
        voterWeight: voterProfile.votingWeight,
        verified: true
      };
      
      setSubmittedBallot(newBallot);
      setRecentBallots(prev => [newBallot, ...prev.slice(0, 9)]); // Keep last 10
      setVoteSubmitted(true);
      
      // Update consensus data
      setConsensusData(prev => {
        const newTotal = prev.totalVotes + 1;
        const newTotalWeight = prev.totalWeight + voterProfile.votingWeight;
        
        const updatedWeighted = { ...prev.weightedConsensus };
        const currentWeight = updatedWeighted[selectedVote] || 0;
        const newWeight = ((currentWeight * prev.totalWeight) + (voterProfile.votingWeight * 100)) / newTotalWeight;
        updatedWeighted[selectedVote] = newWeight;
        
        // Adjust other options proportionally
        const remainingWeight = 100 - newWeight;
        const otherTotal = Object.keys(updatedWeighted)
          .filter(key => key !== selectedVote)
          .reduce((sum, key) => sum + updatedWeighted[key], 0);
        
        Object.keys(updatedWeighted).forEach(key => {
          if (key !== selectedVote) {
            updatedWeighted[key] = (updatedWeighted[key] / otherTotal) * remainingWeight;
          }
        });
        
        return {
          ...prev,
          totalVotes: newTotal,
          totalWeight: newTotalWeight,
          weightedConsensus: updatedWeighted,
          confidenceLevel: Math.min(95, prev.confidenceLevel + 2)
        };
      });
      
      console.log('✅ ZKP vote submitted successfully');
      
    } catch (error) {
      console.error('❌ Vote submission failed:', error);
    } finally {
      setIsVoting(false);
      setEncryptionProgress(0);
    }
  };

  const getOptionColor = (optionId: string) => {
    const option = voteOptions.find(opt => opt.id === optionId);
    switch (option?.color) {
      case 'green': return 'text-green-400 border-green-400';
      case 'yellow': return 'text-yellow-400 border-yellow-400';
      case 'red': return 'text-red-400 border-red-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Voter Profile & Vote Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-100">
              <Users className="h-5 w-5 text-purple-400" />
              Voter Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Tier</span>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  {voterProfile.tier}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Truth Points</span>
                <span className="text-slate-200">{voterProfile.truthPoints.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Voting Weight</span>
                <span className="text-cyan-400 font-bold">{voterProfile.votingWeight}x</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Reputation</span>
                <span className="text-slate-200">{voterProfile.reputation}</span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-300 text-sm">
                DID: {voterProfile.did.split(':').pop()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-100">
                <Vote className="h-6 w-6 text-blue-400" />
                Cast Your ZKP-Encrypted Vote
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  Phase X-FED Step 2
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {!voteSubmitted ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {voteOptions.map(option => (
                      <Button
                        key={option.id}
                        variant={selectedVote === option.id ? 'default' : 'outline'}
                        onClick={() => setSelectedVote(option.id)}
                        className={`h-auto p-4 text-left ${
                          selectedVote === option.id
                            ? `bg-${option.color}-600 hover:bg-${option.color}-700`
                            : 'border-slate-600 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm opacity-75">{option.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {encryptionProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">ZKP Encryption Progress</span>
                        <span className="text-slate-200">{encryptionProgress}%</span>
                      </div>
                      <Progress value={encryptionProgress} className="h-2" />
                    </div>
                  )}
                  
                  <Button
                    onClick={submitVote}
                    disabled={!selectedVote || isVoting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isVoting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Encrypting & Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Submit Encrypted Vote
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="bg-green-900/50 rounded-lg p-6 border border-green-700">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <div>
                      <div className="text-green-400 font-medium">Vote Successfully Submitted</div>
                      <div className="text-green-300 text-sm">Your encrypted ballot has been verified and recorded</div>
                    </div>
                  </div>
                  
                  {submittedBallot && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ballot ID</span>
                        <span className="text-slate-200 font-mono">{submittedBallot.ballotId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Encrypted Vote</span>
                        <span className="text-cyan-400 font-mono">{submittedBallot.encryptedVote}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ZKP Proof</span>
                        <span className="text-purple-400 font-mono">{submittedBallot.zkpProof}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Consensus Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-100">
              <TrendingUp className="h-5 w-5 text-green-400" />
              TP-Weighted Consensus
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-200">
                {consensusData.totalVotes} Votes
              </div>
              <div className="text-slate-400">
                {consensusData.totalWeight.toFixed(1)} Total Weight
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {consensusData.quorumMet ? (
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Quorum Met
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Quorum Pending
                  </Badge>
                )}
                <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                  {consensusData.confidenceLevel.toFixed(1)}% Confidence
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              {voteOptions.map(option => {
                const percentage = consensusData.weightedConsensus[option.id] || 0;
                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`${getOptionColor(option.id)} font-medium`}>
                        {option.label}
                      </span>
                      <span className="text-slate-200">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${option.color === 'green' ? 'bg-green-200' : 
                                        option.color === 'yellow' ? 'bg-yellow-200' :
                                        option.color === 'red' ? 'bg-red-200' : 'bg-slate-200'}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-100">
              <Lock className="h-5 w-5 text-orange-400" />
              Recent Encrypted Ballots
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">
                  {recentBallots.length} Recent Ballots
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProofs(!showProofs)}
                  className="border-slate-600 text-slate-200"
                >
                  {showProofs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showProofs ? 'Hide' : 'Show'} Proofs
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentBallots.map((ballot, index) => (
                  <div key={ballot.ballotId} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-slate-200 text-sm font-mono">
                        {ballot.ballotId}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400">
                          {ballot.voterWeight}x
                        </Badge>
                        {ballot.verified && (
                          <Shield className="h-3 w-3 text-green-400" title="ZKP Verified" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Encrypted Vote:</span>
                        <span className="text-cyan-400 font-mono">{ballot.encryptedVote}</span>
                      </div>
                      
                      {showProofs && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">ZKP Proof:</span>
                          <span className="text-purple-400 font-mono">{ballot.zkpProof}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Submitted:</span>
                        <span className="text-slate-300">{formatTimeAgo(ballot.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FederationZKVotePanel;