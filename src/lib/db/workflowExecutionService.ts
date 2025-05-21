import WorkflowExecution, { IWorkflowExecution } from '@/models/WorkflowExecution';
import dbConnect from './db';
import mongoose from 'mongoose';
import { workflowService } from './workflowService';

/**
 * Service for handling workflow execution operations
 */
export const workflowExecutionService = {
  /**
   * Create a new workflow execution
   * @param {Object} executionData - Execution data
   * @returns {Promise<Object>} Created execution document
   */
  async createExecution(executionData: Partial<IWorkflowExecution>) {
    await dbConnect();
    
    // Create the execution record without using transactions
    // We don't need to increment counters anymore as they're calculated dynamically
    const execution = new WorkflowExecution(executionData);
    await execution.save();
    
    return execution;
  },

  /**
   * Get executions by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of execution documents
   */
  async getExecutionsByWorkflowId(workflowId: string) {
    await dbConnect();
    return WorkflowExecution.find({ workflowId })
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Get executions by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of execution documents
   */
  async getExecutionsByClientId(clientId: string) {
    await dbConnect();
    return WorkflowExecution.find({ clientId })
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Get execution by ID
   * @param {string} executionId - Execution ID
   * @returns {Promise<Object>} Execution document
   */
  async getExecutionById(executionId: string) {
    await dbConnect();
    return WorkflowExecution.findOne({ executionId }).lean();
  },

  /**
   * Get execution count by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<number>} Count of executions
   */
  async getExecutionCountByWorkflowId(workflowId: string) {
    await dbConnect();
    return WorkflowExecution.countDocuments({ workflowId });
  }
};

export default workflowExecutionService;
