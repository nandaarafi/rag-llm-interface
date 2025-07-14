import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
// eslint-disable-next-line import/no-unresolved
import { getUser, createUserOauth } from '@/lib/db/queries';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        return users[0] as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn callback:', { user, account, profile });
      
      if (account?.provider === 'google') {
        try {
          console.log('Processing Google OAuth sign in for user:', user.email);
          
          // Check if user exists in your database
          const existingUsers = await getUser(user.email!);
          
          if (existingUsers.length === 0) {
            console.log('Creating new user for:', user.email);
            // Create new user if doesn't exist
            const newUser = await createUserOauth({
              email: user.email!,
              name: user.name!,
              image: user.image,
              provider: 'google',
              providerId: user.id
            });
            // Update the user object with the database user ID
            user.id = newUser.id;
          } else {
            console.log('User already exists:', user.email);
            // Update the user object with the database user ID
            user.id = existingUsers[0].id;
          }
          
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - user:', user);
        token.id = user.id;
        token.email = user.email;
        
        // For credentials login, fetch user data from database to get image
        try {
          const [dbUser] = await getUser(user.email!);
          if (dbUser) {
            token.image = dbUser.image;
            // Set name from email if not provided
            token.name = user.name || user.email!.split('@')[0];
          }
        } catch (error) {
          console.error('Failed to fetch user data in JWT callback:', error);
          // Fallback: set name from email
          token.name = user.name || user.email!.split('@')[0];
        }
      }
      console.log('JWT callback - token:', token);
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      console.log('Session callback - token:', token);
      if (session.user) {
        // Use data from JWT token (which already fetched from database)
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        session.user.name = token.name as string;
      }
      console.log('Session callback - final session:', session);
      return session;
    },
  },
});
