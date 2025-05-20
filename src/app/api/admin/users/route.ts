import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { generatePasswordSalt, hashPassword } from '@/lib/auth/password';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/admin/users
 * Get all admin users
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;
    
    // Get admin users
    const users = await userService.getUsers(
      { role: 'ADMIN' },
      { limit, skip, sort: { name: 1 as 1 } }
    );
    
    // Remove sensitive information before sending to client
    const sanitizedUsers = users.map(userData => {
      const { passwordHash, passwordSalt, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    });
    
    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Create a new admin user
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
    
    const data = await request.json();
    const { name, email, password, phone } = data;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields: name and email are required' }, { status: 400 });
    }
    
    // Check if user with email already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    
    // Create admin user data
    const userData: any = {
      name,
      email: email.toLowerCase(),
      role: 'ADMIN' as const,
      phone
    };
    
    // Only generate password hash and salt if password is provided
    if (password) {
      const passwordSalt = generatePasswordSalt();
      const passwordHash = await hashPassword(password, passwordSalt);
      userData.passwordHash = passwordHash;
      userData.passwordSalt = passwordSalt;
    }
    
    const newUser = await userService.createUser(userData);
    
    // Remove sensitive information before sending to client
    const { passwordHash: _, passwordSalt: __, ...userWithoutPassword } = newUser.toObject();
    
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}
