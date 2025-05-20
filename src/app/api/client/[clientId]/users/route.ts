import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePasswordSalt, hashPassword } from '@/lib/auth/password';
import { canManageClientUsers, clientExists } from '@/lib/auth/permissions';
import { adaptSession } from '@/lib/auth/sessionAdapter';

/**
 * GET /api/client/[clientId]/users
 * Get all users for a specific client
 * Accessible by:
 * - Admins (all clients)
 * - SEs (only their assigned clients)
 * - Client admins (only their own client)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    await dbConnect();
    const nextAuthSession = await getServerSession(authOptions);
    const session = adaptSession(nextAuthSession);
    const { clientId } = params;
    
    // Check if client exists
    const exists = await clientExists(clientId);
    if (!exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Check if user has permission to access this client's users
    const hasPermission = await canManageClientUsers(session, clientId);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to access this client' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;
    
    // Get client users
    const users = await userService.getUsers(
      { role: 'CLIENT_USER', clientId },
      { limit, skip, sort: { name: 1 } }
    );
    
    // Remove sensitive information before sending to client
    const sanitizedUsers = users.map(user => {
      const { passwordHash, passwordSalt, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Error fetching client users:', error);
    return NextResponse.json({ error: 'Failed to fetch client users' }, { status: 500 });
  }
}

/**
 * POST /api/client/[clientId]/users
 * Create a new client user
 * Accessible by:
 * - Admins (all clients)
 * - SEs (only their assigned clients)
 * - Client admins (only their own client)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    await dbConnect();
    const nextAuthSession = await getServerSession(authOptions);
    const session = adaptSession(nextAuthSession);
    const { clientId } = params;
    
    // Check if client exists
    const exists = await clientExists(clientId);
    if (!exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Check if user has permission to manage this client's users
    const hasPermission = await canManageClientUsers(session, clientId);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to manage users for this client' }, { status: 403 });
    }
    
    const data = await request.json();
    const { 
      name, 
      email, 
      password, 
      phone, 
      departmentId, 
      notifyByEmailForExceptions, 
      notifyBySmsForExceptions,
      hasBillingAccess,
      isClientAdmin,
      clientUserNotes
    } = data;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields: name, email, and password are required' }, { status: 400 });
    }
    
    // Check if user with email already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    
    // Generate password hash and salt
    const passwordSalt = generatePasswordSalt();
    const passwordHash = await hashPassword(password, passwordSalt);
    
    // Create client user
    const userData = {
      name,
      email: email.toLowerCase(),
      role: 'CLIENT_USER' as const,
      passwordHash,
      passwordSalt,
      phone,
      clientId,
      departmentId,
      notifyByEmailForExceptions: notifyByEmailForExceptions || false,
      notifyBySmsForExceptions: notifyBySmsForExceptions || false,
      hasBillingAccess: hasBillingAccess || false,
      isClientAdmin: isClientAdmin || false,
      clientUserNotes
    };
    
    const newUser = await userService.createUser(userData);
    
    // Remove sensitive information before sending to client
    const { passwordHash: _, passwordSalt: __, ...userWithoutPassword } = newUser.toObject();
    
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating client user:', error);
    return NextResponse.json({ error: 'Failed to create client user' }, { status: 500 });
  }
}
