/**
 * Tests for the Groq provider — key rotation, history trimming,
 * and graceful error degradation (mocked fetch; no network).
 * @module lib/genai/groq-provider.test
 */

import { GroqProvider } from '@/lib/genai/groq-provider';
import type { GenAIContext } from '@/lib/genai/types';

const CONTEXT: GenAIContext = {
  stadiumId: 'metlife',
  stadiumName: 'MetLife Stadium',
  role: 'fan',
};

const originalFetch = global.fetch;
const ENV_KEYS = ['GROQ_API_KEY', 'GROQ_API_KEYS'] as const;
const savedEnv: Record<string, string | undefined> = {};

function mockFetchResponse(reply: string): jest.Mock {
  const mock = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: reply } }] }),
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

beforeEach(() => {
  ENV_KEYS.forEach((key) => {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  ENV_KEYS.forEach((key) => {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  });
});

describe('GroqProvider', () => {
  it('degrades gracefully when no keys are configured', async () => {
    const fetchMock = mockFetchResponse('unused');

    const response = await new GroqProvider().generateResponse('Hello', CONTEXT);

    expect(response.confidence).toBe(0);
    expect(response.reply).toContain('not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('parses a successful API response', async () => {
    process.env.GROQ_API_KEY = 'k1';
    mockFetchResponse('Gate B is north.\nNeed a map?');

    const response = await new GroqProvider().generateResponse('Where is Gate B?', CONTEXT);

    expect(response.reply).toBe('Gate B is north.\nNeed a map?');
    expect(response.suggestions).toContain('Need a map?');
    expect(response.category).toBe('navigation');
  });

  it('rotates through the key pool across requests', async () => {
    process.env.GROQ_API_KEYS = 'k1, k2';
    const fetchMock = mockFetchResponse('ok');
    const provider = new GroqProvider();

    await provider.generateResponse('one', CONTEXT);
    await provider.generateResponse('two', CONTEXT);
    await provider.generateResponse('three', CONTEXT);

    const authHeaders = fetchMock.mock.calls.map(
      (call) => (call[1].headers as Record<string, string>).Authorization,
    );
    expect(authHeaders).toEqual(['Bearer k1', 'Bearer k2', 'Bearer k1']);
  });

  it('trims conversation history to the last 8 messages', async () => {
    process.env.GROQ_API_KEY = 'k1';
    const fetchMock = mockFetchResponse('ok');

    const previousMessages = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `message ${i}`,
    }));

    await new GroqProvider().generateResponse('latest', { ...CONTEXT, previousMessages });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    // 1 system + 8 history + 1 current prompt
    expect(body.messages).toHaveLength(10);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[9].content).toBe('latest');
  });

  it('grounds staff answers in the live ops snapshot', async () => {
    process.env.GROQ_API_KEY = 'k1';
    const fetchMock = mockFetchResponse('ok');

    await new GroqProvider().generateResponse('Status?', {
      ...CONTEXT,
      role: 'staff',
      liveOpsSummary: 'Gate A at 92% (critical)',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.messages[0].content).toContain('Gate A at 92% (critical)');
  });

  it('returns a graceful error reply when the API fails', async () => {
    process.env.GROQ_API_KEY = 'k1';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'rate limited',
    }) as unknown as typeof fetch;

    const response = await new GroqProvider().generateResponse('Hello', CONTEXT);

    expect(response.confidence).toBe(0);
    expect(response.reply).toContain('Unable to reach Groq');
  });
});
