import Workflow, { IWorkflow } from '@/models/Workflow';
import dbConnect from './db';
import mongoose from 'mongoose';

// Define types for function parameters
type FilterQuery = Record<string, any>;

interface QueryOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

/**
 * Workflow service for handling workflow-related operations
 */
export const workflowService = {
  /**
   * Get all workflows with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of workflow documents
   */
  async getWorkflows(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort, limit, skip } = options;
    let query = Workflow.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow document
   */
  async getWorkflowById(workflowId: string) {
    await dbConnect();
    return Workflow.findById(workflowId).lean();
  },

  /**
   * Get workflows by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of workflow documents with populated department info
   */
  async getWorkflowsByClientId(clientId: string) {
    await dbConnect();
    
    // Find all workflows for this client and populate the department reference
    return Workflow.find({ clientId })
      .populate({
        path: 'departmentId',
        select: 'name', // Only select the name field from the department
        model: 'Department'
      })
      .lean()
      .then(workflows => {
        // Transform the populated departmentId into a department property for the UI
        return workflows.map(workflow => {
          const result: any = { ...workflow };
          
          // If departmentId is populated, extract the name as department
          if (workflow.departmentId && typeof workflow.departmentId === 'object' && 'name' in workflow.departmentId) {
            result.department = workflow.departmentId.name;
          }
          
          return result;
        });
      });
  },

  /**
   * Get workflows by department ID
   * @param {string} departmentId - Department ID
   * @returns {Promise<Array>} Array of workflow documents
   */
  async getWorkflowsByDepartmentId(departmentId: string) {
    await dbConnect();
    return Workflow.find({ departmentId }).lean();
  },

  /**
   * Create a new workflow
   * @param {Object} workflowData - Workflow data
   * @returns {Promise<Object>} Created workflow document
   */
  async createWorkflow(workflowData: Partial<IWorkflow>) {
    await dbConnect();
    const workflow = new Workflow(workflowData);
    return workflow.save();
  },

  /**
   * Update an existing workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated workflow document
   */
  async updateWorkflow(workflowId: string, updateData: Partial<IWorkflow>) {
    await dbConnect();
    return Workflow.findByIdAndUpdate(
      workflowId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Delete a workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Deleted workflow document
   */
  async deleteWorkflow(workflowId: string) {
    await dbConnect();
    return Workflow.findByIdAndDelete(workflowId).lean();
  },

  /**
   * Increment execution count for a workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Updated workflow document
   */
  async incrementExecutionCount(workflowId: string) {
    await dbConnect();
    return Workflow.findByIdAndUpdate(
      workflowId,
      { $inc: { numberOfExecutions: 1 } },
      { new: true }
    ).lean();
  },

  /**
   * Increment exception count for a workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Updated workflow document
   */
  async incrementExceptionCount(workflowId: string) {
    await dbConnect();
    return Workflow.findByIdAndUpdate(
      workflowId,
      { $inc: { numberOfExceptions: 1 } },
      { new: true }
    ).lean();
  },

  /**
   * Update workflow status
   * @param {string} workflowId - Workflow ID
   * @param {string} status - New status ('ACTIVE' or 'INACTIVE')
   * @returns {Promise<Object>} Updated workflow document
   */
  async updateWorkflowStatus(workflowId: string, status: 'ACTIVE' | 'INACTIVE') {
    await dbConnect();
    return Workflow.findByIdAndUpdate(
      workflowId,
      { status },
      { new: true, runValidators: true }
    ).lean();
  }
};

export default workflowService;
