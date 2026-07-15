/**
 * POST /api/chat
 * @module app/api/chat
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getGenAIProvider } from '@/lib/genai/provider';
import { sanitizePrompt } from '@/lib/genai/sanitizer';
import { validateChatMessage, validateChatContext } from '@/lib/security/input-validator';
import { getStadiumById } from '@/lib/data/stadiums';
import { generateCrowdData } from '@/lib/data/crowd-simulator';
import type { ChatContext, ChatRequest, ChatResponse } from '@/types';

/**
 * Builds a compact real-time crowd snapshot for staff queries so the AI
 * grounds its operational answers in live zone data.
 */
function buildLiveOpsSummary(stadiumId: string): string {
  const crowd = generateCrowdData(stadiumId);
  const zones = crowd.zones
    .map(
      (z) =>
        `${z.name}: ${Math.round((z.currentOccupancy / z.maxCapacity) * 100)}% (${z.densityLevel}, ${z.trend})`,
    )
    .join('; ');
  return `Overall occupancy ${crowd.overallOccupancyPercent}%. Zones — ${zones}.`;
}

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

    const { stadiumId, role, language } = context as ChatContext;
    const provider = getGenAIProvider();
    const genAiContext = {
      stadiumId,
      stadiumName: getStadiumById(stadiumId)?.name ?? stadiumId,
      role,
      language,
      // Staff queries get a live crowd snapshot for real-time decision support
      liveOpsSummary: role === 'staff' ? buildLiveOpsSummary(stadiumId) : undefined,
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
