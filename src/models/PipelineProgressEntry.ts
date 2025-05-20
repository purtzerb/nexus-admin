import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define PipelineProgressEntry document interface
export interface IPipelineProgressEntry extends Document {
  clientId: mongoose.Types.ObjectId;
  phaseName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedAt?: Date;
  order: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pipelineProgressEntrySchema = new Schema<IPipelineProgressEntry>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  phaseName: { // e.g., "Discovery: Initial Survey", "ADA Contract Signed"
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
    default: 'PENDING'
  },
  completedAt: {
    type: Date,
    required: false // Set when status becomes 'COMPLETED'
  },
  order: { // To maintain the sequence of phases for display
    type: Number,
    required: true
  },
  notes: { // Optional notes for this phase
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create or retrieve the PipelineProgressEntry model
const PipelineProgressEntry = mongoose.models.PipelineProgressEntry || 
  mongoose.model<IPipelineProgressEntry>('PipelineProgressEntry', pipelineProgressEntrySchema);

export default PipelineProgressEntry;
