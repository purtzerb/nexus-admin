import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define credential types for different services
export interface SlackCredentials {
  workspaceUrl: string;
  botUserOAuthToken: string;
  signingSecret: string;
}

export interface GitHubCredentials {
  personalAccessToken: string;
  owner: string;
  repository?: string;
}

export interface JiraCredentials {
  domain: string;
  email: string;
  apiToken: string;
}

export interface SalesforceCredentials {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

// Union type for all credential types
export type CredentialData = 
  | { type: 'Slack', data: SlackCredentials }
  | { type: 'GitHub', data: GitHubCredentials }
  | { type: 'Jira', data: JiraCredentials }
  | { type: 'Salesforce', data: SalesforceCredentials }
  | { type: 'AWS', data: AWSCredentials };

// Define Credential document interface
export interface ICredential extends Document {
  clientId: mongoose.Types.ObjectId;
  serviceName: string;
  credentials: CredentialData;
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
  credentials: { 
    type: Schema.Types.Mixed, // Mixed type to accommodate different credential formats
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
