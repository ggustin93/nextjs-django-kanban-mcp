/**
 * Playwright E2E Test Configuration
 * ==================================
 *
 * KISS approach: 1 browser (Chromium), essential settings only.
 *
 * Usage:
 *   npm run test:e2e          # Run tests headless
 *   npm run test:e2e:ui       # Interactive UI mode
 *   npm run test:e2e:headed   # Run with visible browser
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start backend and frontend before running tests */
  webServer: [
    {
      command: 'cd ../backend && python manage.py runserver 8000',
      url: 'http://localhost:8000/graphql/',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
