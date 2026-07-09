/**
 * Tests for the rate limiter.
 * Verifies token-bucket behavior: allowance, rejection, cleanup.
 * @module lib/security/rate-limiter.test
 */

import {
  checkRateLimit,
  resetRateLimit,
  resetAllRateLimits,
} from '@/lib/security/rate-limiter';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetAllRateLimits();
  });

  it('allows requests within the limit', () => {
    const result = checkRateLimit('test-ip-1', { maxTokens: 5, refillRatePerSecond: 1 });
    expect(result.allowed).toBe(true);
    expect(result.remainingTokens).toBeGreaterThanOrEqual(0);
  });

  it('blocks requests when tokens are exhausted', () => {
    const config = { maxTokens: 3, refillRatePerSecond: 0.01 };
    const ip = 'test-ip-exhausted';

    // Exhaust all tokens
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);

    // This should now be rate-limited
    const result = checkRateLimit(ip, config);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks different IPs independently', () => {
    const config = { maxTokens: 2, refillRatePerSecond: 0.01 };

    checkRateLimit('ip-a', config);
    checkRateLimit('ip-a', config);
    const resultA = checkRateLimit('ip-a', config);

    const resultB = checkRateLimit('ip-b', config);

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it('uses default config when not specified', () => {
    const result = checkRateLimit('test-default');
    expect(result.allowed).toBe(true);
  });

  it('returns retryAfterSeconds of 0 when allowed', () => {
    const result = checkRateLimit('test-retry');
    expect(result.retryAfterSeconds).toBe(0);
  });

  it('returns a non-negative remainingTokens value', () => {
    const result = checkRateLimit('test-tokens');
    expect(result.remainingTokens).toBeGreaterThanOrEqual(0);
  });
});

describe('resetRateLimit', () => {
  it('restores a blocked IP to allowed status', () => {
    const config = { maxTokens: 1, refillRatePerSecond: 0.01 };
    const ip = 'test-reset-ip';

    checkRateLimit(ip, config);
    checkRateLimit(ip, config); // now blocked

    resetRateLimit(ip);

    const result = checkRateLimit(ip, config);
    expect(result.allowed).toBe(true);
  });
});
