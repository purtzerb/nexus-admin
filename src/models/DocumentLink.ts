import mongoose, { Document, Schema } from 'mongoose';
import dbConnect from '@/lib/db/db';

// Connect to the database
dbConnect();

// Define DocumentLink document interface
export interface IDocumentLink extends Document {
  clientId: mongoose.Types.ObjectId;
  documentType: 'SURVEY_QUESTIONS' | 'SURVEY_RESULTS' | 'PROCESS_DOCUMENTATION' | 'ADA_PROPOSAL' | 'CONTRACT' | 'FACTORY_MARKDOWN' | 'TEST_PLAN';
  url: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentLinkSchema = new Schema<IDocumentLink>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  documentType: {
    type: String,
    enum: [
      'SURVEY_QUESTIONS',
      'SURVEY_RESULTS',
      'PROCESS_DOCUMENTATION',
      'ADA_PROPOSAL',
      'CONTRACT',
      'FACTORY_MARKDOWN',
      'TEST_PLAN'
    ],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  description: { // Optional short description
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create or retrieve the DocumentLink model
const DocumentLink = mongoose.models.DocumentLink || mongoose.model<IDocumentLink>('DocumentLink', documentLinkSchema);

export default DocumentLink;
