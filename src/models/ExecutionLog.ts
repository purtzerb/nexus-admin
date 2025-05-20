import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define ExecutionLog document interface
export interface IExecutionLog extends Document {
  workflowId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  executionTimestamp: Date;
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

const executionLogSchema = new Schema<IExecutionLog>({
  workflowId: {
    type: Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  clientId: { // Denormalized for easier querying/filtering for client-specific logs
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  executionTimestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  details: { // Log message or summary of execution
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Create or retrieve the ExecutionLog model
const ExecutionLog = mongoose.models.ExecutionLog || mongoose.model<IExecutionLog>('ExecutionLog', executionLogSchema);

export default ExecutionLog;
