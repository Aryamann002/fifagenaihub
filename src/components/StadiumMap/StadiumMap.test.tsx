/**
 * Tests for the StadiumMap component — zone selection, chat query wiring,
 * Google Maps directions, and accessibility.
 * @module components/StadiumMap/StadiumMap.test
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import StadiumMap from '@/components/StadiumMap/StadiumMap';
import { getStadiumById } from '@/lib/data/stadiums';

describe('StadiumMap', () => {
  it('renders the stadium name and capacity', () => {
    render(<StadiumMap stadiumId="metlife" />);

    expect(screen.getByText(/MetLife Stadium — East Rutherford/)).toBeInTheDocument();
    expect(screen.getByText(/82,500 seats/)).toBeInTheDocument();
  });

  it('shows an error for an unknown stadium', () => {
    render(<StadiumMap stadiumId="atlantis" />);
    expect(screen.getByText('Stadium information not available.')).toBeInTheDocument();
  });

  it('builds an AI chat query when a facility is selected', async () => {
    const user = userEvent.setup();
    const onZoneSelect = jest.fn();
    render(<StadiumMap stadiumId="metlife" onZoneSelect={onZoneSelect} />);

    await user.click(screen.getByRole('button', { name: /Gate A – Main Entrance/ }));

    expect(onZoneSelect).toHaveBeenCalledWith(
      expect.stringContaining('How do I navigate to North at MetLife Stadium?'),
    );
  });

  it('supports keyboard activation of map zones', async () => {
    const user = userEvent.setup();
    const onZoneSelect = jest.fn();
    render(<StadiumMap stadiumId="metlife" onZoneSelect={onZoneSelect} />);

    const zone = screen.getAllByRole('button', { name: /press Enter to get AI directions/ })[0];
    zone.focus();
    await user.keyboard('{Enter}');

    expect(onZoneSelect).toHaveBeenCalledTimes(1);
  });

  it('links to Google Maps directions using the venue coordinates', () => {
    render(<StadiumMap stadiumId="metlife" />);
    const { lat, lng } = getStadiumById('metlife')!.coordinates;

    const link = screen.getByRole('link', { name: /directions to MetLife Stadium/i });
    expect(link).toHaveAttribute(
      'href',
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    );
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('marks accessible facilities with a badge', () => {
    render(<StadiumMap stadiumId="metlife" />);
    const accessibleChips = screen.getAllByRole('button', { name: /wheelchair accessible/ });
    expect(accessibleChips.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StadiumMap stadiumId="metlife" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
