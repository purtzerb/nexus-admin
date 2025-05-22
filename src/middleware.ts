import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define paths that don't require authentication
const publicPaths = [
  '/login',
  '/api/auth/login',
  '/api/external', // Allow external API routes to handle their own authentication
  '/api/swagger', // Allow Swagger documentation to be accessed
  '/api-docs',    // Allow Swagger UI to be accessed
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for API routes that need authentication
  // Skip external API routes as they have their own authentication mechanism
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/external') && !pathname.startsWith('/api/swagger')) {
    // Log all cookies for debugging
    console.log('Middleware - API Route:', pathname);

    const token = request.cookies.get('auth-token');
    const nextAuthSession = request.cookies.get('next-auth.session-token') ||
                           request.cookies.get('__Secure-next-auth.session-token');

    // Allow the request to proceed if either auth system has a valid token
    if (nextAuthSession) {
      console.log('Middleware - NextAuth session found, allowing request');
      return NextResponse.next();
    }

    if (!token) {
      console.log('Middleware - No auth tokens found, returning 401');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token.value, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  }

  // For non-API routes, redirect to login if not authenticated
  const token = request.cookies.get('auth-token');

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token.value, secret);
    return NextResponse.next();
  } catch (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
