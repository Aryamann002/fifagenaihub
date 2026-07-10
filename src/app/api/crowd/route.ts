/**
 * GET /api/crowd
 * @module app/api/crowd
 */

import { type NextRequest, NextResponse } from 'next/server';
import { generateCrowdData } from '@/lib/data/crowd-simulator';
import { validateStadiumId } from '@/lib/security/input-validator';

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const stadiumId = searchParams.get('stadiumId');

    if (!validateStadiumId(stadiumId)) {
      return errorResponse(400, 'Missing or invalid stadiumId query parameter.');
    }

    const crowdData = generateCrowdData(stadiumId as string);

    return NextResponse.json(crowdData, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=5, stale-while-revalidate=10' },
    });
  } catch {
    return errorResponse(500, 'An unexpected error occurred. Please try again later.');
  }
}

export async function POST(): Promise<NextResponse> {
  return errorResponse(405, 'Method not allowed. Use GET.');
}
