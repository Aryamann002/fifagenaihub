/**
 * Next.js Middleware — runs on the Edge runtime before every request.
 * Responsibilities:
 *  1. Apply security headers to all responses.
 *  2. Rate-limit API routes to prevent abuse.
 * @module middleware
 */

import { type NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { SECURITY_HEADERS } from '@/lib/security/headers';

/**
 * Extracts the client IP address from the request headers.
 * Falls back to 'anonymous' if no IP can be determined.
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

/**
 * Next.js middleware function.
 * Applies security headers to all requests and rate-limits API routes.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Rate-limit API routes only
  if (pathname.startsWith('/api/')) {
    const clientIp = getClientIp(request);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '20', 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

    const rateLimitResult = checkRateLimit(clientIp, {
      maxTokens: maxRequests,
      refillRatePerSecond: maxRequests / (windowMs / 1000),
    });

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please slow down and try again.' },
        { status: 429 },
      );
      response.headers.set('Retry-After', String(Math.ceil(rateLimitResult.retryAfterSeconds)));
      // Apply security headers even on 429 responses
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
  }

  // Apply security headers to all responses
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Middleware matcher configuration.
 * Excludes Next.js internals and static assets for performance.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|_next/webpack-hmr|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
