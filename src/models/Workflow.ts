import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define Workflow document interface
export interface IWorkflow extends Document {
  clientId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  numberOfNodes: number;
  numberOfExecutions: number;
  numberOfExceptions: number;
  timeSavedPerExecution?: number;
  totalTimeSaved?: number;
  moneySavedPerExecution?: number;
  totalMoneySaved?: number;
  createdAt: Date;
  updatedAt: Date;
}

const workflowSchema = new Schema<IWorkflow>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: false // Department is optional
  },
  name: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  numberOfNodes: { // Total # of nodes
    type: Number,
    default: 0
  },
  numberOfExecutions: { // # of executions
    type: Number,
    default: 0 // This would be incremented
  },
  numberOfExceptions: { // # of exceptions
    type: Number,
    default: 0 // This would be incremented
  },
  timeSavedPerExecution: { // Admin input, e.g., in minutes or hours
    type: Number,
    required: false
  },
  totalTimeSaved: { // numberOfExecutions * timeSavedPerExecution
    type: Number,
    required: false
  },
  moneySavedPerExecution: { // Admin input, based on an hourly rate or other metric
    type: Number,
    required: false
  },
  totalMoneySaved: { // numberOfExecutions * moneySavedPerExecution
    type: Number,
    required: false
  }
}, { timestamps: true });

// Create or retrieve the Workflow model
const Workflow = mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', workflowSchema);

export default Workflow;
