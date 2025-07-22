import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
// eslint-disable-next-line import/no-unresolved
import { getUser, createUserOauth, updateUser } from '@/lib/db/queries';
import { env } from '@/lib/env';
import { authLogger } from '@/lib/logger';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

// Log environment configuration on startup
authLogger.info('Auth module initialized', {
  environment: {
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    nextauthUrl: env.NEXTAUTH_URL,
  },
  providers: {
    google: !!env.GOOGLE_ID,
    credentials: true,
  },
  services: {
    database: !!env.DATABASE_URL,
    email: !!env.RESEND_API_KEY,
    payments: !!env.LEMONSQUEEZY_API_KEY,
  }
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === 'development',
  ...(process.env.NEXTAUTH_URL && {
    basePath: '/api/auth',
    trustHost: true,
  }),
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;
        
        const user = users[0];
        
        // Check if user has no password (OAuth-only user)
        if (!user.password) {
          // console.log('User has no password (OAuth-only):', email);
          return null; // Reject credentials login for OAuth-only users
        }
        
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, user.password!);
        if (!passwordsMatch) return null;
        return user as any;
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // Profile processing with logging
      async profile(profile, tokens) {
        authLogger.debug('Processing Google OAuth profile', {
          profileId: profile?.sub,
          email: profile?.email,
          hasTokens: !!tokens,
          tokenType: tokens?.token_type
        });
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // console.log('NextAuth signIn callback:', { 
      //   userEmail: user.email, 
      //   userImage: user.image, 
      //   provider: account?.provider,
      //   userId: user.id 
      // });
      
      if (account?.provider === 'google') {
        try {
          authLogger.debug('Processing Google OAuth sign-in', { 
            email: user.email,
            providerId: user.id
          });
          
          // Check if user exists in your database
          const existingUsers = await getUser(user.email!);
          
          if (existingUsers.length === 0) {
            authLogger.info('Creating new OAuth user', { email: user.email });
            // Create new user if doesn't exist
            const newUser = await createUserOauth({
              email: user.email!,
              name: user.name!,
              image: user.image || undefined,
              provider: 'google',
              providerId: user.id
            });
            // Update the user object with the database user ID
            user.id = newUser.id;
          } else {
            authLogger.debug('OAuth user already exists', { email: user.email });
            // Update existing user's image if it has changed
            const existingUser = existingUsers[0];
            if (existingUser.image !== user.image && user.image) {
              authLogger.debug('Updating user image', { 
                email: user.email,
                oldImage: existingUser.image,
                newImage: user.image 
              });
              try {
                await updateUser(existingUser.id, { image: user.image });
                authLogger.debug('User image updated successfully');
              } catch (updateError) {
                authLogger.error('Failed to update user image', { 
                  error: updateError,
                  email: user.email 
                });
                // Continue anyway - don't fail the login
              }
            }
            // Update the user object with the database user ID
            user.id = existingUser.id;
          }
          
          return true;
        } catch (error) {
          authLogger.error('Google sign-in failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            email: user.email,
            provider: account?.provider
          });
          return false;
        }
      }
      
      authLogger.debug('SignIn completed successfully', { 
        provider: account?.provider || 'credentials',
        email: user.email 
      });
      return true;
    },
    async redirect({ url, baseUrl }) {
      // console.log('NextAuth redirect callback:', { url, baseUrl });
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default redirect to chat after login
      return `${baseUrl}/chat`
    },
    async jwt({ token, user, account, trigger }) {
      // Always refresh hasAccess from database for existing sessions
      if (!user && token.email) {
        try {
          const [dbUser] = await getUser(token.email as string);
          if (dbUser) {
            token.hasAccess = dbUser.hasAccess;
            token.image = dbUser.image;
          }
        } catch (error) {
          authLogger.error('Failed to refresh user data in JWT callback', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            email: token.email 
          });
        }
      }
      
      if (user) {
        // console.log('JWT callback - user:', user);
        // console.log('JWT callback - account:', account);
        
        token.id = user.id;
        token.email = user.email;
        
        // Handle OAuth vs Credentials differently
        if (account?.provider === 'google') {
          // For OAuth: use data from OAuth provider and fetch hasAccess from database
          token.image = user.image;
          token.name = user.name;
          
          // Get hasAccess from database for OAuth users
          try {
            const [dbUser] = await getUser(user.email!);
            token.hasAccess = dbUser?.hasAccess || false;
          } catch (error) {
            authLogger.error('Failed to fetch hasAccess for OAuth user', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              email: user.email 
            });
            token.hasAccess = false;
          }
          
          // console.log('JWT OAuth: Set image from OAuth provider:', user.image);
        } else {
          // For credentials login: fetch user data from database
          try {
            const [dbUser] = await getUser(user.email!);
            if (dbUser) {
              token.image = dbUser.image;
              token.name = user.name || user.email?.split('@')[0];
              token.hasAccess = dbUser.hasAccess;
              // console.log('JWT Credentials: Set image from database:', dbUser.image);
            }
          } catch (error) {
            authLogger.error('Failed to fetch user data in JWT callback', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              email: user.email 
            });
            token.name = user.name || user.email?.split('@')[0];
            token.image = null;
            token.hasAccess = false;
          }
        }
      }
      // console.log('JWT callback - final token:', token);
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      // console.log('Session callback - token:', token);
      if (session.user) {
        // Use data from JWT token (which already fetched from database)
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        session.user.name = token.name as string;
        (session.user as any).hasAccess = token.hasAccess as boolean;
      }
      // console.log('Session callback - final session:', session);
      return session;
    },
  },
});
