import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import { clientService } from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { ObjectId } from 'mongoose';

/**
 * GET /api/admin/solutions-engineers/[id]
 * Get a specific solutions engineer by ID
 * Only accessible by admins
 */
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();

    // Authenticate the request
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return unauthorizedResponse();
    }

    // Check if user has admin role
    if (!hasRequiredRole(authUser, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }

    const { id } = await params;
    const user = await userService.getUserById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user is a solutions engineer
    if (user.role !== 'SOLUTIONS_ENGINEER') {
      return NextResponse.json({ error: 'Not a solutions engineer' }, { status: 400 });
    }

    // Remove sensitive information before sending to client
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, passwordSalt, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching solutions engineer:', error);
    return NextResponse.json({ error: 'Failed to fetch solutions engineer' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/solutions-engineers/[id]
 * Update a specific solutions engineer
 * Only accessible by admins
 */
export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();

    // Authenticate the request
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return unauthorizedResponse();
    }

    // Check if user has admin role
    if (!hasRequiredRole(authUser, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }

    const { id } = await params;
    const data = await request.json();

    // Check if user exists and is a solutions engineer
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.role !== 'SOLUTIONS_ENGINEER') {
      return NextResponse.json({ error: 'Not a solutions engineer' }, { status: 400 });
    }

    // If assignedClientIds is provided, validate that all clients exist
    if (data.assignedClientIds && data.assignedClientIds.length > 0) {
      for (const clientId of data.assignedClientIds) {
        const client = await clientService.getClientById(clientId);
        if (!client) {
          return NextResponse.json({ error: `Client with ID ${clientId} does not exist` }, { status: 400 });
        }
      }

      // Get current assigned clients
      const currentAssignedClientIds = existingUser.assignedClientIds || [];

      // Find clients to add and remove
      const clientsToAdd = data.assignedClientIds.filter(
        (clientId: string) => !currentAssignedClientIds.some((id: any) => id.toString() === clientId.toString())
      );

      const clientsToRemove = currentAssignedClientIds.filter(
        (clientId: any) => !data.assignedClientIds.some((id: string) => id.toString() === clientId.toString())
      );

      // Update client assignments
      for (const clientId of clientsToAdd) {
        await clientService.assignSolutionsEngineerToClient(clientId, id);
      }

      for (const clientId of clientsToRemove) {
        await clientService.removeSolutionsEngineerFromClient(clientId.toString(), id);
      }
    }

    // Update user
    const updatedUser = await userService.updateUser(id, data);

    // Remove sensitive information before sending to client
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    const { passwordHash, passwordSalt, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating solutions engineer:', error);
    return NextResponse.json({ error: 'Failed to update solutions engineer' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/solutions-engineers/[id]
 * Delete a specific solutions engineer
 * Only accessible by admins
 */
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();

    // Authenticate the request
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return unauthorizedResponse();
    }

    // Check if user has admin role
    if (!hasRequiredRole(authUser, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }

    const { id } = await params;

    // Check if user exists and is a solutions engineer
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.role !== 'SOLUTIONS_ENGINEER') {
      return NextResponse.json({ error: 'Not a solutions engineer' }, { status: 400 });
    }

    // Remove SE from all assigned clients
    const assignedClientIds = existingUser.assignedClientIds || [];
    for (const clientId of assignedClientIds) {
      await clientService.removeSolutionsEngineerFromClient(clientId.toString(), id);
    }

    // Delete user
    const deletedUser = await userService.deleteUser(id);

    // Remove sensitive information before sending to client
    if (!deletedUser) {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    const { passwordHash, passwordSalt, ...userWithoutPassword } = deletedUser;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error deleting solutions engineer:', error);
    return NextResponse.json({ error: 'Failed to delete solutions engineer' }, { status: 500 });
  }
}
