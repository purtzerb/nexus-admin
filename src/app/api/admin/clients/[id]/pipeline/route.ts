import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { IClient } from '@/models/Client';

/**
 * GET /api/admin/clients/[id]/pipeline
 * Get pipeline progress for a specific client
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
    
    // In a real implementation, we would fetch pipeline data from a database
    // For now, we'll return placeholder data
    const pipelineSteps = [
      { _id: '1', name: 'Discovery: Initial Survey', status: 'completed', completedDate: '2025-01-15', order: 1 },
      { _id: '2', name: 'Discovery: Process Deep Dive', status: 'completed', completedDate: '2025-01-21', order: 2 },
      { _id: '3', name: 'ADA Proposal Sent', status: 'completed', completedDate: '2025-01-25', order: 3 },
      { _id: '4', name: 'ADA Proposal Review', status: 'in_progress', order: 4 },
      { _id: '5', name: 'ADA Contract Sent', status: 'pending', order: 5 },
      { _id: '6', name: 'ADA Contract Signed', status: 'pending', order: 6 },
      { _id: '7', name: 'Credentials Collected', status: 'pending', order: 7 },
      { _id: '8', name: 'Factory Build Initiated', status: 'pending', order: 8 },
      { _id: '9', name: 'Test Plan Generated', status: 'pending', order: 9 },
      { _id: '10', name: 'Testing Started', status: 'pending', order: 10 },
      { _id: '11', name: 'Production Deploy', status: 'pending', order: 11 }
    ];
    
    return NextResponse.json({ pipelineSteps });
  } catch (error) {
    console.error('Error fetching pipeline progress:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline progress' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/clients/[id]/pipeline
 * Update pipeline progress for a specific client
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
    
    const clientId = params.id;
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
    
    const data = await request.json();
    const { stepName, status } = data;
    
    if (!stepName || !status || !['pending', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ 
        error: 'Missing or invalid fields: stepName and status (pending, in_progress, completed) are required' 
      }, { status: 400 });
    }
    
    // Update the pipeline step using our dedicated method
    const updatedClient = await clientService.updatePipelineStep(
      clientId, 
      stepName, 
      status as 'pending' | 'in_progress' | 'completed'
    );
    
    if (!updatedClient) {
      return NextResponse.json({ error: 'Failed to update pipeline step' }, { status: 500 });
    }
    
    // If a step was completed, find the next pending step and set it as the current phase
    if (status === 'completed') {
      // Get the updated client to find the next pending step
      const refreshedClient = await clientService.getClientById(clientId) as any;
      
      if (refreshedClient && refreshedClient.pipelineSteps) {
        // Sort steps by order
        const sortedSteps = [...refreshedClient.pipelineSteps].sort((a, b) => a.order - b.order);
        
        // Find the first pending step
        const nextPendingStep = sortedSteps.find(step => step.status === 'pending');
        
        if (nextPendingStep) {
          // Update the current phase to the next pending step
          await clientService.updateClientPipelinePhase(clientId, nextPendingStep.name);
        }
      }
    }
    
    // Get the updated client with all changes
    const finalClient = await clientService.getClientById(clientId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Pipeline step updated successfully',
      client: finalClient
    });
  } catch (error) {
    console.error('Error updating pipeline step:', error);
    return NextResponse.json({ error: 'Failed to update pipeline step' }, { status: 500 });
  }
}
