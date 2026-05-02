import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './test/e2e/global-setup.ts',
  globalTeardown: './test/e2e/global-teardown.ts',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    storageState: 'test/e2e/.auth/user.json',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
