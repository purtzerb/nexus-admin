import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger/swagger';

// Force dynamic rendering to ensure the latest API documentation
export const dynamic = 'force-dynamic';

/**
 * GET /api/swagger
 * Returns the OpenAPI specification for the external API
 */
export async function GET() {
  const spec = getApiDocs();
  return NextResponse.json(spec);
}
