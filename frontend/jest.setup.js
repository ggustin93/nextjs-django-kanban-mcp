/**
 * Jest Setup File
 * ===============
 *
 * Global test configuration and custom matchers.
 */

// Add custom jest matchers from @testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress Apollo Client deprecation warnings from MockedProvider internals
// These are library-internal warnings that don't affect test functionality
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  // Check both plain text and URL-encoded Apollo Client deprecation warnings
  if (
    message.includes('addTypename') ||
    message.includes('canonizeResults') ||
    message.includes('go.apollo.dev/c/err')
  ) {
    return; // Suppress Apollo Client deprecation warnings
  }
  originalWarn.apply(console, args);
};

// Mock next/navigation for tests
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));
