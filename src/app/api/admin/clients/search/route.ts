import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import Client from '@/models/Client';

/**
 * @swagger
 * /api/admin/clients/search:
 *   get:
 *     summary: Search clients by name
 *     description: Search for clients by name with pagination. Results are sorted alphabetically.
 *     tags: [Clients]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for client name (case insensitive)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of results to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip (for pagination)
 *     responses:
 *       200:
 *         description: List of clients matching the search criteria
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0;

    const filter: any = {};

    // Add search filter if query is provided
    if (query) {
      filter.companyName = { $regex: query, $options: 'i' }; // Case-insensitive search
    }

    // If user is a solutions engineer, only show clients assigned to them
    if (user.role === 'SOLUTIONS_ENGINEER' && user.id) {
      filter.assignedSolutionsEngineerIds = user.id;
    }

    // Get clients
    const clients = await Client.find(filter)
      .select('_id companyName activeSubscriptionId')
      .sort({ companyName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination info
    const totalCount = await Client.countDocuments(filter);

    return NextResponse.json({
      clients,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + clients.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error searching clients:', error);
    return NextResponse.json({ error: 'Failed to search clients' }, { status: 500 });
  }
}
