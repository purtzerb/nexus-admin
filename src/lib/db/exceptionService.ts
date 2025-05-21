import { WorkflowException } from '@/models';
import { IWorkflowException } from '@/models/WorkflowException';
import dbConnect from './db';

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

    const { sort = { createdAt: -1 }, limit, skip } = options;
    let query = WorkflowException.find(filter)
      .populate({
        path: 'workflowId',
        select: 'name departmentId clientId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      })
      .populate({
        path: 'clientId',
        select: 'companyName'
      });

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
    return WorkflowException.findById(exceptionId).lean();
  },

  /**
   * Delete an exception by ID
   * @param {string} exceptionId - Exception ID
   * @returns {Promise<Object>} Deleted exception document
   */
  async deleteException(exceptionId: string) {
    await dbConnect();
    return WorkflowException.findByIdAndDelete(exceptionId).lean();
  },

  /**
   * Get exceptions by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsByWorkflowId(workflowId: string, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { createdAt: -1 }, limit, skip } = options;
    let query = WorkflowException.find({ workflowId });

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

    const { sort = { createdAt: -1 }, limit, skip } = options;
    let query = WorkflowException.find({ clientId });

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
  async createException(exceptionData: Partial<IWorkflowException>) {
    await dbConnect();
    const exception = new WorkflowException(exceptionData);
    return exception.save();
  },

  /**
   * Update an existing exception
   * @param {string} exceptionId - Exception ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated exception document
   */
  async updateException(exceptionId: string, updateData: Partial<IWorkflowException>) {
    await dbConnect();
    return WorkflowException.findByIdAndUpdate(
      exceptionId,
      { $set: updateData },
      { new: true }
    ).lean();
  },

  /**
   * Update exception status
   * @param {string} exceptionId - Exception ID
   * @param {string} status - New status ('NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED')
   * @returns {Promise<Object>} Updated exception document
   */
  async updateStatus(exceptionId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') {
    await dbConnect();
    return WorkflowException.findByIdAndUpdate(
      exceptionId,
      { $set: { status } },
      { new: true }
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
    return WorkflowException.findByIdAndUpdate(
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
      { new: true }
    ).lean();
  },

  /**
   * Get exceptions by severity
   * @param {string} severity - Exception severity
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsBySeverity(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { createdAt: -1 }, limit, skip } = options;
    let query = WorkflowException.find({ severity });

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
  async getExceptionsByStatus(status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED', options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { createdAt: -1 }, limit, skip } = options;
    let query = WorkflowException.find({ status });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  }
};

export default exceptionService;
