import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { IClient } from '@/models/Client';

/**
 * GET /api/admin/clients/[id]
 * Get a specific client by ID
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
    
    const clientId = params.id;
    const client = await clientService.getClientById(clientId);
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // If user is a solutions engineer, check if they are assigned to this client
    if (user.role === 'SOLUTIONS_ENGINEER' && client && 'assignedSolutionsEngineerIds' in client && Array.isArray(client.assignedSolutionsEngineerIds)) {
      const isAssigned = client.assignedSolutionsEngineerIds.some(
        id => id.toString() === user.id.toString()
      );
      
      if (!isAssigned) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }
    
    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/clients/[id]
 * Update a specific client
 * Only accessible by admins
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
    
    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }
    
    const clientId = params.id;
    const client = await clientService.getClientById(clientId);
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    const data = await request.json();
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const updatedClient = await clientService.updateClient(clientId, updateData);
    
    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/clients/[id]
 * Delete a specific client
 * Only accessible by admins
 */
export async function DELETE(
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
    
    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }
    
    const clientId = params.id;
    const client = await clientService.getClientById(clientId);
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    await clientService.deleteClient(clientId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
