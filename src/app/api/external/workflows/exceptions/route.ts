import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth/apiKeyAuth';
import { workflowExceptionService } from '@/lib/db/workflowExceptionService';
import { workflowLookupService } from '@/lib/db/workflowLookupService';
import { workflowService } from '@/lib/db/workflowService';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/db';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

/**
 * POST handler for creating a new workflow exception
 * Adds a new exception to a workflow
 * 
 * Required fields in request body:
 * - exceptionId: Unique identifier for the exception
 * - workflowName: Name of the workflow
 * - clientId: ID of the client
 * - exceptionType: Type of exception
 * - severity: Severity level (LOW, MEDIUM, HIGH, CRITICAL)
 * 
 * Optional fields:
 * - remedy: Suggested remedy for the exception
 * - status: Current status (OPEN, IN_PROGRESS, RESOLVED, CLOSED) - defaults to OPEN
 * 
 * Responses:
 * - 201: Exception created successfully
 * - 400: Bad request - missing required fields
 * - 401: Unauthorized - invalid or missing API key
 * - 404: Workflow not found
 * - 409: Exception with this ID already exists
 * - 500: Server error
 */
/**
 * PATCH handler for updating a workflow exception status
 * Updates the status of a workflow exception
 * 
 * Route parameter:
 * - exceptionId: ID of the exception to update
 * 
 * Required fields in request body:
 * - status: New status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
 * 
 * Responses:
 * - 200: Exception status updated successfully
 * - 400: Bad request - missing required fields
 * - 401: Unauthorized - invalid or missing API key
 * - 404: Exception not found
 * - 500: Server error
 */
export async function PATCH(request: NextRequest, { params }: any) {
  try {
    await dbConnect();

    // Authenticate the request
    const authError = authenticateApiKey(request);
    if (authError) return authError;

    // Get exception ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const exceptionId = pathParts[pathParts.length - 1];

    if (!exceptionId) {
      return NextResponse.json({
        error: 'Exception ID is required'
      }, { status: 400 });
    }

    // Parse request body
    const data = await request.json();
    const { status } = data;

    // Validate required fields
    if (!status) {
      return NextResponse.json({
        error: 'Status is required'
      }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: `Status must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    // Check if the exception exists
    const existingException = await workflowExceptionService.getExceptionById(exceptionId);
    if (!existingException) {
      return NextResponse.json({
        error: 'Exception not found'
      }, { status: 404 });
    }

    // Update the exception status
    const updatedException = await workflowExceptionService.updateExceptionStatus(
      exceptionId,
      status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    );

    return NextResponse.json({
      success: true,
      message: 'Exception status updated successfully',
      exception: updatedException
    });
  } catch (error) {
    console.error('Error updating exception status:', error);
    return NextResponse.json({
      error: 'Failed to update exception status'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the request
    const authError = authenticateApiKey(request);
    if (authError) return authError;

    // Parse request body
    const data = await request.json();
    const {
      exceptionId,
      workflowName,
      clientId,
      exceptionType,
      severity,
      remedy,
      status
    } = data;

    // Validate required fields
    if (!exceptionId || !workflowName || !clientId || !exceptionType || !severity) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check if the exception already exists
    const existingException = await workflowExceptionService.getExceptionById(exceptionId);
    if (existingException) {
      return NextResponse.json({
        error: 'Exception with this ID already exists'
      }, { status: 409 });
    }

    // Find the workflow by name and client ID
    const workflow = await workflowLookupService.findWorkflowByNameAndClient(workflowName, clientId);
    if (!workflow || !workflow._id) {
      return NextResponse.json({
        error: 'Workflow not found'
      }, { status: 404 });
    }

    // Create the exception without using transactions
    // We don't need to increment counters anymore as they're calculated dynamically
    const exceptionData = {
      exceptionId,
      workflowId: workflow._id,
      clientId: new mongoose.Types.ObjectId(clientId),
      exceptionType,
      severity,
      remedy: remedy || '',
      status: status || 'OPEN'
    };

    const exception = await workflowExceptionService.createException(exceptionData);

    return NextResponse.json({
      success: true,
      message: 'Exception created successfully',
      exception
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating exception:', error);
    return NextResponse.json({
      error: 'Failed to create exception'
    }, { status: 500 });
  }
}
