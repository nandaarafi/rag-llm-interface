import pino from 'pino';
import { env } from './env';

// Create logger based on environment
const createLogger = () => {
  const isDevelopment = env.NODE_ENV === 'development';

  // Base configuration
  const baseConfig = {
    level: env.LOG_LEVEL,
    name: 'ai-chatbot',
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  // Development: Simple configuration without problematic transport
  if (isDevelopment) {
    return pino({
      ...baseConfig,
      formatters: {
        level: (label) => ({ level: label }),
      },
    });
  }

  // Production: JSON format for structured logging
  return pino({
    ...baseConfig,
    formatters: {
      level: (label) => ({ level: label }),
    },
  });
};

export const logger = createLogger();

// Convenience methods with context
export const createContextLogger = (context: string) => {
  return logger.child({ context });
};

// Auth specific logger
export const authLogger = createContextLogger('auth');

// Database specific logger  
export const dbLogger = createContextLogger('database');

// API specific logger
export const apiLogger = createContextLogger('api');

// Chat specific logger
export const chatLogger = createContextLogger('chat');

// Generic app logger
export const appLogger = createContextLogger('app');

export default logger;