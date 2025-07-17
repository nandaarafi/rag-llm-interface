import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (NextAuth API routes)
     * - api/webhook (webhook endpoints)
     * - api/webhook-test (webhook test endpoints)
     * - api/forgot-password (password reset)
     * - api/reset-password (password reset)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/webhook|api/forgot-password|api/reset-password|_next/static|_next/image|favicon.ico).*)',
  ],
};
