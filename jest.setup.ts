/**
 * Jest global setup — extends expect with testing-library and jest-axe
 * matchers, and shims browser APIs that jsdom does not implement.
 * This file runs before every test suite.
 */
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// jsdom does not implement matchMedia or scrollIntoView — provide inert shims
// for component tests. Guarded so node-environment suites are unaffected.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Element.prototype.scrollIntoView = jest.fn();
}
