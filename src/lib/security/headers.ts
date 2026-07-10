/**
 * @module headers
 * Security helpers for API route responses.
 * Page-level security headers are configured in next.config.ts.
 */

export const API_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
};

export function createSecureErrorResponse(
  statusCode: number,
  userMessage: string,
): Response {
  const body = JSON.stringify({ error: { message: userMessage, status: statusCode } });
  return new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}
