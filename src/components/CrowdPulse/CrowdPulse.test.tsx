/**
 * Tests for the CrowdPulse dashboard — data rendering, view switching,
 * and accessibility, against a mocked /api/crowd.
 * @module components/CrowdPulse/CrowdPulse.test
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import CrowdPulse from '@/components/CrowdPulse/CrowdPulse';
import type { CrowdData } from '@/types';

const CROWD_DATA: CrowdData = {
  stadiumId: 'metlife',
  timestamp: Date.now(),
  overallOccupancyPercent: 72,
  // Kept free of zone names so tests can match zone text uniquely
  aiSummary: '📊 MONITOR: 1 high-density zone detected.',
  zones: [
    {
      id: 'gate-a',
      name: 'Gate A — North',
      currentOccupancy: 7800,
      maxCapacity: 9900,
      densityLevel: 'high',
      trend: 'increasing',
      lastUpdated: Date.now(),
    },
    {
      id: 'seating-lower',
      name: 'Lower Bowl Seating',
      currentOccupancy: 8000,
      maxCapacity: 16500,
      densityLevel: 'moderate',
      trend: 'stable',
      lastUpdated: Date.now(),
    },
  ],
};

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

function mockCrowdApi(): jest.Mock {
  const mock = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => CROWD_DATA,
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

describe('CrowdPulse', () => {
  it('renders zones and the AI summary after loading', async () => {
    const fetchMock = mockCrowdApi();
    const { unmount } = render(<CrowdPulse stadiumId="metlife" />);

    expect(await screen.findByText(/Gate A — North/)).toBeInTheDocument();
    expect(screen.getByText(/MONITOR: 1 high-density zone/)).toBeInTheDocument();
    expect(screen.getByText(/72%/)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/crowd?stadiumId=metlife');

    unmount();
  });

  it('switches to the accessible table view', async () => {
    mockCrowdApi();
    const user = userEvent.setup();
    const { unmount } = render(<CrowdPulse stadiumId="metlife" />);

    await screen.findByText(/Gate A — North/);
    await user.click(screen.getByRole('tab', { name: 'Table' }));

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Zone' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Gate A — North' })).toBeInTheDocument();

    unmount();
  });

  it('shows a retry message when the API is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    const { unmount } = render(<CrowdPulse stadiumId="metlife" />);

    expect(await screen.findByText(/Unable to load crowd data/)).toBeInTheDocument();

    unmount();
  });

  it('has no accessibility violations', async () => {
    mockCrowdApi();
    const { container, unmount } = render(<CrowdPulse stadiumId="metlife" />);
    await screen.findByText(/Gate A — North/);

    expect(await axe(container)).toHaveNoViolations();

    unmount();
  });
});
