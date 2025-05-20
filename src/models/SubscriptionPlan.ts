import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define SubscriptionPlan document interface
export interface ISubscriptionPlan extends Document {
  name: string;
  pricingModel: 'CONSUMPTION' | 'FIXED' | 'TIERED_USAGE' | 'PER_SEAT';
  contractLengthMonths?: number;
  billingCadence: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  setupFee: number;
  prepaymentPercentage?: number;
  capAmount?: number;
  overageCost?: number;
  creditsPerPeriod?: number;
  pricePerCredit?: number;
  productUsageApi?: 'AIR_DIRECT' | 'NEXUS_BASE';
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: { // Plan name (could be custom for just one client)
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pricingModel: {
    type: String,
    enum: ['CONSUMPTION', 'FIXED', 'TIERED_USAGE', 'PER_SEAT'],
    required: true
  },
  contractLengthMonths: { // e.g., 1, 3, 6, 12
    type: Number,
    required: false
  },
  billingCadence: { // How often invoices are generated
    type: String,
    enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
    required: true
  },
  setupFee: {
    type: Number,
    default: 0
  },
  prepaymentPercentage: { // e.g., 10 for 10%
    type: Number,
    min: 0,
    max: 100,
    required: false
  },
  capAmount: { // Monetary cap for a period, if applicable
    type: Number,
    required: false
  },
  overageCost: { // Cost for usage beyond cap or included credits
    type: Number,
    required: false
  },
  // --- Fields for 'CONSUMPTION' pricing model ---
  creditsPerPeriod: { // Number of credits included in the plan per billing cadence
    type: Number,
    required: function(this: ISubscriptionPlan) { return this.pricingModel === 'CONSUMPTION'; }
  },
  pricePerCredit: { // Cost of a single credit
    type: Number,
    required: function(this: ISubscriptionPlan) { return this.pricingModel === 'CONSUMPTION'; }
  },
  productUsageApi: { // For consumption model, which API usage is tracked against
    type: String,
    enum: ['AIR_DIRECT', 'NEXUS_BASE'],
    required: function(this: ISubscriptionPlan) { return this.pricingModel === 'CONSUMPTION'; }
  }
}, { timestamps: true });

// Create or retrieve the SubscriptionPlan model
const SubscriptionPlan = mongoose.models.SubscriptionPlan || 
  mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
