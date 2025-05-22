import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { generatePasswordSalt, hashPassword } from '@/lib/auth/password';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
// Import models to ensure they are registered correctly
import '@/models/index';

/**
 * GET /api/admin/users
 * Get users based on query parameters
 * Admins can access all users
 * Solutions Engineers can only access users for clients they're assigned to
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Authenticate the request
    const user = await getAuthUser(request);
    
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;
    const role = searchParams.get('role');
    const clientId = searchParams.get('clientId');
    
    // Build filter based on query parameters
    let filter: Record<string, any> = {};
    
    // Filter by role if provided
    if (role) {
      filter.role = role;
    } else {
      // Default to ADMIN if no role specified
      filter.role = 'ADMIN';
    }
    
    // Filter by clientId if provided
    if (clientId) {
      filter.clientId = clientId;
      console.log(`Filtering users by clientId: ${clientId}`);
      
      // If user is a solutions engineer, verify they are assigned to this client
      if (user.role === 'SOLUTIONS_ENGINEER') {
        if (!user.assignedClientIds || !user.assignedClientIds.includes(clientId)) {
          return forbiddenResponse('Forbidden: You are not assigned to this client');
        }
      }
    } else if (user.role === 'SOLUTIONS_ENGINEER' && role === 'CLIENT_USER') {
      // SE users can only view client users for clients they're assigned to
      return forbiddenResponse('Forbidden: Must specify a clientId when querying client users');
    }
    
    console.log('User filter:', filter);
    
    // Get users based on filter with department population if clientId is provided
    const options = { limit, skip, sort: { name: 1 as 1 } };
    
    // If filtering by clientId, also populate the department information
    let users;
    if (clientId) {
      users = await userService.getUsersWithDepartments(filter, options);
    } else {
      users = await userService.getUsers(filter, options);
    }
    
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
 * Create a new user (admin, solutions engineer, or client user)
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
    const { 
      name, 
      email, 
      password, 
      phone, 
      role = 'ADMIN',
      clientId,
      departmentId,
      notifyByEmailForExceptions,
      notifyBySmsForExceptions,
      hasBillingAccess,
      isClientAdmin,
      costRate,
      billRate,
      assignedClientIds
    } = data;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields: name and email are required' }, { status: 400 });
    }
    
    // Validate role-specific required fields
    if (role === 'CLIENT_USER' && !clientId) {
      return NextResponse.json({ error: 'Missing required field: clientId is required for CLIENT_USER' }, { status: 400 });
    }
    
    if (role === 'SOLUTIONS_ENGINEER' && (!costRate || !billRate)) {
      return NextResponse.json({ error: 'Missing required fields: costRate and billRate are required for SOLUTIONS_ENGINEER' }, { status: 400 });
    }
    
    // Check if user with email already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    
    // Create user data with appropriate role
    const userData: any = {
      name,
      email: email.toLowerCase(),
      role,
      phone
    };
    
    // Add role-specific fields
    if (role === 'CLIENT_USER') {
      userData.clientId = clientId;
      userData.departmentId = departmentId;
      userData.notifyByEmailForExceptions = notifyByEmailForExceptions || false;
      userData.notifyBySmsForExceptions = notifyBySmsForExceptions || false;
      userData.hasBillingAccess = hasBillingAccess || false;
      userData.isClientAdmin = isClientAdmin || false;
    } else if (role === 'SOLUTIONS_ENGINEER') {
      userData.costRate = costRate;
      userData.billRate = billRate;
      userData.assignedClientIds = assignedClientIds || [];
    }
    
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
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
