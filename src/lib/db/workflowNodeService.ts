import WorkflowNode, { IWorkflowNode } from '@/models/WorkflowNode';
import dbConnect from './db';
import mongoose from 'mongoose';
import { workflowService } from './workflowService';

/**
 * Service for handling workflow node operations
 */
export const workflowNodeService = {
  /**
   * Create a new workflow node
   * @param {Object} nodeData - Node data
   * @returns {Promise<Object>} Created node document
   */
  async createNode(nodeData: Partial<IWorkflowNode>) {
    await dbConnect();
    
    // Create the node record without using transactions
    // We don't need to increment counters anymore as they're calculated dynamically
    const node = new WorkflowNode(nodeData);
    await node.save();
    
    return node;
  },

  /**
   * Delete a workflow node
   * @param {string} nodeId - Node ID
   * @returns {Promise<Object>} Deleted node document
   */
  async deleteNode(nodeId: string) {
    await dbConnect();
    
    // First find the node to get the workflowId (for future reference if needed)
    const node = await WorkflowNode.findOne({ nodeId }).lean();
    
    if (!node) {
      return null;
    }
    
    // Delete the node without using transactions
    // We don't need to decrement counters anymore as they're calculated dynamically
    const deletedNode = await WorkflowNode.findOneAndDelete({ nodeId });
    
    return deletedNode;
  },

  /**
   * Get nodes by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of node documents
   */
  async getNodesByWorkflowId(workflowId: string) {
    await dbConnect();
    return WorkflowNode.find({ workflowId })
      .sort({ createdAt: -1 })
      .lean();
  },

  /**
   * Get node by ID
   * @param {string} nodeId - Node ID
   * @returns {Promise<Object>} Node document
   */
  async getNodeById(nodeId: string) {
    await dbConnect();
    return WorkflowNode.findOne({ nodeId }).lean();
  },

  /**
   * Get node count by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<number>} Count of nodes
   */
  async getNodeCountByWorkflowId(workflowId: string) {
    await dbConnect();
    return WorkflowNode.countDocuments({ workflowId });
  }
};

export default workflowNodeService;
