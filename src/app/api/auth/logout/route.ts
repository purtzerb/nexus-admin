import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

/**
 * API endpoint for user logout
 * Clears the authentication cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookiesList = await cookies();
    cookiesList.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
