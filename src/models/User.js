import mongoose from 'mongoose';
import dbConnect from '../lib/db';

// Connect to the database
dbConnect();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: false },
  passwordSalt: { type: String, required: false },
  phone: { type: String, trim: true },
  role: { type: String, required: true, enum: ['ADMIN', 'SOLUTIONS_ENGINEER', 'CLIENT_USER'] },

  costRate: { type: Number, required: function() { return this.role === 'SOLUTIONS_ENGINEER'; } },
  billRate: { type: Number, required: function() { return this.role === 'SOLUTIONS_ENGINEER'; } },
  assignedClientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: [] }],

  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: function() { return this.role === 'CLIENT_USER'; } },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Optional
  notifyByEmailForExceptions: { type: Boolean, default: false, required: function() { return this.role === 'CLIENT_USER'; } },
  notifyBySmsForExceptions: { type: Boolean, default: false, required: function() { return this.role === 'CLIENT_USER'; } },
  hasBillingAccess: { type: Boolean, default: false, required: function() { return this.role === 'CLIENT_USER'; } },
  isClientAdmin: { type: Boolean, default: false, required: function() { return this.role === 'CLIENT_USER'; } },
  clientUserNotes: { type: String, trim: true },
}, { timestamps: true }); // `timestamps: true` automatically adds createdAt and updatedAt

// Create or retrieve the User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
