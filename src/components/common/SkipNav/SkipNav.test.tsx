/**
 * Tests for the SkipNav accessibility link.
 * @module components/common/SkipNav/SkipNav.test
 */

import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import SkipNav from '@/components/common/SkipNav/SkipNav';

describe('SkipNav', () => {
  it('links to the main content by default', () => {
    render(<SkipNav />);
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('supports a custom target and label', () => {
    render(<SkipNav targetId="chat" label="Skip to chat" />);
    expect(screen.getByRole('link', { name: 'Skip to chat' })).toHaveAttribute('href', '#chat');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SkipNav />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
