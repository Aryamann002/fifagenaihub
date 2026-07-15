/**
 * @module Gemini GenAI Provider
 * Google Gemini API integration for FanHub 26 — the default provider.
 * Requires GEMINI_API_KEY; the model is configurable via GEMINI_MODEL.
 */

import { GenAIProvider } from './provider';
import { GenAIContext, GenAIResponse } from './types';
import { SYSTEM_INSTRUCTIONS, detectCategory, extractSuggestions } from './shared';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** A single message in Gemini's content format */
interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/**
 * Google Gemini provider. Never throws — configuration and API errors
 * degrade to a graceful error reply so the chat UI stays functional.
 */
export class GeminiProvider implements GenAIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  }

  /**
   * Get the display name of this provider.
   *
   * @returns The provider name string
   */
  getProviderName(): string {
    return 'Google Gemini';
  }

  /**
   * Generate a response using the Google Gemini API.
   *
   * @param prompt - The user's input text
   * @param context - Contextual information (stadium, role, language, history)
   * @returns A promise resolving to a GenAI response
   */
  async generateResponse(prompt: string, context: GenAIContext): Promise<GenAIResponse> {
    if (!this.apiKey) {
      return {
        reply: 'Gemini provider is not configured. Set the GEMINI_API_KEY environment variable.',
        detectedLanguage: context.language || 'en',
        confidence: 0,
        suggestions: [],
      };
    }

    let systemInstruction = SYSTEM_INSTRUCTIONS[context.role](
      context.stadiumName,
      context.language || 'English',
    );
    if (context.liveOpsSummary) {
      systemInstruction += `\n\nLive operational snapshot (use this real-time data in your answer):\n${context.liveOpsSummary}`;
    }

    const category = detectCategory(prompt);

    try {
      const response = await fetch(`${GEMINI_BASE_URL}/${this.model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API key goes in a header — never in the URL, where it would be logged.
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: this.buildContents(prompt, context),
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error (${response.status}): ${response.statusText}`);
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Unable to generate response.';

      return {
        reply,
        detectedLanguage: context.language || 'en',
        confidence: 0.95,
        suggestions: extractSuggestions(reply),
        category,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini API error';
      console.error('[GeminiProvider] Request failed:', errorMessage);
      return {
        reply: `Unable to reach Gemini right now (${errorMessage}). Please try again.`,
        detectedLanguage: context.language || 'en',
        confidence: 0,
        suggestions: [],
        category,
      };
    }
  }

  /**
   * Build the conversation history in Gemini's content format,
   * ending with the current prompt.
   *
   * @param prompt - The current user prompt
   * @param context - GenAI context with conversation history
   * @returns Contents array for the API request
   */
  private buildContents(prompt: string, context: GenAIContext): GeminiContent[] {
    const contents: GeminiContent[] = (context.previousMessages ?? []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    contents.push({ role: 'user', parts: [{ text: prompt }] });
    return contents;
  }
}
