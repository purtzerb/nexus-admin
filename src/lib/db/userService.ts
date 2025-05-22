import User, { IUser, LeanUserDocument } from '@/models/User';
import { Document, PopulateOptions } from 'mongoose';
import dbConnect from './db';
import mongoose from 'mongoose';

// Define types for function parameters
type FilterQuery = Record<string, any>;

interface QueryOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
}

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
  async getUsers(filter: FilterQuery = {}, options: QueryOptions = {}): Promise<LeanUserDocument[]> {
    await dbConnect();

    const { sort, limit, skip, populate } = options;
    let query = User.find(filter);

    // Handle population of related fields if requested
    if (populate) {
      if (Array.isArray(populate)) {
        // If it's an array of field names or population options
        for (const field of populate) {
          query = query.populate(field as any);
        }
      } else {
        // If it's a single field name or population options
        query = query.populate(populate as any);
      }
    }

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean() as unknown as LeanUserDocument[];
  },

  /**
   * Get a single user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User document
   */
  async getUserById(userId: string): Promise<LeanUserDocument | null> {
    await dbConnect();
    return User.findById(userId).lean() as unknown as LeanUserDocument | null;
  },

  /**
   * Get a single user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User document
   */
  async getUserByEmail(email: string): Promise<LeanUserDocument | null> {
    await dbConnect();
    return User.findOne({ email: email.toLowerCase() }).lean() as unknown as LeanUserDocument | null;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user document
   */
  async createUser(userData: Partial<IUser>) {
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
  async updateUser(userId: string, updateData: Partial<IUser>): Promise<LeanUserDocument | null> {
    await dbConnect();
    return User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).lean() as unknown as LeanUserDocument | null;
  },

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user document
   */
  async deleteUser(userId: string): Promise<LeanUserDocument | null> {
    await dbConnect();
    return User.findByIdAndDelete(userId).lean() as unknown as LeanUserDocument | null;
  },

  /**
   * Get users by role
   * @param {string} role - User role (ADMIN, SOLUTIONS_ENGINEER, CLIENT_USER)
   * @returns {Promise<Array>} Array of user documents
   */
  async getUsersByRole(role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER'): Promise<LeanUserDocument[]> {
    await dbConnect();
    return User.find({ role }).lean() as unknown as LeanUserDocument[];
  },

  /**
   * Get client users by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of client user documents
   */
  async getClientUsers(clientId: string): Promise<LeanUserDocument[]> {
    await dbConnect();
    return User.find({
      role: 'CLIENT_USER',
      clientId
    }).lean() as unknown as LeanUserDocument[];
  },

  /**
   * Get users with populated department information
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of user documents with populated departments
   */
  async getUsersWithDepartments(filter: FilterQuery = {}, options: QueryOptions = {}): Promise<LeanUserDocument[]> {
    await dbConnect();

    const { sort, limit, skip } = options;
    let query = User.find(filter).populate('departmentId', 'name');

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    const users = await query.lean();

    // Transform the populated data to match the expected format in the frontend
    return users.map(user => {
      const result = { ...user };

      // If departmentId is populated with department data
      if (user.departmentId && typeof user.departmentId === 'object') {
        const dept = user.departmentId as any;
        // Add department property in the format expected by the frontend
        result.department = {
          id: dept._id.toString(),
          name: dept.name
        };
      }

      return result;
    }) as unknown as LeanUserDocument[];
  },

  /**
   * Get solutions engineers assigned to a client
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of solutions engineer documents
   */
  async getSolutionsEngineersForClient(clientId: string): Promise<LeanUserDocument[]> {
    await dbConnect();
    return User.find({
      role: 'SOLUTIONS_ENGINEER',
      assignedClientIds: clientId
    }).lean() as unknown as LeanUserDocument[];
  },

  /**
   * Update multiple users matching a filter
   * @param {Object} filter - MongoDB filter object
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateManyUsers(filter: FilterQuery, updateData: any) {
    await dbConnect();
    return User.updateMany(filter, updateData);
  }
};

export default userService;
