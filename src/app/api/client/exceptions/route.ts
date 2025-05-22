import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import WorkflowException from '@/models/WorkflowException';
import Workflow from '@/models/Workflow';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

// Connect to the database
dbConnect();

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const authUser = await getAuthUser(req);

    // Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Ensure the user has the CLIENT_USER role
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // Ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    await dbConnect();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const workflowId = searchParams.get('workflowId') || 'all';
    const status = searchParams.get('status') || 'all';
    const severity = searchParams.get('severity') || 'all';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build query filter
    const filter: any = { clientId: authUser.clientId };

    if (workflowId !== 'all') {
      filter.workflowId = workflowId;
    }

    if (status !== 'all') {
      filter.status = status;
    }

    if (severity !== 'all') {
      filter.severity = severity;
    }

    // Get total count for pagination
    const totalCount = await WorkflowException.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch exceptions with pagination
    const exceptions = await WorkflowException.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch all workflows for this client for the dropdown
    const workflows = await Workflow.find({ clientId: authUser.clientId })
      .select('_id name')
      .sort({ name: 1 });

    return NextResponse.json({
      exceptions,
      workflows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
