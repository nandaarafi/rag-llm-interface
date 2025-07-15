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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
};
