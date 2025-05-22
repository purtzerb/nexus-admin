import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/auth/apiKeyAuth';
import { workflowNodeService } from '@/lib/db/workflowNodeService';
import { workflowLookupService } from '@/lib/db/workflowLookupService';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/db';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

/**
 * POST handler for creating a new workflow node
 * Adds a new node to a workflow
 * 
 * Required fields in request body:
 * - nodeId: Unique identifier for the node
 * - workflowName: Name of the workflow
 * - clientId: ID of the client
 * - nodeName: Name of the node
 * - nodeType: Type of the node
 * 
 * Optional fields:
 * - status: Status of the node (ACTIVE, INACTIVE, DELETED) - defaults to ACTIVE
 * 
 * Responses:
 * - 201: Node created successfully
 * - 400: Bad request - missing required fields
 * - 401: Unauthorized - invalid or missing API key
 * - 404: Workflow not found
 * - 409: Node with this ID already exists
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
 * DELETE handler for removing a workflow node
 * Removes a node from a workflow
 * 
 * Query parameter:
 * - nodeId: ID of the node to remove
 * 
 * Responses:
 * - 200: Node deleted successfully
 * - 400: Bad request - missing nodeId
 * - 401: Unauthorized - invalid or missing API key
 * - 404: Node not found
 * - 500: Server error
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
