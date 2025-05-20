import type { NextConfig } from "next";
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
