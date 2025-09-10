// UnificationLog.ts - Phase III-A Step 6/6 Utility
// Comprehensive logging for UnificationOrchestrator
export class UnificationLog {
    logs = [];
    maxLogs = 1000;
    constructor(maxLogs = 1000) {
        this.maxLogs = maxLogs;
    }
    log(source, message, metadata, level = 'info') {
        const entry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            source,
            message,
            level,
            metadata
        };
        this.logs.unshift(entry);
        // Keep only the most recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        // Console output for debugging
        const consoleMessage = `[${source}] ${message}`;
        switch (level) {
            case 'error':
                console.error(consoleMessage, metadata);
                break;
            case 'warning':
                console.warn(consoleMessage, metadata);
                break;
            case 'debug':
                console.debug(consoleMessage, metadata);
                break;
            default:
                console.log(consoleMessage, metadata);
        }
    }
    info(source, message, metadata) {
        this.log(source, message, metadata, 'info');
    }
    warning(source, message, metadata) {
        this.log(source, message, metadata, 'warning');
    }
    error(source, message, metadata) {
        this.log(source, message, metadata, 'error');
    }
    debug(source, message, metadata) {
        this.log(source, message, metadata, 'debug');
    }
    getLogs(limit) {
        return limit ? this.logs.slice(0, limit) : this.logs;
    }
    getLogsByLevel(level, limit) {
        const filteredLogs = this.logs.filter(log => log.level === level);
        return limit ? filteredLogs.slice(0, limit) : filteredLogs;
    }
    getLogsBySource(source, limit) {
        const filteredLogs = this.logs.filter(log => log.source === source);
        return limit ? filteredLogs.slice(0, limit) : filteredLogs;
    }
    clear() {
        this.logs = [];
    }
    getLogCount() {
        return this.logs.length;
    }
    getLogCountByLevel(level) {
        return this.logs.filter(log => log.level === level).length;
    }
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}
