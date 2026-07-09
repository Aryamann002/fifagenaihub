/**
 * Jest global setup — extends expect with testing-library and jest-axe matchers.
 * This file runs before every test suite.
 */
import '@testing-library/jest-dom';

// Use require to bypass missing type declarations for jest-axe
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const { toHaveNoViolations } = require('jest-axe');
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
expect.extend(toHaveNoViolations);
