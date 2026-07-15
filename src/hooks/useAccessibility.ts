/**
 * useAccessibility — Custom hook for managing user accessibility preferences.
 * Reads system preferences (prefers-reduced-motion, prefers-contrast) and
 * manages user-toggled settings (high contrast, font size) persisted to localStorage.
 * @module hooks/useAccessibility
 */

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { AccessibilityPreferences } from '@/types';

/** Default accessibility preferences */
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
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
    reducedMotion:
      saved?.reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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

  // Subscribe to system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setPreferences((prev) => ({ ...prev, reducedMotion: event.matches }));
    };

    const handleContrastChange = (event: MediaQueryListEvent) => {
      setPreferences((prev) => ({ ...prev, highContrast: event.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
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
      const sizes: AccessibilityPreferences['fontSize'][] = ['normal', 'large', 'extra-large'];
      const currentIndex = sizes.indexOf(prev.fontSize);
      const nextIndex = (currentIndex + 1) % sizes.length;
      return { ...prev, fontSize: sizes[nextIndex] };
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
 * Loads saved accessibility preferences from localStorage.
 * Returns null if no preferences are saved or localStorage is unavailable.
 */
function loadSavedPreferences(): AccessibilityPreferences | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as AccessibilityPreferences;
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
