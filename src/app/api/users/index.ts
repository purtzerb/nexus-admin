import { NextRequest, NextResponse } from 'next/server';
import userService from '@/lib/db/userService';

/**
 * API handler for /api/users
 * Supports GET (list users) and POST (create user)
 */
export async function GET(request: NextRequest) {
  try {
    // Get URL search params
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    // Get all users (with optional filtering)
    const users = await userService.getUsers(searchParams);
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();

    // Create a new user
    const user = await userService.createUser(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}
