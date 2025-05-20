import ExecutionLog, { IExecutionLog } from '@/models/ExecutionLog';
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
 * ExecutionLog service for handling execution log-related operations
 */
export const executionLogService = {
  /**
   * Get all execution logs with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of execution log documents
   */
  async getExecutionLogs(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort, limit, skip } = options;
    let query = ExecutionLog.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single execution log by ID
   * @param {string} logId - Execution log ID
   * @returns {Promise<Object>} Execution log document
   */
  async getExecutionLogById(logId: string) {
    await dbConnect();
    return ExecutionLog.findById(logId).lean();
  },

  /**
   * Get execution logs by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of execution log documents
   */
  async getExecutionLogsByWorkflowId(workflowId: string, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { executionTimestamp: -1 }, limit, skip } = options;
    let query = ExecutionLog.find({ workflowId });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get execution logs by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of execution log documents
   */
  async getExecutionLogsByClientId(clientId: string, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { executionTimestamp: -1 }, limit, skip } = options;
    let query = ExecutionLog.find({ clientId });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Create a new execution log
   * @param {Object} logData - Execution log data
   * @returns {Promise<Object>} Created execution log document
   */
  async createExecutionLog(logData: Partial<IExecutionLog>) {
    await dbConnect();
    const log = new ExecutionLog(logData);
    return log.save();
  },

  /**
   * Delete an execution log
   * @param {string} logId - Execution log ID
   * @returns {Promise<Object>} Deleted execution log document
   */
  async deleteExecutionLog(logId: string) {
    await dbConnect();
    return ExecutionLog.findByIdAndDelete(logId).lean();
  },

  /**
   * Get execution logs count by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<number>} Count of execution logs
   */
  async getExecutionLogsCountByWorkflowId(workflowId: string) {
    await dbConnect();
    return ExecutionLog.countDocuments({ workflowId });
  },

  /**
   * Get execution logs count by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<number>} Count of execution logs
   */
  async getExecutionLogsCountByClientId(clientId: string) {
    await dbConnect();
    return ExecutionLog.countDocuments({ clientId });
  },

  /**
   * Get execution logs by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of execution log documents
   */
  async getExecutionLogsByDateRange(startDate: Date, endDate: Date, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { executionTimestamp: -1 }, limit, skip } = options;
    let query = ExecutionLog.find({
      executionTimestamp: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  }
};

export default executionLogService;
