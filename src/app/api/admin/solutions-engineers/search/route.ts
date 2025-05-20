import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/admin/solutions-engineers/search
 * Search solutions engineers by name or email
 * Only accessible by admins
 */
export async function GET(request: NextRequest) {
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

    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;
    
    // Create search filter
    const filter: any = { role: 'SOLUTIONS_ENGINEER' };
    
    // Add search query if provided
    if (query.trim()) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },  // Case-insensitive name search
        { email: { $regex: query, $options: 'i' } }  // Case-insensitive email search
      ];
    }
    
    // Get solutions engineers matching the search query
    const users = await userService.getUsers(
      filter,
      { limit, sort: { name: 1 as 1 } }
    );
    
    // Remove sensitive information before sending to client
    const sanitizedUsers = users.map(userData => {
      const { passwordHash, passwordSalt, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    });
    
    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Error searching solutions engineers:', error);
    return NextResponse.json({ error: 'Failed to search solutions engineers' }, { status: 500 });
  }
}
