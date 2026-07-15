/**
 * A11yToolbar — Floating accessibility controls.
 * Lets users toggle high-contrast mode and cycle font size; preferences
 * are applied via useAccessibility (system detection + localStorage).
 * @module components/common/A11yToolbar
 */

'use client';

import { useAccessibility } from '@/hooks/useAccessibility';
import styles from './A11yToolbar.module.css';

/** Display labels for the font size cycle button */
const FONT_SIZE_LABELS: Record<string, string> = {
  normal: 'A',
  large: 'A+',
  'extra-large': 'A++',
};

/**
 * Renders fixed-position accessibility controls: a high-contrast toggle
 * and a font-size cycle button. Hidden until preferences have loaded to
 * avoid a flash of incorrect toggle state.
 */
export default function A11yToolbar() {
  const { preferences, isLoaded, toggleHighContrast, cycleFontSize } = useAccessibility();

  if (!isLoaded) return null;

  return (
    <div className={styles.toolbar} role="group" aria-label="Accessibility settings">
      <button
        type="button"
        className={`${styles.button} ${preferences.highContrast ? styles.buttonActive : ''}`}
        onClick={toggleHighContrast}
        aria-pressed={preferences.highContrast}
        title="Toggle high contrast"
      >
        <span aria-hidden="true">◐</span>
        <span className="sr-only">High contrast mode</span>
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={cycleFontSize}
        title="Cycle font size"
        aria-label={`Font size: ${preferences.fontSize}. Activate to change.`}
      >
        <span aria-hidden="true">{FONT_SIZE_LABELS[preferences.fontSize]}</span>
      </button>
    </div>
  );
}
