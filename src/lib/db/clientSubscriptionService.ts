import ClientSubscription, { IClientSubscription } from '@/models/ClientSubscription';
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
 * ClientSubscription service for handling client subscription-related operations
 */
export const clientSubscriptionService = {
  /**
   * Get all client subscriptions with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of client subscription documents
   */
  async getClientSubscriptions(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { startDate: -1 }, limit, skip } = options;
    let query = ClientSubscription.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single client subscription by ID
   * @param {string} subscriptionId - Client subscription ID
   * @returns {Promise<Object>} Client subscription document
   */
  async getClientSubscriptionById(subscriptionId: string) {
    await dbConnect();
    return ClientSubscription.findById(subscriptionId).lean();
  },

  /**
   * Get client subscriptions by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of client subscription documents
   */
  async getClientSubscriptionsByClientId(clientId: string) {
    await dbConnect();
    return ClientSubscription.find({ clientId }).lean();
  },

  /**
   * Get active client subscription by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Client subscription document
   */
  async getActiveClientSubscriptionByClientId(clientId: string) {
    await dbConnect();
    return ClientSubscription.findOne({ 
      clientId,
      status: 'ACTIVE'
    }).lean();
  },

  /**
   * Create a new client subscription
   * @param {Object} subscriptionData - Client subscription data
   * @returns {Promise<Object>} Created client subscription document
   */
  async createClientSubscription(subscriptionData: Partial<IClientSubscription>) {
    await dbConnect();
    const subscription = new ClientSubscription(subscriptionData);
    return subscription.save();
  },

  /**
   * Update an existing client subscription
   * @param {string} subscriptionId - Client subscription ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated client subscription document
   */
  async updateClientSubscription(subscriptionId: string, updateData: Partial<IClientSubscription>) {
    await dbConnect();
    return ClientSubscription.findByIdAndUpdate(
      subscriptionId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Update client subscription status
   * @param {string} subscriptionId - Client subscription ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated client subscription document
   */
  async updateClientSubscriptionStatus(
    subscriptionId: string, 
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING_RENEWAL'
  ) {
    await dbConnect();
    return ClientSubscription.findByIdAndUpdate(
      subscriptionId,
      { status },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Update credits remaining for a client subscription
   * @param {string} subscriptionId - Client subscription ID
   * @param {number} creditsRemaining - New credits remaining value
   * @returns {Promise<Object>} Updated client subscription document
   */
  async updateCreditsRemaining(subscriptionId: string, creditsRemaining: number) {
    await dbConnect();
    return ClientSubscription.findByIdAndUpdate(
      subscriptionId,
      { creditsRemainingThisPeriod: creditsRemaining },
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Get client subscriptions by subscription plan ID
   * @param {string} subscriptionPlanId - Subscription plan ID
   * @returns {Promise<Array>} Array of client subscription documents
   */
  async getClientSubscriptionsByPlanId(subscriptionPlanId: string) {
    await dbConnect();
    return ClientSubscription.find({ subscriptionPlanId }).lean();
  },

  /**
   * Get client subscriptions by status
   * @param {string} status - Subscription status
   * @returns {Promise<Array>} Array of client subscription documents
   */
  async getClientSubscriptionsByStatus(
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING_RENEWAL'
  ) {
    await dbConnect();
    return ClientSubscription.find({ status }).lean();
  },

  /**
   * Get client subscriptions that need renewal (renewsOn date is approaching)
   * @param {number} daysThreshold - Number of days threshold
   * @returns {Promise<Array>} Array of client subscription documents
   */
  async getSubscriptionsNeedingRenewal(daysThreshold: number = 30) {
    await dbConnect();
    
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return ClientSubscription.find({
      status: 'ACTIVE',
      renewsOn: { $lte: thresholdDate }
    }).lean();
  }
};

export default clientSubscriptionService;
