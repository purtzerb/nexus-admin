import Workflow, { IWorkflow } from '@/models/Workflow';
import WorkflowNode from '@/models/WorkflowNode';
import WorkflowExecution from '@/models/WorkflowExecution';
import WorkflowException from '@/models/WorkflowException';
// Import Department model to ensure it's registered before using in populate
import '@/models/Department';
import dbConnect from './db';
import mongoose, { Document } from 'mongoose';

// Define a type for the populated workflow document from MongoDB
interface PopulatedWorkflow extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  departmentId?: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  timeSavedPerExecution?: number;
  totalTimeSaved?: number;
  moneySavedPerExecution?: number;
  totalMoneySaved?: number;
  createdAt: Date;
  updatedAt: Date;
}

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
   * @returns {Promise<Array>} Array of workflow documents with populated department info and counts
   */
  async getWorkflowsByClientId(clientId: string) {
    await dbConnect();
    
    // Find all workflows for this client and populate the department reference
    const workflows = await Workflow.find({ clientId })
      .populate({
        path: 'departmentId',
        select: 'name', // Only select the name field from the department
        model: 'Department'
      })
      .lean();
    
    // Get the workflow IDs to use in subsequent queries
    const workflowIds = workflows.map(w => w._id as mongoose.Types.ObjectId);
    
    // Get counts for each workflow
    const [nodesCounts, executionsCounts, exceptionsCounts] = await Promise.all([
      // Count nodes for each workflow
      WorkflowNode.aggregate([
        { $match: { workflowId: { $in: workflowIds } } },
        { $group: { _id: '$workflowId', count: { $sum: 1 } } }
      ]),
      // Count executions for each workflow
      WorkflowExecution.aggregate([
        { $match: { workflowId: { $in: workflowIds } } },
        { $group: { _id: '$workflowId', count: { $sum: 1 } } }
      ]),
      // Count exceptions for each workflow
      WorkflowException.aggregate([
        { $match: { workflowId: { $in: workflowIds } } },
        { $group: { _id: '$workflowId', count: { $sum: 1 } } }
      ])
    ]);
    
    // Create lookup maps for quick access
    const nodesMap = new Map(nodesCounts.map(item => [item._id.toString(), item.count]));
    const executionsMap = new Map(executionsCounts.map(item => [item._id.toString(), item.count]));
    const exceptionsMap = new Map(exceptionsCounts.map(item => [item._id.toString(), item.count]));
    
    // Transform the workflows with counts and department info
    return workflows.map(workflow => {
      const workflowId = (workflow._id as mongoose.Types.ObjectId).toString();
      const result: any = { ...workflow };
      
      // Add counts from the aggregations
      result.numberOfNodes = nodesMap.get(workflowId) || 0;
      result.numberOfExecutions = executionsMap.get(workflowId) || 0;
      result.numberOfExceptions = exceptionsMap.get(workflowId) || 0;
      
      // If departmentId is populated, extract the name as department
      if (workflow.departmentId && typeof workflow.departmentId === 'object' && 
          'name' in (workflow.departmentId as any)) {
        result.department = (workflow.departmentId as any).name;
      }
      
      return result;
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
    return Workflow.findByIdAndDelete(workflowId).lean() as Promise<PopulatedWorkflow | null>;
  },

  /**
   * Get a workflow by ID with counts
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow document with counts
   */
  async getWorkflowWithCounts(workflowId: string) {
    await dbConnect();
    
    const workflow = await Workflow.findById(workflowId)
      .populate({
        path: 'departmentId',
        select: 'name',
        model: 'Department'
      })
      .lean() as PopulatedWorkflow | null;
      
    if (!workflow) return null;
    
    // Get counts for this workflow
    const [nodesCount, executionsCount, exceptionsCount] = await Promise.all([
      WorkflowNode.countDocuments({ workflowId }),
      WorkflowExecution.countDocuments({ workflowId }),
      WorkflowException.countDocuments({ workflowId })
    ]);
    
    const result: any = { ...workflow };
    
    // Add counts
    result.numberOfNodes = nodesCount;
    result.numberOfExecutions = executionsCount;
    result.numberOfExceptions = exceptionsCount;
    
    // If departmentId is populated, extract the name as department
    if (workflow.departmentId && typeof workflow.departmentId === 'object' && 
        'name' in (workflow.departmentId as any)) {
      result.department = (workflow.departmentId as any).name;
    }
    
    return result;
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
