import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * POST /api/admin/users/check-emails
 * Check if user emails already exist
 * Only accessible by admins
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Authenticate the request
    const user = await getAuthUser(request);
    
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }
    
    // Get emails from request body
    const data = await request.json();
    const { emails } = data;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Missing required parameter: emails' }, { status: 400 });
    }
    
    // Check which emails already exist
    const existingEmails: string[] = [];
    
    for (const email of emails) {
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        existingEmails.push(email);
      }
    }
    
    return NextResponse.json({ existingEmails });
  } catch (error) {
    console.error('Error checking user emails:', error);
    return NextResponse.json({ error: 'Failed to check user emails' }, { status: 500 });
  }
}
