/**
 * @module GenAI Provider
 * Abstract interface and factory for GenAI providers.
 * Uses a strategy pattern to enable clean provider swapping
 * between mock, Gemini, OpenAI, or other backends.
 */

import { GenAIContext, GenAIResponse } from './types';
import { MockGenAIProvider } from './mock-provider';
import { GeminiProvider } from './gemini-provider';
import { GroqProvider } from './groq-provider';

/** Abstract interface for GenAI providers — enables clean provider swapping */
export interface GenAIProvider {
  /** Generate a response to a user prompt with context */
  generateResponse(prompt: string, context: GenAIContext): Promise<GenAIResponse>;

  /** Get the provider name for logging and debugging */
  getProviderName(): string;
}

/**
 * Factory function that creates the appropriate GenAI provider
 * based on the GENAI_PROVIDER environment variable.
 *
 * Supported providers:
 * - 'groq' (default): Groq API (requires GROQ_API_KEYS or GROQ_API_KEY)
 * - 'mock': Realistic mock responses without external API
 * - 'gemini': Google Gemini API (requires GEMINI_API_KEY env var)
 *
 * Falls back to mock provider if the requested provider is not available
 * or misconfigured.
 *
 * @returns A new GenAI provider instance (never throws)
 */
export function createGenAIProvider(): GenAIProvider {
  const providerType = process.env.GENAI_PROVIDER || 'groq';

  try {
    switch (providerType) {
      case 'groq': {
        const groqKeys = process.env.GROQ_API_KEYS ?? process.env.GROQ_API_KEY;
        if (!groqKeys || groqKeys.trim().length === 0) {
          console.info('[Provider Factory] Groq not configured, using mock provider');
          return new MockGenAIProvider();
        }
        return new GroqProvider();
      }
      case 'gemini': {
        if (!process.env.GEMINI_API_KEY) {
          console.info('[Provider Factory] Gemini not configured, using mock provider');
          return new MockGenAIProvider();
        }
        return new GeminiProvider();
      }
      case 'mock':
      default:
        return new MockGenAIProvider();
    }
  } catch (error) {
    console.error('[Provider Factory] Error creating provider:', error);
    // Always fall back to mock on any error
    console.info('[Provider Factory] Falling back to mock provider');
    return new MockGenAIProvider();
  }
}

/** Singleton instance for the application */
let providerInstance: GenAIProvider | null = null;

/**
 * Get or create the singleton GenAI provider instance.
 * Uses lazy initialization to defer creation until first use.
 *
 * @returns The singleton GenAI provider
 */
export function getGenAIProvider(): GenAIProvider {
  if (!providerInstance) {
    providerInstance = createGenAIProvider();
  }
  return providerInstance;
}
