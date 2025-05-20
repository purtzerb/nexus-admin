import Exception, { IException } from '@/models/Exception';
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
 * Exception service for handling exception-related operations
 */
export const exceptionService = {
  /**
   * Get all exceptions with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptions(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { reportedAt: -1 }, limit, skip } = options;
    let query = Exception.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single exception by ID
   * @param {string} exceptionId - Exception ID
   * @returns {Promise<Object>} Exception document
   */
  async getExceptionById(exceptionId: string) {
    await dbConnect();
    return Exception.findById(exceptionId).lean();
  },

  /**
   * Get exceptions by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsByWorkflowId(workflowId: string, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { reportedAt: -1 }, limit, skip } = options;
    let query = Exception.find({ workflowId });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get exceptions by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsByClientId(clientId: string, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { reportedAt: -1 }, limit, skip } = options;
    let query = Exception.find({ clientId });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Create a new exception
   * @param {Object} exceptionData - Exception data
   * @returns {Promise<Object>} Created exception document
   */
  async createException(exceptionData: Partial<IException>) {
    await dbConnect();
    const exception = new Exception(exceptionData);
    return exception.save();
  },

  /**
   * Update an existing exception
   * @param {string} exceptionId - Exception ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated exception document
   */
  async updateException(exceptionId: string, updateData: Partial<IException>) {
    await dbConnect();
    return Exception.findByIdAndUpdate(
      exceptionId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Update exception status
   * @param {string} exceptionId - Exception ID
   * @param {string} status - New status ('NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED')
   * @returns {Promise<Object>} Updated exception document
   */
  async updateExceptionStatus(exceptionId: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED') {
    await dbConnect();
    return Exception.findByIdAndUpdate(
      exceptionId,
      { status },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Add notification to an exception
   * @param {string} exceptionId - Exception ID
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Updated exception document
   */
  async addNotification(exceptionId: string, notification: { userId: string, method: 'EMAIL' | 'SMS' }) {
    await dbConnect();
    return Exception.findByIdAndUpdate(
      exceptionId,
      { 
        $push: { 
          notifications: {
            userId: notification.userId,
            notifiedAt: new Date(),
            method: notification.method
          }
        }
      },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Get exceptions by severity
   * @param {string} severity - Exception severity
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsBySeverity(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { reportedAt: -1 }, limit, skip } = options;
    let query = Exception.find({ severity });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get exceptions by status
   * @param {string} status - Exception status
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsByStatus(status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED', options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { reportedAt: -1 }, limit, skip } = options;
    let query = Exception.find({ status });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  }
};

export default exceptionService;
