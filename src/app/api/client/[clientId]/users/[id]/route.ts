import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canManageClientUsers, clientExists } from '@/lib/auth/permissions';
import { adaptSession } from '@/lib/auth/sessionAdapter';

/**
 * GET /api/client/[clientId]/users/[id]
 * Get a specific client user by ID
 * Accessible by:
 * - Admins (all clients)
 * - SEs (only their assigned clients)
 * - Client admins (only their own client)
 */
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();
    const nextAuthSession = await getServerSession(authOptions);
    const session = adaptSession(nextAuthSession);
    const { clientId, id } = await params;

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

    // Get user
    const user = await userService.getUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user belongs to the specified client
    if (!user || user.role !== 'CLIENT_USER' || user.clientId?.toString() !== clientId) {
      return NextResponse.json({ error: 'User does not belong to this client' }, { status: 400 });
    }

    // Remove sensitive information before sending to client
    const { passwordHash, passwordSalt, ...userWithoutPassword } = user as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching client user:', error);
    return NextResponse.json({ error: 'Failed to fetch client user' }, { status: 500 });
  }
}

/**
 * PUT /api/client/[clientId]/users/[id]
 * Update a specific client user
 * Accessible by:
 * - Admins (all clients)
 * - SEs (only their assigned clients)
 * - Client admins (only their own client)
 */
export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();
    const nextAuthSession = await getServerSession(authOptions);
    const session = adaptSession(nextAuthSession);
    const { clientId, id } = await params;

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

    // Get user
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user belongs to the specified client
    if (!existingUser || existingUser.role !== 'CLIENT_USER' || existingUser.clientId?.toString() !== clientId) {
      return NextResponse.json({ error: 'User does not belong to this client' }, { status: 400 });
    }

    // Get request body
    const data = await request.json();

    // Ensure clientId is not changed
    data.clientId = clientId;

    // Update user
    const updatedUser = await userService.updateUser(id, data);

    // Remove sensitive information before sending to client
    const { passwordHash, passwordSalt, ...userWithoutPassword } = updatedUser as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating client user:', error);
    return NextResponse.json({ error: 'Failed to update client user' }, { status: 500 });
  }
}

/**
 * DELETE /api/client/[clientId]/users/[id]
 * Delete a specific client user
 * Accessible by:
 * - Admins (all clients)
 * - SEs (only their assigned clients)
 * - Client admins (only their own client)
 */
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();
    const nextAuthSession = await getServerSession(authOptions);
    const session = adaptSession(nextAuthSession);
    const { clientId, id } = await params;

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

    // Get user
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user belongs to the specified client
    if (!existingUser || existingUser.role !== 'CLIENT_USER' || existingUser.clientId?.toString() !== clientId) {
      return NextResponse.json({ error: 'User does not belong to this client' }, { status: 400 });
    }

    // Delete user
    const deletedUser = await userService.deleteUser(id);

    // Remove sensitive information before sending to client
    const { passwordHash, passwordSalt, ...userWithoutPassword } = deletedUser as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error deleting client user:', error);
    return NextResponse.json({ error: 'Failed to delete client user' }, { status: 500 });
  }
}
