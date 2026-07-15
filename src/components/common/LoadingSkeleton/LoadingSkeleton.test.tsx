/**
 * Tests for the LoadingSkeleton component.
 * @module components/common/LoadingSkeleton/LoadingSkeleton.test
 */

import { render, screen } from '@testing-library/react';
import LoadingSkeleton from '@/components/common/LoadingSkeleton/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with a status role and accessible label', () => {
    render(<LoadingSkeleton label="Loading crowd data..." />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading crowd data...');
  });

  it('renders multiple lines for the text variant', () => {
    const { container } = render(<LoadingSkeleton variant="text" lines={3} />);
    expect(container.querySelectorAll('.skeleton')).toHaveLength(3);
  });

  it('applies custom dimensions', () => {
    render(<LoadingSkeleton variant="rectangular" width="200px" height="80px" />);
    expect(screen.getByRole('status')).toHaveStyle({ width: '200px', height: '80px' });
  });
});
