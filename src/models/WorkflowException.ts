import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define WorkflowException document interface
export interface IWorkflowException extends Document {
  exceptionId: string; // ID passed in from external system
  workflowId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  exceptionType: string;
  severity: string;
  remedy: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const workflowExceptionSchema = new Schema<IWorkflowException>({
  exceptionId: {
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
  exceptionType: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  },
  remedy: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  }
}, { timestamps: true });

// Create compound index for faster queries
workflowExceptionSchema.index({ clientId: 1, workflowId: 1, createdAt: -1 });

// Create or retrieve the WorkflowException model
const WorkflowException = mongoose.models.WorkflowException || 
  mongoose.model<IWorkflowException>('WorkflowException', workflowExceptionSchema);

export default WorkflowException;
