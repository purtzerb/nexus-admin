import User from '../models/User';
import dbConnect from './db';

/**
 * User service for handling user-related operations
 */
export const userService = {
  /**
   * Get all users with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of user documents
   */
  async getUsers(filter = {}, options = {}) {
    await dbConnect();
    
    const { sort, limit, skip } = options;
    let query = User.find(filter);
    
    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);
    
    return query.lean();
  },

  /**
   * Get a single user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User document
   */
  async getUserById(userId) {
    await dbConnect();
    return User.findById(userId).lean();
  },

  /**
   * Get a single user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User document
   */
  async getUserByEmail(email) {
    await dbConnect();
    return User.findOne({ email: email.toLowerCase() }).lean();
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user document
   */
  async createUser(userData) {
    await dbConnect();
    const user = new User(userData);
    return user.save();
  },

  /**
   * Update an existing user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user document
   */
  async updateUser(userId, updateData) {
    await dbConnect();
    return User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user document
   */
  async deleteUser(userId) {
    await dbConnect();
    return User.findByIdAndDelete(userId).lean();
  },

  /**
   * Get users by role
   * @param {string} role - User role (ADMIN, SOLUTIONS_ENGINEER, CLIENT_USER)
   * @returns {Promise<Array>} Array of user documents
   */
  async getUsersByRole(role) {
    await dbConnect();
    return User.find({ role }).lean();
  },

  /**
   * Get client users by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of client user documents
   */
  async getClientUsers(clientId) {
    await dbConnect();
    return User.find({ 
      role: 'CLIENT_USER',
      clientId
    }).lean();
  },

  /**
   * Get solutions engineers assigned to a client
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of solutions engineer documents
   */
  async getSolutionsEngineersForClient(clientId) {
    await dbConnect();
    return User.find({
      role: 'SOLUTIONS_ENGINEER',
      assignedClientIds: clientId
    }).lean();
  }
};

export default userService;
