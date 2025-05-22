import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth/apiKeyAuth';
import { workflowExceptionService } from '@/lib/db/workflowExceptionService';
import dbConnect from '@/lib/db/db';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

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
export async function PATCH(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();

    // Authenticate the request
    const authError = authenticateApiKey(request);
    if (authError) return authError;

    // Get exception ID from URL params
    const { exceptionId } = await params;

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
