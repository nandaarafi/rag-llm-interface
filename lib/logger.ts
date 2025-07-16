interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  userId?: string;
  traceId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    }
    return JSON.stringify(entry);
  }

  private sanitizeMetadata(metadata: any): any {
    if (!metadata) return metadata;
    
    const sanitized = { ...metadata };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'auth', 'bearer', 'apikey'
    ];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private log(level: string, message: string, metadata?: Record<string, any>, userId?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: this.sanitizeMetadata(metadata),
      userId,
      traceId: this.generateTraceId(),
    };

    const formattedLog = this.formatLog(entry);
    
    // In production, you might want to send to external logging service
    if (this.isProduction) {
      // TODO: Send to external logging service (e.g., DataDog, Sentry)
      console.log(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  error(message: string, metadata?: Record<string, any>, userId?: string) {
    this.log(LOG_LEVELS.ERROR, message, metadata, userId);
  }

  warn(message: string, metadata?: Record<string, any>, userId?: string) {
    this.log(LOG_LEVELS.WARN, message, metadata, userId);
  }

  info(message: string, metadata?: Record<string, any>, userId?: string) {
    this.log(LOG_LEVELS.INFO, message, metadata, userId);
  }

  debug(message: string, metadata?: Record<string, any>, userId?: string) {
    if (this.isDevelopment) {
      this.log(LOG_LEVELS.DEBUG, message, metadata, userId);
    }
  }

  // Specific logging methods for common scenarios
  authAttempt(email: string, success: boolean, provider: string) {
    this.info('Authentication attempt', {
      email,
      success,
      provider,
      action: 'auth_attempt'
    });
  }

  apiRequest(method: string, path: string, userId?: string, responseTime?: number) {
    this.info('API request', {
      method,
      path,
      responseTime,
      action: 'api_request'
    }, userId);
  }

  paymentEvent(event: string, userId: string, amount?: number) {
    this.info('Payment event', {
      event,
      amount,
      action: 'payment'
    }, userId);
  }

  securityEvent(event: string, details: Record<string, any>, userId?: string) {
    this.warn('Security event', {
      event,
      ...details,
      action: 'security'
    }, userId);
  }
}

export const logger = new Logger();