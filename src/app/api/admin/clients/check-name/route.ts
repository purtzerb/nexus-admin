import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/admin/clients/check-name
 * Check if a client name already exists
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
    
    // Get the client name from query parameters
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json({ error: 'Missing required parameter: name' }, { status: 400 });
    }
    
    // Check if a client with this name exists
    const existingClient = await clientService.getClientByName(name);
    
    return NextResponse.json({ exists: !!existingClient });
  } catch (error) {
    console.error('Error checking client name:', error);
    return NextResponse.json({ error: 'Failed to check client name' }, { status: 500 });
  }
}
