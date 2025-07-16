import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authConfig } from '@/app/(auth)/auth.config';
import { apiRateLimit, authRateLimit, chatRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const auth = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check - always allow
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  // Apply rate limiting
  let rateLimitPassed = true;
  
  if (pathname.startsWith('/api/auth')) {
    rateLimitPassed = await authRateLimit(request);
  } else if (pathname.startsWith('/api/chat')) {
    rateLimitPassed = await chatRateLimit(request);
  } else if (pathname.startsWith('/api/')) {
    rateLimitPassed = await apiRateLimit(request);
  }

  if (!rateLimitPassed) {
    logger.securityEvent('rate_limit_exceeded', {
      path: pathname,
      ip: request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown',
    });
    
    return new NextResponse('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  // Apply authentication
  return auth(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (NextAuth API routes)
     * - api/webhook (webhook endpoints)
     * - api/webhook-test (webhook test endpoints) 
     * - api/health (health check endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/webhook|api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};
