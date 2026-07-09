/**
 * @module input-validator
 * Input validation and sanitization utilities for user-facing API endpoints.
 * All validators are safe to call with untrusted input — they never throw.
 */

/** Maximum allowed message length in characters */
const MAX_MESSAGE_LENGTH = 500;

/** Maximum allowed context field length in characters */
const MAX_CONTEXT_LENGTH = 100;

/** Regex that matches common HTML tags and script patterns */
const HTML_TAG_PATTERN = /<\/?[a-z][a-z0-9]*\b[^>]*>/gi;

/** Regex that matches event handler attributes (e.g. onerror=, onclick=) */
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gi;

/** Regex that catches javascript: protocol in strings */
const JS_PROTOCOL_PATTERN = /javascript\s*:/gi;

/** Expected format for stadium identifiers: alphanumeric + hyphens, 1-50 chars */
const STADIUM_ID_PATTERN = /^[a-zA-Z0-9-]{1,50}$/;

/** Result of validating a single text value */
export interface ValidationResult {
  /** Whether the input passed all validation checks */
  isValid: boolean;
  /** The cleaned version of the input (empty string when invalid) */
  sanitizedValue: string;
  /** Human-readable error descriptions, empty when valid */
  errors: string[];
}

/** Result of validating a structured context object */
export interface ContextValidationResult {
  /** Whether all context fields passed validation */
  isValid: boolean;
  /** Human-readable error descriptions, empty when valid */
  errors: string[];
}

/**
 * Strips potentially dangerous characters while preserving multilingual text.
 * Removes HTML tags, event handlers, and javascript: protocol strings.
 *
 * @param input - Raw string to sanitize
 * @returns Sanitized string safe for storage and display
 */
export function sanitizeText(input: string): string {
  let sanitized = input;

  // Strip HTML/XML tags
  sanitized = sanitized.replace(HTML_TAG_PATTERN, '');

  // Remove event handler attributes that may have survived tag stripping
  sanitized = sanitized.replace(EVENT_HANDLER_PATTERN, '');

  // Remove javascript: protocol references
  sanitized = sanitized.replace(JS_PROTOCOL_PATTERN, '');

  // Collapse multiple whitespace into single spaces and trim
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Validates and sanitizes a chat message from user input.
 * Accepts only non-empty strings within the length limit.
 *
 * @param message - Untrusted value to validate (expected: string)
 * @returns Validation result with sanitized value and any errors
 */
export function validateChatMessage(message: unknown): ValidationResult {
  const errors: string[] = [];

  if (message === null || message === undefined) {
    return { isValid: false, sanitizedValue: '', errors: ['Message is required.'] };
  }

  if (typeof message !== 'string') {
    return {
      isValid: false,
      sanitizedValue: '',
      errors: ['Message must be a string.'],
    };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    errors.push('Message must not be empty.');
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    errors.push(
      `Message must not exceed ${MAX_MESSAGE_LENGTH} characters (received ${trimmed.length}).`,
    );
  }

  if (errors.length > 0) {
    return { isValid: false, sanitizedValue: '', errors };
  }

  const sanitizedValue = sanitizeText(trimmed);

  // Re-check after sanitization in case stripping made it empty
  if (sanitizedValue.length === 0) {
    return {
      isValid: false,
      sanitizedValue: '',
      errors: ['Message contains no valid content after sanitization.'],
    };
  }

  return { isValid: true, sanitizedValue, errors: [] };
}

/**
 * Validates a chat context object.
 * Expects a plain object whose string-valued fields are within length limits.
 *
 * @param context - Untrusted value to validate (expected: Record<string, string>)
 * @returns Validation result indicating whether the context is acceptable
 */
export function validateChatContext(context: unknown): ContextValidationResult {
  if (context === null || context === undefined) {
    return { isValid: false, errors: ['Context is required.'] };
  }

  if (typeof context !== 'object' || Array.isArray(context)) {
    return {
      isValid: false,
      errors: ['Context must be a plain object.'],
    };
  }

  const errors: string[] = [];
  const record = context as Record<string, unknown>;

  // Validate required stadiumId field
  if (!record.stadiumId || typeof record.stadiumId !== 'string' || (record.stadiumId as string).trim().length === 0) {
    errors.push('Context field "stadiumId" is required and must be a non-empty string.');
  } else if ((record.stadiumId as string).length > MAX_CONTEXT_LENGTH) {
    errors.push(`Context field "stadiumId" must not exceed ${MAX_CONTEXT_LENGTH} characters.`);
  }

  // Validate required role field
  const validRoles = ['fan', 'staff'];
  if (!record.role || !validRoles.includes(record.role as string)) {
    errors.push(`Context field "role" must be one of: ${validRoles.join(', ')}.`);
  }

  // Validate optional language field if present
  if (record.language !== undefined) {
    if (typeof record.language !== 'string') {
      errors.push('Context field "language" must be a string.');
    } else if ((record.language as string).length > MAX_CONTEXT_LENGTH) {
      errors.push(`Context field "language" must not exceed ${MAX_CONTEXT_LENGTH} characters.`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates that a stadium ID matches the expected format.
 * Accepts alphanumeric strings with hyphens, between 1 and 50 characters.
 *
 * @param id - Untrusted value to validate (expected: string)
 * @returns `true` when the ID is a valid stadium identifier
 */
export function validateStadiumId(id: unknown): boolean {
  if (typeof id !== 'string') {
    return false;
  }

  return STADIUM_ID_PATTERN.test(id);
}
