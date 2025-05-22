import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth/apiKeyAuth';
import { workflowExecutionService } from '@/lib/db/workflowExecutionService';
import { workflowLookupService } from '@/lib/db/workflowLookupService';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/db';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /workflows/executions:
 *   post:
 *     summary: Add a new execution to a workflow
 *     tags: [Workflow Executions]
 *     security:
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - executionId
 *               - workflowName
 *               - clientId
 *             properties:
 *               executionId:
 *                 type: string
 *                 description: Unique identifier for the execution
 *               workflowName:
 *                 type: string
 *                 description: Name of the workflow
 *               clientId:
 *                 type: string
 *                 description: ID of the client
 *               status:
 *                 type: string
 *                 enum: [SUCCESS, FAILURE]
 *                 default: SUCCESS
 *                 description: Status of the execution (SUCCESS, FAILURE)
 *               duration:
 *                 type: number
 *                 description: Duration of the execution in milliseconds
 *               details:
 *                 type: string
 *                 description: Details of the execution
 *     responses:
 *       201:
 *         description: Execution created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 execution:
 *                   type: object
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing API key
 *       404:
 *         description: Workflow not found
 *       409:
 *         description: Execution with this ID already exists
 *       500:
 *         description: Server error
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
