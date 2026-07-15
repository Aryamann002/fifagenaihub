/**
 * @module GenAI Provider
 * Abstract interface and factory for GenAI providers.
 * Uses a strategy pattern to enable clean provider swapping
 * between Gemini, Groq, or other backends.
 */

import { GenAIContext, GenAIResponse } from './types';
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
 * - 'gemini' (default): Google Gemini API (requires GEMINI_API_KEY)
 * - 'groq': Groq API (requires GROQ_API_KEYS or GROQ_API_KEY)
 *
 * Gemini is the default (and the fallback for any unrecognized value).
 * When the selected provider's API key is missing, the provider itself
 * returns a graceful "not configured" reply rather than throwing.
 *
 * @returns A new GenAI provider instance
 */
export function createGenAIProvider(): GenAIProvider {
  const providerType = process.env.GENAI_PROVIDER || 'gemini';

  switch (providerType) {
    case 'groq':
      return new GroqProvider();
    case 'gemini':
    default:
      return new GeminiProvider();
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
