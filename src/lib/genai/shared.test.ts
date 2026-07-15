/**
 * Tests for the shared GenAI helpers used by every provider.
 * @module lib/genai/shared.test
 */

import { SYSTEM_INSTRUCTIONS, detectCategory, extractSuggestions } from '@/lib/genai/shared';

describe('detectCategory', () => {
  it('detects each category from representative queries', () => {
    expect(detectCategory('Where is Gate B?')).toBe('navigation');
    expect(detectCategory('I am hungry, any vegan food?')).toBe('food');
    expect(detectCategory('Is there wheelchair access?')).toBe('accessibility');
    expect(detectCategory('How do I get parking near the station?')).toBe('transit');
    expect(detectCategory('Can I recycle this bottle?')).toBe('sustainability');
    expect(detectCategory('When is kickoff for the next match?')).toBe('match_info');
    expect(detectCategory('I need first aid, someone is injured')).toBe('emergency');
    expect(detectCategory('How bad is the queue congestion at entry?')).toBe('crowd_management');
  });

  it('returns general for unmatched queries', () => {
    expect(detectCategory('Tell me a fun fact')).toBe('general');
    expect(detectCategory('')).toBe('general');
  });

  it('picks the category with the most keyword matches', () => {
    // 'food', 'vegan', 'menu' (3 food) beat 'where' (1 navigation)
    expect(detectCategory('Where is the vegan food menu?')).toBe('food');
  });

  it('is case-insensitive', () => {
    expect(detectCategory('WHEELCHAIR RAMP?')).toBe('accessibility');
  });
});

describe('extractSuggestions', () => {
  it('extracts question lines from a reply', () => {
    const reply = 'Gate B is north.\nNeed a map?\nWant food options nearby?';
    expect(extractSuggestions(reply)).toEqual(['Need a map?', 'Want food options nearby?']);
  });

  it('caps suggestions at three', () => {
    const reply = 'One?\nTwo?\nThree?\nFour?';
    expect(extractSuggestions(reply)).toHaveLength(3);
  });

  it('falls back to defaults when the reply has no questions', () => {
    const suggestions = extractSuggestions('Gate B is to the north.');
    expect(suggestions.length).toBeGreaterThan(0);
    suggestions.forEach((s) => expect(s.endsWith('?')).toBe(true));
  });
});

describe('SYSTEM_INSTRUCTIONS', () => {
  it('embeds the stadium name and language for fans', () => {
    const prompt = SYSTEM_INSTRUCTIONS.fan('MetLife Stadium', 'Spanish');
    expect(prompt).toContain('MetLife Stadium');
    expect(prompt).toContain('Spanish');
  });

  it('produces operations-focused instructions for staff', () => {
    const prompt = SYSTEM_INSTRUCTIONS.staff('SoFi Stadium', 'English');
    expect(prompt).toContain('SoFi Stadium');
    expect(prompt).toContain('operational intelligence');
  });
});
