import Client, { IClient } from '@/models/Client';
import dbConnect from './db';
import mongoose from 'mongoose';

// Define types for function parameters
type FilterQuery = Record<string, any>;

interface QueryOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

interface UpdateOptions {
  new?: boolean;
  runValidators?: boolean;
  arrayFilters?: Array<Record<string, any>>;
}

/**
 * Client service for handling client-related operations
 */
export const clientService = {
  /**
   * Get all clients with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of client documents
   */
  async getClients(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort, limit, skip } = options;
    let query = Client.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single client by ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Client document
   */
  async getClientById(clientId: string) {
    await dbConnect();
    return Client.findById(clientId).lean();
  },
  
  /**
   * Get a single client by company name
   * @param {string} companyName - Company name
   * @returns {Promise<Object>} Client document
   */
  async getClientByName(companyName: string) {
    await dbConnect();
    return Client.findOne({ companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } }).lean();
  },

  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} Created client document
   */
  async createClient(clientData: Partial<IClient>) {
    await dbConnect();
    const client = new Client(clientData);
    return client.save();
  },

  /**
   * Update an existing client
   * @param {string} clientId - Client ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated client document
   */
  async updateClient(clientId: string, updateData: any, options: UpdateOptions = { new: true, runValidators: true }) {
    await dbConnect();
    return Client.findByIdAndUpdate(
      clientId,
      updateData,
      options
    ).lean();
  },

  /**
   * Delete a client
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Deleted client document
   */
  async deleteClient(clientId: string) {
    await dbConnect();
    return Client.findByIdAndDelete(clientId).lean();
  },

  /**
   * Get clients assigned to a specific solutions engineer
   * @param {string} solutionsEngineerId - Solutions Engineer ID
   * @returns {Promise<Array>} Array of client documents
   */
  async getClientsBySolutionsEngineer(solutionsEngineerId: string) {
    await dbConnect();
    return Client.find({
      assignedSolutionsEngineerIds: solutionsEngineerId
    }).lean();
  },

  /**
   * Assign a solutions engineer to a client
   * @param {string} clientId - Client ID
   * @param {string} solutionsEngineerId - Solutions Engineer ID
   * @returns {Promise<Object>} Updated client document
   */
  async assignSolutionsEngineerToClient(clientId: string, solutionsEngineerId: string) {
    await dbConnect();
    return Client.findByIdAndUpdate(
      clientId,
      { $addToSet: { assignedSolutionsEngineerIds: solutionsEngineerId } },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Remove a solutions engineer from a client
   * @param {string} clientId - Client ID
   * @param {string} solutionsEngineerId - Solutions Engineer ID
   * @returns {Promise<Object>} Updated client document
   */
  async removeSolutionsEngineerFromClient(clientId: string, solutionsEngineerId: string) {
    await dbConnect();
    return Client.findByIdAndUpdate(
      clientId,
      { $pull: { assignedSolutionsEngineerIds: solutionsEngineerId } },
      { new: true }
    ).lean();
  },

  /**
   * Update client's current pipeline progress phase
   * @param {string} clientId - Client ID
   * @param {string} phaseName - Name of the current phase
   * @returns {Promise<Object>} Updated client document
   */
  async updateClientPipelinePhase(clientId: string, phaseName: string) {
    await dbConnect();
    return Client.findByIdAndUpdate(
      clientId,
      { pipelineProgressCurrentPhase: phaseName },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Update a pipeline step for a client
   * @param {string} clientId - Client ID
   * @param {string} stepName - Name of the pipeline step
   * @param {string} status - New status (pending, in_progress, completed)
   * @returns {Promise<Object>} Updated client document
   */
  async updatePipelineStep(clientId: string, stepName: string, status: 'pending' | 'in_progress' | 'completed') {
    await dbConnect();
    const updateData: any = {
      $set: {
        'pipelineSteps.$[step].status': status
      }
    };
    
    // If step is completed, set the completion date
    if (status === 'completed') {
      updateData.$set['pipelineSteps.$[step].completedDate'] = new Date();
    } else {
      // If step is not completed, remove the completion date
      updateData.$set['pipelineSteps.$[step].completedDate'] = null;
    }
    
    return Client.findByIdAndUpdate(
      clientId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        arrayFilters: [{ 'step.name': stepName }]
      }
    ).lean();
  },

  /**
   * Set active subscription for a client
   * @param {string} clientId - Client ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Updated client document
   */
  async setActiveSubscription(clientId: string, subscriptionId: string) {
    await dbConnect();
    return Client.findByIdAndUpdate(
      clientId,
      { activeSubscriptionId: subscriptionId },
      { new: true, runValidators: true }
    ).lean();
  }
};

export default clientService;
