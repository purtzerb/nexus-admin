import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define ClientCredit document interface
export interface IClientCredit extends Document {
  clientId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  appliedBy: string;
  appliedAt: Date;
  transactionType: 'CREDIT' | 'DEBIT';
  balance: number; // Running balance after this transaction
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clientCreditSchema = new Schema<IClientCredit>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  appliedBy: {
    type: String,
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  transactionType: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true,
    default: 'CREDIT'
  },
  balance: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create or retrieve the ClientCredit model
const ClientCredit = mongoose.models.ClientCredit || 
  mongoose.model<IClientCredit>('ClientCredit', clientCreditSchema);

export default ClientCredit;
