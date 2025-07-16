import { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config };

  return async (request: NextRequest): Promise<boolean> => {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    const requestData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    // Reset window if needed
    if (requestData.lastReset < windowStart) {
      requestData.count = 0;
      requestData.lastReset = now;
    }

    requestData.count++;
    rateLimitMap.set(ip, requestData);

    // Clean up old entries
    if (Math.random() < 0.01) { // 1% chance to clean up
      const cutoff = now - windowMs;
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.lastReset < cutoff) {
          rateLimitMap.delete(key);
        }
      }
    }

    return requestData.count <= maxRequests;
  };
}

// Specific rate limiters for different endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // Stricter for auth endpoints
});

export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 chat messages per minute
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 uploads per hour
});