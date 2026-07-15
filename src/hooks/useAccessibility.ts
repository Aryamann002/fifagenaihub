/**
 * useAccessibility — Custom hook for managing user accessibility preferences.
 * Reads the system prefers-contrast setting and manages user-toggled settings
 * (high contrast, font size) persisted to localStorage. Reduced motion is
 * handled natively by CSS (@media prefers-reduced-motion), not tracked here.
 * @module hooks/useAccessibility
 */

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { AccessibilityPreferences } from '@/types';

/** Valid font-size values, used to reject corrupt persisted data */
const VALID_FONT_SIZES: AccessibilityPreferences['fontSize'][] = ['normal', 'large', 'extra-large'];

/** Default accessibility preferences */
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  fontSize: 'normal',
};

/** localStorage key for persisting preferences */
const STORAGE_KEY = 'fanhub26-a11y-prefs';

const emptySubscribe = () => () => {};

/**
 * Resolves initial preferences from localStorage, falling back to system
 * preferences. Returns defaults during SSR where neither is available.
 */
function getInitialPreferences(): AccessibilityPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  const saved = loadSavedPreferences();
  return {
    highContrast:
      saved?.highContrast ?? window.matchMedia('(prefers-contrast: more)').matches,
    fontSize: saved?.fontSize ?? 'normal',
  };
}

/**
 * Manages accessibility preferences with system preference detection
 * and localStorage persistence. Applies CSS classes to the document root.
 *
 * @returns Current preferences and toggle functions
 */
export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(getInitialPreferences);

  // False during SSR and hydration so consumers can defer rendering
  // controls whose state only exists on the client.
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Track system prefers-contrast changes
  useEffect(() => {
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    const handleContrastChange = (event: MediaQueryListEvent) => {
      setPreferences((prev) => ({ ...prev, highContrast: event.matches }));
    };

    contrastQuery.addEventListener('change', handleContrastChange);
    return () => contrastQuery.removeEventListener('change', handleContrastChange);
  }, []);

  // Apply CSS classes to document root and persist when preferences change
  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('font-large', preferences.fontSize === 'large');
    root.classList.toggle('font-extra-large', preferences.fontSize === 'extra-large');

    savePreferences(preferences);
  }, [preferences]);

  /** Toggle high contrast mode */
  const toggleHighContrast = useCallback(() => {
    setPreferences((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  /** Cycle through font size options: normal → large → extra-large → normal */
  const cycleFontSize = useCallback(() => {
    setPreferences((prev) => {
      const currentIndex = VALID_FONT_SIZES.indexOf(prev.fontSize);
      const nextIndex = (currentIndex + 1) % VALID_FONT_SIZES.length;
      return { ...prev, fontSize: VALID_FONT_SIZES[nextIndex] };
    });
  }, []);

  /** Reset all preferences to defaults */
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may not be available
    }
  }, []);

  return {
    preferences,
    isLoaded,
    toggleHighContrast,
    cycleFontSize,
    resetPreferences,
  };
}

/**
 * Loads saved accessibility preferences from localStorage, validating each
 * field so corrupt or legacy values never reach the UI. Only well-formed
 * fields are returned (as a partial), letting callers fall back to system
 * defaults for anything missing or invalid.
 * Returns null if nothing is saved or localStorage is unavailable.
 */
function loadSavedPreferences(): Partial<AccessibilityPreferences> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Record<string, unknown>;
    const prefs: Partial<AccessibilityPreferences> = {};

    if (typeof parsed.highContrast === 'boolean') {
      prefs.highContrast = parsed.highContrast;
    }
    if (VALID_FONT_SIZES.includes(parsed.fontSize as AccessibilityPreferences['fontSize'])) {
      prefs.fontSize = parsed.fontSize as AccessibilityPreferences['fontSize'];
    }

    return prefs;
  } catch {
    return null;
  }
}

/**
 * Saves accessibility preferences to localStorage.
 * Silently fails if localStorage is unavailable.
 */
function savePreferences(preferences: AccessibilityPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // localStorage may not be available (e.g., private browsing)
  }
}
