import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, true, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', code?: string) {
    super(message, 401, true, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', code?: string) {
    super(message, 403, true, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, true, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', code?: string) {
    super(message, 429, true, code);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 402, true, code);
  }
}

export function handleApiError(error: unknown, userId?: string): {
  message: string;
  statusCode: number;
  code?: string;
} {
  // Log the error
  if (error instanceof AppError) {
    logger.error(error.message, {
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
    }, userId);
  } else if (error instanceof Error) {
    logger.error('Unexpected error', {
      message: error.message,
      stack: error.stack,
    }, userId);
  } else {
    logger.error('Unknown error', { error }, userId);
  }

  // Return sanitized error for client
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    message: isProduction ? 'Internal server error' : (error as Error)?.message || 'Unknown error',
    statusCode: 500,
  };
}

export function createErrorResponse(error: unknown, userId?: string) {
  const { message, statusCode, code } = handleApiError(error, userId);
  
  return Response.json(
    {
      error: {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}