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
 * @swagger
 * /workflows/exceptions:
 *   post:
 *     summary: Add a new exception to a workflow
 *     tags: [Workflow Exceptions]
 *     security:
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exceptionId
 *               - workflowName
 *               - clientId
 *               - exceptionType
 *               - severity
 *             properties:
 *               exceptionId:
 *                 type: string
 *                 description: Unique identifier for the exception
 *               workflowName:
 *                 type: string
 *                 description: Name of the workflow
 *               clientId:
 *                 type: string
 *                 description: ID of the client
 *               exceptionType:
 *                 type: string
 *                 description: Type of exception
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 description: Severity level of the exception (LOW, MEDIUM, HIGH, CRITICAL)
 *               remedy:
 *                 type: string
 *                 description: Suggested remedy for the exception
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *                 default: OPEN
 *                 description: Current status of the exception (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
 *     responses:
 *       201:
 *         description: Exception created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 exception:
 *                   type: object
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing API key
 *       404:
 *         description: Workflow not found
 *       409:
 *         description: Exception with this ID already exists
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /workflows/exceptions/{exceptionId}:
 *   patch:
 *     summary: Update the status of a workflow exception
 *     tags: [Workflow Exceptions]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: exceptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the exception to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *                 description: New status for the exception (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
 *     responses:
 *       200:
 *         description: Exception status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 exception:
 *                   type: object
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing API key
 *       404:
 *         description: Exception not found
 *       500:
 *         description: Server error
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
