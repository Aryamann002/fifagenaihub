/**
 * Landing Page — Role selector for Fan vs Staff portal.
 * First screen users see. Animated hero with live match ticker.
 * @module app/page
 */

'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { getTodaysMatches, getLiveMatches } from '@/lib/data/matches';
import { STADIUMS } from '@/lib/data/stadiums';
import MatchCard from '@/components/MatchCard/MatchCard';
import styles from './page.module.css';

const emptySubscribe = () => () => {};

/** True after hydration — false during SSR and the first client render */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Landing page with animated hero section, dual role-selection cards,
 * live match ticker, and venue selector.
 */
export default function LandingPage() {
  const router = useRouter();
  const [selectedStadium, setSelectedStadium] = useState(STADIUMS[0].id);

  // Date-sensitive lists render client-only to avoid SSR/hydration mismatch:
  // empty during SSR and hydration, derived from the client clock afterwards.
  const hydrated = useHydrated();
  const todaysMatches = hydrated ? getTodaysMatches() : [];
  const liveMatches = hydrated ? getLiveMatches() : [];

  const navigateTo = (role: 'fan' | 'staff') => {
    router.push(`/${role}?stadiumId=${encodeURIComponent(selectedStadium)}`);
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        {/* Decorative background elements */}
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBall}>⚽</div>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badge} aria-label="Live event">
            <span className={styles.badgeDot} aria-hidden="true" />
            FIFA World Cup 2026 — Live Now
          </div>

          <h1 id="hero-heading" className={styles.heroTitle}>
            <span className={styles.heroTitleLine1}>FanHub</span>
            <span className={styles.heroTitleAccent}> 26</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Your GenAI-powered companion for the{' '}
            <strong>FIFA World Cup 2026</strong>. Real-time multilingual
            assistance, crowd intelligence, and stadium navigation across all 16
            venues.
          </p>

          {/* Live match count indicator */}
          {liveMatches.length > 0 && (
            <div className={styles.liveIndicator} role="status">
              <span className={styles.liveDot} aria-hidden="true" />
              <span>
                {liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} live right now
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Venue Selector */}
      <section className={styles.venueSection} aria-labelledby="venue-heading">
        <h2 id="venue-heading" className={styles.sectionTitle}>
          Select Your Stadium
        </h2>
        <div className={styles.venueSelectWrapper}>
          <label htmlFor="stadium-select" className="sr-only">
            Choose your FIFA 2026 stadium
          </label>
          <select
            id="stadium-select"
            className={`${styles.venueSelect} input select`}
            value={selectedStadium}
            onChange={(e) => setSelectedStadium(e.target.value)}
          >
            {STADIUMS.map((stadium) => (
              <option key={stadium.id} value={stadium.id}>
                {stadium.name} — {stadium.city}, {stadium.country}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Role Selection */}
      <section className={styles.roleSection} aria-labelledby="role-heading">
        <h2 id="role-heading" className={styles.sectionTitle}>
          How are you attending today?
        </h2>
        <div className={styles.roleGrid}>
          {/* Fan Card */}
          <article className={styles.roleCard} aria-labelledby="fan-card-title">
            <div className={styles.roleIcon} aria-hidden="true">🏟️</div>
            <h3 id="fan-card-title" className={styles.roleTitle}>I&apos;m a Fan</h3>
            <p className={styles.roleDescription}>
              Navigate the stadium, find food &amp; facilities, get multilingual
              AI assistance, plan your transit, and track your sustainability score.
            </p>
            <ul className={styles.roleFeatures} aria-label="Fan portal features">
              <li>🌍 Multilingual AI Chat</li>
              <li>🗺️ Interactive Stadium Map</li>
              <li>🌱 Green Travel Score</li>
              <li>⚽ Live Match Info</li>
            </ul>
            <button
              type="button"
              className={`${styles.roleBtn} ${styles.roleBtnFan}`}
              onClick={() => navigateTo('fan')}
              id="fan-portal-btn"
              aria-describedby="fan-card-title"
            >
              Enter Fan Portal →
            </button>
          </article>

          {/* Staff Card */}
          <article className={styles.roleCard} aria-labelledby="staff-card-title">
            <div className={styles.roleIcon} aria-hidden="true">📊</div>
            <h3 id="staff-card-title" className={styles.roleTitle}>I&apos;m Staff</h3>
            <p className={styles.roleDescription}>
              Monitor crowd density in real-time, receive AI-generated operational
              recommendations, manage gate flow, and respond to incidents.
            </p>
            <ul className={styles.roleFeatures} aria-label="Staff portal features">
              <li>📡 Real-Time Crowd Pulse</li>
              <li>🤖 Operational AI Assistant</li>
              <li>⚠️ Alert Management</li>
              <li>📈 Analytics Dashboard</li>
            </ul>
            <button
              type="button"
              className={`${styles.roleBtn} ${styles.roleBtnStaff}`}
              onClick={() => navigateTo('staff')}
              id="staff-portal-btn"
              aria-describedby="staff-card-title"
            >
              Enter Staff Dashboard →
            </button>
          </article>
        </div>
      </section>

      {/* Today's Matches */}
      {todaysMatches.length > 0 && (
        <section className={styles.matchesSection} aria-labelledby="matches-heading">
          <h2 id="matches-heading" className={styles.sectionTitle}>
            Today&apos;s Matches
          </h2>
          <div className={styles.matchesScroll} role="list" aria-label="Today's FIFA 2026 matches">
            {todaysMatches.map((match) => (
              <div key={match.id} role="listitem">
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          FanHub 26 — GenAI-powered by{' '}
          <span className={styles.footerAccent}>Google Gemini</span> (with Groq and offline fallbacks)
        </p>
        <p className={styles.footerSmall}>
          Covering 16 venues across USA 🇺🇸 · Mexico 🇲🇽 · Canada 🇨🇦
        </p>
      </footer>
    </div>
  );
}
