import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth/apiKeyAuth';
import { workflowExecutionService } from '@/lib/db/workflowExecutionService';
import { workflowLookupService } from '@/lib/db/workflowLookupService';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/db';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

/**
 * POST handler for creating a new workflow execution
 * Adds a new execution to a workflow
 * 
 * Required fields in request body:
 * - executionId: Unique identifier for the execution
 * - workflowName: Name of the workflow
 * - clientId: ID of the client
 * 
 * Optional fields:
 * - status: Status of the execution (SUCCESS, FAILURE) - defaults to SUCCESS
 * - duration: Duration of the execution in milliseconds
 * - details: Details of the execution
 * 
 * Responses:
 * - 201: Execution created successfully
 * - 400: Bad request - missing required fields
 * - 401: Unauthorized - invalid or missing API key
 * - 404: Workflow not found
 * - 409: Execution with this ID already exists
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the request
    const authError = authenticateApiKey(request);
    if (authError) return authError;

    // Parse request body
    const data = await request.json();
    const {
      executionId,
      workflowName,
      clientId,
      status,
      duration,
      details
    } = data;

    // Validate required fields
    if (!executionId || !workflowName || !clientId) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check if the execution already exists
    const existingExecution = await workflowExecutionService.getExecutionById(executionId);
    if (existingExecution) {
      return NextResponse.json({
        error: 'Execution with this ID already exists'
      }, { status: 409 });
    }

    // Find the workflow by name and client ID
    const workflow = await workflowLookupService.findWorkflowByNameAndClient(workflowName, clientId);
    if (!workflow || !workflow._id) {
      return NextResponse.json({
        error: 'Workflow not found'
      }, { status: 404 });
    }

    // Create the execution
    const executionData = {
      executionId,
      workflowId: workflow._id,
      clientId: new mongoose.Types.ObjectId(clientId),
      status: status || 'SUCCESS',
      details: details || '',
      duration: duration || 0
    };

    const execution = await workflowExecutionService.createExecution(executionData);

    return NextResponse.json({
      success: true,
      message: 'Execution created successfully',
      execution
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating execution:', error);
    return NextResponse.json({
      error: 'Failed to create execution'
    }, { status: 500 });
  }
}
