import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { exceptionService } from '@/lib/db/exceptionService';
import dbConnect from '@/lib/db/db';
import { WorkflowException } from '@/models';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(req);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }

    // Parse query parameters
    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId');
    const exceptionType = url.searchParams.get('exceptionType');
    const severity = url.searchParams.get('severity');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter based on query parameters
    const filter: Record<string, any> = {};

    if (clientId && clientId !== 'all') {
      filter.clientId = clientId;
    }

    if (exceptionType && exceptionType !== 'all') {
      filter.exceptionType = exceptionType;
    }

    if (severity && severity !== 'all') {
      filter.severity = severity;
    }

    console.log('Fetching exceptions with filter:', JSON.stringify(filter));

    // Get exceptions with pagination
    const [exceptions, totalCount] = await Promise.all([
      exceptionService.getExceptions(filter, {
        skip,
        limit,
        sort: { createdAt: -1 }
      }),
      WorkflowException.countDocuments(filter)
    ]);

    console.log(`Found ${exceptions.length} exceptions out of ${totalCount} total`);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      exceptions,
      totalCount,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exceptions' },
      { status: 500 }
    );
  }
}
