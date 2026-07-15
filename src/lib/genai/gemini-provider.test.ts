/**
 * Tests for the Gemini provider — configuration handling, request shape,
 * and graceful error degradation (mocked fetch; no network).
 * @module lib/genai/gemini-provider.test
 */

import { GeminiProvider } from '@/lib/genai/gemini-provider';
import type { GenAIContext } from '@/lib/genai/types';

const CONTEXT: GenAIContext = {
  stadiumId: 'metlife',
  stadiumName: 'MetLife Stadium',
  role: 'fan',
};

const originalFetch = global.fetch;
const originalKey = process.env.GEMINI_API_KEY;

function mockFetchResponse(body: unknown, ok = true, status = 200): jest.Mock {
  const mock = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => body,
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

afterEach(() => {
  global.fetch = originalFetch;
  if (originalKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

describe('GeminiProvider', () => {
  it('degrades gracefully when no API key is configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const fetchMock = mockFetchResponse({});

    const response = await new GeminiProvider().generateResponse('Hello', CONTEXT);

    expect(response.confidence).toBe(0);
    expect(response.reply).toContain('not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('parses a successful API response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockFetchResponse({
      candidates: [{ content: { parts: [{ text: 'Gate B is north.\nNeed a map?' }] } }],
    });

    const response = await new GeminiProvider().generateResponse('Where is Gate B?', CONTEXT);

    expect(response.reply).toBe('Gate B is north.\nNeed a map?');
    expect(response.confidence).toBeGreaterThan(0.9);
    expect(response.suggestions).toContain('Need a map?');
    expect(response.category).toBe('navigation');
  });

  it('sends the API key in a header, never in the URL', async () => {
    process.env.GEMINI_API_KEY = 'secret-key';
    const fetchMock = mockFetchResponse({
      candidates: [{ content: { parts: [{ text: 'ok' }] } }],
    });

    await new GeminiProvider().generateResponse('Hello', CONTEXT);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain('secret-key');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('secret-key');
  });

  it('grounds staff answers in the live ops snapshot', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const fetchMock = mockFetchResponse({
      candidates: [{ content: { parts: [{ text: 'ok' }] } }],
    });

    await new GeminiProvider().generateResponse('Status?', {
      ...CONTEXT,
      role: 'staff',
      liveOpsSummary: 'Gate A at 92% (critical)',
    });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.systemInstruction.parts[0].text).toContain('Gate A at 92% (critical)');
  });

  it('includes conversation history in Gemini format', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const fetchMock = mockFetchResponse({
      candidates: [{ content: { parts: [{ text: 'ok' }] } }],
    });

    await new GeminiProvider().generateResponse('And food?', {
      ...CONTEXT,
      previousMessages: [
        { role: 'user', content: 'Where is Gate B?' },
        { role: 'assistant', content: 'North side.' },
      ],
    });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.contents).toHaveLength(3);
    expect(body.contents[1].role).toBe('model');
    expect(body.contents[2].parts[0].text).toBe('And food?');
  });

  it('returns a graceful error reply when the API fails', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockFetchResponse({}, false, 500);

    const response = await new GeminiProvider().generateResponse('Hello', CONTEXT);

    expect(response.confidence).toBe(0);
    expect(response.reply).toContain('Unable to reach Gemini');
  });

  it('returns a graceful error reply when fetch rejects', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const response = await new GeminiProvider().generateResponse('Hello', CONTEXT);

    expect(response.confidence).toBe(0);
    expect(response.reply).toContain('network down');
  });
});
