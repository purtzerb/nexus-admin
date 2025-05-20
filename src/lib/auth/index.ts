import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { userService } from '@/lib/db/userService';
import { verifyPassword } from './password';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await userService.getUserByEmail(credentials.email);
        
        if (!user) {
          return null;
        }

        // If user has password hash and salt, verify against those
        if (user.passwordHash && user.passwordSalt) {
          const isValid = await verifyPassword(
            credentials.password,
            user.passwordHash,
            user.passwordSalt
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
        
        // If no password hash/salt, we would authenticate against Braintrust API
        // This is a placeholder for the actual implementation
        console.warn('User does not have password hash/salt. Braintrust API authentication not implemented.');
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }: { token: any; user?: any; trigger?: string }) {
      // If user is provided from credentials login, use that
      if (user) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }
      
      // For server-side requests, we need to check the auth-token cookie
      // This is handled in a custom middleware or API route
      // The code below is a fallback for client-side requests
      
      try {
        // Try to get the auth-token from cookies
        // This is a simplified approach and may need adjustment
        if (typeof window !== 'undefined') {
          const authToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
            
          if (authToken) {
            // In a real implementation, you would verify the token here
            // For now, we'll just log it
            console.log('Found auth-token in client-side code');
          }
        }
      } catch (error) {
        console.error('Error in JWT callback:', error);
      }
      
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        if (!session.user) {
          session.user = {
            id: '',
            name: '',
            email: '',
            role: ''
          };
        }
        
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
        // Set other user properties if available
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isClientAdmin?: boolean;
      clientId?: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
