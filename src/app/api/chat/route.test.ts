/**
 * @jest-environment node
 *
 * Tests for POST /api/chat — request validation, error paths,
 * and the full happy path against the offline mock provider.
 * @module app/api/chat/route.test
 */

import type { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/chat/route';

/** Builds a POST request to the chat endpoint with the given raw body */
function chatRequest(body: string): NextRequest {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }) as unknown as NextRequest;
}

beforeAll(() => {
  process.env.GENAI_PROVIDER = 'mock';
});

describe('POST /api/chat', () => {
  it('returns a full chat response for a valid fan request', async () => {
    const response = await POST(
      chatRequest(
        JSON.stringify({
          message: 'Where is Gate B?',
          context: { stadiumId: 'metlife', role: 'fan' },
        }),
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.reply).toBe('string');
    // Stadium ID must be resolved to the real venue name for the AI
    expect(data.reply).toContain('MetLife Stadium');
    expect(data.detectedLanguage).toBe('en');
    expect(Array.isArray(data.suggestions)).toBe(true);
  });

  it('answers staff queries with live-ops grounding without erroring', async () => {
    const response = await POST(
      chatRequest(
        JSON.stringify({
          message: 'How is crowd flow at the gates?',
          context: { stadiumId: 'sofi', role: 'staff' },
        }),
      ),
    );

    expect(response.status).toBe(200);
  });

  it('rejects invalid JSON with 400', async () => {
    const response = await POST(chatRequest('{not json'));
    expect(response.status).toBe(400);
  });

  it('rejects a missing message with 400', async () => {
    const response = await POST(
      chatRequest(JSON.stringify({ context: { stadiumId: 'metlife', role: 'fan' } })),
    );
    expect(response.status).toBe(400);
  });

  it('rejects a missing context with 400', async () => {
    const response = await POST(chatRequest(JSON.stringify({ message: 'Hello' })));
    expect(response.status).toBe(400);
  });

  it('rejects an invalid role with 400', async () => {
    const response = await POST(
      chatRequest(
        JSON.stringify({
          message: 'Hello',
          context: { stadiumId: 'metlife', role: 'admin' },
        }),
      ),
    );
    expect(response.status).toBe(400);
  });

  it('rejects messages over the 500-character limit with 400', async () => {
    const response = await POST(
      chatRequest(
        JSON.stringify({
          message: 'a'.repeat(501),
          context: { stadiumId: 'metlife', role: 'fan' },
        }),
      ),
    );
    expect(response.status).toBe(400);
  });

  it('sets no-store caching on successful responses', async () => {
    const response = await POST(
      chatRequest(
        JSON.stringify({
          message: 'Hello there',
          context: { stadiumId: 'metlife', role: 'fan' },
        }),
      ),
    );
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('GET /api/chat', () => {
  it('returns 405 method not allowed', async () => {
    const response = await GET();
    expect(response.status).toBe(405);
  });
});
