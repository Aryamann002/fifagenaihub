/**
 * Tests for the green score calculator and sustainability helpers.
 * @module lib/data/sustainability.test
 */

import {
  calculateGreenScore,
  getTransitComparison,
  getSustainabilityTips,
} from '@/lib/data/sustainability';
import { STADIUMS } from '@/lib/data/stadiums';
import type { TransitMode } from '@/types';

const ALL_MODES: TransitMode[] = ['walk', 'metro', 'bus', 'rideshare', 'drive'];

describe('calculateGreenScore', () => {
  it('gives walking the maximum score', () => {
    const result = calculateGreenScore('walk', 'sofi');
    expect(result.score).toBe(100);
    expect(result.transitMode).toBe('walk');
  });

  it('scores driving well below public transit', () => {
    const drive = calculateGreenScore('drive', 'metlife');
    const metro = calculateGreenScore('metro', 'metlife');
    expect(drive.score).toBeLessThan(metro.score);
  });

  it('reports zero carbon saved when driving', () => {
    const result = calculateGreenScore('drive', 'metlife');
    expect(result.carbonSavedKg).toBe(0);
  });

  it('reports positive carbon savings for greener modes', () => {
    const result = calculateGreenScore('metro', 'metlife');
    expect(result.carbonSavedKg).toBeGreaterThan(0);
  });

  it('clamps every score to the 0–100 range for all stadiums and modes', () => {
    STADIUMS.forEach((stadium) => {
      ALL_MODES.forEach((mode) => {
        const { score } = calculateGreenScore(mode, stadium.id);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  it('falls back to average carbon values for an unknown stadium', () => {
    const result = calculateGreenScore('bus', 'unknown-stadium');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.comparison.userCarbonKg).toBeGreaterThan(0);
  });

  it('includes a mode-vs-average comparison', () => {
    const result = calculateGreenScore('metro', 'sofi');
    expect(result.comparison.averageCarbonKg).toBeGreaterThan(0);
    expect(result.comparison.userCarbonKg).toBeLessThan(result.comparison.averageCarbonKg);
  });
});

describe('getTransitComparison', () => {
  it('returns options sorted by carbon footprint ascending', () => {
    const options = getTransitComparison('metlife');
    expect(options.length).toBeGreaterThan(0);
    for (let i = 1; i < options.length; i++) {
      expect(options[i].carbonKgPerTrip).toBeGreaterThanOrEqual(options[i - 1].carbonKgPerTrip);
    }
  });

  it('returns an empty array for an unknown stadium', () => {
    expect(getTransitComparison('nope')).toEqual([]);
  });

  it('does not mutate the stadium data', () => {
    const before = STADIUMS.find((s) => s.id === 'metlife')!.transitOptions.map((o) => o.mode);
    getTransitComparison('metlife');
    const after = STADIUMS.find((s) => s.id === 'metlife')!.transitOptions.map((o) => o.mode);
    expect(after).toEqual(before);
  });
});

describe('getSustainabilityTips', () => {
  it('returns between 1 and 5 tips', () => {
    ALL_MODES.forEach((mode) => {
      const tips = getSustainabilityTips('sofi', mode);
      expect(tips.length).toBeGreaterThan(0);
      expect(tips.length).toBeLessThanOrEqual(5);
    });
  });

  it('suggests carpooling to drivers', () => {
    const tips = getSustainabilityTips('metlife', 'drive');
    expect(tips.join(' ')).toMatch(/carpool/i);
  });

  it('includes stadium-specific renewable energy tips where relevant', () => {
    // SoFi runs on 70% renewable energy — meets the ≥70% tip threshold
    const tips = getSustainabilityTips('sofi', 'metro');
    expect(tips.join(' ')).toContain('70% renewable');
  });

  it('still returns generic tips for an unknown stadium', () => {
    const tips = getSustainabilityTips('unknown', 'walk');
    expect(tips.length).toBeGreaterThan(0);
  });
});
