import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { IClient } from '@/models/Client';

/**
 * GET /api/admin/clients/[id]/users
 * Get all users associated with a specific client
 * Only accessible by admins and solutions engineers
 */
export async function GET(
  request: NextRequest,
  { params }: any
) {
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

    const {id: clientId} = await params;
    const client = await clientService.getClientById(clientId);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Cast to any to access properties safely
    const clientData = client as any;

    // If user is a solutions engineer, check if they are assigned to this client
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const isAssigned = clientData.assignedSolutionsEngineerIds?.some(
        (id: any) => id.toString() === user.id.toString()
      );

      if (!isAssigned) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    // Log the client ID we're fetching users for
    console.log(`Fetching users for client ID: ${clientId}`);

    // Get all users associated with this client
    const clientUsers = await userService.getClientUsers(clientId);

    // Log the users found
    console.log(`Found ${clientUsers.length} users for client ID ${clientId}:`,
      clientUsers.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, clientId: u.clientId?.toString() })));

    // Format the response
    const users = clientUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isPrimaryContact: user.isPrimaryContact,
      hasBillingAccess: user.hasBillingAccess,
      isClientAdmin: user.isClientAdmin,
      role: user.role
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching client users:', error);
    return NextResponse.json({ error: 'Failed to fetch client users' }, { status: 500 });
  }
}
