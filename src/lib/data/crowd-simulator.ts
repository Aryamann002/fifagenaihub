/**
 * Crowd simulator — generates realistic, time-aware crowd density data.
 * Simulates pre-match build-up, halftime surges, and post-match dispersal.
 * Used by the /api/crowd endpoint to power the Staff Crowd Pulse dashboard.
 * @module lib/data/crowd-simulator
 */

import type { CrowdData, CrowdZone, DensityLevel } from '@/types';
import { getStadiumById } from './stadiums';

/** Stadium zones with realistic names and capacities (percentage of total) */
const ZONE_DEFINITIONS = [
  { id: 'gate-a', name: 'Gate A — North', capacityRatio: 0.12 },
  { id: 'gate-b', name: 'Gate B — South', capacityRatio: 0.12 },
  { id: 'gate-c', name: 'Gate C — East', capacityRatio: 0.08 },
  { id: 'gate-d', name: 'Gate D — West', capacityRatio: 0.08 },
  { id: 'concourse-l1', name: 'Concourse Level 1', capacityRatio: 0.15 },
  { id: 'concourse-l2', name: 'Concourse Level 2', capacityRatio: 0.15 },
  { id: 'seating-lower', name: 'Lower Bowl Seating', capacityRatio: 0.20 },
  { id: 'seating-upper', name: 'Upper Deck Seating', capacityRatio: 0.10 },
] as const;

/** Phase of the match day that drives crowd simulation */
type MatchPhase = 'pre_match' | 'kickoff' | 'first_half' | 'halftime' | 'second_half' | 'post_match';

/**
 * Determines the current match phase based on the current time.
 * Uses UTC time aligned to a representative FIFA 2026 match schedule.
 */
function getCurrentMatchPhase(): MatchPhase {
  const now = new Date();
  const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();

  // Simulate around a 20:00 UTC kickoff window (representative slot)
  const kickoffMinute = 20 * 60; // 20:00 UTC

  const minutesFromKickoff = minuteOfDay - kickoffMinute;

  if (minutesFromKickoff < -10) return 'pre_match';
  if (minutesFromKickoff < 5) return 'kickoff';
  if (minutesFromKickoff < 45) return 'first_half';
  if (minutesFromKickoff < 60) return 'halftime';
  if (minutesFromKickoff < 105) return 'second_half';
  return 'post_match';
}

/**
 * Returns the base occupancy multiplier for a zone during a given match phase.
 * Values represent the fraction of max capacity that should be occupied.
 */
function getPhaseMultiplier(phase: MatchPhase, zoneId: string): number {
  const isGate = zoneId.startsWith('gate');
  const isConcourse = zoneId.startsWith('concourse');
  const isSeating = zoneId.startsWith('seating');

  const multipliers: Record<MatchPhase, { gate: number; concourse: number; seating: number }> = {
    pre_match: { gate: 0.80, concourse: 0.50, seating: 0.30 },
    kickoff: { gate: 0.95, concourse: 0.70, seating: 0.75 },
    first_half: { gate: 0.20, concourse: 0.25, seating: 0.97 },
    halftime: { gate: 0.10, concourse: 0.90, seating: 0.40 },
    second_half: { gate: 0.10, concourse: 0.20, seating: 0.98 },
    post_match: { gate: 0.85, concourse: 0.60, seating: 0.15 },
  };

  const phaseData = multipliers[phase];
  if (isGate) return phaseData.gate;
  if (isConcourse) return phaseData.concourse;
  if (isSeating) return phaseData.seating;
  return 0.5;
}

/**
 * Adds realistic noise to an occupancy value to prevent perfectly smooth data.
 * Noise range is ±15% of the base value.
 */
function addNoise(value: number, range: number = 0.15): number {
  const noise = (Math.random() * 2 - 1) * range;
  return Math.max(0, Math.min(1, value + noise));
}

/**
 * Maps an occupancy ratio to a qualitative density level.
 */
function getDensityLevel(occupancyRatio: number): DensityLevel {
  if (occupancyRatio >= 0.90) return 'critical';
  if (occupancyRatio >= 0.75) return 'high';
  if (occupancyRatio >= 0.50) return 'moderate';
  return 'low';
}

/**
 * Determines whether a zone's trend is increasing, stable, or decreasing
 * based on the match phase and zone type.
 */
function getTrend(phase: MatchPhase, zoneId: string): CrowdZone['trend'] {
  const isGate = zoneId.startsWith('gate');
  const isConcourse = zoneId.startsWith('concourse');

  if (phase === 'pre_match' || phase === 'kickoff') {
    return isGate ? 'increasing' : 'stable';
  }
  if (phase === 'halftime') {
    return isConcourse ? 'increasing' : 'decreasing';
  }
  if (phase === 'post_match') {
    return isGate ? 'increasing' : 'decreasing';
  }
  return 'stable';
}

/**
 * Generates an AI summary of current crowd conditions based on zone data.
 * Identifies the most critical zones and recommends actions.
 */
function generateAiSummary(zones: CrowdZone[], overallPercent: number): string {
  const criticalZones = zones.filter((z) => z.densityLevel === 'critical');
  const highZones = zones.filter((z) => z.densityLevel === 'high');

  if (criticalZones.length > 0) {
    const zoneNames = criticalZones.map((z) => z.name).join(', ');
    return `⚠️ ALERT: ${criticalZones.length} critical zone(s) detected — ${zoneNames}. Immediate action required: deploy additional staff, activate overflow signage, and consider restricting entry temporarily. Overall stadium at ${overallPercent}% capacity.`;
  }

  if (highZones.length > 0) {
    const zoneNames = highZones.map((z) => z.name).join(', ');
    return `📊 MONITOR: ${highZones.length} high-density zone(s) — ${zoneNames}. Recommend proactive fan re-routing via digital signage. Overall stadium at ${overallPercent}% capacity.`;
  }

  return `✅ NOMINAL: All zones operating within safe parameters. Stadium at ${overallPercent}% overall capacity. Current conditions are optimal — no immediate action required.`;
}

/**
 * Generates a full crowd data snapshot for a given stadium.
 * Data is dynamically generated based on the current time and match phase.
 *
 * @param stadiumId - The stadium to generate crowd data for
 * @returns A complete CrowdData snapshot
 */
export function generateCrowdData(stadiumId: string): CrowdData {
  const stadium = getStadiumById(stadiumId);
  const capacity = stadium?.capacity ?? 70000;
  const phase = getCurrentMatchPhase();
  const now = Date.now();

  const zones: CrowdZone[] = ZONE_DEFINITIONS.map((def) => {
    const zoneCapacity = Math.floor(capacity * def.capacityRatio);
    const baseMultiplier = getPhaseMultiplier(phase, def.id);
    const occupancyRatio = addNoise(baseMultiplier);
    const currentOccupancy = Math.floor(zoneCapacity * occupancyRatio);

    return {
      id: def.id,
      name: def.name,
      currentOccupancy,
      maxCapacity: zoneCapacity,
      densityLevel: getDensityLevel(occupancyRatio),
      trend: getTrend(phase, def.id),
      lastUpdated: now,
    };
  });

  const totalOccupancy = zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.maxCapacity, 0);
  const overallOccupancyPercent = Math.round((totalOccupancy / totalCapacity) * 100);

  return {
    stadiumId,
    timestamp: now,
    zones,
    overallOccupancyPercent,
    aiSummary: generateAiSummary(zones, overallOccupancyPercent),
  };
}
