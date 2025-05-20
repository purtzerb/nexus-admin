import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/admin/clients
 * Get all clients
 * Only accessible by admins and solutions engineers
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;
    
    let filter = {};
    
    // If user is a solutions engineer, only show clients assigned to them
    if (user.role === 'SOLUTIONS_ENGINEER' && user.id) {
      filter = { assignedSolutionsEngineerIds: user.id };
    }
    
    // Get clients
    const clients = await clientService.getClients(
      filter,
      { limit, skip, sort: { companyName: 1 as 1 } }
    );
    
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients
 * Create a new client
 * Only accessible by admins
 */
export async function POST(request: NextRequest) {
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
    
    const data = await request.json();
    const { 
      companyName, 
      companyUrl, 
      contactName, 
      industry, 
      status = 'PENDING',
      departments = [],
      users = [],
      assignedSolutionsEngineerIds = []
    } = data;
    
    // Validate required fields
    if (!companyName) {
      return NextResponse.json({ error: 'Missing required field: company name is required' }, { status: 400 });
    }
    
    // Create client data
    const clientData = {
      companyName,
      companyUrl,
      contactName,
      industry,
      status,
      departments,
      users,
      assignedSolutionsEngineerIds
    };
    
    const newClient = await clientService.createClient(clientData);
    
    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
