/**
 * @module Groq GenAI Provider
 * Real Groq API integration for FanHub 26.
 * Requires GROQ_API_KEYS (comma-separated) or GROQ_API_KEY.
 */

import { GenAIProvider } from './provider';
import { GenAIContext, GenAIResponse, QueryCategory } from './types';

const SYSTEM_INSTRUCTIONS = {
  fan: (stadiumName: string, language: string) => `You are an expert FIFA World Cup 2026 fan assistant at ${stadiumName}.

Your role: Help fans with clear, practical, and friendly guidance.

Guidelines:
- Be concise and actionable
- Use specific venue-aware details
- Respond in ${language || 'English'}
- Keep a welcoming tone`,

  staff: (stadiumName: string, _language: string) => `You are an expert FIFA World Cup 2026 operations assistant for ${stadiumName} staff.

Your role: Provide clear, data-oriented operational guidance.

Guidelines:
- Prioritize safety and operational clarity
- Use concise KPI-oriented wording
- Give practical next-step recommendations`,
};

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
        reasoning: 'Error: Missing Groq API credentials.',
      };
    }

    const systemMessage = SYSTEM_INSTRUCTIONS[context.role](
      context.stadiumName,
      context.language || 'English',
    );

    const category = this.detectCategory(prompt);
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
        suggestions: this.extractSuggestions(reply),
        category,
        reasoning: `Generated with Groq model ${this.model} for ${context.role} at ${context.stadiumName}.`,
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
        reasoning: `Groq request failed: ${errorMessage}`,
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

  private extractSuggestions(reply: string): string[] {
    const candidates = reply
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.endsWith('?'))
      .slice(0, 3);

    if (candidates.length > 0) {
      return candidates;
    }

    return ['Need directions?', 'Want accessibility help?', 'Need live crowd info?'];
  }

  private detectCategory(text: string): QueryCategory {
    const lower = text.toLowerCase();
    const map: Record<QueryCategory, string[]> = {
      navigation: ['where', 'find', 'gate', 'section', 'seat', 'map', 'direction'],
      food: ['food', 'eat', 'drink', 'restaurant', 'halal', 'vegan', 'menu'],
      accessibility: ['wheelchair', 'accessible', 'disability', 'hearing', 'sensory'],
      transit: ['parking', 'bus', 'train', 'metro', 'rideshare', 'taxi'],
      sustainability: ['green', 'recycle', 'sustainable', 'carbon', 'eco'],
      match_info: ['match', 'score', 'kickoff', 'lineup', 'team', 'schedule'],
      emergency: ['emergency', 'medical', 'help', 'fire', 'security', 'danger'],
      crowd_management: ['crowd', 'density', 'queue', 'wait', 'flow', 'capacity'],
      general: [],
    };

    for (const [category, keywords] of Object.entries(map)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        return category as QueryCategory;
      }
    }

    return 'general';
  }
}
