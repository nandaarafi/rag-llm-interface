import type { NextAuthConfig } from 'next-auth';

export const authConfig = {

  pages: {
    signIn: '/login',
    newUser: '/',
    error: '/login', // Redirect errors back to login page
  },
  providers: [

    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnForgotPassword = nextUrl.pathname.startsWith('/forgot-password');
      const isOnResetPassword = nextUrl.pathname.startsWith('/reset-password');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAuth = nextUrl.pathname.startsWith('/api/auth');

      // Always allow access to NextAuth API routes
      if (isOnAuth) {
        return true;
      }

      if (isLoggedIn && (isOnLogin || isOnRegister || isOnForgotPassword || isOnResetPassword)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin || isOnForgotPassword || isOnResetPassword) {
        return true; // Always allow access to auth pages
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
