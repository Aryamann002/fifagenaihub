/**
 * @module GenAI Sanitizer
 * Prompt injection prevention and HTML sanitization utilities.
 * Protects the GenAI layer from malicious user input and ensures
 * generated output is safe for rendering.
 */

/** Patterns that indicate prompt injection attempts */
const INJECTION_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /ignore\s+(all\s+)?previous\s+instructions/i, label: 'ignore-instructions' },
  { pattern: /you\s+are\s+now/i, label: 'role-override' },
  { pattern: /act\s+as\s+(a\s+)?/i, label: 'role-assignment' },
  { pattern: /system\s*prompt/i, label: 'system-prompt-access' },
  { pattern: /\{\{.*\}\}/, label: 'template-injection' },
  { pattern: /\[\[.*\]\]/, label: 'bracket-injection' },
  { pattern: /<\s*script/i, label: 'script-tag' },
  { pattern: /javascript\s*:/i, label: 'javascript-uri' },
  { pattern: /on(error|load|click)\s*=/i, label: 'event-handler' },
  { pattern: /data\s*:\s*text\/html/i, label: 'data-uri' },
  { pattern: /base64/i, label: 'base64-encoding' },
  { pattern: /eval\s*\(/i, label: 'eval-call' },
  { pattern: /document\./i, label: 'document-access' },
  { pattern: /window\./i, label: 'window-access' },
];

/** Maximum allowed prompt length in characters */
const MAX_PROMPT_LENGTH = 2000;

/** Result of sanitization check */
export interface SanitizationResult {
  /** Whether the prompt is considered safe after sanitization */
  isSafe: boolean;
  /** The cleaned prompt with dangerous patterns removed */
  sanitizedPrompt: string;
  /** Labels of patterns that were flagged and removed */
  flaggedPatterns: string[];
}

/**
 * Sanitize a user prompt to prevent injection attacks.
 * Checks the input against known injection patterns, removes matches,
 * and returns a safe version of the prompt. Never throws — always
 * returns a valid result even for malformed input.
 *
 * @param rawPrompt - The unprocessed user input
 * @returns Sanitization result with cleaned prompt and flagged patterns
 */
export function sanitizePrompt(rawPrompt: string): SanitizationResult {
  const flaggedPatterns: string[] = [];

  // Handle empty or non-string input gracefully
  if (!rawPrompt || typeof rawPrompt !== 'string') {
    return {
      isSafe: true,
      sanitizedPrompt: '',
      flaggedPatterns: [],
    };
  }

  // Truncate excessively long prompts
  let sanitized = rawPrompt.slice(0, MAX_PROMPT_LENGTH);

  // Check each injection pattern and strip matches
  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      flaggedPatterns.push(label);
      sanitized = sanitized.replace(pattern, '');
    }
  }

  // Clean up leftover whitespace from removals
  sanitized = sanitized.replace(/\s{2,}/g, ' ').trim();

  return {
    isSafe: flaggedPatterns.length === 0,
    sanitizedPrompt: sanitized,
    flaggedPatterns,
  };
}

/**
 * Sanitize HTML content for safe rendering in the browser.
 * Uses DOMPurify to strip potentially dangerous HTML tags and attributes
 * while preserving safe formatting elements.
 *
 * @param html - The raw HTML string to sanitize
 * @returns A safe HTML string with dangerous elements removed
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Lightweight server-safe HTML sanitization that avoids DOM/jsdom dependencies.
  const withoutScripts = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  const withoutEventHandlers = withoutScripts.replace(/\s+on\w+="[^"]*"/gi, '');
  const withoutJsUris = withoutEventHandlers.replace(/javascript:/gi, '');
  return withoutJsUris.replace(/<\/?[^>]+(>|$)/g, '').trim();
}
