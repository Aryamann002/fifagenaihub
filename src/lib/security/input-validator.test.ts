/**
 * Tests for the input validator.
 * Verifies message/context validation, length limits, and sanitization.
 * @module lib/security/input-validator.test
 */

import {
  validateChatMessage,
  validateChatContext,
  validateStadiumId,
  sanitizeText,
} from '@/lib/security/input-validator';

describe('validateChatMessage', () => {
  it('accepts valid message', () => {
    const result = validateChatMessage('Where is Gate B?');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitizedValue).toBe('Where is Gate B?');
  });

  it('rejects undefined', () => {
    const result = validateChatMessage(undefined);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects null', () => {
    const result = validateChatMessage(null);
    expect(result.isValid).toBe(false);
  });

  it('rejects non-string input', () => {
    const result = validateChatMessage(42);
    expect(result.isValid).toBe(false);
  });

  it('rejects empty string', () => {
    const result = validateChatMessage('');
    expect(result.isValid).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    const result = validateChatMessage('   ');
    expect(result.isValid).toBe(false);
  });

  it('rejects messages exceeding 500 characters', () => {
    const longMessage = 'a'.repeat(501);
    const result = validateChatMessage(longMessage);
    expect(result.isValid).toBe(false);
  });

  it('accepts messages at exactly 500 characters', () => {
    const exactMessage = 'a'.repeat(500);
    const result = validateChatMessage(exactMessage);
    expect(result.isValid).toBe(true);
  });

  it('accepts multilingual (Spanish) message', () => {
    const result = validateChatMessage('¿Dónde están los baños?');
    expect(result.isValid).toBe(true);
  });

  it('accepts multilingual (Japanese) message', () => {
    const result = validateChatMessage('スタジアムへの行き方を教えてください');
    expect(result.isValid).toBe(true);
  });

  it('never throws on any input', () => {
    expect(() => validateChatMessage(undefined)).not.toThrow();
    expect(() => validateChatMessage({})).not.toThrow();
    expect(() => validateChatMessage([])).not.toThrow();
  });
});

describe('validateChatContext', () => {
  it('accepts valid fan context', () => {
    const result = validateChatContext({ stadiumId: 'metlife-stadium', role: 'fan' });
    expect(result.isValid).toBe(true);
  });

  it('accepts valid staff context', () => {
    const result = validateChatContext({ stadiumId: 'sofi-stadium', role: 'staff' });
    expect(result.isValid).toBe(true);
  });

  it('rejects missing stadiumId', () => {
    const result = validateChatContext({ role: 'fan' });
    expect(result.isValid).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = validateChatContext({ stadiumId: 'metlife-stadium', role: 'admin' });
    expect(result.isValid).toBe(false);
  });

  it('rejects non-object', () => {
    const result = validateChatContext('not-an-object');
    expect(result.isValid).toBe(false);
  });

  it('rejects null', () => {
    const result = validateChatContext(null);
    expect(result.isValid).toBe(false);
  });
});

describe('validateStadiumId', () => {
  it('accepts valid stadium ID', () => {
    expect(validateStadiumId('metlife-stadium')).toBe(true);
    expect(validateStadiumId('sofi-stadium')).toBe(true);
    expect(validateStadiumId('at-t-stadium')).toBe(true);
  });

  it('rejects null', () => {
    expect(validateStadiumId(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(validateStadiumId(undefined)).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateStadiumId('')).toBe(false);
  });

  it('rejects IDs with special characters', () => {
    expect(validateStadiumId('<script>')).toBe(false);
    expect(validateStadiumId('../etc/passwd')).toBe(false);
  });
});

describe('sanitizeText', () => {
  it('removes HTML script tags', () => {
    expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<script>');
  });

  it('removes onclick handlers', () => {
    expect(sanitizeText('click <div onclick="evil()">here</div>')).not.toContain('onclick');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeText('javascript:void(0)')).not.toContain('javascript:');
  });

  it('preserves normal text', () => {
    const input = 'Where is the nearest accessible restroom?';
    expect(sanitizeText(input)).toBe(input);
  });

  it('preserves Unicode characters', () => {
    const input = '¿Dónde está la salida? どこですか？';
    expect(sanitizeText(input)).toContain('Dónde');
    expect(sanitizeText(input)).toContain('どこ');
  });

  it('never throws', () => {
    expect(() => sanitizeText('')).not.toThrow();
    expect(() => sanitizeText('a'.repeat(10000))).not.toThrow();
  });
});
