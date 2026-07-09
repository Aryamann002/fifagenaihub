/**
 * @module rate-limiter
 * Token-bucket rate limiter for API endpoint protection.
 * Tracks request counts per identifier (typically IP address) with automatic cleanup.
 */

/** A single rate-limit bucket entry for one identifier */
interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

/** Configuration for the rate limiter */
interface RateLimitConfig {
  /** Maximum number of tokens (requests) an identifier can hold */
  maxTokens: number;
  /** Rate at which tokens are restored, in tokens per second */
  refillRatePerSecond: number;
  /** Interval in milliseconds between stale-entry cleanup sweeps */
  cleanupIntervalMs: number;
}

/** Result returned from a rate-limit check */
interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of tokens remaining after this check */
  remainingTokens: number;
  /** Seconds the caller should wait before retrying (0 when allowed) */
  retryAfterSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 20,
  refillRatePerSecond: 0.33, // ~20 requests per minute
  cleanupIntervalMs: 60_000,
};

/** In-memory bucket store — O(1) lookups by identifier */
const buckets = new Map<string, RateLimitEntry>();

/** Handle for the periodic cleanup interval */
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the periodic cleanup timer that evicts fully-refilled buckets
 * to prevent unbounded memory growth.
 */
function startCleanup(config: RateLimitConfig): void {
  if (cleanupInterval !== null) {
    return;
  }

  cleanupInterval = setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of buckets) {
      const elapsedSeconds = (now - entry.lastRefill) / 1_000;
      const refilled = entry.tokens + elapsedSeconds * config.refillRatePerSecond;

      // If the bucket has fully refilled, the identifier is idle — evict it
      if (refilled >= config.maxTokens) {
        buckets.delete(key);
      }
    }

    // Stop the timer when there are no buckets left to manage
    if (buckets.size === 0) {
      stopCleanup();
    }
  }, config.cleanupIntervalMs);

  // Allow the Node.js process to exit even if the timer is active
  if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref();
  }
}

/** Stop the periodic cleanup timer */
function stopCleanup(): void {
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Refill tokens for an entry based on elapsed time since the last refill.
 * Mutates the entry in place.
 */
function refillTokens(entry: RateLimitEntry, config: RateLimitConfig): void {
  const now = Date.now();
  const elapsedSeconds = (now - entry.lastRefill) / 1_000;
  const tokensToAdd = elapsedSeconds * config.refillRatePerSecond;

  entry.tokens = Math.min(config.maxTokens, entry.tokens + tokensToAdd);
  entry.lastRefill = now;
}

/**
 * Check whether a request from the given identifier is allowed under
 * the token-bucket rate limit.
 *
 * @param identifier - Unique key for the requester, typically an IP address
 * @param config     - Optional partial config overrides
 * @returns Object indicating whether the request is allowed and retry timing
 */
export function checkRateLimit(
  identifier: string,
  config?: Partial<RateLimitConfig>,
): RateLimitResult {
  const mergedConfig: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };

  let entry = buckets.get(identifier);

  if (!entry) {
    entry = {
      tokens: mergedConfig.maxTokens,
      lastRefill: Date.now(),
    };
    buckets.set(identifier, entry);
    startCleanup(mergedConfig);
  }

  // Refill tokens based on elapsed time
  refillTokens(entry, mergedConfig);

  if (entry.tokens >= 1) {
    entry.tokens -= 1;
    return {
      allowed: true,
      remainingTokens: Math.floor(entry.tokens),
      retryAfterSeconds: 0,
    };
  }

  // Not enough tokens — calculate how long the caller must wait for 1 token
  const deficit = 1 - entry.tokens;
  const retryAfterSeconds = Math.ceil(deficit / mergedConfig.refillRatePerSecond);

  return {
    allowed: false,
    remainingTokens: 0,
    retryAfterSeconds,
  };
}

/**
 * Reset the rate-limit state for a single identifier.
 *
 * @param identifier - The identifier whose bucket should be cleared
 */
export function resetRateLimit(identifier: string): void {
  buckets.delete(identifier);
}

/**
 * Reset all rate-limit state and stop the cleanup timer.
 * Primarily useful for testing.
 */
export function resetAllRateLimits(): void {
  buckets.clear();
  stopCleanup();
}
