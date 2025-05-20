import Invoice, { IInvoice } from '@/models/Invoice';
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
 * Invoice service for handling invoice-related operations
 */
export const invoiceService = {
  /**
   * Get all invoices with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of invoice documents
   */
  async getInvoices(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { invoiceDate: -1 }, limit, skip } = options;
    let query = Invoice.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice document
   */
  async getInvoiceById(invoiceId: string) {
    await dbConnect();
    return Invoice.findById(invoiceId).lean();
  },

  /**
   * Get invoices by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of invoice documents
   */
  async getInvoicesByClientId(clientId: string, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { invoiceDate: -1 }, limit, skip } = options;
    let query = Invoice.find({ clientId });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get invoices by client subscription ID
   * @param {string} clientSubscriptionId - Client subscription ID
   * @returns {Promise<Array>} Array of invoice documents
   */
  async getInvoicesBySubscriptionId(clientSubscriptionId: string, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { invoiceDate: -1 }, limit, skip } = options;
    let query = Invoice.find({ clientSubscriptionId });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Create a new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice document
   */
  async createInvoice(invoiceData: Partial<IInvoice>) {
    await dbConnect();
    const invoice = new Invoice(invoiceData);
    return invoice.save();
  },

  /**
   * Update an existing invoice
   * @param {string} invoiceId - Invoice ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated invoice document
   */
  async updateInvoice(invoiceId: string, updateData: Partial<IInvoice>) {
    await dbConnect();
    return Invoice.findByIdAndUpdate(
      invoiceId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Update invoice status
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated invoice document
   */
  async updateInvoiceStatus(
    invoiceId: string, 
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID'
  ) {
    await dbConnect();
    return Invoice.findByIdAndUpdate(
      invoiceId,
      { status },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Get invoices by status
   * @param {string} status - Invoice status
   * @returns {Promise<Array>} Array of invoice documents
   */
  async getInvoicesByStatus(
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID',
    options: QueryOptions = {}
  ) {
    await dbConnect();
    
    const { sort = { invoiceDate: -1 }, limit, skip } = options;
    let query = Invoice.find({ status });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get overdue invoices
   * @returns {Promise<Array>} Array of overdue invoice documents
   */
  async getOverdueInvoices(options: QueryOptions = {}) {
    await dbConnect();
    
    const today = new Date();
    const { sort = { dueDate: 1 }, limit, skip } = options;
    
    let query = Invoice.find({
      status: { $nin: ['PAID', 'VOID'] },
      dueDate: { $lt: today }
    });

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get invoices by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of invoice documents
   */
  async getInvoicesByDateRange(startDate: Date, endDate: Date, options: QueryOptions = {}) {
    await dbConnect();
    
    const { sort = { invoiceDate: -1 }, limit, skip } = options;
    let query = Invoice.find({
      invoiceDate: {
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

export default invoiceService;
