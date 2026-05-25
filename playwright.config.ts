import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testMatch: ['ux/**/*.spec.ts'],
  use: {
    executablePath: '/usr/bin/chromium',
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
