import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define Client document interface
export interface IClient extends Document {
  companyName: string;
  companyUrl?: string;
  contractStartDate?: Date;
  assignedSolutionsEngineerIds?: mongoose.Types.ObjectId[];
  pipelineProgressCurrentPhase?: string;
  activeSubscriptionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyUrl: {
    type: String,
    trim: true,
    required: false
  },
  contractStartDate: {
    type: Date,
    required: false
  },
  // To store which SEs are assigned to this client
  assignedSolutionsEngineerIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User' // Refers to User documents with role 'SOLUTIONS_ENGINEER'
  }],
  pipelineProgressCurrentPhase: { // Name of the current onboarding phase
    type: String,
    trim: true,
    required: false
  },
  // This links to the specific instance of a subscription for this client
  activeSubscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'ClientSubscription',
    required: false
  }
}, { timestamps: true });

// Create or retrieve the Client model
const Client = mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);

export default Client;
