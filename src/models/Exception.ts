import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define Exception document interface
export interface IExceptionNotification {
  userId: mongoose.Types.ObjectId;
  notifiedAt: Date;
  method: 'EMAIL' | 'SMS';
}

export interface IException extends Document {
  workflowId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  departmentName?: string;
  workflowName: string;
  reportedAt: Date;
  exceptionType: 'AUTHENTICATION' | 'DATA_PROCESS' | 'INTEGRATION' | 'WORKFLOW_LOGIC' | 'BROWSER_AUTOMATION' | 'OTHER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remedy?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED';
  notifications: IExceptionNotification[];
  createdAt: Date;
  updatedAt: Date;
}

const exceptionSchema = new Schema<IException>({
  workflowId: {
    type: Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  clientId: { // Denormalized for easier querying
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  departmentName: { // Denormalized for display in exception log table
    type: String,
    trim: true,
    required: false
  },
  workflowName: { // Denormalized for display in exception log table
    type: String,
    trim: true,
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  exceptionType: {
    type: String,
    enum: ['AUTHENTICATION', 'DATA_PROCESS', 'INTEGRATION', 'WORKFLOW_LOGIC', 'BROWSER_AUTOMATION', 'OTHER'],
    required: true
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    required: true
  },
  remedy: { // Short text input by HITL
    type: String,
    trim: true,
    required: false
  },
  status: { // Editable status
    type: String,
    enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED'],
    default: 'NEW'
  },
  // For "Notifications: List of users who were be notified, when and how (email / SMS)"
  notifications: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notifiedAt: { type: Date, default: Date.now, required: true },
    method: { type: String, enum: ['EMAIL', 'SMS'], required: true }
  }]
}, { timestamps: true });

// Create or retrieve the Exception model
const Exception = mongoose.models.Exception || mongoose.model<IException>('Exception', exceptionSchema);

export default Exception;
