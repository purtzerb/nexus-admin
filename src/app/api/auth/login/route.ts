import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userService } from '@/lib/db/userService';
import { IUser } from '@/models/User';
import { AUTH_URL, AUTH_COOKIE_NAME, AUTH_COOKIE_EXPIRY, LOCAL_AUTH_ENABLED, UserRole } from '@/lib/constants';

/**
 * API endpoint for user login
 * Handles both local authentication and external Braintrust API authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find the user by email
    const user = await userService.getUserByEmail(email) as IUser | null;

    let isAuthenticated = false;
    let authenticatedUser = user;

    // Check if user exists and has local password credentials
    if (LOCAL_AUTH_ENABLED && user && user.passwordHash && user.passwordSalt) {
      // Verify password with local credentials
      const hashedPassword = await bcrypt.hash(password, user.passwordSalt);
      isAuthenticated = hashedPassword === user.passwordHash;
    } else {
      // Authenticate against external Braintrust API
      try {
        const response = await fetch(AUTH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          isAuthenticated = true;
          
          // If user doesn't exist in our database but authenticated via Braintrust API,
          // find or create the user in our database
          if (!authenticatedUser) {
            authenticatedUser = await userService.getUserByEmail(email) as IUser | null;
            
            // If still no user, create a new one with basic information
            if (!authenticatedUser) {
              const newUserData = {
                email: email.toLowerCase(),
                name: email.split('@')[0], // Basic name from email
                role: UserRole.CLIENT_USER, // Default role
                // Add other required fields as needed
              };
              
              authenticatedUser = await userService.createUser(newUserData) as IUser;
            }
          }
        }
      } catch (error) {
        console.error('External authentication error:', error);
      }
    }

    if (!isAuthenticated || !authenticatedUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: authenticatedUser._id,
        role: authenticatedUser.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' } // Using longer expiry time
    );

    // Set the token in a cookie
    const cookiesList = await cookies();
    cookiesList.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AUTH_COOKIE_EXPIRY,
      path: '/',
    });

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      user: {
        id: authenticatedUser._id ? authenticatedUser._id.toString() : '',
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        // Include other necessary user data based on role
        ...(authenticatedUser.role === 'SOLUTIONS_ENGINEER' && {
          assignedClientIds: authenticatedUser.assignedClientIds?.map(id => id.toString()),
          costRate: authenticatedUser.costRate,
          billRate: authenticatedUser.billRate
        }),
        ...(authenticatedUser.role === 'CLIENT_USER' && {
          clientId: authenticatedUser.clientId?.toString(),
          departmentId: authenticatedUser.departmentId?.toString(),
          notifyByEmailForExceptions: authenticatedUser.notifyByEmailForExceptions,
          notifyBySmsForExceptions: authenticatedUser.notifyBySmsForExceptions,
          hasBillingAccess: authenticatedUser.hasBillingAccess,
          isClientAdmin: authenticatedUser.isClientAdmin
        })
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
