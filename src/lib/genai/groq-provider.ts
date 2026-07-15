/**
 * @module Groq GenAI Provider
 * Groq API integration for FanHub 26.
 * Requires GROQ_API_KEYS (comma-separated) or GROQ_API_KEY.
 */

import { GenAIProvider } from './provider';
import { GenAIContext, GenAIResponse } from './types';
import { SYSTEM_INSTRUCTIONS, detectCategory, extractSuggestions } from './shared';

const DEFAULT_MODEL = 'llama-3.1-8b-instant';
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqProvider implements GenAIProvider {
  private readonly keys: string[];
  private readonly model: string;
  private keyIndex = 0;

  constructor() {
    const rawKeys = process.env.GROQ_API_KEYS ?? process.env.GROQ_API_KEY ?? '';
    this.keys = rawKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    this.model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  }

  getProviderName(): string {
    return 'Groq';
  }

  async generateResponse(prompt: string, context: GenAIContext): Promise<GenAIResponse> {
    if (this.keys.length === 0) {
      return {
        reply: 'Groq provider is not configured. Set GROQ_API_KEYS or GROQ_API_KEY.',
        detectedLanguage: context.language || 'en',
        confidence: 0,
        suggestions: [],
      };
    }

    let systemMessage = SYSTEM_INSTRUCTIONS[context.role](
      context.stadiumName,
      context.language || 'English',
    );
    if (context.liveOpsSummary) {
      systemMessage += `\n\nLive operational snapshot (use this real-time data in your answer):\n${context.liveOpsSummary}`;
    }

    const category = detectCategory(prompt);
    const messages = this.buildMessages(prompt, systemMessage, context);

    try {
      const apiKey = this.nextKey();
      const response = await fetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.6,
          max_tokens: 700,
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const reply = data.choices?.[0]?.message?.content?.trim() || 'Unable to generate response.';

      return {
        reply,
        detectedLanguage: context.language || 'en',
        confidence: 0.94,
        suggestions: extractSuggestions(reply),
        category,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Groq API error';
      console.error('[GroqProvider] Request failed:', errorMessage);
      return {
        reply: `Unable to reach Groq right now (${errorMessage}). Please try again.`,
        detectedLanguage: context.language || 'en',
        confidence: 0,
        suggestions: [],
        category,
      };
    }
  }

  private nextKey(): string {
    const key = this.keys[this.keyIndex % this.keys.length];
    this.keyIndex = (this.keyIndex + 1) % this.keys.length;
    return key;
  }

  private buildMessages(
    prompt: string,
    systemMessage: string,
    context: GenAIContext,
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemMessage },
    ];

    if (context.previousMessages && context.previousMessages.length > 0) {
      for (const msg of context.previousMessages.slice(-8)) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: prompt });
    return messages;
  }
}
