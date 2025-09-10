/**
 * ZKPUserMintExtension.tsx
 * Phase XXVIII Step 2 - User-Facing Frontend for TruthCoin Pillar Mint Requests
 * Authority: Commander Mark via JASMY Relay
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TPVaultVerifier } from '@/services/TPVaultVerifier';
var TruthCoinPillar;
(function (TruthCoinPillar) {
    TruthCoinPillar["GOVERNANCE"] = "GOVERNANCE";
    TruthCoinPillar["EDUCATION"] = "EDUCATION";
    TruthCoinPillar["HEALTH"] = "HEALTH";
    TruthCoinPillar["CULTURE"] = "CULTURE";
    TruthCoinPillar["PEACE"] = "PEACE";
    TruthCoinPillar["SCIENCE"] = "SCIENCE";
    TruthCoinPillar["JOURNALISM"] = "JOURNALISM";
    TruthCoinPillar["JUSTICE"] = "JUSTICE";
})(TruthCoinPillar || (TruthCoinPillar = {}));
const ZKPUserMintExtension = () => {
    const [selectedPillar, setSelectedPillar] = useState(null);
    const [mintRequests, setMintRequests] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userDID] = useState('did:civic:user_' + Math.random().toString(36).substr(2, 9));
    const [vaultStatus, setVaultStatus] = useState(null);
    const [verifyingTP, setVerifyingTP] = useState(false);
    useEffect(() => {
        // Load existing mint requests and verify TP eligibility on mount
        loadMintHistory();
        verifyTPEligibility();
        // ARIA announcement for component ready
        setTimeout(() => {
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance('Mint request interface ready');
                utterance.rate = 0.8;
                utterance.volume = 0.3;
                window.speechSynthesis.speak(utterance);
            }
        }, 500);
    }, []);
    const verifyTPEligibility = async () => {
        setVerifyingTP(true);
        console.log('🔍 ZKPUserMintExtension: Verifying TP eligibility...');
        try {
            const result = await TPVaultVerifier.verifyUserEligibility(userDID);
            setVaultStatus(result);
            TPVaultVerifier.logVerificationAttempt(userDID, result);
            console.log(`✅ TP Verification: ${result.userStatus.fusionEligible ? 'ELIGIBLE' : 'INSUFFICIENT'}`);
        }
        catch (error) {
            console.error('❌ TP Verification failed:', error);
        }
        finally {
            setVerifyingTP(false);
        }
    };
    const loadMintHistory = () => {
        // Simulate loading existing mint requests
        const mockRequests = [
            {
                id: 'req_' + Date.now(),
                pillar: TruthCoinPillar.GOVERNANCE,
                zkpHash: '0x' + Math.random().toString(16).substr(2, 40),
                status: 'completed',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                requesterDID: userDID
            }
        ];
        setMintRequests(mockRequests);
    };
    const handleRequest = async () => {
        if (!selectedPillar) {
            console.log('⚠️ No pillar selected for mint request');
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance('Please select a pillar before submitting mint request');
                utterance.rate = 0.8;
                utterance.volume = 0.4;
                window.speechSynthesis.speak(utterance);
            }
            return;
        }
        // Check TP eligibility before proceeding
        if (!vaultStatus?.userStatus.fusionEligible) {
            console.log('❌ Insufficient TP for mint request');
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance('Insufficient Truth Points. Complete more civic activities.');
                utterance.rate = 0.8;
                utterance.volume = 0.4;
                window.speechSynthesis.speak(utterance);
            }
            // Redirect to onboarding
            window.location.href = '/fusion/onboarding';
            return;
        }
        console.log('🔐 Mint request initiated');
        setIsProcessing(true);
        // ARIA announcement
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('Mint request initiated');
            utterance.rate = 0.8;
            utterance.volume = 0.4;
            window.speechSynthesis.speak(utterance);
        }
        try {
            // Generate ZKP hash for the request
            const zkpHash = generateZKPHash(selectedPillar, userDID);
            // Create mint request
            const mintRequest = {
                id: 'req_' + Date.now(),
                pillar: selectedPillar,
                zkpHash,
                status: 'pending',
                timestamp: new Date().toISOString(),
                requesterDID: userDID
            };
            // Simulate contract interaction
            await simulateContractRequest(mintRequest);
            // Add to request history
            setMintRequests(prev => [mintRequest, ...prev]);
            console.log(`✅ Mint request submitted for ${selectedPillar} pillar`);
            console.log(`📋 Request ID: ${mintRequest.id}`);
            console.log(`🔐 ZKP Hash: ${zkpHash}`);
            // Generate and download .pillar-request.json file
            await exportPillarRequestJSON(mintRequest);
            // Reset selection
            setSelectedPillar(null);
        }
        catch (error) {
            console.error('❌ Mint request failed:', error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const generateZKPHash = (pillar, did) => {
        // Simulate ZKP hash generation
        const content = `${pillar}_${did}_${Date.now()}`;
        return '0x' + btoa(content).replace(/[^a-zA-Z0-9]/g, '').substr(0, 40).toLowerCase();
    };
    const exportPillarRequestJSON = async (request) => {
        const exportData = {
            requestId: request.id,
            pillar: request.pillar,
            requesterDID: request.requesterDID,
            timestamp: request.timestamp,
            zkpHash: request.zkpHash,
            metadata: {
                truthPoints: vaultStatus?.userStatus.truthPoints || 0,
                civicTier: vaultStatus?.userStatus.civicTier || 'Unknown',
                completedPillars: vaultStatus?.userStatus.completedPillars || 0,
                verificationStatus: vaultStatus?.userStatus.verificationStatus || 'unknown'
            }
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${request.pillar.toLowerCase()}-pillar-request.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`📤 Pillar request JSON exported: ${link.download}`);
    };
    const simulateContractRequest = async (request) => {
        // Simulate contract call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Update request status to processing
        setMintRequests(prev => prev.map(req => req.id === request.id
            ? { ...req, status: 'processing' }
            : req));
        // Simulate processing completion
        setTimeout(() => {
            setMintRequests(prev => prev.map(req => req.id === request.id
                ? { ...req, status: Math.random() > 0.1 ? 'completed' : 'failed' }
                : req));
        }, 3000);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'processing': return 'bg-blue-500 animate-pulse';
            case 'completed': return 'bg-green-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    const getPillarIcon = (pillar) => {
        const icons = {
            [TruthCoinPillar.GOVERNANCE]: '⚖️',
            [TruthCoinPillar.EDUCATION]: '📚',
            [TruthCoinPillar.HEALTH]: '🏥',
            [TruthCoinPillar.CULTURE]: '🎭',
            [TruthCoinPillar.PEACE]: '🕊️',
            [TruthCoinPillar.SCIENCE]: '🔬',
            [TruthCoinPillar.JOURNALISM]: '📰',
            [TruthCoinPillar.JUSTICE]: '⚖️'
        };
        return icons[pillar] || '🏛️';
    };
    return (<div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 ZKP TruthCoin Mint Request
          </CardTitle>
          <CardDescription>
            Submit zero-knowledge proof validated requests for TruthCoin pillar minting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* DID Display */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-sm text-slate-600 dark:text-slate-400">Your DID</div>
            <div className="font-mono text-sm">{userDID}</div>
          </div>

          {/* Pillar Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Pillar</label>
            <Select value={selectedPillar || ''} onValueChange={(value) => setSelectedPillar(value)}>
              <SelectTrigger className="min-h-[48px]">
                <SelectValue placeholder="Choose a TruthCoin pillar to mint"/>
              </SelectTrigger>
              <SelectContent>
                {Object.values(TruthCoinPillar).map(pillar => (<SelectItem key={pillar} value={pillar}>
                    <div className="flex items-center gap-2">
                      <span>{getPillarIcon(pillar)}</span>
                      <span>{pillar}</span>
                    </div>
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Request Button */}
          <Button onClick={handleRequest} disabled={!selectedPillar || isProcessing} className="w-full min-h-[48px]" size="lg">
            {isProcessing ? (<div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Processing Request...
              </div>) : ('Request Mint')}
          </Button>
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Mint Request History</CardTitle>
          <CardDescription>
            Track your submitted TruthCoin mint requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mintRequests.length === 0 ? (<div className="text-center py-8 text-slate-500">
              No mint requests submitted yet
            </div>) : (<div className="space-y-3">
              {mintRequests.map(request => (<div key={request.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getPillarIcon(request.pillar)}</span>
                      <span className="font-medium">{request.pillar}</span>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Request ID: {request.id}
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    ZKP: {request.zkpHash}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(request.timestamp).toLocaleString()}
                  </div>
                  {request.status === 'processing' && (<Progress value={66} className="h-2"/>)}
                </div>))}
            </div>)}
        </CardContent>
      </Card>
    </div>);
};
export default ZKPUserMintExtension;
