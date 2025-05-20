import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define Credential document interface
export interface ICredential extends Document {
  clientId: mongoose.Types.ObjectId;
  serviceName: string;
  encryptedCredentials: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR_NEEDS_REAUTH';
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const credentialSchema = new Schema<ICredential>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  serviceName: { // e.g., "Slack", "GitHub", "Salesforce"
    type: String,
    required: true,
    trim: true
  },
  encryptedCredentials: { // Store as an encrypted string/blob
    type: String, // Actual encryption/decryption happens at application layer
    required: true
  },
  status: { // e.g., "Connected", "Disconnected", "Error"
    type: String,
    enum: ['CONNECTED', 'DISCONNECTED', 'ERROR_NEEDS_REAUTH'],
    default: 'DISCONNECTED'
  },
  lastVerifiedAt: { // Timestamp of when connection was last successfully verified
    type: Date
  }
}, { timestamps: true });

// Create or retrieve the Credential model
const Credential = mongoose.models.Credential || mongoose.model<ICredential>('Credential', credentialSchema);

export default Credential;
