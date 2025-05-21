import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth/apiKeyAuth';
import { workflowNodeService } from '@/lib/db/workflowNodeService';
import { workflowLookupService } from '@/lib/db/workflowLookupService';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/db';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /workflows/nodes:
 *   post:
 *     summary: Add a new node to a workflow
 *     tags: [Workflow Nodes]
 *     security:
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nodeId
 *               - workflowName
 *               - clientId
 *               - nodeName
 *               - nodeType
 *             properties:
 *               nodeId:
 *                 type: string
 *                 description: Unique identifier for the node
 *               workflowName:
 *                 type: string
 *                 description: Name of the workflow
 *               clientId:
 *                 type: string
 *                 description: ID of the client
 *               nodeName:
 *                 type: string
 *                 description: Name of the node
 *               nodeType:
 *                 type: string
 *                 description: Type of the node
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DELETED]
 *                 default: ACTIVE
 *                 description: Status of the node (ACTIVE, INACTIVE, DELETED)
 *     responses:
 *       201:
 *         description: Node created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 node:
 *                   type: object
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing API key
 *       404:
 *         description: Workflow not found
 *       409:
 *         description: Node with this ID already exists
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
      nodeId, 
      workflowName, 
      clientId, 
      nodeName, 
      nodeType, 
      status 
    } = data;
    
    // Validate required fields
    if (!nodeId || !workflowName || !clientId || !nodeName || !nodeType) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Check if the node already exists
    const existingNode = await workflowNodeService.getNodeById(nodeId);
    if (existingNode) {
      return NextResponse.json({ 
        error: 'Node with this ID already exists' 
      }, { status: 409 });
    }
    
    // Find the workflow by name and client ID
    const workflow = await workflowLookupService.findWorkflowByNameAndClient(workflowName, clientId);
    if (!workflow || !workflow._id) {
      return NextResponse.json({ 
        error: 'Workflow not found' 
      }, { status: 404 });
    }
    
    // Create the node
    const nodeData = {
      nodeId,
      workflowId: workflow._id,
      clientId: new mongoose.Types.ObjectId(clientId),
      nodeName,
      nodeType,
      status: status || 'ACTIVE'
    };
    
    const node = await workflowNodeService.createNode(nodeData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Node created successfully',
      node
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating node:', error);
    return NextResponse.json({ 
      error: 'Failed to create node' 
    }, { status: 500 });
  }
}

/**
 * @swagger
 * /workflows/nodes:
 *   delete:
 *     summary: Remove a node from a workflow
 *     tags: [Workflow Nodes]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the node to remove
 *     responses:
 *       200:
 *         description: Node deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 node:
 *                   type: object
 *       400:
 *         description: Bad request - missing nodeId
 *       401:
 *         description: Unauthorized - invalid or missing API key
 *       404:
 *         description: Node not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    // Authenticate the request
    const authError = authenticateApiKey(request);
    if (authError) return authError;
    
    // Get the node ID from the URL
    const url = new URL(request.url);
    const nodeId = url.searchParams.get('nodeId');
    
    // Validate required fields
    if (!nodeId) {
      return NextResponse.json({ 
        error: 'Node ID is required' 
      }, { status: 400 });
    }
    
    // Check if the node exists
    const existingNode = await workflowNodeService.getNodeById(nodeId);
    if (!existingNode) {
      return NextResponse.json({ 
        error: 'Node not found' 
      }, { status: 404 });
    }
    
    // Delete the node
    const deletedNode = await workflowNodeService.deleteNode(nodeId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Node deleted successfully',
      node: deletedNode
    });
  } catch (error) {
    console.error('Error deleting node:', error);
    return NextResponse.json({ 
      error: 'Failed to delete node' 
    }, { status: 500 });
  }
}
