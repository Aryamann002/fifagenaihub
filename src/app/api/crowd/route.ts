/**
 * GET /api/crowd
 * Returns real-time (simulated) crowd density data for a given stadium.
 * Powers the Staff Crowd Pulse dashboard.
 * @module app/api/crowd
 */

import { type NextRequest, NextResponse } from 'next/server';
import { generateCrowdData } from '@/lib/data/crowd-simulator';
import { validateStadiumId } from '@/lib/security/input-validator';
import { SECURITY_HEADERS } from '@/lib/security/headers';

/**
 * Applies security headers to a NextResponse.
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Creates a secure error response without leaking internals.
 */
function errorResponse(status: number, message: string): NextResponse {
  const response = NextResponse.json({ error: message }, { status });
  return withSecurityHeaders(response);
}

/**
 * Handles GET requests to the crowd data endpoint.
 * Validates the stadiumId query parameter and returns a crowd snapshot.
 *
 * @example GET /api/crowd?stadiumId=metlife-stadium
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const stadiumId = searchParams.get('stadiumId');

    if (!validateStadiumId(stadiumId)) {
      return errorResponse(400, 'Missing or invalid stadiumId query parameter.');
    }

    const crowdData = generateCrowdData(stadiumId as string);

    const response = NextResponse.json(crowdData, {
      status: 200,
      headers: {
        // Allow clients to cache for a very short time (crowd data changes fast)
        'Cache-Control': 'public, max-age=5, stale-while-revalidate=10',
      },
    });

    return withSecurityHeaders(response);
  } catch {
    return errorResponse(500, 'An unexpected error occurred. Please try again later.');
  }
}

/** Only GET is supported on this route */
export async function POST(): Promise<NextResponse> {
  return errorResponse(405, 'Method not allowed. Use GET.');
}
