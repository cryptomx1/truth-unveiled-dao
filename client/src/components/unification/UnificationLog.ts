// UnificationLog.ts - Phase III-A Step 6/6 Utility
// Comprehensive logging for UnificationOrchestrator

interface LogEntry {
  id: string;
  timestamp: Date;
  source: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  metadata?: any;
}

export class UnificationLog {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(maxLogs: number = 1000) {
    this.maxLogs = maxLogs;
  }

  public log(source: string, message: string, metadata?: any, level: LogEntry['level'] = 'info'): void {
    const entry: LogEntry = {
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

  public info(source: string, message: string, metadata?: any): void {
    this.log(source, message, metadata, 'info');
  }

  public warning(source: string, message: string, metadata?: any): void {
    this.log(source, message, metadata, 'warning');
  }

  public error(source: string, message: string, metadata?: any): void {
    this.log(source, message, metadata, 'error');
  }

  public debug(source: string, message: string, metadata?: any): void {
    this.log(source, message, metadata, 'debug');
  }

  public getLogs(limit?: number): LogEntry[] {
    return limit ? this.logs.slice(0, limit) : this.logs;
  }

  public getLogsByLevel(level: LogEntry['level'], limit?: number): LogEntry[] {
    const filteredLogs = this.logs.filter(log => log.level === level);
    return limit ? filteredLogs.slice(0, limit) : filteredLogs;
  }

  public getLogsBySource(source: string, limit?: number): LogEntry[] {
    const filteredLogs = this.logs.filter(log => log.source === source);
    return limit ? filteredLogs.slice(0, limit) : filteredLogs;
  }

  public clear(): void {
    this.logs = [];
  }

  public getLogCount(): number {
    return this.logs.length;
  }

  public getLogCountByLevel(level: LogEntry['level']): number {
    return this.logs.filter(log => log.level === level).length;
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}