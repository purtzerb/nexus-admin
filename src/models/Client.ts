import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define interfaces for nested documents
export interface IClientUser extends Document {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  exceptions?: {
    email?: boolean;
    sms?: boolean;
  };
  access?: {
    billing?: boolean;
    admin?: boolean;
  };
}

export interface IClientDepartment extends Document {
  name: string;
}

// Define Client document interface
export interface IPipelineStep {
  name: string;
  status: 'pending' | 'completed';
  completedDate?: Date;
  order: number;
}

export interface IDocumentLink {
  title: string;
  url: string;
  type: string;
}
export interface IClient extends Document {
  companyName: string;
  companyUrl?: string;
  contractStartDate?: Date;
  assignedSolutionsEngineerIds?: mongoose.Types.ObjectId[];
  pipelineProgressCurrentPhase?: string;
  pipelineSteps?: IPipelineStep[];
  documentLinks?: IDocumentLink[];
  activeSubscriptionId?: mongoose.Types.ObjectId;
  users?: IClientUser[];
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  industry?: string;
  contactName?: string;
  creditBalance?: number;
  lastCreditUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pipelineStepSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  completedDate: {
    type: Date
  },
  order: {
    type: Number,
    required: true
  }
});

const documentLinkSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    required: true,
    trim: true
  }
});

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
  pipelineSteps: {
    type: [pipelineStepSchema],
    default: []
  },
  documentLinks: {
    type: [documentLinkSchema],
    default: []
  },
  // This links to the specific instance of a subscription for this client
  activeSubscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'ClientSubscription',
    required: false
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'PENDING'
  },
  industry: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    trim: true
  },
  creditBalance: {
    type: Number,
    default: 0
  },
  lastCreditUpdate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create or retrieve the Client model
const Client = mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);

export default Client;
