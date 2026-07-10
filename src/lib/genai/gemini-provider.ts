/**
 * @module Gemini GenAI Provider
 * Real Google Gemini API integration for FanHub 26.
 * Requires GEMINI_API_KEY environment variable.
 */

import { GenAIProvider } from './provider';
import { GenAIContext, GenAIResponse, QueryCategory } from './types';

const SYSTEM_INSTRUCTIONS = {
  fan: (stadiumName: string, language: string) => `You are an expert FIFA World Cup 2026 fan assistant at ${stadiumName}.

Your role: Help fans have an amazing match-day experience by providing accurate, friendly, and actionable guidance.

Guidelines:
- Be enthusiastic and welcoming
- Provide specific, local details for ${stadiumName}
- Offer pro tips and insider knowledge
- Include relevant emojis for visual appeal
- Keep responses concise and scannable
- Respond in ${language || 'English'}

Topics you can help with: Navigation, Food & Dining, Accessibility Services, Transit & Parking, Sustainability Initiatives, Match Information, Emergency Assistance.`,

  staff: (stadiumName: string, _language: string) => `You are an expert FIFA World Cup 2026 operations assistant for ${stadiumName} staff.

Your role: Provide real-time operational intelligence to optimize crowd flow, resource deployment, and event safety.

Guidelines:
- Deliver data-driven insights and metrics
- Format operational data clearly (capacity %, crowd flow, incident status)
- Provide actionable recommendations with specific steps
- Use professional terminology and KPIs
- Respond with urgency appropriate to the operational context
- Reference departments and communication channels (Gates, F&B, Medical, Security, Transit, etc.)

Topics you can help with: Staff Navigation, Concession Operations, Accessibility Services, Transit & Egress, Sustainability Metrics, Match Operations, Emergency Protocol, Crowd Management.`,
};

/**
 * Real Gemini API provider for FanHub 26.
 * Requires GEMINI_API_KEY in environment.
 * Falls back to mock if API key is not available.
 */
export class GeminiProvider implements GenAIProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.isConfigured = Boolean(this.apiKey);
    
    // Don't throw — let caller decide how to handle missing config
    if (!this.isConfigured) {
      console.warn(
        '[GeminiProvider] GEMINI_API_KEY not configured. Provider will not function. ' +
        'Set GEMINI_API_KEY environment variable to enable Gemini integration.'
      );
    }
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
  async generateResponse(
    prompt: string,
    context: GenAIContext
  ): Promise<GenAIResponse> {
    // If not configured, return error response instead of crashing
    if (!this.isConfigured) {
      return {
        reply:
          'Gemini provider is not configured. ' +
          'Please set GEMINI_API_KEY environment variable. Using mock provider would be available as fallback.',
        detectedLanguage: context.language || 'en',
        confidence: 0,
        suggestions: [],
        reasoning: 'Error: Missing GEMINI_API_KEY configuration.',
      };
    }

    const systemInstructions = SYSTEM_INSTRUCTIONS[context.role](
      context.stadiumName,
      context.language || 'English'
    );

    const messages = this.buildMessages(prompt, systemInstructions, context);

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          systemInstruction: {
            parts: [{ text: systemInstructions }],
          },
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_UNSPECIFIED',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Gemini API error:', error);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Unable to generate response';

      return {
        reply,
        detectedLanguage: context.language || 'en',
        confidence: 0.95,
        suggestions: this.extractSuggestions(reply, context),
        category: this.detectCategory(prompt),
        reasoning: `Generated response using Google Gemini API with system instructions for ${context.role} at ${context.stadiumName}`,
      };
    } catch (error) {
      console.error('Gemini provider error:', error);
      // Return graceful error instead of throwing
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        reply: `Error communicating with Gemini API: ${errorMsg}. Please try again or contact support.`,
        detectedLanguage: context.language || 'en',
        confidence: 0,
        suggestions: [],
        reasoning: `Gemini API error: ${errorMsg}`,
      };
    }
  }

  /**
   * Build messages for the Gemini API request.
   *
   * @param prompt - The current user prompt
   * @param systemInstructions - System instructions for the AI
   * @param context - GenAI context with conversation history
   * @returns Formatted messages for API
   */
  private buildMessages(
    prompt: string,
    _systemInstructions: string,
    context: GenAIContext
  ): Array<{
    role: string;
    parts: Array<{ text: string }>;
  }> {
    const messages: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [];

    // Add previous messages if available
    if (context.previousMessages && context.previousMessages.length > 0) {
      for (const msg of context.previousMessages) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current prompt
    messages.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    return messages;
  }

  /**
   * Extract suggestions from the generated response.
   *
   * @param reply - The generated reply text
   * @param context - The GenAI context
   * @returns Array of follow-up suggestions
   */
  private extractSuggestions(reply: string, context: GenAIContext): string[] {
    const suggestions: string[] = [];

    // Simple heuristic: look for question patterns in the reply
    const questionPatterns = [
      /Would you like .*\?/g,
      /Can I help with .*\?/g,
      /What about .*\?/g,
      /Need help with .*\?/g,
    ];

    for (const pattern of questionPatterns) {
      const matches = reply.match(pattern);
      if (matches && suggestions.length < 3) {
        suggestions.push(...matches.slice(0, 3 - suggestions.length));
      }
    }

    // If no questions found, provide default suggestions based on category
    if (suggestions.length === 0) {
      suggestions.push(
        'What else would you like to know?',
        'Can I help with anything else?',
        'Any other questions?'
      );
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Simple category detection based on keywords.
   *
   * @param text - The query text
   * @returns The detected query category
   */
  private detectCategory(text: string): QueryCategory {
    const lowerText = text.toLowerCase();

    const categoryKeywords: Record<QueryCategory, string[]> = {
      navigation: ['where', 'find', 'locate', 'gate', 'seat', 'section'],
      food: ['food', 'eat', 'drink', 'restaurant', 'concession', 'hungry'],
      accessibility: ['wheelchair', 'accessible', 'disability', 'ramp'],
      transit: ['parking', 'bus', 'train', 'taxi', 'ride', 'drive'],
      sustainability: ['recycle', 'green', 'sustainable', 'eco', 'waste'],
      match_info: [
        'score',
        'lineup',
        'kickoff',
        'team',
        'match',
        'game',
        'schedule',
      ],
      emergency: [
        'emergency',
        'medical',
        'help',
        'fire',
        'first aid',
        'injured',
      ],
      crowd_management: ['crowd', 'gate', 'wait', 'entry', 'line', 'capacity'],
      general: [],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => lowerText.includes(kw))) {
        return category as QueryCategory;
      }
    }

    return 'general';
  }
}
