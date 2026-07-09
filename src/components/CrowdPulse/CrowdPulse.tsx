/**
 * CrowdPulse — Real-time crowd intelligence dashboard for stadium staff.
 * Displays zone-by-zone crowd density with visual heatmap and accessible table view.
 * Auto-refreshes every 5 seconds from the /api/crowd endpoint.
 * @module components/CrowdPulse
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CrowdData, CrowdZone } from '@/types';
import LoadingSkeleton from '@/components/common/LoadingSkeleton/LoadingSkeleton';
import styles from './CrowdPulse.module.css';

/** Props for the CrowdPulse component */
interface CrowdPulseProps {
  /** Stadium ID to fetch crowd data for */
  stadiumId: string;
}

/** View mode: visual grid or accessible table */
type ViewMode = 'visual' | 'table';

/** Density level metadata */
const DENSITY_META: Record<string, { color: string; label: string }> = {
  low: { color: 'var(--color-density-low)', label: 'Low' },
  moderate: { color: 'var(--color-density-moderate)', label: 'Moderate' },
  high: { color: 'var(--color-density-high)', label: 'High' },
  critical: { color: 'var(--color-density-critical)', label: 'Critical' },
};

/** Trend direction icons */
const TREND_ICONS: Record<CrowdZone['trend'], string> = {
  increasing: '↑',
  stable: '→',
  decreasing: '↓',
};

/**
 * Renders real-time crowd density data for all stadium zones.
 * Provides both a visual grid (default) and an accessible data table.
 * Updates automatically every 5 seconds.
 */
export default function CrowdPulse({ stadiumId }: CrowdPulseProps) {
  const [crowdData, setCrowdData] = useState<CrowdData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCrowdData = useCallback(async () => {
    try {
      const response = await fetch(`/api/crowd?stadiumId=${encodeURIComponent(stadiumId)}`);
      if (response.ok) {
        const data = (await response.json()) as CrowdData;
        setCrowdData(data);
      }
    } catch {
      // Silently retry on next interval — crowd data is best-effort
    } finally {
      setIsLoading(false);
    }
  }, [stadiumId]);

  useEffect(() => {
    fetchCrowdData();
    const interval = setInterval(fetchCrowdData, 5000);
    return () => clearInterval(interval);
  }, [fetchCrowdData]);

  if (isLoading) {
    return (
      <section className={styles.container} aria-label="Crowd Intelligence Dashboard">
        <LoadingSkeleton variant="rectangular" height="300px" label="Loading crowd data..." />
      </section>
    );
  }

  if (!crowdData) {
    return (
      <section className={styles.container} aria-label="Crowd Intelligence Dashboard">
        <p className={styles.error}>Unable to load crowd data. Retrying...</p>
      </section>
    );
  }

  return (
    <section className={styles.container} aria-label="Crowd Intelligence Dashboard">
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>📊 Crowd Pulse</h3>
          <p className={styles.subtitle}>
            Overall:{' '}
            <strong style={{ color: crowdData.overallOccupancyPercent >= 90 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
              {crowdData.overallOccupancyPercent}%
            </strong>{' '}
            capacity
          </p>
        </div>

        <div className={styles.viewToggle} role="tablist" aria-label="Switch between grid and table view">
          <button
            role="tab"
            aria-selected={viewMode === 'visual'}
            id="tab-visual"
            aria-controls="panel-visual"
            className={`${styles.toggleBtn} ${viewMode === 'visual' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('visual')}
          >
            Grid
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'table'}
            id="tab-table"
            aria-controls="panel-table"
            className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </div>
      </header>

      {/* AI Summary */}
      <div className={styles.aiSummary} role="status" aria-live="polite">
        <span className={styles.aiIcon} aria-hidden="true">🤖</span>
        <p>{crowdData.aiSummary}</p>
      </div>

      {/* Visual Grid */}
      {viewMode === 'visual' && (
        <div
          id="panel-visual"
          role="tabpanel"
          aria-labelledby="tab-visual"
          className={styles.zoneGrid}
        >
          {crowdData.zones.map((zone) => {
            const occupancyPercent = Math.round(
              (zone.currentOccupancy / zone.maxCapacity) * 100,
            );
            const meta = DENSITY_META[zone.densityLevel] ?? DENSITY_META.low;
            return (
              <div
                key={zone.id}
                className={styles.zoneCard}
                aria-label={`${zone.name}: ${occupancyPercent}% occupied, ${meta.label} density, trend ${zone.trend}`}
              >
                <div className={styles.zoneName}>{zone.name}</div>
                <div className={styles.zoneBarTrack} aria-hidden="true">
                  <div
                    className={styles.zoneBarFill}
                    style={{
                      width: `${occupancyPercent}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
                <div className={styles.zoneFooter}>
                  <span className={styles.zonePercent} style={{ color: meta.color }}>
                    {occupancyPercent}%
                  </span>
                  <span
                    className={styles.zoneTrend}
                    style={{ color: zone.trend === 'increasing' ? 'var(--color-danger)' : 'var(--color-text-muted)' }}
                    aria-hidden="true"
                  >
                    {TREND_ICONS[zone.trend]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Table View */}
      {viewMode === 'table' && (
        <div
          id="panel-table"
          role="tabpanel"
          aria-labelledby="tab-table"
          className={styles.tableWrapper}
        >
          <table className={styles.table}>
            <caption className="sr-only">Stadium crowd density by zone</caption>
            <thead>
              <tr>
                <th scope="col">Zone</th>
                <th scope="col">Occupancy</th>
                <th scope="col">Capacity</th>
                <th scope="col">Density</th>
                <th scope="col">Trend</th>
              </tr>
            </thead>
            <tbody>
              {crowdData.zones.map((zone) => {
                const meta = DENSITY_META[zone.densityLevel] ?? DENSITY_META.low;
                return (
                  <tr key={zone.id}>
                    <td>{zone.name}</td>
                    <td>{zone.currentOccupancy.toLocaleString()}</td>
                    <td>{zone.maxCapacity.toLocaleString()}</td>
                    <td>
                      <span className={styles.densityPill} style={{ color: meta.color, borderColor: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td>
                      {TREND_ICONS[zone.trend]} {zone.trend}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend} aria-label="Density level color key">
        {Object.entries(DENSITY_META).map(([level, { color, label }]) => (
          <span key={level} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
