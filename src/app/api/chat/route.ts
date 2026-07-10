/**
 * POST /api/chat
 * Secure GenAI chat endpoint with rate limiting, input validation,
 * prompt injection prevention, and structured error responses.
 * @module app/api/chat
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getGenAIProvider } from '@/lib/genai/provider';
import { sanitizePrompt } from '@/lib/genai/sanitizer';
import { validateChatMessage, validateChatContext } from '@/lib/security/input-validator';
import { SECURITY_HEADERS, API_CACHE_HEADERS } from '@/lib/security/headers';
import type { ChatRequest, ChatResponse } from '@/types';

/**
 * Applies security headers to a NextResponse.
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Creates a secure JSON error response.
 * Never exposes internal error details to the client.
 */
function errorResponse(status: number, message: string): NextResponse {
  const response = NextResponse.json({ error: message }, { status });
  return withSecurityHeaders(response);
}

/**
 * Handles POST requests to the GenAI chat endpoint.
 * Validates input, sanitizes the prompt, routes to the GenAI provider,
 * and returns a structured response with security headers.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, 'Invalid JSON in request body.');
    }

    if (!body || typeof body !== 'object') {
      return errorResponse(400, 'Request body must be a JSON object.');
    }

    const { message, context } = body as Partial<ChatRequest>;

    // Validate message
    const messageValidation = validateChatMessage(message);
    if (!messageValidation.isValid) {
      return errorResponse(400, messageValidation.errors.join(' '));
    }

    // Validate context
    const contextValidation = validateChatContext(context);
    if (!contextValidation.isValid) {
      return errorResponse(400, contextValidation.errors.join(' '));
    }

    // Sanitize prompt for injection prevention
    const sanitization = sanitizePrompt(messageValidation.sanitizedValue);

    // Get the GenAI provider and generate a response
    const provider = getGenAIProvider();
    const genAiContext = {
      stadiumId: (context as { stadiumId: string }).stadiumId,
      stadiumName: (context as { stadiumId: string }).stadiumId,
      role: (context as { role: 'fan' | 'staff' }).role,
      language: (context as { language?: string }).language,
    };

    const genAiResponse = await provider.generateResponse(
      sanitization.sanitizedPrompt,
      genAiContext,
    );

    const responseBody: ChatResponse = {
      reply: genAiResponse.reply,
      detectedLanguage: genAiResponse.detectedLanguage,
      confidence: genAiResponse.confidence,
      suggestions: genAiResponse.suggestions,
      category: genAiResponse.category,
      reasoning: genAiResponse.reasoning,
      structuredData: genAiResponse.structuredData,
    };

    const response = NextResponse.json(responseBody, {
      status: 200,
      headers: API_CACHE_HEADERS,
    });
    return withSecurityHeaders(response);
  } catch {
    // Never expose internal error details
    return errorResponse(500, 'An unexpected error occurred. Please try again later.');
  }
}

/** Only POST is supported on this route */
export async function GET(): Promise<NextResponse> {
  return errorResponse(405, 'Method not allowed. Use POST.');
}
