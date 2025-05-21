import WorkflowException, { IWorkflowException } from '@/models/WorkflowException';
import dbConnect from './db';
import mongoose from 'mongoose';

/**
 * Service for handling workflow exception operations
 */
export const workflowExceptionService = {
  /**
   * Create a new workflow exception
   * @param {Object} exceptionData - Exception data
   * @returns {Promise<Object>} Created exception document
   */
  async createException(exceptionData: Partial<IWorkflowException>) {
    await dbConnect();
    const exception = new WorkflowException(exceptionData);
    return exception.save();
  },

  /**
   * Get exceptions by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsByWorkflowId(workflowId: string) {
    await dbConnect();
    return WorkflowException.find({ workflowId })
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Get exceptions by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of exception documents
   */
  async getExceptionsByClientId(clientId: string) {
    await dbConnect();
    return WorkflowException.find({ clientId })
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Get exception by ID
   * @param {string} exceptionId - Exception ID
   * @returns {Promise<Object>} Exception document
   */
  async getExceptionById(exceptionId: string) {
    await dbConnect();
    return WorkflowException.findOne({ exceptionId }).lean();
  },

  /**
   * Update exception status
   * @param {string} exceptionId - Exception ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated exception document
   */
  async updateExceptionStatus(exceptionId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') {
    await dbConnect();
    return WorkflowException.findOneAndUpdate(
      { exceptionId },
      { status },
      { new: true }
    ).lean();
  },

  /**
   * Get exception count by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<number>} Count of exceptions
   */
  async getExceptionCountByWorkflowId(workflowId: string) {
    await dbConnect();
    return WorkflowException.countDocuments({ workflowId });
  }
};

export default workflowExceptionService;
