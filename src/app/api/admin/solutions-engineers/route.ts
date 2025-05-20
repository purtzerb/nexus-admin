import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import { clientService } from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { generatePasswordSalt, hashPassword } from '@/lib/auth/password';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/admin/solutions-engineers
 * Get all solutions engineers
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
    
    // Get solutions engineers
    const users = await userService.getUsers(
      { role: 'SOLUTIONS_ENGINEER' },
      { limit, skip, sort: { name: 1 as 1 } }
    );
    
    // Remove sensitive information before sending to client
    const sanitizedUsers = users.map(userData => {
      const { passwordHash, passwordSalt, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    });
    
    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Error fetching solutions engineers:', error);
    return NextResponse.json({ error: 'Failed to fetch solutions engineers' }, { status: 500 });
  }
}

/**
 * POST /api/admin/solutions-engineers
 * Create a new solutions engineer
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
    const { name, email, password, phone, costRate, billRate, assignedClientIds } = data;
      
      // Validate required fields
      if (!name || !email || !costRate || !billRate) {
        return NextResponse.json({ 
          error: 'Missing required fields. Name, email, cost rate, and bill rate are required.' 
        }, { status: 400 });
      }
      
      // Check if user with email already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      
      // If assignedClientIds is provided, validate that all clients exist
      if (assignedClientIds && assignedClientIds.length > 0) {
        for (const clientId of assignedClientIds) {
          const client = await clientService.getClientById(clientId);
          if (!client) {
            return NextResponse.json({ error: `Client with ID ${clientId} does not exist` }, { status: 400 });
          }
        }
      }
      
      // Create solutions engineer data
      const userData: any = {
        name,
        email: email.toLowerCase(),
        role: 'SOLUTIONS_ENGINEER' as const,
        phone,
        costRate: Number(costRate),
        billRate: Number(billRate),
        assignedClientIds: assignedClientIds || []
      };
      
      // Only generate password hash and salt if password is provided
      if (password) {
        const passwordSalt = generatePasswordSalt();
        const passwordHash = await hashPassword(password, passwordSalt);
        userData.passwordHash = passwordHash;
        userData.passwordSalt = passwordSalt;
      }
      
      const newUser = await userService.createUser(userData);
      
      // If assignedClientIds is provided, update the clients to add this SE
      if (assignedClientIds && assignedClientIds.length > 0) {
        for (const clientId of assignedClientIds) {
          await clientService.assignSolutionsEngineerToClient(clientId, newUser._id.toString());
        }
      }
      
      // Remove sensitive information before sending to client
      const { passwordHash: _, passwordSalt: __, ...userWithoutPassword } = newUser.toObject();
      
      return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating solutions engineer:', error);
    return NextResponse.json({ error: 'Failed to create solutions engineer' }, { status: 500 });
  }
}
