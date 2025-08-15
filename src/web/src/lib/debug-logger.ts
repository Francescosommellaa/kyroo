// Debug logger core functionality

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

export interface DebugConfig {
  enabled: boolean;
  level: LogLevel;
  contexts: string[];
  persistLogs: boolean;
  maxLogs: number;
}

export class DebugLogger {
  private config: DebugConfig;
  private logs: LogEntry[] = [];
  private readonly LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      level: 'debug',
      contexts: [],
      persistLogs: false,
      maxLogs: 1000,
      ...config,
    };

    if (this.config.persistLogs) {
      this.loadPersistedLogs();
    }
  }

  private shouldLog(level: LogLevel, context?: string): boolean {
    if (!this.config.enabled) return false;
    
    // Check log level
    if (this.LOG_LEVELS[level] < this.LOG_LEVELS[this.config.level]) {
      return false;
    }
    
    // Check context filter
    if (this.config.contexts.length > 0 && context) {
      return this.config.contexts.includes(context);
    }
    
    return true;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Maintain max logs limit
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }
    
    if (this.config.persistLogs) {
      this.persistLogs();
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`;
  }

  private persistLogs(): void {
    try {
      localStorage.setItem('kyroo_debug_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to persist debug logs:', error);
    }
  }

  private loadPersistedLogs(): void {
    try {
      const stored = localStorage.getItem('kyroo_debug_logs');
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load persisted debug logs:', error);
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('debug', context)) return;
    
    const entry: LogEntry = {
      level: 'debug',
      message,
      timestamp: new Date(),
      context,
      data,
    };
    
    this.addLog(entry);
    console.debug(this.formatMessage('debug', message, context), data);
  }

  info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('info', context)) return;
    
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date(),
      context,
      data,
    };
    
    this.addLog(entry);
    console.info(this.formatMessage('info', message, context), data);
  }

  warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('warn', context)) return;
    
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date(),
      context,
      data,
    };
    
    this.addLog(entry);
    console.warn(this.formatMessage('warn', message, context), data);
  }

  error(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('error', context)) return;
    
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date(),
      context,
      data,
    };
    
    this.addLog(entry);
    console.error(this.formatMessage('error', message, context), data);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by context
  getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
    if (this.config.persistLogs) {
      localStorage.removeItem('kyroo_debug_logs');
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();