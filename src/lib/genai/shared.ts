/**
 * @module GenAI Shared
 * Prompt templates and lightweight NLU helpers shared by all providers
 * (Gemini, Groq, and the offline mock). One source of truth — providers
 * must not redefine these.
 */

import type { GenAIContext, QueryCategory } from './types';

/** Role-specific system instructions, parameterized by stadium and language */
export const SYSTEM_INSTRUCTIONS: Record<
  GenAIContext['role'],
  (stadiumName: string, language: string) => string
> = {
  fan: (stadiumName, language) => `You are an expert FIFA World Cup 2026 fan assistant at ${stadiumName}.

Your role: Help fans have an amazing match-day experience by providing accurate, friendly, and actionable guidance.

Guidelines:
- Be enthusiastic and welcoming
- Provide specific, local details for ${stadiumName}
- Offer pro tips and insider knowledge
- Include relevant emojis for visual appeal
- Keep responses concise and scannable
- Respond in ${language || 'English'}

Topics you can help with: Navigation, Food & Dining, Accessibility Services, Transit & Parking, Sustainability Initiatives, Match Information, Emergency Assistance.`,

  staff: (stadiumName) => `You are an expert FIFA World Cup 2026 operations assistant for ${stadiumName} staff.

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

/** Keyword-to-category mapping for query classification (includes multilingual cues) */
const CATEGORY_KEYWORDS: Record<QueryCategory, string[]> = {
  navigation: [
    'where', 'find', 'locate', 'directions', 'gate', 'section',
    'seat', 'entrance', 'exit', 'level', 'floor', 'map', 'way',
    'lost', 'restroom', 'bathroom', 'toilet', 'donde', 'où',
  ],
  food: [
    'food', 'eat', 'drink', 'restaurant', 'concession', 'snack',
    'beer', 'water', 'halal', 'vegan', 'vegetarian', 'kosher',
    'gluten', 'allergy', 'menu', 'comida', 'nourriture', 'hungry',
  ],
  accessibility: [
    'wheelchair', 'accessible', 'disability', 'elevator', 'ramp',
    'hearing', 'visual', 'impair', 'ada', 'assistance', 'companion',
    'sensory', 'quiet', 'service animal', 'mobility',
  ],
  transit: [
    'parking', 'bus', 'train', 'subway', 'metro', 'uber', 'lyft',
    'taxi', 'rideshare', 'shuttle', 'transit', 'transport', 'drive',
    'car', 'bike', 'walk', 'station', 'traffic',
  ],
  sustainability: [
    'recycle', 'recycling', 'compost', 'sustainable', 'green',
    'environment', 'carbon', 'eco', 'waste', 'reusable', 'solar',
    'water station', 'refill',
  ],
  match_info: [
    'score', 'lineup', 'kickoff', 'kick off', 'team', 'schedule',
    'match', 'game', 'play', 'roster', 'group', 'bracket', 'next',
    'time', 'start', 'who', 'versus', 'vs',
  ],
  emergency: [
    'emergency', 'medical', 'help', 'fire', 'first aid', 'doctor',
    'nurse', 'hurt', 'injured', 'ambulance', 'security', 'danger',
    'threat', 'evacuate', 'defibrillator', 'aed', 'police',
  ],
  crowd_management: [
    'crowd', 'capacity', 'congestion', 'queue', 'line', 'wait',
    'flow', 'density', 'overcrowd', 'gate load', 'throughput',
    'bottleneck', 'screening', 'entry rate',
  ],
  general: [],
};

/**
 * Categorize a user query by scoring keyword matches per category and
 * returning the highest-scoring one. Ties resolve to the first category
 * reached; no matches resolve to 'general'.
 *
 * @param text - The query text to categorize
 * @returns The detected query category
 */
export function detectCategory(text: string): QueryCategory {
  const lowerText = text.toLowerCase();

  let best: QueryCategory = 'general';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lowerText.includes(kw)).length;
    if (score > bestScore) {
      best = category as QueryCategory;
      bestScore = score;
    }
  }

  return best;
}

/**
 * Extract up to three follow-up suggestions from a generated reply by
 * collecting lines that end in a question mark, with sensible defaults
 * when the reply contains none.
 *
 * @param reply - The generated reply text
 * @returns Array of 1–3 follow-up suggestion strings
 */
export function extractSuggestions(reply: string): string[] {
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
