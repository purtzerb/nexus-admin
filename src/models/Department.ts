import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define Department document interface
export interface IDepartment extends Document {
  clientId?: mongoose.Types.ObjectId;
  name: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true });

// Create or retrieve the Department model
const Department = mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;
