/**
 * POST /api/chat
 * @module app/api/chat
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getGenAIProvider } from '@/lib/genai/provider';
import { sanitizePrompt } from '@/lib/genai/sanitizer';
import { validateChatMessage, validateChatContext } from '@/lib/security/input-validator';
import type { ChatRequest, ChatResponse } from '@/types';

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    const messageValidation = validateChatMessage(message);
    if (!messageValidation.isValid) {
      return errorResponse(400, messageValidation.errors.join(' '));
    }

    const contextValidation = validateChatContext(context);
    if (!contextValidation.isValid) {
      return errorResponse(400, contextValidation.errors.join(' '));
    }

    const sanitization = sanitizePrompt(messageValidation.sanitizedValue);

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

    return NextResponse.json(responseBody, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return errorResponse(500, 'An unexpected error occurred. Please try again later.');
  }
}

export async function GET(): Promise<NextResponse> {
  return errorResponse(405, 'Method not allowed. Use POST.');
}
