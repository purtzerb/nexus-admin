import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import Workflow, { IWorkflow } from '@/models/Workflow';
import WorkflowExecution, { IWorkflowExecution } from '@/models/WorkflowExecution';
import mongoose from 'mongoose';

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
    
    // Get the current date and date 7 days ago
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get all active workflows for the client
    const workflows = await Workflow.find({
      clientId: clientObjectId,
      status: 'ACTIVE'
    });
    
    // Count of active workflows
    const activeWorkflowsCount = workflows.length;
    
    // Get workflow IDs
    const workflowIds = workflows.map(workflow => workflow._id);
    
    // Get all executions for the client's workflows
    const allExecutions = await WorkflowExecution.find({
      clientId: clientObjectId,
      workflowId: { $in: workflowIds },
      status: 'SUCCESS'
    });
    
    // Get executions from the last 7 days
    const recentExecutions = await WorkflowExecution.find({
      clientId: clientObjectId,
      workflowId: { $in: workflowIds },
      status: 'SUCCESS',
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Calculate time and money saved
    let totalTimeSaved = 0;
    let totalMoneySaved = 0;
    let recentTimeSaved = 0;
    let recentMoneySaved = 0;
    
    // Create a map of workflows for faster lookup
    const workflowMap: Record<string, any> = {};
    workflows.forEach(workflow => {
      if (workflow && workflow._id) {
        workflowMap[workflow._id.toString()] = workflow;
      }
    });
    
    // Calculate metrics for all executions
    for (const execution of allExecutions) {
      const workflowId = execution.workflowId.toString();
      const workflow = workflowMap[workflowId];
      
      if (workflow) {
        if (workflow.timeSavedPerExecution) {
          totalTimeSaved += workflow.timeSavedPerExecution;
        }
        
        if (workflow.moneySavedPerExecution) {
          totalMoneySaved += workflow.moneySavedPerExecution;
        }
      }
    }
    
    // Calculate metrics for recent executions
    for (const execution of recentExecutions) {
      const workflowId = execution.workflowId.toString();
      const workflow = workflowMap[workflowId];
      
      if (workflow) {
        if (workflow.timeSavedPerExecution) {
          recentTimeSaved += workflow.timeSavedPerExecution;
        }
        
        if (workflow.moneySavedPerExecution) {
          recentMoneySaved += workflow.moneySavedPerExecution;
        }
      }
    }
    
    // Return metrics
    return NextResponse.json({
      timeSaved: {
        recent: recentTimeSaved, // Last 7 days
        total: totalTimeSaved    // All time
      },
      moneySaved: {
        recent: recentMoneySaved, // Last 7 days
        total: totalMoneySaved    // All time
      },
      activeWorkflows: activeWorkflowsCount
    });
    
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
