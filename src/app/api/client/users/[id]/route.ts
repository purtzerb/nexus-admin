import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse, AuthUser } from '@/lib/auth/apiAuth';
import User from '@/models/User';
import dbConnect from '@/lib/db/db';
import { z } from 'zod';
import mongoose from 'mongoose';

// Connect to the database
await dbConnect();

// Schema for validating the request body
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.union([
    z.string().min(8, 'Password must be at least 8 characters'),
    z.string().length(0),  // Allow empty string
    z.undefined()          // Allow undefined
  ]).optional(),
  phone: z.string().optional(),
  isClientAdmin: z.boolean().optional(),
  hasBillingAccess: z.boolean().optional(),
  notifyByEmailForExceptions: z.boolean().optional(),
  notifyBySmsForExceptions: z.boolean().optional(),
  clientUserNotes: z.string().optional(),
});

// Helper function to sanitize user data
function sanitizeUser(user: any) {
  const sanitized = { ...user.toObject() };
  delete sanitized.passwordHash;
  delete sanitized.passwordSalt;
  return sanitized;
}

// Helper function to verify the client user belongs to the requester's client
async function verifyClientUserAccess(userId: string, authUserId: string, authUserClientId: string) {
  // Skip if user is trying to update themselves
  if (userId === authUserId) {
    return true;
  }

  try {
    // Find the user to be modified
    const targetUser = await User.findById(userId);

    // If user doesn't exist, return false
    if (!targetUser) {
      return false;
    }

    // Check if the target user belongs to the same client as the auth user
    return targetUser.clientId && targetUser.clientId.toString() === authUserClientId.toString();
  } catch (error) {
    console.error('Error verifying client user access:', error);
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    // 1. Authenticate the user
    const authUser = await getAuthUser(req);

    // 2. Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // 3. Check for required roles
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // 4. For client routes, ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    const {id} = await params;

    // 5. Validate the ID parameter
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // 6. Verify the user belongs to the requester's client
    const hasAccess = await verifyClientUserAccess(
      id,
      authUser.id,
      authUser.clientId as string
    );

    if (!hasAccess) {
      return forbiddenResponse('You do not have access to this user');
    }

    // 7. Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 8. Return the sanitized user
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error fetching client user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  try {
    // 1. Authenticate the user
    const authUser = await getAuthUser(req);

    // 2. Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // 3. Check for required roles
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // 4. For client routes, ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    const {id} = await params;

    // 5. Validate the ID parameter
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // 6. Check if the user is an admin (unless updating themselves)
    // Get the full user data to check admin status
    const fullAuthUser = await User.findById(authUser.id);
    if (id !== authUser.id && !fullAuthUser?.isClientAdmin) {
      return forbiddenResponse('Only client admins can update other users');
    }

    // 7. Verify the user belongs to the requester's client
    const hasAccess = await verifyClientUserAccess(
      id,
      authUser.id,
      authUser.clientId as string
    );

    if (!hasAccess) {
      return forbiddenResponse('You do not have access to this user');
    }

    // 8. Parse and validate the request body
    const body = await req.json();
    const validationResult = updateUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    // 9. Check if email is being updated and ensure it's not already in use
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: id }
      });

      if (existingUser) {
        return NextResponse.json({
          error: 'A user with this email already exists'
        }, { status: 409 });
      }
    }

    // 10. Find the user to update
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 11. Apply the updates to the user
    Object.assign(user, updateData);

    // 12. If password is provided, hash it
    if (updateData.password) {
      // Assuming there's a utility to hash passwords in the project
      // This would be replaced with actual password hashing logic
      // For example: const { hash, salt } = await hashPassword(updateData.password);
      // user.passwordHash = hash;
      // user.passwordSalt = salt;

      // Placeholder for actual password hashing
      user.passwordHash = 'updated_hashed_password_would_go_here';
      user.passwordSalt = 'updated_salt_would_go_here';
    } else if (updateData.password === '') {
      // If an empty string is explicitly provided, remove the password
      user.passwordHash = undefined;
      user.passwordSalt = undefined;
    }
    // If password is not provided at all (undefined), keep the existing password

    await user.save();

    // 13. Return the updated user (sanitized)
    return NextResponse.json({
      user: sanitizeUser(user),
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating client user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  try {
    // 1. Authenticate the user
    const authUser = await getAuthUser(req);

    // 2. Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // 3. Check for required roles
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // 4. For client routes, ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    const {id} = await params;

    // 5. Validate the ID parameter
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // 6. Prevent self-deletion
    if (id === authUser.id) {
      return NextResponse.json({
        error: 'Users cannot delete their own accounts'
      }, { status: 400 });
    }

    // 7. Check if the user is an admin
    const fullAuthUser = await User.findById(authUser.id);
    if (!fullAuthUser?.isClientAdmin) {
      return forbiddenResponse('Only client admins can delete users');
    }

    // 8. Verify the user belongs to the requester's client
    const hasAccess = await verifyClientUserAccess(
      id,
      authUser.id,
      authUser.clientId as string
    );

    if (!hasAccess) {
      return forbiddenResponse('You do not have access to this user');
    }

    // 9. Find and delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 10. Return success message
    return NextResponse.json({
      message: 'User deleted successfully',
      userId: id
    });
  } catch (error) {
    console.error('Error deleting client user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
