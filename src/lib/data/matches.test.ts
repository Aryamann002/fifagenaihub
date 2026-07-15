/**
 * Tests for the match schedule data and its query helpers.
 * @module lib/data/matches.test
 */

import { MATCHES, getMatchesByStadium, getTodaysMatches, getLiveMatches } from '@/lib/data/matches';
import { getStadiumById } from '@/lib/data/stadiums';

describe('MATCHES data integrity', () => {
  it('references only known stadiums', () => {
    MATCHES.forEach((match) => {
      expect(getStadiumById(match.stadiumId)).toBeDefined();
    });
  });

  it('has unique match IDs', () => {
    const ids = MATCHES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a score for every non-scheduled match and none for scheduled ones', () => {
    MATCHES.forEach((match) => {
      if (match.status === 'scheduled') {
        expect(match.score).toBeUndefined();
      } else {
        expect(match.score).toBeDefined();
      }
    });
  });

  it('has valid ISO date-times', () => {
    MATCHES.forEach((match) => {
      expect(Number.isNaN(new Date(match.dateTime).getTime())).toBe(false);
    });
  });
});

describe('getMatchesByStadium', () => {
  it('returns only matches at the given stadium', () => {
    const matches = getMatchesByStadium('metlife');
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((m) => expect(m.stadiumId).toBe('metlife'));
  });

  it('returns an empty array for an unknown stadium', () => {
    expect(getMatchesByStadium('unknown-stadium')).toEqual([]);
  });
});

describe('getTodaysMatches', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns matches taking place on the current UTC day', () => {
    jest.useFakeTimers();
    // 01:00 UTC on 06-12: the two opening matches (kickoff 00:00 UTC) fall on this UTC day
    jest.setSystemTime(new Date('2026-06-12T01:00:00Z'));

    const matches = getTodaysMatches();
    expect(matches.map((m) => m.id)).toContain('match-a2'); // the expected opener is present
    matches.forEach((m) =>
      expect(new Date(m.dateTime).toISOString().slice(0, 10)).toBe('2026-06-12'),
    );
  });

  it('normalizes to UTC so evening matches are not dropped after local midnight', () => {
    jest.useFakeTimers();
    // A match at 2026-06-11T20:00-04:00 is 2026-06-12T00:00 UTC; at 00:30 UTC on 06-12
    // it is in progress and must still count as "today".
    jest.setSystemTime(new Date('2026-06-12T00:30:00Z'));

    const ids = getTodaysMatches().map((m) => m.id);
    expect(ids).toContain('match-a2'); // MetLife, 2026-06-11T20:00:00-04:00
  });

  it('returns an empty array on a day with no matches', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-01-01T12:00:00Z'));

    expect(getTodaysMatches()).toEqual([]);
  });
});

describe('getLiveMatches', () => {
  it('returns only live or halftime matches', () => {
    const live = getLiveMatches();
    live.forEach((m) => expect(['live', 'halftime']).toContain(m.status));
  });
});
