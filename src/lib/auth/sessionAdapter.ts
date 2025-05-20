import { Session as NextAuthSession } from 'next-auth';
import { Session } from '@/types';

/**
 * Adapts a NextAuth session to our custom Session type
 * @param nextAuthSession The NextAuth session
 * @returns Our custom Session type
 */
export const adaptSession = (nextAuthSession: NextAuthSession | null): Session | null => {
  if (!nextAuthSession || !nextAuthSession.user) return null;
  
  return {
    user: {
      id: nextAuthSession.user.id as string,
      name: nextAuthSession.user.name as string,
      email: nextAuthSession.user.email as string,
      role: nextAuthSession.user.role as 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER',
      isClientAdmin: nextAuthSession.user.isClientAdmin as boolean | undefined,
      clientId: nextAuthSession.user.clientId as string | undefined
    }
  };
};
