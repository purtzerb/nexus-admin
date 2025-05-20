import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Define and export environment variables with type safety
export const env = {
  JWT_SECRET: process.env.JWT_SECRET || '',
  // Add other environment variables as needed
};

// Validate required environment variables
const requiredEnvVars: Array<keyof typeof env> = ['JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
