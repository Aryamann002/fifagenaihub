/**
 * @module matches
 * Sample match schedule data for the FIFA World Cup 2026.
 * Contains ~20 group-stage matches across groups A–L with varying statuses.
 */

import type { Match } from '@/types';

/**
 * Sample match schedule for the FIFA World Cup 2026.
 * Includes a mix of scheduled, live, halftime, and completed matches.
 * Date-times are anchored around the current tournament window (July 2026).
 */
export const MATCHES: Match[] = [
  // ── Group A ──────────────────────────────────────────────────────────────
  {
    id: 'match-a1',
    group: 'A',
    homeTeam: 'Mexico',
    awayTeam: 'Ecuador',
    stadiumId: 'azteca',
    dateTime: '2026-06-11T18:00:00-06:00',
    status: 'completed',
    score: { home: 2, away: 1 },
  },
  {
    id: 'match-a2',
    group: 'A',
    homeTeam: 'USA',
    awayTeam: 'Morocco',
    stadiumId: 'metlife',
    dateTime: '2026-06-11T20:00:00-04:00',
    status: 'completed',
    score: { home: 3, away: 0 },
  },

  // ── Group B ──────────────────────────────────────────────────────────────
  {
    id: 'match-b1',
    group: 'B',
    homeTeam: 'England',
    awayTeam: 'Japan',
    stadiumId: 'sofi',
    dateTime: '2026-06-12T17:00:00-07:00',
    status: 'completed',
    score: { home: 1, away: 1 },
  },
  {
    id: 'match-b2',
    group: 'B',
    homeTeam: 'Senegal',
    awayTeam: 'Chile',
    stadiumId: 'nrg',
    dateTime: '2026-06-12T19:00:00-05:00',
    status: 'completed',
    score: { home: 2, away: 0 },
  },

  // ── Group C ──────────────────────────────────────────────────────────────
  {
    id: 'match-c1',
    group: 'C',
    homeTeam: 'Argentina',
    awayTeam: 'Nigeria',
    stadiumId: 'hardrock',
    dateTime: '2026-06-13T19:00:00-04:00',
    status: 'completed',
    score: { home: 2, away: 0 },
  },

  // ── Group D ──────────────────────────────────────────────────────────────
  {
    id: 'match-d1',
    group: 'D',
    homeTeam: 'France',
    awayTeam: 'Australia',
    stadiumId: 'mercedesbenz',
    dateTime: '2026-06-14T18:00:00-04:00',
    status: 'completed',
    score: { home: 4, away: 1 },
  },
  {
    id: 'match-d2',
    group: 'D',
    homeTeam: 'Denmark',
    awayTeam: 'Peru',
    stadiumId: 'lincoln',
    dateTime: '2026-06-14T15:00:00-04:00',
    status: 'completed',
    score: { home: 1, away: 0 },
  },

  // ── Group E ──────────────────────────────────────────────────────────────
  {
    id: 'match-e1',
    group: 'E',
    homeTeam: 'Brazil',
    awayTeam: 'South Korea',
    stadiumId: 'att',
    dateTime: '2026-06-15T20:00:00-05:00',
    status: 'completed',
    score: { home: 3, away: 1 },
  },

  // ── Group F ──────────────────────────────────────────────────────────────
  {
    id: 'match-f1',
    group: 'F',
    homeTeam: 'Germany',
    awayTeam: 'Canada',
    stadiumId: 'bcplace',
    dateTime: '2026-06-16T17:00:00-07:00',
    status: 'completed',
    score: { home: 2, away: 2 },
  },

  // ── Group G ──────────────────────────────────────────────────────────────
  {
    id: 'match-g1',
    group: 'G',
    homeTeam: 'Spain',
    awayTeam: 'Iran',
    stadiumId: 'levis',
    dateTime: '2026-07-01T19:00:00-07:00',
    status: 'completed',
    score: { home: 3, away: 0 },
  },

  // ── Group H ──────────────────────────────────────────────────────────────
  {
    id: 'match-h1',
    group: 'H',
    homeTeam: 'Portugal',
    awayTeam: 'Cameroon',
    stadiumId: 'gillette',
    dateTime: '2026-07-02T18:00:00-04:00',
    status: 'completed',
    score: { home: 2, away: 1 },
  },

  // ── Group I ──────────────────────────────────────────────────────────────
  {
    id: 'match-i1',
    group: 'I',
    homeTeam: 'Netherlands',
    awayTeam: 'Costa Rica',
    stadiumId: 'bbva',
    dateTime: '2026-07-03T18:00:00-06:00',
    status: 'completed',
    score: { home: 2, away: 0 },
  },

  // ── Group J ──────────────────────────────────────────────────────────────
  {
    id: 'match-j1',
    group: 'J',
    homeTeam: 'Belgium',
    awayTeam: 'Tunisia',
    stadiumId: 'arrowhead',
    dateTime: '2026-07-04T19:00:00-05:00',
    status: 'completed',
    score: { home: 1, away: 0 },
  },

  // ── Group K ──────────────────────────────────────────────────────────────
  {
    id: 'match-k1',
    group: 'K',
    homeTeam: 'Croatia',
    awayTeam: 'Saudi Arabia',
    stadiumId: 'bmo',
    dateTime: '2026-07-05T17:00:00-04:00',
    status: 'completed',
    score: { home: 3, away: 2 },
  },

  // ── Group L ──────────────────────────────────────────────────────────────
  {
    id: 'match-l1',
    group: 'L',
    homeTeam: 'Uruguay',
    awayTeam: 'Ghana',
    stadiumId: 'akron',
    dateTime: '2026-07-06T18:00:00-06:00',
    status: 'completed',
    score: { home: 1, away: 1 },
  },

  // ── Today's live & upcoming matches (July 9, 2026) ─────────────────────
  {
    id: 'match-live1',
    group: 'C',
    homeTeam: 'Argentina',
    awayTeam: 'Egypt',
    stadiumId: 'metlife',
    dateTime: '2026-07-09T12:00:00-04:00',
    status: 'live',
    score: { home: 1, away: 0 },
  },
  {
    id: 'match-live2',
    group: 'E',
    homeTeam: 'Brazil',
    awayTeam: 'Serbia',
    stadiumId: 'sofi',
    dateTime: '2026-07-09T10:00:00-07:00',
    status: 'halftime',
    score: { home: 2, away: 1 },
  },
  {
    id: 'match-today1',
    group: 'G',
    homeTeam: 'Spain',
    awayTeam: 'Australia',
    stadiumId: 'lumen',
    dateTime: '2026-07-09T19:00:00-07:00',
    status: 'scheduled',
  },
  {
    id: 'match-today2',
    group: 'F',
    homeTeam: 'Germany',
    awayTeam: 'Japan',
    stadiumId: 'mercedesbenz',
    dateTime: '2026-07-09T20:00:00-04:00',
    status: 'scheduled',
  },
];

/**
 * Retrieve all matches for a specific stadium.
 * @param stadiumId - The stadium identifier to filter by
 * @returns Array of matches scheduled at the given stadium
 */
export function getMatchesByStadium(stadiumId: string): Match[] {
  return MATCHES.filter((match) => match.stadiumId === stadiumId);
}

/**
 * Retrieve matches scheduled for today (based on local system date).
 * Compares only the date portion (YYYY-MM-DD) of each match's dateTime.
 * @returns Array of today's matches
 */
export function getTodaysMatches(): Match[] {
  const today = new Date().toISOString().slice(0, 10);
  return MATCHES.filter((match) => match.dateTime.slice(0, 10) === today);
}

/**
 * Retrieve all matches that are currently live (status is 'live' or 'halftime').
 * @returns Array of live matches
 */
export function getLiveMatches(): Match[] {
  return MATCHES.filter(
    (match) => match.status === 'live' || match.status === 'halftime'
  );
}
