import Credential, { ICredential } from '@/models/Credential';
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
 * Credential service for handling credential-related operations
 */
export const credentialService = {
  /**
   * Get all credentials with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of credential documents
   */
  async getCredentials(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { updatedAt: -1 }, limit, skip } = options;
    let query = Credential.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single credential by ID
   * @param {string} credentialId - Credential ID
   * @returns {Promise<Object>} Credential document
   */
  async getCredentialById(credentialId: string) {
    await dbConnect();
    return Credential.findById(credentialId).lean();
  },

  /**
   * Get credentials by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of credential documents
   */
  async getCredentialsByClientId(clientId: string) {
    await dbConnect();
    return Credential.find({ clientId }).lean();
  },

  /**
   * Get credential by client ID and service name
   * @param {string} clientId - Client ID
   * @param {string} serviceName - Service name
   * @returns {Promise<Object>} Credential document
   */
  async getCredentialByClientIdAndService(clientId: string, serviceName: string) {
    await dbConnect();
    return Credential.findOne({ 
      clientId,
      serviceName
    }).lean();
  },

  /**
   * Create a new credential
   * @param {Object} credentialData - Credential data
   * @returns {Promise<Object>} Created credential document
   */
  async createCredential(credentialData: Partial<ICredential>) {
    await dbConnect();
    const credential = new Credential(credentialData);
    return credential.save();
  },

  /**
   * Update an existing credential
   * @param {string} credentialId - Credential ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated credential document
   */
  async updateCredential(credentialId: string, updateData: Partial<ICredential>) {
    await dbConnect();
    return Credential.findByIdAndUpdate(
      credentialId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Delete a credential
   * @param {string} credentialId - Credential ID
   * @returns {Promise<Object>} Deleted credential document
   */
  async deleteCredential(credentialId: string) {
    await dbConnect();
    return Credential.findByIdAndDelete(credentialId).lean();
  },

  /**
   * Update credential status
   * @param {string} credentialId - Credential ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated credential document
   */
  async updateCredentialStatus(
    credentialId: string, 
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR_NEEDS_REAUTH'
  ) {
    await dbConnect();
    return Credential.findByIdAndUpdate(
      credentialId,
      { 
        status,
        ...(status === 'CONNECTED' ? { lastVerifiedAt: new Date() } : {})
      },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Get credentials by status
   * @param {string} status - Credential status
   * @returns {Promise<Array>} Array of credential documents
   */
  async getCredentialsByStatus(status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR_NEEDS_REAUTH') {
    await dbConnect();
    return Credential.find({ status }).lean();
  },

  /**
   * Get credentials by service name
   * @param {string} serviceName - Service name
   * @returns {Promise<Array>} Array of credential documents
   */
  async getCredentialsByService(serviceName: string) {
    await dbConnect();
    return Credential.find({ serviceName }).lean();
  },

  /**
   * Update last verified timestamp for a credential
   * @param {string} credentialId - Credential ID
   * @returns {Promise<Object>} Updated credential document
   */
  async updateLastVerifiedTimestamp(credentialId: string) {
    await dbConnect();
    return Credential.findByIdAndUpdate(
      credentialId,
      { 
        lastVerifiedAt: new Date(),
        status: 'CONNECTED'
      },
      { new: true }
    ).lean();
  }
};

export default credentialService;
