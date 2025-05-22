import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/apiAuth';
import WorkflowExecution from '@/models/WorkflowExecution';
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
    
    // Count all workflow executions for this client
    const clientId = new mongoose.Types.ObjectId(user.clientId.toString());
    const count = await WorkflowExecution.countDocuments({ clientId });
    
    return NextResponse.json({
      success: true,
      count
    });
    
  } catch (error) {
    console.error('Error counting workflow executions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
