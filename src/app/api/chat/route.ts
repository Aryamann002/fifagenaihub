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

/** Maximum number of prior turns forwarded to the provider */
const MAX_HISTORY = 8;

/**
 * Extract prior conversation turns from an untrusted request body.
 * Keeps only well-formed user/assistant messages (last {@link MAX_HISTORY}),
 * running each through the prompt sanitizer since client-supplied history
 * reaches the provider's conversation context.
 */
function parseHistory(body: unknown): Array<{ role: 'user' | 'assistant'; content: string }> | undefined {
  const raw = (body as { previousMessages?: unknown }).previousMessages;
  if (!Array.isArray(raw)) return undefined;

  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const m of raw.slice(-MAX_HISTORY)) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role === 'user' || role === 'assistant') && typeof content === 'string') {
      const clean = sanitizePrompt(content).sanitizedPrompt;
      if (clean.length > 0) history.push({ role, content: clean });
    }
  }
  return history.length > 0 ? history : undefined;
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
    const stadium = getStadiumById(stadiumId);
    if (!stadium) {
      return errorResponse(400, 'Unknown stadium.');
    }

    const provider = getGenAIProvider();
    const genAiContext = {
      stadiumId,
      stadiumName: stadium.name,
      role,
      language,
      previousMessages: parseHistory(body),
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
