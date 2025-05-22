import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import Workflow, { IWorkflow } from '@/models/Workflow';
import WorkflowExecution from '@/models/WorkflowExecution';
import WorkflowNode from '@/models/WorkflowNode';
import Department, { IDepartment } from '@/models/Department';
import WorkflowException from '@/models/WorkflowException';
import mongoose from 'mongoose';

// Define interfaces for lean document results
interface WorkflowDocument {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  timeSavedPerExecution?: number;
  moneySavedPerExecution?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
}

// GET endpoint to fetch workflows for the client
export async function GET(request: NextRequest) {
  // Authenticate the user
  const authUser = await getAuthUser(request);
  
  // Check if user is authenticated and has CLIENT_USER role
  if (!authUser) {
    return unauthorizedResponse();
  }
  
  if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
    return forbiddenResponse('Only client users can access this endpoint');
  }
  
  // Ensure clientId is available
  if (!authUser.clientId) {
    return forbiddenResponse('Client ID not found for user');
  }
  
  try {
    // Convert string ID to ObjectId
    const clientObjectId = new mongoose.Types.ObjectId(authUser.clientId);
    
    // Get all workflows for the client
    const workflows = await Workflow.find({
      clientId: clientObjectId
    }).sort({ createdAt: -1 }).lean() as unknown as WorkflowDocument[];

    // Get counts for each workflow
    const workflowIds = workflows.map(workflow => workflow._id);
    
    // Get department information
    const departmentIds = workflows
      .filter(workflow => workflow.departmentId)
      .map(workflow => workflow.departmentId);

    const departments = departmentIds.length > 0 
      ? await Department.find({ _id: { $in: departmentIds } }).lean() as unknown as DepartmentDocument[]
      : [];
    
    // Create a map of departments for faster lookup
    const departmentMap: Record<string, DepartmentDocument> = {};
    departments.forEach((dept) => {
      departmentMap[dept._id.toString()] = dept;
    });

    // Get execution counts for each workflow
    const executionCounts = await WorkflowExecution.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { workflowId: { $in: workflowIds } } },
      { $group: { _id: '$workflowId', count: { $sum: 1 } } }
    ]);
    
    // Create a map of execution counts for faster lookup
    const executionCountMap: Record<string, number> = {};
    executionCounts.forEach(item => {
      executionCountMap[item._id.toString()] = item.count;
    });

    // Get nodes count for each workflow
    const nodeCounts = await WorkflowNode.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { workflowId: { $in: workflowIds } } },
      { $group: { _id: '$workflowId', count: { $sum: 1 } } }
    ]);
    
    // Create a map of node counts for faster lookup
    const nodeCountMap: Record<string, number> = {};
    nodeCounts.forEach(item => {
      nodeCountMap[item._id.toString()] = item.count;
    });

    // Get exception counts for each workflow
    const exceptionCounts = await WorkflowException.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { workflowId: { $in: workflowIds } } },
      { $group: { _id: '$workflowId', count: { $sum: 1 } } }
    ]);
    
    // Create a map of exception counts for faster lookup
    const exceptionCountMap: Record<string, number> = {};
    exceptionCounts.forEach(item => {
      exceptionCountMap[item._id.toString()] = item.count;
    });

    // Enrich workflows with additional data
    const enrichedWorkflows = workflows.map(workflow => {
      const workflowId = workflow._id.toString();
      const departmentName = workflow.departmentId && departmentMap[workflow.departmentId.toString()]
        ? departmentMap[workflow.departmentId.toString()].name
        : 'N/A';
      
      return {
        ...workflow,
        department: departmentName,
        executionsCount: executionCountMap[workflowId] || 0,
        nodesCount: nodeCountMap[workflowId] || 0,
        exceptionsCount: exceptionCountMap[workflowId] || 0,
        timeSaved: (executionCountMap[workflowId] || 0) * (workflow.timeSavedPerExecution || 0),
        moneySaved: (executionCountMap[workflowId] || 0) * (workflow.moneySavedPerExecution || 0)
      };
    });
    
    return NextResponse.json(enrichedWorkflows);
    
  } catch (error) {
    console.error('Error fetching client workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}
