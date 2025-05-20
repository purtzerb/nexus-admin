import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/apiAuth';

/**
 * GET /api/clients
 * Get clients based on user role
 * - Admins: all clients
 * - SEs: only assigned clients
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Authenticate the request
    const user = await getAuthUser(request);
    
    if (!user) {
      return unauthorizedResponse();
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;
    
    const filter = {};
    const options = { limit, skip, sort: { name: 1 as 1 } };
    
    // If user is SE, they can only see their assigned clients
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clients = await clientService.getClientsBySolutionsEngineer(user.id);
      return NextResponse.json({ clients });
    }
    
    // For admins, return all clients
    if (user.role === 'ADMIN') {
      const clients = await clientService.getClients(filter, options);
      return NextResponse.json({ clients });
    }
    
    // Client users can only see their own client
    if (user.role === 'CLIENT_USER' && user.clientId) {
      const client = await clientService.getClientById(user.clientId);
      return NextResponse.json({ clients: client ? [client] : [] });
    }
    
    // If no role matches, return empty array
    return NextResponse.json({ clients: [] });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
