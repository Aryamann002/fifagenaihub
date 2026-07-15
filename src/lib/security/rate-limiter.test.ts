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

  describe('token refill over time', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('refills tokens as time elapses', () => {
      const config = { maxTokens: 2, refillRatePerSecond: 1 };
      const ip = 'test-refill';
      const start = 1_000_000;
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(start);

      checkRateLimit(ip, config);
      checkRateLimit(ip, config);
      expect(checkRateLimit(ip, config).allowed).toBe(false);

      // 2 seconds later the bucket has refilled 2 tokens
      nowSpy.mockReturnValue(start + 2_000);
      expect(checkRateLimit(ip, config).allowed).toBe(true);
    });

    it('does not allow a request on a fractional token', () => {
      const config = { maxTokens: 1, refillRatePerSecond: 1 };
      const ip = 'test-fraction';
      const start = 2_000_000;
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(start);

      checkRateLimit(ip, config); // bucket empty

      // Only half a token has refilled — still blocked
      nowSpy.mockReturnValue(start + 500);
      expect(checkRateLimit(ip, config).allowed).toBe(false);
    });

    it('never refills beyond maxTokens', () => {
      const config = { maxTokens: 2, refillRatePerSecond: 1 };
      const ip = 'test-cap';
      const start = 3_000_000;
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(start);

      checkRateLimit(ip, config);

      // A long idle period must not accumulate more than maxTokens
      nowSpy.mockReturnValue(start + 60_000);
      const result = checkRateLimit(ip, config);
      expect(result.allowed).toBe(true);
      expect(result.remainingTokens).toBeLessThanOrEqual(config.maxTokens - 1);
    });

    it('reports an accurate retryAfterSeconds when blocked', () => {
      const config = { maxTokens: 1, refillRatePerSecond: 0.5 };
      const ip = 'test-retry-after';
      jest.spyOn(Date, 'now').mockReturnValue(4_000_000);

      checkRateLimit(ip, config); // bucket empty
      const blocked = checkRateLimit(ip, config);

      expect(blocked.allowed).toBe(false);
      // 1 token at 0.5 tokens/sec = 2 seconds
      expect(blocked.retryAfterSeconds).toBe(2);
    });
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
