import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define User document interface
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  phone?: string;
  role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
  costRate?: number;
  billRate?: number;
  assignedClientIds?: mongoose.Types.ObjectId[];
  clientId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  notifyByEmailForExceptions?: boolean;
  notifyBySmsForExceptions?: boolean;
  hasBillingAccess?: boolean;
  isClientAdmin?: boolean;
  clientUserNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: false },
  passwordSalt: { type: String, required: false },
  phone: { type: String, trim: true },
  role: { type: String, required: true, enum: ['ADMIN', 'SOLUTIONS_ENGINEER', 'CLIENT_USER'] },

  costRate: { type: Number, required: function(this: IUser) { return this.role === 'SOLUTIONS_ENGINEER'; } },
  billRate: { type: Number, required: function(this: IUser) { return this.role === 'SOLUTIONS_ENGINEER'; } },
  assignedClientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: [] }],

  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: function(this: IUser) { return this.role === 'CLIENT_USER'; } },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Optional
  notifyByEmailForExceptions: { type: Boolean, default: false, required: function(this: IUser) { return this.role === 'CLIENT_USER'; } },
  notifyBySmsForExceptions: { type: Boolean, default: false, required: function(this: IUser) { return this.role === 'CLIENT_USER'; } },
  hasBillingAccess: { type: Boolean, default: false, required: function(this: IUser) { return this.role === 'CLIENT_USER'; } },
  isClientAdmin: { type: Boolean, default: false, required: function(this: IUser) { return this.role === 'CLIENT_USER'; } },
  clientUserNotes: { type: String, trim: true },
}, { timestamps: true }); // `timestamps: true` automatically adds createdAt and updatedAt

// Create or retrieve the User model
// Create or retrieve the User model
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Define a type for lean user documents (plain objects returned by .lean())
export type LeanUserDocument = {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  phone?: string;
  role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
  costRate?: number;
  billRate?: number;
  assignedClientIds?: (mongoose.Types.ObjectId | string)[];
  clientId?: mongoose.Types.ObjectId | string;
  departmentId?: mongoose.Types.ObjectId | string;
  notifyByEmailForExceptions?: boolean;
  notifyBySmsForExceptions?: boolean;
  hasBillingAccess?: boolean;
  isClientAdmin?: boolean;
  clientUserNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  [key: string]: any; // Allow for additional properties
};

export default User;
