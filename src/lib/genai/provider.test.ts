/**
 * Tests for the GenAI provider factory — env-driven selection
 * between the Gemini (default) and Groq providers.
 * @module lib/genai/provider.test
 */

import { createGenAIProvider, getGenAIProvider } from '@/lib/genai/provider';

const ENV_KEYS = ['GENAI_PROVIDER', 'GEMINI_API_KEY', 'GROQ_API_KEY', 'GROQ_API_KEYS'] as const;
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  ENV_KEYS.forEach((key) => {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  });
});

afterEach(() => {
  ENV_KEYS.forEach((key) => {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  });
});

describe('createGenAIProvider', () => {
  it('defaults to Gemini when GENAI_PROVIDER is unset', () => {
    expect(createGenAIProvider().getProviderName()).toBe('Google Gemini');
  });

  it('creates the Gemini provider when explicitly selected', () => {
    process.env.GENAI_PROVIDER = 'gemini';
    expect(createGenAIProvider().getProviderName()).toBe('Google Gemini');
  });

  it('creates the Groq provider when explicitly selected', () => {
    process.env.GENAI_PROVIDER = 'groq';
    expect(createGenAIProvider().getProviderName()).toBe('Groq');
  });

  it('falls back to Gemini for an unknown provider name', () => {
    process.env.GENAI_PROVIDER = 'skynet';
    expect(createGenAIProvider().getProviderName()).toBe('Google Gemini');
  });

  it('constructs the selected provider even without an API key (graceful degradation happens at call time)', () => {
    process.env.GENAI_PROVIDER = 'groq';
    // No GROQ key set — the factory still returns Groq; the provider itself
    // returns a "not configured" reply rather than the factory throwing.
    expect(createGenAIProvider().getProviderName()).toBe('Groq');
  });
});

describe('getGenAIProvider', () => {
  it('returns the same singleton instance on repeated calls', () => {
    expect(getGenAIProvider()).toBe(getGenAIProvider());
  });
});
