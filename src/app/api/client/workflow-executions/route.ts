import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import WorkflowExecution from '@/models/WorkflowExecution';
import Workflow from '@/models/Workflow';
import mongoose from 'mongoose';

// GET endpoint to fetch workflow executions for the client
export async function GET(request: NextRequest) {
  // Authenticate the user
  const authUser = await getAuthUser(request);

  // Check if user is authenticated and has CLIENT_USER role
  if (!authUser) {
    return unauthorizedResponse();
  }

  if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
    return forbiddenResponse('Only client users can access this endpoint');
  }

  // Ensure clientId is available
  if (!authUser.clientId) {
    return forbiddenResponse('Client ID not found for user');
  }

  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Filter parameters
    const workflowId = searchParams.get('workflowId');

    // Convert string ID to ObjectId
    const clientObjectId = new mongoose.Types.ObjectId(authUser.clientId);

    // Build query
    const query: any = { clientId: clientObjectId };

    // Add workflowId filter if provided
    if (workflowId && workflowId !== 'all') {
      query.workflowId = new mongoose.Types.ObjectId(workflowId);
    }

    // Get executions count
    const totalCount = await WorkflowExecution.countDocuments(query);

    // Get executions with pagination
    const executions = await WorkflowExecution.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get all workflows for the client for the dropdown
    const workflows = await Workflow.find({
      clientId: clientObjectId
    }).select('_id name').sort({ name: 1 }).lean();

    return NextResponse.json({
      executions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      workflows
    });

  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json({ error: 'Failed to fetch workflow executions' }, { status: 500 });
  }
}
