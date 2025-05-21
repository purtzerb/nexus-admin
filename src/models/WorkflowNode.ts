import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define WorkflowNode document interface
export interface IWorkflowNode extends Document {
  nodeId: string; // ID passed in from external system
  workflowId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  nodeName: string;
  nodeType: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const workflowNodeSchema = new Schema<IWorkflowNode>({
  nodeId: {
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
  nodeName: {
    type: String,
    required: true
  },
  nodeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

// Create compound index for faster queries
workflowNodeSchema.index({ clientId: 1, workflowId: 1, createdAt: -1 });

// Create or retrieve the WorkflowNode model
const WorkflowNode = mongoose.models.WorkflowNode || 
  mongoose.model<IWorkflowNode>('WorkflowNode', workflowNodeSchema);

export default WorkflowNode;
