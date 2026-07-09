/**
 * @module headers
 * Security headers configuration for API responses and pages.
 * Provides helpers to apply headers consistently and create safe error responses.
 */

/**
 * Standard security headers applied to every response.
 *
 * - **CSP** restricts resource loading to same-origin plus Google Fonts.
 * - **X-Content-Type-Options** prevents MIME-type sniffing.
 * - **X-Frame-Options** blocks all framing (clickjacking protection).
 * - **X-XSS-Protection** is disabled (modern CSP is preferred over legacy filters).
 * - **Referrer-Policy** limits referrer data sent cross-origin.
 * - **Permissions-Policy** disables unnecessary browser APIs.
 * - **HSTS** enforces HTTPS for one year, including subdomains.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/**
 * Apply all security headers to an existing Response object.
 *
 * @param response - The Response to augment with security headers
 * @returns The same Response instance with security headers set
 */
export function applySecurityHeaders(response: Response): Response {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

/**
 * Create a JSON error response with security headers applied.
 * The response body contains only a user-safe message — no stack traces
 * or internal details are ever exposed.
 *
 * @param statusCode  - HTTP status code for the error response (e.g. 400, 429, 500)
 * @param userMessage - A human-readable message safe to show to end users
 * @returns A fully-formed Response with JSON body and security headers
 */
export function createSecureErrorResponse(
  statusCode: number,
  userMessage: string,
): Response {
  const body = JSON.stringify({
    error: {
      message: userMessage,
      status: statusCode,
    },
  });

  const response = new Response(body, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return applySecurityHeaders(response);
}
