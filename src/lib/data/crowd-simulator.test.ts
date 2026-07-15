/**
 * Tests for the crowd simulator.
 * Verifies correct data structure, capacity bounds, and AI summary generation.
 * @module lib/data/crowd-simulator.test
 */

import { generateCrowdData } from '@/lib/data/crowd-simulator';

describe('generateCrowdData', () => {
  const VALID_STADIUM_ID = 'metlife-stadium';

  it('returns a valid CrowdData object', () => {
    const data = generateCrowdData(VALID_STADIUM_ID);

    expect(data).toBeDefined();
    expect(data.stadiumId).toBe(VALID_STADIUM_ID);
    expect(Array.isArray(data.zones)).toBe(true);
    expect(data.zones.length).toBeGreaterThan(0);
    expect(typeof data.overallOccupancyPercent).toBe('number');
    expect(typeof data.aiSummary).toBe('string');
    expect(typeof data.timestamp).toBe('number');
  });

  it('returns overall occupancy between 0 and 100', () => {
    const data = generateCrowdData(VALID_STADIUM_ID);
    expect(data.overallOccupancyPercent).toBeGreaterThanOrEqual(0);
    expect(data.overallOccupancyPercent).toBeLessThanOrEqual(100);
  });

  it('returns zones with valid occupancy values', () => {
    const data = generateCrowdData(VALID_STADIUM_ID);
    data.zones.forEach((zone) => {
      expect(zone.currentOccupancy).toBeGreaterThanOrEqual(0);
      expect(zone.currentOccupancy).toBeLessThanOrEqual(zone.maxCapacity);
      expect(zone.maxCapacity).toBeGreaterThan(0);
    });
  });

  it('returns zones with valid density levels', () => {
    const validLevels = ['low', 'moderate', 'high', 'critical'];
    const data = generateCrowdData(VALID_STADIUM_ID);
    data.zones.forEach((zone) => {
      expect(validLevels).toContain(zone.densityLevel);
    });
  });

  it('returns zones with valid trend values', () => {
    const validTrends = ['increasing', 'stable', 'decreasing'];
    const data = generateCrowdData(VALID_STADIUM_ID);
    data.zones.forEach((zone) => {
      expect(validTrends).toContain(zone.trend);
    });
  });

  it('returns a non-empty AI summary', () => {
    const data = generateCrowdData(VALID_STADIUM_ID);
    expect(data.aiSummary.length).toBeGreaterThan(10);
  });

  it('handles unknown stadium ID gracefully', () => {
    // Should fallback to 70000 capacity without throwing
    expect(() => generateCrowdData('unknown-stadium-xyz')).not.toThrow();
    const data = generateCrowdData('unknown-stadium-xyz');
    expect(data.zones.length).toBeGreaterThan(0);
  });

  it('returns a recent timestamp', () => {
    const before = Date.now();
    const data = generateCrowdData(VALID_STADIUM_ID);
    const after = Date.now();
    expect(data.timestamp).toBeGreaterThanOrEqual(before);
    expect(data.timestamp).toBeLessThanOrEqual(after);
  });

  describe('match phase behavior (kickoff is 20:00 UTC)', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    /** Freeze the clock at a given UTC time on a fixed date */
    function setUtcTime(hours: number, minutes: number): void {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(Date.UTC(2026, 6, 15, hours, minutes)));
    }

    it('fills seating and empties gates during the second half', () => {
      setUtcTime(21, 0); // 60 min after kickoff

      const data = generateCrowdData(VALID_STADIUM_ID);
      const gates = data.zones.filter((z) => z.id.startsWith('gate'));
      const lowerBowl = data.zones.find((z) => z.id === 'seating-lower');

      // Gate base occupancy is 0.10 (±0.15 noise) — always 'low'
      gates.forEach((gate) => expect(gate.densityLevel).toBe('low'));
      // Seating base occupancy is 0.98 (±0.15 noise) — always ≥ 'high'
      expect(['high', 'critical']).toContain(lowerBowl?.densityLevel);
    });

    it('shows gates increasing during pre-match build-up', () => {
      setUtcTime(17, 0); // 3 hours before kickoff

      const data = generateCrowdData(VALID_STADIUM_ID);
      data.zones
        .filter((z) => z.id.startsWith('gate'))
        .forEach((gate) => expect(gate.trend).toBe('increasing'));
    });

    it('shows concourse surging at halftime', () => {
      setUtcTime(20, 50); // 50 min after kickoff = halftime

      const data = generateCrowdData(VALID_STADIUM_ID);
      data.zones
        .filter((z) => z.id.startsWith('concourse'))
        .forEach((zone) => expect(zone.trend).toBe('increasing'));
    });

    it('shows gates increasing and seating decreasing post-match', () => {
      setUtcTime(23, 0); // 180 min after kickoff = post-match

      const data = generateCrowdData(VALID_STADIUM_ID);
      const gate = data.zones.find((z) => z.id === 'gate-a');
      const seating = data.zones.find((z) => z.id === 'seating-lower');

      expect(gate?.trend).toBe('increasing');
      expect(seating?.trend).toBe('decreasing');
    });

    it('emits an alert summary when any zone is critical', () => {
      setUtcTime(21, 0); // second half — seating is near capacity

      const data = generateCrowdData(VALID_STADIUM_ID);
      const hasCritical = data.zones.some((z) => z.densityLevel === 'critical');
      const hasHigh = data.zones.some((z) => z.densityLevel === 'high');

      if (hasCritical) {
        expect(data.aiSummary).toContain('ALERT');
      } else if (hasHigh) {
        expect(data.aiSummary).toContain('MONITOR');
      } else {
        expect(data.aiSummary).toContain('NOMINAL');
      }
    });
  });
});
