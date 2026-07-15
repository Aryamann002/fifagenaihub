/**
 * Tests for the A11yToolbar — high-contrast toggling, font-size cycling,
 * persistence, and accessibility. Also exercises the useAccessibility hook.
 * @module components/common/A11yToolbar/A11yToolbar.test
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import A11yToolbar from '@/components/common/A11yToolbar/A11yToolbar';

describe('A11yToolbar', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders both accessibility controls', () => {
    render(<A11yToolbar />);
    expect(screen.getByRole('group', { name: 'Accessibility settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /high contrast/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /font size/i })).toBeInTheDocument();
  });

  it('toggles high-contrast mode on the document root', async () => {
    const user = userEvent.setup();
    render(<A11yToolbar />);
    const toggle = screen.getByRole('button', { name: /high contrast/i });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveClass('high-contrast');

    await user.click(toggle);
    expect(document.documentElement).not.toHaveClass('high-contrast');
  });

  it('cycles font size: normal → large → extra-large → normal', async () => {
    const user = userEvent.setup();
    render(<A11yToolbar />);
    const button = screen.getByRole('button', { name: /font size/i });

    await user.click(button);
    expect(document.documentElement).toHaveClass('font-large');

    await user.click(button);
    expect(document.documentElement).toHaveClass('font-extra-large');
    expect(document.documentElement).not.toHaveClass('font-large');

    await user.click(button);
    expect(document.documentElement).not.toHaveClass('font-extra-large');
  });

  it('persists preferences to localStorage', async () => {
    const user = userEvent.setup();
    render(<A11yToolbar />);

    await user.click(screen.getByRole('button', { name: /high contrast/i }));

    const saved = JSON.parse(localStorage.getItem('fanhub26-a11y-prefs') ?? '{}');
    expect(saved.highContrast).toBe(true);
  });

  it('restores saved preferences on mount', () => {
    localStorage.setItem(
      'fanhub26-a11y-prefs',
      JSON.stringify({ highContrast: true, fontSize: 'large' }),
    );

    render(<A11yToolbar />);

    expect(screen.getByRole('button', { name: /high contrast/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.documentElement).toHaveClass('high-contrast');
    expect(document.documentElement).toHaveClass('font-large');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<A11yToolbar />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
