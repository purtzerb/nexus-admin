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

    // Ensure params.id is properly awaited
    const clientId = params?.id ? await Promise.resolve(params.id) : null;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
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

    // Fetch the client's pipeline steps from the database
    let pipelineSteps = [];

    // Check if client has pipeline steps
    if (clientData.pipelineSteps && Array.isArray(clientData.pipelineSteps) && clientData.pipelineSteps.length > 0) {
      // Map the pipeline steps to the expected format
      pipelineSteps = clientData.pipelineSteps.map((step: any) => ({
        _id: step._id.toString(),
        name: step.name,
        status: step.status,
        completedDate: step.completedDate ? step.completedDate.toISOString() : undefined,
        order: step.order
      }));
    } else {
      // If client doesn't have pipeline steps, initialize with default steps
      // This ensures new clients have a pipeline to work with
      const defaultPipelineSteps = [
        { name: 'Discovery: Initial Survey', status: 'pending', order: 1 },
        { name: 'Discovery: Process Deep Dive', status: 'pending', order: 2 },
        { name: 'ADA Proposal Sent', status: 'pending', order: 3 },
        { name: 'ADA Proposal Review', status: 'pending', order: 4 },
        { name: 'ADA Contract Sent', status: 'pending', order: 5 },
        { name: 'ADA Contract Signed', status: 'pending', order: 6 },
        { name: 'Credentials Collected', status: 'pending', order: 7 },
        { name: 'Factory Build Initiated', status: 'pending', order: 8 },
        { name: 'Test Plan Generated', status: 'pending', order: 9 },
        { name: 'Testing Started', status: 'pending', order: 10 },
        { name: 'Production Deploy', status: 'pending', order: 11 }
      ];

      // Save default pipeline steps to the client
      await clientService.updateClient(clientId, { pipelineSteps: defaultPipelineSteps });

      // Fetch the updated client to get the generated _ids
      const updatedClient = await clientService.getClientById(clientId) as any;
      if (updatedClient && updatedClient.pipelineSteps) {
        pipelineSteps = updatedClient.pipelineSteps.map((step: any) => ({
          _id: step._id.toString(),
          name: step.name,
          status: step.status,
          completedDate: step.completedDate ? step.completedDate.toISOString() : undefined,
          order: step.order
        }));
      }
    }

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

    // Ensure params.id is properly awaited
    const {id: clientId} = await params

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
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

    if (!stepName || !status || !['pending', 'completed'].includes(status)) {
      return NextResponse.json({
        error: 'Missing or invalid fields: stepName and status (pending, completed) are required'
      }, { status: 400 });
    }

    // Update the pipeline step using our dedicated method
    const updatedClient = await clientService.updatePipelineStep(
      clientId,
      stepName,
      status as 'pending' | 'completed'
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
