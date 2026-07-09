/**
 * useDebounce — Custom hook for debouncing values.
 * Delays updating a value until after a specified period of inactivity.
 * Useful for search inputs and GenAI chat to prevent excessive API calls.
 * @module hooks/useDebounce
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the provided value.
 * The debounced value only updates after the specified delay
 * has elapsed without the source value changing.
 *
 * @param value - The value to debounce
 * @param delayMs - Delay in milliseconds before updating (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * useEffect(() => {
 *   // Only fires 300ms after user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
