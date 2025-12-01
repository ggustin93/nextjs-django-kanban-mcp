/**
 * Jest Setup File
 * ===============
 *
 * Global test configuration and custom matchers.
 */

// Add custom jest matchers from @testing-library/jest-dom
import '@testing-library/jest-dom';

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
