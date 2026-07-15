/**
 * Tests for the mock GenAI provider — language detection,
 * role-specific responses, and localization.
 * @module lib/genai/mock-provider.test
 */

import { MockGenAIProvider } from '@/lib/genai/mock-provider';
import type { GenAIContext } from '@/lib/genai/types';

const FAN_CONTEXT: GenAIContext = {
  stadiumId: 'metlife',
  stadiumName: 'MetLife Stadium',
  role: 'fan',
};

const STAFF_CONTEXT: GenAIContext = {
  stadiumId: 'metlife',
  stadiumName: 'MetLife Stadium',
  role: 'staff',
};

describe('MockGenAIProvider', () => {
  const provider = new MockGenAIProvider();

  it('returns a complete response with the stadium name substituted', async () => {
    const response = await provider.generateResponse('Where is Gate B?', FAN_CONTEXT);

    expect(response.reply).toContain('MetLife Stadium');
    expect(response.reply).not.toContain('{stadium}');
    expect(response.category).toBe('navigation');
    expect(response.confidence).toBeGreaterThan(0);
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it('detects Spanish input and answers with a localized reply', async () => {
    const response = await provider.generateResponse(
      '¿Dónde está la comida, por favor?',
      FAN_CONTEXT,
    );

    expect(response.detectedLanguage).toBe('es');
    expect(response.reply).toContain('MetLife Stadium');
  });

  it('defaults to English for unrecognized languages', async () => {
    const response = await provider.generateResponse('Where can I eat?', FAN_CONTEXT);
    expect(response.detectedLanguage).toBe('en');
  });

  it('gives staff operational responses, not fan guidance', async () => {
    const response = await provider.generateResponse(
      'What is the current crowd capacity at the gates?',
      STAFF_CONTEXT,
    );

    expect(response.category).toBe('crowd_management');
    // Staff crowd templates lead with metrics/analysis markers
    expect(response.reply).toMatch(/📊|🔄|📈|⚡|🎯/);
  });

  it('lowers confidence for general queries', async () => {
    const general = await provider.generateResponse('hmm', FAN_CONTEXT);
    const specific = await provider.generateResponse('Where is Gate B?', FAN_CONTEXT);

    expect(general.category).toBe('general');
    expect(general.confidence).toBeLessThan(specific.confidence);
  });
});
