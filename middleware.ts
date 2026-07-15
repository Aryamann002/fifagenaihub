/**
 * Next.js Middleware — Edge runtime.
 * 1. Generates a per-request nonce for CSP.
 * 2. Sets Content-Security-Policy with the nonce.
 * 3. Rate-limits API routes.
 * @module middleware
 */

import { type NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  );
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Rate-limit the AI endpoint (real provider cost). /api/crowd is exempt: it's
  // cheap, read-only simulated data that the staff dashboard polls every 5s, so
  // sharing the bucket would let the dashboard rate-limit the chat against itself.
  if (pathname.startsWith('/api/') && pathname !== '/api/crowd') {
    const clientIp = getClientIp(request);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '20', 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

    const rateLimitResult = checkRateLimit(clientIp, {
      maxTokens: maxRequests,
      refillRatePerSecond: maxRequests / (windowMs / 1000),
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimitResult.retryAfterSeconds)) },
        },
      );
    }
  }

  // Generate a cryptographically random nonce per request
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self'`,
    `img-src 'self' data: blob:`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join('; ');

  // The CSP must also be on the *request* headers: Next.js reads the nonce
  // from there and applies it to its own inline scripts during rendering.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=(), autoplay=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(self), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), web-share=()',
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
