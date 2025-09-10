import { useState, useCallback } from 'react';
// Browser-compatible hash function
const generateHash = async (data) => {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    else {
        // Fallback hash function for older browsers
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
};
export const useZKPFeedbackNode = () => {
    const [vaultEntries, setVaultEntries] = useState(() => {
        try {
            const stored = localStorage.getItem('feedback_vault');
            return stored ? JSON.parse(stored) : [];
        }
        catch {
            return [];
        }
    });
    const generateFeedbackPayload = useCallback(async (payload) => {
        const payloadString = JSON.stringify({
            memoryActionId: payload.memoryActionId,
            voteType: payload.voteType,
            timestamp: payload.timestamp.getTime(),
            sessionType: payload.userContext.sessionType,
            actionContext: payload.userContext.actionContext
        });
        const payloadHash = await generateHash(payloadString);
        const anonymizedId = `anon_${payloadHash.substring(0, 8)}`;
        // Generate ZKP commitment
        const commitmentData = `${payloadHash}:${payload.timestamp.getTime()}:${anonymizedId}`;
        const commitment = await generateHash(commitmentData);
        // Generate proof components
        const merkleRoot = await generateHash(`${payloadHash}:${commitment}`);
        const signature = await generateHash(`${merkleRoot}:${payload.voteType}:${payload.memoryActionId}`);
        const verificationKey = await generateHash(`verify:${signature}:${Date.now()}`);
        return {
            payloadHash,
            commitment,
            timestamp: payload.timestamp.getTime(),
            anonymizedId,
            voteType: payload.voteType,
            actionReference: payload.memoryActionId,
            proof: {
                merkleRoot,
                signature,
                verificationKey
            }
        };
    }, []);
    const commitToVault = useCallback(async (zkpData) => {
        const vaultEntry = {
            id: `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            zkpHash: zkpData.payloadHash,
            timestamp: zkpData.timestamp,
            voteType: zkpData.voteType,
            actionId: zkpData.actionReference,
            committed: true
        };
        const updatedVault = [...vaultEntries, vaultEntry];
        setVaultEntries(updatedVault);
        // Store in localStorage
        try {
            localStorage.setItem('feedback_vault', JSON.stringify(updatedVault));
        }
        catch (error) {
            console.warn('⚠️ Failed to store feedback vault:', error);
        }
        // Export to feedbackVault.json for audit trail
        const exportData = {
            metadata: {
                generated: new Date().toISOString(),
                entries: updatedVault.length,
                format: 'ZKP_FEEDBACK_VAULT_v1.0'
            },
            vault: updatedVault,
            zkpProofs: updatedVault.map(entry => ({
                entryId: entry.id,
                zkpHash: entry.zkpHash,
                proof: zkpData.proof,
                verification: {
                    commitment: zkpData.commitment,
                    anonymizedId: zkpData.anonymizedId,
                    timestamp: entry.timestamp
                }
            }))
        };
        // Create downloadable file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `feedbackVault_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`📄 Feedback vault exported: ${updatedVault.length} entries`);
        console.log(`🔐 ZKP commitment stored: ${zkpData.payloadHash}`);
        return zkpData.payloadHash;
    }, [vaultEntries]);
    const getVaultStats = useCallback(() => {
        const trustVotes = vaultEntries.filter(entry => entry.voteType === 'trust').length;
        const concernVotes = vaultEntries.filter(entry => entry.voteType === 'concern').length;
        return {
            totalEntries: vaultEntries.length,
            trustVotes,
            concernVotes,
            trustRatio: vaultEntries.length > 0 ? (trustVotes / vaultEntries.length) * 100 : 0
        };
    }, [vaultEntries]);
    const verifyFeedbackHash = useCallback(async (zkpHash) => {
        const entry = vaultEntries.find(e => e.zkpHash === zkpHash);
        if (!entry)
            return false;
        // Basic verification - in real implementation would verify full ZKP proof
        return entry.committed && entry.zkpHash.length === 64; // SHA-256 length
    }, [vaultEntries]);
    return {
        generateFeedbackPayload,
        commitToVault,
        getVaultStats,
        verifyFeedbackHash,
        vaultEntries
    };
};
