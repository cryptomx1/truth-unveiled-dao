// Phase V: Local Save Layer for Path B fallback storage
// Commander Mark authorization via JASMY Relay - Step 2 implementation
export class LocalSaveLayer {
    STORAGE_KEY = 'truthunveiled_vault_history';
    MAX_RETRY_COUNT = 3;
    constructor() {
        this.initializeVault();
    }
    // Initialize vault history in localStorage
    initializeVault() {
        const existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            const initialHistory = {
                proposals: [],
                lastSync: new Date().toISOString(),
                pathBActivations: 0,
                totalRetries: 0
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialHistory));
            console.log('✅ LocalSaveLayer: Vault history initialized');
        }
    }
    // Save proposal to local vault (Path B fallback)
    saveProposal(proposal, pathBActivated = false) {
        try {
            const history = this.getVaultHistory();
            const localProposal = {
                ...proposal,
                localSaveTimestamp: new Date().toISOString(),
                retryCount: 0,
                pathBActivated
            };
            history.proposals.push(localProposal);
            history.lastSync = new Date().toISOString();
            if (pathBActivated) {
                history.pathBActivations++;
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
            console.log(`✅ LocalSaveLayer: Proposal saved locally - ${proposal.id}`);
            if (pathBActivated) {
                console.warn('⚠️ LocalSaveLayer: Path B activated for proposal fallback');
            }
        }
        catch (error) {
            console.error('❌ LocalSaveLayer: Failed to save proposal locally:', error);
        }
    }
    // Log successful upload to vault history
    logSuccessfulUpload(proposalId, ipfsHash) {
        try {
            const history = this.getVaultHistory();
            const proposal = history.proposals.find(p => p.id === proposalId);
            if (proposal) {
                proposal.status = 'uploaded';
                proposal.ipfsHash = ipfsHash;
                history.lastSync = new Date().toISOString();
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
                console.log(`✅ LocalSaveLayer: Upload success logged for ${proposalId}`);
            }
        }
        catch (error) {
            console.error('❌ LocalSaveLayer: Failed to log upload success:', error);
        }
    }
    // Get failed proposals for retry
    getFailedProposals() {
        try {
            const history = this.getVaultHistory();
            return history.proposals.filter(p => p.status === 'failed' &&
                p.retryCount < this.MAX_RETRY_COUNT);
        }
        catch (error) {
            console.error('❌ LocalSaveLayer: Failed to get failed proposals:', error);
            return [];
        }
    }
    // Update retry count for proposal
    updateRetryCount(proposalId) {
        try {
            const history = this.getVaultHistory();
            const proposal = history.proposals.find(p => p.id === proposalId);
            if (proposal) {
                proposal.retryCount++;
                history.totalRetries++;
                history.lastSync = new Date().toISOString();
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
                console.log(`✅ LocalSaveLayer: Retry count updated for ${proposalId} (${proposal.retryCount}/${this.MAX_RETRY_COUNT})`);
            }
        }
        catch (error) {
            console.error('❌ LocalSaveLayer: Failed to update retry count:', error);
        }
    }
    // Get vault history from localStorage
    getVaultHistory() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        }
        catch (error) {
            console.error('❌ LocalSaveLayer: Failed to parse vault history:', error);
        }
        // Return default if parsing fails
        return {
            proposals: [],
            lastSync: new Date().toISOString(),
            pathBActivations: 0,
            totalRetries: 0
        };
    }
    // Get vault statistics
    getVaultStats() {
        const history = this.getVaultHistory();
        return {
            totalProposals: history.proposals.length,
            pendingProposals: history.proposals.filter(p => p.status === 'pending').length,
            uploadedProposals: history.proposals.filter(p => p.status === 'uploaded').length,
            failedProposals: history.proposals.filter(p => p.status === 'failed').length,
            pathBActivations: history.pathBActivations,
            totalRetries: history.totalRetries,
            lastSync: history.lastSync
        };
    }
    // Clear vault history (for testing/reset)
    clearVault() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            this.initializeVault();
            console.log('✅ LocalSaveLayer: Vault history cleared and reinitialized');
        }
        catch (error) {
            console.error('❌ LocalSaveLayer: Failed to clear vault:', error);
        }
    }
    // Export vault data as JSON
    exportVaultData() {
        const history = this.getVaultHistory();
        return JSON.stringify(history, null, 2);
    }
}
