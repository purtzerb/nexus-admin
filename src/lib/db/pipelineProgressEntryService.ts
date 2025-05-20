import PipelineProgressEntry, { IPipelineProgressEntry } from '@/models/PipelineProgressEntry';
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
 * PipelineProgressEntry service for handling pipeline progress-related operations
 */
export const pipelineProgressEntryService = {
  /**
   * Get all pipeline progress entries with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of pipeline progress entry documents
   */
  async getPipelineProgressEntries(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { order: 1 }, limit, skip } = options;
    let query = PipelineProgressEntry.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single pipeline progress entry by ID
   * @param {string} entryId - Pipeline progress entry ID
   * @returns {Promise<Object>} Pipeline progress entry document
   */
  async getPipelineProgressEntryById(entryId: string) {
    await dbConnect();
    return PipelineProgressEntry.findById(entryId).lean();
  },

  /**
   * Get pipeline progress entries by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of pipeline progress entry documents
   */
  async getPipelineProgressEntriesByClientId(clientId: string) {
    await dbConnect();
    return PipelineProgressEntry.find({ clientId }).sort({ order: 1 }).lean();
  },

  /**
   * Create a new pipeline progress entry
   * @param {Object} entryData - Pipeline progress entry data
   * @returns {Promise<Object>} Created pipeline progress entry document
   */
  async createPipelineProgressEntry(entryData: Partial<IPipelineProgressEntry>) {
    await dbConnect();
    const entry = new PipelineProgressEntry(entryData);
    return entry.save();
  },

  /**
   * Update an existing pipeline progress entry
   * @param {string} entryId - Pipeline progress entry ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated pipeline progress entry document
   */
  async updatePipelineProgressEntry(entryId: string, updateData: Partial<IPipelineProgressEntry>) {
    await dbConnect();
    return PipelineProgressEntry.findByIdAndUpdate(
      entryId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Delete a pipeline progress entry
   * @param {string} entryId - Pipeline progress entry ID
   * @returns {Promise<Object>} Deleted pipeline progress entry document
   */
  async deletePipelineProgressEntry(entryId: string) {
    await dbConnect();
    return PipelineProgressEntry.findByIdAndDelete(entryId).lean();
  },

  /**
   * Update pipeline progress entry status
   * @param {string} entryId - Pipeline progress entry ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated pipeline progress entry document
   */
  async updatePipelineProgressEntryStatus(
    entryId: string, 
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  ) {
    await dbConnect();
    const updateData: any = { status };
    
    // If status is COMPLETED, set the completedAt date
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    
    return PipelineProgressEntry.findByIdAndUpdate(
      entryId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Get pipeline progress entries by status
   * @param {string} status - Pipeline progress entry status
   * @returns {Promise<Array>} Array of pipeline progress entry documents
   */
  async getPipelineProgressEntriesByStatus(
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  ) {
    await dbConnect();
    return PipelineProgressEntry.find({ status }).lean();
  },

  /**
   * Bulk create pipeline progress entries for a client
   * @param {string} clientId - Client ID
   * @param {Array} entries - Array of pipeline phase data
   * @returns {Promise<Array>} Array of created pipeline progress entry documents
   */
  async bulkCreatePipelineProgressEntries(clientId: string, entries: Array<{
    phaseName: string,
    order: number,
    status?: IPipelineProgressEntry['status'],
    notes?: string
  }>) {
    await dbConnect();
    
    const progressEntries = entries.map(entry => ({
      clientId,
      phaseName: entry.phaseName,
      order: entry.order,
      status: entry.status || 'PENDING',
      notes: entry.notes
    }));
    
    return PipelineProgressEntry.insertMany(progressEntries);
  },

  /**
   * Get the current phase for a client
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Current pipeline progress entry document
   */
  async getCurrentPhaseForClient(clientId: string) {
    await dbConnect();
    
    // Find the first IN_PROGRESS entry, or if none, the first PENDING entry
    const inProgressEntry = await PipelineProgressEntry.findOne({
      clientId,
      status: 'IN_PROGRESS'
    }).sort({ order: 1 }).lean();
    
    if (inProgressEntry) return inProgressEntry;
    
    return PipelineProgressEntry.findOne({
      clientId,
      status: 'PENDING'
    }).sort({ order: 1 }).lean();
  }
};

export default pipelineProgressEntryService;
