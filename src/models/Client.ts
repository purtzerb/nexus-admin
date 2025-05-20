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
export interface IClient extends Document {
  companyName: string;
  companyUrl?: string;
  contractStartDate?: Date;
  assignedSolutionsEngineerIds?: mongoose.Types.ObjectId[];
  pipelineProgressCurrentPhase?: string;
  activeSubscriptionId?: mongoose.Types.ObjectId;
  departments?: IClientDepartment[];
  users?: IClientUser[];
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  industry?: string;
  contactName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define schemas for nested documents
const clientUserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  exceptions: {
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  access: {
    billing: {
      type: Boolean,
      default: false
    },
    admin: {
      type: Boolean,
      default: false
    }
  }
});

const clientDepartmentSchema = new Schema({
  name: {
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
  // This links to the specific instance of a subscription for this client
  activeSubscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'ClientSubscription',
    required: false
  },
  // New fields based on mockup
  departments: [clientDepartmentSchema],
  users: [clientUserSchema],
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
  }
}, { timestamps: true });

// Create or retrieve the Client model
const Client = mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);

export default Client;
