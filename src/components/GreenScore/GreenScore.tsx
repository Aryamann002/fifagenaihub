/**
 * GreenScore — Sustainability scoring component for fans.
 * Shows a circular green score based on the user's chosen transit mode,
 * carbon comparison data, and AI-generated sustainability tips.
 * @module components/GreenScore
 */

'use client';

import { useState, useEffect } from 'react';
import type { TransitMode, GreenScoreData } from '@/types';
import styles from './GreenScore.module.css';

/** Transit mode options with labels and icons */
const TRANSIT_MODES: Array<{ mode: TransitMode; label: string; icon: string }> = [
  { mode: 'walk', label: 'Walk', icon: '🚶' },
  { mode: 'metro', label: 'Metro', icon: '🚇' },
  { mode: 'bus', label: 'Bus', icon: '🚌' },
  { mode: 'rideshare', label: 'Ride', icon: '🚗' },
  { mode: 'drive', label: 'Drive', icon: '🅿️' },
];

/** SVG circle radius for the progress ring */
const RING_RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Props for the GreenScore component */
interface GreenScoreProps {
  /** The stadium ID to calculate sustainability data for */
  stadiumId: string;
}

/**
 * Returns the stroke color for the circular progress ring based on the score value.
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

/**
 * Renders a sustainability score panel with transit mode selector,
 * animated circular progress ring, carbon stats, and contextual tips.
 */
export default function GreenScore({ stadiumId }: GreenScoreProps) {
  const [selectedMode, setSelectedMode] = useState<TransitMode>('metro');
  const [scoreData, setScoreData] = useState<GreenScoreData | null>(null);

  useEffect(() => {
    // Dynamic import avoids circular dependencies during SSR
    import('@/lib/data/sustainability').then(({ calculateGreenScore }) => {
      setScoreData(calculateGreenScore(selectedMode, stadiumId));
    });
  }, [selectedMode, stadiumId]);

  if (!scoreData) {
    return (
      <section className={styles.container} aria-label="Sustainability Score">
        <div className={styles.loading}>Calculating your green score...</div>
      </section>
    );
  }

  const progress = (scoreData.score / 100) * CIRCUMFERENCE;
  const strokeDashoffset = CIRCUMFERENCE - progress;
  const scoreColor = getScoreColor(scoreData.score);

  return (
    <section className={styles.container} aria-label="Sustainability Score">
      <h3 className={styles.title}>🌱 Your Green Score</h3>

      {/* Circular Progress Ring */}
      <div
        className={styles.ringWrapper}
        role="meter"
        aria-valuenow={scoreData.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Green score: ${scoreData.score} out of 100`}
      >
        <svg
          viewBox="0 0 120 120"
          className={styles.ring}
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={styles.progressArc}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className={styles.scoreInner}>
          <span className={styles.scoreNumber} style={{ color: scoreColor }}>
            {scoreData.score}
          </span>
          <span className={styles.scoreMax}>/100</span>
        </div>
      </div>

      {/* Transit Mode Selector */}
      <div
        className={styles.modeSelector}
        role="radiogroup"
        aria-label="Select your travel mode to the stadium"
      >
        {TRANSIT_MODES.map(({ mode, label, icon }) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selectedMode === mode}
            className={`${styles.modeBtn} ${selectedMode === mode ? styles.modeBtnActive : ''}`}
            onClick={() => setSelectedMode(mode)}
          >
            <span aria-hidden="true">{icon}</span>
            <span className={styles.modeLabel}>{label}</span>
          </button>
        ))}
      </div>

      {/* Carbon Stats */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ color: 'var(--color-success)' }}>
            {scoreData.carbonSavedKg.toFixed(1)} kg
          </span>
          <span className={styles.statLabel}>CO₂ Saved</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {scoreData.comparison.userCarbonKg.toFixed(1)} kg
          </span>
          <span className={styles.statLabel}>Your Emissions</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ color: 'var(--color-text-muted)' }}>
            {scoreData.comparison.averageCarbonKg.toFixed(1)} kg
          </span>
          <span className={styles.statLabel}>Avg. Emissions</span>
        </div>
      </div>

      {/* Sustainability Tips */}
      <div className={styles.tips}>
        <h4 className={styles.tipsTitle}>💡 Sustainability Tips</h4>
        <ul className={styles.tipsList}>
          {scoreData.tips.map((tip, index) => (
            <li key={index} className={styles.tipItem}>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
