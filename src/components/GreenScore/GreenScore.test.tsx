/**
 * Tests for the GreenScore component — score rendering, transit mode
 * switching, and accessibility.
 * @module components/GreenScore/GreenScore.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import GreenScore from '@/components/GreenScore/GreenScore';

describe('GreenScore', () => {
  it('renders a score meter once calculated', async () => {
    render(<GreenScore stadiumId="sofi" />);

    const meter = await screen.findByRole('meter');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');

    const score = Number(meter.getAttribute('aria-valuenow'));
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('defaults to metro and lets the user switch transit modes', async () => {
    const user = userEvent.setup();
    render(<GreenScore stadiumId="sofi" />);

    const metro = await screen.findByRole('radio', { name: /metro/i });
    expect(metro).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('radio', { name: /walk/i }));

    await waitFor(() => {
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
    });
  });

  it('shows a lower score for driving than walking', async () => {
    const user = userEvent.setup();
    render(<GreenScore stadiumId="sofi" />);

    await screen.findByRole('meter');
    await user.click(screen.getByRole('radio', { name: /drive/i }));

    await waitFor(() => {
      const score = Number(screen.getByRole('meter').getAttribute('aria-valuenow'));
      expect(score).toBeLessThan(100);
    });
  });

  it('renders sustainability tips', async () => {
    render(<GreenScore stadiumId="sofi" />);
    await screen.findByRole('meter');

    expect(screen.getByText('💡 Sustainability Tips')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GreenScore stadiumId="sofi" />);
    await screen.findByRole('meter');
    expect(await axe(container)).toHaveNoViolations();
  });
});
