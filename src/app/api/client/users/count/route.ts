import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/apiAuth';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Authenticate the request
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is a CLIENT_USER and has a clientId
    if (user.role !== 'CLIENT_USER' || !user.clientId) {
      return NextResponse.json({ error: 'Forbidden - Invalid access' }, { status: 403 });
    }
    
    // Count all active users for this client
    const clientId = new mongoose.Types.ObjectId(user.clientId.toString());
    const count = await User.countDocuments({
      clientId,
      role: 'CLIENT_USER'
    });
    
    return NextResponse.json({
      success: true,
      count
    });
    
  } catch (error) {
    console.error('Error counting client users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
