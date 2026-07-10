/**
 * Staff Dashboard — Crowd intelligence, operational AI chat, alert feed.
 * The primary experience for venue staff during FIFA World Cup 2026 matches.
 * @module app/staff/page
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { STADIUMS } from '@/lib/data/stadiums';
import ChatInterface from '@/components/ChatInterface/ChatInterface';
import CrowdPulse from '@/components/CrowdPulse/CrowdPulse';
import LoadingSkeleton from '@/components/common/LoadingSkeleton/LoadingSkeleton';
import type { ChatContext } from '@/types';
import styles from './page.module.css';

/** Sample operational alerts for the staff feed */
const SAMPLE_ALERTS = [
  { id: 'a1', severity: 'critical' as const, message: 'Gate A — Entry queue exceeds 15 min wait. Deploy additional staff immediately.', time: '2 min ago' },
  { id: 'a2', severity: 'warning' as const, message: 'Section 214 concession stand inventory low — hotdogs at 10% remaining.', time: '8 min ago' },
  { id: 'a3', severity: 'info' as const, message: 'Halftime approaching (T-12 min). Activate additional concourse flow management.', time: '12 min ago' },
  { id: 'a4', severity: 'success' as const, message: 'Medical team response complete — fan in Section 102 transported. All clear.', time: '18 min ago' },
];

const SEVERITY_CONFIG = {
  critical: { color: 'var(--color-danger)', icon: '🔴', label: 'Critical' },
  warning: { color: 'var(--color-warning)', icon: '🟡', label: 'Warning' },
  info: { color: 'var(--color-accent-cyan)', icon: '🔵', label: 'Info' },
  success: { color: 'var(--color-success)', icon: '🟢', label: 'Resolved' },
};

/**
 * Staff dashboard content — grid of Crowd Pulse, AI Chat, and Alert Feed.
 */
function StaffDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stadiumId = searchParams.get('stadiumId') ?? STADIUMS[0].id;
  const stadium = STADIUMS.find((s) => s.id === stadiumId) ?? STADIUMS[0];

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showReasoning, setShowReasoning] = useState(false);

  const chatContext: ChatContext = {
    stadiumId: stadium.id,
    role: 'staff',
  };

  const activeAlerts = SAMPLE_ALERTS.filter((a) => !dismissedAlerts.has(a.id));

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push('/')}
            aria-label="Return to home page"
          >
            ← Home
          </button>
          <div>
            <h1 className={styles.pageTitle}>Operations Dashboard</h1>
            <p className={styles.stadiumName}>📍 {stadium.name} — {stadium.city}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${showReasoning ? styles.toggleActive : ''}`}
            onClick={() => setShowReasoning(!showReasoning)}
            title="Show AI reasoning and structured data (jury demo feature)"
          >
            🧠 {showReasoning ? 'Hide' : 'Show'} Reasoning
          </button>

          <div className={styles.staffBadge}>
            <span className={styles.staffDot} aria-hidden="true" />
            Staff Mode
          </div>

          <label htmlFor="staff-stadium-switcher" className="sr-only">Switch stadium</label>
          <select
            id="staff-stadium-switcher"
            className={`${styles.stadiumSwitcher} input select`}
            value={stadiumId}
            onChange={(e) => router.push(`/staff?stadiumId=${encodeURIComponent(e.target.value)}`)}
          >
            {STADIUMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Stats Bar */}
      <div className={styles.statsBar} role="region" aria-label="Quick stats">
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Capacity</span>
          <span className={styles.statVal}>{stadium.capacity.toLocaleString('en-US')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Alerts</span>
          <span className={`${styles.statVal} ${activeAlerts.some(a => a.severity === 'critical') ? styles.statValDanger : ''}`}>
            {activeAlerts.length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Country</span>
          <span className={styles.statVal}>{stadium.country}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Renewable Energy</span>
          <span className={styles.statVal} style={{ color: 'var(--color-success)' }}>
            {stadium.sustainabilityMetrics.renewableEnergyPercent}%
          </span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className={styles.grid}>
        {/* Crowd Pulse — top left */}
        <div className={styles.crowdPanel}>
          <Suspense fallback={<LoadingSkeleton variant="rectangular" height="350px" label="Loading crowd data..." />}>
            <CrowdPulse stadiumId={stadium.id} />
          </Suspense>
        </div>

        {/* Operational Chat — top right */}
        <div className={styles.chatPanel}>
          <Suspense fallback={<LoadingSkeleton variant="rectangular" height="350px" label="Loading AI assistant..." />}>
            <ChatInterface
              context={chatContext}
              title="Ops AI Assistant"
              placeholder="Query crowd density, gate flow, resource allocation..."
              showReasoning={showReasoning}
            />
          </Suspense>
        </div>

        {/* Alert Feed — bottom */}
        <div className={styles.alertPanel}>
          <section aria-labelledby="alerts-heading" className={styles.alertSection}>
            <header className={styles.alertHeader}>
              <h2 id="alerts-heading" className={styles.alertTitle}>⚠️ Alert Feed</h2>
              <span className={styles.alertCount} aria-label={`${activeAlerts.length} active alerts`}>
                {activeAlerts.length}
              </span>
            </header>

            {activeAlerts.length === 0 ? (
              <p className={styles.noAlerts}>✅ All clear — no active alerts.</p>
            ) : (
              <ul className={styles.alertList} aria-label="Active operational alerts">
                {activeAlerts.map((alert) => {
                  const config = SEVERITY_CONFIG[alert.severity];
                  return (
                    <li
                      key={alert.id}
                      className={styles.alertItem}
                      style={{ borderLeftColor: config.color }}
                      aria-label={`${config.label} alert: ${alert.message}`}
                    >
                      <span className={styles.alertIcon} aria-hidden="true">{config.icon}</span>
                      <div className={styles.alertBody}>
                        <p className={styles.alertMessage}>{alert.message}</p>
                        <span className={styles.alertTime}>{alert.time}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.alertDismiss}
                        onClick={() => dismissAlert(alert.id)}
                        aria-label={`Dismiss alert: ${alert.message}`}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/** Staff dashboard page wrapped in Suspense for useSearchParams */
export default function StaffPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="rectangular" height="100vh" label="Loading staff dashboard..." />}>
      <StaffDashboardContent />
    </Suspense>
  );
}
