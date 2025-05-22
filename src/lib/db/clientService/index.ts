import mongoose from 'mongoose';
import Client from '@/models/Client';
import Workflow from '@/models/Workflow';
import WorkflowExecution from '@/models/WorkflowExecution';
import User from '@/models/User';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

export interface ClientMetrics {
  timeSaved: {
    recent: number; // Last 7 days
    total: number;  // All time
  };
  moneySaved: {
    recent: number; // Last 7 days
    total: number;  // All time
  };
  activeWorkflows: number;
}

const clientService = {
  /**
   * Get client details by ID
   */
  async getClientById(clientId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(clientId);
      return await Client.findById(objectId);
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      throw error;
    }
  },

  /**
   * Get assigned solutions engineers for a client
   */
  async getAssignedSolutionsEngineers(clientId: string) {
    try {
      const client = await this.getClientById(clientId);
      
      if (!client || !client.assignedSolutionsEngineerIds || client.assignedSolutionsEngineerIds.length === 0) {
        return [];
      }
      
      return await User.find(
        { 
          _id: { $in: client.assignedSolutionsEngineerIds },
          role: 'SOLUTIONS_ENGINEER'
        },
        { 
          _id: 1,
          firstName: 1, 
          lastName: 1, 
          email: 1, 
          profileImageUrl: 1 
        }
      );
    } catch (error) {
      console.error('Error fetching assigned solutions engineers:', error);
      throw error;
    }
  },

  /**
   * Get active workflows for a client
   */
  async getActiveWorkflows(clientId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(clientId);
      return await Workflow.find({
        clientId: objectId,
        status: 'ACTIVE'
      });
    } catch (error) {
      console.error('Error fetching active workflows:', error);
      throw error;
    }
  },

  /**
   * Get workflow executions for a client
   * @param clientId The client ID
   * @param daysAgo Optional number of days to look back (for recent metrics)
   */
  async getWorkflowExecutions(clientId: string, daysAgo?: number) {
    try {
      const objectId = new mongoose.Types.ObjectId(clientId);
      
      // Get active workflows for the client
      const workflows = await this.getActiveWorkflows(clientId);
      const workflowIds = workflows.map(workflow => workflow._id);
      
      const query: any = {
        clientId: objectId,
        workflowId: { $in: workflowIds },
        status: 'SUCCESS'
      };
      
      // Add date filter if daysAgo is provided
      if (daysAgo) {
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - daysAgo);
        query.createdAt = { $gte: dateFilter };
      }
      
      return await WorkflowExecution.find(query);
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      throw error;
    }
  },

  /**
   * Calculate client metrics (time saved, money saved, active workflows)
   */
  async getClientMetrics(clientId: string): Promise<ClientMetrics> {
    try {
      // Get active workflows
      const workflows = await this.getActiveWorkflows(clientId);
      const activeWorkflowsCount = workflows.length;
      
      // Create a map of workflows for faster lookup
      const workflowMap = workflows.reduce((acc, workflow) => {
        acc[workflow._id.toString()] = workflow;
        return acc;
      }, {} as Record<string, any>);
      
      // Get all executions and recent executions
      const allExecutions = await this.getWorkflowExecutions(clientId);
      const recentExecutions = await this.getWorkflowExecutions(clientId, 7);
      
      // Initialize metrics
      let totalTimeSaved = 0;
      let totalMoneySaved = 0;
      let recentTimeSaved = 0;
      let recentMoneySaved = 0;
      
      // Calculate metrics for all executions
      for (const execution of allExecutions) {
        const workflow = workflowMap[execution.workflowId.toString()];
        
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
        const workflow = workflowMap[execution.workflowId.toString()];
        
        if (workflow) {
          if (workflow.timeSavedPerExecution) {
            recentTimeSaved += workflow.timeSavedPerExecution;
          }
          
          if (workflow.moneySavedPerExecution) {
            recentMoneySaved += workflow.moneySavedPerExecution;
          }
        }
      }
      
      return {
        timeSaved: {
          recent: recentTimeSaved,
          total: totalTimeSaved
        },
        moneySaved: {
          recent: recentMoneySaved,
          total: totalMoneySaved
        },
        activeWorkflows: activeWorkflowsCount
      };
    } catch (error) {
      console.error('Error calculating client metrics:', error);
      throw error;
    }
  }
};

export default clientService;
