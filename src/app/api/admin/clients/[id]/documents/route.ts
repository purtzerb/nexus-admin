import { NextRequest, NextResponse } from 'next/server';
import clientService from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { IClient, IDocumentLink } from '@/models/Client';

/**
 * GET /api/admin/clients/[id]/documents
 * Get all documents associated with a specific client
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

    // Return the document links from the client model
    const documentLinks = clientData.documentLinks || [];

    return NextResponse.json({ documents: documentLinks });
  } catch (error) {
    console.error('Error fetching client documents:', error);
    return NextResponse.json({ error: 'Failed to fetch client documents' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/clients/[id]/documents
 * Update a document link for a specific client
 * Only accessible by admins and solutions engineers
 */
export async function PUT(
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

    // Parse the request body
    const data = await request.json();
    const { type, url } = data;

    if (!type || typeof url !== 'string') {
      return NextResponse.json({
        error: 'Missing or invalid fields: type and url are required'
      }, { status: 400 });
    }

    // Update the document link for the specified type
    const updateData = {
      $set: {
        'documentLinks.$[docLink].url': url
      }
    };

    const options = {
      new: true,
      runValidators: true,
      arrayFilters: [{ 'docLink.type': type }]
    };

    const updatedClient = await clientService.updateClient(clientId, updateData, options);

    if (!updatedClient) {
      return NextResponse.json({ error: 'Failed to update document link' }, { status: 500 });
    }

    // Return the updated document links
    const updatedDocumentLinks = (updatedClient as any).documentLinks || [];

    return NextResponse.json({
      success: true,
      documents: updatedDocumentLinks
    });
  } catch (error) {
    console.error('Error updating document link:', error);
    return NextResponse.json({ error: 'Failed to update document link' }, { status: 500 });
  }
}
