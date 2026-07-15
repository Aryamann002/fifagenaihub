/**
 * Minimal type declarations for jest-axe, which ships without TypeScript types.
 */
declare module 'jest-axe' {
  export interface AxeResults {
    violations: unknown[];
  }

  export function axe(container: Element | Document | string): Promise<AxeResults>;

  export const toHaveNoViolations: jest.ExpectExtendMap;
}

declare namespace jest {
  // Type parameters must match @types/jest's `Matchers<R, T = {}>` exactly,
  // or the declaration merge fails (TS2428) once skipLibCheck is disabled.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Matchers<R, T = {}> {
    toHaveNoViolations(): R;
  }
}
