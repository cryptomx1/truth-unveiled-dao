/**
 * ZKVoteTokenIssuer.ts - Phase XXVII Step 3
 * Zero-Knowledge Vote Token Issuance System
 * Authority: Commander Mark via JASMY Relay
 */
// Main ZK Vote Token Issuer class
export class ZKVoteTokenIssuer {
    static instance;
    tokenCache = new Map();
    ballotLedger = new Map();
    constraintTracker = new Map();
    issuanceHistory = [];
    // TTL constants
    static TOKEN_TTL_MINUTES = 2;
    static PROCESSING_DELAY_MS = 2000;
    constructor() {
        console.log('🗳️ ZKVoteTokenIssuer initialized for ballot finalization and proof signature generation');
        this.startCleanupTimer();
    }
    static getInstance() {
        if (!ZKVoteTokenIssuer.instance) {
            ZKVoteTokenIssuer.instance = new ZKVoteTokenIssuer();
        }
        return ZKVoteTokenIssuer.instance;
    }
    // Issue ZK vote token from ballot submission
    async issueVoteToken(input) {
        const submissionTimestamp = new Date().toISOString();
        try {
            console.log(`🔄 Processing vote token issuance for ballot: ${input.ballotId}`);
            // Step 1: Validate input structure
            const validationResult = this.validateSubmissionInput(input);
            if (!validationResult.valid) {
                const result = {
                    success: false,
                    error: validationResult.error,
                    reason: 'invalid_payload'
                };
                this.issuanceHistory.push(result);
                return result;
            }
            // Step 2: Check for duplicate votes (one-vote-per-CID-per-ballot)
            const duplicateCheck = this.checkDuplicateVote(input.ballotId, input.cidDigest);
            if (duplicateCheck.isDuplicate) {
                const result = {
                    success: false,
                    error: `Duplicate vote detected for ballot ${input.ballotId}`,
                    reason: 'duplicate_vote',
                    duplicateTokenId: duplicateCheck.existingTokenId
                };
                this.issuanceHistory.push(result);
                console.log(`🚫 Duplicate vote rejected — Ballot: ${input.ballotId} | CID: ${this.truncateHash(input.cidDigest)} | Existing Token: ${duplicateCheck.existingTokenId}`);
                return result;
            }
            // Step 3: Generate CID hash for anonymization
            const cidHash = this.generateCidHash(input.cidDigest, input.ballotId);
            // Step 4: Simulate 2-second processing delay
            console.log(`⏳ Processing ZK vote token — Ballot: ${input.ballotId} | CID: ${this.truncateHash(input.cidDigest)}`);
            await new Promise(resolve => setTimeout(resolve, ZKVoteTokenIssuer.PROCESSING_DELAY_MS));
            // Step 5: Generate proof signature
            const proofSignature = this.generateProofSignature(input.ballotId, cidHash, input.encryptedPayload, input.multiplier);
            // Step 6: Create ZK vote token
            const tokenId = this.generateTokenId(input.ballotId, cidHash);
            const expiresAt = new Date(Date.now() + (ZKVoteTokenIssuer.TOKEN_TTL_MINUTES * 60 * 1000)).toISOString();
            const zkToken = {
                ballotId: input.ballotId,
                cidHash,
                encryptedVote: input.encryptedPayload,
                voteWeight: input.multiplier,
                timestamp: submissionTimestamp,
                proofSignature,
                tokenId,
                expiresAt,
                metadata: {
                    tier: input.eligibilityResult.tier,
                    trustScore: input.eligibilityResult.trustScore,
                    validationLevel: input.eligibilityResult.metadata?.validationLevel || 'basic',
                    submissionTimestamp,
                    integrityHash: this.generateIntegrityHash(input)
                }
            };
            // Step 7: Store in caches and trackers
            this.tokenCache.set(tokenId, zkToken);
            const ledgerEntry = {
                token: zkToken,
                submissionTimestamp,
                isActive: true,
                expiryTimestamp: expiresAt
            };
            this.ballotLedger.set(tokenId, ledgerEntry);
            const constraint = {
                ballotId: input.ballotId,
                cidHash,
                tokenId,
                timestamp: submissionTimestamp,
                voteWeight: input.multiplier
            };
            const constraintKey = `${input.ballotId}:${cidHash}`;
            this.constraintTracker.set(constraintKey, constraint);
            // Step 8: Console logging as required
            console.log(`🧾 ZKVoteToken Issued — Ballot: ${input.ballotId} | CID: ${this.truncateHash(cidHash)} | Weight: ${input.multiplier}x | Hash: ${proofSignature.substring(0, 16)}...`);
            const result = {
                success: true,
                token: zkToken
            };
            this.issuanceHistory.push(result);
            return result;
        }
        catch (error) {
            console.error(`❌ Token issuance failed for ballot ${input.ballotId}:`, error);
            const result = {
                success: false,
                error: `Processing error: ${String(error)}`,
                reason: 'processing_error'
            };
            this.issuanceHistory.push(result);
            return result;
        }
    }
    // Validate submission input structure
    validateSubmissionInput(input) {
        const required = ['ballotId', 'cidDigest', 'vote', 'multiplier', 'encryptedPayload', 'eligibilityResult'];
        for (const field of required) {
            if (!(field in input) || input[field] === null || input[field] === undefined) {
                return {
                    valid: false,
                    error: `Missing required field: ${field}`
                };
            }
        }
        // Validate multiplier range
        if (input.multiplier <= 0 || input.multiplier > 5) {
            return {
                valid: false,
                error: `Invalid multiplier: ${input.multiplier} (must be 0-5)`
            };
        }
        // Validate encrypted payload format
        if (!input.encryptedPayload.startsWith('encrypted-ballot-')) {
            return {
                valid: false,
                error: 'Invalid encrypted payload format'
            };
        }
        // Validate eligibility result
        if (!input.eligibilityResult.valid) {
            return {
                valid: false,
                error: `Eligibility invalid: ${input.eligibilityResult.reason}`
            };
        }
        return { valid: true };
    }
    // Check for duplicate vote
    checkDuplicateVote(ballotId, cidDigest) {
        const cidHash = this.generateCidHash(cidDigest, ballotId);
        const constraintKey = `${ballotId}:${cidHash}`;
        const existingConstraint = this.constraintTracker.get(constraintKey);
        if (existingConstraint) {
            // Check if existing token is still valid (not expired)
            const ledgerEntry = this.ballotLedger.get(existingConstraint.tokenId);
            if (ledgerEntry && ledgerEntry.isActive && new Date(ledgerEntry.expiryTimestamp).getTime() > Date.now()) {
                return {
                    isDuplicate: true,
                    existingTokenId: existingConstraint.tokenId
                };
            }
        }
        return { isDuplicate: false };
    }
    // Generate anonymized CID hash
    generateCidHash(cidDigest, ballotId) {
        const input = `${cidDigest}:${ballotId}:${Date.now()}`;
        return `cid-${this.simpleHash(input)}`;
    }
    // Generate proof signature
    generateProofSignature(ballotId, cidHash, encryptedPayload, multiplier) {
        const proofInput = `${ballotId}:${cidHash}:${encryptedPayload}:${multiplier}:${Date.now()}`;
        const hash = this.simpleHash(proofInput);
        return `zkproof-${hash}`;
    }
    // Generate token ID
    generateTokenId(ballotId, cidHash) {
        const input = `token-${ballotId}-${cidHash}-${Date.now()}-${Math.random()}`;
        return `zkvt-${this.simpleHash(input)}`;
    }
    // Generate integrity hash
    generateIntegrityHash(input) {
        const integrityInput = `${input.ballotId}:${input.cidDigest}:${input.vote}:${input.multiplier}:${input.encryptedPayload}`;
        return `integrity-${this.simpleHash(integrityInput)}`;
    }
    // Simple hash function for mock cryptography
    simpleHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(12, '0');
    }
    // Truncate hash for logging
    truncateHash(hash, length = 12) {
        return hash.length > length ? hash.substring(0, length) + '...' : hash;
    }
    // Get token by ID
    getTokenById(tokenId) {
        return this.tokenCache.get(tokenId) || null;
    }
    // Get active tokens for ballot
    getActiveTokensForBallot(ballotId) {
        const activeTokens = [];
        for (const [tokenId, ledgerEntry] of this.ballotLedger.entries()) {
            if (ledgerEntry.token.ballotId === ballotId &&
                ledgerEntry.isActive &&
                new Date(ledgerEntry.expiryTimestamp).getTime() > Date.now()) {
                activeTokens.push(ledgerEntry.token);
            }
        }
        return activeTokens.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    // Get ballot ledger entries
    getBallotLedgerEntries(limit) {
        const entries = Array.from(this.ballotLedger.values())
            .sort((a, b) => new Date(b.submissionTimestamp).getTime() - new Date(a.submissionTimestamp).getTime());
        return limit ? entries.slice(0, limit) : entries;
    }
    // Get issuance history
    getIssuanceHistory(limit) {
        const history = [...this.issuanceHistory].reverse();
        return limit ? history.slice(0, limit) : history;
    }
    // Get constraint tracking statistics
    getConstraintStatistics() {
        const constraints = Array.from(this.constraintTracker.values());
        const activeBallots = new Set(constraints.map(c => c.ballotId)).size;
        const uniqueCIDs = new Set(constraints.map(c => c.cidHash)).size;
        const totalWeight = constraints.reduce((sum, c) => sum + c.voteWeight, 0);
        const averageWeight = constraints.length > 0 ? totalWeight / constraints.length : 0;
        const ballotBreakdown = {};
        constraints.forEach(constraint => {
            ballotBreakdown[constraint.ballotId] = (ballotBreakdown[constraint.ballotId] || 0) + 1;
        });
        // Recent activity (last hour)
        const oneHourAgo = Date.now() - 3600000;
        const recentActivity = constraints.filter(c => new Date(c.timestamp).getTime() > oneHourAgo).length;
        return {
            totalConstraints: constraints.length,
            activeBallots,
            uniqueCIDs,
            averageWeight: Math.round(averageWeight * 100) / 100,
            ballotBreakdown,
            recentActivity
        };
    }
    // Get token statistics
    getTokenStatistics() {
        const now = Date.now();
        const ledgerEntries = Array.from(this.ballotLedger.values());
        const activeTokens = ledgerEntries.filter(entry => entry.isActive && new Date(entry.expiryTimestamp).getTime() > now).length;
        const expiredTokens = ledgerEntries.filter(entry => new Date(entry.expiryTimestamp).getTime() <= now).length;
        const weights = ledgerEntries.map(entry => entry.token.voteWeight);
        const averageWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;
        const successfulIssuances = this.issuanceHistory.filter(h => h.success).length;
        const successRate = this.issuanceHistory.length > 0 ? successfulIssuances / this.issuanceHistory.length : 0;
        const duplicateAttempts = this.issuanceHistory.filter(h => h.reason === 'duplicate_vote').length;
        const duplicateRate = this.issuanceHistory.length > 0 ? duplicateAttempts / this.issuanceHistory.length : 0;
        const tierBreakdown = {};
        ledgerEntries.forEach(entry => {
            const tier = entry.token.metadata.tier;
            tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
        });
        // Recent issuances (last hour)
        const oneHourAgo = Date.now() - 3600000;
        const recentIssuances = this.issuanceHistory.filter(h => h.token && new Date(h.token.timestamp).getTime() > oneHourAgo).length;
        return {
            totalTokens: ledgerEntries.length,
            activeTokens,
            expiredTokens,
            averageWeight: Math.round(averageWeight * 100) / 100,
            successRate: Math.round(successRate * 100) / 100,
            duplicateRate: Math.round(duplicateRate * 100) / 100,
            tierBreakdown,
            recentIssuances
        };
    }
    // Expire token manually (admin function)
    expireToken(tokenId) {
        const ledgerEntry = this.ballotLedger.get(tokenId);
        if (ledgerEntry) {
            ledgerEntry.isActive = false;
            ledgerEntry.expiryTimestamp = new Date().toISOString();
            console.log(`⏰ Token manually expired: ${tokenId}`);
            return true;
        }
        return false;
    }
    // Clear expired tokens
    clearExpiredTokens() {
        const now = Date.now();
        let clearedCount = 0;
        for (const [tokenId, ledgerEntry] of this.ballotLedger.entries()) {
            if (new Date(ledgerEntry.expiryTimestamp).getTime() <= now) {
                ledgerEntry.isActive = false;
                clearedCount++;
            }
        }
        if (clearedCount > 0) {
            console.log(`🧹 Cleared ${clearedCount} expired tokens`);
        }
        return clearedCount;
    }
    // Start cleanup timer for expired tokens
    startCleanupTimer() {
        setInterval(() => {
            this.clearExpiredTokens();
        }, 60000); // Clean up every minute
    }
    // Clear all data (admin function)
    clearAllData() {
        this.tokenCache.clear();
        this.ballotLedger.clear();
        this.constraintTracker.clear();
        this.issuanceHistory.length = 0;
        console.log('🧹 All ZKVoteTokenIssuer data cleared');
    }
    // Create mock vote submission input for testing
    createMockVoteSubmission(ballotId, vote, tier = 'Citizen', trustScore = 75) {
        const cidDigest = `cid-mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const multiplier = tier === 'Administrator' ? 3.0 : tier === 'Governor' ? 2.0 : tier === 'Moderator' ? 1.5 : tier === 'Verifier' ? 1.2 : 1.0;
        const encryptedPayload = `encrypted-ballot-${this.simpleHash(`${ballotId}:${vote}:${cidDigest}:${multiplier}`)}`;
        const eligibilityResult = {
            cidDigest,
            tier,
            trustScore,
            multiplier,
            valid: true,
            validationTimestamp: new Date().toISOString(),
            epochStatus: 'valid',
            integrityStatus: 'verified',
            metadata: {
                totalMissions: 5,
                totalVotes: 3,
                reputationScore: 85,
                validationLevel: tier === 'Administrator' ? 'dao_verified' : tier === 'Governor' ? 'civic_grade' : 'enhanced',
                witnessCount: 2
            }
        };
        return {
            ballotId,
            cidDigest,
            vote,
            multiplier,
            encryptedPayload,
            eligibilityResult
        };
    }
}
// Export utility functions
export const issueZKVoteToken = async (input) => {
    const issuer = ZKVoteTokenIssuer.getInstance();
    return await issuer.issueVoteToken(input);
};
export const getZKVoteToken = (tokenId) => {
    const issuer = ZKVoteTokenIssuer.getInstance();
    return issuer.getTokenById(tokenId);
};
export const getActiveVoteTokens = (ballotId) => {
    const issuer = ZKVoteTokenIssuer.getInstance();
    return issuer.getActiveTokensForBallot(ballotId);
};
export const createMockVoteSubmission = (ballotId, vote, tier, trustScore) => {
    const issuer = ZKVoteTokenIssuer.getInstance();
    return issuer.createMockVoteSubmission(ballotId, vote, tier, trustScore);
};
export default ZKVoteTokenIssuer;
