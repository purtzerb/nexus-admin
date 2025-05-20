import SubscriptionPlan, { ISubscriptionPlan } from '@/models/SubscriptionPlan';
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
 * SubscriptionPlan service for handling subscription plan-related operations
 */
export const subscriptionPlanService = {
  /**
   * Get all subscription plans with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of subscription plan documents
   */
  async getSubscriptionPlans(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort = { name: 1 }, limit, skip } = options;
    let query = SubscriptionPlan.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single subscription plan by ID
   * @param {string} planId - Subscription plan ID
   * @returns {Promise<Object>} Subscription plan document
   */
  async getSubscriptionPlanById(planId: string) {
    await dbConnect();
    return SubscriptionPlan.findById(planId).lean();
  },

  /**
   * Get a subscription plan by name
   * @param {string} name - Subscription plan name
   * @returns {Promise<Object>} Subscription plan document
   */
  async getSubscriptionPlanByName(name: string) {
    await dbConnect();
    return SubscriptionPlan.findOne({ name }).lean();
  },

  /**
   * Create a new subscription plan
   * @param {Object} planData - Subscription plan data
   * @returns {Promise<Object>} Created subscription plan document
   */
  async createSubscriptionPlan(planData: Partial<ISubscriptionPlan>) {
    await dbConnect();
    const plan = new SubscriptionPlan(planData);
    return plan.save();
  },

  /**
   * Update an existing subscription plan
   * @param {string} planId - Subscription plan ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated subscription plan document
   */
  async updateSubscriptionPlan(planId: string, updateData: Partial<ISubscriptionPlan>) {
    await dbConnect();
    return SubscriptionPlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Delete a subscription plan
   * @param {string} planId - Subscription plan ID
   * @returns {Promise<Object>} Deleted subscription plan document
   */
  async deleteSubscriptionPlan(planId: string) {
    await dbConnect();
    return SubscriptionPlan.findByIdAndDelete(planId).lean();
  },

  /**
   * Get subscription plans by pricing model
   * @param {string} pricingModel - Pricing model
   * @returns {Promise<Array>} Array of subscription plan documents
   */
  async getSubscriptionPlansByPricingModel(pricingModel: 'CONSUMPTION' | 'FIXED' | 'TIERED_USAGE' | 'PER_SEAT') {
    await dbConnect();
    return SubscriptionPlan.find({ pricingModel }).lean();
  },

  /**
   * Get subscription plans by billing cadence
   * @param {string} billingCadence - Billing cadence
   * @returns {Promise<Array>} Array of subscription plan documents
   */
  async getSubscriptionPlansByBillingCadence(billingCadence: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') {
    await dbConnect();
    return SubscriptionPlan.find({ billingCadence }).lean();
  }
};

export default subscriptionPlanService;
