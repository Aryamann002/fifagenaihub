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
});
