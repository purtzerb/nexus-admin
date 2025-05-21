import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/admin/users/[id]
 * Get a specific admin user by ID
 * Only accessible by admins
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if the user is an admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 400 });
    }

    // Remove sensitive information before sending to client
    const { passwordHash, passwordSalt, ...userWithoutPassword } = user as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return NextResponse.json({ error: 'Failed to fetch admin user' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update a specific admin user
 * Only accessible by admins
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user exists and is an admin
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!existingUser || existingUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 400 });
    }

    // Update user
    const updatedUser = await userService.updateUser(id, data);

    // Remove sensitive information before sending to client
    const { passwordHash, passwordSalt, ...userWithoutPassword } = updatedUser as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a specific admin user
 * Only accessible by admins
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user exists and is an admin
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!existingUser || existingUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 400 });
    }

    // Delete user
    const deletedUser = await userService.deleteUser(id);

    // Remove sensitive information before sending to client
    const { passwordHash, passwordSalt, ...userWithoutPassword } = deletedUser as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 });
  }
}
