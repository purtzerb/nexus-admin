import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import dbConnect from '@/lib/db/db';
import { WorkflowException } from '@/models';
import mongoose from 'mongoose';

// Define interfaces for typing
interface IWorkflowException {
  _id: mongoose.Types.ObjectId;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  clientId: {
    _id: mongoose.Types.ObjectId;
  };
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/exceptions/[id] - Get a specific exception
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(req);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid exception ID format' },
        { status: 400 }
      );
    }

    const exception = await WorkflowException.findById(id)
      .populate('workflowId')
      .populate('clientId')
      .lean() as any;

    if (!exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      );
    }

    // For SE users, check if the exception belongs to one of their assigned clients
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clientId = exception.clientId._id.toString();
      if (!user.assignedClientIds || !user.assignedClientIds.includes(clientId)) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    return NextResponse.json({ exception });
  } catch (error) {
    console.error('Error fetching exception:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exception' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/exceptions/[id] - Update a specific exception's status
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(req);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid exception ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const data = await req.json();
    
    // Validate status
    if (!data.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Validate status value
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Find the exception
    const exception = await WorkflowException.findById(id).populate('clientId') as mongoose.Document & IWorkflowException;

    if (!exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      );
    }

    // For SE users, check if the exception belongs to one of their assigned clients
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clientId = exception.clientId._id.toString();
      if (!user.assignedClientIds || !user.assignedClientIds.includes(clientId)) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    // Update exception status
    exception.status = data.status;
    await exception.save();

    return NextResponse.json({
      message: 'Exception status updated successfully',
      exception
    });
  } catch (error) {
    console.error('Error updating exception status:', error);
    return NextResponse.json(
      { error: 'Failed to update exception status' },
      { status: 500 }
    );
  }
}
