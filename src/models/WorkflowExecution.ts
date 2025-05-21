import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define WorkflowExecution document interface
export interface IWorkflowExecution extends Document {
  executionId: string; // ID passed in from external system
  workflowId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  status: 'SUCCESS' | 'FAILURE';
  duration: number; // Duration in milliseconds
  createdAt: Date;
  updatedAt: Date;
}

const workflowExecutionSchema = new Schema<IWorkflowExecution>({
  executionId: {
    type: String,
    required: true,
    index: true
  },
  workflowId: {
    type: Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS'
  },
  duration: {
    type: Number,
    required: false
  }
}, { timestamps: true });

// Create compound index for faster queries
workflowExecutionSchema.index({ clientId: 1, workflowId: 1, createdAt: -1 });

// Create or retrieve the WorkflowExecution model
const WorkflowExecution = mongoose.models.WorkflowExecution || 
  mongoose.model<IWorkflowExecution>('WorkflowExecution', workflowExecutionSchema);

export default WorkflowExecution;
