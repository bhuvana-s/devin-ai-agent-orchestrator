/**
 * Simple logger utility for Lambda functions
 */
export class Logger {
  private context: string;
  private logLevel: string;

  constructor(context: string, logLevel: string = 'INFO') {
    this.context = context;
    this.logLevel = process.env.LOG_LEVEL || logLevel;
  }

  private shouldLog(level: string): boolean {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('DEBUG')) {
      console.log(JSON.stringify({
        level: 'DEBUG',
        context: this.context,
        message,
        ...meta,
      }));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('INFO')) {
      console.log(JSON.stringify({
        level: 'INFO',
        context: this.context,
        message,
        ...meta,
      }));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('WARN')) {
      console.warn(JSON.stringify({
        level: 'WARN',
        context: this.context,
        message,
        ...meta,
      }));
    }
  }

  error(message: string, error?: Error | any, meta?: any): void {
    if (this.shouldLog('ERROR')) {
      console.error(JSON.stringify({
        level: 'ERROR',
        context: this.context,
        message,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : error,
        ...meta,
      }));
    }
  }
}