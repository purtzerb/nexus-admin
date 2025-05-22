import { NextRequest, NextResponse } from 'next/server';
import { workflowService } from '@/lib/db/workflowService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { clientService } from '@/lib/db/clientService';
import mongoose from 'mongoose';
import Workflow from '@/models/Workflow';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/clients/[id]/workflows
 * Get workflows for a specific client
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

    // Ensure params.id is properly awaited
    const { id: clientId } = await params;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Check if client exists
    const client = await clientService.getClientById(clientId);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If user is a solutions engineer, check if they are assigned to this client
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clientData = client as any;
      const isAssigned = clientData.assignedSolutionsEngineerIds?.some(
        (id: any) => id.toString() === user.id.toString()
      );

      if (!isAssigned) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    // Get workflows for this client
    const workflows = await workflowService.getWorkflowsByClientId(clientId);

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Error fetching client workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch client workflows' }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients/[id]/workflows
 * Create a new workflow for a specific client
 * Only accessible by admins and solutions engineers
 */
export async function POST(
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

    // Ensure params.id is properly awaited
    const { id: clientId } = await params;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Check if client exists
    const client = await clientService.getClientById(clientId);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If user is a solutions engineer, check if they are assigned to this client
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clientData = client as any;
      const isAssigned = clientData.assignedSolutionsEngineerIds?.some(
        (id: any) => id.toString() === user.id.toString()
      );

      if (!isAssigned) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    // Parse request body
    const data = await request.json();
    const { name, departmentId, status, timeSavedPerExecution, moneySavedPerExecution } = data;

    // Validate required fields
    if (!name) {
      return NextResponse.json({
        error: 'Missing required fields: name is required'
      }, { status: 400 });
    }

    // Create workflow
    const workflowData: any = {
      clientId: new mongoose.Types.ObjectId(clientId),
      name,
      numberOfExecutions: 0,
      numberOfExceptions: 0,
      status: status || 'ACTIVE',
      timeSavedPerExecution: timeSavedPerExecution !== '' ? timeSavedPerExecution : undefined,
      moneySavedPerExecution: moneySavedPerExecution !== '' ? moneySavedPerExecution : undefined
    };

    // Only set departmentId if it's a valid ObjectId
    if (departmentId && mongoose.isValidObjectId(departmentId)) {
      workflowData.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    // Remove any department property if it was sent (we only use departmentId)
    delete (workflowData as any).department;

    const workflow = await workflowService.createWorkflow(workflowData);

    return NextResponse.json({
      success: true,
      message: 'Workflow created successfully',
      workflow
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/clients/[id]/workflows
 * Update an existing workflow
 * Only accessible by admins and solutions engineers
 */
export async function PUT(
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

    // Ensure params.id is properly awaited
    const { id: clientId } = await params;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Parse request body
    const data = await request.json();
    const { workflowId, name, departmentId, status, timeSavedPerExecution, moneySavedPerExecution } = data;

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json({
        error: 'Missing required fields: name is required'
      }, { status: 400 });
    }

    // Check if workflow exists and belongs to this client
    const existingWorkflow = await Workflow.findById(workflowId).lean();

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Type assertion to access clientId
    const workflow = existingWorkflow as unknown as { clientId: { toString: () => string } };
    if (workflow.clientId.toString() !== clientId) {
      return NextResponse.json({
        error: 'Workflow does not belong to this client'
      }, { status: 403 });
    }

    // Update workflow
    const updateData: any = {
      name,
      status: status || 'ACTIVE',
      timeSavedPerExecution: timeSavedPerExecution !== '' ? timeSavedPerExecution : undefined,
      moneySavedPerExecution: moneySavedPerExecution !== '' ? moneySavedPerExecution : undefined
    };

    // Only set departmentId if it's a valid ObjectId
    if (departmentId && mongoose.isValidObjectId(departmentId)) {
      updateData.departmentId = new mongoose.Types.ObjectId(departmentId);
    } else if (departmentId === '') {
      // If empty string, set to null/undefined to clear the department
      updateData.departmentId = null;
    }

    // Remove any department property if it was sent (we only use departmentId)
    delete (updateData as any).department;

    const updatedWorkflow = await workflowService.updateWorkflow(workflowId, updateData);

    return NextResponse.json({
      success: true,
      message: 'Workflow updated successfully',
      workflow: updatedWorkflow
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/clients/[id]/workflows
 * Delete a workflow
 * Only accessible by admins and solutions engineers
 */
export async function DELETE(
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

    // Ensure params.id is properly awaited
    const { id: clientId } = await params;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Get the workflow ID from the URL
    const url = new URL(request.url);
    const workflowId = url.searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    // Check if workflow exists and belongs to this client
    const existingWorkflow = await Workflow.findById(workflowId).lean();

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Type assertion to access clientId
    const workflow = existingWorkflow as unknown as { clientId: { toString: () => string } };
    if (workflow.clientId.toString() !== clientId) {
      return NextResponse.json({
        error: 'Workflow does not belong to this client'
      }, { status: 403 });
    }

    // Delete the workflow
    await workflowService.deleteWorkflow(workflowId);

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
}
