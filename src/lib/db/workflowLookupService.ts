import Workflow, { IWorkflow } from '@/models/Workflow';
import dbConnect from './db';
import mongoose from 'mongoose';

// Define a type for the workflow document with _id
type WorkflowDocument = IWorkflow & { _id: mongoose.Types.ObjectId };

/**
 * Service for looking up workflows by name and client
 */
export const workflowLookupService = {
  /**
   * Find a workflow by name and client ID
   * @param {string} workflowName - Workflow name
   * @param {string} clientId - Client ID
   * @returns {Promise<WorkflowDocument | null>} Workflow document or null if not found
   */
  async findWorkflowByNameAndClient(workflowName: string, clientId: string): Promise<WorkflowDocument | null> {
    await dbConnect();
    
    // Validate client ID format
    if (!mongoose.isValidObjectId(clientId)) {
      return null;
    }
    
    // Find the workflow
    const result = await Workflow.findOne({
      name: workflowName,
      clientId: new mongoose.Types.ObjectId(clientId)
    }).lean();
    
    // Type assertion to ensure correct return type
    return result as WorkflowDocument | null;
  }
};

export default workflowLookupService;
