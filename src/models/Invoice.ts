import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define Invoice document interface
export interface IInvoice extends Document {
  clientId: mongoose.Types.ObjectId;
  clientSubscriptionId: mongoose.Types.ObjectId;
  invoiceDate: Date;
  dueDate: Date;
  paymentMethodInfo?: string;
  amountBilled: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  clientSubscriptionId: { // The subscription this invoice pertains to
    type: Schema.Types.ObjectId,
    ref: 'ClientSubscription',
    required: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: { // Terms (due by)
    type: Date,
    required: true
  },
  paymentMethodInfo: { // e.g., "Stripe Charge ID: xyz", "Check #123", "Submitted to ERP"
    type: String,
    trim: true,
    required: false
  },
  amountBilled: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'VOID'],
    default: 'DRAFT'
  },
  notes: { // Any internal notes or notes for the client on the invoice
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create or retrieve the Invoice model
const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;
