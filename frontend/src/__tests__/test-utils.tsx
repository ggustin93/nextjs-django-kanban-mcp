/**
 * Test Utilities
 *
 * Shared utilities and wrappers for testing React components.
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';

/**
 * Custom render function that wraps components with required providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    mocks = [],
    ...renderOptions
  }: { mocks?: MockedResponse[] } & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MockedProvider mocks={mocks}>{children}</MockedProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render with our custom version
export { renderWithProviders as render };
