/**
 * @module GenAI Types
 * Core type definitions for the FanHub 26 GenAI layer.
 * These types define the contract between the application and any GenAI provider.
 */

/** Context passed to the GenAI provider for response generation */
export interface GenAIContext {
  /** Unique identifier for the stadium */
  stadiumId: string;
  /** Display name of the stadium */
  stadiumName: string;
  /** User role — fans get friendly guidance, staff gets operational intelligence */
  role: 'fan' | 'staff';
  /** ISO language code for preferred response language */
  language?: string;
  /** Conversation history for multi-turn context */
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/** Response from the GenAI provider */
export interface GenAIResponse {
  /** The generated text reply */
  reply: string;
  /** ISO language code detected from the user's input */
  detectedLanguage: string;
  /** Confidence score of the response (0.0 to 1.0) */
  confidence: number;
  /** Follow-up question suggestions for the user */
  suggestions: string[];
}

/** Category of a user query for routing to appropriate response logic */
export type QueryCategory =
  | 'navigation'
  | 'food'
  | 'accessibility'
  | 'transit'
  | 'sustainability'
  | 'match_info'
  | 'emergency'
  | 'crowd_management'
  | 'general';
