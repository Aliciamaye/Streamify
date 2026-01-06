/**
 * Logger Utility
 * Production-grade logging
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isDev = process.env.NODE_ENV !== 'production';
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && LogLevel[envLevel as keyof typeof LogLevel] !== undefined) {
      this.level = LogLevel[envLevel as keyof typeof LogLevel];
    }
  }

  private formatLog(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logData = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${this.context}] [${level}] ${message}${logData}`;
  }

  debug(message: string, data?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`\x1b[36m${this.formatLog('DEBUG', message, data)}\x1b[0m`);
    }
  }

  info(message: string, data?: any) {
    if (this.level <= LogLevel.INFO) {
      console.log(`\x1b[32m${this.formatLog('INFO', message, data)}\x1b[0m`);
    }
  }

  warn(message: string, data?: any) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`\x1b[33m${this.formatLog('WARN', message, data)}\x1b[0m`);
    }
  }

  error(message: string, error?: any) {
    if (this.level <= LogLevel.ERROR) {
      const errorData = error instanceof Error
        ? {
            message: error.message,
            stack: this.isDev ? error.stack : undefined,
          }
        : error;

      console.error(
        `\x1b[31m${this.formatLog('ERROR', message, errorData)}\x1b[0m`
      );
    }
  }
}

export const logger = new Logger();

