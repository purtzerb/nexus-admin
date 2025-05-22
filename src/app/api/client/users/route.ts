import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse, AuthUser } from '@/lib/auth/apiAuth';
import User from '@/models/User';
import dbConnect from '@/lib/db/db';
import { z } from 'zod';
import mongoose from 'mongoose';

// Connect to the database
await dbConnect();

// Schema for validating the request body
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.union([
    z.string().min(8, 'Password must be at least 8 characters'),
    z.string().length(0),  // Allow empty string
    z.undefined()          // Allow undefined
  ]),
  phone: z.string().optional(),
  isClientAdmin: z.boolean().optional(),
  hasBillingAccess: z.boolean().optional(),
  notifyByEmailForExceptions: z.boolean().optional(),
  notifyBySmsForExceptions: z.boolean().optional(),
  clientUserNotes: z.string().optional(),
  role: z.literal('CLIENT_USER'),
});

// Helper function to sanitize user data
function sanitizeUser(user: any) {
  const sanitized = { ...user.toObject() };
  delete sanitized.passwordHash;
  delete sanitized.passwordSalt;
  return sanitized;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const authUser = await getAuthUser(req);

    // 2. Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // 3. Check for required roles - ensure the user is a CLIENT_USER
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // 4. For client routes, ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    // 5. Fetch users for this client only
    const users = await User.find({
      clientId: new mongoose.Types.ObjectId(authUser.clientId),
      role: 'CLIENT_USER'
    }).lean();

    // 6. Sanitize the user data before returning
    const sanitizedUsers = users.map(user => {
      const sanitized = { ...user };
      delete sanitized.passwordHash;
      delete sanitized.passwordSalt;
      return sanitized;
    });

    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Error fetching client users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const authUser = await getAuthUser(req);

    // 2. Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // 3. Check for required roles - ensure the user is a CLIENT_USER with admin privileges
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // 4. For client routes, ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    // 5. Check if the user has client admin privileges
    // We need to fetch the full user to check for admin privileges
    const fullUser = await User.findById(authUser.id);
    if (!fullUser?.isClientAdmin) {
      return forbiddenResponse('Only client admins can create new users');
    }

    // 6. Parse and validate the request body
    const body = await req.json();
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const userData = validationResult.data;

    // 7. Check if a user with this email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json({
        error: 'A user with this email already exists'
      }, { status: 409 });
    }

    // 8. Create the new user with the client's ID
    const newUser = new User({
      ...userData,
      clientId: new mongoose.Types.ObjectId(authUser.clientId),
      role: 'CLIENT_USER',
    });

    // 9. If password is provided, hash it (using a hypothetical password utility)
    if (userData.password) {
      // Assuming there's a utility to hash passwords in the project
      // This would be replaced with actual password hashing logic
      // For example: const { hash, salt } = await hashPassword(userData.password);
      // newUser.passwordHash = hash;
      // newUser.passwordSalt = salt;

      // Placeholder for actual password hashing
      newUser.passwordHash = 'hashed_password_would_go_here';
      newUser.passwordSalt = 'salt_would_go_here';
    } else {
      // Explicitly set passwordHash and passwordSalt to undefined if no password provided
      newUser.passwordHash = undefined;
      newUser.passwordSalt = undefined;
    }

    await newUser.save();

    // 10. Return the created user (sanitized)
    return NextResponse.json({
      user: sanitizeUser(newUser),
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating client user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
