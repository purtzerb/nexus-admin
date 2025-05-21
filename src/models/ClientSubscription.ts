import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define ClientSubscription document interface
export interface IClientSubscription extends Document {
  clientId: mongoose.Types.ObjectId;
  subscriptionPlanId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING_RENEWAL';
  createdAt: Date;
  updatedAt: Date;
}

const clientSubscriptionSchema = new Schema<IClientSubscription>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    // unique: true // If a client can only have one active subscription at a time
  },
  subscriptionPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: { // Optional, for fixed-term subscriptions
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING_RENEWAL'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

// Create or retrieve the ClientSubscription model
const ClientSubscription = mongoose.models.ClientSubscription || 
  mongoose.model<IClientSubscription>('ClientSubscription', clientSubscriptionSchema);

export default ClientSubscription;
