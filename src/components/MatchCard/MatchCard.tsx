/**
 * MatchCard — Displays a single FIFA World Cup 2026 match.
 * Shows team names, score, match status badge, venue, and date.
 * @module components/MatchCard
 */

'use client';

import type { Match } from '@/types';
import { STADIUMS } from '@/lib/data/stadiums';
import styles from './MatchCard.module.css';

/** Props for the MatchCard component */
interface MatchCardProps {
  /** The match to display */
  match: Match;
}

/**
 * Renders an accessible match card with team names, score/time, and venue info.
 * Uses semantic HTML with ARIA labels for screen reader support.
 */
export default function MatchCard({ match }: MatchCardProps) {
  const stadium = STADIUMS.find((s) => s.id === match.stadiumId);
  const matchDate = new Date(match.dateTime);
  const timeString = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  /** Derives the status badge label and style class */
  const getStatusBadge = () => {
    switch (match.status) {
      case 'live':
        return { label: '● LIVE', className: styles.badgeLive };
      case 'halftime':
        return { label: 'HT', className: styles.badgeHalftime };
      case 'completed':
        return { label: 'FT', className: styles.badgeCompleted };
      default:
        return { label: timeString, className: styles.badgeScheduled };
    }
  };

  const { label, className } = getStatusBadge();
  const hasScore = match.score !== undefined;
  const ariaLabel = `Group ${match.group}: ${match.homeTeam} ${hasScore ? match.score!.home : ''} vs ${hasScore ? match.score!.away : ''} ${match.awayTeam}. Status: ${match.status}`;

  return (
    <article className={styles.card} aria-label={ariaLabel}>
      <div className={styles.topRow}>
        <span className={styles.groupLabel}>Group {match.group}</span>
        <span className={`${styles.statusBadge} ${className}`} aria-label={`Match status: ${match.status}`}>
          {label}
        </span>
      </div>

      <div className={styles.teams}>
        <div className={styles.team}>
          <span className={styles.teamName}>{match.homeTeam}</span>
          {hasScore && (
            <span className={styles.score} aria-hidden="true">
              {match.score!.home}
            </span>
          )}
        </div>

        <span className={styles.vsLabel} aria-hidden="true">
          {!hasScore ? 'vs' : ':'}
        </span>

        <div className={`${styles.team} ${styles.teamAway}`}>
          {hasScore && (
            <span className={styles.score} aria-hidden="true">
              {match.score!.away}
            </span>
          )}
          <span className={styles.teamName}>{match.awayTeam}</span>
        </div>
      </div>

      <div className={styles.venue}>
        <span>{stadium?.name ?? 'Venue TBD'}</span>
        <span className={styles.dot} aria-hidden="true">•</span>
        <span>{dateString}</span>
      </div>
    </article>
  );
}
