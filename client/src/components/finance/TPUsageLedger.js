export class TPUsageLedger {
    usageLog = [];
    currentBalance = 485; // Mock balance - should sync with main treasury
    constructor() {
        this.loadStoredUsage();
        console.log('📝 TPUsageLedger initialized — tracking TruthPoint utility usage');
    }
    /**
     * Log a new TruthPoint usage event
     */
    logUsage(did, amount, actionName, actionType, actionId, metadata) {
        const balanceBefore = this.currentBalance;
        const balanceAfter = balanceBefore - amount;
        const entry = {
            id: `tp_usage_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            did,
            amount,
            actionName,
            actionType,
            actionId,
            timestamp: new Date(),
            zkpHash: this.generateZKPHash(did, amount, actionId),
            balanceBefore,
            balanceAfter,
            status: 'completed',
            metadata: metadata || {}
        };
        // Update balance and add to log
        this.currentBalance = balanceAfter;
        this.usageLog.push(entry);
        // Persist to storage
        this.saveUsageToStorage();
        // Update main transaction log
        this.appendToMainTransactionLog(entry);
        console.log(`💰 TP Usage Logged: ${actionName} — ${amount} TP — DID: ${did.slice(0, 20)}...`);
        console.log(`📊 New balance: ${balanceAfter} TP (${amount} TP spent)`);
        return entry;
    }
    /**
     * Get recent usage entries (last N entries)
     */
    getRecentUsage(limit = 10) {
        return this.usageLog
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    /**
     * Get usage summary statistics
     */
    getUsageSummary() {
        if (this.usageLog.length === 0) {
            return {
                totalUsage: 0,
                entriesCount: 0,
                categoryBreakdown: {},
                timeRange: {
                    earliest: new Date(),
                    latest: new Date()
                }
            };
        }
        const totalUsage = this.usageLog.reduce((sum, entry) => sum + entry.amount, 0);
        const categoryBreakdown = {};
        // Calculate category breakdown
        this.usageLog.forEach(entry => {
            if (!categoryBreakdown[entry.actionType]) {
                categoryBreakdown[entry.actionType] = { count: 0, totalSpent: 0 };
            }
            categoryBreakdown[entry.actionType].count++;
            categoryBreakdown[entry.actionType].totalSpent += entry.amount;
        });
        // Find time range
        const timestamps = this.usageLog.map(entry => entry.timestamp.getTime());
        const earliest = new Date(Math.min(...timestamps));
        const latest = new Date(Math.max(...timestamps));
        return {
            totalUsage,
            entriesCount: this.usageLog.length,
            categoryBreakdown,
            timeRange: { earliest, latest }
        };
    }
    /**
     * Filter usage by category
     */
    getUsageByCategory(category) {
        return this.usageLog.filter(entry => entry.actionType === category);
    }
    /**
     * Get usage by DID
     */
    getUsageByDID(did) {
        return this.usageLog.filter(entry => entry.did === did);
    }
    /**
     * Process refund for a usage entry
     */
    processRefund(usageId, reason = 'User requested refund') {
        const entry = this.usageLog.find(e => e.id === usageId);
        if (!entry || entry.status === 'refunded') {
            console.error(`Cannot refund usage entry: ${usageId}`);
            return false;
        }
        // Create refund entry
        const refundEntry = {
            ...entry,
            id: `refund_${entry.id}`,
            amount: -entry.amount, // Negative amount for refund
            actionName: `REFUND: ${entry.actionName}`,
            status: 'completed',
            timestamp: new Date(),
            metadata: {
                ...entry.metadata,
                refundReason: reason,
                originalEntryId: entry.id
            }
        };
        // Update balances
        this.currentBalance += entry.amount;
        refundEntry.balanceAfter = this.currentBalance;
        // Mark original as refunded and add refund entry
        entry.status = 'refunded';
        this.usageLog.push(refundEntry);
        this.saveUsageToStorage();
        this.appendToMainTransactionLog(refundEntry);
        console.log(`💸 TP Refund Processed: ${entry.actionName} — +${entry.amount} TP`);
        return true;
    }
    /**
     * Export usage ledger for audit
     */
    exportLedger() {
        return {
            summary: this.getUsageSummary(),
            entries: this.usageLog,
            exportTimestamp: new Date(),
            version: 'tp-usage-ledger-v1.0'
        };
    }
    /**
     * Generate ZKP hash for usage entry (placeholder for ZKP integration)
     */
    generateZKPHash(did, amount, actionId) {
        const payload = `${did}:${amount}:${actionId}:${Date.now()}`;
        return `0x${btoa(payload).slice(0, 32)}...`; // Mock hash for now
    }
    /**
     * Save usage log to localStorage
     */
    saveUsageToStorage() {
        try {
            const storageData = {
                usageLog: this.usageLog,
                currentBalance: this.currentBalance,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('tp_usage_ledger', JSON.stringify(storageData));
        }
        catch (error) {
            console.error('Failed to save usage ledger to storage:', error);
        }
    }
    /**
     * Load usage log from localStorage
     */
    loadStoredUsage() {
        try {
            const stored = localStorage.getItem('tp_usage_ledger');
            if (stored) {
                const storageData = JSON.parse(stored);
                this.usageLog = storageData.usageLog.map((entry) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                }));
                this.currentBalance = storageData.currentBalance || 485;
                console.log(`📂 Loaded ${this.usageLog.length} usage entries from storage`);
            }
        }
        catch (error) {
            console.error('Failed to load usage ledger from storage:', error);
        }
    }
    /**
     * Append usage to main transaction log (TPTransactionLog.json compatibility)
     */
    appendToMainTransactionLog(entry) {
        try {
            // Create transaction log entry format
            const transactionEntry = {
                id: entry.id,
                timestamp: entry.timestamp.toISOString(),
                type: 'utility_usage',
                amount: -entry.amount, // Negative for spending
                did: entry.did,
                description: `${entry.actionName} (${entry.actionType})`,
                zkpHash: entry.zkpHash,
                balanceAfter: entry.balanceAfter,
                metadata: {
                    actionId: entry.actionId,
                    actionType: entry.actionType,
                    category: 'utility_spending',
                    ...entry.metadata
                }
            };
            // In a real implementation, this would append to the actual transaction log
            console.log(`📝 Transaction logged: ${entry.actionName} — ${entry.amount} TP`);
            // For now, store in sessionStorage as a demo
            const existingLog = JSON.parse(sessionStorage.getItem('tp_transaction_additions') || '[]');
            existingLog.push(transactionEntry);
            sessionStorage.setItem('tp_transaction_additions', JSON.stringify(existingLog));
        }
        catch (error) {
            console.error('Failed to append to main transaction log:', error);
        }
    }
    /**
     * Get current balance
     */
    getCurrentBalance() {
        return this.currentBalance;
    }
    /**
     * Update balance (for external balance updates)
     */
    updateBalance(newBalance) {
        this.currentBalance = newBalance;
        this.saveUsageToStorage();
    }
}
