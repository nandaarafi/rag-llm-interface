import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
// eslint-disable-next-line import/no-unresolved
import { getUser, createUserOauth, updateUser } from '@/lib/db/queries';
import { env } from '@/lib/env';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

// Debug ALL environment variables
console.error('All Environment Variables:', {
  // Auth
  authSecret: env.AUTH_SECRET ? 'SET' : 'MISSING',
  nextauthUrl: env.NEXTAUTH_URL,
  
  // Google OAuth
  googleId: env.GOOGLE_ID,
  googleSecret: env.GOOGLE_SECRET ? 'SET' : 'MISSING',
  
  // AI API
  googleAiKey: env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET' : 'MISSING',
  openrouterKey: env.OPENROUTER_API_KEY ? 'SET' : 'NOT_SET',
  
  // Database
  databaseUrl: env.DATABASE_URL ? 'SET' : 'MISSING',
  
  // Email
  resendKey: env.RESEND_API_KEY ? 'SET' : 'MISSING',
  resendFrom: env.RESEND_FROM_EMAIL,
  
  // Payments
  lemonKey: env.LEMONSQUEEZY_API_KEY ? 'SET' : 'MISSING',
  lemonStore: env.LEMONSQUEEZY_STORE_ID || 'NOT_SET',
  lemonVariant: env.LEMONSQUEEZY_VARIANT_ID || 'NOT_SET',
  lemonSecret: env.LEMONSQUEEZY_SIGNING_SECRET ? 'SET' : 'MISSING',
  
  // Files
  uploadthingToken: env.UPLOADTHING_TOKEN ? 'SET' : 'MISSING',
  
  // Environment
  nodeEnv: env.NODE_ENV
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
      // Add debug logging for production
      async profile(profile, tokens) {
        console.error('Google OAuth Profile Debug:', {
          hasProfile: !!profile,
          profileId: profile?.sub,
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
          // console.log('Processing Google OAuth sign in for user:', user.email);
          // console.log('User image from Google:', user.image);
          
          // Check if user exists in your database
          const existingUsers = await getUser(user.email!);
          
          if (existingUsers.length === 0) {
            // console.log('Creating new user for:', user.email);
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
            // console.log('User already exists:', user.email);
            // Update existing user's image if it has changed
            const existingUser = existingUsers[0];
            if (existingUser.image !== user.image && user.image) {
              // console.log('Updating user image:', { old: existingUser.image, new: user.image });
              try {
                await updateUser(existingUser.id, { image: user.image });
                // console.log('User image updated successfully');
              } catch (updateError) {
                console.error('Failed to update user image:', updateError);
                // Continue anyway - don't fail the login
              }
            }
            // Update the user object with the database user ID
            user.id = existingUser.id;
          }
          
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            userEmail: user.email
          });
          return false;
        }
      }
      
      // console.log('SignIn callback completed successfully for provider:', account?.provider || 'credentials');
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
          console.error('Failed to refresh user data in JWT callback:', error);
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
            console.error('Failed to fetch hasAccess for OAuth user:', error);
            token.hasAccess = false;
          }
          
          // console.log('JWT OAuth: Set image from OAuth provider:', user.image);
        } else {
          // For credentials login: fetch user data from database
          try {
            const [dbUser] = await getUser(user.email!);
            if (dbUser) {
              token.image = dbUser.image;
              token.name = user.name || user.email!.split('@')[0];
              token.hasAccess = dbUser.hasAccess;
              // console.log('JWT Credentials: Set image from database:', dbUser.image);
            }
          } catch (error) {
            console.error('Failed to fetch user data in JWT callback:', error);
            token.name = user.name || user.email!.split('@')[0];
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
