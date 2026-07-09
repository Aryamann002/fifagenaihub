/**
 * @module GenAI Provider
 * Abstract interface and factory for GenAI providers.
 * Uses a strategy pattern to enable clean provider swapping
 * between mock, Gemini, OpenAI, or other backends.
 */

import { GenAIContext, GenAIResponse } from './types';
import { MockGenAIProvider } from './mock-provider';

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
 * @returns A new GenAI provider instance
 */
export function createGenAIProvider(): GenAIProvider {
  const providerType = process.env.GENAI_PROVIDER || 'mock';

  switch (providerType) {
    case 'mock':
    default:
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
