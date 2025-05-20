import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import Client from '@/models/Client';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/admin/departments/search
 * Search departments across all clients
 * Only accessible by admins
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Authenticate the request
    const user = await getAuthUser(request);
    
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }

    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;
    
    // Create aggregation pipeline to search departments
    const pipeline = [
      // Unwind departments array to work with individual departments
      { $unwind: { path: "$departments", preserveNullAndEmptyArrays: false } } as any,
      
      // Filter departments by name if query is provided
      ...(query.trim() ? [
        { $match: { "departments.name": { $regex: query, $options: 'i' } } } as any
      ] : []),
      
      // Group by department name to get unique departments
      { $group: { 
        _id: "$departments.name", 
        departmentName: { $first: "$departments.name" },
        count: { $sum: 1 } // Count how many clients use this department
      }} as any,
      
      // Sort by department name
      { $sort: { departmentName: 1 } } as any,
      
      // Limit results
      { $limit: limit } as any
    ];
    
    // Execute aggregation
    const departments = await Client.aggregate(pipeline);
    
    // Format response
    const formattedDepartments = departments.map(dept => ({
      name: dept.departmentName,
      clientCount: dept.count
    }));
    
    return NextResponse.json({ departments: formattedDepartments });
  } catch (error) {
    console.error('Error searching departments:', error);
    return NextResponse.json({ error: 'Failed to search departments' }, { status: 500 });
  }
}
