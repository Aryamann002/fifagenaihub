/**
 * @jest-environment node
 *
 * Tests for GET /api/crowd — stadium ID validation and crowd payloads.
 * @module app/api/crowd/route.test
 */

import type { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/crowd/route';

/** Builds a GET request to the crowd endpoint with the given query string */
function crowdRequest(query: string): NextRequest {
  return new Request(`http://localhost/api/crowd${query}`) as unknown as NextRequest;
}

describe('GET /api/crowd', () => {
  it('returns crowd data for a valid stadium', async () => {
    const response = await GET(crowdRequest('?stadiumId=metlife'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stadiumId).toBe('metlife');
    expect(data.zones.length).toBeGreaterThan(0);
    expect(typeof data.aiSummary).toBe('string');
  });

  it('rejects a missing stadiumId with 400', async () => {
    const response = await GET(crowdRequest(''));
    expect(response.status).toBe(400);
  });

  it('rejects a stadiumId with special characters with 400', async () => {
    const response = await GET(crowdRequest('?stadiumId=<script>'));
    expect(response.status).toBe(400);
  });

  it('rejects an over-long stadiumId with 400', async () => {
    const response = await GET(crowdRequest(`?stadiumId=${'a'.repeat(51)}`));
    expect(response.status).toBe(400);
  });
});

describe('POST /api/crowd', () => {
  it('returns 405 method not allowed', async () => {
    const response = await POST();
    expect(response.status).toBe(405);
  });
});
