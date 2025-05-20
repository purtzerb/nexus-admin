import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { userService } from '@/lib/db/userService';
import { IUser } from '@/models/User';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { AUTH_COOKIE_NAME, UserRole } from '@/lib/constants';

/**
 * API endpoint to check if a user is authenticated
 * Returns user data if authenticated, 401 if not
 */
export async function GET(request: NextRequest) {
  try {
    // Get the token from the cookie
    const cookiesList = await cookies();
    const token = cookiesList.get(AUTH_COOKIE_NAME);

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload } = await jwtVerify(token.value, secretKey);
    const decoded = payload as unknown as { userId: string };

    // Find the user
    const user = await userService.getUserById(decoded.userId) as IUser | null;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Return the user data (excluding sensitive information)
    return NextResponse.json({
      user: {
        id: user._id ? user._id.toString() : '',
        name: user.name,
        email: user.email,
        role: user.role,
        // Include other necessary user data based on role
        ...(user.role === 'SOLUTIONS_ENGINEER' && {
          assignedClientIds: user.assignedClientIds?.map(id => id.toString()),
          costRate: user.costRate,
          billRate: user.billRate
        }),
        ...(user.role === 'CLIENT_USER' && {
          clientId: user.clientId?.toString(),
          departmentId: user.departmentId?.toString(),
          notifyByEmailForExceptions: user.notifyByEmailForExceptions,
          notifyBySmsForExceptions: user.notifyBySmsForExceptions,
          hasBillingAccess: user.hasBillingAccess,
          isClientAdmin: user.isClientAdmin
        })
      }
    });
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
