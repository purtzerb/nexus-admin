import { NextRequest, NextResponse } from 'next/server';
import clientService from '@/lib/db/clientService';
import userService from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { IClient, IPipelineStep, IDocumentLink } from '@/models/Client';
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
    
    const data = await request.json();
    
    // Extract users and solution engineers from the request data
    const { users, assignedSolutionsEngineerIds, ...clientUpdateData } = data;
    
    // Update basic client information
    const updateData = {
      ...clientUpdateData,
      updatedAt: new Date()
    };
    
    // Update the client
    const updatedClient = await clientService.updateClient(clientId, updateData);
    
    // Handle users management
    if (users && Array.isArray(users)) {
      // Get existing client users
      const existingUsers = await userService.getClientUsers(clientId);
      const existingUserIds = existingUsers.map(u => u._id.toString());
      
      // Process each user in the request
      for (const userData of users) {
        if (userData._id) {
          // Update existing user
          console.log(`Updating existing user: ${userData.email}`);
          await userService.updateUser(userData._id, {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            departmentId: userData.department, // Use departmentId instead of department
            // Handle exceptions and access separately to avoid type errors
            ...(userData.exceptions ? { 'exceptions.email': userData.exceptions.email, 'exceptions.sms': userData.exceptions.sms } : {}),
            ...(userData.access ? { 'access.billing': userData.access.billing, 'access.admin': userData.access.admin } : {})
          });
          
          // Remove from existingUserIds to track which ones need to be deleted
          const index = existingUserIds.indexOf(userData._id.toString());
          if (index > -1) {
            existingUserIds.splice(index, 1);
          }
        } else {
          // Create new user
          console.log(`Creating new user: ${userData.email}`);
          await userService.createUser({
            ...userData,
            role: 'CLIENT_USER',
            clientId: clientId
          });
        }
      }
      
      // Delete users that were not included in the update
      for (const userId of existingUserIds) {
        console.log(`Deleting user: ${userId}`);
        await userService.deleteUser(userId);
      }
    }
    
    // Handle solutions engineers assignment
    if (assignedSolutionsEngineerIds && Array.isArray(assignedSolutionsEngineerIds)) {
      // Get current assigned SEs - cast client to any to access properties safely
      const clientData = client as any;
      const currentSEs = clientData.assignedSolutionsEngineerIds || [];
      const currentSEIds = currentSEs.map((id: any) => id.toString());
      
      // Find SEs to add (in new list but not in current list)
      const sesToAdd = assignedSolutionsEngineerIds.filter(
        (seId: string) => !currentSEIds.includes(seId.toString())
      );
      
      // Find SEs to remove (in current list but not in new list)
      const sesToRemove = currentSEIds.filter(
        (seId: string) => !assignedSolutionsEngineerIds.includes(seId)
      );
      
      // Add new SEs
      for (const seId of sesToAdd) {
        console.log(`Assigning SE ${seId} to client ${clientId}`);
        // Update the SE's assignedClientIds
        await userService.updateUser(
          seId.toString(),
          { $addToSet: { assignedClientIds: clientId } } as any
        );
      }
      
      // Remove SEs that are no longer assigned
      for (const seId of sesToRemove) {
        console.log(`Removing SE ${seId} from client ${clientId}`);
        // Update the SE's assignedClientIds
        await userService.updateUser(
          seId.toString(),
          { $pull: { assignedClientIds: clientId } } as any
        );
      }
      
      // Update client with new SE list
      await clientService.updateClient(clientId, {
        assignedSolutionsEngineerIds: assignedSolutionsEngineerIds
      });
    }
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Get the updated client with all changes
    const finalClient = await clientService.getClientById(clientId);
    
    return NextResponse.json({ client: finalClient });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    
    console.error('Error updating client:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  } finally {
    // End session
    session.endSession();
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
 * 3. All pipeline steps and document links associated with the client are deleted
 * 4. Any other resources associated with the client are cleaned up
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
    
    // Cast client to any to access properties safely
    const clientData = client as any;
    
    // Start transaction
    session.startTransaction();
    
    // 1. Delete all CLIENT_USER users associated with this client
    console.log(`Deleting users associated with client ${clientId}`);
    const clientUsers = await userService.getClientUsers(clientId);
    
    // Delete each client user
    for (const clientUser of clientUsers) {
      console.log(`Deleting client user: ${clientUser.email}`);
      await userService.deleteUser(clientUser._id.toString());
    }
    
    console.log(`Deleted ${clientUsers.length} client users`);
    
    // Log the pipeline steps and document links that will be deleted
    if (clientData.pipelineSteps && Array.isArray(clientData.pipelineSteps)) {
      console.log(`Deleting ${clientData.pipelineSteps.length} pipeline steps for client ${clientId}`);
    }
    
    if (clientData.documentLinks && Array.isArray(clientData.documentLinks)) {
      console.log(`Deleting ${clientData.documentLinks.length} document links for client ${clientId}`);
    }
    
    // 2. De-associate all Solution Engineers from this client
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
    
    // 3. Delete the client itself (this will also delete embedded documents like pipeline steps and document links)
    console.log(`Deleting client ${clientId}`);
    await clientService.deleteClient(clientId);
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Prepare response with information about what was deleted
    const pipelineStepsCount = clientData.pipelineSteps?.length || 0;
    const documentLinksCount = clientData.documentLinks?.length || 0;
    
    return NextResponse.json({ 
      success: true,
      message: 'Client and all associated data deleted successfully',
      deletedData: {
        clientUsers: clientUsers.length,
        pipelineSteps: pipelineStepsCount,
        documentLinks: documentLinksCount
      }
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
