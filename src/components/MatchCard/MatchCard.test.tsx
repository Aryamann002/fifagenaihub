/**
 * Tests for the MatchCard component — status badges, scores, venue lookup,
 * and accessibility.
 * @module components/MatchCard/MatchCard.test
 */

import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import MatchCard from '@/components/MatchCard/MatchCard';
import type { Match } from '@/types';

const BASE_MATCH: Match = {
  id: 'test-match',
  group: 'A',
  homeTeam: 'USA',
  awayTeam: 'Morocco',
  stadiumId: 'metlife',
  dateTime: '2026-06-11T20:00:00-04:00',
  status: 'scheduled',
};

describe('MatchCard', () => {
  it('renders teams, group, and venue', () => {
    render(<MatchCard match={BASE_MATCH} />);

    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('Morocco')).toBeInTheDocument();
    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('MetLife Stadium')).toBeInTheDocument();
  });

  it('shows the score for a completed match with an FT badge', () => {
    render(
      <MatchCard match={{ ...BASE_MATCH, status: 'completed', score: { home: 3, away: 1 } }} />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('FT')).toBeInTheDocument();
  });

  it('shows a LIVE badge for a live match', () => {
    render(<MatchCard match={{ ...BASE_MATCH, status: 'live', score: { home: 0, away: 0 } }} />);
    expect(screen.getByText(/LIVE/)).toBeInTheDocument();
  });

  it('shows an HT badge at halftime', () => {
    render(
      <MatchCard match={{ ...BASE_MATCH, status: 'halftime', score: { home: 1, away: 1 } }} />,
    );
    expect(screen.getByText('HT')).toBeInTheDocument();
  });

  it('shows "vs" instead of a score for scheduled matches', () => {
    render(<MatchCard match={BASE_MATCH} />);
    expect(screen.getByText('vs')).toBeInTheDocument();
  });

  it('falls back to "Venue TBD" for an unknown stadium', () => {
    render(<MatchCard match={{ ...BASE_MATCH, stadiumId: 'nowhere' }} />);
    expect(screen.getByText('Venue TBD')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MatchCard match={BASE_MATCH} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
