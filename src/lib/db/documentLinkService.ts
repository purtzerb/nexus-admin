import DocumentLink, { IDocumentLink } from '@/models/DocumentLink';
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
 * DocumentLink service for handling document link-related operations
 */
export const documentLinkService = {
  /**
   * Get all document links with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of document link documents
   */
  async getDocumentLinks(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { updatedAt: -1 }, limit, skip } = options;
    let query = DocumentLink.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single document link by ID
   * @param {string} documentLinkId - Document link ID
   * @returns {Promise<Object>} Document link document
   */
  async getDocumentLinkById(documentLinkId: string) {
    await dbConnect();
    return DocumentLink.findById(documentLinkId).lean();
  },

  /**
   * Get document links by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of document link documents
   */
  async getDocumentLinksByClientId(clientId: string) {
    await dbConnect();
    return DocumentLink.find({ clientId }).lean();
  },

  /**
   * Get document links by client ID and document type
   * @param {string} clientId - Client ID
   * @param {string} documentType - Document type
   * @returns {Promise<Array>} Array of document link documents
   */
  async getDocumentLinksByClientIdAndType(clientId: string, documentType: string) {
    await dbConnect();
    return DocumentLink.find({ 
      clientId,
      documentType
    }).lean();
  },

  /**
   * Create a new document link
   * @param {Object} documentLinkData - Document link data
   * @returns {Promise<Object>} Created document link document
   */
  async createDocumentLink(documentLinkData: Partial<IDocumentLink>) {
    await dbConnect();
    const documentLink = new DocumentLink(documentLinkData);
    return documentLink.save();
  },

  /**
   * Update an existing document link
   * @param {string} documentLinkId - Document link ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated document link document
   */
  async updateDocumentLink(documentLinkId: string, updateData: Partial<IDocumentLink>) {
    await dbConnect();
    return DocumentLink.findByIdAndUpdate(
      documentLinkId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Delete a document link
   * @param {string} documentLinkId - Document link ID
   * @returns {Promise<Object>} Deleted document link document
   */
  async deleteDocumentLink(documentLinkId: string) {
    await dbConnect();
    return DocumentLink.findByIdAndDelete(documentLinkId).lean();
  },

  /**
   * Get document links by document type
   * @param {string} documentType - Document type
   * @returns {Promise<Array>} Array of document link documents
   */
  async getDocumentLinksByType(documentType: string) {
    await dbConnect();
    return DocumentLink.find({ documentType }).lean();
  },

  /**
   * Bulk create document links for a client
   * @param {string} clientId - Client ID
   * @param {Array} documentLinks - Array of document link data
   * @returns {Promise<Array>} Array of created document link documents
   */
  async bulkCreateDocumentLinks(clientId: string, documentLinks: Array<{
    documentType: IDocumentLink['documentType'],
    url: string,
    description?: string
  }>) {
    await dbConnect();
    
    const links = documentLinks.map(link => ({
      clientId,
      documentType: link.documentType,
      url: link.url,
      description: link.description
    }));
    
    return DocumentLink.insertMany(links);
  }
};

export default documentLinkService;
