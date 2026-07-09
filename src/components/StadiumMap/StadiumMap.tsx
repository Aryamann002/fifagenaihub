/**
 * StadiumMap — Interactive SVG stadium map with facility navigation.
 * Allows fans to explore stadium zones and facilities via click or keyboard.
 * Selecting a zone auto-populates a navigation query in the chat interface.
 * @module components/StadiumMap
 */

'use client';

import { useState, type KeyboardEvent } from 'react';
import type { Stadium, FacilityType } from '@/types';
import { STADIUMS } from '@/lib/data/stadiums';
import styles from './StadiumMap.module.css';

/** Emoji icons mapped to facility types for visual representation */
const FACILITY_ICONS: Record<FacilityType, string> = {
  gate: '🚪',
  concession: '🍔',
  restroom: '🚻',
  medical: '🏥',
  accessibility: '♿',
  merchandise: '🛍️',
  information: 'ℹ️',
  sensory_room: '🧘',
};

/** Props for the StadiumMap component */
interface StadiumMapProps {
  /** The stadium to render the map for */
  stadiumId: string;
  /** Callback fired when a zone is selected, with a pre-built chat query */
  onZoneSelect?: (query: string) => void;
}

/**
 * Renders an interactive SVG map of a stadium with labelled zones.
 * Each zone is keyboard-navigable and triggers a pre-built AI chat query when selected.
 * Provides an accessible facility list as an alternative interaction method.
 */
export default function StadiumMap({ stadiumId, onZoneSelect }: StadiumMapProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const stadium: Stadium | undefined = STADIUMS.find((s) => s.id === stadiumId);

  if (!stadium) {
    return (
      <section className={styles.container} aria-label="Stadium Map">
        <p className={styles.error}>Stadium information not available.</p>
      </section>
    );
  }

  const zones = Array.from(new Set(stadium.facilities.map((f) => f.zone)));

  const handleZoneActivate = (zoneName: string) => {
    setActiveZone(zoneName === activeZone ? null : zoneName);
    onZoneSelect?.(`How do I navigate to ${zoneName} at ${stadium.name}?`);
  };

  const handleKeyDown = (event: KeyboardEvent, zoneName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleZoneActivate(zoneName);
    }
  };

  return (
    <section className={styles.container} aria-label={`${stadium.name} Interactive Stadium Map`}>
      <h3 className={styles.title}>🗺️ Stadium Map</h3>
      <p className={styles.stadiumName}>
        {stadium.name} — {stadium.city}, {stadium.country}
      </p>
      <p className={styles.capacity}>
        Capacity: {stadium.capacity.toLocaleString()} seats
      </p>

      {/* SVG Stadium Diagram */}
      <div className={styles.mapContainer}>
        <svg
          viewBox="0 0 400 320"
          className={styles.map}
          role="img"
          aria-label={`Schematic diagram of ${stadium.name} showing ${zones.length} zones`}
          focusable="false"
        >
          {/* Outer stadium border */}
          <ellipse
            cx="200" cy="160"
            rx="185" ry="140"
            fill="rgba(255,255,255,0.02)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
          {/* Pitch */}
          <rect
            x="110" y="100"
            width="180" height="120"
            rx="40" ry="30"
            fill="rgba(52, 211, 153, 0.08)"
            stroke="var(--color-success)"
            strokeWidth="1"
            strokeDasharray="5,3"
          />
          <line x1="200" y1="100" x2="200" y2="220" stroke="var(--color-success)" strokeWidth="0.5" opacity="0.4" />
          <circle cx="200" cy="160" r="18" fill="none" stroke="var(--color-success)" strokeWidth="0.5" opacity="0.4" />
          <text
            x="200" y="164"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-muted)"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            ⚽ Pitch
          </text>

          {/* Zone nodes around the stadium */}
          {zones.map((zone, index) => {
            const angle = (index / zones.length) * 2 * Math.PI - Math.PI / 2;
            const x = 200 + Math.cos(angle) * 155;
            const y = 160 + Math.sin(angle) * 115;
            const isActive = activeZone === zone;

            return (
              <g key={zone}>
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 24 : 20}
                  fill={isActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.04)'}
                  stroke={isActive ? 'var(--color-accent-cyan)' : 'var(--color-border)'}
                  strokeWidth={isActive ? 2 : 1}
                  className={styles.zoneCircle}
                  role="button"
                  tabIndex={0}
                  aria-label={`${zone} — press Enter to get AI directions`}
                  aria-pressed={isActive}
                  onClick={() => handleZoneActivate(zone)}
                  onKeyDown={(e) => handleKeyDown(e, zone)}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  x={x}
                  y={y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)'}
                  fontSize="7.5"
                  fontWeight={isActive ? '700' : '400'}
                  fontFamily="Inter, sans-serif"
                  pointerEvents="none"
                >
                  {zone.length > 12 ? zone.substring(0, 10) + '…' : zone}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active zone info */}
      {activeZone && (
        <div className={styles.activeZoneInfo} role="status">
          <span className={styles.activeZoneLabel}>📍 {activeZone}</span>
          <span className={styles.activeZoneHint}>AI directions loading in chat →</span>
        </div>
      )}

      {/* Facility Grid */}
      <div className={styles.facilities}>
        <h4 className={styles.facilitiesTitle}>Facilities</h4>
        <div
          className={styles.facilityGrid}
          role="list"
          aria-label="Stadium facilities"
        >
          {stadium.facilities.map((facility) => (
            <button
              key={facility.id}
              type="button"
              role="listitem"
              className={`${styles.facilityChip} ${activeZone === facility.zone ? styles.facilityChipActive : ''}`}
              onClick={() => handleZoneActivate(facility.zone)}
              aria-label={`${facility.name} in ${facility.zone}${facility.accessible ? ', wheelchair accessible' : ''}`}
            >
              <span aria-hidden="true">{FACILITY_ICONS[facility.type]}</span>
              <span className={styles.facilityName}>{facility.name}</span>
              {facility.accessible && (
                <span className={styles.accessBadge} aria-label="Accessible">♿</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
