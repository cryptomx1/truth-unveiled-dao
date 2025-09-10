// Phase V: Governance Sync Layer for proposal persistence to IPFS
// Commander Mark authorization via JASMY Relay - Step 2 implementation
export class GovernanceSyncLayer {
    apiKey = '';
    apiSecret = '';
    metrics = {
        totalProposals: 0,
        successfulUploads: 0,
        failedUploads: 0,
        successRate: 100,
        pathBTriggered: false
    };
    pathBThreshold = 10; // 10% failure rate triggers Path B
    constructor() {
        this.loadCredentials();
    }
    // Load Piñata credentials from server endpoint
    async loadCredentials() {
        try {
            const response = await fetch('/api/env-config');
            if (response.ok) {
                const config = await response.json();
                this.apiKey = config.PINATA_API_KEY || '';
                this.apiSecret = config.PINATA_SECRET_KEY || '';
                if (this.apiKey && this.apiSecret) {
                    console.log('✅ GovernanceSyncLayer: Piñata credentials loaded');
                }
                else {
                    console.warn('⚠️ GovernanceSyncLayer: Operating in simulation mode');
                }
            }
        }
        catch (error) {
            console.warn('⚠️ GovernanceSyncLayer: Error loading credentials:', error);
        }
    }
    // Generate ZKP hash for proposal integrity
    generateZKPHash(proposal) {
        const content = `${proposal.title}${proposal.description}${proposal.tag}${proposal.submitterDID}`;
        const hash = this.hashString(content);
        return `0x${hash.substring(0, 24)}`;
    }
    // Simple hash generation for ZKP simulation
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).padStart(24, '0');
    }
    // Upload proposal to IPFS via Piñata
    async uploadProposal(proposal) {
        this.metrics.totalProposals++;
        // Simulate 10% failure rate for Path B testing
        const simulateFailure = Math.random() < 0.1;
        if (!this.apiKey || !this.apiSecret || simulateFailure) {
            this.metrics.failedUploads++;
            this.updateMetrics();
            if (simulateFailure) {
                console.warn('⚠️ GovernanceSyncLayer: Simulated upload failure for Path B testing');
            }
            return {
                success: false,
                error: simulateFailure ? 'Simulated failure for Path B testing' : 'No credentials available'
            };
        }
        try {
            // Prepare proposal data for IPFS upload
            const proposalData = {
                ...proposal,
                projectTag: 'TruthUnveiledDAO-Phase5-Governance',
                uploadTimestamp: new Date().toISOString()
            };
            const formData = new FormData();
            const proposalBlob = new Blob([JSON.stringify(proposalData, null, 2)], {
                type: 'application/json'
            });
            formData.append('file', proposalBlob, `proposal-${proposal.id}.json`);
            // Add Piñata metadata
            const metadata = {
                name: `Proposal: ${proposal.title}`,
                keyvalues: {
                    project: 'TruthUnveiledDAO',
                    phase: 'V',
                    type: 'governance_proposal',
                    tag: proposal.tag,
                    submitter: proposal.submitterDID,
                    zkpHash: proposal.zkpHash
                }
            };
            formData.append('pinataMetadata', JSON.stringify(metadata));
            // Add pin options for replication
            const pinOptions = {
                cidVersion: 1,
                customPinPolicy: {
                    regions: [
                        { id: 'FRA1', desiredReplicationCount: 2 },
                        { id: 'NYC1', desiredReplicationCount: 2 }
                    ]
                }
            };
            formData.append('pinataOptions', JSON.stringify(pinOptions));
            // Upload to Piñata
            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.apiSecret
                },
                body: formData
            });
            if (response.ok) {
                const result = await response.json();
                this.metrics.successfulUploads++;
                this.updateMetrics();
                console.log('✅ GovernanceSyncLayer: Proposal uploaded to IPFS:', result.IpfsHash);
                return {
                    success: true,
                    ipfsHash: result.IpfsHash
                };
            }
            else {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
        }
        catch (error) {
            this.metrics.failedUploads++;
            this.updateMetrics();
            console.error('❌ GovernanceSyncLayer: Upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }
    // Update metrics and check Path B threshold
    updateMetrics() {
        this.metrics.successRate = this.metrics.totalProposals > 0
            ? (this.metrics.successfulUploads / this.metrics.totalProposals) * 100
            : 100;
        const failureRate = 100 - this.metrics.successRate;
        if (failureRate >= this.pathBThreshold && !this.metrics.pathBTriggered) {
            this.metrics.pathBTriggered = true;
            console.warn(`⚠️ GovernanceSyncLayer: Path B triggered - ${failureRate.toFixed(1)}% failure rate`);
        }
    }
    // Get current sync metrics
    getMetrics() {
        return { ...this.metrics };
    }
    // Validate proposal data before upload
    validateProposal(proposal) {
        const errors = [];
        if (!proposal.title || proposal.title.length === 0) {
            errors.push('Title is required');
        }
        else if (proposal.title.length > 100) {
            errors.push('Title must be 100 characters or less');
        }
        if (!proposal.description || proposal.description.length === 0) {
            errors.push('Description is required');
        }
        else if (proposal.description.length > 300) {
            errors.push('Description must be 300 characters or less');
        }
        if (!proposal.tag) {
            errors.push('Tag selection is required');
        }
        if (!proposal.submitterDID || !proposal.submitterDID.startsWith('did:')) {
            errors.push('Valid DID is required for submission');
        }
        if (!['Citizen', 'Moderator', 'Governor'].includes(proposal.submitterTier)) {
            errors.push('Valid user tier is required');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    // Reset metrics (for testing purposes)
    resetMetrics() {
        this.metrics = {
            totalProposals: 0,
            successfulUploads: 0,
            failedUploads: 0,
            successRate: 100,
            pathBTriggered: false
        };
    }
}
