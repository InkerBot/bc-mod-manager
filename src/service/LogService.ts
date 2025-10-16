import { LocalStorageService } from './LocalStorageService';

/**
 * Log Level
 */
// @ts-ignore
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log Entry
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
}

/**
 * Debug Method (Crash Reporter Generator)
 */
interface DebugMethod {
  name: string;
  method: () => string | Promise<string>;
}

/**
 * Log Service
 * Manages application logs and crash reporters
 */
export class LogService {
  private static readonly STORAGE_KEY = 'bmm_logs';
  private static readonly MAX_LOGS = 1000; // Maximum number of logs to keep
  private static debugMethods: Map<string, DebugMethod> = new Map();

  /**
   * Register a debug method (crash reporter generator)
   * @param name - Name of the debug method
   * @param method - Function that returns debug information
   */
  static registerDebugMethod(name: string, method: () => string | Promise<string>): void {
    this.debugMethods.set(name, { name, method });
    this.log(LogLevel.DEBUG, `Debug method registered: ${name}`);
  }

  /**
   * Unregister a debug method
   * @param name - Name of the debug method to remove
   */
  static unregisterDebugMethod(name: string): void {
    if (this.debugMethods.delete(name)) {
      this.log(LogLevel.DEBUG, `Debug method unregistered: ${name}`);
    }
  }

  /**
   * Get all registered debug methods
   */
  static getDebugMethods(): string[] {
    return Array.from(this.debugMethods.keys());
  }

  /**
   * Execute a debug method and get its output
   * @param name - Name of the debug method
   */
  static async executeDebugMethod(name: string): Promise<string> {
    const debugMethod = this.debugMethods.get(name);
    if (!debugMethod) {
      throw new Error(`Debug method not found: ${name}`);
    }

    try {
      const result = await debugMethod.method();
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(LogLevel.ERROR, `Failed to execute debug method: ${name}`, { error: errorMsg });
      throw error;
    }
  }

  /**
   * Execute all debug methods and get their outputs
   */
  static async executeAllDebugMethods(): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const [name, debugMethod] of this.debugMethods.entries()) {
      try {
        results[name] = await debugMethod.method();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results[name] = `ERROR: ${errorMsg}`;
        this.log(LogLevel.ERROR, `Failed to execute debug method: ${name}`, { error: errorMsg });
      }
    }

    return results;
  }

  /**
   * Add a log entry
   * @param level - Log level
   * @param message - Log message
   * @param data - Optional additional data
   */
  static log(level: LogLevel, message: string, data?: any): void {
    const logs = this.getAllLogs();

    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    logs.push(entry);

    // Keep only the last MAX_LOGS entries
    if (logs.length > this.MAX_LOGS) {
      logs.splice(0, logs.length - this.MAX_LOGS);
    }

    LocalStorageService.setItem(this.STORAGE_KEY, logs);

    // Also log to console
    const consoleMsg = `[${level}] ${message}`;
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(consoleMsg, data);
        break;
      case LogLevel.INFO:
        console.info(consoleMsg, data);
        break;
      case LogLevel.WARN:
        console.warn(consoleMsg, data);
        break;
      case LogLevel.ERROR:
        console.error(consoleMsg, data);
        break;
    }
  }

  /**
   * Convenience methods for different log levels
   */
  static debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  static info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  static warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  static error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Get all logs
   */
  static getAllLogs(): LogEntry[] {
    const logs = LocalStorageService.getItem<LogEntry[]>(this.STORAGE_KEY);
    return logs || [];
  }

  /**
   * Get logs filtered by level
   */
  static getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.getAllLogs().filter(log => log.level === level);
  }

  /**
   * Get logs within a time range
   */
  static getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this.getAllLogs().filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    LocalStorageService.setItem(this.STORAGE_KEY, []);
    this.log(LogLevel.INFO, 'All logs cleared');
  }

  /**
   * Export logs as JSON string
   */
  static exportLogsAsJSON(): string {
    const logs = this.getAllLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Export logs as text
   */
  static exportLogsAsText(): string {
    const logs = this.getAllLogs();
    return logs.map(log => {
      const date = new Date(log.timestamp).toISOString();
      const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `[${date}] [${log.level}] ${log.message}${dataStr}`;
    }).join('\n');
  }

  /**
   * Generate a crash report with logs and debug information
   */
  static async generateCrashReport(): Promise<string> {
    const report: string[] = [];

    report.push('='.repeat(80));
    report.push('BC MOD MANAGER - CRASH REPORT');
    report.push('='.repeat(80));
    report.push('');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push(`User Agent: ${navigator.userAgent}`);
    report.push(`Platform: ${navigator.platform}`);
    report.push(`Language: ${navigator.language}`);
    report.push('');

    // Add debug information
    report.push('='.repeat(80));
    report.push('DEBUG INFORMATION');
    report.push('='.repeat(80));
    report.push('');

    const debugResults = await this.executeAllDebugMethods();
    for (const [name, result] of Object.entries(debugResults)) {
      report.push(`--- ${name} ---`);
      report.push(result);
      report.push('');
    }

    // Add logs
    report.push('='.repeat(80));
    report.push('LOGS');
    report.push('='.repeat(80));
    report.push('');
    report.push(this.exportLogsAsText());

    return report.join('\n');
  }

  /**
   * Download crash report as a file
   */
  static async downloadCrashReport(): Promise<void> {
    try {
      const report = await this.generateCrashReport();
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bc-mod-manager-crash-report-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.info('Crash report downloaded successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.error('Failed to download crash report', { error: errorMsg });
      throw error;
    }
  }

  /**
   * Get log statistics
   */
  static getLogStats(): Record<LogLevel, number> {
    const logs = this.getAllLogs();
    const stats: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
    };

    logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }
}

