import Department, { IDepartment } from '@/models/Department';
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
 * Department service for handling department-related operations
 */
export const departmentService = {
  /**
   * Get all departments with optional filtering
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>} Array of department documents
   */
  async getDepartments(filter: FilterQuery = {}, options: QueryOptions = {}) {
    await dbConnect();

    const { sort, limit, skip } = options;
    let query = Department.find(filter);

    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return query.lean();
  },

  /**
   * Get a single department by ID
   * @param {string} departmentId - Department ID
   * @returns {Promise<Object>} Department document
   */
  async getDepartmentById(departmentId: string) {
    await dbConnect();
    return Department.findById(departmentId).lean();
  },

  /**
   * Get departments by client ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Array of department documents
   */
  async getDepartmentsByClientId(clientId: string) {
    await dbConnect();
    return Department.find({ clientId }).lean();
  },

  /**
   * Create a new department
   * @param {Object} departmentData - Department data
   * @returns {Promise<Object>} Created department document
   */
  async createDepartment(departmentData: Partial<IDepartment>) {
    await dbConnect();
    const department = new Department(departmentData);
    return department.save();
  },

  /**
   * Update an existing department
   * @param {string} departmentId - Department ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated department document
   */
  async updateDepartment(departmentId: string, updateData: Partial<IDepartment>) {
    await dbConnect();
    return Department.findByIdAndUpdate(
      departmentId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
  },

  /**
   * Delete a department
   * @param {string} departmentId - Department ID
   * @returns {Promise<Object>} Deleted department document
   */
  async deleteDepartment(departmentId: string) {
    await dbConnect();
    return Department.findByIdAndDelete(departmentId).lean();
  },

  /**
   * Bulk create departments for a client
   * @param {string} clientId - Client ID
   * @param {Array<string>} departmentNames - Array of department names
   * @returns {Promise<Array>} Array of created department documents
   */
  async bulkCreateDepartments(clientId: string, departmentNames: string[]) {
    await dbConnect();
    
    const departments = departmentNames.map(name => ({
      clientId,
      name
    }));
    
    return Department.insertMany(departments);
  }
};

export default departmentService;
