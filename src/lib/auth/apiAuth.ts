import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adaptSession } from '@/lib/auth/sessionAdapter';
import { jwtVerify } from 'jose';
import { userService } from '@/lib/db/userService';

export type UserRole = 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  clientId?: string;
}

/**
 * Authenticate a request and get user information
 * @param request The Next.js request object
 * @returns User information if authenticated, null if not
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  // Try JWT token first (our primary auth method)
  const authToken = request.cookies.get('auth-token');
  
  if (authToken) {
    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(authToken.value, secret);
      
      // Extract user info from JWT payload
      const userId = payload.userId as string;
      const userRole = payload.role as UserRole;
      const email = payload.email as string | undefined;
      
      if (!userId || !userRole) {
        console.error('Invalid JWT payload - missing userId or role');
        return null;
      }
      
      // For client users, we may need to fetch additional info
      if (userRole === 'CLIENT_USER') {
        const user = await userService.getUserById(userId);
        if (user) {
          return {
            id: userId,
            email: email || user.email,
            role: userRole,
            clientId: user.clientId?.toString()
          };
        }
      }
      
      return {
        id: userId,
        email,
        role: userRole
      };
    } catch (error) {
      console.error('Error verifying JWT token:', error);
    }
  }
  
  // Fallback to NextAuth session if JWT fails
  const nextAuthSession = await getServerSession(authOptions);
  const session = adaptSession(nextAuthSession);
  
  if (session?.user?.id && session?.user?.role) {
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role as UserRole,
      clientId: session.user.clientId
    };
  }
  
  return null;
}

/**
 * Check if a user has the required role
 * @param user The authenticated user
 * @param requiredRoles Array of roles that are allowed to access the resource
 * @returns True if user has one of the required roles, false otherwise
 */
export function hasRequiredRole(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Create an unauthorized response
 * @param message Custom error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create a forbidden response
 * @param message Custom error message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(message = 'Forbidden: Insufficient permissions'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}
