import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { IClient } from '@/models/Client';
// Import models to ensure they are registered correctly
import '@/models/index';

/**
 * GET /api/admin/clients/[id]/engineers
 * Get all solution engineers assigned to a specific client
 * Only accessible by admins and solutions engineers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Cast to any to access properties safely
    const clientData = client as any;

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If user is a solutions engineer, check if they are assigned to this client
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const isAssigned = clientData.assignedSolutionsEngineerIds?.some(
        (id: any) => id.toString() === user.id.toString()
      );

      if (!isAssigned) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    // Get all solution engineers assigned to this client
    const engineers = [];

    if (clientData.assignedSolutionsEngineerIds && clientData.assignedSolutionsEngineerIds.length > 0) {
      for (const seId of clientData.assignedSolutionsEngineerIds) {
        const engineer = await userService.getUserById(seId.toString());
        if (engineer) {
          // Determine if this engineer is the lead SE (first in the list)
          const isLead = clientData.assignedSolutionsEngineerIds[0].toString() === seId.toString();

          engineers.push({
            _id: engineer._id,
            name: engineer.name,
            email: engineer.email,
            role: engineer.role,
            isLead
          });
        }
      }
    }

    return NextResponse.json({ engineers });
  } catch (error) {
    console.error('Error fetching client engineers:', error);
    return NextResponse.json({ error: 'Failed to fetch client engineers' }, { status: 500 });
  }
}
