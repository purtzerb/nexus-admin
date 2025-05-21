import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to authenticate external API requests using API key
 * @param request The incoming request
 * @returns NextResponse with 401 if unauthorized, or null if authorized
 */
export const authenticateApiKey = (request: NextRequest): NextResponse | null => {
  // Get API key from environment
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.error('API_KEY environment variable is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Get API key from request headers or query parameters
  const apiKeyHeader = request.headers.get('x-api-key');
  const url = new URL(request.url);
  const apiKeyQuery = url.searchParams.get('apiKey');

  console.log("BONGO API AUTH", {
    validApiKey,
    apiKeyHeader,
    apiKeyQuery
  })

  // If using query parameter, log a warning (query parameter method is deprecated)
  if (!apiKeyHeader && apiKeyQuery) {
    console.warn('API key provided via query parameter. This method is deprecated and will be removed in future versions. Please use the x-api-key header instead.');
  }

  // Use header first, then query parameter (for backward compatibility)
  const providedApiKey = apiKeyHeader || apiKeyQuery;

  // If no API key provided or API key doesn't match
  if (!providedApiKey) {
    return NextResponse.json({
      error: 'API key is required',
      message: 'Please provide your API key in the x-api-key header'
    }, { status: 401 });
  }

  if (providedApiKey !== validApiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // If we reach here, the API key is valid
  return null;
};
