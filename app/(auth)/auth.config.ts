import type { NextAuthConfig } from 'next-auth';

export const authConfig = {

  pages: {
    signIn: '/login',
    newUser: '/chat',
    error: '/login', // Redirect errors back to login page
  },
  providers: [

    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/chat');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnForgotPassword = nextUrl.pathname.startsWith('/forgot-password');
      const isOnResetPassword = nextUrl.pathname.startsWith('/reset-password');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAuth = nextUrl.pathname.startsWith('/api/auth');
      const isOnRoot = nextUrl.pathname === '/';

      // Always allow access to NextAuth API routes
      if (isOnAuth) {
        return true;
      }

      // Allow access to root for both authenticated and unauthenticated users
      if (isOnRoot) {
        return true;
      }

      if (isLoggedIn && (isOnLogin || isOnRegister || isOnForgotPassword || isOnResetPassword)) {
        return Response.redirect(new URL('/chat', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin || isOnForgotPassword || isOnResetPassword) {
        return true; // Always allow access to auth pages
      }

      if (isOnChat) {
        // Allow all /chat routes, let pages handle access control
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
