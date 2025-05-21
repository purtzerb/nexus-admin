import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { IClient } from '@/models/Client';
import mongoose from 'mongoose';

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
 * 
 * When a client is deleted:
 * 1. All CLIENT_USER users associated with the client are deleted
 * 2. Solution Engineers are de-associated from the client but not deleted
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  
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
    
    // Start transaction
    session.startTransaction();
    
    // 1. Delete all CLIENT_USER users associated with this client
    console.log(`Deleting users associated with client ${clientId}`);
    const clientUsers = await userService.getClientUsers(clientId);
    for (const clientUser of clientUsers) {
      console.log(`Deleting client user: ${clientUser.email}`);
      await userService.deleteUser(clientUser._id.toString());
    }
    
    // 2. De-associate all Solution Engineers from this client
    // Cast client to any to access assignedSolutionsEngineerIds
    const clientData = client as any;
    if (clientData.assignedSolutionsEngineerIds && Array.isArray(clientData.assignedSolutionsEngineerIds) && clientData.assignedSolutionsEngineerIds.length > 0) {
      console.log(`De-associating SEs from client ${clientId}`);
      for (const seId of clientData.assignedSolutionsEngineerIds) {
        console.log(`De-associating SE ${seId} from client ${clientId}`);
        // Remove this client from the SE's assignedClientIds
        await userService.updateUser(
          seId.toString(),
          { $pull: { assignedClientIds: clientId } } as any
        );
      }
    }
    
    // 3. Delete the client itself
    console.log(`Deleting client ${clientId}`);
    await clientService.deleteClient(clientId);
    
    // Commit the transaction
    await session.commitTransaction();
    
    return NextResponse.json({ 
      success: true,
      message: 'Client deleted successfully along with associated users',
      deletedUsers: clientUsers.length
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    
    console.error('Error deleting client:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  } finally {
    // End session
    session.endSession();
  }
}
